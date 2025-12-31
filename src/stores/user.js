import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as userApi from '@/services/user.js'

export const useUserStore = defineStore(
  'user',
  () => {
    // 状态
    const token = ref('')
    const userInfo = ref({})
    const memberInfo = ref({})
    
    // 计算属性
    const isLogin = computed(() => !!token.value)
    const isMember = computed(() => memberInfo.value && memberInfo.value.status === 'active')
    const avatar = computed(() => userInfo.value.avatar || '/static/images/default-avatar.png')
    const nickname = computed(() => userInfo.value.nickname || '用户')
    const memberLevel = computed(() => memberInfo.value.level || 'VIP')
    const memberExpiry = computed(() => memberInfo.value.expiry || '2024-12-31')

    // 操作方法
    const login = async (loginData) => {
      try {
        const response = await userApi.login(loginData)
        token.value = response.token
        userInfo.value = response.user
        memberInfo.value = response.member || {}
        return response
      } catch (error) {
        console.error('登录失败:', error)
        throw error
      }
    }

    const logout = () => {
      token.value = ''
      userInfo.value = {}
      memberInfo.value = {}
      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')
      uni.removeStorageSync('memberInfo')
    }

    const updateUserInfo = (info) => {
      userInfo.value = { ...userInfo.value, ...info }
    }

    const updateMemberInfo = (info) => {
      memberInfo.value = { ...memberInfo.value, ...info }
    }

    // 获取用户信息
    const fetchUserInfo = async () => {
      try {
        const response = await userApi.getUserInfo()
        userInfo.value = response.user
        memberInfo.value = response.member || {}
        return response
      } catch (error) {
        console.error('获取用户信息失败:', error)
        throw error
      }
    }

    return {
      // 状态
      token,
      userInfo,
      memberInfo,
      
      // 计算属性
      isLogin,
      isMember,
      avatar,
      nickname,
      memberLevel,
      memberExpiry,
      
      // 方法
      login,
      logout,
      updateUserInfo,
      updateMemberInfo,
      fetchUserInfo
    }
  },
  {
    persist: {
      paths: ['token', 'userInfo', 'memberInfo']
    }
  }
)