<template>
  <view class="page">
    <view class="header">
      <text class="title">登录</text>
    </view>
    
    <view class="content">
      <text class="placeholder">用户登录 - 开发中</text>
      <text class="description">手机号登录、验证码登录</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'UserLoginPage'
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.page {
  min-height: 100vh;
  background-color: $background-secondary;
}

.header {
  background-color: $background-primary;
  padding: $spacing-base;
  text-align: center;
}

.title {
  font-size: $font-size-lg;
  font-weight: $font-weight-medium;
  color: $text-primary;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl;
}

.placeholder {
  font-size: $font-size-lg;
  color: $text-primary;
  margin-bottom: $spacing-base;
}

.description {
  font-size: $font-size-base;
  color: $text-secondary;
}
</style>