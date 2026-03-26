<template>
	<div class="layout-padding">
		<div class="layout-padding-auto layout-padding-view" v-show="scene == 0">
			<el-row class="ml10" v-show="showSearch">
				<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList" ref="queryRef">
					<el-form-item :label="$t('baseModel.baseModelName')" prop="baseModelName">
						<el-input :placeholder="$t('baseModel.inputModelNameTip')" style="max-width: 180px"
							v-model="state.queryForm.baseModelName" />
					</el-form-item>
					<el-form-item>
						<el-button @click="getDataList" icon="search" type="primary">
							{{ $t('common.queryBtn') }}
						</el-button>
						<el-button @click="resetQuery" icon="Refresh">{{ $t('common.resetBtn') }}</el-button>
					</el-form-item>
				</el-form>
			</el-row>
			<el-row>
				<div class="mb8" style="width: 100%">
					<el-button @click="scene = 1, createBaseModelRef.openDialog()" class="ml10" icon="Plus" type="primary"
						v-auth="'sys_basemodel_add'">
						{{ $t('baseModel.addBtn') }}
					</el-button>
					<el-button plain icon="Refresh" @click="updateModelConfig()" type="primary"
						v-auth="'sys_basemodel_cupdate'">{{
							$t('baseModel.updateConfigBtn') }}
					</el-button>
					<el-button plain :disabled="multiple" @click="handleDelete(selectObjs)" class="ml10" icon="Delete"
						type="primary" v-auth="'sys_basemodel_del'">
						{{ $t('common.delBtn') }}
					</el-button>

					<right-toolbar :export="'sys_basemodel_export'" @exportExcel="exportExcel" @queryTable="getDataList"
						class="ml10" style="float: right; margin-right: 20px" v-model:showSearch="showSearch"></right-toolbar>
				</div>
			</el-row>
			<el-table :data="state.dataList" @selection-change="handleSelectionChange" style="width: 100%"
				v-loading="state.loading" border :cell-style="tableStyle?.cellStyle"
				:header-cell-style="tableStyle?.headerCellStyle">
				<el-table-column align="center" type="selection" width="40" />
				<el-table-column :label="$t('manage.index')" type="index" width="60" show-overflow-tooltip />
				<el-table-column :label="t('baseModel.baseModelId')" prop="baseModelId" width="110" show-overflow-tooltip
					v-auth="'sys_basemodel_id'" />
				<el-table-column :label="t('baseModel.baseModelName')" prop="baseModelName" show-overflow-tooltip />
				<el-table-column :label="t('baseModel.taskType')" prop="baseModelType"
					:filter-method="baseModelTypeFliterMethod" :filters="baseModelTypeFliter" show-overflow-tooltip>
					<template #default="scope">
						<!-- <dict-tag :options="model_type" :value="scope.row.baseModelType"></dict-tag> -->
						<el-tag v-if="scope.row.baseModelType === '0'" type="primary">图像分类</el-tag>
						<el-tag v-else-if="scope.row.baseModelType === '1'" type="success">物体检测</el-tag>
						<el-tag v-else-if="scope.row.baseModelType === '2'" type="warning">图像分割</el-tag>
						<el-tag v-else type="danger">其它</el-tag>
					</template>
				</el-table-column>
				<el-table-column :label="$t('baseModel.dataType')" prop="dataType" show-overflow-tooltip width="120">
					<template #default="scope">
						<!-- <dict-tag :options="data_type" :value="scope.row.dataType"></dict-tag> -->
						<el-tag v-if="scope.row.dataType === '0'" type="primary">图像</el-tag>
						<el-tag v-else-if="scope.row.dataType === '1'" type="success">文本</el-tag>
						<el-tag v-else-if="scope.row.dataType === '2'" type="info">语音</el-tag>
						<el-tag v-else-if="scope.row.dataType === '3'" type="warning">视频</el-tag>
						<el-tag v-else-if="scope.row.dataType === '4'" type="danger">点云</el-tag>
						<el-tag v-else-if="scope.row.dataType === '5'" type="primary" effect="dark">层析</el-tag>
						<el-tag v-else type="info">其它</el-tag>
					</template>
				</el-table-column>
				<el-table-column :label="t('baseModel.description')" prop="description" show-overflow-tooltip />
				<el-table-column :label="t('baseModel.createTime')" prop="createTime" show-overflow-tooltip sortable />
				<el-table-column :label="t('baseModel.updateTime')" prop="updateTime" show-overflow-tooltip sortable />
				<el-table-column :label="$t('common.action')" width="280">
					<template #default="scope">
						<el-button icon="Edit" @click="scene = 1, createBaseModelRef.openDialog(scope.row.baseModelId)" text
							type="primary" v-auth="'sys_basemodel_edit'">{{ $t('model.editBtn') }}
						</el-button>

						<el-button icon="View" @click="configDialogRef.openDialog(scope.row.baseModelId)" text type="primary"
							v-auth="'sys_basemodel_config'">{{ $t('baseModel.configBtn') }}
						</el-button>
						<!-- <el-button icon="View" @click="configDialogRef.openDialog(scope.row.baseModelId, 'train')" text
							type="primary" v-auth="'sys_basemodel_train'">{{ $t('baseModel.configTrainBtn') }}
						</el-button> -->
						<el-button icon="delete" @click="handleDelete([scope.row.baseModelId])" text type="primary"
							v-auth="'sys_basemodel_del'">{{ $t('common.delBtn') }}
						</el-button>
					</template>
				</el-table-column>
			</el-table>
			<pagination @current-change="currentChangeHandle" @size-change="sizeChangeHandle" v-bind="state.pagination" />
		</div>
		<div class="layout-padding-auto layout-padding-view" v-show="scene == 1">
			<create-base-model @changeScene="changeScene" @refresh="getDataList()"
				ref="createBaseModelRef"></create-base-model>
		</div>

		<!-- 编辑、新增、详情  -->
		<form-dialog ref="formDialogRef" @refresh="getDataList()" />
		<!-- 配置模型参数  -->
		<config-dialog ref="configDialogRef" @refresh="getDataList()" />
		<!-- 导入excel -->
		<!-- <upload-excel
			:title="$t('model.importmodelTip')"
			@refreshDataList="getDataList"
			ref="excelUploadRef"
			temp-url="/admin/sys-file/local/file/model.xlsx"
			url="/admin/model/import"
		/> -->
	</div>

</template>

<script lang="ts" name="systemmodel" setup>
import { BasicTableProps, useTable } from '/@/hooks/table';
import { delObj, fetchList, updateBaseModelConfigFile } from '/@/api/model/base-model';
import { useMessage, useMessageBox } from '/@/hooks/message';
import { useI18n } from 'vue-i18n';
import { useDict } from '/@/hooks/dict';

// 定义字典
const { model_type } = useDict('model_type');

// 引入组件
const FormDialog = defineAsyncComponent(() => import('./form.vue'));
const ConfigDialog = defineAsyncComponent(() => import('./configBaseModelForm.vue'));
const CreateBaseModel = defineAsyncComponent(() => import('./createBaseModel.vue'));
const { t } = useI18n();

//切换场景 0--模型展示， 1--创建模型
const scene = ref(0);

// 定义变量内容
const formDialogRef = ref();
const configDialogRef = ref();
const createBaseModelRef = ref();
// const excelUploadRef = ref();
// 搜索变量
const queryRef = ref();
const showSearch = ref(true);
// 多选变量
const selectObjs = ref([]) as any;
const multiple = ref(true);

const state: BasicTableProps = reactive<BasicTableProps>({
	queryForm: {},
	pageList: fetchList,
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
	downBlobFile('/admin/model/export', state.queryForm, 'model.xlsx');
};

// 多选事件
const handleSelectionChange = (objs: { baseModelId: string }[]) => {
	selectObjs.value = objs.map(({ baseModelId }) => baseModelId);
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

//切换场景
const changeScene = (sceneCode: number) => {
	scene.value = sceneCode;
};

const updateModelConfig = async () => {
	//更新配置
	try {
		await updateBaseModelConfigFile();
		getDataList();
		useMessage().success(t('baseModel.updateBaseModelConfig'));
	} catch (err: any) {
		useMessage().error(err.msg);
	}
}
//gpu的state的筛选规则
const baseModelTypeFliterMethod = (value: string, row: any) => {
	return row.baseModelType === value;
};


const baseModelTypeFliter = computed(() => {
	return model_type.value.map((item: any) => ({
		text: item.label,
		value: item.value,
	}));
});

</script>
