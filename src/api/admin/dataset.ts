import request from '/@/utils/request';

export function fetchList(query?: Object) {
	return request({
		url: '/admin/dataset/page',
		method: 'get',
		params: query,
	});
}

export const list = (params?: Object) => {
	return request({
		url: '/admin/dataset/list',
		method: 'get',
		params,
	});
};

export function addObj(obj?: Object) {
	return request({
		url: '/admin/dataset',
		method: 'dataset',
		data: obj,
	});
}

export function getObj(id?: string) {
	return request({
		url: '/admin/dataset/details/' + id,
		method: 'get',
	});
}

export function getObjDetails(obj?: object) {
	return request({
		url: '/admin/dataset/details',
		method: 'get',
		params: obj,
	});
}

export function delObj(ids?: object) {
	return request({
		url: '/admin/dataset',
		method: 'delete',
		data: ids,
	});
}

export function putObj(obj?: Object) {
	return request({
		url: '/admin/dataset',
		method: 'put',
		data: obj,
	});
}

export function validateDatasetName(rule: any, value: any, callback: any, isEdit: boolean) {
	if (isEdit) {
		return callback();
	}

	getObjDetails({ datasetName: value }).then((response) => {
		const result = response.data;
		if (result !== null) {
			callback(new Error('岗位名称已经存在'));
		} else {
			callback();
		}
	});
}

export function validateDatasetCode(rule: any, value: any, callback: any, isEdit: boolean) {
	if (isEdit) {
		return callback();
	}

	getObjDetails({ datasetCode: value }).then((response) => {
		const result = response.data;
		if (result !== null) {
			callback(new Error('岗位编码已经存在'));
		} else {
			callback();
		}
	});
}
