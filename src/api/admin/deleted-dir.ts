import request from '/@/utils/request';

export function fetchList(query?: Object) {
	return request({
		url: '/admin/deleted-dir/page',
		method: 'get',
		params: query,
	});
}

export function addObj(obj?: Object) {
	return request({
		url: '/admin/deleted-dir',
		method: 'post',
		data: obj,
	});
}

export function getObj(id?: string) {
	return request({
		url: '/admin/deleted-dir/details/' + id,
		method: 'get',
	});
}

export function delObj(ids?: Object) {
	return request({
		url: '/admin/deleted-dir',
		method: 'delete',
		data: ids,
	});
}

export function immediatelyDelHistoryDir(ids?: Object) {
	return request({
		url: '/admin/deleted-dir/immediatelyDelHistoryDir',
		method: 'post',
		data: ids,
	});
}

export function delObjByFileNames(fileNames?: Object) {
	return request({
		url: '/admin/deleted-dir/deleteByFileNames',
		method: 'post',
		data: fileNames,
	});
}

export function putObj(obj?: Object) {
	return request({
		url: '/admin/deleted-dir',
		method: 'put',
		data: obj,
	});
}

export function dir(obj?: Object) {
	return request({
		url: '/admin/deleted-dir/dir',
		method: 'get',
		params: obj,
	});
}
