<template>
  <view class="product-detail-page">
    <!-- 导航栏 -->
    <view class="header-bar">
      <view class="header-left" @click="handleBack">
        <Icon name="arrow-left" size="medium" color="#333" />
      </view>
      <view class="header-center">
        <text class="header-title">商品详情</text>
      </view>
      <view class="header-right">
        <view class="header-icon" @click="handleShare">
          <Icon name="share" size="medium" color="#333" />
        </view>
        <view class="header-icon cart-icon" @click="handleGoToCart">
          <Icon name="shopping-cart" size="medium" color="#333" />
          <view v-if="cartCount > 0" class="cart-badge">{{ cartCount > 99 ? '99+' : cartCount }}</view>
        </view>
      </view>
    </view>

    <scroll-view class="content" scroll-y="true" @scroll="handleScroll">
      <!-- 商品图片轮播 - 子任务 4.2 -->
      <view class="image-swiper animate__animated animate__fadeIn">
        <swiper
          class="swiper"
          :indicator-dots="false"
          :autoplay="true"
          :interval="3000"
          :duration="500"
          @change="handleSwiperChange"
        >
          <swiper-item v-for="(img, index) in product.images" :key="index">
            <image class="swiper-image" :src="img" mode="aspectFill" />
          </swiper-item>
        </swiper>
        <view class="swiper-indicator">
          <text class="indicator-text">{{ currentImageIndex + 1 }}/{{ product.images?.length || 0 }}</text>
        </view>
      </view>

      <!-- 商品基本信息 - 子任务 4.3 -->
      <view class="product-info-card animate__animated animate__fadeInUp" style="animation-delay: 100ms;">
        <!-- 价格区域 -->
        <view class="price-section">
          <view class="price-main">
            <text class="price-symbol">¥</text>
            <text class="price-value">{{ product.price }}</text>
            <text v-if="product.originalPrice" class="original-price">¥{{ product.originalPrice }}</text>
          </view>
          <view v-if="product.memberPrice" class="member-price">
            <text class="member-label">会员价</text>
            <text class="member-value">¥{{ product.memberPrice }}</text>
          </view>
        </view>

        <!-- 商品名称 -->
        <view class="product-name">{{ product.name }}</view>
        <view v-if="product.subtitle" class="product-subtitle">{{ product.subtitle }}</view>

        <!-- 商品标签 -->
        <view v-if="product.tags && product.tags.length > 0" class="product-tags">
          <view v-for="(tag, index) in product.tags" :key="index" class="tag-item">
            {{ tag }}
          </view>
        </view>

        <!-- 销量和评价 -->
        <view class="product-stats">
          <view class="stat-item">
            <text class="stat-label">销量</text>
            <text class="stat-value">{{ product.sales || 0 }}</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-label">库存</text>
            <text class="stat-value">{{ product.stock || 0 }}</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item" @click="handleScrollToReviews">
            <Icon name="starSolid" size="small" color="#fbbf24" />
            <text class="stat-value">{{ product.rating || 0 }}</text>
            <text class="stat-label">({{ product.reviewCount || 0 }}条评价)</text>
          </view>
        </view>
      </view>

      <!-- Tab 切换 - 子任务 4.4 -->
      <view class="tabs-section animate__animated animate__fadeInUp" style="animation-delay: 200ms;">
        <view class="tabs-header">
          <view
            v-for="tab in tabs"
            :key="tab.value"
            class="tab-item"
            :class="{ 'tab-item--active': activeTab === tab.value }"
            @click="handleTabChange(tab.value)"
          >
            <text class="tab-text">{{ tab.label }}</text>
          </view>
        </view>

        <view class="tabs-content">
          <!-- 商品详情 -->
          <view v-show="activeTab === 'detail'" class="tab-panel">
            <view v-if="product.detailImages && product.detailImages.length > 0" class="detail-images">
              <image
                v-for="(img, index) in product.detailImages"
                :key="index"
                :src="img"
                class="detail-image"
                mode="widthFix"
              />
            </view>
            <view v-else class="empty-content">
              <text class="empty-text">暂无详情</text>
            </view>
          </view>

          <!-- 商品参数 -->
          <view v-show="activeTab === 'params'" class="tab-panel">
            <view v-if="product.params && product.params.length > 0" class="params-list">
              <view v-for="(param, index) in product.params" :key="index" class="param-item">
                <text class="param-label">{{ param.label }}</text>
                <text class="param-value">{{ param.value }}</text>
              </view>
            </view>
            <view v-else class="empty-content">
              <text class="empty-text">暂无参数</text>
            </view>
          </view>

          <!-- 商品评价 -->
          <view v-show="activeTab === 'reviews'" class="tab-panel">
            <view v-if="reviews && reviews.length > 0" class="reviews-list">
              <!-- 评价统计 -->
              <view v-if="product.reviewStats" class="review-stats">
                <view class="stats-left">
                  <text class="rating-score">{{ product.reviewStats.rating }}</text>
                  <view class="rating-stars">
                    <Icon
                      v-for="i in 5"
                      :key="i"
                      name="starSolid"
                      size="small"
                      :color="i <= Math.floor(product.reviewStats.rating) ? '#fbbf24' : '#e5e7eb'"
                    />
                  </view>
                  <text class="rating-count">{{ product.reviewStats.total }}条评价</text>
                </view>
                <view class="stats-right">
                  <view class="stat-bar">
                    <text class="bar-label">好评</text>
                    <view class="bar-bg">
                      <view
                        class="bar-fill"
                        :style="{ width: (product.reviewStats.star5 / product.reviewStats.total * 100) + '%' }"
                      ></view>
                    </view>
                    <text class="bar-percent">{{ Math.round(product.reviewStats.star5 / product.reviewStats.total * 100) }}%</text>
                  </view>
                </view>
              </view>

              <!-- 评价列表 -->
              <view v-for="review in reviews" :key="review.id" class="review-item">
                <view class="review-header">
                  <image :src="review.userAvatar" class="user-avatar" mode="aspectFill" />
                  <view class="user-info">
                    <text class="user-name">{{ review.userName }}</text>
                    <view class="review-rating">
                      <Icon
                        v-for="i in 5"
                        :key="i"
                        name="starSolid"
                        size="xsmall"
                        :color="i <= review.rating ? '#fbbf24' : '#e5e7eb'"
                      />
                    </view>
                  </view>
                  <text class="review-time">{{ formatTime(review.createTime) }}</text>
                </view>
                <view class="review-content">
                  <text class="content-text">{{ review.content }}</text>
                </view>
                <view v-if="review.images && review.images.length > 0" class="review-images">
                  <image
                    v-for="(img, imgIndex) in review.images"
                    :key="imgIndex"
                    :src="img"
                    class="review-image"
                    mode="aspectFill"
                    @click="handlePreviewImage(review.images, imgIndex)"
                  />
                </view>
                <view v-if="review.specs" class="review-specs">
                  <text class="specs-text">规格：{{ review.specs }}</text>
                </view>
              </view>

              <!-- 查看更多评价 -->
              <view class="view-more" @click="handleViewAllReviews">
                <text class="view-more-text">查看全部评价</text>
                <Icon name="chevron-right" size="small" color="#999" />
              </view>
            </view>
            <view v-else class="empty-content">
              <text class="empty-text">暂无评价</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-placeholder"></view>
    </scroll-view>

    <!-- 底部操作栏 - 子任务 4.5 -->
    <view class="footer-bar">
      <view class="footer-left">
        <view class="footer-icon" @click="handleToggleFavorite">
          <Icon
            :name="product.isFavorite ? 'heartSolid' : 'heart'"
            size="medium"
            :color="product.isFavorite ? '#d746f0' : '#666'"
          />
          <text class="icon-text">{{ product.isFavorite ? '已收藏' : '收藏' }}</text>
        </view>
        <view class="footer-icon" @click="handleGoToCart">
          <Icon name="shopping-cart" size="medium" color="#666" />
          <text class="icon-text">购物车</text>
          <view v-if="cartCount > 0" class="cart-badge">{{ cartCount > 99 ? '99+' : cartCount }}</view>
        </view>
      </view>
      <view class="footer-right">
        <button class="action-btn action-btn--cart" @click="handleShowSpecSelector('cart')">
          加入购物车
        </button>
        <button class="action-btn action-btn--buy" @click="handleShowSpecSelector('buy')">
          立即购买
        </button>
      </view>
    </view>

    <!-- 规格选择器 -->
    <SpecSelector
      :show="showSpecSelector"
      :product="product"
      :mode="specSelectorMode"
      @close="handleCloseSpecSelector"
      @add-to-cart="handleAddToCart"
      @buy-now="handleBuyNow"
    />
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import Icon from '@/components/common/Icon.vue'
import SpecSelector from '@/components/mall/SpecSelector.vue'
import { useCartStore } from '@/stores/cart'
import request from '@/utils/request'

export default {
  name: 'ProductDetailPage',
  components: {
    Icon,
    SpecSelector
  },
  onLoad(options) {
    // 保存页面参数
    this.pageOptions = options
  },
  setup() {
    const cartStore = useCartStore()
    
    // 页面参数
    const pageOptions = ref({})

    // 商品数据
    const product = ref({
      id: null,
      name: '',
      subtitle: '',
      images: [],
      detailImages: [],
      price: 0,
      originalPrice: 0,
      memberPrice: 0,
      stock: 0,
      sales: 0,
      rating: 0,
      reviewCount: 0,
      tags: [],
      specs: [],
      params: [],
      isFavorite: false,
      reviewStats: null
    })

    // 评价列表
    const reviews = ref([])

    // 当前图片索引
    const currentImageIndex = ref(0)

    // Tab 配置
    const tabs = ref([
      { label: '商品详情', value: 'detail' },
      { label: '商品参数', value: 'params' },
      { label: '商品评价', value: 'reviews' }
    ])
    const activeTab = ref('detail')

    // 规格选择器
    const showSpecSelector = ref(false)
    const specSelectorMode = ref('both')

    // 购物车数量
    const cartCount = computed(() => cartStore.totalCount)

    // 获取商品详情
    const fetchProductDetail = async (productId) => {
      try {
        if (!productId) {
          uni.showToast({ title: '商品不存在', icon: 'none' })
          return
        }

        uni.showLoading({ title: '加载中...' })

        const res = await request({
          url: `/api/mall/products/${productId}`,
          method: 'GET'
        })

        uni.hideLoading()

        if (res.code === 200) {
          product.value = res.data
        }
      } catch (error) {
        uni.hideLoading()
        console.error('获取商品详情失败:', error)
        uni.showToast({ title: '加载失败', icon: 'none' })
      }
    }

    // 获取商品评价
    const fetchReviews = async (productId) => {
      try {
        if (!productId) return

        const res = await request({
          url: `/api/mall/products/${productId}/reviews`,
          method: 'GET',
          data: { page: 1, pageSize: 5 }
        })

        if (res.code === 200) {
          reviews.value = res.data.list || []
        }
      } catch (error) {
        console.error('获取评价失败:', error)
      }
    }

    // 返回
    const handleBack = () => {
      uni.navigateBack()
    }

    // 分享
    const handleShare = () => {
      uni.showShareMenu({
        withShareTicket: true
      })
    }

    // 跳转购物车
    const handleGoToCart = () => {
      uni.navigateTo({ url: '/pages/mall/cart' })
    }

    // 轮播图切换
    const handleSwiperChange = (e) => {
      currentImageIndex.value = e.detail.current
    }

    // Tab 切换
    const handleTabChange = (value) => {
      activeTab.value = value
    }

    // 滚动到评价
    const handleScrollToReviews = () => {
      activeTab.value = 'reviews'
    }

    // 显示规格选择器
    const handleShowSpecSelector = (mode) => {
      specSelectorMode.value = mode
      showSpecSelector.value = true
    }

    // 关闭规格选择器
    const handleCloseSpecSelector = () => {
      showSpecSelector.value = false
    }

    // 加入购物车
    const handleAddToCart = async (result) => {
      try {
        await cartStore.addToCart({
          productId: product.value.id,
          name: product.value.name,
          image: result.image,
          price: result.price,
          quantity: result.quantity,
          specs: result.specsText
        })

        uni.showToast({ title: '已加入购物车', icon: 'success' })
        showSpecSelector.value = false
      } catch (error) {
        console.error('加入购物车失败:', error)
        uni.showToast({ title: '操作失败', icon: 'none' })
      }
    }

    // 立即购买
    const handleBuyNow = (result) => {
      showSpecSelector.value = false
      // 跳转到订单确认页
      uni.navigateTo({
        url: `/pages/mall/order-confirm?productId=${product.value.id}&quantity=${result.quantity}&specs=${encodeURIComponent(JSON.stringify(result.specs))}`
      })
    }

    // 收藏/取消收藏
    const handleToggleFavorite = () => {
      product.value.isFavorite = !product.value.isFavorite
      uni.showToast({
        title: product.value.isFavorite ? '已收藏' : '已取消收藏',
        icon: 'success'
      })
    }

    // 预览图片
    const handlePreviewImage = (images, current) => {
      uni.previewImage({
        urls: images,
        current: current
      })
    }

    // 查看全部评价
    const handleViewAllReviews = () => {
      uni.navigateTo({
        url: `/pages/mall/reviews?productId=${product.value.id}`
      })
    }

    // 初始化页面数据
    const initPageData = (options) => {
      pageOptions.value = options
      const productId = options.id
      if (productId) {
        fetchProductDetail(productId)
        fetchReviews(productId)
      }
    }

    // 格式化时间
    const formatTime = (time) => {
      if (!time) return ''
      const date = new Date(time)
      const now = new Date()
      const diff = now - date
      const day = 24 * 60 * 60 * 1000

      if (diff < day) {
        return '今天'
      } else if (diff < 2 * day) {
        return '昨天'
      } else {
        return time.split(' ')[0]
      }
    }

    // 页面滚动
    const handleScroll = (e) => {
      // 可以在这里处理滚动相关逻辑，如导航栏透明度变化
    }

    return {
      product,
      reviews,
      currentImageIndex,
      tabs,
      activeTab,
      showSpecSelector,
      specSelectorMode,
      cartCount,
      pageOptions,
      initPageData,
      handleBack,
      handleShare,
      handleGoToCart,
      handleSwiperChange,
      handleTabChange,
      handleScrollToReviews,
      handleShowSpecSelector,
      handleCloseSpecSelector,
      handleAddToCart,
      handleBuyNow,
      handleToggleFavorite,
      handlePreviewImage,
      handleViewAllReviews,
      formatTime,
      handleScroll
    }
  },
  mounted() {
    // 在 mounted 中调用初始化，此时 onLoad 已经执行完毕
    if (this.pageOptions) {
      this.initPageData(this.pageOptions)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.product-detail-page {
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

.header-left,
.header-right {
  @include flex-start();
  align-items: center;
  gap: 16rpx;
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

.header-icon {
  position: relative;
  width: 64rpx;
  height: 64rpx;
  @include flex-center();
  background: $background-secondary;
  border-radius: 50%;
  
  &:active {
    transform: scale(0.9);
  }
}

.cart-icon {
  position: relative;
}

.cart-badge {
  position: absolute;
  top: -4rpx;
  right: -12rpx;
  width: 32rpx;
  height: 32rpx;  
  background: rgba($error-color, 0.9);
  border-radius: 16rpx;
  @include flex-center();
  font-size: 16rpx;
  color: #fff;
  font-weight: $font-weight-semibold;
}

// 内容区域
.content {
  height: 100vh;
  padding-top: calc(88rpx + env(safe-area-inset-top));
}

// 图片轮播
.image-swiper {
  position: relative;
  width: 100%;
  height: 750rpx;
  background: $background-primary;
}

.swiper {
  width: 100%;
  height: 100%;
}

.swiper-image {
  width: 100%;
  height: 100%;
}

.swiper-indicator {
  position: absolute;
  bottom: 24rpx;
  right: 24rpx;
  padding: 6rpx 16rpx;
  background: rgba(0, 0, 0, 0.5);
  border-radius: $border-radius-full;
}

.indicator-text {
  display: flex;
  font-size: 24rpx;
  color: #fff;
}

// 商品信息卡片
.product-info-card {
  background: $background-primary;
  padding: 32rpx;
  margin-bottom: 16rpx;
}

.price-section {
  @include flex-between();
  align-items: flex-end;
  margin-bottom: 24rpx;
}

.price-main {
  @include flex-start();
  align-items: baseline;
  gap: 8rpx;
}

.price-symbol {
  font-size: 32rpx;
  font-weight: $font-weight-medium;
  color: $error-color;
}

.price-value {
  font-size: 52rpx;
  font-weight: $font-weight-semibold;
  color: $error-color;
  line-height: 1;
}

.original-price {
  font-size: 28rpx;
  color: $text-tertiary;
  text-decoration: line-through;
}

.member-price {
  @include flex-start();
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 20rpx;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-radius: 30rpx;
}

.member-label {
  font-size: 24rpx;
  color: #fff;
}

.member-value {
  font-size: 28rpx;
  font-weight: $font-weight-semibold;
  color: #fff;
}

.product-name {
  font-size: 36rpx;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  line-height: 1.4;
  margin-bottom: 12rpx;
}

.product-subtitle {
  font-size: 28rpx;
  color: $text-secondary;
  line-height: 1.5;
  margin-bottom: 16rpx;
}

.product-tags {
  @include flex-start();
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.tag-item {
  padding: 8rpx 16rpx;
  background: rgba($primary-color, 0.1);
  border-radius: 8rpx;
  font-size: 24rpx;
  color: $primary-color;
}

.product-stats {
  @include flex-start();
  align-items: center;
  gap: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid $border-color;
}

.stat-item {
  @include flex-start();
  align-items: center;
  gap: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: $text-secondary;
}

.stat-value {
  font-size: 28rpx;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.stat-divider {
  width: 1rpx;
  height: 24rpx;
  background: $border-color;
}

// Tab 区域
.tabs-section {
  background: $background-primary;
}

.tabs-header {
  @include flex-start();
  border-bottom: 1rpx solid $border-color;
}

.tab-item {
  flex: 1;
  height: 88rpx;
  @include flex-center();
  position: relative;
  
  &--active {
    .tab-text {
      color: $primary-color;
      font-weight: $font-weight-semibold;
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
}

.tab-text {
  font-size: 28rpx;
  color: $text-secondary;
  transition: all $transition-base;
}

.tabs-content {
  min-height: 400rpx;
}

.tab-panel {
  padding: 32rpx;
}

// 详情图片
.detail-images {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.detail-image {
  width: 100%;
  border-radius: 0;
}

// 参数列表
.params-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.param-item {
  @include flex-between();
  align-items: flex-start;
  gap: 32rpx;
}

.param-label {
  font-size: 28rpx;
  color: $text-secondary;
  flex-shrink: 0;
  width: 160rpx;
}

.param-value {
  flex: 1;
  font-size: 28rpx;
  color: $text-primary;
  text-align: right;
}

// 评价区域
.review-stats {
  @include flex-between();
  padding: 32rpx;
  background: $background-secondary;
  border-radius: 16rpx;
  margin-bottom: 32rpx;
}

.stats-left {
  @include flex-center();
  flex-direction: column;
  gap: 12rpx;
}

.rating-score {
  font-size: 64rpx;
  font-weight: $font-weight-semibold;
  color: #F59E0B;
  line-height: 1;
}

.rating-stars {
  @include flex-start();
  gap: 4rpx;
}

.rating-count {
  font-size: 24rpx;
  color: $text-secondary;
}

.stats-right {
  flex: 1;
  margin-left: 48rpx;
}

.stat-bar {
  @include flex-start();
  align-items: center;
  gap: 16rpx;
}

.bar-label {
  font-size: 24rpx;
  color: $text-secondary;
  width: 52rpx;
}

.bar-bg {
  flex: 1;
  height: 12rpx;
  background: $background-primary;
  border-radius: 6rpx;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%);
  border-radius: 6rpx;
  transition: width $transition-base;
}

.bar-percent {
  font-size: 24rpx;
  color: $text-secondary;
  width: 60rpx;
  text-align: right;
}

// 评价列表
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.review-item {
  padding-bottom: 32rpx;
  border-bottom: 1rpx solid $border-color;
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
}

.review-header {
  @include flex-start();
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.user-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: $background-secondary;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 28rpx;
  font-weight: $font-weight-medium;
  color: $text-primary;
}

.review-rating {
  @include flex-start();
  gap: 4rpx;
}

.review-time {
  font-size: 24rpx;
  color: $text-tertiary;
}

.review-content {
  margin-bottom: 16rpx;
}

.content-text {
  font-size: 28rpx;
  color: $text-primary;
  line-height: 1.6;
}

.review-images {
  @include flex-start();
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.review-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  background: $background-secondary;
}

.review-specs {
  padding: 12rpx 16rpx;
  background: $background-secondary;
  border-radius: 8rpx;
  display: inline-block;
}

.specs-text {
  font-size: 24rpx;
  color: $text-secondary;
}

.view-more {
  @include flex-center();
  gap: 8rpx;
  padding: 24rpx;
  background: $background-secondary;
  border-radius: 16rpx;
  margin-top: 16rpx;
  
  &:active {
    transform: scale(0.98);
  }
}

.view-more-text {
  font-size: 28rpx;
  color: $text-secondary;
}

// 空状态
.empty-content {
  @include flex-center();
  padding: 120rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: $text-tertiary;
}

// 底部占位
.bottom-placeholder {
  height: 32rpx;
}

// 底部操作栏
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

.footer-left {
  @include flex-start();
  gap: 32rpx;
}

.footer-icon {
  position: relative;
  width: 60rpx;
  @include flex-center();
  flex-direction: column;
  gap: 4rpx;
  
  &:active {
    transform: scale(0.9);
  }
}

.icon-text {
  font-size: 20rpx;
  color: $text-secondary;
}

.footer-right {
  @include flex-start();
  gap: 16rpx;
}

.action-btn {
  @include flex-center();
  min-width: 200rpx;
  height: 76rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: $font-weight-semibold;
  border: none;
  transition: all $transition-base;
  
  &--cart {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    color: #fff;
  }
  
  &--buy {
    background: $gradient-primary;
    color: #fff;
  }
  
  &:active {
    transform: scale(0.98);
  }
}
</style>
