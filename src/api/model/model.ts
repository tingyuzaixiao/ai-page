import request from '/@/utils/request';

export function fetchList(query?: Object) {
	return request({
		url: '/admin/model/page',
		method: 'get',
		params: query,
	});
}

export function fetchBaseList(query?: Object) {
	return request({
		url: '/admin/baseModel/list',
		method: 'get',
		params: query,
	});
}

export const addObj = (obj?: Object) => {
	return request({
		url: '/admin/model',
		method: 'post',
		data: obj,
	});
};

export function getObj(id?: string) {
	return request({
		url: '/admin/model/' + id,
		method: 'get',
	});
}

export function delObj(ids?: object) {
	return request({
		url: '/admin/model',
		method: 'delete',
		data: ids,
	});
}

export function putObj(obj?: Object) {
	return request({
		url: '/admin/model',
		method: 'put',
		data: obj,
	});
}

export function getObjDetails(obj?: object) {
	return request({
		url: '/admin/model/details',
		method: 'get',
		params: obj,
	});
}

export function getModelConfig(id?: string, isBaseModel?: Boolean, configType?: string, modelClass?: string) {
	return request({
		url: '/admin/model/getModelConfig',
		method: 'get',
		params: { id, isBaseModel, configType, modelClass },
	});
}

export function updateModelConfig(obj?: object) {
	return request({
		url: '/admin/model/updateModelConfig',
		method: 'post',
		data: obj,
	});
}

export function getListModelGroup(obj?: object) {
	return request({
		url: '/admin/baseModel/listGroup',
		method: 'post',
		data: obj,
	});
}

export function validateModelName(rule: any, value: any, callback: any, isEdit: boolean) {
	if (isEdit) {
		return callback();
	}

	getObjDetails({ modelName: value }).then((response) => {
		const result = response.data;
		if (result !== null) {
			callback(new Error('模型名称已经存在'));
		} else {
			callback();
		}
	});
}
