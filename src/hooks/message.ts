import { ElMessage, ElMessageBox } from 'element-plus';
import { i18n } from '../i18n';

const { t } = i18n.global;

interface MessageImplements {
	info(title: string): void;
	wraning(title: string): void;
	success(title: string): void;
	error(title: string): void;
}

export function useMessage() {
	class MessageClass implements MessageImplements {
		// 配置公共选项
		private messageOptions = {
			duration: 1000, // 1秒后消失
			offset: 20, // 消息框距离窗口顶部的距离
			grouping: true, // 启用消息分组，可以避免同时显示太多消息
			limit: 3 // 最多只显示3个消息
		};

		// 普通提示
		info(title: string): void {
			ElMessage.info({
				message: title,
				...this.messageOptions
			});
		}

		// 警告提示
		wraning(title: string): void {
			ElMessage.warning({
				message: title,
				...this.messageOptions
			});
		}

		// 成功提示
		success(title: string): void {
			ElMessage.success({
				message: title,
				...this.messageOptions
			});
		}

		// 错误提示
		error(title: string): void {
			ElMessage.error({
				message: title,
				...this.messageOptions
			});
		}
	}

	return new MessageClass();
}

export function useMessageBox() {
	class MessageBoxClass implements MessageImplements {
		// 普通提示
		info(msg: string): void {
			ElMessageBox.alert(msg, t('message.box.title'));
		}

		// 警告提示
		wraning(msg: string): void {
			ElMessageBox.alert(msg, t('message.box.title'), { type: 'warning' });
		}

		// 成功提示
		success(msg: string): void {
			ElMessageBox.alert(msg, t('message.box.title'), { type: 'success' });
		}

		// 错误提示
		error(msg: string): void {
			ElMessageBox.alert(msg, t('message.box.title'), { type: 'error' });
		}

		// 确认窗体
		confirm(msg: string) {
			return ElMessageBox.confirm(msg, t('message.box.title'), {
				confirmButtonText: t('common.confirmButtonText'),
				cancelButtonText: t('common.cancelButtonText'),
				type: 'warning',
			});
		}
		// 提交内容
		prompt(msg: string) {
			return ElMessageBox.prompt(msg, t('message.box.title'), {
				confirmButtonText: t('common.confirmButtonText'),
				cancelButtonText: t('common.cancelButtonText'),
				type: 'warning',
			});
		}
	}

	return new MessageBoxClass();
}
