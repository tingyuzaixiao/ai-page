<template>
  <!-- 步骤栏 -->
  <div class="model-steps">
    <div class="mt-3 px-6 text-4xl font-bold" style="background: #fff">
      {{ modelParams.modelId ? $t('model.editModel') : $t('model.createModel') }}
    </div>
    <el-steps class="w-full px-40 min-w-80" :active="activeIndex" align-center finish-status="finish">
      <el-step :title="t('experiment.experimentStep3')" :icon="Operation" />
      <el-step :title="t('experiment.experimentStep1')" :icon="Edit" />
    </el-steps>
  </div>
  <el-divider border-style="dashed" />
  <!-- 1.参数配置 -->
  <div class="flex justify-center my-3 overflow-y-scroll h-5/6" v-show="activeIndex === 0">
    <el-form class="w-4/5 max-w-7xl" label-width="auto" :model="modelParams" ref="step1Ref" :rules="step1Rules">
      <el-form-item :label="t('model.baseModel')" prop="baseModelId">
        <el-select v-model="modelParams.baseModelId" :placeholder="$t('model.inputBaseModelTip')" clearable
          @change="getModelParams(modelParams.baseModelId)">
          <el-option :key="item.baseModelId" :label="item.baseModelName" :value="item.baseModelId"
            v-for="item in baseModelList">
            <span style="float: left">{{ item.baseModelName }}</span>
            <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px">
              <dict-tag :options="model_type" :value="item.baseModelType"></dict-tag>
            </span>
          </el-option>
        </el-select>
      </el-form-item>
      <div v-show="Object.keys(modelParams.params).length != 0"
        class="ml-2 my-3 text-base text-[#606266] font-semibold">
        <span>{{ $t('model.modelParamsList') }}</span>
      </div>
      <el-form-item :label="item + ':'" v-for="(item, index) in Object.keys(modelParams.params).sort()" :key="index">
        <div class="w-full" v-if="!(modelParams.params[item] instanceof Object)">
          <el-input v-model="modelParams.params[item]"
            :placeholder="t('model.inputParamNameTip') + item + t('model.valueName')" />
        </div>
        <div v-else class="w-full">
          <br />
          <el-form-item class="p-1" :label="child + ':'" label-width="2vw"
            v-for="(child, childIndex) in Object.keys(modelParams.params[item]).sort()" :key="childIndex">
            <div class="w-full" v-if="!(modelParams.params[item][child] instanceof Object)">
              <el-input v-model="modelParams.params[item][child]"
                :placeholder="t('model.inputParamNameTip') + child + t('model.valueName')" />
            </div>
            <div v-else class="w-full">
              <br />
              <el-form-item class="p-1" label-width="2vw" :label="subChild + ':'"
                v-for="(subChild, subChildIndex) in Object.keys(modelParams.params[item][child]).sort()"
                :key="subChildIndex">
                <el-input v-model="modelParams.params[item][child][subChild]"
                  :placeholder="t('model.inputParamNameTip') + subChild + t('model.valueName')" />
              </el-form-item>
            </div>
          </el-form-item>
        </div>
      </el-form-item>
      <el-form-item :label="t('experiment.experimentModelConfig')" prop="pretrainCheckpoint">
        <el-tree-select :props="defaultProps" :data="checkpointData" :render-after-expand="false" show-checkbox
          v-model="modelParams.pretrainCheckpoint" accordion node-key="label"
          :placeholder="$t('model.selectModelCheckpointPath')" />
      </el-form-item>
    </el-form>
  </div>
  <!-- 2.基本信息 -->
  <div class="flex justify-center my-3 overflow-y-scroll h-5/6" v-show="activeIndex === 1">
    <el-form class="w-4/5 max-w-7xl" label-width="auto" :model="modelParams" ref="step2Ref" :rules="step2Rules">
      <el-form-item :label="t('model.modelName')" prop="modelName">
        <el-input v-model="modelParams.modelName" :placeholder="$t('model.modelNameInputTip')"></el-input>
      </el-form-item>

      <!-- <el-form-item :label="t('model.modelVersion')" prop="version">
        <el-input v-model="modelParams.version" :placeholder="$t('model.modelVersionInputTip')"></el-input>
      </el-form-item> -->
      <el-form-item :label="t('model.modelType')" prop="modelType">
        <el-select :placeholder="$t('model.inputModelTypeTip')" clearable v-model="modelParams.modelType"
          :disabled="modelParams.modelId">
          <el-option :key="item.value" :label="item.label" :value="item.value" v-for="item in model_type" />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('model.modelSource')" prop="resource">
        <el-input v-model="modelParams.resource" :placeholder="$t('model.modelSourceInputTip')"></el-input>
      </el-form-item>
      <el-form-item :label="t('model.modelDomain')" prop="domain">
        <el-input v-model="modelParams.domain" :placeholder="$t('model.modelDomainInputTip')"></el-input>
      </el-form-item>
      <el-form-item :label="t('model.modelLicense')" prop="license">
        <el-input v-model="modelParams.license" :placeholder="$t('model.modelLicenseInputTip')"></el-input>
      </el-form-item>
      <el-form-item :label="t('model.description')" prop="description">
        <el-input v-model="modelParams.description" type="textarea" rows="3"
          :placeholder="$t('model.descriptionInputTip')"></el-input>
      </el-form-item>
      <!-- <el-form-item :label="t('model.modelDownloadSource')" prop="experimentName">
            <el-input v-model="modelDisabledParams.downloadSource"></el-input>
          </el-form-item> -->
      <!-- <el-form-item :label="t('model.modelcatalogue')" prop="experimentName">
            <el-input v-model="modelDisabledParams.catalogue"></el-input>
          </el-form-item> -->
    </el-form>
  </div>

  <el-divider />
  <!-- 底部按钮 -->
  <div class="px-6 text-right">
    <el-button class="!px-12" size="default" @click="changeSteps('pre')" v-show="activeIndex != 0">{{
      $t('experiment.experimentPreviousStep')
    }}</el-button>
    <el-button class="!px-12" size="default" type="primary" @click="changeSteps('next')" v-if="activeIndex != 1">{{
      $t('experiment.experimentNextStep')
    }}</el-button>
    <el-button class="!px-12" size="default" type="primary" @click="createModelBtn" v-if="activeIndex === 1">{{
      $t('common.completeBtn')
    }}</el-button>
    <el-button class="!px-12" size="default" @click="closeCrateTrain">{{ $t('common.cancelButtonText') }}</el-button>
  </div>
</template>
<script lang="ts" setup>
import { getCheckpointList } from '/@/api/project/program';
import { fetchBaseList, validateModelName, getModelConfig } from '/@/api/model/model';
import { useI18n } from 'vue-i18n';
import { useDict } from '/@/hooks/dict';
import { ref } from 'vue';
import { Edit, Operation } from '@element-plus/icons-vue';
const defaultProps = {
  children: 'children',
  label: 'label',
};
// 定义字典
const { model_type } = useDict('model_type');

// 引入组件
const { t } = useI18n();
//切换步骤方法和场景变量
const activeIndex = ref(0);
const changeSteps = async (type: string) => {
  if (type === 'next') {
    await step1Ref.value.validate();
    if (activeIndex.value == 1) {
      await step2Ref.value.validate();
    }
    activeIndex.value++;
  } else {
    activeIndex.value--;
  }
};
//定义模型参数
const modelParams = reactive({
  modelId: '',
  baseModelId: '',
  modelName: '',
  version: 'V1.0',
  modelType: '',
  dataType: '',
  description: '',
  pretrainCheckpoint: '',
  resource: '',
  domain: '',
  license: '',
  params: {},
}) as any;

const list = ref([]) as any;
//储存所有基础模型列表
const baseModelList = ref<any>([]);
const checkpointData = ref<any>([]);

//切换场景自定义事件
const $emit = defineEmits(['changeScene', 'createModelBtn']);
//关闭创建模型，通知父组件切换场景
const closeCrateTrain = () => {
  $emit('changeScene', 0);
};
//创建模型，通知父组件切换场景
const createModelBtn = async () => {
  await step1Ref.value.validate();
  await step2Ref.value.validate();
  $emit('changeScene', 0);
  $emit('createModelBtn', modelParams);
};

//定义各个步骤表单ref
const step1Ref = ref();
const step2Ref = ref();
//定义各个步骤校验规则
const step1Rules = ref({
  baseModelId: [{ required: true, message: '请选择基础模型', trigger: 'blur' }],
});
const step2Rules = ref({
  modelName: [
    { required: true, message: '模型名称不能为空', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        validateModelName(rule, value, callback, false);
      },
      trigger: 'blur',
    },
  ],
  description: [{ required: true, message: '模型描述不能为空', trigger: 'blur' }],
  // version: [{ required: true, message: '模型版本不能为空', trigger: 'blur' }],
  modelType: [{ required: true, message: '模型类型不能为空', trigger: 'blur' }],
});

//清空expPrams以及校验信息
const clearModelParams = () => {
  activeIndex.value = 0;
  // modelParams.value.params = {}
  // modelParams.value = {};
  modelParams.params = {};
  checkpointData.value = [];
  baseModelList.value = [];
  // console.log(modelParams.value)
  nextTick(() => {
    step1Ref.value.resetFields();
    step2Ref.value.resetFields();
  });
};

//获取基础模型列表
const getParamsList = async () => {
  let baseModelRes = await fetchBaseList();
  baseModelList.value = baseModelRes.data;
};
const getModelParams = async (id: string) => {
  getModelConfigData(id, 'config', 'base');
  let checkpointRes = await getCheckpointList(id, '', '');
  // checkpointData.value = []
  checkpointData.value = checkpointRes.data;
  //修改模型类型并禁用
  // baseModelList.value.forEach((item: any) => {
  //   if (item.baseModelId == id) {
  //     modelParams.modelType = item.baseModelType;
  //     modelParams.dataType  = item.dataType;
  //   }
  // });
  const selectedItem = baseModelList.value.find((item: any) => item.baseModelId == id);
  if (selectedItem) {
    modelParams.modelType = selectedItem.baseModelType;
    modelParams.dataType = selectedItem.dataType;
  }
};

// 初始化表格数据
const getModelConfigData = (id: string, configType: string, modelClass: string) => {
  // 获取部门数据
  getModelConfig(id, false, configType, modelClass).then((res: any) => {
    // Object.assign(form, res.data);
    let data = JSON.parse(res.data);
    modelParams.params = {}
    if (data.params) {
      modelParams.params = data.params;
    }
  });
};

// 暴露变量
defineExpose({
  clearModelParams,
  getParamsList,
});
</script>

<style lang="scss" scoped>
.model-add-container {
  background: #fff;
  border: #e4e7ed solid 1px;
}

.card {
  width: 200px;
  height: 144px;
  margin: 10px 10px;
  cursor: pointer;
  background-color: #f4f7fe;
}

.is-selected {
  border: 1px solid #409eff;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 15px;
  font-size: 18px;
  font-weight: bold;
}

::v-deep .el-table th.el-table__cell {
  background-color: #f5f7fa;
}
</style>
