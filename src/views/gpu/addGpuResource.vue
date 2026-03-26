<template>
  <el-dialog :title="dialogTitle" width="600" v-model="visible" :close-on-click-modal="false" draggable>
    <el-form ref="dataFormRef" :model="form" :rules="dataRules" label-width="110px" v-loading="loading">
      <el-form-item :label="t('gpu.gpuName')" prop="gpuName">
        <el-input v-model="form.gpuName" :placeholder="t('gpu.gpuNameInputTip')" />
      </el-form-item>
      <el-form-item :label="t('gpu.gpuId')" prop="gpuId">
        <el-input v-model="form.gpuId" :placeholder="t('gpu.gpuIdInputTip')" />
      </el-form-item>
      <el-form-item :label="t('gpu.cardNum')" prop="cardNum">
        <el-input v-model="form.cardNum" :placeholder="t('gpu.cardNumInputTip')" />
      </el-form-item>
      <el-form-item :label="t('gpu.ipAddr')" prop="ipAddr">
        <el-input v-model="form.ipAddr" :placeholder="t('gpu.ipAddrInputTip')" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">{{ $t('common.cancelButtonText') }}</el-button>
        <el-button type="primary" @click="onSubmit" :disabled="loading">{{ $t('common.confirmButtonText') }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="systemModelDialog">
import { useMessage } from '/@/hooks/message';
import { getObj, putObj, addObj, validateGpuId } from '/@/api/project/gpu';
import { useI18n } from 'vue-i18n';

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

const { t } = useI18n();

// 定义变量内容
const dataFormRef = ref();
const visible = ref(false);
const loading = ref(false);
const dialogTitle = ref('');

// 提交表单数据
const form = ref({ id: '', gpuId: '', gpuName: '', cardNum: '', ipAddr: '' }) as any;

// 定义校验规则
const dataRules = ref({
  gpuName: [
    { required: true, message: 'GPU名称不能为空', trigger: 'blur' },
  ],
  gpuId: [{ required: true, message: 'GPU-ID不能为空', trigger: 'blur' },
  {
    validator: (rule: any, value: any, callback: any) => {
      validateGpuId(rule, value, callback, form.value.id != '');
    },
    trigger: 'blur',
  },],
  ipAddr: [{ required: true, message: 'IP地址不能为空', trigger: 'blur' }],
});

// 打开弹窗
const openDialog = (id: string) => {
  visible.value = true;
  // 重置表单数据
  form.value.id = '';
  nextTick(() => {
    dataFormRef.value?.resetFields();
  });
  dialogTitle.value = t('gpu.gpuAdd')

  // 获取Model信息
  if (id) {
    form.value.gpuId = id;
    dialogTitle.value = t('gpu.gpuEdit')
    getGpuResource(id);
  }
};

// 提交
const onSubmit = async () => {
  const valid = await dataFormRef.value.validate().catch(() => { });
  if (!valid) return false;

  try {
    loading.value = true;
    form.value.id ? await putObj(form.value) : await addObj(form.value);
    form.value.id ? useMessage().success(t('gpu.updateGpuSuccess')) : useMessage().success(t('gpu.addGpuSuccess'));
    visible.value = false;
    emit('refresh');
  } catch (err: any) {
    useMessage().error(err.msg);
  } finally {
    loading.value = false;
  }
};

// 初始化表格数据
const getGpuResource = (id: string) => {
  form.value = {};
  // 获取部门数据
  getObj(id).then((res: any) => {
    form.value = res.data;
  }).catch((err: any) => { });
};

// 暴露变量
defineExpose({
  openDialog,
});
</script>
