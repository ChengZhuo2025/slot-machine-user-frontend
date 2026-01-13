# 数据模型：P1 认证与用户模块

**创建日期**: 2026-01-13
**功能**: P1 认证与用户 API 集成

## 实体概览

```
┌─────────────────┐     ┌─────────────────┐
│     User        │────>│  MemberLevel    │
│    （用户）      │     │   （会员等级）   │
│                 │     │                 │
│ - id            │     │ - id            │
│ - phone         │     │ - name          │
│ - nickname      │     │ - level         │
│ - avatar        │     │ - discount      │
│ - gender        │     └─────────────────┘
│ - birthday      │
│ - member_level_id│
│ - points        │
│ - is_verified   │
└─────────────────┘
        │
        ▼
┌─────────────────┐     ┌─────────────────┐
│    Wallet       │────>│  Transaction    │
│   （钱包）       │     │   （交易记录）   │
│                 │     │                 │
│ - balance       │     │ - id            │
│ - frozen_balance│     │ - type          │
│ - total_recharged│    │ - amount        │
│ - total_consumed │    │ - balance_before│
└─────────────────┘     │ - balance_after │
                        │ - order_no      │
                        │ - created_at    │
                        └─────────────────┘
```

## 实体定义

### User（用户）

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| id | number | ✅ | 用户唯一标识 |
| phone | string \| null | ❌ | 手机号（可能为空，微信登录用户） |
| nickname | string | ✅ | 用户昵称 |
| avatar | string \| null | ❌ | 头像 URL |
| gender | number | ✅ | 性别 (0-未知, 1-男, 2-女) |
| birthday | string \| null | ❌ | 生日 (ISO 8601 格式) |
| member_level_id | number | ✅ | 会员等级 ID |
| member_level | MemberLevel \| null | ❌ | 会员等级详情（嵌套对象） |
| points | number | ✅ | 积分余额 |
| is_verified | boolean | ✅ | 是否已实名认证 |
| created_at | string | ✅ | 注册时间 (ISO 8601) |

**验证规则**:
- phone: 11位中国大陆手机号，格式 `^1[3-9]\d{9}$`
- nickname: 1-20个字符，不含敏感词
- gender: 枚举值 0, 1, 2
- birthday: 有效日期，不能晚于当前日期

### TokenPair（令牌对）

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| access_token | string | ✅ | 访问令牌 (JWT) |
| refresh_token | string | ✅ | 刷新令牌 |
| expires_at | number | ✅ | access_token 过期时间（Unix 时间戳，秒） |

**生命周期**:
- access_token: 约 2 小时有效
- refresh_token: 约 7 天有效
- 刷新时机: access_token 剩余时间 <5 分钟时

**前端转换**:
- 后端返回 `expires_at` (Unix 时间戳)
- 前端可通过 `expires_at * 1000` 转换为 JavaScript 时间戳

### MemberLevel（会员等级）

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| id | number | ✅ | 等级 ID |
| name | string | ✅ | 等级名称 (如 "银卡会员") |
| level | number | ✅ | 等级序号 (1-5) |
| discount | number | ✅ | 折扣率 (如 0.95 表示95折) |
| icon | string \| null | ❌ | 等级图标 URL |

### Wallet（钱包）

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| balance | number | ✅ | 可用余额 |
| frozen_balance | number | ✅ | 冻结余额 |
| total_recharged | number | ✅ | 累计充值金额 |
| total_consumed | number | ✅ | 累计消费金额 |

**验证规则**:
- balance: >= 0
- 所有金额字段保留 2 位小数

### Transaction（交易记录）

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| id | number | ✅ | 记录 ID |
| type | string | ✅ | 交易类型 (见下方枚举) |
| type_name | string | ✅ | 交易类型中文名 |
| amount | number | ✅ | 交易金额 (正数表示收入，负数表示支出) |
| balance_before | number | ✅ | 交易前余额 |
| balance_after | number | ✅ | 交易后余额 |
| order_no | string \| null | ❌ | 关联订单号 |
| remark | string \| null | ❌ | 备注 |
| created_at | string | ✅ | 交易时间 (ISO 8601) |

**交易类型枚举**:
| type | type_name | 描述 |
|------|-----------|------|
| recharge | 充值 | 用户充值 |
| consume | 消费 | 订单支付 |
| refund | 退款 | 订单退款 |
| withdraw | 提现 | 余额提现 |
| deposit | 押金冻结 | 押金冻结 |
| return_deposit | 押金退还 | 押金退还 |

## 请求/响应数据结构

### LoginResponse（登录响应）

```typescript
interface LoginResponse {
  user: User
  token: TokenPair
  is_new_user: boolean
}
```

### UserProfile（用户详情）

```typescript
interface UserProfile extends User {
  member_level?: MemberLevel  // 包含会员等级详情
}
```

### PagedResponse<T>（分页响应）

```typescript
interface PagedResponse<T> {
  list: T[]
  total: number
  page: number
  page_size: number
}
```

## 状态转换

### 用户认证状态

```
┌──────────┐  登录成功   ┌───────────┐  Token过期   ┌──────────┐
│ 未登录   │ ─────────> │  已登录    │ ──────────> │ 需刷新   │
└──────────┘            └───────────┘              └──────────┘
     ▲                       │                          │
     │                       │ 退出登录                  │ 刷新成功
     │                       ▼                          ▼
     │                  ┌───────────┐              ┌───────────┐
     └────────────────  │  已登出   │  <────────── │  已刷新   │
       刷新失败          └───────────┘              └───────────┘
```

### Token 生命周期

```
登录/注册
      │
      ▼
┌─────────────────┐
│ access_token    │ ─── <5分钟 ──> 触发刷新
│ (有效期约2小时)  │
└─────────────────┘
      │
      │ 过期
      ▼
┌─────────────────┐
│ refresh_token   │ ─── POST /auth/refresh ──> 新 TokenPair
│ (有效期约7天)    │
└─────────────────┘
      │
      │ 过期
      ▼
┌─────────────────┐
│ 需重新登录       │
└─────────────────┘
```

## 前端存储模式

### Pinia 用户状态

```typescript
interface UserState {
  // Token 管理
  accessToken: string
  refreshToken: string
  tokenExpireTime: number  // 时间戳

  // 用户信息
  userInfo: User
  memberLevel: MemberLevel | null

  // 钱包信息（延迟加载）
  wallet: Wallet | null
}
```

### 本地存储键值

| 键名 | 类型 | 描述 |
|------|------|------|
| user | JSON | Pinia 持久化的用户状态 |

## API 响应到 Store 的映射

| API 响应字段 | Store 字段 | 转换方式 |
|-------------|------------|----------|
| token.access_token | accessToken | 直接映射 |
| token.refresh_token | refreshToken | 直接映射 |
| token.expires_at | tokenExpireTime | `expires_at * 1000` (转为 JavaScript 毫秒时间戳) |
| user | userInfo | 直接映射 |
| user.member_level | memberLevel | 提取嵌套对象 |
