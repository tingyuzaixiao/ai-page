import { ref } from 'vue';

/**
 * 防止重复提交的 Hook
 * @param submitFn - 需要执行的异步提交函数
 * @returns isLoading: 当前是否正在提交，submit: 包装后的提交函数
 */
export function usePreventReSubmit<T extends any[]>(submitFn: (...args: T) => Promise<void>) {
	const isLoading = ref(false);

	const submit = async (...args: T) => {
		if (isLoading.value) return;

		isLoading.value = true;
		try {
			await submitFn(...args);
		} catch (error) {
			console.error('提交失败:', error);
		} finally {
			isLoading.value = false;
		}
	};

	return {
		isLoading,
		submit,
	};
}
