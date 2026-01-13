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
            :class="{ disabled: countdown > 0 || !isPhoneValid || sendingCode }"
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
    <!-- #ifdef MP-WEIXIN -->
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
    <!-- #endif -->

    <!-- 底部提示 -->
    <view class="footer-tip">
      <text class="tip-text">登录即表示新用户自动注册</text>
    </view>
  </view>
</template>

<script>
/**
 * 登录页面
 * T100-T106: 短信验证码登录
 * T200-T205: 微信小程序登录
 * T320-T322: 登录成功跳转
 */
import { ref, reactive, computed, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'
import Icon from '@/components/common/Icon.vue'
// T100: 导入 auth 服务替换 user 服务
import * as authApi from '@/services/auth'
// T320: 导入登录守卫工具
import { getRedirectPath, clearRedirectPath } from '@/utils/authGuard'

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
    const sendingCode = ref(false)
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

    // T100, T101: 发送验证码
    const sendCode = async () => {
      if (countdown.value > 0 || !isPhoneValid.value || sendingCode.value) return

      sendingCode.value = true

      try {
        // T100: 使用 authApi.sendSmsCode 替换 mock 调用
        await authApi.sendSmsCode(form.phone)

        // T101: 开始 60 秒倒计时
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
        // T106: 处理频率限制错误
        if (error.message.includes('频繁')) {
          uni.showToast({
            title: '发送过于频繁，请稍后再试',
            icon: 'none'
          })
        } else {
          uni.showToast({
            title: error.message || '发送失败',
            icon: 'none'
          })
        }
      } finally {
        sendingCode.value = false
      }
    }

    // T102-T106: 手机号验证码登录
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
        // T102, T103: 调用 smsLogin 并保存响应到 store
        const response = await userStore.login({
          phone: form.phone,
          code: form.code,
          loginType: 'sms'
        })

        // T104: 处理 is_new_user 标志
        if (response.is_new_user) {
          uni.showToast({
            title: '欢迎新用户',
            icon: 'success'
          })
        } else {
          uni.showToast({
            title: '登录成功',
            icon: 'success'
          })
        }

        // 延迟跳转
        setTimeout(() => {
          handleLoginSuccess()
        }, 1000)
      } catch (error) {
        // T105: 显示错误信息
        uni.showToast({
          title: error.message || '登录失败',
          icon: 'none'
        })
      } finally {
        loading.value = false
      }
    }

    // T200-T205: 微信登录
    const handleWechatLogin = async () => {
      if (!form.agreed) {
        uni.showToast({
          title: '请先同意用户协议',
          icon: 'none'
        })
        return
      }

      // #ifdef MP-WEIXIN
      // T200, T201: 小程序环境检测，仅在小程序中显示微信登录按钮
      try {
        // T202: 调用 uni.login() 获取 code
        const loginResult = await new Promise((resolve, reject) => {
          uni.login({
            provider: 'weixin',
            success: resolve,
            fail: reject
          })
        })

        loading.value = true

        // T203: 使用 code 调用 wechatLogin
        const response = await userStore.login({
          code: loginResult.code,
          loginType: 'wechat'
        })

        // T205: 解析响应
        if (response.is_new_user) {
          uni.showToast({
            title: '欢迎新用户',
            icon: 'success'
          })
        } else {
          uni.showToast({
            title: '登录成功',
            icon: 'success'
          })
        }

        setTimeout(() => {
          handleLoginSuccess()
        }, 1000)
      } catch (error) {
        // T204: 处理微信授权拒绝
        if (error.errMsg && error.errMsg.includes('deny')) {
          uni.showToast({
            title: '需要微信授权才能登录',
            icon: 'none'
          })
        } else {
          uni.showToast({
            title: error.message || '微信登录失败',
            icon: 'none'
          })
        }
      } finally {
        loading.value = false
      }
      // #endif
    }

    // T320-T322: 登录成功跳转处理
    const handleLoginSuccess = () => {
      // T320: 获取保存的目标页面
      const redirectPath = getRedirectPath()
      // T322: 清除保存的路径
      clearRedirectPath()

      // T321: 跳转到目标页面或首页
      if (redirectPath && redirectPath !== '/pages/user/login') {
        // 检查是否是 TabBar 页面
        const tabBarPages = [
          '/pages/index/index',
          '/pages/mall/index',
          '/pages/distribution/index',
          '/pages/user/index'
        ]

        const basePath = redirectPath.split('?')[0]

        if (tabBarPages.includes(basePath)) {
          uni.switchTab({ url: basePath })
        } else {
          uni.redirectTo({ url: redirectPath })
        }
      } else {
        // 默认跳转到首页
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
      sendingCode,
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
