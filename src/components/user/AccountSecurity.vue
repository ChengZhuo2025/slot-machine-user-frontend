<template>
  <view class="account-security">
    <!-- 安全等级 -->
    <view class="security-level" :class="'security-level--' + levelConfig.level">
      <view class="level-content">
        <view class="level-left">
          <Icon name="shield-check" size="small" color="#333" />
          <view class="level-info">
            <text class="level-title">账户安全等级</text>
            <view class="level-badge">
              <text class="level-text">{{ levelConfig.label }}</text>
            </view>
          </view>
        </view>
        <view class="level-score">
          <text class="score-number">{{ levelConfig.progress }}</text>
          <text class="score-label">分</text>
        </view>
      </view>
      <view class="level-progress">
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: levelConfig.progress + '%' }"></view>
        </view>
      </view>
      <text class="level-tip">{{ levelConfig.tip }}</text>
    </view>

    <!-- 账户信息 -->
    <view class="security-section">
      <view class="section-header">
        <Icon name="user" size="small" color="#666" />
        <text class="section-title">账户信息</text>
      </view>
      <view class="security-card">
        <view class="security-item" @click="showPasswordModal = true">
          <view class="item-left">
            <Icon name="safe" size="medium" color="#8B5CF6" />
            <view class="item-info">
              <text class="item-title">登录密码</text>
              <text class="item-desc">定期修改密码可以提高账户安全性</text>
            </view>
          </view>
          <view class="item-right">
            <text class="item-value">已设置</text>
            <Icon name="chevron-right" size="small" color="#999" />
          </view>
        </view>
      </view>
    </view>

    <!-- 绑定信息 -->
    <view class="security-section">
      <view class="section-header">
        <Icon name="link" size="small" color="#666" />
        <text class="section-title">绑定信息</text>
      </view>
      <view class="security-card">
        <view class="security-item" @click="handlePhoneBind">
          <view class="item-left">
            <Icon name="phone" size="medium" color="#3B82F6" />
            <view class="item-info">
              <text class="item-title">手机号码</text>
              <text class="item-desc">{{ securityInfo.phone || '未绑定' }}</text>
            </view>
          </view>
          <view class="item-right">
            <text class="item-value">{{ securityInfo.phone ? '更换' : '绑定' }}</text>
            <Icon name="chevron-right" size="small" color="#999" />
          </view>
        </view>
        <view class="security-item" @click="handleEmailBind">
          <view class="item-left">
            <Icon name="mail" size="medium" color="#10c467" />
            <view class="item-info">
              <text class="item-title">邮箱</text>
              <text class="item-desc">{{ securityInfo.email || '未绑定' }}</text>
            </view>
          </view>
          <view class="item-right">
            <text class="item-value">{{ securityInfo.email ? '更换' : '绑定' }}</text>
            <Icon name="chevron-right" size="small" color="#999" />
          </view>
        </view>
        <view class="security-item" @click="handleWechatBind">
          <view class="item-left">
            <Icon name="brand-wechat" size="medium" color="#07C160" />
            <view class="item-info">
              <text class="item-title">微信</text>
              <text class="item-desc">{{ securityInfo.wechat || '未绑定' }}</text>
            </view>
          </view>
          <view class="item-right">
            <text class="item-value">{{ securityInfo.wechat ? '已绑定' : '绑定' }}</text>
            <Icon name="chevron-right" size="small" color="#999" />
          </view>
        </view>
      </view>
    </view>

    <!-- 安全设置 -->
    <view class="security-section">
      <view class="section-header">
        <Icon name="settings" size="small" color="#666" />
        <text class="section-title">安全设置</text>
      </view>
      <view class="security-card">
        <view class="security-item">
          <view class="item-left">
            <Icon name="fingerprint" size="medium" color="#EF4444" />
            <view class="item-info">
              <text class="item-title">生物识别</text>
              <text class="item-desc">使用指纹或面容登录</text>
            </view>
          </view>
          <Switch :checked="securityInfo.biometricEnabled" @change="onBiometricChange" color="#8B5CF6" />
        </view>
        <view class="security-item" @click="handleLoginHistory">
          <view class="item-left">
            <Icon name="clock" size="medium" color="#F59E0B" />
            <view class="item-info">
              <text class="item-title">登录记录</text>
              <text class="item-desc">查看最近的登录历史</text>
            </view>
          </view>
          <view class="item-right">
            <text class="item-value">查看</text>
            <Icon name="chevron-right" size="small" color="#999" />
          </view>
        </view>
        <view class="security-item" @click="handleDeviceManage">
          <view class="item-left">
            <Icon name="monitor" size="medium" color="#8B5CF6" />
            <view class="item-info">
              <text class="item-title">设备管理</text>
              <text class="item-desc">管理已登录的设备</text>
            </view>
          </view>
          <view class="item-right">
            <text class="item-value">查看</text>
            <Icon name="chevron-right" size="small" color="#999" />
          </view>
        </view>
      </view>
    </view>

    <!-- 修改密码弹窗 -->
    <view v-if="showPasswordModal" class="password-modal-overlay" @click="showPasswordModal = false">
      <view class="password-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">修改密码</text>
          <view class="modal-close" @click="showPasswordModal = false">
            <Icon name="close" size="medium" color="#666" />
          </view>
        </view>
        <view class="modal-content">
          <view class="form-item">
            <text class="form-label">原密码</text>
            <input v-model="passwordForm.oldPassword" class="form-input" type="password" placeholder="请输入原密码" />
          </view>
          <view class="form-item">
            <text class="form-label">新密码</text>
            <input v-model="passwordForm.newPassword" class="form-input" type="password" placeholder="请输入新密码" />
          </view>
          <view class="form-item">
            <text class="form-label">确认密码</text>
            <input v-model="passwordForm.confirmPassword" class="form-input" type="password" placeholder="请再次输入新密码" />
          </view>
          <view class="password-tips">
            <text class="tips-title">密码要求：</text>
            <text class="tips-item">• 长度8-20位</text>
            <text class="tips-item">• 包含字母和数字</text>
            <text class="tips-item">• 可包含特殊字符</text>
          </view>
        </view>
        <view class="modal-footer">
          <button class="btn-cancel" @click="showPasswordModal = false">取消</button>
          <button class="btn-confirm" @click="handlePasswordSave">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import Icon from '../common/Icon.vue'
import Switch from '../common/Switch.vue'

export default {
  name: 'AccountSecurity',
  components: { Icon, Switch },
  setup() {
    const showPasswordModal = ref(false)
    const securityInfo = reactive({
      phone: '138****8888',
      email: 'user@example.com',
      wechat: '已绑定',
      biometricEnabled: true,
      hasPassword: true,
      phoneVerified: true,
      emailVerified: true
    })

    const passwordForm = reactive({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    const levelConfig = computed(() => {
      let level = 0
      if (securityInfo.hasPassword) level += 20
      if (securityInfo.phoneVerified) level += 30
      if (securityInfo.emailVerified) level += 20
      if (securityInfo.wechat) level += 15
      if (securityInfo.biometricEnabled) level += 15

      if (level >= 80) {
        return {
          level: 'high',
          label: '高',
          progress: level,
          tip: '您的账户安全等级很高，请继续保持'
        }
      } else if (level >= 50) {
        return {
          level: 'medium',
          label: '中',
          progress: level,
          tip: '建议完善更多安全设置以提高账户安全'
        }
      } else {
        return {
          level: 'low',
          label: '低',
          progress: level,
          tip: '您的账户安全等级较低，请尽快完善安全设置'
        }
      }
    })

    const onBiometricChange = (e) => {
      securityInfo.biometricEnabled = e.detail.value
      uni.showToast({
        title: e.detail.value ? '已开启生物识别' : '已关闭生物识别',
        icon: 'success'
      })
    }

    const handlePhoneBind = () => {
      uni.showToast({ title: '手机号绑定/更换功能', icon: 'none' })
    }

    const handleEmailBind = () => {
      uni.showToast({ title: '邮箱绑定/更换功能', icon: 'none' })
    }

    const handleWechatBind = () => {
      uni.showToast({ title: '微信绑定功能', icon: 'none' })
    }

    const handleLoginHistory = () => {
      uni.showToast({ title: '登录记录功能', icon: 'none' })
    }

    const handleDeviceManage = () => {
      uni.showToast({ title: '设备管理功能', icon: 'none' })
    }

    const handlePasswordSave = () => {
      if (!passwordForm.oldPassword) {
        uni.showToast({ title: '请输入原密码', icon: 'none' })
        return
      }
      if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
        uni.showToast({ title: '新密码长度不能少于8位', icon: 'none' })
        return
      }
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        uni.showToast({ title: '两次输入的密码不一致', icon: 'none' })
        return
      }

      // 模拟保存
      uni.showToast({ title: '密码修改成功', icon: 'success' })
      showPasswordModal.value = false
      Object.assign(passwordForm, {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    }

    return {
      showPasswordModal,
      securityInfo,
      passwordForm,
      levelConfig,
      onBiometricChange,
      handlePhoneBind,
      handleEmailBind,
      handleWechatBind,
      handleLoginHistory,
      handleDeviceManage,
      handlePasswordSave
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.account-security {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.security-level {
  position: relative;
  border-radius: 24rpx;
  padding: $spacing-lg;
  margin-bottom: $spacing-lg;

  // 不同等级的背景渐变
  &--high {
    background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
    border: 1rpx solid #10b981;

    .level-badge {
      background: $success-color;
    }

    .score-number {
      color: $success-color;
    }
  }

  &--medium {
    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
    border: 1rpx solid #f59e0b;

    .level-badge {
      background: #f59e0b;
    }

    .score-number {
      color: #f59e0b;
    }
  }

  &--low {
    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
    border: 1rpx solid #ef4444;

    .level-badge {
      background: $error-color;
    }

    .score-number {
      color: $error-color;
    }
  }

  .level-content {
    @include flex-between();
    align-items: flex-end;
    margin-bottom: $spacing-sm;

    .level-left {
      @include flex();
      align-items: center;
      gap: $spacing-xs;
      flex: 1;
    }

    .level-info {
      display: flex;
      align-items: center;
      gap: $spacing-xs;

      .level-title {
        font-size: $font-size-base;
        font-weight: $font-weight-medium;
        color: $text-primary;
      }

      .level-badge {
        @include flex-center();
        width: 40rpx;
        height: 40rpx;
        border-radius: 20rpx;

        .level-text {
          display: flex;
          font-size: 24rpx;
          font-weight: $font-weight-bold;
          color: #fff;
          line-height: 1;
        }
      }
    }

    .level-score {
      display: flex;
      align-items: flex-end;
      gap: 2rpx;

      .score-number {
        font-size: 48rpx;
        font-weight: $font-weight-bold;
        line-height: 1;
        margin-bottom: 4rpx;
      }

      .score-label {
        font-size: $font-size-sm;
        color: $text-secondary;
        margin-bottom: 4rpx;
      }
    }
  }

  .level-progress {
    margin-bottom: $spacing-sm;

    .progress-bar {
      height: 12rpx;
      background: rgba(0, 0, 0, 0.08);
      border-radius: 6rpx;
      overflow: hidden;

      .progress-fill {
        height: 100%;
        border-radius: 6rpx;
        transition: width $transition-base;
      }
    }
  }

  .level-tip {
    font-size: $font-size-sm;
    color: $text-secondary;
    line-height: 1.5;
  }
}

.security-section {
  margin-bottom: $spacing-base;

  .section-header {
    @include flex();
    align-items: center;
    gap: $spacing-xs;
    margin-bottom: $spacing-sm;

    .section-title {
      font-size: $font-size-sm;
      font-weight: $font-weight-semibold;
      color: $text-primary;
    }
  }

  .security-card {
    background: $background-primary;
    border-radius: 20rpx;
    overflow: hidden;

    .security-item {
      @include flex-between();
      padding: $spacing-base;
      gap: $spacing-base;
      transition: background $transition-base;

      &:not(:last-child) {
        border-bottom: 1rpx solid #ddd;
      }

      &:active {
        background: $background-secondary;
      }

      .item-left {
        flex: 1;
        @include flex();
        align-items: center;
        gap: $spacing-base;
        min-width: 0;

        .item-info {
          display: flex;
          flex-direction: column;
          gap: 6rpx;
          min-width: 0;

          .item-title {
            font-size: $font-size-sm;
            color: $text-primary;
            font-weight: $font-weight-medium;
          }

          .item-desc {
            font-size: $font-size-xs;
            color: $text-secondary;
            @include ellipsis();
          }
        }
      }

      .item-right {
        @include flex();
        align-items: center;
        flex-shrink: 0;

        .item-value {
          font-size: $font-size-xs;
          color: $text-tertiary;
        }
      }
    }
  }
}

// 修改密码弹窗
.password-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  @include flex-center();
  padding: $spacing-xl;
}

.password-modal {
  width: 100%;
  max-height: 80vh;
  background: $background-primary;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;

  .modal-header {
    @include flex-between();
    padding: $spacing-base;
    border-bottom: 1rpx solid #ddd;

    .modal-title {
      font-size: $font-size-base;
      font-weight: $font-weight-semibold;
      color: $text-primary;
    }

    .modal-close {
      width: 60rpx;
      height: 60rpx;
      @include flex-center();
    }
  }

  .modal-content {
    flex: 1;
    overflow-y: auto;
    padding: $spacing-base;

    .form-item {
      margin-bottom: $spacing-base;

      .form-label {
        font-size: $font-size-sm;
        color: $text-primary;
        font-weight: $font-weight-medium;
        margin-bottom: $spacing-xs;
        display: block;
      }

      .form-input {
        width: 100%;
        padding: $spacing-sm;
        background: $background-secondary;
        border-radius: $border-radius-base;
        font-size: $font-size-sm;
        color: $text-primary;
        border: 2rpx solid transparent;

        &:focus {
          border-color: $primary-color;
        }
      }
    }

    .password-tips {
      background: rgba(139, 92, 246, 0.1);
      border-radius: $border-radius-base;
      padding: $spacing-sm;
      display: flex;
      flex-direction: column;
      gap: 6rpx;

      .tips-title {
        font-size: $font-size-xs;
        color: $text-primary;
        font-weight: $font-weight-medium;
        margin-bottom: 4rpx;
      }

      .tips-item {
        font-size: $font-size-xs;
        color: $text-secondary;
        line-height: 1.5;
      }
    }
  }

  .modal-footer {
    @include flex();
    gap: $spacing-base;
    padding: $spacing-base;
    border-top: 1rpx solid #ddd;

    .btn-cancel,
    .btn-confirm {
      flex: 1;
      height: 80rpx;
      border-radius: 20rpx;
      @include flex-center();
      font-size: $font-size-sm;
      font-weight: $font-weight-semibold;
      border: none;

      &::after {
        border: none;
      }
    }

    .btn-cancel {
      background: $background-secondary;
      color: $text-primary;

      &:active {
        opacity: 0.8;
      }
    }

    .btn-confirm {
      background: $gradient-primary;
      color: #fff;

      &:active {
        opacity: 0.8;
      }
    }
  }
}
</style>
