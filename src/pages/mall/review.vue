<template>
  <view class="review-page">
    <!-- 导航栏 - 子任务 10.1 -->
    <view class="header-bar">
      <view class="header-left" @click="handleBack">
        <Icon name="arrow-left" size="medium" color="#333" />
      </view>
      <view class="header-center">
        <text class="header-title">评价商品</text>
      </view>
      <view class="header-right"></view>
    </view>

    <scroll-view class="content" scroll-y>
      <!-- 商品信息 - 子任务 10.2 -->
      <view class="product-card animate__animated animate__fadeInDown">
        <image :src="productInfo.image" class="product-image" mode="aspectFill" />
        <view class="product-info">
          <text class="product-name">{{ productInfo.name }}</text>
          <text v-if="productInfo.specs" class="product-specs">{{ productInfo.specs }}</text>
        </view>
      </view>

      <!-- 评分 - 子任务 10.3 -->
      <view class="rating-card animate__animated animate__fadeInUp" style="animation-delay: 100ms;">
        <view class="section-title">
          <text class="title-text">商品评分</text>
          <text class="rating-desc">{{ ratingDesc }}</text>
        </view>
        <view class="rating-stars">
          <view
            v-for="i in 5"
            :key="i"
            class="star-item"
            @click="handleRatingChange(i)"
          >
            <Icon
              :name="i <= rating ? 'star-solid' : 'star'"
              size="xlarge"
              :color="i <= rating ? '#fbbf24' : '#e5e7eb'"
            />
          </view>
        </view>
      </view>

      <!-- 评价内容 - 子任务 10.4 -->
      <view class="content-card animate__animated animate__fadeInUp" style="animation-delay: 200ms;">
        <view class="section-title">
          <text class="title-text">评价内容</text>
          <text class="char-count">{{ reviewContent.length }}/500</text>
        </view>
        <textarea
          v-model="reviewContent"
          class="content-input"
          placeholder="说说你的使用感受吧~"
          placeholder-class="input-placeholder"
          maxlength="500"
        />
      </view>

      <!-- 图片上传 - 子任务 10.4 -->
      <view class="images-card animate__animated animate__fadeInUp" style="animation-delay: 300ms;">
        <view class="section-title">
          <text class="title-text">上传图片</text>
          <text class="image-count">{{ reviewImages.length }}/9</text>
        </view>
        <view class="images-grid">
          <view
            v-for="(img, index) in reviewImages"
            :key="index"
            class="image-item"
          >
            <image :src="img" class="review-image" mode="aspectFill" />
            <view class="delete-btn" @click="handleDeleteImage(index)">
              <Icon name="x" size="small" color="#fff" />
            </view>
          </view>
          <view
            v-if="reviewImages.length < 9"
            class="upload-btn"
            @click="handleUploadImage"
          >
            <Icon name="plus" size="large" color="#999" />
            <text class="upload-text">添加图片</text>
          </view>
        </view>
      </view>

      <!-- 其他选项 - 子任务 10.5 -->
      <view class="options-card animate__animated animate__fadeInUp" style="animation-delay: 400ms;">
        <view class="option-item" @click="handleToggleAnonymous">
          <text class="option-text">匿名评价</text>
          <view class="option-switch">
            <Icon
              :name="isAnonymous ? 'toggle-right' : 'toggle-left'"
              size="xlarge"
              :color="isAnonymous ? '#6366f1' : '#d1d5db'"
            />
          </view>
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-placeholder"></view>
    </scroll-view>

    <!-- 底部提交栏 - 子任务 10.5 -->
    <view class="footer-bar animate__animated animate__slideInUp">
      <button
        class="submit-btn"
        :class="{ 'submit-btn--disabled': !canSubmit }"
        :disabled="!canSubmit"
        @click="handleSubmit"
      >
        提交评价
      </button>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Icon from '@/components/common/Icon.vue'
import request from '@/utils/request'

export default {
  name: 'ReviewPage',
  components: {
    Icon
  },
  setup() {
    const router = useRouter()
    const route = useRoute()

    // 商品信息
    const productInfo = ref({
      id: null,
      name: '',
      image: '',
      specs: ''
    })

    // 订单ID
    const orderId = ref(null)

    // 评分
    const rating = ref(5)

    // 评价内容
    const reviewContent = ref('')

    // 评价图片
    const reviewImages = ref([])

    // 是否匿名
    const isAnonymous = ref(false)

    // 评分描述
    const ratingDesc = computed(() => {
      const descs = ['非常差', '差', '一般', '满意', '非常满意']
      return descs[rating.value - 1] || ''
    })

    // 是否可以提交
    const canSubmit = computed(() => {
      return rating.value > 0 && reviewContent.value.trim().length > 0
    })

    // 获取商品信息
    const fetchProductInfo = async () => {
      try {
        const productId = route.query.productId
        if (!productId) return

        const res = await request({
          url: `/api/mall/products/${productId}`,
          method: 'GET'
        })

        if (res.code === 200) {
          productInfo.value = {
            id: res.data.id,
            name: res.data.name,
            image: res.data.images?.[0] || res.data.image || '',
            specs: route.query.specs || ''
          }
        }
      } catch (error) {
        console.error('获取商品信息失败:', error)
      }
    }

    // 返回
    const handleBack = () => {
      uni.navigateBack()
    }

    // 评分变化
    const handleRatingChange = (value) => {
      rating.value = value
    }

    // 上传图片
    const handleUploadImage = () => {
      uni.chooseImage({
        count: 9 - reviewImages.value.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          reviewImages.value = [...reviewImages.value, ...res.tempFilePaths]
        }
      })
    }

    // 删除图片
    const handleDeleteImage = (index) => {
      reviewImages.value.splice(index, 1)
    }

    // 切换匿名
    const handleToggleAnonymous = () => {
      isAnonymous.value = !isAnonymous.value
    }

    // 提交评价
    const handleSubmit = async () => {
      if (!canSubmit.value) {
        return
      }

      try {
        uni.showLoading({ title: '提交中...' })

        // 这里应该先上传图片，获取图片URL
        // 简化处理，直接使用本地路径
        const imageUrls = reviewImages.value

        const reviewData = {
          orderId: orderId.value,
          productId: productInfo.value.id,
          rating: rating.value,
          content: reviewContent.value,
          images: imageUrls,
          specs: productInfo.value.specs,
          isAnonymous: isAnonymous.value
        }

        const res = await request({
          url: '/api/mall/reviews',
          method: 'POST',
          data: reviewData
        })

        uni.hideLoading()

        if (res.code === 200) {
          uni.showToast({ title: '评价成功', icon: 'success' })

          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({ title: res.message || '评价失败', icon: 'none' })
        }
      } catch (error) {
        uni.hideLoading()
        console.error('提交评价失败:', error)
        uni.showToast({ title: '提交失败，请重试', icon: 'none' })
      }
    }

    onMounted(() => {
      orderId.value = route.query.orderId
      fetchProductInfo()
    })

    return {
      productInfo,
      rating,
      reviewContent,
      reviewImages,
      isAnonymous,
      ratingDesc,
      canSubmit,
      handleBack,
      handleRatingChange,
      handleUploadImage,
      handleDeleteImage,
      handleToggleAnonymous,
      handleSubmit
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.review-page {
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
  padding-top: calc(88rpx + env(safe-area-inset-top));
  padding: calc(88rpx + env(safe-area-inset-top)) 16rpx 0;
}

// 商品信息卡片
.product-card {
  @include flex-start();
  gap: 16rpx;
  background: $background-primary;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.product-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  background: $background-secondary;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.product-name {
  font-size: 28rpx;
  font-weight: $font-weight-medium;
  color: $text-primary;
  line-height: 1.4;
  @include ellipsis(2);
}

.product-specs {
  font-size: 24rpx;
  color: $text-secondary;
  padding: 8rpx 12rpx;
  background: $background-secondary;
  border-radius: 8rpx;
  display: inline-block;
  align-self: flex-start;
}

// 评分卡片
.rating-card {
  background: $background-primary;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 16rpx;
}

.section-title {
  @include flex-between();
  align-items: center;
  margin-bottom: 24rpx;
}

.title-text {
  font-size: 28rpx;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.rating-desc {
  font-size: 28rpx;
  font-weight: $font-weight-semibold;
  color: $warning-color;
}

.rating-stars {
  @include flex-center();
  gap: 16rpx;
}

.star-item {
  @include flex-center();
  transition: all $transition-base;
  
  &:active {
    transform: scale(1.2);
  }
}

// 评价内容卡片
.content-card {
  background: $background-primary;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 16rpx;
}

.char-count {
  font-size: 24rpx;
  color: $text-tertiary;
}

.content-input {
  width: 100%;
  min-height: 240rpx;
  padding: 16rpx;
  background: $background-secondary;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: $text-primary;
  line-height: 1.6;
  margin-top: 16rpx;
}

.input-placeholder {
  color: $text-tertiary;
}

// 图片上传卡片
.images-card {
  background: $background-primary;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 16rpx;
}

.image-count {
  font-size: 24rpx;
  color: $text-tertiary;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  margin-top: 16rpx;
}

.image-item {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  border-radius: 12rpx;
  overflow: hidden;
}

.review-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: $background-secondary;
}

.delete-btn {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 40rpx;
  height: 40rpx;
  @include flex-center();
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  
  &:active {
    transform: scale(0.9);
  }
}

.upload-btn {
  width: 100%;
  padding-bottom: 100%;
  position: relative;
  background: $background-secondary;
  border-radius: 12rpx;
  border: 2rpx dashed $border-color;
  @include flex-center();
  flex-direction: column;
  gap: 8rpx;
  
  &:active {
    transform: scale(0.98);
  }
}

.upload-text {
  position: absolute;
  bottom: 24rpx;
  font-size: 24rpx;
  color: $text-tertiary;
}

// 其他选项卡片
.options-card {
  background: $background-primary;
  border-radius: 16rpx;
  padding: 0 32rpx;
  margin-bottom: 16rpx;
}

.option-item {
  @include flex-between();
  align-items: center;
  height: 96rpx;
  
  &:active {
    background: $background-secondary;
  }
}

.option-text {
  font-size: 28rpx;
  color: $text-primary;
}

.option-switch {
  @include flex-center();
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
  @include flex-center();
  padding-left: 24rpx;
  padding-right: 24rpx;
  z-index: 100;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, $primary-color 0%, #4f46e5 100%);
  color: #fff;
  font-size: 32rpx;
  font-weight: $font-weight-semibold;
  border-radius: 44rpx;
  border: none;
  transition: all $transition-base;
  
  &--disabled {
    opacity: 0.5;
  }
  
  &:active:not(&--disabled) {
    transform: scale(0.98);
  }
}
</style>
