<template>
  <view class="notification-settings">
    <!-- 通知总开关 -->
    <view class="settings-section">
      <view class="section-header">
        <Icon name="bell" size="small" color="#8B5CF6" />
        <text class="section-title">通知总开关</text>
      </view>
      <view class="settings-card">
        <view class="setting-item">
          <view class="item-info">
            <text class="item-title">接收通知</text>
            <text class="item-desc">关闭后将不再接收任何推送通知</text>
          </view>
          <Switch :checked="settings.enableNotification" @change="onNotificationChange" color="#8B5CF6" />
        </view>
      </view>
    </view>

    <!-- 消息通知设置 -->
    <view class="settings-section">
      <view class="section-header">
        <Icon name="message" size="small" color="#3B82F6" />
        <text class="section-title">消息通知</text>
      </view>
      <view class="settings-card">
        <view class="setting-item">
          <view class="item-info">
            <text class="item-title">系统通知</text>
            <text class="item-desc">系统维护、版本更新等通知</text>
          </view>
          <Switch :checked="settings.systemNotification" @change="e => updateSetting('systemNotification', e)" :disabled="!settings.enableNotification" color="#8B5CF6" />
        </view>
        <view class="setting-item">
          <view class="item-info">
            <text class="item-title">订单消息</text>
            <text class="item-desc">订单状态变更、物流信息等</text>
          </view>
          <Switch :checked="settings.orderNotification" @change="e => updateSetting('orderNotification', e)" :disabled="!settings.enableNotification" color="#8B5CF6" />
        </view>
        <view class="setting-item">
          <view class="item-info">
            <text class="item-title">活动推送</text>
            <text class="item-desc">优惠活动、会员福利等推送</text>
          </view>
          <Switch :checked="settings.activityNotification" @change="e => updateSetting('activityNotification', e)" :disabled="!settings.enableNotification" color="#8B5CF6" />
        </view>
      </view>
    </view>

    <!-- 推送方式 -->
    <view class="settings-section">
      <view class="section-header">
        <Icon name="settings" size="small" color="#10c467" />
        <text class="section-title">推送方式</text>
      </view>
      <view class="settings-card">
        <view class="setting-item">
          <view class="item-info">
            <text class="item-title">应用内消息</text>
            <text class="item-desc">在APP内显示消息提醒</text>
          </view>
          <Switch :checked="settings.inAppNotification" @change="e => updateSetting('inAppNotification', e)" :disabled="!settings.enableNotification" color="#8B5CF6" />
        </view>
        <view class="setting-item">
          <view class="item-info">
            <text class="item-title">推送通知</text>
            <text class="item-desc">通过系统通知栏推送</text>
          </view>
          <Switch :checked="settings.pushNotification" @change="e => updateSetting('pushNotification', e)" :disabled="!settings.enableNotification" color="#8B5CF6" />
        </view>
        <view class="setting-item">
          <view class="item-info">
            <text class="item-title">声音提醒</text>
            <text class="item-desc">收到消息时播放提示音</text>
          </view>
          <Switch :checked="settings.soundNotification" @change="e => updateSetting('soundNotification', e)" :disabled="!settings.enableNotification" color="#8B5CF6" />
        </view>
        <view class="setting-item">
          <view class="item-info">
            <text class="item-title">震动提醒</text>
            <text class="item-desc">收到消息时震动提醒</text>
          </view>
          <Switch :checked="settings.vibrationNotification" @change="e => updateSetting('vibrationNotification', e)" :disabled="!settings.enableNotification" color="#8B5CF6" />
        </view>
      </view>
    </view>

    <!-- 免打扰设置 -->
    <view class="settings-section">
      <view class="section-header">
        <Icon name="moon" size="small" color="#EF4444" />
        <text class="section-title">免打扰时段</text>
      </view>
      <view class="settings-card">
        <view class="setting-item">
          <view class="item-info">
            <text class="item-title">开启免打扰</text>
            <text class="item-desc">在指定时段内不接收通知</text>
          </view>
          <Switch :checked="settings.enableDND" @change="onDNDChange" :disabled="!settings.enableNotification" color="#8B5CF6" />
        </view>
        <view v-if="settings.enableDND" class="setting-item setting-item--border-top">
          <view class="item-info">
            <text class="item-title">开始时间</text>
          </view>
          <picker mode="time" :value="settings.dndStartTime" @change="onStartTimeChange" :disabled="!settings.enableNotification">
            <view class="picker-value">
              <text class="value-text">{{ settings.dndStartTime }}</text>
              <Icon name="chevronRight" size="small" color="#999" />
            </view>
          </picker>
        </view>
        <view v-if="settings.enableDND" class="setting-item setting-item--border-top">
          <view class="item-info">
            <text class="item-title">结束时间</text>
          </view>
          <picker mode="time" :value="settings.dndEndTime" @change="onEndTimeChange" :disabled="!settings.enableNotification">
            <view class="picker-value">
              <text class="value-text">{{ settings.dndEndTime }}</text>
              <Icon name="chevronRight" size="small" color="#999" />
            </view>
          </picker>
        </view>
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="save-button">
      <button class="btn-save" @click="handleSave">
        <text>保存设置</text>
      </button>
    </view>

    <!-- 底部间距 -->
    <view class="bottom-spacing"></view>
  </view>
</template>

<script>
import { reactive } from 'vue'
import Icon from '../common/Icon.vue'
import Switch from '../common/Switch.vue'

export default {
  name: 'NotificationSettings',
  components: { Icon, Switch },
  setup() {
    const settings = reactive({
      enableNotification: true,
      systemNotification: true,
      orderNotification: true,
      activityNotification: true,
      inAppNotification: true,
      pushNotification: true,
      soundNotification: true,
      vibrationNotification: false,
      enableDND: false,
      dndStartTime: '22:00',
      dndEndTime: '08:00'
    })

    const onNotificationChange = (e) => {
      settings.enableNotification = e.detail.value
      if (!settings.enableNotification) {
        // 关闭总开关时，关闭所有子开关
        settings.systemNotification = false
        settings.orderNotification = false
        settings.activityNotification = false
        settings.inAppNotification = false
        settings.pushNotification = false
        settings.soundNotification = false
        settings.vibrationNotification = false
        settings.enableDND = false
      }
    }

    const onDNDChange = (e) => {
      settings.enableDND = e.detail.value
    }

    const updateSetting = (key, e) => {
      settings[key] = e.detail.value
    }

    const onStartTimeChange = (e) => {
      settings.dndStartTime = e.detail.value
    }

    const onEndTimeChange = (e) => {
      settings.dndEndTime = e.detail.value
    }

    const handleSave = () => {
      // 模拟保存设置
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      })
    }

    return {
      settings,
      onNotificationChange,
      onDNDChange,
      updateSetting,
      onStartTimeChange,
      onEndTimeChange,
      handleSave
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.notification-settings {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.settings-section {
  margin-bottom: $spacing-base;

  .section-header {
    @include flex();
    align-items: center;
    gap: $spacing-xs;
    padding-left: $spacing-xs;
    margin-bottom: $spacing-sm;

    .section-title {
      font-size: 28rpx;
      font-weight: $font-weight-medium;
      color: $text-secondary;
    }
  }

  .settings-card {
    background: $background-primary;
    border-radius: 20rpx;
    overflow: hidden;

    .setting-item {
      @include flex-between();
      align-items: center;
      padding: $spacing-base;
      gap: $spacing-base;

      &:not(:last-child) {
        border-bottom: 1rpx solid $border-light;
      }

      &--border-top {
        border-top: 1rpx solid $border-light;
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
          font-size: 24rpx;
          color: $text-secondary;
          line-height: 1.4;
        }
      }

      .picker-value {
        @include flex();
        align-items: center;
        gap: 8rpx;
        padding: 8rpx $spacing-sm;
        background: $background-secondary;
        border-radius: 12rpx;

        .value-text {
          font-size: $font-size-sm;
          color: $text-primary;
          min-width: 80rpx;
          text-align: center;
        }
      }
    }
  }
}

.save-button {
  padding-top: $spacing-xs;

  .btn-save {
    width: 100%;
    height: 80rpx;
    background: $gradient-primary;
    border-radius: $border-radius-full;
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

// 底部间距
.bottom-spacing {
  height: $spacing-2xl;
  margin-bottom: $spacing-xl;
}
</style>
