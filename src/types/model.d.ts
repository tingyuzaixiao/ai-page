export type ModelItem = {
	/** 模型ID */
	modelId: number;
	/** 基础模型ID */
	baseModelId: number;
	/** 模型类型 */
	modelType?: string;
	/** 模型名称 */
	modelName?: string;
	/** 模型配置路径 */
	config?: string;
	/** 模型训练配置路径 */
	trainConfig?: string;
	/** 版本 */
	version?: string;
	/** 应用场景 */
	applicationScene?: number;
	/** 描述 */
	description?: string;
	/** 已选数据集 */
	selected: [];
};
