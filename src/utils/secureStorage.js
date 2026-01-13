/**
 * CHK026: 安全存储工具
 * 提供 Token 等敏感数据的加密存储
 */

// 加密密钥（实际项目中应从环境变量获取）
const ENCRYPT_KEY = 'slot_machine_2024'

/**
 * 简单加密（Base64 + 混淆）
 * @param {string} data - 原始数据
 * @returns {string} 加密后的数据
 */
const encrypt = (data) => {
  if (!data) return ''
  try {
    // 添加时间戳混淆
    const timestamp = Date.now().toString(36)
    const mixed = `${timestamp}:${data}:${ENCRYPT_KEY.slice(0, 4)}`
    // Base64 编码
    return btoa(encodeURIComponent(mixed))
  } catch (e) {
    console.error('加密失败:', e)
    return data
  }
}

/**
 * 简单解密
 * @param {string} encryptedData - 加密数据
 * @returns {string} 原始数据
 */
const decrypt = (encryptedData) => {
  if (!encryptedData) return ''
  try {
    // Base64 解码
    const mixed = decodeURIComponent(atob(encryptedData))
    // 提取原始数据
    const parts = mixed.split(':')
    if (parts.length >= 2) {
      return parts[1]
    }
    return encryptedData
  } catch (e) {
    // 解密失败，可能是旧格式数据
    return encryptedData
  }
}

/**
 * 安全存储数据
 * @param {string} key - 存储键
 * @param {string} value - 存储值
 */
export const setSecure = (key, value) => {
  const encrypted = encrypt(String(value))
  uni.setStorageSync(key, encrypted)
}

/**
 * 安全读取数据
 * @param {string} key - 存储键
 * @returns {string} 原始值
 */
export const getSecure = (key) => {
  const encrypted = uni.getStorageSync(key)
  return decrypt(encrypted)
}

/**
 * 删除安全存储数据
 * @param {string} key - 存储键
 */
export const removeSecure = (key) => {
  uni.removeStorageSync(key)
}

export default {
  setSecure,
  getSecure,
  removeSecure,
  encrypt,
  decrypt
}
