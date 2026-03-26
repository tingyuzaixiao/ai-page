<template>
  <div class="layout-padding">
    <div v-show="visibleString == 'offlinePathList'" class="layout-padding-auto layout-padding-view">
      <el-row v-show="showSearch">
        <el-form :model="state.queryForm" ref="queryRef" :inline="true" @keyup.enter="getDataList">
          <el-form-item :label="$t('offline.localPath')" prop="localPath">
            <el-input v-model="state.queryForm.localPath" :placeholder="$t('offline.inputLocalPathTip1')" clearable
              @keyup.enter="getDataList" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="getDataList">{{
              $t("common.queryBtn")
            }}</el-button>
            <el-button icon="Refresh" @click="resetQuery">{{
              $t("common.resetBtn")
            }}</el-button>
            <el-button ref="hintButtonRef" type="info" plain @click="openGuide($event.currentTarget)">
              <el-icon>
                <QuestionFilled />
              </el-icon>
              {{ $t("offline.tips") }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-row>
      <el-row>
        <div class="mb8" style="width: 100%;">
          <el-button createOfflinePathRef icon="folder-add" type="primary" class="ml10"
            @click="(visibleString = 'createOfflinePath'), createOfflinePathRef.openDialog()">
            {{ $t("common.addBtn") }}
          </el-button>
          <el-button :disabled="multiple" icon="Delete" type="primary" plain class="ml10"
            @click="handleDelete(selectObjs)">
            {{ $t("common.delBtn") }}
          </el-button>
          <right-toolbar v-model:showSearch="showSearch" class="ml10" style="float: right; margin-right: 20px;"
            @queryTable="getDataList"></right-toolbar>
        </div>
      </el-row>
      <el-table :data="state.dataList" v-loading="state.loading" style="width: 100%;"
        @selection-change="handleSelectionChange" border :cell-style="tableStyle.cellStyle"
        :header-cell-style="tableStyle.headerCellStyle">
        <el-table-column type="selection" width="40" align="center" />
        <el-table-column type="index" :label="t('file.index')" width="80" />
        <el-table-column prop="localPath" :label="t('offline.localPath')" show-overflow-tooltip />
        <el-table-column prop="serverIp" :label="t('offline.serverIp')" show-overflow-tooltip />
        <el-table-column prop="serverPort" :label="t('offline.serverPort')" show-overflow-tooltip width="140" />
        <el-table-column prop="type" :label="t('offline.type')" show-overflow-tooltip width="110">
          <template #default="scope">
            <dict-tag :options="offline_type" :value="scope.row.type"></dict-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createBy" :label="t('offline.createBy')" show-overflow-tooltip width="110" />
        <el-table-column prop="createTime" :label="t('offline.createTime')" show-overflow-tooltip />
        <el-table-column prop="updateTime" :label="t('offline.updateTime')" show-overflow-tooltip />
        <el-table-column :label="$t('common.action')" width="300">
          <template #default="scope">
            <el-button icon="download" text type="primary"
              @click="downlodDialogRef.startDownload('/api/admin/sys-file-offline/download', scope.row, 'offline')">
              {{ $t("offline.download") }}</el-button>
            <el-button icon="edit" text type="primary"
              @click="(visibleString = 'editOfflinePath'), createOfflinePathRef.openDialog('editOfflinePath', scope.row.id)">{{
                $t("common.editBtn")
              }}</el-button>
            <el-button icon="delete" text type="primary" @click="handleDelete([scope.row.id])">{{ $t("common.delBtn")
            }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle" v-bind="state.pagination" />
    </div>
    <!-- 编辑、新增  -->
    <form-dialog ref="formDialogRef" @refresh="getDataList()" />
    <!-- 编辑、新增 基础数据集 -->
    <div class="layout-padding-auto layout-padding-view"
      v-show="visibleString === 'createOfflinePath' || visibleString === 'editOfflinePath'">
      <create-offline-path @refresh="getDataList()" @change-visible-string="changeVisiblestring"
        ref="createOfflinePathRef" />
    </div>
    <!-- 步骤引导组件 -->
    <StepGuidePopover ref="guidePopover">
      <template #trigger>
        <span ref="triggerEl"></span>
      </template>
    </StepGuidePopover>
    <!-- 进度弹窗 -->
    <downloadDialog ref="downlodDialogRef"></downloadDialog>
  </div>
</template>

<script setup lang="ts" name="systemSysFile">
import { BasicTableProps, useTable } from "/@/hooks/table";
import { fetchList, delObj, downloadNginxZip } from "/@/api/admin/offline";
import { useMessage, useMessageBox } from "/@/hooks/message";
import { useI18n } from "vue-i18n";
import { useDict } from '/@/hooks/dict'
import other from '/@/utils/other';
import StepGuidePopover from '../file/components/StepGuidePopover.vue'
const guidePopover = ref();
const triggerEl = ref();

const { offline_type } = useDict('offline_type');

const visibleString = ref("offlinePathList");
// const visibleString = ref("createOfflinePath");

// 引入组件
const FormDialog = defineAsyncComponent(() => import("./form.vue"));
const createOfflinePath = defineAsyncComponent(() => import("./createOfflinePath.vue"));
const downloadDialog = defineAsyncComponent(() => import("./components/download.vue"));
const { t } = useI18n();

// 定义变量内容
const queryRef = ref();
const formDialogRef = ref();
const downlodDialogRef = ref();
const createOfflinePathRef = ref();
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

const exportZip = async (row: any) => {
  // console.log('row', row)
  const params = { ...row, fileExt: '.zip' };
  try {

    await other.downBlobFile('/admin/sys-file-offline/download', params, 'Nginx' + other.generateTimeReqestNumber() + '.zip');
    // console.log('data', data)
  } finally {
    useMessage().success(t('common.downloadSuccess'));
  }
};

// 多选事件
const handleSelectionChange = (objs: { id: string }[]) => {
  selectObjs.value = objs.map(({ id }) => id);
  multiple.value = !objs.length;
};

// 删除操作
const handleDelete = async (ids: string[]) => {
  try {
    await useMessageBox().confirm(t("common.delConfirmText"));
  } catch {
    return;
  }

  try {
    await delObj(ids);
    getDataList();
    useMessage().success(t("common.delSuccessText"));
  } catch (err: any) {
    useMessage().error(err.msg);
  }
};

// 切换界面
const changeVisiblestring = (value: string) => {
  visibleString.value = value;
};

// 打开引导弹窗
// 打开引导弹窗
const openGuide = (targetEl: any) => {
  if (guidePopover.value) {
    guidePopover.value.open(targetEl);
  }
};
</script>
