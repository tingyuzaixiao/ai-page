import request from '/@/utils/request';

// 获取图片详情接口
export function fetchDatasetImageList(query?: Object) {
	return request({
		url: '/admin/dataset/page/img',
		method: 'get',
		params: query,
	});
}
export function fetchDatasetLabelList(query?: Object) {
	return request({
		url: '/admin/baseDataset/getLabelGroup',
		method: 'get',
		params: query,
	});
}

export function getFilesByBaseDatasetId(query?: Object) {
	return request({
		url: '/admin/baseDataset/getFilesByBaseDatasetId',
		method: 'get',
		params: query,
	});
}
