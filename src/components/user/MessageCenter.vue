<template>
  <view class="message-center">
    <!-- 消息类型标签 -->
    <view class="message-tabs">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        class="tab-item"
        :class="{ 'tab-item--active': currentTab === tab.value }"
        @click="changeTab(tab.value)"
      >
        <text class="tab-text">{{ tab.label }}</text>
        <view v-if="tab.count > 0" class="tab-dots"></view>
      </view>
    </view>

    <!-- 消息列表 -->
    <scroll-view class="message-list" scroll-y="true" @scrolltolower="loadMore">
      <view
        v-for="message in messages"
        :key="message.id"
        class="message-item"
        :class="{ 'message-item--unread': !message.isRead }"
        @click="handleMessageClick(message)"
      >
        <view class="message-icon" :style="{ backgroundColor: getTypeBgColor(message.type) }">
          <Icon :name="getTypeIcon(message.type)" size="medium" :color="getTypeColor(message.type)" />
        </view>
        <view class="message-content">
          <view class="message-header">
            <view class="message-title">
              <text class="message-title-text">{{ message.title }}</text>
              <view v-if="!message.isRead" class="unread-dot"></view>
            </view>
            <text class="message-time">{{ formatTime(message.createTime) }}</text>
          </view>
          <text class="message-desc">{{ message.content }}</text>
        </view>
      </view>

      <view v-if="loading" class="loading-more">
        <text class="loading-text">加载中...</text>
      </view>

      <view v-if="noMore && messages.length" class="no-more">
        <text class="no-more-text">没有更多了</text>
      </view>

      <view v-if="!messages.length && !loading" class="empty-state">
        <Icon name="mail" size="xlarge" color="#ccc" />
        <text class="empty-text">暂无消息</text>
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view v-if="messages.length" class="message-footer">
      <view class="footer-actions">
        <view class="action-btn" @click="handleMarkAllRead">
          <Icon name="check" size="small" color="#8B5CF6" />
          <text class="action-text">全部已读</text>
        </view>
        <view class="action-btn" @click="handleClearAll">
          <Icon name="delete" size="small" color="#EF4444" />
          <text class="action-text">清空消息</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed } from 'vue'
import Icon from '../common/Icon.vue'

export default {
  name: 'MessageCenter',
  components: { Icon },
  setup() {
    const currentTab = ref('all')
    const tabs = ref([
      { label: '全部', value: 'all', count: 0 },
      { label: '系统通知', value: 'system', count: 0 },
      { label: '订单消息', value: 'order', count: 0 },
      { label: '活动推送', value: 'activity', count: 0 }
    ])

    const messages = ref([])
    const page = ref(1)
    const loading = ref(false)
    const noMore = ref(false)

    const changeTab = (tab) => {
      currentTab.value = tab
      messages.value = []
      page.value = 1
      noMore.value = false
      loadMessages()
    }

    const loadMessages = () => {
      if (loading.value || noMore.value) return
      loading.value = true

      setTimeout(() => {
        const types = currentTab.value === 'all' ? ['system', 'order', 'activity'] : [currentTab.value]
        const mockData = []

        for (let i = 0; i < 10; i++) {
          const type = types[Math.floor(Math.random() * types.length)]
          const isRead = Math.random() > 0.3

          mockData.push({
            id: Date.now() + i,
            type,
            title: getTitleByType(type),
            content: getContentByType(type),
            isRead,
            createTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
          })
        }

        messages.value.push(...mockData)
        updateTabCounts()

        if (page.value >= 3) noMore.value = true
        loading.value = false
      }, 500)
    }

    const getTitleByType = (type) => {
      const titles = {
        system: ['系统维护通知', '账户安全提醒', '实名认证通知', '版本更新提示'],
        order: ['订单支付成功', '订单已完成', '订单取消通知', '订单退款通知'],
        activity: ['会员日活动开启', '限时优惠来袭', '新人专享福利', '积分翻倍活动']
      }
      return titles[type][Math.floor(Math.random() * titles[type].length)]
    }

    const getContentByType = (type) => {
      const contents = {
        system: '系统将于今晚23:00-24:00进行维护升级，届时部分功能暂时无法使用，请您提前做好安排。',
        order: '您的订单已支付成功，我们会尽快为您处理，请耐心等待。',
        activity: '限时优惠活动正在进行中，全场商品低至5折，快来抢购吧！'
      }
      return contents[type]
    }

    const getTypeIcon = (type) => {
      const icons = {
        system: 'bell',
        order: 'shopping-bag',
        activity: 'gift'
      }
      return icons[type] || 'mail'
    }

    const getTypeColor = (type) => {
      const colors = {
        system: '#8B5CF6',
        order: '#3B82F6',
        activity: '#EF4444'
      }
      return colors[type] || '#666'
    }

    const getTypeBgColor = (type) => {
      const colors = {
        system: 'rgba(139, 92, 246, 0.1)',
        order: 'rgba(59, 130, 246, 0.1)',
        activity: 'rgba(239, 68, 68, 0.1)'
      }
      return colors[type] || 'rgba(102, 102, 102, 0.1)'
    }

    const updateTabCounts = () => {
      const unreadMessages = messages.value.filter(m => !m.isRead)
      tabs.value[0].count = unreadMessages.length
      tabs.value[1].count = unreadMessages.filter(m => m.type === 'system').length
      tabs.value[2].count = unreadMessages.filter(m => m.type === 'order').length
      tabs.value[3].count = unreadMessages.filter(m => m.type === 'activity').length
    }

    const loadMore = () => {
      if (!loading.value && !noMore.value) {
        page.value++
        loadMessages()
      }
    }

    const formatTime = (time) => {
      const date = new Date(time)
      const now = new Date()
      const diff = now - date
      const minutes = Math.floor(diff / (60 * 1000))
      const hours = Math.floor(diff / (60 * 60 * 1000))
      const days = Math.floor(diff / (24 * 60 * 60 * 1000))

      if (minutes < 1) return '刚刚'
      if (minutes < 60) return `${minutes}分钟前`
      if (hours < 24) return `${hours}小时前`
      if (days === 0) return '今天'
      if (days === 1) return '昨天'
      if (days < 7) return `${days}天前`
      return date.toLocaleDateString('zh-CN')
    }

    const handleMessageClick = (message) => {
      if (!message.isRead) {
        message.isRead = true
        updateTabCounts()
      }
      uni.showModal({
        title: message.title,
        content: message.content,
        showCancel: false
      })
    }

    const handleMarkAllRead = () => {
      messages.value.forEach(m => { m.isRead = true })
      updateTabCounts()
      uni.showToast({ title: '已全部标记为已读', icon: 'success' })
    }

    const handleClearAll = () => {
      uni.showModal({
        title: '清空消息',
        content: '确定要清空所有消息吗？',
        success: (res) => {
          if (res.confirm) {
            messages.value = []
            updateTabCounts()
            uni.showToast({ title: '已清空', icon: 'success' })
          }
        }
      })
    }

    loadMessages()

    return {
      currentTab,
      tabs,
      messages,
      loading,
      noMore,
      changeTab,
      loadMore,
      formatTime,
      handleMessageClick,
      handleMarkAllRead,
      handleClearAll,
      getTypeIcon,
      getTypeColor,
      getTypeBgColor
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.message-center {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.message-tabs {
  @include flex();
  gap: 16rpx;
  margin-bottom: $spacing-base;
  flex-wrap: wrap;

  .tab-item {
    position: relative;
    flex: 1;
    min-width: 140rpx;
    height: 60rpx;
    background: $background-primary;
    border-radius: 14rpx;
    @include flex-center();
    transition: all $transition-base;
    overflow: visible;

    &--active {
      background: $gradient-primary;

      .tab-text {
        color: #fff !important;
      }
    }

    .tab-text {
      font-size: $font-size-sm;
      color: $text-secondary;
      font-weight: $font-weight-medium;
    }

    .tab-dots {
      position: absolute;
      top: 10rpx;
      right: 10rpx;
      width: 12rpx;
      height: 12rpx;
      background: #EF4444;
      border-radius: 6rpx;
    }
  }
}

.message-list {
  flex: 1;
  margin-bottom: $spacing-base;

  .message-item {
    position: relative;
    background: $background-primary;
    border-radius: 20rpx;
    padding: $spacing-base;
    margin-bottom: 16rpx;
    @include flex();
    gap: $spacing-base;
    transition: transform $transition-base;

    &--unread {
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 6rpx;
        background: $gradient-primary;
        border-radius: 20rpx 0 0 20rpx;
      }
    }

    &:active {
      transform: scale(0.98);
    }

    .message-icon {
      width: 72rpx;
      height: 72rpx;
      border-radius: 20rpx;
      @include flex-center();
      flex-shrink: 0;
    }

    .message-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8rpx;
      min-width: 0;

      .message-header {
        @include flex-between();
        align-items: center;

        .message-title {
          position: relative;

          .message-title-text {
            font-size: $font-size-sm;
            font-weight: $font-weight-semibold;
            color: $text-primary;
            @include ellipsis(); 
          }

          .unread-dot {
            position: absolute;
            top: 4rpx;
            right: -$spacing-sm;
            width: 12rpx;
            height: 12rpx;
            background: #EF4444;
            border-radius: 50%;
          }
        }

        .message-time {
          font-size: $font-size-xs;
          color: $text-tertiary;
          flex-shrink: 0;
          margin-left: $spacing-xs;
        }
      }

      .message-desc {
        font-size: $font-size-xs;
        color: $text-secondary;
        line-height: 1.5;
        @include line-clamp(2);
      }
    }
  }

  .loading-more,
  .no-more {
    @include flex-center();
    padding: $spacing-base;

    .loading-text,
    .no-more-text {
      font-size: $font-size-xs;
      color: $text-tertiary;
    }
  }

  .empty-state {
    @include flex-center();
    flex-direction: column;
    gap: $spacing-base;
    padding: $spacing-xl * 2 0;

    .empty-text {
      font-size: $font-size-sm;
      color: $text-tertiary;
    }
  }
}

.message-footer {
  .footer-actions {
    @include flex();
    gap: $spacing-base;
    background: $background-primary;
    border-radius: 20rpx;
    padding: $spacing-base;

    .action-btn {
      flex: 1;
      height: 80rpx;
      @include flex-center();
      gap: 8rpx;
      background: $background-secondary;
      border-radius: 20rpx;
      transition: all $transition-base;

      &:active {
        transform: scale(0.95);
      }

      .action-text {
        font-size: $font-size-sm;
        color: $text-primary;
        font-weight: $font-weight-semibold;
      }
    }
  }
}
</style>
