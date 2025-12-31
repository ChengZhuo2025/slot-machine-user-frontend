<template>
  <view class="edit-profile">
    <view class="profile-avatar" @click="chooseAvatar">
      <image
        :src="formData.avatar || '/static/images/default-avatar.png'"
        class="avatar-image"
        mode="aspectFill"
      />
      <view class="avatar-mask">
        <Icon name="camera" size="large" color="#fff" />
        <text class="avatar-text">更换头像</text>
      </view>
    </view>

    <view class="profile-form">
      <view class="form-item">
        <text class="form-label">昵称</text>
        <input
          v-model="formData.nickname"
          class="form-input"
          placeholder="请输入昵称"
          maxlength="20"
        />
      </view>

      <view class="form-item" @click="showGenderPicker">
        <text class="form-label">性别</text>
        <view class="form-value">
          <text class="value-text">{{ genderText }}</text>
          <Icon name="chevron-right" size="small" color="#999" />
        </view>
      </view>

      <view class="form-item" @click="showBirthdayPicker">
        <text class="form-label">生日</text>
        <view class="form-value">
          <text class="value-text">{{ formData.birthday || '请选择生日' }}</text>
          <Icon name="chevron-right" size="small" color="#999" />
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">邮箱</text>
        <input
          v-model="formData.email"
          class="form-input"
          placeholder="请输入邮箱"
          type="text"
        />
      </view>

      <view class="form-item">
        <text class="form-label">真实姓名</text>
        <input
          v-model="formData.realName"
          class="form-input"
          :placeholder="formData.isRealNameAuth ? '已实名认证' : '请输入真实姓名'"
          :disabled="formData.isRealNameAuth"
        />
      </view>

      <view class="form-item">
        <text class="form-label">身份证号</text>
        <input
          v-model="formData.idCard"
          class="form-input"
          :placeholder="formData.isRealNameAuth ? '已实名认证' : '请输入身份证号'"
          :disabled="formData.isRealNameAuth"
          maxlength="18"
        />
      </view>
    </view>

    <view class="profile-actions">
      <!-- 微信授权按钮 -->
      <view class="wechat-auth-section">
        <button class="btn-wechat-auth" @click="handleWechatAuth">
          <Icon name="wechat" size="medium" color="#07C160" />
          <text class="btn-text">微信授权</text>
        </button>
        <text class="auth-tip">一键获取微信昵称和头像</text>
      </view>

      <!-- 保存修改按钮 -->
      <button class="btn-save" @click="handleSave">保存修改</button>
    </view>

    <!-- 性别选择器 -->
    <picker
      v-if="genderPickerVisible"
      mode="selector"
      :range="genderOptions"
      :range-key="'label'"
      :value="genderIndex"
      @change="onGenderChange"
      @cancel="genderPickerVisible = false"
    >
      <view></view>
    </picker>

    <!-- 生日选择器 -->
    <picker
      v-if="birthdayPickerVisible"
      mode="date"
      :value="formData.birthday"
      :end="todayDate"
      @change="onBirthdayChange"
      @cancel="birthdayPickerVisible = false"
    >
      <view></view>
    </picker>
  </view>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import Icon from '../common/Icon.vue'

export default {
  name: 'EditProfile',
  components: {
    Icon
  },
  props: {
    userInfo: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['save', 'avatarChange'],
  setup(props, { emit }) {
    // 表单数据
    const formData = reactive({
      avatar: '',
      nickname: '',
      gender: 0,
      birthday: '',
      email: '',
      realName: '',
      idCard: '',
      isRealNameAuth: false
    })

    // 性别选择器
    const genderPickerVisible = ref(false)
    const genderOptions = [
      { label: '未设置', value: 0 },
      { label: '男', value: 1 },
      { label: '女', value: 2 }
    ]

    const genderIndex = computed(() => {
      return genderOptions.findIndex(item => item.value === formData.gender)
    })

    const genderText = computed(() => {
      const option = genderOptions.find(item => item.value === formData.gender)
      return option ? option.label : '未设置'
    })

    // 生日选择器
    const birthdayPickerVisible = ref(false)
    const todayDate = computed(() => {
      const today = new Date()
      return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    })

    // 初始化表单数据
    onMounted(() => {
      Object.assign(formData, props.userInfo)
    })

    // 选择头像
    const chooseAvatar = () => {
      uni.chooseImage({
        count: 1,
        sourceType: ['album', 'camera'],
        success: (res) => {
          formData.avatar = res.tempFilePaths[0]
          // 这里应该上传到服务器
          emit('avatarChange', res.tempFilePaths[0])
          uni.showToast({
            title: '头像已更新',
            icon: 'success'
          })
        }
      })
    }

    // 显示性别选择器
    const showGenderPicker = () => {
      genderPickerVisible.value = true
      // 触发picker显示需要在下一帧
      setTimeout(() => {
        const picker = document.querySelector('picker')
        if (picker) {
          picker.click()
        }
      }, 50)
    }

    // 性别改变
    const onGenderChange = (e) => {
      formData.gender = genderOptions[e.detail.value].value
      genderPickerVisible.value = false
    }

    // 显示生日选择器
    const showBirthdayPicker = () => {
      birthdayPickerVisible.value = true
      setTimeout(() => {
        const picker = document.querySelectorAll('picker')[1]
        if (picker) {
          picker.click()
        }
      }, 50)
    }

    // 生日改变
    const onBirthdayChange = (e) => {
      formData.birthday = e.detail.value
      birthdayPickerVisible.value = false
    }

    // 保存修改
    const handleSave = () => {
      // 验证必填项
      if (!formData.nickname) {
        uni.showToast({
          title: '请输入昵称',
          icon: 'none'
        })
        return
      }

      // 验证邮箱格式
      if (formData.email) {
        const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailReg.test(formData.email)) {
          uni.showToast({
            title: '邮箱格式不正确',
            icon: 'none'
          })
          return
        }
      }

      // 验证身份证格式(如果填写了)
      if (formData.idCard && !formData.isRealNameAuth) {
        const idCardReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
        if (!idCardReg.test(formData.idCard)) {
          uni.showToast({
            title: '身份证号格式不正确',
            icon: 'none'
          })
          return
        }
      }

      emit('save', { ...formData })
    }

    // 微信授权
    const handleWechatAuth = () => {
      // #ifdef MP-WEIXIN
      uni.getUserProfile({
        desc: '用于完善个人资料',
        success: (res) => {
          formData.nickname = res.userInfo.nickName
          formData.avatar = res.userInfo.avatarUrl
          formData.gender = res.userInfo.gender

          uni.showToast({
            title: '授权成功',
            icon: 'success'
          })

          emit('avatarChange', res.userInfo.avatarUrl)
        },
        fail: () => {
          uni.showToast({
            title: '授权失败',
            icon: 'none'
          })
        }
      })
      // #endif

      // #ifndef MP-WEIXIN
      uni.showToast({
        title: '仅支持微信小程序',
        icon: 'none'
      })
      // #endif
    }

    return {
      formData,
      genderPickerVisible,
      genderOptions,
      genderIndex,
      genderText,
      birthdayPickerVisible,
      todayDate,
      chooseAvatar,
      showGenderPicker,
      onGenderChange,
      showBirthdayPicker,
      onBirthdayChange,
      handleSave,
      handleWechatAuth
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.edit-profile {
  padding-bottom: $spacing-base;
}

.profile-avatar {
  position: relative;
  width: 140rpx;
  height: 140rpx;
  margin: 0 auto;
  border-radius: 50%;
  border: 12rpx solid $background-primary;
  overflow: hidden;

  .avatar-image {
    width: 100%;
    height: 100%;
  }

  .avatar-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    @include flex-center();
    flex-direction: column;
    gap: $spacing-xs;
    opacity: 0;
    transition: opacity $transition-base;

    .avatar-text {
      font-size: $font-size-xs;
      color: #fff;
    }
  }

  &:active .avatar-mask {
    opacity: 1;
  }
}

.profile-form {
  background: $background-primary;
  border-radius: 20rpx;
  padding: $spacing-xl $spacing-lg $spacing-sm;
  margin-top: -70rpx;
  overflow: hidden;

  .form-item {
    @include flex-between();
    align-items: center;
    padding: $spacing-base 0;
    border-bottom: 2rpx solid $border-light;

    &:last-child {
      border-bottom: none;
    }

    .form-label {
      font-size: $font-size-sm;
      color: $text-primary;
      font-weight: $font-weight-semibold;
      flex-shrink: 0;
      width: 140rpx;
    }

    .form-input {
      flex: 1;
      font-size: $font-size-sm;
      color: $text-primary;
      text-align: right;

      &::placeholder {
        color: $text-tertiary;
      }

      &[disabled] {
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
}

.profile-actions {
  padding: $spacing-base 0;

  .wechat-auth-section {
    @include flex-center();
    flex-direction: column;
    gap: $spacing-xs;
    margin-bottom: $spacing-base;

    .btn-wechat-auth {
      width: 100%;
      height: 80rpx;
      background: #fff;
      border: 2rpx solid #07C160;
      border-radius: 20rpx;
      @include flex-center();
      gap: $spacing-xs;
      font-size: $font-size-sm;
      color: #07C160;
      font-weight: $font-weight-semibold;
      transition: all $transition-base;

      &:active {
        background: rgba(7, 193, 96, 0.05);
        transform: scale(0.98);
      }

      &::after {
        border: none;
      }

      .btn-text {
        color: #07C160;
      }
    }

    .auth-tip {
      font-size: $font-size-xs;
      color: $text-tertiary;
      text-align: center;
    }
  }

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
    transition: opacity $transition-base;

    &:active {
      opacity: 0.8;
    }

    &::after {
      border: none;
    }
  }
}
</style>
