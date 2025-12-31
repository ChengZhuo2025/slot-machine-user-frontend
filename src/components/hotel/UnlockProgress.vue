<template>
  <view class="unlock-progress">
    <view class="progress-card">
      <!-- 进度图标 -->
      <view class="progress-icon">
        <view v-if="status === 'connecting'" class="icon-wrapper">
          <Icon name="wifi" size="xlarge" color="#6366f1" class="pulse-icon" />
        </view>
        <view v-else-if="status === 'verifying'" class="icon-wrapper">
          <Icon name="shield-check" size="xlarge" color="#f59e0b" class="pulse-icon" />
        </view>
        <view v-else-if="status === 'unlocking'" class="icon-wrapper">
          <Icon name="unlock" size="xlarge" color="#10b981" class="pulse-icon" />
        </view>
        <view v-else-if="status === 'success'" class="icon-wrapper">
          <Icon name="check-circle" size="xlarge" color="#10b981" />
        </view>
        <view v-else-if="status === 'error'" class="icon-wrapper">
          <Icon name="x-circle" size="xlarge" color="#ef4444" />
        </view>
      </view>

      <!-- 进度条 -->
      <view class="progress-bar-container">
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: progress + '%' }"></view>
        </view>
        <text class="progress-text">{{ progress }}%</text>
      </view>

      <!-- 状态消息 -->
      <text class="status-message">{{ message }}</text>

      <!-- 加载动画 -->
      <view v-if="status !== 'success' && status !== 'error'" class="loading-dots">
        <view class="dot"></view>
        <view class="dot"></view>
        <view class="dot"></view>
      </view>
    </view>
  </view>
</template>

<script>
import Icon from '@/components/common/Icon.vue'

export default {
  name: 'UnlockProgress',
  components: {
    Icon
  },
  props: {
    status: {
      type: String,
      default: 'connecting', // connecting | verifying | unlocking | success | error
      validator: (value) => ['connecting', 'verifying', 'unlocking', 'success', 'error'].includes(value)
    },
    progress: {
      type: Number,
      default: 0,
      validator: (value) => value >= 0 && value <= 100
    },
    message: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.unlock-progress {
  padding: 24rpx;
  margin: 16rpx;
}

.progress-card {
  @include flex-center();
  flex-direction: column;
  gap: 32rpx;
  padding: 48rpx 24rpx;
  background: $background-primary;
  border-radius: 20rpx;
}

// 进度图标
.progress-icon {
  @include flex-center();
  width: 160rpx;
  height: 160rpx;
  background: linear-gradient(135deg, $primary-light 0%, #ede9fe 100%);
  border-radius: 50%;
}

.icon-wrapper {
  @include flex-center();
  position: relative;
}

.pulse-icon {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

// 进度条
.progress-bar-container {
  width: 100%;
  @include flex-center();
  flex-direction: column;
  gap: 12rpx;
}

.progress-bar {
  position: relative;
  width: 100%;
  height: 12rpx;
  background: $background-secondary;
  border-radius: 20rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, $primary-color 0%, #8b5cf6 100%);
  border-radius: 20rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 24rpx;
  font-weight: $font-weight-semibold;
  color: $text-secondary;
}

// 状态消息
.status-message {
  font-size: 28rpx;
  font-weight: $font-weight-medium;
  color: $text-primary;
  text-align: center;
}

// 加载点
.loading-dots {
  @include flex-center();
  gap: 12rpx;

  .dot {
    width: 12rpx;
    height: 12rpx;
    background: $primary-color;
    border-radius: 50%;
    animation: dot-bounce 1.4s ease-in-out infinite;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }

    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }
}

@keyframes dot-bounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
