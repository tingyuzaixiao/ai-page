import request from '/@/utils/request';

export function fetchList(query?: Object) {
	return request({
		url: '/admin/baseModel/page',
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
		url: '/admin/baseModel',
		method: 'post',
		data: obj,
	});
};

export function getObj(id?: string) {
	return request({
		url: '/admin/baseModel/' + id,
		method: 'get',
	});
}

export function delObj(ids?: object) {
	return request({
		url: '/admin/baseModel',
		method: 'delete',
		data: ids,
	});
}

export function putObj(obj?: Object) {
	return request({
		url: '/admin/baseModel',
		method: 'put',
		data: obj,
	});
}

export function getObjDetails(obj?: object) {
	return request({
		url: '/admin/baseModel/details',
		method: 'get',
		params: obj,
	});
}

export function getModelConfig(id?: string, configType?: string, baseModelClass?: string) {
	return request({
		url: '/admin/baseModel/getModelConfig',
		method: 'get',
		params: { id, configType, baseModelClass },
	});
}

export function updateModelConfig(obj?: object) {
	return request({
		url: '/admin/baseModel/updateModelConfig',
		method: 'post',
		data: obj,
	});
}

export function getListModelGroup() {
	return request({
		url: '/admin/baseModel/listGroup',
		method: 'get',
	});
}

export function updateBaseModelConfigFile(obj?: object) {
	return request({
		url: '/admin/baseModel/updateBaseModelConfigFile',
		method: 'post',
		data: obj,
	});
}

export function getBaseModelConfig(id: string) {
	return request({
		url: '/admin/baseModel/getBaseModelConfig',
		method: 'get',
		params: { id },
	});
}

export function updateBaseModelConfig(obj?: object) {
	return request({
		url: '/admin/baseModel/updateBaseModelConfig',
		method: 'post',
		data: obj,
	});
}

export function validateBaseModelName(rule: any, value: any, callback: any, isEdit: boolean) {
	if (isEdit) {
		return callback();
	}

	getObjDetails({ baseModelName: value }).then((response) => {
		const result = response.data;
		if (result !== null) {
			callback(new Error('基础模型名称已经存在'));
		} else {
			callback();
		}
	});
}
