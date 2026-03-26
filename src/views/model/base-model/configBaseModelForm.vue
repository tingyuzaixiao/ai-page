<template>
	<el-dialog :title="t('baseModel.baseModelParamsConfig')" width="780" v-model="visible" :close-on-click-modal="false"
		draggable>
		<el-form class="max-w-7xl" ref="dataFormRef" :model="form" :rules="dataRules" label-width="auto"
			v-loading="loading">
			<el-row>
				<el-col :span="24">
					<el-form-item :label="t('model.baseModelName')" prop="baseModelName">
						<el-input v-model="form.baseModelName" :placeholder="t('model.inputBaseModelNameTip')" disabled />
					</el-form-item>
				</el-col>
				<el-col class="mt-2" :span="12">
					<div class="ml-5 mb-2 font-bold text-base/normal">{{ t('baseModel.baseModelParams') }}:</div>
					<el-form-item v-show="Object.keys(form.params).length < 1">
						<el-result class="ml-10 text-xs/3 w-2/3" icon="warning" :sub-title="t('baseModel.noBaseModelParams')" />
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
										v-for="(subChild, subChildIndex) in Object.keys(form.params[item][child]).sort()"
										:key="subChildIndex">
										<el-input v-model="form.params[item][child][subChild]"
											:placeholder="t('model.inputParamNameTip') + subChild + t('model.valueName')" />
									</el-form-item>
								</div>
							</el-form-item>
						</div>
					</el-form-item>
				</el-col>
				<el-col class="mt-2" :span="12">
					<div class="ml-5 mb-2 font-bold text-base/normal">{{ t('baseModel.baseModelTrainParams') }}:</div>
					<el-form-item v-show="Object.keys(form.trainParams).length < 1">
						<el-result class="ml-10 text-xs/3 w-2/3" icon="warning"
							:sub-title="t('baseModel.noBaseModelTrainParams')" />
					</el-form-item>
					<el-form-item :label="item + ':'" v-for="(item, index) in Object.keys(form.trainParams).sort()" :key="index">
						<div class="w-full" v-if="!(form.trainParams[item] instanceof Object)">
							<el-input v-model="form.trainParams[item]"
								:placeholder="t('model.inputParamNameTip') + item + t('model.valueName')" />
						</div>
						<div v-else class="w-full">
							<br />
							<el-form-item class="p-1" :label="child + ':'" label-width="2vw"
								v-for="(child, childIndex) in Object.keys(form.trainParams[item]).sort()" :key="childIndex">
								<div class="w-full" v-if="!(form.trainParams[item][child] instanceof Object)">
									<el-input v-model="form.trainParams[item][child]"
										:placeholder="t('model.inputParamNameTip') + child + t('model.valueName')" />
								</div>
								<div v-else class="w-full">
									<br />
									<el-form-item class="p-1" label-width="2vw" :label="subChild + ':'"
										v-for="(subChild, subChildIndex) in Object.keys(form.trainParams[item][child]).sort()"
										:key="subChildIndex">
										<el-input v-model="form.trainParams[item][child][subChild]"
											:placeholder="t('model.inputParamNameTip') + subChild + t('model.valueName')" />
									</el-form-item>
								</div>
							</el-form-item>
						</div>
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="visible = false">{{ $t('common.cancelButtonText') }}</el-button>
				<el-button type="primary" @click="onSubmit" :disabled="loading" v-auth="'sys_basemodel_online_update'">{{
					$t('common.confirmButtonText') }}</el-button>
			</span>
		</template>
	</el-dialog>
</template>

<script setup lang="ts" name="systemModelDialog">
import { useMessage } from '/@/hooks/message';
import { getBaseModelConfig, updateBaseModelConfig } from '/@/api/model/base-model';
import { useI18n } from 'vue-i18n';

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

const { t } = useI18n();

// 定义变量内容
const dataFormRef = ref();
const visible = ref(false);
const loading = ref(false);

const configTitle = ref();

// 提交表单数据
const form = ref({ baseModelId: '', baseModelName: '', params: {}, trainParams: {} }) as any;

// 定义校验规则
const dataRules = ref({
	baseModelName: [{ required: true, message: '基础模型名称不能为空', trigger: 'blur' }],
});

// 打开弹窗
const openDialog = (id: string, configType: string) => {
	visible.value = true;
	// 重置表单数据
	form.value.baseModelId = '';

	nextTick(() => {
		dataFormRef.value?.resetFields();
	});

	// 获取Model信息
	if (id) {
		form.value.baseModelId = id;
		getModelConfigData(id);
	}
};

// 提交
const onSubmit = async () => {
	const valid = await dataFormRef.value.validate().catch(() => { });
	if (!valid) return false;

	try {
		loading.value = true;
		await updateBaseModelConfig(form.value);
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
const getModelConfigData = (id: string) => {
	form.value.params = {};
	form.value.trainParams = {};
	// 获取部门数据
	getBaseModelConfig(id).then((res: any) => {
		// Object.assign(form, res.data);
		let data = JSON.parse(res.data);
		form.value.baseModelName = data.baseModelName;
		if (data.params) {
			form.value.params = data.params
		}

		if (data.trainParams) {
			form.value.trainParams = data.trainParams
		}

		if (!data.params && !data.trainParams) {
			useMessage().wraning(t('baseModel.noModelConfigAndTrain'));
		} else if (!data.params || Object.keys(data.params).length == 0) {
			useMessage().wraning(t('baseModel.noModelConfig'));
		} else if (!data.trainParams || Object.keys(data.trainParams).length == 0) {
			useMessage().wraning(t('baseModel.noModelTrainConfig'));
		}
	});
};

// 暴露变量
defineExpose({
	openDialog,
});
</script>
