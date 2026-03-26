<template>
  <el-dialog :title="t('labelGroup.labelGroupConfig')" width="500" v-model="visible" :close-on-click-modal="false"
    draggable>
    <el-form class="max-w-7xl" ref="dataFormRef" :model="form" :rules="dataRules" label-width="auto"
      v-loading="loading">
      <el-row>
        <el-form-item :label="t('labelGroup.labelGroupName')" prop="groupName" class="w-full">
          <el-input v-model="form.groupName" :placeholder="t('labelGroup.inputLabelGroupNameTip')" />
        </el-form-item>
      </el-row>
      <el-row class="mt-6">
        <el-form-item :label="t('labelGroup.description')" prop="description" class="w-full">
          <el-input v-model="form.description" :autosize="{ minRows: 5, maxRows: 9 }" maxlength="200"
            :placeholder="t('labelGroup.descriptionInputTip')" show-word-limit type="textarea" />
        </el-form-item>
      </el-row>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">{{ t('common.cancelButtonText') }}</el-button>
        <el-button type="primary" @click="onSubmit" :disabled="loading" v-auth="'sys_labelgroup_add'">{{
          t('common.confirmButtonText') }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="labelGroupDialog">
import { useMessage } from '/@/hooks/message';
import { putObj, addObj, validateLabelGroupName } from '/@/api/annotate/label-group';
import { useI18n } from 'vue-i18n';

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

const { t } = useI18n();

// 定义变量内容
const dataFormRef = ref();
const visible = ref(false);
const loading = ref(false);


// 提交表单数据
const form = ref({ groupId: '', groupName: '', description: '' }) as any;

// 定义校验规则
const dataRules = ref({
  groupName: [
    { required: true, message: t('labelGroup.labelGroupTip'), trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        validateLabelGroupName(rule, value, callback, form.value.groupId !== '');
      },
      trigger: 'blur',
    },
  ],
});

// 打开弹窗
const openDialog = (id: number, name: string, description: string) => {
  visible.value = true;
  // 重置表单数据
  form.value.groupId = '';
  form.value.groupName = '';
  form.value.description = '';

  // 获取Model信息
  if (id) {
    form.value.groupId = id;
    form.value.groupName = name;
    form.value.description = description;
  }
};

// 提交
const onSubmit = async () => {
  const valid = await dataFormRef.value.validate().catch(() => { });
  if (!valid) return false;

  try {
    loading.value = true;
    form.value.groupId ? await putObj(form.value) : await addObj(form.value);
    useMessage().success(t('labelGroup.updateLabelGroupSuccess'));
    visible.value = false;
    emit('refresh');
  } catch (err: any) {
    useMessage().error(err.msg);
  } finally {
    loading.value = false;
  }
};

// 暴露变量
defineExpose({
  openDialog,
});
</script>
