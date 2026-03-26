<template>
	<el-dialog :title="form.baseModelId ? $t('common.editBtn') : $t('common.addBtn')" width="700" v-model="visible"
		:close-on-click-modal="false" draggable>
		<el-form ref="dataFormRef" :model="form" :rules="dataRules" label-width="auto" v-loading="loading">
			<el-form-item :label="t('baseModel.baseModelName')" prop="baseModelName">
				<el-input v-model="form.baseModelName" :placeholder="t('model.inputModelNameTip')" />
			</el-form-item>
			<el-form-item :label="t('baseModel.baseModelId')" prop="baseModelId">
				<el-input v-model="form.baseModelId" :placeholder="t('model.inputModelIdTip')" :disabled="form.baseModelId" />
			</el-form-item>
			<el-form-item :label="t('baseModel.modelType')" prop="baseModelType">
				<el-select :placeholder="$t('model.inputModelTypeTip')" class="w100" v-model="form.baseModelType">
					<el-option :key="item.value" :label="item.label" :value="item.value" v-for="item in model_type" />
				</el-select>
			</el-form-item>
			<el-form-item :label="t('baseModel.description')" prop="description">
				<el-input type="textarea" maxlength="150" rows="3" v-model="form.description"
					:placeholder="t('model.inputremarkTip')" />
			</el-form-item>
		</el-form>
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="visible = false">{{ $t('common.cancelButtonText') }}</el-button>
				<el-button type="primary" @click="onSubmit" :disabled="loading">{{ $t('common.confirmButtonText')
				}}</el-button>
			</span>
		</template>
	</el-dialog>
</template>

<script setup lang="ts" name="systemModelDialog">
import { useMessage } from '/@/hooks/message';
import { getObj, addObj, putObj, fetchBaseList, validateBaseModelName } from '/@/api/model/base-model';
import { useI18n } from 'vue-i18n';
import { useDict } from '/@/hooks/dict';

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

const { t } = useI18n();

// 定义变量内容
const dataFormRef = ref();
const visible = ref(false);
const loading = ref(false);

const { model_type } = useDict('model_type');

// 提交表单数据
const form = reactive({
	baseModelId: '',
	baseModelName: '',
	version: '',
	baseModelType: '',
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
				validateBaseModelName(rule, value, callback, form.baseModelId !== '');
			},
			trigger: 'blur',
		},
	],
	modelId: [{ required: true, message: '模型ID不能为空', trigger: 'blur' }],
	modelType: [{ required: true, message: '模型类型不能为空', trigger: 'blur' }],
	version: [{ required: true, message: '模型版本不能为空', trigger: 'blur' }],
	baseModelId: [{ required: true, message: '基础模型不能为空', trigger: 'blur' }],
	description: [{ required: true, message: '模型描述不能为空', trigger: 'blur' }],
});

// 打开弹窗
const openDialog = (id: string) => {
	visible.value = true;
	form.baseModelId = '';

	// 重置表单数据
	nextTick(() => {
		dataFormRef.value?.resetFields();
	});

	// 获取Model信息
	if (id) {
		form.baseModelId = id;
		getModelData(id);
	}
};

// 提交
const onSubmit = async () => {
	const valid = await dataFormRef.value.validate().catch(() => { });
	if (!valid) return false;

	try {
		loading.value = true;
		form.baseModelId ? await putObj(form) : await addObj(form);
		useMessage().success(t(form.baseModelId ? 'common.editSuccessText' : 'common.addSuccessText'));
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
			form.baseModelType = item.baseModelType;
		}
	})
};

// 暴露变量
defineExpose({
	openDialog,
});
</script>
