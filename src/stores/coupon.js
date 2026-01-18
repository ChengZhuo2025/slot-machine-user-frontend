import { defineStore } from 'pinia'
import {
  getAvailableCoupons,
  receiveCoupon,
  getMyCoupons,
  getUsableCoupons,
  getCouponCount,
  getLimitedTimeCoupons
} from '@/services/coupon'
import { createCacheMeta, fetchWithFallback } from '@/services/cache'

/**
 * 优惠券状态管理Store
 * T016: 创建优惠券状态管理Store
 */
export const useCouponStore = defineStore('coupon', {
  state: () => ({
    // 可领取的优惠券列表
    availableCoupons: [],
    // 我的优惠券列表
    myCoupons: [],
    // 限时优惠券（首页展示）
    limitedTimeCoupons: [],
    // 可用优惠券（下单时）
    usableCoupons: [],
    // 优惠券数量统计
    couponCount: {
      total: 0,
      unused: 0,
      used: 0,
      expired: 0
    },
    // 加载状态
    loading: {
      available: false,
      mine: false,
      limited: false,
      usable: false
    },
    // 错误状态
    error: {
      available: null,
      mine: null,
      limited: null,
      usable: null
    },
    // 分页信息
    pagination: {
      available: { page: 1, pageSize: 10, total: 0, hasMore: true },
      mine: { page: 1, pageSize: 10, total: 0, hasMore: true }
    },
    // 缓存元数据（5分钟有效期，优惠券变化较快）
    cache: {
      available: createCacheMeta({ maxAge: 5 * 60 * 1000 }),
      mine: createCacheMeta({ maxAge: 5 * 60 * 1000 }),
      limited: createCacheMeta({ maxAge: 5 * 60 * 1000 })
    },
    // 正在领取的优惠券ID集合
    receivingCouponIds: new Set()
  }),

  getters: {
    // 是否有可领取的优惠券
    hasAvailableCoupons: (state) => state.availableCoupons.length > 0,
    // 是否有我的优惠券
    hasMyCoupons: (state) => state.myCoupons.length > 0,
    // 未使用的优惠券数量
    unusedCount: (state) => state.couponCount.unused,
    // 可领取缓存是否有效
    isAvailableCacheValid: (state) => state.cache.available.isValid,
    // 检查优惠券是否正在领取中
    isReceiving: (state) => (couponId) => state.receivingCouponIds.has(couponId)
  },

  actions: {
    /**
     * 获取可领取的优惠券
     * @param {object} options - 选项
     * @param {boolean} options.refresh - 是否刷新（从第一页开始）
     * @param {boolean} options.loadMore - 是否加载更多
     */
    async fetchAvailableCoupons(options = {}) {
      const { refresh = false, loadMore = false } = options

      // 缓存有效且不刷新、不加载更多，直接返回
      if (!refresh && !loadMore && this.cache.available.isValid && this.availableCoupons.length > 0) {
        return this.availableCoupons
      }

      // 刷新时重置分页
      if (refresh) {
        this.pagination.available.page = 1
        this.pagination.available.hasMore = true
      }

      // 加载更多时检查是否还有更多
      if (loadMore && !this.pagination.available.hasMore) {
        return this.availableCoupons
      }

      // 加载更多时页码+1
      if (loadMore) {
        this.pagination.available.page++
      }

      this.loading.available = true
      this.error.available = null

      try {
        const result = await getAvailableCoupons({
          page: this.pagination.available.page,
          page_size: this.pagination.available.pageSize
        })

        const list = result.list || result || []

        if (refresh || this.pagination.available.page === 1) {
          this.availableCoupons = list
        } else {
          this.availableCoupons = [...this.availableCoupons, ...list]
        }

        // 更新分页信息
        this.pagination.available.total = result.total || list.length
        this.pagination.available.hasMore = list.length >= this.pagination.available.pageSize

        // 更新缓存时间
        this.cache.available.update()

        return this.availableCoupons
      } catch (error) {
        this.error.available = error.message || '获取优惠券失败'
        throw error
      } finally {
        this.loading.available = false
      }
    },

    /**
     * 获取限时优惠券（首页展示）
     * @param {boolean} forceRefresh - 是否强制刷新
     */
    async fetchLimitedTimeCoupons(forceRefresh = false) {
      if (!forceRefresh && this.cache.limited.isValid && this.limitedTimeCoupons.length > 0) {
        return this.limitedTimeCoupons
      }

      this.loading.limited = true
      this.error.limited = null

      try {
        const result = await fetchWithFallback(
          () => getLimitedTimeCoupons(3),
          {
            cacheData: this.limitedTimeCoupons.length > 0 ? this.limitedTimeCoupons : null,
            useCacheFallback: true
          }
        )

        if (!result.isFromCache) {
          // 处理可能的响应格式
          this.limitedTimeCoupons = result.data?.list || result.data || []
          this.cache.limited.update()
        }

        return this.limitedTimeCoupons
      } catch (error) {
        this.error.limited = error.message || '获取限时优惠失败'
        throw error
      } finally {
        this.loading.limited = false
      }
    },

    /**
     * 领取优惠券
     * @param {number} couponId - 优惠券ID
     * @returns {Promise<{success: boolean, message: string}>}
     */
    async receiveCouponById(couponId) {
      // 防止重复领取
      if (this.receivingCouponIds.has(couponId)) {
        return { success: false, message: '正在领取中' }
      }

      this.receivingCouponIds.add(couponId)

      try {
        await receiveCoupon(couponId)

        // 更新本地状态
        const coupon = this.availableCoupons.find(c => c.id === couponId)
        if (coupon) {
          coupon.received_by_user = (coupon.received_by_user || 0) + 1
          coupon.received_count = (coupon.received_count || 0) + 1
          coupon.remain_count = Math.max(0, (coupon.remain_count || 0) - 1)
          // 检查是否还可领取
          coupon.can_receive = coupon.received_by_user < coupon.per_user_limit && coupon.remain_count > 0
        }

        // 同步更新限时优惠券列表
        const limitedCoupon = this.limitedTimeCoupons.find(c => c.id === couponId)
        if (limitedCoupon) {
          limitedCoupon.received_by_user = (limitedCoupon.received_by_user || 0) + 1
          limitedCoupon.received_count = (limitedCoupon.received_count || 0) + 1
          limitedCoupon.remain_count = Math.max(0, (limitedCoupon.remain_count || 0) - 1)
          limitedCoupon.can_receive = limitedCoupon.received_by_user < limitedCoupon.per_user_limit && limitedCoupon.remain_count > 0
        }

        // 使我的优惠券缓存失效
        this.cache.mine.invalidate()

        return { success: true, message: '领取成功' }
      } catch (error) {
        // 处理特定错误
        let message = '领取失败'
        if (error.message?.includes('已领取')) {
          message = '您已领取过该优惠券'
        } else if (error.message?.includes('已抢光') || error.message?.includes('已领完')) {
          message = '优惠券已被抢光'
        } else if (error.message?.includes('已过期')) {
          message = '优惠券已过期'
        } else if (error.message) {
          message = error.message
        }

        return { success: false, message }
      } finally {
        this.receivingCouponIds.delete(couponId)
      }
    },

    /**
     * 获取我的优惠券
     * @param {object} options - 选项
     * @param {number} options.status - 状态筛选
     * @param {boolean} options.refresh - 是否刷新
     * @param {boolean} options.loadMore - 是否加载更多
     */
    async fetchMyCoupons(options = {}) {
      const { status, refresh = false, loadMore = false } = options

      if (refresh) {
        this.pagination.mine.page = 1
        this.pagination.mine.hasMore = true
      }

      if (loadMore && !this.pagination.mine.hasMore) {
        return this.myCoupons
      }

      if (loadMore) {
        this.pagination.mine.page++
      }

      this.loading.mine = true
      this.error.mine = null

      try {
        const params = {
          page: this.pagination.mine.page,
          page_size: this.pagination.mine.pageSize
        }
        if (status !== undefined) {
          params.status = status
        }

        const result = await getMyCoupons(params)
        const list = result.list || result || []

        if (refresh || this.pagination.mine.page === 1) {
          this.myCoupons = list
        } else {
          this.myCoupons = [...this.myCoupons, ...list]
        }

        this.pagination.mine.total = result.total || list.length
        this.pagination.mine.hasMore = list.length >= this.pagination.mine.pageSize

        this.cache.mine.update()

        return this.myCoupons
      } catch (error) {
        this.error.mine = error.message || '获取我的优惠券失败'
        throw error
      } finally {
        this.loading.mine = false
      }
    },

    /**
     * 获取可用优惠券（下单时）
     * @param {number} amount - 订单金额
     * @param {string} scope - 适用范围
     */
    async fetchUsableCoupons(amount, scope) {
      this.loading.usable = true
      this.error.usable = null

      try {
        const result = await getUsableCoupons({ amount, scope })
        this.usableCoupons = result.list || result || []
        return this.usableCoupons
      } catch (error) {
        this.error.usable = error.message || '获取可用优惠券失败'
        throw error
      } finally {
        this.loading.usable = false
      }
    },

    /**
     * 获取优惠券数量统计
     */
    async fetchCouponCount() {
      try {
        const result = await getCouponCount()
        this.couponCount = {
          total: result.total || 0,
          unused: result.unused || 0,
          used: result.used || 0,
          expired: result.expired || 0
        }
        return this.couponCount
      } catch (error) {
        console.error('获取优惠券数量失败:', error)
        return this.couponCount
      }
    },

    /**
     * 使缓存失效
     */
    invalidateCache(type = 'all') {
      if (type === 'all') {
        this.cache.available.invalidate()
        this.cache.mine.invalidate()
        this.cache.limited.invalidate()
      } else if (this.cache[type]) {
        this.cache[type].invalidate()
      }
    },

    /**
     * 重置状态
     */
    reset() {
      this.availableCoupons = []
      this.myCoupons = []
      this.limitedTimeCoupons = []
      this.usableCoupons = []
      this.couponCount = { total: 0, unused: 0, used: 0, expired: 0 }
      this.loading = { available: false, mine: false, limited: false, usable: false }
      this.error = { available: null, mine: null, limited: null, usable: null }
      this.pagination = {
        available: { page: 1, pageSize: 10, total: 0, hasMore: true },
        mine: { page: 1, pageSize: 10, total: 0, hasMore: true }
      }
      this.invalidateCache('all')
      this.receivingCouponIds.clear()
    }
  }
})

export default useCouponStore
