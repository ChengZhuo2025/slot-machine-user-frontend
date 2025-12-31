import { createSSRApp } from 'vue'
import App from './App.vue'
import pinia from './stores'
import './styles/index.scss'

// 导入Mock服务（始终启用，用于演示）
import('./mock')

export function createApp() {
  const app = createSSRApp(App)
  
  // 安装Pinia状态管理
  app.use(pinia)
  
  return {
    app
  }
}
