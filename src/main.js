import { createSSRApp } from 'vue'
import App from './App.vue'
import pinia from './stores'
import './styles/index.scss'

// T720: 导入Mock服务（由 mock/index.js 中的 USE_MOCK 标志控制是否启用）
import('./mock')

export function createApp() {
  const app = createSSRApp(App)
  
  // 安装Pinia状态管理
  app.use(pinia)
  
  return {
    app
  }
}
