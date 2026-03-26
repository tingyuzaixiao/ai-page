import request from '/@/utils/request';

export function fetchList(query?: Object) {
	return request({
		url: '/admin/sys-file-offline/page',
		method: 'get',
		params: query,
	});
}
export const getObj = (id: string) => {
	return request({
		url: '/admin/sys-file-offline/' + id,
		method: 'get',
	});
};

export const delObj = (ids: string[]) => {
	return request({
		url: '/admin/sys-file-offline',
		method: 'delete',
		data: ids,
	});
};

export const putObj = (obj: Object) => {
	return request({
		url: '/admin/sys-file-offline',
		method: 'put',
		data: obj,
	});
};
export function addObj(obj?: Object) {
	return request({
		url: '/admin/sys-file-offline',
		method: 'post',
		data: obj,
	});
}

export function currentUserOfflinePath(type: string) {
	return request({
		url: '/admin/sys-file-offline/currentUserOfflinePath/' + type,
		method: 'get',
	});
}

export function downloadNginxZip(params: Object) {
	return request({
		url: '/admin/sys-file-offline/download',
		method: 'get',
		params,
	});
}

export function validateLocalPath(rule: any, value: any, callback: any) {
	const regx = /^.*\\$/;
	if (!value) {
		callback(new Error('请输入本地路径(如D:\\data\\offline\\)'));
	} else {
		if (regx.test(value)) {
			callback();
		} else {
			callback(new Error('本地路径格式错误，请输入如D:\\data\\offline\\'));
		}
	}
}
