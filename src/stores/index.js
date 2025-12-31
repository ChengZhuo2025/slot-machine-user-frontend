import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

const pinia = createPinia()

// 配置持久化插件
pinia.use(
  createPersistedState({
    storage: {
      getItem: (key) => {
        try {
          return uni.getStorageSync(key)
        } catch (e) {
          return null
        }
      },
      setItem: (key, value) => {
        try {
          uni.setStorageSync(key, value)
        } catch (e) {
          console.error('存储失败:', e)
        }
      },
      removeItem: (key) => {
        try {
          uni.removeStorageSync(key)
        } catch (e) {
          console.error('删除存储失败:', e)
        }
      }
    }
  })
)

export default pinia