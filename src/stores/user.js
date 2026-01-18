/**
 * 用户状态管理
 * T040-T045: Store 更新支持新的 token 格式
 * CHK026: 使用安全存储
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as userApi from '@/services/user.js'
import * as authApi from '@/services/auth.js'
import { setSecure, getSecure, removeSecure } from '@/utils/secureStorage.js'

export const useUserStore = defineStore(
  'user',
  () => {
    // T040: 添加新的状态字段
    const accessToken = ref('')
    const refreshToken = ref('')
    const tokenExpireTime = ref(0)
    const userInfo = ref({})
    const memberInfo = ref({})
    const wallet = ref(null)

    // 兼容旧代码的 token 字段
    const token = computed(() => accessToken.value)

    // 计算属性
    const isLogin = computed(() => !!accessToken.value)
    const isMember = computed(() => memberInfo.value && memberInfo.value.status === 'active')
    const avatar = computed(() => userInfo.value.avatar || '/static/images/default-avatar.png')
    const nickname = computed(() => userInfo.value.nickname || '用户')
    const memberLevel = computed(() => userInfo.value.member_level || memberInfo.value.level || null)
    const memberExpiry = computed(() => memberInfo.value.expiry || '')
    const points = computed(() => userInfo.value.points || 0)
    const phone = computed(() => userInfo.value.phone || '')
    const isVerified = computed(() => userInfo.value.is_verified || false)

    // 手机号脱敏显示 (138****1234)
    const maskedPhone = computed(() => {
      const p = phone.value
      if (!p || p.length !== 11) return p
      return p.substring(0, 3) + '****' + p.substring(7)
    })

    /**
     * T041: 登录操作
     * 处理新的响应格式，包含 response.user 和 response.token
     * @param {object} loginData - 登录数据
     * @returns {Promise<object>} 登录响应
     */
    const login = async (loginData) => {
      try {
        let response

        if (loginData.loginType === 'sms') {
          response = await authApi.smsLogin(
            loginData.phone,
            loginData.code,
            loginData.inviteCode
          )
        } else if (loginData.loginType === 'wechat') {
          response = await authApi.wechatLogin(loginData.code, {
            nickname: loginData.nickname,
            avatar: loginData.avatar,
            gender: loginData.gender,
            inviteCode: loginData.inviteCode
          })
        } else {
          throw new Error('不支持的登录方式')
        }

        // 保存 token
        accessToken.value = response.token.access_token
        refreshToken.value = response.token.refresh_token
        // T042: 后端返回 Unix 时间戳（秒），转为毫秒
        tokenExpireTime.value = response.token.expires_at * 1000

        // 保存用户信息
        userInfo.value = response.user
        if (response.user.member_level) {
          memberInfo.value = response.user.member_level
        }

        // CHK026: 同步到本地存储（使用安全存储）
        setSecure('token', accessToken.value)
        setSecure('refreshToken', refreshToken.value)
        uni.setStorageSync('tokenExpireTime', tokenExpireTime.value)

        return response
      } catch (error) {
        console.error('登录失败:', error)
        throw error
      }
    }

    /**
     * T043: 刷新 tokens
     * @param {object} newTokenData - 新的 token 数据
     */
    const refreshTokens = (newTokenData) => {
      accessToken.value = newTokenData.access_token
      refreshToken.value = newTokenData.refresh_token
      tokenExpireTime.value = newTokenData.expires_at * 1000

      // CHK026: 同步到本地存储（使用安全存储）
      setSecure('token', accessToken.value)
      setSecure('refreshToken', refreshToken.value)
      uni.setStorageSync('tokenExpireTime', tokenExpireTime.value)
    }

    /**
     * T044: 退出登录
     * 清除所有 token 相关状态
     */
    const logout = async () => {
      try {
        // 调用后端登出接口
        if (accessToken.value) {
          await authApi.logout().catch(() => {
            // 忽略登出接口错误，继续清理本地状态
          })
        }
      } finally {
        // 清除状态
        accessToken.value = ''
        refreshToken.value = ''
        tokenExpireTime.value = 0
        userInfo.value = {}
        memberInfo.value = {}
        wallet.value = null

        // CHK026: 清除本地存储（使用安全存储）
        removeSecure('token')
        removeSecure('refreshToken')
        uni.removeStorageSync('tokenExpireTime')
        uni.removeStorageSync('userInfo')
        uni.removeStorageSync('memberInfo')
      }
    }

    /**
     * 更新用户信息
     * @param {object} info - 用户信息
     */
    const updateUserInfo = (info) => {
      userInfo.value = { ...userInfo.value, ...info }
    }

    /**
     * 更新会员信息
     * @param {object} info - 会员信息
     */
    const updateMemberInfo = (info) => {
      memberInfo.value = { ...memberInfo.value, ...info }
    }

    /**
     * 获取用户信息
     * @returns {Promise<object>}
     */
    const fetchUserInfo = async () => {
      try {
        const response = await userApi.getProfile()
        userInfo.value = response
        if (response.member_level) {
          memberInfo.value = response.member_level
        }
        return response
      } catch (error) {
        console.error('获取用户信息失败:', error)
        throw error
      }
    }

    /**
     * 获取钱包信息
     * @returns {Promise<object>}
     */
    const fetchWallet = async () => {
      try {
        const response = await userApi.getWallet()
        wallet.value = response
        return response
      } catch (error) {
        console.error('获取钱包信息失败:', error)
        throw error
      }
    }

    /**
     * 初始化状态（从本地存储恢复）
     */
    const initFromStorage = () => {
      const storedToken = uni.getStorageSync('token')
      const storedRefreshToken = uni.getStorageSync('refreshToken')
      const storedExpireTime = uni.getStorageSync('tokenExpireTime')

      if (storedToken) {
        accessToken.value = storedToken
      }
      if (storedRefreshToken) {
        refreshToken.value = storedRefreshToken
      }
      if (storedExpireTime) {
        tokenExpireTime.value = storedExpireTime
      }
    }

    return {
      // 状态
      accessToken,
      refreshToken,
      tokenExpireTime,
      token, // 兼容旧代码
      userInfo,
      memberInfo,
      wallet,

      // 计算属性
      isLogin,
      isMember,
      avatar,
      nickname,
      memberLevel,
      memberExpiry,
      points,
      phone,
      maskedPhone,
      isVerified,

      // 方法
      login,
      logout,
      refreshTokens,
      updateUserInfo,
      updateMemberInfo,
      fetchUserInfo,
      fetchWallet,
      initFromStorage
    }
  },
  {
    // T045: 更新持久化配置
    persist: {
      paths: [
        'accessToken',
        'refreshToken',
        'tokenExpireTime',
        'userInfo',
        'memberInfo'
      ]
    }
  }
)
