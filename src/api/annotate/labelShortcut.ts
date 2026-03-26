import request from '/@/utils/request';

export function ShortcutList(query?: Object) {
	return request({
		url: '/admin/labelShortcut/page',
		method: 'get',
		params: query,
	});
}

export const addShortcut = (obj?: Object) => {
	return request({
		url: '/admin/labelShortcut/save',
		method: 'post',
		data: obj,
	});
};

export function getShortcut() {
	return request({
		url: '/admin/labelShortcut',
		method: 'get',
	});
}

export function delShortcut(ids?: object) {
	return request({
		url: '/admin/labelShortcut',
		method: 'delete',
		data: ids,
	});
}

export function putShortcut(obj?: Object) {
	return request({
		url: '/admin/labelShortcut',
		method: 'put',
		data: obj,
	});
}

export function getShortcutDetails(obj?: object) {
	return request({
		url: '/admin/labelShortcut/details',
		method: 'get',
		params: obj,
	});
}
