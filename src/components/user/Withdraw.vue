<template>
  <view class="withdraw">
    <!-- 可提现金额 -->
    <view class="withdraw-card">
      <text class="card-label">可提现金额(元)</text>
      <text class="card-value">¥{{ balance }}</text>
    </view>

    <!-- 提现表单 -->
    <view class="withdraw-form">
      <view class="form-item">
        <text class="form-label">提现金额</text>
        <view class="form-input-wrapper">
          <text class="input-prefix">¥</text>
          <input
            v-model="formData.amount"
            class="form-input"
            type="digit"
            placeholder="请输入提现金额"
            @input="onAmountInput"
          />
          <view class="input-action" @click="withdrawAll">
            <text class="action-text">全部提现</text>
          </view>
        </view>
      </view>

      <view class="method-wrapper">
        <view class="form-item form-item--clickable" @click="toggleMethodPicker">
          <text class="form-label">提现方式</text>
          <view class="form-value">
            <text class="value-text">{{ methodText }}</text>
            <Icon
              :name="methodPickerExpanded ? 'chevron-up' : 'chevron-down'"
              size="small"
              color="#999"
            />
          </view>
        </view>

        <!-- 手风琴展开的提现方式列表 -->
        <view
          class="method-options"
          :class="{ 'method-options--expanded': methodPickerExpanded }"
        >
          <view
            v-for="option in methodOptions"
            :key="option.value"
            class="method-option"
            :class="{ 'method-option--active': formData.method === option.value }"
            @click="selectMethod(option.value)"
          >
            <view class="option-left">
              <Icon
                :name="option.icon"
                size="medium"
                :color="formData.method === option.value ? primaryColor : '#999'"
              />
              <text class="option-label">{{ option.label }}</text>
            </view>
            <Icon
              v-if="formData.method === option.value"
              name="check"
              size="small"
              :color="primaryColor"
            />
          </view>
        </view>
      </view>

      <view class="form-item" v-if="formData.method !== ''">
        <text class="form-label">{{ accountLabel }}</text>
        <input
          v-model="formData.account"
          class="form-input"
          :placeholder="'请输入' + accountLabel"
        />
      </view>

      <view class="form-item" v-if="formData.method !== ''">
        <text class="form-label">真实姓名</text>
        <input
          v-model="formData.realName"
          class="form-input"
          placeholder="请输入真实姓名"
        />
      </view>
    </view>

    <!-- 提现说明 -->
    <view class="withdraw-tips">
      <view class="tips-title">
        <Icon name="info" size="small" color="#F59E0B" />
        <text>提现说明</text>
      </view>
      <view class="tips-list">
        <text class="tip-item">• 单笔提现金额不得低于10元</text>
        <text class="tip-item">• 提现申请提交后, 预计1-3个工作日到账</text>
        <text class="tip-item">• 每日最多可提现3次</text>
        <text class="tip-item">• 请确保账户信息准确, 以免提现失败</text>
      </view>
    </view>

    <!-- 提现按钮 -->
    <view class="withdraw-actions">
      <button class="btn-submit" @click="handleSubmit">提交申请</button>
    </view>
  </view>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import Icon from '../common/Icon.vue'

export default {
  name: 'Withdraw',
  components: {
    Icon
  },
  props: {
    balance: {
      type: [Number, String],
      default: 0
    }
  },
  emits: ['success'],
  setup(props, { emit }) {
    const formData = reactive({
      amount: '',
      method: '',
      account: '',
      realName: ''
    })

    const methodPickerExpanded = ref(false)
    const primaryColor = '#8b5cf6'

    const methodOptions = [
      { label: '微信零钱', value: 'wechat', icon: 'wechat' },
      { label: '支付宝', value: 'alipay', icon: 'alipay' },
      { label: '银行卡', value: 'bank', icon: 'credit-card' }
    ]

    const methodText = computed(() => {
      const option = methodOptions.find(item => item.value === formData.method)
      return option ? option.label : '请选择提现方式'
    })

    const accountLabel = computed(() => {
      const labels = {
        wechat: '微信账号',
        alipay: '支付宝账号',
        bank: '银行卡号'
      }
      return labels[formData.method] || '账号'
    })

    // 金额输入
    const onAmountInput = (e) => {
      let value = e.detail.value
      // 只允许输入数字和小数点
      value = value.replace(/[^\d.]/g, '')
      // 只允许一个小数点
      value = value.replace(/\.{2,}/g, '.')
      // 只保留两位小数
      value = value.replace(/^(\d+)\.(\d{2}).*$/, '$1.$2')
      formData.amount = value
    }

    // 全部提现
    const withdrawAll = () => {
      formData.amount = String(props.balance)
    }

    // 切换提现方式选择器
    const toggleMethodPicker = () => {
      methodPickerExpanded.value = !methodPickerExpanded.value
    }

    // 选择提现方式
    const selectMethod = (value) => {
      formData.method = value
      methodPickerExpanded.value = false
    }

    // 提交申请
    const handleSubmit = () => {
      // 验证金额
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        uni.showToast({
          title: '请输入提现金额',
          icon: 'none'
        })
        return
      }

      if (parseFloat(formData.amount) < 10) {
        uni.showToast({
          title: '提现金额不得低于10元',
          icon: 'none'
        })
        return
      }

      if (parseFloat(formData.amount) > parseFloat(props.balance)) {
        uni.showToast({
          title: '提现金额超过可用余额',
          icon: 'none'
        })
        return
      }

      // 验证提现方式
      if (!formData.method) {
        uni.showToast({
          title: '请选择提现方式',
          icon: 'none'
        })
        return
      }

      // 验证账号
      if (!formData.account) {
        uni.showToast({
          title: '请输入' + accountLabel.value,
          icon: 'none'
        })
        return
      }

      // 验证姓名
      if (!formData.realName) {
        uni.showToast({
          title: '请输入真实姓名',
          icon: 'none'
        })
        return
      }

      // 确认提现
      uni.showModal({
        title: '确认提现',
        content: `确认提现¥${formData.amount}到${methodText.value}吗?`,
        success: (res) => {
          if (res.confirm) {
            submitWithdraw()
          }
        }
      })
    }

    // 提交提现申请
    const submitWithdraw = async () => {
      try {
        uni.showLoading({ title: '提交中...' })

        // 这里应该调用API
        // const res = await api.withdrawApply(formData)

        // 模拟提交
        setTimeout(() => {
          uni.hideLoading()
          uni.showToast({
            title: '提现申请已提交',
            icon: 'success'
          })

          emit('success', formData)

          // 重置表单
          Object.assign(formData, {
            amount: '',
            method: '',
            account: '',
            realName: ''
          })
        }, 1000)
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: '提现申请失败',
          icon: 'none'
        })
      }
    }

    return {
      formData,
      methodPickerExpanded,
      methodOptions,
      methodText,
      accountLabel,
      primaryColor,
      onAmountInput,
      withdrawAll,
      toggleMethodPicker,
      selectMethod,
      handleSubmit
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.withdraw {
  padding-bottom: $spacing-xl;
}

.withdraw-card {
  background: $gradient-primary;
  border-radius: 20rpx;
  padding: $spacing-base;
  @include flex-center();
  flex-direction: column;
  gap: $spacing-xs;
  margin-bottom: $spacing-lg;

  .card-label {
    font-size: $font-size-sm;
    color: rgba(255, 255, 255, 0.9);
  }

  .card-value {
    font-size: 56rpx;
    font-weight: $font-weight-semibold;
    color: #fff;
    line-height: 1;
  }
}

.withdraw-form {
  background: $background-primary;
  border-radius: 20rpx;
  padding: 0 $spacing-base;
  margin-bottom: $spacing-lg;
  overflow: hidden;

  .form-item {
    @include flex-between();
    align-items: center;
    padding: $spacing-base 0;
    border-bottom: 2rpx solid $border-light;

    &:last-child {
      border-bottom: none;
    }

    &--clickable {
      cursor: pointer;
      transition: background-color $transition-base;

      &:active {
        background-color: rgba(0, 0, 0, 0.02);
      }
    }

    .form-label {
      font-size: $font-size-sm;
      color: $text-primary;
      font-weight: $font-weight-semibold;
      flex-shrink: 0;
      width: 150rpx;
    }

    .form-input-wrapper {
      flex: 1;
      @include flex();
      align-items: center;
      gap: $spacing-sm;

      .input-prefix {
        font-size: $font-size-sm;
        color: $text-primary;
        font-weight: $font-weight-semibold;
      }

      .form-input {
        flex: 1;
        font-size: $font-size-sm;
        color: $text-primary;
        font-weight: $font-weight-semibold;
      }

      .input-action {
        flex-shrink: 0;
        padding: $spacing-sm;
        background: $gradient-primary;
        border-radius: $border-radius-base;

        .action-text {
          display: flex;
          font-size: $font-size-xs;
          color: #fff;
          line-height: 1;
        }
      }
    }

    .form-input {
      flex: 1;
      font-size: $font-size-sm;
      color: $text-primary;
      text-align: right;

      &::placeholder {
        color: $text-tertiary;
      }
    }

    .form-value {
      flex: 1;
      @include flex();
      justify-content: flex-end;
      align-items: center;
      gap: $spacing-xs;

      .value-text {
        font-size: $font-size-sm;
        color: $text-secondary;
      }
    }
  }

  .method-wrapper {
    position: relative;

    .method-options {
      max-height: 0;
      overflow: hidden;
      transition: max-height $transition-base ease-in-out;

      &--expanded {
        max-height: 400rpx;
      }
    }

    .method-option {
      @include flex-between();
      align-items: center;
      padding: $spacing-base $spacing-base;
      border-bottom: 2rpx solid $border-light;
      cursor: pointer;
      transition: background-color $transition-base;

      &:last-child {
        border-bottom: none;
      }

      &:active {
        background-color: rgba(0, 0, 0, 0.02);
      }

      &--active {
        background-color: rgba(139, 92, 246, 0.05);

        .option-label {
          color: #8b5cf6 !important;
          font-weight: $font-weight-semibold;
        }
      }

      .option-left {
        @include flex();
        align-items: center;
        gap: $spacing-sm;
      }

      .option-label {
        font-size: $font-size-sm;
        color: $text-primary;
        transition: all $transition-base;
      }
    }
  }
}

.withdraw-tips {
  background: linear-gradient(135deg, #fff5e6 0%, #fffaed 100%);
  border-radius: 20rpx;
  border: 1rpx solid #ffd9a8;
  padding: $spacing-base;
  margin-bottom: $spacing-lg;

  .tips-title {
    @include flex();
    align-items: center;
    gap: $spacing-sm;
    margin-bottom: $spacing-base;
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    color: $text-primary;
  }

  .tips-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;

    .tip-item {
      font-size: $font-size-xs;
      color: $text-secondary;
      line-height: 1.6;
    }
  }
}

.withdraw-actions {
  .btn-submit {
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
