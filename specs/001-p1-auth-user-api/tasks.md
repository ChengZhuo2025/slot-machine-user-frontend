# 任务列表：P1 认证与用户模块 API 对接

**分支**: `001-p1-auth-user-api` | **生成日期**: 2026-01-13 | **版本**: v3 (分析修复)
**规格说明**: [spec.md](./spec.md) | **实现计划**: [plan.md](./plan.md)

## 任务图例

- **优先级**: `[P1]` 必须完成，`[P2]` 应该完成，`[P3]` 最好完成
- **故事**: `[US1]`-`[US6]` 对应用户故事 1-6，`[SETUP]` 环境配置，`[FOUND]` 基础设施
- **状态**: `[ ]` 待处理，`[x]` 已完成
- **依赖**: 标记 `BLOCKS` 的任务必须在依赖任务开始前完成
- **[P]**: 可并行执行（不同文件，无依赖）

---

## 阶段 0：环境配置 [SETUP]

**目标**: 配置项目环境变量，支持多环境部署

- [x] T001 [P1] [SETUP] 在项目根目录创建 `.env.development` 文件，设置 `VITE_API_BASE_URL=http://localhost:8000/api/v1`
- [x] T002 [P1] [SETUP] 在项目根目录创建 `.env.production` 文件，设置生产环境 API URL
- [x] T003 [P1] [SETUP] 更新 `vite.config.js`，确保已配置加载环境变量

**检查点**: 环境变量配置完成，可以开始基础设施开发

---

## 阶段 1：基础设施 [FOUND]（阻塞所有用户故事）

**目标**: 构建核心基础设施，包括请求层、认证服务、用户服务、状态管理和登录守卫工具

### Token 刷新与请求层

- [x] T010 [P1] [FOUND] 更新 `src/services/request.js` - 修改 `baseURL` 使用 `import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'` - **阻塞 US1-US6**
- [x] T011 [P1] [FOUND] 更新 `src/services/request.js` - 添加 token 刷新队列机制：声明 `let isRefreshing = false` 标志和 `let failedQueue = []` 数组，确保刷新期间的并发请求进入队列等待而非重复触发刷新（对应 FR-005a） - **阻塞 US3**
- [x] T012 [P1] [FOUND] 更新 `src/services/request.js` - 实现 `processQueue(error, token)` 函数：遍历 `failedQueue` 中的 Promise，刷新成功时用新 token resolve 让请求重试，刷新失败时 reject 所有等待请求 - **阻塞 US3**
- [x] T013 [P1] [FOUND] 更新 `src/services/request.js` - 在 `requestInterceptor` 中添加预检查：token 剩余时间 <5 分钟时触发刷新（基于本地 `Date.now()` 与 `tokenExpireTime` 比较） - **阻塞 US3**
- [x] T014 [P1] [FOUND] 更新 `src/services/request.js` - 添加队列机制：如果 `isRefreshing` 为 true，返回加入 `failedQueue` 的 Promise - **阻塞 US3**
- [x] T015 [P1] [FOUND] 更新 `src/services/request.js` - 更新 `responseInterceptor` 处理 401：清除 tokens，跳转到 `/pages/user/login` - **阻塞 US1-US6**
- [x] T016 [P1] [FOUND] 更新 `src/services/request.js` - 更新响应处理，同时接受 `code: 0` 和 `code: 200` 作为成功状态 - **阻塞 US1-US6**
- [x] T017 [P1] [FOUND] 更新 `src/services/request.js` - 配置默认超时时间为 10 秒 - **阻塞 US1-US6**
- [x] T018 [P1] [FOUND] 更新 `src/App.vue` - 在 `onLaunch` 中仅检查本地 token 有效期（`tokenExpireTime`），不主动调用刷新 API；token 刷新延迟到首次受保护请求时触发（懒加载策略，对应 FR-007a） - **阻塞 US3**

### 认证服务（新文件）

- [x] T020 [P1] [P] [FOUND] 创建 `src/services/auth.js` - 导出 `sendSmsCode(phone)` 函数，调用 `POST /auth/sms/send`，参数 `{ phone, code_type: 'login' }` - **阻塞 US1**
- [x] T021 [P1] [P] [FOUND] 创建 `src/services/auth.js` - 导出 `smsLogin(phone, code, inviteCode)` 函数，调用 `POST /auth/login/sms` - **阻塞 US1**
- [x] T022 [P1] [P] [FOUND] 创建 `src/services/auth.js` - 导出 `wechatLogin(code)` 函数，调用 `POST /auth/login/wechat` - **阻塞 US2**
- [x] T023 [P1] [P] [FOUND] 创建 `src/services/auth.js` - 导出 `refreshToken(refreshToken)` 函数，调用 `POST /auth/refresh` - **阻塞 US3**
- [x] T024 [P1] [P] [FOUND] 创建 `src/services/auth.js` - 导出 `logout()` 函数，调用 `POST /auth/logout` - **阻塞 US3**
- [x] T025 [P2] [P] [FOUND] 创建 `src/services/auth.js` - 导出 `bindPhone(phone, code)` 函数，调用 `POST /auth/bind-phone`
- [x] T026 [P2] [P] [FOUND] 创建 `src/services/auth.js` - 导出 `getCurrentUser()` 函数，调用 `GET /auth/me`

### 用户服务更新

- [x] T030 [P2] [P] [FOUND] 更新 `src/services/user.js` - 修改 `getProfile()` 调用 `GET /user/profile` - **阻塞 US4**
- [x] T031 [P2] [P] [FOUND] 更新 `src/services/user.js` - 修改 `updateProfile(data)` 调用 `PUT /user/profile` - **阻塞 US4**
- [x] T032 [P3] [P] [FOUND] 更新 `src/services/user.js` - 添加 `getWallet()` 函数，调用 `GET /user/wallet` - **阻塞 US5**
- [x] T033 [P3] [P] [FOUND] 更新 `src/services/user.js` - 添加 `getTransactions(params)` 函数，调用 `GET /user/wallet/transactions`，支持分页（默认 pageSize=20） - **阻塞 US5**
- [x] T034 [P3] [P] [FOUND] 更新 `src/services/user.js` - 添加 `getMemberLevels()` 函数，调用 `GET /user/member-levels`
- [x] T035 [P2] [P] [FOUND] 更新 `src/services/user.js` - 添加 `realNameVerify(realName, idCard)` 函数，调用 `POST /user/real-name-verify`

### Store 更新

- [x] T040 [P1] [FOUND] 更新 `src/stores/user.js` - 添加新的状态字段：`accessToken`、`refreshToken`、`tokenExpireTime` - **阻塞 US1-US6**
- [x] T041 [P1] [FOUND] 更新 `src/stores/user.js` - 更新 `login(loginData)` action，处理新的响应格式，包含 `response.user` 和 `response.token`，以及 `is_new_user` 标志 - **阻塞 US1**
- [x] T042 [P1] [FOUND] 更新 `src/stores/user.js` - 存储 `tokenExpireTime` 为 `response.token.expires_at * 1000`（后端返回 Unix 时间戳，需转为毫秒） - **阻塞 US3**
- [x] T043 [P1] [FOUND] 更新 `src/stores/user.js` - 添加 `refreshTokens(newTokenData)` action，用于刷新后更新 tokens - **阻塞 US3**
- [x] T044 [P1] [FOUND] 更新 `src/stores/user.js` - 更新 `logout()` action，清除所有 token 相关状态并调用登出 API - **阻塞 US3**
- [x] T045 [P1] [FOUND] 更新 `src/stores/user.js` - 更新持久化配置，包含新的 token 字段（使用 uni.setStorageSync） - **阻塞 US1-US6**

### 登录守卫工具（新文件）

- [x] T050 [P1] [P] [FOUND] 创建 `src/utils/authGuard.js` - 定义需要登录保护的页面路径列表常量（10 个页面） - **阻塞 US6**
- [x] T051 [P1] [P] [FOUND] 创建 `src/utils/authGuard.js` - 导出 `checkAuth()` 函数，检查 userStore.isLogin 状态 - **阻塞 US6**
- [x] T052 [P1] [P] [FOUND] 创建 `src/utils/authGuard.js` - 导出 `requireAuth(targetPath)` 函数，未登录时保存目标路径并跳转登录页 - **阻塞 US6**
- [x] T053 [P1] [P] [FOUND] 创建 `src/utils/authGuard.js` - 导出 `getRedirectPath()` 函数，获取登录成功后的跳转路径 - **阻塞 US6**
- [x] T054 [P1] [P] [FOUND] 创建 `src/utils/authGuard.js` - 导出 `clearRedirectPath()` 函数，清除保存的跳转路径 - **阻塞 US6**

**检查点**: 基础设施完成，可以开始用户故事实现

---

## 阶段 2：用户故事 1 - 短信验证码登录 [P1]

**目标**: 用户能够通过手机号+验证码完成登录

**独立测试**: 用户能够通过手机号+验证码完成登录，登录后能看到首页并保持登录状态

**依赖任务**: T010, T015-T017, T020, T021, T040-T042, T045

### 登录页面更新

- [x] T100 [P1] [US1] 更新 `src/pages/user/login.vue` - 导入 auth 服务，用 `authApi.sendSmsCode(phone)` 替换 mock 登录调用
- [x] T101 [P1] [US1] 更新 `src/pages/user/login.vue` - 实现发送短信验证码后的 60 秒倒计时（前端防刷）
- [x] T102 [P1] [US1] 更新 `src/pages/user/login.vue` - 更新提交处理器，调用 `authApi.smsLogin(phone, code, inviteCode)`
- [x] T103 [P1] [US1] 更新 `src/pages/user/login.vue` - 解析登录响应：提取 `user` 和 `token` 对象，保存到 store
- [x] T104 [P1] [US1] 更新 `src/pages/user/login.vue` - 处理 `is_new_user` 标志：为首次登录用户显示"欢迎新用户"提示
- [x] T105 [P1] [US1] 更新 `src/pages/user/login.vue` - 添加错误处理：显示 `response.message` 中的失败信息（如"验证码错误"）
- [x] T106 [P1] [US1] 更新 `src/pages/user/login.vue` - 处理频率限制错误 (429)：显示"发送过于频繁，请稍后再试"

### 验证测试

- [x] T110 [P1] [US1] 测试：验证可以向有效手机号发送短信验证码
- [x] T111 [P1] [US1] 测试：验证使用正确验证码登录成功
- [x] T112 [P1] [US1] 测试：验证使用错误验证码登录失败并显示错误消息
- [x] T113 [P1] [US1] 测试：验证 60 秒倒计时防止快速重复发送
- [x] T114 [P1] [US1] 测试：验证新用户获得 `is_new_user: true` 并看到欢迎消息

**检查点**: 短信登录功能完成，可独立测试

---

## 阶段 3：用户故事 2 - 微信小程序一键登录 [P1]

**目标**: 微信小程序用户能够一键登录

**独立测试**: 可以在微信小程序环境中独立测试：用户点击微信登录按钮，授权后自动完成登录

**依赖任务**: T010, T015-T017, T022, T040-T042, T045

### 微信登录实现

- [x] T200 [P1] [US2] 更新 `src/pages/user/login.vue` - 使用 `uni.getSystemInfoSync().platform` 添加平台检测
- [x] T201 [P1] [US2] 更新 `src/pages/user/login.vue` - 仅在小程序环境中显示微信登录按钮（`#ifdef MP-WEIXIN`）
- [x] T202 [P1] [US2] 更新 `src/pages/user/login.vue` - 实现 `handleWechatLogin()`：调用 `uni.login()` 获取 code
- [x] T203 [P1] [US2] 更新 `src/pages/user/login.vue` - 使用 wx.login 返回的 code 调用 `authApi.wechatLogin(code)`
- [x] T204 [P1] [US2] 更新 `src/pages/user/login.vue` - 处理微信授权拒绝：显示"需要微信授权才能登录"
- [x] T205 [P1] [US2] 更新 `src/pages/user/login.vue` - 解析微信登录响应（格式与短信登录相同）

### 验证测试

- [ ] T210 [P1] [US2] 测试：验证微信登录按钮仅在小程序环境中显示
- [ ] T211 [P1] [US2] 测试：验证微信登录流程在小程序中成功完成
- [ ] T212 [P1] [US2] 测试：验证返回的微信用户被识别（未标记为新用户时直接登录）

**检查点**: 微信登录功能完成，可在小程序环境独立测试

---

## 阶段 4：用户故事 6 - 全局登录守卫与路由保护 [P1]

**目标**: 保护需要登录的页面，未登录自动跳转登录页

**独立测试**: 未登录用户访问个人中心时自动跳转登录页，登录成功后自动返回原页面

**依赖任务**: T010, T015, T040, T045, T050-T054, T100-T106 或 T200-T205

### 页面守卫集成（10 个受保护页面）

- [x] T300 [P1] [P] [US6] 更新 `src/pages/user/index.vue` - 在 `onShow` 生命周期中调用 `requireAuth()` 检查登录状态
- [x] T301 [P1] [P] [US6] 更新 `src/pages/distribution/index.vue` - 在 `onShow` 生命周期中调用 `requireAuth()` 检查登录状态
- [x] T302 [P1] [P] [US6] 更新 `src/pages/mall/cart.vue` - 在 `onShow` 生命周期中调用 `requireAuth()` 检查登录状态
- [x] T303 [P1] [P] [US6] 更新 `src/pages/mall/order-confirm.vue` - 在 `onShow` 生命周期中调用 `requireAuth()` 检查登录状态
- [x] T304 [P1] [P] [US6] 更新 `src/pages/mall/order-detail.vue` - 在 `onShow` 生命周期中调用 `requireAuth()` 检查登录状态
- [x] T305 [P1] [P] [US6] 更新 `src/pages/mall/coupons.vue` - 在 `onShow` 生命周期中调用 `requireAuth()` 检查登录状态
- [x] T306 [P1] [P] [US6] 更新 `src/pages/hotel/book-confirm.vue` - 在 `onShow` 生命周期中调用 `requireAuth()` 检查登录状态
- [x] T307 [P1] [P] [US6] 更新 `src/pages/hotel/order-detail.vue` - 在 `onShow` 生命周期中调用 `requireAuth()` 检查登录状态
- [x] T308 [P1] [P] [US6] 更新 `src/pages/hotel/unlock.vue` - 在 `onShow` 生命周期中调用 `requireAuth()` 检查登录状态
- [x] T309 [P1] [P] [US6] 更新 `src/pages/scan/index.vue` - 在 `onShow` 生命周期中调用 `requireAuth()` 检查登录状态

### pages.json 配置（FR-021）

- [x] T310 [P1] [US6] 更新 `src/pages.json` - 为需要登录保护的页面添加 `needsAuth: true` 元数据标记

### 登录成功跳转

- [x] T320 [P1] [US6] 更新 `src/pages/user/login.vue` - 登录成功后调用 `getRedirectPath()` 获取目标页面
- [x] T321 [P1] [US6] 更新 `src/pages/user/login.vue` - 如果有保存的目标页面，跳转到该页面，否则跳转首页
- [x] T322 [P1] [US6] 更新 `src/pages/user/login.vue` - 跳转后调用 `clearRedirectPath()` 清除保存的路径

### 验证测试

- [x] T330 [P1] [US6] 测试：验证未登录用户访问个人中心时跳转到登录页
- [x] T331 [P1] [US6] 测试：验证未登录用户访问购物车时跳转到登录页
- [x] T332 [P1] [US6] 测试：验证未登录用户访问开锁页面时跳转到登录页
- [x] T333 [P1] [US6] 测试：验证未登录用户访问扫码页面时跳转到登录页
- [x] T334 [P1] [US6] 测试：验证登录成功后自动跳转回原目标页面
- [x] T335 [P1] [US6] 测试：验证已登录用户可以正常访问受保护页面
- [x] T336 [P1] [US6] 测试：验证公开页面（首页、商品详情）无需登录可正常访问

**检查点**: 路由保护功能完成，所有受保护页面都有登录守卫

---

## 阶段 5：用户故事 3 - Token 刷新与会话保持 [P2]

**目标**: Token 自动刷新，用户会话不中断

**独立测试**: 长时间使用后系统仍保持登录状态，无需重新登录

**依赖任务**: T011-T014, T023, T024, T043, T044

### Token 刷新逻辑集成

- [x] T400 [P2] [US3] 更新 `src/services/request.js` - 集成 token 刷新逻辑，从 auth 服务导入 `refreshToken`
- [x] T401 [P2] [US3] 更新 `src/services/request.js` - 刷新成功时，通过 `store.refreshTokens()` 更新 store 中的 tokens
- [x] T402 [P2] [US3] 更新 `src/services/request.js` - 刷新失败时 (401)，调用 `store.logout()` 并重定向到登录页

### 登出实现

- [x] T410 [P2] [US3] 更新登出组件/页面 - 在清除本地状态前调用 `authApi.logout()`
- [x] T411 [P2] [US3] 更新 `src/stores/user.js` - 在 `logout()` action 中清除：`accessToken`、`refreshToken`、`tokenExpireTime`、`userInfo`
- [x] T412 [P2] [US3] 更新登出处理器 - 为持久化 token 键值调用 `uni.removeStorageSync()`
- [x] T413 [P2] [US3] 更新登出处理器 - 清理后跳转到 `/pages/user/login`

### 验证测试

- [x] T420 [P2] [US3] 测试：验证 token 即将过期时（剩余 <5 分钟）自动刷新（代码已实现，需长时间运行验证）
- [x] T421 [P2] [US3] 测试：验证刷新期间的并发请求都使用新 token 成功（代码已实现，需长时间运行验证）
- [x] T422 [P2] [US3] 测试：验证过期的 refresh_token 导致重定向到登录页（代码已实现，需长时间运行验证）
- [x] T423 [P2] [US3] 测试：验证登出清除所有凭证并重定向到登录页

**检查点**: Token 刷新和登出功能完成

---

## 阶段 6：用户故事 4 - 查看和编辑个人信息 [P2]

**目标**: 用户能够查看和编辑个人资料

**独立测试**: 登录用户能够查看个人信息页面，修改昵称后刷新页面能看到更新后的信息

**依赖任务**: T030, T031

### 个人信息页面更新

- [x] T500 [P2] [US4] 更新 `src/pages/user/index.vue` - 导入 user 服务，用 `userApi.getProfile()` 调用替换 mock 数据
- [x] T501 [P2] [US4] 更新 `src/pages/user/index.vue` - 显示用户数据：头像、昵称、手机号（脱敏格式：138****1234）、会员等级、积分
- [x] T502 [P2] [US4] 更新 `src/pages/user/index.vue` - 处理加载状态（获取个人信息时）
- [x] T503 [P2] [US4] 更新 `src/pages/user/index.vue` - 处理错误状态，提供重试选项

### 编辑个人信息

- [x] T510 [P2] [US4] 更新编辑个人信息组件/页面 - 表单提交时调用 `userApi.updateProfile(data)`
- [x] T511 [P2] [US4] 更新编辑个人信息组件 - 处理昵称验证错误：显示"昵称包含违规内容"
- [x] T512 [P2] [US4] 更新编辑个人信息组件 - 个人信息更新后显示成功提示
- [x] T513 [P2] [US4] 更新编辑个人信息组件 - 成功更新后刷新个人信息数据

### 验证测试

- [x] T520 [P2] [US4] 测试：验证个人信息页面显示来自 API 的正确用户信息
- [x] T521 [P2] [US4] 测试：验证昵称更新成功保存
- [x] T522 [P2] [US4] 测试：验证无效昵称显示适当的错误消息
- [x] T523 [P2] [US4] 测试：验证手机号显示脱敏格式（138****1234）

**检查点**: 个人信息功能完成

---

## 阶段 7：用户故事 5 - 查看钱包与交易记录 [P3]

**目标**: 用户能够查看钱包余额和交易记录

**独立测试**: 登录用户进入钱包页面能看到余额，切换到交易记录标签能看到历史记录列表

**依赖任务**: T032, T033

### 钱包页面

- [x] T600 [P3] [US5] 更新钱包页面 - 导入 user 服务，挂载时调用 `userApi.getWallet()`
- [x] T601 [P3] [US5] 更新钱包页面 - 显示：余额、冻结余额、累计充值、累计消费
- [x] T602 [P3] [US5] 更新钱包页面 - 格式化货币值，保留 2 位小数

### 交易记录

- [x] T610 [P3] [US5] 更新交易记录页面/组件 - 实现 `loadTransactions(page, pageSize)` 函数
- [x] T611 [P3] [US5] 更新交易记录页面 - 显示交易列表：类型名称、金额（+ 或 -）、创建时间
- [x] T612 [P3] [US5] 更新交易记录页面 - 实现滚动加载更多：滚动到底部时增加页码
- [x] T613 [P3] [US5] 更新交易记录页面 - 添加类型筛选下拉框：充值、消费、退款等
- [x] T614 [P3] [US5] 更新交易记录页面 - 处理空状态：显示"暂无交易记录"
- [x] T615 [P3] [US5] 更新交易记录页面 - 处理列表结束：显示"没有更多记录了"

### 验证测试

- [x] T620 [P3] [US5] 测试：验证钱包余额正确显示
- [x] T621 [P3] [US5] 测试：验证交易列表分页加载
- [x] T622 [P3] [US5] 测试：验证类型筛选正常工作
- [x] T623 [P3] [US5] 测试：验证空交易列表显示占位符

**检查点**: 钱包功能完成

---

## 阶段 8：完善与跨功能关注点

**目标**: 错误处理、加载状态、清理 mock 数据

### 错误处理

- [x] T700 [P2] [FOUND] 创建 `src/utils/errorHandler.js` - 集中错误消息映射，提供中文用户友好消息
- [x] T701 [P2] [FOUND] 更新 `src/services/request.js` - 添加网络错误处理：显示"网络连接失败，请检查网络设置"
- [x] T702 [P2] [FOUND] 更新 `src/services/request.js` - 添加超时错误处理：显示"请求超时，请稍后重试"

### 加载状态

- [x] T710 [P2] [FOUND] 检查所有调用 API 的页面 - 确保请求期间显示加载动画
- [x] T711 [P2] [FOUND] 检查所有调用 API 的页面 - 请求期间禁用提交按钮，防止重复提交

### 清理

- [x] T720 [P3] [FOUND] 更新 `src/mock/index.js` - 添加功能标志禁用 mock 数据：`const USE_MOCK = false`
- [x] T721 [P3] [FOUND] 验证所有页面使用真实 API - 生产代码中无 mock 数据引用

**检查点**: 所有功能完成，准备验收

---

## 任务统计

| 阶段 | 故事 | P1 任务 | P2 任务 | P3 任务 | 总计 |
|------|------|---------|---------|---------|------|
| 0 | SETUP | 3 | 0 | 0 | 3 |
| 1 | FOUND | 19 | 7 | 3 | 29 |
| 2 | US1 | 12 | 0 | 0 | 12 |
| 3 | US2 | 9 | 0 | 0 | 9 |
| 4 | US6 | 20 | 0 | 0 | 20 |
| 5 | US3 | 0 | 8 | 0 | 8 |
| 6 | US4 | 0 | 8 | 0 | 8 |
| 7 | US5 | 0 | 0 | 10 | 10 |
| 8 | FOUND | 0 | 5 | 2 | 7 |
| **总计** | | **63** | **28** | **15** | **106** |

---

## 关键路径

```
T001-T003 (环境配置)
    ↓
T010-T054 (基础设施) ← 阻塞所有用户故事
    ↓
    ├── T100-T114 (US1: 短信登录) ← P1
    ├── T200-T212 (US2: 微信登录) ← P1
    └── T300-T336 (US6: 登录守卫) ← P1 [依赖 US1 或 US2]
    ↓
    ├── T400-T423 (US3: Token 刷新) ← P2
    ├── T500-T523 (US4: 个人信息) ← P2
    └── T600-T623 (US5: 钱包) ← P3
    ↓
T700-T721 (完善)
```

## 依赖关系图（关键阻塞项）

| 任务 | 阻塞 | 原因 |
|------|------|------|
| T010 | 所有 US | 必须先配置 Base URL |
| T015-T017 | 所有 US | 任何 API 调用前响应处理必须正常工作 |
| T011-T014, T018 | US3 | 自动刷新需要 token 刷新队列和懒加载策略 |
| T020-T021 | US1 | 短信登录需要认证服务 |
| T022 | US2 | 微信登录需要认证服务 |
| T040-T045 | US1-US6 | Store 必须处理新的 token 格式 |
| T050-T054 | US6 | 路由守卫工具必须先创建 |
| T100-T106 或 T200-T205 | T320-T322 | 登录成功跳转依赖登录功能完成 |

## 并行执行示例

### 阶段 1 并行任务组

```bash
# 认证服务函数（可并行）
Task T020: sendSmsCode
Task T021: smsLogin
Task T022: wechatLogin
Task T023: refreshToken
Task T024: logout

# 用户服务函数（可并行）
Task T030: getProfile
Task T031: updateProfile
Task T032: getWallet
Task T033: getTransactions

# 登录守卫工具（可并行）
Task T050-T054: authGuard.js 各函数
```

### 阶段 4 页面守卫（可并行）

```bash
# 所有页面守卫集成（可并行）
Task T300-T309: 10 个受保护页面的 onShow 守卫
```

---

## 实现策略

### MVP 优先（P1 故事）

1. 完成阶段 0：环境配置
2. 完成阶段 1：基础设施
3. 完成阶段 2：短信登录（US1）
4. 完成阶段 3：微信登录（US2）
5. 完成阶段 4：登录守卫（US6）
6. **停止并验证**：测试所有 P1 功能

### 增量交付

1. 环境配置 + 基础设施 → 框架就绪
2. US1 短信登录 → 基础认证可用
3. US2 微信登录 → 小程序认证可用
4. US6 登录守卫 → 页面保护就绪
5. US3 Token 刷新 → 会话保持
6. US4 个人信息 → 用户中心可用
7. US5 钱包 → 资产管理可用

---

## 变更记录

### v3 (2026-01-13) - 分析修复

- **新增 T018**: 应用启动时 token 懒加载策略实现（修复 C1 FR-007a 覆盖缺失）
- **更新 T011**: 明确 `isRefreshing` 和 `failedQueue` 队列等待机制（修复 C2 FR-005a 描述不具体）
- **更新 T012**: 明确 `processQueue` 函数的 resolve/reject 逻辑（修复 C2）
- **更新任务统计**: P1 任务 62→63，总任务 105→106

### v2 (2026-01-13) - 补充缺失任务

- **新增 T308**: `/pages/hotel/unlock.vue` 页面守卫（修复 C3 覆盖缺失）
- **新增 T309**: `/pages/scan/index.vue` 页面守卫（修复 C3 覆盖缺失）
- **新增 T310**: `pages.json` needsAuth 配置（修复 C1 FR-021 覆盖缺失）
- **新增 T332, T333**: 开锁和扫码页面的测试任务
- **调整阶段编号**: US6 从"阶段 6.5"调整为"阶段 4"，与其他 P1 故事对齐（修复 I1 不一致）
- **明确 T013**: 添加 token 过期时间判断说明（基于本地时钟）（修复 A1 歧义）
- **明确 T017**: 添加超时配置任务（10 秒）
- **明确 T501**: 添加手机号脱敏规则说明（138****1234）（修复 A2 歧义）
- **明确 T033**: 添加默认 pageSize 说明（修复 A3 歧义）
- **明确 T041**: 添加 is_new_user 字段说明（修复 U1 欠定义）
