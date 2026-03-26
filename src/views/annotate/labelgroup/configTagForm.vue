<template>
  <el-dialog :title="t('labelGroup.labelTagConfig')" width="500" v-model="visible" :close-on-click-modal="false"
    draggable>
    <el-form class="max-w-7xl" ref="dataFormRef" :model="form" :rules="dataRules" label-width="auto">
      <el-row>
        <el-form-item :label="t('labelGroup.labelTagName')" prop="tagName" class="w-full">
          <el-input v-model="form.tagName" :placeholder="t('labelGroup.inputTagNameTip')" />
        </el-form-item>
      </el-row>
      <el-row class="mt-6">
        <el-form-item :label="t('labelGroup.labelTagColor')" prop="color" class="w-full">
          <el-color-picker v-model="form.color" :predefine="predefineColors" />
        </el-form-item>
      </el-row>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">{{ t('common.cancelButtonText') }}</el-button>
        <el-button type="primary" @click="onSubmit" :disabled="loading">{{
          t('common.confirmButtonText') }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="configTagForm">
import { useMessage } from '/@/hooks/message';
import { putTagObj, addObj, validateLabelTagName } from '/@/api/annotate/tag';
import { useI18n } from 'vue-i18n';

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

const { t } = useI18n();

// 定义变量内容
const dataFormRef = ref();
const visible = ref(false);
const loading = ref(false);

const predefineColors = ref([
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585',
])

// 提交表单数据
const form = ref({ tagId: '', groupId: '', tagName: '', color: '' }) as any;

// 定义校验规则
const dataRules = ref({
  tagName: [
    { required: true, message: t('labelGroup.tagNameTip'), trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        validateLabelTagName(rule, value, form.value.groupId, callback, form.value.tagId !== '');
      },
      trigger: 'blur',
    },
  ],
  color: [{ required: true, message: t('labelGroup.tagColorTip'), trigger: 'blur' }],
});

interface Tag {
  tagId: number;
  groupId: number;
  tagName: string;
  color: string;
}
// 打开弹窗
const openDialog = (tag: Tag) => {
  visible.value = true;
  // 重置表单数据
  form.value.tagId = '';
  form.value.groupId = '';
  form.value.tagName = '';
  form.value.color = '';

  // 获取Model信息
  if (tag.tagId) {
    form.value.tagId = tag.tagId;
    form.value.groupId = tag.groupId;
    form.value.tagName = tag.tagName;
    form.value.color = tag.color;
  } else {
    form.value.groupId = tag.groupId;
  }
  console.log("************8")
};

// 提交
const onSubmit = async () => {
  const valid = await dataFormRef.value.validate().catch(() => { });
  if (!valid) return false;

  if (loading.value) return;

  try {
    loading.value = true;
    form.value.tagId ? await putTagObj(form.value) : await addObj(form.value);
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
