/**
 * 用户服务 API
 * T030-T035: 用户相关接口封装
 */
import { get, post, put } from './request'

/**
 * T030: 获取用户详情
 * @returns {Promise<object>} 用户信息
 */
export const getProfile = () => {
  return get('/user/profile')
}

/**
 * T031: 更新用户信息
 * @param {object} data - 更新数据
 * @param {string} [data.nickname] - 昵称
 * @param {string} [data.avatar] - 头像 URL
 * @param {number} [data.gender] - 性别 (0-未知, 1-男, 2-女)
 * @param {string} [data.birthday] - 生日 (ISO 8601 格式)
 * @returns {Promise<null>}
 */
export const updateProfile = (data) => {
  return put('/user/profile', data)
}

/**
 * T032: 获取钱包信息 (P3)
 * @returns {Promise<{balance: number, frozen_balance: number, total_recharged: number, total_consumed: number}>}
 */
export const getWallet = () => {
  return get('/user/wallet')
}

/**
 * T033: 获取交易记录 (P3)
 * @param {object} [params] - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.page_size=20] - 每页数量
 * @param {string} [params.type] - 交易类型筛选
 * @returns {Promise<{list: Array, total: number, page: number, page_size: number}>}
 */
export const getTransactions = (params = {}) => {
  const defaultParams = {
    page: 1,
    page_size: 20
  }
  return get('/user/wallet/transactions', { ...defaultParams, ...params })
}

/**
 * T034: 获取会员等级列表 (P3)
 * @returns {Promise<Array>} 会员等级列表
 */
export const getMemberLevels = () => {
  return get('/user/member-levels')
}

/**
 * T035: 实名认证 (P2)
 * @param {string} realName - 真实姓名
 * @param {string} idCard - 身份证号
 * @returns {Promise<null>}
 */
export const realNameVerify = (realName, idCard) => {
  return post('/user/real-name-verify', {
    real_name: realName,
    id_card: idCard
  })
}

/**
 * 获取用户积分
 * @returns {Promise<{points: number}>}
 */
export const getPoints = () => {
  return get('/user/points')
}

/**
 * 上传头像
 * @param {string} filePath - 本地文件路径
 * @returns {Promise<{url: string}>}
 */
export const uploadAvatar = (filePath) => {
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${baseURL}/user/avatar`,
      filePath,
      name: 'avatar',
      header: {
        'Authorization': `Bearer ${uni.getStorageSync('token')}`
      },
      success: (response) => {
        const data = JSON.parse(response.data)
        if (data.code === 0 || data.code === 200) {
          resolve(data.data)
        } else {
          uni.showToast({
            title: data.message || '上传失败',
            icon: 'none'
          })
          reject(new Error(data.message || '上传失败'))
        }
      },
      fail: (error) => {
        uni.showToast({
          title: '上传失败',
          icon: 'none'
        })
        reject(error)
      }
    })
  })
}

// 兼容旧 API（将逐步废弃）
export const getUserInfo = getProfile
export const updateUserInfo = updateProfile
export const getMemberInfo = () => get('/user/member')

export default {
  getProfile,
  updateProfile,
  getWallet,
  getTransactions,
  getMemberLevels,
  realNameVerify,
  getPoints,
  uploadAvatar,
  // 兼容旧 API
  getUserInfo,
  updateUserInfo,
  getMemberInfo
}
