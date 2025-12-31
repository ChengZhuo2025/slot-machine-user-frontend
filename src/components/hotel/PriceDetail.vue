<template>
  <view class="price-detail">
    <view class="section-title">
      <Icon name="chart" size="small" color="#333" />
      <text class="title-text">价格明细</text>
    </view>
    <view class="price-list">
      <view v-for="(item, index) in items" :key="index" class="price-item">
        <text class="price-label">• {{ item.label }}</text>
        <text class="price-value">¥{{ item.value }}</text>
      </view>
      <view v-if="discount > 0" class="price-item discount-item">
        <text class="price-label">优惠</text>
        <text class="discount-value">-¥{{ discount }}</text>
      </view>
    </view>
    <view class="total-row">
      <text class="total-label">总计</text>
      <text class="total-value">¥{{ finalTotal }}</text>
    </view>
  </view>
</template>

<script>
import { computed } from 'vue'
import Icon from '@/components/common/Icon.vue'

export default {
  name: 'PriceDetail',
  components: {
    Icon
  },
  props: {
    items: {
      type: Array,
      default: () => []
    },
    discount: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    const finalTotal = computed(() => {
      return Math.max(0, props.total - props.discount)
    })

    return {
      finalTotal
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.price-detail {
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

  .price-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    margin-bottom: 16rpx;
  }

  .price-item {
    @include flex-between();
    align-items: center;

    .price-label {
      font-size: 26rpx;
      color: $text-secondary;
    }

    .price-value {
      font-size: 26rpx;
      color: $text-primary;
    }

    &.discount-item {
      .discount-value {
        font-size: 26rpx;
        color: $error-color;
      }
    }
  }

  .total-row {
    @include flex-between();
    align-items: center;
    padding-top: 16rpx;
    border-top: 2rpx solid $border-light;

    .total-label {
      font-size: 28rpx;
      font-weight: $font-weight-semibold;
      color: $text-primary;
    }

    .total-value {
      font-size: 32rpx;
      font-weight: $font-weight-semibold;
      color: $error-color;
    }
  }
}
</style>
