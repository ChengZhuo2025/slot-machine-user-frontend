import { defineStore } from 'pinia'
import {
  getHotelList,
  getHotelDetail,
  getRecommendHotels,
  getNearbyHotels,
  searchHotels,
  getHotelRooms,
  getRoomDetail,
  getHotRooms
} from '@/services/hotel'
import { createCacheMeta, fetchWithFallback } from '@/services/cache'

/**
 * 酒店状态管理Store
 * T012: 创建或更新酒店状态管理Store（含缓存机制）
 */
export const useHotelStore = defineStore('hotel', {
  state: () => ({
    // 酒店列表
    hotels: [],
    // 推荐酒店
    recommendedHotels: [],
    // 附近酒店
    nearbyHotels: [],
    // 热门房型
    hotRooms: [],
    // 当前酒店详情
    currentHotel: null,
    // 当前酒店房型列表
    currentHotelRooms: [],
    // 当前房型详情
    currentRoom: null,
    // 加载状态
    loading: {
      list: false,
      recommended: false,
      nearby: false,
      hotRooms: false,
      detail: false,
      rooms: false
    },
    // 错误状态
    error: {
      list: null,
      recommended: null,
      nearby: null,
      hotRooms: null,
      detail: null,
      rooms: null
    },
    // 分页信息
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0,
      hasMore: true
    },
    // 筛选条件
    filters: {
      keyword: '',
      categoryId: null,
      sortType: 'default', // default, distance, price_asc, price_desc, rating
      location: null // { longitude, latitude }
    },
    // 缓存元数据
    cache: {
      list: createCacheMeta({ maxAge: 10 * 60 * 1000 }),
      recommended: createCacheMeta({ maxAge: 10 * 60 * 1000 }),
      nearby: createCacheMeta({ maxAge: 5 * 60 * 1000 }), // 位置相关缓存短一点
      hotRooms: createCacheMeta({ maxAge: 10 * 60 * 1000 })
    },
    // 是否使用缓存数据
    isFromCache: {
      list: false,
      recommended: false,
      nearby: false,
      hotRooms: false
    }
  }),

  getters: {
    // 是否有酒店列表
    hasHotels: (state) => state.hotels.length > 0,
    // 是否有推荐酒店
    hasRecommendedHotels: (state) => state.recommendedHotels.length > 0,
    // 是否有附近酒店
    hasNearbyHotels: (state) => state.nearbyHotels.length > 0,
    // 是否有热门房型
    hasHotRooms: (state) => state.hotRooms.length > 0,
    // 推荐酒店缓存是否有效
    isRecommendedCacheValid: (state) => state.cache.recommended.isValid,
    // 热门房型缓存是否有效
    isHotRoomsCacheValid: (state) => state.cache.hotRooms.isValid,
    // 是否正在加载列表
    isListLoading: (state) => state.loading.list,
    // 酒店列表是否还有更多
    hasMoreHotels: (state) => state.pagination.hasMore
  },

  actions: {
    /**
     * 获取推荐酒店
     * @param {boolean} forceRefresh - 是否强制刷新
     * @param {number} limit - 数量限制
     */
    async fetchRecommendedHotels(forceRefresh = false, limit = 6) {
      if (!forceRefresh && this.cache.recommended.isValid && this.recommendedHotels.length > 0) {
        return this.recommendedHotels
      }

      this.loading.recommended = true
      this.error.recommended = null
      this.isFromCache.recommended = false

      try {
        const result = await fetchWithFallback(
          () => getRecommendHotels({ limit }),
          {
            cacheData: this.recommendedHotels.length > 0 ? this.recommendedHotels : null,
            useCacheFallback: true,
            onCacheFallback: () => {
              this.isFromCache.recommended = true
            }
          }
        )

        if (!result.isFromCache) {
          this.recommendedHotels = result.data || []
          this.cache.recommended.update()
        }

        return this.recommendedHotels
      } catch (error) {
        this.error.recommended = error.message || '获取推荐酒店失败'
        throw error
      } finally {
        this.loading.recommended = false
      }
    },

    /**
     * 获取附近酒店
     * @param {object} location - 位置信息 { longitude, latitude }
     * @param {boolean} forceRefresh - 是否强制刷新
     */
    async fetchNearbyHotels(location, forceRefresh = false) {
      if (!location?.longitude || !location?.latitude) {
        console.warn('需要提供位置信息')
        return []
      }

      // 检查位置是否变化
      const locationChanged = this.filters.location?.longitude !== location.longitude ||
                             this.filters.location?.latitude !== location.latitude

      if (!forceRefresh && !locationChanged && this.cache.nearby.isValid && this.nearbyHotels.length > 0) {
        return this.nearbyHotels
      }

      this.loading.nearby = true
      this.error.nearby = null
      this.isFromCache.nearby = false
      this.filters.location = location

      try {
        const result = await fetchWithFallback(
          () => getNearbyHotels({
            longitude: location.longitude,
            latitude: location.latitude,
            radius_km: 10,
            page_size: 6
          }),
          {
            cacheData: this.nearbyHotels.length > 0 ? this.nearbyHotels : null,
            useCacheFallback: true,
            onCacheFallback: () => {
              this.isFromCache.nearby = true
            }
          }
        )

        if (!result.isFromCache) {
          // 处理响应格式
          this.nearbyHotels = result.data?.list || result.data || []
          this.cache.nearby.update()
        }

        return this.nearbyHotels
      } catch (error) {
        this.error.nearby = error.message || '获取附近酒店失败'
        throw error
      } finally {
        this.loading.nearby = false
      }
    },

    /**
     * 获取热门房型
     * @param {boolean} forceRefresh - 是否强制刷新
     * @param {number} limit - 数量限制
     */
    async fetchHotRooms(forceRefresh = false, limit = 6) {
      if (!forceRefresh && this.cache.hotRooms.isValid && this.hotRooms.length > 0) {
        return this.hotRooms
      }

      this.loading.hotRooms = true
      this.error.hotRooms = null
      this.isFromCache.hotRooms = false

      try {
        const result = await fetchWithFallback(
          () => getHotRooms({ limit }),
          {
            cacheData: this.hotRooms.length > 0 ? this.hotRooms : null,
            useCacheFallback: true,
            onCacheFallback: () => {
              this.isFromCache.hotRooms = true
            }
          }
        )

        if (!result.isFromCache) {
          this.hotRooms = result.data || []
          this.cache.hotRooms.update()
        }

        return this.hotRooms
      } catch (error) {
        this.error.hotRooms = error.message || '获取热门房型失败'
        throw error
      } finally {
        this.loading.hotRooms = false
      }
    },

    /**
     * 获取酒店列表
     * @param {object} options - 选项
     * @param {boolean} options.refresh - 是否刷新
     * @param {boolean} options.loadMore - 是否加载更多
     */
    async fetchHotelList(options = {}) {
      const { refresh = false, loadMore = false } = options

      if (refresh) {
        this.pagination.page = 1
        this.pagination.hasMore = true
      }

      if (loadMore && !this.pagination.hasMore) {
        return this.hotels
      }

      if (loadMore) {
        this.pagination.page++
      }

      this.loading.list = true
      this.error.list = null

      try {
        const params = {
          page: this.pagination.page,
          page_size: this.pagination.pageSize
        }

        // 添加筛选条件
        if (this.filters.keyword) {
          params.keyword = this.filters.keyword
        }
        if (this.filters.categoryId) {
          params.category_id = this.filters.categoryId
        }
        if (this.filters.location) {
          params.longitude = this.filters.location.longitude
          params.latitude = this.filters.location.latitude
        }
        if (this.filters.sortType !== 'default') {
          params.sort = this.filters.sortType
        }

        const result = await getHotelList(params)
        const list = result.list || result || []

        if (refresh || this.pagination.page === 1) {
          this.hotels = list
        } else {
          this.hotels = [...this.hotels, ...list]
        }

        this.pagination.total = result.total || list.length
        this.pagination.hasMore = list.length >= this.pagination.pageSize

        this.cache.list.update()

        return this.hotels
      } catch (error) {
        this.error.list = error.message || '获取酒店列表失败'
        throw error
      } finally {
        this.loading.list = false
      }
    },

    /**
     * 搜索酒店
     * @param {string} keyword - 搜索关键词
     */
    async searchHotelsByKeyword(keyword) {
      this.filters.keyword = keyword
      return this.fetchHotelList({ refresh: true })
    },

    /**
     * 设置筛选条件
     * @param {object} filters - 筛选条件
     */
    setFilters(filters) {
      Object.assign(this.filters, filters)
    },

    /**
     * 获取酒店详情
     * @param {number} hotelId - 酒店ID
     */
    async fetchHotelDetail(hotelId) {
      this.loading.detail = true
      this.error.detail = null

      try {
        const result = await getHotelDetail(hotelId)
        this.currentHotel = result
        return result
      } catch (error) {
        this.error.detail = error.message || '获取酒店详情失败'
        throw error
      } finally {
        this.loading.detail = false
      }
    },

    /**
     * 获取酒店房型列表
     * @param {number} hotelId - 酒店ID
     */
    async fetchHotelRooms(hotelId) {
      this.loading.rooms = true
      this.error.rooms = null

      try {
        const result = await getHotelRooms(hotelId)
        this.currentHotelRooms = result.list || result || []
        return this.currentHotelRooms
      } catch (error) {
        this.error.rooms = error.message || '获取房型列表失败'
        throw error
      } finally {
        this.loading.rooms = false
      }
    },

    /**
     * 获取房型详情
     * @param {number} roomId - 房型ID
     */
    async fetchRoomDetail(roomId) {
      try {
        const result = await getRoomDetail(roomId)
        this.currentRoom = result
        return result
      } catch (error) {
        console.error('获取房型详情失败:', error)
        throw error
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
        categoryId: null,
        sortType: 'default',
        location: null
      }
    },

    /**
     * 重置状态
     */
    reset() {
      this.hotels = []
      this.recommendedHotels = []
      this.nearbyHotels = []
      this.hotRooms = []
      this.currentHotel = null
      this.currentHotelRooms = []
      this.currentRoom = null
      this.loading = {
        list: false,
        recommended: false,
        nearby: false,
        hotRooms: false,
        detail: false,
        rooms: false
      }
      this.error = {
        list: null,
        recommended: null,
        nearby: null,
        hotRooms: null,
        detail: null,
        rooms: null
      }
      this.pagination = { page: 1, pageSize: 10, total: 0, hasMore: true }
      this.resetFilters()
      this.invalidateCache('all')
    }
  }
})

export default useHotelStore
