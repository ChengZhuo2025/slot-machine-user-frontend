import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),
  ],
  // Vite 自动加载 .env 文件，无需额外配置
  // VITE_* 前缀的环境变量会自动注入到 import.meta.env
})
