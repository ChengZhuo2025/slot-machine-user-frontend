/**
 * CHK025: 时间格式化工具
 * 统一处理时间戳的时区和格式化
 */

// 服务器时区（假设为东八区）
const SERVER_TIMEZONE = 'Asia/Shanghai'

/**
 * 格式化时间戳为本地时间字符串
 * @param {number} timestamp - Unix 时间戳（秒）
 * @param {string} format - 格式类型：'full' | 'date' | 'time' | 'relative'
 * @returns {string}
 */
export const formatTimestamp = (timestamp, format = 'full') => {
  if (!timestamp) return ''

  // 转换为毫秒
  const ms = timestamp * 1000
  const date = new Date(ms)

  // 检查日期是否有效
  if (isNaN(date.getTime())) return ''

  switch (format) {
    case 'date':
      return formatDate(date)
    case 'time':
      return formatTime(date)
    case 'relative':
      return formatRelative(date)
    case 'full':
    default:
      return formatFull(date)
  }
}

/**
 * 完整格式：2024-01-13 14:30:00
 */
const formatFull = (date) => {
  const year = date.getFullYear()
  const month = padZero(date.getMonth() + 1)
  const day = padZero(date.getDate())
  const hours = padZero(date.getHours())
  const minutes = padZero(date.getMinutes())
  const seconds = padZero(date.getSeconds())
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * 日期格式：2024-01-13
 */
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = padZero(date.getMonth() + 1)
  const day = padZero(date.getDate())
  return `${year}-${month}-${day}`
}

/**
 * 时间格式：14:30:00
 */
const formatTime = (date) => {
  const hours = padZero(date.getHours())
  const minutes = padZero(date.getMinutes())
  const seconds = padZero(date.getSeconds())
  return `${hours}:${minutes}:${seconds}`
}

/**
 * 相对时间格式：刚刚、5分钟前、1小时前、昨天、2024-01-13
 */
const formatRelative = (date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) {
    return '刚刚'
  } else if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return formatDate(date)
  }
}

/**
 * 补零
 */
const padZero = (num) => {
  return num < 10 ? `0${num}` : String(num)
}

/**
 * 获取当前时区偏移描述
 */
export const getTimezoneInfo = () => {
  const offset = new Date().getTimezoneOffset()
  const hours = Math.abs(Math.floor(offset / 60))
  const sign = offset <= 0 ? '+' : '-'
  return `UTC${sign}${hours}`
}

export default {
  formatTimestamp,
  getTimezoneInfo,
  SERVER_TIMEZONE
}
