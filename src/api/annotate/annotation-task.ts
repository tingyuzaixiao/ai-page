import request from '/@/utils/request';

export function fetchList(query?: Object) {
	return request({
		url: '/admin/labelTask/page',
		method: 'get',
		params: query,
	});
}

export const addTaskObj = (obj?: Object) => {
	return request({
		url: '/admin/labelTask/save',
		method: 'post',
		data: obj,
	});
};

export function getTaskObj(id?: string) {
	return request({
		url: '/admin/labelTask/' + id,
		method: 'get',
	});
}

export function delObj(ids?: object) {
	return request({
		url: '/admin/labelTask',
		method: 'delete',
		data: ids,
	});
}

export function putTaskObj(obj?: Object) {
	return request({
		url: '/admin/labelTask',
		method: 'put',
		data: obj,
	});
}

export function getObjDetails(obj?: object) {
	return request({
		url: '/admin/labelTask/details',
		method: 'get',
		params: obj,
	});
}

export function getLabeledTotal(query?: Object) {
	return request({
		url: '/admin/labelTask/getLabeledTotal',
		method: 'get',
		params: query,
	});
}

export function validateLabelTaskName(rule: any, value: any, callback: any, isEdit: boolean) {
	if (isEdit) {
		return callback();
	}

	getObjDetails({ taskName: value }).then((response) => {
		const result = response.data;
		if (result !== null) {
			callback(new Error('标注任务名称已经存在'));
		} else {
			callback();
		}
	});
}
