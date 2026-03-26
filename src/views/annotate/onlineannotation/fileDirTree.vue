<template>
  <!-- 上部分内容 -->
  <div :class="['filter-container', { 'collapsed': isCollapsed }]" :style="{ width: props.width }">
    <!-- 展开时显示树形结构和输入框 -->
    <div v-show="!isCollapsed">
      <el-input v-model="searchLabel" suffix-icon="search" class="filter-input" :placeholder="props.placeholder" />
      <el-tree ref="filedirTreeRef" class="filter-tree" node-key="id" :data="props.fileTreeData"
        :props="props.defaultProps" default-expand-all :filter-node-method="filterNode" @node-click="handleNodeClick"
        :render-content="renderContent" :highlight-current="true" />
    </div>

    <div v-show="isShrink">
      <!-- 收缩时只显示选中的bucketName -->
      <div v-show="isCollapsed" class="collapsed-content">
        <span>{{ selectedFileName || '全部' }}</span>
      </div>

      <!-- 控制收缩与展开的图标 -->
      <el-icon class="collapse-icon" @click="toggleCollapse">
        <CaretTop v-if="!isCollapsed" class="cursor-pointer" />
        <CaretBottom v-else class="cursor-pointer" />
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="tsx">
import { ref, defineExpose, onMounted } from 'vue';
import { Folder, FolderOpened } from '@element-plus/icons-vue';
import { ElInput, ElTree } from "element-plus";

// Emit事件，父组件通过事件与子组件交互
const emit = defineEmits(['search', 'nodeClick']);

// 定义组件的props
const props = defineProps({
  defaultProps: {
    type: Object,
    default: () => ({
      label: 'label',
      children: 'children',
      value: 'id',
    }),
  },
  fileTreeData: {
    type: Array,
    default: () => [],
  },

  baseDatasetName: {
    type: String,
    default: '',
  },

  placeholder: {
    type: String,
    default: '',
  },

  collapsed: {
    type: Boolean,
    default: true,
  },

  isShrink: {
    type: Boolean,
    default: true,
  },


  width: {
    type: String,
    default: 'auto',  // 默认宽度为 auto
  },
});

const filedirTreeRef = ref();

// 树形结构的数据接口定义
interface Tree {
  id: string;
  label: string;
  parentId: string | null;
  children?: Tree[]; // 子节点
}

// 组件的状态
const searchLabel = ref('');  // 搜索框的绑定值
const isCollapsed = ref(true);  // 控制树形结构是否展开
const selectedFileName = ref('');  // 当前选中的文件或目录名称

// 切换展开或收缩
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

watch(searchLabel, (val) => {
  filedirTreeRef.value!.filter(val)
})

// 根据输入框中的搜索文本，过滤树节点
const filterNode = (value: string, data: Tree) => {
  return !value || data.label.includes(value);
};

// 处理树节点点击事件
const handleNodeClick = async (nodeData: Tree) => {
  emit('nodeClick', nodeData); // 触发父组件的事件
  selectedFileName.value = nodeData.label;  // 设置当前选中的文件夹名称
  selectedFileName.value = nodeData.id.replace('dataset/' + props.baseDatasetName + '/base', "");
};

// 渲染树节点内容的自定义方法
const renderContent = (h: typeof import('vue').h, { data }: { data: any }) => {
  const iconType = data.children && data.children.length > 0 ? FolderOpened : Folder;  // 根据是否有子节点显示不同的图标
  return h('span', [
    h(iconType, { class: 'el-icon', style: 'margin-right: 5px; font-size: 16px;' }),
    h('span', data.label),  // 显示节点的名称
  ]);
};

const resetTree = () => {
  searchLabel.value = '';
  isCollapsed.value = true;
  selectedFileName.value = '';
};

// 生命周期函数，在组件挂载时执行
onMounted(() => {
  console.log('fileDirTree mounted');
  isCollapsed.value = props.collapsed;
});

// 暴露方法给父组件调用
defineExpose({
  resetTree
});
</script>

<style scoped>
.filter-container {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  overflow: hidden;
  padding: 5px 5px 5px 3px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: width 0.3s ease;
}

.filter-container.collapsed {
  width: 100%;
}

.filter-input {
  width: 100%;
  min-width: 200px;
  margin-bottom: 10px;
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 4px;
}

.filter-tree {
  max-height: 500px;
  margin-bottom: 10px;
  overflow-y: auto;
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 4px;
}

.collapsed-content {
  padding: 5px;
  text-align: center;
  color: #333;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
}

.collapse-icon {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  cursor: pointer;
  font-size: 20px;
  z-index: 100;
}
</style>
