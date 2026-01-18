<template>
  <view class="error-state">
    <view class="error-icon">
      <Icon :name="iconName" size="xlarge" :color="iconColor" />
    </view>
    <text class="error-title">{{ title }}</text>
    <text v-if="message" class="error-message">{{ message }}</text>
    <view v-if="showRetry" class="error-action">
      <button class="retry-btn" @click="handleRetry">
        <Icon name="rotate-ccw" size="small" color="#fff" />
        <text>{{ retryText }}</text>
      </button>
    </view>
  </view>
</template>

<script>
/**
 * 错误状态组件
 * T005: 创建错误状态组件
 */
import Icon from './Icon.vue'

export default {
  name: 'ErrorState',
  components: { Icon },
  props: {
    // 错误类型：network, server, empty, permission, unknown
    type: {
      type: String,
      default: 'unknown',
      validator: (value) => ['network', 'server', 'empty', 'permission', 'unknown'].includes(value)
    },
    // 自定义标题
    title: {
      type: String,
      default: ''
    },
    // 错误详细信息
    message: {
      type: String,
      default: ''
    },
    // 是否显示重试按钮
    showRetry: {
      type: Boolean,
      default: true
    },
    // 重试按钮文字
    retryText: {
      type: String,
      default: '重新加载'
    }
  },
  emits: ['retry'],
  computed: {
    iconName() {
      const icons = {
        network: 'wifi',
        server: 'alert-circle',
        empty: 'info',
        permission: 'shield-check',
        unknown: 'x-circle'
      }
      return icons[this.type] || icons.unknown
    },
    iconColor() {
      const colors = {
        network: '#F59E0B',
        server: '#EF4444',
        empty: '#999999',
        permission: '#3B82F6',
        unknown: '#EF4444'
      }
      return colors[this.type] || colors.unknown
    },
    defaultTitle() {
      const titles = {
        network: '网络连接失败',
        server: '服务器异常',
        empty: '暂无数据',
        permission: '没有访问权限',
        unknown: '加载失败'
      }
      return this.title || titles[this.type] || titles.unknown
    }
  },
  methods: {
    handleRetry() {
      this.$emit('retry')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-2xl $spacing-xl;
  min-height: 400rpx;
}

.error-icon {
  margin-bottom: $spacing-lg;
  opacity: 0.8;
}

.error-title {
  font-size: $font-size-lg;
  font-weight: $font-weight-medium;
  color: $text-primary;
  margin-bottom: $spacing-sm;
}

.error-message {
  font-size: $font-size-sm;
  color: $text-tertiary;
  text-align: center;
  max-width: 500rpx;
  line-height: $line-height-lg;
}

.error-action {
  margin-top: $spacing-xl;
}

.retry-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-xs;
  padding: $spacing-sm $spacing-xl;
  background: $gradient-primary;
  border: none;
  border-radius: $border-radius-full;
  color: #fff;
  font-size: $font-size-sm;

  &::after {
    display: none;
  }

  &:active {
    opacity: 0.9;
    transform: scale(0.98);
  }
}
</style>
