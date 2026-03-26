<template>
	<div class="layout-padding-auto">
		<div class="layout-padding-auto layout-padding-view">
			<div>
				<h2 class="m-2 text-3xl font-bold ">{{ programParams?.name }} / {{
					expDetails.experimentName
				}}</h2>
			</div>
			<el-divider class="!my-1 !border-t-4 !border-br-nexsight" />
			<!-- 2个展示训练信息的卡片 -->
			<el-row class="mt-2" :gutter="30">
				<el-col :span="6">
					<el-card class="cursor-pointer" shadow="always" @click="datasetDetail(expDetails.datasetId)">
						<template #header>
							<div class="flex justify-between items-center cursor-pointer">
								<div class="flex">
									<img class="h-6" src="/src/assets/icons/dataset-logo.svg" />
									<span class="ml-3 text-lg font-bold">{{
										t('experiment.experimentDataset') }}</span>
								</div>
								<el-icon>
									<ArrowRightBold />
								</el-icon>
								<!-- <el-button icon="ArrowRightBold" text></el-button> -->
							</div>
						</template>
						<div class="h-16 flex justify-around">
							<div class="flex flex-col">
								<span class="text-tx-placeholder">{{ t('manage.baseDatasetType') }}</span>
								<el-tag class="mt-4" type="primary">{{ filteredType }}</el-tag>
							</div>
							<div class="flex flex-col">
								<span class="text-tx-placeholder">{{ t('manage.baseDatasetNum') }}</span>
								<span class="mt-4 text-lg font-midium">{{ datasetParams?.count }}</span>
							</div>
						</div>
					</el-card>
				</el-col>
				<el-col :span="6">
					<el-card class="cursor-pointer" shadow="always"
						@click="expDialogRef.showModelDetail(expDetails.modelId, expDetails.experimentName)">
						<template #header>
							<div class="flex justify-between items-center cursor-pointer">
								<div class="flex">
									<img class="h-6" src="/src/assets/icons/model-logo.svg" />
									<span class="ml-3 text-lg font-bold">{{
										t('model.modelDetail') }}</span>
								</div>
								<el-icon>
									<ArrowRightBold />
								</el-icon>
								<!-- <el-button icon="ArrowRightBold" text></el-button> -->
							</div>
						</template>
						<div class="h-16 flex justify-around">
							<div class="flex flex-col items-center">
								<span class="text-tx-placeholder">{{ t('manage.taskType') }}</span>
								<el-tag class="mt-4" type="primary">图像分类</el-tag>
							</div>
							<div class="flex flex-col items-center">
								<span class="text-tx-placeholder">模型版本</span>
								<span class="mt-4 text-lg font-midium">V1.0</span>
							</div>
						</div>
					</el-card>
				</el-col>
				<el-col :span="6">
					<el-card class="cursor-pointer" shadow="always" @click="expDialogRef.showModelWeight(expDetails.modelId)">
						<template #header>
							<div class="flex justify-between items-center cursor-pointer">
								<div class="flex">
									<img class="h-6" src="/src/assets/icons/export.svg" />
									<span class="ml-3 text-lg font-bold">{{
										t('experiment.modelFile') }}</span>
								</div>
								<el-icon>
									<ArrowRightBold />
								</el-icon>
								<!-- <el-button icon="ArrowRightBold" text></el-button> -->
							</div>
						</template>
						<div class="h-16 flex justify-center items-center text-tx-placeholder text-lg">
							<span>请选取表格列表进行导出</span>
						</div>
					</el-card>
				</el-col>
				<el-col :span="6">
					<el-card class="cursor-pointer" shadow="always" @click="expDialogRef.showReportWeight()">
						<template #header>
							<div class="flex justify-between items-center cursor-pointer">
								<div class="flex">
									<img class="h-6" src="/src/assets/icons/export-report.svg" />
									<span class="ml-3 text-lg font-bold">{{ t('experiment.weightFile') }}</span>
								</div>
								<el-icon>
									<ArrowRightBold />
								</el-icon>
								<!-- <el-button icon="ArrowRightBold" text></el-button> -->
							</div>
						</template>
						<div class="h-16  flex justify-center items-center text-lg text-tx-placeholder">
							<span>实验进行中</span>
						</div>
					</el-card>
				</el-col>
			</el-row>
			<!-- <el-progress class="my-2" text-inside :stroke-width="18" :percentage="60" /> -->
			<el-card class="my-2">
				<template #header>
					<h2 class="text-xl font-semibold text-gray-800">时间与进度</h2>
				</template>

				<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div>
						<label class="block text-sm font-medium text-gray-500 mb-1">实验开始时间</label>
						<p class="text-gray-800">{{ expDetails.startTime }}</p>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-500 mb-1">运行时长</label>
						<p class="text-gray-800">{{ expDetails.duration }}</p>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-500 mb-1">实验进度</label>
						<div class="flex items-center">
							<el-progress :percentage="expDetails.progress ? expDetails.progress : 0"
								:status="getProgressStatus(expDetails.progress)" class="flex-1 mr-2" />
							<!-- <span class="text-gray-600 text-sm">{{ expDetails.progress }}%</span> -->
						</div>
					</div>
				</div>
			</el-card>
			<el-card>
				<el-row>
					<el-col :span="19">
						<el-menu mode="horizontal" :default-active="activeIndex" @select="handleSelect">
							<el-menu-item index="1">{{ t('experiment.experimentStep1') }}</el-menu-item>
							<el-menu-item index="2">{{ t('experiment.chartsOverview') }}</el-menu-item>
							<!-- <el-menu-item index="2">{{ t('experiment.expDetails') }}</el-menu-item> -->
						</el-menu>
					</el-col>
					<!-- <el-col :span="5" class="flex items-center">
						<el-icon class="mt-5 mr-2" @click="changePlay" size="33" color="#2e5cf6" style="cursor: pointer">
							<component :is="isPlay ? 'VideoPlay' : 'VideoPause'"></component>
						</el-icon>
						<el-icon size="40"
							:class="[{ 'cursor-pointer': expDetails.status !== '3' }, { 'cursor-not-allowed': expDetails.status == '3' }, expDetails.status == '0' ? '!text-tx-placeholder' : '!text-primary']"
							@click="expStartDialogRef.openDialog(expDetails)">
							<VideoPlay v-show="expDetails.status == '0'" />
							<VideoPause v-show="expDetails.status == '1'" />
							<RefreshRight v-show="expDetails.status == '2'" />
							<CircleCheck v-show="expDetails.status == '3'" />
						</el-icon>
						<el-select class="mx-8" v-model="selectValue" placeholder="Select">
							<el-option v-for="item in xAxisOptions" :key="item.value" :label="item.label" :value="item.value" />
						</el-select>
					</el-col> -->
				</el-row>
				<div v-show="activeIndex == '1'" class="w-full">
					<div>
						<div class="py-2 text-lg leading-[20px] font-semibold">{{ t('experiment.experimentDesc') }}</div>
						<span class="block py-2 text-3 leading-[16px] text-[#5f7281]">
							{{ expDetails.description || '暂无描述' }}
						</span>
					</div>
					<el-descriptions class="w-4/6 mt-4" title="详细信息" :column="1" label-width="240px" border>
						<template #extra>
							<el-tag :type="getStatusType(expDetails.status)" size="large">
								{{ getStatusText(expDetails.status) }}
							</el-tag>
						</template>
						<el-descriptions-item :label="t('experiment.experimentCreateTime')">
							{{ expDetails.createTime }}
						</el-descriptions-item>
						<el-descriptions-item :label="t('experiment.createBy')">
							{{ expDetails.createBy }}
						</el-descriptions-item>
						<el-descriptions-item :label="t('experiment.experimentName')">
							{{ expDetails.experimentName }}
						</el-descriptions-item>
						<el-descriptions-item :label="t('experiment.experimentId')">
							{{ expDetails.experimentId }}
						</el-descriptions-item>
						<el-descriptions-item :label="t('experiment.experimentState')">
							<el-tag :type="getStatusType(expDetails.status)" size="large">
								{{ getStatusText(expDetails.status) }}
							</el-tag>
						</el-descriptions-item>
						<el-descriptions-item :label="t('experiment.runningTime')">
							{{ expDetails.duration }}
						</el-descriptions-item>
						<el-descriptions-item :label="t('experiment.experimentDataset')">
							{{ expDetails.datasetId }}
						</el-descriptions-item>
						<el-descriptions-item :label="t('experiment.taskId')">
							{{ expDetails.taskId }}
						</el-descriptions-item>
						<el-descriptions-item label="Tags">
							{{ expDetails.tagNames }}
						</el-descriptions-item>
						<el-descriptions-item :label="t('experiment.experimentAlgorithm')">
							{{ expDetails.algorithm }}
						</el-descriptions-item>
						<el-descriptions-item :label="t('experiment.referenceWeight')">
							{{ expDetails.refExperimentName + '-' + expDetails.refExperimentName }}
						</el-descriptions-item>
						<el-descriptions-item :label="t('experiment.modelFile')">
							{{ expDetails.modelFile }}
						</el-descriptions-item>
						<el-descriptions-item :label="t('experiment.weightFile')">
							{{ expDetails.weightsFile }}
						</el-descriptions-item>
						<el-descriptions-item :label="t('experiment.outputModel')">
							{{ expDetails.outputModel }}
						</el-descriptions-item>
					</el-descriptions>
					<div class="w-full flex gap-x-4">
						<div class="flex-1">
							<div class="mt-4 py-4 text-lg leading-[20px] font-semibold">{{ 'Metrics' }}</div>
							<el-table :data="metricsTableData" border style="width: 100%">
								<el-table-column prop="metricNames" label="Metric" />
								<el-table-column prop="metricVals" label="Value" />
							</el-table>
						</div>
						<div class="flex-1">
							<div class="mt-4 py-4 text-lg leading-[20px] font-semibold">{{ 'Parameters ' }}</div>
							<el-table :data="paramsTableData" border style="width: 100%">
								<el-table-column prop="paramNames" label="Parameter" />
								<el-table-column prop="paramVals" label="Value" />
							</el-table>
						</div>

					</div>
				</div>
				<div v-show="activeIndex == '2'" class="w-1/3 h-96">
					<line-chart :chartData="chartData" ref="lineChartRef"></line-chart>
				</div>
			</el-card>
			<!-- <el-card class="mt-2">
				<el-table :data="tableData" style="width: 100%" height="250" border
					:default-sort="{ prop: 'Batch', order: 'descending' }">
					<el-table-column type="selection" width="50px" />
					<el-table-column fixed prop="Batch" label="Batch" sortable />
					<el-table-column prop="name" label="Accuracy" />
					<el-table-column prop="state" label="Precision" />
					<el-table-column prop="city" label="Recall" />
					<el-table-column prop="zip" label="F1 Score" />
				</el-table>
			</el-card> -->
		</div>
		<exp-dialog ref='expDialogRef' :expDetails="expDetails" :programParams="programParams"></exp-dialog>
		<exp-start-dialog @refresh="updataExp()" ref="expStartDialogRef"></exp-start-dialog>
	</div>
</template>

<script setup lang="ts" name="expDetail">
import router from '/@/router';
import { useMessage, useMessageBox } from '/@/hooks/message';
import { getExpInfoReq, getProgramByIdorNameReq, getDatasetInfoReq, getExpDetailsReq } from '/@/api/project/program';
import { useI18n } from 'vue-i18n';
import { useDict } from '/@/hooks/dict';

const route = useRoute();
// 引入组件
const { t } = useI18n();
const { base_dataset_type, data_type } = useDict('base_dataset_type', 'data_type');
const LineChart = defineAsyncComponent(() => import('./lineChart.vue'));
const ExpDialog = defineAsyncComponent(() => import('./expDialog.vue'));
const ExpStartDialog = defineAsyncComponent(() => import('./expStartDialog.vue'));

const startTrainVisible = ref(true);
const programParams = ref();
const datasetParams = ref();
const activeIndex = ref('1')

//储存Echart的ref
const lineChartRef = ref();
const expDialogRef = ref();
const expStartDialogRef = ref();

//选择器变量
const selectValue = ref('epoch');
const xAxisOptions = [
	{
		value: 'Option1',
		label: 'epoch',
	},
	{
		value: 'Option2',
		label: 'batch',
	},
];

//接受父组件项目、训练数据
interface ExpDetails {
	metricNames: string[];
	metricVals: number[];
	paramNames: string[];
	paramVals: (string | number)[];
	tagNames: string[];
	tagVals: string[];
	programId: string;
	experimentId: string;
	experimentName: string;
	status: string;
	startTime: string;
	duration: string;
	resourceId: string | null;
	gpuUuid: string | null;
	gpuId: string | null;
	gpuName: string | null;
	gpuMemory: string | null;
	ip: string | null;
	progress: number;
	datasetId: string;
	modelFile: string;
	weightsFile: string;
	refProgramName: string | null;
	refExperimentName: string | null;
	algorithm: string | null;
	description: string;
	outputModel: string;
	augmentationParams: any;
};

const expDetails = ref<ExpDetails>({
	metricNames: [],
	metricVals: [],
	paramNames: [],
	paramVals: [],
	tagNames: [],
	tagVals: [],
	programId: '',
	experimentId: '',
	experimentName: '',
	status: '',
	startTime: '',
	duration: '',
	resourceId: null,
	gpuUuid: null,
	gpuId: null,
	gpuName: null,
	gpuMemory: null,
	ip: null,
	progress: 0,
	datasetId: '',
	modelFile: '',
	weightsFile: '',
	refProgramName: null,
	refExperimentName: null,
	algorithm: null,
	description: '',
	outputModel: '',
	augmentationParams: null,
});

const programId = ref()
const metricsTableData = ref<{ metricNames: string; metricVals: number }[]>([]);
const paramsTableData = ref<{ paramNames: string; paramVals: string | number }[]>([]);

//组件挂载获取项目，实验数据
onMounted(async () => {
	const experimentId = route.query.experimentId;
	programId.value = route.query.programId

	if (experimentId) {
		await getExpAndProgramById(experimentId);
	} else {
		useMessageBox().error('未获取到实验ID')
		router.push({
			path: '/program/expList',
			query: { programId: programId.value },
		});
	}
});

// 注销时调用函数
onUnmounted(() => {
	// console.log('exp ----------- unmounted');
});


//通过实验/项目ID获取数据
const getExpAndProgramById = async (experimentId: any) => {
	const result = await getExpDetailsReq(experimentId);
	if (result.code == 0) {
		expDetails.value = result.data;
	} else {
		useMessage().error('获取实验详情失败');
		router.push({
			path: '/program/expList',
			query: { programId: programId.value },
		});
	}
	// 处理参数
	metricsTableData.value = (expDetails.value.metricNames ?? []).map((name, idx) => ({
		metricNames: name,
		metricVals: expDetails.value.metricVals[idx]
	}));
	paramsTableData.value = (expDetails.value.paramNames ?? []).map((name, idx) => ({
		paramNames: name,
		paramVals: expDetails.value.paramVals[idx]
	}));
	const result1 = await getProgramByIdorNameReq({ programId: expDetails.value.programId });
	const result2 = await getDatasetInfoReq(expDetails.value.datasetId);
	programParams.value = result1.data;
	datasetParams.value = result2.data;
};

const handleSelect = (key: string, keyPath: string[]) => {
	activeIndex.value = key;
	if (key === '2') {
		nextTick(() => {
			lineChartRef.value?.resizeChart();
		});
	}
}

// 刷新实验status
const updataExp = async () => {
	const result = await getExpInfoReq(expDetails.value.experimentId);
	expDetails.value = result.data;
};

//跳转图库详情
const datasetDetail = (id: string) => {
	console.log(expDetails.value);
	router.push({
		path: '/dataset/dataset/imageDetail',
		query: { datasetId: id, name: expDetails.value.datasetName },
	});
};

const filteredType = computed(() =>
	data_type.value.find(
		(item: any) => item.value == datasetParams.value?.labelType
	)?.label
);



// 状态类型映射
const getStatusType = (status: string) => {
	const statusMap = {
		'INIT': 'primary',
		'RUNNING': 'primary',
		'FINISHED': 'success',
		'FAILED': 'danger',
		'KILLED': 'warning',
		'KILLING': 'info'
	} as Record<string, string>;
	return statusMap[status] || 'info';
};

// 状态文本映射
const getStatusText = (status: string) => {
	const statusTextMap = {
		'INIT': '未开始',
		'RUNNING': '运行中',
		'FINISHED': '已完成',
		'FAILED': '失败',
		'KILLING': '等待中',
		'KILLED': '已停止'
	} as Record<string, string>;
	return statusTextMap[status] || '未知状态';
};


// 进度条状态
const getProgressStatus = (progress) => {
	if (progress >= 100) return 'success';
	if (progress >= 70) return 'warning';
	return null;
};

const tableData = [
	{
		metricVals: '0',
		metricNames: '0',
		state: 'California',
		paramVals: 'Los Angeles',
		paramNames: 'CA 90036',
	},
	{
		metricVals: '100',
		metricNames: 'Tom',
		state: 'California',
		paramVals: 'Los Angeles',
		paramNames: 'CA 90036',
	},
	{
		metricVals: '200',
		metricNames: 'Tom',
		state: 'California',
		paramVals: 'Los Angeles',
		paramNames: 'CA 90036',
	},
	{
		metricVals: '300',
		metricNames: 'Tom',
		state: 'California',
		paramVals: 'Los Angeles',
		paramNames: 'CA 90036',
	},
	{
		metricVals: '400',
		metricNames: 'Tom',
		state: 'California',
		paramVals: 'Los Angeles',
		paramNames: 'CA 90036',
	},
	{
		metricVals: '500',
		metricNames: 'Tom',
		state: 'California',
		paramVals: 'Los Angeles',
		paramNames: 'CA 90036',
	},
	{
		metricVals: '600',
		metricNames: 'Tom',
		state: 'California',
		paramVals: 'Los Angeles',
		paramNames: 'CA 90036',
	},
];

const chartData = {
	title: 'Accuracy',
	legend: ['实验1'],
	steps: ['0', '1', '2', '3', '4', '5', '6'],
	series: [
		{ name: '实验1', data: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7] }
	]
}
</script>
