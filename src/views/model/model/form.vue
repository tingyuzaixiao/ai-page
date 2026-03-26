<template>
	<el-dialog :title="form.modelId ? $t('common.editBtn') : $t('common.addBtn')" width="600" v-model="visible"
		:close-on-click-modal="false" draggable>
		<el-form ref="dataFormRef" :model="form" :rules="dataRules" label-width="90px" v-loading="loading">
			<el-form-item :label="t('model.modelName')" prop="modelName">
				<el-input v-model="form.modelName" :placeholder="t('model.inputModelNameTip')" />
			</el-form-item>
			<el-form-item :label="t('model.modelId')" prop="modelId">
				<el-input v-model="form.modelId" :placeholder="t('model.inputModelIdTip')" :disabled="form.modelId" />
			</el-form-item>
			<!-- <el-form-item :label="t('model.modelVersion')" prop="version">
				<el-input v-model="form.version" :placeholder="t('model.inputModelVersionTip')" />
			</el-form-item> -->
			<el-form-item :label="t('model.baseModel')" prop="baseModelId">
				<el-select :placeholder="$t('model.inputBaseModelTip')" class="w100" clearable
					@change="changeModelType(form.baseModelId)" v-model="form.baseModelId">
					<el-option :key="item.baseModelId" :label="item.baseModelName" :value="item.baseModelId"
						v-for="item in base_model_type" />
				</el-select>
			</el-form-item>
			<el-form-item :label="t('model.taskType')" prop="modelType">
				<el-select :placeholder="$t('model.inputModelTypeTip')" class="w100" :disabled="form.modelId"
					v-model="form.modelType">
					<el-option :key="item.value" :label="item.label" :value="item.value" v-for="item in model_type" />
				</el-select>
			</el-form-item>
			<el-form-item :label="t('model.dataType')" prop="modelType">
				<el-select :placeholder="$t('model.inputModelTypeTip')" class="w100" :disabled="form.modelId"
					v-model="form.dataType">
					<el-option :key="item.value" :label="item.label" :value="item.value" v-for="item in data_type" />
				</el-select>
			</el-form-item>
			<el-form-item :label="t('model.description')" prop="description">
				<el-input type="textarea" maxlength="150" rows="3" v-model="form.description"
					:placeholder="t('model.inputremarkTip')" />
			</el-form-item>
		</el-form>
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="visible = false">{{ $t('common.cancelButtonText') }}</el-button>
				<el-button type="primary" @click="onSubmit" :disabled="loading">{{ $t('common.confirmButtonText') }}</el-button>
			</span>
		</template>
	</el-dialog>
</template>

<script setup lang="ts" name="systemModelDialog">
import { useMessage } from '/@/hooks/message';
import { getObj, addObj, putObj, fetchBaseList, validateModelName } from '/@/api/model/model';
import { useI18n } from 'vue-i18n';
import { useDict } from '/@/hooks/dict';
import { dataType } from 'element-plus/es/components/table-v2/src/common';

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

const { t } = useI18n();

// 定义变量内容
const dataFormRef = ref();
const visible = ref(false);
const loading = ref(false);

const { model_type, data_type } = useDict('model_type', 'data_type');

// 提交表单数据
const form = reactive({
	modelId: '',
	baseModelId: '',
	modelName: '',
	version: '',
	modelType: '',
	dataType: '',
	description: '',
	createTime: '',
	createBy: '',
	updateTime: '',
	updateBy: '',
});

//获取基础模型列表
let base_model_type: BaseModel[] = reactive<BaseModel[]>([]);
fetchBaseList().then((res) => {
	base_model_type = res.data;
});

// 定义校验规则
const dataRules = ref({
	modelName: [
		{ required: true, message: '模型名称不能为空', trigger: 'blur' },
		{
			validator: (rule: any, value: any, callback: any) => {
				validateModelName(rule, value, callback, form.modelId !== '');
			},
			trigger: 'blur',
		},
	],
	modelId: [{ required: true, message: '模型ID不能为空', trigger: 'blur' }],
	modelType: [{ required: true, message: '模型类型不能为空', trigger: 'blur' }],
	// version: [{ required: true, message: '模型版本不能为空', trigger: 'blur' }],
	baseModelId: [{ required: true, message: '基础模型不能为空', trigger: 'blur' }],
	description: [{ required: true, message: '模型描述不能为空', trigger: 'blur' }],
});

// 打开弹窗
const openDialog = (id: string) => {
	visible.value = true;
	form.modelId = '';

	// 重置表单数据
	nextTick(() => {
		dataFormRef.value?.resetFields();
	});

	// 获取Model信息
	if (id) {
		form.modelId = id;
		getModelData(id);
	}
};

// 提交
const onSubmit = async () => {
	const valid = await dataFormRef.value.validate().catch(() => { });
	if (!valid) return false;

	try {
		loading.value = true;
		form.modelId ? await putObj(form) : await addObj(form);
		useMessage().success(t(form.modelId ? 'common.editSuccessText' : 'common.addSuccessText'));
		visible.value = false;
		emit('refresh');
	} catch (err: any) {
		useMessage().error(err.msg);
	} finally {
		loading.value = false;
	}
};

// 初始化表格数据
const getModelData = (id: string) => {
	// 获取部门数据
	getObj(id).then((res: any) => {
		Object.assign(form, res.data);
	});
};

//修改模型类型
const changeModelType = (baseModelId?: string) => {
	base_model_type.forEach(item => {
		if (item.baseModelId === baseModelId && item.baseModelType) {
			form.modelType = item.baseModelType;
		}
	})
};

// 暴露变量
defineExpose({
	openDialog,
});
</script>
