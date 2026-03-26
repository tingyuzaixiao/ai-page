<template>
  <div class="relative mt-3 px-6">
    <!-- 左边的文本部分，使用绝对定位 -->
    <div class="absolute text-4xl font-bold">
      {{ operation === 'create' || operation === 'createbyBaseDataset' ? t('annotationTask.createTask') :
        t('annotationTask.editTask')
      }}
    </div>

    <!-- 右边的进度条部分 -->
    <div v-if="operation == 'create' || operation === 'createbyBaseDataset'" class="flex justify-center w-full">
      <el-steps class="w-full" :active="active" finish-status="success" align-center>
        <el-step :title="t('annotationTask.selectDatasetTip')" description="" :icon="Files" />
        <!-- <el-step title="选择标签组" description="" /> -->
        <el-step :title="t('annotationTask.taskConfig')" description="" :icon="Edit" />
      </el-steps>
    </div>
  </div>
  <el-divider v-if="operation === 'create' || operation === 'createbyBaseDataset'" border-style="dashed"
    class="mt10 mb15" />
  <el-divider v-else border-style="dashed" style="margin-top: 45px; margin-bottom: 5px;" />
  <el-row class="ml10" v-show="showSearch && active === 0">
    <el-form :inline="true" :model="stateBaseDataset.queryForm" @keyup.enter="baseDatasetTable.getDataList"
      ref="baseDatasetQueryRef">
      <el-form-item :label="t('manage.baseDatasetName')">
        <el-input :placeholder="t('manage.inputBaseDatasetNameTip')" style="max-width: 180px"
          v-model="stateBaseDataset.queryForm.baseDatasetName" />
      </el-form-item>
      <el-form-item>
        <el-button @click="baseDatasetTable.getDataList" icon="search" type="primary">
          {{ t('common.queryBtn') }}
        </el-button>
        <el-button @click="resetQuery" icon="Refresh">{{ t('common.resetBtn') }}</el-button>
      </el-form-item>
    </el-form>
  </el-row>
  <!-- <el-row class="ml10" v-show="showSearch && active === 1">
    <el-form :inline="true" :model="stateLabelGroup.queryForm" @keyup.enter="labelGroupTable.getDataList"
      ref="labelGroupQueryRef">
      <el-form-item :label="$t('labelGroup.labelGroupName')">
        <el-input :placeholder="$t('labelGroup.inputModelNameTip')" style="max-width: 180px"
          v-model="stateLabelGroup.queryForm.groupName" />
      </el-form-item>
      <el-form-item>
        <el-button @click="labelGroupTable.getDataList" icon="search" type="primary">
          {{ $t('common.queryBtn') }}
        </el-button>
        <el-button @click="resetQuery" icon="Refresh">{{ $t('common.resetBtn') }}</el-button>
      </el-form-item>
    </el-form>
  </el-row> -->
  <div class="overflow-y-scroll h-5/6" v-show="active === 0">
    <el-table ref="tableBDRef" :data="stateBaseDataset.dataList" style="width: 100%"
      @selection-change="handleSelectionChangeBD" :row-class-name="getBDRowClassName"
      v-loading="stateBaseDataset.loading" border :cell-style="baseDatasetTable.tableStyle?.cellStyle"
      :header-cell-style="baseDatasetTable.tableStyle?.headerCellStyle">
      <el-table-column align="center" type="selection" width="40" />
      <el-table-column :label="t('manage.index')" type="index" width="70" show-overflow-tooltip />
      <el-table-column :label="t('manage.baseDatasetId')" prop="baseDatasetId" show-overflow-tooltip />
      <el-table-column :label="t('manage.baseDatasetName')" prop="baseDatasetName" show-overflow-tooltip />
      <el-table-column :label="t('manage.dataType')" prop="dataType" show-overflow-tooltip>
        <template #default="scope">
          <dict-tag :options="data_type" :value="scope.row.dataType"></dict-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('manage.baseDatasetNum')" prop="count" show-overflow-tooltip />
      <!-- <el-table-column :label="t('manage.datasetNum')" prop="datasetNum" show-overflow-tooltip /> -->
      <el-table-column :label="t('manage.createTime')" prop="createTime" show-overflow-tooltip sortable />
      <el-table-column :label="t('manage.updateTime')" prop="updateTime" show-overflow-tooltip sortable />
    </el-table>
    <pagination @current-change="baseDatasetTable.currentChangeHandle" @size-change="baseDatasetTable.sizeChangeHandle"
      v-bind="stateBaseDataset.pagination" />
  </div>
  <!-- <div class="overflow-y-scroll h-5/6" v-show="active === 1">
    <el-table ref="tableLGRef" :data="stateLabelGroup.dataList" style="width: 100%" highlight-current-row
      @selection-change="handleSelectionChangeLG" :row-class-name="getLGRowClassName"
      v-loading="stateLabelGroup.loading" border :cell-style="labelGroupTable.tableStyle?.cellStyle"
      :header-cell-style="labelGroupTable.tableStyle?.headerCellStyle">
      <el-table-column align="center" type="selection" width="40" />
      <el-table-column :label="$t('manage.index')" type="index" width="60" show-overflow-tooltip />
      <el-table-column :label="t('labelGroup.labelGroupName')" prop="groupName" show-overflow-tooltip />
      <el-table-column :label="t('labelGroup.labelNumber')" show-overflow-tooltip>
        <template #default="scope">
          {{ scope.row.tagList ? scope.row.tagList.length : 0 }}
        </template>
</el-table-column>
<el-table-column :label="t('labelGroup.description')" prop="description" show-overflow-tooltip />
<el-table-column :label="t('labelGroup.createTime')" prop="createTime" show-overflow-tooltip sortable />
<el-table-column :label="t('labelGroup.updateTime')" prop="updateTime" show-overflow-tooltip sortable />
</el-table>
<pagination @current-change="labelGroupTable.currentChangeHandle" @size-change="labelGroupTable.sizeChangeHandle"
  v-bind="stateLabelGroup.pagination" />
</div> -->
  <div class="flex justify-center mt-2 overflow-y-scroll h-5/6" v-show="active === 1" v-loading="submitLoading"
    :element-loading-text="t('annotationTask.importLoading')">
    <el-form class="w-4/5 max-w-8xl" label-width="auto" :model="taskParams" ref="taskFormRef" :rules="taskRules">
      <el-form-item :label="t('annotationTask.taskName')" prop="taskName">
        <el-input :placeholder="t('annotationTask.inputTaskNameTip')" v-model="taskParams.taskName"></el-input>
      </el-form-item>
      <el-form-item v-if="havenLabel" :label="t('annotationTask.labelType')" prop="labelType">
        <div class="w-full flex justify-between">
          <el-card v-for="(item, index) in model_type" :key="index"
            :shadow="taskParams.labelType === item.value ? 'always' : 'never'"
            :class="['w-68', 'cursor-pointer', { '!border-primary !bg-[#F4F7FE]': taskParams.labelType === item.value }]">
            <template #header>
              <div class="flex justify-center item-center">
                <i :class="['iconfont', '!text-4xl', 'text-primary', item.remarks]"></i>
                <span class="ml-2 text-lg font-extrabold ">{{ item.label }}</span>
              </div>
            </template>
            <span class="relative left-[-10px] top-[-8px] font-bold">{{ t('annotationTask.applicationScenario')
            }}</span>
            <p class="relative left-[-10px] top-[5px] flex justify-between"
              :class="['line-clamp-2', { 'font-bold': item.value == taskParams.labelType }]">
              <el-tag type="primary" v-for="(desc, index) in item.desc.split(',')" :key="index">{{ desc }}</el-tag>
            </p>
          </el-card>
        </div>
      </el-form-item>
      <el-form-item v-else :label="t('annotationTask.labelType')" prop="labelType">
        <div class="w-full flex justify-between">
          <el-card v-for="(item, index) in model_type" :key="index" shadow="hover"
            :class="['w-68', 'cursor-pointer', { '!border-primary !bg-[#F4F7FE]': taskParams.labelType === item.value }]"
            @click="selectCard(item.value)">
            <template #header>
              <div class="flex justify-center item-center">
                <i :class="['iconfont', '!text-4xl', 'text-primary', item.remarks]"></i>
                <span class="ml-2 text-lg font-extrabold ">{{ item.label }}</span>
              </div>
            </template>
            <span class="relative left-[-10px] top-[-8px] font-bold">{{ t('annotationTask.applicationScenario')
            }}</span>
            <p class="relative left-[-10px] top-[5px] flex justify-between"
              :class="['line-clamp-2', { 'font-bold': item.value == taskParams.labelType }]">
              <el-tag type="primary" v-for="(desc, index) in item.desc.split(',')" :key="index">{{ desc }}</el-tag>
            </p>
          </el-card>
        </div>
      </el-form-item>
      <el-form-item :label="t('annotationTask.subLabelType')" prop="subLabelType">
        <el-select :disabled="havenLabel" v-model="taskParams.subLabelType"
          :placeholder="t('annotationTask.selectSubLabelType')" filterable>
          <el-option v-if="taskParams.labelType === '0'" v-for="(item, index) in sub_label_class_type" :key="index"
            :label="item.label" :value="item.value">
          </el-option>
          <el-option v-if="taskParams.labelType === '1'" v-for="(item, index) in sub_label_detect_type" :key="index"
            :label="item.label" :value="item.value">
          </el-option>
          <el-option v-if="taskParams.labelType === '2'" v-for="(item, index) in sub_label_seg_type" :key="index"
            :label="item.label" :value="item.value">
          </el-option>
          <el-option v-if="taskParams.labelType === '3'" v-for="(item, index) in sub_label_LLM_type" :key="index"
            :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="t('manage.baseDatasetId')" prop="baseDatasetId">
        <el-input v-model="taskParams.baseDatasetId" disabled></el-input>
      </el-form-item>
      <el-form-item :label="t('manage.baseDatasetName')" prop="baseDatasetName">
        <el-input v-model="taskParams.baseDatasetName" disabled></el-input>
      </el-form-item>
      <el-form-item :label="t('labelGroup.selectTagResoure')" prop="labelSource">
        <el-switch :disabled="havenLabel" class="ml-2" v-model="taskParams.labelSource" inline-prompt
          style="--el-switch-on-color: #2e5cf6; --el-switch-off-color: #67c23a"
          :active-text="t('labelGroup.importTags')" :inactive-text="t('labelGroup.useExistingTags')" size="default"
          @change="changeLabelSource" />
      </el-form-item>
      <el-form-item v-show="!taskParams.labelSource" :label="t('labelGroup.labelGroupName')" prop="labelGroupName">
        <el-select :disabled="havenLabel" ref="groupRef" v-model="taskParams.groupId" clearable filterable>
          <template #loading>
            <svg class="circular" viewBox="0 0 50 50">
              <circle class="path" cx="25" cy="25" r="20" fill="none" />
            </svg>
          </template>
          <el-option v-for="item in labelGroupList" :key="item.groupId" :label="item.groupName" :value="item.groupId"
            :disabled="item.tagList.length === 0">
            <span style="float: left">{{ item.groupName }}</span>
            <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px">
              <el-tag class="w-24">{{ t('labelGroup.tagNum') + '：' + item.tagList.length }}</el-tag>
            </span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="t('labelGroup.labelFile')" v-show="taskParams.labelSource">
        <el-upload ref="uploadRef" action="" :auto-upload="false" accept=".json" :http-request="handleUploadRequest">
          <template #trigger>
            <el-button type="primary" size="small" :icon="Upload" plain>{{ t('labelGroup.selectLabelFile')
            }}</el-button>
          </template>

          <template #tip>
            <div style="color: gray;" class="el-upload__tip ">
              {{ t('labelGroup.selectLabelFileTips') }}
            </div>
          </template>
        </el-upload>
      </el-form-item>
      <el-form-item :label="t('annotationTask.description')" prop="description">
        <el-input :placeholder="t('annotationTask.inputremarkTip')" type="textarea" maxlength="550" :rows="5"
          v-model="taskParams.description"></el-input>
      </el-form-item>
    </el-form>
  </div>

  <el-divider />
  <!-- 底部按钮 -->
  <div v-if="operation === 'create' || operation === 'createbyBaseDataset'" class="px-6 text-right">
    <el-button v-show="active !== 1" class="!px-12" size="default" type="primary" @click="nextStep">{{
      t('common.nextButtonText')
    }}</el-button>
    <el-button v-show="active === 1" class="!px-12" size="default" type="primary" @click="onSubmit">{{
      t('common.completeBtn')
    }}</el-button>
    <el-button v-show="active !== 0 && operation != 'createbyBaseDataset'" class="!px-12" size="default"
      @click="preStep">{{ t('common.preButtonText')
      }}</el-button>
    <el-button v-show="active === 0 || (active === 1 && operation === 'createbyBaseDataset')" class="!px-12"
      size="default" @click="closeCrateTrain">{{
        t('common.cancelButtonText') }}</el-button>
  </div>
  <div v-else class="px-6 text-right">
    <el-button class="!px-12" size="default" type="primary" @click="onSubmit">{{
      t('common.confirmModifyBtn')
    }}</el-button>
    <el-button class="!px-12" size="default" @click="closeCrateTrain">{{
      t('common.cancelButtonText') }}</el-button>
  </div>
</template>
<script lang="ts" setup>
import { BasicTableProps, useTable } from '/@/hooks/table';
import { fetchList } from '/@/api/annotate/label-group';
import { fetchBaseDatasetList } from '/@/api/dataset/manage';
import { addTaskObj, putTaskObj, validateLabelTaskName } from '/@/api/annotate/annotation-task';
import { useI18n } from 'vue-i18n';
import { useDict } from '/@/hooks/dict';
import { ref } from 'vue';
import { useMessage } from '/@/hooks/message';
import type { ElTable } from 'element-plus';
import router from '/@/router';
import { Files, Edit, Upload } from '@element-plus/icons-vue';
import { importLabels } from '/@/api/admin/file';

const uploadRef = ref()
const { data_type, sub_label_detect_type, sub_label_seg_type, sub_label_class_type, sub_label_LLM_type } = useDict(
  'data_type', 'sub_label_detect_type', 'sub_label_seg_type', 'sub_label_LLM_type', 'sub_label_class_type');
const { model_type } = useDict('model_type');

// 引入组件
// const ConfigDialog = defineAsyncComponent(() => import('./configTagForm.vue'));

// 定义变量内容
const taskFormRef = ref();

// 引入组件
const { t } = useI18n();
//切换步骤方法和场景变量
// const activeIndex = ref(0);

// 搜索变量
const baseDatasetQueryRef = ref();
const labelGroupQueryRef = ref();
const showSearch = ref(true);


//定义模型参数
const taskParams = reactive({
  taskId: '',
  taskName: '',
  datasetId: '',
  baseDatasetId: '',
  baseDatasetName: '',
  labelType: '',
  subLabelType: '',
  groupId: '',
  groupName: '',
  tagIds: "",
  description: '',
  labelSource: false
}) as any;
const havenLabel = ref(false);

//定义各个步骤校验规则
const taskRules = ref({
  subLabelType: [{ required: true, message: t('annotationTask.subLabelTypeTip'), trigger: 'blur' }],
  taskName: [
    { required: true, message: t('annotationTask.taskNameTip'), trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        validateLabelTaskName(rule, value, callback, taskParams.taskId !== '');
      },
      trigger: 'blur',
    },
  ],
  labelType: [{ required: true, message: t('annotationTask.taskTypeTip'), trigger: 'blur' }],
});

// 选择类型
const selectCard = (value: string) => {
  taskParams.labelType = value
  taskParams.subLabelType = '0';
};

// 进度条
const active = ref(0);
const nextStep = () => {
  if (active.value === 0) {
    if (taskParams.baseDatasetId === '') {
      useMessage().wraning("请选择要标注的基础数据集！！！");
      return;
    } else if (selectedBDRows.value[0].count <= 0) {
      useMessage().wraning("请选择图片数量大于0的基础数据集！！！");
      return;
    } else if (selectedBDRows.value[0].dataType !== '0') {
      useMessage().wraning("目前仅支持为图像数据创建标注任务！！！");
      return;
    }
  }
  if (active.value === 1) {
    if (taskParams.groupId === '') {
      useMessage().wraning("请选择要使用的标签组！！！");
      return;
    } else if (selectedLGRows.value[0].tagList.length <= 0) {
      useMessage().wraning("请选择标签数量大于0的标签组！！！");
      return;
    }
  }
  if (active.value++ > 2) active.value = 2
}

const preStep = () => {
  if (operation.value === 'createbyBaseDataset' && active.value === 1) {
    useMessage().wraning("已选中\"" + taskParams.baseDatasetName + "\"基础数据集，无法返回上一步！！！");
    return;
  }
  if (active.value-- < 0) active.value = 0
}

const stateBaseDataset: BasicTableProps = reactive<BasicTableProps>({
  queryForm: {
    baseDatasetName: '',
  },
  createdIsNeed: false,
  pageList: fetchBaseDatasetList,
  descs: ['update_time'],
});
const stateLabelGroup: BasicTableProps = reactive<BasicTableProps>({
  queryForm: {
    groupId: '',
    tagName: ''
  },
  createdIsNeed: false,
  pageList: fetchList,
  descs: ['update_time'],
});


//  table hook
const baseDatasetTable = useTable(stateBaseDataset);
const labelGroupTable = useTable(stateLabelGroup);

// 清空搜索条件
const resetQuery = () => {
  if (active.value === 0) {
    baseDatasetQueryRef.value.resetFields();
    stateBaseDataset.queryForm.baseDatasetName = '';
    baseDatasetTable.getDataList();
  } else if (active.value === 1) {
    labelGroupQueryRef.value.resetFields();
    stateLabelGroup.queryForm.groupName = '';
    labelGroupTable.getDataList();
  } else {
    baseDatasetQueryRef.value.resetFields();
    stateBaseDataset.queryForm.baseDatasetName = '';
    baseDatasetTable.getDataList();
    labelGroupQueryRef.value.resetFields();
    stateLabelGroup.queryForm.groupName = '';
    labelGroupTable.getDataList();
  }
};

// 单选表格行
interface BaseDataSet {
  baseDatasetId: string
  baseDatasetName: string
  dataType: string
  count: number
}
interface Tag {
  groupId: string
  tagId: string
  tagName: string[]
  color: string
}
interface LabelGroup {
  groupId: string
  groupName: string
  tagList: Tag[]
}
const tableBDRef = ref<InstanceType<typeof ElTable> | null>(null);
const tableLGRef = ref<InstanceType<typeof ElTable> | null>(null);
const selectedBDRows = ref<BaseDataSet[]>([]); // 存储已选中的行
const selectedLGRows = ref<LabelGroup[]>([]); // 存储已选中的行

const labelGroupList = ref<LabelGroup[]>([]);

const fetchLabelGroupList = () => {
  labelGroupList.value = [];
  fetchList().then((res) => {
    if (res.code === 0) {
      labelGroupList.value = res.data;
    }
  });
};
// 防止递归调用标志位
let isProgrammaticSelection = false;
// 处理多选框变化的函数，只保留最后选中的行
const handleSelectionChangeBD = (selection: BaseDataSet[]) => {
  // 如果是程序调用导致的选中变化，跳过该方法
  if (isProgrammaticSelection) return;

  if (selection.length > 0) {
    // 获取最后选中的行
    const latestSelection = selection[selection.length - 1];

    // 设置标志位为 true，防止递归调用
    isProgrammaticSelection = true;

    // 清除之前选中的行
    tableBDRef.value?.clearSelection();

    // 选中最后一个选中的行
    tableBDRef.value?.toggleRowSelection(latestSelection, true);

    // 更新 selectedRows 和 taskParams
    selectedBDRows.value = [latestSelection];
    taskParams.baseDatasetId = latestSelection.baseDatasetId;
    taskParams.baseDatasetName = latestSelection.baseDatasetName;
    // 重置标志位为 false
    isProgrammaticSelection = false;
  } else {
    // 如果没有选中任何行，清空选中的行和任务参数
    selectedBDRows.value = [];
    taskParams.baseDatasetId = '';
    taskParams.baseDatasetName = '';
  }
};

// 处理多选框变化的函数，只保留最后选中的行
const handleSelectionChangeLG = (selection: LabelGroup[]) => {
  if (isProgrammaticSelection) return;

  if (selection.length > 0) {
    const latestSelection = selection[selection.length - 1];
    isProgrammaticSelection = true;
    tableLGRef.value?.clearSelection();
    tableLGRef.value?.toggleRowSelection(latestSelection, true);

    // 更新 selectedRows 和 taskParams
    selectedLGRows.value = [latestSelection];
    taskParams.groupId = latestSelection.groupId;
    taskParams.groupName = latestSelection.groupName;
    isProgrammaticSelection = false;
  } else {
    selectedLGRows.value = [];
    taskParams.groupId = '';
    taskParams.groupName = '';
  }
};

// 根据当前行是否被选中，动态设置类名
const getBDRowClassName = ({ row }: { row: BaseDataSet }) => {
  return selectedBDRows.value.includes(row) ? 'row-highlight' : '';
};
const getLGRowClassName = ({ row }: { row: LabelGroup }) => {
  return selectedLGRows.value.includes(row) ? 'row-highlight' : '';
};

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh', 'changeScene'])

//关闭创建任务，通知父组件切换场景
const closeCrateTrain = () => {
  clearTaskParams();
  uploadRef.value!.clearFiles();
  emit('changeScene', 0);
};

const clearTaskParams = () => {
  taskParams.labelSource = false;
  taskParams.labelGroupId = '';
  taskParams.labelGroupName = '';
  taskParams.labelGroupType = '';
  taskParams.labelGroupCode = '';
  taskParams.labelGroupRemark = '';
  taskParams.labelGroupStatus = '';
  taskParams.labelGroupVersion = '';
  taskParams.labelGroupNum = '';
  havenLabel.value = false;
}

const submitLoading = ref(false);
const onSubmit = async () => {
  const valid = await taskFormRef.value.validate().catch(() => { });
  if (!valid) return false;
  let taskId = '';
  submitLoading.value = true;
  if (taskParams.taskId) {
    await putTaskObj(taskParams).then(async (res) => {
      taskId = res.data;
      if (taskId) {
        useMessage().success(t('common.editSuccessText'));
      }
    }).catch((err) => {
      useMessage().error(err.msg);
    });
    closeCrateTrain();
    emit('refresh');
  } else {
    await addTaskObj(taskParams).then(async (res) => {
      taskId = res.data;
      taskParams.taskId = taskId;
    }).catch((err) => {
      useMessage().error(err.msg);
    });
    if (taskParams.labelSource) {
      uploadRef.value!.submit()
      let pollingTimer: any = null;
      // const loading = ElLoading.service({
      //   lock: true,
      //   text: '正在导入标签，请稍后...',
      //   background: 'rgba(0, 0, 0, 0.7)',
      // })
      pollingTimer = setInterval(() => {
        if (submitLoading.value == false) {
          clearInterval(pollingTimer);
          pollingTimer = null;
          // loading.close();
          saveAndRedirect(taskId, taskParams.baseDatasetName, taskParams.subLabelType)
        }
      }, 50); // 每 50ms 检查一次
    } else {
      saveAndRedirect(taskId, taskParams.baseDatasetName, taskParams.subLabelType)
    }
  }
};

const saveAndRedirect = (taskId: string, baseDatasetName: string, subLabelType: string = '0') => {
  if (taskParams.labelType === '0') {
    router.push({
      path: '/annotate/onlineannotation/imageClassification',
      query: { taskId, baseDatasetName, subLabelType },
    });
  } else if (taskParams.labelType === '1') {
    router.push({
      path: '/annotate/onlineannotation/objectDetection',
      query: { taskId, baseDatasetName, subLabelType },
    });
  } else if (taskParams.labelType === '2') {
    router.push({
      path: '/annotate/onlineannotation/imageSegmentation',
      query: { taskId, baseDatasetName, subLabelType },
    });
  } else {
    useMessage().wraning("功能正在开发中...")
  }
  useMessage().success(t('annotationTask.addTaskSuccess'));
  closeCrateTrain();
  emit('refresh');
};

const operation = ref('');
interface Task {
  taskId: string;
  taskName: string;
  datasetId: string;
  baseDatasetId: string;
  baseDatasetName: string;
  labelType: string;
  subLabelType: string;
  groupId: string;
  groupName: string;
  tagIds: string;
  description: string;
  labelCount: number;
}

// 打开弹窗
const openDialog = (type: string, taskObj: Task) => {
  // console.log("***********");
  operation.value = type;
  submitLoading.value = false;
  if (operation.value === 'create') {
    stateBaseDataset.queryForm.baseDatasetName = '';
    baseDatasetTable.getDataList();
    stateLabelGroup.queryForm.groupName = '';
    // labelGroupTable.getDataList();
    fetchLabelGroupList();
    taskParams.taskId = '';
    taskParams.taskName = '';
    taskParams.datasetId = '';
    taskParams.baseDatasetId = '';
    taskParams.baseDatasetName = '';
    taskParams.labelType = '';
    taskParams.groupId = '';
    taskParams.groupName = '';
    taskParams.tagIds = "";
    taskParams.description = '';
    active.value = 0;
  } else if (operation.value === 'createbyBaseDataset') {
    stateLabelGroup.queryForm.groupName = '';
    // labelGroupTable.getDataList();
    fetchLabelGroupList();
    taskParams.taskId = '';
    taskParams.taskName = '';
    taskParams.datasetId = '';
    taskParams.baseDatasetId = taskObj.baseDatasetId;
    taskParams.baseDatasetName = taskObj.baseDatasetName;
    taskParams.labelType = '';
    taskParams.groupId = '';
    taskParams.groupName = '';
    taskParams.tagIds = "";
    taskParams.description = '';
    active.value = 1;
  } else {
    taskParams.taskId = taskObj.taskId;
    taskParams.taskName = taskObj.taskName;
    taskParams.datasetId = '';
    taskParams.baseDatasetId = taskObj.baseDatasetId;
    taskParams.baseDatasetName = taskObj.baseDatasetName;
    taskParams.labelType = taskObj.labelType;
    taskParams.subLabelType = taskObj.subLabelType;
    taskParams.groupId = '';
    taskParams.groupName = '';
    taskParams.tagIds = taskObj.tagIds;
    taskParams.description = '';
    if (taskObj.labelCount > 0) {
      havenLabel.value = true;
    } else {
      havenLabel.value = false;
    }
    active.value = 1;
  }
};
const changeLabelSource = (val: any) => {
  taskParams.labelSource = val;
};

const handleUploadRequest = async (options: any) => {
  // debugger
  const formData = new FormData();
  const file = options.file;
  let bucketName = spliceLabelPath(taskParams.baseDatasetName)
  formData.append('file', file);
  formData.append('bucketName', bucketName);
  formData.append('param', '0');
  formData.append('baseDatasetId', taskParams.baseDatasetId)
  formData.append('taskId', taskParams.taskId)
  formData.append('labelType', taskParams.labelType)
  formData.append('subLabelType', taskParams.subLabelType)
  // 上传
  await importLabels(formData).then((response) => {
    // console.log('response', response);
    if (response.code === 0) {
      submitLoading.value = false;
    }
    // console.log('标签上传成功' + response)
  })
    .catch((error) => {
      // 上传失败处理
    });
};

const spliceLabelPath = (baseDatasetName: string) => {
  return "/dataset/" + baseDatasetName + "/base/annotations/"
}

// 暴露变量
defineExpose({
  openDialog,
});

onMounted(() => {
  // console.log("onMounted");
  // fetchLabelGroupList()
});

</script>
<style>
.el-step__icon-inner {
  font-size: 18px !important;
}

.el-step__title {
  font-size: 16px;
}

/* 定义高亮的样式 */
.row-highlight {
  background-color: #D7DEFD !important;
  /* 高亮的背景颜色 */
}
</style>