# 用户 API 契约

**基础 URL**: `http://localhost:8000/api/v1`
**请求格式**: `application/json`
**认证方式**: 需要 (Bearer Token)

## 接口列表

### GET /user/profile

获取用户详细信息

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
    "avatar": "https://example.com/avatar.jpg",
    "gender": 1,
    "birthday": "1990-01-01T00:00:00Z",
    "member_level_id": 2,
    "member_level": {
      "id": 2,
      "name": "银卡会员",
      "level": 2,
      "discount": 0.95,
      "icon": "https://example.com/silver.png"
    },
    "points": 1500,
    "is_verified": true,
    "created_at": "2024-01-01T10:00:00Z"
  }
}
```

---

### PUT /user/profile

更新用户信息

**请求头**:
```
Authorization: Bearer <access_token>
```

**请求体**:
```json
{
  "nickname": "新昵称",
  "avatar": "https://example.com/new-avatar.jpg",
  "gender": 2,
  "birthday": "1995-06-15T00:00:00Z"
}
```

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| nickname | string | ❌ | 用户昵称 (1-20字符) |
| avatar | string | ❌ | 头像 URL |
| gender | number | ❌ | 性别 (0-未知, 1-男, 2-女) |
| birthday | string | ❌ | 生日 (ISO 8601 格式) |

**响应** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

**错误响应**:
- 400: 昵称包含敏感词 / 参数格式错误

---

### GET /user/wallet

获取钱包信息

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
    "balance": 299.80,
    "frozen_balance": 50.00,
    "total_recharged": 1000.00,
    "total_consumed": 650.20
  }
}
```

---

### GET /user/wallet/transactions

获取交易记录（分页）

**请求头**:
```
Authorization: Bearer <access_token>
```

**查询参数**:

| 参数 | 类型 | 必填 | 默认值 | 描述 |
|------|------|------|--------|------|
| page | number | ❌ | 1 | 页码 (从1开始) |
| page_size | number | ❌ | 10 | 每页数量 |
| type | string | ❌ | - | 交易类型筛选 (recharge, consume, refund 等) |

**示例**:
```
GET /user/wallet/transactions?page=1&page_size=20&type=consume
```

**响应** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 101,
        "type": "consume",
        "type_name": "消费",
        "amount": -99.00,
        "balance_before": 398.80,
        "balance_after": 299.80,
        "order_no": "LD202401130001",
        "remark": "酒店预订",
        "created_at": "2024-01-13T14:30:00Z"
      },
      {
        "id": 100,
        "type": "recharge",
        "type_name": "充值",
        "amount": 200.00,
        "balance_before": 198.80,
        "balance_after": 398.80,
        "order_no": null,
        "remark": null,
        "created_at": "2024-01-12T10:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "page_size": 20
  }
}
```

---

### GET /user/member-levels

获取会员等级列表（公开接口，无需认证）

**响应** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "普通会员",
      "level": 1,
      "discount": 1.00,
      "icon": null
    },
    {
      "id": 2,
      "name": "银卡会员",
      "level": 2,
      "discount": 0.95,
      "icon": "https://example.com/silver.png"
    },
    {
      "id": 3,
      "name": "金卡会员",
      "level": 3,
      "discount": 0.90,
      "icon": "https://example.com/gold.png"
    }
  ]
}
```

---

### POST /user/real-name-verify

实名认证

**请求头**:
```
Authorization: Bearer <access_token>
```

**请求体**:
```json
{
  "real_name": "张三",
  "id_card": "110101199001011234"
}
```

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| real_name | string | ✅ | 真实姓名 |
| id_card | string | ✅ | 身份证号 (18位) |

**响应** (200):
```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

**错误响应**:
- 400: 身份证号格式错误
- 409: 已实名认证

---

### GET /user/points

获取用户积分

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
    "points": 1500
  }
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

## 交易类型参考

| type | type_name | 描述 |
|------|-----------|------|
| recharge | 充值 | 用户充值到账 |
| consume | 消费 | 订单支付扣款 |
| refund | 退款 | 订单退款到账 |
| withdraw | 提现 | 用户提现 |
| deposit | 押金冻结 | 押金冻结 |
| return_deposit | 押金退还 | 押金退还 |
