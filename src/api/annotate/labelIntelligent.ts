import request from '/@/utils/request';

export function fetchIntelligentList(query?: Object) {
	return request({
		url: '/admin/labelIntelligent/page',
		method: 'get',
		params: query,
	});
}

export const addIntelligentObj = (obj?: Object) => {
	return request({
		url: '/admin/labelIntelligent/save',
		method: 'post',
		data: obj,
	});
};

export function getIntelligentObj(id?: string) {
	return request({
		url: '/admin/labelIntelligent/' + id,
		method: 'get',
	});
}

export function delIntelligentObj(ids?: object) {
	return request({
		url: '/admin/labelIntelligent',
		method: 'delete',
		data: ids,
	});
}

export function putIntelligentObj(obj?: Object) {
	return request({
		url: '/admin/labelIntelligent',
		method: 'put',
		data: obj,
	});
}

export function getIntelligentDetails(obj?: object) {
	return request({
		url: '/admin/labelIntelligent/details',
		method: 'get',
		params: obj,
	});
}

export function validatelabelIntelligentName(rule: any, value: any, callback: any, isEdit: boolean) {
	if (isEdit) {
		return callback();
	}

	getIntelligentDetails({ taskName: value }).then((response) => {
		const result = response.data;
		if (result !== null) {
			callback(new Error('智能标注任务名称已经存在'));
		} else {
			callback();
		}
	});
}
