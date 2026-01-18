/**
 * CHK002: 验证码错误次数限制工具
 * 防止暴力破解验证码
 */

// 存储键
const CODE_ERROR_KEY = 'code_error_count'
const CODE_LOCK_KEY = 'code_lock_until'

// 配置
const MAX_ERROR_COUNT = 5      // 最大错误次数
const LOCK_DURATION = 15 * 60 * 1000  // 锁定时长：15分钟

/**
 * 检查是否被锁定
 * @param {string} phone - 手机号
 * @returns {{ locked: boolean, remainingTime: number }} 锁定状态和剩余时间(秒)
 */
export const checkLocked = (phone) => {
  const lockKey = `${CODE_LOCK_KEY}_${phone}`
  const lockUntil = uni.getStorageSync(lockKey)

  if (lockUntil && Date.now() < lockUntil) {
    const remainingTime = Math.ceil((lockUntil - Date.now()) / 1000)
    return { locked: true, remainingTime }
  }

  // 锁定已过期，清除
  if (lockUntil) {
    uni.removeStorageSync(lockKey)
    uni.removeStorageSync(`${CODE_ERROR_KEY}_${phone}`)
  }

  return { locked: false, remainingTime: 0 }
}

/**
 * 记录验证码错误
 * @param {string} phone - 手机号
 * @returns {{ locked: boolean, errorCount: number, remainingAttempts: number }}
 */
export const recordError = (phone) => {
  const errorKey = `${CODE_ERROR_KEY}_${phone}`
  const lockKey = `${CODE_LOCK_KEY}_${phone}`

  let errorCount = uni.getStorageSync(errorKey) || 0
  errorCount++

  if (errorCount >= MAX_ERROR_COUNT) {
    // 达到最大错误次数，锁定账号
    const lockUntil = Date.now() + LOCK_DURATION
    uni.setStorageSync(lockKey, lockUntil)
    uni.setStorageSync(errorKey, errorCount)

    return {
      locked: true,
      errorCount,
      remainingAttempts: 0
    }
  }

  uni.setStorageSync(errorKey, errorCount)

  return {
    locked: false,
    errorCount,
    remainingAttempts: MAX_ERROR_COUNT - errorCount
  }
}

/**
 * 清除错误记录（登录成功时调用）
 * @param {string} phone - 手机号
 */
export const clearErrors = (phone) => {
  uni.removeStorageSync(`${CODE_ERROR_KEY}_${phone}`)
  uni.removeStorageSync(`${CODE_LOCK_KEY}_${phone}`)
}

/**
 * 获取剩余尝试次数
 * @param {string} phone - 手机号
 * @returns {number}
 */
export const getRemainingAttempts = (phone) => {
  const errorCount = uni.getStorageSync(`${CODE_ERROR_KEY}_${phone}`) || 0
  return MAX_ERROR_COUNT - errorCount
}

/**
 * 格式化剩余时间
 * @param {number} seconds - 秒数
 * @returns {string}
 */
export const formatLockTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}分${secs}秒`
}

export default {
  checkLocked,
  recordError,
  clearErrors,
  getRemainingAttempts,
  formatLockTime,
  MAX_ERROR_COUNT,
  LOCK_DURATION
}
