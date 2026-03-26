import request from '/@/utils/request';

export function fetchLabelList(query?: Object) {
	return request({
		url: '/admin/label/page',
		method: 'get',
		params: query,
	});
}

export function getLabelList(query?: Object) {
	return request({
		url: '/admin/label/list',
		method: 'get',
		params: query,
	});
}

export const addLabelObj = (obj?: Object) => {
	return request({
		url: '/admin/label/save',
		method: 'post',
		data: obj,
	});
};

export const addBatchLabelObj = (obj?: Object) => {
	return request({
		url: '/admin/label/saveBatch',
		method: 'post',
		data: obj,
	});
};

export function getLabelObj(id?: string) {
	return request({
		url: '/admin/label/' + id,
		method: 'get',
	});
}

export function delLabelObj(ids?: object) {
	return request({
		url: '/admin/label',
		method: 'delete',
		data: ids,
	});
}

export function putLabelObj(obj?: Object) {
	return request({
		url: '/admin/label',
		method: 'put',
		data: obj,
	});
}

export function getLabelObjDetails(obj?: object) {
	return request({
		url: '/admin/label/details',
		method: 'get',
		params: obj,
	});
}

export function getBarData(id?: string) {
	id = '1';
	return request({
		url: 'api/admin/label/getbardata/' + id,
		method: 'get',
	});
}

export function readJSONFile(obj?: Object) {
	return request({
		url: '/admin/sys-file/readJSONFile',
		method: 'post',
		data: obj,
	});
}
