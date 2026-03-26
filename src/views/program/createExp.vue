<template>
  <div class="layout-padding">
    <div class="layout-padding-auto layout-padding-view">
      <!-- 步骤栏 -->
      <div class="exp-steps">
        <div class="mt-3 px-6 text-4xl font-bold">
          {{ $t('experiment.experimentAdd') }}
        </div>
        <el-steps class="w-full px-40 min-w-80" :active="activeIndex" align-center finish-status="finish">
          <el-step :title="t('experiment.experimentStep1')" :icon="Edit" />
          <!-- <el-step :title="t('experiment.experimentStep2')" :icon="Menu" /> -->
          <el-step :title="t('experiment.experimentStep3')" :icon="Operation" />
        </el-steps>
      </div>
      <el-divider border-style="dashed" />
      <!-- 1.基本信息 -->
      <div class="flex justify-center my-6 overflow-y-scroll h-4/6" v-show="activeIndex === 0" v-loading="loading"
        element-loading-text="正在加载数据集和模型数据">
        <el-form class="w-4/5 max-w-7xl" label-width="180px" label-suffix="：" :model="expForm" ref="step1Ref"
          :rules="step1Rules">
          <el-form-item :label="t('experiment.experimentName')" prop="experimentName">
            <el-input v-model="expForm.experimentName"
              :placeholder="$t('experiment.experimentNameInputTip')"></el-input>
          </el-form-item>
          <!-- <el-form-item :label="t('experiment.experimentType')" prop="type">
            <div class="w-full flex justify-between">
              <el-card v-for="(item, index) in experiment_type" :key="index" shadow="hover"
                :class="['w-68', 'cursor-pointer', { '!border-primary !bg-[#F4F7FE]': expForm.type === item.value }]"
                @click="selectCard(item)">
                <template #header>
                  <div class="flex justify-center item-center">
                    <i :class="['iconfont', '!text-4xl', 'text-primary', item.remarks]"></i>
                    <span class="ml-2 text-lg font-extrabold">{{ item.label }}</span>
                  </div>
                </template>
<p :class="['line-clamp-2', { 'font-bold': item.value == expForm.type }]">
  {{ item.desc }}
</p>
</el-card>
</div>
</el-form-item> -->
          <el-form-item :label="t('experiment.experimentDesc')" prop="description">
            <el-input v-model="expForm.description" type="textarea" :rows="4"
              :placeholder="t('experiment.experimentDescInputTip')"></el-input>
          </el-form-item>
          <el-form-item :label="t('experiment.experimentCopy')" prop="expImportId">
            <el-select v-model="expForm.expImportId" :placeholder="t('experiment.inputExpImportTip')"
              @change="changeImportSelect" clearable>
              <el-option v-for="item in importExpList" :key="item.experimentId" :label="item.experimentName"
                :value="item.experimentId" />
            </el-select>
          </el-form-item>
          <el-form-item :label="t('experiment.trainingAlgorithm')" prop="expImportInfo">
            <el-select v-model="expForm.expImportInfo">
              <!-- <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" /> -->
            </el-select>
          </el-form-item>
          <el-form-item :label="t('experiment.experimentDatasetSelect')" prop="datasetId">
            <el-select v-model="expForm.datasetId" clearable :placeholder="t('experiment.inputExpDatasetTip')"
              @change="onDatasetChange">
              <el-option-group v-for="group in allDatasetList" :key="group.baseDatasetId" :label="group.baseDatasetName"
                :value="group.baseDatasetId">
                <el-option v-for="item in group.datasetList" :key="item.datasetId" :label="item.datasetName"
                  :value="item.datasetId">
                  <span style="float: left">{{ item.datasetName }}</span>
                  <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px">
                    <dict-tag :options="model_type" :value="item.labelType"></dict-tag>
                  </span>
                </el-option>
              </el-option-group>
            </el-select>
          </el-form-item>

          <el-form-item :label="t('experiment.labelTask')" prop="taskId">
            <el-select v-model="expForm.taskId" clearable :placeholder="t('experiment.selectServicePath')">
              <el-option v-for="item in labelTask" :key="item.taskId" :label="item.taskId" :value="item.taskId">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="t('experiment.servicePath')" prop="modelPath">
            <el-select v-model="expForm.expImportInfo" clearable :placeholder="t('experiment.selectServicePath')">
              <!-- <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" /> -->
            </el-select>
          </el-form-item>
          <!-- <el-form-item :label="t('experiment.modelFile')" prop="">
            <el-upload ref="upload" class="w-full" action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
              :limit="1" :on-exceed="handleExceed" :auto-upload="false">
              <template #trigger>
                <el-button type="primary">{{ t('experiment.selectModelFile') }}</el-button>
                <el-button class="ml-3" type="success" @click="submitUpload">
                  {{ t('experiment.uploadServerTip') }}
                </el-button>
              </template>

            </el-upload>
          </el-form-item>
          <el-form-item :label="t('experiment.modelWeights')" prop="">
            <el-tree-select :data="checkpointData" :render-after-expand="false" show-checkbox
              v-model="expForm.beginCheckpointPath" clearable
              :placeholder="t('experiment.experimentModelConfigInputTip')" />
            <el-upload ref="upload" class="w-full mt-4"
              action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15" :limit="1" :on-exceed="handleExceed"
              :auto-upload="false">
              <template #trigger>
                <el-button type="primary">{{ t('experiment.selectModelWeights') }}</el-button>
                <el-button class="ml-3" type="success" @click="submitUpload">
                  {{ t('experiment.uploadServerTip') }}
                </el-button>
              </template>

            </el-upload>
          </el-form-item> -->
        </el-form>
      </div>
      <!-- 2.数据准备 -->
      <!-- <div class="flex justify-center my-6 overflow-y-scroll h-5/6" v-show="activeIndex === 1" v-loading="loading"
        element-loading-text="增在加载模型参数">
        <el-form class="w-4/5 max-w-7xl" label-width="180px" :model="expForm" ref="step2Ref" :rules="step2Rules">
          <el-form-item :label="t('experiment.experimentModelSelect')" prop="modelId">
            <el-select v-model="expForm.modelId" :placeholder="t('experiment.inputExpModelTip')"
              @change="getCheckpointData" clearable>
              <el-option-group v-for="group in allModelList" :key="group.baseModelId" :label="group.baseModelName">
                <el-option v-for="item in group.modelList" :key="item.modelId" :label="item.modelName"
                  :value="item.modelId">
                  <span style="float: left">{{ item.modelName }}</span>
                  <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px">
                    <dict-tag :options="model_type" :value="item.modelType"></dict-tag>
                  </span>
                </el-option>
              </el-option-group>
            </el-select>
          </el-form-item>
          <el-form-item :label="t('experiment.experimentModelConfig')" prop="beginCheckpointPath">
            <el-tree-select :data="checkpointData" :render-after-expand="false" show-checkbox
              v-model="expForm.beginCheckpointPath" clearable
              :placeholder="t('experiment.experimentModelConfigInputTip')" />
          </el-form-item>
          <el-form-item />
          <el-form-item :label="t('experiment.experimentDatasetSelect')" prop="datasetId">
            <el-select v-model="expForm.datasetId" clearable :placeholder="t('experiment.inputExpDatasetTip')">
              <el-option-group v-for="group in allDatasetList" :key="group.baseDatasetId" :label="group.baseDatasetName"
                :value="group.baseDatasetId">
                <el-option v-for="item in group.datasetList" :key="item.datasetId" :label="item.datasetName"
                  :value="item.datasetId">
                  <span style="float: left">{{ item.datasetName }}</span>
                  <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px">
                    <dict-tag :options="model_type" :value="item.labelType"></dict-tag>
                  </span>
                </el-option>
              </el-option-group>
            </el-select>
          </el-form-item>
          <el-form-item :label="t('experiment.experimentDatasetDivide')">
            <template #default="">
              <el-table class="w-full" :data="expForm.separate" border>
                <el-table-column width="80" class-name="!text-center">
                  <el-text>{{ t('experiment.experimentDatasetRatio') }}</el-text>
                </el-table-column>
                <el-table-column :label="t('experiment.experimentDatasetTrain')" class-name="!text-center">
                  <el-input v-model="expForm.separate[0].train" :disabled="expForm.type !== '0'"
                    :placeholder="datasetDividePlaceholder.train"></el-input>
                </el-table-column>
                <el-table-column :label="t('experiment.experimentDatasetValidate')" class-name="!text-center">
                  <el-input v-model="expForm.separate[0].evaluate" :disabled="expForm.type !== '0'"
                    :placeholder="datasetDividePlaceholder.evaluate"></el-input>
                </el-table-column>
                <el-table-column :label="t('experiment.experimentDatasetTest')" class-name="!text-center">
                  <el-input v-model="expForm.separate[0].test" :disabled="expForm.type !== '0'"
                    :placeholder="datasetDividePlaceholder.test"></el-input>
                </el-table-column>
              </el-table>
            </template>
          </el-form-item>
        </el-form>
      </div> -->

      <!-- 3.参数配置 -->
      <div class="flex justify-center w-full h-5/6 my-6 overflow-y-scroll " v-show="activeIndex === 2"
        v-loading="loading" element-loading-text="正在上传实验数据">
        <JsonEditorVue v-model="jsonData" @change="onJsonChange" @blur="onEditorBlur"
          @validationError="onValidationError" class="w-full h-full" />
      </div>
      <!-- <div class="h-5/6 my-6 overflow-y-scroll " v-show="activeIndex === 2" v-loading="loading"
        element-loading-text="正在上传实验数据"> -->
      <!-- 任务选择 -->
      <!-- <div class="flex justify-center mb-8">
          <el-radio-group v-model="currentTask" size="large" @change="handleTaskChange">
            <el-radio-button label="classification">图像分类</el-radio-button>
            <el-radio-button label="detection">目标检测</el-radio-button>
            <el-radio-button label="segmentation">图像分割</el-radio-button>
          </el-radio-group>
        </div> -->
      <!-- 配置面板 -->
      <!-- <div class="w-4/5 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6"> -->
      <!-- 通用超参数 -->
      <!-- <el-card class="shadow-md">
            <template #header>
              <div class="text-4xl font-bold text-[#4a6fa5]">
                <span>通用超参数</span>
              </div>
            </template>
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Batch Size</label>
                <el-input-number v-model="hyperParams.batchSize" :min="1" :max="512" size="large" class="w-full" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Epochs</label>
                <el-input-number v-model="hyperParams.epochs" :min="1" :max="1000" size="large" class="w-full" />
              </div>

              <div class="w-full">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Learning Rate: {{ hyperParams.learningRate }}
                </label>
                <div class="flex align-center">
                  <el-slider v-model="hyperParams.learningRate" :min="0.0001" :max="0.1" :step="0.0001"
                    :format-tooltip="formatLearningRate" show-input />
                </div>

              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Optimizer</label>
                <el-select v-model="hyperParams.optimizer" size="large" class="w-full">
                  <el-option label="SGD" value="SGD" />
                  <el-option label="Adam" value="Adam" />
                  <el-option label="RMSprop" value="RMSprop" />
                </el-select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Dropout: {{ hyperParams.dropout }}
                </label>
                <el-slider v-model="hyperParams.dropout" :min="0" :max="0.8" :step="0.05" show-input />
              </div>
            </div>
          </el-card> -->

      <!-- 数据增强 -->
      <!-- <el-card class="shadow-md" header="数据增强">
            <template #header>
              <div class="text-4xl font-bold text-[#4a6fa5]">
                <span>数据增强</span>
              </div>
            </template>
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">数据增强方法</label>
                <div class="space-y-2">
                  <el-checkbox v-model="dataAugmentation.randomFlip">随机翻转</el-checkbox>
                  <el-checkbox v-model="dataAugmentation.randomCrop">随机裁剪</el-checkbox>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  缩放比例: {{ dataAugmentation.scale }}
                </label>
                <el-slider v-model="dataAugmentation.scale" :min="0.5" :max="2" :step="0.1" show-input />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  亮度调整: {{ dataAugmentation.brightness }}
                </label>
                <el-slider v-model="dataAugmentation.brightness" :min="0.1" :max="2" :step="0.1" show-input />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  对比度调整: {{ dataAugmentation.contrast }}
                </label>
                <el-slider v-model="dataAugmentation.contrast" :min="0.1" :max="2" :step="0.1" show-input />
              </div>
            </div>
          </el-card> -->

      <!-- 评估指标 -->
      <!-- <el-card class="shadow-md col-span-2" header="评估指标">
            <template #header>
              <div class="text-4xl font-bold text-[#4a6fa5]">
                <span>评估指标</span>
              </div>
            </template>
            <div class="space-y-4"> -->
      <!-- 图像分类指标 -->
      <!-- <div v-if="currentTask === 'classification'">
                <el-checkbox-group v-model="evaluationMetrics.classification">
                  <div class="grid grid-cols-1 lg:grid-cols-3 gap-2">
                    <el-checkbox label="accuracy">准确率 (Accuracy)</el-checkbox>
                    <el-checkbox label="precision">精确率 (Precision)</el-checkbox>
                    <el-checkbox label="recall">召回率 (Recall)</el-checkbox>
                    <el-checkbox label="f1Score">F1 分数 (F1-Score)</el-checkbox>
                    <el-checkbox label="top5Accuracy">Top-5 准确率</el-checkbox>
                  </div>
                </el-checkbox-group>
              </div> -->

      <!-- 目标检测指标 -->
      <!-- <div v-if="currentTask === 'detection'">
                <el-checkbox-group v-model="evaluationMetrics.detection">
                  <div class="grid grid-cols-1 lg:grid-cols-3 gap-2">
                    <el-checkbox label="mAP">mAP</el-checkbox>
                    <el-checkbox label="ap50">AP@IoU=0.5</el-checkbox>
                    <el-checkbox label="ap5095">AP@IoU=0.5:0.95</el-checkbox>
                    <el-checkbox label="fps">FPS</el-checkbox>
                  </div>
                </el-checkbox-group>
              </div> -->

      <!-- 图像分割指标 -->
      <!-- <div v-if="currentTask === 'segmentation'">
                <el-checkbox-group v-model="evaluationMetrics.segmentation">
                  <div class="grid grid-cols-1 lg:grid-cols-3 gap-2">
                    <el-checkbox label="mIoU">mIoU</el-checkbox>
                    <el-checkbox label="dice">DICE 系数</el-checkbox>
                    <el-checkbox label="pixelAccuracy">像素准确率</el-checkbox>
                    <el-checkbox label="boundaryF1">边界 F1 分数</el-checkbox>
                  </div>
                </el-checkbox-group>
              </div>
            </div>
          </el-card>

        </div> -->


      <!-- 操作按钮 -->
      <!-- <div class="flex justify-center mt-8 space-x-4">
          <el-button type="primary" size="large" @click="saveConfig">
            保存配置
          </el-button>
          <el-button size="large" @click="resetConfig">
            重置
          </el-button>
        </div> -->

      <!-- 配置预览 -->
      <!-- <el-card class="mt-8 shadow-md" header="配置预览">
          <pre class="text-sm overflow-auto p-4 bg-gray-100 rounded">{{ configPreview }}</pre>
        </el-card> -->
      <!-- <el-form class="w-4/5 max-w-7xl" label-width="180px">
          <div class="mb-3">
            <span class="text-lg font-bold">{{ t('experiment.universalHyperparameter') }}:</span>
          </div>
          <el-form-item label="Batch Size">
            <el-input :placeholder="t('experiment.experimentNoTrainParam')"></el-input>
          </el-form-item>
          <el-form-item v-show="Object.keys(expForm.params).length === 0" :label="t('experiment.experimentTrainParam')">
            <el-input :disabled="Object.keys(expForm.params).length === 0"
              :placeholder="t('experiment.experimentNoTrainParam')"></el-input>
          </el-form-item>
          <el-form-item v-show="expForm.params" :label="item + ':'"
            v-for="(item, index) in Object.keys(expForm.params).sort()" :key="index" :name="item">
            <el-input v-model="expForm.params[item]"
              :placeholder="t('model.inputParamNameTip') + item + t('experiment.experimentParamValue')" />
            <div class="w-full" v-if="!(expForm.params[item] instanceof Object)">
              <el-input v-model="expForm.params[item]"
                :placeholder="t('model.inputParamNameTip') + item + t('model.valueName')" />
            </div>
            <div v-else class="w-full">
              <br />
              <el-form-item class="p-1" :label="child + ':'" label-width="2vw"
                v-for="(child, childIndex) in Object.keys(expForm.params[item]).sort()" :key="childIndex">
                <div class="w-full" v-if="!(expForm.params[item][child] instanceof Object)">
                  <el-input v-model="expForm.params[item][child]"
                    :placeholder="t('model.inputParamNameTip') + child + t('model.valueName')" />
                </div>
                <div v-else class="w-full">
                  <br />
                  <el-form-item class="p-1" label-width="2vw" :label="subChild + ':'"
                    v-for="(subChild, subChildIndex) in Object.keys(expForm.params[item][child]).sort()"
                    :key="subChildIndex">
                    <el-input v-model="expForm.params[item][child][subChild]"
                      :placeholder="t('model.inputParamNameTip') + subChild + t('model.valueName')" />
                  </el-form-item>
                </div>
              </el-form-item>
            </div>
          </el-form-item>
          <el-form-item />
          <div class="mb-3">
            <span class="text-lg font-bold">性能指标:</span>
          </div>
          <el-form-item>
            <el-checkbox-group v-model="metricsJson" @change="metricsJsonInfo">
              <el-checkbox v-for="(item, key) in experiment_Performance_index" :label="item.label" :key="key"
                :value="item.label" />
            </el-checkbox-group>
          </el-form-item>
        </el-form> -->
      <!-- </div> -->
      <el-divider />
      <!-- 底部按钮 -->
      <div class="px-6 text-right">
        <el-button class="!px-12" size="default" type="default" @click="changeSteps('pre')"
          v-show="expForm.programId && (activeIndex != 0)">{{
            $t('experiment.experimentPreviousStep')
          }}</el-button>
        <el-button class="!px-12" size="default" type="primary" @click="changeSteps('next')"
          v-show="expForm.programId && (activeIndex != 2)">{{
            $t('experiment.experimentNextStep')
          }}</el-button>
        <el-button class="!px-12" size="default" type="primary" @click="addExp" v-show="activeIndex === 2">{{
          $t('experiment.addBtn')
        }}</el-button>
        <el-button class="!px-12" size="default" @click="closeCrateTrain">{{ $t('common.cancelButtonText')
        }}</el-button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { Edit, Menu, Operation } from '@element-plus/icons-vue';
import { addExpReq, getDatasetListReq, getModelListReq, getCheckpointList, getExperimentList, validateExpName, getModelInfoReq, getProgramInfoReq, getProgramByIdorNameReq, getExperimentListReq } from '/@/api/project/program';
import { getListDatasetGroup } from '/@/api/dataset/manage';
import { useI18n } from 'vue-i18n';
import { useDict } from '/@/hooks/dict';
import { ref } from 'vue';
import { getModelConfig, updateModelConfig, getListModelGroup } from '/@/api/model/model';
import { fetchDatasetLabelList } from '/@/api/dataset/detail';
import { getProgramByIdReq } from '/@/api/project/program'
import { useMessage, useMessageBox } from '/@/hooks/message';
import type { UploadInstance, UploadProps, UploadRawFile } from 'element-plus'
import mittBus from "/@/utils/mitt";

import 'jsoneditor';
import JsonEditorVue from 'json-editor-vue3'

const upload = ref<UploadInstance>()

//切换场景自定义事件
const emit = defineEmits(['changeScene', 'refresh']);

// 定义字典
const { experiment_type } = useDict('experiment_type');
const { experiment_Performance_index } = useDict('experiment_Performance_index');
const { model_type } = useDict('model_type');

// 引入组件
const { t } = useI18n();
//定义各个步骤表单ref
const step1Ref = ref();
const step2Ref = ref();
//切换步骤方法和场景变量
const loading = ref(false);
const activeIndex = ref(0);
//储存所有数据集,模型列表
const importExpList = ref();
const allDatasetList = ref();
const allModelList = ref();
const checkpointData = ref();
const metricsJson = ref([]);
const datasetDividePlaceholder = reactive({
  train: '',
  evaluate: '',
  test: '',
})
const labelTask = ref()
const jsonEditActive = ref(false);

const list = ref([{ key: '', value: '' }]);

// 定义响应式 JSON 数据
const jsonData = reactive({
  batch_size: 128,
  loss_function: 'torch.nn.modules.loss.CrossEntropyLoss',
  epochs: 100,
  accuracy: true,
  precision: true
})

const expForm = reactive({
  expImportId: '',
  experimentId: '',
  experimentName: '',
  type: '',
  description: '',
  programId: '',
  programType: '',
  modelId: '',
  datasetId: '',
  taskId: '',
  beginCheckpointPath: '',
  hyperParameters: '',
  metrics: '',
  stauts: '0',
}) as any;



const route = useRoute();
const router = useRouter();
onMounted(async () => {
  console.log("onMounted");

  const queryIds = route.query.programId;
  if (queryIds) {
    try {
      const programRes = await getProgramByIdorNameReq({ programId: queryIds })
      if (programRes.code == 0) {
        let programDetail = programRes.data;
        expForm.programId = programDetail.programId;
        expForm.programType = programDetail.labelType;
        expForm.experimentId = '';
        // if (programDetail.experimentList && programDetail.experimentList.length > 0) {
        //   importExpList.value = programDetail.experimentList;
        // }

        // 重置表单数据
        nextTick(() => {
          step1Ref.value.resetFields();
        });
      }

      const expListRes = await getExperimentListReq({ programId: expForm.programId, current: 1, size: 100 })
      if (expListRes.code == 0 && expListRes.data.total > 0) {
        importExpList.value = expListRes.data.records
      } else {
        importExpList.value = [];
      }
      const datasetRes = await getListDatasetGroup({ labelType: expForm.programType });
      allDatasetList.value = datasetRes.data;
      // await getCheckpointData();

    } catch (error: any) {
      useMessageBox()
        .confirm('未关联到项目ID' + error.msg)
        .then(() => {
          router.push({ path: '/program/index' });
        });
    }
  }
})

onUnmounted(() => {

  console.log('💀 已清理资源')
})

//定义各个步骤校验规则
const step1Rules = ref({
  experimentName: [
    { required: true, message: '实验名称不能为空', trigger: 'blur' },
    { min: 3, max: 20, message: '实验名称长度必须在3到20个字符之间', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        validateExpName(rule, value, expForm.programId, callback, expForm.experimentId !== '');
      },
      trigger: 'blur',
    },
  ],
  type: [{ required: true, message: '请选择实验类型', trigger: 'blur' }],
  description: [{ required: true, message: '实验描述不能为空', trigger: 'blur' }],
  datasetId: [{ required: true, message: '数据集选择不能为空', trigger: 'blur' }],
});

const step2Rules = ref({
  modelId: [{ required: true, message: '模型选择不能为空', trigger: 'blur' }],
  datasetId: [{ required: true, message: '数据选择不能为空', trigger: 'blur' }],
});

const changeSteps = async (type: string) => {
  if (type === 'next') {
    const valid = await step1Ref.value.validate().catch(() => { });
    if (!valid) return false;

    // if (activeIndex.value === 0 && !(allDatasetList.value && allModelList.value)) {
    //   loading.value = true
    //   await getDatasetAndModelList();
    // }
    // if (expForm.modelId && activeIndex.value === 0) {
    //   loading.value = true
    //   await getCheckpointData();
    // }


    if (activeIndex.value === 1) {
      const valid = await step2Ref.value.validate().catch(() => { });
      if (!valid) return false;

      loading.value = true
      getModelConfigData(expForm.modelId, false, '', '');
    }

    // 判断清空数据集划分
    if (expForm.type !== '0') {
      expForm.separate = [
        {
          train: '',
          evaluate: '',
          test: '',
        },
      ];
      if (expForm.type === '1') {
        datasetDividePlaceholder.train = t('experiment.inputExpEvalNoDataset')
        datasetDividePlaceholder.evaluate = t('experiment.inputExpEvalNoDataset')
        datasetDividePlaceholder.test = t('experiment.inputExpEvalNoDataset')
      } else {
        datasetDividePlaceholder.train = t('experiment.inputExpTestNoDataset')
        datasetDividePlaceholder.evaluate = t('experiment.inputExpTestNoDataset')
        datasetDividePlaceholder.test = t('experiment.inputExpTestNoDataset')
      }
    } else {
      datasetDividePlaceholder.train = t('experiment.inputExpDatasetTrainTip')
      datasetDividePlaceholder.evaluate = t('experiment.inputExpDatasetValidateTip')
      datasetDividePlaceholder.test = t('experiment.inputExpDatasetTestTip')
      expForm.separate = [
        {
          train: '8',
          evaluate: '2',
          test: '1',
        },
      ];
    }
    activeIndex.value = 2;
    jsonEditActive.value = true;
  }
  else if (type === 'pre') {
    if (activeIndex.value == 1) {
      expForm.beginCheckpointPath = '';
      expForm.modelId = '';
      expForm.datasetId = '';
    }
    activeIndex.value = 0;
    jsonEditActive.value = false;
  }
};

// 初始化界面数据
const initData = () => {
  activeIndex.value = 0;
  importExpList.value = null;
  allDatasetList.value = null;
  allModelList.value = null;
  checkpointData.value = null;
  expForm.params = {};
  expForm.separate = [
    {
      train: '8',
      evaluate: '2',
      test: '1',
    },
  ];
  expForm.metrics = '';
}

//关闭开始训练，通知父组件切换场景
const closeCrateTrain = () => {
  initData();
  // emit('changeScene', 0);
  // emit('refresh');
  router.push({
    path: '/program/index',
  });
  mittBus.emit('onCurrentContextmenuClick', Object.assign({}, { contextMenuClickId: 1, ...route }));
};

//开始训练，通知父组件切换场景
const addExp = async () => {
  if (!jsonStatus.value) {
    console.log("jsonInfo", jsonInfo.value);

    useMessageBox().error(`json文件格式错误:${jsonInfo.value?.[0]?.message}`)
    return false
  }
  loading.value = true
  // 构造 FormData
  const formData = new FormData()
  try {
    // 1. 收集 jsonData 中值为 true 的字段名
    const metricsArr = Object.keys(jsonData).filter(key => jsonData[key] === true)
    expForm.metrics = JSON.stringify(metricsArr)
    expForm.hyperParameters = JSON.stringify(jsonData)
    formData.append('experiment', new Blob([JSON.stringify(expForm)], { type: 'application/json' }))
  } catch (error) {

  }

  const res = await addExpReq(formData);
  loading.value = false;
  mittBus.emit(
    "onCurrentContextmenuClick",
    Object.assign({}, { contextMenuClickId: 1, ...route })
  );
  if (res && res.code === 0) {
    useMessage().success("添加完成");
    router.push({
      path: '/program/expList',
      query: { programId: expForm.programId },
    });
  } else {
    useMessage().error(res.msg);
    return false;
  }
  // initData();
  // emit('refresh');
  // emit('changeScene', 0);
};



const openDialog = (programDetail: any) => {
  // 判断programDetail的programId属性是否为空
  // if (!(programDetail && programDetail.programId)) {
  //   useMessageBox().error("未关联到项目ID");
  //   return;
  // }
  expForm.programId = programDetail.programId;
  expForm.programType = programDetail.type;
  expForm.experimentId = '';
  if (programDetail.experimentList.length > 0) {
    importExpList.value = programDetail.experimentList;
  }

  // 重置表单数据
  nextTick(() => {
    step1Ref.value.resetFields();
    step2Ref.value.resetFields();
  });
};

//实验类型的卡片单选方法
const selectCard = (item: any) => {
  expForm.type = item.value;
  // step1Ref.value.clearValidate('type');
  // if (expForm.type == '1') {
  //   expForm.separate.train = '';
  //   expForm.separate.validate = '';
  //   expForm.separate.test = '';
  // }
};

//导入实验选中值发生变化时触发
const changeImportSelect = (value: any) => {


  if (!value) {
    // 清除选择时的处理
    expForm.datasetId = '';
    expForm.modelId = '';
    expForm.params = {};
    return;
  }
  const selectedItem = importExpList.value.find((item: any) => item.experimentId === value);
  expForm.datasetId = selectedItem.datasetId;
  expForm.modelId = selectedItem.modelId;
  // getCheckpointData();
  console.log("changeImportSelect", value, selectedItem, expForm);
};

//清空expPrams以及校验信息
const clearExpForm = () => {
  activeIndex.value = 0;
  expForm.separate = [];
  expForm.expImportId = '';
  nextTick(() => {
    step1Ref.value.resetFields();
    step2Ref.value.resetFields();
  });
};



//获取数据集和模型列表
const getDatasetAndModelList = async () => {
  // 将下列函数使用trycatch处理
  try {
    // const programRes = await getProgramByIdReq(expForm.programId)
    const datasetRes = await getListDatasetGroup({ labelType: expForm.programType });
    const modelRes = await getListModelGroup({ baseModelType: expForm.programType });

    allDatasetList.value = datasetRes.data;
    allModelList.value = modelRes.data;
  } catch (err: any) {
    useMessage().error(err.msg || "未获取到getDatasetAndModelList")
  } finally {
    loading.value = false
  }
};

const getCheckpointData = async () => {
  try {
    const checkpointRes = await getCheckpointList('', expForm.modelId, '');
    checkpointData.value = checkpointRes.data;

    // 训练时，选择模型，模型显示模型开始权重
    if (expForm.type == '0') {
      const modelInfo = await getModelInfoReq(expForm.modelId);
      expForm.beginCheckpointPath = modelInfo.data.pretrainCheckpoint;
    }
  } catch (err) {
    useMessage().error("未获取到checkpointData")
  } finally {
    loading.value = false;
  }
  //根据ModelId获取checkPointPath
  // allModelList.value.forEach((item: any) => {
  //   item.modelList.forEach((ite: any) => {
  //     if (ite.modelId == expForm.modelId) {
  //       expForm.beginCheckpointPath = ite.pretrainCheckpoint;
  //     }
  //   });
  // });
}

// 初始化表格数据
const getModelConfigData = (id: string, isBaseModel: boolean, configType?: string, modelClass?: string) => {
  expForm.params = {};
  // 获取部门数据
  getModelConfig(id, isBaseModel, configType, modelClass).then((res: any) => {
    let data = JSON.parse(res.data);
    if (data.params) {
      expForm.params = data.params
    } else {
      useMessage().wraning(t('model.noModelTrainConfig'));
    }
    loading.value = false;
  });
};

const metricsJsonInfo = (value: any) => {
  console.log("xxxx", value);

};

const onDatasetChange = (datasetId: string) => {

  fetchDatasetLabelList({ datasetId }).then(res => {
    // 处理返回结果
    if (res.code === 0) {
      if (!res.data || typeof res.data !== 'string' || res.data.trim() === '') {
        useMessage().error('数据集标签为空，请检查数据集配置');
        return;
      }
      try {
        labelTask.value = JSON.parse(res.data);
        console.log('选中的数据集ID:', datasetId, labelTask.value);
      } catch (error) {
        useMessage().error('数据集标签格式错误，请检查数据集配置');
        console.error('数据集标签解析错误:', error);
      }
    } else {
      useMessage().error(res.msg || '获取数据集标签失败');
    }
  });
}

const handleExceed: UploadProps['onExceed'] = (files) => {
  upload.value!.clearFiles()
  const file = files[0] as UploadRawFile
  upload.value!.handleStart(file)
}

const submitUpload = () => {
  upload.value!.submit()
}

/***************************** 参数配置 ****************************/
const jsonStatus = ref(false)
const jsonInfo = ref([])
const isActive = ref(false)

// 通用超参数
const hyperParams = reactive({
  batchSize: 32,
  epochs: 50,
  learningRate: 0.001,
  optimizer: 'Adam',
  dropout: 0.5
});

// 数据增强参数
const dataAugmentation = reactive({
  randomFlip: true,
  randomCrop: true,
  scale: 1.2,
  brightness: 1.0,
  contrast: 1.0
});

// 评估指标
const evaluationMetrics = reactive({
  classification: ['accuracy', 'precision', 'recall', 'f1Score'],
  detection: ['mAP', 'ap50'],
  segmentation: ['mIoU', 'dice']
});

/** 简单判断是否为原生 DOM Event */
function isNativeEvent(obj: any): boolean {
  // 一些浏览器/环境下 Event 有 isTrusted 属性
  if ('isTrusted' in obj && typeof obj.isTrusted === 'boolean') return true
  // 保险判断：有 type 且 target 且 timeStamp
  return !!(obj.type && obj.target && obj.timeStamp)
}

// 编辑器内容变化时触发
const onJsonChange = (newJson) => {
  console.log("onJsonChange", newJson, jsonData);
  if (isNativeEvent(newJson)) {
    // 如果是原生事件，直接返回
    return;
  } else {
    // 先清空原有属性，再赋值
    Object.keys(jsonData).forEach(key => {
      delete jsonData[key]
    })
    Object.assign(jsonData, newJson)
  }
};

// 失焦时校验 JSON 格式
const onEditorBlur = (editor, target) => {
  console.log("onEditorBlur", editor, target, jsonData);
  if (!jsonEditActive.value) return;
  if (editor && editor.lastSchemaErrors && editor.lastSchemaErrors.length == 0) {
    jsonStatus.value = true;
    useMessage().success("JSON 格式正确，已更新。");
  } else {
    jsonStatus.value = false;
    jsonInfo.value = editor.lastSchemaErrors;
    useMessage().error(`JSON 格式错误:${editor.lastSchemaErrors?.[0]?.message}`);
  }
};

// 捕获插件本身的错误回调（防止外部未捕获）
const onValidationError = (editor, errors) => {
  console.log("errors", editor, errors, jsonData);
  if (errors && errors.length == 0) {
    jsonStatus.value = true;
  } else {
    jsonStatus.value = false;
    jsonInfo.value = errors;
  }
};
// 当前任务
const currentTask = ref('classification');

// 处理任务切换
const handleTaskChange = (task) => {
  currentTask.value = task;
};

// 配置预览
const configPreview = computed(() => {
  const config = {
    task: currentTask.value,
    hyperParams: { ...hyperParams },
    dataAugmentation: { ...dataAugmentation },
    evaluationMetrics: { ...evaluationMetrics }
  };
  return JSON.stringify(config, null, 2);
});

// 格式化学习率显示
const formatLearningRate = (value) => {
  return value.toFixed(4);
};

// 保存配置
const saveConfig = () => {
  useMessage().success('配置已保存！');
  console.log('保存的配置:', {
    task: currentTask.value,
    hyperParams: { ...hyperParams },
    dataAugmentation: { ...dataAugmentation },
    evaluationMetrics: { ...evaluationMetrics }
  });
};

// 重置配置
const resetConfig = () => {
  useMessageBox().confirm('确定要重置所有配置吗').then(() => {
    // 重置通用超参数
    Object.assign(hyperParams, {
      batchSize: 32,
      epochs: 50,
      learningRate: 0.001,
      optimizer: 'Adam',
      dropout: 0.5
    });

    // 重置数据增强参数
    Object.assign(dataAugmentation, {
      randomFlip: true,
      randomCrop: true,
      scale: 1.2,
      brightness: 1.0,
      contrast: 1.0
    });

    // 重置评估指标
    Object.assign(evaluationMetrics, {
      classification: ['accuracy', 'precision', 'recall', 'f1Score'],
      detection: ['mAP', 'ap50'],
      segmentation: ['mIoU', 'dice']
    });

    useMessage().success('配置已重置');
  }).catch(() => {
    // 用户取消重置
  });
};

// 暴露变量
defineExpose({
  openDialog,
});
</script>

<style lang="scss" scoped>
::v-deep(.el-table th.el-table__cell) {
  background-color: #f5f7fa;
}

::v-deep(.el-card__header) {
  padding: 6px 20px !important;
}

::v-deep(.el-form-item__label-wrap) {
  margin-right: 2em;
}

::v-deep(.el-input-number) {
  width: auto;
}
</style>
