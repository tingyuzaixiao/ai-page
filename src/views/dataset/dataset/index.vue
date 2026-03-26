<template>
	<div class="layout-padding">
		<div v-show="visibleString == 'basedatasetList'" class="layout-padding-auto layout-padding-view">
			<el-row>
				<div class="mx-3 my-1 w-full">
					<el-descriptions :title="t('dataset.datasetTitle')" :border="true" :column="5">
						<el-descriptions-item :label="t('manage.baseDatasetName')" align="center" class-name="whitespace-nowrap">{{
							baseDatasetInfo?.baseDatasetName
						}}</el-descriptions-item>
						<el-descriptions-item :label="t('manage.baseDatasetId')" align="center">{{ baseDatasetInfo?.baseDatasetId
						}}</el-descriptions-item>
						<el-descriptions-item :label="t('manage.baseDatasetType')" align="center" min-width="150px">
							<el-tag type="primary">{{
								data_type.filter((item: any) => baseDatasetInfo?.dataType == item.value)[0]?.label
							}}</el-tag></el-descriptions-item>
						<el-descriptions-item :label="t('manage.baseDatasetNum')" align="center">{{ baseDatasetInfo?.count }}
							张</el-descriptions-item>
						<el-descriptions-item :label="t('manage.datasetSize')" align="center">{{ basedatasetSize }}
							M</el-descriptions-item>
						<el-descriptions-item :label="t('manage.importType')" align="center">{{
							import_method.filter((item: any) => baseDatasetInfo?.importType == item.value)[0]?.label
						}}</el-descriptions-item>
						<el-descriptions-item :label="t('manage.createTime')" align="center">{{ baseDatasetInfo?.createTime
						}}</el-descriptions-item>
						<el-descriptions-item :label="t('manage.updateTime')" align="center">{{ baseDatasetInfo?.updateTime
						}}</el-descriptions-item>
						<el-descriptions-item :label="t('manage.datasetStatus')" align="center">
							<el-tag :type="filteredState?.remarks" effect="dark" round>{{ filteredState?.label }}</el-tag>
						</el-descriptions-item>

						<el-descriptions-item :label="t('manage.createBy')" align="center">{{ baseDatasetInfo?.createBy
						}}</el-descriptions-item>
						<!-- <el-descriptions-item :label="t('manage.updateBy')" align="center">{{ baseDatasetInfo?.updateBy}}</el-descriptions-item> -->
						<!-- <el-descriptions-item :label="t('manage.taskType')" align="center"><el-tag type="primary">{{
							filteredLabelType?.label }}</el-tag></el-descriptions-item> -->
						<el-descriptions-item :label="t('manage.remark')" label-align="center" min-width="150px" class-name=""
							span="3">
							<template #default>
								<div class="w-full h-full flex items-center justify-center text-center line-clamp-2">
									{{ baseDatasetInfo?.description === '' ? '暂无' : baseDatasetInfo?.description }}
								</div>
							</template>
						</el-descriptions-item>
					</el-descriptions>
				</div>
			</el-row>
			<el-row>
				<div class="w-full ml10 mt15 flex justify-between">
					<el-form v-if="showSearch" :inline="true" :model="state.queryForm" @submit.prevent @keyup.enter="getDataList"
						ref="queryRef">
						<el-form-item :label="t('manage.datasetName')" prop="datasetName">
							<el-input :placeholder="t('manage.inputDatasetNameTip')" style="max-width: 180px"
								v-model="state.queryForm.datasetName" />
						</el-form-item>
						<el-form-item>
							<el-button @click="getDataList" icon="search" type="primary">
								{{ t('common.queryBtn') }}
							</el-button>
							<el-button @click="resetQuery" icon="Refresh">{{ t('common.resetBtn') }}</el-button>
						</el-form-item>
					</el-form>
					<!-- <right-toolbar :export="'sys_post_export'" @exportExcel="exportExcel" @queryTable="getDataList" class="ml10"
						v-model:showSearch="showSearch"></right-toolbar> -->
					<el-form :inline="true" ref="queryRef">
						<el-form-item>
							<el-button
								@click="createDatasetRouter('addDataset', baseDatasetInfo.baseDatasetId, baseDatasetInfo.baseDatasetName)"
								icon="Plus" type="primary">
								{{ t('dataset.addDatasetTip') }}
							</el-button>
						</el-form-item>
					</el-form>
				</div>
			</el-row>

			<div v-loading="state.loading" class="w-full p-3 grid grid-cols-5 grid-flow-row gap-10 overflow-y-scroll">
				<div class="p-4 bg-white shadow" v-for="item in state.dataList" :key="item.datasetId">
					<div class="pb-1 flex justify-between item-center text-xl">
						<span class="font-normal cursor-pointer hover:text-primary hover:font-[550]" @click="imageList(item)">{{
							item.datasetName }}</span>
						<el-tooltip class="box-item" effect="dark" :content="t('dataset.deleteDataset')" placement="top"><el-icon
								class="mr-2 cursor-pointer hover:text-primary" @click="handleDelete(item.datasetId)">
								<Delete />
							</el-icon></el-tooltip>
					</div>
					<div class="text-sm pb-1">
						<span class="text-[gray]">{{ t('manage.baseDatasetNum') }}：{{ item.count ? item.count : 0 }} 张</span>
					</div>
					<div class="w-full h-48 flex justify-center item-center" @click="imageList(item)">
						<el-image v-if="item.firstPicture" class="cursor-pointer w-full" fit="scale-down"
							:src="fileUrl + item.firstPicture" />
						<el-image class="w-full cursor-pointer" v-else fit="scale-down">
							<template #error>
								<div
									class="flex items-center justify-center h-full text-8xl bg-[#f5f6fc] text-[var(--el-text-color-secondary)]">
									<el-icon><icon-picture /></el-icon>
								</div>
							</template>
						</el-image>
					</div>
				</div>
			</div>
			<div v-show="state.pagination?.total == 0" class="w-full flex justify-center">
				<el-empty :image-size="250" />
			</div>

			<pagination @current-change="currentChangeHandle" @size-change="sizeChangeHandle" v-bind="state.pagination" />
		</div>

		<!-- 编辑、新增 数据集 -->
		<!-- <div class="layout-padding-auto layout-padding-view"
			v-show="visibleString === 'createDataset' || visibleString === 'editDataset'">
			<create-dataset @refresh="getDataList()" @change-visible-string="changeVisiblestring" ref="datasetRef" />
		</div> -->

		<!-- 编辑、新增  -->
		<form-dialog @refresh="getDataList()" ref="formDialogRef" />
	</div>
</template>

<script lang="ts" name="systemPost" setup>
import { BasicTableProps, useTable } from '/@/hooks/table';
import { getBaseDatasetById, fetchdatasetList, delDatasetById } from '/@/api/dataset/manage';
import { useMessage, useMessageBox } from '/@/hooks/message';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { fileUrl } from '/@/utils/env';
import { useDict } from '/@/hooks/dict';
import { Picture as IconPicture } from '@element-plus/icons-vue';

// 引入组件
const FormDialog = defineAsyncComponent(() => import('./form.vue'));
const createDataset = defineAsyncComponent(() => import('./createDataset.vue'));
const { t } = useI18n();
const { base_data_type, import_method, base_dataset_state, base_dataset_type, data_type, dataset_import_status } = useDict(
	'base_data_type',
	'import_method',
	'base_dataset_state',
	'base_dataset_type',
	'data_type',
	'dataset_import_status'
);
// 定义变量内容
const loading = ref(false);
const formDialogRef = ref();
const excelUploadRef = ref();
// 搜索变量
const queryRef = ref();
const showSearch = ref(true);
// 多选变量
const selectObjs = ref([]) as any;
const multiple = ref(true);
// 新增数据集
const visibleString = ref('basedatasetList');
const basedatasetRef = ref();
const datasetRef = ref();
// 数据集版本数据
interface Dataset {
	datasetId: string;
	baseDatasetId: string;
	datasetName: string;
	progress: string;
	count: number;
	type: string;
	size: string;
	version: string;
	labelType: null;
	firstPicture: null;
	labelJson: null;
	imageIds: null;
	createBy: string;
	updateBy: string | null;
	createTime: string;
	updateTime: string | null;
	delFlag: null;
}

interface BaseDataset {
	baseDatasetId: string;
	baseDatasetName: string;
	count: number;
	type: string;
	state: null;
	size: number;
	baseLabelJson: null;
	dataType: string;
	labelType: null;
	importType: null;
	description: string;
	createBy: string;
	updateBy: string;
	createTime: string;
	updateTime: string;
	datasetList: Dataset[];
}

// 数据集数据
const baseDatasetInfo = ref<BaseDataset>({
	baseDatasetId: '',
	baseDatasetName: '',
	count: 0,
	type: '',
	state: null,
	size: 0,
	baseLabelJson: null,
	dataType: '',
	labelType: null,
	importType: null,
	description: '',
	createBy: '',
	updateBy: '',
	createTime: '',
	updateTime: '',
	datasetList: [],
});

const route = useRoute();
onMounted(() => {
	const queryIds = route.query.baseDatasetId;
	if (queryIds) {
		try {
			getBaseDatasetById(queryIds as string).then((res) => {
				if (res.code == 0) {
					baseDatasetInfo.value = res.data;
				}
			});
		} catch (error: any) {
			useMessageBox()
				.confirm('Failed to parse baseDatasetId' + error.msg)
				.then(() => {
					router.push({ path: '/dataset/basedataset/index' });
				});
		}
	}
});

const state: BasicTableProps = reactive<BasicTableProps>({
	queryForm: {
		baseDatasetId: route.query.baseDatasetId,
		datasetName: '',
	},
	pagination: {
		size: 10,
	},
	pageList: fetchdatasetList,
});

//  table hook
const { getDataList, currentChangeHandle, sizeChangeHandle, downBlobFile, tableStyle } = useTable(state);

// 清空搜索条件
const resetQuery = () => {
	queryRef.value.resetFields();
	getDataList();
};

// 删除操作
const handleDelete = async (ids: string[]) => {
	try {
		await useMessageBox().confirm(t('common.delConfirmText'));
	} catch {
		return;
	}

	try {
		await delDatasetById(ids);
		getDataList();
		useMessage().success(t('common.delSuccessText'));
	} catch (err: any) {
		useMessage().error(err.msg);
	}
};

// 图集详情展示
const router = useRouter();
const imageList = (id: any) => {
	router.push({
		path: '/dataset/dataset/imageDetail',
		query: { datasetId: id.datasetId, name: id.datasetName },
	});
};

// 切换界面
const changeVisiblestring = (value: string) => {
	visibleString.value = value;
	// 清除下拉列表数据
};

const filteredState = computed(() => dataset_import_status.value.find((item: any) => baseDatasetInfo.value?.state == item.value));
const filteredLabelType = computed(() => base_dataset_type.value.find((item: any) => baseDatasetInfo.value?.labelType == item.value));
const basedatasetSize = computed(() => {
	return baseDatasetInfo.value?.size ? (baseDatasetInfo.value.size / (1024 * 1024)).toFixed(1) : 0;
});

//创建、修改数据集页面跳转
const createDatasetRouter = (type: string, baseDatasetId: string, baseDatasetName?: string, datasetId?: string) => {
	router.push({
		path: '/dataset/dataset/createDataset',
		query: { type, baseDatasetId, baseDatasetName, datasetId },
	});
};
</script>
