/**
 * 缓存管理服务
 * T008: 创建缓存管理服务，实现时间戳验证、缓存有效性检查
 */

// 默认缓存有效期: 10分钟
const DEFAULT_MAX_AGE = 10 * 60 * 1000

/**
 * 缓存条目结构
 * @typedef {Object} CacheEntry
 * @property {any} data - 缓存的数据
 * @property {number} timestamp - 缓存时间戳
 * @property {number} maxAge - 缓存有效期(毫秒)
 */

/**
 * 缓存管理器类
 */
class CacheManager {
  constructor(options = {}) {
    this.defaultMaxAge = options.maxAge || DEFAULT_MAX_AGE
    // 内存缓存存储
    this.memoryCache = new Map()
    // 持久化前缀
    this.storagePrefix = options.storagePrefix || 'cache_'
  }

  /**
   * 生成缓存键
   * @param {string} module - 模块名
   * @param {string} key - 键名
   * @returns {string}
   */
  generateKey(module, key) {
    return `${module}:${key}`
  }

  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {any} data - 缓存数据
   * @param {object} options - 选项
   * @param {number} options.maxAge - 自定义有效期
   * @param {boolean} options.persist - 是否持久化到Storage
   */
  set(key, data, options = {}) {
    const { maxAge = this.defaultMaxAge, persist = false } = options

    const entry = {
      data,
      timestamp: Date.now(),
      maxAge
    }

    // 存入内存
    this.memoryCache.set(key, entry)

    // 持久化到Storage
    if (persist) {
      try {
        uni.setStorageSync(this.storagePrefix + key, JSON.stringify(entry))
      } catch (e) {
        console.warn('Cache persist failed:', e)
      }
    }
  }

  /**
   * 获取缓存
   * @param {string} key - 缓存键
   * @param {object} options - 选项
   * @param {boolean} options.checkStorage - 是否检查Storage
   * @returns {any|null} 缓存数据，过期或不存在返回null
   */
  get(key, options = {}) {
    const { checkStorage = true } = options

    // 先从内存获取
    let entry = this.memoryCache.get(key)

    // 内存没有，尝试从Storage获取
    if (!entry && checkStorage) {
      try {
        const stored = uni.getStorageSync(this.storagePrefix + key)
        if (stored) {
          entry = JSON.parse(stored)
          // 恢复到内存
          this.memoryCache.set(key, entry)
        }
      } catch (e) {
        console.warn('Cache restore failed:', e)
      }
    }

    if (!entry) return null

    // 检查是否过期
    if (this.isExpired(entry)) {
      this.remove(key)
      return null
    }

    return entry.data
  }

  /**
   * 获取缓存（包含元数据）
   * @param {string} key - 缓存键
   * @returns {CacheEntry|null}
   */
  getEntry(key) {
    const entry = this.memoryCache.get(key)
    if (!entry) return null
    if (this.isExpired(entry)) {
      this.remove(key)
      return null
    }
    return entry
  }

  /**
   * 检查缓存是否过期
   * @param {CacheEntry} entry - 缓存条目
   * @returns {boolean}
   */
  isExpired(entry) {
    if (!entry || !entry.timestamp) return true
    return Date.now() - entry.timestamp > entry.maxAge
  }

  /**
   * 检查缓存是否有效
   * @param {string} key - 缓存键
   * @returns {boolean}
   */
  isValid(key) {
    const entry = this.memoryCache.get(key)
    return entry && !this.isExpired(entry)
  }

  /**
   * 获取缓存剩余有效时间（毫秒）
   * @param {string} key - 缓存键
   * @returns {number} 剩余时间，已过期返回0
   */
  getTimeToLive(key) {
    const entry = this.memoryCache.get(key)
    if (!entry) return 0

    const elapsed = Date.now() - entry.timestamp
    const remaining = entry.maxAge - elapsed
    return remaining > 0 ? remaining : 0
  }

  /**
   * 移除缓存
   * @param {string} key - 缓存键
   */
  remove(key) {
    this.memoryCache.delete(key)
    try {
      uni.removeStorageSync(this.storagePrefix + key)
    } catch (e) {
      // 忽略
    }
  }

  /**
   * 清除模块下所有缓存
   * @param {string} module - 模块名
   */
  clearModule(module) {
    const prefix = `${module}:`
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        this.remove(key)
      }
    }
  }

  /**
   * 清除所有缓存
   */
  clear() {
    this.memoryCache.clear()
    // 清除Storage中的缓存
    try {
      const info = uni.getStorageInfoSync()
      const keys = info.keys || []
      keys.forEach(key => {
        if (key.startsWith(this.storagePrefix)) {
          uni.removeStorageSync(key)
        }
      })
    } catch (e) {
      console.warn('Cache clear failed:', e)
    }
  }

  /**
   * 获取缓存统计信息
   * @returns {object}
   */
  getStats() {
    let validCount = 0
    let expiredCount = 0

    for (const [key, entry] of this.memoryCache) {
      if (this.isExpired(entry)) {
        expiredCount++
      } else {
        validCount++
      }
    }

    return {
      total: this.memoryCache.size,
      valid: validCount,
      expired: expiredCount
    }
  }
}

/**
 * 创建缓存元数据对象（用于Store）
 * @param {object} options - 选项
 * @param {number} options.maxAge - 有效期
 * @returns {object}
 */
export function createCacheMeta(options = {}) {
  const { maxAge = DEFAULT_MAX_AGE } = options
  return {
    timestamp: 0,
    maxAge,
    get isValid() {
      if (this.timestamp === 0) return false
      return Date.now() - this.timestamp < this.maxAge
    },
    get timeToLive() {
      if (this.timestamp === 0) return 0
      const remaining = this.maxAge - (Date.now() - this.timestamp)
      return remaining > 0 ? remaining : 0
    },
    update() {
      this.timestamp = Date.now()
    },
    invalidate() {
      this.timestamp = 0
    }
  }
}

/**
 * 带降级策略的数据获取
 * @param {Function} fetchFn - 数据获取函数
 * @param {object} options - 选项
 * @param {any} options.cacheData - 缓存数据
 * @param {boolean} options.useCacheFallback - 是否使用缓存降级
 * @param {Function} options.onCacheFallback - 降级时的回调
 * @returns {Promise<{data: any, isFromCache: boolean}>}
 */
export async function fetchWithFallback(fetchFn, options = {}) {
  const { cacheData, useCacheFallback = true, onCacheFallback } = options

  try {
    const data = await fetchFn()
    return { data, isFromCache: false }
  } catch (error) {
    // 网络失败，尝试使用缓存
    if (useCacheFallback && cacheData) {
      if (onCacheFallback) {
        onCacheFallback()
      } else {
        uni.showToast({
          title: '网络异常，展示的可能不是最新数据',
          icon: 'none',
          duration: 2000
        })
      }
      return { data: cacheData, isFromCache: true }
    }
    throw error
  }
}

// 创建默认实例
export const cacheManager = new CacheManager()

// 导出类
export { CacheManager }

export default cacheManager
