<template>
  <!-- 编辑实验对话框 -->
  <el-dialog v-model="expDialogVisible" :title="t('experiment.experimentEdit')" width="1000">
    <el-form class="max-w-7xl" ref="editExpDialogRef" :model="expForm" :rules="editExpRules" label-width="auto">
      <el-row>
        <el-col :span="12">
          <el-form-item :label="t('experiment.experimentProgram')">
            <el-input v-model="programParams.name" disabled></el-input>
          </el-form-item>
          <el-form-item :label="t('experiment.experimentId')">
            <el-input v-model="expForm.experimentId" disabled></el-input>
          </el-form-item>
          <el-form-item :label="t('experiment.experimentModel')">
            <el-input v-model="expForm.modelName" disabled></el-input>
          </el-form-item>
          <el-form-item :label="t('experiment.experimentSource')">
            <el-input v-model="expForm.gpuName" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('experiment.experimentName')" prop="experimentName">
            <el-input v-model="expForm.experimentName"></el-input>
          </el-form-item>
          <el-form-item :label="t('experiment.experimentType')" prop="experimentType">
            <el-select :placeholder="$t('model.inputModelTypeTip')" :disabled="expForm.experimentId !== ''"
              v-model="expForm.type">
              <el-option :key="item.value" :label="item.label" :value="item.value" v-for="item in experiment_type" />
            </el-select>
          </el-form-item>
          <el-form-item :label="t('experiment.experimentDataset')">
            <el-input v-model="expForm.datasetName" disabled></el-input>
          </el-form-item>
          <el-form-item :label="t('experiment.experimentAlgorithms')">
            <el-input v-model="expForm.algorithms"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row class="mt-4">
        <el-col :span="24">
          <el-form-item :label="t('experiment.experimentModelConfig')">
            <el-input v-model="expForm.beginCheckpointPath" disabled></el-input>
          </el-form-item>
          <el-form-item :label="t('experiment.experimentLog')">
            <el-input></el-input>
          </el-form-item>
          <el-form-item :label="t('experiment.experimentDesc')" prop="description">
            <el-input v-model="expForm.description" type="textarea" rows="4"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="expDialogVisible = false">{{ $t('common.cancelButtonText') }}</el-button>
      <el-button @click="confirmEditExp" type="primary" :disabled="loading">{{ $t('common.confirmButtonText')
        }}</el-button>
    </template>
  </el-dialog>
  <!-- 模型信息 -->
  <el-dialog v-model="modelDialogVisible" :title="t('model.modelDetail')" width="1000">
    <el-form class="w-full my-4" inline>
      <el-form-item :label="t('experiment.experimentName')" label-width="110px">
        <el-input class="!w-80" v-model="expForm.experimentName" disabled></el-input>
      </el-form-item>
      <el-form-item :label="t('model.modelName')" label-width="110px">
        <el-input class="!w-80" v-model="modelParams.modelName" disabled></el-input>
      </el-form-item>
      <el-form-item :label="t('model.remark')" label-width="110px">
        <el-input v-model="modelParams.description" disabled type="textarea" rows="3" style="width: 763px"></el-input>
      </el-form-item>
      <el-form-item :label="t('model.modelVersion')" label-width="110px">
        <el-input class="!w-80" v-model="modelParams.version" disabled></el-input>
      </el-form-item>
      <el-form-item :label="t('model.modelType')" label-width="110px">
        <el-input class="!w-80" v-model="modelParams.modelType" disabled></el-input>
      </el-form-item>
      <el-form-item :label="t('model.modelcatalogue')" label-width="110px">
        <el-input class="!w-80" v-model="modelParams.catalogue" disabled></el-input>
      </el-form-item>
      <el-form-item :label="t('model.modelDownloadSource')" label-width="110px">
        <el-input class="!w-80" v-model="modelParams.downloadSource" disabled></el-input>
      </el-form-item>
      <el-form-item :label="t('model.createTime')" label-width="110px">
        <el-input class="!w-80" v-model="modelParams.createTime" disabled></el-input>
      </el-form-item>
      <el-form-item :label="t('model.updateTime')" label-width="110px">
        <el-input class="!w-80" v-model="modelParams.updateTime" disabled></el-input>
      </el-form-item>
    </el-form>
  </el-dialog>
  <!-- 数据集详情 -->
  <!-- <el-dialog v-model="datasetDialogVisible" :title="t('dataset.datasetDetail')" width="1000">
			<el-form class="model-form-inline" inline>
				<el-form-item :label="t('experiment.experimentName')" label-width="100px">
					<el-input v-model="expForm.experimentName" disabled></el-input>
				</el-form-item>
				<el-form-item :label="t('manage.datasetName')" label-width="100px">
					<el-input v-model="datasetParams.datasetName" disabled></el-input>
				</el-form-item>
				<el-form-item :label="t('manage.datasetVersion')" label-width="100px">
					<el-input v-model="datasetParams.version" disabled></el-input>
				</el-form-item>
				<el-form-item :label="t('manage.createBy')" label-width="100px">
					<el-input v-model="datasetParams.createBy" disabled></el-input>
				</el-form-item>
				<el-form-item :label="t('manage.progress')" label-width="100px">
					<el-input v-model="datasetParams.progress" disabled style="width: 783px"></el-input>
				</el-form-item>
				<el-form-item :label="t('manage.createTime')" label-width="100px">
					<el-input v-model="datasetParams.createTime" disabled></el-input>
				</el-form-item>
				<el-form-item :label="t('manage.updateTime')" label-width="100px">
					<el-input v-model="datasetParams.updateTime" disabled></el-input>
				</el-form-item>
			</el-form>
		</el-dialog> -->
  <!-- 导出模型权重 -->
  <el-dialog v-model="exportWeightDialogVisible" :title="t('experiment.exportModelWeight')" width="700">
    <el-form style="margin: 20px; width: 80%">
      <el-form-item :label="t('program.programName')">
        <el-input v-model="programParams.name" disabled></el-input>
      </el-form-item>
      <el-form-item :label="t('experiment.experimentName')">
        <el-input v-model="expForm.experimentName" disabled></el-input>
      </el-form-item>
      <el-form-item :label="t('model.modelName')">
        <el-input v-model="modelParams.modelName" disabled></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="exportWeightDialogVisible = false">{{ $t('common.cancelButtonText') }}</el-button>
      <el-button @click="exportWeightDialogVisible = false" type="primary">{{ $t('common.confirmButtonText')
        }}</el-button>
    </template>
  </el-dialog>
  <!-- 导出报告 -->
  <el-dialog v-model="exportReportDialogVisible" :title="t('experiment.exportReport')" width="700">
    <el-form style="margin: 20px; width: 80%">
      <el-form-item :label="t('program.programName')">
        <el-input v-model="programParams.name" disabled></el-input>
      </el-form-item>
      <el-form-item :label="t('experiment.experimentName')">
        <el-input v-model="expForm.experimentName" disabled></el-input>
      </el-form-item>
      <el-form-item :label="t('experiment.fileType')">
        <el-select v-model="selectFileValue" size="large">
          <el-option v-for="item in file_type" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="exportReportDialogVisible = false">{{ $t('common.cancelButtonText') }}</el-button>
      <el-button @click="exportReportDialogVisible = false" type="primary">{{ $t('common.confirmButtonText')
        }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="expDialog">
import { useMessage, useMessageBox } from '/@/hooks/message';
import { useDict } from '/@/hooks/dict';
import { useI18n } from 'vue-i18n';
import { getModelInfoReq, getDatasetInfoReq, editExpReq } from '/@/api/project/program';

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);
const { t } = useI18n();
// 定义字典
const { model_type, file_type, experiment_type } = useDict('model_type', 'file_type', 'experiment_type');

const selectFileValue = ref('');
const loading = ref(false);

//编辑实验所展示但不需要编辑的参数
// const expForm = ref<any>({});

//项目参数
const programParams = ref<any>({
  programId: '',
  name: '',
  type: '',
  description: '',
});
// 实验参数
const expForm = ref<any>({
  experimentId: '',
  experimentName: '',
  type: '',
  description: '',
  modelId: '',
  datasetId: '',
  beginCheckpointPath: '',
});
//模型参数
const modelParams = ref();
//数据集参数
const datasetParams = ref();

//对话框可视化参数
const editExpDialogRef = ref();
const expDialogVisible = ref(false);
const modelDialogVisible = ref(false);
const datasetDialogVisible = ref(false);
const exportWeightDialogVisible = ref(false);
const exportReportDialogVisible = ref(false);

const props = defineProps({
  // 父组件传递的数据
  data: {
    type: Object,
    default: () => ([]),
  },
});

//编辑实验校验规则
const editExpRules = ref({
  experimentName: [
    {
      required: true,
      trigger: 'blur',
      validator: (rule: any, value: any, callback: any) => {
        if (value.trim().length >= 2) {
          callback();
        } else {
          callback(new Error('实验名称不少于2位'));
        }
      },
    },
  ],
  description: [{ required: true, message: '实验描述不能为空', trigger: 'blur' }],
});

//编辑实验
const editExp = (row: any, programData: any) => {
  console.log("xxxx", row, programData);

  expDialogVisible.value = true;

  nextTick(() => {
    editExpDialogRef.value.resetFields();
  })

  if (row) {
    Object.assign(expForm.value, row);
    programParams.value.name = programData.name;
  }
  // expForm.value.gpuName = row.gpuName ? row.gpuName + '-' + row.cardNum : '暂未选择';
};
//确认编辑实验按钮
const confirmEditExp = async () => {
  const valid = await editExpDialogRef.value.validate().catch(() => { });
  if (!valid) return false;

  try {
    loading.value = true;
    await editExpReq(expForm.value);
    useMessage().success(t('common.editSuccessText'));
    expDialogVisible.value = false;
    //刷新界面
    emit('refresh');
  } catch (err: any) {
    useMessage().error(err.msg);
  } finally {
    loading.value = false;
  }
};

//模型详情界面
const showModelDetail = async (modelId: any, experimentName: any) => {
  const result = await getModelInfoReq(modelId);
  modelParams.value = result.data;
  expForm.value.experimentName = experimentName;
  //使modelType从数字到字符串, 0--图像分类，1--物体检测，2--图像分割
  //从model_type中筛选出对应数字的值
  modelParams.value.modelType = model_type.value.find((item: any) => item.value === modelParams.value.modelType)?.label;
  modelDialogVisible.value = true;

};

//数据集详情界面
const showDatasetDetail = async (datasetId: any) => {
  const result = await getDatasetInfoReq(datasetId);
  datasetParams.value = result.data;
  datasetDialogVisible.value = true;
};

//导出模型权重界面
const showModelWeight = async (modelId: any) => {
  const result = await getModelInfoReq(modelId);
  modelParams.value = result.data;
  //使modelType从数字到字符串, 0--图像分类，1--物体检测，2--图像分割
  //从model_type中筛选出对应数字的值
  modelParams.value.modelType = model_type.value.find((item: any) => item.value === modelParams.value.modelType)?.label;
  exportWeightDialogVisible.value = true;
}

//导出报告界面
const showReportWeight = async () => {
  exportReportDialogVisible.value = true;
}

defineExpose({
  editExp,
  showModelDetail,
  showModelWeight,
  showReportWeight
});
</script>