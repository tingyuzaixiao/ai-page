<template>
	<div class="layout-padding">
		<!-- 创建项目界面 -->
		<div v-show="scene == 0" class="layout-padding-auto layout-padding-view">
			<!-- 搜索栏 -->
			<el-row class="ml10" v-show="showSearch">
				<el-form :inline="true" :model="state.queryForm" @submit.prevent @keyup.enter="getDataList" ref="queryRef">
					<el-form-item :label="t('program.programName')" prop="name">
						<el-input :placeholder="t('program.inputProgramNameTip')" style="max-width: 180px"
							v-model="state.queryForm.name" />
					</el-form-item>
					<el-form-item>
						<el-button @click="getDataList" icon="search" type="primary">
							{{ t('common.queryBtn') }}
						</el-button>
						<el-button @click="resetQuery" icon="Refresh">{{ t('common.resetBtn') }}</el-button>
					</el-form-item>
				</el-form>
			</el-row>
			<!-- 新增、搜索、刷新栏 -->
			<el-row>
				<div class="w-full mb8 pl-2 flex justify-between">
					<el-button @click="scene = 2; createProgramRef.openDialog()" icon="Plus" type="primary">
						{{ t('program.addBtn') }}
					</el-button>
					<right-toolbar :export="'sys_model_export'" @exportExcel="" @queryTable="getDataList"
						v-model:showSearch="showSearch"></right-toolbar>
				</div>
			</el-row>

			<el-table class="w-full" :data="state.dataList" v-loading="state.loading" :cell-style="tableStyle?.cellStyle"
				:header-cell-style="tableStyle?.headerCellStyle" border>
				<!-- <el-table-column type="expand">
					<template #default="props">
						<div class="pt-2 pl-6">
							<el-table :data="props.row.experimentList">
								<el-table-column :label="t('experiment.experimentName')" prop="experimentName" align="center">
									<template #="{ row }">
										<span @click="showExpDetail(row)" class="text-primary cursor-pointer">{{ row.experimentName
										}}</span>
									</template>
</el-table-column>
<el-table-column :label="t('experiment.experimentType')" prop="type" align="center" :filter-method="filterTag"
	:filters="formatExperimentType">
	<template #default="scope">
										<dict-tag :options="experiment_type" :value="scope.row.type"></dict-tag>
									</template>
</el-table-column>
<el-table-column :label="t('experiment.experimentProgress')" prop="progress" align="center">
	<template #default="scope">
										<el-progress :text-inside="true" :stroke-width="16" :percentage="scope.row.progress"
											:status="scope.row.progress === 100 ? 'success' : ''" striped striped-flow :duration="5">
											<template #default="{ percentage }">
												<span :class="percentage >= 20 ? 'text-[#fff]' : 'text-[#000]'">{{ percentage }}%</span>
											</template></el-progress>
	</template>
</el-table-column>
<el-table-column :label="t('experiment.experimentSource')" align="center" show-overflow-tooltip>
	<template #default="scope"> {{ scope.row.gpuName }}-{{ scope.row.cardNum }} </template>
</el-table-column>
<el-table-column :label="t('experiment.experimentModel')" prop="modelName" align="center" show-overflow-tooltip>
	<template #="{ row }">
										<span @click="expDialogRef.showModelDetail(row.modelId, row.experimentName)"
											style="cursor: pointer; color: blue">{{
												row.modelName }}</span>
									</template>
</el-table-column>
<el-table-column :label="t('experiment.experimentDataset')" prop="datasetName" align="center" show-overflow-tooltip>
	<template #="{ row }">
										<span @click="showDatasetDetail(row.datasetId, row.datasetName)"
											style="cursor: pointer; color: blue">{{
												row.datasetName
											}}</span>
									</template>
</el-table-column>
<el-table-column :label="t('experiment.startTime')" prop="startTime" align="center" show-overflow-tooltip />
<el-table-column :label="t('experiment.endTime')" prop="endTime" align="center" show-overflow-tooltip />
<el-table-column class-name="xx" align="center" width="55">
	<template #="{ row }">
										<div class="flex items-center">
											<el-icon size="25"
												:class="[{ 'cursor-pointer': row.status !== '3' }, { 'cursor-not-allowed': row.status == '3' }, row.status == '0' ? '!text-tx-placeholder' : '!text-primary']"
												@click="startExpOrVal(row)">
												<VideoPlay v-show="row.status == '0'" />
												<VideoPause v-show="row.status == '1'" />
												<RefreshRight v-show="row.status == '2'" />
												<CircleCheck v-show="row.status == '3'" />
											</el-icon>
										</div>
									</template>
</el-table-column>
<el-table-column :label="t('common.action')" width="140" align="center">
	<template #="{ row }">
										<el-button icon="Edit" @click="expDialogRef.editExp(row, props.row)" text type="primary"
											v-auth="'sys_model_edit'">
											{{ t('experiment.experimentEditBtn') }}
										</el-button>
										<el-button @click="handleDelete('exp', row.experimentId)" icon="Delete" text type="primary">
											{{ t('program.programDelete') }}
										</el-button>
									</template>
</el-table-column>
</el-table>
</div>
</template>
</el-table-column> -->
				<el-table-column :label="t('program.programName')" prop="name">
					<template #="{ row }">
						<span @click="showExpList(row)" class="text-primary cursor-pointer">{{ row.name
						}}</span>
					</template>
				</el-table-column>
				<el-table-column :label="t('program.programDescription')" prop="description" show-overflow-tooltip
					width="300" />
				<el-table-column :label="t('program.taskType')" prop="taskType" width="100">
					<template v-slot="scope">
						<el-tag v-if="scope.row.labelType === '0'" type="primary">图像分类</el-tag>
						<el-tag v-else-if="scope.row.labelType === '1'" type="success">物体检测</el-tag>
						<el-tag v-else-if="scope.row.labelType === '2'" type="warning">图像分割</el-tag>
						<el-tag v-else type="danger">其它</el-tag>
					</template>
				</el-table-column>
				<!-- <el-table-column class-name='!text-left' width="250">
					<template v-slot="scope">
						<span>{{ t('experiment.dataType') }}：</span>
						<el-tag v-if="scope.row.dataType === '0'" type="primary">图像</el-tag>
						<el-tag v-else-if="scope.row.dataType === '1'" type="success">文本</el-tag>
						<el-tag v-else-if="scope.row.dataType === '2'" type="info">语音</el-tag>
						<el-tag v-else-if="scope.row.dataType === '3'" type="warning">视频</el-tag>
						<el-tag v-else-if="scope.row.dataType === '4'" type="danger">点云</el-tag>
						<el-tag v-else-if="scope.row.dataType === '5'" type="primary" effect="dark">层析</el-tag>
						<el-tag v-else type="danger">其它</el-tag>
					</template>
				</el-table-column> -->
				<!-- <el-table-column :label="t('program.programType')" prop="type" show-overflow-tooltip
					:formatter="programTypeFormatter" /> -->
				<!-- <el-table-column :label="t('program.programDescription')" prop="description" show-overflow-tooltip /> -->
				<el-table-column :label="t('program.createTime')" prop="createTime" show-overflow-tooltip />
				<el-table-column :label="t('program.updateTime')" prop="updateTime" show-overflow-tooltip />
				<el-table-column :label="t('common.action')">
					<template #default="{ row }">
						<el-button icon="Plus" @click="addExp(row)" text type="primary"> {{ t('program.startExpBtn')
						}}</el-button>
						<el-button icon="Edit" @click="scene = 2; createProgramRef.openDialog(row.id)" text type="primary"
							v-auth="'sys_model_edit'">
							{{ t('program.programEditBtn') }}
						</el-button>
						<el-button @click="handleDelete('program', row.id)" icon="Delete" text type="primary">
							{{ t('program.programDelete') }}
						</el-button>
					</template>
				</el-table-column>
			</el-table>
			<pagination @current-change="currentChangeHandle" @size-change="sizeChangeHandle" v-bind="state.pagination" />
		</div>

		<!-- 创建训练界面 -->
		<!-- <div class="layout-padding-auto layout-padding-view" v-show="scene == 1">
			<create-exp @changeScene="changeScene" @refresh="getDataList()" ref="createExpRef"></create-exp>
		</div> -->
		<!-- 创建项目界面 -->
		<div class="layout-padding-auto layout-padding-view" v-show="scene == 2">
			<create-program @refresh="getDataList()" @changeScene="changeScene" ref="createProgramRef" />
		</div>
		<exp-start-dialog @refresh="getDataList()" ref="expStartDialogRef"></exp-start-dialog>
		<val-start-dialog @refresh="getDataList()" ref="valStartDialogRef"></val-start-dialog>
		<exp-dialog @refresh="getDataList()" ref='expDialogRef'></exp-dialog>
	</div>
</template>

<script lang="ts" name="systemmodel" setup>
import { BasicTableProps, useTable } from '/@/hooks/table';
import { getProgramListReq, editProgramReq, deleteProgramReq, deleteExpReq, addExpReq, getProgramByIdorNameReq } from '/@/api/project/program';
import { useMessage, useMessageBox } from '/@/hooks/message';
import { useI18n } from 'vue-i18n';
import router from '/@/router';
import { useDict } from '/@/hooks/dict';

//引入组件
const { t } = useI18n();
const CreateProgram = defineAsyncComponent(() => import('./createProgram.vue'));
const CreateExp = defineAsyncComponent(() => import('./createExp.vue'));
const ExpStartDialog = defineAsyncComponent(() => import('./expStartDialog.vue'));
const ValStartDialog = defineAsyncComponent(() => import('./valStartDialog.vue'));
const ExpDialog = defineAsyncComponent(() => import('./expDialog.vue'));
// 定义字典
const { model_type } = useDict('model_type');
const { experiment_type } = useDict('experiment_type');

// 搜索变量
const queryRef = ref();
const showSearch = ref(true);
//切换场景 0--项目展示， 1--创建训练,  2--创建项目
const scene = ref(0);
//获得组件ref
const createExpRef = ref();
const createProgramRef = ref();
const expStartDialogRef = ref();
const valStartDialogRef = ref();
const expDialogRef = ref();

//项目数据
const state: BasicTableProps = reactive<BasicTableProps>({
	queryForm: {
		name: '',
	},
	pageList: getProgramListReq,
	descs: ['create_time'],
});

//  table hook
const { getDataList, currentChangeHandle, sizeChangeHandle, downBlobFile, tableStyle } = useTable(state);

// 清空搜索条件
const resetQuery = () => {
	queryRef.value.resetFields();
	getDataList();
};

//创建实验按钮
const addExp = (programDetail: any) => {
	// scene.value = 1;
	// createExpRef.value.openDialog(programDetail);
	console.log("programDetail", programDetail);

	router.push({
		path: '/program/createExp',
		query: { programId: programDetail.programId },
	});
};

// 删除操作
const handleDelete = async (type: string, ids: string) => {
	try {
		await useMessageBox().confirm(t('common.delConfirmText'));
	} catch {
		return;
	}

	try {
		if (type == 'program') {
			await deleteProgramReq(Number(ids));
		} else if (type == 'exp') {
			await deleteExpReq([ids]);
		}
		getDataList();
		useMessage().success(t('common.delSuccessText'));
	} catch (err: any) {
		useMessage().error(err.msg);
	}
};

//实验type的筛选规则
const filterTag = (value: string, row: any) => {
	return row.type === value;
};

//数据集详情界面
const showDatasetDetail = async (datasetId: string, datasetName: string) => {
	router.push({
		path: '/dataset/dataset/imageDetail',
		query: { datasetId: datasetId, name: datasetName },
	});
};

//实验列表路由跳转
const showExpList = (row: any) => {
	// console.log("row", row, row.experimentName);

	router.push({
		path: '/program/expList',
		query: { programId: row.programId, name: row.name },
	});
};
//实验详情路由跳转
const showExpDetail = (row: any) => {
	// console.log("row", row, row.experimentName);

	router.push({
		path: '/program/exp-detail',
		query: { experimentId: row.experimentId, name: row.experimentName },
	});
};

//判断开始校验或实验对话框
const startExpOrVal = (row: any) => {
	if (row.type == 1) {
		valStartDialogRef.value?.openDialog(row);
	} else {
		expStartDialogRef.value?.openDialog(row);
	}
};

//切换场景
const changeScene = (sceneCode: number) => {
	scene.value = sceneCode;
};

const formatExperimentType = computed(() => {
	return experiment_type.value.map((item: any) => ({
		text: item.label,
		value: item.value,
	}));
})


</script>