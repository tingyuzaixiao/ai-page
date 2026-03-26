<template>
  <div class="layout-padding">
    <div class="layout-padding-auto layout-padding-view" @mousedown="handleMouseDown">
      <!-- 图像分类标注 -->
      <div class="flex mb-4 gap-2">
        <span v-for="(item, index) in selectItem" :key="item.value">
          <el-tooltip class="item" effect="light" :content="'快捷键：' + (index + 1)" placement="top" :hide-after="0">
            <el-button v-if="!item.isEditing" :checked="item.checked" closable
              :style="{ color: item.checked ? '#ffffff' : item.color, border: item.checked ? 'none' : `1px solid ${item.color}` }"
              :color="item.checked ? item.color : '#ffffff'" :effect="item.checked ? 'dark' : 'light'"
              style="border-radius: 0;" @click="changeCheck(index, '')">{{
                item.label }}
              <el-popover placement="bottom" :width="200" trigger="click">
                <template #default>
                  <div class="text-center">
                    <el-button type="primary" @click="updateInput(item, index)">修改</el-button>
                    <el-button type="danger" @click="deleteItem(item.value)">删除</el-button>
                  </div>
                </template>
                <template #reference>
                  <el-icon class="cursor-pointer ml-2.5" @click.stop>
                    <MoreFilled />
                  </el-icon>
                </template>
              </el-popover>
            </el-button>
            <el-input v-else :ref="el => setInputRef(el, index)" v-model="updateValue" style="width: 120px;"
              size="default" @keyup.enter="unpdateItem(item)" />
          </el-tooltip>
        </span>
        <el-input v-if="addVisible" ref="InputRef" v-model="addValue" style="width: 120px;" size="default"
          @keyup.enter="handleInputConfirm" @blur="handleInputConfirm" />
        <el-button v-else class="button-new-tag" size="default" @click="showInput">
          +
        </el-button>
        <el-select v-model="filterItem" placeholder="Select" style="width: 150px; margin-left: auto;">
          <el-option v-for="item in filterOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-input v-if="filterItem == 'Option4'" ref="FilenameRef" v-model="inputFilename" style="width: 150px;"
          size="default" @focus="handleInput" @keyup.enter="handleSelectConfirm" @blur="handleSelectConfirm" />
        <el-select v-if="filterItem == 'Option5'" v-model="selectLabel" placeholder="" style="width: 120px;">
          <el-option v-for="item in selectItem" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <!-- <el-button class="button-save" type="primary" @click="selectedList = []">
          清空选中项
        </el-button>
        <el-button class="button-save" type="primary">
          样本分布
        </el-button>
        <el-button class="button-save" type="primary" @click="handleSave">
          保存
        </el-button>
        <el-button class="button-save" type="primary" @click="mode = !mode">
          模式切换
        </el-button> -->
        <el-tooltip class="item" effect="light" content="清空选中项" placement="top" :hide-after="0">
          <Brush class="w-5 h-5 mt-1.5 mr-1.5 cursor-pointer" @click="selectedList = []" />
        </el-tooltip>
        <el-tooltip class="item" effect="light" content="删除标注" placement="top" :hide-after="0">
          <Delete class="w-5 h-5 mt-1.5 mr-1.5 cursor-pointer" @click="handleDelete" />
        </el-tooltip>
        <!-- <el-tooltip class="item" effect="light" content="样本分布" placement="top" :hide-after="0">
          <DataAnalysis class="w-5 h-5 mt-1.5 mr-1.5 cursor-pointer" @click="showSampling" />
        </el-tooltip> -->
        <el-tooltip class="item" effect="light" content="保存标注(ctrl+s)" placement="top" :hide-after="0">
          <Collection class="w-5 h-5 mt-1.5 mr-1.5 cursor-pointer" @click="handleSave" />
        </el-tooltip>
        <el-tooltip class="item" effect="light" content="模式切换" placement="top" :hide-after="0">
          <Switch class="w-5 h-5 mt-1.5 mr-1.5 cursor-pointer" @click="changeMode" />
        </el-tooltip>
      </div>
      <el-divider class="!my-1" border-style="dashed" />
      <div v-show="mode === true" class="w-full h-full grid grid-cols-6 gap-2 min-h-170">
        <div class="left h-full w-full col-span-5 bg-gray-300">
          <canvas class="container w-full h-full mt-2 bg-[#F7F7F7]"></canvas>
        </div>
        <div class="right w-full h-full mt-1 col-span-1 bg-gray-500">
          <div v-loading="loading" class="overflow-y-scroll" @scroll.passive="handleScroll" ref="scrollContainer">
            <!-- <el-checkbox-group v-model="selectedImages" @change="selectImage"> -->
            <div v-if="imageList.length" class="grid grid-cols-1 grid-flow-row gap-3 max-h-175">
              <div v-for="(image, index) in imageList" :key="image.fileId" :ref="el => setImageRef(el, index)">
                <div
                  :class="['box-border relative flex items-center justify-center bg-br-extra-light border-3 hover:border-primary', { 'border-primary': selectedList.includes(image.fileId), 'border-body': !selectedList.includes(image.fileId) }]">
                  <!--  { 'border-primary': selectedImages.includes(image.id), 'border-body': !selectedImages.includes(image.id) } -->
                  <!-- <el-checkbox :label="image.id" :value="image.id" class="top-0 right-3 overflow-hidden inline-block"
                      :style="{ width: '14px', position: 'absolute' }"></el-checkbox> -->
                  <el-tag effect="dark" class="absolute top-0 left-0 z-10" style="border-radius: 0;">{{
                    index + 1 }}</el-tag>
                  <el-image class="w-full h-40" :src="formatUrl(image.bucketName, image.fileName)" :zoom-rate="1.2"
                    :max-scale="7" :min-scale="0.2" :initial-index="index" fit="contain"
                    @click="gotoImage(image.bucketName, image.fileName, image.fileId, index)" draggable="false" />
                  <el-tag v-show="isSaved(image.fileId)" :color="getTagColor(image.fileId)" effect="dark"
                    class="absolute right-0 bottom-0" style="border: none;">{{
                      getTagContent(image.fileId) }}</el-tag>
                </div>
              </div>
              <!-- </el-checkbox-group> -->
            </div>
            <el-empty v-show="!imageList.length" class="mx-0 my-auto" description="未导入数据" :image-size="250" />
          </div>
        </div>
      </div>
      <div v-show="mode === false" class="w-full h-155 overflow-y-scroll">
        <div class="mask fixed bg-[#409eff] opacity-40 z-[100]" v-show="positionList.is_show_mask"
          :style="'width:' + mask_width + 'left:' + mask_left + 'height:' + mask_height + 'top:' + mask_top"></div>
        <el-checkbox-group v-model="selectedList" class="checkboxGroup">
          <div class="unselectable-text w-full grid grid-cols-6 grid-flow-row gap-4">
            <div v-for="(image, index) in state.dataList" :key="image.fileId" class="relative">
              <div
                :class="['box-border relative flex items-center justify-center bg-br-extra-light border-4 hover:border-primary',
                  { 'border-primary': selectedImages.has(image.fileId), 'border-body': !selectedImages.has(image.fileId) }]">
                <el-checkbox :key="index" :label="image.fileName" :value="image.fileId"
                  :class="selectedList.includes(image.fileId) ? 'checkbox aa-active' : 'checkbox'"
                  @change="checkItem(image.fileId)">
                  <el-tag v-show="isSelected(image.fileId)" closable
                    :color="selectItem.find(item => item.value === selection)?.color" effect="dark"
                    class="absolute top-0 left-0 z-10" style="border:none">{{ selectItem.find(item => item.value
                      ===
                      selection)?.label }}</el-tag>
                  <el-image class="w-full h-40" :src="fileUrl + image.bucketName + '/' + image.fileName" fit="contain"
                    draggable="false" />
                  <span class="absolute right-[25px] top-[5px] text-[#0051ff]"
                    v-show="selectedList.includes(image.fileId)">
                    {{
                      (selectedList.indexOf(image.fileId)
                        +
                        1) }}</span>
                  <el-tag v-show="isSaved(image.fileId)" :color="getTagColor(image.fileId)" effect="dark"
                    style="position: absolute; right: 0; bottom: 0; border:none">{{
                      getTagContent(image.fileId) }}</el-tag>
                </el-checkbox>
              </div>
              <div class="mt-2 flex justify-between items-center bg-br-extra-light">
                <el-tooltip :content="computedImgUrl(image.bucketName, image.original)" placement="top"
                  :disabled="!overflowIndexes.has(image.fileId)">
                  <div v-overflow="handleOverflow(image.fileId)" class="p-1 text-base leading-5 truncate">
                    {{ computedImgUrl(image.bucketName, image.original) }}
                  </div>
                </el-tooltip>
              </div>
            </div>
          </div>
        </el-checkbox-group>
      </div>
      <pagination v-show="mode === false" @current-change="currentChangeHandle" @size-change="sizeChangeHandle"
        v-bind="state.pagination" />
    </div>
  </div>
</template>

<script setup lang="ts" name="onlineAnnotation">
import { BasicTableProps, useTable, } from '/@/hooks/table';
import { fetchBaseImageList, getDatasetById } from "/@/api/dataset/manage";
import { useMessage, useMessageBox } from '/@/hooks/message';
// import { useI18n } from 'vue-i18n';
import { fileUrl } from "/@/utils/env";
import router from '/@/router';
import mittBus from "/@/utils/mitt";
import { ElInput } from 'element-plus'

import CanvasSelect from 'canvas-select'

// const { t } = useI18n();
const route = useRoute();

// 控制变量
const loading = ref(false);
const selectedImages = ref(new Set<string>());
const overflowIndexes = ref(new Set<string>());

interface imageItem {
  fileId: string;
  baseDatasetId: string;
  fileName: string;
  md5: string;
  original: string;
  bucketName: string;
  type: string;
  fileSize: string;
  createTime: string;
  labelList: labelItem[];
}
interface labelItem {
  fileId: string;
  labelId: string;
  labelFileName: string;
  labelName: string;
}
// 分页变量
const page = reactive<{
  pageSize: number;
  pageNum: number;
  totals: number;
}>({
  pageSize: 18,
  pageNum: 2,
  totals: 0,
});

const form = reactive({
  datasetId: '',
  imageIds: '',
})

// 单图模式canvas
let instance: CanvasSelect;
const scrollContainer: Ref<HTMLElement | null> = ref(null);
const imageList: Ref<imageItem[]> = ref([]); //保存已滚动加载的图片
const hasMore = ref(true);// 记录是否还可以滚动刷新

const formatUrl = (bucketName: string, fileName: string) => {
  const fileUrlString = fileUrl + bucketName + '/' + fileName;
  let startUrl = fileUrlString.substring(0, 17);
  let endUrl = fileUrlString.substring(17).replace(/\/\/+/g, '/');
  return startUrl + endUrl;
};

// 滚动加载绑定事件
function debounce(fn: Function, delay: number) {
  let timeoutID: number | null = null;
  return function (...args: any[]) {
    if (timeoutID) clearTimeout(timeoutID);
    timeoutID = window.setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
const handleScroll = debounce(() => {
  if (!scrollContainer.value) return;
  const bottomOfWindow = scrollContainer.value.scrollTop + scrollContainer.value.clientHeight >= scrollContainer.value.scrollHeight;

  if (bottomOfWindow) {
    loadImageList();
  }
}, 200);

// 单次滚动加载数据
const loadImageList = async () => {
  // 防止重复请求或没有更多数据时的请求
  if (loading.value || !hasMore.value) return;
  loading.value = true;
  try {
    const response = await fetchBaseImageList({
      baseDatasetId: state.queryForm.baseDatasetId,
      current: page.pageNum,
      size: page.pageSize,
      descs: '',
      ascs: '',
    });
    // 每次滚动刷新可以获取page.pageNum页的数据，
    const data = response.data;
    const { current, pages, size, total, records } = data;
    page.pageNum = current;
    page.pageSize = size;
    page.totals = total;
    imageList.value.push(...records);
    // 判断是否存在下一页
    hasMore.value = current < pages;
    //为下一次加载做准备
    if (hasMore.value) {
      page.pageNum++;
    }
  } catch (error) {
    console.error('Failed to load images', error);
  } finally {
    loading.value = false;
    // console.log('imageList', imageList.value);
  }
};
// 多图切换单图后，多次滚动加载数据，并跳转到选中项
// 当多图为第pageNum页时，单图下需要滚动加载pageNum次
// 执行pageNum次loadImageList再执行gotoImage的函数
const executeLoadAndGoto = async (pageNum: number) => {
  imageList.value = [];
  for (let count = 1; count <= pageNum; count++) {
    page.pageNum = count;
    await loadImageList();
  }
  // 在pageNum次加载之后，执行gotoImage
  if (imageList.value.length > 0 && selectedIndex.value >= 0 && selectedIndex.value < imageList.value.length) {
    gotoImage(imageList.value[selectedIndex.value].bucketName, imageList.value[selectedIndex.value].fileName, imageList.value[selectedIndex.value].fileId, selectedIndex.value);
  } else {
    console.error('Selected index is out of bounds or imageList is empty');
  }
};
// 单图模式下，图片跳转
const imageRefs = ref<(Element | null)[]>([]);
const setImageRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  if (el instanceof Element) {
    imageRefs.value[index] = el;
  }
};
const gotoImage = (bucketName: string, fileName: string, fileId: string, index: number) => {
  selectedList.value = [];
  instance.setImage(formatUrl(bucketName, fileName));
  selectedList.value.push(fileId);
  selectedIndex.value = index;
  if (fileId) {
    if (isSaved(fileId)) {
      selection.value = getTagId(fileId) ?? "0";
      changeCheck(-1, selection.value);
    } else {
      changeCheck(-1, '');
    }
  }
  const targetImage = imageRefs.value[index];
  if (targetImage) {
    targetImage.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }
}

// 获取图片列表(多图)
const state: BasicTableProps = reactive<BasicTableProps>({
  createdIsNeed: false,
  pagination: {
    size: 18,
    current: 2,
  },
  queryForm: {
    baseDatasetId: '',
  },
  pageList: fetchBaseImageList,
});

//  table hook
const { getDataList, currentChangeHandle, sizeChangeHandle } = useTable(state);

const openDialog = async (param: any) => {
  loading.value = true;
  try {
    const res = await getDatasetById(param.datasetId);
    if (res && res.data) {
      state.queryForm.baseDatasetId = res.data.baseDatasetId;
      form.datasetId = res.data.datasetId;
      let imageIdString = res.data.imageIds;
      // 精度丢失
      let imageIdStringParse = JSON.parse(imageIdString);
      // const parsedImageIds = imageIdString.slice(1, -1).split(',');
      // selectedImages.value = parsedImageIds.map((id: String) => id.trim());
      imageIdStringParse && imageIdStringParse.length ? (selectedImages.value = new Set(imageIdStringParse)) : (selectedImages.value = new Set());
    }
    getDataList();
  } catch (error: any) {
    useMessage().error(error)
  } finally {
    loading.value = false;
  }

};

const backIndex = () => {
  form.imageIds = '';
  router.back();
  mittBus.emit(
    "onCurrentContextmenuClick",
    Object.assign({}, { contextMenuClickId: 1, ...route })
  );
}

const computedImgUrl = (url: string, original: string) => {
  // 定义正则表达式来匹配 base/ 后面的路径
  const regex = /images\/(.*)/;
  const regex2 = /images\\(.*)/;

  // 使用正则表达式进行匹配
  const match = url.match(regex);
  const match2 = url.match(regex2);

  // 如果匹配成功，返回捕获的部分，否则返回空字符串
  const formatUrl = match ? match[1] : match2 ? match2[1] : '';

  return formatUrl + '/' + original;
}

const handleOverflow = (index: string) => (el: any) => {
  nextTick(() => {
    if (el.scrollWidth > el.clientWidth) {
      overflowIndexes.value.add(index);
    } else {
      overflowIndexes.value.delete(index);
    }
  });
};


// 切换单图(true)和多图模式(false)*********************************************
const mode = ref(true);
const selectedIndex = ref(0); //记录单图下，选中图片的index

const changeMode = () => {
  mode.value = !mode.value;
  // 多——>单
  if (mode.value) {
    // 跳转到selectedList的第一个选中项
    if (selectedList.value.length > 0) {
      hasMore.value = true;
      page.pageNum = state.pagination?.current ?? 1;
      page.pageSize = state.pagination?.size ?? 18;
      page.totals = page.pageNum * page.pageSize;
      // 查询当前图片的索引（最后一个选中的图片）
      selectedIndex.value = state.dataList?.findIndex(item => item.fileId === selectedList.value[selectedList.value.length - 1]) ?? -1;
      selectedIndex.value = selectedIndex.value + ((state.pagination?.current ?? 1) - 1) * (state.pagination?.size ?? 18);
      executeLoadAndGoto(page.pageNum);
    } else {
      // 恢复默认值
      hasMore.value = true;
      page.pageSize = 18;
      page.pageNum = 1;
      page.totals = 0;
      currentChangeHandle(1);
      gotoImage(imageList.value[0].bucketName, imageList.value[0].fileName, imageList.value[0].fileId, 0);
    }
  } else {
    // 单——>多
    if (selectedList.value.length > 0) {
      let pagei = (selectedIndex.value / (state.pagination?.size ?? 18)) | 0;
      pagei++;
      currentChangeHandle(pagei);
    } else {
      currentChangeHandle(page.pageNum);
    }
  }
};


// Shift、ctrl和框选以及快捷键事件监听*********************************************
const selectedList = ref<string[]>([]);
const positionList = reactive({
  is_show_mask: false,
  box_screen_left: 0,
  box_screen_top: 0,
  start_x: 0,
  start_y: 0,
  end_x: 0,
  end_y: 0
});

// 计算mask属性
const mask_width = computed(() => positionList ? `${Math.abs(positionList.end_x - positionList.start_x)}px;` : '0px;');
const mask_height = computed(() => positionList ? `${Math.abs(positionList.end_y - positionList.start_y)}px;` : '0px;');
const mask_left = computed(() => positionList ? `${Math.min(positionList.start_x, positionList.end_x) - positionList.box_screen_left}px;` : '0px;');
const mask_top = computed(() => positionList ? `${Math.min(positionList.start_y, positionList.end_y) - positionList.box_screen_top}px;` : '0px;');

// 键盘监听相关逻辑
const controlKeyDown = ref(false);
const shiftKeyDown = ref(false);
// 记录当前是否在进行输入操作,有为true,避免输入数字时触发快捷键
const inputVisible = ref(false);
// 监听键盘按键
const detectKey = () => {
  const isWin = navigator.userAgent.includes("Windows");
  const isMac = navigator.userAgent.includes("Mac OS X");

  let isThrottled = false;
  const throttleTime = 300; // 节流时间，单位毫秒

  window.onkeydown = (event) => {
    // Ctrl+S 功能不受节流限制
    if ((event.ctrlKey || (event.metaKey && isMac)) && event.key === 's') {
      event.preventDefault();  // 防止浏览器执行默认的保存操作
      handleSave();  // 执行保存操作
      return; // 直接返回，不执行后续节流的逻辑
    }

    // 其他键位受节流控制
    if (isThrottled) return;
    isThrottled = true;

    setTimeout(() => {
      isThrottled = false;
    }, throttleTime);

    if (event.key === 'Shift') {
      shiftKeyDown.value = true;
    } else if ((event.key === 'Control' && isWin) || (event.key === 'Meta' && isMac)) {
      controlKeyDown.value = true;
    } else if (event.key >= '1' && event.key <= '9') { // 检测数字键 1 到 9
      if (inputVisible.value || addVisible.value || updateVisible.value) {
        return; // 当filterItem.value == 'Option4'时快捷键会失效，后续还要改进......
      } else {
        let index = parseInt(event.key) - 1;
        if (index < selectItem.length) {
          selection.value = selectItem[index].value;
          changeCheck(index, '');
        } else {
          useMessage().wraning('请选择' + '1-' + selectItem.length + '号标签项！！！');
        }
      }
    }
  };

  window.onkeyup = (event) => {
    if (event.key === 'Shift') {
      shiftKeyDown.value = false;
    }
    if ((event.key === 'Control' && isWin) || (event.key === 'Meta' && isMac)) {
      controlKeyDown.value = false;
    }
  };
};

//单击多选框选中
const checkItem = (fileId: string) => {
  let i = selectedList.value.indexOf(fileId)  // 判断选中列表中是否包含这个点击的div
  if (i < 0) {
    selectedList.value.push(fileId);  // 如果不包含就加进去
  } else {
    selectedList.value.splice(i, 1);  // 如果包含就删
  }
  if (shiftKeyDown.value) {
    const indexArr: number[] = [];
    // 记录最后点击索引
    const lastSelectedIndex = state.dataList?.findIndex(item => item.fileId === fileId) ?? -1;
    if (lastSelectedIndex !== -1) {
      // 将 selectedList.value（一个包含文件 ID 的数组）转换为对应文件在 state.dataList 中位置的索引数组，且只包含有效的索引。
      const previousIndexes = selectedList.value.map(id =>
        state.dataList?.findIndex(item => item.fileId === id) ?? -1
      ).filter(index => index !== -1);
      const minIndex = Math.min(...previousIndexes);
      const maxIndex = Math.max(...previousIndexes);
      // 如果之前没有选中任何项，则从 0 到 lastSelectedIndex 选择
      if (previousIndexes.length === 1) {
        for (let index = 0; index <= lastSelectedIndex; index++) {
          indexArr.push(index);
        }
      } else {
        // 选择从 minIndex 到 lastSelectedIndex 之间的所有项
        const startIndex = Math.min(minIndex, lastSelectedIndex);
        const endIndex = Math.max(maxIndex, lastSelectedIndex);
        for (let index = startIndex; index <= endIndex; index++) {
          indexArr.push(index);
        }
      }
      // 根据 indexArr 更新 selectedList   (!为TypeScript 非空断言)
      selectedList.value = indexArr.map(index => state.dataList![index].fileId);
    }
  }
}
// 鼠标按下事件
const handleMouseDown = (event: MouseEvent) => {
  if (!positionList || mode.value) return; // Ensure positionList is defined
  positionList.is_show_mask = true;
  positionList.start_x = event.clientX;
  positionList.start_y = event.clientY;
  positionList.end_x = event.clientX;
  positionList.end_y = event.clientY;
  document.body.addEventListener("mousemove", handleMouseMove);
  document.body.addEventListener("mouseup", handleMouseUp);
};

const handleMouseMove = (event: MouseEvent) => {
  if (!positionList || mode.value) return;
  positionList.end_x = event.clientX;
  positionList.end_y = event.clientY;
};

const handleMouseUp = () => {
  if (!positionList || mode.value) return;
  document.body.removeEventListener("mousemove", handleMouseMove);
  document.body.removeEventListener("mouseup", handleMouseUp);
  positionList.is_show_mask = false;
  handleDomSelect();
  resSetXY();
};

function handleDomSelect() {
  const dom_mask = window.document.querySelector(".mask");
  let rect_select = { x: 0, y: 0, width: 0, height: 0 };
  //getClientRects()每一个盒子的边界矩形的矩形集合
  if (dom_mask) {
    rect_select = dom_mask.getClientRects()[0];
  }

  const add_list: string[] = [];
  const del_list: string[] = [];
  document.querySelectorAll(".el-checkbox-group .el-checkbox").forEach((node, index) => {
    const rects = node.getClientRects()[0];
    //比较checkbox盒子边界和遮罩层边界最大最小值
    const maxX = Math.max(rects.x + rects.width, rect_select.x + rect_select.width);
    const maxY = Math.max(rects.y + rects.height, rect_select.y + rect_select.height);
    const minX = Math.min(rects.x, rect_select.x);
    const minY = Math.min(rects.y, rect_select.y);
    const compared = maxX - minX <= rects.width + rect_select.width && maxY - minY <= rects.height + rect_select.height;
    if (rects && compared === true) {
      const fileId = state.dataList?.[index].fileId;
      if (selectedList.value.includes(fileId)) {
        del_list.push(fileId);
      } else {
        add_list.push(fileId);
      }
    }
  });
  selectedList.value = selectedList.value.concat(add_list).filter((item) => !del_list.includes(item));
}
//清除
function resSetXY() {
  positionList.start_x = 0;
  positionList.start_y = 0;
  positionList.end_x = 0;
  positionList.end_y = 0;
}

// 标签栏********************************************************************
interface SelectItem {
  label: string;
  value: string;
  checked: boolean;
  isEditing: boolean,
  color: string;
}
const selection = ref('0');
const selectItem = reactive<SelectItem[]>([
  { label: '玫瑰花', value: '1', checked: false, isEditing: false, color: '#e6a23c' },
  { label: '郁金香', value: '2', checked: false, isEditing: false, color: '#409eff' },
  { label: '钢板', value: '3', checked: false, isEditing: false, color: '#fc0341' }
]);
const addValue = ref('');
const updateValue = ref('');
const addVisible = ref(false);
const updateVisible = ref(false);
const InputRef = ref<InstanceType<typeof ElInput>>()
// const UpdateRef = ref<InstanceType<typeof ElInput>>()
const FilenameRef = ref<InstanceType<typeof ElInput>>()


const unpdateItem = async (item: SelectItem) => {
  // 查询有多少图片已标注为value
  try {
    await useMessageBox().confirm("确认修改该标签，所有已标注的图片都会被修改");
    const index = selectItem.findIndex((itemone: SelectItem) => itemone.value === item.value);
    if (index > -1 && updateValue.value) {
      selectItem[index].label = updateValue.value;
    }
    updateVisible.value = false;
    item.isEditing = false;
    updateValue.value = '';
    useMessage().success('修改成功');
  } catch {
    updateVisible.value = false;
    item.isEditing = false;
    updateValue.value = '';
    return;
  }
};
const deleteItem = async (value: string) => {
  // 查询有多少图片已标注为value
  try {
    await useMessageBox().confirm("确认删除该标签，所有已标注的图片都会被修改");
    const index = selectItem.findIndex((item: SelectItem) => item.value === value);
    if (index > -1) {
      selectItem.splice(index, 1);
    }
    selection.value = '0';
    for (let i = resultList.length - 1; i >= 0; i--) {
      if (resultList[i].tag === value) {
        resultList.splice(i, 1);
      }
    }
    useMessage().success('删除成功');
  } catch {
    return;
  }

};
// 选中标签触发事件（点击或快捷键选中）
const changeCheck = (index: number, value: string) => {
  // 不选中任一标签项
  if (index === -1 && value === '') {
    selection.value = '0';
    for (let i = 0; i < selectItem.length; i++) {
      selectItem[i].checked = false;
    }
    return;
  } else if (index !== -1 && value === '') {
    // 通过index（快捷键）选中
    selection.value = selectItem[index].value;
    for (let i = 0; i < selectItem.length; i++) {
      if (i === index) {
        selectItem[i].checked = true;
      } else {
        selectItem[i].checked = false;
      }
    }
  } else {
    // 通过selectItem.value选中
    selection.value = value;
    for (let i = 0; i < selectItem.length; i++) {
      if (selectItem[i].value === value) {
        selectItem[i].checked = true;
      } else {
        selectItem[i].checked = false;
      }
    }
  }
  // 单图模式下，选中标签后自动保存并跳转到下一个
  if (mode.value === true && selectedList.value.length !== 0 && value === "") {
    // 查询当前图片的索引
    let currindex = selectedIndex.value;
    handleSave();
    if (currindex !== -1 && currindex + 1 < imageList.value.length) {
      gotoImage(imageList.value[currindex + 1].bucketName, imageList.value[currindex + 1].fileName, imageList.value[currindex + 1].fileId, currindex + 1);
    } else {
      gotoImage(imageList.value[currindex].bucketName, imageList.value[currindex].fileName, imageList.value[currindex].fileId, currindex);
      useMessage().wraning('已是最后一张图片！！！');
    }
  }
}
// 新增标签Input
const showInput = () => {
  addVisible.value = true
  nextTick(() => {
    InputRef.value!.input!.focus()
  })
};
const inputRefs = ref<(Element | null)[]>([]);
const setInputRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  if (el instanceof Element) {
    inputRefs.value[index] = el;
  }
};
// 修改标签Input
const updateInput = (item: SelectItem, index: number) => {
  item.isEditing = true;
  updateVisible.value = true;
  updateValue.value = item.label;
  nextTick(() => {
    const inputElement = inputRefs.value[index] as HTMLInputElement | null;
    if (inputElement) {
      inputElement.focus() // 未实现光标聚焦功能？？？？？
    }
  });
};
// 名称检索Input
const handleInput = () => {
  inputVisible.value = true
  nextTick(() => {
    FilenameRef.value!.input!.focus()
  })
};
function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
// 新增标签事件
const handleInputConfirm = () => {
  if (addValue.value) {
    const newItem: SelectItem = {
      label: addValue.value,
      value: generateRandomString(10),
      checked: false,
      isEditing: false,
      color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
    };
    selectItem.push(newItem);
  }
  addVisible.value = false;
  addValue.value = '';
}
// 名称检索事件
const handleSelectConfirm = () => {
  if (inputFilename.value) {
    // 执行按名称检索

    nextTick(() => {
      FilenameRef.value!.input!.blur()
    })
  }
  inputVisible.value = false;
}
interface ResultItem {
  fileId: string;
  tag: string;
}
const resultList = reactive<ResultItem[]>([]);
const isSelected = (val: string) => {
  return selectedList.value.some(item => item === val) && (selection.value !== '0');
};
const isSaved = (val: string) => {
  return resultList.some(item => item.fileId === val);
};
const getTagColor = (val: string) => {
  const result = resultList.find(item => item.fileId === val);
  const selected = selectedList.value.find(item => item === val);
  const color = result?.tag ? selectItem.find(item => item.value === result.tag)?.color : selected ? selectItem.find(item => item.value === selection.value)?.color : '#c0c4cc';
  return color || '#c0c4cc';
};
const getTagContent = (val: string) => {
  const result = resultList.find(item => item.fileId === val);
  const label = selectItem.find(item => item.value === result?.tag)?.label;
  return label;
};
const getTagId = (val: string) => {
  const result = resultList.find(item => item.fileId === val);
  const id = selectItem.find(item => item.value === result?.tag)?.value;
  return id;
};
//显示样本分布
const showSampling = () => {
  // 查询每个类别的样本数量
  // 绘制柱状图
}
// 删除标签功能
const handleDelete = () => {
  const setB = new Set(selectedList.value);
  // 从后向前遍历数组A，避免索引问题
  for (let i = resultList.length - 1; i >= 0; i--) {
    if (setB.has(resultList[i].fileId)) {
      resultList.splice(i, 1);  // 删除匹配的项
    }
  }
  selectedList.value = [];
};
// 保存标签功能
const handleSave = () => {
  if (selection.value === '0') {
    useMessage().info('请选择标签项！！！');
  } else if (selectedList.value.length === 0) {
    useMessage().info('请选择图像！！！');
  } else {
    let tempList: ResultItem[] = [];
    for (let i in selectedList.value) {
      tempList.push({ fileId: selectedList.value[i], tag: selection.value })
    }
    if (resultList.length === 0) {
      resultList.splice(0, resultList.length, ...tempList);
    } else {
      // 使用 Map 来优化查找和更新操作，键为 fileId，值为对应的 ResultItem 对象
      const map = new Map(tempList.map(item => [item.fileId, item]));
      // 更新已存在的结果列表中的元素或保持不变
      resultList.forEach((item, index) => {
        const updateItem = map.get(item.fileId);
        if (updateItem) {  // 确认获取的对象不是 undefined
          resultList[index] = updateItem;
          map.delete(item.fileId);
        }
      });
      // 将 Map 中剩余的、在结果列表中不存在的元素添加到结果列表末尾
      map.forEach(item => resultList.push(item));
    }
    // console.log("this.resultList", resultList);
    useMessage().success('已完成标注数量:' + resultList.length);
    selectedList.value = [];
    changeCheck(-1, '');
  }
};

// 筛选********************************************
const filterItem = ref('Option1')
const filterOptions = [
  {
    value: 'Option1',
    label: '所有',
  },
  {
    value: 'Option2',
    label: '已标注',
  },
  {
    value: 'Option3',
    label: '未标注',
  },
  {
    value: 'Option4',
    label: '名称检索',
  },
  {
    value: 'Option5',
    label: '标注类别',
  },
]
const inputFilename = ref('');
const selectLabel = ref('');

const vOverflow = {
  mounted(el: any, binding: any) {
    const callback = binding.value;
    callback(el);
  },
  updated(el: any, binding: any) {
    const callback = binding.value;
    callback(el);
  },
};

onMounted(() => {
  // loading.value = true;
  // 判断datasetId是否存在
  if (route.query.baseDatasetId) {
    state.queryForm.baseDatasetId = route.query.baseDatasetId;
    if (route.query.datasetId) {
      form.datasetId = route.query.datasetId as string;
      openDialog(form);
    } else {
      getDataList();
    }
  } else {
    useMessageBox().error("未获取到baseDatasetId")
    backIndex();
  }
  detectKey();
  instance = new CanvasSelect('.container');
  instance.setImage('');
})
onBeforeUnmount(() => {
  window.onkeydown = null;
  window.onkeyup = null;
});
// 注销时打印
onUnmounted(() => {
  // console.log("onUnmounted");
})


// 监控state.dataList变化
watch(() => state.dataList, (newVal) => {
  console.log("state", newVal);
  console.log("state.pagination", state.pagination);
  if (state.dataList && state.dataList.length > 0 && !imageList.value.length) {
    imageList.value.push(...(state.dataList ?? []));
    gotoImage(imageList.value[0].bucketName, imageList.value[0].fileName, imageList.value[0].fileId, 0);
  }
}, { deep: true, immediate: true });

// 监控selectedImages变化
watch(() => selectedImages, (newVal) => {
  console.log("selectedImages", newVal);
}, { deep: true, immediate: true });

// 监控selectedImages变化
watch(() => overflowIndexes, (newVal) => {
  console.log("overflowIndexes", newVal);
}, { deep: true, immediate: true });
</script>

<style lang="scss">
.checkboxGroup {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  .el-checkbox__input {
    white-space: nowrap;
    cursor: pointer;
    outline: 0;
    display: inline-flex;
    position: absolute;
    right: 5px;
    top: 5px;
  }

  .el-checkbox__label {
    padding: 0;
    width: 100%;
    height: 100%;
  }

  .el-checkbox__input .el-checkbox__inner:after {
    border-color: #ffffff;
  }

  .el-checkbox__input.is-checked .el-checkbox__inner {
    border: 1px solid #0051ff;
  }

  .el-checkbox__inner {
    border: 1px solid #fff;
  }
}

.box-img {
  display: flex;
  flex-wrap: wrap;
  /* 允许子元素换行 */
  align-content: flex-start;
  /* 控制行的对齐方式，从顶部开始 */
  justify-content: flex-start;
  /* 控制项目在主轴的对齐方式，从左侧开始 */
  gap: 10px;
  /* 设置子元素之间的间距 */
  position: relative;
  flex: 1;
  /* flex布局，占据剩余空间 */
  // padding-top: 50px;
  // padding-right: 50px;
  // background-color: #f0f0f0;
  transition: all 0.3s;
}

.checkbox {
  width: 252px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  position: relative;
}

.checkbox-active {
  border: 1px solid #00ffff;
}

.unselectable-text {
  user-select: none;
  -webkit-user-select: none;
  /* 对于 WebKit 浏览器 */
  -moz-user-select: none;
  /* 对于 Firefox 浏览器 */
  -ms-user-select: none;
  /* 对于 IE 浏览器 */
}
</style>