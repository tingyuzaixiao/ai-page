<template>
  <div class="mt-3 px-6 text-4xl font-bold" style="background: #fff">
    {{ modelParams.baseModelId ? $t('baseModel.editBaseModel') : $t('baseModel.createBaseModel') }}
  </div>
  <el-divider border-style="dashed" />
  <div class="flex justify-center my-6 overflow-y-scroll h-5/6" v-show="activeIndex === 0">
    <el-form class="w-4/5 max-w-7xl" label-width="auto" :model="modelParams" ref="baseModelRef" :rules="baseModelRules"
      v-loading="loading">
      <el-form-item :label="t('baseModel.baseModelName')" prop="baseModelName">
        <el-input :placeholder="t('baseModel.inputBaseModelNameTip')" v-model="modelParams.baseModelName"></el-input>
      </el-form-item>
      <el-form-item v-show="modelParams.baseModelId" :label="t('baseModel.baseModelId')" prop="baseModelId">
        <el-input disabled :placeholder="t('baseModel.inputBaseModelIdTip')"
          v-model="modelParams.baseModelId"></el-input>
      </el-form-item>
      <!-- <el-form-item :label="t('baseModel.taskType')" prop="baseModelType">
        <div class="w-full flex justify-between">
          <el-card v-for="(item, index) in model_type" :key="index" shadow="hover"
            :class="['w-68', 'cursor-pointer', { '!border-primary !bg-[#F4F7FE]': modelParams.baseModelType === item.value }]"
            @click="selectCard(item.value)">
            <template #header>
              <div class="flex justify-center item-center">
                <i :class="['iconfont1', '!text-4xl', 'text-primary', item.remarks]"></i>
                <span class="ml-2 text-lg font-extrabold ">{{ item.label }}</span>
              </div>
            </template>
<span class="relative left-[-10px] top-[-8px] font-bold">应用场景</span>
<p class="relative left-[-10px] top-[5px] flex justify-between"
  :class="['line-clamp-2', { 'font-bold': item.value == modelParams.baseModelType }]">
  <el-tag type="primary" v-for="(desc, index) in item.desc.split(',')" :key="index">{{ desc }}</el-tag>
</p>
</el-card>
</div>
</el-form-item> -->
      <el-form-item class="!mb-4" :label="t('baseModel.dataType')" prop="dataType">
        <div class="w-full grid grid-cols-3 gap-3">
          <el-card
            :class="['w-68', 'text-center', 'cursor-pointer', { '!border-primary !bg-[#F4F7FE]': item.value == modelParams.dataType }]"
            body-class="" shadow="hover" v-for="(item) in data_type" :key="item.value" @click="selectCard(item.value)">
            <template #header>
              <div class="flex justify-center item-center">
                <span :class="['iconfont', '!text-4xl', 'text-primary', item.remarks]"></span>
                <span class="ml-2 text-lg font-extrabold ">{{ item.label }}</span>
              </div>
            </template>
            <p :class="['line-clamp-2', { 'font-bold': item.value == modelParams.dataType }]">{{ item.desc }}</p>
          </el-card>
        </div>
      </el-form-item>
      <el-form-item class="!mb-4" :label="t('baseModel.taskType')" prop="baseModelType">
        <el-select :placeholder="t('baseModel.importdataTyteTip')" class="w100" v-model="modelParams.baseModelType">
          <el-option :key="item.value" :label="item.label" :value="item.value" v-for="item in base_dataset_type" />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('baseModel.catalogue')" prop="catalogue">
        <el-input :placeholder="t('baseModel.inputcatalogueTip')" v-model="modelParams.catalogue"></el-input>
      </el-form-item>
      <el-form-item :label="t('baseModel.sourceType')" prop="sourceType">
        <el-input :placeholder="t('baseModel.inputsourceTypeTip')" v-model="modelParams.sourceType"></el-input>
      </el-form-item>
      <el-form-item :label="t('baseModel.description')" prop="description">
        <el-input :placeholder="t('baseModel.inputremarkTip')" type="textarea" maxlength="550" rows="5"
          v-model="modelParams.description"></el-input>
      </el-form-item>
    </el-form>
  </div>

  <el-divider />
  <!-- 底部按钮 -->
  <div class="px-6 text-right">
    <el-button class="!px-12" size="default" type="primary" @click="onSubmit">{{ modelParams.baseModelId ?
      $t('common.confirmModifyBtn') : $t('common.completeBtn')
    }}</el-button>
    <el-button class="!px-12" size="default" @click="closeCrateTrain">{{ $t('common.cancelButtonText') }}</el-button>
  </div>
</template>
<script lang="ts" setup>
import { validateBaseModelName, addObj, putObj, getObj } from '/@/api/model/base-model';
import { fetchList } from '/@/api/model/model';
import { useI18n } from 'vue-i18n';
import { useDict } from '/@/hooks/dict';
import { ref } from 'vue';
import { useMessage } from '/@/hooks/message';
const loading = ref(false);

// 定义字典
const { model_type } = useDict('model_type');
const { base_dataset_type, data_type } = useDict('base_dataset_type', 'data_type');

// 引入组件
const { t } = useI18n();
//切换步骤方法和场景变量
const activeIndex = ref(0);

//定义模型参数
const modelParams = reactive({
  baseModelId: '',
  baseModelName: '',
  version: 'V1.0',
  baseModelType: '',
  description: '',
  catalogue: '',
  dataType: '',
}) as any;



// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh', 'changeScene'])

//关闭创建模型，通知父组件切换场景
const closeCrateTrain = () => {
  emit('changeScene', 0);
};


//定义各个步骤表单ref
const baseModelRef = ref();

//定义各个步骤校验规则
const baseModelRules = ref({
  baseModelName: [
    { required: true, message: '基础模型名称不能为空', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        validateBaseModelName(rule, value, callback, modelParams.baseModelId !== '');
      },
      trigger: 'blur',
    },
  ],
  dataType: [{ required: true, message: '数据类型不能为空', trigger: 'blur' }],
  // description: [{ required: true, message: '基础模型描述不能为空', trigger: 'blur' }],
  baseModelType: [{ required: true, message: '基础模型类型不能为空', trigger: 'blur' }],
});


//清空expPrams以及校验信息
const openDialog = (id?: string) => {

  // 重置表单数据
  nextTick(() => {
    baseModelRef.value?.resetFields();
  });

  if (id) {
    getBaseModelData(id);
  }
};

// 初始化数据
const getBaseModelData = (id: string) => {
  // 获取基础数据集数据
  getObj(id).then((res: any) => {
    Object.assign(modelParams, res.data);
  });
};
// 选择类型
const selectCard = (value: string) => {
  modelParams.dataType = value
};

// 提交
const onSubmit = async () => {
  const valid = await baseModelRef.value.validate().catch(() => { });
  if (!valid) return false;

  try {
    loading.value = true;
    modelParams.baseModelId ? await putObj(modelParams) : await addObj(modelParams);
    useMessage().success(t(modelParams.baseModelId ? 'common.editSuccessText' : 'common.addSuccessText'));
    emit('refresh');
    closeCrateTrain()
  } catch (err: any) {
    useMessage().error(err.msg);
  } finally {
    loading.value = false;
  }
};

// 跟新模型
const updateModel = async () => {
  if (modelParams.baseModelName) {
    // try {
    //   let res = await fetchList({ baseModelName: modelParams.baseModelName });

    // }
  } else {
    useMessage().wraning("未获取基础模型名称")
  }

}

// 暴露变量
defineExpose({
  openDialog
});
</script>
