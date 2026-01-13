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

      <view class="form-item form-item-gender">
        <text class="form-label">性别</text>
        <radio-group class="gender-radio-group" @change="onGenderChange">
          <label
            v-for="item in genderOptions"
            :key="item.value"
            class="gender-radio-label"
          >
            <radio
              :value="String(item.value)"
              :checked="formData.gender === item.value"
              color="#FF6B35"
            />
            <text class="radio-text">{{ item.label }}</text>
          </label>
        </radio-group>
      </view>

      <picker
        mode="date"
        :value="formData.birthday || todayDate"
        :end="todayDate"
        @change="onBirthdayChange"
      >
        <view class="form-item">
          <text class="form-label">生日</text>
          <view class="form-value">
            <text class="value-text">{{ formData.birthday || '请选择生日' }}</text>
            <Icon name="chevron-right" size="small" color="#999" />
          </view>
        </view>
      </picker>
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
      <button class="btn-save" :disabled="saving" @click="handleSave">
        {{ saving ? '保存中...' : '保存修改' }}
      </button>
    </view>
  </view>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import Icon from '../common/Icon.vue'
import * as userApi from '@/services/user'

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
    // 保存状态
    const saving = ref(false)

    // 表单数据
    const formData = reactive({
      avatar: '',
      nickname: '',
      gender: 0,
      birthday: ''
    })

    // 性别选项
    const genderOptions = [
      { label: '未设置', value: 0 },
      { label: '男', value: 1 },
      { label: '女', value: 2 }
    ]

    // 生日选择器
    const todayDate = computed(() => {
      const today = new Date()
      return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    })

    // 初始化表单数据
    onMounted(() => {
      Object.assign(formData, props.userInfo)
    })

    // 选择并上传头像
    const chooseAvatar = () => {
      uni.chooseImage({
        count: 1,
        sourceType: ['album', 'camera'],
        success: async (res) => {
          const tempFilePath = res.tempFilePaths[0]

          uni.showLoading({ title: '上传中...' })

          try {
            // 调用 API 上传头像
            const result = await userApi.uploadAvatar(tempFilePath)

            // 更新本地头像显示
            formData.avatar = result.url || result.avatar_url

            uni.hideLoading()
            uni.showToast({
              title: '头像已更新',
              icon: 'success'
            })

            // 通知父组件
            emit('avatarChange', formData.avatar)
          } catch (error) {
            uni.hideLoading()
            console.error('头像上传失败:', error)
          }
        }
      })
    }

    // 性别改变
    const onGenderChange = (e) => {
      formData.gender = Number(e.detail.value)
    }

    // 生日改变
    const onBirthdayChange = (e) => {
      formData.birthday = e.detail.value
    }

    // T510-T513: 保存修改 - 调用 API
    const handleSave = async () => {
      // 验证必填项
      if (!formData.nickname) {
        uni.showToast({
          title: '请输入昵称',
          icon: 'none'
        })
        return
      }

      // 防止重复提交
      if (saving.value) return
      saving.value = true

      try {
        // T510: 调用 API 更新个人信息
        await userApi.updateProfile({
          nickname: formData.nickname,
          avatar: formData.avatar,
          gender: formData.gender,
          birthday: formData.birthday
        })

        // T512: 显示成功提示
        uni.showToast({
          title: '资料已更新',
          icon: 'success'
        })

        // T513: 通知父组件刷新数据
        emit('save', { ...formData })
      } catch (error) {
        console.error('更新个人信息失败:', error)
        // T511: 处理昵称验证错误
        const errorMsg = error.message || '更新失败'
        if (errorMsg.includes('昵称') || errorMsg.includes('违规')) {
          uni.showToast({
            title: '昵称包含违规内容',
            icon: 'none'
          })
        } else {
          uni.showToast({
            title: errorMsg,
            icon: 'none'
          })
        }
      } finally {
        saving.value = false
      }
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
      saving,
      genderOptions,
      todayDate,
      chooseAvatar,
      onGenderChange,
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

    &.form-item-gender {
      .form-label {
        align-self: flex-start;
        padding-top: 8rpx;
      }
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

.gender-radio-group {
  flex: 1;
  @include flex();
  justify-content: flex-end;
  gap: $spacing-lg;

  .gender-radio-label {
    @include flex();
    align-items: center;
    gap: $spacing-xs;

    .radio-text {
      font-size: $font-size-sm;
      color: $text-secondary;
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

    &[disabled] {
      opacity: 0.6;
      pointer-events: none;
    }
  }
}
</style>
