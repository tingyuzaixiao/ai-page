<template>
  <div
    style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; margin-bottom: 5px; width: 100%; padding: 0 20px;">
    <!-- 左侧部分：标题 + 下拉框 -->
    <div style="display: flex; align-items: center; gap: 10px;">
      <h3 style="font-size: 18px; user-select: none; margin: 0;">对象栏</h3>
      <el-select v-model="groupValue" placeholder="" style="width: 100px;">
        <el-option v-for="item in groupOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </div>
    <!-- 右侧按钮 -->
    <div style="display: flex; align-items: center;">
      <el-tooltip class="item" effect="light" content="合并图形" placement="top" :hide-after="0">
        <CopyDocument v-show="props.subLabelType === '2'" class="w-5 h-5 mr-3 cursor-pointer" @click="mergeShapes()" />
      </el-tooltip>
      <el-tooltip class="item" effect="light" :content="hidedStatus ? '全部显示' : '全部隐藏'" placement="top" :hide-after="0">
        <component :is="hidedStatus ? 'Hide' : 'View'" class="w-5 h-5 cursor-pointer"
          @click="hidedStatus ? showShape() : hideShape()" />
      </el-tooltip>
    </div>
  </div>
  <el-divider class="!my-1" border-style="dashed" />
  <div v-show="props.resultMessage.length !== 0 && groupValue === '0'"
    style="overflow-y: auto; width: 100%; height: 100%; flex-grow: 1; box-sizing: border-box;" ref="yscrollContainer">
    <div
      v-for="(item, index) in props.resultMessage.filter(item => !item.creating && !item.iseraser && item.type !== 7)"
      :key="item.uuid" :ref="el => setImageRef(el, index)" style="max-width: 100%; margin: 0px 15px 5px 15px; padding: 6px 10px 6px 10px;
               display: flex; justify-content: space-between; align-items: center;
               border: 1px solid #ddd; border-radius: 4px; background-color: rgba(255, 255, 255, 0.5);
               cursor: pointer; transition: background 0.3s ease;" @mouseover="handleShapeMouse(item, 'over')"
      @mouseleave="handleShapeMouse(item, 'leave')" @click="handleShapeMouse(item, 'click')"
      :style="{ backgroundColor: hoveredItem === item.uuid || clickedItem.includes(item.uuid ?? '') || item.uuid === instance.activeShape.uuid ? hexToRgba(item.strokeStyle || item.fillStyle || '', 0.2) : '#fff' }">
      <!-- 左侧内容（颜色方块 + 标签 或 编辑模式） -->
      <div style="display: flex; align-items: center; flex-grow: 1; overflow: hidden;">
        <!-- 动态绑定图标 -->
        <component :is="props.toolList.find(toolItem => toolItem.type === item.type)?.icon"
          style="width: 16px; height: 16px; margin-right: 8px; cursor: pointer; color: #606266;" />
        <div
          :style="{ width: '15px', height: '15px', backgroundColor: props.selectItem.find(tagItem => tagItem.tagId === item.tagId)?.color, marginRight: '10px', marginLeft: '3px' }">
        </div>
        <el-select v-model="item.tagId" placeholder="选择标签" size="small" style="width: 100px; box-sizing: border-box;"
          @change="changeTagbyUuid(item)" :disabled="lockedShapes.includes(item.uuid ?? '')">
          <el-option v-for="option in props.selectItem" :key="option.tagId" :label="option.tagName"
            :value="option.tagId" />
        </el-select>
      </div>
      <!-- 右侧操作区 -->
      <div style="display: flex; align-items: center; justify-content: flex-end; margin-left: auto;">
        <template v-if="hoveredItem === item.uuid">
          <el-tooltip class="item" effect="light" content="锁定" placement="top" :hide-after="0">
            <Lock v-if="lockedShapes.includes(item.uuid ?? '')"
              style="width: 16px; height: 16px; cursor: pointer; color: #606266; margin-right: 8px;"
              @click.stop="unLockShapebyUuid(item.uuid ?? '')" />
            <Unlock v-else style="width: 16px; height: 16px; cursor: pointer; color: #606266; margin-right: 8px;"
              @click.stop="lockShapebyUuid(item.uuid ?? '')" />
          </el-tooltip>
          <el-tooltip class="item" effect="light" content="隐藏" placement="top" :hide-after="0">
            <Hide v-if="hidedShapes.includes(item.uuid ?? '')"
              style="width: 16px; height: 16px; cursor: pointer; color: #606266; margin-right: 8px;"
              @click.stop="unHideShapebyUuid(item.uuid ?? '')" />
            <View v-else style="width: 16px; height: 16px; cursor: pointer; color: #606266; margin-right: 8px;"
              @click.stop="hideShapebyUuid(item.uuid ?? '')" />
          </el-tooltip>
          <el-tooltip class="item" effect="light" content="删除" placement="top" :hide-after="0">
            <Delete style="width: 16px; height: 16px; cursor: pointer; color: #F56C6C;"
              :class="{ 'is-disabled': lockedShapes.includes(item.uuid ?? '') }"
              @click.stop="props.instance.deleteByIndex(index); emit('updateResultMessage_object', item.uuid, 'delete');" />
          </el-tooltip>
        </template>
        <template v-else>
          <el-tooltip v-if="lockedShapes.includes(item.uuid ?? '')" class="item" effect="light" content="锁定"
            placement="top" :hide-after="0">
            <Lock style="width: 16px; height: 16px; cursor: pointer; color: #606266; margin-right: 8px;"
              @click.stop="unLockShapebyUuid(item.uuid ?? '')" />
          </el-tooltip>
          <span v-else style="width: 16px; height: 16px; cursor: pointer; color: #606266; margin-right: 8px;"></span>
          <el-tooltip v-if="hidedShapes.includes(item.uuid ?? '')" class="item" effect="light" content="隐藏"
            placement="top" :hide-after="0">
            <Hide style="width: 16px; height: 16px; cursor: pointer; color: #606266; margin-right: 8px;"
              @click="unHideShapebyUuid(item.uuid ?? '')" />
          </el-tooltip>
          <span v-else style="width: 16px; height: 16px; cursor: pointer; color: #606266; margin-right: 8px;"></span>
          <span style="width: 16px; height: 16px; cursor: pointer; color: #606266;"></span>
        </template>
      </div>
    </div>
  </div>
  <div v-show="props.resultMessage.length !== 0 && groupValue === '1'"
    style="width: 100%; overflow-y: auto; margin-bottom: 2px;">
    <el-collapse v-model="activeNames">
      <el-collapse-item v-for="tagItem in tagList" :key="tagItem.tagId" :title="tagItem.tagName"
        :name="tagItem.tagName">
        <div
          v-for="(item, index) in resultMessage.filter(item => !item.creating && !item.iseraser && item.type !== 7 && item.tagId === tagItem.tagId)"
          :key="item.uuid" :ref="el => setImageRef(el, index)" style="max-width: 100%; margin: 0px 15px 5px 15px; padding: 6px 10px 6px 10px;
               display: flex; justify-content: space-between; align-items: center;
               border: 1px solid #ddd; border-radius: 4px; background-color: rgba(255, 255, 255, 0.5);
               cursor: pointer; transition: background 0.3s ease;" @mouseover="handleShapeMouse(item, 'over')"
          @mouseleave="handleShapeMouse(item, 'leave')" @click="handleShapeMouse(item, 'click')"
          :style="{ backgroundColor: hoveredItem === item.uuid || clickedItem.includes(item.uuid ?? '') || item.uuid === instance.activeShape.uuid ? hexToRgba(item.strokeStyle || item.fillStyle || '', 0.2) : '#fff' }">
          <!-- 左侧内容（颜色方块 + 标签 或 编辑模式） -->
          <div style="display: flex; align-items: center; flex-grow: 1; overflow: hidden;">
            <!-- 动态绑定图标 -->
            <component :is="props.toolList.find(toolitem => toolitem.type === item.type)?.icon"
              style="width: 16px; height: 16px; margin-right: 8px; cursor: pointer; color: #606266;" />
            <div
              :style="{ width: '15px', height: '15px', backgroundColor: tagList.find(tagitem => tagitem.tagId === item.tagId)?.color, marginRight: '10px', marginLeft: '3px' }">
            </div>
            <el-select v-model="item.tagId" placeholder="Select" size="small"
              style="width: 100px; box-sizing: border-box;" @change="changeTagbyUuid(item)"
              :disabled="lockedShapes.includes(item.uuid ?? '')">
              <el-option v-for="option in props.selectItem" :key="option.tagId" :label="option.tagName"
                :value="option.tagId" />
            </el-select>
          </div>
          <!-- 右侧操作区 -->
          <div style="display: flex; align-items: center; justify-content: flex-end; margin-left: auto;">
            <template v-if="hoveredItem === item.uuid">
              <el-tooltip class="item" effect="light" content="锁定" placement="top" :hide-after="0">
                <Lock v-if="lockedShapes.includes(item.uuid ?? '')"
                  style="width: 16px; height: 16px; cursor: pointer; color: #606266; margin-right: 8px;"
                  @click.stop="unLockShapebyUuid(item.uuid ?? '')" />
                <Unlock v-else style="width: 16px; height: 16px; cursor: pointer; color: #606266; margin-right: 8px;"
                  @click.stop="lockShapebyUuid(item.uuid ?? '')" />
              </el-tooltip>
              <el-tooltip class="item" effect="light" content="隐藏" placement="top" :hide-after="0">
                <Hide v-if="hidedShapes.includes(item.uuid ?? '')"
                  style="width: 16px; height: 16px; cursor: pointer; color: #606266; margin-right: 8px;"
                  @click="unHideShapebyUuid(item.uuid ?? '')" />
                <View v-else v-show="hoveredItem === item.uuid"
                  style="width: 16px; height: 16px; cursor: pointer; color: #606266; margin-right: 8px;"
                  @click.stop="hideShapebyUuid(item.uuid ?? '')" />
              </el-tooltip>
              <el-tooltip class="item" effect="light" content="删除" placement="top" :hide-after="0">
                <Delete style="width: 16px; height: 16px; cursor: pointer; color: #F56C6C;"
                  :class="{ 'is-disabled': lockedShapes.includes(item.uuid ?? '') }"
                  @click.stop="props.instance.deleteByIndex(index); emit('updateResultMessage_object', item.uuid, 'delete');" />
              </el-tooltip>
            </template>
            <template v-else>
              <el-tooltip v-if="lockedShapes.includes(item.uuid ?? '')" class="item" effect="light" content="锁定"
                placement="top" :hide-after="0">
                <Lock style="width: 16px; height: 16px; cursor: pointer; color: #606266; margin-right: 8px;"
                  @click.stop="unLockShapebyUuid(item.uuid ?? '')" />
              </el-tooltip>
              <span v-else
                style="width: 16px; height: 16px; cursor: pointer; color: #606266; margin-right: 8px;"></span>
              <el-tooltip v-if="hidedShapes.includes(item.uuid ?? '')" class="item" effect="light" content="隐藏"
                placement="top" :hide-after="0">
                <Hide style="width: 16px; height: 16px; cursor: pointer; color: #606266; margin-right: 8px;"
                  @click="unHideShapebyUuid(item.uuid ?? '')" />
              </el-tooltip>
              <span v-else
                style="width: 16px; height: 16px; cursor: pointer; color: #606266; margin-right: 8px;"></span>
              <span style="width: 16px; height: 16px; cursor: pointer; color: #606266;"></span>
            </template>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
  <el-empty v-show="resultMessage.length === 0" class="mx-0 my-auto" :image-size="150">
    <template #description>
      <span>
        没有已创建的图形
      </span>
    </template>
  </el-empty>
</template>

<script setup lang="tsx">
import { ref, defineExpose, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMessage, useMessageBox } from '/@/hooks/message';
const { t } = useI18n();

// Emit事件，父组件通过事件与子组件交互
const emit = defineEmits(['changeMode', 'handleShapeMouse', 'brushMerge', 'updateResultMessage_object']);

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
      tagIds: '',
      groupId: '',
      groupName: ''
    }),
  },
  selectItem: {
    type: Array as PropType<Tag[]>,
    default: () => [] as Tag[],
  },
  selection: {
    type: String,
    default: '0',
  },
  taskType: {
    type: Number,
    default: 1,
  },
  subLabelType: {
    type: String,
    default: '0',
  },
  showReference: {
    type: String,
    default: '0',
  },
  resultMessage: {
    type: Array as PropType<Option[]>,
    default: () => [] as Option[],
  },
  instance: {
    type: Object,
    default: () => ({}),
  },
  instance_bgimg: {
    type: Object,
    default: () => ({}),
  },
  controlKeyDown: {
    type: Boolean,
    default: false,
  },
  shiftKeyDown: {
    type: Boolean,
    default: false,
  },
  toolList: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
});

interface Tag {
  tagId: string;
  tagName: string;
  color: string;
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
const tagList = ref<Tag[]>([]); // 标签列表
const hoveredItem = ref(''); // 用于跟踪鼠标悬停的uuid
const clickedItem = ref<String[]>([]); // 用于跟踪点击的uuid
const groupValue = ref('0');
const groupOptions = [
  {
    value: '0',
    label: '默认分组',
  },
  {
    value: '1',
    label: '标签分组',
  },
];
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
const hidedStatus = ref(false);
// 隐藏图形
const hideShape = () => {
  if (props.subLabelType === '2') {
    for (let i = 0; i < props.instance_bgimg.dataset.length; i++) {
      hidedShapes.value.push(props.instance_bgimg.dataset[i].uuid);
      props.instance_bgimg.dataset[i].hiddening = true;
    }
    for (let i = 0; i < props.instance.dataset.length; i++) {
      props.instance.dataset[i].hiddening = true;
    }
    props.instance_bgimg.update();
  } else {
    for (let i = 0; i < props.instance.dataset.length; i++) {
      hidedShapes.value.push(props.instance.dataset[i].uuid);
      props.instance.dataset[i].hiddening = true;
    }
  }
  clickedItem.value.length = 0; // 清空已选中的图形
  props.instance.update();
  hidedStatus.value = true;
}
// 显示图形
const showShape = () => {
  if (props.subLabelType === '2') {
    for (let i = 0; i < props.instance_bgimg.dataset.length; i++) {
      hidedShapes.value.length = 0;
      props.instance_bgimg.dataset[i].hiddening = false;
    }
    for (let i = 0; i < props.instance.dataset.length; i++) {
      props.instance.dataset[i].hiddening = false;
    }
    props.instance_bgimg.update();
  } else {
    for (let i = 0; i < props.instance.dataset.length; i++) {
      hidedShapes.value.length = 0;
      props.instance.dataset[i].hiddening = false;
    }
  }
  props.instance.update();
  hidedStatus.value = false;
}
const mergeShapes = () => {
  emit('brushMerge', clickedItem.value);
};
const resetObjectBar = () => {
  props.resultMessage.forEach((item: Option) => {
    item.active = false;
    item.creating = false;
    item.dragging = false;
    item.hiddening = false;
    item.locking = false;
  });
  hoveredItem.value = '';
  clickedItem.value.length = 0;
  lockedShapes.value.length = 0;
  hidedShapes.value.length = 0;
  hidedStatus.value = false;
  // groupValue.value = '0';
  activeNames.value = ['0'];
};
// 定义一个类型来表示形状字典
interface ShapeDict {
  [key: number]: string; // 使用数字作为键，字符串作为值
}
// 创建一个形状字典对象
const shapesType: ShapeDict = {
  1: "矩形",
  2: "多边形",
  3: "点",
  4: "直线",
  5: "圆形",
  6: "网格",
  7: "刷子",
  8: "掩膜",
  9: "钢笔"
};

// const tagOutputMessage = computed<Option[]>(() => {
//   return options.value.filter(option => value.value.includes(option.value));
// });
const activeNames = ref(['0'])
const lockedShapes = ref<String[]>([]);
const hidedShapes = ref<String[]>([]);
type ShapeEventType = "over" | "leave" | "click";
const handleShapeMouse = (itemMsg: Option, type: ShapeEventType) => {
  if (!itemMsg.uuid) return;
  if (type === 'leave') {
    hoveredItem.value = '';
  } else if (type === 'over') {
    hoveredItem.value = itemMsg.uuid;
  } else if (type === 'click') {
    if (lockedShapes.value.includes(itemMsg.uuid)) {
      useMessage().wraning("标记已被锁定，无法选中和修改！！！");
      return;
    }
    if (props.controlKeyDown) {
      if (clickedItem.value.includes(itemMsg.uuid)) {
        clickedItem.value = clickedItem.value.filter(item => item !== itemMsg.uuid);
      } else {
        clickedItem.value.push(itemMsg.uuid);
      }
    } else {
      clickedItem.value = [itemMsg.uuid];
    }
  }
  emit('handleShapeMouse', itemMsg, type);
};
const changeTagbyUuid = (itemMsg: Option) => {
  if (itemMsg.uuid === '') return;
  const index = props.instance.dataset.findIndex((item: Option) => item.uuid === itemMsg.uuid);
  const tag = props.selectItem.find((item: Tag) => item.tagId === itemMsg.tagId);
  if (props.taskType === 1) {
    props.instance.updateLabelByIndex([index], tag?.tagId ?? '', tag?.tagName ?? '', tag?.color ?? '', ['label', 'tagId', 'strokeStyle', 'textFillStyle']);
  } else {
    if (props.subLabelType === '2') {
      props.instance.updateLabelByIndex([index], tag?.tagId ?? '', tag?.tagName ?? '', hexToRgba(tag?.color ?? '', 0.8) ?? '' ?? '', ['label', 'tagId', 'strokeStyle', 'fillStyle', 'textFillStyle']);
      emit('updateResultMessage_object', itemMsg.uuid, 'updateTag', tag);
      tagList.value = props.selectItem
        .filter(tag => props.resultMessage.some(msg => msg.tagId === tag.tagId))
        .map(tag => {
          const newTag = { ...tag };
          if (newTag.tagName.length > 15) {
            newTag.tagName = newTag.tagName.substring(0, 15) + '...';
          }
          newTag.color = rgbaToHex(newTag.color);
          return newTag;
        });
    } else {
      props.instance.updateLabelByIndex([index], tag?.tagId ?? '', tag?.tagName ?? '', hexToRgba(tag?.color ?? '', 0.4) ?? '' ?? '', ['label', 'tagId', 'strokeStyle', 'fillStyle', 'textFillStyle']);
    }
  }
  // props.instance.activeFillStyle = hexToRgba(tag?.color ?? '', 0.8) ?? 'transparent';
  // props.instance.activeStrokeStyle = tag?.color ?? '#000000';
  emit('handleShapeMouse', itemMsg, 'click');
};
const lockShapebyUuid = (uuid: string) => {
  if (uuid === '') return;
  lockedShapes.value.push(uuid);
  const shape = props.instance.dataset.find((item: Option) => item.uuid === uuid);
  if (shape) {
    shape.locking = true;
    shape.active = false;
  }
  props.instance.update();
};
const unLockShapebyUuid = (uuid: string) => {
  if (uuid === '') return;
  lockedShapes.value = lockedShapes.value.filter(item => item !== uuid)
  const shape = props.instance.dataset.find((item: Option) => item.uuid === uuid);
  if (shape) {
    shape.locking = false;
  }
};
const hideShapebyUuid = (uuid: string) => {
  if (uuid === '') return;
  hidedShapes.value.push(uuid);
  const shape = props.instance.dataset.find((item: Option) => item.uuid === uuid);
  if (shape) {
    shape.hiddening = true;
    props.instance.update();
  }
  clickedItem.value.splice(clickedItem.value.indexOf(uuid), 1);
  hidedStatus.value = hidedShapes.value.length === props.resultMessage.length;
  emit('updateResultMessage_object', uuid, 'hide');
};
const unHideShapebyUuid = (uuid: string) => {
  if (uuid === '') return;
  hidedShapes.value = hidedShapes.value.filter(item => item !== uuid)
  const shape = props.instance.dataset.find((item: Option) => item.uuid === uuid);
  if (shape) {
    shape.hiddening = false;
    hidedStatus.value = false;
    props.instance.update();
  }
  emit('updateResultMessage_object', uuid, 'unhide');
};
const changeSelectShape = (uuid: string) => {
  if (uuid === '') {
    clickedItem.value.length = 0;
  } else {
    clickedItem.value.push(uuid);
    const index = props.instance.dataset.findIndex((item: Option) => item.uuid === uuid);
    scrollToDiv(index);
  }
};
const yscrollContainer: Ref<HTMLElement | null> = ref(null);
const imageRefs = ref<(Element | HTMLElement | null)[]>([]);
const setImageRef = (el: Element | HTMLElement | ComponentPublicInstance | null, index: number) => {
  if (el instanceof HTMLElement) {
    imageRefs.value[index] = el;
  }
};
const scrollToDiv = (index: number) => {
  const container = yscrollContainer.value; // 获取滚动容器
  const imageElement = imageRefs.value[index]; // 获取点击的目标元素

  if (container && imageElement && imageElement instanceof HTMLElement) {
    const containerHeight = container.clientHeight; // 获取容器的高度
    const elementHeight = imageElement.clientHeight; // 获取目标元素的高度

    // 使用 getBoundingClientRect 获取目标元素相对于视口的位置
    const elementRect = imageElement.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // 计算目标元素的上下边界与容器的上下边界的关系
    const elementTopInContainer = elementRect.top - containerRect.top;
    const elementBottomInContainer = elementTopInContainer + elementHeight;

    // 检查目标元素是否完全可见
    const isElementVisible = elementTopInContainer >= 0 && elementBottomInContainer <= container.clientHeight;

    // 如果元素不可见，则滚动到该元素的中间
    if (!isElementVisible) {
      const scrollPosition = elementRect.top - containerRect.top - (containerHeight / 2) + (elementHeight / 2);

      // 执行平滑滚动到目标位置
      container.scrollTo({
        top: scrollPosition,
        behavior: 'smooth',
      });
    }
  } else {
    console.error("Failed to find container or element.");
  }
};
watch(
  () => props.resultMessage,
  (newVal) => {
    if (newVal.length > 0) {
      // 创建一个 Set 方便快速判断 hidedShapes
      const hidedSet = new Set(hidedShapes.value);

      // 先处理 tagList
      tagList.value = props.selectItem
        .filter(tag => newVal.some(msg => msg.tagId === tag.tagId))
        .map(tag => {
          const newTag = { ...tag };
          if (newTag.tagName.length > 15) {
            newTag.tagName = newTag.tagName.substring(0, 15) + '...';
          }
          newTag.color = rgbaToHex(newTag.color);
          return newTag;
        });

      // 处理 hidedShapes：收集所有需要隐藏的 uuid
      const newHided = new Set(hidedShapes.value);
      newVal.forEach(item => {
        const uuid = item.uuid ?? '';
        if (item.hiddening && !newHided.has(uuid)) {
          newHided.add(uuid);
        } else if (!item.hiddening && newHided.has(uuid)) {
          newHided.delete(uuid);
        }
      });
      // 用数组替换响应式数组，触发响应更稳定
      hidedShapes.value = Array.from(newHided);

      // 设置 hidedStatus
      hidedStatus.value = hidedShapes.value.length === newVal.length;
    } else {
      hidedShapes.value = [];
      lockedShapes.value = [];
    }
  },
  { deep: true }
);

// 生命周期函数，在组件挂载时执行
onMounted(() => {
  console.log('objectBarArea mounted');
});

// 暴露方法给父组件调用
defineExpose({
  lockedShapes, hidedStatus, changeSelectShape, clickedItem, resetObjectBar
});
</script>

<style lang="scss" scoped>
.is-disabled {
  color: #f56c6c;
  cursor: not-allowed !important;
  opacity: 0.5;
  pointer-events: none;
  /* 禁止鼠标事件 */
}
</style>
