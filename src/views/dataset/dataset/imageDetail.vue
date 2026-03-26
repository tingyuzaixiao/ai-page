<template>
	<div class="layout-padding">
		<div class="layout-padding-auto layout-padding-view">
			<el-row class="ml10" v-show="showSearch">
				<el-form inline :model="form" @submit.prevent @keyup.enter="getDataList" ref="queryRef">
					<!-- <el-form-item :label="t('post.postName')" prop="postName"> -->
					<el-form-item :label="t('dataset.imgName')" prop="originalName">
						<el-input :placeholder="t('dataset.inputdatasetTitleTip')" style="max-width: 180px"
							v-model="form.originalName" />
					</el-form-item>
					<el-form-item :label="t('dataset.labelFileName')" prop="labelFileName">
						<el-select :placeholder="t('dataset.selectLabelByTip')" v-model="labelFileNameIndex" @change="labelChange">
							<el-option v-for="(item, index) in labelType" :key="index" :label="item.labelFileName" :value="index">
								<span style="float: left">{{ item.labelFileName }}</span>
								<!-- <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px">
									{{ item.progress }}%
								</span> -->
							</el-option>
						</el-select>
					</el-form-item>
					<el-form-item>
						<el-button @click="selectImageList" icon="search" type="primary">
							{{ t('common.queryBtn') }}
						</el-button>
						<el-button @click="resetQuery" icon="Refresh">{{ t('common.resetBtn') }}</el-button>
					</el-form-item>
				</el-form>
			</el-row>
			<el-divider class="!my-1" border-style="dashed" />
			<div v-loading="loading" class="mt-2 overflow-y-scroll" @scroll.passive="handleScroll" ref="scrollContainer">
				<!-- <el-checkbox-group v-model="selectedImages" @change="selectImage"> -->
				<div v-if="page.totals" class="w-full grid grid-flow-row gap-4 min-h-180" :class="{
					'grid-cols-8': page.totals >= 30,
					'grid-cols-6': page.totals > 15 && page.totals < 30,
					'grid-cols-4': page.totals <= 15
				}">
					<div v-for="(image, index) in imageList" :key="image.fileId">
						<div
							:class="['relative flex items-center justify-center bg-br-extra-light border-2 hover:border-primary', 'border-body']">
							<!--  { 'border-primary': selectedImages.includes(image.id), 'border-body': !selectedImages.includes(image.id) } -->
							<!-- <el-checkbox :label="image.id" :value="image.id" class="top-0 right-3 overflow-hidden inline-block"
									:style="{ width: '14px', position: 'absolute' }"></el-checkbox> -->
							<el-image class="w-full h-44" :src="fileUrl + image.bucketName + '/' + image.fileName" :zoom-rate="1.2"
								:max-scale="7" :min-scale="0.2" :preview-src-list="imageViewList" :initial-index="index"
								fit="contain" />
							<el-tag v-if="labelInfo && labelInfo.labelType === '0' && image.labelList[labelFileNameIndex]?.tagInfo"
								:color="getTagColor(image.labelList[labelFileNameIndex].tagId)" effect="dark"
								class="absolute right-0 bottom-0" style="border: none;z-index: 1000;">{{
									image?.labelList[labelFileNameIndex]?.tagInfo }}</el-tag>
							<el-tag
								v-else-if="labelInfo && labelInfo.labelType === '1' && image.labelList[labelFileNameIndex]?.tagInfo"
								color="#DBEADF" effect="dark"
								class="absolute right-0 bottom-0 !text-lg !text-[#5BAC87] bg-[#DBEADF] !border-none">{{
									'ok' }}</el-tag>
						</div>
						<div class="flex justify-between items-center mt-2 p-1 text-base leading-5 bg-br-extra-light">
							<el-tooltip :content="computedImgUrl(image.bucketName, image.original)" placement="top"
								:disabled="!overflowIndexes.has(image.fileId)">
								<div v-overflow="handleOverflow(image.fileId)" class="p-1 text-base leading-5  truncate">
									{{ computedImgUrl(image.bucketName, image.original) }}
								</div>
							</el-tooltip>
							<div class="text-lg flex justify-center">
								<el-icon class="cursor-pointer" @click.stop.prevent="ImageInfoRef.openDialog(image, index)">
									<Tickets />
								</el-icon>
								<el-icon class="cursor-pointer"
									@click.stop.prevent="showImage(image.bucketName, image.fileName, index)">
									<FullScreen />
								</el-icon>
							</div>
						</div>
						<!-- <div class="bg-br-extra-light items-center mt-1 p-1">
							<el-text class="w-4/6" type="primary">{{ t('dataset.labelName') }}：{{
								image.labelList && image.labelList.length > 0 && image.labelList[labelFileNameIndex]
									? image.labelList[labelFileNameIndex].tagInfo
									: t('dataset.noLabel')
							}}</el-text>
						</div> -->
					</div>
					<!-- </el-checkbox-group> -->
				</div>
				<el-empty v-show="!page.totals" class="mx-0 my-auto" description="未导入数据" :image-size="250" />
			</div>
			<el-image-viewer v-if="dialogImageVisible" @close="dialogImageVisible = false" :url-list="imageViewList"
				:initial-index="currentImageIndex" />
		</div>
		<ImageInfoDialog @refresh="getDataList()" ref="ImageInfoRef" />
	</div>
</template>

<script lang="ts" name="systemPost" setup>
import { BasicTableProps, useTable } from '/@/hooks/table';
import { fetchDatasetImageList, fetchDatasetLabelList } from '/@/api/dataset/detail';
import { getTaskObj } from '/@/api/annotate/annotation-task';
import { useMessage, useMessageBox } from '/@/hooks/message';
import { useI18n } from 'vue-i18n';
import { delObj } from '/@/api/admin/user';
import { fileUrl } from '/@/utils/env';

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
	tagId: string;
	tagInfo: string;
	fileId: string;
	labelId: string;
	labelFileName: string;
	labelName: string;
	taskId: string;
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
	tagList: {
		tagId: string;
		tagName: string;
		color: string;
	}[];
}

// 引入组件
const { t } = useI18n();
const ImageInfoDialog = defineAsyncComponent(() => import('./imageInfoDialog.vue'));

// 定义变量内容
const ImageInfoRef = ref();
const loading = ref(false);
const hasMore = ref(true);
const imageList: Ref<imageItem[]> = ref([]);
const imageViewList: Ref<string[]> = ref([]);
const scrollContainer: Ref<HTMLElement | null> = ref(null);

const overflowIndexes = ref(new Set<string>());
// 搜索变量
const queryRef = ref();
const showSearch = ref(true);
const datasetId = ref();
// 多选变量
const selectObjs = ref([]) as any;
const multiple = ref(true);
// 弹出框控制变量
const dialogImageVisible = ref(false);
// 分页变量
const page = reactive({
	pageSize: 30,
	pageNum: 1,
	totals: 0,
});

const form = reactive({
	originalName: '',
	labelFileName: '',
});

const route = useRoute();
// 路由到该页面事，修改state.query的值
onMounted(async () => {
	const queryIds = route.query.datasetId;
	const labelJson = route.query.labelJson

	if (queryIds) {
		datasetId.value = queryIds;
	}

	await loadImageDetail(form.originalName, form.labelFileName);

	await fetchDatasetLabelListData(labelJson as string);
	// if (labelType.value != null && labelType.value.length > 0) {
	// 	form.labelFileName = labelType.value[0].name;
	// 	labelChange(labelType.value[0].id);
	// }
	if (scrollContainer.value) {
		scrollContainer.value.addEventListener('scroll', handleScroll);
	}
	handleScroll();
});

onUnmounted(() => {
	if (scrollContainer.value) {
		scrollContainer.value.removeEventListener('scroll', handleScroll);
	}
});

const loadImageDetail = async (originalName?: string, labelFileName?: string) => {
	// 防止重复请求或没有更多数据时的请求
	if (loading.value || !hasMore.value) return;
	loading.value = true;
	try {
		const response = await fetchDatasetImageList({
			pageSize: page.pageSize,
			pageNum: page.pageNum,
			datasetId: datasetId.value,
			originalName: originalName,
			labelFileName: labelFileName,
		});

		const data = response.data;
		const { pageNum, pageSize, totals, fileList } = data;
		page.pageNum = pageNum;
		page.totals = totals;

		imageList.value.push(...fileList);
		imageViewList.value.push(...fileList.map((item: imageItem) => formatUrl(item.bucketName, item.fileName)));

		hasMore.value = page.pageSize * page.pageNum < totals;
		page.pageNum++;
	} catch (error) {
		console.error('Failed to load images', error);
	} finally {
		loading.value = false;
		// console.log('imageList', imageList.value);
	}
};

function debounce(fn: Function, delay: number) {
	let timeoutID: number | null = null;
	return function (...args: any[]) {
		if (timeoutID) clearTimeout(timeoutID);
		timeoutID = window.setTimeout(() => {
			fn(...args);
		}, delay);
	};
}

const handleScroll = debounce(() => {
	if (!scrollContainer.value) return;
	const threshold = 100; // 提前200像素触发加载
	const bottomOfWindow = Math.ceil(scrollContainer.value.scrollTop + scrollContainer.value.clientHeight + threshold) >= scrollContainer.value.scrollHeight;

	if (bottomOfWindow) {
		loadImageDetail();
	}
}, 200);

const state: BasicTableProps = reactive<BasicTableProps>({
	queryForm: {
		datasetId: '',
	},
});

//  table hook
const { getDataList, currentChangeHandle, sizeChangeHandle, downBlobFile, tableStyle } = useTable(state);

// 查询imageList结果
const selectImageList = () => {
	resetData();
	loadImageDetail(form.originalName, form.labelFileName);
};

// 清空搜索条件
const resetQuery = async () => {
	form.originalName = '';
	// if (labelFileNameIndex.value != undefined) {
	// 	labelFileNameIndex.value = 0;
	// }
	// labelFileNameIndex.value = undefined;
	// if (labelType.value) {
	// 	form.labelFileName = labelType.value[0].id;
	// 	labelChange(labelType.value[0].id);
	// }

	resetData();
	await loadImageDetail();
	if (imageList.value.length > 0 && imageList.value[0].labelList?.length > 0) {
		labelFileNameIndex.value = 0;
	}
	labelChange(labelFileNameIndex.value)
};

// 多选事件
const handleSelectionChange = (objs: { postId: string }[]) => {
	selectObjs.value = objs.map(({ postId }) => postId);
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

const selectImage = (param: string) => {
	// console.log("param", param);
};

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

const resetData = () => {
	imageList.value = [];
	page.pageSize = 15;
	page.pageNum = 1;
	page.totals = 0;
	hasMore.value = true;
};

const formatUrl = (bucketName: string, fileName: string) => {
	const fileUrlString = fileUrl + bucketName + '/' + fileName;
	let startUrl = fileUrlString.substring(0, 17);
	let endUrl = fileUrlString.substring(17).replace(/\/\/+/g, '/');
	return startUrl + endUrl;
};
const currentImageIndex = ref(0);
const showImage = (bucketName: string, fileName: string, index: number) => {
	currentImageIndex.value = index;
	dialogImageVisible.value = true;
	// viewerList.value[0] = formatUrl(bucketName, fileName);
};

const fetchDatasetLabelListData = (labelJson: string) => {
	// let res = await fetchList({ baseDatasetId: baseDatasetId });
	// console.log(labelJson)
	// if (labelJson != null && labelJson != '' && labelJson != undefined) {
	// 	labelType.value = JSON.parse(labelJson);
	// }
	// labelType.value = labelJson;
	if (imageList.value.length > 0 && imageList.value[0].labelList?.length > 0) {
		labelType.value = imageList.value[0].labelList;
		labelFileNameIndex.value = 0;
		labelChange(labelFileNameIndex.value)
	}
};

const labelType = ref<labelItem[]>([]);
const labelInfo = ref<LabelInfo>();

const labelFileNameIndex = ref();
const labelChange = async (value: any) => {
	// labelType.value?.forEach((item: any, index: any) => {
	// 	if (item.id === value) {
	// 		labelFileNameIndex.value = index;
	// 	}
	// });

	labelInfo.value = undefined;
	let taskId = labelType.value[labelFileNameIndex.value].taskId;
	const taskRes = await getTaskObj(taskId);
	if (taskRes.data && taskRes.data.tagList?.length) {
		labelInfo.value = taskRes.data;
	}

}

const getTagColor = (tagId: string) => {
	const tag = labelInfo.value?.tagList?.find((item: any) => item.tagId === tagId);
	return tag ? tag.color : '#c0c4cc';  // Default color
};
</script>

<style lang="scss" scoped>
// ::v-deep(.el-dialog__header) {
// 	font-size: 16px;
// 	font-weight: 600;
// 	margin: 0;
// 	padding: 16px 24px;
// 	background-color: #f2f2f5 !important;
// }

::v-deep .el-select__wrapper {
	width: 200px;
}
</style>
