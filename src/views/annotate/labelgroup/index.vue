<template>
  <div class="layout-padding">
    <div class="layout-padding-auto layout-padding-view" v-show="scene == 0">
      <el-row class="ml10" v-show="showSearch">
        <el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList" ref="queryRef">
          <el-form-item :label="t('labelGroup.labelGroupName')" prop="labelGroupName">
            <el-input :placeholder="t('labelGroup.inputLabelGroupNameTip')" v-model="state.queryForm.groupName" />
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
        <div class="mb8 w-full">
          <el-button @click="configDialogRef.openDialog()" class="ml10" icon="Plus" type="primary"
            v-auth="'sys_labelgroup_add'">
            {{ t('labelGroup.addBtn') }}
          </el-button>
          <el-button plain :disabled="multiple" @click="handleDelete(selectObjs)" class="ml10" icon="Delete"
            type="primary" v-auth="'sys_labelgroup_del'">
            {{ t('common.delBtn') }}
          </el-button>
          <right-toolbar @queryTable="getDataList" class="ml10 float-right"
            v-model:showSearch="showSearch"></right-toolbar>
        </div>
      </el-row>
      <el-table :data="state.dataList" @selection-change="handleSelectionChange" v-loading="state.loading" border
        :cell-style="tableStyle?.cellStyle" :header-cell-style="tableStyle?.headerCellStyle">
        <el-table-column align="center" type="selection" width="40" />
        <el-table-column :label="t('manage.index')" type="index" width="70" show-overflow-tooltip />
        <el-table-column :label="t('labelGroup.labelGroupName')" prop="groupName" show-overflow-tooltip>
          <template #default="{ row }">
            <el-popover placement="right" width="400" trigger="hover" :show-after="400" :hide-after="400">
              <template #reference>
                <span type="text" @mouseenter="fetchTagData(row.groupId, row.tagList ? row.tagList.length : 0)"
                  style="color: blue; cursor: pointer;">{{
                    row.groupName }}</span>
              </template>
              <el-table :data="tagData" v-loading="tableLoading" height="320px" :border="true" fit
                style="width: 100%; overflow: auto;">
                <el-table-column prop="tagName" :label="t('labelGroup.tagName')" align="center" />
                <el-table-column prop="color" :label="t('labelGroup.color')" align="center">
                  <template #default="scope">
                    <div style="display: flex; align-items: center; justify-content: center;">
                      <!-- 显示颜色块 -->
                      <div
                        :style="{ backgroundColor: scope.row.color, width: '20px', height: '20px', borderRadius: '4px', marginRight: '10px' }"
                        :title="scope.row.color">
                      </div>
                      <!-- 显示颜色文本 -->
                      <span>{{ scope.row.color }}</span>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
              <el-pagination v-model:current-page="stateTagData.pagination.current"
                v-model:page-size="stateTagData.pagination.size" :total="stateTagData.pagination.total"
                layout="total, prev, pager, next" @size-change="tagListSizeChangeHandle"
                @current-change="tagListcCurrentChangeHandle" style="margin-top: 10px; text-align: center;" />
            </el-popover>
          </template>
        </el-table-column>

        <el-table-column :label="t('labelGroup.labelNumber')" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.tagList ? scope.row.tagList.length : 0 }}
          </template>
        </el-table-column>
        <el-table-column :label="t('labelGroup.description')" prop="description" show-overflow-tooltip />
        <el-table-column :label="t('manage.createTime')" prop="createTime" show-overflow-tooltip sortable />
        <el-table-column :label="t('manage.updateTime')" prop="updateTime" show-overflow-tooltip sortable />
        <el-table-column :label="t('common.action')" width="280">
          <template #default="scope">
            <el-button icon="View"
              @click="createLabelTagRef.openDialog(scope.row.groupId, scope.row.groupName); scene = 1" text
              type="primary" v-auth="'sys_labelgroup_config'">{{ t('labelGroup.configBtn') }}
            </el-button>
            <el-button icon="Edit"
              @click="configDialogRef.openDialog(scope.row.groupId, scope.row.groupName, scope.row.description)" text
              type="primary" v-auth="'sys_labelgroup_edit'">{{ t('labelGroup.editBtn') }}
            </el-button>
            <el-button icon="delete" @click="handleDelete([scope.row.groupId])" text type="primary"
              v-auth="'sys_labelgroup_del'">{{ t('common.delBtn') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination @current-change="currentChangeHandle" @size-change="sizeChangeHandle" v-bind="state.pagination" />
    </div>
    <div class="layout-padding-auto layout-padding-view" v-show="scene == 1">
      <create-label-tag @changeScene="changeScene" @refresh="getDataList()" ref="createLabelTagRef"></create-label-tag>
    </div>

    <!-- 标签组配置  -->
    <config-dialog ref="configDialogRef" @refresh="getDataList()" />
  </div>

</template>

<script lang="ts" name="labelGroup" setup>
import { BasicTableProps, useTable } from '/@/hooks/table';
import { delObj, page } from '/@/api/annotate/label-group';
import { fetchTagList } from '/@/api/annotate/tag';
import { useMessage, useMessageBox } from '/@/hooks/message';
import { useI18n } from 'vue-i18n';

// 引入组件
const ConfigDialog = defineAsyncComponent(() => import('./configLabelGroupForm.vue'));
const CreateLabelTag = defineAsyncComponent(() => import('./createLabelTag.vue'));
const { t } = useI18n();

//切换场景 0--模型展示， 1--创建模型
const scene = ref(0);

// 定义变量内容
const configDialogRef = ref();
const createLabelTagRef = ref();

// 搜索变量
const queryRef = ref();
const showSearch = ref(true);
// 多选变量
const selectObjs = ref([]) as any;
const multiple = ref(true);

const state: BasicTableProps = reactive<BasicTableProps>({
  queryForm: {
    groupName: '',
  },
  pageList: page,
});

//  table hook
const { getDataList, currentChangeHandle, sizeChangeHandle, tableStyle } = useTable(state);

// 清空搜索条件
const resetQuery = () => {
  queryRef.value.resetFields();
  state.queryForm.groupName = '';
  getDataList();
};

// 多选事件
const handleSelectionChange = (objs: { groupId: string }[]) => {
  selectObjs.value = objs.map(({ groupId }) => groupId);
  multiple.value = !objs.length;
};

// 删除操作
const handleDelete = async (ids: string[]) => {
  try {
    await useMessageBox().confirm(t('common.delConfirmText'));
  } catch {
    return;
  }

  try {
    await delObj(ids);
    getDataList();
    useMessage().success(t('common.delSuccessText'));
  } catch (err: any) {
    useMessage().error(err.msg);
  }
};

const tagData = ref([]);
const tableLoading = ref(false);
const stateTagData = reactive({
  query: {
    groupId: ''
  },
  pagination: {
    current: 1,
    size: 7,
    total: 0
  }
});

// 处理分页大小改变
const tagListSizeChangeHandle = async (size: number) => {
  stateTagData.pagination.size = size;
  const res = await fetchTagList({ groupId: stateTagData.query.groupId, current: stateTagData.pagination.current, size: stateTagData.pagination.size });
  tagData.value = res?.data?.records ?? [];
  stateTagData.pagination.total = res?.data?.total ?? 0;
};

// 处理页码改变
const tagListcCurrentChangeHandle = async (current: number) => {
  stateTagData.pagination.current = current;
  const res = await fetchTagList({ groupId: stateTagData.query.groupId, current: stateTagData.pagination.current, size: stateTagData.pagination.size });
  tagData.value = res?.data?.records ?? [];
  stateTagData.pagination.total = res?.data?.total ?? 0;
};

const fetchTagData = async (groupId: string, labelNumber: number) => {
  if (stateTagData.query.groupId == groupId && stateTagData.query.groupId !== '') return;
  stateTagData.query.groupId = groupId;
  if (labelNumber === 0) {
    tagData.value = []; return;
  }
  tableLoading.value = true;
  tagData.value = [];
  try {
    const res = await fetchTagList({ groupId: stateTagData.query.groupId, current: stateTagData.pagination.current, size: stateTagData.pagination.size });

    // 确保 res.data.records 存在，否则设置为空数组
    tagData.value = res?.data?.records ?? [];
    stateTagData.pagination.total = res?.data?.total ?? 0;
  } catch (err: any) {
    // 确保 err.msg 存在，否则使用默认消息
    const errorMessage = err?.msg || "Failed to fetch tag data";
    useMessage().error(errorMessage);
  } finally {
    tableLoading.value = false;
  }
};


//切换场景
const changeScene = (sceneCode: number) => {
  scene.value = sceneCode;
  getDataList();
};

</script>
