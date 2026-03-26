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
        <el-button @click="toggleDownload" :disabled="isCancelling || downloadProgress === 100">
          <el-icon v-if="!isDownloadPaused">
            <VideoPause />
          </el-icon>
          <el-icon v-else>
            <VideoPlay />
          </el-icon>
          {{ isDownloadPaused ? t('common.resumeDownload') : t('common.pauseDownload') }}
        </el-button>
        <el-button @click="cancelDownload" :disabled="isCancelling || downloadProgress === 100">
          {{ isCancelling ? t('common.cancelling') : t('common.cancelDownload') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" name="download" setup>
import { ref, computed, onUnmounted } from 'vue';
import axios, { AxiosProgressEvent, CancelTokenSource } from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { VideoPause, VideoPlay } from '@element-plus/icons-vue';
import { Session } from '/@/utils/storage';
import { number } from 'echarts';
import { parse } from 'postcss';
import other from '/@/utils/other';

const { t } = useI18n();

// 响应式状态
const progressDialogVisible = ref(false);
const downloadProgress = ref(0);
const startTime = ref<number | null>(null);
const loadedBytes = ref(0);
const totalBytes = ref(0);
const errorMessage = ref('');
const title = ref('');
const fileName = ref('');
const bucketName = ref('');
const downloadParams = reactive({
  fileName: '',
  exportType: '',
  fileExt: '',
  bucketName: '',
  chunkSize: 50 * 1024 * 1024,
  chunkTotal: 0,
  chunkIndex: 1
})
const isCancelling = ref(false);
const lastLoadedBytes = ref(0);
const lastTime = ref<number | null>(null);
const speedSamples = ref<number[]>([]);
const blobList = ref<Blob[]>([]);
const chunkList = ref<number[]>([]);
const isDownloadPaused = ref(false);
const currentChunkIndex = ref(1);
const cancelTokenSources = ref<CancelTokenSource[]>([]);
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB分片

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

const currentUrl = ref('');
// 开始下载
const startDownload = async (url: string, params: any, type: string) => {
  title.value = t('common.fileDownload');
  try {
    resetDownloadState();
    progressDialogVisible.value = true;
    startTime.value = Date.now();
    lastTime.value = Date.now();

    totalBytes.value = params.size * 1024 * 1024;
    loadedBytes.value = 0;
    downloadParams.fileName = params.fileName;
    downloadParams.bucketName = params.bucketName;
    currentUrl.value = url;

    let generatedFileName = '';
    if (type === 'dataset') {
      generatedFileName = params.baseDatasetName;
      downloadParams.exportType = 'baseDataset';
      downloadParams.fileExt = '.zip';
      downloadParams.fileName = `${generatedFileName}.zip`;
    }

    if (type === 'offline') {
      generatedFileName = 'Nginx-' + other.generateTimeReqestNumber();
      downloadParams.fileName = `${generatedFileName}.zip`;
    }

    // 开始下载第一个分片
    downloadChunk(url, currentChunkIndex.value);
  } catch (error) {
    handleDownloadError(error);
  }
};

// 下载文件分片
const downloadChunk = (url: string, index: number) => {
  if (isDownloadPaused.value || isCancelling.value) return;
  const chunkTotal = Math.ceil(totalBytes.value / CHUNK_SIZE);

  if (index > chunkTotal) {
    mergeAndDownloadFile();
    return;
  }

  // 检查是否已下载过该分片
  const isChunkDownloaded = chunkList.value.includes(index);
  if (isChunkDownloaded) {
    // 已下载分片，跳过并继续下一个
    currentChunkIndex.value = index + 1;
    downloadChunk(url, currentChunkIndex.value);
    return;
  }

  // 计算当前分片实际大小（最后一片可能不完整）
  let currentChunkSize = CHUNK_SIZE;
  if (index * CHUNK_SIZE >= totalBytes.value) {
    currentChunkSize = totalBytes.value - (index - 1) * CHUNK_SIZE;
  }

  // 记录开始时间用于计算下载速度
  const startChunkTime = Date.now();

  // 创建取消令牌
  const cancelTokenSource = axios.CancelToken.source();
  cancelTokenSources.value.push(cancelTokenSource);

  downloadParams.chunkIndex = index;
  downloadParams.chunkSize = currentChunkSize;
  downloadParams.chunkTotal = chunkTotal;

  axios({
    url: url,
    method: 'get',
    params: downloadParams,
    headers: {
      'Authorization': 'Bearer ' + Session.getToken(),
    },
    responseType: 'blob',
    cancelToken: cancelTokenSource.token,
    onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
      // 更新全局进度
      const totalLoaded = (index - 1) * CHUNK_SIZE + progressEvent.loaded;
      updateProgress({
        loaded: totalLoaded,
        total: totalBytes.value
      } as AxiosProgressEvent);

      // 计算当前分片下载速度
      const now = Date.now();
      if (lastTime.value) {
        const timeDiff = (now - lastTime.value) / 1000; // 秒
        if (timeDiff > 0.1) {
          const bytesDiff = totalLoaded - lastLoadedBytes.value;
          const currentSpeed = bytesDiff / timeDiff;
          speedSamples.value.push(currentSpeed);
          lastLoadedBytes.value = totalLoaded;
          lastTime.value = now;
        }
      }
    }
  }).then((res) => {
    // 记录下载完成时间
    const endTime = Date.now();
    const timeDiff = (endTime - startChunkTime) / 1000; // 秒

    // 更新下载状态
    chunkList.value.push(index);
    loadedBytes.value += res.data.size;

    // 存储分片数据
    blobList.value.push(res.data);

    // 继续下载下一分片
    currentChunkIndex.value = index + 1;
    downloadChunk(url, currentChunkIndex.value);
  }).catch((error) => {
    if (!axios.isCancel(error)) {
      console.error("分片下载失败:", error);
      handleDownloadError(error);
    }
  });
};

// 合并并下载完整文件
const mergeAndDownloadFile = () => {
  const blob = new Blob(blobList.value, { type: "application/octet-stream" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName.value;
  a.style.display = "none";

  document.body.appendChild(a);
  a.click();

  // 清理资源
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    // 下载完成后关闭弹窗（有延迟让用户看到100%进度）
    setTimeout(() => {
      progressDialogVisible.value = false;
    }, 1500);
  }, 100);
};

// 更新进度
const updateProgress = (progressEvent: AxiosProgressEvent) => {
  if (progressEvent.total) {
    totalBytes.value = progressEvent.total;
    loadedBytes.value = progressEvent.loaded;
    downloadProgress.value = Math.round((progressEvent.loaded / progressEvent.total) * 100);
  }
};

// 暂停/继续下载
const toggleDownload = () => {
  isDownloadPaused.value = !isDownloadPaused.value;
  if (!isDownloadPaused.value) {
    // 继续下载
    downloadChunk(currentUrl.value, currentChunkIndex.value);
  } else {
    // 暂停所有下载请求
    cancelTokenSources.value.forEach(source => {
      source.cancel('用户暂停下载');
    });
    cancelTokenSources.value = [];
  }
};

// 取消下载
const cancelDownload = async () => {
  if (cancelTokenSources.value.length === 0) return;

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

    // 取消所有下载请求
    cancelTokenSources.value.forEach(source => {
      source.cancel('用户取消下载');
    });
    cancelTokenSources.value = [];

    // 延迟关闭弹窗
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
      // 取消所有下载请求
      cancelTokenSources.value.forEach(source => {
        source.cancel('用户关闭弹窗');
      });
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
      case 416: // 请求范围不符合要求
        errorMessage.value = t('errors.rangeNotSatisfiable');
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
  isCancelling.value = false;
  lastLoadedBytes.value = 0;
  lastTime.value = null;
  speedSamples.value = [];
  blobList.value = [];
  chunkList.value = [];
  isDownloadPaused.value = false;
  currentChunkIndex.value = 1;
  cancelTokenSources.value = [];
};

// 组件卸载时取消下载
onUnmounted(() => {
  // 取消所有下载请求
  cancelTokenSources.value.forEach(source => {
    source.cancel('组件卸载');
  });
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