<template>
	<el-form size="large" class="login-content-form" :rules="dataRules" ref="dataFormRef" :model="state.ruleForm">
		<el-form-item class="login-animation1" prop="username">
			<el-input text :placeholder="$t('sysuser.inputUsernameTip')" v-model="state.ruleForm.username" clearable
				autocomplete="off">
				<!-- <template #prefix>
					<el-icon class="el-input__icon">
						<ele-User />
					</el-icon>
				</template> -->
			</el-input>
		</el-form-item>
		<el-form-item class="login-animation2" prop="password">
			<strength-meter :placeholder="$t('password.accountPlaceholder5')" v-model="state.ruleForm.password"
				autocomplete="off" :maxLength="20" :minLength="6" @score="handlePassScore">
				<!-- <template #prefix>
					<el-icon class="el-input__icon">
						<ele-Unlock />
					</el-icon>
				</template> -->
			</strength-meter>
		</el-form-item>
		<el-form-item class="login-animation3" prop="phone">
			<el-input text :placeholder="$t('password.phonePlaceholder4')" v-model="state.ruleForm.phone" clearable
				autocomplete="off">
				<!-- <template #prefix>
					<el-icon class="el-input__icon">
						<ele-Iphone />
					</el-icon>
				</template> -->
			</el-input>
		</el-form-item>
		<el-form-item class="login-animation4" prop="email">
			<el-input text :placeholder="$t('password.emailPlaceholder4')" v-model="state.ruleForm.email" clearable
				autocomplete="off">
				<!-- <template #prefix>
					<el-icon class="el-input__icon">
						<ele-Message />
					</el-icon>
				</template> -->
			</el-input>
		</el-form-item>
		<el-form-item class="login-animation2" prop="code" v-if="verifyEnable">
			<el-col :span="15">
				<el-input text maxlength="4" :placeholder="$t('mobile.placeholder2')" v-model="state.ruleForm.code" clearable
					autocomplete="off">
					<!-- <template #prefix>
            <el-icon class="el-input__icon">
              <ele-Key />
            </el-icon>
          </template> -->
				</el-input>
			</el-col>
			<el-col :span="1"></el-col>
			<el-col :span="8">
				<img :src="imgSrc" @click="getVerifyCode">
			</el-col>
		</el-form-item>
		<el-form-item class="login-animation2 pb-1 -mt-3" prop="checked">
			<el-checkbox v-model="state.ruleForm.checked">
				{{ $t('password.readAccept') }}
			</el-checkbox>
			<el-button link type="primary">
				{{ $t('password.termService') }}
			</el-button>
			<span>{{ $t('password.and') }}</span>
			<el-button link type="primary">
				{{ $t('password.privacyPolicy') }}
			</el-button>
		</el-form-item>
		<el-form-item class="login-animation4 -mt-5">
			<el-button type="primary" class="login-content-submit" v-waves @click="handleRegister" :loading="loading">
				<span>{{ $t('password.registerBtnText') }}</span>
			</el-button>
		</el-form-item>
	</el-form>
</template>

<script setup lang="ts" name="register">
import { registerCode, validateUsername, validatePhone, validateEmail } from '/@/api/admin/user';
import { useUserInfo } from '/@/stores/userInfo';

import { useMessage } from '/@/hooks/message';
import { useI18n } from 'vue-i18n';
import { rule } from '/@/utils/validate';

// 注册生命周期事件
const emit = defineEmits(['afterSuccess', 'signInSuccess']);

// 按需加载组件
const StrengthMeter = defineAsyncComponent(() => import('/@/components/StrengthMeter/index.vue'));

// 使用i18n
const { t } = useI18n();

// 表单引用
const dataFormRef = ref();

// 加载中状态
const loading = ref(false);

// 密码强度得分
const score = ref('0');

// 组件内部状态
const state = reactive({
	// 是否显示密码
	isShowPassword: false,
	// 表单内容
	ruleForm: {
		username: '', // 用户名
		password: '', // 密码
		phone: '', // 手机号
		email: '',
		randomStr: '', // 验证码
		code: '', // 验证码
		checked: '', // 是否同意条款
	},
});

// 表单验证规则
const dataRules = reactive({
	username: [
		{ required: true, message: '用户名不能为空', trigger: 'blur' },
		{
			min: 5,
			max: 20,
			message: '用户名称长度必须介于 5 和 20 之间',
			trigger: 'blur',
		},
		// 自定义方法验证用户名
		{
			validator: (rule: any, value: any, callback: any) => {
				validateUsername(rule, value, callback, false);
			},
			trigger: 'blur',
		},
	],
	phone: [
		{ required: true, message: '手机号不能为空', trigger: 'blur' },
		// 手机号格式验证方法
		{
			validator: rule.validatePhone,
			trigger: 'blur',
		},
		// 自定义方法验证手机号是否重复
		{
			validator: (rule: any, value: any, callback: any) => {
				validatePhone(rule, value, callback, false);
			},
			trigger: 'blur',
		},
	],
	email: [
		{ required: true, message: '邮箱不能为空', trigger: 'blur' },
		// 手机号格式验证方法
		{
			validator: rule.validateEmail,
			trigger: 'blur',
		},
		// 自定义方法验证手机号是否重复
		{
			validator: (rule: any, value: any, callback: any) => {
				validateEmail(rule, value, callback, false);
			},
			trigger: 'blur',
		},
	],
	password: [
		{ required: true, message: '密码不能为空', trigger: 'blur' },
		{
			min: 6,
			max: 20,
			message: '用户密码长度必须介于 6 和 20 之间',
			trigger: 'blur',
		},
		// 判断密码强度是否达到要求
		{
			validator: (_rule: any, _value: any, callback: any) => {
				if (Number(score.value) < 2) {
					callback('密码强度太低');
				} else {
					callback();
				}
			},
			trigger: 'blur',
		},
	],
	code: [{ required: true, trigger: 'blur', message: t('password.accountPlaceholder3') }], // 验证码校验规则
	checked: [{ required: true, message: '请阅读并同意条款', trigger: 'blur' }],
});

// 处理密码强度得分变化事件
const handlePassScore = (e: string) => {
	score.value = e;
};

/**
 * @name handleRegister
 * @description 注册事件，包括表单验证、注册、成功后的钩子函数触发
 */
const handleRegister = async () => {
	// 验证表单是否符合规则
	const valid = await dataFormRef.value.validate().catch(() => { });
	if (!valid) return false;

	try {
		// 开始加载
		loading.value = true;
		// 调用注册API
		await registerCode(state.ruleForm);
		// 注册成功提示
		// useMessage().success(t('common.optSuccessText'));
		// 触发注册成功后的钩子函数
		// emit('afterSuccess');

		// 注册成功自动登录
		onSignIn();

	} catch (err: any) {
		// 提示错误信息
		useMessage().error(err.msg);
	} finally {
		// 结束加载状态
		getVerifyCode()
		loading.value = false;
	}
};

const onSignIn = async () => {
	loading.value = true; // 正在登录中
	try {
		await useUserInfo().login(state.ruleForm); // 调用登录方法
		emit('signInSuccess'); // 触发事件
	} finally {
		getVerifyCode()
		loading.value = false; // 登录结束
	}
};
import { generateUUID } from "/@/utils/other";
const verifyEnable = ref(import.meta.env.VITE_VERIFY_ENABLE === 'true');
const imgSrc = ref('')//获取验证码图片
const getVerifyCode = () => {
	state.ruleForm.randomStr = generateUUID()
	// imgSrc.value = `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_IS_MICRO == 'false' ? '/admin' : ''}/code/image?randomStr=${state.ruleForm.randomStr}`
	imgSrc.value = `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_IS_MICRO == 'false' ? '/admin' : '/auth'}/code/image?randomStr=${state.ruleForm.randomStr}`
}

onMounted(() => {
	getVerifyCode()
})
</script>
