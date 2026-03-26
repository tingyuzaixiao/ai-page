<template>
	<div class="select-none h-auto">
		<div class="login-title">
			<div class="login-title-left">
				<img src="/@/assets/logo-mini.svg" class="login-logo" />
				<span class="text-5xl font-semibold">{{ $t('logo.company') }} {{ $t('logo.title') }}</span>
			</div>
			<div class="login-title-right">
				<el-dropdown :show-timeout="70" :hide-timeout="50" trigger="click" @command="onLanguageChange">
					<div class="layout-navbars-breadcrumb-user-icon">
						<i class="iconfont fs-28"
							:class="state.disabledI18n === 'en' ? 'icon-fuhao-yingwen' : 'icon-fuhao-zhongwen'"
							:title="$t('user.title1')"></i>
					</div>
					<template #dropdown>
						<el-dropdown-menu>
							<el-dropdown-item command="zh-cn" :disabled="state.disabledI18n === 'zh-cn'">简体中文</el-dropdown-item>
							<el-dropdown-item command="en" :disabled="state.disabledI18n === 'en'">English</el-dropdown-item>
						</el-dropdown-menu>
					</template>
				</el-dropdown>
			</div>
		</div>
		<!-- <img :src="bg" class="wave" /> -->
		<!-- <div class="flex-c absolute right-5"></div> -->
		<div class="login-container">
			<div class="login-left">
				<div class="container mx-auto p-8 max-w-5xl">
					<div class="text-left space-y-4 mb-5">
						<span class="text-2xl block text-[#585b5c]">AIRCAS AI TRAIN PLATFORM</span>
						<span class="text-[60px] font-bold text-gray-900 tracking-widest">{{ $t('slogan.title1') }}</span>
					</div>
					<div class="mb-10">
						<div class="text-[25px] tracking-wider ">{{ $t('slogan.title2') }}
						</div>
					</div>
					<div class="flex flex-col space-y-8">
						<div v-for="(item, index) in growthFactors" :key="index" class="flex items-start gap-4">
							<div class="mr-1">
								<div class="w-14 h-14 bg-[#d8e4fe] flex items-center justify-center login-left-title-icon">
									<div class="text-white tracking-tighter">
										<span :class="['text-[#2d73fe]', 'fs-28', $t('slogan.title3_' + index + '.icon')]"></span>
									</div>
								</div>
							</div>
							<div class="text-left space-y-0.5">
								<p style="color: #555a63;" class="text-lg font-semibold leading-tight tracking-wider">
									{{ $t('slogan.title3_' + index + '.title') }}
								</p>
								<p style="color: #676a6c;"
									class="text-gray-200 text-lg leading-tight max-w-3xl font-medium tracking-wider">
									{{ $t('slogan.title3_' + index + '.description') }}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="login-box">
				<div class="login-form shadow-[0_5px_11px_0_rgba(0,0,0,0.1)]">
					<span class="flex h-16 text-4xl">{{ $t('label.welcome') }}</span>
					<el-tabs v-model="tabsActiveName">
						<!-- 用户名密码登录 -->
						<el-tab-pane :label="$t('label.one1')" name="account">
							<Password @signInSuccess="signInSuccess" />
						</el-tab-pane>
						<!-- 手机号登录 -->
						<el-tab-pane :label="$t('label.two2')" name="mobile" v-if="mobileEnable">
							<Mobile @signInSuccess="signInSuccess" />
						</el-tab-pane>
						<!-- 注册 -->
						<el-tab-pane :label="$t('label.register')" name="register" v-if="registerEnable">
							<!-- <Register @afterSuccess="tabsActiveName = 'account'" /> -->
							<Register @signInSuccess="signInSuccess" />
						</el-tab-pane>
					</el-tabs>
				</div>
			</div>
		</div>
		<div class="login-bottom">
			<div><a class="p-2" href="https://zhaopin.aircas.ac.cn/commonIndex/dwqyjy">{{ $t('link.about') }}</a>|
				<a class="p-2" href="https://zhaopin.aircas.ac.cn/commonIndex/dwqyjy">{{ $t('link.contact') }}</a>|
				<a class="p-2" href="http://www.aircas.ac.cn/">{{ $t('link.friendshipLink') }}</a>
			</div>
			<div class="mt-1">Copyright&nbsp;©&nbsp;2019-2025&nbsp;&nbsp;{{ $t('link.subCompany') }}&nbsp;{{
				$t('link.copyright')
			}}：鄂ICP备2023020686号-2</div>
		</div>
	</div>
</template>

<script setup lang="ts" name="loginIndex">
import { useThemeConfig } from '/@/stores/themeConfig';
import { NextLoading } from '/@/utils/loading';
import { useI18n } from 'vue-i18n';
import { formatAxis } from '/@/utils/formatTime';
import { useMessage } from '/@/hooks/message';
import { Session, Local } from '/@/utils/storage';
import { initBackEndControlRoutes } from '/@/router/backEnd';
import other from '/@/utils/other';

//设置水印
import { useUserInfo } from "/@/stores/userInfo";
import Watermark from "/@/utils/wartermark";

// 定义变量内容
const { locale, t } = useI18n();

interface State {
	[key: string]: boolean | string;
	isScreenfull: boolean;
	disabledI18n: string;
	disabledSize: string;
}

const state = reactive<State>({
	isScreenfull: false,
	disabledI18n: 'zh-cn',
	disabledSize: 'large',
});

// 语言切换
const onLanguageChange = (lang: string) => {
	Local.remove('themeConfig');
	themeConfig.value.globalI18n = lang;
	Local.set('themeConfig', themeConfig.value);
	locale.value = lang;
	other.useTitle();
	initI18nOrSize('globalI18n', 'disabledI18n');
};

// 初始化组件大小/i18n
const initI18nOrSize = (value: string, attr: string) => {
	state[attr] = Local.get('themeConfig')[value];
};

// 引入组件
const Password = defineAsyncComponent(() => import('./component/password.vue'));
const Mobile = defineAsyncComponent(() => import('./component/mobile.vue'));
const Register = defineAsyncComponent(() => import('./component/register.vue'));

// 定义变量内容
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);
const route = useRoute();
const router = useRouter();

// 是否开启注册
const registerEnable = ref(import.meta.env.VITE_REGISTER_ENABLE === 'true');
const mobileEnable = ref(import.meta.env.VITE_MOBILE_ENABLE === 'true');

// 默认选择账号密码登录方式
const tabsActiveName = ref('account');

// 获取布局配置信息
const getThemeConfig = computed(() => {
	return themeConfig.value;
});

const growthFactors = ref(Array(3).fill(null));

// 登录成功后的跳转处理事件
const signInSuccess = async () => {
	console.log('signInSuccess')
	const isNoPower = await initBackEndControlRoutes();
	if (isNoPower) {
		useMessage().wraning('抱歉，您没有登录权限');
		Session.clear();
	} else {
		//判断是否开启水印
		onWartermarkChange()

		// 初始化登录成功时间问候语
		let currentTimeInfo = formatAxis(new Date());
		if (route.query?.redirect) {
			router.push({
				path: <string>route.query?.redirect,
				query: Object.keys(<string>route.query?.params).length > 0 ? JSON.parse(<string>route.query?.params) : '',
			});
		} else {
			router.push('/');
		}
		// 登录成功提示
		const signInText = t('signInText');
		useMessage().success(`${currentTimeInfo}，${signInText}`);
		// 添加 loading，防止第一次进入界面时出现短暂空白
		NextLoading.start();
	}
};

// 水印切换
const onWartermarkChange = () => {
	const username =
		useUserInfo().userInfos.user?.username || getThemeConfig.value.globalTitle;
	// console.log('username', username)
	getThemeConfig.value.isWartermark ? Watermark.set(username) : Watermark.del();
	// setLocalThemeConfig();
};

// 页面加载时
onMounted(() => {
	NextLoading.done();
	if (Local.get('themeConfig')) {
		initI18nOrSize('globalComponentSize', 'disabledSize');
		initI18nOrSize('globalI18n', 'disabledI18n');
	}
});
</script>
<style scoped>
::v-deep(.el-tabs__nav-wrap::after) {
	position: static !important;
}

::v-deep(.el-tabs__item) {
	font-size: 1.15rem;
}

.slide-container {
	width: 1200px;
	min-height: 800px;
	padding: 60px 100px;
	font-family: 'Microsoft YaHei', sans-serif;
}

/* 标题样式 */
.header {
	text-align: left;
	margin-bottom: 60px;
}

h1 {
	color: #1a1a1a;
	font-size: 36px;
	font-weight: 600;
	margin-bottom: 20px;
}

h2 {
	color: #4d4d4d;
	font-size: 24px;
	font-weight: 500;
}

/* 内容容器 */
.content-wrapper {
	display: flex;
	flex-direction: column;
	gap: 45px;
}

/* 单个区块 */
.factor-block {
	display: flex;
	align-items: flex-start;
}

/* 序号列样式 */
.index-column {
	width: 80px;
	position: relative;
}

.vertical-index {
	color: #1890ff;
	font-size: 48px;
	font-weight: 800;
	line-height: 0.8;
	letter-spacing: -2px;
	padding-top: 8px;
	/* 实现双行视觉对齐 */
}

/* 文本列样式 */
.text-column {
	flex: 1;
	padding-left: 20px;
}

h3 {
	color: #1890ff;
	font-size: 24px;
	font-weight: 600;
	margin-bottom: 12px;
}

p {
	color: #666;
	font-size: 16px;
	line-height: 1.8;
	max-width: 800px;
}

.fs-28 {
	font-size: 26px;
}
</style>