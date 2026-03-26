<template>
  <div
    style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; margin-bottom: 5px; width: 100%; padding: 0 20px;">
    <div style="display: flex; align-items: center; gap: 10px;">
      <h3 style="font-size: 18px; user-select: none; margin: 0;">
        <span>{{ tagType === '0' ? '已保存标注标签' : '已保存参考标签' }}</span>
        <el-popover placement="bottom" :width="150" trigger="hover">
          <template #reference>
            <el-icon v-show="props.showTypeIcon">
              <CaretBottom class="cursor-pointer" />
            </el-icon>
          </template>
          <el-radio-group v-model="tagType">
            <el-radio value="0" size="large">已保存标注标签</el-radio>
            <el-radio value="1" size="large">已保存参考标签</el-radio>
          </el-radio-group>
        </el-popover>
      </h3>
    </div>
  </div>
  <el-divider class="!my-1" border-style="dashed" />
  <div v-show="props.resultMessage.length !== 0 && tagType === '0'"
    style="overflow-y: auto; width: 100%; height: 100%; flex-grow: 1; box-sizing: border-box;" ref="yscrollContainer">
    <div v-for="(item, index) in props.resultMessage" :key="index" style="max-width: 100%; margin: 0px 15px 5px 15px; padding: 6px 10px 6px 10px;
               display: flex; justify-content: space-between; align-items: center;
               border: 1px solid #ddd; border-radius: 4px; background-color: rgba(255, 255, 255, 0.5);
               cursor: pointer; transition: background 0.3s ease;">
      <!-- 左侧内容（颜色方块 + 标签 或 编辑模式） -->
      <div style="display: flex; align-items: center; flex-grow: 1; overflow: hidden;">
        <div
          :style="{ width: '15px', height: '15px', backgroundColor: props.selectItem.find(tagItem => tagItem.tagId === item)?.color, marginRight: '10px', marginLeft: '3px' }">
        </div>
        <span>{{props.selectItem.find(tagItem => tagItem.tagId === item)?.tagName}}</span>
      </div>
    </div>
  </div>
  <div v-show="props.referResultMessage.length !== 0 && tagType === '1'"
    style="overflow-y: auto; width: 100%; height: 100%; flex-grow: 1; box-sizing: border-box;" ref="yscrollContainer">
    <div v-for="(item, index) in props.referResultMessage" :key="index"
      style="max-width: 100%; margin: 0px 15px 5px 15px; padding: 6px 10px 6px 10px;
               display: flex; justify-content: space-between; align-items: center;
               border: 1px solid #ddd; border-radius: 4px; background-color: #E9E6E6; transition: background 0.3s ease;">
      <!-- 左侧内容（颜色方块 + 标签 或 编辑模式） -->
      <div style="display: flex; align-items: center; flex-grow: 1; overflow: hidden;">
        <div
          :style="{ width: '15px', height: '15px', backgroundColor: props.referSelectItem.find(tagItem => tagItem.tagId === item)?.color, marginRight: '10px', marginLeft: '3px' }">
        </div>
        <span>{{props.referSelectItem.find(tagItem => tagItem.tagId === item)?.tagName}}</span>
      </div>
      <div style="display: flex; align-items: center; justify-content: flex-end; margin-left: auto; width:100px;">
        <span style="color: #999; font-size: 14px;">
          参考标签 </span>
      </div>
    </div>
  </div>
  <el-empty
    v-show="(props.resultMessage.length === 0 && tagType === '0') || (props.referResultMessage.length === 0 && tagType === '1')"
    class="mx-0 my-auto" :image-size="150">
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
  referSelectItem: {
    type: Array as PropType<Tag[]>,
    default: () => [] as Tag[],
  },
  resultMessage: {
    type: Array as PropType<string[]>,
    default: () => [] as string[],
  },
  referResultMessage: {
    type: Array as PropType<string[]>,
    default: () => [] as string[],
  },
  showTypeIcon: {
    type: Boolean,
    default: false,
  },
});

interface Tag {
  tagId: string;
  tagName: string;
  color: string;
}

const tagType = ref('0'); // true:标注标签，false:参考标签


// 生命周期函数，在组件挂载时执行
onMounted(() => {
  console.log('classifyBarArea mounted');
  console.log(props.resultMessage);
});

// 暴露方法给父组件调用
defineExpose({

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
