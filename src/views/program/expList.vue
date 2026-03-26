<template>
	<div class="layout-padding">
		<div class="layout-padding-auto layout-padding-view">
			<el-row class="ml10" v-show="showSearch">
				<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList" ref="queryRef">
					<el-form-item :label="$t('experiment.experimentName')" prop="gpuName">
						<el-input :placeholder="$t('experiment.experimentNameInputTip')" style="max-width: 180px"
							v-model="state.queryForm.experimentName" />
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
					<el-button @click="addExp" class="ml10" icon="Plus" type="primary" v-auth="'sys_gpu_add'">
						{{ $t('experiment.addBtn') }}
					</el-button>
					<el-button :disabled="multiple" v-auth="'sys_gpu_del'" @click="handleDelete(selectObjs)" class="ml10"
						icon="Delete" type="primary">
						{{ $t('common.delBtn') }}
					</el-button>
					<right-toolbar :export="'sys_gpu_export'" @exportExcel="exportExcel" @queryTable="getDataList" class="ml10"
						style="float: right; margin-right: 20px" v-model:showSearch="showSearch"></right-toolbar>
				</div>
			</el-row>
			<el-table :data="state.dataList || []" style="width: 100%" v-loading="state.loading" border
				@selection-change="handleSelectionChange" :cell-style="tableStyle?.cellStyle"
				:header-cell-style="tableStyle?.headerCellStyle">
				<el-table-column align="center" type="selection" width="40" />
				<el-table-column :label="t('experiment.experimentName')" prop="experimentName" show-overflow-tooltip
					width="200">
					<template #default="scope">
						<span @click="showExpDetail(scope.row)" class="text-primary cursor-pointer">{{
							scope.row.experimentName }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('experiment.experimentDesc')" show-overflow-tooltip width="400">
					<template #default="scope"> {{ scope.row.description }} </template>
				</el-table-column>
				<el-table-column :label="t('experiment.experimentDataset')" prop="datasetId">
					<template #default="scope">
						<span @click="datasetDetail(scope.row)" class="text-primary cursor-pointer">{{
							scope.row.datasetId }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('experiment.experimentModelSelect')" prop="experimentModelSelect">
					<template #default="scope">
						<span @click="expDialogRef.showModelDetail(scope.row.modelId, scope.row.experimentName)"
							class="text-primary cursor-pointer">{{
								scope.row.modelName }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('experiment.experimentAlgorithm')" prop="experimentAlgorithm" />
				<el-table-column :label="t('experiment.experimentState')" prop="status" :filter-method="filterGpuState"
					:filters="formatGpuState">
					<template #default="scope">
						<dict-tag :options="task_status" :value="scope.row.status"></dict-tag>
					</template>
				</el-table-column>
				<el-table-column :label="t('experiment.startTime')" prop="experimentCreateTime" show-overflow-tooltip>
					<template #default="scope">
						{{ scope.row.startTime }}
						<!-- {{ scope.row.startExecutionTime ? scope.row.startExecutionTime : '-' }} -->
					</template>
				</el-table-column>
				<el-table-column :label="t('experiment.runningTime')" prop="runningTime" show-overflow-tooltip />
				<el-table-column :label="$t('common.action')" align="center" width="100">
					<!-- <template #default="scope">
						<el-button icon="edit" @click="addDialogRef.openDialog([scope.row.id])" text type="primary"
							v-auth="'sys_gpu_add'">{{
								$t('gpu.gpuEditBtn') }}
						</el-button>
						<el-button icon="delete" @click="handleDelete([scope.row.id])" text type="primary" v-auth="'sys_gpu_del'">{{
							$t('common.delBtn') }}
						</el-button>
					</template> -->
					<template #="{ row }">
						<div class="flex items-center justify-center">
							<template v-if="row.status === 'FINISHED' || row.status === 'KILLING'">
								<el-tooltip effect="light" :content="row.status === 'FINISHED' ? '已完成' : '暂停操作中，请等待'" placement="left">
									<el-icon size="25" :class="[
										clickableStatus.includes(row.status) ? 'cursor-pointer' : 'cursor-not-allowed',
										row.status == 'INIT' ? '!text-primary' : '',
										row.status == 'RUNNING' ? '!text-primary' : '',
										row.status == 'FINISHED' ? '!text-success' : '',
										row.status == 'FAILED' ? '!text-error' : '',
										row.status == 'KILLED' ? '!text-info' : '',
										row.status == 'KILLING' ? '!text-warning' : '',
									]" @click="startExpOrVal(row)">
										<VideoPlay v-show="row.status == 'INIT'" />
										<VideoPause v-show="row.status == 'RUNNING'" />
										<CircleCheck v-show="row.status == 'FINISHED'" />
										<CircleCloseFilled v-show="row.status == 'FAILED'" />
										<RefreshRight v-show="row.status == 'KILLED'" />
										<HelpFilled v-show="row.status == 'KILLING'" />
									</el-icon>
								</el-tooltip>
							</template>
							<template v-else>
								<el-icon size="25" :class="[
									clickableStatus.includes(row.status) ? 'cursor-pointer' : 'cursor-not-allowed',
									row.status == 'INIT' ? '!text-primary' : '',
									row.status == 'RUNNING' ? '!text-primary' : '',
									row.status == 'FINISHED' ? '!text-success' : '',
									row.status == 'FAILED' ? '!text-error' : '',
									row.status == 'KILLED' ? '!text-info' : '',
									row.status == 'KILLING' ? '!text-warning' : '',
								]" @click="startExpOrVal(row)">
									<VideoPlay v-show="row.status == 'INIT'" />
									<VideoPause v-show="row.status == 'RUNNING'" />
									<CircleCheck v-show="row.status == 'FINISHED'" />
									<CircleCloseFilled v-show="row.status == 'FAILED'" />
									<RefreshRight v-show="row.status == 'KILLED'" />
									<HelpFilled v-show="row.status == 'KILLING'" />
								</el-icon>
							</template>
						</div>
					</template>
				</el-table-column>
			</el-table>
			<pagination @current-change="currentChangeHandle" @size-change="sizeChangeHandle" v-bind="state.pagination" />
		</div>
		<!-- 导入excel -->
		<!-- <upload-excel
			:title="$t('model.importmodelTip')"
			@refreshDataList="getDataList"
			ref="excelUploadRef"
			temp-url="/admin/sys-file/local/file/model.xlsx"
			url="/admin/model/import"
		/> -->
		<add-dialog ref="addDialogRef" @refresh="getDataList()" />
		<exp-dialog @refresh="getDataList()" ref='expDialogRef'></exp-dialog>
		<exp-start-dialog @refresh="getDataList()" ref="expStartDialogRef"></exp-start-dialog>
		<val-start-dialog @refresh="getDataList()" ref="valStartDialogRef"></val-start-dialog>
	</div>
</template>

<script lang="ts" name="systemmodel" setup>
import { BasicTableProps, useTable } from '/@/hooks/table';
import { fetchGpuListReq, delObj } from '../../api/project/gpu';
import { useMessage, useMessageBox } from '/@/hooks/message';
import { useI18n } from 'vue-i18n';
import { useDict } from '/@/hooks/dict';
import router from '/@/router';

import { getExperimentListReq, getProgramListReq, editProgramReq, deleteProgramReq, deleteExpReq, addExpReq, } from '/@/api/project/program';

const AddDialog = defineAsyncComponent(() => import('../gpu/addGpuResource.vue'));
const ExpDialog = defineAsyncComponent(() => import('./expDialog.vue'));
const ExpStartDialog = defineAsyncComponent(() => import('./expStartDialog.vue'));
const ValStartDialog = defineAsyncComponent(() => import('./valStartDialog.vue'));


// 定义字典
const { task_status } = useDict('task_status');
const { experiment_type } = useDict('experiment_type');
const { process_state } = useDict('process_state');

// 引入组件
const { t } = useI18n();
const expDialogRef = ref();
const expStartDialogRef = ref();
const valStartDialogRef = ref();

// 定义变量内容
const addDialogRef = ref();
// 搜索变量
const queryRef = ref();
const showSearch = ref(true);
// 多选变量
const selectObjs = ref([]) as any;
const multiple = ref(true);

// 实验状态可点击字段
const clickableStatus = ['INIT', 'RUNNING', 'FAILED', 'KILLED'];

const state: BasicTableProps = reactive<BasicTableProps>({
	queryForm: {},
	pageList: getExperimentListReq,
});

//  table hook
const { getDataList, currentChangeHandle, sizeChangeHandle, downBlobFile, tableStyle } = useTable(state);

const route = useRoute();

onBeforeMount(() => {
	const name = route.query.name;
	const programId = route.query.programId;
	// 这里可以根据参数做初始化操作
	state.queryForm.programId = programId
});

// 清空搜索条件
const resetQuery = () => {
	queryRef.value.resetFields();
	getDataList();
};

// 导出excel
const exportExcel = () => {
	downBlobFile('/admin/gpu/export', state.queryForm, 'model.xlsx');
};

//gpu的state的筛选规则
const filterGpuState = (value: string, row: any) => {
	return row.state === value;
};

const filterExperimentType = (value: string, row: any) => {
	return row.experimentType === value;
};

const filterProcessState = (value: string, row: any) => {
	return row.processState === value;
};

const formatExperimentType = computed(() => {
	return experiment_type.value.map((item: any) => ({
		text: item.label,
		value: item.value,
	}));
});

const formatGpuState = computed(() => {
	return task_status.value.map((item: any) => ({
		text: item.label,
		value: item.value,
	}));
});

const formatProcessState = computed(() => {
	return process_state.value.map((item: any) => ({
		text: item.label,
		value: item.value,
	}));
});

// 多选事件
const handleSelectionChange = (objs: { id: string }[]) => {
	selectObjs.value = objs.map(({ id }) => id);
	multiple.value = !objs.length;
};


// 删除操作
const handleDelete = async (ids: string[]) => {
	try {
		await deleteExpReq(ids);
		getDataList();
		useMessage().success(t('common.delSuccessText'));
	} catch (err: any) {
		useMessage().error(err.msg);
	}
};

//判断开始校验或实验对话框
const startExpOrVal = (row: any) => {
	if (clickableStatus.includes(row.status)) {
		expStartDialogRef.value?.openDialog(row);
	}
};

//实验详情路由跳转
const showExpDetail = (row: any) => {
	router.push({
		path: '/program/exp-detail',
		query: { experimentId: row.id, programId: row.programId, experimentName: row.experimentName },
	});
};

//数据集详情路由跳转
const datasetDetail = (row: any) => {
	router.push({
		path: '/dataset/dataset/imageDetail',
		query: { datasetId: row.datasetId, name: row.datasetName },
	});
};

//创建实验按钮
const addExp = (programDetail: any) => {

	console.log("state.queryForm.programId", state.queryForm.programId);

	router.push({
		path: '/program/createExp',
		query: { programId: state.queryForm.programId },
	});
};
</script>
