<template>
	<!-- 新建基础数据集 -->
	<div class="mt-3 px-6 text-4xl font-bold">
		{{ programParams.programId ? $t('program.programEditBtn') : $t('program.addBtn') }}
	</div>
	<el-divider border-style="dashed" />
	<div class="flex justify-center my-6 overflow-y-scroll h-4/6">
		<el-form class="w-4/5 max-w-7xl" ref="programDialogRef" :model="programParams" :rules="programRules"
			label-width="auto" label-suffix="：" v-loading="loading">
			<el-form-item :label="t('program.programName')" prop="name">
				<el-input :placeholder="t('program.inputProgramNameTip')" v-model="programParams.name"
					:disabled="!!programParams.id"></el-input>
			</el-form-item>
			<!-- <el-form-item :label="t('program.programType')" prop="type">
				<div class="w-full flex justify-between">
					<el-card v-for="(item, index) in model_type" :key="index" shadow="hover"
						:class="['w-68', 'cursor-pointer', { '!border-primary !bg-[#F4F7FE]': programParams.type === item.value }]"
						@click="selectCard(item.value)">
						<template #header>
							<div class="flex justify-center item-center">
								<i :class="['iconfont', '!text-4xl', 'text-primary', item.remarks]"></i>
								<span class="ml-2 text-lg font-extrabold ">{{ item.label }}</span>
							</div>
						</template>
<span class="relative left-[-10px] top-[-8px] font-bold">应用场景</span>
<p class="relative left-[-10px] top-[5px] flex justify-between"
	:class="['line-clamp-2', { 'font-bold': item.value == programParams.type }]">
	<el-tag type="primary" v-for="(desc, index) in item.desc.split(',')" :key="index">{{ desc }}</el-tag>
</p>
</el-card>
</div>
</el-form-item> -->
			<el-form-item class="!mb-4" :label="t('program.dataType')" prop="dataType">
				<div class="w-full grid grid-cols-3 gap-3">
					<el-card
						:class="['w-68', 'text-center', 'cursor-pointer', { '!border-primary !bg-[#F4F7FE]': item.value == programParams.dataType }]"
						body-class="" shadow="hover" v-for="(item) in data_type" :key="item.value" @click="selectCard(item.value)">
						<template #header>
							<div class="flex justify-center item-center">
								<span :class="['iconfont', '!text-4xl', 'text-primary', item.remarks]"></span>
								<span class="ml-2 text-lg font-extrabold ">{{ item.label }}</span>
							</div>
						</template>
						<p :class="['line-clamp-2', { 'font-bold': item.value == programParams.dataType }]">{{ item.desc }}</p>
					</el-card>
				</div>
			</el-form-item>
			<el-form-item class="!mb-4" :label="t('program.taskType')" prop="labelType">
				<el-select :placeholder="t('manage.importdataTyteTip')" class="w100" v-model="programParams.labelType">
					<el-option :key="item.value" :label="item.label" :value="item.value" v-for="item in base_dataset_type" />
				</el-select>
			</el-form-item>
			<el-form-item :label="t('program.programDescription')" prop="description">
				<el-input :placeholder="t('program.inputProgramDescTip')" type="textarea" maxlength="550" :rows="4"
					v-model="programParams.description"></el-input>
			</el-form-item>
		</el-form>
	</div>
	<el-divider />
	<div class="px-6 text-right">
		<el-button class="!px-12" size="default" type="primary" @click="onSubmit" :disabled="loading">{{
			$t('common.confirmButtonText')
		}}</el-button>
		<el-button class="!px-12" size="default" @click="closeCrateProgram">{{
			$t('common.cancelButtonText')
		}}</el-button>
	</div>
</template>

<script setup lang="ts" name="program">
import { useMessage } from '/@/hooks/message';
import { useI18n } from 'vue-i18n';
import { useDict } from '/@/hooks/dict';
import { getProgramByIdReq, addProgramReq, editProgramReq, validateProgramName } from '/@/api/project/program';

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh', 'changeScene'])

const { t } = useI18n();
const { base_dataset_type, data_type } = useDict('base_dataset_type', 'data_type');

// 定义变量内容
const programDialogRef = ref();
const loading = ref(false);

// 定义项目参数
const programParams = reactive({
	id: '',
	programId: '',
	name: '',
	type: '',
	dataType: '',
	labelType: '',
	description: '',
});

//定义创建/编辑对话框校验规则
const programRules = ref({
	name: [
		{ required: true, min: 3, max: 20, message: '项目名称长度必须在3到20个字符之间', trigger: 'blur', },
		{
			validator: (rule: any, value: any, callback: any) => {
				validateProgramName(rule, value, programParams.programId, callback, programParams.programId !== '');
			},
			trigger: 'blur',
		},
	],
	type: [{ required: true, message: '项目类型不能为空', trigger: 'blur' }],
	dataType: [{ required: true, message: '数据类型不能为空', trigger: 'blur' }],
	description: [{ required: true, message: '项目描述不能为空', trigger: 'blur' }, { max: 128, message: '长度在 128 个字符内', trigger: 'blur' }],
});

// 打开弹窗
const resetProgramParams = () => {
	programParams.id = '';
	programParams.programId = '';
	programParams.name = '';
	programParams.type = '';
	programParams.dataType = '';
	programParams.labelType = '';
	programParams.description = '';
};

const openDialog = (id?: string) => {
	resetProgramParams();
	// 重置表单数据
	nextTick(() => {
		programDialogRef.value?.resetFields();
	});
	// 获取信息
	if (id) {
		programParams.id = id;
		getProgramData(id);
	}
};

// 选择类型
const selectCard = (value: string) => {
	programParams.dataType = value
};

// 提交
const onSubmit = async () => {
	// const valid = await programDialogRef.value.validate().catch(() => { });
	// if (!valid) return false;

	try {
		loading.value = true;
		programParams.programId ? await editProgramReq(programParams) : await addProgramReq(programParams);
		useMessage().success(t(programParams.programId ? 'common.editSuccessText' : 'common.addSuccessText'));
		emit('refresh');
		closeCrateProgram();
	} catch (err: any) {
		useMessage().error(err.msg);
	} finally {
		loading.value = false;
	}
};

// 初始化数据
const getProgramData = (id: string) => {
	// 获取基础数据集数据
	getProgramByIdReq(id).then((res: any) => {
		Object.assign(programParams, res.data);
	});
};

// 切换主界面
const closeCrateProgram = () => {
	emit('changeScene', 0)
}

// 暴露变量
defineExpose({
	openDialog
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
