<template>
  <!-- 开始训练对话框 -->
  <div v-show="startTrainShow" v-loading="loading">
    <el-dialog v-model="startTrainVisible" :title="t('experiment.expStartTrain')" width="700" destroy-on-close
      @closed="closedDialog">
      <el-form v-loading="loading" class="w-4/5 m-5" ref="startTrainDialogRef" :model="expDetail"
        :rules="startTrainRules">
        <el-form-item :label="t('experiment.experimentId')" label-width="100px">
          <el-input v-model="expDetail.id" disabled></el-input>
        </el-form-item>
        <el-form-item :label="t('experiment.experimentName')" label-width="100px">
          <el-input v-model="expDetail.experimentName" disabled></el-input>
        </el-form-item>
        <el-form-item :label="t('experiment.serviceList')" label-width="100px" prop="gpuId">
          <el-select v-model="expDetail.resourceId" :placeholder="t('experiment.serviceListTip')">
            <el-option v-for="item in freeAlgolList" :key="item.id" :label="`${item.server}- ${item.status}`"
              :value="item.gpuId" />
          </el-select>
        </el-form-item>
        <el-form-item v-show="expDetail.status == '2'" :label="t('experiment.experimentRestart')" label-width="100px">
          <el-switch v-model="Restarting" active-value="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="startTrainVisible = false">{{ $t('common.cancelButtonText') }}</el-button>
        <el-button @click="startExp" type="primary">{{ $t('experiment.expStartExpBtn') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="expStartDialog">
import { useMessage, useMessageBox } from '/@/hooks/message';
import { getFreeGPUReq, updataTrain, getFreeAlgoReq, startTrain } from '/@/api/project/program';
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
  id: '',
  experimentId: '',
  experimentName: '',
  status: '',
  resourceId: '',
});
//闲置GPU列表
const freeAlgolList = ref();

//开始训练校验规则
const startTrainRules = ref({
  gpuId: [{ required: true, message: '机器资源不能为空', trigger: 'blur' }],
});

//实验状态
const openDialog = async (row: any) => {
  if (row.status == 'RUNNING') {
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
    let result = await getFreeAlgoReq({ current: 1, size: 100 });
    freeAlgolList.value = result.data.records;
    loading.value = false;
  }

};

// 开始实验
const startExp = async () => {
  if (expDetail.status == 'INIT' || expDetail.status == 'FAILED' || expDetail.status == 'KILLED') {
    const valid = await startTrainDialogRef.value.validate().catch(() => { });
    if (!valid) return false;
  }

  // if (expDetail.status == '0') {
  //   expDetail.experimentTag = '0';
  // } else if (expDetail.status == '1') {
  //   expDetail.experimentTag = '1';
  // } else if (expDetail.status == '2') {
  //   if (Restarting.value) {
  //     expDetail.experimentTag = '2';
  //   } else {
  //     expDetail.experimentTag = '3';
  //   }
  // } else if (expDetail.status == '3') {
  //   expDetail.experimentTag = '4';
  // }


  try {
    loading.value = true;
    const res = await startTrain({ id: expDetail.id, resourceId: expDetail.resourceId });
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