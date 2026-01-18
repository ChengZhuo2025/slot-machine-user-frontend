import { defineStore } from 'pinia'
import { getHomeBanners, getMallBanners, getHotelBanners } from '@/services/banner'
import { createCacheMeta, fetchWithFallback } from '@/services/cache'

/**
 * Banner状态管理Store
 * T010: 创建Banner状态管理Store（含缓存机制）
 */
export const useBannerStore = defineStore('banner', {
  state: () => ({
    // 首页Banner列表
    homeBanners: [],
    // 商城Banner列表
    mallBanners: [],
    // 酒店Banner列表
    hotelBanners: [],
    // 加载状态
    loading: {
      home: false,
      mall: false,
      hotel: false
    },
    // 错误状态
    error: {
      home: null,
      mall: null,
      hotel: null
    },
    // 缓存元数据（10分钟有效期）
    cache: {
      home: createCacheMeta({ maxAge: 10 * 60 * 1000 }),
      mall: createCacheMeta({ maxAge: 10 * 60 * 1000 }),
      hotel: createCacheMeta({ maxAge: 10 * 60 * 1000 })
    },
    // 是否使用缓存数据
    isFromCache: {
      home: false,
      mall: false,
      hotel: false
    }
  }),

  getters: {
    // 首页Banner是否有效
    isHomeCacheValid: (state) => state.cache.home.isValid,
    // 商城Banner是否有效
    isMallCacheValid: (state) => state.cache.mall.isValid,
    // 酒店Banner是否有效
    isHotelCacheValid: (state) => state.cache.hotel.isValid,
    // 是否有首页Banner数据
    hasHomeBanners: (state) => state.homeBanners.length > 0,
    // 是否有商城Banner数据
    hasMallBanners: (state) => state.mallBanners.length > 0,
    // 是否有酒店Banner数据
    hasHotelBanners: (state) => state.hotelBanners.length > 0
  },

  actions: {
    /**
     * 获取首页Banner
     * @param {boolean} forceRefresh - 是否强制刷新
     */
    async fetchHomeBanners(forceRefresh = false) {
      // 如果缓存有效且不强制刷新，直接返回
      if (!forceRefresh && this.cache.home.isValid && this.homeBanners.length > 0) {
        return this.homeBanners
      }

      this.loading.home = true
      this.error.home = null
      this.isFromCache.home = false

      try {
        const result = await fetchWithFallback(
          () => getHomeBanners(),
          {
            cacheData: this.homeBanners.length > 0 ? this.homeBanners : null,
            useCacheFallback: true,
            onCacheFallback: () => {
              this.isFromCache.home = true
            }
          }
        )

        if (!result.isFromCache) {
          this.homeBanners = result.data || []
          this.cache.home.update()
        }

        return this.homeBanners
      } catch (error) {
        this.error.home = error.message || '获取Banner失败'
        throw error
      } finally {
        this.loading.home = false
      }
    },

    /**
     * 获取商城Banner
     * @param {boolean} forceRefresh - 是否强制刷新
     */
    async fetchMallBanners(forceRefresh = false) {
      if (!forceRefresh && this.cache.mall.isValid && this.mallBanners.length > 0) {
        return this.mallBanners
      }

      this.loading.mall = true
      this.error.mall = null
      this.isFromCache.mall = false

      try {
        const result = await fetchWithFallback(
          () => getMallBanners(),
          {
            cacheData: this.mallBanners.length > 0 ? this.mallBanners : null,
            useCacheFallback: true,
            onCacheFallback: () => {
              this.isFromCache.mall = true
            }
          }
        )

        if (!result.isFromCache) {
          this.mallBanners = result.data || []
          this.cache.mall.update()
        }

        return this.mallBanners
      } catch (error) {
        this.error.mall = error.message || '获取Banner失败'
        throw error
      } finally {
        this.loading.mall = false
      }
    },

    /**
     * 获取酒店Banner
     * @param {boolean} forceRefresh - 是否强制刷新
     */
    async fetchHotelBanners(forceRefresh = false) {
      if (!forceRefresh && this.cache.hotel.isValid && this.hotelBanners.length > 0) {
        return this.hotelBanners
      }

      this.loading.hotel = true
      this.error.hotel = null
      this.isFromCache.hotel = false

      try {
        const result = await fetchWithFallback(
          () => getHotelBanners(),
          {
            cacheData: this.hotelBanners.length > 0 ? this.hotelBanners : null,
            useCacheFallback: true,
            onCacheFallback: () => {
              this.isFromCache.hotel = true
            }
          }
        )

        if (!result.isFromCache) {
          this.hotelBanners = result.data || []
          this.cache.hotel.update()
        }

        return this.hotelBanners
      } catch (error) {
        this.error.hotel = error.message || '获取Banner失败'
        throw error
      } finally {
        this.loading.hotel = false
      }
    },

    /**
     * 使缓存失效
     * @param {string} position - 位置: home|mall|hotel|all
     */
    invalidateCache(position = 'all') {
      if (position === 'all') {
        this.cache.home.invalidate()
        this.cache.mall.invalidate()
        this.cache.hotel.invalidate()
      } else if (this.cache[position]) {
        this.cache[position].invalidate()
      }
    },

    /**
     * 重置状态
     */
    reset() {
      this.homeBanners = []
      this.mallBanners = []
      this.hotelBanners = []
      this.loading = { home: false, mall: false, hotel: false }
      this.error = { home: null, mall: null, hotel: null }
      this.invalidateCache('all')
    }
  }
})

export default useBannerStore
