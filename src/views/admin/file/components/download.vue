<template>
  <div class="download">
    <!-- 进度弹窗 -->
    <el-dialog :title="title" v-model="progressDialogVisible" width="30%" :close-on-click-modal="false"
      :show-close="false" :before-close="handleBeforeClose">
      <div class="progress-container">
        <!-- 文件名显示区域 -->
        <div class="file-name-display" v-if="fileName">
          <span>{{ fileName }}</span>
        </div>

        <el-progress :percentage="downloadProgress" :status="progressStatus" :stroke-width="14" text-inside />

        <div v-if="downloadProgress === 0" class="loading-container">
          <div class="spinner-container">
            <div class="spinner"></div>
          </div>
          <p style="color: goldenrod;">{{ t('common.fileLoadingText') }}</p>
        </div>

        <div v-else class="progress-info">
          <div class="size-info">
            <span>{{ formattedProgress }}</span>
          </div>
          <div class="speed-info">
            <span class="speed" v-if="downloadSpeed">{{ downloadSpeed }}</span>
            <span class="estimated-time" v-if="estimatedTime">
              - {{ t('common.estimatedTime') }}: {{ estimatedTime }}{{ t('common.seccond') }}
            </span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="cancelDownload" :disabled="isCancelling || downloadProgress === 100">
          {{ isCancelling ? t('common.cancelling') : t('common.cancelDownload') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" name="download" setup>
import { ref, computed, onUnmounted } from 'vue';
import axios, { AxiosProgressEvent } from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useI18n } from 'vue-i18n';
import other from '/@/utils/other';
import { Session } from '/@/utils/storage';
const { t } = useI18n();

/**
 * 下载组件
 */
// 响应式状态
const progressDialogVisible = ref(false);
const downloadProgress = ref(0);
const startTime = ref<number | null>(null);
const loadedBytes = ref(0);
const totalBytes = ref(0);
const errorMessage = ref('');
const title = ref('');
const fileName = ref('');
const abortController = ref<AbortController | null>(null);
const isCancelling = ref(false);
const lastLoadedBytes = ref(0); // 用于计算瞬时速度
const lastTime = ref<number | null>(null); // 上次计算时间
const speedSamples = ref<number[]>([]); // 速度采样数组

// 计算属性
const formattedProgress = computed(() => {
  return `${formatBytes(loadedBytes.value)}/${formatBytes(totalBytes.value)}`;
});

const progressStatus = computed(() => {
  if (errorMessage.value) return 'exception';
  if (isCancelling.value) return 'warning';
  return downloadProgress.value === 100 ? 'success' : '';
});

const estimatedTime = computed(() => {
  if (!startTime.value || downloadProgress.value === 0 || downloadProgress.value === 100) return null;

  // 使用平滑后的下载速度计算
  const currentSpeed = calculateSmoothedSpeed();
  if (currentSpeed <= 0) return null;

  const remainingBytes = totalBytes.value - loadedBytes.value;
  const remainingSeconds = Math.ceil(remainingBytes / currentSpeed);

  return remainingSeconds;
});

const downloadSpeed = computed(() => {
  const currentSpeed = calculateSmoothedSpeed();
  if (currentSpeed <= 0) return null;

  return `${formatBytes(currentSpeed)}/s`;
});

// 格式化字节显示
const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// 计算平滑后的下载速度
const calculateSmoothedSpeed = (): number => {
  // 保留最近的5个采样点
  if (speedSamples.value.length > 5) {
    speedSamples.value.shift();
  }

  // 计算平均速度
  if (speedSamples.value.length > 0) {
    const sum = speedSamples.value.reduce((acc, val) => acc + val, 0);
    return sum / speedSamples.value.length;
  }

  return 0;
};

// 开始下载
const startDownload = async (url: string, row: any, type: string) => {
  title.value = t('common.fileDownload');
  try {
    resetDownloadState();
    progressDialogVisible.value = true;
    startTime.value = Date.now();
    lastTime.value = Date.now();

    // 创建AbortController
    abortController.value = new AbortController();

    let params = {};
    let generatedFileName = other.generateTimeReqestNumber();

    if (type === 'dataset') {
      generatedFileName = row.baseDatasetName;
      params = { fileName: generatedFileName, exportType: 'baseDataset', fileExt: '.zip' };
      fileName.value = `${generatedFileName}.zip`;
    }

    if (type === 'offline') {
      generatedFileName = 'Nginx-' + other.generateTimeReqestNumber();
      params = { ...row, fileExt: '.zip', fileName: generatedFileName };
      fileName.value = `${generatedFileName}.zip`;
    }

    // 发起下载请求
    const response = await axios.get(url, {
      headers: {
        'Authorization': 'Bearer ' + Session.getToken(),
      },
      params,
      responseType: 'blob',
      signal: abortController.value.signal,
      onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
        updateProgress(progressEvent);
      }
    });

    // 创建下载链接
    createDownloadLink(response.data, fileName.value);

  } catch (error) {
    handleDownloadError(error);
  } finally {
    // 下载完成后关闭弹窗（有延迟让用户看到100%进度）
    if (downloadProgress.value === 100) {
      setTimeout(() => {
        progressDialogVisible.value = false;
      }, 1500);
    }
  }
};

// 更新进度
const updateProgress = (progressEvent: AxiosProgressEvent) => {
  if (progressEvent.total) {
    totalBytes.value = progressEvent.total;
    loadedBytes.value = progressEvent.loaded;
    downloadProgress.value = Math.round((progressEvent.loaded / progressEvent.total) * 100);

    // 计算瞬时速度
    const now = Date.now();
    if (lastTime.value) {
      const timeDiff = (now - lastTime.value) / 1000; // 秒
      if (timeDiff > 0.1) { // 至少0.1秒才更新速度
        const bytesDiff = progressEvent.loaded - lastLoadedBytes.value;
        const currentSpeed = bytesDiff / timeDiff;

        // 添加到采样数组
        speedSamples.value.push(currentSpeed);

        lastLoadedBytes.value = progressEvent.loaded;
        lastTime.value = now;
      }
    }
  }
};

// 创建下载链接
const createDownloadLink = (blobData: Blob, fileNameStr: string) => {
  const url = window.URL.createObjectURL(new Blob([blobData]));
  const link = document.createElement('a');

  link.href = url;
  link.setAttribute('download', fileNameStr);
  document.body.appendChild(link);
  link.click();

  // 清理资源
  setTimeout(() => {
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
  }, 100);
};

// 取消下载
const cancelDownload = async () => {
  if (!abortController.value) return;

  try {
    // 询问确认
    await ElMessageBox.confirm(
      t('common.confirmCancelDownload'),
      t('common.warmTip'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    );

    isCancelling.value = true;
    abortController.value.abort();

    // 延迟关闭弹窗，让用户看到取消状态
    setTimeout(() => {
      progressDialogVisible.value = false;
      isCancelling.value = false;
      ElMessage.info(t('common.downloadCancelled'));
    }, 800);

  } catch (cancelError) {
    // 用户点击了取消，不执行取消操作
    console.log('取消操作已中止');
  }
};

// 弹窗关闭前的处理
const handleBeforeClose = (done: () => void) => {
  if (downloadProgress.value < 100 && downloadProgress.value > 0) {
    ElMessageBox.confirm(
      t('common.confirmCloseDownload'),
      t('common.warning'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    ).then(() => {
      if (abortController.value) {
        abortController.value.abort();
      }
      done();
    }).catch(() => {
      // 取消关闭
    });
  } else {
    done();
  }
};

// 错误处理
const handleDownloadError = (error: any) => {
  if (axios.isCancel(error)) {
    console.log('下载已取消:', error.message);
    return;
  }

  console.error('下载失败:', error);

  if (error.response) {
    switch (error.response.status) {
      case 404:
        errorMessage.value = t('errors.fileNotFound');
        break;
      case 403:
        errorMessage.value = t('errors.noPermission');
        break;
      default:
        errorMessage.value = `${t('errors.serverError')}: ${error.response.status}`;
    }
  } else {
    errorMessage.value = t('errors.networkError');
  }

  ElMessage.error(errorMessage.value);
};

// 重置状态
const resetDownloadState = () => {
  downloadProgress.value = 0;
  loadedBytes.value = 0;
  totalBytes.value = 0;
  errorMessage.value = '';
  fileName.value = '';
  abortController.value = null;
  isCancelling.value = false;
  lastLoadedBytes.value = 0;
  lastTime.value = null;
  speedSamples.value = [];
};

// 组件卸载时取消下载
onUnmounted(() => {
  if (abortController.value) {
    abortController.value.abort();
  }
});

// 暴露变量
defineExpose({
  startDownload,
});
</script>
<style lang="scss" scoped>
.download {
  overflow: hidden;
  margin-bottom: 0;
  padding-bottom: 0;
}

.progress-container {
  position: relative;
  margin-top: -2vh;
  padding-bottom: 1vh;
}

.file-name-display {
  margin-bottom: 12px;
  font-size: 14px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 4px 0;
  border-bottom: 1px solid #eee;

  span {
    font-weight: normal;
    display: inline-block;
    max-width: 100%;
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 5px;
}

.spinner-container {
  position: relative;
  width: 100%;
  margin-bottom: 5px;
}

.spinner {
  width: 25px;
  height: 25px;
  margin: 0 auto;
  border: 3px solid rgba(218, 165, 32, 0.3);
  border-radius: 50%;
  border-top-color: goldenrod;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  align-items: center;
}

.size-info {
  font-size: 13px;
  color: #666;
}

.speed-info {
  font-size: 13px;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;

  .speed {
    color: #2e5cf6;
    margin-right: 8px;
    font-weight: bold;
  }

  .estimated-time {
    color: #666666;
  }
}

/* 取消状态下的进度条样式 */
:deep(.el-progress-bar__inner) {
  transition: all 0.3s ease;
}

:deep(.el-progress-bar__inner--warning) {
  background-color: #e6a23c;
}
</style>