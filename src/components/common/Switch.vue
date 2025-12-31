<template>
  <view class="custom-switch" :class="{ 'custom-switch--active': checked }" @click="handleToggle">
    <view class="switch-thumb"></view>
  </view>
</template>

<script>
export default {
  name: 'Switch',
  props: {
    checked: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['change'],
  setup(props, { emit }) {
    const handleToggle = () => {
      if (props.disabled) return
      emit('change', { detail: { value: !props.checked } })
    }

    return {
      handleToggle
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.custom-switch {
  position: relative;
  width: 70rpx;
  height: 40rpx;
  background: #e5e7eb;
  border-radius: 20rpx;
  transition: background-color $transition-base;
  cursor: pointer;

  &--active {
    background: $gradient-primary;
  }

  .switch-thumb {
    position: absolute;
    top: 4rpx;
    left: 4rpx;
    width: 32rpx;
    height: 32rpx;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
    transition: transform $transition-base;
  }

  &--active .switch-thumb {
    transform: translateX(30rpx);
  }

  &:active {
    opacity: 0.8;
  }
}
</style>
