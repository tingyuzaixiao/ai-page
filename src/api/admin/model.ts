import request from '/@/utils/request';

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
						description: "电路板缺陷检测数据包括图像、传感器和测试结果数据，用于识别短路、开路等缺陷及其位置和严重程度。这些数据来自自动化检测设备和测试工具，格式多样，如图像、文本和数据库。通过图像处理和数据分析，这些数据用于质量控制、故障分析和预测维护，以提升电路板生产质量和可靠性。",
						createTime: "2023-07-07 14:55:07",
						updateTime: "2023-07-07 14:55:07",
						family: [
							{
								id: 20240517001,
								name: '数据集1',
								modelType: "分类",
								versionNum: 3,
								createTime: "2023-07-07 14:55:07",
								updateTime: "2023-07-07 14:55:07",
							},
							{
								id: 20240517002,
								name: '数据集2',
								modelType: "分割",
								versionNum: 2,
								createTime: "2023-07-07 14:55:07",
								updateTime: "2023-07-07 14:55:07",
							},
							{
								id: 20240517003,
								name: '数据集3',
								modelType: "检测",
								versionNum: 3,
								createTime: "2023-07-07 14:55:07",
								updateTime: "2023-07-07 14:55:07",
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
							createTime: "2023-07-07 14:55:07",
							updateTime: "2023-07-07 14:55:07",
							}
					],
				}
			})
		}, 100);
	});
}

// export function modelList(query?: Object) {
	
// 	//返回一个promise函数，包含上述数据
// 	return new Promise((resolve, reject) => {
// 		setTimeout(() => {
// 			resolve({
// 				code: 0,
// 				data: {
// 					records: [{
// 						modelId: '1',
// 						modelName: '检测1',
// 						modelType: '图像分类',
// 						modelVersion: 'V1',
// 						remark: '雷达检测',
// 					}],
// 				}
// 			})
// 		}, 100);
// 	});
// }

export const list = (params?: Object) => {
	return request({
		url: '/admin/role/list',
		method: 'get',
		params,
	});
};

export function addObj(obj?: Object) {
	return request({
		url: '/admin/role',
		method: 'role',
		data: obj,
	});
}

export function getObj(id?: string) {
	return request({
		url: '/admin/role/details/' + id,
		method: 'get',
	});
}

export function getObjDetails(obj?: object) {
	return request({
		url: '/admin/role/details',
		method: 'get',
		params: obj,
	});
}

export function delObj(ids?: object) {
	return request({
		url: '/admin/role',
		method: 'delete',
		data: ids,
	});
}

export function putObj(obj?: Object) {
	return request({
		url: '/admin/role',
		method: 'put',
		data: obj,
	});
}

export function validateModelName(rule: any, value: any, callback: any, isEdit: boolean) {
	if (isEdit) {
		return callback();
	}

	getObjDetails({ roleName: value }).then((response) => {
		const result = response.data;
		if (result !== null) {
			callback(new Error('岗位名称已经存在'));
		} else {
			callback();
		}
	});
}

export function validateModelCode(rule: any, value: any, callback: any, isEdit: boolean) {
	if (isEdit) {
		return callback();
	}

	getObjDetails({ roleCode: value }).then((response) => {
		const result = response.data;
		if (result !== null) {
			callback(new Error('岗位编码已经存在'));
		} else {
			callback();
		}
	});
}
