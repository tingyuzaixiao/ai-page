<template>
	<div class="layout-padding">
		<div class="layout-padding-auto layout-padding-view">
			<el-row class="ml10" v-show="showSearch">
				<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList" ref="queryRef">
					<el-form-item :label="t('algorithm.algorithmName')" prop="algorithmName">
						<el-input :placeholder="t('algorithm.algorithmInputTip')" style="max-width: 180px"
							v-model="state.queryForm.algorithmName" />
					</el-form-item>
					<el-form-item>
						<el-button @click="getDataList" icon="search" type="primary">
							{{ t('common.queryBtn') }}
						</el-button>
						<el-button @click="resetQuery" icon="Refresh">{{ t('common.resetBtn') }}</el-button>
					</el-form-item>
				</el-form>
			</el-row>
			<!-- <el-row>
				<div class="mb8" style="width: 100%">
					<el-button @click="addDialogRef.openDialog()" class="ml10" icon="Plus" type="primary" v-auth="'sys_gpu_add'">
						{{ t('algorithm.algorithmAddBtn') }}
					</el-button>
					<el-button :disabled="multiple" v-auth="'sys_algorithm_del'" @click="handleDelete(selectObjs)" class="ml10"
						icon="Delete" type="primary">
						{{ t('common.delBtn') }}
					</el-button>
					<right-toolbar :export="'sys_algorithm_export'" @exportExcel="exportExcel" @queryTable="getDataList"
						class="ml10" style="float: right; margin-right: 20px" v-model:showSearch="showSearch"></right-toolbar>
				</div>
			</el-row> -->
			<el-table :data="state.dataList" style="width: 100%" v-loading="state.loading" border
				@selection-change="handleSelectionChange" :cell-style="tableStyle?.cellStyle"
				:header-cell-style="tableStyle?.headerCellStyle">
				<!-- <el-table-column align="center" type="selection" width="40" /> -->
				<el-table-column :label="t('algorithm.id')" prop="id" width="60" show-overflow-tooltip />
				<el-table-column :label="t('algorithm.server')" prop="server" show-overflow-tooltip />
				<el-table-column :label="t('algorithm.description')" prop="description" show-overflow-tooltip />
				<el-table-column :label="t('algorithm.params')" prop="params" show-overflow-tooltip />
				<el-table-column :label="t('algorithm.algorithmStates')" prop="states" :filter-method="filterAlgorithmState"
					:filters="formatGpuState">
					<template #default="scope">
						<dict-tag :options="gpu_state" :value="scope.row.states"></dict-tag>
					</template>
				</el-table-column>
				<el-table-column :label="t('algorithm.heartbeatTime')" prop="heartbeatTime" show-overflow-tooltip />
				<el-table-column :label="t('algorithm.createTime')" prop="createTime" show-overflow-tooltip />
				<el-table-column :label="t('algorithm.updateTime')" prop="updateTime" show-overflow-tooltip />
				<!-- <el-table-column :label="t('common.action')" width="150">
					<template #default="scope">
						<el-button icon="edit" @click="addDialogRef.openDialog([scope.row.id])" text type="primary"
							v-auth="'sys_gpu_add'">{{
								t('algorithm.algorithmEditBtn') }}
						</el-button>
						<el-button icon="delete" @click="handleDelete([scope.row.id])" text type="primary" v-auth="'sys_gpu_del'">{{
							t('common.delBtn') }}
						</el-button>
					</template>
				</el-table-column> -->
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
	</div>
</template>

<script lang="ts" name="systemmodel" setup>
import { BasicTableProps, useTable } from '/@/hooks/table';
import { fetchGpuListReq, delObj } from '../../api/project/gpu'; //暂时借用GPU数据进行演示
import { fetchAlgorithmListReq } from '/@/api/algorithm/algorithm'; //暂时借用GPU数据进行演示
import { useMessage, useMessageBox } from '/@/hooks/message';
import { useI18n } from 'vue-i18n';
import { useDict } from '/@/hooks/dict';
import router from '/@/router';

const AddDialog = defineAsyncComponent(() => import('./addAlgorithm.vue'));

// 定义字典
const { gpu_state } = useDict('gpu_state');
const { experiment_type } = useDict('experiment_type');
const { process_state } = useDict('process_state');

// 引入组件
const { t } = useI18n();

// 定义变量内容
const addDialogRef = ref();
// 搜索变量
const queryRef = ref();
const showSearch = ref(true);
// 多选变量
const selectObjs = ref([]) as any;
const multiple = ref(true);

const state: BasicTableProps = reactive<BasicTableProps>({
	queryForm: {},
	pageList: fetchAlgorithmListReq,
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
	downBlobFile('/admin/gpu/export', state.queryForm, 'model.xlsx');
};

//gpu的state的筛选规则
const filterAlgorithmState = (value: string, row: any) => {
	return row.states === value;
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
	return gpu_state.value.map((item: any) => ({
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
		await delObj(ids);
		getDataList();
		useMessage().success(t('common.delSuccessText'));
	} catch (err: any) {
		useMessage().error(err.msg);
	}
};

//实验详情路由跳转
const showExpDetail = (row: any) => {
	router.push({
		path: '/program/exp-detail',
		query: { experimentId: row.experimentId, name: row.experimentName },
	});
};
</script>
