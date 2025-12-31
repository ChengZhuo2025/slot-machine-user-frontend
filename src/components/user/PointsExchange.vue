<template>
  <view class="points-exchange">
    <view class="points-info">
      <view class="info-left">
        <Icon name="points" size="medium" color="#fff" />
        <text class="info-label">当前积分</text>
      </view>
      <text class="info-value">{{ points }}</text>
    </view>

    <view class="product-grid">
      <view v-for="product in products" :key="product.id" class="product-item">
        <image :src="product.image" class="product-image" mode="aspectFill" />
        <view class="product-info">
          <text class="product-name">{{ product.name }}</text>
          <view class="product-footer">
            <text class="product-points">{{ product.points }}积分</text>
            <view v-if="product.stock > 0" class="product-stock">库存{{ product.stock }}</view>
            <view v-else class="product-stock product-stock--empty">已售罄</view>
          </view>
          <button class="btn-exchange" @click="handleExchange(product)">
            <text class="btn-text">立即兑换</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, onMounted } from 'vue'
import Icon from '../common/Icon.vue'

export default {
  name: 'PointsExchange',
  components: {
    Icon
  },
  props: {
    points: {
      type: [Number, String],
      default: 0
    }
  },
  emits: ['exchange'],
  setup(props, { emit }) {
    const products = ref([])

    const loadProducts = () => {
      // 使用商城页面的商品数据，转换为积分兑换商品
      const mockProducts = [
        {
          id: 1,
          name: '杜蕾斯至薄装安全套',
          image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good01.jpg',
          points: 1000,
          stock: 50
        },
        {
          id: 2,
          name: 'KY私密润滑剂50ml',
          image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good02.jpg',
          points: 1500,
          stock: 30
        },
        {
          id: 3,
          name: '五星级酒店毛巾套装',
          image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good07.jpg',
          points: 800,
          stock: 80
        },
        {
          id: 4,
          name: '酒店专用拖鞋',
          image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good08.jpg',
          points: 300,
          stock: 100
        },
        {
          id: 5,
          name: '海瑟薇氨基酸洗发水',
          image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good11.jpg',
          points: 500,
          stock: 60
        },
        {
          id: 6,
          name: 'Adidas男士沐浴露',
          image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good12.jpg',
          points: 450,
          stock: 70
        },
        {
          id: 7,
          name: '专用小苏打洁牙三套装',
          image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good13.jpg',
          points: 250,
          stock: 90
        },
        {
          id: 8,
          name: '洁尔阴男士抑菌清洗液',
          image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good14.jpg',
          points: 900,
          stock: 40
        },
        {
          id: 9,
          name: '维多利亚蕾丝情趣内衣',
          image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good03.jpg',
          points: 3000,
          stock: 20
        },
        {
          id: 10,
          name: '全季禅茶香薰精油',
          image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good09.jpg',
          points: 600,
          stock: 55
        },
        {
          id: 11,
          name: '酒店床品四件套',
          image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good10.jpg',
          points: 2000,
          stock: 25
        },
        {
          id: 12,
          name: 'Satisfyer情趣震动棒',
          image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good04.jpg',
          points: 3500,
          stock: 0
        }
      ]
      products.value = mockProducts
    }

    const handleExchange = (product) => {
      if (product.stock <= 0) {
        uni.showToast({ title: '商品已售罄', icon: 'none' })
        return
      }

      if (parseInt(props.points) < product.points) {
        uni.showToast({ title: '积分不足', icon: 'none' })
        return
      }

      uni.showModal({
        title: '确认兑换',
        content: `确认使用${product.points}积分兑换${product.name}吗?`,
        success: (res) => {
          if (res.confirm) {
            uni.showToast({ title: '兑换成功', icon: 'success' })
            emit('exchange', product)
          }
        }
      })
    }

    onMounted(() => {
      loadProducts()
    })

    return { products, handleExchange }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.points-exchange {
  padding-bottom: $spacing-xl;
}

.points-info {
  background: $gradient-primary;
  border-radius: 20rpx;
  padding: $spacing-base;
  @include flex-between();
  align-items: center;
  margin-bottom: $spacing-lg;

  .info-left {
    @include flex();
    align-items: center;
    gap: $spacing-sm;
  }

  .info-label {
    font-size: $font-size-sm;
    color: rgba(255, 255, 255, 0.9);
  }

  .info-value {
    font-size: 56rpx;
    font-weight: $font-weight-semibold;
    color: #fff;
  }
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-base;

  .product-item {
    background: $background-primary;
    border-radius: 20rpx;
    overflow: hidden;

    .product-image {
      display: flex;
      width: 100%;
      height: 280rpx;
    }

    .product-info {
      padding: $spacing-base;
      display: flex;
      flex-direction: column;
      gap: $spacing-sm;

      .product-name {
        font-size: $font-size-sm;
        font-weight: $font-weight-semibold;
        color: $text-primary;
        @include ellipsis();
      }

      .product-footer {
        @include flex-between();
        align-items: center;

        .product-points {
          font-size: $font-size-base;
          font-weight: $font-weight-semibold;
          color: $primary-color;
        }

        .product-stock {
          font-size: $font-size-xs;
          color: $text-tertiary;

          &--empty {
            color: $error-color;
          }
        }
      }

      .btn-exchange {
        width: 100%;
        height: 56rpx;
        background: $gradient-primary;
        border-radius: $border-radius-base;
        @include flex-center();
        border: none;
        transition: all $transition-base;

        &:active {
          opacity: 0.8;
          transform: scale(0.98);
        }

        &::after {
          border: none;
        }

        .btn-text {
          font-size: $font-size-xs;
          color: #fff;
          font-weight: $font-weight-semibold;
        }
      }
    }
  }
}
</style>
