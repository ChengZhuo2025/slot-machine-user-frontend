<template>
  <view class="payment-method">
    <view class="section-title">
      <Icon name="credit-card" size="small" color="#333" />
      <text class="title-text">支付方式</text>
    </view>
    <view class="payment-list">
      <view
        v-for="method in paymentMethods"
        :key="method.value"
        class="payment-item"
        :class="{ 'payment-item--active': modelValue === method.value }"
        @click="handleSelect(method.value)"
      >
        <view class="payment-info">
          <Icon :name="method.icon" size="large" :color="method.color" />
          <view class="payment-detail">
            <text class="payment-name">{{ method.name }}</text>
            <text v-if="method.desc" class="payment-desc">{{ method.desc }}</text>
          </view>
        </view>
        <Icon
          name="check"
          size="medium"
          :color="modelValue === method.value ? '#be32d7' : '#e5e7eb'"
        />
      </view>
    </view>
  </view>
</template>

<script>
import { ref } from 'vue'
import Icon from '@/components/common/Icon.vue'

export default {
  name: 'PaymentMethod',
  components: {
    Icon
  },
  props: {
    modelValue: {
      type: String,
      default: 'balance'
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const paymentMethods = ref([
      {
        value: 'balance',
        name: '余额支付',
        desc: '账户余额: ¥1000.00',
        icon: 'wallet',
        color: '#be32d7'
      },
      {
        value: 'wechat',
        name: '微信支付',
        desc: '推荐使用微信支付',
        icon: 'wechatPay',
        color: '#10b981'
      },
      {
        value: 'alipay',
        name: '支付宝',
        desc: '安全便捷',
        icon: 'alipay',
        color: '#3b82f6'
      }
    ])

    const handleSelect = (value) => {
      emit('update:modelValue', value)
    }

    return {
      paymentMethods,
      handleSelect
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.payment-method {
  background: $background-primary;
  padding: 24rpx;
  margin-bottom: 16rpx;

  .section-title {
    @include flex-start();
    align-items: center;
    gap: 8rpx;
    margin-bottom: 20rpx;

    .title-text {
      font-size: 28rpx;
      font-weight: $font-weight-semibold;
      color: $text-primary;
    }
  }

  .payment-list {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
  }

  .payment-item {
    @include flex-between();
    align-items: center;
    padding: 20rpx;
    background: $background-secondary;
    border-radius: 20rpx;
    border: 2rpx solid transparent;
    transition: all $transition-base;

    &--active {
      border-color: $primary-color;
      background: rgba($primary-color, 0.1);
    }

    &:active {
      transform: scale(0.98);
    }
  }

  .payment-info {
    @include flex-start();
    align-items: center;
    gap: 16rpx;
    flex: 1;
  }

  .payment-detail {
    display: flex;
    flex-direction: column;
    gap: 6rpx;
  }

  .payment-name {
    font-size: 28rpx;
    font-weight: $font-weight-medium;
    color: $text-primary;
  }

  .payment-desc {
    font-size: 24rpx;
    color: $text-secondary;
  }
}
</style>
