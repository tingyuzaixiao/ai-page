<template>
	<div class="layout-padding">
		<div class="layout-padding-auto layout-padding-view">
			<!-- 导入标签 -->
			<div class="mt-3 px-6 text-4xl font-bold">
				{{ t('manage.importLabelFile') }}
			</div>
			<el-divider border-style="dashed" />
			<div class="overflow-y-scroll">
				<div class="w-175  mx-auto">
					<upload @change="success" :model-value="fileList" type="fileUploader" :data="parameters" :limit=10000
						ref="uploadLabelRef" />
				</div>
				<div class="w-155 mx-auto px-6 text-right">
					<el-button @click="handleClose" type="primary">{{ t('common.confirmButtonText') }}</el-button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts" name="AddLabel">
import { useI18n } from 'vue-i18n';
import { useMessage } from '/@/hooks/message';
// 使用异步加载导致uploadLabelRef无法在onMounted函数中获取
// const Upload = defineAsyncComponent(() => import('/@/components/Upload/index.vue'));
import Upload from '/@/components/Upload/index.vue';
import router from '/@/router';
const emit = defineEmits(['refresh']);

const { t } = useI18n();
const route = useRoute();

// 定义变量内容
const fileList = ref([]);
const uploadLabelRef = ref();
const parameters = reactive({
	baseDatasetId: '',
	baseDatasetName: '',
	datasetId: '',
	datasetName: '',
	dialogType: '',
	dataType: '',
});

// 打开弹窗
onMounted(() => {
	const { type, id, name, datatype } = route.query;
	fileList.value = [];
	if (type === 'baseLabel') {
		parameters.baseDatasetId = id as string;
		parameters.baseDatasetName = name as string;
		parameters.dialogType = '0';
		parameters.dataType = datatype as string;
	} else {
		useMessage().wraning('未获取到类型数据');
	}
	nextTick(() => {
		if (uploadLabelRef) {
			uploadLabelRef.value.getFileDir();
		} else {
			console.error('uploadLabelRef is undefined');
		}
	});
});

// onBeforeUnmount(() => {
// 	uploadLabelRef.value.resetData()
// });

// 上传成功

const success = () => {
	// emit('refresh');
};

// 确定返回
const handleClose = () => {
	router.push({
		path: '/dataset/basedataset/index',
	});
};

// // 暴露变量
// defineExpose({
// 	openDialog,
// });
</script>
