<!--文件上传组件-->
<template>
	<div class="upload-file" v-loading="fileType !== '' && isLoading && { text: computedUpdatePercentage }"
		element-loading-text="上传中...">
		<el-form style="max-width: 1250px" :label-width="dialogType === 'fileUploader' || 'delayed' ? 0 : 'auto'"
			label-suffix="：">
			<el-form-item :label="dialogType === 'fileUploader' || 'delayed' ? '' : t('excel.bucketName')">
				<el-select v-model="bucketNameChoise" filterable :placeholder="t('excel.pleaseSelectFolder')" allow-create
					clearable @change="bucketNameChange">
					<template #prefix>
						<div class="text-tx-regular">
							<span v-show="bucketNameTitle">{{ bucketNameTitle }}/</span>
						</div>
					</template>
					<el-option v-for="item in bucketNames" :key="item" :label="item" :value="item" />
				</el-select>
			</el-form-item>
			<el-form-item v-show="props.data.dialogType == '2' || props.data.dialogType === undefined"
				:label="dialogType === 'fileUploader' || 'delayed' ? '' : t('excel.uploadMethod')">
				<el-radio-group v-model="uploadFileType" @change="handleUploadTypeChange" size="large">
					<el-radio-button v-for="item in file_upload_type" :key="item.label" :value="item.value">
						{{ item.label }}
					</el-radio-button>
				</el-radio-group>
			</el-form-item>

			<el-form-item
				v-show="props.data.dialogType == '0' || uploadFileType == 'zip' || props.data.dialogType == '3' || props.data.dialogType == '4'"
				:label="props.data.dialogType == '4' || props.data.dialogType == '2' ? '' : t('excel.taskType')">
				<el-radio-group v-model="labelTypeValue" @change="resetSubLabelTypeValue"
					:disabled="props.data.dialogType == '4'">
					<el-radio-button v-for="item in base_dataset_type" :key="item.label" :value="item.value">
						{{ item.label }}
					</el-radio-button>
				</el-radio-group>
			</el-form-item>

			<el-form-item
				v-show="(uploadFileType == 'zip' || props.data.dialogType == '0') && (labelTypeValue == '0' || labelTypeValue == '1' || labelTypeValue == '2')"
				:label="(props.data.dialogType == '4' || props.data.dialogType == '2') ? '' : t('excel.subLabelType')">
				<el-radio-group v-model="subLabelTypeValue" :disabled="props.data.dialogType == '4'">
					<el-radio-button v-if="labelTypeValue == '0'" v-for="item in sub_label_class_type" :key="item.label"
						:value="item.value" :disabled="item.value === '1'">
						{{ item.label }}
					</el-radio-button>
					<el-radio-button v-if="labelTypeValue == '1'" v-for="item in sub_label_detect_type" :key="item.label"
						:value="item.value">
						{{ item.label }}
					</el-radio-button>
					<el-radio-button v-if="labelTypeValue == '2'" v-for="item in sub_label_seg_type" :key="item.label"
						:value="item.value">
						{{ item.label }}
					</el-radio-button>
				</el-radio-group>
			</el-form-item>

			<el-form-item :label="dialogType === 'fileUploader' || 'delayed' ? '' : t('excel.uploadFile')">
				<el-upload style="width: 100%" ref="fileUpload" v-if="dialogType === 'default'"
					:action="baseURL + other.adaptationUrl(props.uploadFileUrl)" :before-upload="handleBeforeUpload"
					:http-request="handleUploadRequest" :file-list="fileList" :headers="headers" :limit="limit"
					:on-error="handleUploadError" :on-remove="handleRemove" :on-preview="handlePreview" :data="formData"
					:auto-upload="autoUpload" :on-success="handleUploadSuccess" class="upload-file-uploader" :accept="fileTypeStr"
					drag multiple>
					<i class="el-icon-upload"></i>
					<div class="el-upload__text">
						{{ t('excel.operationNotice') }}
						<em>{{ uploadMethodName }}</em>
					</div>
					<template #tip>
						<div class="el-upload__tip" v-if="props.isShowTip">
							{{ t('excel.pleaseUpload') }}
							<template v-if="fileSize">
								{{ t('excel.size') }}
								<b style="color: #f56c6c">{{ fileSize }}MB</b></template>
							<template v-if="fileType">
								&nbsp;{{ t('excel.format') }}
								<b style="color: #f56c6c">{{ fileType.join('/') }}</b>
							</template>
							{{ t('excel.file') }}
						</div>
					</template>
				</el-upload>

				<el-upload ref="fileUpload" v-if="dialogType === 'fileUploader'" style="width: 100%" :on-change="handleChange"
					:action="baseURL + other.adaptationUrl(props.uploadFileUrl)" :before-upload="handleBeforeUpload"
					:on-exceed="handleExceed" :http-request="handleUploadRequest" :file-list="fileList" :headers="headers"
					:limit="limit" :on-error="handleUploadError" :on-remove="handleRemove" :on-preview="handlePreview"
					:auto-upload="autoUpload" :accept="fileTypeStr" :on-success="handleUploadSuccess" class="upload-file-uploader"
					:show-file-list="!(uploadFileType == 'dir')" drag :multiple="isMultiple">
					<!-- :show-file-list="false" -->
					<!-- <i class="el-icon-upload"></i> -->
					<!-- :drag="uploadFileType != 'dir'" -->
					<div class="el-upload__text">
						<span v-if="uploadFileType != 'dir'">{{ t('excel.operationNotice') }} <em>{{ uploadMethodName
						}}</em></span>
						<span v-else>
							<em>{{ uploadMethodName }}</em></span>
						<!-- <div v-else
							class="w-[30vw] h-[13vh] border border-dashed border-[#dcdfe6] rounded-[6px] hover:border-[#2e5cf6]">
							<el-text class="h-[12vh] flex justify-center items-center !text-base" type="primary">{{ uploadMethodName
								}}</el-text>
						</div> -->
					</div>
					<template #tip>
						<div class="el-upload__tip" v-if="props.isShowTip">
							{{ t('excel.pleaseUpload') }}
							<template v-if="fileSize">
								{{ t('excel.size') }}
								<b style="color: #f56c6c">{{ fileSize }}MB</b></template>
							<template v-if="fileType">
								&nbsp;{{ t('excel.format') }}
								<b style="color: #f56c6c">{{ fileType.join('/') }}</b>
							</template>
							{{ t('excel.file') }}
							<template v-if="uploadFileType == 'zip'">
								&nbsp;{{ t('excel.zipFormat1') }}
								<b style="color: #f56c6c">{{ t('excel.zipFormat2') }}</b>
							</template>
						</div>
						<div class="text-xs text-[#606266] mt-[-5px] mb-1" v-if="uploadFileType == 'dir'">
							<span>{{ t('excel.fileUrlTip1') }} </span>
							<span class="font-bold text-base hover:text-red-500"> &nbsp;images&nbsp;</span>
							<span>{{ t('excel.fileUrlTip2') }}</span>
						</div>
						<div class="text-xs text-[#606266]" v-if="uploadFileType == 'zip'">
							<div>{{ t('excel.zipTip') }}</div>
							<div>&emsp;{{ t('excel.jsonTip') }}</div>
							<el-tree class="ml-2 font-600 text-xs max-w-2xl" :data="zipFileTree[Number(labelTypeValue)]" node-key="id"
								:default-expanded-keys="[2, 3]" :props="defaultProps" />
							<!-- :default-expanded-keys="[]" -->
						</div>
						<div class="text-xs text-[#606266]" v-if="props.data.dialogType == '0'">
							<div>{{ '✳' + t('excel.jsonTip') }}</div>
							<el-tree class="ml-2 font-600 text-xs max-w-2xl"
								:data="zipFileTree[Number(labelTypeValue)][0].children[0].children" node-key="id"
								:default-expanded-keys="[2, 3]" :props="defaultProps" />
						</div>
					</template>
				</el-upload>

				<el-upload ref="delayedFileUploadRef" v-if="dialogType === 'delayed'" style="width: 100%"
					:on-change="handleChange" :before-upload="handleBeforeUpload" :on-exceed="handleExceed"
					:action="baseURL + other.adaptationUrl(props.uploadFileUrl)" :http-request="handleUploadRequest"
					:file-list="fileList" :headers="headers" :limit="limit" :on-error="handleUploadError"
					:on-remove="handleRemove" :on-preview="handlePreview" :auto-upload="false" :accept="fileTypeStr"
					:on-success="handleUploadSuccess" class="upload-file-uploader" :show-file-list="!(uploadFileType == 'dir')"
					drag :multiple="isMultiple">
					<!-- :show-file-list="false" -->
					<!-- <i class="el-icon-upload"></i> -->
					<!-- :drag="uploadFileType != 'dir'" -->
					<div class="el-upload__text">
						<span v-if="uploadFileType != 'dir'">{{ t('excel.operationNotice') }} <em>{{ uploadMethodName
						}}</em></span>
						<span v-else>
							<em>{{ uploadMethodName }}</em></span>
						<!-- <div v-else
							class="w-[30vw] h-[13vh] border border-dashed border-[#dcdfe6] rounded-[6px] hover:border-[#2e5cf6]">
							<el-text class="h-[12vh] flex justify-center items-center !text-base" type="primary">{{ uploadMethodName
								}}</el-text>
						</div> -->
					</div>
					<template #tip>
						<div class="el-upload__tip" v-if="props.isShowTip">
							{{ t('excel.pleaseUpload') }}
							<template v-if="fileSize">
								{{ t('excel.size') }}
								<b style="color: #f56c6c">{{ fileSize }}MB</b></template>
							<template v-if="fileType">
								&nbsp;{{ t('excel.format') }}
								<b style="color: #f56c6c">{{ fileType.join('/') }}</b>
							</template>
							{{ t('excel.file') }}
							<template v-if="uploadFileType == 'zip'">
								&nbsp;{{ t('excel.zipFormat1') }}
								<b style="color: #f56c6c">{{ t('excel.zipFormat2') }}</b>
							</template>
						</div>
						<div class="text-xs text-[#606266] mt-[-5px] mb-1" v-if="uploadFileType == 'dir'">
							<span>{{ t('excel.fileUrlTip1') }} </span>
							<span class="font-bold text-base hover:text-red-500"> &nbsp;images&nbsp;</span>
							<span>{{ t('excel.fileUrlTip2') }}</span>
						</div>
						<div class="text-xs text-[#606266]" v-if="uploadFileType == 'zip'">
							<div>{{ t('excel.zipTip') }}</div>
							<div>&emsp;{{ t('excel.jsonTip') }}</div>
							<el-tree class="ml-2 font-600 text-xs max-w-2xl" :data="zipFileTree[Number(labelTypeValue)]" node-key="id"
								:default-expanded-keys="[2, 3]" :props="defaultProps" />
							<!-- :default-expanded-keys="[]" -->
						</div>
					</template>
				</el-upload>

				<el-upload ref="fileUpload" v-if="dialogType === 'chunk'" style="width: 100%" :on-change="handleFileChange"
					:show-file-list="true" :http-request="handleUploadRequest" :before-upload="handleBeforeUpload"
					:accept="fileTypeStr" :on-exceed="handleExceed" :multiple="isMultiple" drag>
					<div class="el-upload__text">
						<span v-if="uploadFileType != 'dir'">{{ t('excel.operationNotice') }} <em>{{ uploadMethodName
						}}</em></span>
						<span v-else>
							<em>{{ uploadMethodName }}</em></span>
						<!-- <div v-else
							class="w-[30vw] h-[13vh] border border-dashed border-[#dcdfe6] rounded-[6px] hover:border-[#2e5cf6]">
							<el-text class="h-[12vh] flex justify-center items-center !text-base" type="primary">{{ uploadMethodName
								}}</el-text>
						</div> -->
					</div>
					<template #tip>
						<div class="el-upload__tip" v-if="props.isShowTip">
							{{ t('excel.pleaseUpload') }}
							<template v-if="fileSize">
								{{ t('excel.size') }}
								<b style="color: #f56c6c">{{ fileSize }}MB</b></template>
							<template v-if="fileType">
								&nbsp;{{ t('excel.format') }}
								<b style="color: #f56c6c">{{ fileType.join('/') }}</b>
							</template>
							{{ t('excel.file') }}
							<template v-if="uploadFileType == 'zip'">
								&nbsp;{{ t('excel.zipFormat1') }}
								<b style="color: #f56c6c">{{ t('excel.zipFormat2') }}</b>
							</template>
						</div>
						<div class="text-xs text-[#606266] mt-[-5px] mb-1" v-if="uploadFileType == 'dir'">
							<span>{{ t('excel.fileUrlTip1') }} </span>
							<span class="font-bold text-base hover:text-red-500"> &nbsp;images&nbsp;</span>
							<span>{{ t('excel.fileUrlTip2') }}</span>
						</div>
						<div class="text-xs text-[#606266]" v-if="uploadFileType == 'zip'">
							<div>{{ t('excel.zipTip') }}</div>
							<div>&emsp;{{ t('excel.jsonTip') }}</div>
							<el-tree class="ml-2 font-600 text-xs max-w-2xl" :data="zipFileTree[Number(labelTypeValue)]" node-key="id"
								:default-expanded-keys="[2, 3]" :props="defaultProps" />
							<!-- :default-expanded-keys="[]" -->
						</div>
						<div class="text-xs text-[#606266]" v-if="props.data.dialogType == '0'">
							<div>{{ '✳' + t('excel.jsonTip') }}</div>
							<el-tree class="ml-2 font-600 text-xs max-w-2xl"
								:data="zipFileTree[Number(labelTypeValue)][0].children[0].children" node-key="id"
								:default-expanded-keys="[2, 3]" :props="defaultProps" />
						</div>
					</template>
				</el-upload>

				<!-- 上传区域 -->
				<el-upload ref="fileUpload" v-if="dialogType === 'picture-card'" style="width: 100%" :on-change="handleChange"
					:before-upload="handleBeforeUpload" :on-exceed="handleExceed" :http-request="handleUploadRequest"
					:file-list="fileList" :headers="headers" :limit="500" :on-error="handleUploadError" :on-remove="handleRemove"
					:on-preview="handlePreview" :auto-upload="true" :accept="fileTypeStr" class="upload-area"
					:class="{ 'has-image': isUploaded }" :show-file-list="true"
					:list-type="uploadFileType === 'file' ? 'picture-card' : 'text'" drag :multiple="isMultiple">
					<!-- 上传按钮区域 -->
					<div class="el-upload__text">
						<span v-if="uploadFileType != 'dir'">{{ t('excel.operationNotice') }} <em>{{ uploadMethodName }}</em></span>
						<span v-else><em>{{ uploadMethodName }}</em></span>
					</div>
					<template #file="{ file }">
						<div class="custom-file-item">
							<div class="file-item">
								<el-image v-if="isImage(file)" :src="serverUrl + getPreviewUrl(file)" class="file-preview" />
								<div v-else class="file-icon">
									<el-icon>
										<Document />
									</el-icon>
								</div>
							</div>
							<!-- 文件名显示区域 - 确保可见 -->
							<div class="file-name">
								<el-tooltip :content="file.name" placement="top">
									<div class="p-1 text-base leading-5  truncate bg-[rgba(0,0,0,0.05)]">
										{{ truncateFileName(file.name, 20) }}
									</div>
								</el-tooltip>
							</div>
							<div class="file-actions">
								<el-icon :size="25" class="delete-icon" @click="handleRemoveFile(file)">
									<Delete />
								</el-icon>
								<el-icon :size="25" class="preview-icon" @click="handlePreviewImage(file)">
									<ZoomIn />
								</el-icon>
							</div>
						</div>
					</template>

					<!-- 提示信息 -->
					<template #tip>
						<div class="el-upload__tip" v-if="props.isShowTip">
							{{ t('excel.pleaseUpload') }}
							<template v-if="fileSize">
								{{ t('excel.size') }}
								<b style="color: #f56c6c">{{ fileSize }}MB</b></template>
							<template v-if="fileType">
								&nbsp;{{ t('excel.format') }}
								<b style="color: #f56c6c">{{ fileType.join('/') }}</b>
							</template>
							{{ t('excel.file') }}
							<template v-if="uploadFileType == 'zip'">
								&nbsp;{{ t('excel.zipFormat1') }}
								<b style="color: #f56c6c">{{ t('excel.zipFormat2') }}</b>
							</template>
						</div>
						<div class="text-xs text-[#606266] mt-[-5px] mb-1" v-if="uploadFileType == 'dir'">
							<span>{{ t('excel.fileUrlTip1') }} </span>
							<span class="font-bold text-base hover:text-red-500"> &nbsp;images&nbsp;</span>
							<span>{{ t('excel.fileUrlTip2') }}</span>
						</div>
						<div class="text-xs text-[#606266]" v-if="uploadFileType == 'zip'">
							<div>{{ t('excel.zipTip') }}</div>
							<div>&emsp;{{ t('excel.jsonTip') }}</div>
							<el-tree class="ml-2 font-600 text-xs max-w-2xl" :data="zipFileTree[Number(labelTypeValue)]" node-key="id"
								:default-expanded-keys="[2, 3]" :props="defaultProps" />
							<!-- :default-expanded-keys="[]" -->
						</div>
						<div class="text-xs text-[#606266]" v-if="props.data.dialogType == '0'">
							<div>'✳'{{ t('excel.jsonTip') }}</div>
							<el-tree class="ml-2 font-600 text-xs max-w-2xl"
								:data="zipFileTree[Number(labelTypeValue)][0].children[0].children" node-key="id"
								:default-expanded-keys="[2, 3]" :props="defaultProps" />
						</div>
					</template>
				</el-upload>

				<!-- 图片预览弹窗 -->
				<el-image-viewer v-if="previewVisible" @close="previewVisible = false"
					:url-list="[serverUrl + previewImageUrl]" />

				<el-progress v-show="uploadFileType == 'dir' && fileCount > 0" class="w-full"
					:percentage="computedPercentage ? computedPercentage : 0" :stroke-width="8"
					:status="computedPercentage == 100 ? 'success' : ''" striped striped-flow :duration="10" />
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts" name="upload-file">
import { useMessage, useMessageBox } from '/@/hooks/message';
import { Session } from '/@/utils/storage';
import other from '/@/utils/other';
import { delObjByFileNames, upload, dir, uploadChunkFile, uploadMergeFile, delObj } from '/@/api/admin/file';
import { checkMd5 } from '/@/api/dataset/manage';
import { useI18n } from 'vue-i18n';
import { useDict } from '/@/hooks/dict';
import { inject } from 'vue';
import axios from 'axios';
import { getState } from '/@/api/dataset/manage'
import SparkMD5 from 'spark-md5';
import { Document, Delete, ZoomIn } from '@element-plus/icons-vue';
import { serverUrl } from "/@/utils/env";


// 页面加载时执行
onMounted(() => {
	// console.log("onMounted - uplaod");

	nextTick(() => {
		// if (dialogType === 'fileUploader' && fileUpload.value && fileUpload.value.$el.querySelector('input')) {
		// 	fileUpload.value.$el.querySelector('input').webkitdirectory = true;
		// }
		// console.log('nextSubmit');
	});
});

// 页面销毁
onBeforeUnmount(() => {
	// console.log('onBeforeUnmount');
});

//

const props = defineProps({
	modelValue: [String, Array],
	// 数量限制
	// limit: {
	// 	type: Number,
	// 	default: 10000,
	// },
	// 大小限制(MB)
	fileSize: {
		type: Number,
		default: 1000,
	},
	fileType: {
		type: Array,
		default: () => ['png', 'jpg', 'jpeg', 'bmp', 'xls', 'ppt', 'txt', 'pdf', 'docx', 'xlsx', 'pptx', 'tiff', 'tar', 'zip', 'gz'],
	},
	fileTypeStr: {
		type: String,
		default: '.png,.jpg,.jpeg,.bmp,.xls,.ppt,.txt,.pdf,.docx,.xlsx,.pptx,.tiff,.tar,.zip,.gz',
	},
	imgType: {
		type: Array,
		default: () => ['png', 'jpg', 'jpeg', 'bmp', 'tiff'],
	},
	imgTypeStr: {
		type: String,
		default: '.png,.jpg,.jpeg,.bmp,.tiff',
	},
	zipType: {
		type: Array,
		default: () => ['zip', 'tar', 'tar.gz'],
	},
	zipTypeStr: {
		type: String,
		default: '.zip,.tar,.tar.gz',
	},
	labelType: {
		type: Array,
		default: () => ['json'],
	},
	labelTypeStr: {
		type: String,
		default: '.json',
	},
	// 是否显示提示
	isShowTip: {
		type: Boolean,
		default: true,
	},
	uploadFileUrl: {
		type: String,
		default: '/admin/sys-file/upload',
	},
	type: {
		type: String,
		default: 'default',
		validator: (value: string) => {
			return ['default', 'simple', 'fileUploader', 'delayed', 'chunk', 'picture-card'].includes(value);
		},
	},
	data: {
		type: Object,
		default: {},
	},
	dir: {
		type: String,
		default: '',
	},
	autoUpload: {
		type: Boolean,
		default: true,
	},
});

const emit = defineEmits(['update:modelValue', 'change', 'update:dataFromUpload']);
// const handleDataFromUpload = inject<Function>('handleDataFromUpload', () => { });
// const emitDataFromUpload = () => {
// 	handleDataFromUpload();
// };

// 控制是否多选
const isMultiple = ref(true);
const isLoading = ref(false);
const delayedFileUploadRef = ref();

const limit = ref<Number>(10000);
const number = ref(0);
const fileCount = ref(0);
const fileUploadCount = ref(0);
const fileList = ref([]) as any;
const uploadList = ref([]) as any;
const fileUpload = ref();
const bucketName = ref() as any;
const bucketNameTitle = ref();
const bucketNameChoise = ref();
const bucketNames = ref();
const { t } = useI18n();
// 定义字典
const { file_upload_type, base_dataset_type, sub_label_detect_type, sub_label_seg_type, sub_label_class_type } = useDict(
	'file_upload_type',
	'base_dataset_type',
	'sub_label_detect_type',
	'sub_label_seg_type',
	'sub_label_class_type',
	'label_category'
);
const uploadFileType = ref('');
const labelTypeValue = ref('0');
const subLabelTypeValue = ref('0');
const uploadMethodName = ref('点击上传文件') as any;

const fileType = ref('') as any;
const fileSize = ref<Number>(100);
const fileTypeStr = ref() as any;
const defaultFilePath = ref() as any;

const defaultProps = {
	children: 'children',
	label: 'label',
};

const dialogType = ref('');
dialogType.value = props.type

//分片上传
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB分片
const file = ref();
const fileMd5 = ref('');
const totalChunks = ref();
const uploadedChunks = ref(0);
const progressVisible = ref(false);
const isUploaded = ref(false); // 上传状态标识
const bucketNameChange = (value: any) => { };
const handleUploadTypeChange = (uploadMethod: any) => {
	// console.log("handleUploadTypeChange", uploadMethod)
	resetQuery(uploadMethod);
	// 已上传文件个数;

	// 校验文件个数
	number.value = 0;
	// 已上传文件个数
	fileUploadCount.value = 0;
	bucketNameTitle.value = defaultFilePath.value;
	if (uploadMethod === 'dir') {
		nextTick(() => {
			fileUpload.value.$el.querySelector('input').webkitdirectory = true;
			fileCount.value = fileUpload.value.$el.querySelector('input').files.length;
		});
		fileType.value = '';
		uploadMethodName.value = t('excel.clickUploadDir');
		isMultiple.value = true;
		limit.value = 10000;
		dialogType.value = 'fileUploader';
	} else if (uploadMethod === 'zip') {
		// 清空已上传文件列表
		fileUpload.value!.clearFiles();
		nextTick(() => {
			fileUpload.value.$el.querySelector('input').webkitdirectory = false;
		});
		fileType.value = props.zipType;
		fileSize.value = 2048;
		fileTypeStr.value = props.zipTypeStr;
		uploadMethodName.value = t('excel.clickUploadFile');
		isMultiple.value = false;
		limit.value = 1;
		dialogType.value = 'chunk';
	} else if (uploadMethod === 'file') {
		fileType.value = props.imgType;
		fileTypeStr.value = props.imgTypeStr;
		uploadMethodName.value = t('excel.clickUploadFile');
		if (props.data.dialogType === '2') bucketNameTitle.value += '/images';
		nextTick(() => {
			fileUpload.value.$el.querySelector('input').webkitdirectory = false;
		});
		isMultiple.value = true;
		limit.value = 10000;
		dialogType.value = 'picture-card';
	}
	getDir(bucketNameTitle.value, true);
};

const resetData = () => {
	fileCount.value = 0;
	fileUploadCount.value = 0;
	bucketName.value = undefined;
	bucketNameTitle.value = '';
	bucketNames.value = [];
	uploadFileType.value = 'file';
	fileType.value = props.imgType;
	bucketNameChoise.value = '';
	labelTypeValue.value = '0';

	if (props.data.dialogType === '4') {
		nextTick(() => {
			delayedFileUploadRef.value.$el.querySelector('input').webkitdirectory = false;
		});
	} else {
		nextTick(() => {
			fileUpload.value.$el.querySelector('input').webkitdirectory = false;
		});
	}
};

const resetQuery = (value: string) => {
	labelTypeValue.value = '0';
	subLabelTypeValue.value = '0';
	fileSize.value = 100;
	fileList.value = [];
};
const resetSubLabelTypeValue = (value: string) => {
	subLabelTypeValue.value = '0';
};

const getFileDir = () => {
	let bucketNameParam = '';
	// console.log("getFileDir", props.data);

	if (props.data.labelType !== undefined) {
		labelTypeValue.value = props.data.labelType;
	}
	if (props.data.subLabelType !== undefined) {
		subLabelTypeValue.value = props.data.subLabelType;
	}

	if (props.data.dialogType === '0') {
		bucketNameParam = 'dataset/' + props.data.baseDatasetName + '/base/annotations';
		fileType.value = props.labelType;
		fileTypeStr.value = props.labelTypeStr;
		fileSize.value = 50;
	} else if (props.data.dialogType === '1') {
		bucketNameParam = 'dataset/' + props.data.baseDatasetName + '/' + props.data.datasetName + '/annotations';
		fileType.value = props.labelType;
		fileTypeStr.value = props.labelTypeStr;
	} else if (props.data.dialogType === '2') {
		bucketNameParam = 'dataset/' + props.data.baseDatasetName + '/base';
		// bucketName.value = bucketNameParam
		fileType.value = props.imgType;
		fileTypeStr.value = props.imgTypeStr;
	} else if (props.data.dialogType === '3') {
		bucketNameParam = 'dataset/' + props.data.baseDatasetName + '/base';
		// bucketName.value = bucketNameParam
		fileType.value = props.imgType;
		fileTypeStr.value = props.imgTypeStr;
	} else if (props.data.dialogType === '4') {
		bucketNameParam = 'dataset/' + props.data.baseDatasetName + '/base' + '/annotations/reference';
		// bucketName.value = bucketNameParam
		fileType.value = props.labelType;
		fileTypeStr.value = props.labelTypeStr;
		fileSize.value = 50;
		// labelTaskId.value = props.data.taskId;
		uploadParams.uploadType = '3';
		// dialogType = 'delayed';
	} else {
		bucketNameParam = '';
		fileType.value = props.imgType;
		fileTypeStr.value = props.imgTypeStr;
	}
	bucketNameTitle.value = bucketNameParam;
	defaultFilePath.value = bucketNameParam;

	uploadFileType.value = 'file';
	if (props.data.dialogType === '2') bucketNameTitle.value += '/images';
	getDir(bucketNameParam, true);
};

const getDir = (bucketName: string, isSubDirectory: boolean) => {
	bucketNames.value = [];
	dir({ bucketName: bucketName, isSubDirectory: isSubDirectory })
		.then((res) => {
			bucketNames.value = res.data;
		})
		.catch((err) => {
			// useMessage().error('该目录下暂无文件目录');
		});
};

// 获取文件夹数量
const handleChange = () => {
	if (fileUpload.value && fileUpload.value.$el.querySelector('input') && fileCount.value == 0) {
		// 第一次获取是，可拿到文件上传总数量
		fileCount.value = fileUpload.value.$el.querySelector('input').files.length;
	}
};

// 请求头处理
const headers = computed(() => {
	return {
		Authorization: 'Bearer ' + Session.get('token'),
		'TENANT-ID': Session.getTenant(),
	};
});

// 请求参数处理
const formData = computed(() => {
	return Object.assign(props.data, {
		bucketName: bucketName.value === undefined ? '' : bucketName.value,
	});
});

const computedBucketNameChoice = computed(() => {
	return bucketNameChoise.value === undefined ? '' : bucketNameChoise.value;
});

const computedPercentage = computed(() => {
	let percentage = Number(((fileUploadCount.value * 100) / fileCount.value).toFixed(2));
	return percentage ? percentage : 0;
});

const computedUpdatePercentage = computed(() => {
	if (props.data.dialogType == '4' || fileType.value === props.zipType || (props.data.dialogType == '2' && fileType.value + "" === props.zipType + "")) {
		return uploadProgress.value < 100 ? t('excel.uploading') + uploadProgress.value + '%' : t('excel.analysisFileLoading');
	} else {
		return t('excel.uploading') + uploadProgress.value + '%';
	}

});

// 上传前校检格式和大小
const handleBeforeUpload = (file: File) => {
	if (file.type == '' && !file.name.includes('.')) {
		useMessage().wraning(t('excel.fileUploadWarning'));
		return false;
	}

	// 校检文件类型
	if (fileType.value.length) {
		const fileName = file.name.split('.');
		const fileExt = fileName[fileName.length - 1];
		const isTypeOk = fileType.value.indexOf(fileExt) >= 0;
		if (!isTypeOk) {
			useMessage().error(`${t('excel.typeErrorText')} ${fileType.value.join('/')}!`);
			return false;
		}
	}
	// 校检文件大小
	if (fileSize.value) {
		const isLt = file.size / 1024 / 1024 < Number(fileSize.value);
		if (!isLt) {
			useMessage().error(`${t('excel.sizeErrorText')} ${fileSize} MB!`);
			return false;
		}
	}
	// 校验压缩包数量
	// if (uploadFileType.value == 'zip' && number.value >= 1) {
	// 	useMessage().error(`${t('excel.zipErrorText')}`);
	// 	return false
	// }
	// 参考标签 检验taskID
	// if (props.data.dialogType == '3' && labelTaskId.value == undefined) {
	// 	useMessage().error(`${t('excel.taskErrorText')}`);
	// 	return false;
	// }
	number.value++;
	return true;
};

// const handleExceed = (files: any) => {
// 	fileUpload.value!.clearFiles()
// 	const file = files[0] as UploadRawFile
// 	file.uid = genFileId()
// 	fileUpload.value!.handleStart(file)
// }

interface UploadParams {
	baseDatasetId: string | undefined;
	bucketName: string;
	dataType: string | undefined;
	uploadType: string | undefined;
	labelType: string;
	subLabelType: string;
	taskId?: string; // taskId 是可选的
}

const uploadParams = reactive({}) as UploadParams;

const handleUploadRequest = async (options: any) => {
	// debugger
	const formData = new FormData();
	const file = options.file;
	const filePath = file.webkitRelativePath;
	if (filePath) {
		// 获取上传文件的文件夹路径
		let lastSlashIndex = filePath.lastIndexOf('/');
		let result = filePath.substring(0, lastSlashIndex);
		bucketName.value = bucketNameTitle.value + '/' + computedBucketNameChoice.value + '/' + result;
	} else {
		bucketName.value = bucketNameTitle.value + '/' + computedBucketNameChoice.value;
		bucketName.value = bucketName.value.replace(/^\/|\/$/g, '');
	}
	formData.append('file', file);
	bucketName.value = bucketName.value.replace(/\/\/+/g, '/');

	uploadParams.bucketName = bucketName.value;
	// 更新 uploadParams 的值
	uploadParams.baseDatasetId = props.data.baseDatasetId;
	uploadParams.dataType = props.data.dataType;
	uploadParams.uploadType = props.data.dialogType;
	uploadParams.labelType = labelTypeValue.value;
	uploadParams.subLabelType = subLabelTypeValue.value;


	// 仅在 labelTaskId 有值时添加 taskId 字段
	// if (labelTaskId.value) {
	// 	uploadParams.taskId = labelTaskId.value;
	// }

	if (!checkParams(uploadParams)) {
		return; // 如果有任何属性为空，则退出函数
	}

	Object.keys(uploadParams).forEach((key: any) => {
		formData.append(key, uploadParams[key as keyof UploadParams] || '');
	});

	formData.append('params', paramsToString(uploadParams));
	isLoading.value = true;

	if (props.data.baseDatasetId !== undefined && props.data.baseDatasetId !== '' && props.data.baseDatasetId !== null) {
		//判断数据集状态
		try {
			let code = 0;
			let msg = '';
			if (uploadFileType.value === 'zip') {
				let { code, msg } = await getState({ baseDatasetId: props.data.baseDatasetId });
				code = code;
				msg = msg;
			}
			if (code === 0) {
				if (dialogType.value === 'chunk') {
					await startUpload()
				} else {
					// handleUpload(formData)
					let md5 = await calculateMD5(file)
					let { data } = await checkMd5(props.data.baseDatasetId, md5 as string)
					if (data) {
						useMessage().error(t('manage.existImage'));
						isLoading.value = false;
						// emit('update:dataFromUpload', true);

						// console.log('update:modelValue1')
						// // emit('change', listToString(fileList.value));
						// // handleUploadError(error)
						// console.log('----', fileList.value)

						handleRemove(file);
						// number.value--;
						// console.log('=====', fileList.value)
						// return;
					} else {
						// console.log('handleUpload-------', fileList.value)
						handleUpload(formData)
					}
				}
			} else {
				useMessage().error(msg);
				isLoading.value = false;
				emit('update:dataFromUpload', true);

				// console.log('update:modelValue1')
				emit('change', listToString(fileList.value));
				emit('update:modelValue', listToString(fileList.value));

				return;
			}
		} catch (error) {
			isLoading.value = false;
			handleUploadError(error)
			handleClear();
			return;
		}
	} else {
		handleUpload(formData)
	}

	// .then((response) => {
	// 	isLoading.value = false;
	// 	console.log('response', response);
	// 	// 上传成功处理
	// 	handleUploadSuccess(response, file);
	// 	emitDataFromUpload();
	// })
	// .catch((error) => {
	// 	// 上传失败处理
	// 	isLoading.value = false;
	// 	handleUploadError(error);
	// 	fileList.value = [];
	// 	emitDataFromUpload();
	// });
};
const handleClear = () => {
	if (fileUpload.value) {
		fileUpload.value.clearFiles(); // 清空所有文件（包括已上传和待上传）
		fileList.value = [];
	}
};


const uploadProgress = ref(0);
const handleUpload = async (formData: FormData) => {
	try {
		const response = await axios.post(import.meta.env.VITE_API_URL + other.adaptationUrl(props.uploadFileUrl), formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
				'Authorization': 'Bearer ' + Session.get('token'),
				'Access-Control-Allow-Origin': '*',
			},
			onUploadProgress: (progressEvent) => {
				if (progressEvent.total) {
					uploadProgress.value = Math.round(
						(progressEvent.loaded * 100) / progressEvent.total
					);
				}
			}
		});

		// 上传成功处理
		// console.log('handleUpload上传成功处理', response);
		handleUploadSuccess(response.data, formData.get('file'));
		// emitDataFromUpload();
		uploadProgress.value = 0; // 重置进度
		isLoading.value = false;
	} catch (error) {
		// console.error('上传失败:', error);
		uploadProgress.value = 0;
		// 上传失败处理
		isLoading.value = false;
		// handleUploadError(error);
		fileList.value = [];
		// emitDataFromUpload();
		emit('update:dataFromUpload', true);
	}
};

const paramsToString = (params: any) => {
	try {
		return JSON.stringify(params);
	} catch (error) {
		useMessage().error('params to string error');
		return '';
	}
};

// 检查 params 对象中的属性是否为空
const checkParams = (params: any) => {
	for (const key in params) {
		if (params[key] === undefined || params[key] === null || params[key] === '') {
			useMessage().error(`参数 ${key} 不能为空`);
			return false;
		}
	}
	return true;
};

// 上传成功回调
function handleUploadSuccess(res: any, file: any) {
	if (res != undefined && res.code === 0) {
		fileUploadCount.value++;
		uploadList.value.push({ name: file.name, url: res.data.url, fileId: res.data.fileId });
		// console.log("res--uploadList", uploadList.value);
		uploadedSuccessfully();
		emit('update:dataFromUpload', true);
	} else {
		// 上传失败处理
		number.value--;
		useMessage().error(res.msg);
		// fileUpload.value.handleRemove(file);
		// uploadedSuccessfully();
	}
}

// 上传结束处理
const uploadedSuccessfully = () => {
	// console.log('uploadedSuccessfully', number.value, uploadList.value.length)
	if (number.value > 0 && uploadList.value.length === number.value) {
		// console.log("fileList-start", fileList.value);
		fileList.value = fileList.value.filter((f: { url?: string }) => f.url !== undefined).concat(uploadList.value);
		// console.log("fileList-end", fileList.value);
		uploadList.value = [];
		number.value = 0;
		emit('change', listToString(fileList.value));
		// console.log('update:modelValue2')
		emit('update:modelValue', listToString(fileList.value));
	}
};

const handleRemove = (file: any) => {
	// console.log('handleRemove', fileList.value.length)
	if (fileList.value.length > 0) {
		fileList.value = fileList.value.filter((f: any) => !(f === file.url));
		emit('change', listToString(fileList.value));
		// console.log('update:modelValue3')
		emit('update:modelValue', listToString(fileList.value));
		removeFile(file);
	} else {
		fileUpload.value.clearFiles();
		fileList.value = [];
		number.value = 0;
	}
};
const removeFile = (file: any) => {
	if (file.url) {
		let fileName = file.url.split('/')[file.url.split('/').length - 1];
		let fileNames: string[] = [fileName];
		delObjByFileNames(fileNames);
	}
};

const handlePreview = (file: any) => {
	other.downBlobFile(file.url, {}, file.name);
};

/**
 * 将对象数组转为字符串，以逗号分隔。
 * @param list 待转换的对象数组。
 * @param separator 分隔符，默认为逗号。
 * @returns {string} 返回转换后的字符串。
 */
const listToString = (list: { url: string }[], separator = ','): string => {
	let strs = '';
	separator = separator || ',';
	for (let i in list) {
		if (list[i].url) {
			strs += list[i].url + separator;
		}
	}
	return strs !== '' ? strs.substr(0, strs.length - 1) : '';
};

const handleUploadError = (error: any) => {
	useMessage().error(error.msg ? error.msg : '上传文件失败');
	emit('update:dataFromUpload', false);
};

const handleExceed = (files: any, fileList: any) => {
	useMessageBox().wraning('仅限上传1个压缩包,请删除已上传文件，重新上传');
};

interface FileItem {
	name: string;
	url: string;
	uid?: number | string;
}

/**
 * 监听 props 中的 modelValue 值变化，更新 fileList。
 */
watch(
	() => props.modelValue,
	(val) => {
		if (val) {
			let temp = 1;
			// 首先将值转为数组
			const list = Array.isArray(val) ? (val as (string | FileItem)[]) : (props.modelValue as string).split(',');
			// 然后将数组转为对象数组
			fileList.value = list.map((item) => {
				if (typeof item === 'string') {
					item = { name: item, url: item };
				}
				item.uid = item.uid || new Date().getTime() + temp++;
				return item;
			});
		} else {
			fileList.value = [];
			return [];
		}
	},
	{ deep: true, immediate: true }
);

const submit = () => {
	fileUpload.value.submit();
};

const delayedFileUploadSubmit = () => {
	delayedFileUploadRef.value!.submit();
};

// 处理文件选择
const handleFileChange = (uploadFile: any) => {
	file.value = uploadFile.raw;
};

const calculateMD5 = (file: File) => {
	return new Promise((resolve) => {
		const reader = new FileReader();
		const spark = new SparkMD5.ArrayBuffer(); // 二进制模式

		reader.onload = (e: any) => {
			spark.append(e.target.result); // 添加文件数据
			resolve(spark.end()); // 返回 MD5
		};
		reader.readAsArrayBuffer(file); // 读取为二进制
	});
};

// 计算文件MD5（用于唯一标识）
const calculateFileMd5 = async (file: File) => {
	return new Promise((resolve) => {
		const spark = new SparkMD5.ArrayBuffer();
		const reader = new FileReader();
		const chunkSize = CHUNK_SIZE;
		const chunks = Math.ceil(file.size / chunkSize);
		let currentChunk = 0;

		reader.onload = (e: any) => {
			spark.append(e.target.result);
			currentChunk++;
			if (currentChunk < chunks) {
				loadNext();
			} else {
				resolve(spark.end());
			}
		};

		const loadNext = () => {
			const start = currentChunk * chunkSize;
			const end = Math.min(start + chunkSize, file.size);
			reader.readAsArrayBuffer(file.slice(start, end));
		};

		loadNext();
	});
};

// 开始上传
const startUpload = async () => {
	if (!file.value) return;

	// 计算文件MD5和分片数
	fileMd5.value = await calculateFileMd5(file.value) as string;
	totalChunks.value = Math.ceil(file.value.size / CHUNK_SIZE);
	uploadedChunks.value = 0;
	progressVisible.value = true;

	// 上传所有分片
	for (let chunkIndex = 0; chunkIndex < totalChunks.value; chunkIndex++) {
		await uploadChunk(chunkIndex);
	}

	// 合并请求
	await mergeChunks();
};

// 上传单个分片
const uploadChunk = async (chunkIndex: any) => {
	const start = chunkIndex * CHUNK_SIZE;
	const end = Math.min(start + CHUNK_SIZE, file.value.size);
	const chunk = file.value.slice(start, end);

	const formData = new FormData();
	formData.append('file', chunk);
	formData.append('chunkIndex', chunkIndex);
	formData.append('totalChunks', totalChunks.value);
	formData.append('fileMd5', fileMd5.value);
	formData.append('fileName', file.value.name);
	formData.append('bucketName', uploadParams.bucketName);

	try {
		await uploadChunkFile(formData);
		uploadedChunks.value++;
		uploadProgress.value = Math.round((uploadedChunks.value / totalChunks.value) * 100);
	} catch (error) {
		console.error('分片上传失败:', error);
	}
};

// 合并分片请求
const mergeChunks = async () => {
	try {
		await uploadMergeFile({
			params: paramsToString(uploadParams),
			...uploadParams,
			bucketName: uploadParams.bucketName,
			fileMd5: fileMd5.value,
			fileName: file.value.name,
			totalChunks: totalChunks.value
		});
		useMessage().success('文件上传成功！');
		uploadProgress.value = 0; // 重置进度
		isLoading.value = false;
	} catch (error) {
		console.error('合并失败:', error);
	}
};

// 获取预览图URL
const getPreviewUrl = (file: any) => {
	// console.log('file', file);
	if (file.url) return file.url;
	if (file.raw) return URL.createObjectURL(file.raw);
	return '';
};

// 判断是否为图片
const isImage = (file: any) => {
	const ext = file.name.split('.').pop().toLowerCase();
	return ['png', 'bmp', 'jpg', 'jpeg'].includes(ext);
};

// 截断文件名
const truncateFileName = (name: string, maxLength: number) => {
	if (name.length <= maxLength) return name;
	return name.substring(0, maxLength / 2) + '...' + name.substring(name.length - maxLength / 2);
};

// 文件移除处理
const handleRemoveFile = async (file: any) => {
	// 释放预览URL
	if (file.url && file.url.startsWith('blob:')) {
		URL.revokeObjectURL(file.url);
	}

	// 从文件列表中移除
	fileList.value = fileList.value.filter(f => f.uid !== file.uid);

	//todo在sys-file表删除文件
	await delObj([file.fileId])
};

const previewImageUrl = ref('');
const previewVisible = ref(false);
// 处理文件预览
const handlePreviewImage = (file: any) => {
	if (isImage(file)) {
		previewImageUrl.value = getPreviewUrl(file);
		previewVisible.value = true;
	} else {
		// 非图片文件的处理...
	}
};

watchEffect(() => {
	if (fileList.value.length > 0) {
		isUploaded.value = true;
	} else {
		isUploaded.value = false;
	}
});


defineExpose({
	submit,
	delayedFileUploadSubmit,
	getFileDir,
	resetData,
});

const zipFileTree = ref([
	[
		{
			id: 1,
			label: '压缩包名',
			children: [
				{
					id: 2,
					label: 'annotations',
					children: [
						{
							id: 4,
							label: 'train.json(可展开查看)',
							children: [
								{
									id: 8,
									label: "'metainfo': ",
									children: [
										{
											id: 10,
											label: "'image_classes': {}",
										},
										{
											id: 11,
											label: "'dataset_type': {}",
										},
										{
											id: 12,
											label: "'task_type': {}",
										},
										{
											id: 13,
											label: "'classes_indices': {}",
										},
									],
								},
								{
									id: 9,
									label: "'data_list': ",
									children: [
										{
											id: 14,
											label: "'img_path': '/0_1_Warp_aligner/e.bmp'(images目录为根目录)",
										},
										{
											id: 15,
											label: "'img_label': 'xxx'",
										},
									],
								},
							],
						},
					],
				},
				{
					id: 3,
					label: 'images',
					children: [
						{
							id: 5,
							label: 'xxx/xxx_0.jpg',
						},
						{
							id: 6,
							label: 'xxx/xxx_1.jpg',
						},
						{
							id: 7,
							label: '...',
						},
					],
				},
			],
		},
	],
	[
		{
			id: 1,
			label: '压缩包名',
			children: [
				{
					id: 2,
					label: 'annotations',
					children: [
						{
							id: 4,
							label: 'train.json(可展开查看)',
							children: [
								{
									id: 8,
									label: "'metainfo': ",
									children: [
										{
											id: 10,
											label: "'object classes': ['classA', 'classB', ...]",
										},
										{
											id: 11,
											label: "'dataset_type': 'train'",
										},
										{
											id: 12,
											label: "'task_type': 'detection'",
										},
										{
											id: 13,
											label: "'classes_indices': {'classA': 0, 'classB': 1},",
										},
										{
											id: 14,
											label: "'license': {'name': str, 'url': str}",
										},
									],
								},
								{
									id: 9,
									label: "'data_list': ",
									children: [
										{
											id: 15,
											label: "'img_path': '/0_1_Warp_aligner/e.bmp'(images目录为根目录)",
										},
										{
											id: 16,
											label: "'height': xxx",
										},
										{
											id: 17,
											label: "'width': xxx",
										},
										{
											id: 18,
											label: "'channel': 3",
										},
										{
											id: 19,
											label: "'iscrowd': 0 or 1(是否为单个对象)",
										},
										{
											id: 20,
											label:
												"'instances': [{'bbox': {'xmin':0, 'ymin':0, 'xmax':30, 'ymax':50,}, 'bbox_label': 1, 'truncated': 0 or 1(是否遮挡), 'area': 20 }, ···]",
										},
									],
								},
							],
						},
					],
				},
				{
					id: 3,
					label: 'images',
					children: [
						{
							id: 5,
							label: 'xxx/xxx_0.jpg',
						},
						{
							id: 6,
							label: 'xxx/xxx_1.jpg',
						},
						{
							id: 7,
							label: '...',
						},
					],
				},
			],
		},
	],
	[
		{
			id: 1,
			label: '压缩包名',
			children: [
				{
					id: 2,
					label: 'annotations',
					children: [
						{
							id: 4,
							label: 'train.json(可展开查看)',
							children: [
								{
									id: 8,
									label: "'metainfo': ",
									children: [
										{
											id: 10,
											label: "'base_data_root': 'D:/Data'",
										},
										{
											id: 11,
											label: "'dataset_name': 'xxx'",
										},
										{
											id: 12,
											label: "'dataset_type': 'train'",
										},
										{
											id: 13,
											label: "'classes': ['0']",
										},
										{
											id: 14,
											label: "'classes indices': {'0': 0}",
										},
									],
								},
								{
									id: 9,
									label: "'data_list': ",
									children: [
										{
											id: 15,
											label: "'img_path': '/0_1_Warp_aligner/e.bmp'(images目录为根目录)",
										},
										{
											id: 16,
											label: "'height': xxx",
										},
										{
											id: 17,
											label: "'width': xxx",
										},
										{
											id: 18,
											label: "'objects': 3",
										},
										{
											id: 19,
											label: "'instances': [{'bbox': {'xmin':0, 'ymin':0, 'xmax':30, 'ymax':50,}, 'bbox_label': 1, 'area': 20, 'iscorowd': 0 }, ···]",
										},
									],
								},
							],
						},
					],
				},
				{
					id: 3,
					label: 'images',
					children: [
						{
							id: 5,
							label: 'xxx/xxx_0.jpg',
						},
						{
							id: 6,
							label: 'xxx/xxx_1.jpg',
						},
						{
							id: 7,
							label: '...',
						},
					],
				},
			],
		},
	],
]);
</script>
<style scoped>
/* 移除所有边框 */
.upload-area :deep(.el-upload-list__item) {
	border: none !important;
	/* background: none !important; */
	/* box-shadow: none !important; */
	width: 25%;
	height: 50%;
	padding: 0 !important;
	margin: 0 !important;
	/* justify-items: center; */
	display: flex;
	justify-content: center;
}

.upload-area :deep(.el-upload-dragger) {
	/* border: none !important; */
	padding: 5px !important;
}

.upload-area :deep(.el-upload-list) {
	display: flex;
	flex-wrap: wrap;
	gap: 0 !important;
	/* 移除所有间隙 */
	margin: 0 !important;
	padding: 0 !important;
}

.upload-area :deep(.el-upload-list--picture-card .el-upload-list__item) {
	margin: 0 !important;
	/* 移除外边距 */
	padding: 0 !important;
	/* 移除内边距 */
}

.upload-area :deep(.el-upload-dragger) {
	/* padding: 10px 10px !important; */
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
}

.upload-area :deep(.el-upload--picture-card) {
	width: 100%;
	height: 14vh;
	background: #fff;
	display: flex;
	border: none !important;
	justify-content: center;
}

/* 上传后：宽度 10vw */
.upload-area.has-image :deep(.el-upload--picture-card) {
	width: 6.3vw;
	display: flex;
	margin-top: 10px;
}

.upload-area.has-image :deep(.el-upload-dragger) {
	padding: 10px 10px !important;
	/* margin-top: 10px; */
}

.custom-file-item {
	/* border: #2e5cf6 1px solid; */
	position: flex;
	width: 100%;
	flex-direction: column;
	align-items: center;
	/* text-align: center; */
	justify-content: space-between;
	padding: 0;
	/* 移除内边距 */
	box-sizing: border-box;
	border: none !important;
	/* 确保无边框 */
}

.file-item {
	display: flex;
	align-items: center;
	padding: 5px 5px;
	/* border: 1px dashed #cacbcf; */
	border-radius: 4px;
	/* margin-bottom: 5px; */
	/* background: #fff; */
	transition: all 0.3s;
}

/* 预览容器 - 确保无边框 */
.preview-container {
	width: 100%;
	height: 100%;

	/* height: 100px; */
	display: flex;
	align-items: center;
	justify-content: center;
	/* overflow: hidden; */
	background: none;
	/* border: none !important; */
	/* 移除边框 */
}

.file-preview {
	max-width: 100%;
	max-height: 100%;
	object-fit: contain;
	border: none !important;
	/* 确保图片无边框 */
}

.file-icon {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f5f7fa;
	border-radius: 4px;
	border: none !important;
	/* 移除边框 */
}

.file-icon .el-icon {
	font-size: 36px;
	color: #909399;
}

/* 文件名样式 */
.file-name {
	width: 100%;
	height: 35px;
	text-align: center;
	font-size: 12px;
	/* color: #606266; */
	margin-bottom: 8px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	padding: 0 5px;
}

/* 操作按钮 */
.file-actions {
	position: absolute;
	top: 8px;
	right: 4px;
	display: flex;
	opacity: 0;
	transition: opacity 0.3s;
}

.custom-file-item:hover .file-actions {
	opacity: 1;
}

.delete-icon,
.preview-icon {
	background: rgba(0, 0, 0, 0.5);
	color: white;
	border-radius: 50%;
	padding: 6px;
	margin: 0 3px;
	cursor: pointer;
	font-size: 14px;
}

.delete-icon:hover {
	background: #f56c6c;
}

.preview-icon:hover {
	background: #2e5cf6;
}

/* 底部统计信息 */
.stats-container {
	display: flex;
	justify-content: space-between;
	margin-top: 20px;
	padding: 10px;
	background: #f5f7fa;
	border-radius: 4px;
}

.stat-item {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.stat-label {
	font-size: 12px;
	color: #909399;
}

.stat-value {
	font-size: 16px;
	font-weight: bold;
	color: #303133;
}
</style>
