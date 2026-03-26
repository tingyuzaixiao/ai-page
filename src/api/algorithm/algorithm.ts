import request from '/@/utils/request';

//分页获取GPU列表
export function fetchAlgorithmListReq(query?: Object) {
	return request({
		url: '/admin/algoserver/page',
		method: 'get',
		params: query,
	});
}
export const addObj = (obj?: Object) => {
	return request({
		url: '/admin/gpuResource',
		method: 'post',
		data: obj,
	});
};

export function getObj(id?: string) {
	return request({
		url: '/admin/gpuResource/' + id,
		method: 'get',
	});
}

export function delObj(ids?: object) {
	return request({
		url: '/admin/gpuResource',
		method: 'delete',
		data: ids,
	});
}

export function putObj(obj?: Object) {
	return request({
		url: '/admin/gpuResource',
		method: 'put',
		data: obj,
	});
}

export function getObjDetails(obj?: object) {
	return request({
		url: '/admin/gpuResource/details',
		method: 'get',
		params: obj,
	});
}

export function validateGpuId(rule: any, value: any, callback: any, isEdit: boolean) {
	console.log(isEdit);
	if (isEdit) {
		return callback();
	}

	getObjDetails({ gpuId: value }).then((response) => {
		const result = response.data;
		if (result !== null) {
			callback(new Error('GPU-ID已经存在'));
		} else {
			callback();
		}
	});
}
