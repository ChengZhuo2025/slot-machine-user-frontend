<template>
  <view class="order-detail-page">
    <!-- 导航栏 -->
    <view class="header-bar">
      <view class="header-left" @click="handleBack">
        <Icon name="arrow-left" size="medium" color="#333" />
      </view>
      <view class="header-center">
        <text class="header-title">订单详情</text>
      </view>
      <view class="header-right"></view>
    </view>

    <scroll-view class="content" scroll-y="true">
      <!-- 订单状态 -->
      <view class="status-card animate__animated animate__bounceIn" :style="{ background: statusConfig.bgGradient }">
        <view class="status-icon-wrapper">
          <Icon :name="statusConfig.icon" size="xlarge" :color="statusConfig.color" />
        </view>
        <view class="status-content">
          <view class="status-header">
            <text class="status-text" :style="{ color: statusConfig.color }">{{ statusConfig.text }}</text>
            <view v-if="countdown && order.status === 'pending'" class="countdown-badge">
              <Icon name="clock" size="xsmall" :color="statusConfig.color" />
              <text class="countdown-text" :style="{ color: statusConfig.color }">{{ countdown }}</text>
            </view>
          </view>
          <text v-if="statusConfig.desc" class="status-desc">{{ statusConfig.desc }}</text>
        </view>
      </view>

      <!-- 开锁信息（仅支付成功后显示） -->
      <view v-if="order.status === 'paid'" class="unlock-card animate__animated animate__fadeInDown" style="animation-delay: 200ms;">
        <view class="unlock-header">
          <Icon name="key" size="small" color="#333" />
          <text class="unlock-title">开锁信息</text>
        </view>
        <view class="unlock-methods">
          <view class="unlock-method" @click="handleScanUnlock">
            <Icon name="qrcode" size="xlarge" color="#6366f1" />
            <text class="method-text">扫码开锁</text>
          </view>
          <view class="unlock-method" @click="handleCodeUnlock">
            <Icon name="unlock" size="xlarge" color="#10b981" />
            <text class="method-text">输入开锁码</text>
          </view>
        </view>
        <view v-if="order.unlockCode" class="unlock-code-box">
          <text class="code-label">开锁密码</text>
          <text class="code-value">{{ order.unlockCode }}</text>
          <view class="copy-btn" @click="handleCopyCode">
            <Icon name="copy" size="small" color="#6366f1" />
          </view>
        </view>
      </view>

      <!-- 酒店房间信息 -->
      <view class="section-card animate__animated animate__fadeInUp" style="animation-delay: 300ms;">
        <view class="section-title">
          <Icon name="hotel" size="small" color="#333" />
          <text class="title-text">酒店信息</text>
        </view>

        <!-- 酒店信息 -->
        <view class="hotel-info-block">
          <view class="hotel-header">
            <text class="hotel-name">{{ order.hotelName }}</text>
            <view class="hotel-badge">
              <Icon name="shield-check" size="xsmall" color="#10B981" />
              <text class="badge-text">认证商家</text>
            </view>
          </view>
          <view class="hotel-address">
            <Icon name="map" size="small" color="#999" />
            <text class="address-text">{{ order.hotelAddress }}</text>
          </view>
        </view>

        <!-- 分隔线 -->
        <view class="divider"></view>

        <!-- 房间信息 -->
        <view class="room-info-block">
          <view class="room-label">
            <Icon name="room" size="xsmall" color="#666" />
            <text class="label-text">预订房型</text>
          </view>
          <view class="room-content">
            <image class="room-image" :src="order.roomImage" mode="aspectFill" />
            <view class="room-detail">
              <text class="room-name">{{ order.roomName }}</text>
              <view class="room-specs">
                <view class="spec-item">
                  <Icon name="ruler" size="xsmall" color="#999" />
                  <text class="spec-text">{{ order.roomArea }}m²</text>
                </view>
                <view class="spec-item">
                  <Icon name="bed" size="xsmall" color="#999" />
                  <text class="spec-text">{{ order.bedType }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="section-card animate__animated animate__fadeInUp" style="animation-delay: 400ms;">
        <view class="section-title">
          <Icon name="file" size="small" color="#333" />
          <text class="title-text">订单信息</text>
        </view>
        <view class="order-info-list">
          <view class="info-row">
            <text class="label">• 订单编号</text>
            <view class="value-box" @click="handleCopyOrder">
              <text class="value">{{ order.orderNo }}</text>
              <view class="copy-btn">
                <Icon name="copy" size="xsmall" color="#6366f1" />
              </view>
            </view>
          </view>
          <view class="info-row">
            <text class="label">• 入住日期</text>
            <text class="value">{{ order.bookingDate }}</text>
          </view>
          <view class="info-row">
            <text class="label">• 入住时段</text>
            <text class="value">{{ order.startTime }} - {{ order.endTime }}</text>
          </view>
          <view class="info-row">
            <text class="label">• 入住时长</text>
            <text class="value">{{ order.duration }}小时</text>
          </view>
          <view class="info-row">
            <text class="label">• 联系人</text>
            <text class="value">{{ order.contactName }}</text>
          </view>
          <view class="info-row">
            <text class="label">• 联系电话</text>
            <text class="value">{{ order.contactPhone }}</text>
          </view>
        </view>
      </view>

      <!-- 支付信息 -->
      <view class="section-card animate__animated animate__fadeInUp" style="animation-delay: 500ms;">
        <view class="section-title">
          <Icon name="credit-card" size="small" color="#333" />
          <text class="title-text">支付信息</text>
        </view>
        <view class="payment-info-list">
          <view class="info-row">
            <text class="label">• 房费</text>
            <text class="value">¥{{ order.roomPrice }}</text>
          </view>
          <view v-if="order.discount > 0" class="info-row">
            <text class="label">• 优惠</text>
            <text class="discount-value">-¥{{ order.discount }}</text>
          </view>
          <view class="info-row total-row">
            <text class="label">• 实付金额</text>
            <text class="total-value">¥{{ order.totalPrice }}</text>
          </view>
          <view class="info-row">
            <text class="label">• 支付方式</text>
            <text class="value">{{ paymentMethodText }}</text>
          </view>
          <view v-if="order.payTime" class="info-row">
            <text class="label">• 支付时间</text>
            <text class="value">{{ order.payTime }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view v-if="showActionBar" class="action-bar animate__animated animate__slideInUp">
      <!-- 待支付状态 -->
      <view v-if="order.status === 'pending'" class="action-buttons">
        <view class="action-btn action-btn--ghost" @click="handleCancelOrder">
          <text class="btn-text">取消订单</text>
        </view>
        <view class="action-btn action-btn--primary" @click="handlePayNow">
          <text class="btn-text">立即支付</text>
        </view>
      </view>

      <!-- 已支付状态 -->
      <view v-else-if="order.status === 'paid'" class="action-buttons">
        <view class="action-btn action-btn--ghost" @click="handleRefund">
          <text class="btn-text">申请退款</text>
        </view>
        <view class="action-btn action-btn--primary" @click="handleScanUnlock">
          <text class="btn-text">开锁入住</text>
        </view>
      </view>

      <!-- 已完成状态 -->
      <view v-else-if="order.status === 'used'" class="action-buttons">
        <view class="action-btn action-btn--ghost" @click="handleContactService">
          <text class="btn-text">联系客服</text>
        </view>
        <view class="action-btn action-btn--primary" @click="handleReorder">
          <text class="btn-text">再来一单</text>
        </view>
      </view>

      <!-- 已取消状态 -->
      <view v-else-if="order.status === 'cancelled'" class="action-buttons">
        <view class="action-btn action-btn--ghost" @click="handleDeleteOrder">
          <text class="btn-text">删除订单</text>
        </view>
        <view class="action-btn action-btn--primary" @click="handleReorder">
          <text class="btn-text">再来一单</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import Icon from '@/components/common/Icon.vue'
import request from '@/utils/request'

export default {
  name: 'OrderDetailPage',
  components: {
    Icon
  },
  setup() {
    const orderId = ref('')
    const order = ref({})

    // 订单状态配置
    const statusConfig = computed(() => {
      const configs = {
        pending: {
          text: '等待支付',
          desc: '请在15分钟内完成支付，超时订单将自动取消',
          icon: 'clock',
          color: '#F59E0B',
          bgGradient: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)'
        },
        paid: {
          text: '支付成功',
          desc: '您可以使用开锁码或扫码开锁入住房间',
          icon: 'success',
          color: '#10B981',
          bgGradient: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)'
        },
        used: {
          text: '已完成',
          desc: '感谢您的使用，期待您的再次光临',
          icon: 'success',
          color: '#3B82F6',
          bgGradient: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)'
        },
        cancelled: {
          text: '已取消',
          desc: '订单已取消，如有疑问请联系客服',
          icon: 'x-circle',
          color: '#EF4444',
          bgGradient: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)'
        },
        refunded: {
          text: '已退款',
          desc: '退款已原路返回，请注意查收',
          icon: 'rotate-ccw',
          color: '#8B5CF6',
          bgGradient: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)'
        },
        expired: {
          text: '已过期',
          desc: '订单已超时，如需继续使用请重新预订',
          icon: 'alert-circle',
          color: '#6B7280',
          bgGradient: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)'
        }
      }
      return configs[order.value.status] || configs.pending
    })

    // 支付方式文本
    const paymentMethodText = computed(() => {
      const methods = {
        balance: '余额支付',
        wechat: '微信支付',
        alipay: '支付宝'
      }
      return methods[order.value.paymentMethod] || '未知'
    })

    // 是否显示操作栏
    const showActionBar = computed(() => {
      return order.value && order.value.status && ['pending', 'paid', 'used', 'cancelled'].includes(order.value.status)
    })

    // 倒计时(待支付订单)
    const countdown = ref('')
    let countdownTimer = null

    // 计算倒计时
    const calculateCountdown = () => {
      if (order.value.status !== 'pending' || !order.value.createTime) {
        countdown.value = ''
        return
      }

      const createTime = new Date(order.value.createTime).getTime()
      const expireTime = createTime + 15 * 60 * 1000 // 15分钟后过期
      const now = Date.now()
      const diff = expireTime - now

      if (diff <= 0) {
        countdown.value = '已超时'
        clearInterval(countdownTimer)
        return
      }

      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      countdown.value = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }

    // 启动倒计时
    const startCountdown = () => {
      calculateCountdown()
      countdownTimer = setInterval(calculateCountdown, 1000)
    }

    // 获取订单详情
    const fetchOrderDetail = async () => {
      try {
        const res = await request({
          url: `/api/orders/${orderId.value}`,
          method: 'GET'
        })
        order.value = res.data

        // 如果是待支付状态,启动倒计时
        if (order.value.status === 'pending') {
          startCountdown()
        }
      } catch (error) {
        uni.showToast({
          title: '获取订单详情失败',
          icon: 'none'
        })
      }
    }

    // 返回
    const handleBack = () => {
      uni.navigateBack()
    }

    // 扫码开锁
    const handleScanUnlock = () => {
      uni.navigateTo({
        url: '/pages/scan/index?type=unlock'
      })
    }

    // 输入开锁码
    const handleCodeUnlock = () => {
      uni.navigateTo({
        url: `/pages/hotel/unlock?orderId=${orderId.value}&mode=code`
      })
    }

    // 复制开锁码
    const handleCopyCode = () => {
      uni.setClipboardData({
        data: order.value.unlockCode,
        success: () => {
          uni.showToast({
            title: '已复制开锁码',
            icon: 'success'
          })
        }
      })
    }

    // 复制订单号
    const handleCopyOrder = () => {
      uni.setClipboardData({
        data: order.value.orderNo,
        success: () => {
          uni.showToast({
            title: '已复制订单号',
            icon: 'success'
          })
        }
      })
    }

    // 取消订单
    const handleCancelOrder = () => {
      uni.showModal({
        title: '提示',
        content: '确认取消订单吗?',
        success: async (res) => {
          if (res.confirm) {
            try {
              await request({
                url: `/api/orders/${orderId.value}/cancel`,
                method: 'POST'
              })
              uni.showToast({
                title: '订单已取消',
                icon: 'success'
              })
              fetchOrderDetail()
            } catch (error) {
              uni.showToast({
                title: '取消订单失败',
                icon: 'none'
              })
            }
          }
        }
      })
    }

    // 立即支付
    const handlePayNow = () => {
      // 检查订单是否超时
      if (countdown.value === '已超时') {
        uni.showModal({
          title: '提示',
          content: '订单已超时，请重新下单',
          showCancel: false,
          success: () => {
            uni.navigateBack()
          }
        })
        return
      }

      // 跳转到支付确认页面或直接调起支付
      uni.showActionSheet({
        itemList: ['余额支付', '微信支付', '支付宝'],
        success: async (res) => {
          const paymentMethods = ['balance', 'wechat', 'alipay']
          const selectedMethod = paymentMethods[res.tapIndex]

          try {
            uni.showLoading({ title: '支付中...' })

            // 调用支付接口
            const payRes = await request({
              url: `/api/orders/${orderId.value}/pay`,
              method: 'POST',
              data: {
                paymentMethod: selectedMethod
              }
            })

            uni.hideLoading()

            if (payRes.code === 200) {
              uni.showToast({
                title: '支付成功',
                icon: 'success'
              })

              // 刷新订单详情
              setTimeout(() => {
                fetchOrderDetail()
              }, 1500)
            } else {
              uni.showToast({
                title: payRes.message || '支付失败',
                icon: 'none'
              })
            }
          } catch (error) {
            uni.hideLoading()
            uni.showToast({
              title: '支付失败',
              icon: 'none'
            })
          }
        }
      })
    }

    // 再来一单
    const handleReorder = () => {
      uni.navigateTo({
        url: `/pages/hotel/room-detail?hotelId=${order.value.hotelId}&roomId=${order.value.roomId}`
      })
    }

    // 申请退款
    const handleRefund = () => {
      uni.showModal({
        title: '申请退款',
        content: '确认要申请退款吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              await request({
                url: `/api/orders/${orderId.value}/refund`,
                method: 'POST'
              })
              uni.showToast({
                title: '退款申请已提交',
                icon: 'success'
              })
              fetchOrderDetail()
            } catch (error) {
              uni.showToast({
                title: '申请退款失败',
                icon: 'none'
              })
            }
          }
        }
      })
    }

    // 联系客服
    const handleContactService = () => {
      uni.navigateTo({
        url: '/pages/user/customer-service'
      })
    }

    // 删除订单
    const handleDeleteOrder = () => {
      uni.showModal({
        title: '提示',
        content: '确认删除订单吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              await request({
                url: `/api/orders/${orderId.value}`,
                method: 'DELETE'
              })
              uni.showToast({
                title: '订单已删除',
                icon: 'success'
              })
              setTimeout(() => {
                uni.navigateBack()
              }, 1500)
            } catch (error) {
              uni.showToast({
                title: '删除订单失败',
                icon: 'none'
              })
            }
          }
        }
      })
    }

    // 页面加载
    onLoad((options) => {
      if (options.orderId) {
        orderId.value = options.orderId
        fetchOrderDetail()
      }
    })

    return {
      order,
      statusConfig,
      paymentMethodText,
      showActionBar,
      countdown,
      handleBack,
      handleScanUnlock,
      handleCodeUnlock,
      handleCopyCode,
      handleCopyOrder,
      handleCancelOrder,
      handlePayNow,
      handleReorder,
      handleRefund,
      handleContactService,
      handleDeleteOrder
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.order-detail-page {
  min-height: 100vh;
  background: $background-secondary;
  display: flex;
  flex-direction: column;
  padding-bottom: 120rpx;
}

// 导航栏
.header-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background: $background-primary;
  @include flex-between();
  @include shadow(base);
  align-items: center;
  padding: 0 $spacing-base;
  z-index: 100;

  &-left,
  &-right {
    flex: 0 0 auto;
    width: 48rpx;
    height: 48rpx;
    @include flex-center();
    border-radius: $border-radius-full;
    transition: background-color $transition-base;

    &:active {
      background: $background-secondary;
    }
  }

  &-center {
    flex: 1;
    text-align: center;
  }

  .header-title {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $text-primary;
  }
}

// 订单状态卡片
.status-card {
  @include flex-start();
  align-items: center;
  gap: 20rpx;
  padding: 32rpx 24rpx;
  margin-bottom: 16rpx;
  position: relative;
  overflow: hidden;

  .status-icon-wrapper {
    @include flex-center();
    width: 96rpx;
    height: 96rpx;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    flex-shrink: 0;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  }

  .status-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .status-header {
    @include flex-between();
    align-items: center;
  }

  .status-text {
    font-size: 34rpx;
    font-weight: $font-weight-bold;
  }

  .countdown-badge {
    @include flex-center();
    gap: 6rpx;
    padding: 6rpx 12rpx;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 20rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  }

  .countdown-text {
    font-size: 22rpx;
    font-weight: $font-weight-semibold;
  }

  .status-desc {
    font-size: 24rpx;
    color: rgba(0, 0, 0, 0.6);
    line-height: 1.6;
  }
}

.content {
  flex: 1;
  flex-direction: column;
  padding-top: 88rpx;
}

// 开锁卡片
.unlock-card {
  background: linear-gradient(135deg, rgba($primary-color, 0.1) 0%, #ede9fe 100%);
  padding: 24rpx;
  margin-bottom: 16rpx;

  .unlock-header {
    @include flex-start();
    align-items: center;
    gap: 8rpx;
    margin-bottom: 20rpx;
  }

  .unlock-title {
    font-size: 28rpx;
    font-weight: $font-weight-semibold;
    color: $text-primary;
  }

  .unlock-methods {
    @include flex-center();
    gap: 32rpx;
    margin-bottom: 24rpx;
  }

  .unlock-method {
    @include flex-center();
    flex-direction: column;
    gap: 12rpx;
    padding: 24rpx;
    background: $background-primary;
    border-radius: 24rpx;
    min-width: 200rpx;
    transition: all $transition-base;

    &:active {
      transform: scale(0.95);
      opacity: 0.8;
    }

    .method-text {
      font-size: 26rpx;
      font-weight: $font-weight-medium;
      color: $text-primary;
    }
  }

  .unlock-code-box {
    @include flex-between();
    align-items: center;
    gap: 16rpx;
    padding: 20rpx 28rpx;
    background: $background-primary;
    border-radius: $border-radius-full;

    .code-label {
      font-size: 26rpx;
      color: $text-secondary;
    }

    .code-value {
      flex: 1;
      font-size: 32rpx;
      font-weight: $font-weight-bold;
      color: $primary-color;
      letter-spacing: 4rpx;
      text-align: center;
    }

    .copy-btn {
      @include flex-center();
      width: 60rpx;
      height: 60rpx;
      border-radius: $border-radius-full;
      background: rgba($primary-dark, 0.1);
      transition: all $transition-base;

      &:active {
        transform: scale(0.9);
      }
    }
  }
}

// 区块卡片
.section-card {
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
}

// 酒店信息块
.hotel-info-block {
  margin-bottom: 0;

  .hotel-header {
    @include flex-between();
    align-items: center;
    margin-bottom: 16rpx;
  }

  .hotel-name {
    font-size: 30rpx;
    font-weight: $font-weight-bold;
    color: $text-primary;
    flex: 1;
  }

  .hotel-badge {
    @include flex-center();
    gap: 4rpx;
    padding: 6rpx 12rpx;
    background: rgba($success-color, 0.1);
    border-radius: 20rpx;

    .badge-text {
      font-size: 22rpx;
      color: $success-color;
      font-weight: $font-weight-medium;
    }
  }

  .hotel-address {
    @include flex-start();
    align-items: center;
    gap: 8rpx;
    padding: 12rpx;
    background: $background-secondary;
    border-radius: 12rpx;

    .address-text {
      flex: 1;
      font-size: 24rpx;
      color: $text-secondary;
      line-height: 1.5;
    }
  }
}

// 分隔线
.divider {
  height: 1rpx;
  background: $border-light;
  margin: 20rpx 0;
}

// 房间信息块
.room-info-block {
  .room-label {
    @include flex-start();
    align-items: center;
    gap: 8rpx;
    margin-bottom: 16rpx;

    .label-text {
      font-size: 26rpx;
      color: $text-secondary;
      font-weight: $font-weight-medium;
    }
  }

  .room-content {
    @include flex-start();
    gap: 16rpx;
    padding: 16rpx;
    background: $background-secondary;
    border-radius: 16rpx;
  }

  .room-image {
    flex: 0 0 auto;
    width: 180rpx;
    height: 135rpx;
    border-radius: 12rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  }

  .room-detail {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 8rpx;

    .room-name {
      font-size: 28rpx;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      @include ellipsis();
    }

    .room-specs {
      @include flex-start();
      flex-wrap: wrap;
      gap: 16rpx;
    }

    .spec-item {
      @include flex-start();
      align-items: center;
      gap: 6rpx;

      .spec-text {
        font-size: 24rpx;
        color: $text-secondary;
      }
    }
  }
}

// 信息列表
.order-info-list,
.payment-info-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;

  .info-row {
    @include flex-between();
    align-items: center;

    .label {
      font-size: 26rpx;
      color: $text-secondary;
    }

    .value {
      font-size: 26rpx;
      color: $text-primary;
    }

    .value-box {
      @include flex-end();
      align-items: center;
      gap: 12rpx;
    }

    .copy-btn {
      @include flex-center();
      width: 44rpx;
      height: 44rpx;
      border-radius: $border-radius-full;
      background: rgba($primary-color, 0.1);
      transition: all $transition-base;

      &:active {
        transform: scale(0.9);
      }
    }

    .discount-value {
      font-size: 26rpx;
      color: $error-color;
    }

    &.total-row {
      padding-top: 16rpx;
      border-top: 2rpx solid $border-light;
      margin-top: 8rpx;

      .label {
        font-size: 28rpx;
        font-weight: $font-weight-semibold;
        color: $text-primary;
      }

      .total-value {
        font-size: 32rpx;
        font-weight: $font-weight-bold;
        color: $error-color;
      }
    }
  }
}

// 底部留白
.bottom-spacer {
  height: 40rpx;
}

// 底部操作栏
.action-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 24rpx;
  background: $background-primary;
  border-top: 1rpx solid $border-light;
  z-index: 99;

  .action-buttons {
    @include flex-center();
    gap: 24rpx;
  }

  .action-btn {
    flex: 1;
    @include flex-center();
    gap: 8rpx;
    height: 80rpx;
    border-radius: 44rpx;
    font-size: 28rpx;
    font-weight: $font-weight-semibold;
    transition: all $transition-base;

    &:active {
      transform: scale(0.95);
    }

    &--primary {
      background: linear-gradient(135deg, $primary-color 0%, #8b5cf6 100%);
      box-shadow: 0 4rpx 16rpx rgba($primary-color, 0.3);

      .btn-text {
        color: #fff;
      }

      &:active {
        box-shadow: 0 2rpx 8rpx rgba($primary-color, 0.2);
      }
    }

    &--ghost {
      background: $background-primary;
      border: 2rpx solid $border-color;

      .btn-text {
        color: $text-secondary;
      }

      &:active {
        background: $background-secondary;
      }
    }

    .btn-text {
      font-size: 28rpx;
      font-weight: $font-weight-semibold;
    }
  }
}
</style>
