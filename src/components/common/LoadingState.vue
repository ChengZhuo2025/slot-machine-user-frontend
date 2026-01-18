<template>
  <view class="loading-state" :class="[`loading-state--${size}`]">
    <view class="loading-spinner">
      <view class="spinner-circle" v-for="i in 8" :key="i" :style="{ '--i': i }"></view>
    </view>
    <text v-if="text" class="loading-text">{{ text }}</text>
  </view>
</template>

<script>
/**
 * 加载状态组件
 * T004: 创建加载状态组件
 */
export default {
  name: 'LoadingState',
  props: {
    // 加载提示文字
    text: {
      type: String,
      default: '加载中...'
    },
    // 尺寸：small, medium, large
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl 0;

  &--small {
    padding: $spacing-lg 0;

    .loading-spinner {
      width: 48rpx;
      height: 48rpx;
    }

    .loading-text {
      font-size: $font-size-xs;
      margin-top: $spacing-sm;
    }
  }

  &--medium {
    .loading-spinner {
      width: 64rpx;
      height: 64rpx;
    }

    .loading-text {
      font-size: $font-size-sm;
      margin-top: $spacing-base;
    }
  }

  &--large {
    padding: $spacing-2xl 0;

    .loading-spinner {
      width: 80rpx;
      height: 80rpx;
    }

    .loading-text {
      font-size: $font-size-base;
      margin-top: $spacing-lg;
    }
  }
}

.loading-spinner {
  position: relative;
  animation: spinner-rotate 1s linear infinite;
}

.spinner-circle {
  position: absolute;
  width: 12%;
  height: 12%;
  background-color: $primary-color;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform-origin: center center;
  animation: spinner-fade 0.8s linear infinite;
  animation-delay: calc(0.1s * var(--i));

  &:nth-child(1) { transform: translate(-50%, -50%) rotate(0deg) translateY(-150%); }
  &:nth-child(2) { transform: translate(-50%, -50%) rotate(45deg) translateY(-150%); }
  &:nth-child(3) { transform: translate(-50%, -50%) rotate(90deg) translateY(-150%); }
  &:nth-child(4) { transform: translate(-50%, -50%) rotate(135deg) translateY(-150%); }
  &:nth-child(5) { transform: translate(-50%, -50%) rotate(180deg) translateY(-150%); }
  &:nth-child(6) { transform: translate(-50%, -50%) rotate(225deg) translateY(-150%); }
  &:nth-child(7) { transform: translate(-50%, -50%) rotate(270deg) translateY(-150%); }
  &:nth-child(8) { transform: translate(-50%, -50%) rotate(315deg) translateY(-150%); }
}

.loading-text {
  color: $text-secondary;
  margin-top: $spacing-base;
}

@keyframes spinner-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes spinner-fade {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 1; }
}
</style>
