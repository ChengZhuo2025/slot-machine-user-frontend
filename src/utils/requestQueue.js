/**
 * 请求队列管理器
 * T002: 创建请求队列管理器，用于处理请求竞态条件
 */

class RequestQueue {
  constructor() {
    // 存储待处理的请求：key -> AbortController
    this.pendingRequests = new Map()
  }

  /**
   * 生成请求标识
   * @param {string} module - 模块名称 (如 'product', 'hotel')
   * @param {string} action - 操作类型 (如 'list', 'search')
   * @param {object} params - 请求参数
   * @returns {string} 请求唯一标识
   */
  generateKey(module, action, params = {}) {
    const paramStr = Object.entries(params)
      .filter(([key, value]) => value !== undefined && value !== null)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&')
    return `${module}-${action}${paramStr ? `-${paramStr}` : ''}`
  }

  /**
   * 取消指定的请求
   * @param {string} requestKey - 请求标识
   * @returns {boolean} 是否成功取消
   */
  cancel(requestKey) {
    const controller = this.pendingRequests.get(requestKey)
    if (controller) {
      try {
        controller.abort()
      } catch (e) {
        // 忽略 abort 错误
      }
      this.pendingRequests.delete(requestKey)
      return true
    }
    return false
  }

  /**
   * 取消同模块的所有请求
   * @param {string} module - 模块名称
   */
  cancelByModule(module) {
    const keysToCancel = []
    for (const key of this.pendingRequests.keys()) {
      if (key.startsWith(`${module}-`)) {
        keysToCancel.push(key)
      }
    }
    keysToCancel.forEach(key => this.cancel(key))
  }

  /**
   * 注册新请求
   * 会自动取消之前同key的请求
   * @param {string} requestKey - 请求标识
   * @returns {AbortController} 新创建的AbortController
   */
  register(requestKey) {
    // 先取消旧的同类请求
    this.cancel(requestKey)

    // 创建新的 AbortController
    const controller = new AbortController()
    this.pendingRequests.set(requestKey, controller)

    return controller
  }

  /**
   * 请求完成后移除
   * @param {string} requestKey - 请求标识
   */
  remove(requestKey) {
    this.pendingRequests.delete(requestKey)
  }

  /**
   * 检查请求是否已被取消
   * @param {Error} error - 错误对象
   * @returns {boolean} 是否为取消错误
   */
  isAbortError(error) {
    return error && (
      error.name === 'AbortError' ||
      error.message === 'canceled' ||
      error.message === 'aborted' ||
      error.message?.includes('abort')
    )
  }

  /**
   * 获取待处理请求数量
   * @returns {number}
   */
  get size() {
    return this.pendingRequests.size
  }

  /**
   * 清除所有待处理请求
   */
  clear() {
    for (const key of this.pendingRequests.keys()) {
      this.cancel(key)
    }
  }

  /**
   * 执行请求并自动管理生命周期
   * @param {string} requestKey - 请求标识
   * @param {Function} requestFn - 请求函数，接收 signal 参数
   * @returns {Promise} 请求结果
   */
  async execute(requestKey, requestFn) {
    const controller = this.register(requestKey)

    try {
      const result = await requestFn(controller.signal)
      this.remove(requestKey)
      return result
    } catch (error) {
      this.remove(requestKey)

      // 如果是取消错误，返回特殊标记
      if (this.isAbortError(error)) {
        return { __canceled: true }
      }

      throw error
    }
  }
}

// 导出单例实例
export const requestQueue = new RequestQueue()

// 导出类以便测试或创建新实例
export { RequestQueue }

export default requestQueue
