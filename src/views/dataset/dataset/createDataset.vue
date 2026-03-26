<template>
	<div class="layout-padding">
		<div class="layout-padding-auto layout-padding-view">
			<!-- 新建数据集 -->
			<div class="dataset-steps">
				<div class="mt-3 px-6 text-4xl font-bold" style="background: #fff">
					{{ datasetTitle }}
				</div>
				<el-row class="mt-[-10px] mb-[-10px]">
					<el-col :span="24" class="flex justify-center">
						<el-steps class="w-full ml-10 min-w-80" :active="activeIndex" align-center finish-status="finish">
							<el-step :title="t('experiment.experimentStep1')" :icon="Operation" />
							<el-step :title="t('dataset.datasetStep3')" :icon="Finished" />
						</el-steps>
					</el-col>
				</el-row>
			</div>
			<el-divider border-style="dashed" />
			<div v-show="activeIndex == 0" class="flex justify-center my-0 overflow-y-scroll h-4/6">
				<el-form class="w-4/5 max-w-7xl" :model="form" :rules="dataRules" label-width="200px" ref="dataFormRef"
					v-loading="datasetLoading">
					<el-form-item class="!mb-10" :label="t('manage.datasetName')" prop="datasetName">
						<el-input :placeholder="t('manage.inputDatasetNameTip')" clearable v-model="form.datasetName"></el-input>
					</el-form-item>
					<el-form-item class="!mb-10" :label="t('manage.baseDatasetId')" prop="baseDatasetId">
						<el-input :placeholder="t('manage.inputBaseDatasetIdTip')" :disabled="form.baseDatasetId !== ''" clearable
							v-model="form.baseDatasetId"></el-input>
					</el-form-item>
					<el-form-item class="!mb-10" :label="t('manage.dataType')" prop="dataType">
						<!-- <el-select :placeholder="t('syslog.inputLogTypeTip')" class="w100" clearable v-model="form.type">
							<el-option :key="item.value" :label="item.label" :value="item.value" v-for="item in base_dataset_type" />
						</el-select> -->
						<div class="w-full grid grid-cols-3 gap-3">
							<template v-for="item in data_type" :key="item.value">
								<el-card :class="[
									'w-68',
									'text-center',
									'cursor-no-drop',
									{ '!border-primary': item.value == form.dataType },
									{ '!bg-[#F4F7FE]': item.value == form.dataType },
									{ '!bg-[#f2f3f5]': item.value != form.dataType },
								]">
									<!-- @click="selectType(item.value)"  shadow="hover" -->
									<template #header>
										<div class="flex justify-center item-center">
											<i :class="['iconfont', '!text-4xl', 'text-primary', item.remarks]"></i>
											<span class="ml-2 text-lg font-extrabold">{{ item.label }}</span>
										</div>
									</template>
									<p :class="['line-clamp-2', { 'font-bold': item.value == form.dataType }]">{{ item.desc }}</p>
								</el-card>
							</template>
						</div>
					</el-form-item>
					<!-- <el-form-item :label="t('manage.datasetVersion')" prop="version">
						<el-input :placeholder="t('manage.inputDatasetVersion')" clearable v-model="form.version"></el-input>
					</el-form-item> -->
					<el-form-item :label="t('dataset.taskType')" prop="labelType">
						<el-select :placeholder="t('manage.importdataTyteTip')" class="w100" v-model="form.labelType">
							<el-option :key="item.value" :label="item.label" :value="item.value" v-for="item in base_dataset_type" />
						</el-select>
					</el-form-item>
					<el-form-item :label="t('dataset.labelFileName')">
						<template #default="{ row }">
							<el-select class="!w-44" multiple :placeholder="t('dataset.selectLabelByTip')" @change="changeLabel"
								v-model="labelValue">
								<el-option v-for="(item) in labelInfo" :key="item.taskId" :label="item.taskName" :value="item.taskId">
									<span style="float: left">{{ item.taskName }}</span>
									<span style="float: right; color: var(--el-text-color-secondary); font-size: 13px"> {{
										((item.labelCount /
											item.imageCount) * 100).toFixed(2) }}%</span>
								</el-option>
								<!-- <template v-if="row" #prefix>
									<div class="text-tx-regular">
										<span>{{ JSON.parse(row)[0]?.name }} ：</span>
										<span class="ml8 font-bold">{{ JSON.parse(row)[0]?.progress }}%</span>
									</div>
								</template> -->
							</el-select>
						</template>
					</el-form-item>
					<!-- <el-form-item v-show="form.datasetId === ''" :label="t('manage.inheritVersionTip')">
						<el-switch v-model="isInherit" />
					</el-form-item> -->
					<el-form-item v-show="isInherit" :label="t('manage.inheritVersion')" prop="inheritId">
						<el-select :placeholder="t('manage.selectInheritVersion')" class="w100" v-model="form.inheritId">
							<el-option :key="item.datasetId" :label="item.version" :value="item.datasetId"
								v-for="item in datasetList" />
						</el-select>
					</el-form-item>
				</el-form>
			</div>

			<div v-show="activeIndex == 1" class="layout-padding-auto !h-0 my-[-20px]">
				<!-- <el-row shadow="hover">
					<el-form :inline="true" :model="searchForm" @submit.prevent @keyup.enter="getImagesList" ref="queryRef"
						label-width="100px">
						<el-form-item :label="t('dataset.fileName')" prop="original">
							<el-input class="" clearable :placeholder="t('dataset.inputfileName')" style="max-width: 180px"
								v-model="searchForm.original" />
						</el-form-item>
						<el-form-item class="!w-70" :label="t('dataset.filePath')" prop="bucketName">
							<el-tree-select :placeholder="t('dataset.inputfilePath')" node-key="id" :props="defaultProps"
								v-model="searchForm.bucketName" :data="fileTreeData" @node-click="handleNodeClick"
								:render-content="renderContent" />
						</el-form-item>
						<el-form-item class="ml-4">
							<el-button @click="getImagesList" icon="search" type="primary">
								{{ t('common.queryBtn') }}
							</el-button>
							<el-button @click="resetSearchForm" icon="Refresh">{{ t('common.resetBtn') }}</el-button>
						</el-form-item>
					</el-form>
				</el-row> -->
				<div class="w-full h-full flex flex-row ">
					<!-- 左边部分 -->
					<div class="basis-1/6 border border-[#dcdfe6]" ref="leftDiv">
						<!-- TabBarArea 组件，占 50% -->
						<div class="relative w-full h-full">
							<FileDirTree ref="fileDirTreeRef" :fileTreeData="fileTreeData" @node-click="handleNodeClick"
								:placeholder="'请输入文件目录名称'" :baseDatasetName="form.baseDatasetName as string" :collapsed="false"
								:width="'100%'" :isShrink="false">
							</FileDirTree>
						</div>
					</div>

					<!-- 右边部分 -->
					<div class="basis-5/6 h-full ml-2 border border-[#dcdfe6]" ref="rightDiv">
						<div v-loading="loading" class="w-full h-full mt-2 overflow-y-scroll" @scroll.passive="handleScroll"
							ref="scrollContainer">
							<div v-if="paging.total">
								<el-checkbox-group :model-value="Array.from(selectedImages)">
									<div class="w-full grid grid-cols-6 grid-flow-row gap-3">
										<div v-for="image in imageList" :key="image.fileId">
											<div :class="[
												'box-border relative flex items-center justify-center bg-br-extra-light border-4 hover:border-primary cursor-pointer',
												{ 'border-primary': selectedImages.has(image.fileId), 'border-body': !selectedImages.has(image.fileId) },
											]">
												<el-checkbox :key="image.fileId" :label="image.fileId" :value="image.fileId"
													@change="checkboxClick(image.fileId)"
													class="!absolute top-1 right-2 overflow-hidden w-3.5 h-3.5" size="large"></el-checkbox>
												<el-image class="w-full h-40" :src="fileUrl + image.bucketName + '/' + image.fileName"
													fit="contain" @click="clickImage(image.fileId)" />
											</div>
											<div class="flex justify-between items-center mt-2 p-1 text-base leading-5 bg-br-extra-light">
												<el-tooltip :content="computedImgUrl(image.bucketName, image.original)" placement="top"
													:disabled="!overflowIndexes.has(image.fileId)">
													<div v-overflow="handleOverflow(image.fileId)" class="p-1 text-base leading-5  truncate">
														{{ computedImgUrl(image.bucketName, image.original) }}
													</div>
												</el-tooltip>
												<div class="text-lg flex justify-center">
													<!-- <el-icon class="cursor-pointer" @click.stop.prevent="ImageInfoRef.openDialog(image)">
														<Tickets />
													</el-icon> -->
													<el-icon class="cursor-pointer"
														@click.stop.prevent="showImage(image.bucketName, image.fileName)">
														<FullScreen />
													</el-icon>
												</div>
											</div>
											<!-- <div class="pl-1 mt-1 text-base leading-5 bg-br-extra-light truncate">
												<el-text class="w-4/6" type="primary">{{ t('dataset.labelName') }}：{{ image.labelList &&
													image.labelList.length > 0 && image.labelList[0].labelName ?
													image.labelList[0].labelName : t('dataset.noLabel') }}</el-text>
											</div> -->
										</div>
									</div>
								</el-checkbox-group>
								<!-- <div v-for="(image, index) in imageList" :key="image.fileId">
									<div
										:class="['relative flex items-center justify-center bg-br-extra-light border-2 hover:border-primary', 'border-body']">
										<el-image class="w-full h-44" :src="formatUrl(image.bucketName, image.fileName)" :zoom-rate="1.2"
											:max-scale="7" :min-scale="0.2" :preview-src-list="imageViewList" :initial-index="index" fit="contain" />
									</div>
									<div class="flex justify-between items-center mt-2 p-1 text-base leading-5 bg-br-extra-light">
										<span class="w-4/5 truncate">{{ image.bucketName.split('/')[image.bucketName.split('/').length - 1] + '/'
											+ image.original }}</span>
										<div class="text-lg flex justify-center">
											<el-icon class="cursor-pointer" @click.stop.prevent="ImageInfoRef.openDialog(image)">
												<Tickets />
											</el-icon>
											<el-icon class="cursor-pointer" @click.stop.prevent="showImage(image.bucketName, image.fileName)">
												<FullScreen />
											</el-icon>
										</div>
									</div>
									<div class="bg-br-extra-light items-center mt-1 p-1">
										<el-text class="w-4/6" type="primary">{{ t('dataset.labelName') }}：{{ image.labelList !== null &&
											image.labelList.length > 0 ?
											image.labelList[0].labelName : t('dataset.noLabel') }}</el-text>
									</div>
								</div> -->
							</div>
							<el-empty v-show="!paging.total" class="mx-0 my-auto" description="未导入数据" :image-size="250" />
						</div>
					</div>
				</div>

				<el-image-viewer v-if="dialogImageVisible" @close="dialogImageVisible = false" :url-list="viewerList" />
			</div>

			<el-divider />
			<div class="mt-0 px-6 text-right">
				<!-- <el-button class="!px-12" size="default" type="default" v-show="activeIndex == 1" @click="changeSteps('pre')">{{
					t('common.preButtonText') }}</el-button> -->
				<el-button class="!px-12" size="default" type="primary" v-show="activeIndex == 0"
					@click="changeSteps('next')">{{
						t('manage.importdataset')
					}}</el-button>
				<el-button class="!px-12" size="default" @click="onSubmit" v-show="activeIndex == 1" type="primary">{{
					t('common.confirmButtonText') }}</el-button>
				<el-button class="!px-12" size="default" @click="onCancel">{{ t('common.cancelButtonText') }}</el-button>
			</div>
			<ImageInfoDialog @refresh="getDataList()" ref="ImageInfoRef" />
		</div>
	</div>
</template>

<script lang="ts" name="createDataset" setup>
import { BasicTableProps, useTable } from '/@/hooks/table';
import { rule } from '/@/utils/validate';
import { useMessage } from '/@/hooks/message';
import {
	addDataset,
	delDatasetById,
	editDataset,
	getDatasetById,
	validateDatasetName,
	validateDatasetVersion,
	fetchBaseImageList,
	fetchBaseImageListNew
} from '/@/api/dataset/manage';
import { fetchList } from '/@/api/annotate/annotation-task';
import { useDict } from '/@/hooks/dict';
import { useI18n } from 'vue-i18n';
import { fileUrl } from '/@/utils/env';
import { fetchDatasetLabelList, getFilesByBaseDatasetId } from '/@/api/dataset/detail';
import { Operation, Finished } from '@element-plus/icons-vue';
import { dirTree } from '/@/api/admin/file';
import { getBaseDatasetById } from '/@/api/dataset/manage';
import { Folder, FolderOpened } from '@element-plus/icons-vue';


interface DatasetSeletct {
	datasetId: string;
	version: string;
}

interface imageItem {
	fileId: string;
	baseDatasetId: string;
	fileName: string;
	original: string;
	bucketName: string;
	type: string;
	fileSize: string;
	md5: string;
	createBy: string;
	createTime: string;
	updateBy: string;
	updateTime: string;
	labelList: labelItem[];
}

interface labelItem {
	fileId: string;
	labelId: string;
	labelFileName: string;
	labelName: string;
}

interface LabelInfo {
	baseDatasetId: string;
	baseDatasetName: string;
	dataType: string;
	imageCount: number;
	labelCount: number;
	labelType: string;
	tagIds: string[];  // 标签ID列表
	taskId: string;
	taskName: string;
}

const state: BasicTableProps = reactive<BasicTableProps>({
	queryForm: {
		datasetId: '',
	},
});
const { getDataList } = useTable(state);
// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh', 'changeVisibleString']);
const { t } = useI18n();
// 定义变量内容
const dataFormRef = ref();
const loading = ref(false);
const datasetLoading = ref(false);
const isInherit = ref(false);
const { base_dataset_type, data_type } = useDict('base_dataset_type', 'data_type');
const datasetList = ref<DatasetSeletct[]>([]);
const datasetTitle = ref('');
// 控制变量
const selectedImages = ref(new Set<string>());
const ImageInfoDialog = defineAsyncComponent(() => import('./imageInfoDialog.vue'));
// 弹出框控制变量
const dialogImageVisible = ref(false);
const labelInfo = ref<LabelInfo[]>([]);
const imageList: Ref<imageItem[]> = ref([]);
const imageViewList: Ref<string[]> = ref([]);
const hasMore = ref(true);
const ImageInfoRef = ref();
const openType = ref();
const activeIndex = ref(0);
const labelValue = ref()

// #region *****************************树形目录结构*******************************
const FileDirTree = defineAsyncComponent(() => import('../../annotate/onlineannotation/fileDirTree.vue'));
const activeName = ref('first');  // 设置默认选中的tab为第一个（name="first"）

const defaultProps = {
	label: 'label',
	children: 'children',
	value: 'id',
};

interface Tree {
	id: string;
	label: string;
	parentId: string | null;
	children?: Tree[]; // 可选的 children 属性，表示子节点
}
const fileDirTreeRef = ref();

const fileTreeData = ref<Tree[]>([
	{
		id: '',
		label: '',
		parentId: null,
		children: [],
	}]);

// 点击节点时的处理方法
const handleNodeClick = async (nodeData: Tree) => {
	activeName.value = "first";
	// console.log("叶子节点", nodeData.id);
	if (!nodeData.children || nodeData.children.length === 0) {
		// 如果没有子节点，说明是叶子节点
		console.log("叶子节点", nodeData.id);
		searchForm.bucketName = nodeData.id;
		resetData();
		loadImageDetail();
		// await filterbyBucketName();
	}
};

// 渲染树节点内容的自定义方法
const renderContent = (h: typeof import('vue').h, { data }: { data: any }) => {
	const iconType = data.children && data.children.length > 0 ? FolderOpened : Folder;  // 根据是否有子节点显示不同的图标
	return h('span', [
		h(iconType, { class: 'el-icon', style: 'margin-right: 5px; font-size: 16px;' }),
		h('span', data.label),  // 显示节点的名称
	]);
};

// 提交表单数据
const form = reactive({
	datasetId: '',
	baseDatasetId: '',
	baseDatasetName: '',
	datasetName: '',
	type: '',
	version: '',
	labelType: '',
	dataType: '',
	firstPicture: '',
	labelJson: '',
	imageIds: '',
	inheritId: '',
});

const queryRef = ref();
const searchForm = reactive({
	originalName: '',
	labelFileName: '',
	bucketName: '',
	original: '',
});

// 分页变量
const paging = reactive({
	current: 1,
	size: 18,
	total: 0,
});

// 定义校验规则
const dataRules = ref({
	datasetName: [
		{ required: true, message: '数据集名称不能为空', trigger: 'blur' },
		{ min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
		{
			validator: (rule: any, value: any, callback: any) => {
				validateDatasetName(rule, value, form.baseDatasetId, callback, form.datasetId !== '');
			},
			trigger: 'blur',
		},
	],
	// labelType: [{ required: true, message: '任务类型不能为空', trigger: 'blur' }],
	dataType: [{ required: true, message: '数据集类型不能为空', trigger: 'blur' }],
	// version: [
	// 	{ required: true, message: '数据集版本不能为空', trigger: 'blur' },
	// 	{ validator: rule.validatorDatasetVersion, trigger: 'blur' },
	// 	{
	// 		validator: (rule: any, value: any, callback: any) => {
	// 			validateDatasetVersion(rule, value, form.baseDatasetId, callback, form.datasetId !== '');
	// 		},
	// 		trigger: 'blur',
	// 	},
	// ],
});

const changeLabel = () => {
	// console.log("labelValue", labelValue.value);

	// form.labelJson = labelInfo.value.find(item => item.path = labelValue.value)
	// labelInfo.value.forEach((item: any) => {
	// 	if (item.path === labelValue.value) {
	// 		form.labelJson = item;
	// 	}
	// });
}

const loadImageDetail = async () => {
	// 防止重复请求或没有更多数据时的请求
	if (loading.value || !hasMore.value) return;
	loading.value = true;
	try {
		const response = await fetchBaseImageListNew({
			current: paging.current,
			size: paging.size,
			baseDatasetId: form.baseDatasetId,
			originalName: searchForm.originalName,
			labelFileName: searchForm.labelFileName,
			original: searchForm.original,
			bucketName: searchForm.bucketName
		});

		const data = response.data;
		const { current, total, records } = data;
		paging.current = current;
		paging.total = total;

		imageList.value.push(...records);
		imageViewList.value.push(...records.map((item: imageItem) => formatUrl(item.bucketName, item.fileName)));

		hasMore.value = paging.current * paging.size < total;
		paging.current++;
	} catch (error) {
		useMessage().error('Failed to load images');
	} finally {
		loading.value = false;
		// console.log('imageList', imageList.value);
	}
};

const formatUrl = (bucketName: string, fileName: string) => {
	const fileUrlString = fileUrl + bucketName + '/' + fileName;
	let startUrl = fileUrlString.substring(0, 17);
	let endUrl = fileUrlString.substring(17).replace(/\/\/+/g, '/');
	return startUrl + endUrl;
};

// 查询imageList结果
const selectImageList = () => {
	resetData();
	loadImageDetail();
};

// 清空搜索条件
const resetData = () => {
	imageList.value = [];
	paging.size = 20;
	paging.current = 1;
	paging.total = 0;
	hasMore.value = true;

};

const resetSearchForm = () => {
	queryRef.value.resetFields();
	resetData();
	loadImageDetail();
}

const getImagesList = () => {
	resetData();
	loadImageDetail();
}


function debounce(fn: Function, delay: number) {
	let timeoutID: number | null = null;
	return function (...args: any[]) {
		if (timeoutID) clearTimeout(timeoutID);
		timeoutID = window.setTimeout(() => {
			fn(...args);
		}, delay);
	};
}

const scrollContainer: Ref<HTMLElement | null> = ref(null);
const bottomOfWindow = ref(true);

const handleScroll = debounce(() => {
	if (!scrollContainer.value) return;
	const threshold = 100; // 提前200像素触发加载
	bottomOfWindow.value = Math.ceil(scrollContainer.value.scrollTop + scrollContainer.value.clientHeight + threshold) >= scrollContainer.value.scrollHeight;

	if (bottomOfWindow.value) {
		loadImageDetail();
	}
}, 200);

const viewerList = ref(['']);

const computedImgUrl = (url: string, original: string) => {
	// 定义正则表达式来匹配 base/ 后面的路径
	const regex = /base\/(.*)/;
	const regex2 = /images\\(.*)/;

	// 使用正则表达式进行匹配
	const match = url.match(regex);
	const match2 = url.match(regex2);

	// 如果匹配成功，返回捕获的部分，否则返回空字符串
	const formatUrl = match ? match[1] : match2 ? match2[1] : '';

	return formatUrl + '/' + original;
};
const overflowIndexes = ref(new Set<string>());
const handleOverflow = (index: string) => (el: any) => {
	nextTick(() => {
		if (el.scrollWidth > el.clientWidth) {
			overflowIndexes.value.add(index);
		} else {
			overflowIndexes.value.delete(index);
		}
	});
};

const vOverflow = {
	mounted(el: any, binding: any) {
		const callback = binding.value;
		callback(el);
	},
	updated(el: any, binding: any) {
		const callback = binding.value;
		callback(el);
	},
};

const showImage = (bucketName: string, fileName: string) => {
	dialogImageVisible.value = true;
	viewerList.value[0] = formatUrl(bucketName, fileName);
};

const changeSteps = async (step: string) => {
	if (step === 'pre') {
		activeIndex.value--;
	}

	if (step === 'next') {
		// console.log("next")
		await nextSubmit();
	}
};


const route = useRoute();
// 路由到该页面事，修改state.query的值
onMounted(async () => {
	const type = route.query.type;
	const baseDatasetId = route.query.baseDatasetId as string;
	const baseDatasetName = route.query.baseDatasetName as string;
	const datasetId = route.query.datasetId;
	// console.log("route", route.query, type, baseDatasetId, baseDatasetName, datasetId);

	datasetLoading.value = true;
	labelValue.value = [];
	openType.value = type;
	activeIndex.value = 0;

	// 根据新增或编辑赋值
	if (!datasetId) {
		try {
			const res = await getBaseDatasetById(baseDatasetId)
			console.log("baseDatasetres", res);
			form.baseDatasetId = baseDatasetId;
			form.baseDatasetName = res.data.baseDataseName;
			form.labelType = res.data.labelType;
			form.dataType = res.data.dataType;
			form.type = res.data.dataType;
			datasetTitle.value = t('manage.addDataset');
			// getFileDir('dataset/' + res.data.baseDatasetName + '/base');
		} catch (error) {
			useMessage().error("基础数据集信息获取失败")
		}
	} else {
		form.baseDatasetId = baseDatasetId;
		if (typeof datasetId === 'string') {
			// 如果是字符串
			form.datasetId = datasetId;
			getDatasetlData(datasetId);
		} else {
			form.datasetId = '';
		}
		datasetTitle.value = t('manage.editDataset');
	}
	getFileDir('dataset/' + baseDatasetName + '/base');
	datasetLoading.value = false;
	fetchDatasetLabelListData(form.baseDatasetId);

	if (scrollContainer.value) {
		scrollContainer.value.addEventListener('scroll', handleScroll);
	}
	handleScroll();
})

onUnmounted(() => {
	if (scrollContainer.value) {
		scrollContainer.value.removeEventListener('scroll', handleScroll);
	}
});

// 打开弹窗
const openDialog = (type: string, params: Array<any>, list?: Array<any>) => {
	// console.log("open", params, list);

	datasetLoading.value = true;
	form.datasetId = '';
	form.imageIds = '';
	labelValue.value = [];
	openType.value = type;
	activeIndex.value = 0;

	nextTick(async () => {
		dataFormRef.value?.resetFields();
		// 父组件数据传递赋值
		if (list && list.length > 0) {
			let versionList = list.map((item) => item.version);
			datasetList.value = list;
			// form.inheritId = list[0].datasetId;
			form.version = findNextVersion(versionList);
		} else {
			form.version = 'V1.0';
		}

		// 根据新增或编辑赋值
		let baseDatasetDetail;
		if (type === 'addDataset') {

			try {
				const res = await getBaseDatasetById(params[0])
				baseDatasetDetail = res.data
				// console.log("baseDatasetres", res);
			} catch (error) {
				useMessage().error("基础数据集信息获取失败")
			}

			form.baseDatasetId = baseDatasetDetail.baseDatasetId;
			form.labelType = baseDatasetDetail.labelType;
			form.dataType = baseDatasetDetail.dataType;
			form.type = baseDatasetDetail.dataType;
			datasetTitle.value = t('manage.addDataset');
		} else {
			form.datasetId = params[0];
			form.baseDatasetId = params[1];
			// 获取角色信息
			if (params[0]) {
				form.datasetId = params[0];
				getDatasetlData(params[0]);
			}
			datasetTitle.value = t('manage.editDataset');
		}
		datasetLoading.value = false;
		fetchDatasetLabelListData(form.baseDatasetId);
		getFileDir('dataset/' + baseDatasetDetail.baseDatasetName + '/base');
		// if (labelType.value) {
		// 	searchForm.labelFileName = labelType.value[0].name;
		// }
	});
};

const fetchDatasetLabelListData = async (baseDatasetId: string) => {
	try {
		let res = await fetchList({ baseDatasetId: baseDatasetId });
		// let labelJson = JSON.parse(data.data);
		let labelInfoRes = res.data.records;
		if (res.data.total > 0 && labelInfoRes.length > 0) {
			labelInfo.value = labelInfoRes[0].labelTaskList;
		}
	} catch (error) {
		useMessage().error('请求标签数据失败');
	}
};

const getFileDir = async (bucketName: string) => {
	const res = await dirTree({ bucketName: bucketName });
	// console.log("res", res);

	fileTreeData.value.length = 0;
	fileTreeData.value = res.data;
	fileTreeData.value.unshift({
		id: '',
		label: '全部',
		parentId: null,
		children: [],
	});
}

// const handleNodeClick = async (nodeData: Tree) => {
// 	searchForm.bucketName = nodeData.id;
// 	// console.log('nodeClick', nodeData, searchForm.bucketName);
// 	resetData();
// 	loadImageDetail();
// };

// 提交
const onSubmit = async () => {
	const valid = await dataFormRef.value.validate().catch(() => { });
	if (!valid) return false;
	try {
		loading.value = true;
		if (!isInherit.value) form.inheritId = '';
		// form.labelJson = JSON.stringify(labelValue.value);
		form.labelJson = labelValue.value;
		form.imageIds = selectedImages.value.size >= 0 ? JSON.stringify(Array.from(selectedImages.value)) : '[]';
		form.datasetId ? await editDataset(form) : await addDataset(form);
		useMessage().success(t(openType.value === 'addDataset' ? 'common.addSuccessText' : 'common.editSuccessText'));
		// emit('refresh');

		removeScroll()
		// changeVisiblestring('basedatasetList');
		// 返回数据集主页
		baseDatasetIndex()
	} catch (err: any) {
		useMessage().error(err.msg);
	} finally {
		loading.value = false;
		isInherit.value = false;
	}
};
// 下一步
const nextSubmit = async () => {
	const valid = await dataFormRef.value.validate().catch(() => { });
	if (!valid) return false;

	// console.log("nextSubmit")
	try {
		activeIndex.value++;
		datasetLoading.value = true;
		if (!form.datasetId) {
			form.labelJson = labelValue.value;
			const add = await addDataset(form);
			if (add && add.code === 0) {
				form.datasetId = add.data;
			}
			// useMessage().success(t('common.addSuccessText'));
			emit('refresh');
		} else {
			// form.labelJson = labelValue.value;
			// await editDataset(form);
			// debugger
			searchForm.labelFileName = (form.labelJson as any).name
			emit('refresh');
		}

		await loadImageDetail();
		if (scrollContainer.value) {
			scrollContainer.value.addEventListener('scroll', handleScroll);
		}
		await findSelectedImages();
	} catch (err: any) {
		useMessage().error(err.msg);
	} finally {
		datasetLoading.value = false;
	}
};

// 取消
const onCancel = () => {
	isInherit.value = false;
	removeScroll();
	baseDatasetIndex();
	// changeVisiblestring('basedatasetList');
	// emit('refresh');
};

const router = useRouter();
const baseDatasetIndex = () => {
	router.push({
		path: '/dataset/basedataset/index',
	});
};

// 初始化数据
const getDatasetlData = (id: string) => {
	// 获取数据集数据
	getDatasetById(id).then((res: any) => {
		Object.assign(form, res.data);
		// let tmp = JSON.parse(form.labelJson.slice(1, -1))
		let tmp = form.labelJson.slice(1, -1)
		if (tmp) {
			labelValue.value = JSON.parse(tmp);
			form.labelJson = labelValue.value;

			// searchForm.labelFileName = tmp[0].name
		}
	});
};

const checkboxClick = (param: string) => {
	selectedImages.value.has(param) ? selectedImages.value.delete(param) : selectedImages.value.add(param);
};

const findNextVersion = (versions: string[]): string => {
	// 提取版本号中的数字部分
	const versionNumbers = versions.map((version) => parseInt(version.replace('V', '').replace('.0', '')));
	// 找到最大的版本号数字
	const maxVersionNumber = Math.max(...versionNumbers);
	// 计算下一个版本号
	const nextVersionNumber = maxVersionNumber + 1;
	// 返回下一个版本号字符串
	return `V${nextVersionNumber}.0`;
};

// 切换主界面
const changeVisiblestring = (value: string) => {
	// emit('refresh');
	emit('changeVisibleString', value);
};

const findSelectedImages = async () => {
	let imageIdStringParse;
	if (openType.value === 'addDataset') {
		const res = await getFilesByBaseDatasetId({ baseDatasetId: form.baseDatasetId });
		if (res && res.data) {
			imageIdStringParse = res.data;
		}
	} else {
		const res = await getDatasetById(form.datasetId);
		if (res && res.data) {
			state.queryForm.baseDatasetId = res.data.baseDatasetId;
			form.datasetId = res.data.datasetId;
			let imageIdString = res.data.imageIds;
			// 精度丢失
			imageIdStringParse = JSON.parse(imageIdString);
		}
	}
	imageIdStringParse && imageIdStringParse.length ? (selectedImages.value = new Set(imageIdStringParse)) : (selectedImages.value = new Set());
};

const removeScroll = () => {
	if (scrollContainer.value) {
		scrollContainer.value.removeEventListener('scroll', handleScroll);
		scrollContainer.value = null
		paging.current = 1;
		paging.size = 18;
		paging.total = 0
		hasMore.value = true;
		loading.value = false;
	}
}
const clickImage = (fileId: string) => {
	selectedImages.value.has(fileId) ? selectedImages.value.delete(fileId) : selectedImages.value.add(fileId);
}
// 暴露变量
defineExpose({
	openDialog,
});
</script>

<style lang="scss" scoped>
// ::v-deep(.el-form-item) {
// 	margin-bottom: 40px;
// }
// ::v-deep .el-select__wrapper {
// 	width: 180px;
// }

::v-deep(.el-form-item__label-wrap) {
	margin-right: 2em;
}

::v-deep(.el-card__header) {
	padding: 6px 20px !important;
}

::v-deep(.el-dialog__header) {
	font-size: 16px;
	font-weight: 600;
	margin: 0;
	padding: 16px 24px;
	background-color: #f2f2f5 !important;
}
</style>
