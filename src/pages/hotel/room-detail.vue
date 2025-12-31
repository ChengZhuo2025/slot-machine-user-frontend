<template>
  <view class="room-detail-page">
    <!-- 导航栏 -->
    <view class="header-bar">
      <view class="header-left" @click="handleBack">
        <Icon name="arrow-left" size="medium" color="#666" />
      </view>
      <view class="header-center">
        <text class="header-title">房间详情</text>
      </view>
      <view class="header-right"></view>
    </view>

    <scroll-view class="content" scroll-y="true">
      <!-- 图片轮播 -->
      <view class="image-swiper animate__animated animate__fadeIn">
        <swiper
          class="swiper"
          :indicator-dots="true"
          :autoplay="true"
          :interval="3000"
          :duration="500"
          indicator-color="rgba(255,255,255,0.5)"
          indicator-active-color="#fff"
        >
          <swiper-item v-for="(img, index) in room.images" :key="index">
            <image class="swiper-image" :src="img" mode="aspectFill" />
          </swiper-item>
        </swiper>
      </view>

      <!-- 房间基本信息 -->
      <view class="room-info-card animate__animated animate__fadeInUp" style="animation-delay: 100ms;">
        <view class="info-header">
          <text class="room-name">{{ room.name }}</text>
          <view v-if="room.tag" class="room-tag">{{ room.tag }}</view>
        </view>
        <view class="room-specs">
          <view class="spec-item">
            <Icon name="ruler" size="small" color="#666" />
            <text class="spec-text">{{ room.area }}m²</text>
          </view>
          <view class="spec-item">
            <Icon name="bed" size="small" color="#666" />
            <text class="spec-text">{{ room.bedType }}</text>
          </view>
          <view class="spec-item">
            <Icon name="user" size="small" color="#666" />
            <text class="spec-text">最多{{ room.maxGuests }}人</text>
          </view>
        </view>
      </view>

      <!-- 时段选择 -->
      <view class="section-card animate__animated animate__fadeInUp" style="animation-delay: 200ms;">
        <view class="section-title">
          <Icon name="clock" size="small" color="#666" />
          <text class="title-text">选择时段</text>
          <text class="subtitle">{{ selectedDate }}</text>
        </view>

        <!-- 日期选择 -->
        <view class="date-selector">
          <view
            v-for="date in dates"
            :key="date.value"
            class="date-item"
            :class="{ 'date-item--active': selectedDate === date.value }"
            @click="handleDateChange(date.value)"
          >
            <text class="date-label">{{ date.label }}</text>
            <text class="date-value">{{ date.day }}</text>
          </view>
        </view>

        <!-- 时段列表 -->
        <view class="timeslots-list">
          <view
            v-for="slot in timeSlots"
            :key="slot.id"
            class="timeslot-item"
            :class="{
              'timeslot-item--active': selectedSlot === slot.id,
              'timeslot-item--disabled': !slot.available
            }"
            @click="handleSlotChange(slot)"
          >
            <view class="slot-info">
              <text class="slot-time">{{ slot.startTime }}~{{ slot.endTime }}</text>
              <text class="slot-duration">{{ slot.duration }}小时</text>
            </view>
            <view class="slot-price">
              <text class="price">¥{{ slot.price }}</text>
              <view v-if="!slot.available" class="unavailable-badge">已满</view>
            </view>
          </view>
        </view>
      </view>

      <!-- Tab导航 -->
      <view class="tab-navigation animate__animated animate__fadeInDown" style="animation-delay: 300ms;">
        <view
          class="tab-item"
          :class="{ 'tab-item--active': activeTab === 'intro' }"
          @click="activeTab = 'intro'"
        >
          <text class="tab-text">简介</text>
        </view>
        <view
          class="tab-item"
          :class="{ 'tab-item--active': activeTab === 'detail' }"
          @click="activeTab = 'detail'"
        >
          <text class="tab-text">详情</text>
        </view>
      </view>

      <!-- Tab内容区 -->
      <view class="tab-content">
        <!-- 简介Tab -->
        <view v-show="activeTab === 'intro'" class="tab-pane">
          <!-- 房间特色 -->
          <view class="section-card animate__animated animate__fadeInUp" style="animation-delay: 400ms;" v-if="room.features && room.features.length > 0">
            <view class="section-title">
              <Icon name="sparkle" size="small" color="#666" />
              <text class="title-text">房间特色</text>
            </view>
            <view class="features-list">
              <view v-for="(feature, index) in room.features" :key="index" class="feature-item">
                <Icon :name="feature.icon || 'check'" size="medium" :color="getFeatureColor(index)" />
                <text class="feature-name">{{ feature.name }}</text>
                <text class="feature-desc" v-if="feature.description">{{ feature.description }}</text>
              </view>
            </view>
          </view>

          <!-- 房间设施 -->
          <view class="section-card animate__animated animate__fadeInUp" style="animation-delay: 500ms;" v-if="room.amenities && room.amenities.length > 0">
            <view class="section-title">
              <Icon name="grid" size="small" color="#666" />
              <text class="title-text">房间设施</text>
            </view>
            <view class="amenities-grid">
              <view v-for="(amenity, index) in room.amenities" :key="index" class="amenity-item">
                <text class="amenity-name">{{ amenity }}</text>
              </view>
            </view>
          </view>

          <!-- 入住须知 -->
          <view class="section-card animate__animated animate__fadeInUp" style="animation-delay: 600ms;" v-if="room.policies">
            <view class="section-title">
              <Icon name="info" size="small" color="#666" />
              <text class="title-text">入住须知</text>
            </view>
            <view class="notice-list">
              <view class="notice-item" v-if="room.policies.cancellation">
                <view class="notice-dot"></view>
                <text class="notice-text">取消政策：{{ room.policies.cancellation }}</text>
              </view>
              <view class="notice-item" v-if="room.policies.smoking !== undefined">
                <view class="notice-dot"></view>
                <text class="notice-text">{{ room.policies.smoking ? '允许吸烟' : '禁止吸烟' }}</text>
              </view>
              <view class="notice-item" v-if="room.policies.extraBed">
                <view class="notice-dot"></view>
                <text class="notice-text">{{ room.policies.extraBed }}</text>
              </view>
              <view class="notice-item" v-if="room.policies.deposit">
                <view class="notice-dot"></view>
                <text class="notice-text">押金：{{ room.policies.deposit }}</text>
              </view>
              <view class="notice-item" v-if="room.policies.idCard">
                <view class="notice-dot"></view>
                <text class="notice-text">{{ room.policies.idCard }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 详情Tab -->
        <view v-show="activeTab === 'detail'" class="tab-pane">
          <view class="section-card animate__animated animate__fadeInUp" style="animation-delay: 400ms;">
            <view class="rich-content" v-if="room.detailContent" v-html="room.detailContent"></view>
            <view v-else class="empty-tip">
              <text class="empty-text">暂无详细介绍</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部预订栏 -->
    <view class="booking-bar animate__animated animate__slideInUp">
      <view class="price-info">
        <text class="price-label">总价</text>
        <view class="price-box">
          <text class="price">¥{{ totalPrice }}</text>
          <text class="price-unit">{{ selectedSlotInfo?.duration || 0 }}小时</text>
        </view>
      </view>
      <view
        class="book-button"
        :class="{ 'book-button--disabled': !canBook }"
        @click="handleBook"
      >
        <text class="button-text">立即预订</text>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import Icon from '@/components/common/Icon.vue'
import request from '@/utils/request'

export default {
  name: 'RoomDetailPage',
  components: {
    Icon
  },
  setup() {
    const hotelId = ref('')
    const roomId = ref('')
    const room = ref({
      name: '',
      images: [],
      area: 0,
      bedType: '',
      maxGuests: 0,
      features: [],
      amenities: [],
      policies: {}
    })
    const selectedDate = ref('')
    const selectedSlot = ref('')
    const timeSlots = ref([])
    const activeTab = ref('intro') // Tab导航状态

    // 生成日期列表（今天 + 未来6天）
    const dates = computed(() => {
      const result = []
      const today = new Date()

      for (let i = 0; i < 7; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)

        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        const label = i === 0 ? '今天' : i === 1 ? '明天' : weekdays[date.getDay()]
        const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        const day = `${date.getMonth() + 1}/${date.getDate()}`

        result.push({ label, value, day })
      }

      return result
    })

    // 选中的时段信息
    const selectedSlotInfo = computed(() => {
      if (!Array.isArray(timeSlots.value)) {
        return null
      }
      return timeSlots.value.find(slot => slot.id === selectedSlot.value)
    })

    // 总价
    const totalPrice = computed(() => {
      return selectedSlotInfo.value?.price || 0
    })

    // 是否可以预订
    const canBook = computed(() => {
      return selectedDate.value && selectedSlot.value && selectedSlotInfo.value?.available
    })

    // 获取房间详情
    const fetchRoomDetail = async () => {
      try {
        const res = await request({
          url: `/api/hotels/${hotelId.value}/rooms/${roomId.value}`,
          method: 'GET'
        })
        console.log('房间详情完整响应:', res)

        // request工具返回的是 { code, data, message }
        // 真实的房间数据在 res.data 中
        if (res && res.data) {
          room.value = res.data
          console.log('room.value已更新:', room.value)
        }
      } catch (error) {
        console.error('获取房间详情失败:', error)
        uni.showToast({
          title: '获取房间详情失败',
          icon: 'none'
        })
      }
    }

    // 获取时段列表
    const fetchTimeSlots = async (date) => {
      try {
        const url = `/api/hotels/${hotelId.value}/rooms/${roomId.value}/timeslots`
        console.log('请求时段列表URL:', url, 'date:', date)

        const res = await request({
          url: url,
          method: 'GET',
          data: { date }
        })
        console.log('时段列表完整响应:', res)
        console.log('res.data:', res.data)
        console.log('res.data是数组?', Array.isArray(res.data))
        console.log('res.data.length:', res.data?.length)

        // request工具返回的是 { code, data, message }
        // 真实的时段数据在 res.data 中，且res.data是数组
        if (res && res.data) {
          if (Array.isArray(res.data)) {
            timeSlots.value = res.data
            console.log('设置timeSlots为数组，长度:', res.data.length)
          } else if (res.data.list && Array.isArray(res.data.list)) {
            timeSlots.value = res.data.list
            console.log('设置timeSlots为list，长度:', res.data.list.length)
          } else {
            console.log('res.data不是数组也没有list:', typeof res.data, res.data)
            timeSlots.value = []
          }
          console.log('时段列表最终值:', timeSlots.value)
          console.log('timeSlots.value.length:', timeSlots.value.length)
        } else {
          console.log('res或res.data不存在')
          timeSlots.value = []
        }
      } catch (error) {
        console.error('获取时段失败:', error)
        timeSlots.value = []
        uni.showToast({
          title: '获取时段失败',
          icon: 'none'
        })
      }
    }

    // 日期变化
    const handleDateChange = (date) => {
      selectedDate.value = date
      selectedSlot.value = ''
      fetchTimeSlots(date)
    }

    // 时段变化
    const handleSlotChange = (slot) => {
      if (!slot.available) {
        uni.showToast({
          title: '该时段已满',
          icon: 'none'
        })
        return
      }
      selectedSlot.value = slot.id
    }

    // 返回
    const handleBack = () => {
      uni.navigateBack()
    }

    // 预订
    const handleBook = () => {
      if (!canBook.value) {
        uni.showToast({
          title: '请选择日期和时段',
          icon: 'none'
        })
        return
      }

      uni.navigateTo({
        url: `/pages/hotel/book-confirm?hotelId=${hotelId.value}&roomId=${roomId.value}&date=${selectedDate.value}&slotId=${selectedSlot.value}`
      })
    }

    // 页面加载
    onLoad((options) => {
      console.log('页面参数:', options)

      // 支持多种参数格式
      hotelId.value = options.hotelId || options.hotel_id || '1'
      roomId.value = options.roomId || options.room_id || options.id || '1'

      console.log('hotelId:', hotelId.value, 'roomId:', roomId.value)

      fetchRoomDetail()

      // 默认选择今天
      if (dates.value.length > 0) {
        selectedDate.value = dates.value[0].value
        fetchTimeSlots(selectedDate.value)
      }
    })

    // 根据索引返回不同的图标颜色
    const getFeatureColor = (index) => {
      const colors = [
        '#6366f1', // 蓝紫色
        '#ec4899', // 粉色
        '#f59e0b', // 橙色
        '#10b981', // 绿色
        '#8b5cf6', // 紫色
        '#06b6d4', // 青色
        '#f43f5e', // 红色
        '#84cc16', // 黄绿色
        '#d946ef', // 洋红色
        '#14b8a6'  // 青绿色
      ]
      return colors[index % colors.length]
    }

    return {
      room,
      dates,
      selectedDate,
      selectedSlot,
      timeSlots,
      selectedSlotInfo,
      totalPrice,
      canBook,
      activeTab,
      handleBack,
      handleDateChange,
      handleSlotChange,
      handleBook,
      getFeatureColor
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.room-detail-page {
  min-height: 100vh;
  background: $background-secondary;
  display: flex;
  flex-direction: column;
  padding-bottom: 140rpx;
  @include safe-area-inset-bottom(140rpx);
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
  height: 400rpx;
  margin-top: 80rpx;

  .swiper {
    width: 100%;
    height: 100%;
  }

  .swiper-image {
    width: 100%;
    height: 100%;
  }
}

// 房间信息卡片
.room-info-card {
  background: $background-primary;
  padding: 24rpx;
  margin-bottom: 16rpx;

  .info-header {
    @include flex-start();
    align-items: center;
    gap: 12rpx;
    margin-bottom: 16rpx;

    .room-name {
      font-size: 32rpx;
      font-weight: $font-weight-semibold;
      color: $text-primary;
    }

    .room-tag {
      padding: 4rpx 12rpx;
      background: rgba($success-color, 0.1);
      color: $success-color;
      font-size: 22rpx;
      border-radius: 8rpx;
    }
  }

  .room-specs {
    @include flex-start();
    gap: 32rpx;
  }

  .spec-item {
    @include flex-start();
    align-items: center;
    gap: 8rpx;

    .spec-text {
      font-size: 24rpx;
      color: $text-secondary;
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
    margin: 12rpx 0 24rpx;

    .title-text {
      font-size: 28rpx;
      font-weight: $font-weight-semibold;
      color: $text-primary;
    }

    .subtitle {
      margin-left: auto;
      font-size: 24rpx;
      color: $text-tertiary;
    }
  }
}

// 特色列表
.features-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  .feature-item {
    @include flex-center();
    flex-direction: column;
    gap: 8rpx;
    padding: 14rpx;
    text-align: center;

    .feature-name {
      font-size: 26rpx;
      font-weight: $font-weight-medium;
      color: $text-primary;
    }

    .feature-desc {
      font-size: 22rpx;
      color: $text-tertiary;
      line-height: 1.4;
    }
  }
}

// 设施网格
.amenities-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;

  .amenity-item {
    padding: 12rpx 16rpx;
    background: $background-secondary;
    border-radius: 12rpx;
    text-align: center;

    .amenity-name {
      font-size: 26rpx;
      color: $text-secondary;
    }
  }
}

// 日期选择器
.date-selector {
  @include flex-start();
  gap: 12rpx;
  margin-bottom: 20rpx;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 8rpx;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */

  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
    width: 0;
    height: 0;
  }

  .date-item {
    flex: 0 0 auto;
    width: 120rpx;
    padding: 16rpx 12rpx;
    background: $background-secondary;
    border-radius: 16rpx;
    text-align: center;
    transition: all $transition-base;

    &--active {
      background: $primary-dark;

      .date-label,
      .date-value {
        color: #fff !important;
      }
    }

    .date-label {
      display: block;
      font-size: 24rpx;
      color: $text-secondary;
      margin-bottom: 8rpx;
    }

    .date-value {
      display: block;
      font-size: 26rpx;
      font-weight: $font-weight-semibold;
      color: $text-primary;
    }
  }
}

// 时段列表
.timeslots-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;

  .timeslot-item {
    @include flex-between();
    align-items: center;
    padding: 20rpx;
    background: $background-secondary;
    border-radius: 20rpx;
    border: 1rpx solid #eee;
    transition: all $transition-base;

    &--active {
      border-color: $primary-dark;
      background: rgba($primary-color, 0.1);

      .slot-duration {
        color: $background-primary;
        background: $primary-dark;
      }
    }

    &--disabled {
      opacity: 0.5;
    }
  }

  .slot-info {
    flex: 1;
  }

  .slot-time {
    display: block;
    font-size: 28rpx;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin-bottom: 4rpx;
  }

  .slot-duration {
    padding: 4rpx 16rpx;
    font-size: 24rpx;
    font-weight: $font-weight-semibold;
    color: $success-color;
    line-height: 1;
    background: rgba($success-color, 0.1);
    border-radius: $border-radius-full;
    transition: all $transition-base;
  }

  .slot-price {
    @include flex-center();
    flex-direction: column;
    gap: 6rpx;

    .price {
      font-size: 32rpx;
      font-weight: $font-weight-semibold;
      color: $error-color;
    }

    .unavailable-badge {
      padding: 4rpx 12rpx;
      background: $text-tertiary;
      color: #fff;
      font-size: 20rpx;
      border-radius: 8rpx;
    }
  }
}

// 须知列表
.notice-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;

  .notice-item {
    @include flex-start();
    gap: 12rpx;
  }

  .notice-dot {
    flex: 0 0 auto;
    width: 8rpx;
    height: 8rpx;
    background: $text-tertiary;
    border-radius: $border-radius-full;
    margin-top: 12rpx;
  }

  .notice-text {
    flex: 1;
    font-size: 26rpx;
    color: $text-secondary;
    line-height: 1.6;
  }
}

// 底部留白
.bottom-spacer {
  height: 40rpx;
}

// 底部预订栏
.booking-bar {
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
    gap: 8rpx;

    .price {
      font-size: 36rpx;
      font-weight: $font-weight-bold;
      color: $error-color;
    }

    .price-unit {
      font-size: 24rpx;
      color: $text-tertiary;
    }
  }

  .book-button {
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

// Tab导航
.tab-navigation {
  @include flex-start();
  background: $background-primary;
  border-bottom: 2rpx solid $border-light;
  position: sticky;
  top: 88rpx;
  z-index: 90;

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

// Tab内容
.tab-content {
  .tab-pane {
    min-height: 400rpx;
  }
}

// 富文本内容
.rich-content {
  padding: 24rpx;
  line-height: 1.8;
  font-size: 28rpx;
  color: $text-primary;

  ::v-deep img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 16rpx 0;
    border-radius: 8rpx;
  }

  ::v-deep p {
    margin: 16rpx 0;
  }

  ::v-deep h1, ::v-deep h2, ::v-deep h3 {
    font-weight: $font-weight-semibold;
    margin: 24rpx 0 16rpx;
  }
}

.empty-tip {
  @include flex-center();
  padding: 80rpx 0;

  .empty-text {
    font-size: 26rpx;
    color: $text-tertiary;
  }
}
</style>
