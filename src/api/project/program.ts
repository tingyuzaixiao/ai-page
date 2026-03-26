import request from '/@/utils/request';

//分页获取项目列表
export function getProgramListReq(query?: Object) {
	return request({
		url: '/admin/sys-program/page',
		method: 'get',
		params: query,
	});
}

//新增项目
export const addProgramReq = (obj?: Object) => {
	return request({
		url: '/admin/sys-program',
		method: 'post',
		data: obj,
	});
};

// 通过id获取项目详情
export function getProgramByIdReq(id: string) {
	return request({
		url: '/admin/sys-program/' + id,
		method: 'get',
	});
}

// 通过programId或者name查询获取项目详情
export function getProgramByIdorNameReq(obj: object) {
	return request({
		url: '/admin/sys-program/get',
		method: 'get',
		params: obj,
	});
}

//编辑项目
export function editProgramReq(obj?: Object) {
	return request({
		url: '/admin/sys-program',
		method: 'put',
		data: obj,
	});
}

//删除项目
export function deleteProgramReq(id?: number) {
	return request({
		url: '/admin/sys-program',
		method: 'delete',
		data: id,
		headers: {
			'Content-Type': 'application/json',
		},
	});
}

// 验证项目名称
export function getProgramDetails(obj?: object) {
	return request({
		url: '/admin/sys-program/details',
		method: 'get',
		params: obj,
	});
}

// 验证项目名称
export function checkProgramName(obj?: object) {
	return request({
		url: '/admin/sys-program/checkName',
		method: 'get',
		params: obj,
	});
}

export function validateProgramName(rule: any, value: any, id: any, callback: any, isEdit: boolean) {
	if (isEdit) {
		return callback();
	}

	checkProgramName({ name: value })
		.then((response) => {
			const result = response.data;
			if (result == false) {
				callback(new Error('项目名称已经存在'));
			} else {
				callback();
			}
		})
		.catch((err) => {
			// 兜底处理
			callback(new Error('接口异常，请稍后重试'));
		});
}

//获取所有数据集数据
export function getDatasetListReq(query?: Object) {
	return request({
		url: '/admin/dataset/list',
		method: 'get',
		params: query,
	});
}

//获取所有模型数据
export function getModelListReq(query?: Object) {
	return request({
		url: '/admin/model/list',
		method: 'get',
		params: query,
	});
}

//获取所有数据集数据
export function getExperimentListReq(query?: Object) {
	return request({
		url: '/admin/experiment/page',
		method: 'get',
		params: query,
	});
}

//获取所有数据集数据
export function getExperimentList(query?: Object) {
	return request({
		url: '/admin/experiment/list',
		method: 'get',
		params: query,
	});
}

//新增实验
export const addExpReq = (obj?: Object) => {
	return request({
		url: '/admin/experiment',
		method: 'post',
		data: obj,
	});
};

//编辑实验
export function editExpReq(obj?: Object) {
	return request({
		url: '/admin/experiment',
		method: 'put',
		data: obj,
	});
}

//删除实验
export function deleteExpReq(ids?: object) {
	return request({
		url: '/admin/experiment/delete',
		method: 'delete',
		params: { ids },
	});
}

export function updataTrain(obj: Object) {
	return request({
		url: '/admin/experiment/updateTrain',
		method: 'post',
		data: obj,
	});
}

// 开始实验
export function startTrain(obj: Object) {
	return request({
		url: '/admin/experiment/start',
		method: 'get',
		params: obj,
	});
}

// 验证实验名称
export function getExpDetails(obj?: object) {
	return request({
		url: '/admin/experiment/details',
		method: 'get',
		params: obj,
	});
}

// 验证实验名称
export function checkExpName(obj?: object) {
	return request({
		url: '/admin/experiment/checkName',
		method: 'get',
		params: obj,
	});
}

export function validateExpName(rule: any, value: any, id: any, callback: any, isEdit: boolean) {
	if (isEdit) {
		return callback();
	}

	checkExpName({ programId: id, experimentName: value })
		.then((response) => {
			const result = response.data;
			if (result == false) {
				callback(new Error('实验名称已经存在'));
			} else {
				callback();
			}
		})
		.catch((err) => {
			// 兜底处理
			callback(new Error('接口异常，请稍后重试'));
		});
}

export function getCheckpointList(baseModelId?: string, modelId?: string, type?: string) {
	return request({
		url: '/admin/experiment/getCheckpointList',
		method: 'get',
		params: { baseModelId, modelId, type },
	});
}

//根据id查找模型信息
export function getModelInfoReq(obj?: number) {
	return request({
		url: '/admin/model/' + obj,
		method: 'get',
	});
}

//根据id查找数据集信息
export function getDatasetInfoReq(obj: string) {
	return request({
		url: '/admin/dataset/' + obj,
		method: 'get',
	});
}

//根据id查找实验信息
export function getExpInfoReq(obj: string) {
	return request({
		url: '/admin/experiment/' + obj,
		method: 'get',
	});
}

//根据id查找实验信息
export function getExpDetailsReq(obj: string) {
	return request({
		url: '/admin/experiment/details/' + obj,
		method: 'get',
	});
}

//根据id查找项目信息
export function getProgramInfoReq(obj?: string) {
	return request({
		url: '/admin/sys-program/' + obj,
		method: 'get',
	});
}

//获取所有闲置GPU数据
export function getFreeGPUReq(query?: Object) {
	return request({
		url: '/admin/experiment/getFreeGpu',
		method: 'get',
		params: query,
	});
}

// 获取所有闲置服务列表数据
export function getFreeAlgoReq(query?: object) {
	return request({
		url: '/admin/experiment/getFreeAlgo',
		method: 'get',
		params: query,
	});
}
