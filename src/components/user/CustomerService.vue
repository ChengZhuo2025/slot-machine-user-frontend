<template>
  <view class="customer-service">
    <!-- 服务时间 -->
    <view class="service-time">
      <Icon name="service" size="xlarge" color="#6366F1" />
      <view class="time-info">
        <text class="time-title">客服服务时间</text>
        <text class="time-text">7x24小时全天候服务</text>
      </view>
    </view>

    <!-- 联系方式 -->
    <view class="contact-methods">
      <view class="section-header">
        <text class="section-title">联系方式</text>
      </view>

      <view class="method-card" @click="handleCallPhone">
        <view class="method-icon method-icon--phone">
          <Icon name="phone" size="medium" color="#3B82F6" />
        </view>
        <view class="method-info">
          <text class="method-title">客服热线</text>
          <text class="method-value">400-888-9999</text>
          <text class="method-desc">工作日 9:00-22:00</text>
        </view>
        <Icon name="chevron-right" size="small" color="#999" />
      </view>

      <view class="method-card" @click="handleOpenChat">
        <view class="method-icon method-icon--chat">
          <Icon name="headphones" size="medium" color="#be32d7" />
        </view>
        <view class="method-info">
          <text class="method-title">在线客服</text>
          <text class="method-value">即时响应</text>
          <text class="method-desc">7x24小时在线服务</text>
        </view>
        <view class="online-status">
          <view class="status-dot"></view>
          <text class="status-text">在线</text>
        </view>
      </view>

      <view class="method-card" @click="handleCopyWechat">
        <view class="method-icon method-icon--wechat">
          <Icon name="brand-wechat" size="medium" color="#07C160" />
        </view>
        <view class="method-info">
          <text class="method-title">客服微信</text>
          <text class="method-value">lovedumeinv_service</text>
          <text class="method-desc">添加微信获取专属服务</text>
        </view>
        <Icon name="copy" size="small" color="#999" />
      </view>

      <view class="method-card" @click="handleCopyEmail">
        <view class="method-icon method-icon--email">
          <Icon name="mail" size="medium" color="#F59E0B" />
        </view>
        <view class="method-info">
          <text class="method-title">客服邮箱</text>
          <text class="method-value">service@lovedumeinv.com</text>
          <text class="method-desc">1-3个工作日回复</text>
        </view>
        <Icon name="copy" size="small" color="#999" />
      </view>
    </view>

    <!-- 常见问题 -->
    <view class="quick-questions">
      <view class="section-header">
        <text class="section-title">常见问题</text>
      </view>
      <view class="question-list">
        <view
          v-for="question in quickQuestions"
          :key="question.id"
          class="question-item"
          @click="handleQuestionClick(question)"
        >
          <Icon name="help" size="small" color="#be32d7" />
          <text class="question-text">{{ question.title }}</text>
          <Icon name="chevron-right" size="small" color="#999" />
        </view>
      </view>
    </view>

    <!-- 公司地址 -->
    <view class="company-address">
      <view class="section-header">
        <text class="section-title">公司地址</text>
      </view>
      <view class="address-card">
        <view class="address-info">
          <Icon name="location" size="small" color="#666" />
          <text class="address-text">浙江省杭州市西湖区文三路259号</text>
          <button class="btn-navigate" @click="handleNavigate">
            <Icon name="send" size="small" color="#be32d7" />
            <text>导航</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref } from 'vue'
import Icon from '../common/Icon.vue'

export default {
  name: 'CustomerService',
  components: { Icon },
  setup() {
    const quickQuestions = ref([
      { id: 1, title: '如何预订酒店?', answer: '在首页选择酒店...' },
      { id: 2, title: '如何取消订单?', answer: '进入订单详情...' },
      { id: 3, title: '退款多久到账?', answer: '一般3-7个工作日...' },
      { id: 4, title: '如何联系酒店?', answer: '订单详情中有酒店电话...' }
    ])

    const handleCallPhone = () => {
      uni.showModal({
        title: '拨打电话',
        content: '400-888-9999',
        confirmText: '拨打',
        success: (res) => {
          if (res.confirm) {
            uni.makePhoneCall({
              phoneNumber: '4008889999'
            })
          }
        }
      })
    }

    const handleOpenChat = () => {
      uni.showToast({ title: '打开在线客服', icon: 'none' })
    }

    const handleCopyWechat = () => {
      uni.setClipboardData({
        data: 'lovedumeinv_service',
        success: () => {
          uni.showToast({ title: '微信号已复制', icon: 'success' })
        }
      })
    }

    const handleCopyEmail = () => {
      uni.setClipboardData({
        data: 'service@lovedumeinv.com',
        success: () => {
          uni.showToast({ title: '邮箱已复制', icon: 'success' })
        }
      })
    }

    const handleQuestionClick = (question) => {
      uni.showModal({
        title: question.title,
        content: question.answer || '详细解答内容...',
        showCancel: false
      })
    }

    const handleNavigate = () => {
      uni.showToast({ title: '打开地图导航', icon: 'none' })
    }

    return {
      quickQuestions,
      handleCallPhone,
      handleOpenChat,
      handleCopyWechat,
      handleCopyEmail,
      handleQuestionClick,
      handleNavigate
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.customer-service {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.service-time {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%);
  border: 2rpx solid rgba(139, 92, 246, 0.2);
  border-radius: 24rpx;
  padding: $spacing-lg;
  @include flex();
  align-items: center;
  gap: $spacing-base;
  margin-bottom: $spacing-base;

  .time-info {
    display: flex;
    flex-direction: column;

    .time-title {
      font-size: $font-size-sm;
      color: $text-secondary;
      font-weight: $font-weight-medium;
    }

    .time-text {
      font-size: $font-size-base;
      color: $text-primary;
      font-weight: $font-weight-semibold;
    }
  }
}

.section-header {
  @include flex();
  align-items: center;
  gap: $spacing-xs;
  padding-left: $spacing-xs;
  margin-bottom: $spacing-sm;

  .section-title {
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    color: $text-primary;
  }
}

.contact-methods {
  margin-bottom: $spacing-base;

  .method-card {
    @include flex();
    align-items: center;
    gap: $spacing-base;
    padding: $spacing-base;
    background: $background-primary;
    border-radius: 20rpx;
    margin-bottom: $spacing-sm;
    transition: transform $transition-base;

    &:active {
      transform: scale(0.98);
    }

    .method-icon {
      width: 88rpx;
      height: 88rpx;
      border-radius: 20rpx;
      @include flex-center();
      flex-shrink: 0;

      &--phone {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
      }

      &--chat {
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%);
      }

      &--wechat {
        background: linear-gradient(135deg, rgba(7, 193, 96, 0.1) 0%, rgba(7, 193, 96, 0.05) 100%);
      }

      &--email {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%);
      }
    }

    .method-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4rpx;
      min-width: 0;

      .method-title {
        font-size: $font-size-sm;
        color: $text-primary;
        font-weight: $font-weight-semibold;
      }

      .method-value {
        font-size: $font-size-sm;
        color: $text-primary;
        font-weight: $font-weight-medium;
      }

      .method-desc {
        font-size: $font-size-xs;
        color: $text-tertiary;
      }
    }

    .online-status {
      @include flex();
      align-items: center;
      gap: 6rpx;
      padding: 6rpx $spacing-xs;
      background: rgba(16, 196, 103, 0.1);
      border-radius: 12rpx;

      .status-dot {
        width: 12rpx;
        height: 12rpx;
        background: #10c467;
        border-radius: 50%;
        animation: pulse 2s ease-in-out infinite;
      }

      .status-text {
        font-size: $font-size-xs;
        color: #10c467;
        font-weight: $font-weight-medium;
      }
    }
  }
}

.quick-questions {
  margin-bottom: $spacing-base;

  .question-list {
    @include flex();
    flex-direction: column;
    gap: $spacing-sm;
    
    .question-item {
      @include flex();
      align-items: center;
      gap: $spacing-xs;
      padding: $spacing-base;
      background: $background-primary;
      border-radius: 16rpx;
      transition: all $transition-base;

      &:active {
        background: $background-secondary;
      }

      .question-text {
        flex: 1;
        font-size: $font-size-sm;
        color: $text-primary;
        @include ellipsis();
      }
    }
  }
}

.company-address {
  .address-card {
    background: $background-primary;
    border-radius: 20rpx;
    padding: $spacing-base;

    .address-info {
      @include flex-between();
      align-items: center;
      gap: $spacing-xs;

      .address-text {
        flex: 1;
        font-size: $font-size-sm;
        color: $text-primary;
        line-height: 1.5;
      }

      .btn-navigate {
        @include flex();
        align-items: center;
        gap: 4rpx;
        padding: 12rpx $spacing-sm;
        background: rgba(139, 92, 246, 0.1);
        border-radius: 16rpx;
        font-size: $font-size-xs;
        color: $primary-dark;
        font-weight: $font-weight-medium;
        line-height: 1;
        border: none;
        flex-shrink: 0;

        &:active {
          opacity: 0.6;
        }

        &::after {
          border: none;
        }
      }
    }
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}
</style>
