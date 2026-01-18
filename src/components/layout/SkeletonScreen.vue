<template>
  <view class="skeleton" :class="{ 'skeleton--animated': animated }">
    <!-- 预设布局类型 -->
    <template v-if="type === 'banner'">
      <view class="skeleton-banner"></view>
    </template>

    <template v-else-if="type === 'hotel-card'">
      <view class="skeleton-hotel-card">
        <view class="skeleton-image skeleton-rect"></view>
        <view class="skeleton-content">
          <view class="skeleton-text skeleton-text--title"></view>
          <view class="skeleton-text skeleton-text--short"></view>
          <view class="skeleton-row">
            <view class="skeleton-text skeleton-text--price"></view>
            <view class="skeleton-text skeleton-text--tag"></view>
          </view>
        </view>
      </view>
    </template>

    <template v-else-if="type === 'product-card'">
      <view class="skeleton-product-card">
        <view class="skeleton-image skeleton-square"></view>
        <view class="skeleton-text skeleton-text--name"></view>
        <view class="skeleton-text skeleton-text--price"></view>
      </view>
    </template>

    <template v-else-if="type === 'list-item'">
      <view class="skeleton-list-item">
        <view class="skeleton-avatar"></view>
        <view class="skeleton-content">
          <view class="skeleton-text skeleton-text--title"></view>
          <view class="skeleton-text skeleton-text--desc"></view>
        </view>
      </view>
    </template>

    <template v-else-if="type === 'coupon'">
      <view class="skeleton-coupon">
        <view class="skeleton-coupon-left">
          <view class="skeleton-circle skeleton-circle--large"></view>
        </view>
        <view class="skeleton-coupon-right">
          <view class="skeleton-text skeleton-text--title"></view>
          <view class="skeleton-text skeleton-text--short"></view>
        </view>
      </view>
    </template>

    <template v-else-if="type === 'text'">
      <view class="skeleton-text-group">
        <view class="skeleton-text skeleton-text--full" v-for="i in lines" :key="i"></view>
      </view>
    </template>

    <template v-else-if="type === 'avatar'">
      <view class="skeleton-avatar" :class="[`skeleton-avatar--${avatarSize}`]"></view>
    </template>

    <template v-else-if="type === 'image'">
      <view class="skeleton-image" :class="[shape === 'circle' ? 'skeleton-circle' : 'skeleton-rect']" :style="imageStyle"></view>
    </template>

    <!-- 自定义插槽 -->
    <template v-else>
      <slot></slot>
    </template>
  </view>
</template>

<script>
/**
 * 骨架屏组件
 * T007: 创建骨架屏基础组件
 */
export default {
  name: 'SkeletonScreen',
  props: {
    // 预设类型
    type: {
      type: String,
      default: 'custom',
      validator: (value) => [
        'custom',
        'banner',
        'hotel-card',
        'product-card',
        'list-item',
        'coupon',
        'text',
        'avatar',
        'image'
      ].includes(value)
    },
    // 是否显示动画
    animated: {
      type: Boolean,
      default: true
    },
    // 文本行数（type='text'时生效）
    lines: {
      type: Number,
      default: 3
    },
    // 头像尺寸
    avatarSize: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    // 图片形状
    shape: {
      type: String,
      default: 'rect',
      validator: (value) => ['rect', 'circle'].includes(value)
    },
    // 自定义图片尺寸
    width: {
      type: String,
      default: ''
    },
    height: {
      type: String,
      default: ''
    }
  },
  computed: {
    imageStyle() {
      const style = {}
      if (this.width) style.width = this.width
      if (this.height) style.height = this.height
      return style
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

$skeleton-bg: #f0f0f0;
$skeleton-highlight: #e0e0e0;

.skeleton {
  &--animated {
    .skeleton-rect,
    .skeleton-square,
    .skeleton-circle,
    .skeleton-text,
    .skeleton-avatar,
    .skeleton-banner,
    .skeleton-image {
      background: linear-gradient(90deg, $skeleton-bg 25%, $skeleton-highlight 50%, $skeleton-bg 75%);
      background-size: 200% 100%;
      animation: skeleton-loading 1.5s infinite;
    }
  }
}

// 基础形状
.skeleton-rect,
.skeleton-banner {
  background-color: $skeleton-bg;
  border-radius: $border-radius-base;
}

.skeleton-square {
  background-color: $skeleton-bg;
  border-radius: $border-radius-base;
  aspect-ratio: 1;
}

.skeleton-circle {
  background-color: $skeleton-bg;
  border-radius: 50%;

  &--large {
    width: 120rpx;
    height: 120rpx;
  }
}

.skeleton-text {
  background-color: $skeleton-bg;
  border-radius: $border-radius-xs;
  height: 32rpx;

  &--title {
    width: 60%;
    height: 36rpx;
    margin-bottom: $spacing-sm;
  }

  &--name {
    width: 80%;
    height: 32rpx;
    margin: $spacing-sm 0;
  }

  &--desc {
    width: 80%;
    height: 28rpx;
  }

  &--short {
    width: 40%;
    height: 28rpx;
  }

  &--full {
    width: 100%;
    margin-bottom: $spacing-sm;

    &:last-child {
      width: 60%;
      margin-bottom: 0;
    }
  }

  &--price {
    width: 80rpx;
    height: 36rpx;
  }

  &--tag {
    width: 60rpx;
    height: 28rpx;
  }
}

.skeleton-avatar {
  background-color: $skeleton-bg;
  border-radius: 50%;

  &--small {
    width: 64rpx;
    height: 64rpx;
  }

  &--medium {
    width: 96rpx;
    height: 96rpx;
  }

  &--large {
    width: 128rpx;
    height: 128rpx;
  }
}

// Banner骨架
.skeleton-banner {
  width: 100%;
  height: 320rpx;
}

// 酒店卡片骨架
.skeleton-hotel-card {
  display: flex;
  padding: $spacing-base;
  background: #fff;
  border-radius: $border-radius-lg;

  .skeleton-image {
    width: 200rpx;
    height: 150rpx;
    flex-shrink: 0;
  }

  .skeleton-content {
    flex: 1;
    margin-left: $spacing-base;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .skeleton-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

// 商品卡片骨架
.skeleton-product-card {
  padding: $spacing-sm;
  background: #fff;
  border-radius: $border-radius-base;

  .skeleton-image {
    width: 100%;
  }
}

// 列表项骨架
.skeleton-list-item {
  display: flex;
  align-items: center;
  padding: $spacing-base;
  background: #fff;

  .skeleton-avatar {
    width: 80rpx;
    height: 80rpx;
    flex-shrink: 0;
  }

  .skeleton-content {
    flex: 1;
    margin-left: $spacing-base;
  }
}

// 优惠券骨架
.skeleton-coupon {
  display: flex;
  align-items: center;
  padding: $spacing-base;
  background: #fff;
  border-radius: $border-radius-lg;

  .skeleton-coupon-left {
    width: 150rpx;
    display: flex;
    justify-content: center;
  }

  .skeleton-coupon-right {
    flex: 1;
    margin-left: $spacing-base;
  }
}

// 文本组骨架
.skeleton-text-group {
  padding: $spacing-base;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
