/**
 * 防抖工具函数
 * T001: 创建防抖工具函数
 */

/**
 * 创建防抖函数
 * @param {Function} fn - 需要防抖的函数
 * @param {number} delay - 延迟时间(毫秒)，默认400ms
 * @param {boolean} immediate - 是否立即执行，默认false
 * @returns {Function} 防抖后的函数
 */
export function debounce(fn, delay = 400, immediate = false) {
  let timer = null
  let result = null

  const debounced = function (...args) {
    const context = this

    // 清除之前的定时器
    if (timer) {
      clearTimeout(timer)
    }

    if (immediate) {
      // 立即执行模式：第一次立即执行，之后等待delay后才能再次执行
      const callNow = !timer
      timer = setTimeout(() => {
        timer = null
      }, delay)
      if (callNow) {
        result = fn.apply(context, args)
      }
    } else {
      // 延迟执行模式：等待delay后执行
      timer = setTimeout(() => {
        fn.apply(context, args)
        timer = null
      }, delay)
    }

    return result
  }

  // 取消防抖
  debounced.cancel = function () {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  return debounced
}

/**
 * 创建带 Promise 的防抖函数
 * 适用于需要等待结果的场景
 * @param {Function} fn - 需要防抖的异步函数
 * @param {number} delay - 延迟时间(毫秒)，默认400ms
 * @returns {Function} 防抖后的函数，返回Promise
 */
export function debounceAsync(fn, delay = 400) {
  let timer = null
  let pendingPromise = null

  return function (...args) {
    const context = this

    return new Promise((resolve, reject) => {
      if (timer) {
        clearTimeout(timer)
      }

      timer = setTimeout(async () => {
        timer = null
        try {
          const result = await fn.apply(context, args)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }, delay)
    })
  }
}

export default debounce
