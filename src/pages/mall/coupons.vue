<template>
  <view class="coupons-page">
    <!-- 导航栏 - 子任务 11.1 -->
    <view class="header-bar">
      <view class="header-left" @click="handleBack">
        <Icon name="arrow-left" size="medium" color="#333" />
      </view>
      <view class="header-center">
        <text class="header-title">我的优惠券</text>
      </view>
      <view class="header-right"></view>
    </view>

    <!-- Tab 导航 - 子任务 11.1 -->
    <view class="tabs-bar">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        class="tab-item"
        :class="{ 'tab-item--active': activeTab === tab.value }"
        @click="handleTabChange(tab.value)"
      >
        <text class="tab-text">{{ tab.label }}</text>
        <text v-if="tab.count > 0" class="tab-count">({{ tab.count }})</text>
      </view>
    </view>

    <!-- 优惠券列表 - 子任务 11.2 -->
    <scroll-view class="content" scroll-y>
      <view v-if="filteredCoupons.length > 0" class="coupons-list">
        <view
          v-for="coupon in filteredCoupons"
          :key="coupon.id"
          class="coupon-card animate__animated animate__fadeInUp"
          :class="{
            'coupon-card--used': coupon.status === 'used',
            'coupon-card--expired': coupon.status === 'expired'
          }"
        >
          <view class="coupon-left">
            <!-- 优惠券面额 -->
            <view class="coupon-amount">
              <text v-if="coupon.type === 'cash'" class="amount-symbol">¥</text>
              <text class="amount-value">{{ formatAmount(coupon) }}</text>
              <text v-if="coupon.type === 'discount'" class="amount-unit">折</text>
            </view>
            <text class="coupon-condition">{{ coupon.description }}</text>
          </view>

          <view class="coupon-right">
            <!-- 优惠券信息 -->
            <view class="coupon-info">
              <text class="coupon-name">{{ coupon.name }}</text>
              <text class="coupon-scope">{{ coupon.scopeText }}</text>
              <text class="coupon-expire">
                {{ formatExpireTime(coupon) }}
              </text>
            </view>

            <!-- 操作按钮 -->
            <view v-if="coupon.status === 'available'" class="coupon-action">
              <button class="use-btn" @click="handleUseCoupon(coupon)">
                立即使用
              </button>
            </view>
            <view v-else-if="coupon.status === 'used'" class="coupon-status">
              <text class="status-text">已使用</text>
              <text class="status-time">{{ formatUseTime(coupon.useTime) }}</text>
            </view>
            <view v-else-if="coupon.status === 'expired'" class="coupon-status">
              <text class="status-text">已过期</text>
            </view>
          </view>

          <!-- 已使用/已过期遮罩 -->
          <view
            v-if="coupon.status !== 'available'"
            class="coupon-mask"
          >
            <text class="mask-text">{{ coupon.status === 'used' ? '已使用' : '已过期' }}</text>
          </view>
        </view>
      </view>

      <!-- 空状态 - 子任务 11.3 -->
      <view v-else class="empty-state animate__animated animate__fadeIn">
        <image src="/static/images/empty-coupon.png" class="empty-image" mode="aspectFit" />
        <text class="empty-text">{{ emptyText }}</text>
        <button v-if="activeTab === 'available'" class="go-get-btn" @click="handleGoToMall">
          去逛逛领券
        </button>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Icon from '@/components/common/Icon.vue'
import request from '@/utils/request'

export default {
  name: 'CouponsPage',
  components: {
    Icon
  },
  setup() {
    const router = useRouter()

    // Tab 配置
    const tabs = ref([
      { label: '可用', value: 'available', count: 0 },
      { label: '已使用', value: 'used', count: 0 },
      { label: '已过期', value: 'expired', count: 0 }
    ])

    // 当前 Tab
    const activeTab = ref('available')

    // 优惠券列表
    const coupons = ref([])

    // 筛选后的优惠券
    const filteredCoupons = computed(() => {
      return coupons.value.filter(coupon => coupon.status === activeTab.value)
    })

    // 空状态文案
    const emptyText = computed(() => {
      const texts = {
        available: '暂无可用优惠券',
        used: '暂无已使用优惠券',
        expired: '暂无已过期优惠券'
      }
      return texts[activeTab.value] || '暂无优惠券'
    })

    // 获取优惠券列表
    const fetchCoupons = async () => {
      try {
        uni.showLoading({ title: '加载中...' })

        const res = await request({
          url: '/api/mall/coupons',
          method: 'GET'
        })

        uni.hideLoading()

        if (res.code === 200) {
          coupons.value = res.data || []

          // 更新 Tab 数量
          tabs.value.forEach(tab => {
            tab.count = coupons.value.filter(c => c.status === tab.value).length
          })
        }
      } catch (error) {
        uni.hideLoading()
        console.error('获取优惠券列表失败:', error)
        uni.showToast({ title: '加载失败', icon: 'none' })
      }
    }

    // 格式化优惠券面额
    const formatAmount = (coupon) => {
      if (coupon.type === 'cash') {
        return coupon.amount
      } else if (coupon.type === 'discount') {
        return (coupon.amount / 10).toFixed(1)
      }
      return coupon.amount
    }

    // 格式化过期时间
    const formatExpireTime = (coupon) => {
      if (!coupon.endTime) return ''
      
      const endDate = new Date(coupon.endTime)
      const now = new Date()
      const diff = endDate - now
      const days = Math.floor(diff / (24 * 60 * 60 * 1000))

      if (days < 0) {
        return '已过期'
      } else if (days === 0) {
        return '今天过期'
      } else if (days === 1) {
        return '明天过期'
      } else if (days <= 7) {
        return `${days}天后过期`
      } else {
        const year = endDate.getFullYear()
        const month = String(endDate.getMonth() + 1).padStart(2, '0')
        const day = String(endDate.getDate()).padStart(2, '0')
        return `有效期至 ${year}.${month}.${day}`
      }
    }

    // 格式化使用时间
    const formatUseTime = (time) => {
      if (!time) return ''
      const date = new Date(time)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}.${month}.${day}`
    }

    // 返回
    const handleBack = () => {
      uni.navigateBack()
    }

    // Tab 切换
    const handleTabChange = (value) => {
      activeTab.value = value
    }

    // 使用优惠券
    const handleUseCoupon = (coupon) => {
      // 跳转到商城首页
      uni.switchTab({ url: '/pages/mall/index' })
    }

    // 去逛逛
    const handleGoToMall = () => {
      uni.switchTab({ url: '/pages/mall/index' })
    }

    onMounted(() => {
      fetchCoupons()
    })

    return {
      tabs,
      activeTab,
      coupons,
      filteredCoupons,
      emptyText,
      formatAmount,
      formatExpireTime,
      formatUseTime,
      handleBack,
      handleTabChange,
      handleUseCoupon,
      handleGoToMall
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.coupons-page {
  min-height: 100vh;
  background: $background-secondary;
}

// 导航栏
.header-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  padding-top: env(safe-area-inset-top);
  background: $background-primary;
  @include flex-between();
  align-items: center;
  padding-left: 24rpx;
  padding-right: 24rpx;
  z-index: 100;
  border-bottom: 1rpx solid $border-color;
}

.header-left {
  width: 80rpx;
}

.header-center {
  flex: 1;
  text-align: center;
}

.header-title {
  font-size: 32rpx;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.header-right {
  width: 80rpx;
}

// Tab 导航
.tabs-bar {
  position: fixed;
  top: calc(88rpx + env(safe-area-inset-top));
  left: 0;
  right: 0;
  @include flex-start();
  background: $background-primary;
  border-bottom: 1rpx solid $border-color;
  z-index: 99;
}

.tab-item {
  flex: 1;
  height: 88rpx;
  @include flex-center();
  gap: 8rpx;
  position: relative;
  
  &--active {
    .tab-text {
      color: $primary-color;
      font-weight: $font-weight-semibold;
    }
    
    .tab-count {
      color: $primary-color;
    }
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 48rpx;
      height: 4rpx;
      background: $primary-color;
      border-radius: 2rpx;
    }
  }
  
  &:active {
    background: $background-secondary;
  }
}

.tab-text {
  font-size: 28rpx;
  color: $text-secondary;
  transition: all $transition-base;
}

.tab-count {
  font-size: 24rpx;
  color: $text-tertiary;
  transition: all $transition-base;
}

// 内容区域
.content {
  height: 100vh;
  padding-top: calc(88rpx + env(safe-area-inset-top) + 88rpx);
  padding: calc(88rpx + env(safe-area-inset-top) + 88rpx) 16rpx 32rpx;
}

// 优惠券列表
.coupons-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

// 优惠券卡片
.coupon-card {
  position: relative;
  @include flex-start();
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-radius: 16rpx;
  overflow: hidden;
  
  &--used,
  &--expired {
    background: linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%);
  }
}

.coupon-left {
  width: 240rpx;
  padding: 32rpx 24rpx;
  @include flex-center();
  flex-direction: column;
  gap: 12rpx;
  border-right: 2rpx dashed rgba(255, 255, 255, 0.5);
}

.coupon-amount {
  @include flex-center();
  align-items: baseline;
  gap: 4rpx;
}

.amount-symbol {
  font-size: 32rpx;
  font-weight: $font-weight-bold;
  color: #fff;
  line-height: 1;
}

.amount-value {
  font-size: 64rpx;
  font-weight: $font-weight-bold;
  color: #fff;
  line-height: 1;
}

.amount-unit {
  font-size: 32rpx;
  font-weight: $font-weight-bold;
  color: #fff;
  line-height: 1;
}

.coupon-condition {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
}

.coupon-right {
  flex: 1;
  padding: 32rpx 24rpx;
  @include flex-between();
  flex-direction: column;
  gap: 16rpx;
}

.coupon-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.coupon-name {
  font-size: 32rpx;
  font-weight: $font-weight-semibold;
  color: #fff;
  line-height: 1.3;
}

.coupon-scope {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.coupon-expire {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.coupon-action {
  align-self: flex-end;
}

.use-btn {
  padding: 12rpx 32rpx;
  background: #fff;
  color: #f59e0b;
  font-size: 26rpx;
  font-weight: $font-weight-semibold;
  border-radius: 24rpx;
  border: none;
  
  &:active {
    transform: scale(0.95);
  }
}

.coupon-status {
  align-self: flex-end;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4rpx;
}

.status-text {
  font-size: 26rpx;
  font-weight: $font-weight-semibold;
  color: rgba(255, 255, 255, 0.9);
}

.status-time {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

// 优惠券遮罩
.coupon-mask {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  @include flex-center();
  background: rgba(0, 0, 0, 0.3);
  pointer-events: none;
}

.mask-text {
  font-size: 48rpx;
  font-weight: $font-weight-bold;
  color: rgba(255, 255, 255, 0.8);
  transform: rotate(-15deg);
}

// 空状态
.empty-state {
  @include flex-center();
  flex-direction: column;
  padding: 120rpx 48rpx;
}

.empty-image {
  width: 400rpx;
  height: 400rpx;
  margin-bottom: 32rpx;
}

.empty-text {
  font-size: 28rpx;
  color: $text-tertiary;
  margin-bottom: 48rpx;
}

.go-get-btn {
  width: 320rpx;
  height: 80rpx;
  background: linear-gradient(135deg, $primary-color 0%, #4f46e5 100%);
  color: #fff;
  font-size: 28rpx;
  font-weight: $font-weight-semibold;
  border-radius: 40rpx;
  border: none;
  
  &:active {
    transform: scale(0.98);
  }
}
</style>
