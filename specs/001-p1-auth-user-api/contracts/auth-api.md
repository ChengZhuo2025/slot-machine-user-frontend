# 认证 API 契约

**基础 URL**: `http://localhost:8000/api/v1`
**请求格式**: `application/json`

## 接口列表

### POST /auth/sms/send

发送短信验证码

**请求体**:
```json
{
  "phone": "13800138000",
  "code_type": "login"
}
```

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| phone | string | ✅ | 11位手机号 |
| code_type | string | ✅ | 验证码类型: "login" |

**响应** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "expire_in": 300
  }
}
```

**错误响应**:
- 400: 手机号格式错误
- 429: 发送过于频繁

---

### POST /auth/login/sms

短信验证码登录（自动注册）

**请求体**:
```json
{
  "phone": "13800138000",
  "code": "123456",
  "invite_code": "ABC123"
}
```

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| phone | string | ✅ | 11位手机号 |
| code | string | ✅ | 6位验证码 |
| invite_code | string | ❌ | 邀请码（可选） |

**响应** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "user": {
      "id": 1,
      "phone": "13800138000",
      "nickname": "用户138****8000",
      "avatar": null,
      "gender": 0,
      "member_level_id": 1,
      "points": 0,
      "is_verified": false
    },
    "token": {
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2g...",
      "expires_at": 1704067200
    },
    "is_new_user": true
  }
}
```

**错误响应**:
- 400: 验证码错误或已过期

---

### POST /auth/login/wechat

微信小程序登录

**请求体**:
```json
{
  "code": "0a1B2c3D4e5F6g",
  "nickname": "微信用户",
  "avatar": "https://example.com/avatar.jpg",
  "gender": 1,
  "invite_code": "ABC123"
}
```

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| code | string | ✅ | 微信 wx.login 返回的 code |
| nickname | string | ❌ | 微信昵称（可选） |
| avatar | string | ❌ | 微信头像 URL（可选） |
| gender | number | ❌ | 性别 (0-未知, 1-男, 2-女)（可选） |
| invite_code | string | ❌ | 邀请码（可选） |

**响应** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "user": {
      "id": 2,
      "phone": null,
      "nickname": "微信用户",
      "avatar": "https://...",
      "gender": 1,
      "member_level_id": 1,
      "points": 0,
      "is_verified": false
    },
    "token": {
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2g...",
      "expires_at": 1704067200
    },
    "is_new_user": true
  }
}
```

**错误响应**:
- 400: 微信授权失败

---

### POST /auth/refresh

刷新 Token

**请求体**:
```json
{
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2g..."
}
```

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| refresh_token | string | ✅ | 刷新令牌 |

**响应** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "bmV3IHJlZnJlc2ggdG9rZW4...",
    "expires_at": 1704074400
  }
}
```

**错误响应**:
- 401: refresh_token 无效或已过期

---

### GET /auth/me

获取当前用户信息（需认证）

**请求头**:
```
Authorization: Bearer <access_token>
```

**响应** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "phone": "13800138000",
    "nickname": "用户昵称",
    "avatar": "https://...",
    "gender": 1,
    "member_level_id": 2,
    "points": 1500,
    "is_verified": true
  }
}
```

**错误响应**:
- 401: 未授权

---

### POST /auth/bind-phone

绑定手机号（需认证）

**请求头**:
```
Authorization: Bearer <access_token>
```

**请求体**:
```json
{
  "phone": "13800138000",
  "code": "123456"
}
```

**响应** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

**错误响应**:
- 400: 验证码错误
- 409: 手机号已被绑定

---

### POST /auth/logout

退出登录（需认证）

**请求头**:
```
Authorization: Bearer <access_token>
```

**响应** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

## 通用错误响应格式

```json
{
  "code": 400,
  "message": "具体错误信息",
  "data": null
}
```

## 频率限制

| 接口 | 限制 |
|------|------|
| POST /auth/sms/send | 1次/分钟/IP, 10次/天/手机号 |
| POST /auth/login/* | 10次/分钟/IP |
