<template>
  <!-- 虚拟触发元素（用于精准定位） -->
  <!-- 虚拟触发元素（关键更新） -->
  <span ref="triggerRef" class="virtual-trigger" :style="triggerStyle"></span>

  <!-- 步骤引导弹窗 -->
  <el-popover v-model:visible="popoverVisible" placement="bottom-start" title="数据离线本地指南" :width="580" trigger="manual"
    popper-class="step-popover" :virtual-ref="triggerRef" virtual-triggering :teleported="false">
    <!-- 折叠面板容器 -->
    <el-collapse v-model="activeStep" accordion>
      <!-- 第一步：准备数据 -->
      <el-collapse-item name="1">
        <template #title>
          <div class="step-header">
            <el-icon :class="['step-icon', { active: activeStep === '1' }]">
              <CircleCheckFilled v-if="activeStep === '1'" />
              <RemoveFilled v-else />
            </el-icon>
            <span class="step-title">第一步：配置本地路径并导出Nginx</span>
          </div>
        </template>
        <div class="step-content">
          <p>1. 点击
            <span class="iconfont function-icon"><el-icon>
                <FolderAdd />
              </el-icon>{{ t("common.addBtn") }}</span>，新增本地路径离线配置
          </p>
          <p>2. 点击指定本地路径下的
            <span class="iconfont function-icon">
              <el-icon>
                <Download />
              </el-icon>下载Nginx
            </span>
          </p>
          <p class="tip-text">解压后得到包含nginx服务的文件夹</p>
        </div>
      </el-collapse-item>

      <!-- 第二步：导出数据 -->
      <el-collapse-item name="2">
        <template #title>
          <div class="step-header">
            <el-icon :class="['step-icon', { active: activeStep === '2' }]">
              <CircleCheckFilled v-if="activeStep === '2'" />
              <RemoveFilled v-else />
            </el-icon>
            <span class="step-title">第二步：导出数据</span>
          </div>
        </template>
        <div class="step-content">
          <p>1. 在
            <span class="iconfont icon-dataset function-icon">数据中心 -></span>
            <span class="iconfont icon-shujuji function-icon">数据管理 -> </span>
            <span class="iconfont function-icon icon-project_management">数据集总览</span> 页面：点击
            <span class="iconfont function-icon">{{ t('home.moreTip') }}<el-icon>
                <ArrowDown></ArrowDown>
              </el-icon> -> {{ t('manage.exportImage') }}</span> 按钮导出数据集压缩包
          </p>
          <p>2. 将压缩包解压并保存到已配置的本地路径（如：<code>D:/datasets/</code>）</p>
          <el-tag type="info">推荐使用SSD硬盘加快读取速度</el-tag>
        </div>
      </el-collapse-item>

      <!-- 第三步：启动服务 -->
      <el-collapse-item name="3">
        <template #title>
          <div class="step-header">
            <el-icon :class="['step-icon', { active: activeStep === '3' }]">
              <CircleCheckFilled v-if="activeStep === '3'" />
              <RemoveFilled v-else />
            </el-icon>
            <span class="step-title">第三步：启动文件服务</span>
          </div>
        </template>
        <div class="step-content">
          <p>进入解压后的nginx目录：</p>
          <div class="code-block">
            <pre>cd ./nginx</pre>
          </div>
          <p>选择以下任一方式启动：</p>
          <el-radio-group v-model="launchMethod">
            <el-radio value="exe">双击 nginx.exe</el-radio>
            <el-radio value="cli">命令行启动</el-radio>
          </el-radio-group>

          <!-- 命令行操作示例 -->
          <div v-if="launchMethod === 'cli'" class="code-block">
            <pre>start nginx # Windows系统</pre>
            <pre>nginx.exe # Windows系统</pre>
            <!-- <pre>./nginx # Linux/Mac系统</pre> -->
          </div>

          <!-- <el-alert :title="`状态：${nginxStatus}`" :type="nginxStatus === '运行中' ? 'success' : 'info'" class="mt-3" /> -->
        </div>
      </el-collapse-item>

      <!-- 第四步：切换数据源 -->
      <el-collapse-item name="4">
        <template #title>
          <div class="step-header">
            <el-icon :class="['step-icon', { active: activeStep === '4' }]">
              <CircleCheckFilled v-if="activeStep === '4'" />
              <RemoveFilled v-else />
            </el-icon>
            <span class="step-title">第四步：切换数据源</span>
          </div>
        </template>
        <div class="step-content">
          <p>在 <span class="iconfont icon-zaixianbiaozhu function-icon">在线标注</span>
            页面：点击右上角
            <span class="iconfont icon-celvewenjian-lixian function-icon">切换文件源（本地）</span>
            按钮
          </p>
          <p class="tip-text">切换后系统将自动加载本地离线数据集</p>
        </div>
      </el-collapse-item>
    </el-collapse>

    <!-- 操作按钮组 -->
    <div class="action-buttons">
      <el-button v-show="activeStep !== '1'" @click="prevStep">
        上一步
      </el-button>
      <el-button type="primary" @click="nextStep" :icon="activeStep === '4' ? CircleCheckFilled : undefined">
        {{ activeStep === '4' ? '完成' : '下一步' }}
      </el-button>
    </div>
    <template #reference>
      <span ref="triggerRef" class="virtual-trigger"></span>
    </template>
  </el-popover>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { 
  RemoveFilled, 
  CircleCheckFilled,
  Download,
  Switch,
  ArrowDown,
  FolderAdd
} from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
// Popover显示状态
const popoverVisible = ref(false);
// 当前激活步骤
const activeStep = ref('1');
// 虚拟触发元素引用
const triggerRef = ref(null);
// Nginx启动方式
const launchMethod = ref('exe');
// Nginx状态
const nginxStatus = ref('未启动');
const triggerStyle = ref({
  position: 'fixed',
  left: '-10000px', // 初始隐藏位置
  top: '-10000px',
  width: '1px',
  height: '1px'
});

// 目标元素的位置跟踪
let targetPosition = null;

// 暴露打开方法供父组件调用
defineExpose({
  open: (targetEl) => {
    if (!targetEl) return;
    
    // 记录目标元素位置
    const rect = targetEl.getBoundingClientRect();
    targetPosition = {
      left: rect.left,
      top: rect.top,
      bottom: rect.bottom,
      width: rect.width
    };
    
    // 确保虚拟触发元素已存在
    if (triggerRef.value) {
      setTriggerPosition();
    }
    
    popoverVisible.value = true;
    activeStep.value = '1';
  }
});

// 设置虚拟触发元素位置
const setTriggerPosition = () => {
  if (!targetPosition) return;
  
  // 右下偏移量 (根据用户要求)
  const offsetX = 0;
  const offsetY = 0;
  
  // 应用新位置
  triggerStyle.value = {
    position: 'fixed',
    left: `${targetPosition.left + offsetX}px`,
    top: `${targetPosition.bottom + offsetY}px`,
    width: `${targetPosition.width}px`,
    height: '1px',
    zIndex: -1
  };
  
  // 强制DOM更新 (解决ElementPlus首次定位问题)
  requestAnimationFrame(() => {
    const popover = document.querySelector('.step-popover');
    if (popover) {
      popover.style.visibility = 'hidden';
      requestAnimationFrame(() => {
        popover.style.visibility = 'visible';
      });
    }
  });
};


// 下一步
const nextStep = () => {
  const steps = ['1', '2', '3', '4'];
  const currentIndex = steps.indexOf(activeStep.value);
  
  if (currentIndex < steps.length - 1) {
    activeStep.value = steps[currentIndex + 1];
  } else {
    popoverVisible.value = false; // 完成时关闭
  }
};

// 上一步
const prevStep = () => {
  const steps = ['1', '2', '3', '4'];
  const currentIndex = steps.indexOf(activeStep.value);
  if (currentIndex > 0) {
    activeStep.value = steps[currentIndex - 1];
  }
};

// 确保在虚拟触发元素创建后更新位置
watch(triggerRef, (newRef) => {
  if (newRef && targetPosition) {
    setTriggerPosition();
  }
});

// 添加窗口事件监听
onMounted(() => {
  window.addEventListener('scroll', handlePositionUpdate);
  window.addEventListener('resize', handlePositionUpdate);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handlePositionUpdate);
  window.removeEventListener('resize', handlePositionUpdate);
});

// 当窗口滚动或调整大小时更新位置
const handlePositionUpdate = () => {
  if (popoverVisible.value && targetPosition) {
    setTriggerPosition();
  }
};
</script>

<style scoped>
.virtual-trigger {
  /* 关键样式 - 确保元素位置正确计算 */
  display: block !important;
  pointer-events: none;
}

/* 步骤头部样式 */
.step-header {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 8px;
}

.step-icon {
  margin-right: 12px;
  color: #c0c4cc;
  /* 默认灰色 */
  transition: color 0.3s;
}

.step-icon.active {
  color: #2e5cf6;
  /* 激活状态蓝色 */
}

.step-title {
  font-weight: bold;
  font-size: 15px;
}

/* 步骤内容样式 */
.step-content {
  padding: 12px 0 12px 36px;
  color: #606266;
  line-height: 2;
}

.tip-text {
  color: #999;
  font-size: 13px;
  margin-top: 8px;
}

.code-block {
  background: #f8f8f8;
  border-left: 3px solid #2e5cf6;
  padding: 10px 15px;
  margin: 12px 0;
  border-radius: 0 4px 4px 0;
  font-family: Consolas, Monaco, monospace;
}

.code-block pre {
  margin: 5px 0;
  line-height: 1.4;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

/* 虚拟触发元素 */
.virtual-trigger {
  /* position: absolute; */
  /* width: 1px;
  height: 1px; */
  z-index: -1;
}
</style>

<!-- 全局样式（穿透Popover） -->
<style>
.step-popover .el-popover__title {
  font-size: 17px;
  font-weight: bold;
  padding-bottom: 12px;
  padding-top: 12px;
  border-bottom: 1px solid #eee;
}

.step-popover .el-collapse-item__header {
  height: 50px !important;
  padding: 0 15px;
  font-size: 14px;
}

.step-popover .el-collapse-item__content {
  padding-bottom: 20px;
}

/* 隐藏默认折叠箭头 */
.step-popover .el-collapse-item__arrow {
  display: none;
}

.function-icon {
  color: #2e5cf6;
  font-size: small !important;
}
</style>