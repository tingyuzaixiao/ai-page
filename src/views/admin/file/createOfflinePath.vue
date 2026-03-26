<template>
	<!-- 新建基础数据集 -->
	<div class="mt-3 px-6 text-4xl font-bold">
		{{ form.id !== '' ? t('offline.editOfflinePath') : t('offline.createOfflinePath') }}
	</div>
	<el-divider border-style="dashed" />
	<div class="flex justify-center overflow-y-scroll h-5/6">
		<el-form v-show="!fileUploadVisible" class="w-4/5 max-w-7xl" ref="dataFormRef" :model="form" :rules="dataRules"
			label-width="200px" label-suffix="：" v-loading="loading">
			<el-form-item class="!mb-4" :label="t('offline.localPath')" prop="localPath">
				<el-input v-model="form.localPath" :placeholder="t('offline.inputLocalPathTip')" />
			</el-form-item>
			<el-form-item class="!mb-4 pt-3" :label="t('offline.serverIp')" prop="serverIp">
				<el-input v-model="form.serverIp" :placeholder="t('offline.inputServerIpTip')">
				</el-input>
				<!-- <p v-show="ipError.serverIP" style="color: #f56c6c;height: 0.5vh; font-size: small; margin-top: -8px;">{{
					ipError.serverIP }}</p> -->
			</el-form-item>
			<el-form-item class="!mb-4 pt-3" :label="t('offline.serverPort')" prop="serverPort">
				<el-input v-model="form.serverPort" :placeholder="t('offline.inputServerPortTip')" type="number">
				</el-input>
			</el-form-item>
			<el-form-item class="!mb-4 pt-3" :label="t('offline.serverUri')" prop="serverUri">
				<el-input v-model="form.serverUri" :placeholder="t('offline.inputServerUriTip')">
				</el-input>
			</el-form-item>
			<el-form-item class="!mb-4 pt-3" :label="t('offline.type')" prop="type">
				<div class="w-full grid grid-cols-3 gap-3">
					<el-card
						:class="['w-69', 'text-center', 'cursor-pointer', { '!border-primary !bg-[#F4F7FE]': item.value == form.type }]"
						body-class="" shadow="hover" v-for="(item) in offline_type" :key="item.value"
						@click="selectType(item.value)">
						<template #header>
							<div class="flex justify-center item-center">
								<span :class="['iconfont', '!text-4xl', 'text-primary', item.remarks]"></span>
								<span class="ml-2 text-lg font-extrabold ">{{ item.label }}</span>
							</div>
						</template>
						<p :class="['line-clamp-2', { 'font-bold': item.value == form.type }]">{{ item.desc }}</p>
					</el-card>
				</div>
			</el-form-item>
			<el-form-item class="!mb-4 pt-4" :label="t('offline.localIp')" prop="localIp">
				<el-input v-model="form.localIp" :placeholder="t('offline.inputLocalIpTip')">
				</el-input>
			</el-form-item>
			<el-form-item class="!mb-4 pt-4" :label="t('offline.publicIp')" prop="publicIp">
				<el-input v-model="form.publicIp" :placeholder="t('offline.inputPublicIpTip')">
				</el-input>
			</el-form-item>
			<el-form-item class="!mb-4 pt-4" :label="t('offline.description')" prop="description">
				<el-input type="textarea" maxlength="150" :rows="4" v-model="form.description"
					:placeholder="t('offline.inputDescriptionTip')" />
			</el-form-item>
		</el-form>
	</div>
	<el-divider />
	<div class="px-6 text-right">
		<el-button class="!px-12" size="default" type="primary" v-show="!fileUploadVisible" @click="onSubmit"
			:disabled="loading">{{
				form.id !== '' ? t('manage.modificationBtn') : t('common.completeBtn')
			}}</el-button>
		<el-button class="!px-12" size="default" :type="visible === 1 ? 'primary' : ''"
			@click="changeVisiblestring('offlinePathList')">{{
				visible === 1 ? t('common.finishedBtn') : t('common.cancelButtonText')
			}}</el-button>
	</div>
</template>

<script setup lang="ts" name="baseDataset">
import { useMessage } from '/@/hooks/message';
import { getObj, addObj, putObj, delObj, validateLocalPath } from '/@/api/admin/offline';
import { useI18n } from 'vue-i18n';
import { useDict } from '/@/hooks/dict';
// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh', 'changeVisibleString']);

const { t } = useI18n();
const { offline_type } = useDict('offline_type');

// 定义变量内容
const dataFormRef = ref();
const visible = ref(0);
const fileUploadVisible = ref(false);
const loading = ref(false);
const fileList = ref([]);

// 提交表单数据
const form = reactive({
	id: '',
	localPath: '',
	localIp: '',
	publicIp: '',
	serverIp: '',
	serverPort: '',
	serverUri: '',
	createBy: '',
	createTime: '',
	updateBy: '',
	updateTime: '',
	delFlag: '0',
	type: '0',
	description: '',
	protocol: ''
});

// 定义校验规则
const dataRules = ref({
	localPath: [
		{ required: true, message: '本地路径不能为空', trigger: 'blur' },
		{ min: 3, max: 100, message: '长度在 3 到 100 个字符', trigger: 'blur' },
		{
			validator: (rule: any, value: any, callback: any) => {
				validateLocalPath(rule, value, callback);
			},
			trigger: 'blur',
		},
	],
	serverIp: [
		{ required: false, trigger: 'blur' },
		{
			validator: (rule: any, value: any, callback: any) => {
				validateServerIP(rule, value, callback, value !== '' && !value);
			},
		}
	],
	localIp: [
		{ required: false, trigger: 'blur' },
		{
			validator: (rule: any, value: any, callback: any) => {
				validateServerIP(rule, value, callback, value !== '' && value != null);
			},
		}
	],
	publicIp: [
		{ required: false, trigger: 'blur' },
		{
			validator: (rule: any, value: any, callback: any) => {
				validateServerIP(rule, value, callback, value !== '' && value != null);
			},
		}
	],
	type: [{ required: true, message: '离线类型不能为空', trigger: 'blur' }],
});

const ipError = reactive({
	serverIP: '',
	localIp: '',
	publicIp: ''
})
const validateServerIP = (rule: any, value: any, callback: any, isEdit: boolean) => {
	// 先过滤非法字符
	if (isEdit) {
		form.serverIp = value.replace(/[^0-9.]/g, '');

		// 检查是否符合 IP 地址格式
		const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
		if (!ipPattern.test(form.serverIp)) {
			ipError.serverIP = '请输入纯数字有效的 IP 地址，并且 IP 地址中的每个部分必须在 0 到 255 之间';
			callback(new Error(ipError.serverIP));
		}

		// 检查每个部分是否在 0-255 之间
		const parts = form.serverIp.split('.');
		for (let part of parts) {
			const num = parseInt(part, 10);
			if (isNaN(num) || num < 0 || num > 255) {
				ipError.serverIP = 'IP 地址中的每个部分必须在 0 到 255 之间';
				callback(new Error(ipError.serverIP));
			}
		}

		// 清除错误提示
		ipError.serverIP = '';
		callback();
	} else {
		callback();
	}
}

// 打开弹窗
const openDialog = (type: string, id?: string) => {
	// 重置表单数据
	resetForm();
	console.log("baseDataset", form);
	// form.baseDatasetId = '';

	// 重置表单数据
	nextTick(() => {
		dataFormRef.value?.resetFields();
		dataFormRef.value?.clearValidate();
	});

	// 获取信息
	if (id) {
		form.id = id;
		getOfflinePath(id);
	}
};

// 选择类型
const selectType = (value: string) => {
	form.type = value
};

// 提交
const onSubmit = async () => {
	const valid = await dataFormRef.value.validate().catch(() => { });
	if (!valid) return false;

	try {
		loading.value = true;

		if (form.serverUri === '' || form.serverUri === null) {
			if (form.type === '0') {
				form.serverUri = '/dataset/'
			} else if (form.type === '1') {
				form.serverUri = '/model/'
			}
		}

		form.id ? await putObj(form) : await addObj(form);
		useMessage().success(t(form.id ? 'common.editSuccessText' : 'common.addSuccessText'));
		emit('refresh');
		changeVisiblestring('offlinePathList');
	} catch (err: any) {
		useMessage().error(err.msg);
	} finally {
		loading.value = false;
	}
};

// 初始化表格数据
const getOfflinePath = (id: string) => {
	// 获取基础数据集数据
	getObj(id).then((res: any) => {
		Object.assign(form, res.data);
		// console.log("baseDataset", form);

	});
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
		id: '',
		localPath: '',
		localIp: '',
		publicIp: '',
		protocol: '',
		serverIp: '',
		serverPort: '',
		type: '0',
		size: 0,
		createBy: '',
		createTime: '',
		updateBy: '',
		updateTime: '',
		description: '',
		delFlag: '0'
	});
}

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
