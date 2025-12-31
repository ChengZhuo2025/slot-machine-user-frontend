<template>
  <view class="custom-tabbar" :class="{ 'custom-tabbar--safe-area': safeArea }">
    <view class="custom-tabbar__content">
      <view
        v-for="(item, index) in tabList"
        :key="item.pagePath"
        class="custom-tabbar__item"
        :class="{ 'custom-tabbar__item--active': current === index }"
        @click="switchTab(item, index)"
      >
        <view class="custom-tabbar__icon-wrapper">
          <Icon
            :name="item.iconName"
            :size="item.pagePath === 'pages/scan/index' ? 'xlarge' : 'medium'"
            :color="getIconColor(item, index)"
            class="custom-tabbar__icon"
            :class="{ 'custom-tabbar__icon--scan': item.pagePath === 'pages/scan/index' }"
          />
          <view 
            v-if="item.badge && item.badge > 0"
            class="custom-tabbar__badge"
          >
            {{ item.badge > 99 ? '99+' : item.badge }}
          </view>
        </view>
        <text 
          class="custom-tabbar__text"
          :class="{ 'custom-tabbar__text--active': current === index }"
        >
          {{ item.text }}
        </text>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import Icon from '@/components/common/Icon.vue'
import { ICON_NAMES } from '@/utils/icons'

export default {
  name: 'CustomTabBar',
  components: {
    Icon
  },
  props: {
    current: {
      type: Number,
      default: 0
    },
    safeArea: {
      type: Boolean,
      default: true
    }
  },
  emits: ['change'],
  setup(props, { emit }) {
    const cartStore = useCartStore()
    
    // 底部导航配置
    const tabList = computed(() => [
      {
        pagePath: 'pages/index/index',
        iconName: ICON_NAMES.HOME,
        text: '首页',
        badge: 0
      },
      {
        pagePath: 'pages/mall/index',
        iconName: ICON_NAMES.SHOPPING_CART,
        text: '优物',
        badge: cartStore.totalCount
      },
      {
        pagePath: 'pages/scan/index',
        iconName: ICON_NAMES.SCAN,
        text: '扫一扫',
        badge: 0
      },
      {
        pagePath: 'pages/distribution/index',
        iconName: ICON_NAMES.WALLET,
        text: '赚钱',
        badge: 0
      },
      {
        pagePath: 'pages/user/index',
        iconName: ICON_NAMES.USER,
        text: '我的',
        badge: 0
      }
    ])
    
    // 获取图标颜色
    const getIconColor = (item, index) => {
      if (item.pagePath === 'pages/scan/index') {
        return '#FFFFFF' // 扫一扫图标为白色
      }
      return props.current === index ? '#d746f0' : '#999999'
    }
    
    // 切换标签
    const switchTab = (item, index) => {
      if (props.current === index) return

      // 添加点击动画效果
      const tabbarItem = document.querySelectorAll('.custom-tabbar__item')[index]
      if (tabbarItem) {
        tabbarItem.style.transform = 'scale(0.9)'
        setTimeout(() => {
          tabbarItem.style.transform = 'scale(1)'
        }, 150)
      }

      // 发送切换事件
      emit('change', {
        index,
        pagePath: item.pagePath,
        text: item.text
      })

      // 执行页面跳转
      // 扫码页面不是tabBar页面,使用navigateTo
      if (item.pagePath === 'pages/scan/index') {
        uni.navigateTo({
          url: `/${item.pagePath}`,
          fail: (err) => {
            console.error('跳转扫码页失败:', err)
          }
        })
      } else {
        uni.switchTab({
          url: `/${item.pagePath}`,
          fail: (err) => {
            console.error('切换标签页失败:', err)
          }
        })
      }
    }
    
    return {
      tabList,
      getIconColor,
      switchTab
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.custom-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: $z-index-fixed;
  background-color: $background-primary;
  border-top: 1rpx solid $border-light;
  @include shadow(base);

  &::before {
    content: '';
    position: absolute;
    z-index: 0;
    top: -26rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 114rpx;
    height: 114rpx;
    border-radius: 50%;
    background: $background-primary;
  }
  
  &--safe-area {
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  &__content {
    display: flex;
    height: 120rpx;
    align-items: center;
  }
  
  &__item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $spacing-xs 0;
    position: relative;
    @include transition(transform);
    
    &:active {
      transform: scale(0.95);
    }
  }
  
  &__icon-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 6rpx;
    
    .custom-tabbar__item:nth-child(3) & {
      margin-bottom: 0;
    }
  }
  
  &__icon {
    @include transition(color);
    
    &--scan {
      background: $gradient-primary;
      border-radius: 50%;
      padding: 16rpx;
      color: white !important;
      @include shadow(base);
      transform: translateY(-20rpx);
    }
  }
  
  &__badge {
    position: absolute;
    top: -8rpx;
    right: -12rpx;
    min-width: 32rpx;
    height: 32rpx;
    background-color: $error-color;
    color: white;
    font-size: 20rpx;
    line-height: 32rpx;
    text-align: center;
    border-radius: 16rpx;
    padding: 0 8rpx;
    @include shadow(sm);
    z-index: 1;
  }
  
  &__text {
    font-size: $font-size-xs;
    color: $text-tertiary;
    font-weight: $font-weight-medium;
    @include transition(color);
    
    &--active {
      color: $primary-color;
      font-weight: $font-weight-semibold;
    }
  }
  
  // 为扫一扫按钮特殊样式
  &__item:nth-child(3) {
    .custom-tabbar__text {
      margin-top: -14rpx;
    }
  }
}

// 页面内容底部边距，避免被导航栏遮挡
.page-content {
  padding-bottom: 120rpx;
  
  .custom-tabbar--safe-area + & {
    padding-bottom: calc(120rpx + constant(safe-area-inset-bottom));
    padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
  }
}

// 动画效果
.custom-tabbar__item {
  animation-duration: 0.3s;
  animation-fill-mode: both;
}

.tabbar-item-enter {
  animation-name: tabbarItemFadeInUp;
}

@keyframes tabbarItemFadeInUp {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 扫一扫按钮特殊动画
.custom-tabbar__icon--scan {
  animation: scanPulse 2s infinite;
}

@keyframes scanPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4);
  }
  70% {
    box-shadow: 0 0 0 20rpx rgba(139, 92, 246, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(139, 92, 246, 0);
  }
}
</style>