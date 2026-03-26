import { MockMethod } from 'vite-plugin-mock';
export default [
	{
		url: '/admin/label/getbardata/:id',
		method: 'get',
		response: ({ params }) => {
			const id = params.id; // 获取 id 参数
			// 根据 id 返回不同的数据，这里假设只有一个固定的 id 示例
			if (id === '1') {
				return {
					code: 0,
					data: [
						{ value: 12, name: '玫瑰' },
						{ value: 5, name: '向日葵' },
						{ value: 6, name: '蒲公英' },
						{ value: 10, name: '康乃馨' },
						{ value: 17, name: '雏菊' },
					],
				};
			} else if (id === '2') {
				return {
					code: 0,
					data: [
						{ value: 8, name: '百合' },
						{ value: 15, name: '郁金香' },
						{ value: 7, name: '风信子' },
						{ value: 12, name: '牡丹' },
						{ value: 9, name: '茉莉' },
					],
				};
			} else {
				return {
					code: 1,
					message: 'Invalid id',
				};
			}
		},
	},
	{
		url: '/api/post',
		method: 'post',
		timeout: 2000,
		response: {
			code: 0,
			data: {
				name: 'vben',
			},
		},
	},
	{
		url: '/api/text',
		method: 'post',
		rawResponse: async (req, res) => {
			let reqbody = '';
			await new Promise((resolve) => {
				req.on('data', (chunk) => {
					reqbody += chunk;
				});
				req.on('end', () => resolve(undefined));
			});
			res.setHeader('Content-Type', 'text/plain');
			res.statusCode = 200;
			res.end(`hello, ${reqbody}`);
		},
	},
] as MockMethod[];
