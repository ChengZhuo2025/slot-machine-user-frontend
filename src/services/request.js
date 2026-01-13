// 网络请求封装
// T010: 使用环境变量配置 baseURL
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

// T011: Token 刷新队列机制
let isRefreshing = false
let failedQueue = []

// T012: 处理队列中的请求
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// 动态导入 auth 服务，避免循环依赖
let authApi = null
const getAuthApi = async () => {
  if (!authApi) {
    const module = await import('./auth.js')
    authApi = module
  }
  return authApi
}

// 获取 user store
let userStore = null
const getUserStore = () => {
  if (!userStore) {
    const { useUserStore } = require('@/stores/user.js')
    userStore = useUserStore()
  }
  return userStore
}

// T013: Token 过期预检查（<5 分钟触发刷新）
const checkAndRefreshToken = async () => {
  const tokenExpireTime = uni.getStorageSync('tokenExpireTime')
  const refreshToken = uni.getStorageSync('refreshToken')

  // 没有 refreshToken 或没有过期时间，不处理
  if (!refreshToken || !tokenExpireTime) {
    return null
  }

  // 检查是否需要刷新（剩余时间 <5 分钟）
  const now = Date.now()
  const fiveMinutes = 5 * 60 * 1000

  if (now > tokenExpireTime - fiveMinutes) {
    // T014: 如果正在刷新，加入队列等待
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
    }

    isRefreshing = true

    try {
      const auth = await getAuthApi()
      const newTokenData = await auth.refreshToken(refreshToken)

      // 更新本地存储
      uni.setStorageSync('token', newTokenData.access_token)
      uni.setStorageSync('refreshToken', newTokenData.refresh_token)
      uni.setStorageSync('tokenExpireTime', newTokenData.expires_at * 1000)

      // 处理队列中的请求
      processQueue(null, newTokenData.access_token)

      return newTokenData.access_token
    } catch (error) {
      // 刷新失败，处理队列中的请求
      processQueue(error, null)

      // 清除登录状态
      uni.removeStorageSync('token')
      uni.removeStorageSync('refreshToken')
      uni.removeStorageSync('tokenExpireTime')

      // 跳转登录页
      uni.navigateTo({ url: '/pages/user/login' })

      throw error
    } finally {
      isRefreshing = false
    }
  }

  return null
}

// 请求拦截器
const requestInterceptor = async (config) => {
  // 添加token
  let token = uni.getStorageSync('token')

  // T013: 检查是否需要刷新 token（跳过刷新接口本身）
  if (!config.url.includes('/auth/refresh')) {
    try {
      const newToken = await checkAndRefreshToken()
      if (newToken) {
        token = newToken
      }
    } catch (error) {
      // 刷新失败，继续使用旧 token 或无 token
      console.error('Token 刷新失败:', error)
    }
  }

  if (token) {
    config.header = config.header || {}
    config.header.Authorization = `Bearer ${token}`
  }

  // 添加基础URL
  if (!config.url.startsWith('http')) {
    config.url = baseURL + config.url
  }

  return config
}

// T15, T16: 响应拦截器
const responseInterceptor = (response) => {
  const { data, statusCode } = response

  if (statusCode === 200) {
    // T016: 兼容两种响应格式：code === 0 或 code === 200 都表示成功
    if (data.code === 0 || data.code === 200) {
      return data.data
    } else {
      // 业务错误
      uni.showToast({
        title: data.message || '请求失败',
        icon: 'none'
      })
      throw new Error(data.message || '请求失败')
    }
  } else if (statusCode === 401) {
    // T015: 未授权，清除tokens并跳转登录
    uni.removeStorageSync('token')
    uni.removeStorageSync('refreshToken')
    uni.removeStorageSync('tokenExpireTime')
    uni.navigateTo({
      url: '/pages/user/login'
    })
    throw new Error('请先登录')
  } else if (statusCode === 429) {
    // 频率限制
    uni.showToast({
      title: '发送过于频繁，请稍后再试',
      icon: 'none'
    })
    throw new Error('发送过于频繁，请稍后再试')
  } else {
    // HTTP错误
    uni.showToast({
      title: '网络请求失败',
      icon: 'none'
    })
    throw new Error('网络请求失败')
  }
}

// 封装请求方法
export const request = async (config) => {
  // 请求拦截
  const requestConfig = await requestInterceptor({
    method: 'GET',
    header: {
      'Content-Type': 'application/json'
    },
    // T017: 配置默认超时时间为 10 秒
    timeout: 10000,
    ...config
  })

  return new Promise((resolve, reject) => {
    uni.request({
      ...requestConfig,
      success: (response) => {
        try {
          const result = responseInterceptor(response)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      },
      fail: (error) => {
        console.error('请求失败:', error)
        // 网络错误处理
        if (error.errMsg && error.errMsg.includes('timeout')) {
          uni.showToast({
            title: '请求超时，请稍后重试',
            icon: 'none'
          })
          reject(new Error('请求超时，请稍后重试'))
        } else {
          uni.showToast({
            title: '网络连接失败，请检查网络设置',
            icon: 'none'
          })
          reject(new Error('网络连接失败，请检查网络设置'))
        }
      }
    })
  })
}

// 快捷方法
export const get = (url, params = {}) => {
  return request({
    url,
    method: 'GET',
    data: params
  })
}

export const post = (url, data = {}) => {
  return request({
    url,
    method: 'POST',
    data
  })
}

export const put = (url, data = {}) => {
  return request({
    url,
    method: 'PUT',
    data
  })
}

export const del = (url, data = {}) => {
  return request({
    url,
    method: 'DELETE',
    data
  })
}

export default request
