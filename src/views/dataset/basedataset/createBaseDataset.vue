<template>
	<!-- 新建基础数据集 -->
	<div class="mt-3 px-6 text-4xl font-bold">
		{{ form.baseDatasetId && !fileUploadVisible ? t('manage.editBaseDataset') : t('manage.addBtn') }}
	</div>
	<el-divider border-style="dashed" />
	<div class="flex justify-center overflow-y-scroll h-5/6">
		<el-form v-show="!fileUploadVisible" class="w-4/5 max-w-7xl" ref="dataFormRef" :model="form" :rules="dataRules"
			label-width="200px" label-suffix="：" v-loading="loading">
			<el-form-item class="!mb-4" :label="t('manage.baseDatasetName')" prop="baseDatasetName">
				<el-input v-model="form.baseDatasetName" :placeholder="t('manage.inputBaseDatasetNameTip')"
					:disabled="!!(form.count || form.size)" />
			</el-form-item>
			<el-form-item class="!mb-4" :label="t('manage.dataType')" prop="dataType">
				<div class="w-full grid grid-cols-3 gap-3">
					<el-card
						:class="['w-68', 'text-center', { '!border-primary !bg-[#F4F7FE]': item.value == form.dataType, 'cursor-no-drop': !!(form.count || form.size), 'cursor-pointer': !(form.count || form.size) }]"
						body-class="" shadow="hover" v-for="(item) in data_type" :key="item.value"
						@click="!(form.count || form.size) && selectType(item.value)">
						<template #header>
							<div class="flex justify-center item-center">
								<span :class="['iconfont', '!text-4xl', 'text-primary', item.remarks]"></span>
								<span class="ml-2 text-lg font-extrabold ">{{ item.label }}</span>
							</div>
						</template>
						<p :class="['line-clamp-2', { 'font-bold': item.value == form.dataType }]">{{ item.desc }}</p>
					</el-card>
				</div>
			</el-form-item>
			<el-form-item class="!mb-4" :label="t('manage.baseRemark')" prop="description">
				<el-input type="textarea" maxlength="150" :rows="4" v-model="form.description"
					:placeholder="t('manage.inputBaseRemarkTip')" />
			</el-form-item>
			<el-form-item class="!mb-4" :label="t('manage.taskType')" prop="labelType">
				<el-select :placeholder="t('manage.importdataTyteTip')" class="w100" v-model="form.labelType">
					<el-option :key="item.value" :label="item.label" :value="item.value" v-for="item in base_dataset_type" />
				</el-select>
			</el-form-item>

			<el-form-item class="!mb-4" :label="t('manage.importdatasetMethod')" prop="importdatasetMethod">
				<el-select :placeholder="t('manage.importdatasetTip')" class="w100" v-model="form.importType">
					<el-option :key="item.value" :label="item.label" :value="item.value" v-for="item in import_method" />
				</el-select>
			</el-form-item>

			<!-- <el-form-item v-show="importdatasetMethod != '1'" :label="t('manage.uploadFile')" prop="uploadFile">
        <upload :model-value="fileList" type="fileUploader" />
      </el-form-item> -->
		</el-form>
		<div class="w-155" v-show="fileUploadVisible" :title="t('sysuser.importUserTip')">
			<upload :model-value="fileList" @update:model-value="handleUpdate" type="fileUploader" :data="form"
				ref="uploadRef" />
		</div>
	</div>
	<el-divider />
	<div class="px-6 text-right">
		<el-button class="!px-12" size="default" type="primary" v-show="form.baseDatasetId === ''" @click="nextSubmit">{{
			t('manage.importdataset')
		}}</el-button>
		<el-button class="!px-12" size="default" type="primary" v-show="!fileUploadVisible" @click="onSubmit"
			:disabled="loading">{{
				form.baseDatasetId ? t('manage.modificationBtn') : t('common.completeBtn')
			}}</el-button>
		<el-button class="!px-12" size="default" :type="visible === 1 ? 'primary' : ''"
			@click="changeVisiblestring('basedatasetList')">{{
				visible === 1 ? t('common.finishedBtn') : t('common.cancelButtonText')
			}}</el-button>
	</div>
</template>

<script setup lang="ts" name="baseDataset">
import { useMessage } from '/@/hooks/message';
import { addBaseDataset, getBaseDatasetById, addObj, editBaseDataset, validateBaseDatasetName } from '/@/api/dataset/manage';
import { useI18n } from 'vue-i18n';
import { useDict } from '/@/hooks/dict';
const Upload = defineAsyncComponent(() => import('/@/components/Upload/index.vue'));

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh', 'changeVisibleString']);

const { t } = useI18n();
const { base_dataset_type, data_type } = useDict('base_dataset_type', 'data_type');
const { import_method } = useDict('import_method');

// 定义变量内容
const dataFormRef = ref();
const uploadRef = ref();
const visible = ref(0);
const fileUploadVisible = ref(false);
const loading = ref(false);
const fileList = ref([]);

// 提交表单数据
const form = reactive({
	baseDatasetId: '',
	baseDatasetName: '',
	count: 0,
	type: '0',
	state: '0',
	labelJson: '',
	labelType: undefined,
	uploadType: '',
	dataType: '0',
	description: '',
	importType: '0',
	dialogType: '',
	size: 0,
	createBy: '',
	createTime: '',
	updateBy: '',
	updateTime: '',
	delFlag: '0'
});

// 定义校验规则
const dataRules = ref({
	baseDatasetName: [
		{ required: true, message: '基础数据集名称不能为空', trigger: 'blur' },
		{ min: 3, max: 100, message: '长度在 3 到 100 个字符', trigger: 'blur' },
		{
			validator: (rule: any, value: any, callback: any) => {
				validateBaseDatasetName(rule, value, callback, form.baseDatasetId, form.baseDatasetId !== '');
			},
			trigger: 'blur',
		},
	],
	// labelType: [{ required: true, message: '基础数据集标注类型不能为空', trigger: 'blur' }],
	dataType: [{ required: true, message: '基础数据数据类型不能为空', trigger: 'blur' }],
	importdatasetMethod: [
		// { required: true, message: '导入方式不能为空', trigger: 'blur' },
		{
			validator: () => form.importType.length > 0,
			message: '导入方式不能为空',
			trigger: 'blur',
		},
	],
});

// 打开弹窗
const openDialog = (type: string, id?: string) => {
	// 重置表单数据
	resetForm();
	console.log("baseDataset", form);
	// form.baseDatasetId = '';

	// 重置表单数据
	// nextTick(() => {
	// 	dataFormRef.value?.resetFields();
	// });

	// 获取信息
	if (id) {
		form.baseDatasetId = id;
		getBaseDatasetlData(id);
	}
};

// 选择类型
const selectType = (value: string) => {
	form.dataType = value
};

// 下一步
const nextSubmit = async () => {
	const valid = await dataFormRef.value.validate().catch(() => { });
	if (!valid) return false;

	try {
		visible.value = 1;
		loading.value = true;
		const add = await addBaseDataset(form);
		if (add && add.code === 0) {
			form.baseDatasetId = add.data;
		}
		useMessage().success(t('common.addSuccessText'));
		emit('refresh');
		// 传递参数：添加基础数据集图片
		form.dialogType = '2';
		fileUploadVisible.value = true;
		uploadRef.value.getFileDir()
	} catch (err: any) {
		useMessage().error(err.msg);
	} finally {
		loading.value = false;
	}
};

// 提交
const onSubmit = async () => {
	const valid = await dataFormRef.value.validate().catch(() => { });
	if (!valid) return false;

	try {
		loading.value = true;
		form.baseDatasetId ? await editBaseDataset(form) : await addBaseDataset(form);
		useMessage().success(t(form.baseDatasetId ? 'common.editSuccessText' : 'common.addSuccessText'));
		emit('refresh');
		changeVisiblestring('basedatasetList');
	} catch (err: any) {
		useMessage().error(err.msg);
	} finally {
		loading.value = false;
	}
};

// 初始化表格数据
const getBaseDatasetlData = (id: string) => {
	// 获取基础数据集数据
	getBaseDatasetById(id).then((res: any) => {
		Object.assign(form, res.data);
		// console.log("baseDataset", form);

	});
};

// 单选框
const radioChange = (value: any) => {
	console.log("xxxxxx", value);
}

const handleUpdate = (value: any) => {
	console.log("handleUpdate", value);
	// 回传上传列表数据
	fileList.value = value;
};

// 切换主界面
const changeVisiblestring = async (value: string) => {
	if (fileList.value.length > 0) {
		// form.baseDatasetId ? await editBaseDataset(form) : useMessage().error('未获取到baseDatasetId,状态更新失败');
		fileList.value = [];
		emit('refresh');
	}
	visible.value = 0;
	fileUploadVisible.value = false;
	emit('changeVisibleString', value);

	resetForm();
}

const resetForm = () => {
	Object.assign(form, {
		baseDatasetId: '',
		baseDatasetName: '',
		count: 0,
		type: '0',
		state: '0',
		labelJson: '',
		labelType: undefined,
		dataType: '0',
		description: '',
		importType: '0',
		dialogType: '',
		size: 0,
		createBy: '',
		createTime: '',
		updateBy: '',
		updateTime: '',
		delFlag: '0'
	});
}

// 监听函数，监听fileList的变化,对fileList深度监听
watch(fileList, (newVal) => {
	console.log('fileList:', newVal);
	if (newVal) {
		form.state = '2';
		// editBaseDataset(form).then((res: any) => {
		// 	if (res.code === 0) { useMessage().success(t('common.editSuccessText')); }
		// });
	}
}, { deep: true, immediate: true });


// 暴露变量
defineExpose({
	openDialog,
});
</script>

<style lang="scss" scoped>
::v-deep(.el-form-item) {
	margin-bottom: 40px;
}

::v-deep(.el-form-item__label-wrap) {
	margin-right: 2em;
}

::v-deep(.el-card__header) {
	padding: 6px 20px !important;
}
</style>
