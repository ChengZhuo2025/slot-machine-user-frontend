/**
 * 认证服务 API
 * T020-T026: 认证相关接口封装
 */
import { post, get } from './request'

/**
 * T020: 发送短信验证码
 * @param {string} phone - 手机号
 * @returns {Promise<{expire_in: number}>}
 */
export const sendSmsCode = (phone) => {
  return post('/auth/sms/send', {
    phone,
    code_type: 'login'
  })
}

/**
 * T021: 短信验证码登录
 * @param {string} phone - 手机号
 * @param {string} code - 验证码
 * @param {string} [inviteCode] - 邀请码（可选）
 * @returns {Promise<{user: object, token: object, is_new_user: boolean}>}
 */
export const smsLogin = (phone, code, inviteCode = '') => {
  const data = { phone, code }
  if (inviteCode) {
    data.invite_code = inviteCode
  }
  return post('/auth/login/sms', data)
}

/**
 * T022: 微信小程序登录
 * @param {string} code - 微信 wx.login 返回的 code
 * @param {object} [userInfo] - 微信用户信息（可选）
 * @returns {Promise<{user: object, token: object, is_new_user: boolean}>}
 */
export const wechatLogin = (code, userInfo = {}) => {
  const data = { code }
  if (userInfo.nickname) data.nickname = userInfo.nickname
  if (userInfo.avatar) data.avatar = userInfo.avatar
  if (userInfo.gender !== undefined) data.gender = userInfo.gender
  if (userInfo.inviteCode) data.invite_code = userInfo.inviteCode
  return post('/auth/login/wechat', data)
}

/**
 * T023: 刷新 Token
 * @param {string} refreshToken - 刷新令牌
 * @returns {Promise<{access_token: string, refresh_token: string, expires_at: number}>}
 */
export const refreshToken = (refreshToken) => {
  return post('/auth/refresh', {
    refresh_token: refreshToken
  })
}

/**
 * T024: 退出登录
 * @returns {Promise<null>}
 */
export const logout = () => {
  return post('/auth/logout')
}

/**
 * T025: 绑定手机号 (P2)
 * @param {string} phone - 手机号
 * @param {string} code - 验证码
 * @returns {Promise<null>}
 */
export const bindPhone = (phone, code) => {
  return post('/auth/bind-phone', { phone, code })
}

/**
 * T026: 获取当前用户信息 (P2)
 * @returns {Promise<object>}
 */
export const getCurrentUser = () => {
  return get('/auth/me')
}

export default {
  sendSmsCode,
  smsLogin,
  wechatLogin,
  refreshToken,
  logout,
  bindPhone,
  getCurrentUser
}
