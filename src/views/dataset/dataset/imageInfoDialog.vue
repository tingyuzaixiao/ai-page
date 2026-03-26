<template>
  <el-dialog v-model="visible" :title="t('dataset.imageDetail')" width="30%" class="!p-0 rounded-xl overflow-hidden"
    destroy-on-close>
    <template #header>
      <div class="font-bold pl-5 mt-3 text-xl">{{ t('dataset.imageDetail') }}</div>
    </template>
    <div class="text-base font-normal font-sans">
      <div class="flex mb-2">
        <span class="w-2/12 text-right">{{ t('dataset.imageOriginalFileName')
        }}</span>
        <span class="w-10/12 pl-6">{{ imageDetail.original }}</span>
      </div>
      <div class="flex leading-9 mb-2">
        <span class="w-2/12 text-right">{{ t('dataset.imageFileName')
        }}</span>
        <span class="w-10/12 pl-6">{{ imageDetail.fileName }}</span>
      </div>
      <div class="flex leading-9 mb-2">
        <span class="w-2/12 text-right">{{ t('dataset.imageSize')
        }}</span>
        <!-- {{ imageDetail.fileSize }} 除以1024 保存一位有效数字 -->
        <span class="w-10/12 pl-6">{{ (imageDetail.fileSize / 1024).toFixed(1) }} KB</span>
      </div>
      <div class="flex leading-9 mb-2">
        <span class="w-2/12 text-right">{{ t('dataset.resolution')
        }}</span>
        <!-- {{ imageDetail.resolution }} 除以1024 保存一位有效数字 -->
        <span class="w-10/12 pl-6">{{ (imageDetail.width ?? 0) + ' × ' + (imageDetail.height ?? 0) }}</span>
      </div>
      <div class="flex leading-9 mb-2">
        <span class="w-2/12 text-right">{{ t('dataset.imageBucketName')
        }}</span>
        <span class="w-10/12 pl-6">{{ imageDetail.bucketName }}</span>
      </div>
      <div class="flex leading-9 mb-2">
        <span class="w-2/12 text-right">{{ t('dataset.labelName')
        }}</span>
        <span class="w-10/12 pl-6">
          <!-- <el-text type="primary">{{
            labelInfo
              ? labelInfo
              : t('dataset.noLabel')
          }}</el-text> -->
          <el-text v-if="!labelInfo || labelInfo.length === 0" type="primary">
            {{ "无标签" }} </el-text>
          <el-text v-else v-for="(item, index) in labelInfo" :key="index" type="primary">
            {{ '[' }}{{ item || t('dataset.noLabel') }}{{ ']' }}{{ index < labelInfo.length - 1 ? ', ' : '' }}
              </el-text>
        </span>
      </div>
      <!-- <el-row :gutter="20" class="leading-9">
        <el-col :span="4"> <span class="w-full text-right">{{ t('dataset.createTime')
            }}</span></el-col>
        <el-col :span="20">{{ imageDetail.createTime }}</el-col>
      </el-row> -->
    </div>
  </el-dialog>
</template>

<script setup lang="ts" name="systemPostDialog">
import { useI18n } from 'vue-i18n';

// 定义子组件向父组件传值/事件
const { t } = useI18n();

// 定义变量内容
const visible = ref(false);
const loading = ref(false);
const labelFileNameIndex = ref(0);
const labelInfo = ref<string[]>([]);

interface LabelInfo {
  tagInfo?: string;
}


interface ImageDetail {
  original: string;
  fileName: string;
  fileSize: number;
  width: number,
  height: number,
  bucketName: string;
  labelList: LabelInfo[];
  tagInfoList: LabelInfo[];
}

const imageDetail = reactive<ImageDetail>({
  original: '',
  fileName: '',
  fileSize: 0,
  width: 0,
  height: 0,
  bucketName: '',
  labelList: [],
  tagInfoList: [],
})

// 打开弹窗
const openDialog = (id: Object, index?: any, labelMsg?: string) => {

  visible.value = true;

  labelInfo.value.length = 0;

  if (labelMsg) {
    labelInfo.value.push(labelMsg);
  }

  clearImageDetail();

  labelFileNameIndex.value = index;
  // 获取Post信息
  if (id) {
    getPostData(id);
  }
};

// 初始化表格数据
const getPostData = (id: object) => {
  // 获取部门数据
  Object.assign(imageDetail, id);

  imageDetail.tagInfoList?.forEach((item: LabelInfo) => {
    if (item.tagInfo) {
      labelInfo.value.push(item.tagInfo);
    }
  });
  console.log("imageDetail", imageDetail);

};

// 函数来清空imageDetail对象的数据
const clearImageDetail = () => {
  imageDetail.fileName = '';
  imageDetail.fileSize = 0;
  imageDetail.bucketName = '';
  // imageDetail.createTime = '';
};

// 暴露变量
defineExpose({
  openDialog,
});
</script>
<style lang="scss" scoped>
::v-deep(.el-dialog__header) {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  padding: 16px 24px;
  background-color: #f2f2f5 !important;
}
</style>