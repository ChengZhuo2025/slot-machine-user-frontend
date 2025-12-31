<template>
  <view v-if="show" class="coupon-selector-overlay" @click="handleClose">
    <view class="coupon-selector animate__animated animate__slideInUp" @click.stop>
      <!-- 标题栏 -->
      <view class="selector-header">
        <text class="header-title">选择优惠券</text>
        <view class="close-btn" @click="handleClose">
          <Icon name="close" size="medium" color="#999" />
        </view>
      </view>

      <!-- 优惠券列表 -->
      <scroll-view class="coupon-list" scroll-y>
        <!-- 不使用优惠券选项 -->
        <view
          class="coupon-item"
          :class="{ 'coupon-item--selected': selectedCouponId === null }"
          @click="handleSelectCoupon(null)"
        >
          <view class="coupon-content">
            <view class="coupon-left">
              <text class="no-coupon-text">不使用优惠券</text>
            </view>
            <view class="coupon-right">
              <Icon
                :name="selectedCouponId === null ? 'check-circle-solid' : 'circle'"
                size="large"
                :color="selectedCouponId === null ? '#6366f1' : '#d1d5db'"
              />
            </view>
          </view>
        </view>

        <!-- 可用优惠券 -->
        <view v-if="availableCoupons.length > 0" class="coupon-section">
          <view class="section-title">
            <text class="title-text">可用优惠券 ({{ availableCoupons.length }})</text>
          </view>
          <view
            v-for="coupon in availableCoupons"
            :key="coupon.id"
            class="coupon-item"
            :class="{ 'coupon-item--selected': selectedCouponId === coupon.id }"
            @click="handleSelectCoupon(coupon.id)"
          >
            <view class="coupon-content">
              <view class="coupon-left">
                <!-- 优惠券面额 -->
                <view class="coupon-amount">
                  <text v-if="coupon.type === 'cash'" class="amount-symbol">¥</text>
                  <text class="amount-value">{{ formatAmount(coupon) }}</text>
                  <text v-if="coupon.type === 'discount'" class="amount-unit">折</text>
                </view>
                <!-- 优惠券信息 -->
                <view class="coupon-info">
                  <text class="coupon-name">{{ coupon.name }}</text>
                  <text class="coupon-condition">{{ coupon.description }}</text>
                  <text class="coupon-expire">有效期至 {{ formatDate(coupon.endTime) }}</text>
                </view>
              </view>
              <view class="coupon-right">
                <Icon
                  :name="selectedCouponId === coupon.id ? 'check-circle-solid' : 'circle'"
                  size="large"
                  :color="selectedCouponId === coupon.id ? '#6366f1' : '#d1d5db'"
                />
              </view>
            </view>
          </view>
        </view>

        <!-- 不可用优惠券 -->
        <view v-if="unavailableCoupons.length > 0" class="coupon-section">
          <view class="section-title">
            <text class="title-text">不可用优惠券 ({{ unavailableCoupons.length }})</text>
          </view>
          <view
            v-for="coupon in unavailableCoupons"
            :key="coupon.id"
            class="coupon-item coupon-item--disabled"
          >
            <view class="coupon-content">
              <view class="coupon-left">
                <!-- 优惠券面额 -->
                <view class="coupon-amount">
                  <text v-if="coupon.type === 'cash'" class="amount-symbol">¥</text>
                  <text class="amount-value">{{ formatAmount(coupon) }}</text>
                  <text v-if="coupon.type === 'discount'" class="amount-unit">折</text>
                </view>
                <!-- 优惠券信息 -->
                <view class="coupon-info">
                  <text class="coupon-name">{{ coupon.name }}</text>
                  <text class="coupon-condition">{{ coupon.description }}</text>
                  <text class="coupon-reason">{{ getUnavailableReason(coupon) }}</text>
                </view>
              </view>
              <view class="coupon-right">
                <Icon name="circle" size="large" color="#d1d5db" />
              </view>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-if="coupons.length === 0" class="empty-state">
          <text class="empty-text">暂无可用优惠券</text>
        </view>
      </scroll-view>

      <!-- 底部按钮 -->
      <view class="selector-footer">
        <button class="confirm-btn" @click="handleConfirm">
          确定
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, watch } from 'vue'
import Icon from '@/components/common/Icon.vue'

export default {
  name: 'CouponSelector',
  components: {
    Icon
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    coupons: {
      type: Array,
      default: () => []
    },
    orderAmount: {
      type: Number,
      default: 0
    },
    selectedId: {
      type: [Number, String, null],
      default: null
    }
  },
  emits: ['close', 'confirm'],
  setup(props, { emit }) {
    // 当前选中的优惠券ID
    const selectedCouponId = ref(props.selectedId)

    // 可用优惠券
    const availableCoupons = computed(() => {
      return props.coupons.filter(coupon => {
        // 检查是否满足使用条件
        if (coupon.condition && props.orderAmount < coupon.condition) {
          return false
        }
        // 检查是否过期
        if (coupon.endTime) {
          const endTime = new Date(coupon.endTime)
          if (endTime < new Date()) {
            return false
          }
        }
        return coupon.canUse !== false
      })
    })

    // 不可用优惠券
    const unavailableCoupons = computed(() => {
      return props.coupons.filter(coupon => {
        return !availableCoupons.value.find(c => c.id === coupon.id)
      })
    })

    // 格式化优惠券面额
    const formatAmount = (coupon) => {
      if (coupon.type === 'cash') {
        return coupon.amount
      } else if (coupon.type === 'discount') {
        return (coupon.amount / 10).toFixed(1)
      }
      return coupon.amount
    }

    // 格式化日期
    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}.${month}.${day}`
    }

    // 获取不可用原因
    const getUnavailableReason = (coupon) => {
      // 检查金额条件
      if (coupon.condition && props.orderAmount < coupon.condition) {
        return `满${coupon.condition}元可用`
      }
      // 检查是否过期
      if (coupon.endTime) {
        const endTime = new Date(coupon.endTime)
        if (endTime < new Date()) {
          return '已过期'
        }
      }
      return '不可用'
    }

    // 选择优惠券
    const handleSelectCoupon = (couponId) => {
      selectedCouponId.value = couponId
    }

    // 关闭选择器
    const handleClose = () => {
      emit('close')
    }

    // 确认选择
    const handleConfirm = () => {
      const selectedCoupon = selectedCouponId.value
        ? props.coupons.find(c => c.id === selectedCouponId.value)
        : null

      emit('confirm', {
        couponId: selectedCouponId.value,
        coupon: selectedCoupon
      })
      emit('close')
    }

    // 监听 props 变化，更新选中状态
    watch(() => props.selectedId, (newVal) => {
      selectedCouponId.value = newVal
    })

    // 监听显示状态，重置选中
    watch(() => props.show, (newVal) => {
      if (newVal) {
        selectedCouponId.value = props.selectedId
      }
    })

    return {
      selectedCouponId,
      availableCoupons,
      unavailableCoupons,
      formatAmount,
      formatDate,
      getUnavailableReason,
      handleSelectCoupon,
      handleClose,
      handleConfirm
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.coupon-selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
}

.coupon-selector {
  width: 100%;
  max-height: 80vh;
  background: $background-primary;
  border-radius: 32rpx 32rpx 0 0;
  display: flex;
  flex-direction: column;
  animation-duration: 0.3s;
}

// 标题栏
.selector-header {
  position: relative;
  padding: $spacing-base;
  @include flex-center();
  border-bottom: 1rpx solid $border-color;
}

.header-title {
  font-size: 32rpx;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.close-btn {
  position: absolute;
  top: 20rpx;
  right: 28rpx;
  width: 52rpx;
  height: 52rpx;
  @include flex-center();
  background: $background-secondary;
  border-radius: 50%;
  
  &:active {
    transform: scale(0.9);
  }
}

// 优惠券列表
.coupon-list {
  flex: 1;
  overflow-y: auto;
  padding: 24rpx;
}

.coupon-section {
  margin-bottom: 32rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  margin-bottom: 16rpx;
}

.title-text {
  font-size: 28rpx;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

// 优惠券项
.coupon-item {
  background: $background-secondary;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
  overflow: hidden;
  transition: all $transition-base;
  
  &--selected {
    background: rgba($primary-color, 0.1);
    border: 2rpx solid $primary-color;
  }
  
  &--disabled {
    opacity: 0.5;
  }
  
  &:active:not(&--disabled) {
    transform: scale(0.98);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
}

.coupon-content {
  @include flex-between();
  align-items: center;
  padding: 24rpx;
  gap: 24rpx;
}

.coupon-left {
  flex: 1;
  @include flex-start();
  gap: 24rpx;
}

.no-coupon-text {
  font-size: 28rpx;
  font-weight: $font-weight-medium;
  color: $text-primary;
}

// 优惠券面额
.coupon-amount {
  @include flex-center();
  flex-direction: column;
  min-width: 120rpx;
  padding: 16rpx;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-radius: 12rpx;
}

.amount-symbol {
  font-size: 24rpx;
  font-weight: $font-weight-semibold; 
  color: #fff;
  line-height: 1;
}

.amount-value {
  font-size: 48rpx;
  font-weight: $font-weight-bold;
  color: #fff;
  line-height: 1;
  margin: 4rpx 0;
}

.amount-unit {
  font-size: 24rpx;
  font-weight: $font-weight-semibold;
  color: #fff;
  line-height: 1;
}

// 优惠券信息
.coupon-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.coupon-name {
  font-size: 28rpx;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  line-height: 1.4;
}

.coupon-condition {
  font-size: 24rpx;
  color: $text-secondary;
  line-height: 1.4;
}

.coupon-expire {
  font-size: 24rpx;
  color: $text-tertiary;
  line-height: 1.4;
}

.coupon-reason {
  font-size: 24rpx;
  color: $error-color;
  line-height: 1.4;
}

.coupon-right {
  flex-shrink: 0;
}

// 空状态
.empty-state {
  @include flex-center();
  padding: 120rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: $text-tertiary;
}

// 底部按钮
.selector-footer {
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid $border-color;
}

.confirm-btn {
  @include flex-center();
  width: 100%;
  height: 80rpx;
  background: $gradient-primary;
  color: #fff;
  font-size: 32rpx;
  font-weight: $font-weight-semibold;
  border-radius: 44rpx;
  border: none;
  transition: all $transition-base;
  
  &:active {
    transform: scale(0.98);
  }
}
</style>
