<template>
  <view class="scan-page">
    <!-- 扫码界面 -->
    <view v-if="!scanned" class="scanner-container">
      <!-- 扫码框 -->
      <view class="scan-box animate__animated animate__zoomIn">
        <view class="scan-frame">
          <view class="corner corner-tl"></view>
          <view class="corner corner-tr"></view>
          <view class="corner corner-bl"></view>
          <view class="corner corner-br"></view>
          <view class="scan-line" :class="{ 'scan-line--animating': scanning }"></view>
        </view>
      </view>

      <!-- 提示文字 -->
      <view class="scan-tips animate__animated animate__fadeInUp" style="animation-delay: 200ms;">
        <text class="tips-text">{{ scanTips }}</text>
      </view>

      <!-- 操作按钮 -->
      <view class="scan-actions animate__animated animate__fadeInUp" style="animation-delay: 300ms;">
        <view class="action-btn" @click="handleFlashlight">
          <Icon :name="flashlight ? 'zap-off' : 'zap'" size="large" color="#fff" />
          <text class="btn-text">{{ flashlight ? '关闭' : '开启' }}闪光灯</text>
        </view>
        <view class="action-btn" @click="handleAlbum">
          <Icon name="image" size="large" color="#fff" />
          <text class="btn-text">从相册选择</text>
        </view>
      </view>

      <!-- 开始扫码按钮 -->
      <view class="start-scan-btn animate__animated animate__bounceIn" style="animation-delay: 400ms;" @click="startScan">
        <text class="btn-text">开始扫码</text>
      </view>

      <!-- 返回按钮 -->
      <view class="back-btn animate__animated animate__fadeInLeft" @click="handleBack">
        <Icon name="x" size="large" color="#fff" />
      </view>
    </view>

    <!-- 扫码结果处理中 -->
    <view v-else class="result-container">
      <view class="result-box animate__animated animate__fadeIn">
        <view class="loading-icon">
          <Icon name="loader" size="xlarge" color="#6366f1" class="spin-icon" />
        </view>
        <text class="result-text">正在处理...</text>
      </view>
    </view>

    <!-- 自定义底部导航 -->
    <CustomTabBar :current="2" />
  </view>
</template>

<script>
import { ref} from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import Icon from '@/components/common/Icon.vue'
import CustomTabBar from "@/components/layout/CustomTabBar.vue"

export default {
  name: 'ScanPage',
  components: {
    Icon,
    CustomTabBar,
  },
  setup() {
    const scanning = ref(false)
    const scanned = ref(false)
    const flashlight = ref(false)
    const scanType = ref('') // unlock | general

    const scanTips = ref('将二维码放入框内，即可自动扫描')

    // 开始扫码
    const startScan = () => {
      scanning.value = true

      uni.scanCode({
        onlyFromCamera: true,
        scanType: ['qrCode', 'barCode'],
        success: (res) => {
          handleScanSuccess(res.result)
        },
        fail: (err) => {
          scanning.value = false
          uni.showToast({
            title: '扫码失败',
            icon: 'none'
          })
        },
        complete: () => {
          scanning.value = false
        }
      })
    }

    // 扫码成功处理
    const handleScanSuccess = (result) => {
      scanned.value = true

      try {
        // 解析二维码内容
        const data = JSON.parse(result)

        if (data.type === 'device' && data.deviceId) {
          // 设备开锁
          uni.navigateTo({
            url: `/pages/hotel/unlock?deviceId=${data.deviceId}&mode=scan`
          })
        } else {
          // 其他类型二维码
          uni.showToast({
            title: '无效的二维码',
            icon: 'none'
          })
        }
      } catch (error) {
        // 非JSON格式，显示原始内容
        uni.showModal({
          title: '扫码结果',
          content: result,
          showCancel: false
        })
      } finally {
        setTimeout(() => {
          scanned.value = false
        }, 1000)
      }
    }

    // 切换闪光灯
    const handleFlashlight = () => {
      flashlight.value = !flashlight.value
      // 注意：实际控制闪光灯需要在扫码过程中
      uni.showToast({
        title: flashlight.value ? '闪光灯已开启' : '闪光灯已关闭',
        icon: 'none'
      })
    }

    // 从相册选择
    const handleAlbum = () => {
      uni.chooseImage({
        count: 1,
        sourceType: ['album'],
        success: (res) => {
          // 注意：H5环境不支持从相册识别二维码
          uni.showToast({
            title: 'H5暂不支持相册识别',
            icon: 'none'
          })
        }
      })
    }

    // 返回
    const handleBack = () => {
      uni.switchTab({
        url: '/pages/index/index'
      })
    }

    // 页面加载
    onLoad((options) => {
      if (options.type) {
        scanType.value = options.type
        if (options.type === 'unlock') {
          scanTips.value = '扫描设备二维码进行开锁'
        }
      }
    })

    return {
      scanning,
      scanned,
      flashlight,
      scanTips,
      startScan,
      handleFlashlight,
      handleAlbum,
      handleBack
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.scan-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #000;
  overflow: hidden;
}

// 扫码容器
.scanner-container {
  position: relative;
  width: 100%;
  height: 100vh;
  @include flex-center();
  flex-direction: column;
  background: #000;
}

// 扫码框
.scan-box {
  position: relative;
  width: 500rpx;
  height: 500rpx;
  margin-bottom: 80rpx;
}

.scan-frame {
  position: relative;
  width: 100%;
  height: 100%;
  border: 4rpx solid rgba(255, 255, 255, 0.2);
  border-radius: 20rpx;
  overflow: hidden;

  // 四个角
  .corner {
    position: absolute;
    width: 60rpx;
    height: 60rpx;
    border-color: #6366f1;
    border-style: solid;

    &-tl {
      top: 0;
      left: 0;
      border-width: 6rpx 0 0 6rpx;
      border-radius: 20rpx 0 0 0;
    }

    &-tr {
      top: 0;
      right: 0;
      border-width: 6rpx 6rpx 0 0;
      border-radius: 0 20rpx 0 0;
    }

    &-bl {
      bottom: 0;
      left: 0;
      border-width: 0 0 6rpx 6rpx;
      border-radius: 0 0 0 20rpx;
    }

    &-br {
      bottom: 0;
      right: 0;
      border-width: 0 6rpx 6rpx 0;
      border-radius: 0 0 20rpx 0;
    }
  }

  // 扫描线
  .scan-line {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 4rpx;
    background: linear-gradient(90deg, transparent 0%, #6366f1 50%, transparent 100%);
    box-shadow: 0 0 20rpx #6366f1;

    &--animating {
      animation: scan-move 2s linear infinite;
    }
  }
}

@keyframes scan-move {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(500rpx);
  }
}

// 提示文字
.scan-tips {
  margin-bottom: 60rpx;

  .tips-text {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
    text-align: center;
  }
}

// 操作按钮
.scan-actions {
  @include flex-center();
  gap: 80rpx;
  margin-bottom: 80rpx;

  .action-btn {
    @include flex-center();
    flex-direction: column;
    gap: 16rpx;
    min-width: 160rpx;

    .btn-text {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.8);
    }
  }
}

// 开始扫码按钮
.start-scan-btn {
  @include flex-center();
  width: 400rpx;
  height: 80rpx;
  background: $gradient-primary;
  border-radius: 40rpx;
  transition: all $transition-base;

  &:active {
    transform: scale(0.95);
    opacity: 0.8;
  }

  .btn-text {
    font-size: 28rpx;
    font-weight: $font-weight-semibold;
    color: #fff;
  }
}

// 返回按钮
.back-btn {
  position: absolute;
  top: 40rpx;
  left: 24rpx;
  @include flex-center();
  width: 80rpx;
  height: 80rpx;
  background: rgba(0, 0, 0, 0.5);
  border-radius: $border-radius-full;
  backdrop-filter: blur(10rpx);
  @include safe-area-inset-top(40rpx);

  &:active {
    transform: scale(0.9);
  }
}

// 结果容器
.result-container {
  @include flex-center();
  width: 100%;
  height: 100vh;
  background: #000;
}

.result-box {
  @include flex-center();
  flex-direction: column;
  gap: 32rpx;

  .loading-icon {
    @include flex-center();
  }

  .spin-icon {
    animation: spin 1s linear infinite;
  }

  .result-text {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
