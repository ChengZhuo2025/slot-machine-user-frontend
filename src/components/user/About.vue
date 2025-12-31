<template>
  <view class="about">
    <!-- App Logo -->
    <view class="app-header">
      <image
        class="app-logo"
        src="/static/images/logo.jpg"
        mode="aspectFill"
      />
      <text class="app-name">爱上杜美人</text>
      <text class="app-slogan">创新主题酒店服务平台</text>
    </view>

    <!-- 版本信息 -->
    <view class="version-info">
      <view class="info-item">
        <text class="info-label">当前版本</text>
        <text class="info-value">{{ appInfo.version }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">发布日期</text>
        <text class="info-value">{{ appInfo.releaseDate }}</text>
      </view>
    </view>

    <!-- 公司简介 -->
    <view class="company-intro">
      <view class="section-header">
        <text class="section-title">公司简介</text>
      </view>
      <view class="intro-card">
        <text class="intro-text">{{ appInfo.description }}</text>
      </view>
    </view>

    <!-- 核心特色 -->
    <view class="features-section">
      <view class="section-header">
        <text class="section-title">核心特色</text>
      </view>
      <view class="features-grid">
        <view
          v-for="feature in features"
          :key="feature.id"
          class="feature-item"
        >
          <view class="feature-icon" :style="{ background: feature.bgColor }">
            <Icon :name="feature.icon" size="medium" :color="feature.iconColor" />
          </view>
          <text class="feature-title">{{ feature.title }}</text>
          <text class="feature-desc">{{ feature.desc }}</text>
        </view>
      </view>
    </view>

    <!-- 官方账号 -->
    <view class="official-accounts">
      <view class="section-header">
        <text class="section-title">关注我们</text>
      </view>
      <view class="accounts-grid">
        <view class="account-item" @click="handleFollowWechat">
          <view class="account-icon" style="background: rgba(7, 193, 96, 0.1);">
            <Icon name="wechat" size="medium" color="#07C160" />
          </view>
          <text class="account-name">微信公众号</text>
        </view>
        <view class="account-item" @click="handleFollowWeibo">
          <view class="account-icon" style="background: rgba(230, 22, 45, 0.1);">
            <Icon name="brand-weibo" size="medium" color="#E6162D" />
          </view>
          <text class="account-name">官方微博</text>
        </view>
        <view class="account-item" @click="handleFollowDouyin">
          <view class="account-icon" style="background: rgba(0, 0, 0, 0.1);">
            <Icon name="brand-tiktok" size="medium" color="#000" />
          </view>
          <text class="account-name">抖音号</text>
        </view>
      </view>
    </view>

    <!-- 相关链接 -->
    <view class="related-links">
      <view class="section-header">
        <text class="section-title">相关条款</text>
      </view>
      <view class="links-card">
        <view class="link-item" @click="handleUserAgreement">
          <Icon name="file" size="small" color="#8B5CF6" />
          <text class="link-text">用户协议</text>
          <Icon name="chevron-right" size="small" color="#999" />
        </view>
        <view class="link-item" @click="handlePrivacyPolicy">
          <Icon name="info" size="small" color="#3B82F6" />
          <text class="link-text">隐私政策</text>
          <Icon name="chevron-right" size="small" color="#999" />
        </view>
        <view class="link-item" @click="handleFeedback">
          <Icon name="edit" size="small" color="#10c467" />
          <text class="link-text">意见反馈</text>
          <Icon name="chevron-right" size="small" color="#999" />
        </view>
      </view>
    </view>

    <!-- 版权信息 -->
    <view class="copyright">
      <text class="copyright-text">{{ appInfo.companyName }}</text>
      <text class="copyright-text">{{ appInfo.copyright }}</text>
      <text class="copyright-text">{{ appInfo.icp }}</text>
    </view>
  </view>
</template>

<script>
import { reactive, ref } from 'vue'
import Icon from '../common/Icon.vue'

export default {
  name: 'About',
  components: { Icon },
  setup() {
    const appInfo = reactive({
      companyName: '爱上杜美人科技有限公司',
      version: '1.0.21',
      releaseDate: '2025-09-27',
      description: '爱上杜美人是一个创新型主题酒店服务平台,通过智能硬件技术与传统酒店业相结合,为用户提供个性化的主题房间体验服务。我们致力于打造最优质的住宿体验,让每一次入住都成为美好的回忆。',
      icp: '浙ICP备2024001234号-1',
      copyright: '© 2024 爱上杜美人科技有限公司 版权所有'
    })

    // 核心特色
    const features = ref([
      {
        id: 1,
        icon: 'zap',
        title: '智能控制',
        desc: '一键智能控制房间设备',
        iconColor: '#8B5CF6',
        bgColor: 'rgba(139, 92, 246, 0.1)'
      },
      {
        id: 2,
        icon: 'heart',
        title: '主题房间',
        desc: '多样化主题满足需求',
        iconColor: '#EC4899',
        bgColor: 'rgba(236, 72, 153, 0.1)'
      },
      {
        id: 3,
        icon: 'shield-check',
        title: '安全保障',
        desc: '全方位隐私安全保护',
        iconColor: '#3B82F6',
        bgColor: 'rgba(59, 130, 246, 0.1)'
      },
      {
        id: 4,
        icon: 'headphones',
        title: '贴心服务',
        desc: '7x24小时客服支持',
        iconColor: '#10B981',
        bgColor: 'rgba(16, 185, 129, 0.1)'
      }
    ])

    const handleFollowWechat = () => {
      uni.showModal({
        title: '关注微信公众号',
        content: '请搜索"爱上杜美人"或扫描二维码关注我们的微信公众号',
        confirmText: '好的',
        showCancel: false
      })
    }

    const handleFollowWeibo = () => {
      uni.showModal({
        title: '关注官方微博',
        content: '请搜索"@爱上杜美人官方"关注我们的新浪微博',
        confirmText: '好的',
        showCancel: false
      })
    }

    const handleFollowDouyin = () => {
      uni.showModal({
        title: '关注抖音号',
        content: '请在抖音搜索"爱上杜美人"关注我们',
        confirmText: '好的',
        showCancel: false
      })
    }

    const handleUserAgreement = () => {
      // 跳转到用户协议页面
      uni.navigateTo({
        url: '/pages/webview/index?url=https://www.lovedumeinv.com/agreement'
      })
    }

    const handlePrivacyPolicy = () => {
      // 跳转到隐私政策页面
      uni.navigateTo({
        url: '/pages/webview/index?url=https://www.lovedumeinv.com/privacy'
      })
    }

    const handleFeedback = () => {
      // 跳转到意见反馈页面
      uni.navigateTo({
        url: '/pages/feedback/index'
      })
    }

    return {
      appInfo,
      features,
      handleFollowWechat,
      handleFollowWeibo,
      handleFollowDouyin,
      handleUserAgreement,
      handlePrivacyPolicy,
      handleFeedback
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.about {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.app-header {
  @include flex-center();
  flex-direction: column;
  gap: $spacing-sm;
  padding: $spacing-lg 0;
  margin-bottom: $spacing-base;

  .app-logo {
    width: 140rpx;
    height: 140rpx;
    border-radius: 28rpx;
    box-shadow: 0 16rpx 48rpx rgba(139, 92, 246, 0.25);
    border: 4rpx solid rgba(255, 255, 255, 0.9);
  }

  .app-name {
    font-size: 44rpx;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin-top: $spacing-xs;
  }

  .app-slogan {
    font-size: $font-size-sm;
    color: $text-tertiary;
  }
}

.version-info {
  background: $background-primary;
  border-radius: 20rpx;
  padding: $spacing-sm $spacing-base;
  margin-bottom: $spacing-lg;

  .info-item {
    @include flex-between();
    padding: $spacing-sm 0;

    &:not(:last-child) {
      border-bottom: 1rpx solid $border-light;
    }

    .info-label {
      font-size: $font-size-sm;
      color: $text-secondary;
    }

    .info-value {
      font-size: $font-size-sm;
      color: $text-primary;
      font-weight: $font-weight-medium;
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

.company-intro {
  margin-bottom: $spacing-lg;

  .intro-card {
    background: $background-primary;
    border-radius: 20rpx;
    padding: $spacing-base;

    .intro-text {
      font-size: $font-size-sm;
      color: $text-secondary;
      line-height: 1.8;
    }
  }
}

.features-section {
  margin-bottom: $spacing-lg;

  .features-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-sm;

    .feature-item {
      @include flex-center();
      flex-direction: column;
      gap: $spacing-xs;
      padding: $spacing-base;
      background: $background-primary;
      border-radius: 20rpx;
      transition: transform $transition-base;

      &:active {
        transform: scale(0.95);
      }

      .feature-icon {
        width: 88rpx;
        height: 88rpx;
        border-radius: 20rpx;
        @include flex-center();
        margin-bottom: $spacing-xs;
      }

      .feature-title {
        font-size: $font-size-sm;
        color: $text-primary;
        font-weight: $font-weight-semibold;
        text-align: center;
      }

      .feature-desc {
        font-size: $font-size-xs;
        color: $text-tertiary;
        text-align: center;
        line-height: 1.4;
      }
    }
  }
}

.official-accounts {
  margin-bottom: $spacing-lg;

  .accounts-grid {
    @include flex();
    gap: $spacing-sm;

    .account-item {
      flex: 1;
      @include flex-center();
      flex-direction: column;
      gap: $spacing-xs;
      padding: $spacing-base;
      background: $background-primary;
      border-radius: 20rpx;
      transition: transform $transition-base;

      &:active {
        transform: scale(0.95);
      }

      .account-icon {
        width: 80rpx;
        height: 80rpx;
        border-radius: 20rpx;
        @include flex-center();
      }

      .account-name {
        font-size: $font-size-xs;
        color: $text-primary;
        text-align: center;
      }
    }
  }
}

.related-links {
  margin-bottom: $spacing-lg;

  .links-card {
    background: $background-primary;
    border-radius: 20rpx;
    overflow: hidden;

    .link-item {
      @include flex();
      align-items: center;
      gap: $spacing-sm;
      padding: $spacing-base;
      transition: background $transition-base;

      &:not(:last-child) {
        border-bottom: 1rpx solid $border-light;
      }

      &:active {
        background: $background-secondary;
      }

      .link-text {
        flex: 1;
        font-size: $font-size-sm;
        color: $text-primary;
      }
    }
  }
}

.copyright {
  @include flex-center();
  flex-direction: column;
  gap: 8rpx;
  padding: $spacing-sm 0 $spacing-lg;
  margin-top: auto;

  .copyright-text {
    font-size: 22rpx;
    color: $text-tertiary;
    text-align: center;
    line-height: 1.5;
  }
}
</style>
