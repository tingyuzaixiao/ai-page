<template>
	<el-dialog :title="parameters.dialogType == '2' ? t('manage.importdataset') : t('manage.importLabelFile')"
		v-model="visible" @opened="uploadRef.getFileDir()" @close="uploadRef.resetData()" width="600"
		:close-on-click-modal="false" draggable destroy-on-close>
		<upload @change="success" :model-value="fileList" type="picture-card" :data="parameters" :limit=10000
			ref="uploadRef" />
		<template #footer>
			<!-- <span class="dialog-footer">
				<el-button @click="visible = false" type="primary">{{ t('common.confirmButtonText') }}</el-button>
			</span> -->
		</template>
		<div style="height: 1rem"></div>
	</el-dialog>
</template>

<script setup lang="ts" name="SysFileDialog">
import { useI18n } from 'vue-i18n';
import { useMessage } from '/@/hooks/message';
const Upload = defineAsyncComponent(() => import('/@/components/Upload/index.vue'));
const emit = defineEmits(['refresh']);

const { t } = useI18n();

// 定义变量内容
const visible = ref(false);
const fileList = ref([]);
const uploadRef = ref();
const parameters = reactive({
	baseDatasetId: '',
	baseDatasetName: '',
	datasetId: '',
	datasetName: '',
	dialogType: '',
	dataType: '',
});

// 打开弹窗
const openDialog = (params: any) => {
	const { type, id, name, datatype } = params;
	fileList.value = [];
	visible.value = true;
	if (type === 'baseLabel') {
		parameters.baseDatasetId = id;
		parameters.baseDatasetName = name;
		parameters.dialogType = '0';
		parameters.dataType = datatype;
	} else if (type === 'dataLabel') {
		parameters.baseDatasetId = id;
		parameters.datasetName = name;
		parameters.dialogType = '1';
		parameters.dataType = datatype;
	} else if (type === 'dataImg') {
		parameters.baseDatasetId = id;
		parameters.baseDatasetName = name;
		parameters.dialogType = '2';
		parameters.dataType = datatype;
	} else {
		useMessage().wraning('未获取到类型数据');
	}
};

const success = () => {
	emit('refresh');
};

// 暴露变量
defineExpose({
	openDialog,
});
</script>