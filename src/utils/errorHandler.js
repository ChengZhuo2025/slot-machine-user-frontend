/**
 * T700: 集中错误处理工具
 * 提供中文用户友好的错误消息映射
 */

// HTTP 状态码错误消息映射
const HTTP_ERROR_MESSAGES = {
  400: '请求参数错误',
  401: '登录已过期，请重新登录',
  403: '没有权限访问',
  404: '请求的资源不存在',
  405: '请求方法不允许',
  408: '请求超时，请稍后重试',
  429: '请求过于频繁，请稍后再试',
  500: '服务器内部错误',
  502: '网关错误',
  503: '服务暂时不可用',
  504: '网关超时'
}

// 业务错误码消息映射
const BUSINESS_ERROR_MESSAGES = {
  // 认证相关
  'AUTH_INVALID_CODE': '验证码错误或已过期',
  'AUTH_CODE_EXPIRED': '验证码已过期，请重新获取',
  'AUTH_CODE_LIMIT': '发送过于频繁，请稍后再试',
  'AUTH_TOKEN_EXPIRED': '登录已过期，请重新登录',
  'AUTH_TOKEN_INVALID': '登录状态无效，请重新登录',

  // 用户相关
  'USER_NOT_FOUND': '用户不存在',
  'USER_DISABLED': '账号已被禁用',
  'USER_NICKNAME_INVALID': '昵称包含违规内容',
  'USER_PHONE_BINDDED': '该手机号已被绑定',

  // 通用错误
  'NETWORK_ERROR': '网络连接失败，请检查网络设置',
  'TIMEOUT_ERROR': '请求超时，请稍后重试',
  'UNKNOWN_ERROR': '未知错误，请稍后重试'
}

/**
 * 获取 HTTP 错误消息
 * @param {number} status - HTTP 状态码
 * @returns {string} 错误消息
 */
export const getHttpErrorMessage = (status) => {
  return HTTP_ERROR_MESSAGES[status] || `请求失败 (${status})`
}

/**
 * 获取业务错误消息
 * @param {string} code - 业务错误码
 * @param {string} [defaultMessage] - 默认消息
 * @returns {string} 错误消息
 */
export const getBusinessErrorMessage = (code, defaultMessage) => {
  return BUSINESS_ERROR_MESSAGES[code] || defaultMessage || '操作失败，请稍后重试'
}

/**
 * 解析错误并返回用户友好消息
 * @param {Error|object} error - 错误对象
 * @returns {string} 用户友好的错误消息
 */
export const parseError = (error) => {
  // 网络错误
  if (error.message === 'Network Error' || error.errMsg?.includes('request:fail')) {
    return BUSINESS_ERROR_MESSAGES.NETWORK_ERROR
  }

  // 超时错误
  if (error.message?.includes('timeout') || error.errMsg?.includes('timeout')) {
    return BUSINESS_ERROR_MESSAGES.TIMEOUT_ERROR
  }

  // HTTP 状态码错误
  if (error.status || error.statusCode) {
    const status = error.status || error.statusCode
    return getHttpErrorMessage(status)
  }

  // 业务错误码
  if (error.code && typeof error.code === 'string') {
    return getBusinessErrorMessage(error.code, error.message)
  }

  // 返回原始消息或默认消息
  return error.message || BUSINESS_ERROR_MESSAGES.UNKNOWN_ERROR
}

/**
 * 显示错误提示
 * @param {Error|object|string} error - 错误对象或消息
 */
export const showError = (error) => {
  const message = typeof error === 'string' ? error : parseError(error)
  uni.showToast({
    title: message,
    icon: 'none',
    duration: 2500
  })
}

export default {
  getHttpErrorMessage,
  getBusinessErrorMessage,
  parseError,
  showError,
  HTTP_ERROR_MESSAGES,
  BUSINESS_ERROR_MESSAGES
}
