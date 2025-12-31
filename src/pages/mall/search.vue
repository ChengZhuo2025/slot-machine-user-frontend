<template>
  <view class="search-page">
    <!-- 搜索栏 - 子任务 9.1 -->
    <view class="search-bar">
      <view class="search-input-wrapper">
        <Icon name="search" size="medium" color="#999" />
        <input
          v-model="searchKeyword"
          class="search-input"
          type="text"
          placeholder="搜索商品"
          placeholder-class="input-placeholder"
          confirm-type="search"
          @input="handleSearchInput"
          @confirm="handleSearch"
          @focus="handleFocus"
        />
        <view v-if="searchKeyword" class="clear-btn" @click="handleClearKeyword">
          <Icon name="x-circle" size="small" color="#999" />
        </view>
      </view>
      <text class="cancel-btn" @click="handleCancel">取消</text>
    </view>

    <!-- 搜索建议和历史 - 子任务 9.2 -->
    <scroll-view v-if="!hasSearched" class="suggest-content" scroll-y>
      <!-- 搜索建议 -->
      <view v-if="suggestions.length > 0" class="suggest-section">
        <view
          v-for="item in suggestions"
          :key="item.keyword"
          class="suggest-item"
          @click="handleSelectSuggestion(item.keyword)"
        >
          <Icon name="search" size="small" color="#999" />
          <text class="suggest-text">{{ item.keyword }}</text>
          <text class="suggest-count">约{{ item.count }}个结果</text>
        </view>
      </view>

      <!-- 搜索历史 -->
      <view v-if="searchHistory.length > 0" class="history-section">
        <view class="section-header">
          <text class="section-title">搜索历史</text>
          <view class="clear-history" @click="handleClearHistory">
            <Icon name="trash" size="small" color="#999" />
            <text class="clear-text">清空</text>
          </view>
        </view>
        <view class="history-tags">
          <view
            v-for="(keyword, index) in searchHistory"
            :key="index"
            class="history-tag"
            @click="handleSelectHistory(keyword)"
          >
            {{ keyword }}
          </view>
        </view>
      </view>

      <!-- 热门搜索 -->
      <view v-if="hotKeywords.length > 0" class="hot-section">
        <view class="section-header">
          <text class="section-title">热门搜索</text>
        </view>
        <view class="hot-tags">
          <view
            v-for="(item, index) in hotKeywords"
            :key="index"
            class="hot-tag"
            :class="{ 'hot-tag--top': index < 3 }"
            @click="handleSelectHot(item.keyword)"
          >
            <text class="tag-index">{{ index + 1 }}</text>
            <text class="tag-text">{{ item.keyword }}</text>
            <Icon
              v-if="item.trend === 'up'"
              name="trending-up"
              size="small"
              color="#ef4444"
            />
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 搜索结果 - 子任务 9.3 -->
    <view v-else class="result-content">
      <!-- 排序和筛选 -->
      <view class="filter-bar">
        <view
          v-for="sort in sortOptions"
          :key="sort.value"
          class="filter-item"
          :class="{ 'filter-item--active': currentSort === sort.value }"
          @click="handleSortChange(sort.value)"
        >
          <text class="filter-text">{{ sort.label }}</text>
          <view v-if="sort.value === 'price'" class="sort-icons">
            <Icon
              name="chevron-up"
              size="xsmall"
              :color="currentSort === 'price' && sortOrder === 'asc' ? '#6366f1' : '#d1d5db'"
            />
            <Icon
              name="chevron-down"
              size="xsmall"
              :color="currentSort === 'price' && sortOrder === 'desc' ? '#6366f1' : '#d1d5db'"
            />
          </view>
        </view>
        <view class="filter-item" @click="handleShowFilter">
          <Icon name="filter" size="small" color="#666" />
          <text class="filter-text">筛选</text>
        </view>
      </view>

      <!-- 结果数量 -->
      <view v-if="searchResults.length > 0" class="result-count">
        <text class="count-text">找到 {{ totalCount }} 个相关商品</text>
      </view>

      <!-- 商品列表 -->
      <scroll-view v-if="searchResults.length > 0" class="result-list" scroll-y>
        <view class="product-grid">
          <view
            v-for="product in searchResults"
            :key="product.id"
            class="product-card"
            @click="handleGoToDetail(product.id)"
          >
            <image :src="product.image" class="product-image" mode="aspectFill" />
            <view class="product-info">
              <text class="product-name">{{ product.name }}</text>
              <view class="product-footer">
                <view class="product-price">
                  <text class="price-symbol">¥</text>
                  <text class="price-value">{{ product.price }}</text>
                </view>
                <text class="product-sales">{{ product.sales }}人付款</text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 无结果 - 子任务 9.4 -->
      <view v-else class="empty-result">
        <image src="/static/images/empty-search.png" class="empty-image" mode="aspectFit" />
        <text class="empty-text">没有找到相关商品</text>
        <text class="empty-desc">换个关键词试试吧~</text>

        <!-- 推荐商品 -->
        <view v-if="recommendProducts.length > 0" class="recommend-section">
          <text class="recommend-title">为你推荐</text>
          <view class="recommend-grid">
            <view
              v-for="product in recommendProducts"
              :key="product.id"
              class="recommend-card"
              @click="handleGoToDetail(product.id)"
            >
              <image :src="product.image" class="card-image" mode="aspectFill" />
              <text class="card-name">{{ product.name }}</text>
              <view class="card-price">
                <text class="price-symbol">¥</text>
                <text class="price-value">{{ product.price }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Icon from '@/components/common/Icon.vue'
import request from '@/utils/request'

export default {
  name: 'SearchPage',
  components: {
    Icon
  },
  setup() {
    const router = useRouter()

    // 搜索关键词
    const searchKeyword = ref('')
    // 是否已搜索
    const hasSearched = ref(false)
    // 搜索建议
    const suggestions = ref([])
    // 搜索历史
    const searchHistory = ref([])
    // 热门搜索
    const hotKeywords = ref([])
    // 搜索结果
    const searchResults = ref([])
    // 总数量
    const totalCount = ref(0)
    // 推荐商品
    const recommendProducts = ref([])

    // 排序选项
    const sortOptions = ref([
      { label: '综合', value: 'default' },
      { label: '销量', value: 'sales' },
      { label: '价格', value: 'price' }
    ])
    // 当前排序
    const currentSort = ref('default')
    // 排序方向
    const sortOrder = ref('desc')

    // 防抖定时器
    let searchTimer = null

    // 获取搜索历史
    const fetchSearchHistory = async () => {
      try {
        const res = await request({
          url: '/api/mall/search/history',
          method: 'GET'
        })

        if (res.code === 200) {
          searchHistory.value = res.data.map(item => item.keyword) || []
        }
      } catch (error) {
        console.error('获取搜索历史失败:', error)
      }
    }

    // 获取热门搜索
    const fetchHotKeywords = async () => {
      try {
        const res = await request({
          url: '/api/mall/search/hot',
          method: 'GET'
        })

        if (res.code === 200) {
          hotKeywords.value = res.data || []
        }
      } catch (error) {
        console.error('获取热门搜索失败:', error)
      }
    }

    // 获取搜索建议
    const fetchSuggestions = async (keyword) => {
      if (!keyword) {
        suggestions.value = []
        return
      }

      try {
        const res = await request({
          url: '/api/mall/search/suggest',
          method: 'GET',
          data: { keyword }
        })

        if (res.code === 200) {
          suggestions.value = res.data || []
        }
      } catch (error) {
        console.error('获取搜索建议失败:', error)
      }
    }

    // 执行搜索
    const performSearch = async () => {
      if (!searchKeyword.value.trim()) {
        return
      }

      try {
        uni.showLoading({ title: '搜索中...' })

        const res = await request({
          url: '/api/mall/search',
          method: 'GET',
          data: {
            keyword: searchKeyword.value,
            sortBy: currentSort.value,
            sortOrder: sortOrder.value,
            page: 1,
            pageSize: 20
          }
        })

        uni.hideLoading()

        if (res.code === 200) {
          searchResults.value = res.data.list || []
          totalCount.value = res.data.total || 0
          hasSearched.value = true

          // 保存搜索历史
          saveSearchHistory(searchKeyword.value)
        }
      } catch (error) {
        uni.hideLoading()
        console.error('搜索失败:', error)
        uni.showToast({ title: '搜索失败', icon: 'none' })
      }
    }

    // 保存搜索历史
    const saveSearchHistory = async (keyword) => {
      try {
        await request({
          url: '/api/mall/search/history',
          method: 'POST',
          data: { keyword }
        })

        // 更新本地历史
        if (!searchHistory.value.includes(keyword)) {
          searchHistory.value.unshift(keyword)
          if (searchHistory.value.length > 10) {
            searchHistory.value = searchHistory.value.slice(0, 10)
          }
        }
      } catch (error) {
        console.error('保存搜索历史失败:', error)
      }
    }

    // 获取推荐商品
    const fetchRecommendProducts = async () => {
      try {
        const res = await request({
          url: '/api/mall/popular',
          method: 'GET'
        })

        if (res.code === 200) {
          recommendProducts.value = res.data || []
        }
      } catch (error) {
        console.error('获取推荐商品失败:', error)
      }
    }

    // 搜索输入
    const handleSearchInput = () => {
      // 防抖获取搜索建议
      clearTimeout(searchTimer)
      searchTimer = setTimeout(() => {
        fetchSuggestions(searchKeyword.value)
      }, 300)
    }

    // 搜索
    const handleSearch = () => {
      performSearch()
    }

    // 聚焦
    const handleFocus = () => {
      hasSearched.value = false
    }

    // 清空关键词
    const handleClearKeyword = () => {
      searchKeyword.value = ''
      suggestions.value = []
    }

    // 取消
    const handleCancel = () => {
      uni.navigateBack()
    }

    // 选择搜索建议
    const handleSelectSuggestion = (keyword) => {
      searchKeyword.value = keyword
      performSearch()
    }

    // 选择搜索历史
    const handleSelectHistory = (keyword) => {
      searchKeyword.value = keyword
      performSearch()
    }

    // 选择热门搜索
    const handleSelectHot = (keyword) => {
      searchKeyword.value = keyword
      performSearch()
    }

    // 清空搜索历史
    const handleClearHistory = () => {
      uni.showModal({
        title: '提示',
        content: '确定要清空搜索历史吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              await request({
                url: '/api/mall/search/history',
                method: 'DELETE'
              })

              searchHistory.value = []
              uni.showToast({ title: '已清空', icon: 'success' })
            } catch (error) {
              console.error('清空搜索历史失败:', error)
              uni.showToast({ title: '操作失败', icon: 'none' })
            }
          }
        }
      })
    }

    // 排序切换
    const handleSortChange = (value) => {
      if (value === 'price') {
        if (currentSort.value === 'price') {
          // 切换排序方向
          sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
        } else {
          currentSort.value = 'price'
          sortOrder.value = 'asc'
        }
      } else {
        currentSort.value = value
        sortOrder.value = 'desc'
      }

      // 重新搜索
      performSearch()
    }

    // 显示筛选
    const handleShowFilter = () => {
      uni.showToast({ title: '筛选功能', icon: 'none' })
    }

    // 跳转商品详情
    const handleGoToDetail = (productId) => {
      uni.navigateTo({ url: `/pages/mall/product-detail?id=${productId}` })
    }

    onMounted(() => {
      fetchSearchHistory()
      fetchHotKeywords()
      fetchRecommendProducts()
    })

    return {
      searchKeyword,
      hasSearched,
      suggestions,
      searchHistory,
      hotKeywords,
      searchResults,
      totalCount,
      recommendProducts,
      sortOptions,
      currentSort,
      sortOrder,
      handleSearchInput,
      handleSearch,
      handleFocus,
      handleClearKeyword,
      handleCancel,
      handleSelectSuggestion,
      handleSelectHistory,
      handleSelectHot,
      handleClearHistory,
      handleSortChange,
      handleShowFilter,
      handleGoToDetail
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.search-page {
  min-height: 100vh;
  background: $background-secondary;
}

// 搜索栏
.search-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  padding-top: env(safe-area-inset-top);
  background: $background-primary;
  @include flex-between();
  align-items: center;
  padding-left: 24rpx;
  padding-right: 24rpx;
  z-index: 100;
  border-bottom: 1rpx solid $border-color;
}

.search-input-wrapper {
  flex: 1;
  height: 64rpx;
  @include flex-start();
  align-items: center;
  gap: 12rpx;
  padding: 0 24rpx;
  background: $background-secondary;
  border-radius: 32rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: $text-primary;
}

.input-placeholder {
  color: $text-tertiary;
}

.clear-btn {
  @include flex-center();
  
  &:active {
    opacity: 0.7;
  }
}

.cancel-btn {
  margin-left: 16rpx;
  font-size: 28rpx;
  color: $text-secondary;
  
  &:active {
    opacity: 0.7;
  }
}

// 搜索建议和历史
.suggest-content {
  height: 100vh;
  padding-top: calc(88rpx + env(safe-area-inset-top));
  padding: calc(88rpx + env(safe-area-inset-top)) 24rpx 0;
}

// 搜索建议
.suggest-section {
  background: $background-primary;
  border-radius: 16rpx;
  padding: 16rpx 0;
  margin-bottom: 16rpx;
}

.suggest-item {
  @include flex-start();
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 24rpx;
  
  &:active {
    background: $background-secondary;
  }
}

.suggest-text {
  flex: 1;
  font-size: 28rpx;
  color: $text-primary;
}

.suggest-count {
  font-size: 24rpx;
  color: $text-tertiary;
}

// 搜索历史
.history-section {
  background: $background-primary;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.section-header {
  @include flex-between();
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.clear-history {
  @include flex-start();
  align-items: center;
  gap: 8rpx;
  
  &:active {
    opacity: 0.7;
  }
}

.clear-text {
  font-size: 24rpx;
  color: $text-secondary;
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.history-tag {
  padding: 12rpx 24rpx;
  background: $background-secondary;
  border-radius: 24rpx;
  font-size: 26rpx;
  color: $text-primary;
  
  &:active {
    transform: scale(0.95);
  }
}

// 热门搜索
.hot-section {
  background: $background-primary;
  border-radius: 16rpx;
  padding: 24rpx;
}

.hot-tags {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.hot-tag {
  @include flex-start();
  align-items: center;
  gap: 16rpx;
  padding: 16rpx;
  background: $background-secondary;
  border-radius: 12rpx;
  
  &--top {
    .tag-index {
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      color: #fff;
    }
  }
  
  &:active {
    transform: scale(0.98);
  }
}

.tag-index {
  width: 40rpx;
  height: 40rpx;
  @include flex-center();
  background: $background-tertiary;
  border-radius: 8rpx;
  font-size: 24rpx;
  font-weight: $font-weight-bold;
  color: $text-secondary;
  flex-shrink: 0;
}

.tag-text {
  flex: 1;
  font-size: 28rpx;
  color: $text-primary;
}

// 搜索结果
.result-content {
  min-height: 100vh;
  padding-top: calc(88rpx + env(safe-area-inset-top));
}

// 筛选栏
.filter-bar {
  position: sticky;
  top: calc(88rpx + env(safe-area-inset-top));
  @include flex-start();
  background: $background-primary;
  border-bottom: 1rpx solid $border-color;
  z-index: 10;
}

.filter-item {
  flex: 1;
  height: 88rpx;
  @include flex-center();
  gap: 8rpx;
  position: relative;
  
  &--active {
    .filter-text {
      color: $primary-color;
      font-weight: $font-weight-semibold;
    }
  }
  
  &:active {
    background: $background-secondary;
  }
}

.filter-text {
  font-size: 28rpx;
  color: $text-primary;
}

.sort-icons {
  display: flex;
  flex-direction: column;
  gap: 2rpx;
}

// 结果数量
.result-count {
  padding: 24rpx;
}

.count-text {
  font-size: 24rpx;
  color: $text-secondary;
}

// 商品列表
.result-list {
  height: calc(100vh - 88rpx - env(safe-area-inset-top) - 88rpx - 72rpx);
  padding: 0 16rpx;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  padding-bottom: 32rpx;
}

.product-card {
  background: $background-primary;
  border-radius: 16rpx;
  overflow: hidden;
  
  &:active {
    transform: scale(0.98);
  }
}

.product-image {
  width: 100%;
  height: 340rpx;
  background: $background-secondary;
}

.product-info {
  padding: 16rpx;
}

.product-name {
  font-size: 26rpx;
  color: $text-primary;
  line-height: 1.4;
  @include ellipsis(2);
  margin-bottom: 12rpx;
}

.product-footer {
  @include flex-between();
  align-items: flex-end;
}

.product-price {
  @include flex-start();
  align-items: baseline;
  gap: 4rpx;
}

.price-symbol {
  font-size: 20rpx;
  font-weight: $font-weight-bold;
  color: $error-color;
}

.price-value {
  font-size: 32rpx;
  font-weight: $font-weight-bold;
  color: $error-color;
  line-height: 1;
}

.product-sales {
  font-size: 24rpx;
  color: $text-tertiary;
}

// 空结果
.empty-result {
  @include flex-center();
  flex-direction: column;
  padding: 80rpx 48rpx;
}

.empty-image {
  width: 400rpx;
  height: 400rpx;
  margin-bottom: 32rpx;
}

.empty-text {
  font-size: 32rpx;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 28rpx;
  color: $text-secondary;
  margin-bottom: 48rpx;
}

// 推荐商品
.recommend-section {
  width: 100%;
  padding: 32rpx 0;
}

.recommend-title {
  font-size: 32rpx;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin-bottom: 24rpx;
  display: block;
}

.recommend-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.recommend-card {
  background: $background-primary;
  border-radius: 16rpx;
  padding: 16rpx;
  
  &:active {
    transform: scale(0.98);
  }
}

.card-image {
  width: 100%;
  height: 280rpx;
  border-radius: 12rpx;
  background: $background-secondary;
  margin-bottom: 12rpx;
}

.card-name {
  font-size: 26rpx;
  color: $text-primary;
  line-height: 1.4;
  @include ellipsis(2);
  margin-bottom: 8rpx;
  display: block;
}

.card-price {
  @include flex-start();
  align-items: baseline;
  gap: 4rpx;
  
  .price-symbol {
    font-size: 20rpx;
  }
  
  .price-value {
    font-size: 28rpx;
  }
}
</style>
