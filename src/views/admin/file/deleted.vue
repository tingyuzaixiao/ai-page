<template>
  <div class="layout-padding">
    <div class="layout-padding-auto layout-padding-view">
      <el-row v-show="showSearch">
        <el-form :model="state.queryForm" ref="queryRef" :inline="true" @keyup.enter="getDataList">
          <el-form-item :label="$t('file.dirPath')" prop="dirPath">
            <el-input v-model="state.queryForm.dirPath" :placeholder="$t('file.inputDirPathTip')" clearable
              @keyup.enter="getDataList" @clear="getDataList" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="getDataList">
              {{ $t("common.queryBtn") }}
            </el-button>
            <el-button icon="Refresh" @click="resetQuery">
              {{ $t("common.resetBtn") }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-row>
      <el-row>
        <div class="mb8" style="width: 100%;">
          <!-- <el-button formDialogRef icon="folder-add" type="primary" class="ml10" v-auth="'sys_file_del'"
            @click="formDialogRef.openDialog()">
            {{ $t("common.addBtn") }}
          </el-button> -->
          <el-button :disabled="multiple" icon="closeBold" type="primary" class="ml10" v-auth="'sys_file_del'"
            @click="handleDelete(selectObjs)">
            {{ $t("file.unDeleteBtn") }}
          </el-button>
          <el-button :disabled="multiple" icon="Delete" type="primary" plain class="ml10" v-auth="'sys_file_del'"
            @click="handleImmediatelyDelete(selectObjs)">
            {{ $t("file.immediatelyDelBtn") }}
          </el-button>
          <right-toolbar v-model:showSearch="showSearch" class="ml10" style="float: right; margin-right: 20px;"
            @queryTable="getDataList"></right-toolbar>
        </div>
      </el-row>
      <el-table :data="state.dataList" v-loading="state.loading" style="width: 100%;"
        @selection-change="handleSelectionChange" border :cell-style="tableStyle.cellStyle"
        :row-class-name="rowClassName" :header-cell-style="tableStyle.headerCellStyle">
        <el-table-column type="selection" width="40" align="center" :selectable="(row: any) => row.status !== '1'" />
        <el-table-column type="index" :label="t('file.index')" width="80" />
        <el-table-column prop="dirId" :label="t('file.dirId')" show-overflow-tooltip />
        <el-table-column prop="dirPath" :label="t('file.dirPath')" show-overflow-tooltip />
        <el-table-column prop="fileName" :label="t('file.delFileName')" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.fileName ? scope.row.fileName : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="fileType" :label="t('file.delType')" show-overflow-tooltip>
          <template #default="scope">
            <dict-tag :options="document_type" :value="scope.row.fileType"></dict-tag>
          </template>
        </el-table-column>
        <el-table-column prop="functionType" :label="t('file.functionType')" show-overflow-tooltip>
          <template #default="scope">
            <dict-tag :options="module_type" :value="scope.row.functionType"></dict-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="t('file.status')" show-overflow-tooltip>
          <template #default="scope">
            <dict-tag :options="deleted_state" :value="scope.row.status"></dict-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createBy" :label="t('file.createBy')" show-overflow-tooltip />
        <el-table-column prop="createTime" :label="t('file.insertTime')" show-overflow-tooltip sortable />
        <el-table-column prop="updateTime" :label="t('file.deletedTime')" show-overflow-tooltip sortable>
          <template #default="scope">
            {{ scope.row.updateTime ? scope.row.updateTime : '-' }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.action')" width="200">
          <template #default="scope">
            <!-- <el-button icon="Edit" text type="primary" v-auth="'sys_deleted_edit'"
              @click="formDialogRef.openDialog(scope.row.dirId)">
              {{ $t('file.editBtn') }}
            </el-button> -->
            <el-button icon="closeBold" text type="primary" v-auth="'sys_deleted_del'"
              @click="handleDelete([scope.row.dirId])" :disabled="scope.row.status === '1'">
              {{ $t("file.unDeleteBtn") }} </el-button>
            <el-button icon="delete" text type="primary" v-auth="'sys_deleted_del'"
              @click="handleImmediatelyDelete([scope.row.dirId])" :disabled="scope.row.status === '1'">
              {{ $t("file.immediatelyDelBtn") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle" v-bind="state.pagination" />
    </div>
    <!-- 编辑、新增  -->
    <form-dialog ref="formDialogRef" @refresh="getDataList()" />
  </div>
</template>

<script setup lang="ts" name="systemSysFile">
import { BasicTableProps, useTable } from "/@/hooks/table";
import { fetchList, delObj, immediatelyDelHistoryDir } from "/@/api/admin/deleted-dir";
import { useMessage, useMessageBox } from "/@/hooks/message";
import { useI18n } from "vue-i18n";
import { downBlobFile } from "/@/utils/other";

import { useDict } from '/@/hooks/dict';

// 定义字典
const { document_type, module_type, deleted_state } = useDict('document_type', 'module_type', 'deleted_state');

// 引入组件
const FormDialog = defineAsyncComponent(() => import("./form.vue"));
const { t } = useI18n();

// 定义变量内容
const queryRef = ref();
const formDialogRef = ref();
// 搜索变量
const showSearch = ref(true);
// 多选变量
const selectObjs = ref([]) as any;
const multiple = ref(true);

const state: BasicTableProps = reactive<BasicTableProps>({
  queryForm: {},
  pageList: fetchList,
  descs: ["create_time"],
});

//  table hook
const {
  getDataList,
  currentChangeHandle,
  sizeChangeHandle,
  tableStyle,
} = useTable(state);

// 清空搜索条件
const resetQuery = () => {
  queryRef.value.resetFields();
  getDataList();
};

// // 文件下载
// const download = (row: any) => {
//   // downBlobFile('/admin/sys-file/' + row.bucketName + '/' + row.fileName, null, row.fileName);
//   const params = { bucketName: row.bucketName, fileName: row.fileName };
//   downBlobFile("/admin/sys-file/multiPath", params, row.fileName);
// };

// 多选事件
const handleSelectionChange = (objs: { dirId: string }[]) => {
  selectObjs.value = objs.map(({ dirId }) => dirId);
  multiple.value = !objs.length;
};

// 删除操作
const handleDelete = async (ids: string[]) => {
  try {
    await useMessageBox().confirm(t("file.unDelConfirmText"));
  } catch {
    return;
  }

  try {
    await delObj(ids);
    getDataList();
    useMessage().success(t("file.unDelConfirmText"));
  } catch (err: any) {
    useMessage().error(err.msg);
  }
};
const handleImmediatelyDelete = async (ids: string[]) => {
  try {
    await useMessageBox().confirm(t("file.delConfirmText"));
  } catch {
    return;
  }

  try {
    await immediatelyDelHistoryDir(ids);
    getDataList();
    useMessage().success(t("common.delSuccessText"));
  } catch (err: any) {
    useMessage().error(err.msg);
  }
};
// 动态添加行类名
const rowClassName = ({ row }: { row: any }) => {
  return row.status === '1' ? 'disabled-row' : '';
};
</script>
<style lang="scss" scoped>
/* 禁用行的样式 */
.el-table :deep(.disabled-row) {
  // color: #353536;
  /* 文字变灰 */
  background-color: #f5f7fa;
  /* 背景色 */
  cursor: not-allowed;
  /* 禁用鼠标指针 */
}

/* 如果需要禁用行内操作按钮 */
.el-table :deep(.disabled-row .el-button) {
  pointer-events: none;
  /* 禁用按钮交互 */
  opacity: 0.6;
  /* 降低按钮透明度 */
}
</style>