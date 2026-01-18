import { defineStore } from 'pinia'
import {
  getProductCategories,
  getProductList,
  getProductDetail,
  getSelectedProducts,
  getHotProducts,
  searchProducts
} from '@/services/mall'
import { createCacheMeta, fetchWithFallback } from '@/services/cache'

/**
 * 商城状态管理Store
 * T014: 创建或更新商城状态管理Store（含缓存机制和分页状态）
 */
export const useMallStore = defineStore('mall', {
  state: () => ({
    // 商品分类列表
    categories: [],
    // 商品列表
    products: [],
    // 精选商品
    selectedProducts: [],
    // 热门商品
    hotProducts: [],
    // 搜索结果
    searchResults: [],
    // 当前商品详情
    currentProduct: null,
    // 当前选中的分类ID
    currentCategoryId: null,
    // 加载状态
    loading: {
      categories: false,
      products: false,
      selected: false,
      hot: false,
      search: false,
      detail: false
    },
    // 错误状态
    error: {
      categories: null,
      products: null,
      selected: null,
      hot: null,
      search: null,
      detail: null
    },
    // 分页信息
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0,
      hasMore: true
    },
    // 搜索分页
    searchPagination: {
      page: 1,
      pageSize: 10,
      total: 0,
      hasMore: true
    },
    // 筛选和排序
    filters: {
      keyword: '',
      sortType: 'default' // default, newest, sales, price_asc, price_desc
    },
    // 缓存元数据
    cache: {
      categories: createCacheMeta({ maxAge: 30 * 60 * 1000 }), // 分类缓存30分钟
      products: createCacheMeta({ maxAge: 10 * 60 * 1000 }),
      selected: createCacheMeta({ maxAge: 10 * 60 * 1000 }),
      hot: createCacheMeta({ maxAge: 10 * 60 * 1000 })
    },
    // 是否使用缓存数据
    isFromCache: {
      categories: false,
      products: false,
      selected: false,
      hot: false
    }
  }),

  getters: {
    // 是否有分类数据
    hasCategories: (state) => state.categories.length > 0,
    // 是否有商品数据
    hasProducts: (state) => state.products.length > 0,
    // 是否有精选商品
    hasSelectedProducts: (state) => state.selectedProducts.length > 0,
    // 是否有热门商品
    hasHotProducts: (state) => state.hotProducts.length > 0,
    // 分类缓存是否有效
    isCategoriesCacheValid: (state) => state.cache.categories.isValid,
    // 精选商品缓存是否有效
    isSelectedCacheValid: (state) => state.cache.selected.isValid,
    // 是否正在加载商品
    isProductsLoading: (state) => state.loading.products,
    // 是否还有更多商品
    hasMoreProducts: (state) => state.pagination.hasMore,
    // 是否正在搜索
    isSearching: (state) => state.loading.search,
    // 一级分类列表
    topCategories: (state) => state.categories.filter(c => c.level === 1 || !c.parent_id)
  },

  actions: {
    /**
     * 获取商品分类
     * @param {boolean} forceRefresh - 是否强制刷新
     */
    async fetchCategories(forceRefresh = false) {
      if (!forceRefresh && this.cache.categories.isValid && this.categories.length > 0) {
        return this.categories
      }

      this.loading.categories = true
      this.error.categories = null
      this.isFromCache.categories = false

      try {
        const result = await fetchWithFallback(
          () => getProductCategories(),
          {
            cacheData: this.categories.length > 0 ? this.categories : null,
            useCacheFallback: true,
            onCacheFallback: () => {
              this.isFromCache.categories = true
            }
          }
        )

        if (!result.isFromCache) {
          this.categories = result.data?.list || result.data || []
          this.cache.categories.update()
        }

        return this.categories
      } catch (error) {
        this.error.categories = error.message || '获取分类失败'
        throw error
      } finally {
        this.loading.categories = false
      }
    },

    /**
     * 获取精选商品
     * @param {boolean} forceRefresh - 是否强制刷新
     * @param {number} limit - 数量限制
     */
    async fetchSelectedProducts(forceRefresh = false, limit = 6) {
      if (!forceRefresh && this.cache.selected.isValid && this.selectedProducts.length > 0) {
        return this.selectedProducts
      }

      this.loading.selected = true
      this.error.selected = null
      this.isFromCache.selected = false

      try {
        const result = await fetchWithFallback(
          () => getSelectedProducts({ limit }),
          {
            cacheData: this.selectedProducts.length > 0 ? this.selectedProducts : null,
            useCacheFallback: true,
            onCacheFallback: () => {
              this.isFromCache.selected = true
            }
          }
        )

        if (!result.isFromCache) {
          this.selectedProducts = result.data?.list || result.data || []
          this.cache.selected.update()
        }

        return this.selectedProducts
      } catch (error) {
        this.error.selected = error.message || '获取精选商品失败'
        throw error
      } finally {
        this.loading.selected = false
      }
    },

    /**
     * 获取热门商品
     * @param {boolean} forceRefresh - 是否强制刷新
     * @param {number} limit - 数量限制
     */
    async fetchHotProducts(forceRefresh = false, limit = 10) {
      if (!forceRefresh && this.cache.hot.isValid && this.hotProducts.length > 0) {
        return this.hotProducts
      }

      this.loading.hot = true
      this.error.hot = null

      try {
        const result = await fetchWithFallback(
          () => getHotProducts({ limit }),
          {
            cacheData: this.hotProducts.length > 0 ? this.hotProducts : null,
            useCacheFallback: true
          }
        )

        if (!result.isFromCache) {
          this.hotProducts = result.data?.list || result.data || []
          this.cache.hot.update()
        }

        return this.hotProducts
      } catch (error) {
        this.error.hot = error.message || '获取热门商品失败'
        throw error
      } finally {
        this.loading.hot = false
      }
    },

    /**
     * 获取商品列表
     * @param {object} options - 选项
     * @param {boolean} options.refresh - 是否刷新
     * @param {boolean} options.loadMore - 是否加载更多
     * @param {number} options.categoryId - 分类ID
     */
    async fetchProducts(options = {}) {
      const { refresh = false, loadMore = false, categoryId } = options

      // 如果分类变化，重置分页
      if (categoryId !== undefined && categoryId !== this.currentCategoryId) {
        this.currentCategoryId = categoryId
        this.pagination.page = 1
        this.pagination.hasMore = true
        this.products = []
      }

      if (refresh) {
        this.pagination.page = 1
        this.pagination.hasMore = true
      }

      if (loadMore && !this.pagination.hasMore) {
        return this.products
      }

      if (loadMore) {
        this.pagination.page++
      }

      this.loading.products = true
      this.error.products = null

      try {
        const params = {
          page: this.pagination.page,
          page_size: this.pagination.pageSize
        }

        // 添加分类筛选
        if (this.currentCategoryId) {
          params.category_id = this.currentCategoryId
        }

        // 添加排序
        if (this.filters.sortType !== 'default') {
          params.sort = this.filters.sortType
        }

        const result = await getProductList(params)
        const list = result.list || result || []

        if (refresh || this.pagination.page === 1) {
          this.products = list
        } else {
          this.products = [...this.products, ...list]
        }

        this.pagination.total = result.total || list.length
        this.pagination.hasMore = list.length >= this.pagination.pageSize

        this.cache.products.update()

        return this.products
      } catch (error) {
        this.error.products = error.message || '获取商品列表失败'
        throw error
      } finally {
        this.loading.products = false
      }
    },

    /**
     * 搜索商品
     * @param {string} keyword - 搜索关键词
     * @param {object} options - 选项
     */
    async searchProductsByKeyword(keyword, options = {}) {
      const { refresh = true, loadMore = false } = options

      this.filters.keyword = keyword

      if (refresh) {
        this.searchPagination.page = 1
        this.searchPagination.hasMore = true
        this.searchResults = []
      }

      if (loadMore && !this.searchPagination.hasMore) {
        return this.searchResults
      }

      if (loadMore) {
        this.searchPagination.page++
      }

      if (!keyword.trim()) {
        this.searchResults = []
        return this.searchResults
      }

      this.loading.search = true
      this.error.search = null

      try {
        const params = {
          page: this.searchPagination.page,
          page_size: this.searchPagination.pageSize
        }

        if (this.filters.sortType !== 'default') {
          params.sort = this.filters.sortType
        }

        const result = await searchProducts(keyword, params)
        const list = result.list || result || []

        if (refresh || this.searchPagination.page === 1) {
          this.searchResults = list
        } else {
          this.searchResults = [...this.searchResults, ...list]
        }

        this.searchPagination.total = result.total || list.length
        this.searchPagination.hasMore = list.length >= this.searchPagination.pageSize

        return this.searchResults
      } catch (error) {
        this.error.search = error.message || '搜索失败'
        throw error
      } finally {
        this.loading.search = false
      }
    },

    /**
     * 设置排序方式
     * @param {string} sortType - 排序类型
     */
    setSortType(sortType) {
      if (this.filters.sortType !== sortType) {
        this.filters.sortType = sortType
        // 重新加载商品列表
        this.fetchProducts({ refresh: true })
      }
    },

    /**
     * 切换分类
     * @param {number} categoryId - 分类ID
     */
    async switchCategory(categoryId) {
      return this.fetchProducts({ categoryId, refresh: true })
    },

    /**
     * 获取商品详情
     * @param {number} productId - 商品ID
     */
    async fetchProductDetail(productId) {
      this.loading.detail = true
      this.error.detail = null

      try {
        const result = await getProductDetail(productId)
        this.currentProduct = result
        return result
      } catch (error) {
        this.error.detail = error.message || '获取商品详情失败'
        throw error
      } finally {
        this.loading.detail = false
      }
    },

    /**
     * 使缓存失效
     */
    invalidateCache(type = 'all') {
      if (type === 'all') {
        Object.values(this.cache).forEach(c => c.invalidate())
      } else if (this.cache[type]) {
        this.cache[type].invalidate()
      }
    },

    /**
     * 重置筛选条件
     */
    resetFilters() {
      this.filters = {
        keyword: '',
        sortType: 'default'
      }
      this.currentCategoryId = null
    },

    /**
     * 重置状态
     */
    reset() {
      this.categories = []
      this.products = []
      this.selectedProducts = []
      this.hotProducts = []
      this.searchResults = []
      this.currentProduct = null
      this.currentCategoryId = null
      this.loading = {
        categories: false,
        products: false,
        selected: false,
        hot: false,
        search: false,
        detail: false
      }
      this.error = {
        categories: null,
        products: null,
        selected: null,
        hot: null,
        search: null,
        detail: null
      }
      this.pagination = { page: 1, pageSize: 10, total: 0, hasMore: true }
      this.searchPagination = { page: 1, pageSize: 10, total: 0, hasMore: true }
      this.resetFilters()
      this.invalidateCache('all')
    }
  }
})

export default useMallStore
