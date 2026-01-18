# Implementation Plan: P2阶段API真实接口迁移

**Branch**: `002-p2-real-api-migration` | **Date**: 2026-01-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-p2-real-api-migration/spec.md`

## Summary

将用户端前端应用从mock数据迁移到真实后端API，包括首页轮播广告、酒店/房型列表、商品分类/列表、优惠券等核心业务模块的API对接。实现智能缓存策略、请求竞态处理、图片懒加载、搜索防抖和降级容错机制，确保用户体验流畅且数据实时更新。

## Technical Context

**Language/Version**: JavaScript (ES2020+) / Vue 3.4.21
**Primary Dependencies**: UniApp 3.0, Pinia 2.1.7, pinia-plugin-persistedstate
**Storage**: 本地存储(UniApp Storage API)用于缓存和持久化状态
**Testing**: 手动测试 + UniApp开发者工具
**Target Platform**: H5、微信小程序、Android/iOS App (UniApp跨平台)
**Project Type**: Mobile (UniApp单项目结构)
**Performance Goals**: 首页2秒内加载完成，分页1秒内响应，搜索防抖400ms
**Constraints**: 短期内存缓存10分钟，图片懒加载+渐进式加载，API错误率<1%
**Scale/Scope**: 首页6个数据模块，商城约20个商品分类，酒店/商品列表支持分页

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. API-First Integration

- **Status**: PASS
- **Compliance**: 本功能将替换所有mock数据为真实API调用
- **Details**:
  - 首页Banner、推荐酒店、热门房型、精选商品均从`/api/v1/banners`、`/api/v1/hotels`、`/api/v1/products`等端点获取
  - 商城商品列表、分类从`/api/v1/products/*`获取
  - 优惠券从`/api/v1/marketing/coupons`获取
  - 所有请求将携带`Authorization: Bearer <token>`

### ✅ II. Type Safety & Contract Compliance

- **Status**: PASS
- **Compliance**: 严格遵循后端响应格式`{ code: 0|200, message: string, data: T }`
- **Details**:
  - 复用P1阶段已实现的`request.js`响应拦截器
  - 所有请求将通过统一的request封装处理响应
  - 数据转换层将后端数据映射为前端UI需要的格式

### ✅ III. Error Handling & User Experience

- **Status**: PASS
- **Compliance**: 实现完整的错误处理和用户反馈机制
- **Details**:
  - 加载状态：骨架屏或加载动画
  - 网络错误：中文友好提示 + 重试按钮
  - 401响应：自动跳转登录（P1已实现）
  - 429限流：提示用户稍后重试
  - 空状态：展示引导页面

### ✅ IV. Environment-Aware Configuration

- **Status**: PASS
- **Compliance**: 使用可配置的API base URL
- **Details**:
  - `src/services/request.js`已配置base URL为`http://localhost:8000/api/v1`
  - 支持通过环境变量切换开发/生产环境

### ✅ V. Incremental Migration

- **Status**: PASS
- **Compliance**: 按优先级逐模块迁移
- **Details**:
  - P1优先级：首页数据、商城商品、酒店列表（核心业务）
  - P2优先级：房型详情、优惠券（次要业务）
  - P3优先级：加载状态管理（体验优化）
  - 每个模块独立测试验证后再进行下一个

### 宪章对照表

| 原则 | 要求 | 本功能符合性 |
|------|------|------------|
| API-First Integration | 所有功能必须调用真实API | ✅ 所有mock数据将替换为API调用 |
| Type Safety & Contract Compliance | 请求/响应必须符合后端契约 | ✅ 复用request.js统一处理 |
| Error Handling & User Experience | 优雅处理API失败 | ✅ 实现加载/错误/空状态 |
| Environment-Aware Configuration | 支持多环境配置 | ✅ base URL可配置 |
| Incremental Migration | 模块化迁移并独立验证 | ✅ 按P1/P2/P3优先级迁移 |

**结论**: 所有宪章原则均符合，无违规项。

## Project Structure

### Documentation (this feature)

```text
specs/002-p2-real-api-migration/
├── spec.md              # 功能规格说明（已完成）
├── plan.md              # 本文件 - 实施计划
├── research.md          # Phase 0输出 - 技术研究
├── data-model.md        # Phase 1输出 - 数据模型
├── quickstart.md        # Phase 1输出 - 快速开始指南
├── contracts/           # Phase 1输出 - API契约定义
│   ├── banner.yaml      # Banner API契约
│   ├── hotel.yaml       # 酒店API契约
│   ├── product.yaml     # 商品API契约
│   └── coupon.yaml      # 优惠券API契约
└── tasks.md             # Phase 2输出（由/speckit.tasks生成）
```

### Source Code (repository root)

```text
src/
├── services/
│   ├── request.js       # 已存在 - HTTP请求封装（P1已实现）
│   ├── hotel.js         # 需更新 - 酒店API服务
│   ├── mall.js          # 需更新 - 商城API服务
│   ├── banner.js        # 需新建 - Banner API服务
│   ├── coupon.js        # 需新建 - 优惠券API服务
│   └── cache.js         # 需新建 - 缓存管理服务
│
├── stores/
│   ├── hotel.js         # 需更新 - 酒店状态管理
│   ├── mall.js          # 需更新 - 商城状态管理
│   ├── banner.js        # 需新建 - Banner状态管理
│   └── coupon.js        # 需新建 - 优惠券状态管理
│
├── pages/
│   ├── index/
│   │   └── index.vue    # 需更新 - 首页（移除mock数据）
│   ├── hotel/
│   │   ├── list.vue     # 需更新 - 酒店列表页
│   │   ├── detail.vue   # 需更新 - 酒店详情页
│   │   └── room-detail.vue # 需更新 - 房型详情页
│   ├── mall/
│   │   └── index.vue    # 需更新 - 商城页（移除mock数据）
│   ├── coupon/
│   │   └── index.vue    # 需新建 - 优惠券列表页
│   └── user/
│       └── coupons.vue  # 需新建 - 我的优惠券页
│
├── components/
│   ├── common/
│   │   ├── LoadingState.vue    # 需新建 - 加载状态组件
│   │   ├── ErrorState.vue      # 需新建 - 错误状态组件
│   │   └── EmptyState.vue      # 需新建 - 空状态组件
│   └── layout/
│       └── SkeletonScreen.vue  # 需新建 - 骨架屏组件
│
└── utils/
    ├── debounce.js      # 需新建 - 防抖工具函数
    ├── imageLoader.js   # 需新建 - 图片懒加载工具
    └── requestQueue.js  # 需新建 - 请求队列管理
```

**Structure Decision**: 采用UniApp单项目结构（Mobile类型），遵循现有src/目录组织方式。新增服务、状态管理和工具函数模块支持API迁移需求。复用P1阶段已实现的`request.js`请求封装。

## Complexity Tracking

无违规项，无需填写此表。
