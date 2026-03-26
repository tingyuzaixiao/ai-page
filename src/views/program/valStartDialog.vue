<template>
  <!-- 开始训练对话框 -->
  <div v-show="startTrainShow" v-loading="loading">
    <el-dialog v-model="startTrainVisible" :title="t('experiment.valStartTrain')" width="700" destroy-on-close
      @closed="closedDialog">
      <el-form v-loading="loading" class="w-4/5 m-5" ref="startTrainDialogRef" :model="expDetail"
        :rules="startTrainRules">
        <el-form-item :label="t('experiment.experimentId')" label-width="100px">
          <el-input v-model="expDetail.experimentId" disabled></el-input>
        </el-form-item>
        <el-form-item :label="t('experiment.experimentName')" label-width="100px">
          <el-input v-model="expDetail.experimentName" disabled></el-input>
        </el-form-item>
        <el-form-item :label="t('experiment.serverUrl')" label-width="100px" prop="serverUrl">
          <el-input v-model="expDetail.serverUrl" :placeholder="t('experiment.inputServerUrl')"></el-input>
        </el-form-item>
        <el-form-item :label="t('experiment.paramType')" label-width="100px" prop="paramType">
          <el-select v-model="expDetail.paramType" :placeholder="t('experiment.inputParamType')">
            <el-option label="字符" value="string" />
            <el-option label="数字" value="number" />
          </el-select>
        </el-form-item>
        <template v-if="expDetail.paramType === 'string'">
          <el-form-item label="参数1" label-width="100px">
            <el-input v-model="expDetail.param1" placeholder="请输入参数1" />
          </el-form-item>
          <el-form-item label="参数2" label-width="100px">
            <el-input v-model="expDetail.param2" placeholder="请输入参数2" />
          </el-form-item>
        </template>
        <template v-else-if="expDetail.paramType === 'number'">
          <el-form-item label="参数3" label-width="100px">
            <el-input v-model="expDetail.param3" placeholder="请输入参数3" />
          </el-form-item>
          <el-form-item label="参数4" label-width="100px">
            <el-input v-model="expDetail.param4" placeholder="请输入参数4" />
          </el-form-item>
        </template>
        <el-form-item :label="t('experiment.experimentSource')" label-width="100px" prop="gpuId">
          <el-select v-model="expDetail.gpuId" :placeholder="t('experiment.inputExpSourceTip')">
            <el-option v-for="item in freeGPUlList" :key="item.gpuId" :label="`${item.gpuName}- ${item.cardNum}`"
              :value="item.gpuId" />
          </el-select>
        </el-form-item>
        <el-form-item v-show="expDetail.status == '2'" :label="t('experiment.experimentRestart')" label-width="100px">
          <el-switch v-model="Restarting" active-value="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="startTrainVisible = false">{{ t('common.cancelButtonText') }}</el-button>
        <el-button @click="startExp" type="primary">{{ t('experiment.valStartExpBtn') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="expStartDialog">
import { useMessage, useMessageBox } from '/@/hooks/message';
import { getFreeGPUReq, updataTrain } from '/@/api/project/program';
import { useI18n } from 'vue-i18n';

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh', 'updataStatus']);

//引入组件
const { t } = useI18n();

//创建开始训练对话框
const loading = ref(false)
const startTrainShow = ref(true);
const startTrainVisible = ref(false);
const startTrainDialogRef = ref();
const Restarting = ref(false)
const expDetail = reactive({
  experimentId: '',
  experimentName: '',
  gpuId: '',
  status: '',
  experimentTag: '',
  serverUrl: '',
  paramType: '',
  param1: '',
  param2: '',
  param3: '',
  param4: ''
});
//闲置GPU列表
const freeGPUlList = ref();

//开始训练校验规则
const startTrainRules = ref({
  gpuId: [{ required: true, message: '机器资源不能为空', trigger: 'blur' }],
  serverUrl: [{ required: true, message: '服务器url不能为空', trigger: 'blur' }],
  paramType: [{ required: true, message: '参数类型不能为空', trigger: 'blur' }],
});

//实验状态
const openDialog = async (row: any) => {
  if (row.status == '1') {
    startTrainShow.value = false
    useMessageBox().confirm('是否暂停实验？').then(() => {
      startExp();
    }).catch(() => { return false })
  } else if (row.status == 3) {
    return false
  }
  startTrainVisible.value = true;

  loading.value = true;
  nextTick(() => {
    startTrainDialogRef.value.clearValidate();
  })

  if (row) {
    Object.assign(expDetail, row);
    let result = await getFreeGPUReq();
    freeGPUlList.value = result.data;
    loading.value = false;
  }

  console.log("expDetail00001", expDetail, row);


};

// 开始实验
const startExp = async () => {
  if (expDetail.status == '0' || expDetail.status == '2') {
    const valid = await startTrainDialogRef.value.validate().catch(() => { });
    if (!valid) return false;
  }

  if (expDetail.status == '0') {
    expDetail.experimentTag = '0';
  } else if (expDetail.status == '1') {
    expDetail.experimentTag = '1';
  } else if (expDetail.status == '2') {
    if (Restarting.value) {
      expDetail.experimentTag = '2';
    } else {
      expDetail.experimentTag = '3';
    }
  } else if (expDetail.status == '3') {
    expDetail.experimentTag = '4';
  }


  try {
    loading.value = true;
    const res = await updataTrain(expDetail);
    useMessage().success(t('success'));
    emit('refresh');
  } catch (err: any) {
    useMessage().error(err.msg);
  } finally {
    loading.value = false;
    startTrainVisible.value = false;
  }
}

const closedDialog = () => {
  startTrainShow.value = true
  Restarting.value = false;
}

defineExpose({
  openDialog,
});
</script>