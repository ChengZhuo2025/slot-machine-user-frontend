<template>
  <view class="empty-state">
    <view class="empty-icon">
      <Icon :name="iconName" size="xlarge" color="#CCCCCC" />
    </view>
    <text class="empty-title">{{ title }}</text>
    <text v-if="description" class="empty-description">{{ description }}</text>
    <view v-if="actionText" class="empty-action">
      <button class="action-btn" @click="handleAction">{{ actionText }}</button>
    </view>
  </view>
</template>

<script>
/**
 * 空状态组件
 * T006: 创建空状态组件
 */
import Icon from './Icon.vue'

export default {
  name: 'EmptyState',
  components: { Icon },
  props: {
    // 空状态类型
    type: {
      type: String,
      default: 'default',
      validator: (value) => [
        'default',
        'search',
        'order',
        'cart',
        'coupon',
        'hotel',
        'product',
        'favorite'
      ].includes(value)
    },
    // 自定义标题
    title: {
      type: String,
      default: ''
    },
    // 描述文字
    description: {
      type: String,
      default: ''
    },
    // 操作按钮文字
    actionText: {
      type: String,
      default: ''
    }
  },
  emits: ['action'],
  computed: {
    iconName() {
      const icons = {
        default: 'info',
        search: 'search',
        order: 'receipt',
        cart: 'shopping-cart',
        coupon: 'ticket',
        hotel: 'hotel',
        product: 'goods',
        favorite: 'heart'
      }
      return icons[this.type] || icons.default
    },
    defaultTitle() {
      const titles = {
        default: '暂无数据',
        search: '未找到相关内容',
        order: '暂无订单',
        cart: '购物车是空的',
        coupon: '暂无优惠券',
        hotel: '暂无酒店信息',
        product: '暂无商品',
        favorite: '暂无收藏'
      }
      return this.title || titles[this.type] || titles.default
    }
  },
  methods: {
    handleAction() {
      this.$emit('action')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-2xl $spacing-xl;
  min-height: 400rpx;
}

.empty-icon {
  margin-bottom: $spacing-lg;
  opacity: 0.6;
}

.empty-title {
  font-size: $font-size-lg;
  font-weight: $font-weight-medium;
  color: $text-secondary;
  margin-bottom: $spacing-sm;
}

.empty-description {
  font-size: $font-size-sm;
  color: $text-tertiary;
  text-align: center;
  max-width: 500rpx;
  line-height: $line-height-lg;
}

.empty-action {
  margin-top: $spacing-xl;
}

.action-btn {
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
