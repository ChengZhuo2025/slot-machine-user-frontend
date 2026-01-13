# Quickstart: P1 认证与用户模块 API 对接

**Created**: 2026-01-13
**Feature**: P1 Auth & User API Integration

## Prerequisites

1. **后端服务运行中**
   ```bash
   cd /Users/baoyouhua/Documents/Slot-Machine/backend
   go run cmd/api-gateway/main.go
   # 确认服务在 http://localhost:8000 运行
   ```

2. **查看 API 文档**
   - 打开浏览器访问: http://localhost:8000/swagger/index.html

3. **前端开发环境**
   ```bash
   cd /Users/baoyouhua/Documents/Slot-Machine/user-frontend
   npm install
   npm run dev:h5
   ```

## Quick Verification Steps

### 1. 验证后端连通性

```bash
# 测试健康检查
curl http://localhost:8000/health

# 预期响应: {"status":"ok"}
```

### 2. 测试短信验证码发送

```bash
curl -X POST http://localhost:8000/api/v1/auth/sms/send \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","code_type":"login"}'

# 预期响应: {"code":0,"message":"success","data":{"expire_in":300}}
```

### 3. 测试短信登录

```bash
# 注意：需要使用真实发送的验证码，或查看后端日志获取测试验证码
curl -X POST http://localhost:8000/api/v1/auth/login/sms \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","code":"123456"}'

# 预期响应包含 user 和 token
```

### 4. 测试用户信息获取

```bash
# 替换 <TOKEN> 为上一步返回的 access_token
curl http://localhost:8000/api/v1/user/profile \
  -H "Authorization: Bearer <TOKEN>"

# 预期响应: 用户详细信息
```

### 5. 测试钱包信息

```bash
curl http://localhost:8000/api/v1/user/wallet \
  -H "Authorization: Bearer <TOKEN>"

# 预期响应: 余额信息
```

## Frontend Integration Checklist

### Step 1: 更新 Base URL

修改 `src/services/request.js`:
```javascript
// Before
const baseURL = 'http://localhost:3000/api'

// After
const baseURL = 'http://localhost:8000/api/v1'
```

### Step 2: 创建 Auth Service

新建 `src/services/auth.js`:
```javascript
import { post } from './request'

export const sendSmsCode = (phone) => {
  return post('/auth/sms/send', { phone, code_type: 'login' })
}

export const smsLogin = (phone, code, inviteCode) => {
  return post('/auth/login/sms', { phone, code, invite_code: inviteCode })
}

export const wechatLogin = (code) => {
  return post('/auth/login/wechat', { code })
}

export const refreshToken = (refreshToken) => {
  return post('/auth/refresh', { refresh_token: refreshToken })
}

export const logout = () => {
  return post('/auth/logout')
}
```

### Step 3: 更新 User Service

修改 `src/services/user.js`:
```javascript
import { get, put } from './request'

export const getProfile = () => get('/user/profile')
export const updateProfile = (data) => put('/user/profile', data)
export const getWallet = () => get('/user/wallet')
export const getTransactions = (params) => get('/user/wallet/transactions', params)
```

### Step 4: 更新 User Store

修改 `src/stores/user.js` 的 login 方法以适配新响应格式:
```javascript
const login = async (loginData) => {
  let response
  if (loginData.loginType === 'sms') {
    response = await authApi.smsLogin(loginData.phone, loginData.code)
  } else if (loginData.loginType === 'wechat') {
    response = await authApi.wechatLogin(loginData.code)
  }

  // 保存 token
  accessToken.value = response.token.access_token
  refreshToken.value = response.token.refresh_token
  tokenExpireTime.value = response.token.expires_at * 1000  // 后端返回 Unix 时间戳（秒），转为毫秒

  // 保存用户信息
  userInfo.value = response.user

  return response
}
```

### Step 5: 实现 Token 自动刷新

在 `src/services/request.js` 中添加:
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

// 在 requestInterceptor 中添加
const tokenExpireTime = uni.getStorageSync('tokenExpireTime')
if (tokenExpireTime && Date.now() > tokenExpireTime - 5 * 60 * 1000) {
  if (!isRefreshing) {
    isRefreshing = true
    const refreshToken = uni.getStorageSync('refreshToken')
    authApi.refreshToken(refreshToken)
      .then(newToken => {
        uni.setStorageSync('token', newToken.access_token)
        uni.setStorageSync('refreshToken', newToken.refresh_token)
        uni.setStorageSync('tokenExpireTime', newToken.expires_at * 1000)  // Unix 时间戳转毫秒
        processQueue(null, newToken.access_token)
      })
      .catch(err => {
        processQueue(err, null)
        // 刷新失败，清除登录状态
        uni.removeStorageSync('token')
        uni.navigateTo({ url: '/pages/user/login' })
      })
      .finally(() => {
        isRefreshing = false
      })
  }
}
```

## Common Issues & Solutions

### Issue 1: CORS 错误

**Symptom**: 浏览器控制台显示 CORS 相关错误

**Solution**: 后端已配置 CORS，确认请求发往正确端口 (8000 不是 3000)

### Issue 2: 401 Unauthorized

**Symptom**: 请求返回 401 状态码

**Solution**:
1. 检查 token 是否正确保存
2. 检查 Authorization header 格式: `Bearer <token>`
3. 检查 token 是否过期

### Issue 3: Token 刷新死循环

**Symptom**: 刷新 token 时不断重试

**Solution**: 确保刷新接口返回 401 时直接跳转登录，不再尝试刷新

## Verification Checklist

- [ ] 后端服务运行在 localhost:8000
- [ ] 可以通过 curl 测试 API 连通性
- [ ] 前端 baseURL 已更新为 localhost:8000/api/v1
- [ ] 短信登录功能正常
- [ ] 微信登录功能正常（小程序环境）
- [ ] Token 自动刷新工作正常
- [ ] 用户信息页面正确显示
- [ ] 钱包余额正确显示
- [ ] 交易记录分页加载正常
- [ ] 401 错误正确跳转登录页
