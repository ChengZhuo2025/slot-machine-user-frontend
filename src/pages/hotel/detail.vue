<template>
  <view class="hotel-detail-page">
    <!-- 导航栏 -->
    <view class="header-bar">
      <view class="header-left" @click="handleBack">
        <Icon name="arrow-left" size="medium" color="#333" />
      </view>
      <view class="header-center">
        <text class="header-title">酒店详情</text>
      </view>
      <view class="header-right" @click="handleShare">
        <Icon name="share" size="medium" color="#333" />
      </view>
    </view>

    <scroll-view class="content" scroll-y="true" @scrolltolower="loadMoreReviews">
      <!-- 图片轮播 -->
      <view class="image-swiper animate__animated animate__fadeInDown">
        <swiper
          class="swiper"
          :indicator-dots="true"
          :autoplay="true"
          :interval="3000"
          :duration="500"
          indicator-color="rgba(255,255,255,0.5)"
          indicator-active-color="#fff"
        >
          <swiper-item v-for="(img, index) in hotel.images" :key="index">
            <image class="swiper-image" :src="img" mode="aspectFill" />
          </swiper-item>
        </swiper>
        <view class="image-count">
          <Icon name="image" size="small" color="#fff" />
          <text class="count-text">{{ hotel.images?.length || 0 }}</text>
        </view>
      </view>

      <!-- 酒店基本信息 -->
      <view class="hotel-info-card animate__animated animate__fadeInUp" style="animation-delay: 100ms;">
        <view class="info-header">
          <text class="hotel-name">{{ hotel.name }}</text>
          <view class="header-right">
            <text class="distance-text">{{ hotel.distance }}km</text>
            <view class="go-btn" @click="handleNavigate">
              <Icon name="send" size="small" color="#fff" />
              <text class="go-text">去这里</text>
            </view>
          </view>
        </view>

        <view class="hotel-tags">
          <view
            v-for="(tag, index) in hotel.tags"
            :key="tag"
            class="tag"
            :style="{
              backgroundColor: getTagColor(index).bg,
              color: getTagColor(index).text
            }"
          >{{ tag }}</view>
        </view>

        <view class="rating-row">
          <view class="rating-box">
            <text class="rating-score">{{ hotel.rating }}</text>
            <text class="rating-label">评分</text>
          </view>
          <view class="reviews-count">
            <text class="count">{{ hotel.reviewCount }}条评价</text>
          </view>
        </view>

        <view class="info-item">
          <Icon name="map" size="small" color="#999" />
          <text class="info-text">{{ hotel.address }}</text>
        </view>

        <view class="info-item">
          <Icon name="phone" size="small" color="#999" />
          <text class="info-text">{{ hotel.phone }}</text>
          <view class="call-btn" @click="handleCall">
            <text class="call-text">拨打</text>
          </view>
        </view>
      </view>

      <!-- Tab 导航 -->
      <view class="tab-navigation animate__animated animate__fadeInDown" style="animation-delay: 200ms;">
        <view
          class="tab-item"
          :class="{ 'tab-item--active': activeTab === 'booking' }"
          @click="activeTab = 'booking'"
        >
          <text class="tab-text">预订</text>
        </view>
        <view
          class="tab-item"
          :class="{ 'tab-item--active': activeTab === 'reviews' }"
          @click="activeTab = 'reviews'"
        >
          <text class="tab-text">评价</text>
        </view>
      </view>

      <!-- Tab 内容 -->
      <view class="tab-content">
        <!-- 预订 Tab -->
        <view v-show="activeTab === 'booking'" class="tab-pane">
          <!-- 设施服务 -->
          <view class="section-card animate__animated animate__fadeInUp" style="animation-delay: 300ms;">
            <view class="section-title">
              <Icon name="grid" size="small" color="#333" />
              <text class="title-text">设施服务</text>
            </view>
            <view class="facilities-grid">
              <view
                v-for="(facility, index) in hotel.facilities"
                :key="facility.name"
                class="facility-item"
              >
                <Icon :name="facility.icon" size="medium" :color="getFacilityColor(index)" />
                <text class="facility-name">{{ facility.name }}</text>
              </view>
            </view>
          </view>

          <!-- 房型选择 -->
          <view class="section-card animate__animated animate__fadeInUp" style="animation-delay: 400ms;">
            <view class="section-title">
              <Icon name="bed" size="small" color="#333" />
              <text class="title-text">房型选择</text>
            </view>
            <view class="room-list">
              <view
                v-for="(room, idx) in rooms"
                :key="room.id"
                class="room-card animate__animated animate__fadeInUp"
                :style="{ animationDelay: (500 + idx * 100) + 'ms' }"
                @click="handleRoomClick(room.id)"
              >
                <image class="room-card-image" :src="room.image" mode="aspectFill" />
                <view class="room-card-content">
                  <view class="room-header">
                    <text class="room-card-name">{{ room.name }}</text>
                    <view
                      v-if="room.tag"
                      class="room-time-badge"
                      :style="{
                        background: getBadgeColor(rooms.indexOf(room)).bg
                      }"
                    >
                      <text
                        class="time-text"
                        :style="{
                          color: getBadgeColor(rooms.indexOf(room)).text
                        }"
                      >{{ room.tag }}</text>
                    </view>
                  </view>
                  <view class="room-specs">
                    <text class="spec-item">{{ room.area }}m²</text>
                    <text class="spec-divider">|</text>
                    <text class="spec-item">{{ room.bedType }}</text>
                    <text class="spec-divider">|</text>
                    <text class="remaining-rooms">剩{{ room.availableRooms }}间</text>
                  </view>
                  <view class="room-features">
                    <text v-for="(feature, idx) in room.displayFeatures.slice(0, 3)" :key="idx" class="feature-text">
                      {{ feature }} {{ idx < Math.min(room.displayFeatures.length, 3) - 1 ? '·' : '' }}
                    </text>
                  </view>
                  <view class="room-card-footer">
                    <view class="room-price-info">
                      <text class="price-symbol">¥</text>
                      <text class="price-amount">{{ room.price }}</text>
                      <text class="price-label">/小时起</text>
                    </view>
                    <view class="book-button-new">
                      <text class="book-text-new">立即预订</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 入住政策 -->
          <view class="section-card animate__animated animate__fadeInUp" style="animation-delay: 600ms;">
            <view class="section-title">
              <Icon name="info" size="small" color="#333" />
              <text class="title-text">入住政策</text>
            </view>
            <view class="policy-list">
              <view v-for="policy in hotel.policies" :key="policy.label" class="policy-item">
                <view class="policy-label">
                  <text class="label-text">• {{ policy.label }}</text>
                </view>
                <view class="policy-value">
                  <text class="value-text">{{ policy.value }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 评价 Tab -->
        <view v-show="activeTab === 'reviews'" class="tab-pane">
          <!-- 评价概览 -->
          <view class="review-summary-card animate__animated animate__fadeInUp" style="animation-delay: 300ms;">
            <view class="summary-left">
              <text class="summary-score">{{ hotel.rating }}</text>
              <view class="summary-stars">
                <Icon
                  v-for="i in 5"
                  :key="i"
                  :name="i <= Math.floor(hotel.rating) ? 'starSolid' : 'star'"
                  size="small"
                  :color="i <= Math.floor(hotel.rating) ? '#fbbf24' : '#ccc'"
                />
              </view>
              <text class="summary-count">{{ hotel.reviewCount }}条评价</text>
            </view>
            <view class="summary-right">
              <view v-for="item in reviewStats" :key="item.label" class="stat-item">
                <text class="stat-label">{{ item.label }}</text>
                <view class="stat-bar">
                  <view class="stat-bar-fill" :style="{ width: item.percent + '%' }"></view>
                </view>
                <text class="stat-score">{{ item.score }}</text>
              </view>
            </view>
          </view>

          <!-- 评价列表 -->
          <view class="section-card animate__animated animate__fadeInUp" style="animation-delay: 400ms;">
            <view class="section-title">
              <Icon name="message" size="small" color="#333" />
              <text class="title-text">全部评价</text>
              <text class="review-count">({{ hotel.reviewCount }})</text>
            </view>
            <view class="reviews-list">
              <view
                v-for="(review, idx) in reviews"
                :key="review.id"
                class="review-item animate__animated animate__fadeInUp"
                :style="{ animationDelay: (500 + idx * 50) + 'ms' }"
              >
                <view class="review-header">
                  <image class="user-avatar" :src="review.avatar" mode="aspectFill" />
                  <view class="user-info">
                    <text class="user-name">{{ review.userName }}</text>
                    <view class="rating-stars">
                      <Icon
                        v-for="i in 5"
                        :key="i"
                        :name="i <= Math.floor(hotel.rating) ? 'starSolid' : 'star'"
                        size="xsmall"
                        :color="i <= review.rating ? '#fbbf24' : '#e5e7eb'"
                      />
                    </view>
                  </view>
                  <text class="review-date">{{ review.date }}</text>
                </view>
                <view v-if="review.roomType" class="review-room-type">
                  <Icon name="bed" size="xsmall" color="#999" />
                  <text class="room-type-text">{{ review.roomType }}</text>
                </view>
                <text class="review-content">{{ review.content }}</text>
                <view v-if="review.images?.length" class="review-images">
                  <image
                    v-for="(img, idx) in review.images"
                    :key="idx"
                    class="review-image"
                    :src="img"
                    mode="aspectFill"
                    @click="previewImage(review.images, idx)"
                  />
                </view>
                <view v-if="review.reply" class="review-reply">
                  <view class="reply-header">
                    <Icon name="forward" size="xsmall" color="#be32d7" />
                    <text class="reply-label">商家回复:</text>
                  </view>
                  <text class="reply-content">{{ review.reply }}</text>
                </view>
              </view>
            </view>
            <view v-if="hasMoreReviews" class="load-more" @click="loadMoreReviews">
              <text class="load-more-text">加载更多评价</text>
              <Icon name="chevron-down" size="xsmall" color="#999" />
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import Icon from '@/components/common/Icon.vue'
import request from '@/utils/request'

export default {
  name: 'HotelDetailPage',
  components: {
    Icon
  },
  setup() {
    const hotelId = ref('')
    const hotel = ref({})
    const rooms = ref([])
    const reviews = ref([])
    const hasMoreReviews = ref(true)
    const reviewPage = ref(1)
    const reviewPageSize = 5
    const activeTab = ref('booking')

    // 评价统计数据
    const reviewStats = ref([
      { label: '环境', score: 4.8, percent: 96 },
      { label: '卫生', score: 4.9, percent: 98 },
      { label: '服务', score: 4.7, percent: 94 },
      { label: '设施', score: 4.6, percent: 92 }
    ])

    // 获取酒店详情
    const fetchHotelDetail = async () => {
      try {
        const res = await request({
          url: `/api/hotels/${hotelId.value}`,
          method: 'GET'
        })
        hotel.value = res.data
      } catch (error) {
        uni.showToast({
          title: '获取酒店详情失败',
          icon: 'none'
        })
      }
    }

    // 获取房型列表
    const fetchRooms = async () => {
      try {
        const res = await request({
          url: `/api/hotels/${hotelId.value}/rooms`,
          method: 'GET'
        })
        rooms.value = res.data
      } catch (error) {
        uni.showToast({
          title: '获取房型列表失败',
          icon: 'none'
        })
      }
    }

    // 获取评价列表
    const fetchReviews = async (page = 1) => {
      try {
        const res = await request({
          url: `/api/hotels/${hotelId.value}/reviews`,
          method: 'GET',
          data: {
            page,
            pageSize: reviewPageSize
          }
        })

        const reviewList = res.data.list || res.data || []

        if (page === 1) {
          reviews.value = reviewList
        } else {
          reviews.value = [...reviews.value, ...reviewList]
        }

        hasMoreReviews.value = reviewList.length === reviewPageSize
        reviewPage.value = page
      } catch (error) {
        console.error('获取评价失败:', error)
        uni.showToast({
          title: '获取评价失败',
          icon: 'none'
        })
      }
    }

    // 加载更多评价
    const loadMoreReviews = () => {
      if (hasMoreReviews.value) {
        fetchReviews(reviewPage.value + 1)
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

    // 拨打电话
    const handleCall = () => {
      uni.makePhoneCall({
        phoneNumber: hotel.value.phone
      })
    }

    // 导航
    const handleNavigate = () => {
      uni.openLocation({
        latitude: hotel.value.latitude,
        longitude: hotel.value.longitude,
        name: hotel.value.name,
        address: hotel.value.address
      })
    }

    // 点击房型
    const handleRoomClick = (roomId) => {
      uni.navigateTo({
        url: `/pages/hotel/room-detail?hotelId=${hotelId.value}&roomId=${roomId}`
      })
    }

    // 预览图片
    const previewImage = (images, current) => {
      uni.previewImage({
        urls: images,
        current
      })
    }

    // 页面加载
    onLoad((options) => {
      if (options.id) {
        hotelId.value = options.id
        fetchHotelDetail()
        fetchRooms()
        fetchReviews()
      }
    })

    // 根据索引返回不同的标签颜色
    const getTagColor = (index) => {
      const colors = [
        { bg: '#ede9fe', text: '#7c3aed' }, // 紫色
        { bg: '#dbeafe', text: '#2563eb' }, // 蓝色
        { bg: '#fce7f3', text: '#db2777' }, // 粉色
        { bg: '#dcfce7', text: '#16a34a' }, // 绿色
        { bg: '#fed7aa', text: '#ea580c' }, // 橙色
        { bg: '#e0e7ff', text: '#4f46e5' }  // 靛蓝色
      ]
      return colors[index % colors.length]
    }

    // 根据索引返回不同的设施图标颜色
    const getFacilityColor = (index) => {
      const colors = [
        '#6366f1', '#ec4899', '#f59e0b', '#10b981',
        '#8b5cf6', '#06b6d4', '#f43f5e', '#84cc16'
      ]
      return colors[index % colors.length]
    }

    // 根据索引返回不同的时段标签颜色
    const getBadgeColor = (index) => {
      const colors = [
        { bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', text: '#92400e' },
        { bg: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', text: '#1e40af' },
        { bg: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)', text: '#9f1239' },
        { bg: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', text: '#166534' },
        { bg: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', text: '#3730a3' }
      ]
      return colors[index % colors.length]
    }

    return {
      hotel,
      rooms,
      reviews,
      hasMoreReviews,
      activeTab,
      reviewStats,
      handleBack,
      handleShare,
      handleCall,
      handleNavigate,
      handleRoomClick,
      loadMoreReviews,
      previewImage,
      getTagColor,
      getFacilityColor,
      getBadgeColor
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.hotel-detail-page {
  min-height: 100vh;
  background: $background-secondary;
  display: flex;
  flex-direction: column;
}

// 导航栏
.header-bar {
  @include flex-between();
  @include shadow(base);
  align-items: center;
  background-color: $background-primary;
  padding: $spacing-sm $spacing-base;
  position: fixed;
  width: 100vw;
  top: 0;
  z-index: 100;

  .header-left,
  .header-right {
    width: 48rpx;
    height: 48rpx;
    @include flex-center();
    border-radius: $border-radius-full;
    transition: background-color $transition-base;

    &:active {
      background: $background-secondary;
    }
  }

  .header-center {
    flex: 1;
    text-align: center;

    .header-title {
      font-size: $font-size-base;
      font-weight: $font-weight-semibold;
      color: $text-primary;
    }
  }
}

// 图片轮播
.image-swiper {
  position: relative;
  width: 100%;
  height: 440rpx;
  margin-top: 80rpx;

  .swiper {
    width: 100%;
    height: 100%;
  }

  .swiper-image {
    width: 100%;
    height: 100%;
  }

  .image-count {
    position: absolute;
    right: 24rpx;
    bottom: 24rpx;
    @include flex-center();
    gap: 8rpx;
    padding: 8rpx 16rpx;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 40rpx;
    backdrop-filter: blur(10rpx);

    .count-text {
      font-size: 24rpx;
      color: #fff;
    }
  }
}

// 酒店信息卡片
.hotel-info-card {
  background: $background-primary;
  padding: 24rpx;
  margin-bottom: 16rpx;

  .info-header {
    @include flex-between();
    align-items: flex-start;
    gap: 16rpx;
    margin-bottom: 8rpx;
  }

  .hotel-name {
    flex: 1;
    font-size: 32rpx;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .header-right {
    @include flex-end();
    align-items: center;
    gap: 12rpx;
    padding: 0 0 0 $spacing-sm;
    border: 2rpx solid $primary-color;
    border-radius: $border-radius-full;
  }

  .distance-text {
    font-size: 24rpx;
    color: $text-secondary;
    white-space: nowrap;
  }

  .go-btn {
    @include flex-center();
    gap: 4rpx;
    padding: 8rpx 18rpx 8rpx 12rpx;
    background: $gradient-primary;
    border-radius: 0 40rpx 40rpx 0;
    transition: all $transition-base;

    &:active {
      transform: scale(0.95);
    }

    .go-text {
      font-size: $font-size-xs;
      color: $background-primary;
      font-weight: $font-weight-semibold;
    }
  }

  .hotel-tags {
    @include flex-start();
    gap: 12rpx;
    flex-wrap: wrap;
    margin-bottom: 16rpx;
  }

  .tag {
    padding: 4rpx 12rpx;
    background: rgba($primary-color, 0.1);
    color: $primary-color;
    font-size: 22rpx;
    border-radius: 8rpx;
  }

  .rating-row {
    @include flex-between();
    align-items: center;
    padding: 16rpx 0;
    border-bottom: 1rpx solid #ddd;
    margin-bottom: 28rpx;
  }

  .rating-box {
    @include flex-start();
    align-items: baseline;
    gap: 8rpx;

    .rating-score {
      font-size: 40rpx;
      font-weight: $font-weight-semibold;
      color: $warning-color;
    }

    .rating-label {
      font-size: 24rpx;
      color: $text-secondary;
    }
  }

  .reviews-count {
    .count {
      font-size: 24rpx;
      color: $text-secondary;
    }
  }

  .info-item {
    @include flex-start();
    align-items: center;
    gap: 12rpx;
    margin-top: 12rpx;
    position: relative;

    .info-text {
      flex: 1;
      font-size: 26rpx;
      color: $text-secondary;
      width: 800rpx;
      @include ellipsis();
    }

    .call-btn {
      padding: 8rpx 20rpx;
      background: rgba($primary-color, 0.1);
      border-radius: 40rpx;

      .call-text {
        display: flex;
        font-size: 24rpx;
        color: $primary-dark;
      }
    }
  }
}

// Tab 导航
.tab-navigation {
  position: sticky;
  top: 88rpx;
  z-index: 90;
  @include flex-start();
  background: $background-primary;
  border-bottom: 2rpx solid $border-light;

  .tab-item {
    flex: 1;
    @include flex-center();
    height: 88rpx;
    position: relative;
    transition: all $transition-base;

    .tab-text {
      font-size: 28rpx;
      color: $text-secondary;
      transition: all $transition-base;
    }

    &--active {
      .tab-text {
        font-size: 30rpx;
        font-weight: $font-weight-semibold;
        color: $primary-color;
      }

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60rpx;
        height: 6rpx;
        background: linear-gradient(90deg, $primary-color 0%, #8b5cf6 100%);
        border-radius: 3rpx;
      }
    }
  }
}

// Tab 内容
.tab-content {
  .tab-pane {
    animation: fadeIn 0.3s ease;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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
    gap: 12rpx;
    margin-bottom: 20rpx;

    .title-text {
      font-size: 28rpx;
      font-weight: $font-weight-semibold;
      color: $text-primary;
    }

    .review-count {
      font-size: 24rpx;
      color: $text-tertiary;
      margin-left: 8rpx;
    }
  }
}

// 设施服务网格
.facilities-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24rpx;

  .facility-item {
    @include flex-center();
    flex-direction: column;
    gap: 8rpx;

    .facility-name {
      font-size: 24rpx;
      color: $text-secondary;
      text-align: center;
    }
  }
}

// 政策列表
.policy-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;

  .policy-item {
    @include flex-between();
    align-items: flex-start;

    .policy-label {
      flex: 0 0 auto;

      .label-text {
        font-size: 26rpx;
        color: $text-secondary;
      }
    }

    .policy-value {
      flex: 1;
      text-align: right;

      .value-text {
        font-size: 26rpx;
        color: $text-primary;
      }
    }
  }
}

// 房型列表
.room-list {
  display: flex;
  flex-direction: column;

  .room-card {
    @include flex-start();
    gap: 20rpx;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #ddd;
    position: relative;
    transition: opacity $transition-base;

    &:last-child {
      border-bottom: none;
    }

    &:active {
      opacity: 0.7;
    }
  }

  .room-card-image {
    width: 230rpx;
    height: 174rpx;
    flex-shrink: 0;
    border-radius: 12rpx;
  }

  .room-card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }

  .room-header {
    @include flex-start();
    align-items: center;
    gap: 8rpx;
  }

  .room-card-name {
    font-size: 28rpx;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    line-height: 1.4;
  }

  .room-time-badge {
    padding: 4rpx 8rpx;
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border-radius: 6rpx;

    .time-text {
      display: flex;
      font-size: 20rpx;
      color: #92400e;
      font-weight: $font-weight-medium;
      line-height: 1.3;
    }
  }

  .room-specs {
    @include flex-start();
    align-items: center;
    gap: 12rpx;

    .spec-item {
      font-size: 22rpx;
      color: $text-secondary;
    }

    .spec-divider {
      font-size: 22rpx;
      color: $text-tertiary;
    }

    .remaining-rooms {
      font-size: 22rpx;
      color: $success-color;
      font-weight: $font-weight-semibold;
    }
  }

  .room-features {
    @include flex-start();
    gap: 8rpx;
    flex-wrap: wrap;
    margin-bottom: 4rpx;

    .feature-text {
      font-size: 22rpx;
      color: $text-secondary;
      line-height: 1.4;
    }
  }

  .room-card-footer {
    @include flex-between();
    align-items: center;

    .room-price-info {
      @include flex-start();
      align-items: baseline;
      gap: 2rpx;

      .price-symbol {
        font-size: 24rpx;
        color: $error-color;
        font-weight: $font-weight-medium;
      }

      .price-amount {
        font-size: 36rpx;
        font-weight: $font-weight-semibold;
        color: $error-color;
        line-height: 1;
      }

      .price-label {
        font-size: 20rpx;
        color: $text-tertiary;
        margin-left: 4rpx;
      }
    }

    .book-button-new {
      padding: 8rpx 20rpx;
      background: linear-gradient(135deg, $primary-color 0%, #8b5cf6 100%);
      border-radius: 40rpx;
      transition: all $transition-base;

      &:active {
        transform: scale(0.95);
        opacity: 0.8;
      }

      .book-text-new {
        display: flex;
        font-size: 24rpx;
        color: #fff;
        font-weight: $font-weight-semibold;
      }
    }
  }
}

// 评价概览卡片
.review-summary-card {
  @include flex-start();
  gap: 44rpx;
  background: $background-primary;
  padding: 32rpx;
  margin-bottom: 16rpx;

  .summary-left {
    flex: 0 0 auto;
    @include flex-center();
    flex-direction: column;
    gap: 12rpx;

    .summary-score {
      font-size: 72rpx;
      font-weight: $font-weight-semibold;
      color: #F59E0B;
      line-height: 1;
    }

    .summary-stars {
      @include flex-center();
      gap: 4rpx;
    }

    .summary-count {
      font-size: 22rpx;
      color: $text-secondary;
    }
  }

  .summary-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12rpx;

    .stat-item {
      @include flex-start();
      align-items: center;
      gap: 12rpx;

      .stat-label {
        flex: 0 0 auto;
        width: 56rpx;
        font-size: 24rpx;
        color: $text-secondary;
      }

      .stat-bar {
        flex: 1;
        height: 12rpx;
        background: #eee;
        border-radius: 6rpx;
        overflow: hidden;

        .stat-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%);
          border-radius: 6rpx;
          transition: width $transition-base;
        }
      }

      .stat-score {
        flex: 0 0 auto;
        width: 44rpx;
        text-align: right;
        font-size: 24rpx;
        font-weight: $font-weight-semibold;
        color: #d97706;
      }
    }
  }
}

// 评价列表
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;

  .review-item {
    padding: 24rpx;
    background: $background-secondary;
    border: 1rpx solid #eee;
    border-radius: 24rpx;
  }

  .review-header {
    @include flex-center();
    gap: 16rpx;
    margin-bottom: 12rpx;
  }

  .user-avatar {
    flex: 0 0 auto;
    width: 76rpx;
    height: 76rpx;
    border-radius: $border-radius-full;
    border: 1rpx solid #ddd;
  }

  .user-info {
    flex: 1;
    display: flex;
    justify-content: flex-start;
    flex-direction: column;
  }

  .user-name {
    font-size: 28rpx;
    color: $text-primary;
    font-weight: $font-weight-semibold;
  }

  .rating-stars {
    @include flex-start();
    gap: 4rpx;
  }

  .review-date {
    flex: 0 0 auto;
    font-size: 24rpx;
    color: $text-tertiary;
  }

  .review-room-type {
    @include flex-start();
    align-items: center;
    gap: 6rpx;
    margin-bottom: 12rpx;

    .room-type-text {
      font-size: 24rpx;
      color: $text-tertiary;
    }
  }

  .review-content {
    display: block;
    font-size: 26rpx;
    color: $text-secondary;
    line-height: 1.5;
    margin-bottom: 16rpx;
  }

  .review-images {
    @include flex-start();
    gap: 12rpx;
    flex-wrap: wrap;
    margin-bottom: 16rpx;
  }

  .review-image {
    width: 200rpx;
    height: 140rpx;
    border-radius: 12rpx;
  }

  .review-reply {
    padding: 20rpx;
    background: $background-primary;
    border-left: 4rpx solid $primary-dark;
    border-radius: 12rpx;
    margin-top: 16rpx;

    .reply-header {
      @include flex-start();
      align-items: center;
      gap: 8rpx;
      margin-bottom: 8rpx;

      .reply-label {
        font-size: 24rpx;
        color: $primary-dark;
        font-weight: $font-weight-semibold;
      }
    }

    .reply-content {
      font-size: 26rpx;
      color: $text-secondary;
      line-height: 1.6;
    }
  }
}

.load-more {
  @include flex-center();
  gap: 8rpx;
  padding: 24rpx 0;
  margin-top: 16rpx;
  cursor: pointer;

  .load-more-text {
    font-size: 26rpx;
    color: $primary-color;
    font-weight: $font-weight-medium;
  }
}

// 底部留白
.bottom-spacer {
  height: 120rpx;
  @include safe-area-inset-bottom(120rpx);
}
</style>
