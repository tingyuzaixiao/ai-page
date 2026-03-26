<template>
  <el-dialog v-model="dialogFormVisible" :title="t('labelGroup.saveAs')" width="500">
    <el-form ref="dataFormRef" :model="form" :rules="dataRules" label-width="auto">
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
      <div class="dialog-footer">
        <el-button @click="closeSaveAs">{{ t('common.cancelButtonText') }}</el-button>
        <el-button type="primary" @click="saveAsLabelGroup" v-auth="'sys_labelgroup_add'">{{
          t('common.confirmButtonText') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="saveAsLabelGroup">
import { useMessage } from '/@/hooks/message';
import { saveByObj, validateLabelGroupName } from '/@/api/annotate/label-group';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// 定义变量内容
const dialogFormVisible = ref(false);
const dataFormRef = ref();

const form = ref({ groupName: '', description: '', tagName: '', color: '' }) as any;

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

interface Tag {
  tagId: string;
  tagName: string;
  color: string;
}
const selectItem = reactive<Tag[]>([
  // { tagName: '牡丹', tagId: '1', color: '#1E90FF' },
]);

// 打开弹窗
const openDialog = (tagList: Tag[]) => {
  dialogFormVisible.value = true;
  selectItem.length = 0;
  selectItem.push(...tagList);
};

const closeSaveAs = () => {
  dialogFormVisible.value = false;
  form.value.groupName = '';
  form.value.description = '';
}

const saveAsLabelGroup = async () => {
  const valid = await dataFormRef.value.validate().catch(() => { });
  if (!valid) return false;
  for (let i = 0; i < selectItem.length; i++) {
    i === 0 ? form.value.tagName = selectItem[i].tagName : form.value.tagName = form.value.tagName + ',' + selectItem[i].tagName;
    i === 0 ? form.value.color = selectItem[i].color : form.value.color = form.value.color + ',' + selectItem[i].color;
  }
  try {
    await saveByObj(form.value);
    useMessage().success(t('labelGroup.saveAsSuccess'));
    dialogFormVisible.value = false;
    form.value.groupName = '';
    form.value.description = '';
  } catch (err: any) {
    useMessage().error(err.msg);
  }
};

// 暴露变量
defineExpose({
  openDialog,
  closeSaveAs
});
</script>
