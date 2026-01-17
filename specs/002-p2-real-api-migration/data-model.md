# Data Model: P2阶段API数据模型

**Feature**: P2阶段API真实接口迁移
**Date**: 2026-01-17
**Status**: Complete
**Backend Verified**: 2026-01-17

## 概述

本文档定义P2阶段所有数据实体的结构、验证规则和状态转换。所有模型基于后端API响应格式设计，已通过后端代码验证。

## 核心实体

### 1. Banner (轮播广告)

**用途**: 首页/商城/酒店轮播图展示
**API路径**: `/api/v1/banners?position={home|mall|hotel}&limit={n}`

**字段定义**:

| 字段 | 类型 | 必填 | 说明 | 验证规则 |
|------|------|------|------|----------|
| id | number | ✓ | Banner ID | > 0 |
| title | string | ✗ | 标题 | 长度≤100字符 |
| image | string | ✓ | 图片URL | 有效URL格式 |
| link_type | string | ✗ | 链接类型 | page/url/product等 |
| link_value | string | ✗ | 链接值 | 根据link_type解析 |
| position | string | ✓ | 广告位置 | 'home' \| 'mall' \| 'hotel' |

**数据示例**:
```json
{
  "id": 1,
  "title": "限时特惠",
  "image": "https://cdn.example.com/banner01.jpg",
  "link_type": "page",
  "link_value": "/pages/mall/category?id=hot",
  "position": "home"
}
```

**状态转换**: 无（只读数据）

---

### 2. Hotel (酒店)

**用途**: 酒店列表和详情展示
**API路径**: `/api/v1/hotels`, `/api/v1/hotels/recommended`

**字段定义**:

| 字段 | 类型 | 必填 | 说明 | 验证规则 |
|------|------|------|------|----------|
| id | number | ✓ | 酒店ID | > 0 |
| name | string | ✓ | 酒店名称 | 长度1-100字符 |
| star_rating | number | ✗ | 星级 | 1-5或null |
| province | string | ✓ | 省份 | 长度≤20字符 |
| city | string | ✓ | 城市 | 长度≤20字符 |
| district | string | ✓ | 区域 | 长度≤20字符 |
| address | string | ✓ | 详细地址 | 长度≤200字符 |
| full_address | string | ✓ | 完整地址 | 省+市+区+地址 |
| images | array | ✓ | 图片URL数组 | 字符串数组 |
| facilities | array | ✗ | 设施列表 | 字符串数组 |
| description | string | ✗ | 酒店描述 | 文本 |
| check_in_time | string | ✗ | 入住时间 | 时间格式 |
| check_out_time | string | ✗ | 退房时间 | 时间格式 |
| longitude | number | ✗ | 经度 | -180到180 |
| latitude | number | ✗ | 纬度 | -90到90 |
| distance | number | ✗ | 距离(公里) | ≥0 |
| min_price | number | ✓ | 最低价格 | ≥0 |
| room_count | number | ✗ | 房间数量 | ≥0 |
| recommend_score | number | ✗ | 推荐分数 | 0-100 |

**数据示例**:
```json
{
  "id": 101,
  "name": "希尔顿酒店",
  "star_rating": 5,
  "province": "北京",
  "city": "北京",
  "district": "朝阳区",
  "address": "建国路1号",
  "full_address": "北京北京朝阳区建国路1号",
  "images": [
    "https://cdn.example.com/hotel-facade.jpg",
    "https://cdn.example.com/hotel-lobby.jpg"
  ],
  "facilities": ["WiFi", "停车场", "游泳池"],
  "description": "五星级豪华酒店",
  "check_in_time": "14:00",
  "check_out_time": "12:00",
  "longitude": 116.4074,
  "latitude": 39.9042,
  "min_price": 599.00,
  "room_count": 120,
  "recommend_score": 92
}
```

---

### 3. Room (房型)

**用途**: 房型列表和详情展示
**API路径**: `/api/v1/hotels/{id}/rooms`, `/api/v1/rooms/hot`

**字段定义**:

| 字段 | 类型 | 必填 | 说明 | 验证规则 |
|------|------|------|------|----------|
| id | number | ✓ | 房型ID | > 0 |
| room_no | string | ✓ | 房间号 | 长度≤20字符 |
| room_type | string | ✓ | 房型名称 | 长度≤50字符 |
| hotel_id | number | ✓ | 所属酒店ID | > 0 |
| hotel_name | string | ✗ | 酒店名称 | 仅热门房型返回 |
| images | array | ✓ | 房型图片 | URL数组 |
| facilities | array | ✗ | 设施列表 | 字符串数组 |
| area | number | ✗ | 面积(平米) | > 0 |
| bed_type | string | ✗ | 床型 | 文本 |
| max_guests | number | ✓ | 最大入住人数 | ≥1 |
| hourly_price | number | ✓ | 时租价格 | ≥0 |
| daily_price | number | ✓ | 日租价格 | ≥0 |
| status | number | ✓ | 状态 | 0=停用,1=可用,2=已预订,3=使用中 |
| status_name | string | ✗ | 状态名称 | 可读文本 |
| booking_count | number | ✗ | 预订次数 | ≥0 |
| average_rating | number | ✗ | 平均评分 | 0-5 |
| review_count | number | ✗ | 评价数量 | ≥0 |
| hot_score | number | ✗ | 热度分数 | ≥0 |

**数据示例**:
```json
{
  "id": 1001,
  "room_no": "2001",
  "room_type": "豪华大床房",
  "hotel_id": 101,
  "hotel_name": "希尔顿酒店",
  "images": [
    "https://cdn.example.com/room01.jpg"
  ],
  "facilities": ["空调", "WiFi", "电视"],
  "area": 35,
  "bed_type": "大床",
  "max_guests": 2,
  "hourly_price": 99.00,
  "daily_price": 599.00,
  "status": 1,
  "status_name": "可用",
  "booking_count": 1520,
  "average_rating": 4.8,
  "review_count": 320,
  "hot_score": 95.5
}
```

---

### 4. ProductCategory (商品分类)

**用途**: 商城分类导航
**API路径**: `/api/v1/categories`

**字段定义**:

| 字段 | 类型 | 必填 | 说明 | 验证规则 |
|------|------|------|------|----------|
| id | number | ✓ | 分类ID | > 0 |
| name | string | ✓ | 分类名称 | 长度1-50字符 |
| icon | string | ✗ | 图标标识 | 字符串 |
| level | number | ✓ | 分类层级 | ≥1 |
| parent_id | number | ✗ | 父分类ID | > 0或null |
| children | array | ✗ | 子分类列表 | 递归结构 |

**数据示例**:
```json
{
  "id": 1,
  "name": "酒店用品",
  "icon": "towels",
  "level": 1,
  "parent_id": null,
  "children": [
    {
      "id": 11,
      "name": "毛巾浴巾",
      "level": 2,
      "parent_id": 1
    }
  ]
}
```

---

### 5. Product (商品)

**用途**: 商品列表和详情展示
**API路径**: `/api/v1/products`, `/api/v1/products/{id}`

**字段定义**:

| 字段 | 类型 | 必填 | 说明 | 验证规则 |
|------|------|------|------|----------|
| id | number | ✓ | 商品ID | > 0 |
| category_id | number | ✓ | 分类ID | > 0 |
| category_name | string | ✗ | 分类名称 | 详情返回 |
| name | string | ✓ | 商品名称 | 长度1-100字符 |
| subtitle | string | ✗ | 副标题 | 文本 |
| images | array | ✓ | 商品图片 | URL数组，至少1张 |
| description | string | ✗ | 商品描述 | 文本 |
| price | number | ✓ | 现价 | ≥0 |
| original_price | number | ✗ | 原价(划线价) | ≥0 |
| stock | number | ✓ | 库存 | ≥0 |
| sales | number | ✓ | 销量 | ≥0 |
| unit | string | ✓ | 单位 | 如"件"、"套" |
| is_on_sale | boolean | ✓ | 是否在售 | true/false |
| is_new | boolean | ✗ | 是否新品 | true/false |
| is_hot | boolean | ✗ | 是否热销 | true/false |
| skus | array | ✗ | SKU列表 | 详情返回 |

**SKU对象**:
```json
{
  "id": 10001,
  "sku_code": "PROD-001-WHITE-L",
  "attributes": {
    "颜色": "白色",
    "尺寸": "L"
  },
  "price": 89.90,
  "stock": 50,
  "image": "https://cdn.example.com/sku-white.jpg"
}
```

**数据示例**:
```json
{
  "id": 2001,
  "category_id": 1,
  "category_name": "酒店用品",
  "name": "五星级酒店毛巾套装",
  "subtitle": "精选长绒棉，柔软亲肤",
  "images": ["https://cdn.example.com/product01.jpg"],
  "description": "高品质毛巾套装...",
  "price": 69.90,
  "original_price": 89.90,
  "stock": 100,
  "sales": 1200,
  "unit": "套",
  "is_on_sale": true,
  "is_new": false,
  "is_hot": true,
  "skus": [...]
}
```

---

### 6. Coupon (优惠券)

**用途**: 优惠券列表和领取
**API路径**: `/api/v1/marketing/coupons`, `/api/v1/marketing/user-coupons`

**字段定义**:

| 字段 | 类型 | 必填 | 说明 | 验证规则 |
|------|------|------|------|----------|
| id | number | ✓ | 优惠券ID | > 0 |
| name | string | ✓ | 优惠券名称 | 长度1-100字符 |
| type | string | ✓ | 类型 | 'fixed' \| 'percent' |
| value | number | ✓ | 面额/折扣值 | > 0 |
| min_amount | number | ✓ | 使用门槛 | ≥0 |
| max_discount | number | ✗ | 最大优惠额 | ≥0，仅percent类型 |
| applicable_scope | string | ✗ | 适用范围 | all/category/product/rental/mall/hotel |
| start_time | string | ✓ | 开始时间 | ISO 8601格式 |
| end_time | string | ✓ | 结束时间 | ISO 8601格式 |
| total_count | number | ✓ | 总发行量 | > 0 |
| received_count | number | ✓ | 已领取数量 | ≥0 |
| remain_count | number | ✓ | 剩余数量 | ≥0 |
| per_user_limit | number | ✓ | 每人限领 | ≥1 |
| description | string | ✗ | 描述 | 文本 |
| status | number | ✓ | 状态 | 0=下架,1=上架 |
| can_receive | boolean | ✓ | 是否可领取 | true/false |
| received_by_user | number | ✓ | 用户已领取数 | ≥0 |

**数据示例**:
```json
{
  "id": 3001,
  "name": "满100减20优惠券",
  "type": "fixed",
  "value": 20.00,
  "min_amount": 100.00,
  "max_discount": null,
  "applicable_scope": "all",
  "start_time": "2026-01-17T00:00:00Z",
  "end_time": "2026-02-17T23:59:59Z",
  "total_count": 1000,
  "received_count": 523,
  "remain_count": 477,
  "per_user_limit": 1,
  "description": "全场通用优惠券",
  "status": 1,
  "can_receive": true,
  "received_by_user": 0
}
```

---

### 7. UserCoupon (用户优惠券)

**用途**: 用户已领取的优惠券
**API路径**: `/api/v1/marketing/user-coupons`

**字段定义**:

| 字段 | 类型 | 必填 | 说明 | 验证规则 |
|------|------|------|------|----------|
| id | number | ✓ | 用户优惠券ID | > 0 |
| user_id | number | ✓ | 用户ID | > 0 |
| coupon_id | number | ✓ | 优惠券ID | > 0 |
| coupon | object | ✗ | 优惠券详情 | Coupon对象 |
| order_id | number | ✗ | 使用的订单ID | > 0或null |
| status | number | ✓ | 状态 | 0=未使用,1=已使用,2=已过期 |
| expired_at | string | ✓ | 过期时间 | ISO 8601格式 |
| used_at | string | ✗ | 使用时间 | ISO 8601格式 |
| received_at | string | ✓ | 领取时间 | ISO 8601格式 |

---

## 列表响应格式

所有列表接口统一返回格式（注意：后端使用 `list` 而非 `items`）：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [...],      // 数据数组
    "total": 100,       // 总记录数
    "page": 1,          // 当前页码
    "page_size": 10,    // 每页数量
    "total_pages": 10   // 总页数(部分接口)
  }
}
```

## 缓存数据结构

**Store缓存结构** (以商品列表为例):

```javascript
{
  // 数据缓存
  products: [],
  categories: [],

  // 缓存元数据
  productsCache: {
    timestamp: 1705459200000, // 缓存时间戳
    maxAge: 600000,           // 有效期(10分钟)
    isValid: true             // 是否有效
  },

  // 加载状态
  loading: false,
  error: null,

  // 分页信息
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  }
}
```

## 验证规则总结

| 实体 | 必填字段数 | 可选字段数 | 关键验证 |
|------|-----------|-----------|----------|
| Banner | 3 | 3 | position必需 |
| Hotel | 8 | 8 | 图片为数组格式 |
| Room | 8 | 8 | 状态码验证 |
| ProductCategory | 3 | 2 | 层级结构验证 |
| Product | 9 | 5 | SKU属性验证 |
| Coupon | 11 | 4 | 类型和范围验证 |
| UserCoupon | 6 | 3 | 状态码验证 |

## 数据关系图

```
Banner (独立实体)

Hotel --1:N--> Room
       (一个酒店有多个房型)

ProductCategory --1:N--> Product
                (一个分类有多个商品)

Product --1:N--> ProductSku
         (一个商品有多个SKU)

Coupon --1:N--> UserCoupon
        (一个优惠券可被多个用户领取)
```

## API端点汇总

| 模块 | 端点 | 方法 | 说明 |
|------|------|------|------|
| Banner | /api/v1/banners | GET | 获取轮播图 |
| Hotel | /api/v1/hotels | GET | 酒店列表 |
| Hotel | /api/v1/hotels/recommended | GET | 推荐酒店 |
| Hotel | /api/v1/hotels/{id} | GET | 酒店详情 |
| Hotel | /api/v1/hotels/{id}/rooms | GET | 酒店房型 |
| Room | /api/v1/rooms/hot | GET | 热门房型 |
| Room | /api/v1/rooms/{id} | GET | 房型详情 |
| Category | /api/v1/categories | GET | 分类列表 |
| Product | /api/v1/products | GET | 商品列表 |
| Product | /api/v1/products/{id} | GET | 商品详情 |
| Product | /api/v1/products/search | GET | 搜索商品 |
| Coupon | /api/v1/marketing/coupons | GET | 可领取优惠券 |
| Coupon | /api/v1/marketing/coupons/{id}/receive | POST | 领取优惠券 |
| UserCoupon | /api/v1/marketing/user-coupons | GET | 我的优惠券 |
| UserCoupon | /api/v1/marketing/user-coupons/available | GET | 可用优惠券 |
| UserCoupon | /api/v1/marketing/user-coupons/count | GET | 优惠券数量统计 |

## 后端验证说明

本文档已通过以下后端源码验证：
- `backend/internal/models/*.go` - 数据模型定义
- `backend/internal/handler/**/*.go` - API处理器
- `backend/internal/service/**/*.go` - 业务服务层
- `backend/cmd/api-gateway/router.go` - 路由配置

**验证日期**: 2026-01-17
