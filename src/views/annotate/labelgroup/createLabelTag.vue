<template>
  <!-- <div class="mt-3 px-2 text-4xl font-bold">
    {{ t('labelGroup.manageLabelGroup') + " —" }} {{ labelGroupName === "" ? "" : labelGroupName }}
  </div>
  <el-divider border-style="dashed" class="mt16 mb20" /> -->
  <el-row class="ml10" v-show="showSearch">
    <el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList" ref="queryRef">
      <el-form-item :label="t('labelGroup.tagName')">
        <el-input :placeholder="t('labelGroup.inputTagNameTip')" v-model="state.queryForm.tagName" />
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
      <el-button @click="configTagDialogRef.openDialog({ tagId: '', groupId: labelGroupId })" class="ml10" icon="Plus"
        type="primary" v-auth="'sys_labelgroup_add'">
        {{ t('labelGroup.addTagBtn') }}
      </el-button>
      <el-button plain :disabled="multiple" @click="handleDelete(selectObjs)" class="ml10" icon="Delete" type="primary"
        v-auth="'sys_labelgroup_del'">
        {{ t('common.delBtn') }}
      </el-button>
      <right-toolbar :export="'sys_model_export'" @queryTable="getDataList" class="ml10"
        style="float: right; margin-right: 20px" v-model:showSearch="showSearch"></right-toolbar>
    </div>
  </el-row>
  <div class="overflow-y-scroll h-5/6" v-show="activeIndex === 0" v-loading="state.loading">
    <el-table :data="state.dataList" @selection-change="handleSelectionChange" class="w-full" border
      :cell-style="tableStyle?.cellStyle" :header-cell-style="tableStyle?.headerCellStyle">
      <el-table-column align="center" type="selection" width="40" />
      <el-table-column :label="t('manage.index')" type="index" width="70" show-overflow-tooltip />
      <el-table-column :label="t('labelGroup.color')" prop="color" width="300" show-overflow-tooltip>
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
      <el-table-column :label="t('labelGroup.tagName')" prop="tagName" show-overflow-tooltip />
      <el-table-column :label="t('common.action')" width="280">
        <template #default="scope">
          <el-button icon="Edit" @click="configTagDialogRef.openDialog(scope.row)" text type="primary"
            v-auth="'sys_labelgroup_edit'">{{ t('labelGroup.editBtn')
            }}
          </el-button>
          <el-button icon="delete" @click="handleDelete([scope.row.tagId])" text type="primary"
            v-auth="'sys_labelgroup_del'">{{ t('common.delBtn') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination @current-change="currentChangeHandle" @size-change="sizeChangeHandle" v-bind="state.pagination" />
  </div>

  <el-divider />
  <!-- 底部按钮 -->
  <div class="px-6 text-right">
    <!-- <el-button class="!px-12" size="default"
      @click="closeCrateTrain(); useMessage().success(t('common.optSuccessText'));">{{
        $t('common.saveAsBtn')
      }}</el-button> -->
    <el-button class="!px-12" type="primary" @click="closeCrateTrain">{{ t('common.confirmButtonText') }}</el-button>
    <el-button class="!px-12" @click="closeCrateTrain">{{ t('common.returnButtonText') }}</el-button>
  </div>

  <!-- 标签组配置  -->
  <config-dialog ref="configTagDialogRef" @refresh="getDataList()" />
</template>
<script lang="ts" setup>
import { BasicTableProps, useTable } from '/@/hooks/table';
import { delObj, fetchTagList } from '/@/api/annotate/tag';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import { useMessage, useMessageBox } from '/@/hooks/message';

// 引入组件
const ConfigDialog = defineAsyncComponent(() => import('./configTagForm.vue'));

// 定义变量内容
const configTagDialogRef = ref();

// 引入组件
const { t } = useI18n();
//切换步骤方法和场景变量
const activeIndex = ref(0);

// 搜索变量
const queryRef = ref();
const showSearch = ref(true);
// 多选变量
const selectObjs = ref([]) as any;
const multiple = ref(true);

const labelGroupId = ref(0);
const labelGroupName = ref('');

const state: BasicTableProps = reactive<BasicTableProps>({
  queryForm: {
    groupId: '',
    tagName: '',
  },
  pageList: fetchTagList,
});

//  table hook
const { getDataList, currentChangeHandle, sizeChangeHandle, tableStyle } = useTable(state);

// 清空搜索条件
const resetQuery = () => {
  // queryRef.value.resetFields();
  state.queryForm.tagName = '';
  getDataList();
};

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh', 'changeScene'])

//关闭创建模型，通知父组件切换场景
const closeCrateTrain = () => {
  if (state.dataList && state.dataList.length !== 0) {
    state.dataList.length = 0;
  }
  emit('changeScene', 0);
};



// 多选事件
const handleSelectionChange = (objs: { tagId: string }[]) => {
  selectObjs.value = objs.map(({ tagId }) => tagId);
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

// 打开弹窗
const openDialog = (id: number, name: string) => {
  labelGroupId.value = id;
  labelGroupName.value = name;
  state.queryForm.groupId = id;
  state.dataList = [];
  getDataList();
};


// 暴露变量
defineExpose({
  openDialog,
});

</script>
