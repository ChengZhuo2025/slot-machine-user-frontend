<template>
  <view class="my-orders">
    <!-- 订单类型标签 -->
    <view class="type-tabs">
      <view
        v-for="type in orderTypes"
        :key="type.value"
        class="type-tab"
        :class="{ 'type-tab--active': currentType === type.value }"
        @click="changeType(type.value)"
      >
        <Icon :name="type.icon" size="small" :color="currentType === type.value ? '#fff' : '#999'" />
        <text class="type-text">{{ type.label }}</text>
      </view>
    </view>

    <!-- 订单状态标签 -->
    <view class="status-tabs">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        class="status-tab"
        :class="{ 'status-tab--active': currentTab === tab.value }"
        @click="changeTab(tab.value)"
      >
        <text class="status-text">{{ tab.label }}</text>
      </view>
    </view>

    <!-- 订单列表 -->
    <scroll-view class="order-list" scroll-y="true" @scrolltolower="loadMore">
      <view v-for="order in filteredOrders" :key="order.id" class="order-item" @click="handleOrderClick(order)">
        <!-- 订单头部 -->
        <view class="order-header">
          <view class="header-left">
            <Icon :name="order.type === 'hotel' ? 'bed' : 'shopping-cart'" size="xsmall" :color="order.type === 'hotel' ? '#be32d7' : '#10b981'" />
            <text class="order-type-label">{{ order.type === 'hotel' ? '预约订单' : '商城订单' }}</text>
          </view>
          <text class="order-status" :class="`order-status--${order.status}`">{{ getStatusText(order.status, order.type) }}</text>
        </view>

        <!-- 订单内容 -->
        <view class="order-content">
          <image :src="order.image" class="order-image" mode="aspectFill" />
          <view class="order-info">
            <text class="order-title">{{ order.title }}</text>
            <text class="order-desc">{{ order.description }}</text>
            <view class="order-details">
              <text v-if="order.type === 'hotel'" class="detail-text">{{ order.checkInTime }}</text>
              <text v-if="order.type === 'product'" class="detail-text">x{{ order.quantity }}</text>
            </view>
          </view>
        </view>

        <!-- 订单底部 -->
        <view class="order-footer">
          <view class="footer-left">
            <text class="order-no">订单号: {{ order.orderNo }}</text>
            <text class="order-time">{{ formatTime(order.createTime) }}</text>
          </view>
          <view class="footer-right">
            <text class="order-price-label">实付:</text>
            <text class="order-price">¥{{ order.totalPrice }}</text>
          </view>
        </view>

        <!-- 订单操作 -->
        <view class="order-actions">
          <view v-if="order.status === 'cancelled'" class="btn-action btn-delete" @click.stop="handleDelete(order)">
            <text class="btn-text">删除订单</text>
          </view>
          <view v-if="order.status === 'completed'" class="btn-action btn-review" @click.stop="handleReview(order)">
            <text class="btn-text">评价</text>
          </view>
          <view v-if="order.status === 'pending'" class="btn-action btn-cancel" @click.stop="handleCancel(order)">
            <text class="btn-text">取消订单</text>
          </view>
          <view v-if="order.status === 'pending'" class="btn-action btn-pay" @click.stop="handlePay(order)">
            <text class="btn-text">去支付</text>
          </view>
          <view v-if="order.status === 'paid' && order.type === 'hotel'" class="btn-action btn-use" @click.stop="handleUse(order)">
            <text class="btn-text">查看详情</text>
          </view>
          <view v-if="order.status === 'paid' && order.type === 'product'" class="btn-action btn-logistics" @click.stop="handleLogistics(order)">
            <text class="btn-text">查看物流</text>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view v-if="loading" class="loading-more">
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 没有更多 -->
      <view v-if="noMore && filteredOrders.length > 0" class="no-more">
        <text class="no-more-text">没有更多了</text>
      </view>

      <!-- 空状态 -->
      <view v-if="!filteredOrders.length && !loading" class="empty-state">
        <Icon name="list" size="xlarge" color="#ccc" />
        <text class="empty-text">暂无订单</text>
        <text class="empty-tip">{{ getEmptyTip() }}</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { ref, computed } from 'vue'
import Icon from '../common/Icon.vue'

export default {
  name: 'MyOrders',
  components: { Icon },
  setup() {
    const currentType = ref('all')
    const currentTab = ref('all')
    const page = ref(1)
    const loading = ref(false)
    const noMore = ref(false)

    // 订单类型
    const orderTypes = [
      { label: '全部订单', value: 'all', icon: 'list' },
      { label: '预约订单', value: 'hotel', icon: 'bed' },
      { label: '商城订单', value: 'product', icon: 'shopping-cart' }
    ]

    // 订单状态标签 - 使用计算属性根据订单类型动态显示
    const tabs = computed(() => {
      const paidLabel = currentType.value === 'all' ? '待完成' :
                        currentType.value === 'hotel' ? '待使用' : '待收货'
      
      return [
        { label: '全部', value: 'all' },
        { label: '待支付', value: 'pending' },
        { label: paidLabel, value: 'paid' },
        { label: '已完成', value: 'completed' },
        { label: '已取消', value: 'cancelled' }
      ]
    })

    const orders = ref([])

    // 酒店房型数据 - 参照 hotel/detail 页面
    const hotelRooms = [
      { name: '星河璀璨大床房', price: 199, image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/room01.jpg', description: '25m² · 2.0米大床' },
      { name: '梦幻星空双床房', price: 229, image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/room02.jpg', description: '30m² · 1.5米双床' },
      { name: '尊享电竞单人间', price: 299, image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/room03.jpg', description: '20m² · 1.5米单人床' },
      { name: '双人开黑电竞房', price: 428, image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/room04.jpg', description: '35m² · 双人电竞位' },
      { name: '浪漫情侣影音套房', price: 358, image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/room05.jpg', description: '40m² · 2.2米圆床' },
      { name: '豪华家庭套房', price: 498, image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/room06.jpg', description: '55m² · 大床+双床' }
    ]

    // 商品数据 - 参照 mall/index 页面
    const products = [
      { name: '杜蕾斯至薄装安全套', price: 89.9, image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good01.jpg', description: '情趣用品' },
      { name: 'KY私密润滑剂50ml', price: 129.9, image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good02.jpg', description: '情趣用品' },
      { name: '维多利亚蕾丝情趣内衣', price: 299.9, image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good03.jpg', description: '情趣用品' },
      { name: 'Fairvital德国玛卡胶囊', price: 210.9, image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good04.jpg', description: '营养保健' },
      { name: '简禾酒精杀菌消毒湿巾', price: 19.9, image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good05.jpg', description: '清洁护理' },
      { name: '伊珞EROCOME震动棒', price: 169.9, image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good06.jpg', description: '情趣用品' },
      { name: '五星级酒店毛巾套装', price: 89.9, image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good07.jpg', description: '酒店用品' },
      { name: '酒店专用拖鞋', price: 29.9, image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good08.jpg', description: '酒店用品' },
      { name: '全季禅茶香薰精油', price: 59.9, image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good09.jpg', description: '酒店用品' },
      { name: '酒店床品四件套', price: 199.9, image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good10.jpg', description: '酒店用品' },
      { name: '海瑟薇氨基酸洗发水', price: 39.9, image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good11.jpg', description: '清洁护理' },
      { name: 'Adidas男士沐浴露', price: 35.9, image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good12.jpg', description: '清洁护理' }
    ]

    // 酒店名称
    const hotelNames = ['梦幻星空主题酒店', '尊享私密电竞酒店', '浪漫情侣私密影院酒店', '奢华商务精品酒店']

    // 时段选项
    const timeSlots = [
      { start: '09:00', end: '12:00', duration: 3 },
      { start: '12:00', end: '15:00', duration: 3 },
      { start: '14:00', end: '18:00', duration: 4 },
      { start: '18:00', end: '22:00', duration: 4 },
      { start: '22:00', end: '06:00', duration: 8 }
    ]

    // 筛选后的订单列表
    const filteredOrders = computed(() => {
      let result = [...orders.value]

      // 按订单类型筛选
      if (currentType.value !== 'all') {
        result = result.filter(order => order.type === currentType.value)
      }

      // 按订单状态筛选
      if (currentTab.value !== 'all') {
        result = result.filter(order => order.status === currentTab.value)
      }

      return result
    })

    // 获取状态文本 - 根据订单类型显示不同文本
    const getStatusText = (status, orderType) => {
      if (status === 'pending') {
        return '待支付'
      } else if (status === 'paid') {
        // 根据订单类型显示不同的文本
        return orderType === 'hotel' ? '待使用' : '待收货'
      } else if (status === 'completed') {
        return '已完成'
      } else if (status === 'cancelled') {
        return '已取消'
      }
      return status
    }

    // 切换订单类型
    const changeType = (type) => {
      currentType.value = type
      currentTab.value = 'all'
      orders.value = []
      page.value = 1
      noMore.value = false
      loadOrders()
    }

    // 切换订单状态
    const changeTab = (tab) => {
      currentTab.value = tab
    }

    // 加载订单
    const loadOrders = () => {
      if (loading.value || noMore.value) return
      loading.value = true

      setTimeout(() => {
        const mockOrders = []
        const statuses = ['pending', 'paid', 'completed', 'cancelled']

        for (let i = 0; i < 15; i++) {
          const type = currentType.value === 'all'
            ? (Math.random() > 0.5 ? 'hotel' : 'product')
            : currentType.value
          const status = statuses[Math.floor(Math.random() * statuses.length)]

          if (type === 'hotel') {
            const room = hotelRooms[Math.floor(Math.random() * hotelRooms.length)]
            const hotel = hotelNames[Math.floor(Math.random() * hotelNames.length)]
            const slot = timeSlots[Math.floor(Math.random() * timeSlots.length)]
            const checkInDate = new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000)
            const dateStr = checkInDate.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }).replace(/\//g, '-')

            mockOrders.push({
              id: Date.now() + i,
              orderNo: 'HT' + Date.now() + Math.floor(Math.random() * 1000),
              type: 'hotel',
              title: room.name,
              description: hotel,
              image: room.image,
              totalPrice: room.price.toFixed(2),
              checkInTime: `${dateStr} ${slot.start}-${slot.end}`,
              duration: slot.duration,
              status: status,
              createTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
            })
          } else {
            const product = products[Math.floor(Math.random() * products.length)]
            const quantity = Math.floor(Math.random() * 3) + 1

            mockOrders.push({
              id: Date.now() + i + 1000,
              orderNo: 'ML' + Date.now() + Math.floor(Math.random() * 1000),
              type: 'product',
              title: product.name,
              description: product.description,
              image: product.image,
              totalPrice: (product.price * quantity).toFixed(2),
              quantity: quantity,
              status: status,
              createTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
            })
          }
        }

        orders.value.push(...mockOrders)

        if (page.value >= 2) noMore.value = true
        loading.value = false
      }, 500)
    }



    // 加载更多
    const loadMore = () => {
      if (!loading.value && !noMore.value) {
        page.value++
        loadOrders()
      }
    }

    // 格式化时间
    const formatTime = (time) => {
      const date = new Date(time)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/\//g, '-')
    }

    // 获取空状态提示
    const getEmptyTip = () => {
      if (currentType.value === 'hotel') {
        return '快去预订心仪的酒店房间吧'
      } else if (currentType.value === 'product') {
        return '快去商城选购喜欢的商品吧'
      }
      return '快去体验我们的服务吧'
    }

    // 点击订单
    const handleOrderClick = (order) => {
      uni.showToast({
        title: '查看订单详情',
        icon: 'none'
      })
    }

    // 支付订单
    const handlePay = (order) => {
      uni.showModal({
        title: '确认支付',
        content: `确认支付 ¥${order.totalPrice} 吗？`,
        success: (res) => {
          if (res.confirm) {
            uni.showToast({ title: '支付成功', icon: 'success' })
            order.status = 'paid'
          }
        }
      })
    }

    // 取消订单
    const handleCancel = (order) => {
      uni.showModal({
        title: '取消订单',
        content: '确定要取消这个订单吗？',
        success: (res) => {
          if (res.confirm) {
            order.status = 'cancelled'
            uni.showToast({ title: '订单已取消', icon: 'success' })
          }
        }
      })
    }

    // 删除订单
    const handleDelete = (order) => {
      uni.showModal({
        title: '删除订单',
        content: '确定要删除这个订单吗？',
        success: (res) => {
          if (res.confirm) {
            const index = orders.value.findIndex(o => o.id === order.id)
            if (index > -1) {
              orders.value.splice(index, 1)
              uni.showToast({ title: '订单已删除', icon: 'success' })
            }
          }
        }
      })
    }

    // 使用订单（酒店）
    const handleUse = (order) => {
      uni.showToast({
        title: '查看预约详情',
        icon: 'none'
      })
    }

    // 查看物流（商品）
    const handleLogistics = (order) => {
      uni.showToast({
        title: '查看物流信息',
        icon: 'none'
      })
    }

    // 评价订单
    const handleReview = (order) => {
      uni.showToast({
        title: '去评价',
        icon: 'none'
      })
    }

    // 初始化加载
    loadOrders()

    return {
      currentType,
      currentTab,
      orderTypes,
      tabs,
      orders,
      filteredOrders,
      loading,
      noMore,
      getStatusText,
      changeType,
      changeTab,
      loadMore,
      formatTime,
      getEmptyTip,
      handleOrderClick,
      handlePay,
      handleCancel,
      handleDelete,
      handleUse,
      handleLogistics,
      handleReview
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.my-orders {
  height: 100%;
  display: flex;
  flex-direction: column;
}

// 订单类型标签
.type-tabs {
  @include flex();
  gap: $spacing-base;
  margin-bottom: $spacing-xs;

  .type-tab {
    flex: 1;
    @include flex-center();
    flex-direction: column;
    gap: 4rpx;
    padding: $spacing-sm 0;
    background: $background-primary;
    border-radius: $border-radius-lg;
    transition: all $transition-base;

    &--active {
      background: $gradient-primary;
      
      .type-text {
        color: $background-primary !important;
        font-weight: $font-weight-semibold;
      }
    }

    .type-text {
      font-size: $font-size-xs;
      color: $text-secondary;
      transition: all $transition-base;
    }
  }
}

// 订单状态标签 - 与 MyFavorites 的 filter-tabs 样式一致
.status-tabs {
  @include flex-start();
  border-bottom: 2rpx solid #ddd;
  margin-bottom: $spacing-base;

  .status-tab {
    flex: 1;
    @include flex-center();
    height: 88rpx;
    position: relative;
    transition: all $transition-base;

    .status-text {
      font-size: 28rpx;
      color: $text-secondary;
      transition: all $transition-base;
    }

    &--active {
      .status-text {
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

// 订单列表
.order-list {
  flex: 1;

  .order-item {
    background: $background-primary;
    border-radius: 20rpx;
    padding: $spacing-base;
    margin-bottom: $spacing-base;
    transition: transform $transition-base;

    &:active {
      transform: scale(0.98);
    }

    // 订单头部
    .order-header {
      @include flex-between();
      align-items: center;
      margin-bottom: $spacing-sm;
      padding-bottom: $spacing-xs;
      border-bottom: 1rpx solid #ddd;

      .header-left {
        @include flex-start();
        align-items: center;
        gap: 8rpx;

        .order-type-label {
          font-size: $font-size-xs;
          color: $text-secondary;
          font-weight: $font-weight-medium;
        }
      }

      .order-status {
        font-size: $font-size-xs;
        font-weight: $font-weight-medium;
        padding: 4rpx 12rpx;
        border-radius: $border-radius-base;

        &--pending {
          color: $warning-color;
          background: rgba($warning-color, 0.1);
        }

        &--paid {
          color: $primary-color;
          background: rgba($primary-color, 0.1);
        }

        &--completed {
          color: $success-color;
          background: rgba($success-color, 0.1);
        }

        &--cancelled {
          color: $text-tertiary;
          background: rgba($text-tertiary, 0.1);
        }
      }
    }

    // 订单内容
    .order-content {
      @include flex();
      gap: $spacing-base;
      margin-bottom: $spacing-sm;

      .order-image {
        width: 180rpx;
        height: 120rpx;
        border-radius: $border-radius-base;
        flex-shrink: 0;
      }

      .order-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-width: 0;

        .order-title {
          font-size: $font-size-sm;
          font-weight: $font-weight-semibold;
          color: $text-primary;
          @include ellipsis();
          margin-bottom: 4rpx;
        }

        .order-desc {
          font-size: $font-size-xs;
          color: $text-secondary;
          @include ellipsis();
          margin-bottom: 4rpx;
        }

        .order-details {
          @include flex-start();
          gap: $spacing-sm;

          .detail-text {
            font-size: $font-size-xs;
            color: $text-tertiary;
          }
        }
      }
    }

    // 订单底部
    .order-footer {
      @include flex-between();
      padding-top: $spacing-sm;
      border-top: 1rpx solid #ddd;

      .footer-left {
        display: flex;
        flex-direction: column;
        gap: 4rpx;

        .order-no {
          font-size: 22rpx;
          color: $text-tertiary;
        }

        .order-time {
          font-size: 22rpx;
          color: $text-tertiary;
        }
      }

      .footer-right {
        @include flex-end();
        align-items: baseline;
        gap: 8rpx;

        .order-price-label {
          font-size: $font-size-xs;
          color: $text-secondary;
        }

        .order-price {
          font-size: 32rpx;
          font-weight: $font-weight-semibold;
          color: $error-color;
          line-height: 1;
        }
      }
    }

    // 订单操作
    .order-actions {
      @include flex-end();
      gap: $spacing-sm;
      margin-top: $spacing-xs;

      .btn-action {
        padding: 10rpx 24rpx;
        border-radius: $border-radius-full;
        transition: all $transition-base;

        &:active {
          transform: scale(0.95);
          opacity: 0.8;
        }

        .btn-text {
          display: flex;
          font-size: $font-size-xs;
          font-weight: $font-weight-medium;
        }

        &.btn-delete {
          background: rgba($text-tertiary, 0.1);
          border: 1rpx solid #ddd;

          .btn-text {
            color: $text-secondary;
          }
        }

        &.btn-cancel {
          background: rgba($text-tertiary, 0.1);
          border: 1rpx solid #ddd;

          .btn-text {
            color: $text-secondary;
          }
        }

        &.btn-review {
          background: rgba($warning-color, 0.1);
          border: 1rpx solid rgba($warning-color, 0.3);

          .btn-text {
            color: $warning-color;
          }
        }

        &.btn-pay {
          background: $gradient-primary;

          .btn-text {
            color: #fff;
          }
        }

        &.btn-use {
          background: linear-gradient(135deg, $success-color 0%, #059669 100%);

          .btn-text {
            color: #fff;
          }
        }

        &.btn-logistics {
          background: linear-gradient(135deg, $info-color 0%, #0284c7 100%);

          .btn-text {
            color: #fff;
          }
        }
      }
    }
  }

  // 加载更多
  .loading-more {
    @include flex-center();
    padding: $spacing-base;

    .loading-text {
      font-size: $font-size-xs;
      color: $text-tertiary;
    }
  }

  // 没有更多
  .no-more {
    @include flex-center();
    padding: $spacing-base;

    .no-more-text {
      font-size: $font-size-xs;
      color: $text-tertiary;
    }
  }

  // 空状态
  .empty-state {
    @include flex-center();
    flex-direction: column;
    gap: $spacing-base;
    padding: $spacing-xl * 2 0;

    .empty-text {
      font-size: $font-size-sm;
      color: $text-tertiary;
    }

    .empty-tip {
      font-size: $font-size-xs;
      color: $text-tertiary;
      text-align: center;
      padding: 0 $spacing-xl;
    }
  }
}
</style>
