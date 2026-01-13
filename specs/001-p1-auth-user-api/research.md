# 技术研究：P1 认证与用户模块 API 对接

**创建日期**: 2026-01-13
**功能**: P1 认证与用户 API 集成

## 1. Token 刷新机制最佳实践

**决策**: 采用请求拦截器 + Promise 队列机制

**理由**:
- 避免多个并发请求同时触发 Token 刷新（竞态条件）
- 确保刷新期间的请求能复用新 Token
- 对用户完全透明，无需手动处理

**备选方案分析**:
- ❌ 全局定时器刷新：浪费资源，可能在不需要时刷新
- ❌ 每个请求独立刷新：导致多次刷新调用，后端压力大
- ✅ 拦截器 + 队列（Axios 模式）：行业标准，可靠性高

**实现模式**:
```javascript
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

// 在请求拦截器中
if (tokenWillExpireSoon && !isRefreshing) {
  isRefreshing = true
  refreshToken().then(newToken => {
    processQueue(null, newToken)
  }).catch(err => {
    processQueue(err, null)
  }).finally(() => {
    isRefreshing = false
  })
}
if (isRefreshing) {
  // 将请求加入队列
  return new Promise((resolve, reject) => {
    failedQueue.push({ resolve, reject })
  })
}
```

## 2. UniApp 跨平台 Token 存储

**决策**: 使用 `uni.getStorageSync` + Pinia persistedstate

**理由**:
- UniApp 的 Storage API 自动适配 H5 (localStorage) 和小程序 (wx.setStorageSync)
- Pinia persistedstate 插件提供自动持久化，减少手动代码
- 同步 API 避免异步竞态问题

**备选方案分析**:
- ❌ 仅用 localStorage：不兼容小程序
- ❌ 仅用 Pinia 内存：刷新页面丢失登录状态
- ✅ 组合方案：兼顾跨平台 + 持久化

**存储键值**:
- `token`: access_token（访问令牌）
- `refreshToken`: refresh_token（刷新令牌）
- `tokenExpireTime`: 过期时间戳
- `userInfo`: 用户基本信息缓存

## 3. 微信小程序登录流程

**决策**: wx.login → 后端 `/api/v1/auth/login/wechat` → 返回 Token

**理由**:
- 符合微信小程序官方登录规范
- 后端已实现 code2session 换取 openid
- 前端只需调用 wx.login 获取 code

**流程**:
```
用户点击微信登录
  ↓
wx.login() 获取 code
  ↓
POST /api/v1/auth/login/wechat { code }
  ↓
后端调用微信 API 验证 code → openid/session_key
  ↓
返回 { user, token: { access_token, refresh_token } }
  ↓
前端保存 token，跳转首页
```

**H5 降级方案**:
- H5 环境不支持 wx.login
- 用户需使用短信登录

## 4. 短信验证码发送频率限制

**决策**: 前端倒计时 60秒 + 后端 rate limiting

**理由**:
- 前端倒计时：良好 UX，防止用户重复点击
- 后端限制：防止恶意刷接口
- 双重保护：前端体验 + 后端安全

**前端实现**:
```javascript
let countdown = 60
const sendCode = async () => {
  if (countdown > 0) return
  await api.sendSmsCode(phone)
  countdown = 60
  const timer = setInterval(() => {
    countdown--
    if (countdown <= 0) clearInterval(timer)
  }, 1000)
}
```

**后端频率限制**（已实现）:
- 1 分钟内同一 IP 最多 1 次
- 每天同一手机号最多 10 次

## 5. API 响应格式兼容性处理

**决策**: 兼容 `code: 0` 和 `code: 200` 两种成功状态

**理由**:
- 后端 API 文档显示成功返回 `code: 0` 或 `code: 200`
- 前端需要同时支持，避免误判
- 统一在 request interceptor 处理

**响应处理器**:
```javascript
if (statusCode === 200) {
  if (data.code === 0 || data.code === 200) {
    return data.data  // 成功
  } else {
    throw new Error(data.message)  // 业务错误
  }
}
```

## 6. 401 未授权处理策略

**决策**: 清除凭证 + 重定向登录页

**理由**:
- 401 表示 Token 无效或已过期
- 必须清除本地存储，防止死循环
- 跳转登录页让用户重新登录

**实现**:
```javascript
if (statusCode === 401) {
  uni.removeStorageSync('token')
  uni.removeStorageSync('refreshToken')
  store.logout()  // 清除 Pinia state
  uni.navigateTo({ url: '/pages/user/login' })
}
```

**边界情况**: 刷新 token 时返回 401
- 不尝试再次刷新（避免无限循环）
- 直接清除状态并跳转登录

## 7. 环境变量配置方案

**决策**: 使用 `.env` 文件 + Vite 加载

**理由**:
- Vite 原生支持 `.env` 文件
- 区分开发/生产环境
- 符合前端最佳实践

**文件**:
```
.env.development    # 开发环境
VITE_API_BASE_URL=http://localhost:8000/api/v1

.env.production     # 生产环境
VITE_API_BASE_URL=https://api.example.com/api/v1
```

**使用方式**:
```javascript
const baseURL = import.meta.env.VITE_API_BASE_URL
```

## 8. 钱包交易记录分页加载

**决策**: 滚动加载 + page/pageSize 参数

**理由**:
- 后端支持分页查询 `?page=1&pageSize=10`
- 移动端适合滚动加载体验
- 减少单次数据量，提升性能

**实现**:
```javascript
let page = 1
const pageSize = 20
const loadMore = async () => {
  const data = await api.getTransactions({ page, pageSize })
  transactions.value.push(...data.list)
  page++
}
```

## 9. UniApp 路由守卫实现方案

**决策**: 页面级 onShow 生命周期守卫 + 工具函数

**理由**:
- UniApp 不支持 Vue Router 的全局路由守卫（beforeEach）
- 使用页面生命周期 `onShow` 是 UniApp 推荐的权限控制方式
- 提取守卫逻辑到工具函数，保持代码复用

**备选方案分析**:
- ❌ Mixin 全局注入：侵入性强，难以针对特定页面定制
- ❌ 修改 pages.json 自定义字段：需要编译时处理，实现复杂
- ✅ onShow + 工具函数：简单可靠，UniApp 官方推荐

**实现模式**:
```javascript
// src/utils/authGuard.js
export const PROTECTED_PAGES = [
  '/pages/user/index',
  '/pages/distribution/index',
  '/pages/mall/cart',
  '/pages/mall/order-confirm',
  '/pages/mall/order-detail',
  '/pages/mall/coupons',
  '/pages/hotel/book-confirm',
  '/pages/hotel/order-detail'
]

export const requireAuth = (currentPath) => {
  const userStore = useUserStore()

  if (!userStore.isLogin) {
    // 保存目标页面路径
    uni.setStorageSync('redirect_path', currentPath)

    // 跳转到登录页
    uni.redirectTo({ url: '/pages/user/login' })
    return false
  }

  return true
}

export const getRedirectPath = () => {
  return uni.getStorageSync('redirect_path') || '/pages/index/index'
}

export const clearRedirectPath = () => {
  uni.removeStorageSync('redirect_path')
}
```

**页面中使用**:
```javascript
// 在需要保护的页面中
import { requireAuth } from '@/utils/authGuard'

export default {
  onShow() {
    const currentPath = getCurrentPages().pop().route
    requireAuth(`/${currentPath}`)
  }
}
```

**登录成功跳转**:
```javascript
// 登录页面
import { getRedirectPath, clearRedirectPath } from '@/utils/authGuard'

const handleLoginSuccess = () => {
  const redirectPath = getRedirectPath()
  clearRedirectPath()

  uni.switchTab({ url: redirectPath }) // 如果是 TabBar 页面
  // 或
  uni.redirectTo({ url: redirectPath }) // 如果是普通页面
}
```

**技术权衡**:
- ✅ 优点：实现简单，无需编译时处理，灵活性高
- ✅ 优点：每个页面可以定制守卫逻辑
- ⚠️ 缺点：需要在每个受保护页面手动添加 `onShow` 调用
- ⚠️ 缓解：通过文档和代码审查确保不遗漏

## 总结

| 研究主题 | 决策 | 核心收益 |
|----------|------|----------|
| Token 刷新 | 拦截器 + Promise 队列 | 避免并发刷新，用户无感知 |
| Token 存储 | uni.Storage + Pinia persist | 跨平台兼容 + 自动持久化 |
| 微信登录 | wx.login → 后端验证 | 符合官方规范，安全可靠 |
| 短信限流 | 前端倒计时 + 后端限制 | UX + 安全双重保护 |
| 响应格式 | 兼容 code 0/200 | 适配后端实际返回 |
| 401 处理 | 清除凭证 + 跳转登录 | 避免死循环，用户体验好 |
| 环境配置 | Vite .env 文件 | 标准化，易于部署 |
| 分页加载 | 滚动 + page/pageSize | 移动端最佳实践 |
| 路由守卫 | onShow + 工具函数 | UniApp 兼容，灵活可控 |

所有技术决策均基于现有 UniApp 3.0 + Vue 3 + Pinia 技术栈，无需引入新依赖。
