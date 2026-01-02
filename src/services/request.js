// 网络请求封装
const baseURL = 'http://localhost:3000/api'

// 请求拦截器
const requestInterceptor = (config) => {
  // 添加token
  const token = uni.getStorageSync('token')
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

// 响应拦截器
const responseInterceptor = (response) => {
  const { data, statusCode } = response

  if (statusCode === 200) {
    // 兼容两种响应格式：code === 0 或 code === 200 都表示成功
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
    // 未授权，清除token并跳转登录
    uni.removeStorageSync('token')
    uni.navigateTo({
      url: '/pages/user/login'
    })
    throw new Error('请先登录')
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
export const request = (config) => {
  return new Promise((resolve, reject) => {
    // 请求拦截
    const requestConfig = requestInterceptor({
      method: 'GET',
      header: {
        'Content-Type': 'application/json'
      },
      timeout: 10000,
      ...config
    })
    
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
        uni.showToast({
          title: '网络连接失败',
          icon: 'none'
        })
        reject(new Error('网络连接失败'))
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