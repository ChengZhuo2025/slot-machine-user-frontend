<template>
  <view class="unlock-page">
    <!-- 导航栏 -->
    <view class="header-bar">
      <view class="header-left" @click="handleBack">
        <Icon name="arrow-left" size="medium" color="#333" />
      </view>
      <view class="header-center">
        <text class="header-title">{{ mode === 'code' ? '输入开锁码' : '设备开锁' }}</text>
      </view>
      <view class="header-right"></view>
    </view>

    <scroll-view class="content" scroll-y="true">
      <!-- 设备信息卡片 -->
      <view v-if="deviceInfo.name" class="device-card animate__animated animate__bounceIn">
        <view class="device-icon">
          <Icon name="box" size="xlarge" color="#6366f1" />
        </view>
        <view class="device-info">
          <text class="device-name">{{ deviceInfo.name }}</text>
          <text class="device-location">{{ deviceInfo.location }}</text>
        </view>
        <view class="device-status" :class="`status--${deviceInfo.status}`">
          <text class="status-text">{{ statusText }}</text>
        </view>
      </view>

      <!-- 输入开锁码模式 -->
      <view v-if="mode === 'code'" class="code-input-section animate__animated animate__fadeInUp" style="animation-delay: 200ms;">
        <view class="section-title">
          <text class="title-text">请输入6位开锁码</text>
        </view>
        <view class="code-inputs">
          <input
            v-for="(code, index) in unlockCodeArray"
            :key="index"
            :ref="el => codeInputRefs[index] = el"
            class="code-input"
            :class="{ 'code-input--filled': unlockCodeArray[index] }"
            type="number"
            maxlength="1"
            v-model="unlockCodeArray[index]"
            @input="handleCodeInput(index, $event)"
            @keydown="handleCodeKeydown(index, $event)"
            @focus="handleCodeFocus(index)"
          />
        </view>
        <view class="code-actions">
          <view class="code-tips">
            <text class="tips-text">开锁码可在订单详情中查看</text>
          </view>
          <view v-if="unlockCodeArray.some(code => code !== '')" class="clear-btn" @click="handleClearCode">
            <Icon name="x" size="xsmall" color="#999" />
            <text class="clear-text">清空</text>
          </view>
        </view>
      </view>

      <!-- 开锁进度 -->
      <UnlockProgress
        v-if="unlocking || unlocked"
        :status="unlockStatus"
        :progress="unlockProgress"
        :message="unlockMessage"
      />

      <!-- 开锁说明 -->
      <view v-if="!unlocking && !unlocked" class="instructions-card animate__animated animate__fadeInUp" style="animation-delay: 300ms;">
        <view class="section-title">
          <Icon name="info" size="small" color="#333" />
          <text class="title-text">使用说明</text>
        </view>
        <view class="instruction-list">
          <view v-for="(item, index) in instructions" :key="index" class="instruction-item">
            <view class="item-number">{{ index + 1 }}</view>
            <text class="item-text">{{ item }}</text>
          </view>
        </view>
      </view>

      <!-- 开锁结果 -->
      <view v-if="unlocked" class="result-card animate__animated animate__zoomIn">
        <view v-if="unlockSuccess" class="success-result">
          <Icon name="check-circle" size="xlarge" color="#10b981" />
          <text class="result-title">开锁成功</text>
          <text class="result-desc">请取出您的物品</text>
          <view class="action-buttons">
            <view class="action-btn action-btn--primary" @click="handleComplete">
              <text class="btn-text">完成</text>
            </view>
          </view>
        </view>
        <view v-else class="error-result">
          <Icon name="x-circle" size="xlarge" color="#ef4444" />
          <text class="result-title">开锁失败</text>
          <text class="result-desc">{{ errorMessage }}</text>
          <view class="action-buttons">
            <view class="action-btn action-btn--secondary" @click="handleRetry">
              <text class="btn-text">重试</text>
            </view>
            <view class="action-btn action-btn--primary" @click="handleContact">
              <text class="btn-text">联系客服</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view v-if="!unlocking && !unlocked && canUnlock" class="action-bar animate__animated animate__slideInUp">
      <view class="unlock-button" @click="handleUnlock">
        <Icon name="unlock" size="medium" color="#fff" />
        <text class="button-text">立即开锁</text>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, nextTick } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import Icon from '@/components/common/Icon.vue'
import UnlockProgress from '@/components/hotel/UnlockProgress.vue'
import request from '@/utils/request'

export default {
  name: 'UnlockPage',
  components: {
    Icon,
    UnlockProgress
  },
  setup() {
    const mode = ref('scan') // scan | code
    const deviceId = ref('')
    const orderId = ref('')

    const deviceInfo = ref({})
    const unlockCodeArray = ref(['', '', '', '', '', ''])
    const codeInputRefs = ref([])

    const unlocking = ref(false)
    const unlocked = ref(false)
    const unlockSuccess = ref(false)
    const unlockStatus = ref('connecting')
    const unlockProgress = ref(0)
    const unlockMessage = ref('')
    const errorMessage = ref('')

    // 使用说明
    const instructions = ref([
      '确认设备信息正确无误',
      '点击"立即开锁"按钮',
      '等待设备开锁完成',
      '打开柜门，取出物品',
      '关闭柜门，完成使用'
    ])

    // 设备状态文本
    const statusText = computed(() => {
      const statusMap = {
        locked: '已锁定',
        unlocked: '已开锁',
        offline: '离线'
      }
      return statusMap[deviceInfo.value.status] || '未知'
    })

    // 是否可以开锁
    const canUnlock = computed(() => {
      if (mode.value === 'code') {
        return unlockCodeArray.value.every(code => code !== '')
      }
      return deviceId.value !== ''
    })

    // 获取设备信息
    const fetchDeviceInfo = async () => {
      if (!deviceId.value) return

      try {
        const res = await request({
          url: `/api/devices/${deviceId.value}`,
          method: 'GET'
        })
        deviceInfo.value = res.data
      } catch (error) {
        uni.showToast({
          title: '获取设备信息失败',
          icon: 'none'
        })
      }
    }

    // 处理开锁码输入
    const handleCodeInput = (index, event) => {
      const value = event.detail.value

      // 只允许数字
      if (value && !/^\d$/.test(value)) {
        unlockCodeArray.value[index] = ''
        return
      }

      if (value && index < 5) {
        // 自动聚焦下一个输入框
        nextTick(() => {
          const nextInput = codeInputRefs.value[index + 1]
          if (nextInput && nextInput.focus) {
            nextInput.focus()
          }
        })
      }

      // 检查是否全部输入完成
      if (unlockCodeArray.value.every(code => code !== '')) {
        // 延迟自动开锁,给用户确认时间
        setTimeout(() => {
          if (unlockCodeArray.value.every(code => code !== '')) {
            handleUnlock()
          }
        }, 300)
      }
    }

    // 处理键盘按键
    const handleCodeKeydown = (index, event) => {
      // 如果按删除键且当前输入框为空,聚焦到上一个输入框
      if ((event.key === 'Backspace' || event.keyCode === 8) && !unlockCodeArray.value[index] && index > 0) {
        nextTick(() => {
          const prevInput = codeInputRefs.value[index - 1]
          if (prevInput && prevInput.focus) {
            prevInput.focus()
          }
        })
      }
    }

    // 处理输入框聚焦
    const handleCodeFocus = (index) => {
      // 自动选中输入框内容
      nextTick(() => {
        const input = codeInputRefs.value[index]
        if (input && input.select) {
          input.select()
        }
      })
    }

    // 开锁
    const handleUnlock = async () => {
      // 防止重复点击
      if (unlocking.value || unlocked.value) {
        return
      }

      // 验证开锁码
      if (mode.value === 'code') {
        const unlockCode = unlockCodeArray.value.join('')
        if (unlockCode.length !== 6 || !/^\d{6}$/.test(unlockCode)) {
          uni.showToast({
            title: '请输入6位数字开锁码',
            icon: 'none'
          })
          return
        }
      }

      unlocking.value = true
      unlockProgress.value = 0
      unlockStatus.value = 'connecting'
      unlockMessage.value = '正在连接设备...'

      try {
        // 模拟开锁过程
        await simulateUnlockProcess()

        // 实际开锁请求
        const unlockCode = unlockCodeArray.value.join('')
        const res = await request({
          url: '/api/devices/unlock',
          method: 'POST',
          data: {
            deviceId: deviceId.value,
            orderId: orderId.value,
            unlockCode: mode.value === 'code' ? unlockCode : undefined
          }
        })

        if (res.code === 200) {
          unlockSuccess.value = true
          unlockStatus.value = 'success'
          unlockMessage.value = '开锁成功'

          // 震动反馈
          uni.vibrateShort({
            type: 'heavy'
          })
        } else {
          unlockSuccess.value = false
          unlockStatus.value = 'error'
          errorMessage.value = res.message || '开锁失败'

          // 错误震动反馈
          uni.vibrateLong()
        }
      } catch (error) {
        console.error('开锁失败:', error)
        unlockSuccess.value = false
        unlockStatus.value = 'error'
        errorMessage.value = error.message || '开锁失败，请稍后重试'

        // 错误震动反馈
        uni.vibrateLong()
      } finally {
        unlocked.value = true
        unlocking.value = false
      }
    }

    // 模拟开锁过程
    const simulateUnlockProcess = () => {
      return new Promise((resolve) => {
        let progress = 0
        const interval = setInterval(() => {
          progress += 10
          unlockProgress.value = progress

          if (progress >= 30 && progress < 60) {
            unlockStatus.value = 'verifying'
            unlockMessage.value = '正在验证权限...'
          } else if (progress >= 60 && progress < 90) {
            unlockStatus.value = 'unlocking'
            unlockMessage.value = '正在开锁...'
          }

          if (progress >= 100) {
            clearInterval(interval)
            resolve()
          }
        }, 200)
      })
    }

    // 完成
    const handleComplete = () => {
      uni.navigateBack()
    }

    // 重试
    const handleRetry = () => {
      unlocked.value = false
      unlocking.value = false
      unlockSuccess.value = false
      unlockProgress.value = 0
      unlockCodeArray.value = ['', '', '', '', '', '']
    }

    // 清空开锁码
    const handleClearCode = () => {
      unlockCodeArray.value = ['', '', '', '', '', '']
      // 聚焦到第一个输入框
      nextTick(() => {
        const firstInput = codeInputRefs.value[0]
        if (firstInput && firstInput.focus) {
          firstInput.focus()
        }
      })
    }

    // 联系客服
    const handleContact = () => {
      uni.navigateTo({
        url: '/pages/user/customer-service'
      })
    }

    // 返回
    const handleBack = () => {
      uni.navigateBack()
    }

    // 页面加载
    onLoad((options) => {
      if (options.mode) {
        mode.value = options.mode
      }

      if (options.deviceId) {
        deviceId.value = options.deviceId
        fetchDeviceInfo()
      }

      if (options.orderId) {
        orderId.value = options.orderId
      }
    })

    return {
      mode,
      deviceInfo,
      statusText,
      unlockCodeArray,
      codeInputRefs,
      unlocking,
      unlocked,
      unlockSuccess,
      unlockStatus,
      unlockProgress,
      unlockMessage,
      errorMessage,
      instructions,
      canUnlock,
      handleBack,
      handleCodeInput,
      handleCodeKeydown,
      handleCodeFocus,
      handleClearCode,
      handleUnlock,
      handleComplete,
      handleRetry,
      handleContact
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.unlock-page {
  min-height: 100vh;
  background: $background-secondary;
  display: flex;
  flex-direction: column;
  padding-bottom: 140rpx;
  @include safe-area-inset-bottom(140rpx);
}

// 导航栏
.header-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background: $background-primary;
  @include flex-between();
  @include shadow(base);
  align-items: center;
  padding: 0 $spacing-base;
  z-index: 100;

  &-left,
  &-right {
    flex: 0 0 auto;
    width: 60rpx;
    height: 60rpx;
    @include flex-center();
    border-radius: $border-radius-full;
    transition: background-color $transition-base;

    &:active {
      background: $background-secondary;
    }
  }

  &-center {
    flex: 1;
    text-align: center;
  }

  .header-title {
    font-size: 30rpx;
    font-weight: $font-weight-semibold;
    color: $text-primary;
  }
}

// 内容区域
.content {
  flex: 1;
  margin-top: 80rpx;
}

// 设备卡片
.device-card {
  @include flex-start();
  align-items: center;
  gap: 20rpx;
  padding: 24rpx;
  margin: 16rpx 16rpx;
  background: linear-gradient(135deg, rgba($primary-color, 0.1) 0%, #ede9fe 100%);
  border-radius: 20rpx;

  .device-icon {
    @include flex-center();
    width: 100rpx;
    height: 100rpx;
    background: $background-primary;
    border-radius: 50%;
  }

  .device-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }

  .device-name {
    font-size: 28rpx;
    font-weight: $font-weight-semibold;
    color: $text-primary;
  }

  .device-location {
    font-size: 24rpx;
    color: $text-secondary;
  }

  .device-status {
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
    background: $text-tertiary;

    &.status--locked {
      background: rgba($warning-color, 0.1);

      .status-text {
        color: $warning-color;
      }
    }

    &.status--unlocked {
      background: rgba($success-color, 0.1);

      .status-text {
        color: $success-color;
      }
    }

    &.status--offline {
      background: $text-tertiary;

      .status-text {
        color: #fff;
      }
    }

    .status-text {
      font-size: 22rpx;
      font-weight: $font-weight-medium;
    }
  }
}

// 开锁码输入区域
.code-input-section {
  padding: 40rpx 24rpx 24rpx;
  margin-bottom: 16rpx;

  .section-title {
    margin-bottom: 32rpx;
    text-align: center;

    .title-text {
      font-size: 28rpx;
      font-weight: $font-weight-semibold;
      color: $text-primary;
    }
  }

  .code-inputs {
    @include flex-center();
    gap: 16rpx;
    margin-bottom: 24rpx;
  }

  .code-input {
    width: 80rpx;
    height: 80rpx;
    background: $background-primary;
    border: 2rpx solid $border-light;
    border-radius: 16rpx;
    text-align: center;
    font-size: 32rpx;
    font-weight: $font-weight-bold;
    color: $text-primary;
    transition: all $transition-base;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

    &:focus {
      border-color: $primary-color;
      background: rgba($primary-color, 0.05);
      box-shadow: 0 4rpx 12rpx rgba($primary-color, 0.2);
    }

    &--filled {
      border-color: $primary-color;
      background: rgba($primary-color, 0.05);
    }
  }

  .code-actions {
    @include flex-between();
    align-items: center;
    width: 100%;
    gap: 16rpx;
  }

  .code-tips {
    flex: 1;

    .tips-text {
      font-size: 24rpx;
      color: $text-secondary;
    }
  }

  .clear-btn {
    @include flex-center();
    gap: 4rpx;
    padding: 8rpx 16rpx;
    background: $background-secondary;
    border-radius: 20rpx;
    transition: all $transition-base;

    &:active {
      opacity: 0.6;
      transform: scale(0.95);
    }

    .clear-text {
      font-size: 24rpx;
      color: $text-secondary;
    }
  }
}

// 使用说明
.instructions-card {
  background: $background-primary;
  padding: 24rpx;
  margin: 16rpx;
  border-radius: 20rpx;

  .section-title {
    @include flex-start();
    align-items: center;
    gap: 8rpx;
    margin-bottom: 20rpx;

    .title-text {
      font-size: 28rpx;
      font-weight: $font-weight-semibold;
      color: $text-primary;
    }
  }

  .instruction-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
  }

  .instruction-item {
    @include flex-start();
    align-items: flex-start;
    gap: 16rpx;
  }

  .item-number {
    @include flex-center();
    width: 40rpx;
    height: 40rpx;
    background: rgba($primary-color, 0.1);
    color: $primary-color;
    border-radius: 50%;
    font-size: 22rpx;
    font-weight: $font-weight-semibold;
    flex-shrink: 0;
  }

  .item-text {
    flex: 1;
    font-size: 26rpx;
    color: $text-secondary;
    line-height: 40rpx;
  }
}

// 结果卡片
.result-card {
  margin: 16rpx;
  padding: 48rpx 24rpx;
  background: $background-primary;
  border-radius: 20rpx;

  .success-result,
  .error-result {
    @include flex-center();
    flex-direction: column;
    gap: 20rpx;
  }

  .result-title {
    font-size: 32rpx;
    font-weight: $font-weight-bold;
    color: $text-primary;
  }

  .result-desc {
    font-size: 26rpx;
    color: $text-secondary;
    margin-bottom: 16rpx;
  }

  .action-buttons {
    @include flex-center();
    gap: 24rpx;
    width: 100%;
    margin-top: 16rpx;
  }

  .action-btn {
    flex: 1;
    @include flex-center();
    height: 80rpx;
    border-radius: 40rpx;
    transition: all $transition-base;

    &:active {
      transform: scale(0.95);
      opacity: 0.8;
    }

    &--primary {
      background: linear-gradient(135deg, $primary-color 0%, #8b5cf6 100%);

      .btn-text {
        color: #fff;
      }
    }

    &--secondary {
      background: $background-secondary;
      border: 2rpx solid $border-light;

      .btn-text {
        color: $text-primary;
      }
    }

    .btn-text {
      font-size: 28rpx;
      font-weight: $font-weight-semibold;
    }
  }
}

// 底部操作栏
.action-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 24rpx;
  background: $background-primary;
  border-top: 2rpx solid $border-light;
  z-index: 100;
  @include safe-area-inset-bottom(20rpx);

  .unlock-button {
    @include flex-center();
    gap: 12rpx;
    width: 100%;
    height: 80rpx;
    background: linear-gradient(135deg, $primary-color 0%, #8b5cf6 100%);
    border-radius: 40rpx;
    transition: all $transition-base;

    &:active {
      transform: scale(0.98);
      opacity: 0.8;
    }

    .button-text {
      font-size: 28rpx;
      font-weight: $font-weight-semibold;
      color: #fff;
    }
  }
}
</style>
