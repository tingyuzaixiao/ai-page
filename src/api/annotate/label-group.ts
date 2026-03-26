import request from '/@/utils/request';

export function fetchList(query?: Object) {
	return request({
		url: '/admin/labelGroup/list',
		method: 'get',
		params: query,
	});
}
export function page(query?: Object) {
	return request({
		url: '/admin/labelGroup/page',
		method: 'get',
		params: query,
	});
}

export function getList(query?: Object) {
	return request({
		url: '/admin/labelGroup/list',
		method: 'get',
		params: query,
	});
}

export const addObj = (obj?: Object) => {
	return request({
		url: '/admin/labelGroup/save',
		method: 'post',
		data: obj,
	});
};

export const saveByObj = (obj?: Object) => {
	return request({
		url: '/admin/labelGroup/copy',
		method: 'post',
		data: obj,
	});
};

export function getObj(id?: string) {
	return request({
		url: '/admin/labelGroup/' + id,
		method: 'get',
	});
}

export function delObj(ids?: object) {
	return request({
		url: '/admin/labelGroup',
		method: 'delete',
		data: ids,
	});
}

export function putObj(obj?: Object) {
	return request({
		url: '/admin/labelGroup',
		method: 'put',
		data: obj,
	});
}

export function getObjDetails(obj?: object) {
	return request({
		url: '/admin/labelGroup/details',
		method: 'get',
		params: obj,
	});
}

export function validateLabelGroupName(rule: any, value: any, callback: any, isEdit: boolean) {
	if (isEdit) {
		return callback();
	}

	getObjDetails({ groupName: value }).then((response) => {
		const result = response.data;
		if (result !== null) {
			callback(new Error('标签组名称已经存在'));
		} else {
			callback();
		}
	});
}
