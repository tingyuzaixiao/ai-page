import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import { resolve } from 'path';
import { defineConfig, loadEnv, ConfigEnv, ViteDevServer } from 'vite';
import vueSetupExtend from 'unplugin-vue-setup-extend-plus/vite';
import AutoImport from 'unplugin-auto-import/vite';
import topLevelAwait from 'vite-plugin-top-level-await';
import viteCompression from 'vite-plugin-compression';
// @ts-ignore
import { svgBuilder } from '/@/components/IconSelector/index';
// import httpProxy from 'http-proxy';
// import { IncomingMessage, ServerResponse } from 'http';

// const proxy = httpProxy.createProxyServer({});

const pathResolve = (dir: string) => {
	return resolve(__dirname, '.', dir);
};

const alias: Record<string, string> = {
	'/@': pathResolve('./src/'),
	'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js',
};

const viteConfig = defineConfig((mode: ConfigEnv) => {
	const curEnv = mode.mode;
	const env = loadEnv(curEnv, process.cwd());
	// 判断是否开发环境
	const isDev = curEnv === 'development';
	return {
		plugins: [
			vue(), // Vue 插件
			// vueDevTools({
			// 	launchEditor: 'code',
			// }), // Vue Devtools 插件
			svgBuilder('./src/assets/icons/'), // 将 SVG 文件转换成 Vue 组件
			vueSetupExtend({}), // setup语法糖增强插件
			AutoImport({
				imports: ['vue', 'vue-router', 'pinia'], // 自动导入的依赖库数组
				dts: './auto-imports.d.ts', // 自动导入类型定义文件路径
			}),
			topLevelAwait({
				promiseExportName: '__tla', // TLA Promise 变量名
				promiseImportName: (i) => `__tla_${i}`, // TLA Promise 导入名
			}),
			viteCompression({
				deleteOriginFile: false, // 压缩后删除原来的文件
			}),
			// viteMockServe({
			// 	mockPath: '/@/mock', // mock文件夹路径
			// 	enable: mode.command === 'serve', // 只有开发环境才开启mock
			// }),
		],
		root: process.cwd(), // 项目根目录
		resolve: { alias }, // 路径别名配置
		base: mode.command === 'serve' ? './' : env.VITE_PUBLIC_PATH,
		optimizeDeps: {
			include: ['element-plus/es/locale/lang/zh-cn', 'element-plus/es/locale/lang/en'],
		},
		server: {
			host: '0.0.0.0', // 服务器地址
			port: env.VITE_PORT as unknown as number, // 服务器端口号
			open: env.VITE_OPEN === 'true', // 是否自动打开浏览器
			hmr: true, // 启用热更新
			proxy: {
				'/api/gen': {
					//单体架构下特殊处理代码生成模块代理
					target: env.VITE_IS_MICRO === 'true' ? env.VITE_ADMIN_PROXY_PATH : env.VITE_GEN_PROXY_PATH,
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/api/, ''),
				},
				'/ai/smart': {
					target: isDev ? env.VITE_SMART_ANNOTATE_PROXY_PATH : env.VITE_SMART_ANNOTATE_PROXY_PATH, // 目标服务器地址
					ws: false, // 是否启用 WebSocket
					changeOrigin: true, // 是否修改请求头中的 Origin 字段
					rewrite: (path) => path.replace(/^\/ai\/smart/, ''),
				},
				'/api': {
					target: isDev ? env.VITE_ADMIN_PROXY_PATH : env.VITE_API_URL, // 目标服务器地址
					// target: env.VITE_ADMIN_PROXY_PATH, // 目标服务器地址
					ws: false, // 是否启用 WebSocket
					changeOrigin: true, // 是否修改请求头中的 Origin 字段
					rewrite: (path) => path.replace(/^\/api/, ''),
				},
				'^/ws/info/.*': {
					target: env.VITE_ADMIN_PROXY_PATH, // 目标服务器地址
					ws: true, // 是否启用 WebSocket
					changeOrigin: true,
				},
			},
			// configureServer(server: ViteDevServer) {
			// 	console.log('Dynamic proxy middleware is loaded.');
			// 	// 指定中间件匹配的路径前缀
			// 	server.middlewares.use('/smart', (req: IncomingMessage, res: ServerResponse) => {
			// 		// 从请求参数中获取输入变量（目标地址）
			// 		const targetUrl = (req.url?.split('?')[1] || '').split('=')[1];
			// 		console.log('targetUrl:', targetUrl);
			// 		if (targetUrl) {
			// 			proxy.web(req, res, {
			// 				target: targetUrl,
			// 				changeOrigin: true,
			// 				autoRewrite: true,
			// 			});
			// 		} else {
			// 			res.statusCode = 400;
			// 			res.end('Missing target parameter');
			// 		}
			// 	});
			// },
		},
		build: {
			outDir: 'dist', // 打包输出目录
			chunkSizeWarningLimit: 1500, // 代码分包阈值
			// 开发使用 esbuild 更快，生产环境打包使用 terser 可以删除更多注释
			minify: isDev ? 'esbuild' : 'terser',
			terserOptions: {
				compress: {
					drop_console: true, // 删除 console
					drop_debugger: true, // 删除 debugger
				},
				format: {
					comments: false, // 删除所有注释
				},
			},
			rollupOptions: {
				output: {
					entryFileNames: `assets/[name].[hash].js`,
					chunkFileNames: `assets/[name].[hash].js`,
					assetFileNames: `assets/[name].[hash].[ext]`,
					compact: true,
					manualChunks: {
						vue: ['vue', 'vue-router', 'pinia'],
						echarts: ['echarts'],
					},
				},
			},
		},
		css: {
			preprocessorOptions: {
				scss: {
					javascriptEnabled: true,
					additionalData: `
						@use "/@/assets/styles/ElementPlus.scss" as *;
					`,
				},
				css: { charset: false },
			},
		},
		define: {
			__VUE_I18N_LEGACY_API__: JSON.stringify(false),
			__VUE_I18N_FULL_INSTALL__: JSON.stringify(false),
			__INTLIFY_PROD_DEVTOOLS__: JSON.stringify(false),
			__VERSION__: JSON.stringify(process.env.npm_package_version),
			__NEXT_NAME__: JSON.stringify(process.env.npm_package_name),
		},
	};
});

export default viteConfig;
