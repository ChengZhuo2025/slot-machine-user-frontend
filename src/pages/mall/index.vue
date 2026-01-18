<template>
  <view class="page">
    <view class="page-bgimg"></view>

    <!-- 自定义标题栏 -->
    <view class="header-bar" :class="{ 'scrolled': isScrolled }">
      <view class="header-left">
        <text class="header-title">商城</text>
      </view>
      <view class="header-center">
        <view class="search-bar-mini" @click="focusSearch">
          <Icon name="search" size="small" color="#999" />
          <input
            v-model="searchKeyword"
            class="search-input-mini"
            placeholder="搜索商品名称、关键词"
            placeholder-class="search-placeholder"
            confirm-type="search"
            @input="onSearchInput"
            @confirm="onSearchConfirm"
            @focus="onSearchFocus"
            @blur="onSearchBlur"
          />
          <view v-if="searchKeyword" class="search-clear" @click.stop="clearSearch">
            <Icon name="x-circle" size="small" color="#999" />
          </view>
        </view>
      </view>
      <view class="header-right">
        <view class="cart-icon" @click="goToCart">
          <Icon name="shopping-cart" size="medium" color="#333" />
          <view v-if="cartCount > 0" class="cart-badge">
            <text class="cart-count">{{ cartCount > 99 ? '99+' : cartCount }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 搜索模块 -->
    <view v-if="showSearchPanel" class="search-section animate__animated animate__fadeInDown">
      <!-- 历史搜索 -->
      <view v-if="searchHistory.length > 0" class="search-history">
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
      <view class="hot-search">
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

    <!-- 页面主内容 -->
    <scroll-view
      class="page-content"
      scroll-y="true"
      :show-scrollbar="false"
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onPullDownRefresh"
      @scrolltolower="onLoadMore"
      @scroll="onScroll"
      :lower-threshold="100"
    >
      <!-- 商品分类导航 -->
      <view class="category-section animate__animated animate__fadeInRight">
        <!-- 骨架屏 -->
        <view v-if="mallStore.loading.categories && !mallStore.hasCategories" class="category-skeleton">
          <SkeletonScreen v-for="i in 5" :key="i" type="avatar" width="80rpx" height="80rpx" />
        </view>
        <!-- 分类列表 -->
        <scroll-view
          v-else-if="isMounted"
          class="category-scroll"
          scroll-x="true"
          :show-scrollbar="false"
        >
          <view class="category-list">
            <!-- 全部分类 -->
            <view
              class="category-item"
              :class="{ active: selectedCategoryId === null }"
              @click="selectCategory(null)"
            >
              <Icon name="grid" size="medium" :color="selectedCategoryId === null ? '#d746f0' : '#666'" />
              <text class="category-name">全部</text>
            </view>
            <!-- API分类 -->
            <view
              v-for="category in mallStore.topCategories"
              :key="category.id"
              class="category-item"
              :class="{ active: selectedCategoryId === category.id }"
              @click="selectCategory(category.id)"
            >
              <Icon :name="getCategoryIcon(category)" size="medium" :color="selectedCategoryId === category.id ? '#d746f0' : '#666'" />
              <text class="category-name">{{ category.name }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- Banner轮播图 -->
      <view class="banner-section animate__animated animate__bounceIn">
        <!-- 骨架屏 -->
        <SkeletonScreen v-if="bannerStore.loading.mall && !bannerStore.hasMallBanners" type="banner" />
        <!-- Banner内容 -->
        <swiper
          v-else-if="bannerStore.hasMallBanners"
          class="banner-swiper"
          indicator-dots
          autoplay
          interval="3000"
          duration="500"
          indicator-color="rgba(255,255,255,0.5)"
          indicator-active-color="#d746f0"
        >
          <swiper-item v-for="banner in bannerStore.mallBanners" :key="banner.id">
            <image
              class="banner-image"
              :src="banner.image"
              mode="aspectFill"
              @click="onBannerClick(banner)"
            />
          </swiper-item>
        </swiper>
        <!-- 默认占位 -->
        <view v-else class="banner-placeholder">
          <text class="placeholder-text">暂无Banner</text>
        </view>
      </view>

      <!-- 商品列表 -->
      <view class="product-section">
        <view class="section-header animate__animated animate__fadeInUp">
          <text class="section-title">{{ currentCategoryName }}</text>
          <view class="header-right-actions">
            <!-- 筛选标签 -->
            <view class="sort-tags">
              <view
                v-for="(sort, index) in sortOptions"
                :key="sort.key"
                class="sort-tag"
                :class="{ active: selectedSortKey === sort.key }"
                @click="selectSort(sort.key)"
              >
                <text class="sort-tag-text">{{ sort.name }}</text>
                <Icon
                  v-if="sort.icon"
                  :name="sort.icon"
                  size="small"
                  :color="selectedSortKey === sort.key ? '#d746f0' : '#666'"
                />
              </view>
            </view>
            <!-- 布局切换 -->
            <view class="layout-toggle">
              <view
                class="layout-btn"
                :class="{ active: layoutMode === 'grid' }"
                @click="setLayoutMode('grid')"
              >
                <Icon
                  name="grid"
                  size="small"
                  :color="layoutMode === 'grid' ? '#d746f0' : '#999'"
                />
              </view>
              <view
                class="layout-btn"
                :class="{ active: layoutMode === 'list' }"
                @click="setLayoutMode('list')"
              >
                <Icon
                  name="list"
                  size="small"
                  :color="layoutMode === 'list' ? '#d746f0' : '#999'"
                />
              </view>
            </view>
          </view>
        </view>

        <!-- 搜索结果模式 -->
        <template v-if="isSearchMode">
          <!-- 搜索中骨架屏 -->
          <view v-if="mallStore.loading.search && mallStore.searchResults.length === 0" class="products-grid">
            <SkeletonScreen v-for="i in 6" :key="i" type="product-card" />
          </view>
          <!-- 搜索结果 -->
          <view v-else-if="mallStore.searchResults.length > 0" class="products-grid" :class="{ 'list-mode': layoutMode === 'list' }">
            <view
              v-for="(product, index) in mallStore.searchResults"
              :key="product.id"
              class="product-item animate__animated animate__fadeInUp"
              :style="{ animationDelay: (index % 6) * 100 + 'ms' }"
              @click="goToProductDetail(product)"
            >
              <view class="product-image-container">
                <image
                  :src="getProductImage(product)"
                  class="product-image"
                  mode="aspectFill"
                  lazy-load
                />
                <view v-if="product.is_new" class="product-tag new-tag">
                  <text class="tag-text">新品</text>
                </view>
                <view v-else-if="product.is_hot" class="product-tag hot-tag">
                  <text class="tag-text">热销</text>
                </view>
              </view>
              <view class="product-info">
                <text class="product-name">{{ product.name }}</text>
                <view class="product-price">
                  <text class="price-current">¥{{ product.price }}</text>
                  <text v-if="product.member_price" class="price-member">会员¥{{ product.member_price }}</text>
                </view>
                <view class="product-actions">
                  <view class="cart-button" @click.stop="addToCart(product)">
                    <Icon name="shopping-cart-check" size="small" color="#be32d7" />
                  </view>
                  <view class="buy-button" @click.stop="buyNow(product)">
                    <text class="buy-text">立即购买</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
          <!-- 搜索空状态 -->
          <EmptyState v-else type="search" title="没有找到相关商品" description="换个关键词试试吧" />
        </template>

        <!-- 商品列表模式 -->
        <template v-else>
          <!-- 加载中骨架屏 -->
          <view v-if="mallStore.loading.products && mallStore.products.length === 0" class="products-grid">
            <SkeletonScreen v-for="i in 6" :key="i" type="product-card" />
          </view>
          <!-- 商品网格 -->
          <view v-else-if="mallStore.hasProducts" class="products-grid" :class="{ 'list-mode': layoutMode === 'list' }">
            <view
              v-for="(product, index) in mallStore.products"
              :key="product.id"
              class="product-item animate__animated animate__fadeInUp"
              :style="{ animationDelay: (index % 6) * 100 + 'ms' }"
              @click="goToProductDetail(product)"
            >
              <view class="product-image-container">
                <image
                  :src="getProductImage(product)"
                  class="product-image"
                  mode="aspectFill"
                  lazy-load
                />
                <view v-if="product.is_new" class="product-tag new-tag">
                  <text class="tag-text">新品</text>
                </view>
                <view v-else-if="product.is_hot" class="product-tag hot-tag">
                  <text class="tag-text">热销</text>
                </view>
              </view>
              <view class="product-info">
                <text class="product-name">{{ product.name }}</text>
                <view class="product-price">
                  <text class="price-current">¥{{ product.price }}</text>
                  <text v-if="product.member_price" class="price-member">会员¥{{ product.member_price }}</text>
                </view>
                <view class="product-actions">
                  <view class="cart-button" @click.stop="addToCart(product)">
                    <Icon name="shopping-cart-check" size="small" color="#be32d7" />
                  </view>
                  <view class="buy-button" @click.stop="buyNow(product)">
                    <text class="buy-text">立即购买</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
          <!-- 空状态 -->
          <EmptyState v-else type="product" title="暂无商品数据" />
        </template>

        <!-- 加载更多 -->
        <view v-if="isLoadingMore" class="loading-more">
          <view class="loading-spinner"></view>
          <text class="loading-text">加载中...</text>
        </view>

        <!-- 没有更多数据 -->
        <view v-if="displayedProducts.length > 0 && !hasMore" class="no-more">
          <view class="no-more-line"></view>
          <text class="no-more-text">没有更多商品了</text>
          <view class="no-more-line"></view>
        </view>

        <!-- 错误状态 -->
        <ErrorState
          v-if="mallStore.error.products"
          type="network"
          :message="mallStore.error.products"
          @retry="retryLoadProducts"
        />
      </view>
    </scroll-view>

    <!-- 自定义底部导航 -->
    <CustomTabBar :current="1" />

    <!-- 规格选择器 -->
    <SpecSelector
      :show="showSpecSelector"
      :product="selectedProduct"
      :mode="specSelectorMode"
      @close="handleSpecSelectorClose"
      @add-to-cart="handleSpecAddToCart"
      @buy-now="handleSpecBuyNow"
    />
  </view>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import Icon from '@/components/common/Icon.vue'
import CustomTabBar from '@/components/layout/CustomTabBar.vue'
import SpecSelector from '@/components/mall/SpecSelector.vue'
import SkeletonScreen from '@/components/layout/SkeletonScreen.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import { useCartStore } from '@/stores/cart'
import { useMallStore } from '@/stores/mall'
import { useBannerStore } from '@/stores/banner'
import { debounce } from '@/utils/debounce'
import { requestQueue } from '@/utils/requestQueue'

export default {
  name: 'MallIndexPage',
  components: {
    Icon,
    CustomTabBar,
    SpecSelector,
    SkeletonScreen,
    EmptyState,
    ErrorState
  },
  // 页面滚动配置
  onPageScroll(e) {
    if (this.updateScrollState) {
      this.updateScrollState(e.scrollTop);
    }
  },
  setup() {
    const cartStore = useCartStore()
    const mallStore = useMallStore()
    const bannerStore = useBannerStore()

    // 页面状态
    const isRefreshing = ref(false)
    const isLoadingMore = ref(false)
    const layoutMode = ref('grid')
    const isScrolled = ref(false)
    const showSearchPanel = ref(false)
    const isSearchFocused = ref(false)
    const isMounted = ref(false) // 用于延迟渲染 scroll-view，避免框架 bug

    // 搜索相关
    const searchKeyword = ref('')
    const searchHistory = ref([])
    const hotSearchKeywords = ref(['热销商品', '新品上市', '会员专享', '限时特惠', '酒店用品'])

    // 分类和排序
    const selectedCategoryId = ref(null)
    const selectedSortKey = ref('default')

    // 排序选项
    const sortOptions = ref([
      { key: 'default', name: '综合' },
      { key: 'newest', name: '新品' },
      { key: 'sales', name: '热销' },
      { key: 'price_asc', name: '价格↑' },
      { key: 'price_desc', name: '价格↓' },
    ])

    // 购物车数量
    const cartCount = computed(() => cartStore.totalCount)

    // 规格选择器相关
    const showSpecSelector = ref(false)
    const selectedProduct = ref({})
    const specSelectorMode = ref('cart')

    // 是否搜索模式
    const isSearchMode = computed(() => searchKeyword.value.trim().length > 0)

    // 当前显示的商品列表
    const displayedProducts = computed(() => {
      if (isSearchMode.value) {
        return mallStore.searchResults
      }
      return mallStore.products
    })

    // 是否还有更多
    const hasMore = computed(() => {
      if (isSearchMode.value) {
        return mallStore.searchPagination.hasMore
      }
      return mallStore.pagination.hasMore
    })

    // 当前分类名称
    const currentCategoryName = computed(() => {
      if (isSearchMode.value) {
        return `搜索"${searchKeyword.value}"`
      }
      if (selectedCategoryId.value === null) {
        return '全部商品'
      }
      const category = mallStore.categories.find(c => c.id === selectedCategoryId.value)
      return category ? category.name : '全部商品'
    })

    // 分类图标映射
    const categoryIconMap = {
      'hotel': 'towels',
      'care': 'bath',
      'adult': 'heart',
      'health': 'pill',
      'other': 'goods',
      '酒店用品': 'towels',
      '清洁护理': 'bath',
      '情趣用品': 'heart',
      '营养保健': 'pill',
      '其他精选': 'goods'
    }

    const getCategoryIcon = (category) => {
      return categoryIconMap[category.code] || categoryIconMap[category.name] || 'grid'
    }

    // 获取商品图片
    const getProductImage = (product) => {
      if (product.image) return product.image
      if (product.images && product.images.length > 0) {
        return typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url
      }
      if (product.cover_image) return product.cover_image
      return 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/default-product.jpg'
    }

    // 防抖搜索函数
    const debouncedSearch = debounce(async (keyword) => {
      if (!keyword.trim()) {
        return
      }

      // 使用请求队列处理竞态
      const requestKey = requestQueue.generateKey('mall', 'search', { keyword })

      try {
        await requestQueue.execute(requestKey, async () => {
          await mallStore.searchProductsByKeyword(keyword, { refresh: true })
        })
      } catch (error) {
        if (!requestQueue.isAbortError(error)) {
          console.error('搜索失败:', error)
        }
      }
    }, 400)

    // 搜索输入事件
    const onSearchInput = () => {
      if (searchKeyword.value.trim()) {
        showSearchPanel.value = false
        debouncedSearch(searchKeyword.value)
      } else {
        // 清空搜索时重新加载商品列表
        mallStore.fetchProducts({ refresh: true })
      }
    }

    const onSearchConfirm = () => {
      if (searchKeyword.value.trim()) {
        addToSearchHistory(searchKeyword.value.trim())
        showSearchPanel.value = false
        mallStore.searchProductsByKeyword(searchKeyword.value.trim(), { refresh: true })
      }
    }

    const onSearchFocus = () => {
      isSearchFocused.value = true
      showSearchPanel.value = true
    }

    const onSearchBlur = () => {
      isSearchFocused.value = false
      // 延迟关闭，允许点击历史记录
      setTimeout(() => {
        if (!isSearchFocused.value) {
          showSearchPanel.value = false
        }
      }, 200)
    }

    const focusSearch = () => {
      showSearchPanel.value = true
    }

    const clearSearch = () => {
      searchKeyword.value = ''
      mallStore.fetchProducts({ refresh: true })
    }

    const addToSearchHistory = (keyword) => {
      const history = [...searchHistory.value]
      const index = history.indexOf(keyword)
      if (index > -1) {
        history.splice(index, 1)
      }
      history.unshift(keyword)
      searchHistory.value = history.slice(0, 10)
      uni.setStorageSync('mall_search_history', searchHistory.value)
    }

    const selectSearchHistory = (keyword) => {
      searchKeyword.value = keyword
      showSearchPanel.value = false
      mallStore.searchProductsByKeyword(keyword, { refresh: true })
    }

    const selectHotSearch = (keyword) => {
      searchKeyword.value = keyword
      showSearchPanel.value = false
      addToSearchHistory(keyword)
      mallStore.searchProductsByKeyword(keyword, { refresh: true })
    }

    const clearSearchHistory = () => {
      searchHistory.value = []
      uni.removeStorageSync('mall_search_history')
    }

    // 分类切换（带竞态处理）
    const selectCategory = async (categoryId) => {
      if (selectedCategoryId.value === categoryId) return

      selectedCategoryId.value = categoryId
      searchKeyword.value = '' // 清空搜索

      // 取消之前的请求
      requestQueue.cancelByModule('mall')

      const requestKey = requestQueue.generateKey('mall', 'products', { categoryId })

      try {
        await requestQueue.execute(requestKey, async () => {
          await mallStore.fetchProducts({ categoryId, refresh: true })
        })
      } catch (error) {
        if (!requestQueue.isAbortError(error)) {
          console.error('加载分类商品失败:', error)
        }
      }
    }

    // 排序切换（带竞态处理）
    const selectSort = async (sortKey) => {
      if (selectedSortKey.value === sortKey) return

      selectedSortKey.value = sortKey

      // 取消之前的请求
      requestQueue.cancelByModule('mall')

      mallStore.setSortType(sortKey)
    }

    const setLayoutMode = (mode) => {
      layoutMode.value = mode
    }

    const onBannerClick = (banner) => {
      if (banner.link_url) {
        uni.navigateTo({ url: banner.link_url })
      } else if (banner.link) {
        uni.navigateTo({ url: banner.link })
      }
    }

    // 下拉刷新
    const onPullDownRefresh = async () => {
      isRefreshing.value = true

      try {
        // 取消所有待处理请求
        requestQueue.cancelByModule('mall')

        // 并行刷新数据
        await Promise.allSettled([
          bannerStore.fetchMallBanners(true),
          mallStore.fetchCategories(true),
          isSearchMode.value
            ? mallStore.searchProductsByKeyword(searchKeyword.value, { refresh: true })
            : mallStore.fetchProducts({ categoryId: selectedCategoryId.value, refresh: true })
        ])

        uni.showToast({ title: '刷新成功', icon: 'success' })
      } catch (error) {
        console.error('刷新失败:', error)
      } finally {
        isRefreshing.value = false
      }
    }

    // 上拉加载更多
    const onLoadMore = async () => {
      if (isLoadingMore.value || !hasMore.value) return

      isLoadingMore.value = true

      try {
        if (isSearchMode.value) {
          await mallStore.searchProductsByKeyword(searchKeyword.value, { loadMore: true })
        } else {
          await mallStore.fetchProducts({ loadMore: true })
        }
      } catch (error) {
        console.error('加载更多失败:', error)
      } finally {
        isLoadingMore.value = false
      }
    }

    // 重试加载
    const retryLoadProducts = async () => {
      if (isSearchMode.value) {
        await mallStore.searchProductsByKeyword(searchKeyword.value, { refresh: true })
      } else {
        await mallStore.fetchProducts({ categoryId: selectedCategoryId.value, refresh: true })
      }
    }

    const goToProductDetail = (product) => {
      uni.navigateTo({
        url: `/pages/mall/product-detail?id=${product.id}`
      })
    }

    const addToCart = (product) => {
      selectedProduct.value = product
      specSelectorMode.value = 'cart'
      showSpecSelector.value = true
    }

    const buyNow = (product) => {
      selectedProduct.value = product
      specSelectorMode.value = 'buy'
      showSpecSelector.value = true
    }

    const handleSpecSelectorClose = () => {
      showSpecSelector.value = false
    }

    const handleSpecAddToCart = (result) => {
      const cartItem = {
        id: result.productId,
        name: selectedProduct.value.name,
        price: result.price,
        memberPrice: selectedProduct.value.member_price || selectedProduct.value.memberPrice,
        image: result.image || getProductImage(selectedProduct.value),
        quantity: result.quantity,
        specs: result.specsText,
        stock: 999,
        isValid: true
      }

      cartStore.addToCart(cartItem)

      uni.showToast({
        title: '已添加到购物车',
        icon: 'success',
        duration: 1500
      })

      uni.vibrateShort({ type: 'light' })
      showSpecSelector.value = false
    }

    const handleSpecBuyNow = (result) => {
      showSpecSelector.value = false
      uni.navigateTo({
        url: `/pages/mall/order-confirm?productId=${result.productId}&quantity=${result.quantity}&specs=${encodeURIComponent(result.specsText)}`
      })
    }

    const goToCart = () => {
      uni.navigateTo({ url: '/pages/mall/cart' })
    }

    const onScroll = (e) => {
      // 兼容不同平台的事件结构
      let scrollTop = 0
      if (e && e.detail && typeof e.detail.scrollTop === 'number') {
        scrollTop = e.detail.scrollTop
      } else if (e && e.target && typeof e.target.scrollTop === 'number') {
        scrollTop = e.target.scrollTop
      } else if (e && typeof e.scrollTop === 'number') {
        scrollTop = e.scrollTop
      }
      isScrolled.value = scrollTop > 50
    }

    // 页面滚动状态更新（供 onPageScroll 调用）
    const updateScrollState = (scrollTop) => {
      isScrolled.value = scrollTop > 50
    }

    // 加载页面数据
    const loadPageData = async () => {
      try {
        await Promise.allSettled([
          bannerStore.fetchMallBanners(),
          mallStore.fetchCategories(),
          mallStore.fetchProducts({ refresh: true })
        ])
      } catch (error) {
        console.error('加载页面数据失败:', error)
      }
    }

    // 初始化
    onMounted(() => {
      // 加载搜索历史
      const history = uni.getStorageSync('mall_search_history')
      if (history && Array.isArray(history)) {
        searchHistory.value = history
      }

      // 延迟设置 isMounted，确保 DOM 完全准备好
      nextTick(() => {
        isMounted.value = true
      })

      // 加载页面数据
      loadPageData()
    })

    // 清理
    onUnmounted(() => {
      // 取消所有待处理请求
      requestQueue.cancelByModule('mall')
    })

    return {
      // Stores
      mallStore,
      bannerStore,

      // 状态
      isRefreshing,
      isLoadingMore,
      layoutMode,
      isScrolled,
      showSearchPanel,
      searchKeyword,
      searchHistory,
      hotSearchKeywords,
      selectedCategoryId,
      selectedSortKey,
      sortOptions,
      cartCount,
      showSpecSelector,
      selectedProduct,
      specSelectorMode,
      isSearchMode,
      displayedProducts,
      hasMore,
      currentCategoryName,
      isMounted,

      // 方法
      getCategoryIcon,
      getProductImage,
      focusSearch,
      clearSearch,
      onSearchInput,
      onSearchConfirm,
      onSearchFocus,
      onSearchBlur,
      selectSearchHistory,
      selectHotSearch,
      clearSearchHistory,
      selectCategory,
      selectSort,
      setLayoutMode,
      onBannerClick,
      onPullDownRefresh,
      onLoadMore,
      retryLoadProducts,
      goToProductDetail,
      addToCart,
      buyNow,
      goToCart,
      onScroll,
      updateScrollState,
      handleSpecSelectorClose,
      handleSpecAddToCart,
      handleSpecBuyNow
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
  padding-bottom: 120rpx;
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
  align-items: center;
  padding: $spacing-sm $spacing-lg;
  position: fixed;
  width: 100vw;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;

  &.scrolled {
    background-color: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20rpx);
    @include shadow(sm);
  }

  .header-left {
    flex: 0 0 auto;

    .header-title {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: $text-primary;
    }
  }

  .header-center {
    flex: 1;
    margin: 0 $spacing-base;

    .search-bar-mini {
      @include flex();
      align-items: center;
      background-color: $background-primary;
      border-radius: 48rpx;
      padding: $spacing-sm $spacing-base;
      gap: $spacing-xs;

      .search-input-mini {
        flex: 1;
        font-size: $font-size-sm;
        color: $text-primary;

        &::placeholder {
          color: $text-placeholder;
        }
      }

      .search-placeholder {
        color: $text-placeholder;
      }

      .search-clear {
        padding: $spacing-xs;
      }
    }
  }

  .header-right {
    flex: 0 0 auto;

    .cart-icon {
      position: relative;
      width: 54rpx;
      height: 54rpx;
      @include flex-center();

      .cart-badge {
        position: absolute;
        top: -10rpx;
        right: -10rpx;
        min-width: 32rpx;
        height: 32rpx;
        @include flex-center();
        background: rgba($error-color, 0.85);
        border-radius: $border-radius-full;

        .cart-count {
          font-size: $font-size-xs;
          font-weight: $font-weight-semibold;
          color: #fff;
          line-height: 1;
        }
      }
    }
  }
}

// 搜索区域
.search-section {
  position: fixed;
  top: 100rpx;
  left: 0;
  right: 0;
  z-index: 99;
  padding: $spacing-base $spacing-lg;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20rpx);
  @include shadow(md);

  .search-history {
    margin-bottom: $spacing-base;

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
        background: $background-tertiary;
        border-radius: $border-radius-base;
        font-size: $font-size-sm;
        color: $text-secondary;
      }
    }
  }

  .hot-search {
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
        background: linear-gradient(45deg, $primary-light, $primary-dark);
        color: #fff;
        border-radius: $border-radius-base;
        font-size: $font-size-sm;
      }
    }
  }
}

// 分类导航
.category-section {
  position: relative;
  z-index: 10;
  padding-right: $spacing-lg;

  .category-skeleton {
    @include flex();
    padding: $spacing-sm $spacing-lg;
    gap: $spacing-lg;
  }

  .category-scroll {
    white-space: nowrap;

    .category-list {
      @include flex();
      padding: $spacing-sm $spacing-lg $spacing-sm calc($spacing-lg + $spacing-lg);

      .category-item {
        @include flex();
        flex-direction: column;
        align-items: center;
        gap: $spacing-xs;
        margin-right: $spacing-lg;
        transition: all 0.3s ease;

        &.active {
          .category-name {
            color: $primary-color;
            font-weight: $font-weight-semibold;
          }
        }

        .category-name {
          font-size: $font-size-sm;
          color: $text-secondary;
          white-space: nowrap;
        }
      }
    }
  }
}

// Banner轮播图
.banner-section {
  position: relative;
  z-index: 10;
  margin: 0 $spacing-lg;

  .banner-swiper {
    height: 320rpx;
    border-radius: $border-radius-xl;
    overflow: hidden;

    .banner-image {
      width: 100%;
      height: 100%;
    }
  }

  .banner-placeholder {
    height: 320rpx;
    @include flex-center();
    background-color: $background-tertiary;
    border-radius: $border-radius-xl;

    .placeholder-text {
      color: $text-tertiary;
      font-size: $font-size-sm;
    }
  }
}

// 页面主内容区域
.page-content {
  flex: 1;
  padding: 100rpx 0 $spacing-xs;

  .product-section {
    padding: $spacing-lg;

    .section-header {
      display: flex;
      flex-direction: column;
      gap: $spacing-xs;
      margin-bottom: $spacing-lg;

      .section-title {
        font-size: $font-size-lg;
        font-weight: $font-weight-semibold;
        color: $text-primary;
      }

      .header-right-actions {
        @include flex-between();
        align-items: center;
        gap: $spacing-lg;

        .sort-tags {
          @include flex();
          gap: $spacing-sm;

          .sort-tag {
            @include flex();
            align-items: center;
            padding: $spacing-xs $spacing-sm;
            border-radius: $border-radius-base;
            transition: all 0.3s ease;

            &.active {
              background-color: rgba($primary-color, 0.1);

              .sort-tag-text {
                color: $primary-color;
                font-weight: $font-weight-semibold;
              }
            }

            .sort-tag-text {
              font-size: $font-size-xs;
              color: $text-secondary;
              white-space: nowrap;
            }
          }
        }

        .layout-toggle {
          @include flex();
          gap: $spacing-sm;

          .layout-btn {
            width: 48rpx;
            height: 48rpx;
            @include flex-center();
            background-color: rgba($background-primary, 0.5);
            border-radius: $border-radius-base;
            transition: all 0.3s ease;
            cursor: pointer;

            &:active {
              transform: scale(0.9);
            }

            &.active {
              background-color: rgba($primary-color, 0.1);
            }
          }
        }
      }
    }

    // 商品网格
    .products-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: $spacing-base;

      &.list-mode {
        grid-template-columns: 1fr;

        .product-item {
          @include flex();

          .product-image-container {
            display: flex;
            width: 200rpx;
            flex-shrink: 0;
            margin-right: $spacing-base;
            margin-bottom: 0;

            .product-image {
              width: 240rpx;
              height: 170rpx;
            }
          }

          .product-info {
            flex: 1;

            .product-name {
              display: block;
              margin-bottom: $spacing-xs;
              font-size: $font-size-base;
              color: $text-primary;
              font-weight: $font-weight-medium;
              line-height: 1.3;
            }

            .product-price {
              margin-bottom: $spacing-sm;
            }
          }
        }
      }

      .product-item {
        @include card();
        padding: $spacing-base;
        transition: all 0.2s ease;

        &:active {
          transform: scale(0.98);
          opacity: 0.8;
        }
      }

      .product-image-container {
        position: relative;
        width: 100%;
        margin-bottom: $spacing-xs;

        .product-image {
          width: 100%;
          height: 280rpx;
          border-radius: $border-radius-base;
          background-color: $background-tertiary;
        }

        .product-tag {
          position: absolute;
          @include flex-center();
          bottom: 12rpx;
          left: $spacing-xs;
          padding: $spacing-xs $spacing-sm;
          border-radius: $border-radius-base;
          z-index: 2;

          .tag-text {
            font-size: $font-size-xs;
            font-weight: $font-weight-semibold;
            color: #fff;
            line-height: 1.3;
          }

          &.new-tag {
            background: linear-gradient(45deg, #39dc88, $success-color);
          }

          &.hot-tag {
            background: linear-gradient(45deg, $error-color, #ff6b6b);
          }
        }
      }

      .product-info {
        .product-name {
          font-size: $font-size-sm;
          font-weight: $font-weight-medium;
          color: $text-primary;
          @include ellipsis();
          margin-bottom: $spacing-sm;
          line-height: 1;
        }

        .product-price {
          @include flex();
          align-items: baseline;
          margin-bottom: $spacing-base;

          .price-current {
            font-size: $font-size-base;
            color: $error-color;
            font-weight: $font-weight-semibold;
            margin-right: $spacing-sm;
          }

          .price-member {
            font-size: $font-size-xs;
            font-weight: $font-weight-semibold;
            color: $warning-color;
          }
        }

        .product-actions {
          @include flex-between();
          align-items: center;

          .cart-button {
            @include flex-center();
            width: 48rpx;
            transition: all 0.2s ease;

            &:active {
              transform: scale(0.9);
            }
          }

          .buy-button {
            flex: 1;
            max-width: 200rpx;
            height: 56rpx;
            @include flex-center();
            background: $gradient-primary;
            border-radius: $border-radius-2xl;
            margin-left: $spacing-sm;
            transition: all 0.2s ease;

            &:active {
              transform: scale(0.95);
              opacity: 0.8;
            }

            .buy-text {
              font-size: $font-size-sm;
              color: #fff;
              font-weight: $font-weight-medium;
            }
          }
        }
      }
    }

    // 加载状态
    .loading-more {
      @include flex-center();
      padding: $spacing-lg;
      margin-top: $spacing-sm;
      gap: $spacing-sm;

      .loading-spinner {
        width: 32rpx;
        height: 32rpx;
        border: 4rpx solid $border-color;
        border-top-color: $primary-color;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      .loading-text {
        font-size: $font-size-sm;
        color: $text-tertiary;
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    // 触底提示
    .no-more {
      @include flex-center();
      align-items: center;
      padding: $spacing-sm;
      margin-top: $spacing-base;
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
  }
}

// 动画延迟
.product-item:nth-child(1) { animation-delay: 0ms; }
.product-item:nth-child(2) { animation-delay: 100ms; }
.product-item:nth-child(3) { animation-delay: 200ms; }
.product-item:nth-child(4) { animation-delay: 300ms; }
.product-item:nth-child(5) { animation-delay: 400ms; }
.product-item:nth-child(6) { animation-delay: 500ms; }

// 响应式适配
@media screen and (max-width: 750px) {
  .category-list {
    .category-item {
      gap: $spacing-xs;

      .category-name {
        font-size: $font-size-xs;
      }
    }
  }

  .products-grid {
    gap: $spacing-sm;

    .product-item {
      padding: $spacing-sm;

      .product-image-container {
        .product-image {
          height: 240rpx;
        }
      }
    }
  }
}
</style>
