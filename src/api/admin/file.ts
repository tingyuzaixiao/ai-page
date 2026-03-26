import request from '/@/utils/request';

export function fetchList(query?: Object) {
	return request({
		url: '/admin/sys-file/page',
		method: 'get',
		params: query,
	});
}

export function addObj(obj?: Object) {
	return request({
		url: '/admin/sys-file',
		method: 'post',
		data: obj,
	});
}

export function upload(obj?: Object) {
	return request({
		url: '/admin/sys-file/upload',
		method: 'post',
		data: obj,
	});
}

export function importLabels(obj?: Object) {
	return request({
		url: '/admin/sys-file/importLabels',
		method: 'post',
		data: obj,
	});
}

export function getObj(id?: string) {
	return request({
		url: '/admin/sys-file/' + id,
		method: 'get',
	});
}

export function delObj(ids?: Object) {
	return request({
		url: '/admin/sys-file',
		method: 'delete',
		data: ids,
	});
}

export function delObjByFileNames(fileNames?: Object) {
	return request({
		url: '/admin/sys-file/deleteByFileNames',
		method: 'post',
		data: fileNames,
	});
}

export function putObj(obj?: Object) {
	return request({
		url: '/admin/sys-file',
		method: 'put',
		data: obj,
	});
}

export function dir(obj?: Object) {
	return request({
		url: '/admin/sys-file/dir',
		method: 'get',
		params: obj,
	});
}

export function dirTree(obj?: Object) {
	return request({
		url: '/admin/sys-file/dirTree',
		method: 'get',
		params: obj,
	});
}

export function download(query?: Object) {
	return request({
		url: '/admin/sys-file/download',
		method: 'get',
		params: query,
		responseType: 'blob', // 设置响应类型为 blob，用于下载文件
	});
}

export function uploadChunkFile(chunkInfo: FormData) {
	return request({
		url: '/admin/sys-file/upload/chunk',
		method: 'post',
		data: chunkInfo, // 替换 params 为 data
		headers: {
			'Content-Type': 'multipart/form-data', // 明确请求类型
		},
	});
}

export function uploadMergeFile(query?: Object) {
	return request({
		url: '/admin/sys-file/upload/chunk/merge',
		method: 'post',
		params: query,
	});
}

export function calMd5(query?: Object) {
	return request({
		url: '/admin/sys-file/md5',
		method: 'post',
		data: query,
	});
}
