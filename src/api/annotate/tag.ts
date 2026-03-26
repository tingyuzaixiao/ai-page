import request from '/@/utils/request';

export function fetchTagList(query?: Object) {
	return request({
		url: '/admin/labelTag/page',
		method: 'get',
		params: query,
	});
}


export const addObj = (obj?: Object) => {
	return request({
		url: '/admin/labelTag/save',
		method: 'post',
		data: obj,
	});
};

export function getObj(id?: number) {
	return request({
		url: '/admin/labelTag/' + id,
		method: 'get',
	});
}

export function delObj(ids?: object) {
	return request({
		url: '/admin/labelTag',
		method: 'delete',
		data: ids,
	});
}

export function putTagObj(obj?: Object) {
	return request({
		url: '/admin/labelTag',
		method: 'put',
		data: obj,
	});
}

export function getObjDetails(obj?: object) {
	return request({
		url: '/admin/labelTag/details',
		method: 'get',
		params: obj,
	});
}


export function validateLabelTagName(rule: any, value: any, groupId: any ,callback: any, isEdit: boolean) {
	if (isEdit) {
		return callback();
	}

	getObjDetails({ tagName: value, groupId: groupId }).then((response) => {
		const result = response.data;
		if (result !== null) {
			callback(new Error('标签名称已经存在'));
		} else {
			callback();
		}
	});
}
