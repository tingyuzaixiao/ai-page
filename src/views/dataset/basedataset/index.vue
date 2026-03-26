<template>
  <div class="layout-padding">
    <div v-show="visibleString == 'basedatasetList'" class="layout-padding-auto layout-padding-view">
      <el-row shadow="hover" class="ml10" v-show="showSearch">
        <el-form :inline="true" :model="state.queryForm" @submit.prevent @keyup.enter="getDataList" ref="queryRef"
          label-width="110px">
          <el-form-item :label="t('manage.baseDatasetName')" prop="baseDatasetName">
            <el-input class="" clearable :placeholder="t('manage.inputBaseDatasetNameTip')" style="max-width: 180px"
              v-model="state.queryForm.baseDatasetName" @clear="resetQuery" />
          </el-form-item>
          <el-form-item>
            <el-button @click="getDataList" icon="search" type="primary">
              {{ t('common.queryBtn') }}
            </el-button>
            <el-button @click="resetQuery" icon="Refresh">{{ t('common.resetBtn') }}</el-button>
          </el-form-item>
        </el-form>
      </el-row>
      <el-row>
        <div class="mb8" style="width: 100%">
          <el-button @click="
            visibleString = 'createBasedataset';
          basedatasetRef.openDialog('addDataset');
          " class="ml10" icon="Plus" type="primary" v-auth="'sys_model_add'">
            {{ t('manage.addBtn') }}
          </el-button>
          <right-toolbar :export="'dataset_marage_export'" @exportExcel="exportExcel" @queryTable="getDataList"
            class="ml10" style="float: right; margin-right: 20px" v-model:showSearch="showSearch"></right-toolbar>
        </div>
      </el-row>
      <el-table :data="state.dataList" style="width: 100%" v-loading="state.loading" :border="true"
        :cell-style="tableStyle?.cellStyle" :header-cell-style="tableStyle?.headerCellStyle" row-key="baseDatasetId"
        :expand-row-keys="expandedRowId" @expand-change="expandChange">
        <!-- <el-table-column align="center" type="selection" width="40" /> -->
        <el-table-column type="expand">
          <template #default="props">
            <div class="pt-2 pl-[4%] pr-[10%]">
              <h3 class="text-lg font-bold">{{ t('manage.datasetList') }}</h3>
              <el-table :data="props.row.datasetList">
                <el-table-column :label="t('manage.datasetName')" prop="datasetName">
                  <template #default="scope">
                    <div class="text-primary cursor-pointer"
                      @click="datasetDetail(scope.row.datasetId, scope.row.datasetName, scope.row.labelJson)">
                      {{ scope.row.datasetName }}
                    </div>
                  </template>
                </el-table-column>
                <!-- <el-table-column :label="t('manage.datasetVersion')" prop="version" show-overflow-tooltip /> -->
                <el-table-column :label="t('manage.baseDatasetNum')" prop="count" show-overflow-tooltip />
                <el-table-column :label="t('manage.progress')" prop="labelJson" min-width="150px">
                  <!-- <template #default="scope">
										<el-progress :percentage="50" :stroke-width="8" />
										<el-progress :percentage="100" :stroke-width="8" status="success" />
										<el-progress :percentage="100" :stroke-width="8" status="success" />
									</template> -->
                  <template #default="scope">
                    <el-select :placeholder="scope.row.labelJson.length ? '' : '暂无标签信息'" style="width: 80%">
                      <el-option v-show="scope.row.labelJson.length" v-for="(item, index) in scope.row.labelJson"
                        :key="index" :label="item.name" :value="index" disabled>
                        <div class="w-full flex justify-between items-center hover:text-primary">
                          <span>{{ item.name }}</span>
                          <span>{{ item.progress }}%</span>
                        </div>
                      </el-option>
                      <template v-if="scope.row.labelJson.length" #prefix>
                        <div class="flex justify-between text-tx-regular">
                          <div class="truncate max-w-36">{{ scope.row.labelJson[0]?.name }} ：</div>
                          <div class="ml8 font-bold">{{ scope.row.labelJson[0]?.progress }}%</div>
                        </div>
                      </template>
                    </el-select>
                    <!-- <div>{{ scope.row.labelJson }}</div> -->
                  </template>
                </el-table-column>
                <el-table-column :label="t('manage.createTime')" prop="createTime" show-overflow-tooltip sortable />
                <el-table-column :label="t('manage.updateTime')" prop="updateTime" show-overflow-tooltip sortable />
                <el-table-column :label="t('manage.createBy')" prop="createBy" show-overflow-tooltip sortable />
                <el-table-column :label="t('common.action')" min-width="140px">
                  <template #default="scope">
                    <el-button icon="Tickets"
                      @click="datasetDetail(scope.row.datasetId, scope.row.datasetName, scope.row.labelJson)" text
                      type="primary" v-auth="'sys_model_edit'">{{ t('program.programDetailBtn') }}
                    </el-button>
                    <el-button icon="edit-pen"
                      @click="(visibleString = 'editDataset'), createDatasetRouter('editDataset', props.row.baseDatasetId, props.row.baseDatasetName, scope.row.datasetId,)"
                      text type="primary" v-auth="'sys_model_edit'">{{ t('manage.datasetEditBtn') }}
                    </el-button>
                    <!-- <el-button icon="CircleCheck"
											@click="selectDatasetImage(scope.row.datasetId, scope.row.datasetName)" text type="primary"
											v-auth="'sys_model_edit'">{{ t('manage.selectImage') }}
										</el-button> -->
                    <el-button icon="Delete" text type="primary" v-auth="'sys_model_edit'"
                      @click="handleDelete('dataset', scope.row.datasetId)">{{
                        t('common.delBtn')
                      }}</el-button>
                    <!-- <el-button text type="primary" v-auth="'sys_model_edit'">
											<el-dropdown>
												<span class="flex item-center text-primary cursor-pointer">
													{{ t('home.moreTip') }}
													<el-icon class="el-icon--right">
														<arrow-down />
													</el-icon>
												</span>
												<template #dropdown>
													<el-dropdown-menu>
														<el-dropdown-item @click="handleDelete('dataset', scope.row.datasetId)">{{
															t('common.delBtn')
														}}</el-dropdown-item>
														<el-dropdown-item
															@click="labelFileDialogRef.openDialog({ type: 'dataLabel', id: scope.row.datasetId, name: scope.row.datasetName })">
															{{ t('manage.importLabelFile') }}
														</el-dropdown-item>
													</el-dropdown-menu>
												</template>
  </el-dropdown>
  </el-button> -->
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="t('manage.index')" type="index" width="60" />
        <el-table-column :label="t('manage.baseDatasetId')" prop="baseDatasetId" show-overflow-tooltip />
        <el-table-column :label="t('manage.baseDatasetName')" prop="baseDatasetName" show-overflow-tooltip />
        <el-table-column :label="t('manage.dataType')" prop="taskType" show-overflow-tooltip width="120"
          :filter-method="filterTag" :filters="data_type.map((item: any) => ({
            text: item.label,
            value: item.value,
          }))
            ">
          <template #default="scope">
            <dict-tag :options="data_type" :value="scope.row.dataType"></dict-tag>
            <!-- <el-tag v-if="scope.row.dataType === '0'" type="primary">图像</el-tag>
            <el-tag v-else-if="scope.row.dataType === '1'" type="success">文本</el-tag>
            <el-tag v-else-if="scope.row.dataType === '2'" type="info">语音</el-tag>
            <el-tag v-else-if="scope.row.dataType === '3'" type="warning">视频</el-tag>
            <el-tag v-else-if="scope.row.dataType === '4'" type="danger">点云</el-tag>
            <el-tag v-else-if="scope.row.dataType === '5'" type="primary" effect="dark">层析</el-tag>
            <el-tag v-else type="danger">其它</el-tag> -->
          </template>
        </el-table-column>
        <el-table-column :label="t('manage.baseDatasetNum')" prop="count" show-overflow-tooltip width="120" />
        <el-table-column :label="t('manage.datasetNum')" width="100">
          <template #default="{ row }">
            <span>{{ row.datasetList.length }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('manage.labelNum')" width="100">
          <template #default="{ row }">
            <span>{{ row.labelJson ? parseLabelJson(row.labelJson) : 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('manage.importStatus')" prop="state" show-overflow-tooltip>
          <template #default="scope">
            <el-tag type="primary">{{
              dataset_import_status.find((item: any) => item.value === scope.row.state)?.label
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('manage.createTime')" prop="createTime" show-overflow-tooltip sortable />
        <el-table-column :label="t('manage.updateTime')" prop="updateTime" show-overflow-tooltip sortable />
        <el-table-column :label="t('common.action')" width="400">
          <template #default="scope">
            <el-button text type="primary" icon="Plus" v-auth="'sys_model_edit'" @click="
              createDatasetRouter('addDataset', scope.row.baseDatasetId, scope.row.baseDatasetName)
              ">
              {{ t('manage.addDataset') }}
            </el-button>
            <el-button icon="edit"
              @click="datasetAnnotation(scope.row.baseDatasetId, scope.row.baseDatasetName, scope.row.dataType)" text
              type="primary" v-auth="'sys_model_edit'">
              {{ t('manage.datasetAnnotation') }}
            </el-button>
            <el-button icon="document" @click="baseDatasetDetail(scope.row.baseDatasetId, scope.row.baseDatasetName)"
              text type="primary" v-auth="'sys_model_edit'">
              {{ t('manage.datasetDetailBtn') }}
            </el-button>
            <el-button icon="edit-pen"
              @click="(visibleString = 'editBasedataset'), basedatasetRef.openDialog('editBasedataset', scope.row.baseDatasetId)"
              text type="primary" v-auth="'sys_model_edit'">
              {{ t('manage.datasetEditBtn') }}
            </el-button>
            <el-button text type="primary" v-auth="'sys_model_del'" min-width="75px">
              <el-dropdown>
                <span class="flex item-center text-primary cursor-pointer">
                  {{ t('home.moreTip') }}
                  <el-icon class="el-icon--right">
                    <arrow-down />
                  </el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleDelete('baseDataset', scope.row.baseDatasetId)">{{
                      t('common.delBtn') }}</el-dropdown-item>
                    <el-dropdown-item @click="viewBaseDatasetImage(scope.row.baseDatasetId, scope.row.baseDatasetName)">
                      {{ t('manage.viewBaseDatasetImg') }}
                    </el-dropdown-item>
                    <el-dropdown-item
                      @click="labelFileDialogRef.openDialog({ type: 'dataImg', id: scope.row.baseDatasetId, name: scope.row.baseDatasetName, datatype: scope.row.dataType })">
                      {{ t('manage.importdataset') }}
                    </el-dropdown-item>
                    <el-dropdown-item
                      @click="importLabel('baseLabel', scope.row.baseDatasetName, scope.row.baseDatasetId, scope.row.dataType)">
                      {{ t('manage.importLabelFile') }}
                    </el-dropdown-item>
                    <el-dropdown-item
                      @click="downlodDialogRef.startDownload('/api/admin/sys-file/download', scope.row, 'dataset')">
                      {{ t('manage.exportImage') }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination @current-change="currentChangeHandle" @size-change="sizeChangeHandle" v-bind="state.pagination" />
    </div>
    <!-- 编辑、新增 基础数据集 -->
    <div class="layout-padding-auto layout-padding-view"
      v-show="visibleString === 'createBasedataset' || visibleString === 'editBasedataset'">
      <create-basedataset @refresh="getDataList()" @change-visible-string="changeVisiblestring" ref="basedatasetRef" />
    </div>
    <!-- 编辑、新增 数据集 -->
    <!-- <div class="layout-padding-auto layout-padding-view"
      v-show="visibleString === 'createDataset' || visibleString === 'editDataset'">
      <create-dataset @refresh="getDataList()" @change-visible-string="changeVisiblestring" ref="datasetRef" />
    </div> -->
    <!-- <addDatasetDialog @refresh="getDataList()" ref="datasetDialogRef" /> -->
    <!-- 上传标签文件 -->
    <addLabelFileDialog @refresh="getDataList()" ref="labelFileDialogRef" />

    <!-- 进度弹窗 -->
    <downlodDialog ref="downlodDialogRef"></downlodDialog>
  </div>
</template>

<script lang="ts" name="systemmodel" setup>

import { BasicTableProps, useTable } from '/@/hooks/table';
import { fetchBaseDatasetList, delBaseDatasetById, delDatasetById } from '/@/api/dataset/manage';
import { fetchList } from '/@/api/annotate/annotation-task';
import { useMessage, useMessageBox } from '/@/hooks/message';
import { useI18n } from 'vue-i18n';
import { useDict } from '/@/hooks/dict';
import router from '/@/router';
import other from '/@/utils/other';

// 引入组件
const CreateBasedataset = defineAsyncComponent(() => import('./createBaseDataset.vue'));
const createDataset = defineAsyncComponent(() => import('../dataset/createDataset.vue'));
const addLabelFileDialog = defineAsyncComponent(() => import('../component/addLabelFileForm.vue'));
const downlodDialog = defineAsyncComponent(() => import('../../admin/file/components/download.vue'));
const { t } = useI18n();

//获取字典
const { base_dataset_type, data_type, dataset_import_status } = useDict('base_dataset_type', 'data_type', 'dataset_import_status');

// 定义变量内容
const visibleString = ref('basedatasetList');
const basedatasetRef = ref();
const datasetRef = ref();
const labelFileDialogRef = ref();
const seletctImageDialogRef = ref();
const downlodDialogRef = ref();
// 搜索变量
const queryRef = ref();
const showSearch = ref(true);

const state: BasicTableProps = reactive<BasicTableProps>({
  queryForm: {
    baseDatasetName: '',
  },
  pageList: fetchBaseDatasetList,
  descs: ['update_time'],
});

//  table hook
const { getDataList, currentChangeHandle, sizeChangeHandle, downBlobFile, tableStyle } = useTable(state);

// 清空搜索条件
const resetQuery = () => {
  queryRef.value.resetFields();
  getDataList();
};

// 导出excel
const exportExcel = () => {
  downBlobFile('/admin/model/export', state.queryForm, 'manage.xlsx');
};
const exportZip = async (row: any) => {
  // console.log('row', row)
  const params = { fileName: row.baseDatasetName, exportType: 'baseDataset', fileExt: '.zip' };
  try {

    await other.downBlobFile('/admin/sys-file/download', params, row.baseDatasetName + other.generateTimeReqestNumber() + '.zip');
    // console.log('data', data)
  } finally {
    useMessage().success(t('common.downloadSuccess'));
  }
};

// 删除操作
const handleDelete = async (type: string, ids: string[]) => {
  try {
    await useMessageBox().confirm(t('common.delConfirmText'));
  } catch {
    return;
  }

  try {
    if (type == 'dataset') {
      await delDatasetById(ids);
    } else {
      await delBaseDatasetById(ids);
    }
    getDataList();
    useMessage().success(t('common.delSuccessText'));
  } catch (err: any) {
    useMessage().error(err.msg);
  }
};

//基础数据集type的筛选规则
const filterTag = (value: string, row: any, column: any) => {
  return row.dataType === value;
};

const expandedRowId = ref<string[]>([]);
const expandedRowIds = ref(new Set<string>())

const expandChange = async (row: any) => {
  // 如果expandedRows不包含row，执行一下步骤，如果包含，不执行
  if (!expandedRowIds.value.has(row.baseDatasetId)) {
    let res = await fetchList({ baseDatasetId: row.baseDatasetId });
    // 获取最新的标注进度
    row.datasetList.forEach((item: any) => {
      let labelJson = JSON.parse(item.labelJson.slice(1, -1) as string);
      if (labelJson.length > 0) {
        let markProgess: any[] = [];
        res.data.records.forEach((data: any) => {
          if (labelJson.includes(data.taskId)) {
            // 新建一个label对象，将data对象中的taskName、imageCount、labelCount属性赋值到新对象
            let label = {
              id: data.taskId,
              name: data.taskName,
              progress: ((data.labelCount / data.imageCount) * 100).toFixed(2),
            };
            markProgess.push(label);
          }
        });
        item.labelJson = markProgess;
      } else {
        item.labelJson = [];
      }
    })
  }
  expandedRowIds.value.add(row.baseDatasetId);
  expandedRowId.value[0] = row.baseDatasetId;
};

const parseLabelJson = (labelJson: string) => {
  try {
    return JSON.parse(labelJson).length;
  } catch (error) {
    return 0;
  }
};

// 切换界面
const changeVisiblestring = (value: string) => {
  visibleString.value = value;
  // 清除下拉列表数据
  expandedRowIds.value.clear();
  expandedRowId.value = [];
};

//基础数据集详情路由跳转
const baseDatasetDetail = (id: string, name: string) => {
  router.push({
    path: '/dataset/dataset/index',
    query: { baseDatasetId: id, name },
  });
};
//数据集详情路由跳转
const datasetDetail = (id: string, name: any, labelJson?: any) => {
  router.push({
    path: '/dataset/dataset/imageDetail',
    query: { datasetId: id, name, labelJson: JSON.stringify(labelJson) },
  });
};
//查看基础数据集图像
const viewBaseDatasetImage = (baseDatasetId: string, name: string) => {
  router.push({
    path: '/dataset/dataset/baseImageDetail',
    query: { baseDatasetId, name },
  });
};
//基准数据集标注
const datasetAnnotation = (baseDatasetId: string, baseDatasetName: string, dataType: string, datasetId?: string) => {
  if (dataType !== '0') {
    useMessage().wraning("目前仅支持为图像数据创建标注任务！！！");
    return;
  }
  router.push({
    path: '/annotate/annotationtask/index',
    query: { baseDatasetId, baseDatasetName, datasetId },
  });
};
//导入标签页
const importLabel = (type: string, name: string, id: string, datatype: string) => {
  router.push({
    path: '/dataset/component/addLabel',
    query: { type, name, id, datatype },
  });
};
//创建、修改数据集页面跳转
const createDatasetRouter = (type: string, baseDatasetId: string, baseDatasetName?: string, datasetId?: string) => {
  router.push({
    path: '/dataset/dataset/createDataset',
    query: { type, baseDatasetId, baseDatasetName, datasetId },
  });
};
</script>

<style lang="scss" scoped>
::v-deep(.el-overlay .el-overlay-dialog .el-dialog .el-dialog__body) {
  padding: 20px 20px 0 !important;
}

::v-deep(.el-dialog__footer) {
  padding: 0 !important;
}
</style>
