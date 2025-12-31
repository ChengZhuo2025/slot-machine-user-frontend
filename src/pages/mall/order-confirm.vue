<template>
  <view class="order-confirm-page">
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

    <scroll-view class="content" scroll-y="true" :show-scrollbar="false">
      <!-- 收货地址 - 子任务 7.2 -->
      <view
        class="address-card animate__animated animate__fadeInDown"
        @click="handleSelectAddress"
      >
        <view v-if="selectedAddress" class="address-content">
          <view class="address-header">
            <Icon name="location" size="medium" color="#6366f1" />
            <view class="address-info">
              <view class="address-name-phone">
                <text class="receiver-name">{{ selectedAddress.name }}</text>
                <text class="receiver-phone">{{ selectedAddress.phone }}</text>
              </view>
              <text class="address-detail">{{ selectedAddress.fullAddress }}</text>
            </view>
            <Icon name="chevron-right" size="medium" color="#999" />
          </view>
        </view>
        <view v-else class="address-empty">
          <Icon name="location" size="medium" color="#999" />
          <text class="empty-text">请选择收货地址</text>
          <Icon name="chevron-right" size="medium" color="#999" />
        </view>
      </view>

      <!-- 商品清单 - 子任务 7.3 -->
      <view class="goods-card animate__animated animate__fadeInUp" style="animation-delay: 100ms;">
        <view class="section-title">
          <Icon name="shopping-bag" size="small" color="#333" />
          <text class="title-text">商品清单</text>
        </view>
        <view class="goods-list">
          <view v-for="item in orderItems" :key="item.itemId" class="goods-item">
            <image :src="item.image" class="goods-image" mode="aspectFill" />
            <view class="goods-info">
              <text class="goods-name">{{ item.name }}</text>
              <text v-if="item.specs" class="goods-specs">{{ item.specs }}</text>
              <view class="goods-footer">
                <view class="goods-price">
                  <text class="price-symbol">¥</text>
                  <text class="price-value">{{ item.price }}</text>
                </view>
                <text class="goods-quantity">x{{ item.quantity }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 优惠券选择 - 子任务 7.4 -->
      <view
        class="coupon-card animate__animated animate__fadeInUp"
        style="animation-delay: 200ms;"
        @click="handleSelectCoupon"
      >
        <view class="coupon-content">
          <view class="coupon-left">
            <Icon name="ticket" size="medium" color="#f59e0b" />
            <text class="coupon-label">优惠券</text>
          </view>
          <view class="coupon-right">
            <text v-if="selectedCoupon" class="coupon-value">
              -¥{{ calculateCouponDiscount() }}
            </text>
            <text v-else class="coupon-hint">
              {{ availableCoupons.length > 0 ? `${availableCoupons.length}张可用` : '暂无可用' }}
            </text>
            <Icon name="chevron-right" size="medium" color="#999" />
          </view>
        </view>
      </view>

      <!-- 价格明细 - 子任务 7.5 -->
      <PriceDetail
        :items="priceItems"
        :total="finalAmount"
        class="animate__animated animate__fadeInUp"
        style="animation-delay: 400ms;"
      />

      <!-- 支付方式 - 子任务 7.5 -->
      <PaymentMethod
        v-model="paymentMethod"
        class="animate__animated animate__fadeInUp"
        style="animation-delay: 500ms;"
      />

      <!-- 订单备注 -->
      <view class="remark-card animate__animated animate__fadeInUp" style="animation-delay: 300ms;">
        <view class="section-title">
          <Icon name="edit" size="small" color="#333" />
          <text class="title-text">订单备注</text>
        </view>
        <textarea
          v-model="orderRemark"
          class="remark-input"
          placeholder="选填，请输入订单备注信息"
          placeholder-class="input-placeholder"
          maxlength="200"
        />
        <text class="remark-count">{{ orderRemark.length }}/200</text>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-placeholder"></view>
    </scroll-view>

    <!-- 底部提交栏 - 子任务 7.6 -->
    <view class="footer-bar animate__animated animate__slideInUp">
      <view class="price-info">
        <text class="price-label">实付金额</text>
        <view class="price-box">
          <text class="price-symbol">¥</text>
          <text class="price-value">{{ finalAmount.toFixed(2) }}</text>
        </view>
      </view>
      <button
        class="submit-btn"
        :class="{ 'submit-btn--disabled': !canSubmit }"
        :disabled="!canSubmit"
        @click="handleSubmitOrder"
      >
        提交订单
      </button>
    </view>

    <!-- 地址管理器 -->
    <AddressManager
      v-if="showAddressManager"
      :show="showAddressManager"
      mode="select"
      @close="showAddressManager = false"
      @select="handleAddressSelected"
    />

    <!-- 优惠券选择器 -->
    <CouponSelector
      :show="showCouponSelector"
      :coupons="availableCoupons"
      :order-amount="productAmount"
      :selected-id="selectedCouponId"
      @close="showCouponSelector = false"
      @confirm="handleCouponSelected"
    />
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Icon from '@/components/common/Icon.vue'
import PriceDetail from '@/components/hotel/PriceDetail.vue'
import PaymentMethod from '@/components/hotel/PaymentMethod.vue'
import AddressManager from '@/components/user/AddressManager.vue'
import CouponSelector from '@/components/mall/CouponSelector.vue'
import { useCartStore } from '@/stores/cart'
import request from '@/utils/request'

export default {
  name: 'OrderConfirmPage',
  components: {
    Icon,
    PriceDetail,
    PaymentMethod,
    AddressManager,
    CouponSelector
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const cartStore = useCartStore()

    // 订单商品
    const orderItems = ref([])

    // 收货地址
    const selectedAddress = ref(null)
    const showAddressManager = ref(false)

    // 优惠券
    const availableCoupons = ref([])
    const selectedCoupon = ref(null)
    const selectedCouponId = ref(null)
    const showCouponSelector = ref(false)

    // 订单备注
    const orderRemark = ref('')

    // 支付方式
    const paymentMethod = ref('wechat')

    // 商品金额
    const productAmount = computed(() => {
      return orderItems.value.reduce((total, item) => {
        return total + item.price * item.quantity
      }, 0)
    })

    // 运费
    const shippingFee = computed(() => {
      // 满99免运费
      return productAmount.value >= 99 ? 0 : 10
    })

    // 优惠金额
    const discountAmount = computed(() => {
      return calculateCouponDiscount()
    })

    // 实付金额
    const finalAmount = computed(() => {
      return Math.max(0, productAmount.value + shippingFee.value - discountAmount.value)
    })

    // 价格明细
    const priceItems = computed(() => {
      const items = [
        { label: '商品金额', value: productAmount.value.toFixed(2) },
        { label: '运费', value: shippingFee.value.toFixed(2) }
      ]

      if (discountAmount.value > 0) {
        items.push({
          label: '优惠券',
          value: `-${discountAmount.value.toFixed(2)}`,
          highlight: true
        })
      }

      return items
    })

    // 是否可以提交
    const canSubmit = computed(() => {
      return selectedAddress.value && orderItems.value.length > 0
    })

    // 初始化订单数据
    const initOrderData = async () => {
      // 从购物车获取选中商品
      const selectedItems = cartStore.selectedItems
      if (selectedItems && selectedItems.length > 0) {
        orderItems.value = selectedItems.map(item => ({
          itemId: item.itemId,
          productId: item.productId || item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          specs: item.specs
        }))
        return
      }

      // 如果是从商品详情页或首页直接购买
      const productId = route.query.productId
      if (productId) {
        const quantity = parseInt(route.query.quantity) || 1
        let specsText = ''

        // 处理规格参数 - 可能是文本或JSON字符串
        if (route.query.specs) {
          const specsParam = decodeURIComponent(route.query.specs)
          try {
            // 尝试解析为JSON对象
            const specsObj = JSON.parse(specsParam)
            // 如果是对象,转换为文本格式
            if (typeof specsObj === 'object' && specsObj !== null) {
              specsText = Object.values(specsObj).join(' ')
            } else {
              specsText = specsParam
            }
          } catch (e) {
            // 不是JSON,直接使用文本
            specsText = specsParam
          }
        }

        // 获取商品详情
        try {
          const res = await request({
            url: `/api/mall/products/${productId}`,
            method: 'GET'
          })

          if (res.code === 200) {
            const product = res.data
            orderItems.value = [{
              itemId: `${productId}_${Date.now()}`,
              productId: productId,
              name: product.name,
              image: product.images?.[0] || product.image || '',
              price: product.price,
              quantity: quantity,
              specs: specsText || '默认规格'
            }]
          }
        } catch (error) {
          console.error('获取商品信息失败:', error)
          uni.showToast({ title: '获取商品信息失败', icon: 'none' })
        }
      }
    }

    // 获取可用优惠券
    const fetchAvailableCoupons = async () => {
      try {
        const res = await request({
          url: '/api/mall/coupons/available',
          method: 'GET',
          params: { amount: productAmount.value }
        })

        if (res.code === 200) {
          availableCoupons.value = res.data || []
        }
      } catch (error) {
        console.error('获取优惠券失败:', error)
      }
    }

    // 计算优惠券折扣
    const calculateCouponDiscount = () => {
      if (!selectedCoupon.value) return 0

      const coupon = selectedCoupon.value
      if (coupon.type === 'cash') {
        // 满减券
        return coupon.amount
      } else if (coupon.type === 'discount') {
        // 折扣券
        const discount = productAmount.value * (1 - coupon.amount / 100)
        return Math.floor(discount * 100) / 100
      }

      return 0
    }

    // 返回
    const handleBack = () => {
      uni.navigateBack()
    }

    // 选择收货地址
    const handleSelectAddress = () => {
      showAddressManager.value = true
    }

    // 地址选择回调
    const handleAddressSelected = (address) => {
      selectedAddress.value = address
      showAddressManager.value = false
    }

    // 选择优惠券
    const handleSelectCoupon = () => {
      if (availableCoupons.value.length === 0) {
        uni.showToast({ title: '暂无可用优惠券', icon: 'none' })
        return
      }
      showCouponSelector.value = true
    }

    // 优惠券选择回调
    const handleCouponSelected = (result) => {
      selectedCouponId.value = result.couponId
      selectedCoupon.value = result.coupon
      showCouponSelector.value = false
    }

    // 提交订单
    const handleSubmitOrder = async () => {
      if (!canSubmit.value) {
        if (!selectedAddress.value) {
          uni.showToast({ title: '请选择收货地址', icon: 'none' })
        }
        return
      }

      try {
        uni.showLoading({ title: '提交中...' })

        const orderData = {
          items: orderItems.value.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            specs: item.specs
          })),
          address: selectedAddress.value,
          remark: orderRemark.value,
          paymentMethod: paymentMethod.value,
          productAmount: productAmount.value,
          shippingFee: shippingFee.value,
          discount: discountAmount.value,
          couponId: selectedCouponId.value,
          couponAmount: discountAmount.value,
          totalAmount: finalAmount.value
        }

        const res = await request({
          url: '/api/mall/orders',
          method: 'POST',
          data: orderData
        })

        uni.hideLoading()

        if (res.code === 200) {
          // 清空购物车中已下单的商品
          orderItems.value.forEach(item => {
            if (item.itemId) {
              cartStore.removeFromCart(item.itemId)
            }
          })

          uni.showToast({ title: '订单创建成功', icon: 'success' })

          // 跳转到订单详情页
          setTimeout(() => {
            uni.redirectTo({
              url: `/pages/mall/order-detail?id=${res.data.id}`
            })
          }, 1500)
        } else {
          uni.showToast({ title: res.message || '订单创建失败', icon: 'none' })
        }
      } catch (error) {
        uni.hideLoading()
        console.error('提交订单失败:', error)
        uni.showToast({ title: '提交失败，请重试', icon: 'none' })
      }
    }

    onMounted(() => {
      initOrderData()
      fetchAvailableCoupons()
    })

    return {
      orderItems,
      selectedAddress,
      showAddressManager,
      availableCoupons,
      selectedCoupon,
      selectedCouponId,
      showCouponSelector,
      orderRemark,
      paymentMethod,
      productAmount,
      shippingFee,
      discountAmount,
      finalAmount,
      priceItems,
      canSubmit,
      calculateCouponDiscount,
      handleBack,
      handleSelectAddress,
      handleAddressSelected,
      handleSelectCoupon,
      handleCouponSelected,
      handleSubmitOrder
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.order-confirm-page {
  min-height: 100vh;
  background: $background-secondary;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
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

// 内容区域
.content {
  height: 100vh;
  padding: calc(110rpx + env(safe-area-inset-top)) 24rpx 100rpx;
}

// 收货地址卡片
.address-card {
  background: $background-primary;
  border-radius: 16rpx;
  padding: 24rpx 16rpx 24rpx 20rpx;
  margin-bottom: 16rpx;
  
  &:active {
    transform: scale(0.99);
  }
}

.address-content {
  width: 100%;
}

.address-header {
  @include flex-start();
  gap: 8rpx;
}

.address-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.address-name-phone {
  @include flex-start();
  gap: 24rpx;
}

.receiver-name {
  font-size: 32rpx;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.receiver-phone {
  font-size: 28rpx;
  color: $text-secondary;
}

.address-detail {
  font-size: 28rpx;
  color: $text-secondary;
  line-height: 1.5;
}

.address-empty {
  @include flex-between();
  align-items: center;
  gap: 8rpx;
}

.empty-text {
  flex: 1;
  font-size: 28rpx;
  color: $text-tertiary;
}

// 商品清单卡片
.goods-card {
  background: $background-primary;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 16rpx;
}

.section-title {
  @include flex-start();
  align-items: center;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.title-text {
  font-size: 28rpx;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.goods-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.goods-item {
  @include flex-start();
  gap: 16rpx;
}

.goods-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  background: $background-secondary;
  flex-shrink: 0;
}

.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 160rpx;
}

.goods-name {
  font-size: 28rpx;
  font-weight: $font-weight-medium;
  color: $text-primary;
  line-height: 1.4;
  @include ellipsis(2);
}

.goods-specs {
  font-size: 24rpx;
  color: $text-secondary;
  padding: 8rpx 12rpx;
  background: $background-secondary;
  border-radius: 8rpx;
  display: inline-block;
  align-self: flex-start;
  margin-top: 8rpx;
}

.goods-footer {
  @include flex-between();
  align-items: flex-end;
  margin-top: auto;
}

.goods-price {
  @include flex-start();
  align-items: baseline;
  gap: 4rpx;
}

.price-symbol {
  font-size: 24rpx;
  font-weight: $font-weight-semibold;
  color: $error-color;
}

.price-value {
  font-size: 36rpx;
  font-weight: $font-weight-semibold;
  color: $error-color;
  line-height: 1;
}

.goods-quantity {
  font-size: 28rpx;
  color: $text-secondary;
}

// 优惠券卡片
.coupon-card {
  background: $background-primary;
  border-radius: 16rpx;
  padding: 24rpx 16rpx 24rpx 20rpx;
  margin-bottom: 16rpx;
  
  &:active {
    transform: scale(0.99);
  }
}

.coupon-content {
  @include flex-between();
  align-items: center;
}

.coupon-left {
  @include flex-start();
  align-items: center;
  gap: 12rpx;
}

.coupon-label {
  font-size: 28rpx;
  font-weight: $font-weight-medium;
  color: $text-primary;
}

.coupon-right {
  @include flex-start();
  align-items: center;
}

.coupon-value {
  font-size: 24rpx;
  font-weight: $font-weight-semibold;
  color: $error-color;
}

.coupon-hint {
  font-size: 26rpx;
  color: $text-secondary;
}

// 订单备注卡片
.remark-card {
  background: $background-primary;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 16rpx;
}

.remark-input {
  width: 100%;
  height: 160rpx;
  padding: 16rpx;
  background: $background-secondary;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: $text-primary;
  line-height: 1.5;
  margin-top: 16rpx;
}

.input-placeholder {
  color: $text-tertiary;
}

.remark-count {
  display: block;
  text-align: right;
  font-size: 24rpx;
  color: $text-tertiary;
  margin-top: 8rpx;
}

// 底部占位
.bottom-placeholder {
  height: 32rpx;
}

// 底部提交栏
.footer-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  padding-bottom: env(safe-area-inset-bottom);
  background: $background-primary;
  border-top: 1rpx solid $border-color;
  @include flex-between();
  align-items: center;
  padding-left: 24rpx;
  padding-right: 24rpx;
  z-index: 100;
}

.price-info {
  @include flex-start();
  align-items: baseline;
  gap: 16rpx;
}

.price-label {
  font-size: 28rpx;
  color: $text-secondary;
}

.price-box {
  @include flex-start();
  align-items: baseline;
  gap: 4rpx;
}

.price-symbol {
  font-size: 24rpx;
  font-weight: $font-weight-semibold;
  color: $error-color;
}

.price-value {
  font-size: 40rpx;
  font-weight: $font-weight-semibold;
  color: $error-color;
  line-height: 1;
}

.submit-btn {
  @include flex-center();
  min-width: 240rpx;
  height: 76rpx;
  background: $gradient-primary;
  color: #fff;
  font-size: 28rpx;
  font-weight: $font-weight-semibold;
  border-radius: 40rpx;
  border: none;
  margin: 0;
  transition: all $transition-base;
  
  &--disabled {
    opacity: 0.5;
  }
  
  &:active:not(&--disabled) {
    transform: scale(0.98);
  }
}
</style>
