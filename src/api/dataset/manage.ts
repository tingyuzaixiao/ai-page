import request from '/@/utils/request';

// 基础数据集接口
export const addBaseDataset = (obj?: Object) => {
	return request({
		url: '/admin/baseDataset',
		method: 'post',
		data: obj,
	});
};

export function delBaseDatasetById(ids?: object) {
	return request({
		url: '/admin/baseDataset/delete/' + ids,
		method: 'delete',
	});
}

export function editBaseDataset(obj?: Object) {
	return request({
		url: '/admin/baseDataset',
		method: 'put',
		data: obj,
	});
}

export function getBaseDatasetById(id?: string) {
	return request({
		url: '/admin/baseDataset/' + id,
		method: 'get',
	});
}

export function fetchBaseDatasetList(query?: Object) {
	return request({
		url: '/admin/baseDataset/page',
		method: 'get',
		params: query,
	});
}

// 原接口 (废弃),
export function fetchBaseImageList(query: Object) {
	return request({
		url: '/admin/sys-file/page',
		method: 'get',
		params: query,
	});
}

export function fetchBaseImageListNew(query: Object) {
	return request({
		url: '/admin/sys-file/pageNew',
		method: 'get',
		params: query,
	});
}

// 数据集接口
export const addDataset = (obj?: Object) => {
	return request({
		url: '/admin/dataset',
		method: 'post',
		data: obj,
	});
};

export function delDatasetById(ids?: object) {
	return request({
		url: '/admin/dataset/delete/' + ids,
		method: 'delete',
	});
}

export function editDataset(obj?: Object) {
	return request({
		url: '/admin/dataset',
		method: 'put',
		data: obj,
	});
}

export function getDatasetById(id?: string) {
	return request({
		url: '/admin/dataset/' + id,
		method: 'get',
	});
}

export function fetchdatasetList(query?: Object) {
	return request({
		url: '/admin/dataset/page',
		method: 'get',
		params: query,
	});
}

export function getState(query?: Object) {
	return request({
		url: '/admin/baseDataset/getState',
		method: 'get',
		params: query,
	});
}

// 测试数据
export function fetchList(query?: Object) {
	// return request({
	// 	url: '/admin/role/page',
	// 	method: 'get',
	// 	params: query,
	// });

	//返回一个promise函数，包含上述数据
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve({
				code: 0,
				data: {
					records: [
						{
							id: '20240517001',
							datasetName: '测试1',
							datasetVersion: 'V1',
							datasetType: '图片',
							datasetNum: 100,
							importStatus: '已完成',
							description:
								'电路板缺陷检测数据包括图像、传感器和测试结果数据，用于识别短路、开路等缺陷及其位置和严重程度。这些数据来自自动化检测设备和测试工具，格式多样，如图像、文本和数据库。通过图像处理和数据分析，这些数据用于质量控制、故障分析和预测维护，以提升电路板生产质量和可靠性。',
							createTime: '2023-07-07 14:55:07',
							updateTime: '2023-07-07 14:55:07',
							family: [
								{
									id: 20240517001,
									name: '数据集1',
									modelType: '分类',
									versionNum: 3,
									createTime: '2023-07-07 14:55:07',
									updateTime: '2023-07-07 14:55:07',
								},
								{
									id: 20240517002,
									name: '数据集2',
									modelType: '分割',
									versionNum: 2,
									createTime: '2023-07-07 14:55:07',
									updateTime: '2023-07-07 14:55:07',
								},
								{
									id: 20240517003,
									name: '数据集3',
									modelType: '检测',
									versionNum: 3,
									createTime: '2023-07-07 14:55:07',
									updateTime: '2023-07-07 14:55:07',
								},
							],
						},
						{
							id: '20240517002',
							datasetName: '数据集3',
							datasetVersion: 'V2',
							datasetType: '图片',
							datasetNum: 200,
							importStatus: '未导入',
							createTime: '2023-07-07 14:55:07',
							updateTime: '2023-07-07 14:55:07',
						},
					],
				},
			});
		}, 100);
	});
}

export const list = (params?: Object) => {
	return request({
		url: '/admin/dataset/list',
		method: 'get',
		params,
	});
};

export function addObj(obj?: Object) {
	return request({
		url: '/admin/dataset',
		method: 'put',
		data: obj,
	});
}

export function getObjDetails(obj?: object) {
	return request({
		url: '/admin/dataset/details',
		method: 'get',
		params: obj,
	});
}

export function getBaseObjDetails(obj?: object) {
	return request({
		url: '/admin/baseDataset/details',
		method: 'get',
		params: obj,
	});
}

export function getListDatasetGroup(obj?: object) {
	return request({
		url: '/admin/baseDataset/listGroup',
		method: 'post',
		data: obj,
	});
}

export function delObj(ids?: object) {
	return request({
		url: '/admin/dataset',
		method: 'delete',
		data: ids,
	});
}

export function checkMd5(baseDatasetId: string, md5: string) {
	return request({
		url: '/admin/baseDataset/checkMd5',
		method: 'get',
		params: { baseDatasetId: baseDatasetId, md5: md5 },
	});
}

export function validateDatasetName(rule: any, value: any, id: any, callback: any, isEdit: boolean) {
	if (isEdit) {
		return callback();
	}

	getObjDetails({ datasetName: value, baseDatasetId: id }).then((response) => {
		const result = response.data;
		if (result !== null) {
			callback(new Error('数据集名称已经存在'));
		} else {
			callback();
		}
	});
}

export function validateBaseDatasetName(rule: any, value: any, callback: any, baseDatasetId: any, isEdit: boolean) {
	getBaseObjDetails({ baseDatasetName: value }).then((response) => {
		const result = response.data;
		if (result !== null) {
			if (baseDatasetId !== result.baseDatasetId) callback(new Error('基础数据集名称已经存在'));
			callback();
		} else {
			callback();
		}
	});
}

export function validateDatasetVersion(rule: any, value: any, id: any, callback: any, isEdit: boolean) {
	if (isEdit) {
		return callback();
	}

	getObjDetails({ version: value, baseDatasetId: id }).then((response) => {
		const result = response.data;
		if (result !== null) {
			callback(new Error('该版本号已经存在'));
		} else {
			callback();
		}
	});
}
