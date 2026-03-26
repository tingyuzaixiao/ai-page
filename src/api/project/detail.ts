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
							projectId: 1,
							projectName: '工程1',
							projectModule: "分割",
							versionNum: 2,
							createTime: "2023-07-07 14:55:07",
							updateTime: "2023-07-07 14:55:07",
						},
						{
							projectId: 2,
							projectName: '工程2',
							projectModule: "分类",
							versionNum: 2,
							createTime: "2023-07-07 14:55:07",
							updateTime: "2023-07-07 14:55:07",
						},
						{
							projectId: 3,
							projectName: '工程3',
							projectModule: "检测",
							versionNum: 3,
							createTime: "2023-07-07 14:55:07",
							updateTime: "2023-07-07 14:55:07",
						},
					],
				}
			})
		}, 100);
	});
}

