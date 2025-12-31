<template>
  <view class="my-favorites">
    <!-- 分类标签 -->
    <view class="filter-tabs">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        class="tab-item"
        :class="{ 'tab-item--active': currentTab === tab.value }"
        @click="changeTab(tab.value)"
      >
        <text class="tab-text">{{ tab.label }}</text>
      </view>
    </view>

    <!-- 收藏列表 -->
    <scroll-view class="favorite-list" scroll-y="true" @scrolltolower="loadMore">
      <view v-for="item in favorites" :key="item.id" class="favorite-item" @click="handleItemClick(item)">
        <image :src="item.image" class="item-image" mode="aspectFill" />
        <view class="item-info">
          <text class="item-title">{{ item.title }}</text>
          <text class="item-desc">{{ item.description }}</text>
          <view class="item-footer">
            <text class="item-price">¥{{ item.price }}</text>
            <text class="item-time">{{ formatTime(item.createTime) }}</text>
          </view>
        </view>
        <view class="item-action" @click.stop="handleUnfavorite(item)">
          <Icon name="heartSolid" size="small" color="#d746f0" />
        </view>
      </view>

      <view v-if="loading" class="loading-more">
        <text class="loading-text">加载中...</text>
      </view>

      <view v-if="noMore" class="no-more">
        <text class="no-more-text">没有更多了</text>
      </view>

      <view v-if="!favorites.length && !loading" class="empty-state">
        <Icon name="heart" size="xlarge" color="#ccc" />
        <text class="empty-text">暂无收藏</text>
        <text class="empty-tip">收藏喜欢的酒店和商品,方便下次查看</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { ref } from 'vue'
import Icon from '../common/Icon.vue'

export default {
  name: 'MyFavorites',
  components: { Icon },
  setup() {
    const currentTab = ref('all')
    const tabs = [
      { label: '全部', value: 'all' },
      { label: '酒店', value: 'hotel' },
      { label: '商品', value: 'product' }
    ]

    const favorites = ref([])
    const page = ref(1)
    const loading = ref(false)
    const noMore = ref(false)

    const changeTab = (tab) => {
      currentTab.value = tab
      favorites.value = []
      page.value = 1
      noMore.value = false
      loadFavorites()
    }

    const loadFavorites = () => {
      if (loading.value || noMore.value) return
      loading.value = true

      setTimeout(() => {
        const mockData = []
        const types = currentTab.value === 'all' ? ['hotel', 'product'] : [currentTab.value]

        // 酒店房型数据 - 参照 hotel/detail 页面
        const hotelRooms = [
          { name: '星河璀璨大床房', price: 199, image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/room01.jpg', description: '25m² · 2.0米大床 · 星空投影' },
          { name: '梦幻星空双床房', price: 229, image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/room02.jpg', description: '30m² · 1.5米双床 · 双星空投影' },
          { name: '尊享电竞单人间', price: 299, image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/room03.jpg', description: '20m² · 1.5米单人床 · 顶配主机' },
          { name: '双人开黑电竞房', price: 428, image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/room04.jpg', description: '35m² · 双人电竞位 · 双电竞设备' },
          { name: '浪漫情侣影音套房', price: 358, image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/room05.jpg', description: '40m² · 2.2米圆床 · 私人影院' },
          { name: '豪华家庭套房', price: 498, image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/room06.jpg', description: '55m² · 大床+双床 · 两室一厅' }
        ]

        // 商品数据 - 参照 mall/index 页面
        const products = [
          { name: '杜蕾斯至薄装安全套', price: 89.9, image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good01.jpg', description: '情趣用品 · 热销3200件' },
          { name: 'KY私密润滑剂50ml', price: 129.9, image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good02.jpg', description: '情趣用品 · 热销2800件' },
          { name: '维多利亚蕾丝情趣内衣', price: 299.9, image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good03.jpg', description: '情趣用品 · 新品上市' },
          { name: 'Fairvital德国玛卡胶囊', price: 210.9, image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good04.jpg', description: '营养保健 · 热销1580件' },
          { name: '简禾酒精杀菌消毒湿巾', price: 19.9, image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good05.jpg', description: '清洁护理 · 热销3800件' },
          { name: '伊珞EROCOME震动棒', price: 169.9, image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good06.jpg', description: '情趣用品 · 销量1200件' },
          { name: '五星级酒店毛巾套装', price: 89.9, image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good07.jpg', description: '酒店用品 · 热销1200件' },
          { name: '酒店专用拖鞋', price: 29.9, image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good08.jpg', description: '酒店用品 · 销量800件' },
          { name: '全季禅茶香薰精油', price: 59.9, image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good09.jpg', description: '酒店用品 · 新品上市' },
          { name: '酒店床品四件套', price: 199.9, image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good10.jpg', description: '酒店用品 · 销量420件' },
          { name: '海瑟薇氨基酸洗发水', price: 39.9, image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good11.jpg', description: '清洁护理 · 热销2100件' },
          { name: 'Adidas男士沐浴露', price: 35.9, image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good12.jpg', description: '清洁护理 · 热销1800件' }
        ]

        for (let i = 0; i < 10; i++) {
          const type = types[Math.floor(Math.random() * types.length)]
          
          if (type === 'hotel') {
            const room = hotelRooms[Math.floor(Math.random() * hotelRooms.length)]
            mockData.push({
              id: Date.now() + i,
              type: 'hotel',
              itemId: 100 + i,
              title: room.name,
              image: room.image,
              price: room.price.toFixed(2),
              description: room.description,
              createTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
            })
          } else {
            const product = products[Math.floor(Math.random() * products.length)]
            mockData.push({
              id: Date.now() + i,
              type: 'product',
              itemId: 200 + i,
              title: product.name,
              image: product.image,
              price: product.price.toFixed(2),
              description: product.description,
              createTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
            })
          }
        }

        favorites.value.push(...mockData)
        if (page.value >= 3) noMore.value = true
        loading.value = false
      }, 500)
    }

    const loadMore = () => {
      if (!loading.value && !noMore.value) {
        page.value++
        loadFavorites()
      }
    }

    const formatTime = (time) => {
      const date = new Date(time)
      const now = new Date()
      const diff = now - date
      const days = Math.floor(diff / (24 * 60 * 60 * 1000))

      if (days === 0) return '今天'
      if (days === 1) return '昨天'
      if (days < 7) return `${days}天前`
      return date.toLocaleDateString('zh-CN')
    }

    const handleItemClick = (item) => {
      uni.showToast({
        title: `查看${item.type === 'hotel' ? '酒店' : '商品'}详情`,
        icon: 'none'
      })
    }

    const handleUnfavorite = (item) => {
      uni.showModal({
        title: '取消收藏',
        content: `确定取消收藏"${item.title}"吗?`,
        success: (res) => {
          if (res.confirm) {
            const index = favorites.value.findIndex(f => f.id === item.id)
            if (index > -1) {
              favorites.value.splice(index, 1)
              uni.showToast({ title: '已取消收藏', icon: 'success' })
            }
          }
        }
      })
    }

    loadFavorites()

    return {
      currentTab,
      tabs,
      favorites,
      loading,
      noMore,
      changeTab,
      loadMore,
      formatTime,
      handleItemClick,
      handleUnfavorite
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.my-favorites {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.filter-tabs {
  @include flex-start();
  border-bottom: 2rpx solid #ddd;
  margin-bottom: $spacing-base;
  margin-top: -$spacing-sm;

  .tab-item {
    flex: 1;
    @include flex-center();
    height: 88rpx;
    position: relative;
    transition: all $transition-base;

    .tab-text {
      font-size: 28rpx;
      color: $text-secondary;
      transition: all $transition-base;
    }

    &--active {
      .tab-text {
        font-size: 30rpx;
        font-weight: $font-weight-semibold;
        color: $primary-color;
      }

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60rpx;
        height: 6rpx;
        background: linear-gradient(90deg, $primary-color 0%, #8b5cf6 100%);
        border-radius: 3rpx;
      }
    }
  }
}

.favorite-list {
  flex: 1;

  .favorite-item {
    background: $background-primary;
    border-radius: 20rpx;
    padding: $spacing-base;
    margin-bottom: $spacing-sm;
    @include flex();
    gap: $spacing-base;
    transition: transform $transition-base;

    &:active {
      transform: scale(0.98);
    }

    .item-image {
      width: 180rpx;
      height: 120rpx;
      border-radius: $border-radius-base;
      flex-shrink: 0;
    }

    .item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-width: 0;

      .item-title {
        font-size: $font-size-sm;
        font-weight: $font-weight-semibold;
        color: $text-primary;
        @include ellipsis();
        margin-bottom: 4rpx;
      }

      .item-desc {
        font-size: $font-size-xs;
        color: $text-secondary;
        @include ellipsis();
        margin-bottom: $spacing-xs;
      }

      .item-footer {
        @include flex-between();

        .item-price {
          font-size: $font-size-sm;
          font-weight: $font-weight-semibold;
          color: $error-color;
        }

        .item-time {
          font-size: $font-size-xs;
          color: $text-tertiary;
        }
      }
    }

    .item-action {
      flex-shrink: 0;
      @include flex-center();
      width: 56rpx;
      height: 56rpx;
      border: 1rpx solid rgba($primary-color, 0.25);
      border-radius: $border-radius-full;
      background: rgba($primary-color, 0.1);
    }
  }

  .loading-more,
  .no-more {
    @include flex-center();
    padding: $spacing-base;

    .loading-text,
    .no-more-text {
      font-size: $font-size-xs;
      color: $text-tertiary;
    }
  }

  .empty-state {
    @include flex-center();
    flex-direction: column;
    gap: $spacing-base;
    padding: $spacing-xl * 2 0;

    .empty-text {
      font-size: $font-size-sm;
      color: $text-tertiary;
    }

    .empty-tip {
      font-size: $font-size-xs;
      color: $text-tertiary;
      text-align: center;
      padding: 0 $spacing-xl;
    }
  }
}
</style>
