<template>
	<el-dialog :title="$t('model.modelConfig')" width="600" v-model="visible" :close-on-click-modal="false" draggable>
		<el-form ref="dataFormRef" :model="form" :rules="dataRules" label-width="110px" v-loading="loading">
			<el-form-item :label="t('model.modelName')" prop="modelName">
				<el-input v-model="form.modelName" :placeholder="t('model.inputModelNameTip')" disabled />
			</el-form-item>
			<el-form-item :label="t('model.baseModelName')" prop="baseModelName">
				<el-input v-model="form.baseModelName" :placeholder="t('model.inputBaseModelNameTip')" disabled />
			</el-form-item>
			<div class="ml-10 mb-2 font-bold text-base">{{ t('baseModel.baseModelParams') }}:</div>
			<el-form-item v-show="Object.keys(form.params).length === 0">
				<el-result class="ml-3 text-xs/3 w-2/3" icon="warning" :sub-title="t('baseModel.noBaseModelParams')" />
			</el-form-item>
			<el-form-item :label="item + ':'" v-for="(item, index) in Object.keys(form.params).sort()" :key="index">
				<div class="w-full" v-if="!(form.params[item] instanceof Object)">
					<el-input v-model="form.params[item]"
						:placeholder="t('model.inputParamNameTip') + item + t('model.valueName')" />
				</div>
				<div v-else class="w-full">
					<br />
					<el-form-item class="p-1" :label="child + ':'" label-width="2vw"
						v-for="(child, childIndex) in Object.keys(form.params[item]).sort()" :key="childIndex">
						<div class="w-full" v-if="!(form.params[item][child] instanceof Object)">
							<el-input v-model="form.params[item][child]"
								:placeholder="t('model.inputParamNameTip') + child + t('model.valueName')" />
						</div>
						<div v-else class="w-full">
							<br />
							<el-form-item class="p-1" label-width="2vw" :label="subChild + ':'"
								v-for="(subChild, subChildIndex) in Object.keys(form.params[item][child]).sort()" :key="subChildIndex">
								<el-input v-model="form.params[item][child][subChild]"
									:placeholder="t('model.inputParamNameTip') + subChild + t('model.valueName')" />
							</el-form-item>
						</div>
					</el-form-item>
				</div>
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
import { getModelConfig, updateModelConfig } from '/@/api/model/model';
import { useI18n } from 'vue-i18n';

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

const { t } = useI18n();

// 定义变量内容
const dataFormRef = ref();
const visible = ref(false);
const loading = ref(false);

// 提交表单数据
const form = ref({ modelId: '', configType: 'config', modelName: '', isBaseModel: false, params: {} }) as any;

// 定义校验规则
const dataRules = ref({
	modelName: [
		{ required: true, message: '模型名称不能为空', trigger: 'blur' },
		// {
		//   validator: (rule: any, value: any, callback: any) => {
		//     validateModelName(rule, value, callback, form.modelId !== '');
		//   },
		//   trigger: 'blur',
		// },
	],
	baseModelName: [{ required: true, message: '基础模型名称不能为空', trigger: 'blur' }],
});

// 打开弹窗
const openDialog = (id: string) => {
	visible.value = true;
	// 重置表单数据
	// nextTick(() => {
	// 	dataFormRef.value?.resetFields();
	// });

	// 获取Model信息
	if (id) {
		form.value.modelId = id;
		getModelConfigData(form.value.modelId, '');
	} else {
		form.value.modelId = '';
		form.value.modelName = '';
	}
};


// 提交
const onSubmit = async () => {
	const valid = await dataFormRef.value.validate().catch(() => { });
	if (!valid) return false;

	try {
		loading.value = true;
		await updateModelConfig(form.value);
		useMessage().success(t('model.updateModelConfigSuccess'));
		visible.value = false;
		emit('refresh');
	} catch (err: any) {
		useMessage().error(err.msg);
	} finally {
		loading.value = false;
	}
};

// 初始化表格数据
const getModelConfigData = (id: string, modelClass: string) => {
	form.value.params = {};
	// 获取部门数据
	getModelConfig(id, form.value.isBaseModel, form.value.configType, modelClass).then((res: any) => {
		// Object.assign(form, res.data);
		let data = JSON.parse(res.data);
		form.value.modelName = data.modelName;
		form.value.baseModelName = data.baseModelName;
		if (data.params) {
			form.value.params = data.params
		} else {
			useMessage().wraning(t('model.noModelConfig'));
		}
	});
};

// 暴露变量
defineExpose({
	openDialog,
});
</script>
