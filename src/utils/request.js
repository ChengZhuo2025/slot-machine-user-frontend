/**
 * 网络请求工具
 * 封装 uni.request，提供统一的请求接口
 */

const BASE_URL = '' // 使用相对路径，Mock.js 会拦截

/**
 * 发起网络请求
 * @param {Object} options 请求配置
 * @returns {Promise}
 */
function request(options) {
  return new Promise((resolve, reject) => {
    const {
      url,
      method = 'GET',
      data = {},
      header = {},
      timeout = 10000
    } = options

    // 完整的请求 URL
    const requestUrl = url.startsWith('http') ? url : BASE_URL + url

    uni.request({
      url: requestUrl,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header
      },
      timeout,
      success: (res) => {
        // 请求成功
        if (res.statusCode === 200) {
          // Mock 数据直接返回
          if (res.data && res.data.code !== undefined) {
            if (res.data.code === 200) {
              resolve(res.data)
            } else {
              reject(res.data)
            }
          } else {
            // 兼容直接返回数据的情况
            resolve({
              code: 200,
              data: res.data,
              message: 'success'
            })
          }
        } else {
          reject({
            code: res.statusCode,
            message: '请求失败',
            data: null
          })
        }
      },
      fail: (err) => {
        // 请求失败
        reject({
          code: -1,
          message: err.errMsg || '网络请求失败',
          data: null
        })
      }
    })
  })
}

/**
 * GET 请求
 */
export function get(url, data = {}, options = {}) {
  return request({
    url,
    method: 'GET',
    data,
    ...options
  })
}

/**
 * POST 请求
 */
export function post(url, data = {}, options = {}) {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  })
}

/**
 * PUT 请求
 */
export function put(url, data = {}, options = {}) {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  })
}

/**
 * DELETE 请求
 */
export function del(url, data = {}, options = {}) {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  })
}

export default request
