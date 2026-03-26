<template>
  <div class="layout-padding">
    <div class="layout-padding-auto layout-padding-view">
      <!-- 新建数据集 -->
      <!-- <div class="mb-2 px-6 text-4xl font-bold">
        {{ form.datasetId ? t('manage.editDataset') : t('manage.viewBaseDataset') }}
      </div> -->
      <el-row class="ml10">
        <el-form inline :model="state.queryForm" @submit.prevent @keyup.enter="getDataList" ref="queryRef">
          <!-- <el-form-item :label="t('post.postName')" prop="postName"> -->
          <el-form-item :label="t('dataset.imgName')" prop="original">
            <el-input :placeholder="t('dataset.inputdatasetTitleTip')" style="max-width: 180px"
              v-model="state.queryForm.original" />
          </el-form-item>
          <el-form-item class="w-68" :label="t('dataset.annotationTask')" prop="taskId">
            <el-select :placeholder="labelInfo.length ? t('dataset.selectLabelByTip') : t('dataset.noLabelByTip')"
              v-model="taskIdIndex" @change="labelChange">
              <el-option v-for="(item, index) in labelInfo" :key="item.taskId" :label="item.taskName" :value="index">
                <span class="float-left truncate max-w-24">{{ item.taskName }}</span>
                <span class="float-right text-gray-500 text-sm"> {{ ((item.labelCount
                  /
                  item.imageCount) * 100).toFixed(2) }}%
                </span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button @click="getDataList" icon="search" type="primary">
              {{ t('common.queryBtn') }}
            </el-button>
            <el-button @click="resetQuery" icon="Refresh">{{ t('common.resetBtn') }}</el-button>
          </el-form-item>
        </el-form>
      </el-row>
      <el-divider class="!my-1" border-style="dashed" />
      <div class="w-full h-full flex flex-row overflow-y-auto">
        <!-- 左边部分 -->
        <div class="basis-1/5 border border-[#dcdfe6]" ref="leftDiv"
          style="width: 100%; height: 100%; max-height: 100%;">
          <!-- TabBarArea 组件，占 50% -->
          <div v-loading="labelLoading"
            style="width: 100%; border-bottom: 1px solid #e2e0e0; display: flex; flex-direction: column; overflow: hidden;">
            <TabBarArea ref="tabBarAreaRef" :taskForm="taskForm" :selectItem="selectItem" :selection="selection"
              @changeCheck="changeCheck" @deleteItem="deleteItem" @refreshCanvas="refreshCanvas" />
          </div>
        </div>
        <!-- 右边部分 -->
        <div class="basis-4/5 ml-2 border border-[#dcdfe6]" ref="rightDiv">
          <div v-loading="state.loading" class="w-full h-full overflow-y-scroll">
            <el-checkbox-group :model-value="Array.from(selectedImages)" @change="checkboxGroupClick"
              @updata:model-value="">
              <div class="w-full grid grid-flow-row gap-4" :class="{
                'grid-cols-10': state.pagination?.size === 30,
                'grid-cols-8': state.pagination?.size === 24,
                'grid-cols-6': state.pagination?.size === 18,
                'grid-cols-4': state.pagination?.size === 12
              }">
                <div v-for="(image, index) in state.dataList" :key="image.fileId">
                  <div :class="[
                    'box-border relative flex items-center justify-center bg-br-extra-light border-4 hover:border-primary',
                    { 'border-primary': selectedImages.has(image.fileId), 'border-body': !selectedImages.has(image.fileId) },
                  ]">
                    <el-checkbox v-show="form.datasetId" :key="image.fileId" :label="image.fileId" :value="image.fileId"
                      @click="" @change="checkboxClick(image.fileId)"
                      class="!absolute top-1 right-2 overflow-hidden w-3.5 h-3.5" size="large"></el-checkbox>
                    <!-- <el-image class="w-full h-40" :src="fileUrl + image.bucketName + '/' + image.fileName" fit="contain"
                      @click="handleImageClick()" /> -->
                    <!-- :preview-src-list="imageViewList" -->
                    <canvas :key="index" :id="`smallcontainer${index}`" class="smallcontainer"></canvas>
                    <el-tag v-if="labelInfo.length > 0 && labelInfo[taskIdIndex].labelType === '0' && image.tagInfoList"
                      :color="getTagColor(image.tagId)" effect="dark"
                      class="absolute right-0 bottom-0 !border-none z-[3] max-w-[100px] whitespace-nowrap overflow-hidden text-ellipsis">{{
                        taskInfo.find(item => item.tagId === image.tagId)?.tagName || null}}</el-tag>
                    <el-tag
                      v-else-if="labelInfo.length > 0 && (labelInfo[taskIdIndex].labelType === '1' || labelInfo[taskIdIndex].labelType === '2') && image.tagInfoList && image.tagInfoList[0]?.tagInfo"
                      color="#DBEADF" effect="dark"
                      class="absolute right-0 bottom-0 !text-lg !text-[#5BAC87] bg-[#DBEADF] !border-none">{{
                        'ok' }}</el-tag>
                  </div>
                  <div class="mt-2 flex justify-between items-center bg-br-extra-light">
                    <el-tooltip :content="computedImgUrl(image.bucketName, image.original)" placement="top"
                      :disabled="!overflowIndexes.has(image.fileId)">
                      <div v-overflow="handleOverflow(image.fileId)" class="p-1 text-base leading-5  truncate">
                        {{ computedImgUrl(image.bucketName, image.original) }}
                      </div>
                    </el-tooltip>
                    <div class="text-lg flex justify-center">
                      <el-icon class="cursor-pointer" @click.stop.prevent="ImageInfoRef.openDialog(image, taskIdIndex)">
                        <Tickets />
                      </el-icon>
                      <el-icon class="cursor-pointer"
                        @click.stop.prevent="showImage(image.bucketName, image.fileName, index)">
                        <FullScreen />
                      </el-icon>
                    </div>
                  </div>
                  <!-- <div class="mt-2 p-1 text-base leading-5 bg-br-extra-light truncate">
                    <el-text class="w-4/6" type="primary">{{ t('dataset.labelName') }}：{{
                      image.labelList && image.labelList.length > 0 && image.labelList[taskIdIndex]?.tagInfo
                        ? image.labelList[taskIdIndex].tagInfo
                        : t('dataset.noLabel')
                    }}</el-text>
                  </div> -->
                </div>
              </div>
            </el-checkbox-group>
            <el-empty v-show="!loading && !state.pagination?.total" class="mx-0 my-auto" description="未导入数据"
              :image-size="250" />
          </div>
        </div>
      </div>
      <pagination @current-change="currentPageHandle" @size-change="sizeChangeHandle" v-bind="state.pagination" />

      <div v-show="form.datasetId" class="pt-4">
        <div class="flex justify-between">
          <div>
            <el-button class="!px-12" size="default" v-show="form.datasetId" @click="selectAllImage" type="primary">
              {{ t('dataset.allSelect') }}
            </el-button>
            <el-button class="!px-12" size="default" @click="emptyAllImage">{{ t('dataset.empty') }}</el-button>
          </div>
          <div>
            <el-button class="!px-12" size="default" v-show="form.datasetId" @click="importImage" type="primary">
              {{ t('common.importBtn') }}
            </el-button>
            <el-button class="!px-12" size="default" @click="backIndex">{{ t('common.cancelButtonText') }}</el-button>
          </div>
        </div>
      </div>
      <el-image-viewer v-if="dialogImageVisible" @close="dialogImageVisible = false" :url-list="viewerList"
        :initial-index="currentImageIndex" />
    </div>
    <ImageInfoDialog @refresh="getDataList()" ref="ImageInfoRef" />
  </div>
</template>

<script setup lang="ts" name="seletctDataseImage">
import { BasicTableProps, useTable } from '/@/hooks/table';
import { fetchBaseImageList, getDatasetById, editDataset, fetchBaseImageListNew } from '/@/api/dataset/manage';
import { fetchList as fetchDatasetTaskList, getTaskObj, putTaskObj } from '/@/api/annotate/annotation-task';
import { fetchDatasetLabelList } from '/@/api/dataset/detail';
import { useMessage, useMessageBox } from '/@/hooks/message';
import { ElInput, TabsPaneContext, ElLoading } from 'element-plus'
import { useI18n } from 'vue-i18n';
import { fileUrl } from '/@/utils/env';
import router from '/@/router';
import mittBus from '/@/utils/mitt';

import CanvasSelect from 'canvas-select-plus'
import pako from 'pako';

const { t } = useI18n();
const ImageInfoDialog = defineAsyncComponent(() => import('./imageInfoDialog.vue'));
const TabBarArea = defineAsyncComponent(() => import('../../annotate/onlineannotation/tabBarArea.vue'));
const route = useRoute();

// 控制变量
const ImageInfoRef = ref();
const dialogImageVisible = ref(false);
const queryRef = ref();
const loading = ref(false);
const labelLoading = ref(false);
const handelLoading = ref(false);
const imageViewList = ref<string[]>([]);
const selectedImages = ref(new Set<string>());
const overflowIndexes = ref(new Set<string>());
// 标签
const taskId = ref('');
const taskInfo = ref<{ tagId: string; color: string; tagName: string; }[]>([])
const labelInfo = ref<LabelInfo[]>([]);
// 图片查看器图片数组
const currentImageIndex = ref(0);
const viewerList = ref(['']);

const form = reactive({
  datasetId: '',
  imageIds: '',
});

onMounted(async () => {
  loading.value = true;

  // 判断baseDatasetId是否存在
  if (route.query.baseDatasetId) {
    state.queryForm.baseDatasetId = route.query.baseDatasetId;
    // 通过baseDatasetId获取基础数据集标注任务列表
    await fetchBasedatasetLabelListData({ baseDatasetId: route.query.baseDatasetId });
  } else {
    useMessageBox().error('未获取到baseDatasetId');
    backIndex();
  }

  // 获取标签详细信息
  if (taskId.value) {
    await fetchTaskObj(taskId.value as string);
  }

  // 获取图像信息
  await query();

  // 处理canvas数据
  if (taskIdIndex.value !== undefined) {
    updataLabelResult();
  }
  state.dataList?.forEach((item, index) => {
    initializeCanvas(index, item.fileId, item.bucketName, item.fileName);
  });

});

// 注销时打印
onUnmounted(() => {
  // console.log("onUnmounted");
});

// 获取图片列表
const state: BasicTableProps = reactive<BasicTableProps>({
  createdIsNeed: false,
  pagination: {
    size: 18,
  },
  queryForm: {
    baseDatasetId: '',
    taskId: '',
    original: '',
  },
  pageList: fetchBaseImageListNew,
});

//  table hook
const { query, getDataList, currentChangeHandle, sizeChangeHandle } = useTable(state);

const currentPageHandle = async (page: number) => {
  state.pagination!.current = page;
  await query();
  if (taskIdIndex.value !== undefined) {
    updataLabelResult();
  }
  state.dataList?.forEach((item, index) => {
    initializeCanvas(index, item.fileId, item.bucketName, item.fileName);
  });
}

// 清空搜索条件
const resetQuery = () => {
  queryRef.value.resetFields();
  getDataList();
};


const importImage = async () => {
  try {
    // 判断selectedImages是否为空,为空则提示，不为空正常执行
    form.imageIds = selectedImages.value.size >= 0 ? JSON.stringify(Array.from(selectedImages.value)) : '[]';
    const res = await editDataset(form);
    if (res && res.code === 0) {
      useMessage().success('保存成功');
    }
  } catch (err: any) {
    useMessage().error(err.msg);
  } finally {
    backIndex();
  }
};

const backIndex = () => {
  form.imageIds = '';
  router.back();
  mittBus.emit('onCurrentContextmenuClick', Object.assign({}, { contextMenuClickId: 1, ...route }));
};

const checkboxClick = (param: string) => {
  // console.log('checkboxClick', param);
  selectedImages.value.has(param) ? selectedImages.value.delete(param) : selectedImages.value.add(param);
};

const checkboxGroupClick = (param: string) => {
  // console.log('checkboxGroupClick', param);
};

const handleImageClick = () => {
  if (labelInfo.value.length) {
    datasetAnnotation(taskId.value, labelInfo.value[taskIdIndex.value].baseDatasetName, labelInfo.value[taskIdIndex.value].labelType, labelInfo.value[taskIdIndex.value].subLabelType, labelInfo.value[taskIdIndex.value].taskName)
  } else {
    useMessage().info('暂无标签信息，请创建标签任务');
  }
}

//基准数据集标注
const datasetAnnotation = (taskId: string, baseDatasetName: string, labelType: string, subLabelType?: string, taskName?: string) => {
  const paths: Record<string, string> = {
    '0': '/annotate/onlineannotation/imageClassification',
    '1': '/annotate/onlineannotation/objectDetection',
    '2': '/annotate/onlineannotation/imageSegmentation',
  };

  if (!taskId || !baseDatasetName) {
    useMessage().wraning("任务ID或数据集名称不能为空！");
    return;
  }

  const path = paths[labelType];
  if (!path) {
    useMessage().wraning("功能正在开发中...");
    return;
  }

  router.push({ path, query: { taskId, baseDatasetName, subLabelType, name: taskName } });
};

//函数作用：将state.dataList包含的每一个对象里面的id存入到selectedImages数组中，如果selectedImages数组中已经存在，则不添加
const selectAllImage = () => {
  if (state.dataList) {
    state.dataList.forEach((item) => {
      // 使用Set的add方法添加元素
      selectedImages.value.add(item.fileId);
    });
  } else {
    useMessage().info('未获取到图片列表数据');
  }
};

const emptyAllImage = () => {
  if (state.dataList) {
    state.dataList.forEach((item) => {
      // 使用Set删除元素
      selectedImages.value.delete(item.fileId);
    });
  } else {
    useMessage().info('未获取到图片列表数据');
  }
};

const computedImgUrl = (url: string, original: string) => {
  // 定义正则表达式来匹配 base/ 后面的路径
  const regex = /base\/(.*)/;
  const regex2 = /images\\(.*)/;

  // 使用正则表达式进行匹配
  const match = url.match(regex);
  const match2 = url.match(regex2);

  // 如果匹配成功，返回捕获的部分，否则返回空字符串
  const formatUrl = match ? match[1] : match2 ? match2[1] : '';

  return formatUrl + '/' + original;
};

const handleOverflow = (index: string) => (el: any) => {
  nextTick(() => {
    if (el.scrollWidth > el.clientWidth) {
      overflowIndexes.value.add(index);
    } else {
      overflowIndexes.value.delete(index);
    }
  });
};

const formatUrl = (bucketName: string, fileName: string) => {
  const fileUrlString = fileUrl + 'thumbnails/' + bucketName + '/' + fileName;
  let startUrl = fileUrlString.substring(0, 17);
  let endUrl = fileUrlString.substring(17).replace(/\/\/+/g, '/');
  return startUrl + endUrl;
};

const showImage = (bucketName: string, fileName: string, index: number) => {
  currentImageIndex.value = index;
  dialogImageVisible.value = true;
  // viewerList.value[0] = formatUrl(bucketName, fileName);
};

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


interface LabelInfo {
  baseDatasetId: string;
  baseDatasetName: string;
  dataType: string;
  imageCount: number;
  labelCount: number;
  labelType: string;
  subLabelType: string;
  tagIds: string[];  // 标签ID列表
  taskId: string;
  taskName: string;
}

const fetchBasedatasetLabelListData = async (param: Object) => {
  let res = await fetchDatasetTaskList(param);
  const labelInfos = res.data.records;
  if (labelInfos.length > 0 && labelInfos[0].labelTaskList.length > 0) {
    taskIdIndex.value = 0;
    labelInfo.value = labelInfos[0].labelTaskList;
    // 更新taskId
    taskId.value = labelInfo.value[taskIdIndex.value].taskId
    state.queryForm.taskId = taskId.value;
    // labelChange();
    initPageSize(labelInfo.value[taskIdIndex.value].labelType);
  } else {
    useMessage().info('暂无标签数据');
  }
  // labelChange();
};

const fetchTaskObj = async (param: string) => {
  labelLoading.value = true;
  try {
    let res = await getTaskObj(param);
    if (res.code == 0 && res.data) {
      Object.assign(taskForm, res.data);
      if (res.data && res.data.tagList?.length) {
        taskInfo.value = res.data.tagList;
      }
      // 初始化标签列表
      selectItem.length = 0;
      if (res.data.tagList && res.data.tagList.length > 0) {
        res.data.tagList.forEach((tag: Tag) => {
          selectItem.push({
            tagId: tag.tagId,
            tagName: tag.tagName,
            color: hexToRgba(tag.color ?? '', 1) ?? 'rgba(0, 0, 0, 255)'
          });
        });
      }
    }
  } catch (error) {
    useMessage().error("标签信息获取失败，请检查！！！");
  } finally {
    labelLoading.value = false;
  }

};

// 所选标签任务的index
const taskIdIndex = ref();
const labelChange = async () => {
  state.dataList = []
  if (labelInfo.value.length > 0) {
    taskId.value = labelInfo.value[taskIdIndex.value].taskId;
    state.queryForm.taskId = taskId.value;
    initPageSize(labelInfo.value[taskIdIndex.value].labelType);

    // 获取标签信息
    await fetchTaskObj(taskId.value)

  }
  await query()
  if (taskIdIndex.value !== undefined) {
    updataLabelResult();
  }
  state.dataList?.forEach((item, index) => {
    initializeCanvas(index, item.fileId, item.bucketName, item.fileName);
  });
}

const getTagColor = (tagId: string) => {
  const tag = taskInfo.value.find((item: any) => item.tagId === tagId);
  return tag ? tag.color : '#c0c4cc';  // Default color
};

// 初始化分页数量
const initPageSize = (labelType: string) => {
  if (state.pagination) {
    if (labelType == '0') {
      state.pagination.size = 30;
    } else if (labelType == '1' || labelType == '2') {
      state.pagination.size = 18;
    } else {
      state.pagination.size = 18;
    }
  }
  state.pagination!.current = 1;
};

// #region ********************************标签栏************************************
// 定义 Tag 对象的类型
interface Tag {
  tagId: string;
  tagName: string;
  color: string;
}

// 提交表单数据
interface Task {
  taskId: string;
  taskName: string;
  datasetId: string;
  baseDatasetId: string;
  labelType: string;
  tagIds: string;
  groupId: string;
  groupName: string;
}
const taskForm: Task = reactive({
  taskId: "",
  taskName: "",
  datasetId: "",
  baseDatasetId: "",
  labelType: "",
  tagIds: "",
  groupId: "",
  groupName: ""
});

const tabBarAreaRef = ref();
const selection = ref('0');
const selectItem = reactive<Tag[]>([
]);
const indexToColorMap = new Map<string, number>();
const addValue = ref('');
const addVisible = ref(false);
const filterVisible = ref(false);
const updateVisible = ref(false);
const FilenameRef = ref<InstanceType<typeof ElInput>>()

const searchTerm = ref('');  // 搜索框的内容

const addType = ref(0);

// 过滤后的菜单项
const filteredItems = () => {
  return selectItem.filter(item => item.tagName.toLowerCase().includes(searchTerm.value.toLowerCase()));
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
const handleInputConfirm = (label: string) => {
  if (label) {
    const newItem: Tag = {
      tagId: generateRandomString(10),
      tagName: label,
      color: hexToRgba('#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'), 1)
    };
    selectItem.push(newItem);
  } else if (addValue.value) {
    const newItem: Tag = {
      tagId: generateRandomString(10),
      tagName: label,
      color: hexToRgba('#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'), 1)
    };
    selectItem.push(newItem);
    addVisible.value = false;
    addValue.value = '';
  } else {
    return;
  }
}

const filterTagName = ref('');
const filteredSelectItem = computed(() => {
  const searchValue = filterTagName.value.trim().toLowerCase();
  if (searchValue === '') {
    // 如果搜索条件为空，返回全部数据
    return selectItem;
  } else {
    // 根据名称进行模糊匹配
    return selectItem.filter((item) =>
      item.tagName.includes(searchValue)
    );
  }
});

const updateTagIds = async (newtaskForm: Task) => {
  // 更新labeltask的tagIds
  try {
    await putTaskObj(newtaskForm);
    useMessage().success("修改标签成功");
  } catch (err: any) {
    useMessage().error(err.msg);
  }
}

const refreshCanvas = () => {
  // 修改和删除标签时，goto不用保存
  havenSaved.value = true;
  // 当涉及到刷新canvas图片时，gotoImage多传一个reset=true
  gotoImage(imageList.value[selectedIndex.value].bucketName, imageList.value[selectedIndex.value].fileName, imageList.value[selectedIndex.value].fileId, selectedIndex.value, true);
}

const deleteItem = async (value: string) => {
  // 弹窗确认
  await useMessageBox().confirm("确认删除该标签，所有已标注的图片都会被修改");
  try {
    loading.value = true;
    handelLoading.value = true;
    let tagIdsJson = JSON.parse(taskForm.tagIds);
    let index = tagIdsJson.findIndex((item: string) => item.toString() === value);
    if (index > -1) {
      tagIdsJson.splice(index, 1);
      const newtaskForm: Task = {
        taskId: taskForm.taskId,
        taskName: taskForm.taskName,
        datasetId: taskForm.datasetId ?? '',
        baseDatasetId: taskForm.baseDatasetId,
        labelType: taskForm.labelType,
        tagIds: JSON.stringify(tagIdsJson),
        groupId: taskForm.groupId,
        groupName: taskForm.groupName,
      }
      // 同步更新labeltask的tagIds
      await updateTagIds(newtaskForm);
      taskForm.tagIds = JSON.stringify(tagIdsJson);
      // 更新selectItem
      index = selectItem.findIndex((item: Tag) => item.tagId === value);
      if (index > -1) {
        selectItem.splice(index, 1);
      }
      selection.value = '0';
      // 更新resultList
      getDataList();
      // refreshCanvas();
    } else {
      useMessage().wraning("未找到该标签！！！");
    }
  } catch {
    useMessage().error("删除失败！！！");
  } finally {
    loading.value = true;
    handelLoading.value = true;
  }
};

// alpha在css中最大值为1，在Uint8ClampedArray中最大值为255，所以需要转换
function hexToRgba(color: string, alpha: number = 1): string {
  if (!color) return '';

  // 直接处理 RGBA 格式
  if (color.startsWith('rgba(')) {
    return color.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/, `rgba($1, $2, $3, ${alpha})`);
  }

  // 处理十六进制格式
  let hex = color.replace(/^#/, '');

  // 处理 #RGB 简写格式
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

  // 确保是正确的 6 位十六进制颜色代码
  if (hex.length !== 6) {
    console.error('Invalid hex color:', hex);
    return '';
  }

  // 解析 RGB 值
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}


function rgbaToHex(rgba: string, ignoreAlpha: boolean = true): string {
  // 如果已经是 hex 格式，直接返回
  if (/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(rgba.trim())) {
    return rgba.trim();
  }

  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]*)?\)/);
  if (!match) {
    console.error("Invalid RGBA format:", rgba);
    return '';
  }

  const r = parseInt(match[1]).toString(16).padStart(2, '0');
  const g = parseInt(match[2]).toString(16).padStart(2, '0');
  const b = parseInt(match[3]).toString(16).padStart(2, '0');

  let hex = `#${r}${g}${b}`;

  if (!ignoreAlpha && match[4] !== undefined && match[4] !== '') {
    const alpha = Math.round(parseFloat(match[4]) * 255)
      .toString(16)
      .padStart(2, '0');
    hex += alpha;
  }

  return hex;
}



// 选中标签触发事件（点击或快捷键选中）
const changeCheck = (index: number, value: string, operation: string = '') => {
  nextTick(() => {
    // 确保 DOM 和子组件加载完成后访问
    if (tabBarAreaRef.value) {
      // 不选中任一标签项
      if (index === -1 && value === '') {
        selection.value = '0';
        return;
      } else if (index !== -1 && value === '') {
        if (tabBarAreaRef.value.editedItem !== '' && tabBarAreaRef.value.editedItem === value) {
          return;
        } else if (tabBarAreaRef.value.lockedItem !== '' && tabBarAreaRef.value.lockedItem !== value) {
          useMessage().wraning("已锁定其他选项！！！");
          return;
        }
        // 通过index（快捷键）选中
        if (filteredSelectItem.value.length === 0) {
          useMessage().wraning("无对应的快捷键选项！！！");
          return;
        } else if (index < filteredSelectItem.value.length) {
          selection.value = filteredSelectItem.value[index].tagId;
        } else {
          useMessage().wraning("无对应的快捷键选项！！！");
          return;
        }
      } else {
        // 通过selectItem.value选中
        if (tabBarAreaRef.value.editedItem !== '' && tabBarAreaRef.value.editedItem === value) {
          return;
        } else if (tabBarAreaRef.value.lockedItem !== '' && tabBarAreaRef.value.lockedItem !== value) {
          useMessage().wraning("已锁定其他选项！！！");
          return;
        }
        selection.value = value;
      }
      if (selectedList.value.length !== 0 && selection.value !== '0') {
        let selectedType = selectItem.find(item => item.tagId === selection.value);
        // instance.textFillStyle = selectedType?.color ?? '#F93238';
        // instance.labelFontSize = 15;
        // instance.labelFontFamily = 'sans-serif';

        if ([9, 8, 7, 5, 2].includes(instance.activeShape.type) || [9, 8, 7, 5, 2].includes(instance.createType) || lockedItem.value !== '') {
          pathTagName.value = selectedType?.tagName ?? '';
          pathTagColor.value = rgbaToHex(selectedType?.color ?? '#000000');
          brushColor.value = rgbaToHex(selectedType?.color ?? '#000000');
          instance.activeStrokeStyle = hexToRgba(selectedType?.color ?? '', 0.8) ?? 'transparent';
          instance.activeFillStyle = hexToRgba(selectedType?.color ?? '', 0.8) ?? 'transparent';
        }

        if (instance.activeShape.uuid && mode.value !== 0 && operation != 'undore') {
          // if (instance.activeShape.iseraser === true) {
          //   // 橡皮檫轨迹不需要标注
          //   return;
          // }
          instance.updateLabelByIndex([], selectedType?.tagId ?? '', selectedType?.tagName ?? '', hexToRgba(selectedType?.color ?? '', 0.4) ?? '', ['label', 'tagId', 'strokeStyle', 'fillStyle']);
          instance.activeFillStyle = hexToRgba(selectedType?.color ?? '', 0.8) ?? 'transparent';
          // let index = resultMessage.value.findIndex(item => item.uuid === instance.activeShape.uuid);
          // resultMessage.value[index].tagId = selection.value;
        }
      }
    }
  });
}

const isSaved = (val: string) => {
  return resultList.some(item => item.fileId === val);
};

// #endregion
const initializeCanvas = (index: number, fileId: string, bucketName: string, fileName: string) => {
  let id = "#smallcontainer" + index;
  let smallinstance: CanvasSelect;

  smallinstance = new CanvasSelect(id);
  smallinstance.fillStyle = 'transparent';
  smallinstance.labelFillStyle = 'transparent';
  smallinstance.MIN_LENGTH = 10;
  // smallinstance.IMAGE_HEIGHT = 140;
  smallinstance.hideLabel = true;
  smallinstance.setImage(formatUrl(bucketName, fileName));
  smallinstance.on('fitZoom', () => {
    smallinstance.lock = true;
  });

  if (isSaved(fileId)) {
    const shape = resultList.find(item => item.fileId === fileId);
    switch (labelInfo.value[taskIdIndex.value].labelType) {
      case '1':
        if (shape) {
          // 根据tagId为每个图形设置标签名称和颜色（应对标签修改的情况）
          for (let i = 0; i < shape.options.length; i++) {
            let index = selectItem.findIndex((item: Tag) => item.tagId === shape.options[i].tagId);
            if (index !== -1) {
              shape.options[i].label = selectItem[index].tagName;
              shape.options[i].strokeStyle = selectItem[index].color;
              shape.options[i].textFillStyle = selectItem[index].color;
            } else {
              // 说明该标签已被删除，置空，在handlesave时除掉
              // shape.options[i].label = '';
              // shape.options[i].strokeStyle = '';
              // shape.options[i].textFillStyle = '';
              shape.options.splice(i, 1);
            }
          }
        }
        smallinstance.setData(shape?.options);
        break;

      case '2':
        if (shape) {
          // 根据tagId为每个图形设置标签名称和颜色（应对标签修改的情况）
          for (let i = 0; i < shape.options.length; i++) {
            let index = selectItem.findIndex((item: Tag) => item.tagId === shape.options[i].tagId);
            if (index !== -1) {
              // shape.options[i].label = selectItem[index].tagName;
              // if (shape.options[i].type === 7) {
              //   shape.options[i].strokeStyle = selectItem[index].color;
              //   shape.options[i].fillStyle = selectItem[index].color;
              // } else {
              shape.options[i].strokeStyle = hexToRgba(selectItem[index].color ?? '', 0.4);
              shape.options[i].fillStyle = hexToRgba(selectItem[index].color ?? '', 0.4);
              // }
              // shape.options[i].textFillStyle = selectItem[index].color;
            } else {
              // 说明该标签已被删除，置空，在handlesave时除掉
              shape.options[i].label = '';
              shape.options[i].strokeStyle = '';
              shape.options[i].fillStyle = '';
              // shape.options[i].textFillStyle = '';
            }
            // 对刷子和橡皮檫轨迹进行解码和反压缩
            if ((shape.options[i].type === 9 || shape.options[i].type === 7 || shape.options[i].type === 4) && 'encodedData' in shape.options[i].coor) {
              shape.options[i].coor = decodeAndDecompressPoints(shape.options[i].coor.encodedData, shape.options[i].coor.startX, shape.options[i].coor.startY);
              if (shape.options[i].type === 9) { shape.options[i].coor.push([-1, -1]); }

            }
          }
        }
        smallinstance.setData(shape?.options);
        break;
      default:
        smallinstance.setData([]);
        break;
    }
  } else {
    smallinstance.setData([]);
  }
};

interface Option {
  uuid?: string;
  index?: number;
  labelId?: string;
  label: string;
  tagId: string;
  labelFillStyle?: string;
  strokeStyle?: string;
  textFillStyle?: string;
  fillStyle?: string;
  coor: [number, number][] | number[];
  iscontour?: boolean;
  type: number;
  labelType?: number;//0：标注标签 1：参考标签
  radius?: number;
  active?: boolean;
  creating?: boolean;
  dragging?: boolean;
  hiddening?: boolean;
  locking?: boolean;
  remark?: string;
}

interface ResultShape {
  labelId: string;
  fileId: string;
  // type: string;
  options: Option[];
}
// 记录已保存的图形列表
const resultList = reactive<ResultShape[]>([]);

const updataLabelResult = () => {
  switch (labelInfo.value[taskIdIndex.value].labelType) {
    case '1':
      if (state.dataList && state.dataList.length > 0) {
        resultList.length = 0;
        for (let i = 0; i < state.dataList.length; i++) {
          if (state.dataList[i].tagInfoList && state.dataList[i].tagInfoList.length > 0) {
            let options: Option[] = [];
            for (let j = 0; j < state.dataList[i].tagInfoList.length; j++) {
              const tagInfo = JSON.parse(state.dataList[i].tagInfoList[j].tagInfo);
              if (tagInfo) {
                // 矩形框
                if ('bbox_label' in tagInfo) {
                  const tagMsg = selectItem.find((item: Tag) => item.tagId == String(tagInfo.bbox_label));
                  if (tagMsg) {
                    options.push({
                      label: tagMsg.tagName,
                      tagId: String(tagInfo.bbox_label),
                      strokeStyle: tagMsg.color,
                      coor: [[tagInfo.bbox.xmin, tagInfo.bbox.ymin], [tagInfo.bbox.xmax, tagInfo.bbox.ymax]],
                      remark: tagInfo.remark ?? '',
                      type: 1,
                      active: false,
                      creating: false,
                      dragging: false,
                      hiddening: false
                    });
                  }
                } else if ('line_label' in tagInfo) {
                  // 直线
                  const tagMsg = selectItem.find((item: Tag) => item.tagId == String(tagInfo.line_label));
                  if (tagMsg) {
                    options.push({
                      label: tagMsg.tagName,
                      tagId: String(tagInfo.line_label),
                      strokeStyle: tagMsg.color,
                      coor: [[tagInfo.line.xmin, tagInfo.line.ymin], [tagInfo.line.xmax, tagInfo.line.ymax]],
                      remark: tagInfo.remark ?? '',
                      type: 4,
                      active: false,
                      creating: false,
                      dragging: false,
                      hiddening: false
                    });
                  }
                } else if ('circle_label' in tagInfo) {
                  // 圆框
                  const tagMsg = selectItem.find((item: Tag) => item.tagId == String(tagInfo.circle_label));
                  if (tagMsg) {
                    options.push({
                      label: tagMsg.tagName,
                      tagId: String(tagInfo.circle_label),
                      strokeStyle: tagMsg.color,
                      coor: [tagInfo.coor.x, tagInfo.coor.y],
                      radius: tagInfo.radius,
                      remark: tagInfo.remark ?? '',
                      type: 5,
                      active: false,
                      creating: false,
                      dragging: false,
                      hiddening: false
                    });
                  }
                }
              }
            }
            resultList.push({
              labelId: state.dataList[i].labelId,
              fileId: state.dataList[i].fileId,
              // type: state.dataList[i].labelFileName,
              options: options
            });
          }
        }
      }
      break;
    case '2':
      if (state.dataList && state.dataList.length > 0) {
        resultList.length = 0;
        for (let i = 0; i < state.dataList.length; i++) {
          if (state.dataList[i].tagInfoList && state.dataList[i].tagInfoList.length > 0) {
            let options: Option[] = [];
            for (let j = 0; j < state.dataList[i].tagInfoList.length; j++) {
              const tagInfo = JSON.parse(state.dataList[i].tagInfoList[j].tagInfo);
              if (tagInfo) {
                const tagMsg = selectItem.find((item: Tag) => item.tagId == String(tagInfo.tagId));
                if (tagMsg) {
                  options.push({
                    label: tagMsg.tagName,
                    tagId: String(tagInfo.tagId),
                    fillStyle: tagInfo.fillStyle,
                    coor: tagInfo.coor,
                    type: tagInfo.type,
                    // ...(tagInfo.boundingRect ? { boundingRect: tagInfo.boundingRect } : {}),
                    ...(tagInfo.encodePixelData ? { encodePixelData: tagInfo.encodePixelData } : {}),
                    ...(tagInfo.startPoint ? { startPoint: tagInfo.startPoint } : {}),
                    ...(tagInfo.width ? { width: tagInfo.width } : {}),
                    ...(tagInfo.height ? { height: tagInfo.height } : {}),
                    ...(tagInfo.lineWidth ? { lineWidth: tagInfo.lineWidth } : {}),
                    ...(tagInfo.iseraser ? { iseraser: tagInfo.iseraser } : {}),
                    ...(tagInfo.radius ? { radius: tagInfo.radius } : {}),
                    active: false,
                    creating: false,
                    dragging: false,
                    hiddening: false,
                    locking: false
                  });
                }
              }
            }
            resultList.push({
              labelId: state.dataList[i].labelId,
              fileId: state.dataList[i].fileId,
              // type: state.dataList[i].labelFileName,
              options: options
            });
          }
        }
      }
      break;
    default:
      resultList.length = 0;
      break;
  }

  console.log("resultlist", resultList);

}

/**
 * 将编码后的字符串进行 Base64 解码、解压和差分解码
 * @param encodedData 编码后的字符串
 * @param startX 初始横坐标
 * @param startY 初始纵坐标
 * @returns 解码后的坐标数组
 */
function decodeAndDecompressPoints(encodedData: string, startX: number, startY: number): [number, number][] {
  // Base64 解码
  const base64String = atob(encodedData);
  const compressedData = new Uint8Array(base64String.split('').map(char => char.charCodeAt(0)));

  // 解压算法
  const binaryData = pako.ungzip(compressedData);

  // 3. 差分解码
  const points: [number, number][] = [[startX, startY]];

  for (let i = 0; i < binaryData.length; i += 2) {
    const [prevX, prevY] = points[points.length - 1];
    let dx = binaryData[i];
    let dy = binaryData[i + 1];

    // 修正差分值
    if (dx > 127) dx -= 256;
    if (dy > 127) dy -= 256;

    points.push([Math.round(prevX + dx), Math.round(prevY + dy)]);
  }

  return points;
}

// 监控state.dataList变化
watch(
  () => state.dataList,
  (newVal) => {
    // console.log('state.dataList', newVal);
    imageViewList.value = (state.dataList as Array<Object>).map((item: any) => fileUrl + item.bucketName + '/' + item.fileName);
    viewerList.value = (state.dataList as Array<Object>).map((item: any) => formatUrl(item.bucketName, item.fileName));
  },
  { deep: true, immediate: true }
);

// 监控selectedImages变化
watch(
  () => selectedImages,
  (newVal) => {
    // console.log('selectedImages', newVal);
  },
  { deep: true, immediate: true }
);

// 监控selectedImages变化
watch(
  () => overflowIndexes,
  (newVal) => {
    // console.log('overflowIndexes', newVal);
  },
  { deep: true, immediate: true }
);
</script>

<style lang="scss" scoped>
.smallcontainer {
  width: 100%;
  height: 160px;
  z-index: auto;
  position: relative;
  background-color: aliceblue;
}
</style>
