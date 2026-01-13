/**
 * 登录守卫工具
 * T050-T054: 路由保护相关功能
 */

// T050: 需要登录保护的页面路径列表（10 个页面）
export const PROTECTED_PAGES = [
  '/pages/user/index',           // 个人中心
  '/pages/distribution/index',   // 分销中心
  '/pages/mall/cart',            // 购物车
  '/pages/mall/order-confirm',   // 订单确认
  '/pages/mall/order-detail',    // 订单详情
  '/pages/mall/coupons',         // 优惠券
  '/pages/hotel/book-confirm',   // 酒店预订确认
  '/pages/hotel/order-detail',   // 酒店订单详情
  '/pages/hotel/unlock',         // 开锁
  '/pages/scan/index'            // 扫码
]

// 重定向路径存储键
const REDIRECT_PATH_KEY = 'redirect_path'

/**
 * T051: 检查登录状态
 * @returns {boolean} 是否已登录
 */
export const checkAuth = () => {
  const token = uni.getStorageSync('token')
  return !!token
}

/**
 * T052: 要求登录验证
 * 未登录时保存目标路径并跳转登录页
 * @param {string} [targetPath] - 目标页面路径（可选，默认获取当前页面）
 * @returns {boolean} 是否已登录
 */
export const requireAuth = (targetPath) => {
  if (checkAuth()) {
    return true
  }

  // 获取当前页面路径作为目标路径
  let path = targetPath
  if (!path) {
    const pages = getCurrentPages()
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1]
      path = '/' + currentPage.route
      // 保存完整的页面参数
      if (currentPage.options && Object.keys(currentPage.options).length > 0) {
        const queryString = Object.keys(currentPage.options)
          .map(key => `${key}=${encodeURIComponent(currentPage.options[key])}`)
          .join('&')
        path += '?' + queryString
      }
    }
  }

  // 保存目标路径
  if (path) {
    uni.setStorageSync(REDIRECT_PATH_KEY, path)
  }

  // 跳转到登录页
  uni.navigateTo({
    url: '/pages/user/login'
  })

  return false
}

/**
 * T053: 获取登录成功后的跳转路径
 * @returns {string} 跳转路径，默认为首页
 */
export const getRedirectPath = () => {
  return uni.getStorageSync(REDIRECT_PATH_KEY) || '/pages/index/index'
}

/**
 * T054: 清除保存的跳转路径
 */
export const clearRedirectPath = () => {
  uni.removeStorageSync(REDIRECT_PATH_KEY)
}

/**
 * 检查页面是否需要登录保护
 * @param {string} path - 页面路径
 * @returns {boolean}
 */
export const isProtectedPage = (path) => {
  // 移除查询参数进行比较
  const basePath = path.split('?')[0]
  return PROTECTED_PAGES.some(p => basePath === p || basePath.startsWith(p + '/'))
}

export default {
  PROTECTED_PAGES,
  checkAuth,
  requireAuth,
  getRedirectPath,
  clearRedirectPath,
  isProtectedPage
}
