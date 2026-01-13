# Feature Specification: P1 认证与用户模块 API 对接

**Feature Branch**: `001-p1-auth-user-api`
**Created**: 2026-01-13
**Status**: Draft
**Input**: 对接 P1 优先级模块：认证（auth）和用户（user）。认证包括短信登录、微信登录、Token 刷新；用户包括个人信息和钱包。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 短信验证码登录 (Priority: P1)

用户通过手机号和短信验证码登录系统。用户输入手机号，点击获取验证码，收到短信后输入验证码完成登录。新用户首次登录自动注册账号。

**Why this priority**: 短信登录是最基础的认证方式，是所有需要身份验证功能的前置条件。没有登录功能，用户无法访问任何受保护的资源。

**Independent Test**: 可以独立测试：用户能够通过手机号+验证码完成登录，登录后能看到首页并保持登录状态。

**Acceptance Scenarios**:

1. **Given** 用户在登录页面，**When** 输入有效手机号并点击发送验证码，**Then** 系统显示验证码已发送，并显示60秒倒计时
2. **Given** 用户已收到验证码，**When** 输入正确的6位验证码并提交，**Then** 系统完成登录，跳转到首页，并保存登录凭证
3. **Given** 用户输入验证码，**When** 验证码错误，**Then** 系统显示"验证码错误"提示，用户可重新输入
4. **Given** 用户为新手机号，**When** 首次登录成功，**Then** 系统自动创建账号，显示"欢迎新用户"提示

---

### User Story 2 - 微信小程序一键登录 (Priority: P1)

用户在微信小程序环境中使用微信账号一键登录。系统获取微信授权后完成登录，无需额外输入。

**Why this priority**: 微信登录是小程序用户的主要入口，与短信登录同等重要，覆盖不同登录场景。

**Independent Test**: 可以在微信小程序环境中独立测试：用户点击微信登录按钮，授权后自动完成登录。

**Acceptance Scenarios**:

1. **Given** 用户在微信小程序登录页，**When** 点击微信登录按钮，**Then** 系统调用微信授权，获取 code 后完成登录
2. **Given** 用户首次微信登录且未绑定手机号，**When** 登录成功，**Then** 系统正常进入首页（手机号绑定为可选功能）
3. **Given** 用户已有微信绑定的账号，**When** 再次微信登录，**Then** 系统识别已有账号并直接登录

---

### User Story 3 - Token 刷新与会话保持 (Priority: P2)

系统自动管理用户登录凭证（Token），在凭证即将过期时自动刷新，保持用户会话不中断。

**Why this priority**: Token 刷新机制确保用户不会频繁掉线，是良好用户体验的基础，但优先级低于基础登录功能。

**Independent Test**: 可以通过模拟 token 过期场景测试：长时间使用后系统仍保持登录状态，无需重新登录。

**Acceptance Scenarios**:

1. **Given** 用户已登录且 access_token 即将过期，**When** 用户发起请求，**Then** 系统自动使用 refresh_token 获取新的 token 对
2. **Given** refresh_token 已过期，**When** 用户发起请求，**Then** 系统清除登录状态，引导用户重新登录
3. **Given** 用户主动退出登录，**When** 点击退出，**Then** 系统清除本地存储的所有凭证

---

### User Story 4 - 查看和编辑个人信息 (Priority: P2)

用户查看和编辑自己的个人资料，包括昵称、头像、性别、生日等信息。

**Why this priority**: 个人信息管理是用户中心的核心功能，依赖登录功能，但可独立于其他业务模块开发。

**Independent Test**: 可以独立测试：登录用户能够查看个人信息页面，修改昵称后刷新页面能看到更新后的信息。

**Acceptance Scenarios**:

1. **Given** 用户已登录，**When** 进入个人中心页面，**Then** 显示用户的头像、昵称、手机号（脱敏显示）、会员等级、积分等信息
2. **Given** 用户在编辑页面，**When** 修改昵称并保存，**Then** 系统更新昵称，返回成功提示
3. **Given** 用户修改头像，**When** 选择新图片并确认，**Then** 系统上传图片并更新头像显示

---

### User Story 5 - 查看钱包与交易记录 (Priority: P3)

用户查看钱包余额和历史交易记录，了解资金变动情况。

**Why this priority**: 钱包功能是用户资产管理的重要部分，但优先级低于基础认证和用户信息功能。

**Independent Test**: 可以独立测试：登录用户进入钱包页面能看到余额，切换到交易记录标签能看到历史记录列表。

**Acceptance Scenarios**:

1. **Given** 用户已登录，**When** 进入钱包页面，**Then** 显示当前余额、冻结余额、累计充值和累计消费金额
2. **Given** 用户在钱包页面，**When** 查看交易记录，**Then** 显示交易列表，包含类型、金额、时间等信息
3. **Given** 交易记录较多，**When** 滚动到页面底部，**Then** 自动加载更多记录（分页加载）

---

### User Story 6 - 全局登录守卫与路由保护 (Priority: P1)

系统提供全局登录守卫机制，自动保护需要登录才能访问的页面，未登录用户访问受保护页面时自动跳转到登录页。

**Why this priority**: 登录守卫是认证系统的基础设施，必须在 P1 阶段完成，否则所有需要登录的页面都无法正确保护。这与 Token 刷新机制同等重要，是用户认证体系的核心组件。

**Independent Test**: 可以独立测试：未登录用户访问个人中心时自动跳转登录页，登录成功后自动返回原页面。

**Acceptance Scenarios**:

1. **Given** 用户未登录，**When** 访问需要登录的页面（如个人中心、购物车、订单页），**Then** 系统自动跳转到登录页并保存原目标页面
2. **Given** 用户在登录页，**When** 登录成功，**Then** 系统自动跳转回原目标页面（如果有），否则跳转到首页
3. **Given** 用户已登录但 token 过期，**When** 访问受保护页面，**Then** 系统自动触发 token 刷新，刷新失败则跳转登录页
4. **Given** 用户已登录，**When** 访问公开页面（如首页、商品详情），**Then** 系统正常显示页面，不做登录检查

**需要登录保护的页面**:
- `/pages/user/index` - 个人中心
- `/pages/distribution/index` - 分销中心
- `/pages/mall/cart` - 购物车
- `/pages/mall/order-confirm` - 订单确认
- `/pages/mall/order-detail` - 订单详情
- `/pages/mall/coupons` - 优惠券
- `/pages/hotel/book-confirm` - 酒店预订确认
- `/pages/hotel/order-detail` - 酒店订单详情
- `/pages/hotel/unlock` - 开锁
- `/pages/scan/index` - 扫码

**公开访问的页面**:
- `/pages/index/index` - 首页
- `/pages/mall/index` - 商城首页
- `/pages/mall/search` - 商品搜索
- `/pages/mall/product-detail` - 商品详情
- `/pages/hotel/list` - 酒店列表
- `/pages/hotel/detail` - 酒店详情
- `/pages/user/login` - 登录页

---

### Edge Cases

- 网络异常时发送验证码或登录，系统显示"网络连接失败，请检查网络设置"
- 短信验证码发送频率限制（1分钟内1次，每天10次），超限时显示"发送过于频繁，请稍后再试"
- 用户在新设备登录后，旧设备的 token 自动失效，旧设备发起请求时返回 401，自动跳转登录页（单设备登录策略）
- 微信授权被用户拒绝，显示"需要微信授权才能登录"提示
- 编辑个人信息时昵称包含敏感词，系统提示"昵称包含违规内容"
- 钱包交易记录为空时，显示空状态提示"暂无交易记录"

## Requirements *(mandatory)*

### Functional Requirements

**认证模块**

- **FR-001**: 系统 MUST 支持通过手机号+短信验证码登录，验证码为6位数字，有效期5分钟
- **FR-002**: 系统 MUST 支持微信小程序一键登录，通过 wx.login 获取 code 换取用户身份
- **FR-003**: 系统 MUST 在新用户首次登录时自动创建账号（自动注册机制）
- **FR-004**: 系统 MUST 支持 Token 刷新机制，通过 `POST /auth/refresh` 使用 refresh_token 获取新的 access_token（刷新触发时机见 FR-005，并发处理见 FR-005a）
- **FR-005**: 系统 MUST 在每次请求前检查 access_token 有效期，剩余时间 <5 分钟时自动刷新（透明刷新，用户无感知）
- **FR-005a**: 系统 MUST 使用请求队列机制处理并发刷新：第一个请求触发刷新，其他请求等待刷新完成后使用新 token 重试
- **FR-006**: 系统 MUST 支持用户主动退出登录，清除本地存储的所有凭证
- **FR-007**: 系统 MUST 在收到 401 响应时自动重定向到登录页面
- **FR-007a**: 系统 MUST 在应用启动时仅检查本地 token 有效期，不主动刷新；延迟到首次受保护请求时按需刷新（懒加载策略）
- **FR-008**: 系统 MUST 支持短信发送频率限制，防止恶意请求

**路由保护模块**

- **FR-017**: 系统 MUST 提供全局路由守卫，在导航到受保护页面前检查登录状态
- **FR-018**: 系统 MUST 维护受保护页面列表配置，支持集中管理需要登录的页面路径
- **FR-019**: 系统 MUST 在用户未登录访问受保护页面时，保存目标页面路径并跳转到登录页
- **FR-020**: 系统 MUST 在用户登录成功后，自动跳转到之前保存的目标页面（如果有）
- **FR-021**: 系统 MUST 在 UniApp 的 `pages.json` 中通过 `needsAuth` 或类似标记配置页面权限

**用户模块**

- **FR-009**: 系统 MUST 支持获取当前登录用户的完整个人信息
- **FR-010**: 系统 MUST 支持更新用户昵称、头像、性别、生日等信息
- **FR-011**: 系统 MUST 支持获取用户钱包余额及统计信息
- **FR-012**: 系统 MUST 支持分页获取用户钱包交易记录
- **FR-013**: 系统 MUST 支持按交易类型筛选交易记录，支持的类型包括：`recharge`（充值）、`consume`（消费）、`refund`（退款）、`withdraw`（提现）、`commission`（佣金）、`bonus`（奖励）

**数据契约**

- **FR-014**: 所有请求 MUST 使用真实后端 API（localhost:8000/api/v1），不再使用 mock 数据
- **FR-015**: 所有受保护接口 MUST 在请求头中携带 `Authorization: Bearer <token>`
- **FR-016**: 所有响应 MUST 按照统一格式处理：`{ code: 0|200, message: string, data: T }`

### Key Entities

- **User（用户）**: 用户账号信息，包含 ID、手机号、昵称、头像、性别、生日、会员等级、积分、实名认证状态
- **TokenPair（令牌对）**: 认证凭证，包含 access_token（访问令牌）和 refresh_token（刷新令牌）及过期时间
- **Wallet（钱包）**: 用户资产信息，包含余额、冻结余额、累计充值、累计消费
- **Transaction（交易记录）**: 资金变动记录，包含类型、金额、变动前后余额、关联订单号、时间

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 用户从输入手机号到完成短信登录的整个流程在 30 秒内完成
- **SC-002**: 微信一键登录从点击按钮到进入首页在 5 秒内完成
- **SC-003**: Token 自动刷新对用户透明，不产生任何登录中断的感知
- **SC-004**: 个人信息页面加载完成时间不超过 2 秒
- **SC-005**: 钱包页面及交易记录首屏加载不超过 2 秒
- **SC-006**: 所有 API 调用失败时，100% 显示用户友好的中文错误提示
- **SC-007**: 从 mock 数据切换到真实 API 后，现有 UI 界面和交互保持不变

## Clarifications

### Session 2026-01-13

- Q: Token 自动刷新时机 → A: 每次请求前检查，剩余 <5 分钟时刷新
- Q: Token 刷新期间的并发请求处理 → A: 队列等待，第一个请求触发刷新，其他请求等待刷新完成后重试
- Q: 应用启动时已存储凭证的处理策略 → A: 仅检查本地 token 有效期，延迟到首次受保护请求时再刷新（懒加载刷新）
- Q: refresh_token 存储方式 → A: 持久化到本地存储（uni.setStorageSync），7天内免登录
- Q: 扫码页面是否需要登录保护 → A: 需要登录，扫码操作与用户账户绑定
- Q: 多设备登录策略 → A: 单设备登录，新登录自动使旧设备 token 失效
- Q: API 请求默认超时时间 → A: 10秒超时，平衡容错与用户体验

## Assumptions

- 后端 API 服务运行在 `localhost:8000`，API 文档可通过 `/swagger/index.html` 访问
- 短信验证码由后端统一发送，前端只需调用发送接口
- 微信小程序登录需要在小程序环境中运行，H5 环境暂不支持微信登录
- 用户头像上传功能将复用现有上传逻辑，但需更新上传地址
- access_token 有效期约 2 小时，refresh_token 有效期约 7 天（以后端配置为准）
- Token 凭证使用 `uni.setStorageSync` 持久化存储，实现 7 天内免登录体验
- API 请求默认超时时间为 10 秒，超时后显示网络错误提示

## 现有页面分析

### 页面清单 (19个页面)

| 页面路径 | 页面名称 | 需要登录 | 当前状态 |
|---------|---------|---------|---------|
| `/pages/index/index` | 首页 | ❌ | TabBar 页面，公开访问 |
| `/pages/mall/index` | 商城 | ❌ | TabBar 页面，公开访问 |
| `/pages/distribution/index` | 分销 | ✅ | TabBar 页面，显示用户分销收益，使用 mock 数据 |
| `/pages/user/index` | 个人中心 | ✅ | TabBar 页面，显示用户信息，使用 mock 数据 |
| `/pages/user/login` | 登录 | ❌ | 已实现 SMS + 微信登录 UI，调用 mock API |
| `/pages/mall/cart` | 购物车 | ✅ | 使用 cartStore，需要登录保护 |
| `/pages/mall/order-confirm` | 订单确认 | ✅ | 使用 cartStore + API，需要登录保护 |
| `/pages/mall/order-detail` | 订单详情 | ✅ | 需要登录保护 |
| `/pages/mall/coupons` | 优惠券 | ✅ | 需要登录保护 |
| `/pages/mall/product-detail` | 商品详情 | ❌ | 公开访问 |
| `/pages/mall/search` | 商品搜索 | ❌ | 公开访问 |
| `/pages/mall/review` | 商品评价 | ❌ | 公开访问（仅浏览） |
| `/pages/hotel/list` | 酒店列表 | ❌ | 公开访问 |
| `/pages/hotel/detail` | 酒店详情 | ❌ | 公开访问 |
| `/pages/hotel/room-detail` | 房型详情 | ❌ | 公开访问 |
| `/pages/hotel/book-confirm` | 预订确认 | ✅ | 需要登录保护 |
| `/pages/hotel/order-detail` | 订单详情 | ✅ | 需要登录保护 |
| `/pages/hotel/unlock` | 开锁 | ✅ | 需要登录验证 |
| `/pages/scan/index` | 扫码 | ✅ | 需要登录，扫码操作与用户账户绑定 |

### 当前代码现状

**登录页 (`src/pages/user/login.vue`)**:
- ✅ 已实现短信验证码登录 UI
- ✅ 已实现微信登录按钮（条件编译 `#ifdef MP-WEIXIN`）
- ❌ 当前调用 mock API，需要切换到真实 API
- ❌ 缺少登录成功后跳转回原页面的逻辑

**个人中心页 (`src/pages/user/index.vue`)**:
- ✅ 已实现完整 UI，包含多个模态框组件
- ❌ 使用硬编码 mock 数据（`userInfo` reactive 对象）
- ❌ 需要从 userStore 获取真实数据
- ❌ 需要调用 `userApi.getProfile()` 获取最新信息

**用户 Store (`src/stores/user.js`)**:
- ✅ 已有 `token`、`userInfo`、`memberInfo` 状态
- ✅ 已有 `isLogin` 计算属性
- ❌ 缺少 `accessToken`、`refreshToken`、`tokenExpireTime` 字段
- ❌ `login` 方法响应格式需要适配新 API

**分销页 (`src/pages/distribution/index.vue`)**:
- ✅ 已实现完整 UI
- ❌ 使用硬编码 mock 数据
- ❌ 需要添加登录检查和真实 API 调用
