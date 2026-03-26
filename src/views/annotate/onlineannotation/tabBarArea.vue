<template>
  <div v-show="addType === 0"
    style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; width: 100%;">
    <!-- 标签栏标题，靠左对齐 -->
    <h3 style="font-size: 18px; margin-left: 20px; user-select: none; flex-grow: 1; text-align: left;">
      <span>{{ tagType === '0' ? '标注标签' : '参考标签' }}</span>
      <el-popover placement="bottom" :width="110" trigger="hover">
        <template #reference>
          <el-icon v-show="props.showTypeIcon">
            <CaretBottom class="cursor-pointer" />
          </el-icon>
        </template>
        <el-radio-group v-model="tagType">
          <el-radio value="0" size="large">标注标签</el-radio>
          <el-radio value="1" size="large">参考标签</el-radio>
        </el-radio-group>
      </el-popover>
    </h3>

    <!-- 按钮组，靠右显示 -->
    <div style="display: flex; align-items: center; margin-right: 20px;">
      <el-button type="primary" style="border-radius: 5px 0px 0px 5px;" @click="addType = 1">
        添加标签
      </el-button>
      <el-dropdown placement="bottom" popper-class="custom-dropdown" @visible-change="handleDropdownVisibleChange">
        <el-button type="primary" style="width: 30px; border-radius: 0px 5px 5px 0px; margin-left: 1px;">
          <el-icon :style="{ transform: rotateIcon ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }">
            <ArrowDown />
          </el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="selectLabelGroup">添加标签组</el-dropdown-item>
            <el-dropdown-item @click="openSavebyDialog">另存为标签组</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
  <div v-show="addType === 1" style="margin-top: 14px; margin-bottom: 9px;">
    <div closable
      style="border-radius: 0; border:#d3d3d3 1px solid; max-width: 100%; margin: 0px 15px; display: flex; justify-content: space-between; align-items: center;">
      <!-- 左侧颜色选择器 + 输入框 -->
      <div style="display: flex; align-items: center; margin-left: 5px; flex-shrink: 1; min-width: 0;">
        <el-color-picker v-model="newTag.color" :predefine="predefineColors" size="small" />
        <el-input v-model="newTag.tagName" style="margin-left: 5px; flex-grow: 1; min-width: 0;" />
      </div>
      <!-- 右侧 确定 & 取消 按钮 -->
      <div style="font-size: 12px; margin-right: 10px; flex-shrink: 0; display: flex; white-space: nowrap;">
        <span style="cursor: pointer; margin:0px 10px 0px 10px;" onmouseover="this.style.color='#409EFF';"
          onmouseout="this.style.color='black';" @click.stop="addTag">确定</span>
        <span style="cursor: pointer;" onmouseover="this.style.color='#F56C6C';" onmouseout="this.style.color='black';"
          @click.stop="addType = 0; newTag.color = ''; newTag.tagName = ''">取消</span>
      </div>
    </div>
  </div>
  <div v-show="addType === 2" style="margin-top: 14px; margin-bottom: 9px;">
    <div closable
      style="border-radius: 0; border: #d3d3d3 1px solid; max-width: 100%; margin: 0px 15px; display: flex; justify-content: space-between; align-items: center;">
      <!-- 左侧：el-select -->
      <div style="display: flex; align-items: center; flex-shrink: 1; flex-grow: 1; min-width: 0;">
        <el-select v-model="selectedLabelGroup" placeholder="请选择标签组"
          style="flex-grow: 1; min-width: 169px; max-width: 100%;">
          <el-option v-for="item in labelGroupList" :key="item.groupId" :label="item.groupName" :value="item.groupId" />
        </el-select>
      </div>
      <!-- 右侧：按钮 -->
      <div style="font-size: 12px; margin-left: 5px; flex-shrink: 0; display: flex; white-space: nowrap;">
        <span style="cursor: pointer; margin-right: 10px;" onmouseover="this.style.color='#409EFF';"
          onmouseout="this.style.color='black';" @click.stop="addLabelGroup">确定</span>
        <span style="cursor: pointer; margin-right: 10px;" onmouseover="this.style.color='#F56C6C';"
          onmouseout="this.style.color='black';" @click.stop="addType = 0; selectedLabelGroup = ''">取消</span>
      </div>
    </div>
  </div>
  <el-divider class="!my-1" border-style="dashed" />
  <el-input v-model="filterTagName" style="height: 35px; padding:0px 15px 0px 15px;" placeholder="请输入标签名称"
    :suffix-icon="Search" />
  <el-divider class="!my-1" border-style="dashed" />
  <div v-show="props.selectItem.length !== 0 && tagType === '0'"
    style="overflow-y: auto; width: 100%; height: 100%; flex-grow: 1; box-sizing: border-box;">
    <template v-if="props.taskForm.labelType === '0' && props.taskForm.subLabelType === '1'">
      <el-checkbox-group v-model="selectionTagList">
        <div v-for="(item, index) in filteredSelectItem" :key="item.tagId" style="max-width: 100%; margin: 0px 15px 5px 15px; padding: 6px 10px;
           display: flex; align-items: center;
           border: 1px solid #ddd; border-radius: 4px; background-color: #fff;
           cursor: pointer; transition: background 0.3s ease;" @mouseover="hoveredItem = index"
          @mouseleave="hoveredItem = -1" @click="handleClick(-1, item.tagId)"
          :style="{ backgroundColor: lockedItem === item.tagId || selectionTagList.includes(item.tagId) ? '#EAEEFE' : ((hoveredItem === index || props.selection === item.tagId) ? '#EAEEFE' : '#fff') }">
          <!-- ✅ 左边：el-checkbox 标签显示内容  -->
          <el-checkbox :value="item.tagId" @click.stop style="height: 24px;">
            <div style="display: flex; align-items: center; flex-grow: 1; overflow: hidden;">
              <template v-if="editedItem === item.tagId">
                <el-color-picker v-model="updateColor" :predefine="predefineColors" size="small" />
                <el-input v-model="updateName" style="margin-left: 5px; margin-right: 5px;" />
              </template>
              <template v-else>
                <View v-show="!hidedTags.includes(item.tagId) && props.taskForm.labelType !== '0'"
                  style="width: 18px; height: 18px; cursor: pointer; color: #606266; margin-right: 8px;"
                  @click.stop="hideShapebyTagId(item.tagId)" />
                <Hide v-show="hidedTags.includes(item.tagId) && props.taskForm.labelType !== '0'"
                  style="width: 18px; height: 18px; cursor: pointer; color: #606266; margin-right: 8px;"
                  @click.stop="unHideShapebyTagId(item.tagId)" />
                <div
                  :style="{ width: '15px', height: '15px', backgroundColor: item.color, marginRight: '10px', marginLeft: '3px' }">
                </div>
                <el-tooltip :content="item.tagName" placement="top" effect="light"
                  :disabled="!overflowTagNames.has(item.tagName)">
                  <span :title="item.tagName"
                    style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width:90px;">
                    {{ item.tagName }}
                  </span>
                  <!-- <span @mouseenter="onMouseEnterTagName($event, item.tagName)"
                    @mouseleave="onMouseLeaveTagNme(item.tagName)"
                    style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width:90px;">
                    {{ item.tagName }}
                  </span> -->
                </el-tooltip>
              </template>
            </div>
          </el-checkbox>
          <!-- ✅ 右侧操作区域（照常） -->
          <div style="display: flex; align-items: center; justify-content: flex-end; margin-left: auto; width:100px;">
            <template v-if="editedItem === item.tagId">
              <span
                style="white-space: nowrap; display: inline-block; margin-right: 10px; font-size: 12px; cursor: pointer;"
                onmouseover="this.style.color='#409EFF';" onmouseout="this.style.color='black';"
                @click.stop="updateItem(item.tagId)">确定</span>
              <span style="white-space: nowrap; display: inline-block; font-size: 12px; cursor: pointer;"
                onmouseover="this.style.color='#F56C6C';" onmouseout="this.style.color='black';"
                @click.stop="editedItem = ''">取消</span>
            </template>
            <template v-else-if="lockedItem === item.tagId">
              <el-tooltip class="item" effect="light" content="锁定" placement="top" :hide-after="0">
                <Lock style="width: 16px; height: 16px; cursor: pointer; color: #2E5CF6;"
                  @click.stop="lockedItem = '';" />
              </el-tooltip>
            </template>
            <template v-else-if="hoveredItem === index">
              <div style="display: flex;">
                <el-tooltip class="item" effect="light" content="修订" placement="top" :hide-after="0">
                  <Edit style="width: 16px; height: 16px; cursor: pointer; color: #606266; margin-right: 8px;"
                    @click.stop="editedItem = item.tagId; updateColor = item.color; updateName = item.tagName" />
                </el-tooltip>
                <template v-if="props.taskForm.labelType !== '0' || props.taskForm.subLabelType !== '1'">
                  <el-tooltip class="item" effect="light" content="锁定" placement="top" :hide-after="0">
                    <Unlock style="width: 16px; height: 16px; cursor: pointer; color: #606266; margin-right: 8px;"
                      @click.stop="lockItem(index, item.tagId)" />
                  </el-tooltip>
                </template>
                <el-tooltip class="item" effect="light" content="置顶" placement="top" :hide-after="0">
                  <Top style="width: 16px; height: 16px; cursor: pointer; color: #606266; margin-right: 8px;"
                    @click.stop="pintoTop(index)" />
                </el-tooltip>
                <el-tooltip class="item" effect="light" content="删除" placement="top" :hide-after="0">
                  <Delete style="width: 16px; height: 16px; cursor: pointer; color: #F56C6C;"
                    @click.stop="deleteItem(item.tagId)" />
                </el-tooltip>
              </div>
            </template>
            <template v-else>
              <span style="color: #999; font-size: 14px;">
                {{ index < 9 ? '快捷键：' + (index + 1) : '' }} </span>
            </template>
          </div>
        </div>
      </el-checkbox-group>

    </template>
    <template v-else>
      <div v-for="(item, index) in filteredSelectItem" :key="item.tagId" style="max-width: 100%; margin: 0px 15px 5px 15px; padding: 6px 10px 6px 10px;
               display: flex; justify-content: space-between; align-items: center;
               border: 1px solid #ddd; border-radius: 4px; background-color: #fff;
               cursor: pointer; transition: background 0.3s ease;" @mouseover="hoveredItem = index"
        @mouseleave="hoveredItem = -1" @click="handleClick(-1, item.tagId)"
        :style="{ backgroundColor: lockedItem === item.tagId ? '#EAEEFE' : ((hoveredItem === index || props.selection === item.tagId) ? '#EAEEFE' : '#fff') }">
        <!-- 左侧内容（颜色方块 + 标签 或 编辑模式） -->
        <div style="display: flex; align-items: center; flex-grow: 1; overflow: hidden;">
          <template v-if="editedItem === item.tagId">
            <el-color-picker v-model="updateColor" :predefine="predefineColors" size="small" />
            <el-input v-model="updateName" style="margin-left: 5px; margin-right: 5px;" />
          </template>
          <template v-else>
            <View v-show="!hidedTags.includes(item.tagId) && props.taskForm.labelType !== '0'"
              style="width: 18px; height: 18px; cursor: pointer; color: #606266; margin-right: 8px;"
              @click="hideShapebyTagId(item.tagId)" />
            <Hide v-show="hidedTags.includes(item.tagId) && props.taskForm.labelType !== '0'"
              style="width: 18px; height: 18px; cursor: pointer; color: #606266; margin-right: 8px;"
              @click="unHideShapebyTagId(item.tagId)" />
            <div
              :style="{ width: '15px', height: '15px', backgroundColor: item.color, marginRight: '10px', marginLeft: '3px' }">
            </div>
            <el-tooltip :content="item.tagName" placement="left" effect="light"
              :disabled="!overflowTagNames.has(item.tagName)">
              <span :title="item.tagName"
                style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width:90px;">
                {{ item.tagName }}
              </span>
            </el-tooltip>
          </template>
        </div>
        <!-- 右侧操作区 -->
        <div style="display: flex; align-items: center; justify-content: flex-end; margin-left: auto; width:100px;">
          <template v-if="editedItem === item.tagId">
            <span
              style="white-space: nowrap; display: inline-block; margin-right: 10px; font-size: 12px; cursor: pointer;"
              onmouseover="this.style.color='#409EFF';" onmouseout="this.style.color='black';"
              @click.stop="updateItem(item.tagId)">确定</span>
            <span style="white-space: nowrap; display: inline-block; font-size: 12px; cursor: pointer;"
              onmouseover="this.style.color='#F56C6C';" onmouseout="this.style.color='black';"
              @click.stop="editedItem = ''">取消</span>
          </template>
          <template v-else-if="lockedItem === item.tagId">
            <el-tooltip class="item" effect="light" content="锁定" placement="top" :hide-after="0">
              <Lock style="width: 16px; height: 16px; cursor: pointer; color: #2E5CF6;"
                @click.stop="lockedItem = '';" />
            </el-tooltip>
          </template>
          <template v-else-if="hoveredItem === index">
            <div style="display: flex;">
              <el-tooltip class="item" effect="light" content="修订" placement="top" :hide-after="0">
                <Edit style="width: 16px; height: 16px; cursor: pointer; color: #606266; margin-right: 8px;"
                  @click.stop="editedItem = item.tagId; updateColor = item.color; updateName = item.tagName" />
              </el-tooltip>
              <template v-if="props.taskForm.labelType !== '0' || props.taskForm.subLabelType !== '1'">
                <el-tooltip class="item" effect="light" content="锁定" placement="top" :hide-after="0">
                  <Unlock style="width: 16px; height: 16px; cursor: pointer; color: #606266; margin-right: 8px;"
                    @click.stop="lockItem(index, item.tagId)" />
                </el-tooltip>
              </template>
              <el-tooltip class="item" effect="light" content="置顶" placement="top" :hide-after="0">
                <Top style="width: 16px; height: 16px; cursor: pointer; color: #606266; margin-right: 8px;"
                  @click.stop="pintoTop(index)" />
              </el-tooltip>
              <el-tooltip class="item" effect="light" content="删除" placement="top" :hide-after="0">
                <Delete style="width: 16px; height: 16px; cursor: pointer; color: #F56C6C;"
                  @click.stop="deleteItem(item.tagId)" />
              </el-tooltip>
            </div>
          </template>
          <template v-else>
            <span style="color: #999; font-size: 14px;">
              {{ index < 9 ? '快捷键：' + (index + 1) : '' }} </span>
          </template>
        </div>
      </div>
    </template>
  </div>
  <div v-show="props.referSelectItem.length !== 0 && tagType === '1'"
    style="overflow-y: auto; width: 100%; height: 100%; flex-grow: 1; box-sizing: border-box;">
    <div v-for="(item, index) in filteredSelectItem" :key="item.tagId" style="max-width: 100%; margin: 0px 15px 5px 15px; padding: 6px 10px 6px 10px;
               display: flex; justify-content: space-between; align-items: center;
               border: 1px solid #ddd; border-radius: 4px; background-color: #E9E6E6;
               transition: background 0.3s ease;">
      <!-- 左侧内容（颜色方块 + 标签 或 编辑模式） -->
      <div style="display: flex; align-items: center; flex-grow: 1; overflow: hidden;">
        <div
          :style="{ width: '15px', height: '15px', backgroundColor: item.color, marginRight: '10px', marginLeft: '3px' }">
        </div>
        <el-tooltip :content="item.tagName" placement="top" effect="light"
          :disabled="!overflowTagNames.has(item.tagName)">
          <span :title="item.tagName"
            style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width:130px;">
            {{ item.tagName }}
          </span>
          <!-- <span @mouseenter="onMouseEnterTagName($event, item.tagName)" @mouseleave="onMouseLeaveTagNme(item.tagName)"
            style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width:130px;">
            {{ item.tagName }}
          </span> -->
        </el-tooltip>
      </div>
      <!-- 右侧操作区 -->
      <div style="display: flex; align-items: center; justify-content: flex-end; margin-left: auto; width:100px;">
        <span style="color: #999; font-size: 14px;">
          参考标签 </span>
      </div>
    </div>
  </div>
  <el-empty
    v-show="(props.selectItem.length === 0 && tagType === '0') || (props.referSelectItem.length === 0 && tagType === '1')"
    class="mx-0 my-auto" :image-size="150">
    <template #description>
      <span>
        没有搜索到标签
      </span>
    </template>
  </el-empty>
  <!-- <div style="margin-top: auto; margin-top: auto; margin-bottom: 20px;">
    <el-button type="primary" @click="openSavebyDialog">另存为标签组</el-button>
  </div> -->
  <SaveAsLabelGroup ref="saveAsLabelGroupRef" @close="closeSaveAs" />
</template>

<script setup lang="tsx">
import { ref, defineExpose, onMounted } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { ElInput } from "element-plus";
import { useMessage, useMessageBox } from '/@/hooks/message';
import { getList, getObj } from '/@/api/annotate/label-group';
import { addObj, putTagObj } from '/@/api/annotate/tag';
import { putTaskObj, getTaskObj } from '/@/api/annotate/annotation-task';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const SaveAsLabelGroup = defineAsyncComponent(() => import('../labelgroup/saveAsLabelGroup.vue'));

// Emit事件，父组件通过事件与子组件交互
const emit = defineEmits(['changeCheck', 'deleteItem', 'refreshCanvas', 'changeSelectTagList', 'refreshTask']);

// 定义组件的props
const props = defineProps({
  taskForm: {
    type: Object,
    default: () => ({
      taskId: '',
      taskName: '',
      datasetId: '',
      baseDatasetId: '',
      labelType: '',
      subLabelType: '',
      tagIds: '',
      groupId: '',
      groupName: ''
    }),
  },
  selectItem: {
    type: Array as PropType<Tag[]>,
    default: () => [] as Tag[],
  },
  instance: {
    type: Object,
    default: () => ({}),
  },
  resultMessage: {
    type: Array as PropType<Option[]>,
    default: () => [] as Option[],
  },
  referSelectItem: {
    type: Array as PropType<Tag[]>,
    default: () => [] as Tag[],
  },
  selection: {
    type: String,
    default: '0',
  },
  showTypeIcon: {
    type: Boolean,
    default: false,
  },
});
const hoveredItem = ref(-1); // 用于跟踪鼠标悬停的索引
const editedItem = ref(''); // 用于记录正在编辑标签的索引
const lockedItem = ref(''); // 用于记录锁定标签的索引
const hidedTags = ref<String[]>([]);
const predefineColors = ref([
  '#ff4500',
  '#ff8c00',
  '#5D00FF',
  '#90EE98',
  '#00ced1',
  '#1e90ff',
  '#c71585',
])
const newTag = ref({
  taskId: '',
  tagId: '',
  groupId: '',
  tagName: '',
  color: ''
})
interface LabelGroupItem {
  groupId: string;
  groupName: string;
}
interface EncodedMsg {
  encodedData: string;
  startX: number;
  startY: number;
}
interface MaskMsg {
  encodePixelData: string;
  startPoint: number;
  width: number;
  height: number;
}
interface Option {
  uuid?: string;
  index?: number;
  label?: string;
  tagId: string;
  labelFillStyle?: string;
  strokeStyle?: string;
  textFillStyle?: string;
  fillStyle?: string;
  coor?: [number, number][] | [number, number] | number[] | EncodedMsg | EncodedMsg[] | MaskMsg;
  boundingRect?: [number, number, number, number];
  lineWidth?: number | number[];
  brushWidth?: number;
  iseraser?: boolean;
  type: number;
  radius?: number;
  active?: boolean;
  creating?: boolean;
  dragging?: boolean;
  hiddening?: boolean;
  locking?: boolean;
  remark?: string;
}
const labelGroupList = ref<LabelGroupItem[]>([]);
const selectedLabelGroup = ref('');
const addType = ref(0);
// 存储图标的旋转状态
const rotateIcon = ref(false);
interface Tag {
  tagId: string;
  tagName: string;
  color: string;
}

const selection = ref('0');
const selectionTagList = ref<string[]>([]);
const tagType = ref('0'); // true:标注标签，false:参考标签

const saveAsLabelGroupRef = ref();
// 当 dropdown 显示/隐藏时触发
const handleDropdownVisibleChange = (visible: boolean) => {
  rotateIcon.value = visible;
};
const pintoTop = (index: number) => {
  [props.selectItem[0], props.selectItem[index]] = [props.selectItem[index], props.selectItem[0]];
};
const selectLabelGroup = async () => {
  await getList().then((res) => {
    labelGroupList.value = res.data;
  }).catch((err) => {
    useMessage().error(err.msg);
  }).finally(() => {
    addType.value = 2;
  });
};
const addTag = async () => {
  if (newTag.value.tagName && newTag.value.color) {
    // 先判断是否有重名的
    if (props.selectItem.some(item => item.tagName.toLowerCase() === newTag.value.tagName.toLowerCase())) {
      useMessage().wraning('已存在同名标签项，无法新增！！！');
      return;
    }
    // 再新增Tag并获取tagId
    let status = false;
    newTag.value.tagId = '';
    newTag.value.taskId = props.taskForm.taskId;
    await addObj(newTag.value).then((res) => {
      newTag.value.tagId = res.data;
      status = true;
    }).catch((err) => {
      useMessage().error(err.msg);
    });
    if (status) {
      // 同步更新labeltask的tagIds
      let tagIdsJson = JSON.parse(props.taskForm.tagIds);
      tagIdsJson.push(newTag.value.tagId);
      props.selectItem.push({
        tagId: newTag.value.tagId,
        tagName: newTag.value.tagName,
        color: newTag.value.color
      });
      props.taskForm.tagIds = JSON.stringify(tagIdsJson);
      await updateTagIds(0);
      addType.value = 0;
      newTag.value.color = '';
      newTag.value.tagName = '';
    }
  } else {
    useMessage().wraning('请输入要添加的标签名称和颜色！！！');
  }
};
function hasSameTagName(array1: Tag[], array2: Tag[]): boolean {
  // 创建一个 Set 来存储 array1 中的 tagName
  const tagNames1 = new Set(array1.map(item => item.tagName));

  // 使用 some 来判断 array2 是否有相同的 tagName
  return array2.some(item => tagNames1.has(item.tagName));
}
const addLabelGroup = async () => {
  if (selectedLabelGroup.value) {
    // let tagIdsJson = JSON.parse(props.taskForm.tagIds);
    await getObj(selectedLabelGroup.value).then((res) => {
      if (hasSameTagName(res.data.tagList, props.selectItem)) {
        useMessage().wraning("已存在相同名称的标签，无法添加！！！");
        return;
      }
      // 同步更新labeltask的tagIds
      props.taskForm.groupId = selectedLabelGroup.value;
      updateTagIds(1);
      addType.value = 0;
      props.taskForm.groupId = '';
      selectedLabelGroup.value = '';
    }).catch((err) => {
      useMessage().error(err.msg);
    });
  }
};
const filterTagName = ref('');
const filteredSelectItem = computed(() => {
  const searchValue = filterTagName.value.trim();
  if (searchValue === '') {
    // 如果搜索条件为空，返回全部数据
    if (tagType.value === '0') {
      return props.selectItem;
    } else {
      return props.referSelectItem;
    }
  } else {
    // 根据名称进行模糊匹配
    if (tagType.value === '0') {
      return props.selectItem.filter((item) =>
        item.tagName.includes(searchValue)
      );
    } else {
      return props.referSelectItem.filter((item) =>
        item.tagName.includes(searchValue)
      );
    }
  }
});
const overflowTagNames = ref(new Set<string>());
const onMouseEnterTagName = (event: MouseEvent, tagName: string) => {
  const target = event.target as HTMLElement;
  if (target.scrollWidth > target.clientWidth) {
    overflowTagNames.value.add(tagName);
  }
}
const onMouseLeaveTagNme = (tagName: string) => {
  overflowTagNames.value.delete(tagName);
}
const updateTagIds = async (type: number) => {
  try {
    const res = await putTaskObj(props.taskForm);
    if (res.data) {
      useMessage().success("修改标签成功");
      if (type === 1) {
        // 添加标签组情况，需要更新任务TagList
        const res = await getTaskObj(props.taskForm.taskId);
        if (res) {
          // 刷新标签列表
          props.selectItem.length = 0;
          if (res.data.tagList && res.data.tagList.length > 0) {
            res.data.tagList.forEach((tag: Tag) => {
              props.selectItem.push({
                tagId: tag.tagId,
                tagName: tag.tagName,
                color: tag.color
              });
            });
          }
        }
      }
    }
  } catch (err: any) {
    useMessage().error(err.msg || '标签更新失败');
  }
};

const lockItem = (index: number, value: string) => {
  lockedItem.value = value;
  selection.value = value;
  emit('changeCheck', index, value);
}

const updateColor = ref('');
const updateName = ref('');
const updateItem = async (value: string) => {
  // 判断是否为空
  if (updateColor.value === null || updateName.value === '') {
    useMessage().wraning('请输入和选择要修改的标签名称和颜色！！！');
    return;
  }
  // 判断是否有重名的
  if (props.selectItem.some(item => item.tagName.toLowerCase() === updateName.value) && props.selectItem.some(item => item.color === updateColor.value)) {
    useMessage().wraning('已存在同名同颜色的标签项，无法修改！！！');
    return;
  }
  try {
    // 弹窗确认
    await useMessageBox().confirm("确认修改该标签，所有已标注的图片都会被修改");
    let index = props.selectItem.findIndex((item: Tag) => item.tagId === value);
    if (index > -1) {
      props.selectItem[index].tagName = updateName.value;
      props.selectItem[index].color = updateColor.value;
      // 修改labelTag表
      await putTagObj({ taskId: props.taskForm.taskId, labelType: props.taskForm.labelType, tagId: value, tagName: updateName.value, color: updateColor.value });
      useMessage().success(t('labelGroup.updateLabelGroupSuccess'));
    }
    emit('refreshCanvas');
    selection.value = '0';
  } catch {
    return;
  } finally {
    editedItem.value = '';
  }
};

const handleClick = (index: number, value: string) => {
  if (props.taskForm.labelType === '0' && props.taskForm.subLabelType === '1') {
    if (selectionTagList.value.includes(value)) {
      selectionTagList.value = selectionTagList.value.filter((item: string) => item !== value);
    } else {
      selectionTagList.value.push(value);
    }
    return;
  }
  if (editedItem.value) {
    if (editedItem.value === value) {
      return;
    } else {
      useMessage().wraning('请先完成当前编辑项！！！');
      return;
    }
  }
  emit('changeCheck', index, value);
};

const setSelectionList = (value: string[]) => {
  selectionTagList.value = [...value];

  nextTick(() => {
    // 此处 DOM 已更新，你可以安全执行依赖 DOM 状态的逻辑
    console.log('Checkbox 视图已更新');
  });
};

const deleteItem = async (value: string) => {
  emit('deleteItem', value);
}

const openSavebyDialog = () => {
  if (props.selectItem.length === 0) {
    useMessage().wraning("暂无标签项需要保存！！！");
    return;
  }
  saveAsLabelGroupRef.value.openDialog(props.selectItem);
};

const closeSaveAs = () => {
  saveAsLabelGroupRef.value.closeSaveAs();
}

const hideShapebyTagId = (tagId: string) => {
  hidedTags.value.push(tagId);
  props.resultMessage.forEach((item: Option) => {
    if (item.tagId === tagId) {
      item.hiddening = true;
    }
  });
  props.instance.update();
};

const unHideShapebyTagId = (tagId: string) => {
  hidedTags.value = hidedTags.value.filter(id => id !== tagId);
  props.resultMessage.forEach((item: Option) => {
    if (item.tagId === tagId) {
      item.hiddening = false;
    }
  });
  props.instance.update();
};

watch(selectionTagList, (newVal) => {
  if (props.taskForm.labelType === '0' && props.taskForm.subLabelType === '1') {
    emit('changeSelectTagList', newVal);
  }
}, { deep: true });

// 生命周期函数，在组件挂载时执行
onMounted(() => {
  console.log('tabBarArea mounted', props.taskForm);
});

// 暴露方法给父组件调用
defineExpose({
  lockedItem, editedItem, hidedTags, setSelectionList
});
</script>

<style scoped></style>
