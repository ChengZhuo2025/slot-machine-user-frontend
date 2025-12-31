<template>
  <view class="page">
    <view class="page-bgimg"></view>
    <!-- 标题栏 -->
    <view class="header-bar">
      <view class="header-left" @click="goBack">
        <Icon name="arrow-left" size="medium" color="#333" />
      </view>
      <view class="header-center">
        <text class="header-title">酒店列表</text>
      </view>
      <view class="header-right" @click="scanCode">
        <Icon name="scan" size="medium" color="#333" />
      </view>
    </view>

    <!-- 搜索模块 -->
    <view class="search-section">
      <view class="search-bar">
        <Icon name="search" size="small" color="#999" />
        <input 
          class="search-input" 
          type="text" 
          placeholder="搜索酒店名称、地址"
          v-model="searchKeyword"
          @input="onSearchInput"
          @confirm="onSearchConfirm"
        />
      </view>
      
      <!-- 历史搜索 -->
      <view v-if="showSearchHistory && searchHistory.length > 0" class="search-history">
        <view class="history-header">
          <text class="history-title">历史搜索</text>
          <text class="clear-history" @click="clearSearchHistory">清空</text>
        </view>
        <view class="history-tags">
          <text 
            v-for="(item, index) in searchHistory" 
            :key="index"
            class="history-tag"
            @click="selectSearchHistory(item)"
          >
            {{ item }}
          </text>
        </view>
      </view>
      
      <!-- 热门搜索 -->
      <view v-if="showSearchHistory" class="hot-search">
        <view class="hot-header">
          <text class="hot-title">热门搜索</text>
        </view>
        <view class="hot-tags">
          <text 
            v-for="(item, index) in hotSearchKeywords" 
            :key="index"
            class="hot-tag"
            @click="selectHotSearch(item)"
          >
            {{ item }}
          </text>
        </view>
      </view>
    </view>

    <!-- 筛选排序栏 -->
    <view class="filter-container">
      <view class="filter-bar">
        <view class="filter-section">
          <view class="filter-type-btn" @click="toggleTypeFilter">
            <text class="filter-type-text">{{ hotelTypes[selectedTypeIndex].name }}</text>
            <Icon 
              name="chevron-down" 
              size="small" 
              color="#333" 
              :style="{ transform: showTypeFilter ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }"
            />
          </view>
        </view>
        
        <view class="sort-options">
          <view 
            class="sort-option" 
            :class="{ active: selectedSortIndex === 0 }"
            @click="selectSort(0)"
          >
            <text class="sort-option-text">距离最近</text>
          </view>
          <view 
            class="sort-option" 
            :class="{ active: selectedSortIndex === 1 }"
            @click="selectSort(1)"
          >
            <text class="sort-option-text">好评优先</text>
          </view>
          <view 
            class="sort-option" 
            :class="{ active: selectedSortIndex === 2 }"
            @click="selectSort(2)"
          >
            <text class="sort-option-text">价格优先</text>
          </view>
          <view 
            class="sort-option" 
            :class="{ active: selectedSortIndex === 3 }"
            @click="selectSort(3)"
          >
            <text class="sort-option-text">销量优先</text>
          </view>
        </view>
      </view>

      <!-- 酒店类型筛选手风琴 -->
      <view class="accordion-panel" :class="{ expanded: showTypeFilter }">
        <view class="accordion-content">
          <view 
            v-for="(item, index) in hotelTypes" 
            :key="index"
            class="accordion-item"
            :class="{ active: selectedTypeIndex === index }"
            @click="selectHotelType(index)"
          >
            <text class="accordion-item-text">{{ item.name }}</text>
            <Icon v-if="selectedTypeIndex === index" name="check" size="small" color="#d746f0" />
          </view>
        </view>
      </view>
    </view>

    <!-- 排序菜单 -->
    <view v-if="showSortMenu" class="sort-menu-overlay" @click="hideSortMenu">
      <view class="sort-menu" @click.stop>
        <view 
          v-for="(item, index) in sortOptions" 
          :key="index"
          class="sort-option"
          :class="{ active: selectedSortIndex === index }"
          @click="selectSort(index)"
        >
          <text class="sort-option-text">{{ item.name }}</text>
          <Icon v-if="selectedSortIndex === index" name="check" size="small" color="#d746f0" />
        </view>
      </view>
    </view>

    <!-- 酒店列表 -->
    <scroll-view 
      class="hotel-list-scroll"
      scroll-y="true"
      :refresher-enabled="true"
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
      <view class="hotel-list">
        <view 
          v-for="(hotel, index) in filteredHotels" 
          :key="hotel.id"
          class="hotel-card animate__animated animate__fadeInUp"
          :style="{ animationDelay: (index % 10) * 100 + 'ms' }"
          @click="goToHotelDetail(hotel)"
          @longpress="toggleFavorite(hotel)"
        >
          <view class="hotel-main-content">
            <!-- 酒店封面图 -->
            <image class="hotel-image" :src="hotel.coverImage" mode="aspectFill" />
            
            <!-- 酒店信息 -->
            <view class="hotel-content">
              <view class="hotel-header">
                <view class="hotel-title-row">
                  <text class="hotel-name">{{ hotel.name }}</text>
                  <view class="hotel-stars">
                    <Icon 
                      v-for="n in 5" 
                      :key="n"
                      :name="n <= hotel.stars ? 'starSolid' : 'star'" 
                      size="small" 
                      :color="n <= hotel.stars ? '#FFD700' : '#C0C0C0'" 
                    />
                    <text class="rating-text">{{ hotel.rating }}</text>
                  </view>
                </view>
              </view>
              
              <view class="hotel-info">
                <text class="hotel-address">{{ hotel.address }}</text>
                <view class="hotel-distance-info">
                  <Icon name="location" size="small" color="#be32d7" />
                  <text class="hotel-distance">{{ hotel.distance }}km</text>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 酒店底部操作栏 -->
          <view class="hotel-bottom-bar">
            <view class="hotel-bottom-left">
              <view class="hotel-price">
                <text class="price-symbol">¥</text>
                <text class="price-range">{{ hotel.priceRange.min }}-{{ hotel.priceRange.max }}</text>
              </view>
            
              <view class="remaining-info">
                <text class="remaining-text">剩余{{ hotel.remaining }}间</text>
              </view>
            </view>

            <view class="hotel-bottom-right">            
              <view :class="hotel.isFavorite ? 'favorite-btn-active' : 'favorite-btn'" @click.stop="toggleFavorite(hotel)">
                <Icon 
                  :name="hotel.isFavorite ? 'heartSolid' : 'heart'" 
                  size="small" 
                  :color="hotel.isFavorite ? '#fff' : '#999'" 
                />
              </view>
              
              <view class="nav-btn" @click.stop="navigateToHotel(hotel)">
                <Icon name="send" size="small" color="#fff" />
                <text class="nav-text">去这里</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 加载更多 -->
        <view v-if="isLoadingMore" class="loading-more">
          <text class="loading-text">加载中...</text>
        </view>
        
        <!-- 没有更多数据 - 显示触底提示 -->
        <view v-if="filteredHotels.length > 0" class="no-more">
          <view class="no-more-line"></view>
          <text class="no-more-text">{{ hasMore ? '上拉加载更多' : '没有更多酒店了' }}</text>
          <view class="no-more-line"></view>
        </view>
        
        <!-- 空状态 -->
        <view v-if="filteredHotels.length === 0 && !isLoading" class="empty-state">
          <Icon name="building" size="large" color="#ccc" />
          <text class="empty-text">{{ searchKeyword ? '没有找到相关酒店' : '暂无酒店数据' }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import Icon from '@/components/common/Icon.vue'

export default {
  name: 'HotelListPage',
  components: {
    Icon
  },
  setup() {
    
    // 页面状态
    const isLoading = ref(false)
    const isRefreshing = ref(false)
    const isLoadingMore = ref(false)
    const hasMore = ref(false) // 改为false，因为是静态数据，没有更多数据加载
    const currentPage = ref(1)
    const pageSize = 10
    
    // 搜索相关
    const searchKeyword = ref('')
    const showSearchHistory = ref(false)
    const searchHistory = ref(['城市猎手', '电竞酒店', '主题酒店'])
    const hotSearchKeywords = ref(['附近酒店', '电竞酒店', '私享酒店', '情趣主题', '钟点房'])
    
    // 筛选排序
    const selectedTypeIndex = ref(0)
    const selectedSortIndex = ref(0)
    const showSortMenu = ref(false)
    const showTypeFilter = ref(false)
    
    // 酒店类型
    const hotelTypes = ref([
      { key: 'all', name: '全部' },
      { key: 'gaming', name: '电竞酒店' },
      { key: 'theme', name: '主题酒店' },
      { key: 'private', name: '私享酒店' },
      { key: 'luxury', name: '尊住酒店' }
    ])
    
    // 排序选项
    const sortOptions = ref([
      { key: 'distance', name: '距离最近' },
      { key: 'rating', name: '好评优先' },
      { key: 'price_asc', name: '价格优先' },
      { key: 'sales', name: '销量优先' }
    ])
    
    // 当前排序
    const currentSort = computed(() => sortOptions.value[selectedSortIndex.value])
    
    // 酒店数据 - 使用首页的数据结构
    const allHotels = ref([
      {
        id: 1,
        name: "城市猎手电竞酒店",
        address: "北京市朝阳区望京SOHO-T1-2301",
        distance: 1.2,
        priceRange: { min: 199, max: 399 },
        remaining: 8,
        type: 'gaming',
        rating: 4.8,
        stars: 4,
        sales: 2680,
        isFavorite: false,
        coverImage: "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel01.jpg",
      },
      {
        id: 2,
        name: "王者荣耀电竞主题",
        address: "北京市海淀区中关村大街32号",
        distance: 2.5,
        priceRange: { min: 259, max: 459 },
        remaining: 6,
        type: 'gaming',
        rating: 4.7,
        stars: 4,
        sales: 1890,
        isFavorite: true,
        coverImage: "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel02.jpg",
      },
      {
        id: 3,
        name: "浪漫主题情侣酒店",
        address: "北京市东城区王府井大街138号",
        distance: 3.8,
        priceRange: { min: 299, max: 599 },
        remaining: 4,
        type: 'theme',
        rating: 4.9,
        stars: 5,
        sales: 3200,
        isFavorite: false,
        coverImage: "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel03.jpg",
      },
      {
        id: 4,
        name: "私享VIP精品酒店",
        address: "北京市西城区金融街B9号",
        distance: 4.2,
        priceRange: { min: 399, max: 899 },
        remaining: 2,
        type: 'private',
        rating: 4.9,
        stars: 5,
        sales: 1560,
        isFavorite: false,
        coverImage: "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel04.jpg",
      },
      {
        id: 5,
        name: "尊住商务度假酒店",
        address: "北京市丰台区丽泽金融商务区",
        distance: 6.8,
        priceRange: { min: 599, max: 1299 },
        remaining: 12,
        type: 'luxury',
        rating: 5.0,
        stars: 5,
        sales: 890,
        isFavorite: false,
        coverImage: "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel05.jpg",
      }
    ])
    
    // 筛选后的酒店列表
    const filteredHotels = computed(() => {
      let result = [...allHotels.value]
      
      // 类型筛选
      if (selectedTypeIndex.value > 0) {
        const selectedType = hotelTypes.value[selectedTypeIndex.value].key
        result = result.filter(hotel => hotel.type === selectedType)
      }
      
      // 关键词搜索
      if (searchKeyword.value.trim()) {
        const keyword = searchKeyword.value.trim().toLowerCase()
        result = result.filter(hotel => 
          hotel.name.toLowerCase().includes(keyword) || 
          hotel.address.toLowerCase().includes(keyword)
        )
      }
      
      // 排序
      const sortKey = sortOptions.value[selectedSortIndex.value].key
      result.sort((a, b) => {
        switch (sortKey) {
          case 'distance':
            return a.distance - b.distance
          case 'rating':
            return b.rating - a.rating
          case 'sales':
            return b.sales - a.sales
          case 'price_asc':
            return a.priceRange.min - b.priceRange.min
          case 'price_desc':
            return b.priceRange.max - a.priceRange.max
          default:
            return 0
        }
      })
      
      return result
    })
    
    // 方法定义
    const goBack = () => {
      uni.navigateBack()
    }
    
    const scanCode = () => {
      uni.scanCode({
        success: (res) => {
          console.log('扫码结果:', res)
          uni.showToast({ title: '扫码功能开发中', icon: 'none' })
        },
        fail: () => {
          uni.showToast({ title: '扫码失败', icon: 'none' })
        }
      })
    }
    
    const onSearchInput = () => {
      showSearchHistory.value = searchKeyword.value.length === 0
    }
    
    const onSearchConfirm = () => {
      if (searchKeyword.value.trim()) {
        addToSearchHistory(searchKeyword.value.trim())
        showSearchHistory.value = false
      }
    }
    
    const addToSearchHistory = (keyword) => {
      const history = [...searchHistory.value]
      const index = history.indexOf(keyword)
      if (index > -1) {
        history.splice(index, 1)
      }
      history.unshift(keyword)
      searchHistory.value = history.slice(0, 10)
      
      // 保存到本地存储
      uni.setStorageSync('hotel_search_history', searchHistory.value)
    }
    
    const selectSearchHistory = (keyword) => {
      searchKeyword.value = keyword
      showSearchHistory.value = false
    }
    
    const selectHotSearch = (keyword) => {
      searchKeyword.value = keyword
      showSearchHistory.value = false
      addToSearchHistory(keyword)
    }
    
    const clearSearchHistory = () => {
      searchHistory.value = []
      uni.removeStorageSync('hotel_search_history')
    }
    
    const selectHotelType = (index) => {
      selectedTypeIndex.value = index
      showTypeFilter.value = false
    }
    
    const toggleTypeFilter = () => {
      showTypeFilter.value = !showTypeFilter.value
    }
    
    const toggleSortMenu = () => {
      showSortMenu.value = !showSortMenu.value
    }
    
    const hideSortMenu = () => {
      showSortMenu.value = false
    }
    
    const selectSort = (index) => {
      selectedSortIndex.value = index
      showSortMenu.value = false
    }
    
    const onRefresh = () => {
      isRefreshing.value = true
      // 模拟刷新数据
      setTimeout(() => {
        isRefreshing.value = false
        uni.showToast({ title: '刷新成功', icon: 'success' })
      }, 1000)
    }
    
    const onLoadMore = () => {
      // 由于使用静态数据，没有更多数据可加载
      if (isLoadingMore.value || !hasMore.value) return
      
      // 可以在这里实现真实的加载更多逻辑
      console.log('触发加载更多，但当前为静态数据')
    }
    
    const goToHotelDetail = (hotel) => {
      uni.navigateTo({
        url: `/pages/hotel/detail?id=${hotel.id}`
      })
    }
    
    const toggleFavorite = (hotel) => {
      hotel.isFavorite = !hotel.isFavorite
      const message = hotel.isFavorite ? '已添加到收藏' : '已取消收藏'
      uni.showToast({ title: message, icon: 'success' })
    }
    
    const navigateToHotel = (hotel) => {
      // 调用地图导航
      uni.openLocation({
        latitude: 39.9042,
        longitude: 116.4074,
        name: hotel.name,
        address: hotel.address,
        success: () => {
          console.log('导航成功')
        },
        fail: () => {
          uni.showToast({ title: '导航失败', icon: 'none' })
        }
      })
    }
    
    // 初始化
    onMounted(() => {
      // 加载搜索历史
      const history = uni.getStorageSync('hotel_search_history')
      if (history && Array.isArray(history)) {
        searchHistory.value = history
      }
    })
    
    return {
      // 状态
      isLoading,
      isRefreshing,
      isLoadingMore,
      hasMore,
      searchKeyword,
      showSearchHistory,
      searchHistory,
      hotSearchKeywords,
      selectedTypeIndex,
      selectedSortIndex,
      showSortMenu,
      showTypeFilter,
      hotelTypes,
      sortOptions,
      currentSort,
      filteredHotels,
      
      // 方法
      goBack,
      scanCode,
      onSearchInput,
      onSearchConfirm,
      selectSearchHistory,
      selectHotSearch,
      clearSearchHistory,
      selectHotelType,
      toggleTypeFilter,
      toggleSortMenu,
      hideSortMenu,
      selectSort,
      onRefresh,
      onLoadMore,
      goToHotelDetail,
      toggleFavorite,
      navigateToHotel
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.page {
  min-height: 100vh;
  background-color: $background-secondary;
  padding-bottom: 20rpx;
  display: flex;
  flex-direction: column;
}

.page-bgimg {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 0;
  width: 100vw;
  height: 100vh;
  background-image: url(../../static/images/bg2.jpg);
  background-size: cover;
  background-attachment: fixed;
  background-position: center center;
  background-repeat: no-repeat;
}

// 标题栏
.header-bar {
  @include flex-between();
  @include shadow(base);
  align-items: center;
  background-color: $background-primary;
  padding: $spacing-sm $spacing-lg;
  border-bottom: 2rpx solid $border-light;
  position: fixed;
  width: 100vw;
  top: 0;
  z-index: 100;
  
  .header-left,
  .header-right {
    width: 54rpx;
    height: 54rpx;
    @include flex-center();
  }
  
  .header-center {
    flex: 1;
    text-align: center;
    
    .header-title {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: $text-primary;
    }
  }
}

// 搜索区域
.search-section {
  position: relative;
  z-index: 10;
  padding: $spacing-base $spacing-lg;
  margin-top: 80rpx;
  
  .search-bar {
    @include flex();
    align-items: center;
    background-color: $background-primary;
    border-radius: 48rpx;
    padding: $spacing-sm $spacing-base;
    gap: $spacing-sm;
    
    .search-input {
      flex: 1;
      font-size: $font-size-base;
      color: $text-primary;
      
      &::placeholder {
        color: $text-placeholder;
      }
    }
  }
  
  // 历史搜索
  .search-history {
    margin-top: $spacing-base;
    
    .history-header {
      @include flex-between();
      align-items: center;
      margin-bottom: $spacing-sm;
      
      .history-title {
        font-size: $font-size-sm;
        color: $text-secondary;
        font-weight: $font-weight-medium;
      }
      
      .clear-history {
        font-size: $font-size-sm;
        color: $primary-color;
      }
    }
    
    .history-tags {
      @include flex();
      flex-wrap: wrap;
      gap: $spacing-sm;
      
      .history-tag {
        padding: $spacing-xs $spacing-base;
        background-color: $background-tertiary;
        border-radius: $border-radius-base;
        font-size: $font-size-sm;
        color: $text-secondary;
      }
    }
  }
  
  // 热门搜索
  .hot-search {
    margin-top: $spacing-base;
    
    .hot-header {
      margin-bottom: $spacing-sm;
      
      .hot-title {
        font-size: $font-size-sm;
        color: $text-secondary;
        font-weight: $font-weight-medium;
      }
    }
    
    .hot-tags {
      @include flex();
      flex-wrap: wrap;
      gap: $spacing-sm;
      
      .hot-tag {
        padding: $spacing-xs $spacing-base;
        background: linear-gradient(45deg, $primary-light, $primary-color);
        color: #fff;
        border-radius: $border-radius-base;
        font-size: $font-size-sm;
      }
    }
  }
}

// 筛选排序栏容器
.filter-container {
  position: relative;
  z-index: 10;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.15);
}

// 筛选排序栏
.filter-bar {
  padding: $spacing-sm $spacing-lg $spacing-lg;
  @include flex-between();
  align-items: center;
  
  .filter-section {
    margin-right: $spacing-base;

    .filter-type-btn {
      @include flex();
      align-items: center;
      gap: $spacing-xs;
      transition: all 0.3s ease;

      &:active {
        background-color: $background-tertiary;
      }
      
      .filter-type-text {
        font-size: $font-size-sm;
        color: $text-primary;
        font-weight: $font-weight-medium;
      }
    }
  }
  
  .sort-options {
    flex: 1;
    @include flex-between();
    
    .sort-option {
      @include flex-center();
      transition: all 0.2s ease;
      
      &.active {        
        .sort-option-text {
          color: $primary-dark;
          font-weight: $font-weight-semibold;
        }
      }
      
      .sort-option-text {
        font-size: $font-size-sm;
        font-weight: $font-weight-medium;
        color: $text-secondary;
        white-space: nowrap;
      }
    }
  }
}

// 手风琴面板
.accordion-panel {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
  background: rgba(255, 255, 255, 0.65);
  
  &.expanded {
    max-height: 500rpx;
    border-bottom: 1rpx solid $border-light;
  }
  
  .accordion-content {
    padding-bottom: $spacing-sm;

    .accordion-item {
      @include flex-between();
      align-items: center;
      padding: $spacing-sm $spacing-lg;
      transition: all 0.2s ease;
      
      &:active {
        background-color: $background-primary;
      }
      
      &.active {
        background-color: rgba($primary-dark, 0.15);
        
        .accordion-item-text {
          color: $primary-color;
          font-weight: $font-weight-semibold;
        }
      }
      
      .accordion-item-text {
        font-size: $font-size-sm;
        font-weight: $font-weight-medium;
        color: $text-primary;
      }
    }
  }
}


// 排序菜单
.sort-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  @include flex-center();
  
  .sort-menu {
    background-color: $background-primary;
    border-radius: $border-radius-lg;
    margin: $spacing-xl;
    overflow: hidden;
    min-width: 300rpx;
    
    .sort-option {
      @include flex-between();
      align-items: center;
      padding: $spacing-base $spacing-lg;
      border-bottom: 2rpx solid $border-light;
      transition: all 0.2s ease;
      
      &:last-child {
        border-bottom: none;
      }
      
      &:active {
        background-color: $background-secondary;
      }
      
      &.active {
        background-color: rgba($primary-color, 0.1);
        
        .sort-option-text {
          color: $primary-color;
          font-weight: $font-weight-medium;
        }
      }
      
      .sort-option-text {
        font-size: $font-size-base;
        color: $text-primary;
      }
    }
  }
}

// 酒店列表
.hotel-list-scroll {
  flex: 1;
  
  .hotel-list {
    padding: $spacing-lg;
    @include flex();
    flex-direction: column;
    gap: $spacing-lg;
    
    // 复用首页room-card样式，适配酒店数据
    .hotel-card {
      @include card();
      position: relative;
      overflow: hidden;
      padding: 0;
      @include flex();
      flex-direction: column;
      transition: all 0.2s ease;
      
      &:active {
        transform: scale(0.98);
        opacity: 0.8;
      }
      
      .hotel-main-content {
        @include flex();
        gap: $spacing-base;
        padding: $spacing-base;
        
        .hotel-image {
          flex: 1;
          width: 240rpx; // 120x90px 按2倍比例
          height: 180rpx;
          flex-shrink: 0;
          border-radius: $border-radius-base;
          background-color: $background-tertiary;
        }
        
        .hotel-content {
          flex: 2;
          @include flex();
          flex-direction: column;
          justify-content: space-between;
          
          .hotel-header {
            margin-bottom: $spacing-xs;
            
            .hotel-title-row {
              .hotel-name {
                display: block;
                font-size: $font-size-lg;
                font-weight: $font-weight-semibold;
                color: $text-primary;
                line-height: 1.4;
                @include ellipsis();
              }
              
              .hotel-stars {
                @include flex();
                align-items: center;
                gap: 2rpx;

                .rating-text {
                  font-size: 26rpx;
                  color: $warning-color;
                  font-weight: $font-weight-medium;
                  margin-left: $spacing-xs;
                }
              }
            }
          }
          
          .hotel-info {
            .hotel-address {
              display: block;
              font-size: $font-size-sm;
              color: $text-secondary;
              @include ellipsis();
              margin-bottom: $spacing-xs;
            }
            
            .hotel-distance-info {
              @include flex();
              align-items: center;
              gap: $spacing-xs;
              
              .hotel-distance {
                font-size: $font-size-sm;
                color: $primary-dark;
                font-weight: $font-weight-medium;
              }
            }
          }
        }
      }
      
      .hotel-bottom-bar {
        @include flex-between();
        align-items: center;
        padding: $spacing-sm $spacing-base $spacing-base;
        border-top: 2rpx solid $border-light;
        background-color: rgba($background-secondary, 0.65);

        .hotel-bottom-right,
        .hotel-bottom-left {
          @include flex-center();
          gap: $spacing-sm;
        }
        
        .hotel-price {
          @include flex();
          align-items: baseline;
          
          .price-symbol {
            font-size: $font-size-sm;
            color: $error-color;
            font-weight: $font-weight-medium;
          }
          
          .price-range {
            font-size: $font-size-lg;
            color: $error-color;
            font-weight: $font-weight-semibold;
            margin-left: 2rpx;
          }
        }
        
        .remaining-info {
          .remaining-text {
            font-size: $font-size-xs;
            color: $success-color;
            font-weight: $font-weight-semibold;
            background-color: rgba($success-color, 0.1);
            padding: $spacing-xs $spacing-base;
            border-radius: $border-radius-2xl;
            white-space: nowrap;
          }
        }
        
        .favorite-btn {
          width: 60rpx;
          height: 60rpx;
          @include flex-center();
          border-radius: 50%;
          background-color: rgba($text-tertiary, 0.1);
          border: 1rpx solid rgba($text-tertiary, 0.3);
          transition: all 0.2s ease;
          
          &:active {
            background-color: rgba($primary-color, 0.1);
            transform: scale(1.1);
          }
        }

        .favorite-btn-active {
          width: 60rpx;
          height: 60rpx;
          @include flex-center();
          border-radius: 50%;
          background: $primary-color;
          border: 1rpx solid $primary-color;
          transition: all 0.2s ease;
          
          &:active {
            background-color: rgba($primary-color, 0.1);
            transform: scale(1.1);
          }
        }
        
        .nav-btn {
          @include flex-center();
          gap: $spacing-xs;
          height: 62rpx;
          padding: 0 $spacing-lg 0 $spacing-base;
          background: $gradient-primary;
          border-radius: 30rpx;
          transition: all 0.2s ease;
          min-width: 120rpx;
          @include flex-center();
          
          &:active {
            transform: scale(0.95);
            opacity: 0.8;
          }
          
          .nav-text {
            @include flex();
            font-size: $font-size-sm;
            color: #fff;
            font-weight: $font-weight-semibold;
            white-space: nowrap;
          }
        }
      }
    }
    
    // 加载状态
    .loading-more {
      text-align: center;
      padding: $spacing-lg;
      margin-top: $spacing-sm;
      
      .loading-text {
        font-size: $font-size-sm;
        color: $text-tertiary;
      }
    }
    
    // 触底提示 - 带左右分割线
    .no-more {
      @include flex-center();
      align-items: center;
      padding: $spacing-sm;
      margin-top: $spacing-sm;
      gap: $spacing-base;
      
      .no-more-line {
        flex: 1;
        height: 2rpx;
        background-color: $border-color;
      }
      
      .no-more-text {
        font-size: $font-size-sm;
        color: $text-tertiary;
        white-space: nowrap;
      }
    }
    
    // 空状态
    .empty-state {
      @include flex-center();
      flex-direction: column;
      padding: $spacing-2xl;
      gap: $spacing-base;
      
      .empty-text {
        font-size: $font-size-base;
        color: $text-tertiary;
      }
    }
  }
}

// 动画延迟变量
.hotel-card:nth-child(1) { animation-delay: 0ms; }
.hotel-card:nth-child(2) { animation-delay: 100ms; }
.hotel-card:nth-child(3) { animation-delay: 200ms; }
.hotel-card:nth-child(4) { animation-delay: 300ms; }
.hotel-card:nth-child(5) { animation-delay: 400ms; }
.hotel-card:nth-child(6) { animation-delay: 500ms; }
.hotel-card:nth-child(7) { animation-delay: 600ms; }
.hotel-card:nth-child(8) { animation-delay: 700ms; }
.hotel-card:nth-child(9) { animation-delay: 800ms; }
.hotel-card:nth-child(10) { animation-delay: 900ms; }

// 响应式适配
@media screen and (max-width: 750px) {
  .filter-bar {
    .filter-section {
      .filter-tabs {
        .filter-tab {
          font-size: $font-size-xs;
          padding: $spacing-xs;
        }
      }
    }
  }
  
  .hotel-list {
    .hotel-card {
      .hotel-image {
        width: 200rpx;
        height: 150rpx;
      }
      
      .hotel-content {
        .hotel-header {
          .hotel-name {
            font-size: $font-size-base;
          }
        }
      }
    }
  }
}
</style>