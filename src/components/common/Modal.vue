<template>
  <view v-if="visible" class="modal-overlay" :class="{ 'modal-overlay--show': animating }" @click="handleOverlayClick">
    <view
      class="modal-container"
      :class="[
        `modal-container--${size}`,
        { 'modal-container--show': animating }
      ]"
      :style="containerStyle"
      @click.stop
    >
      <!-- 标题栏 -->
      <view v-if="showHeader" class="modal-header">
        <view class="modal-header__left">
          <view v-if="showBack" class="modal-back" @click="handleBack">
            <Icon name="arrow-left" size="medium" :color="headerColor" />
          </view>
        </view>
        <view class="modal-header__center">
          <text class="modal-title" :style="{ color: headerColor }">{{ title }}</text>
        </view>
        <view class="modal-header__right">
          <view class="modal-close" @click="handleClose">
            <Icon name="close" size="medium" :color="headerColor" />
          </view>
        </view>
      </view>

      <!-- 内容区域 -->
      <scroll-view
        class="modal-content"
        :class="{ 'modal-content--no-header': !showHeader }"
        scroll-y="true"
        :show-scrollbar="false"
        :style="contentStyle"
      >
        <slot></slot>
      </scroll-view>

      <!-- 底部操作栏（可选） -->
      <view v-if="$slots.footer" class="modal-footer">
        <slot name="footer"></slot>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import Icon from './Icon.vue'

export default {
  name: 'Modal',
  components: {
    Icon
  },
  props: {
    // 是否显示
    modelValue: {
      type: Boolean,
      default: false
    },
    // 标题
    title: {
      type: String,
      default: ''
    },
    // 尺寸: full(全屏), large(大弹窗), medium(中等), small(小弹窗)
    size: {
      type: String,
      default: 'full',
      validator: (value) => ['full', 'large', 'medium', 'small'].includes(value)
    },
    // 是否显示头部
    showHeader: {
      type: Boolean,
      default: true
    },
    // 是否显示返回按钮
    showBack: {
      type: Boolean,
      default: false
    },
    // 点击遮罩是否关闭
    closeOnClickOverlay: {
      type: Boolean,
      default: true
    },
    // 头部文字颜色
    headerColor: {
      type: String,
      default: '#333'
    },
    // 自定义容器样式
    containerStyle: {
      type: Object,
      default: () => ({})
    },
    // 自定义内容样式
    contentStyle: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:modelValue', 'close', 'back', 'opened', 'closed'],
  setup(props, { emit }) {
    const visible = ref(false)
    const animating = ref(false)

    // 打开弹窗
    const openModal = () => {
      visible.value = true
      // 延迟执行动画
      setTimeout(() => {
        animating.value = true
        emit('opened')
      }, 50)
    }

    // 关闭弹窗
    const closeModal = () => {
      animating.value = false
      // 等待动画结束
      setTimeout(() => {
        visible.value = false
        emit('closed')
      }, 300)
    }

    // 监听 modelValue 变化（在函数定义之后）
    watch(() => props.modelValue, (newVal) => {
      if (newVal) {
        openModal()
      } else {
        closeModal()
      }
    }, { immediate: true })

    // 处理遮罩点击
    const handleOverlayClick = () => {
      if (props.closeOnClickOverlay) {
        handleClose()
      }
    }

    // 关闭弹窗
    const handleClose = () => {
      emit('update:modelValue', false)
      emit('close')
    }

    // 返回
    const handleBack = () => {
      emit('back')
    }

    return {
      visible,
      animating,
      handleOverlayClick,
      handleClose,
      handleBack
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0);
  z-index: 990;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  transition: background-color 0.3s ease;

  &--show {
    background-color: rgba(0, 0, 0, 0.5);
  }
}

.modal-container {
  width: 100%;
  background: $background-primary;
  border-radius: 0;
  display: flex;
  flex-direction: column;
  transform: translateY(100%);
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  &--show {
    transform: translateY(0);
  }

  // 全屏
  &--full {
    height: 100vh;
    border-radius: 0;
  }

  // 大弹窗(90%高度)
  &--large {
    max-height: 90vh;
    border-radius: 32rpx 32rpx 0 0;
  }

  // 中等弹窗(70%高度)
  &--medium {
    max-height: 70vh;
    border-radius: 32rpx 32rpx 0 0;
  }

  // 小弹窗(50%高度)
  &--small {
    max-height: 50vh;
    border-radius: 32rpx 32rpx 0 0;
  }
}

.modal-header {
  @include flex-between();
  align-items: center;
  padding: $spacing-sm $spacing-base;
  border-bottom: 1rpx solid #ddd;
  border-radius: 44rpx 44rpx 0 0;
  flex-shrink: 0;
  background: $background-primary;
  position: relative;
  z-index: 10;

  &__left,
  &__right {
    flex: 0 0 auto;
    width: 48rpx;
    @include flex-center();
  }

  &__center {
    flex: 1;
    text-align: center;
    padding: 0 $spacing-base;
  }

  .modal-title {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    @include ellipsis();
  }

  .modal-back,
  .modal-close {
    width: 60rpx;
    height: 60rpx;
    @include flex-center();
    border-radius: $border-radius-full;
    transition: background-color $transition-base;

    &:active {
      background: $background-secondary;
    }
  }
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-lg $spacing-lg 140rpx;
  background: $background-tertiary;
  overflow-y: scroll;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  &--no-header {
    padding-top: calc($spacing-base + 40rpx);
  }
}

.modal-footer {
  flex-shrink: 0;
  padding: $spacing-base $spacing-lg;
  background: $background-primary;
  border-top: 2rpx solid $border-light;
  @include safe-area-inset-bottom();
}
</style>
