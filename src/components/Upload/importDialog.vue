<template>
	<el-dialog :title="dialogTitle" v-model="visible" @opened="uploadRef.getFileDir()" @close="closeDialog"
		:show-close="!uploadStatus" width="600" :close-on-click-modal="false" draggable destroy-on-close>
		<upload :model-value="fileList" :type="uploadType" :data="parameters" :limit=10000 ref="uploadRef"
			@update:dataFromUpload="handleDataFrom" />
		<template #footer>
			<!-- <span class="dialog-footer"> -->
			<div class="text-center mt-[-30px] w-full">
				<el-button icon="Upload" class="w-32" @click="importBtn()" type="primary" :disabled="uploadStatus">{{
					t('common.importBtn')
				}}</el-button>
			</div>
			<!-- </span> -->
		</template>
	</el-dialog>
</template>

<script setup lang="ts" name="ImportLabelDialog">
import { useI18n } from 'vue-i18n';
import { useMessage } from '/@/hooks/message';
const Upload = defineAsyncComponent(() => import('./index.vue'));
const emit = defineEmits(['refresh', 'update:dataFromImport']);

const { t } = useI18n();

// 定义变量内容
const visible = ref(false);
const fileList = ref([]);
const uploadRef = ref();
const dialogTitle = ref('导入文件');
const uploadType = ref('fileUploader');
const parameters = reactive({
	baseDatasetId: '',
	baseDatasetName: '',
	datasetId: '',
	datasetName: '',
	dialogType: '',
	dataType: '',
	labelType: '',
	subLabelType: '',
	taskId: '',
});

const uploadStatus = ref(false);

const handleDataFrom = (data: any) => {
	console.log('Data received from child:', data);
	uploadStatus.value = false;
	// emit('update:dataFromImport', false);
}

const closeDialog = () => {
	visible.value = false;
}

// 打开弹窗
const openDialog = (params: any) => {
	const { type, id, name, datatype, taskId, labelType, subLabelType } = params;
	fileList.value = [];
	visible.value = true;
	uploadStatus.value = false;
	parameters.baseDatasetId = id;
	parameters.baseDatasetName = name;
	parameters.dataType = datatype;
	parameters.labelType = labelType;
	parameters.subLabelType = subLabelType;
	if (type === 'baseLabel') {
		parameters.dialogType = '0';
		parameters.taskId = taskId;
		dialogTitle.value = t('manage.importdataset');
	} else if (type === 'dataLabel') {
		parameters.dialogType = '1';
		dialogTitle.value = t('manage.importLabelFile');
	} else if (type === 'dataImg') {
		parameters.dialogType = '2';
		dialogTitle.value = t('manage.importImgFile');
	} else if (type === 'label') {
		parameters.dialogType = '3';
		parameters.taskId = taskId;
		dialogTitle.value = t('manage.importLabelFile');
	} else if (type === 'referenceLabel') {
		parameters.dialogType = '4';
		parameters.taskId = taskId;
		uploadType.value = 'delayed'
		dialogTitle.value = t('manage.importReferenceLabelFile');
	} else {
		useMessage().wraning('未获取到类型数据');
	}
	// console.log('parameters:', parameters);
};

const success = () => {
	emit('refresh');
};


const importBtn = () => {
	// visible.value = false;
	// emit('update:dataFromImport', true);
	uploadStatus.value = true;
	uploadRef.value.delayedFileUploadSubmit();
	// uploadRef.value.resetData()
};

// 暴露变量
defineExpose({
	openDialog,
});
</script>
