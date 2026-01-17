/**
 * 用户服务 API
 * T030-T035: 用户相关接口封装
 */
import { get, post, put, uploadFile } from './request'

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
 * 上传头像到服务器
 *
 * 后端会自动更新用户的 avatar 字段
 *
 * @param {string} filePath - 本地文件路径
 * @returns {Promise<{url: string, file_name: string, size: number}>} 上传结果，包含头像URL、文件名和大小
 */
export const uploadAvatar = async (filePath) => {
  return uploadFile('/user/avatar', filePath, 'file')
}

/**
 * 上传通用图片
 *
 * @param {string} filePath - 本地文件路径
 * @param {string} fileType - 文件类型标识（如 'avatar', 'hotel', 'room', 'product' 等）
 * @returns {Promise<{url: string, file_name: string, size: number}>} 上传结果，包含图片URL、文件名和大小
 */
export const uploadImage = async (filePath, fileType = 'images') => {
  return uploadFile('/upload/image', filePath, 'file', { file_type: fileType })
}

/**
 * @deprecated 请使用 uploadAvatar(filePath) 方法直接上传头像文件
 *
 * 更新头像 URL（已废弃）
 *
 * 推荐使用 uploadAvatar() 方法直接上传头像文件，后端会自动更新用户信息
 * 如需手动设置头像 URL，请使用 updateProfile({ avatar: url })
 *
 * @param {string} avatarUrl - 头像 URL
 * @returns {Promise<null>}
 */
export const updateAvatar = (avatarUrl) => {
  return updateProfile({ avatar: avatarUrl })
}

/**
 * 获取会员信息
 * @returns {Promise<object>} 会员信息
 */
export const getMemberInfo = () => {
  return get('/member/info')
}

// 兼容旧 API（将逐步废弃）
export const getUserInfo = getProfile
export const updateUserInfo = updateProfile

export default {
  getProfile,
  updateProfile,
  getWallet,
  getTransactions,
  getMemberLevels,
  realNameVerify,
  getPoints,
  uploadAvatar,
  uploadImage,
  updateAvatar, // @deprecated 使用 uploadAvatar 替代
  // 兼容旧 API
  getUserInfo,
  updateUserInfo,
  getMemberInfo
}
