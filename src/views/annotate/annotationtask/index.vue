<template>
  <div class="layout-padding" v-loading="tableLoading && { text: tableLoadingText }" element-loading-text="上传中...">
    <div class="layout-padding-auto layout-padding-view" v-show="scene == 0">
      <el-row class="ml10" v-show="showSearch">
        <el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList" ref="queryRef">
          <el-form-item :label="t('annotationTask.taskName')" prop="taskName">
            <el-input :placeholder="t('annotationTask.inputTaskNameTip')" clearable style="max-width: 180px"
              v-model="state.queryForm.taskName" @clear="getDataList" />
          </el-form-item>
          <el-form-item :label="t('annotationTask.labelType')" prop="labelType" style="width: 220px">
            <el-select v-model="state.queryForm.labelType" :placeholder="t('annotationTask.allType')">
              <el-option v-for="item in labelTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
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
      <el-row>
        <div class="mb8 w-full">
          <el-button v-if="route.query.baseDatasetId"
            @click="createTaskRef.openDialog('createbyBaseDataset', { baseDatasetId: state.queryForm.baseDatasetId, baseDatasetName: state.queryForm.baseDatasetName }); scene = 1"
            class="ml10" icon="Plus" type="primary" v-auth="'sys_annotationtask_add'">
            {{ t('annotationTask.addBtn') }}
          </el-button>
          <el-button v-else @click="createTaskRef.openDialog('create'); scene = 1" class="ml10" icon="Plus"
            type="primary" v-auth="'sys_annotationtask_add'">
            {{ t('annotationTask.addBtn') }}
          </el-button>
          <el-button plain :disabled="multiple" @click="handleDelete(selectObjs)" class="ml10" icon="Delete"
            type="primary" v-auth="'sys_annotationtask_del'">
            {{ t('common.delBtn') }}
          </el-button>
          <right-toolbar :export="'sys_annotationtask_export'" @queryTable="getDataList" class="ml10 float-right"
            v-model:showSearch="showSearch"></right-toolbar>
        </div>
      </el-row>
      <el-table class="w-full" :data="state.dataList" v-loading="state.loading" :cell-style="tableStyle?.cellStyle"
        :header-cell-style="tableStyle?.headerCellStyle" :row-class-name="'!bg-tr-header'" :show-header="false"
        default-expand-all>
        <el-table-column type="expand">
          <template #default="props">
            <div class="pt-2 pl-6">
              <!-- 实验信息表格 -->
              <el-table :data="props.row.labelTaskList">
                <el-table-column align="center" type="selection" width="40" />
                <el-table-column :label="t('manage.index')" type="index" width="60" align="center"
                  show-overflow-tooltip />
                <el-table-column :label="t('annotationTask.taskName')" prop="taskName" :min-width="140" align="center"
                  show-overflow-tooltip />
                <!-- <el-table-column :label="t('annotationTask.baseDatasetName')" width="200" align="center"
                  prop="baseDatasetName" show-overflow-tooltip /> -->
                <el-table-column :label="t('annotationTask.labelType')" prop="labelType" align="center"
                  :filter-method="filterTag" :filters="formatLabelType" show-overflow-tooltip>
                  <template v-slot="scope">
                    <!-- <dict-tag :options="model_type" :value="scope.row.labelType"></dict-tag> -->
                    <el-tag v-if="scope.row.labelType === '0'" type="primary">图像分类
                      <span v-for="(item, index) in sub_label_class_type" :key="index">
                        <span v-if="item.value === scope.row.subLabelType">{{ '[' + item.label + ']' }}</span>
                      </span>
                    </el-tag>
                    <el-tag v-else-if="scope.row.labelType === '1'" type="success">物体检测
                      <span v-for="(item, index) in sub_label_detect_type" :key="index">
                        <span v-if="item.value === scope.row.subLabelType">{{ '[' + item.label + ']' }}</span>
                      </span>
                    </el-tag>
                    <el-tag v-else-if="scope.row.labelType === '2'" type="warning">图像分割
                      <span v-for="(item, index) in sub_label_seg_type" :key="index">
                        <span v-if="item.value === scope.row.subLabelType">{{ '[' + item.label + ']' }}</span>
                      </span>
                    </el-tag>
                    <el-tag v-else-if="scope.row.labelType === '3'" type="danger">大模型
                      <span v-for="(item, index) in sub_label_LLM_type" :key="index">
                        <span v-if="item.value === scope.row.subLabelType">{{ '[' + item.label + ']' }}</span>
                      </span>
                    </el-tag>
                    <el-tag v-else type="danger">其它</el-tag>
                  </template>
                </el-table-column>
                <el-table-column :label="t('annotationTask.labelNumber')" align="center" show-overflow-tooltip>
                  <template #default="scope">
                    {{ Array.isArray(JSON.parse(scope.row.tagIds)) ? JSON.parse(scope.row.tagIds).length : 0 }}
                  </template>
                </el-table-column>
                <el-table-column :label="t('annotationTask.progress')" :min-width="100" align="center"
                  show-overflow-tooltip>
                  <template #default="scope">
                    <el-progress v-if="aiLabeling.includes(scope.row.taskId)" :percentage="50" :text-inside="true"
                      :stroke-width="18" color="#FFA700"></el-progress>
                    <el-progress v-else :percentage="calculateProgress(scope.row.labelCount, scope.row.imageCount)"
                      :text-inside="true" :stroke-width="18" color="#2E5CF6"></el-progress>
                  </template>
                </el-table-column>
                <el-table-column :label="t('manage.createTime')" prop="createTime" align="center" show-overflow-tooltip
                  sortable />
                <el-table-column :label="t('manage.updateTime')" prop="updateTime" align="center" show-overflow-tooltip
                  sortable />
                <el-table-column :label="t('common.action')" width="400" align="center">
                  <template #default="scope">
                    <div v-if="aiLabeling.includes(scope.row.taskId)">
                      <el-button icon="Loading" loading @click="useMessage().wraning(t('annotationTask.aiLabeling'))"
                        text v-auth="'sys_annotationtask_config'">{{
                          t('annotationTask.aiAnnotation') }}
                      </el-button>
                      <el-button icon="EditPen" @click="useMessage().wraning(t('annotationTask.aiLabeling'))" text
                        type="primary" v-auth="'sys_annotationtask_config'">{{
                          t('annotationTask.onlineAnnotation') }}
                      </el-button>
                      <el-button icon="Edit" @click="useMessage().wraning(t('annotationTask.aiLabeling'))" text
                        type="primary" v-auth="'sys_annotationtask_edit'">{{
                          t('annotationTask.editBtn') }}
                      </el-button>
                      <el-button icon="download" @click="useMessage().wraning(t('annotationTask.aiLabeling'))" text
                        type="primary" v-auth="'sys_annotationtask_export'">{{
                          t('common.exportBtn') }}
                      </el-button>
                      <el-button icon="delete" @click="useMessage().wraning(t('annotationTask.aiLabeling'))" text
                        type="primary" v-auth="'sys_annotationtask_del'">{{ t('common.delBtn')
                        }}
                      </el-button>
                    </div>
                    <div v-else>
                      <el-button icon="MagicStick" @click="smartLabeling(scope.row)" text type="primary"
                        v-auth="'sys_annotationtask_config'">{{
                          t('annotationTask.aiAnnotation') }}
                      </el-button>
                      <el-button icon="EditPen"
                        @click="datasetAnnotation(scope.row.taskId, props.row.baseDatasetName, scope.row.labelType, scope.row.subLabelType, scope.row.taskName)"
                        text type="primary" v-auth="'sys_annotationtask_config'">{{
                          t('annotationTask.onlineAnnotation') }}
                      </el-button>
                      <el-button icon="Edit" @click="createTaskRef.openDialog('edit', scope.row); scene = 1" text
                        type="primary" v-auth="'sys_annotationtask_edit'">{{ t('annotationTask.editBtn') }}
                      </el-button>
                      <el-button icon="delete" @click="handleDelete([scope.row.taskId])" text type="primary"
                        v-auth="'sys_annotationtask_del'">{{ t('common.delBtn') }}
                      </el-button>
                      <el-button @click="" text type="primary" v-auth="'sys_annotationtask_export'">
                        <el-dropdown>
                          <span class="flex item-center text-primary cursor-pointer">
                            {{ t('home.moreTip') }}
                            <el-icon class="el-icon--right">
                              <arrow-down />
                            </el-icon>
                          </span>
                          <template #dropdown>
                            <el-dropdown-menu>
                              <el-dropdown-item @click="exportLabelTask('JSON', scope.row)">{{
                                t('annotationTask.exportJSON') }}</el-dropdown-item>
                              <el-dropdown-item @click="exportLabelTask('CSV', scope.row)">
                                {{ t('annotationTask.exportCSV') }}
                              </el-dropdown-item>
                              <el-dropdown-item v-if="Number(scope.row.labelType) === 2"
                                @click="exportLabelTask('MASK', scope.row)">
                                {{ t('annotationTask.exportMask') }}
                              </el-dropdown-item>
                            </el-dropdown-menu>
                          </template>
                        </el-dropdown>
                      </el-button>

                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column class-name='!text-left' show-overflow-tooltip sortable>
          <template #default="{ row }">
            <span>{{ row.baseDatasetId }}</span>
            <span class="pl-10">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column class-name='!text-left' show-overflow-tooltip sortable>
          <template #default="{ row }">
            <span>{{ t('annotationTask.baseDataset') }}：{{ row.baseDatasetName }}</span>
            <!-- <span class="pl-10">{{ row.name }}</span> -->

          </template>
        </el-table-column>
        <el-table-column class-name='!text-left' prop="count" show-overflow-tooltip sortable>
          <template #default="{ row }">
            <span>【{{ t('annotationTask.dataCount') }}：{{ row.count }}】</span>
          </template>
        </el-table-column>
        <el-table-column class-name='!text-left' show-overflow-tooltip sortable>
          <template v-slot="scope">
            <span class="inline-flex items-center">
              {{ t('annotationTask.datasetType') }}：
              <!-- <dict-tag :options="data_type" :value="scope.row.dataType"></dict-tag> -->
              <el-tag v-if="scope.row.dataType === '0'" type="primary">图像</el-tag>
              <el-tag v-else-if="scope.row.dataType === '1'" type="success">文本</el-tag>
              <el-tag v-else-if="scope.row.dataType === '2'" type="info">语音</el-tag>
              <el-tag v-else-if="scope.row.dataType === '3'" type="warning">视频</el-tag>
              <el-tag v-else-if="scope.row.dataType === '4'" type="danger">点云</el-tag>
              <el-tag v-else-if="scope.row.dataType === '5'" type="primary" effect="dark">层析</el-tag>
              <el-tag v-else type="danger">其它</el-tag>
            </span>
          </template>
        </el-table-column>
        <el-table-column class-name='!text-left' show-overflow-tooltip sortable>
          <template #default="{ row }">
            <span>【{{ t('annotationTask.taskNumber') }}：{{ row.labelTaskList.length }}】</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('common.action')" width="140" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="flex justify-end pr-5">
              <el-button icon="Plus"
                @click="createTaskRef.openDialog('createbyBaseDataset', { baseDatasetId: row.baseDatasetId, baseDatasetName: row.baseDatasetName }); scene = 1"
                text type="primary" v-auth="'sys_annotationtask_add'"> {{ t('annotationTask.addBtn')
                }}</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <pagination @current-change="currentChangeHandle" @size-change="sizeChangeHandle" v-bind="state.pagination" />
    </div>
    <div class="layout-padding-auto layout-padding-view" v-show="scene == 1">
      <create-task @changeScene="changeScene" @refresh="getDataList()" ref="createTaskRef"></create-task>
    </div>
    <el-dialog :title="t('annotationTask.modelSelectList')" width="700" v-model="modelDialogVisible"
      :close-on-click-modal="false" draggable @close="closeModelDialog">
      <el-form :inline="true" :model="stateModel.queryForm" @keyup.enter="getDataList" ref="queryModelRef">
        <el-form-item :label="t('annotationTask.baseModelName')">
          <el-input :placeholder="t('annotationTask.modelNameTip')" style="max-width: 180px"
            v-model="stateModel.queryForm.baseModelName" />
        </el-form-item>
        <el-form-item>
          <el-button @click="getModelDataList" icon="search" type="primary">
            {{ t('common.queryBtn') }}
          </el-button>
          <el-button @click="resetModelQuery" icon="Refresh">{{ t('common.resetBtn') }}</el-button>
        </el-form-item>
      </el-form>
      <el-table ref="tableModelRef" class="w-full" :data="stateModel.dataList"
        @selection-change="handleSelectionChangeModel" :row-class-name="getModelRowClassName"
        v-loading="stateModel.loading" border :cell-style="tableModelStyle?.cellStyle"
        :header-cell-style="tableModelStyle?.headerCellStyle">
        <el-table-column align="center" type="selection" width="40" />
        <el-table-column :label="t('manage.index')" type="index" width="60" show-overflow-tooltip />
        <el-table-column :label="t('annotationTask.modelName')" prop="groupName" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.baseModelName }}
          </template>
        </el-table-column>
        <el-table-column :label="t('annotationTask.modelDescription')" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.description }}
          </template>
        </el-table-column>
      </el-table>
      <pagination @current-change="currentModelChangeHandle" @size-change="sizeModelChangeHandle"
        v-bind="stateModel.pagination" />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeModelDialog">{{
            t('common.cancelButtonText') }}</el-button>
          <el-button type="primary" @click="gotoMagicLabel" v-auth="'sys_annotationtask_config'">{{
            t('common.confirmButtonText') }}</el-button>
        </div>
      </template>
    </el-dialog>
    <import-dialog @refresh="getDataList()" ref="importReferenceLabelRef"
      @update:dataFromImport="handleDataFromImport"></import-dialog>
  </div>

</template>

<script lang="ts" name="annotationTask" setup>
import { BasicTableProps, useTable } from '/@/hooks/table';
import { delObj, fetchList as fetchTaskList } from '/@/api/annotate/annotation-task';
import { fetchList as fetchModelList } from '/@/api/model/base-model';
import { useMessage, useMessageBox } from '/@/hooks/message';
import { useI18n } from 'vue-i18n';
import { useDict } from '/@/hooks/dict';
import router from '/@/router';
import type { ElTable } from 'element-plus';
import { ref, provide } from 'vue';

// 引入组件
// const ConfigDialog = defineAsyncComponent(() => import('./configAnnotationTaskForm.vue'));
const CreateTask = defineAsyncComponent(() => import('./createTask.vue'));
const ImportDialog = defineAsyncComponent(() => import('/@/components/Upload/importDialog.vue'));
const { t } = useI18n();

const { sub_label_detect_type, sub_label_seg_type, sub_label_LLM_type, sub_label_class_type } = useDict(
  'sub_label_detect_type', 'sub_label_seg_type', 'sub_label_LLM_type', 'sub_label_class_type');
//切换场景 0--模型展示， 1--创建模型
const scene = ref(0);

// 定义变量内容
const createTaskRef = ref();

// 搜索变量
const queryRef = ref();
const queryModelRef = ref();
const showSearch = ref(true);
// 多选变量
const selectObjs = ref([]) as any;
const multiple = ref(true);

const modelDialogVisible = ref(false);
const importReferenceLabelRef = ref();

const labelTypeOptions = [
  {
    value: '',
    label: '全部',
  },
  {
    value: '0',
    label: '图像分类',
  },
  {
    value: '1',
    label: '物体检测',
  },
  {
    value: '2',
    label: '图像分割',
  },
  {
    value: '3',
    label: '其它',
  },
];

const state: BasicTableProps = reactive<BasicTableProps>({
  createdIsNeed: false,
  queryForm: {
    baseDatasetId: '',
    baseDatasetName: '',
    labelType: '',
    taskName: '',
  },
  pageList: fetchTaskList,
});

//  table hook
const { downBlobFile, getDataList, currentChangeHandle, sizeChangeHandle, tableStyle } = useTable(state);

const tableLoading = ref(false);
const tableLoadingText = ref();

const openImportReferenceLabelDialog = (scope: any) => {
  let params = {
    type: 'referenceLabel',
    id: scope.baseDatasetId,
    name: scope.baseDatasetName,
    datatype: scope.dataType,
    taskId: scope.taskId,
    subLabelType: scope.subLabelType,
    labelType: scope.labelType
  }
  importReferenceLabelRef.value.openDialog(params);
};
const handleDataFromImport = (data: boolean) => {
  tableLoading.value = data;
  tableLoadingText.value = t('annotationTask.importReferenceLabelLoading')
}

const handleDataFromUpload = (data: any) => {
  tableLoading.value = false;
}
provide('handleDataFromUpload', handleDataFromUpload);

// 计算标注进度
const calculateProgress = (labelCount: number, imageCount: number): Number => {
  if (imageCount === 0) return 0; // 避免除以零
  const progress = (labelCount / imageCount) * 100;
  if (progress > 0 && progress < 1) {
    return 1;
  }
  // 根据进度值返回格式化结果
  if (progress % 1 === 0) {
    // 如果是整数，直接返回整数部分
    return Math.floor(progress);
  } else {
    // 否则保留最多两位小数
    return parseFloat(progress.toFixed(1));
  }
};

// 清空搜索条件
const resetQuery = () => {
  state.queryForm.baseDatasetId = '';
  queryRef.value.resetFields();
  getDataList();
};

const resetModelQuery = () => {
  stateModel.queryForm.baseModelName = '';
  queryModelRef.value.resetFields();
  getModelDataList();
};

// 多选事件
const handleSelectionChange = (objs: { taskId: string }[]) => {
  selectObjs.value = objs.map(({ taskId }) => taskId);
  multiple.value = !objs.length;
};

// 删除操作
const handleDelete = async (ids: string[]) => {
  try {
    await useMessageBox().confirm(t('common.delConfirmText'));
  } catch {
    return;
  }

  try {
    await delObj(ids);
    getDataList();
    useMessage().success(t('common.delSuccessText'));
  } catch (err: any) {
    useMessage().error(err.msg);
  }
};

//切换场景
const changeScene = (sceneCode: number) => {
  scene.value = sceneCode;
};

interface Task {
  taskId: string;
  labelType: string;
  taskName: string;
  baseDatasetId: '',
  dataType: '',
  tagIds: '',
}

const smartLabeling = (taskObj: Task) => {
  if (taskObj.labelType === '0') {
    stateModel.queryForm.baseModelType = '0';
    getModelDataList();
    modelDialogVisible.value = true;
    aiLabelParams.taskId = taskObj.taskId;
    aiLabelParams.labelType = taskObj.labelType;
    aiLabelParams.dataType = taskObj.dataType;
    aiLabelParams.tagIds = taskObj.tagIds;
    aiLabelParams.baseDatasetId = taskObj.baseDatasetId;
  } else if (taskObj.labelType === '1') {
    useMessage().wraning("功能正在开发中...");
  } else {
    useMessage().wraning("功能正在开发中...");
  }
};

const filterTag = (value: string, row: any) => {
  return row.labelType === value;
};

const label_type = ref([
  { label: '图像分类', value: '0' },
  { label: '物体检测', value: '1' },
  { label: '图像分割', value: '2' },
]);

const formatLabelType = computed(() => {
  return label_type.value.map((item: any) => ({
    text: item.label,
    value: item.value,
  }));
})

//基准数据集标注
const datasetAnnotation = (taskId: string, baseDatasetName: string, labelType: string, subLabelType?: string, taskName?: string) => {
  const paths: Record<string, string> = {
    '0': '/annotate/onlineannotation/imageClassification',
    '1': '/annotate/onlineannotation/objectDetection',
    '2': '/annotate/onlineannotation/imageSegmentation',
    '3': '/annotate/onlineannotation/imageTripleDetection',
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

const exportLabelTask = (type: string, row: any) => {
  //判断导出类型，是json还是csv或者mask
  const params = {
    taskId: row.taskId, baseDatasetId: row.baseDatasetId, labelType: row.labelType,
    subLabelType: row.subLabelType, exportType: '', fileName: '', baseDatasetName: row.baseDatasetName
  };

  if (type === 'JSON') {
    params.exportType = 'json';
    downBlobFile('/admin/labelTask/exportJSON', params, row.taskName + '.json');
  } else if (type === 'CSV') {
    params.exportType = 'csv';
    downBlobFile('/admin/labelTask/exportCSV', params, row.taskName + '.csv');
  } else if (type === 'MASK') {
    params.exportType = 'mask';
    params.fileName = row.taskName;
    downBlobFile('/admin/labelTask/exportMASK', params, row.taskName + '.zip');
  }
};

// interface Model {
//   baseModelId: string;
//   baseModelName: string;
//   baseModelType: string;
//   catalogue: string;
//   config: string;
//   description: string;
//   resource: string;
// }

const stateModel: BasicTableProps = reactive<BasicTableProps>({
  createdIsNeed: false,
  pagination: {
    pageSizes: [1, 5, 10, 20],
  },
  queryForm: {
    baseModelType: '',
    baseModelName: '',
  },
  pageList: fetchModelList,
});
const { getDataList: getModelDataList, currentChangeHandle: currentModelChangeHandle, sizeChangeHandle: sizeModelChangeHandle, tableStyle: tableModelStyle } = useTable(stateModel);

interface ModelSet {
  baseModelId: string
  baseModelName: string
  baseModelType: string
}
const tableModelRef = ref<InstanceType<typeof ElTable> | null>(null);
const selectedModelRows = ref<ModelSet[]>([]); // 存储已选中的行
const getModelRowClassName = ({ row }: { row: ModelSet }) => {
  return selectedModelRows.value.includes(row) ? 'row-highlight' : '';
};
// 防止递归调用标志位
let isProgrammaticSelection = false;
// 处理多选框变化的函数，只保留最后选中的行
const handleSelectionChangeModel = (selection: ModelSet[]) => {
  // 如果是程序调用导致的选中变化，跳过该方法
  if (isProgrammaticSelection) return;

  if (selection.length > 0) {
    // 获取最后选中的行
    const latestSelection = selection[selection.length - 1];

    // 设置标志位为 true，防止递归调用
    isProgrammaticSelection = true;

    // 清除之前选中的行
    tableModelRef.value?.clearSelection();

    // 选中最后一个选中的行
    tableModelRef.value?.toggleRowSelection(latestSelection, true);

    // 更新 selectedRows 和 taskParams
    selectedModelRows.value = [latestSelection];
    aiLabelParams.baseModelId = latestSelection.baseModelId;
    aiLabelParams.baseModelName = latestSelection.baseModelName;
    aiLabelParams.baseModelType = latestSelection.baseModelType;
    // 重置标志位为 false
    isProgrammaticSelection = false;
  } else {
    // 如果没有选中任何行，清空选中的行和任务参数
    selectedModelRows.value = [];
    aiLabelParams.baseModelId = '';
    aiLabelParams.baseModelName = '';
  }
};

const aiLabelParams = reactive({
  baseDatasetId: '',
  taskId: '',
  labelType: '',
  dataType: '',
  tagIds: '',
  baseModelId: '',
  baseModelName: '',
  baseModelType: '',
});

const aiLabeling = ref<string[]>([]);

const gotoMagicLabel = () => {
  if (aiLabelParams.baseModelId) {
    modelDialogVisible.value = false;
    aiLabeling.value.push(aiLabelParams.taskId);
  } else {
    useMessage().wraning(t('annotationTask.selectModelTip'));
  }
}

const closeModelDialog = () => {
  selectedModelRows.value = [];
  tableModelRef.value?.clearSelection();
  stateModel.queryForm.baseModelName = '';
  stateModel.queryForm.baseModelType = '';
  aiLabelParams.baseModelId = '';
  aiLabelParams.baseModelName = '';
  aiLabelParams.baseModelType = '';
  aiLabelParams.baseDatasetId = '';
  aiLabelParams.taskId = '';
  aiLabelParams.labelType = '';
  aiLabelParams.dataType = '';
  aiLabelParams.tagIds = '';
  modelDialogVisible.value = false;
}

const route = useRoute();

watch(() => state.dataList, async () => {
  console.log('state.dataList', state.dataList);
  if (state.dataList && state.dataList.length === 0) {
    try {
      await useMessageBox().confirm(t('annotationTask.createTaskConfirmText'));
      createTaskRef.value.openDialog('createbyBaseDataset', { baseDatasetId: state.queryForm.baseDatasetId, baseDatasetName: state.queryForm.baseDatasetName });
      scene.value = 1;
    } catch {
      return;
    }
  }
}, {});

onMounted(() => {
  let baseDatasetId = route.query.baseDatasetId;
  let baseDatasetName = route.query.baseDatasetName;
  if (baseDatasetId && baseDatasetName) {
    state.queryForm.baseDatasetId = baseDatasetId;
    state.queryForm.baseDatasetName = baseDatasetName;
  }
  getDataList();
});
</script>
