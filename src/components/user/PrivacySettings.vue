<template>
  <view class="privacy-settings">
    <!-- 个人信息展示 -->
    <view class="privacy-section">
      <view class="section-header">
        <Icon name="user" size="small" color="#8B5CF6" />
        <text class="section-title">个人信息展示</text>
      </view>
      <view class="privacy-card">
        <view class="privacy-item">
          <view class="item-info">
            <text class="item-title">公开手机号</text>
            <text class="item-desc">其他用户可以看到您的手机号</text>
          </view>
          <Switch :checked="settings.showPhone" @change="e => updateSetting('showPhone', e)" />
        </view>
        <view class="privacy-item">
          <view class="item-info">
            <text class="item-title">公开邮箱</text>
            <text class="item-desc">其他用户可以看到您的邮箱</text>
          </view>
          <Switch :checked="settings.showEmail" @change="e => updateSetting('showEmail', e)" />
        </view>
      </view>
    </view>

    <!-- 搜索与推荐 -->
    <view class="privacy-section">
      <view class="section-header">
        <Icon name="search" size="small" color="#3B82F6" />
        <text class="section-title">搜索与推荐</text>
      </view>
      <view class="privacy-card">
        <view class="privacy-item">
          <view class="item-info">
            <text class="item-title">允许被搜索</text>
            <text class="item-desc">其他用户可以通过手机号搜索到您</text>
          </view>
          <Switch :checked="settings.allowSearch" @change="e => updateSetting('allowSearch', e)" />
        </view>
        <view class="privacy-item">
          <view class="item-info">
            <text class="item-title">允许推荐</text>
            <text class="item-desc">向可能认识的人推荐您</text>
          </view>
          <Switch :checked="settings.allowRecommend" @change="e => updateSetting('allowRecommend', e)" />
        </view>
      </view>
    </view>

    <!-- 数据收集 -->
    <view class="privacy-section">
      <view class="section-header">
        <Icon name="points" size="small" color="#10c467" />
        <text class="section-title">数据收集</text>
      </view>
      <view class="privacy-card">
        <view class="privacy-item">
          <view class="item-info">
            <text class="item-title">收集使用数据</text>
            <text class="item-desc">帮助改进产品和服务体验</text>
          </view>
          <Switch :checked="settings.collectUsageData" @change="e => updateSetting('collectUsageData', e)" />
        </view>
        <view class="privacy-item">
          <view class="item-info">
            <text class="item-title">个性化广告</text>
            <text class="item-desc">根据您的喜好推荐相关内容</text>
          </view>
          <Switch :checked="settings.personalizedAds" @change="e => updateSetting('personalizedAds', e)" />
        </view>
      </view>
    </view>

    <!-- 账户管理 -->
    <view class="privacy-section">
      <view class="section-header">
        <Icon name="settings" size="small" color="#EF4444" />
        <text class="section-title">账户管理</text>
      </view>
      <view class="privacy-card">
        <view class="privacy-item" @click="handleDataExport">
          <view class="item-left">
            <Icon name="download" size="medium" color="#3B82F6" />
            <view class="item-info">
              <text class="item-title">导出数据</text>
              <text class="item-desc">下载您的个人数据副本</text>
            </view>
          </view>
          <Icon name="chevron-right" size="small" color="#999" />
        </view>
        <view class="privacy-item" @click="handleDataClear">
          <view class="item-left">
            <Icon name="delete" size="medium" color="#F59E0B" />
            <view class="item-info">
              <text class="item-title">清除缓存</text>
              <text class="item-desc">清除本地缓存数据</text>
            </view>
          </view>
          <Icon name="chevron-right" size="small" color="#999" />
        </view>
        <view class="privacy-item" @click="handleAccountDelete">
          <view class="item-left">
            <Icon name="userMinus" size="medium" color="#EF4444" />
            <view class="item-info">
              <text class="item-title">注销账户</text>
              <text class="item-desc">永久删除您的账户和数据</text>
            </view>
          </view>
          <Icon name="chevron-right" size="small" color="#999" />
        </view>
      </view>
    </view>

    <!-- 隐私政策 -->
    <view class="privacy-policy">
      <view class="policy-item" @click="handlePrivacyPolicy">
        <Icon name="file" size="small" color="#8B5CF6" />
        <text class="policy-text">隐私政策</text>
      </view>
      <view class="policy-item" @click="handleUserAgreement">
        <Icon name="file" size="small" color="#3B82F6" />
        <text class="policy-text">用户协议</text>
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="save-button">
      <button class="btn-save" @click="handleSave">
        <text>保存设置</text>
      </button>
    </view>
  </view>
</template>

<script>
import { reactive } from 'vue'
import Icon from '../common/Icon.vue'
import Switch from '../common/Switch.vue'

export default {
  name: 'PrivacySettings',
  components: {
    Icon,
    Switch
  },
  setup() {
    const settings = reactive({
      showPhone: false,
      showEmail: false,
      allowSearch: true,
      allowRecommend: true,
      collectUsageData: true,
      personalizedAds: false
    })

    const updateSetting = (key, e) => {
      settings[key] = e.detail.value
    }

    const handleDataExport = () => {
      uni.showModal({
        title: '导出数据',
        content: '我们将在24小时内生成您的数据副本并通过邮件发送给您',
        confirmText: '确认导出',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({ title: '导出请求已提交', icon: 'success' })
          }
        }
      })
    }

    const handleDataClear = () => {
      uni.showModal({
        title: '清除缓存',
        content: '清除缓存不会删除您的账户数据,确定继续吗?',
        success: (res) => {
          if (res.confirm) {
            uni.showLoading({ title: '清除中...' })
            setTimeout(() => {
              uni.hideLoading()
              uni.showToast({ title: '缓存已清除', icon: 'success' })
            }, 1000)
          }
        }
      })
    }

    const handleAccountDelete = () => {
      uni.showModal({
        title: '注销账户',
        content: '注销后将无法恢复账户和数据,确定要注销吗?',
        confirmText: '确认注销',
        confirmColor: '#EF4444',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({ title: '注销申请已提交', icon: 'none' })
          }
        }
      })
    }

    const handlePrivacyPolicy = () => {
      uni.showToast({ title: '查看隐私政策', icon: 'none' })
    }

    const handleUserAgreement = () => {
      uni.showToast({ title: '查看用户协议', icon: 'none' })
    }

    const handleSave = () => {
      uni.showToast({ title: '设置已保存', icon: 'success' })
    }

    return {
      settings,
      updateSetting,
      handleDataExport,
      handleDataClear,
      handleAccountDelete,
      handlePrivacyPolicy,
      handleUserAgreement,
      handleSave
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.privacy-settings {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.privacy-section {
  margin-bottom: $spacing-base;

  .section-header {
    @include flex();
    align-items: center;
    gap: $spacing-xs;
    padding-left: $spacing-xs;
    margin-bottom: $spacing-sm;

    .section-title {
      font-size: $font-size-sm;
      font-weight: $font-weight-medium;
      color: $text-secondary;
    }
  }

  .privacy-card {
    background: $background-primary;
    border-radius: 20rpx;
    overflow: hidden;

    .privacy-item {
      @include flex-between();
      padding: $spacing-base;
      gap: $spacing-base;
      transition: background $transition-base;

      &:not(:last-child) {
        border-bottom: 1rpx solid $border-light;
      }

      &:active {
        background: $background-secondary;
      }

      .item-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 6rpx;
        min-width: 0;

        .item-title {
          font-size: $font-size-sm;
          color: $text-primary;
          font-weight: $font-weight-semibold;
        }

        .item-desc {
          font-size: $font-size-xs;
          color: $text-secondary;
          line-height: 1.4;
        }
      }

      .item-left {
        flex: 1;
        @include flex();
        align-items: center;
        gap: $spacing-base;
        min-width: 0;
      }
    }
  }
}

.privacy-policy {
  @include flex();
  justify-content: center;
  gap: $spacing-lg;

  .policy-item {
    @include flex();
    align-items: center;
    gap: 6rpx;
    padding: $spacing-xs $spacing-sm;
    transition: opacity $transition-base;

    &:active {
      opacity: 0.6;
    }

    .policy-text {
      font-size: $font-size-xs;
      color: $text-secondary;
    }
  }
}

.save-button {
  margin-top: auto;
  padding: $spacing-base 0 $spacing-xl;

  .btn-save {
    width: 100%;
    height: 80rpx;
    background: $gradient-primary;
    border-radius: 20rpx;
    @include flex-center();
    font-size: $font-size-sm;
    color: #fff;
    font-weight: $font-weight-semibold;
    border: none;

    &:active {
      opacity: 0.8;
    }

    &::after {
      border: none;
    }
  }
}
</style>
