<template>
  <view class="login-page">
    <!-- 顶部装饰背景 -->
    <view class="login-bg"></view>

    <!-- 返回按钮 -->
    <view class="back-btn" @click="handleBack">
      <Icon name="chevron-left" size="medium" color="#fff" />
    </view>

    <!-- Logo区域 -->
    <view class="logo-section">
      <image class="logo" src="/static/images/logo.jpg" mode="aspectFit" />
      <text class="app-name">爱上杜美人</text>
      <text class="welcome-text">欢迎登录</text>
    </view>

    <!-- 登录表单卡片 -->
    <view class="login-card">
      <!-- 手机号输入 -->
      <view class="input-group">
        <view class="input-wrapper" :class="{ focused: focusedField === 'phone' }">
          <Icon name="phone" size="medium" color="#999" />
          <input
            v-model="form.phone"
            type="number"
            maxlength="11"
            placeholder="请输入手机号"
            class="input-field"
            @focus="focusedField = 'phone'"
            @blur="focusedField = ''"
          />
          <view v-if="form.phone" class="clear-btn" @click="form.phone = ''">
            <Icon name="close" size="small" color="#ccc" />
          </view>
        </view>
      </view>

      <!-- 验证码输入 -->
      <view class="input-group">
        <view class="input-wrapper" :class="{ focused: focusedField === 'code' }">
          <Icon name="shield-check" size="medium" color="#999" />
          <input
            v-model="form.code"
            type="number"
            maxlength="6"
            placeholder="请输入验证码"
            class="input-field"
            @focus="focusedField = 'code'"
            @blur="focusedField = ''"
          />
          <view
            class="code-btn"
            :class="{ disabled: countdown > 0 || !isPhoneValid }"
            @click="sendCode"
          >
            <text class="code-btn-text">
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </text>
          </view>
        </view>
      </view>

      <!-- 用户协议 -->
      <view class="agreement">
        <view
          class="checkbox"
          :class="{ checked: form.agreed }"
          @click="form.agreed = !form.agreed"
        >
          <Icon v-if="form.agreed" name="check" size="small" color="#fff" />
        </view>
        <text class="agreement-text">
          已阅读并同意
          <text class="link" @click.stop="showAgreement('user')"> 用户协议 </text>
          和
          <text class="link" @click.stop="showAgreement('privacy')"> 隐私政策 </text>
        </text>
      </view>

      <!-- 登录按钮 -->
      <button
        class="login-btn"
        :class="{ disabled: !canLogin }"
        :loading="loading"
        @click="handleLogin"
      >
        登 录
      </button>
    </view>

    <!-- 第三方登录 -->
    <view class="third-party">
      <view class="divider">
        <view class="divider-line"></view>
        <text class="divider-text">其他登录方式</text>
        <view class="divider-line"></view>
      </view>

      <view class="third-party-icons">
        <view class="third-icon wechat" @click="handleWechatLogin">
          <Icon name="wechat" size="large" color="#fff" />
        </view>
      </view>
    </view>

    <!-- 底部提示 -->
    <view class="footer-tip">
      <text class="tip-text">登录即表示新用户自动注册</text>
    </view>
  </view>
</template>

<script>
import { ref, reactive, computed, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'
import Icon from '@/components/common/Icon.vue'
import * as userApi from '@/services/user'

export default {
  name: 'UserLoginPage',
  components: { Icon },

  setup() {
    const userStore = useUserStore()

    // 表单数据
    const form = reactive({
      phone: '',
      code: '',
      agreed: false
    })

    // 状态
    const loading = ref(false)
    const countdown = ref(0)
    const focusedField = ref('')
    let timer = null

    // 计算属性：手机号验证
    const isPhoneValid = computed(() => {
      return /^1[3-9]\d{9}$/.test(form.phone)
    })

    // 计算属性：是否可以登录
    const canLogin = computed(() => {
      return isPhoneValid.value &&
        form.code.length === 6 &&
        form.agreed &&
        !loading.value
    })

    // 发送验证码
    const sendCode = async () => {
      if (countdown.value > 0 || !isPhoneValid.value) return

      try {
        await userApi.sendSmsCode(form.phone)

        // 开始倒计时
        countdown.value = 60
        timer = setInterval(() => {
          countdown.value--
          if (countdown.value <= 0) {
            clearInterval(timer)
            timer = null
          }
        }, 1000)

        uni.showToast({
          title: '验证码已发送',
          icon: 'success'
        })
      } catch (error) {
        uni.showToast({
          title: error.message || '发送失败',
          icon: 'none'
        })
      }
    }

    // 手机号验证码登录
    const handleLogin = async () => {
      if (!canLogin.value) {
        if (!form.agreed) {
          uni.showToast({
            title: '请先同意用户协议',
            icon: 'none'
          })
        }
        return
      }

      loading.value = true

      try {
        await userStore.login({
          phone: form.phone,
          code: form.code,
          loginType: 'sms'
        })

        uni.showToast({
          title: '登录成功',
          icon: 'success'
        })

        // 延迟跳转
        setTimeout(() => {
          handleLoginSuccess()
        }, 1000)
      } catch (error) {
        uni.showToast({
          title: error.message || '登录失败',
          icon: 'none'
        })
      } finally {
        loading.value = false
      }
    }

    // 微信登录
    const handleWechatLogin = async () => {
      if (!form.agreed) {
        uni.showToast({
          title: '请先同意用户协议',
          icon: 'none'
        })
        return
      }

      // #ifdef MP-WEIXIN
      // 小程序环境
      try {
        const loginResult = await new Promise((resolve, reject) => {
          uni.login({
            provider: 'weixin',
            success: resolve,
            fail: reject
          })
        })

        loading.value = true
        await userStore.login({
          code: loginResult.code,
          loginType: 'wechat'
        })

        handleLoginSuccess()
      } catch (error) {
        uni.showToast({
          title: error.message || '微信登录失败',
          icon: 'none'
        })
      } finally {
        loading.value = false
      }
      // #endif

      // #ifdef H5
      // H5环境 - 模拟微信登录
      loading.value = true
      try {
        await userStore.login({
          loginType: 'wechat_h5'
        })

        uni.showToast({
          title: '登录成功',
          icon: 'success'
        })

        setTimeout(() => {
          handleLoginSuccess()
        }, 1000)
      } catch (error) {
        uni.showToast({
          title: error.message || '微信登录失败',
          icon: 'none'
        })
      } finally {
        loading.value = false
      }
      // #endif
    }

    // 登录成功处理
    const handleLoginSuccess = () => {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
      } else {
        uni.switchTab({ url: '/pages/index/index' })
      }
    }

    // 返回
    const handleBack = () => {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
      } else {
        uni.switchTab({ url: '/pages/index/index' })
      }
    }

    // 查看协议
    const showAgreement = (type) => {
      uni.showModal({
        title: type === 'user' ? '用户协议' : '隐私政策',
        content: type === 'user'
          ? '用户协议内容（开发中）...'
          : '隐私政策内容（开发中）...',
        showCancel: false
      })
    }

    // 清理定时器
    onUnmounted(() => {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    })

    return {
      form,
      loading,
      countdown,
      focusedField,
      isPhoneValid,
      canLogin,
      sendCode,
      handleLogin,
      handleWechatLogin,
      handleBack,
      showAgreement
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.login-page {
  min-height: 100vh;
  background-color: $background-secondary;
  display: flex;
  flex-direction: column;
  position: relative;
}

// 背景装饰
.login-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 640rpx;
  background: $gradient-primary;
  border-radius: 0 0 60rpx 60rpx;
  z-index: 0;
}

// 返回按钮
.back-btn {
  position: absolute;
  top: 32rpx;
  left: $spacing-lg;
  z-index: 10;
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;

  &:active {
    background: rgba(255, 255, 255, 0.3);
  }
}

// Logo区域
.logo-section {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 160rpx 0 60rpx;

  .logo {
    width: 160rpx;
    height: 160rpx;
    border-radius: 32rpx;
    box-shadow: 0 16rpx 48rpx rgba(255, 255, 255, 0.35);
  }

  .app-name {
    margin-top: $spacing-lg;
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: #fff;
    letter-spacing: 4rpx;
  }

  .welcome-text {
    margin-top: $spacing-sm;
    font-size: $font-size-base;
    color: rgba(255, 255, 255, 0.8);
  }
}

// 登录卡片
.login-card {
  position: relative;
  z-index: 1;
  margin: 0 40rpx;
  padding: 48rpx 40rpx;
  border: 2rpx solid #fff;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: $border-radius-2xl;
  box-shadow: $shadow-lg;
}

// 输入框组
.input-group {
  margin-bottom: $spacing-lg;

  .input-wrapper {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-base;
    background: $background-tertiary;
    border-radius: $border-radius-lg;
    border: 2rpx solid transparent;
    transition: all 0.3s ease;

    &.focused {
      border-color: $primary-color;
      background: $background-primary;
    }

    .input-field {
      flex: 1;
      font-size: $font-size-base;
      color: $text-primary;

      &::placeholder {
        color: $text-placeholder;
      }
    }

    .clear-btn {
      padding: $spacing-xs;
    }

    .code-btn {
      padding: $spacing-sm $spacing-base;
      background: $gradient-primary;
      border-radius: $border-radius-base;

      &.disabled {
        background: $background-tertiary;

        .code-btn-text {
          color: $text-tertiary;
        }
      }

      .code-btn-text {
        font-size: $font-size-sm;
        color: #fff;
        font-weight: $font-weight-medium;
        white-space: nowrap;
      }
    }
  }
}

// 用户协议
.agreement {
  display: flex;
  align-items: flex-start;
  gap: $spacing-sm;
  margin-bottom: $spacing-xl;

  .checkbox {
    width: 36rpx;
    height: 36rpx;
    border: 2rpx solid $border-color;
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 4rpx;

    &.checked {
      background: $primary-color;
      border-color: $primary-color;
    }
  }

  .agreement-text {
    font-size: $font-size-sm;
    color: $text-secondary;
    line-height: 1.6;

    .link {
      color: $primary-color;
    }
  }
}

// 登录按钮
.login-btn {
  width: 100%;
  height: 96rpx;
  background: $gradient-primary;
  border-radius: $border-radius-full;
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: #fff;
  letter-spacing: 8rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;

  &.disabled {
    background: $background-tertiary;
    color: $text-tertiary;
  }

  &:active:not(.disabled) {
    opacity: 0.9;
    transform: scale(0.98);
  }

  &::after {
    border: none;
  }
}

// 第三方登录
.third-party {
  flex: 1;
  padding: $spacing-xl $spacing-lg;

  .divider {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-base;
    margin-bottom: $spacing-xl;

    .divider-line {
      flex: 1;
      height: 1rpx;
      background: $border-color;
    }

    .divider-text {
      font-size: $font-size-sm;
      color: $text-tertiary;
    }
  }

  .third-party-icons {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-xl;

    .third-icon {
      width: 96rpx;
      height: 96rpx;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      &.wechat {
        background: #07c160;
      }

      &:active {
        transform: scale(0.95);
        opacity: 0.9;
      }
    }
  }
}

// 底部提示
.footer-tip {
  padding: $spacing-xl $spacing-lg;
  padding-bottom: calc($spacing-lg + env(safe-area-inset-bottom));
  text-align: center;

  .tip-text {
    font-size: $font-size-xs;
    color: $text-tertiary;
  }
}
</style>
