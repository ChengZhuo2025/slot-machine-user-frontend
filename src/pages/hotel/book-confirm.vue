<template>
  <view class="book-confirm-page">
    <!-- 导航栏 -->
    <view class="header-bar">
      <view class="header-left" @click="handleBack">
        <Icon name="arrow-left" size="medium" color="#333" />
      </view>
      <view class="header-center">
        <text class="header-title">确认订单</text>
      </view>
      <view class="header-right"></view>
    </view>

    <scroll-view class="content" scroll-y="true">
      <!-- 酒店房间信息 -->
      <view class="info-card animate__animated animate__fadeInDown">
        <view class="hotel-name">{{ hotelInfo.name }}</view>
        <view class="room-info">
          <image class="room-image" :src="roomInfo.image" mode="aspectFill" />
          <view class="room-detail">
            <text class="room-name">{{ roomInfo.name }}</text>
            <view class="room-specs">
              <text class="spec">{{ roomInfo.area }}m²</text>
              <text class="spec-divider">|</text>
              <text class="spec">{{ roomInfo.bedType }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 预订信息 -->
      <view class="section-card animate__animated animate__fadeInUp" style="animation-delay: 100ms;">
        <view class="section-title">
          <Icon name="calendar" size="small" color="#333" />
          <text class="title-text">预订信息</text>
        </view>
        <view class="booking-info-list">
          <view class="info-row">
            <text class="label">• 入住日期</text>
            <text class="value">{{ bookingDate }}</text>
          </view>
          <view class="info-row">
            <text class="label">• 入住时段</text>
            <text class="value">{{ timeSlotInfo.startTime }} - {{ timeSlotInfo.endTime }}</text>
          </view>
          <view class="info-row">
            <text class="label">• 入住时长</text>
            <text class="value">{{ timeSlotInfo.duration }}小时</text>
          </view>
        </view>
      </view>

      <!-- 联系人信息 -->
      <view class="section-card animate__animated animate__fadeInUp" style="animation-delay: 200ms;">
        <view class="section-title">
          <Icon name="user" size="small" color="#333" />
          <text class="title-text">联系人信息</text>
        </view>
        <view class="contact-form">
          <view class="form-item">
            <view>
              <text class="form-label">• 姓名</text>
              <input
                class="form-input"
                v-model="contactInfo.name"
                placeholder="请输入姓名"
                placeholder-class="input-placeholder"
              />
            </view>
          </view>
          <view class="form-item">
            <view>
              <text class="form-label">• 手机号</text>
              <input
                class="form-input"
                :class="{ 'form-input--error': phoneError }"
                v-model="contactInfo.phone"
                type="number"
                placeholder="请输入手机号"
                placeholder-class="input-placeholder"
                @blur="validatePhone"
              />
            </view>
            <text v-if="phoneError" class="error-tip">{{ phoneError }}</text>
          </view>
        </view>
      </view>

      <!-- 价格明细 -->
      <PriceDetail :items="priceItems" :total="totalPrice" class="animate__animated animate__fadeInUp" style="animation-delay: 300ms;" />

      <!-- 支付方式 -->
      <PaymentMethod v-model="paymentMethod" class="animate__animated animate__fadeInUp" style="animation-delay: 400ms;" />

      <!-- 用户协议 -->
      <view class="agreement-section animate__animated animate__fadeInUp" style="animation-delay: 500ms;">
        <checkbox-group @change="handleAgreementChange">
          <label class="agreement-label">
            <checkbox class="agreement-checkbox" :checked="agreedToTerms" />
            <text class="agreement-text">
              我已阅读并同意
              <text class="link-text" @click.stop="viewTerms">《预订协议》</text>
              和
              <text class="link-text" @click.stop="viewPrivacy">《隐私政策》</text>
            </text>
          </label>
        </checkbox-group>
      </view>
    </scroll-view>

    <!-- 底部支付栏 -->
    <view class="payment-bar animate__animated animate__slideInUp">
      <view class="price-info">
        <text class="price-label">实付金额</text>
        <view class="price-box">
          <text class="price">¥{{ totalPrice }}</text>
        </view>
      </view>
      <view
        class="pay-button"
        :class="{ 'pay-button--disabled': !canPay }"
        @click="handlePay"
      >
        <text class="button-text">立即支付</text>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import Icon from '@/components/common/Icon.vue'
import PriceDetail from '@/components/hotel/PriceDetail.vue'
import PaymentMethod from '@/components/hotel/PaymentMethod.vue'
import { requireAuth } from '@/utils/authGuard'
import request from '@/utils/request'

export default {
  name: 'BookConfirmPage',
  components: {
    Icon,
    PriceDetail,
    PaymentMethod
  },
  setup() {
    const hotelId = ref('')
    const roomId = ref('')
    const bookingDate = ref('')
    const slotId = ref('')

    const hotelInfo = ref({})
    const roomInfo = ref({})
    const timeSlotInfo = ref({})

    const contactInfo = ref({
      name: '',
      phone: ''
    })

    const paymentMethod = ref('balance')
    const agreedToTerms = ref(false)
    const phoneError = ref('')

    // 手机号验证
    const validatePhone = () => {
      const phone = contactInfo.value.phone
      if (!phone) {
        phoneError.value = '请输入手机号'
        return false
      }
      if (!/^1[3-9]\d{9}$/.test(phone)) {
        phoneError.value = '手机号格式不正确'
        return false
      }
      phoneError.value = ''
      return true
    }

    // 价格明细
    const priceItems = computed(() => [
      {
        label: '房费',
        value: timeSlotInfo.value.price || 0
      }
    ])

    // 总价
    const totalPrice = computed(() => {
      return priceItems.value.reduce((sum, item) => sum + item.value, 0)
    })

    // 是否可以支付
    const canPay = computed(() => {
      return (
        contactInfo.value.name &&
        contactInfo.value.phone &&
        /^1[3-9]\d{9}$/.test(contactInfo.value.phone) &&
        paymentMethod.value &&
        agreedToTerms.value
      )
    })

    // 获取订单详情
    const fetchOrderDetail = async () => {
      try {
        // 获取酒店信息
        const hotelRes = await request({
          url: `/api/hotels/${hotelId.value}`,
          method: 'GET'
        })
        hotelInfo.value = hotelRes.data

        // 获取房间信息
        const roomRes = await request({
          url: `/api/hotels/${hotelId.value}/rooms/${roomId.value}`,
          method: 'GET'
        })
        roomInfo.value = roomRes.data

        // 获取时段信息
        const slotsRes = await request({
          url: `/api/hotels/${hotelId.value}/rooms/${roomId.value}/timeslots`,
          method: 'GET',
          data: { date: bookingDate.value }
        })
        const slot = slotsRes.data.find(s => s.id === slotId.value)
        if (slot) {
          timeSlotInfo.value = slot
        }
      } catch (error) {
        uni.showToast({
          title: '获取订单信息失败',
          icon: 'none'
        })
      }
    }

    // 协议变更
    const handleAgreementChange = (e) => {
      agreedToTerms.value = e.detail.value.length > 0
    }

    // 查看协议
    const viewTerms = () => {
      uni.showToast({
        title: '查看预订协议',
        icon: 'none'
      })
    }

    // 查看隐私政策
    const viewPrivacy = () => {
      uni.showToast({
        title: '查看隐私政策',
        icon: 'none'
      })
    }

    // 返回
    const handleBack = () => {
      uni.navigateBack()
    }

    // 支付
    const handlePay = async () => {
      if (!canPay.value) {
        if (!contactInfo.value.name) {
          uni.showToast({ title: '请输入姓名', icon: 'none' })
        } else if (!contactInfo.value.phone) {
          uni.showToast({ title: '请输入手机号', icon: 'none' })
        } else if (!/^1[3-9]\d{9}$/.test(contactInfo.value.phone)) {
          uni.showToast({ title: '手机号格式不正确', icon: 'none' })
        } else if (!agreedToTerms.value) {
          uni.showToast({ title: '请阅读并同意协议', icon: 'none' })
        }
        return
      }

      try {
        uni.showLoading({ title: '正在支付...' })

        // 创建订单
        const res = await request({
          url: `/api/hotels/${hotelId.value}/rooms/${roomId.value}/book`,
          method: 'POST',
          data: {
            date: bookingDate.value,
            slotId: slotId.value,
            contactName: contactInfo.value.name,
            contactPhone: contactInfo.value.phone,
            paymentMethod: paymentMethod.value
          }
        })

        uni.hideLoading()

        if (res.code === 200) {
          // 支付成功，跳转到订单详情页
          uni.redirectTo({
            url: `/pages/hotel/order-detail?orderId=${res.data.orderId}`
          })
        } else {
          uni.showToast({
            title: res.message || '支付失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: '支付失败，请稍后重试',
          icon: 'none'
        })
      }
    }

    // T306: 添加登录守卫
    onShow(() => {
      requireAuth()
    })

    // 页面加载
    onLoad((options) => {
      if (options.hotelId && options.roomId && options.date && options.slotId) {
        hotelId.value = options.hotelId
        roomId.value = options.roomId
        bookingDate.value = options.date
        slotId.value = options.slotId
        fetchOrderDetail()
      }
    })

    return {
      hotelInfo,
      roomInfo,
      bookingDate,
      timeSlotInfo,
      contactInfo,
      paymentMethod,
      agreedToTerms,
      phoneError,
      priceItems,
      totalPrice,
      canPay,
      handleBack,
      handleAgreementChange,
      viewTerms,
      viewPrivacy,
      handlePay,
      validatePhone
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.book-confirm-page {
  min-height: 100vh;
  background: $background-secondary;
  display: flex;
  flex-direction: column;
  padding-bottom: 140rpx;
  @include safe-area-inset-bottom(140rpx);
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
  @include shadow();
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

.content {
  flex: 1;
  flex-direction: column;
  padding-top: 88rpx;
}

// 酒店信息卡片
.info-card {
  background: $background-primary;
  padding: 24rpx;
  margin-bottom: 16rpx;

  .hotel-name {
    font-size: 28rpx;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin-bottom: 16rpx;
  }

  .room-info {
    @include flex-start();
    gap: 16rpx;
  }

  .room-image {
    flex: 0 0 auto;
    width: 160rpx;
    height: 120rpx;
    border-radius: 16rpx;
  }

  .room-detail {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 8rpx;
  }

  .room-name {
    font-size: 26rpx;
    font-weight: $font-weight-medium;
    color: $text-primary;
  }

  .room-specs {
    @include flex-start();
    gap: 12rpx;
  }

  .spec {
    font-size: 24rpx;
    color: $text-secondary;
  }

  .spec-divider {
    font-size: 24rpx;
    color: $text-tertiary;
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

// 预订信息列表
.booking-info-list {
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
      font-weight: $font-weight-medium;
      color: $text-primary;
    }
  }
}

// 联系人表单
.contact-form {
  display: flex;
  flex-direction: column;
  gap: 20rpx;

  .form-item {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 8rpx;

    > view:first-child {
      @include flex-between();
      align-items: center;
      gap: 24rpx;
    }
  }

  .form-label {
    flex: 0 0 auto;
    font-size: 26rpx;
    color: $text-primary;
    width: 120rpx;
  }

  .form-input {
    flex: 1;
    height: 60rpx;
    padding: 0 20rpx;
    background: $background-secondary;
    border-radius: 16rpx;
    font-size: 26rpx;
    color: $text-primary;
    border: 2rpx solid transparent;
    transition: border-color $transition-base;

    &--error {
      border-color: $error-color;
      background: rgba($error-color, 0.05);
    }
  }

  .input-placeholder {
    color: $text-tertiary;
    font-size: 26rpx;
  }

  .error-tip {
    font-size: 22rpx;
    color: $error-color;
    padding-left: 144rpx;
    line-height: 1.4;
  }
}

// 协议区域
.agreement-section {
  padding: 24rpx;
  margin-bottom: 16rpx;

  .agreement-label {
    @include flex-center();
    gap: 4rpx;
  }

  .agreement-checkbox {
    flex: 0 0 auto;
    transform: scale(0.75);
  }

  .agreement-text {
    flex: 1;
    font-size: 24rpx;
    color: $text-secondary;
    line-height: 1.6;
  }

  .link-text {
    color: $primary-color;
    text-decoration: underline;
  }
}

// 底部留白
.bottom-spacer {
  height: 40rpx;
}

// 底部支付栏
.payment-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  @include flex-between();
  align-items: center;
  gap: 24rpx;
  padding: 20rpx 24rpx;
  background: $background-primary;
  border-top: 2rpx solid $border-light;
  z-index: 100;
  @include safe-area-inset-bottom(20rpx);

  .price-info {
    flex: 1;
  }

  .price-label {
    display: block;
    font-size: 24rpx;
    color: $text-secondary;
    margin-bottom: 6rpx;
  }

  .price-box {
    @include flex-start();
    align-items: baseline;
  }

  .price {
    font-size: 36rpx;
    font-weight: $font-weight-bold;
    color: $error-color;
  }

  .pay-button {
    flex: 0 0 auto;
    @include flex-center();
    min-width: 240rpx;
    height: 80rpx;
    padding: 0 40rpx;
    background: $gradient-primary;
    border-radius: 40rpx;
    transition: all $transition-base;

    &:active {
      transform: scale(0.95);
      opacity: 0.8;
    }

    &--disabled {
      background: $text-tertiary;
      opacity: 0.5;
    }

    .button-text {
      font-size: 28rpx;
      font-weight: $font-weight-semibold;
      color: #fff;
    }
  }
}
</style>
