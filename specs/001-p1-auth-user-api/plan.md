# 实现计划：P1 认证与用户模块 API 对接

**分支**: `001-p1-auth-user-api` | **日期**: 2026-01-13 | **规格说明**: [spec.md](./spec.md)
**输入**: 来自 `/specs/001-p1-auth-user-api/spec.md` 的功能规格说明

## 概述

将用户端前端从 Mock 数据迁移到真实后端 API（localhost:8000/api/v1），覆盖 P1 优先级的认证模块（短信登录、微信登录、Token 刷新、全局登录守卫）和用户模块（个人信息、钱包）。

**技术方案**：
- 重构 `src/services/request.js` 支持 Token 自动刷新（剩余 <5 分钟时刷新）和并发请求队列
- 更新 `src/services/user.js` 调用真实 API 端点
- 新增 `src/services/auth.js` 封装认证相关 API
- 新增 `src/utils/authGuard.js` 实现全局登录守卫，保护需要登录的页面
- 更新 Pinia store 以适配新的 API 响应结构

## 技术上下文

**语言/版本**: JavaScript (ES2020+) / Vue 3.4.21
**主要依赖**: UniApp 3.0, Vue 3.x (Composition API), Pinia 2.1.7 + persistedstate
**存储方案**: uni.getStorageSync/setStorageSync (本地存储)
**测试框架**: Vitest 1.0.4
**目标平台**: H5, 微信小程序 (mp-weixin), APP
**项目类型**: 移动端 (UniApp 跨端)
**性能目标**: 页面加载 <2s, API 响应处理 <200ms
**约束条件**: 兼容 H5 和微信小程序环境，Token 自动刷新需无感知
**规模范围**: 用户端应用，约 50 个页面/组件

## 项目宪法检查

*关卡：必须在第 0 阶段研究前通过。第 1 阶段设计完成后需重新检查。*

| 原则 | 状态 | 证据 |
|------|------|------|
| I. API 优先集成 | ✅ 通过 | 所有 service 函数将调用 `localhost:8000/api/v1`，不再使用 mock |
| II. 类型安全与契约合规 | ✅ 通过 | 响应处理遵循 `{ code: 0\|200, message, data }` 格式 |
| III. 错误处理与用户体验 | ✅ 通过 | 中文错误提示，401 自动跳转登录，loading 状态 |
| IV. 环境感知配置 | ✅ 通过 | baseURL 将提取为环境变量配置 |
| V. 渐进式迁移 | ✅ 通过 | 分模块迁移 auth → user，mock 文件保留至验证通过 |

**宪法检查结果**: 全部通过 ✅

## 项目结构

### 文档目录（本功能）

```text
specs/001-p1-auth-user-api/
├── plan.md              # 本文件（实现计划）
├── research.md          # 第 0 阶段输出（技术研究）
├── data-model.md        # 第 1 阶段输出（数据模型）
├── quickstart.md        # 第 1 阶段输出（快速开始指南）
├── contracts/           # 第 1 阶段输出（API 契约）
└── tasks.md             # 第 2 阶段输出（任务列表，/speckit.tasks 命令生成）
```

### 源代码目录（项目根目录）

```text
src/
├── components/
│   ├── common/          # 通用组件 (Icon, Modal, Switch)
│   ├── user/            # 用户相关组件 (EditProfile, BalanceDetail 等)
│   └── layout/          # 布局组件 (CustomTabBar)
├── pages/
│   ├── user/
│   │   ├── login.vue    # 登录页面 (需修改)
│   │   └── index.vue    # 用户中心页面
│   └── ...
├── services/
│   ├── request.js       # HTTP 请求封装 (需重构: Token 刷新)
│   ├── user.js          # 用户 API (需修改)
│   ├── auth.js          # 认证 API (新增)
│   └── index.js
├── stores/
│   ├── user.js          # 用户状态管理 (需修改)
│   └── ...
├── mock/
│   ├── user.js          # Mock 数据 (保留，最后禁用)
│   └── index.js
└── utils/
    ├── authGuard.js     # 登录守卫工具 (新增)
    └── ...
```

**结构决策**: 复用现有 UniApp 项目结构，仅修改 services 层和 stores 层以对接真实 API。

## 复杂度追踪

> 无违反项目宪法的情况需要说明。

无 - 方案符合所有项目宪法原则。

## 实现阶段规划

### 阶段 0：环境配置
- 创建环境变量配置文件（`.env.development`, `.env.production`）
- 配置 `VITE_API_BASE_URL` 指向后端 API

### 阶段 1：基础设施（阻塞所有功能）

**Token 刷新与请求层**:
- 更新 `src/services/request.js` 的 `baseURL` 使用环境变量
- 实现 Token 刷新队列机制（`isRefreshing` 标志 + `failedQueue` 数组）
- 在 `requestInterceptor` 中添加 token 过期预检查（<5 分钟触发刷新）
- 在 `responseInterceptor` 中处理 401 错误（清除 tokens 并跳转登录页）
- 支持 `code: 0` 和 `code: 200` 两种成功状态码

**认证服务（新文件）**:
- 创建 `src/services/auth.js`，导出：
  - `sendSmsCode(phone)` - 发送短信验证码
  - `smsLogin(phone, code, inviteCode)` - 短信登录
  - `wechatLogin(code)` - 微信登录
  - `refreshToken(refreshToken)` - 刷新 token
  - `logout()` - 退出登录
  - `bindPhone(phone, code)` - 绑定手机号（P2）
  - `getCurrentUser()` - 获取当前用户（P2）

**用户服务更新**:
- 更新 `src/services/user.js`：
  - `getProfile()` - 获取用户详情
  - `updateProfile(data)` - 更新用户信息
  - `getWallet()` - 获取钱包信息（P3）
  - `getTransactions(params)` - 获取交易记录（P3）
  - `getMemberLevels()` - 获取会员等级列表
  - `realNameVerify(realName, idCard)` - 实名认证（P2）

**Store 更新**:
- 更新 `src/stores/user.js`：
  - 添加新状态字段：`accessToken`, `refreshToken`, `tokenExpireTime`
  - 更新 `login(loginData)` action 处理新响应格式
  - 添加 `refreshTokens(newTokenData)` action
  - 更新 `logout()` action 清除所有 token
  - 更新持久化配置

**登录守卫工具（新文件）**:
- 创建 `src/utils/authGuard.js`，导出：
  - 受保护页面路径列表常量
  - `checkAuth()` - 检查登录状态
  - `requireAuth(targetPath)` - 未登录时保存目标路径并跳转登录页
  - `getRedirectPath()` - 获取登录成功后的跳转路径
  - `clearRedirectPath()` - 清除保存的跳转路径

### 阶段 2：用户故事 1 - 短信验证码登录（P1）

**依赖任务**: 基础设施（阶段 1）全部完成

- 更新 `src/pages/user/login.vue`：
  - 用 `authApi.sendSmsCode()` 替换 mock 调用
  - 实现 60 秒倒计时
  - 调用 `authApi.smsLogin()` 提交登录
  - 解析响应并保存到 store
  - 处理 `is_new_user` 标志
  - 添加错误处理（验证码错误、频率限制）

### 阶段 3：用户故事 2 - 微信小程序登录（P1）

**依赖任务**: 基础设施（阶段 1）全部完成

- 更新 `src/pages/user/login.vue`：
  - 添加平台检测（`uni.getSystemInfoSync().platform`）
  - 仅小程序环境显示微信登录按钮
  - 实现 `handleWechatLogin()`，调用 `uni.login()` 获取 code
  - 使用 code 调用 `authApi.wechatLogin()`
  - 处理授权拒绝情况

### 阶段 4：用户故事 6 - 全局登录守卫（P1）

**依赖任务**: 基础设施（阶段 1）全部完成，US1 和 US2 登录功能完成

**路由守卫集成**:
- 在以下页面的 `onShow` 生命周期中调用 `requireAuth()`：
  - `/pages/user/index` - 个人中心
  - `/pages/distribution/index` - 分销中心
  - `/pages/mall/cart` - 购物车
  - `/pages/mall/order-confirm` - 订单确认
  - `/pages/mall/order-detail` - 订单详情
  - `/pages/mall/coupons` - 优惠券
  - `/pages/hotel/book-confirm` - 酒店预订确认
  - `/pages/hotel/order-detail` - 酒店订单详情

**登录成功跳转**:
- 更新 `src/pages/user/login.vue`：
  - 登录成功后调用 `getRedirectPath()` 获取目标页面
  - 如果有保存的目标页面，跳转到该页面
  - 否则跳转到首页
  - 跳转后调用 `clearRedirectPath()` 清除保存的路径

### 阶段 5：用户故事 3 - Token 刷新与会话保持（P2）

**依赖任务**: 阶段 1 基础设施

- 在 `src/services/request.js` 集成 token 刷新逻辑
- 刷新成功时通过 `store.refreshTokens()` 更新 store
- 刷新失败时调用 `store.logout()` 并跳转登录页

### 阶段 6：用户故事 4 - 个人信息管理（P2）

**依赖任务**: US1 或 US2 登录功能完成

- 更新 `src/pages/user/index.vue`：
  - 用 `userApi.getProfile()` 替换 mock 数据
  - 显示用户信息（头像、昵称、手机号、会员等级、积分）
  - 处理加载和错误状态
- 更新编辑个人信息组件：
  - 调用 `userApi.updateProfile()` 提交修改
  - 处理验证错误
  - 成功后刷新数据

### 阶段 7：用户故事 5 - 钱包与交易记录（P3）

**依赖任务**: US1 或 US2 登录功能完成

- 更新钱包页面：
  - 调用 `userApi.getWallet()` 获取余额
  - 显示余额、冻结余额、累计充值、累计消费
- 更新交易记录页面：
  - 调用 `userApi.getTransactions()` 获取交易记录
  - 实现分页加载
  - 添加类型筛选
  - 处理空状态

### 阶段 8：完善与跨功能关注点

- 创建 `src/utils/errorHandler.js` 集中错误消息映射
- 添加网络错误和超时错误处理
- 检查所有页面的加载状态和防重复提交
- 禁用 mock 数据，验证所有页面使用真实 API

## 关键技术决策

### 1. Token 刷新策略

**决策**: 采用预检查 + 队列机制

**原因**:
- 预检查（<5 分钟触发）可以避免用户在使用过程中遇到 401 错误
- 队列机制确保并发请求只触发一次刷新，避免多次刷新导致 token 失效

**实现**:
```javascript
// 在 requestInterceptor 中
const tokenExpireTime = uni.getStorageSync('tokenExpireTime')
if (tokenExpireTime && Date.now() > tokenExpireTime - 5 * 60 * 1000) {
  // 触发刷新逻辑
}
```

### 2. 登录守卫实现方式

**决策**: 在页面 `onShow` 生命周期中调用守卫函数

**原因**:
- UniApp 没有全局路由守卫机制（不同于 Vue Router）
- `onShow` 生命周期在页面显示时触发，适合做登录检查
- 分散式实现更灵活，可以针对不同页面定制守卫逻辑

**备选方案**:
- 使用 mixin 统一注入守卫逻辑（更集中但灵活性较低）
- 在 pages.json 中配置页面元数据（需要自定义编译时处理）

### 3. 响应数据格式兼容

**决策**: 同时支持 `code: 0` 和 `code: 200` 作为成功状态

**原因**:
- 后端可能返回不同的成功状态码
- 提高兼容性，减少因状态码不一致导致的问题

**实现**:
```javascript
// 在 responseInterceptor 中
if (response.data.code === 0 || response.data.code === 200) {
  return response.data.data
}
```

## 验证清单

### 功能验证
- [ ] 短信登录功能正常，60 秒倒计时工作
- [ ] 微信登录在小程序环境中正常工作
- [ ] Token 自动刷新无感知，用户无需重新登录
- [ ] 未登录用户访问受保护页面时跳转到登录页
- [ ] 登录成功后自动跳转回原目标页面
- [ ] 个人信息页面正确显示用户数据
- [ ] 钱包余额和交易记录正确显示
- [ ] 401 错误正确跳转登录页

### 性能验证
- [ ] 页面加载时间 <2s
- [ ] API 响应处理 <200ms
- [ ] Token 刷新不阻塞用户操作

### 安全验证
- [ ] Token 正确存储在本地（使用 uni.setStorageSync）
- [ ] 退出登录清除所有凭证
- [ ] 受保护页面未登录无法访问

### 兼容性验证
- [ ] H5 环境登录功能正常
- [ ] 微信小程序环境登录功能正常
- [ ] 不同平台 token 持久化正常工作
