import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore(
  'app',
  () => {
    // 应用状态
    const loading = ref(false)
    const networkStatus = ref('online')
    const currentLocation = ref({})
    const systemInfo = ref({})
    
    // 设置加载状态
    const setLoading = (status) => {
      loading.value = status
    }
    
    // 设置网络状态
    const setNetworkStatus = (status) => {
      networkStatus.value = status
    }
    
    // 设置当前位置
    const setCurrentLocation = (location) => {
      currentLocation.value = location
    }
    
    // 设置系统信息
    const setSystemInfo = (info) => {
      systemInfo.value = info
    }
    
    // 获取系统信息
    const getSystemInfo = () => {
      try {
        const info = uni.getSystemInfoSync()
        systemInfo.value = info
        return info
      } catch (error) {
        console.error('获取系统信息失败:', error)
        return null
      }
    }
    
    // 获取位置信息
    const getCurrentLocation = () => {
      return new Promise((resolve, reject) => {
        // H5 端使用 wgs84 坐标系（不需要地图服务商配置）
        // 小程序端使用 gcj02 坐标系
        const locationType = typeof window !== 'undefined' ? 'wgs84' : 'gcj02'

        uni.getLocation({
          type: locationType,
          success: (res) => {
            const location = {
              latitude: res.latitude,
              longitude: res.longitude,
              accuracy: res.accuracy
            }
            currentLocation.value = location
            resolve(location)
          },
          fail: (error) => {
            console.warn('获取位置失败:', error)
            // 位置获取失败时使用默认位置（北京）
            const defaultLocation = {
              latitude: 39.9042,
              longitude: 116.4074,
              accuracy: 0
            }
            currentLocation.value = defaultLocation
            reject(error)
          }
        })
      })
    }
    
    return {
      // 状态
      loading,
      networkStatus,
      currentLocation,
      systemInfo,
      
      // 方法
      setLoading,
      setNetworkStatus,
      setCurrentLocation,
      setSystemInfo,
      getSystemInfo,
      getCurrentLocation
    }
  },
  {
    persist: {
      paths: ['currentLocation', 'systemInfo']
    }
  }
)