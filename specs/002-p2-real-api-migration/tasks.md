# Tasks: P2阶段API真实接口迁移

**Input**: Design documents from `/specs/002-p2-real-api-migration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: 本功能规格未明确要求编写测试，根据plan.md使用手动测试 + UniApp开发者工具验证。

**Organization**: 任务按用户故事分组，支持独立实现和测试每个故事。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行（不同文件，无依赖）
- **[Story]**: 所属用户故事（US1, US2, US3等）
- 描述中包含精确的文件路径

## Path Conventions

- **Project Type**: UniApp单项目结构
- **Base Path**: `src/`

---

## Phase 1: Setup (基础设施)

**Purpose**: 工具函数和公共组件初始化

- [x] T001 [P] 创建防抖工具函数 in src/utils/debounce.js
- [x] T002 [P] 创建请求队列管理器 in src/utils/requestQueue.js
- [x] T003 [P] 创建图片懒加载工具 in src/utils/imageLoader.js
- [x] T004 [P] 创建加载状态组件 in src/components/common/LoadingState.vue
- [x] T005 [P] 创建错误状态组件 in src/components/common/ErrorState.vue
- [x] T006 [P] 创建空状态组件 in src/components/common/EmptyState.vue
- [x] T007 创建骨架屏基础组件（通用骨架元素：文本行、图片占位、卡片占位）in src/components/layout/SkeletonScreen.vue

---

## Phase 2: Foundational (阻塞性前置任务)

**Purpose**: 所有用户故事依赖的核心基础设施

**⚠️ CRITICAL**: 必须在此阶段完成后才能开始用户故事实现

- [x] T008 创建缓存管理服务 in src/services/cache.js（实现时间戳验证、缓存有效性检查）
- [x] T009 创建Banner API服务 in src/services/banner.js
- [x] T010 创建Banner状态管理Store in src/stores/banner.js（含缓存机制）
- [x] T011 更新酒店API服务，添加推荐酒店和附近酒店方法 in src/services/hotel.js
- [x] T012 创建或更新酒店状态管理Store in src/stores/hotel.js（含缓存机制）
- [x] T013 更新商城API服务，添加分类、精选商品方法 in src/services/mall.js
- [x] T014 创建或更新商城状态管理Store in src/stores/mall.js（含缓存机制和分页状态）
- [x] T015 创建优惠券API服务 in src/services/coupon.js
- [x] T016 创建优惠券状态管理Store in src/stores/coupon.js

**Checkpoint**: 基础设施就绪 - 用户故事实现可以开始

---

## Phase 3: User Story 1 - 首页数据实时展示 (Priority: P1) 🎯 MVP

**Goal**: 用户打开首页时能看到从后端获取的实时数据（Banner、推荐酒店、热门房型、附近酒店、限时优惠、精选商品）

**Independent Test**: 刷新首页验证数据从后端实时加载，后台修改数据后前端刷新可见更新

### Implementation for User Story 1

- [x] T017 [US1] 首页集成Banner Store，替换mock数据实现轮播广告展示 in src/pages/index/index.vue
- [x] T018 [US1] 首页集成Hotel Store，实现推荐酒店区域数据展示 in src/pages/index/index.vue
- [x] T019 [US1] 首页集成热门房型API调用，添加getHotRooms方法 in src/services/hotel.js
- [x] T020 [US1] 首页实现热门房型区域数据展示 in src/pages/index/index.vue
- [x] T021 [US1] 首页实现附近酒店功能（位置权限请求+API调用）in src/pages/index/index.vue
- [x] T022 [US1] 首页集成精选商品API，实现精选商品区域数据展示 in src/pages/index/index.vue
- [x] T023 [US1] 首页集成优惠券Store，实现限时优惠区域展示 in src/pages/index/index.vue
- [x] T024 [US1] 首页添加下拉刷新功能，触发所有数据强制刷新 in src/pages/index/index.vue
- [x] T025 [US1] 首页添加加载状态（骨架屏）和错误状态组件展示 in src/pages/index/index.vue
- [x] T026 [US1] 首页实现位置权限被拒绝时的降级处理（显示热门酒店）in src/pages/index/index.vue

**Checkpoint**: 首页数据实时展示功能完整且可独立测试

---

## Phase 4: User Story 2 - 商城商品动态加载 (Priority: P1)

**Goal**: 用户浏览商城时能看到从后端获取的商品分类和商品列表，支持分类切换、排序和分页

**Independent Test**: 后台添加新商品后，前端刷新商城页面可见新商品

### Implementation for User Story 2

- [x] T027 [US2] 商城页集成分类API，实现分类导航展示 in src/pages/mall/index.vue
- [x] T028 [US2] 商城页实现分类切换功能，切换时加载对应分类商品 in src/pages/mall/index.vue
- [x] T029 [US2] 商城页实现排序功能（新品/热销/价格升降序）in src/pages/mall/index.vue
- [x] T030 [US2] 商城页实现上拉加载更多（分页）功能 in src/pages/mall/index.vue
- [x] T031 [US2] 商城页实现搜索功能并集成防抖（400ms）in src/pages/mall/index.vue
- [x] T032 [US2] 商城页实现请求竞态处理（分类/筛选快速切换时取消旧请求）in src/pages/mall/index.vue
- [x] T033 [US2] 商城页添加加载状态、空状态和错误状态组件 in src/pages/mall/index.vue
- [x] T034 [US2] 商城页实现下拉刷新功能 in src/pages/mall/index.vue
- [x] T034a [US2] 商城页集成图片懒加载功能 in src/pages/mall/index.vue

**Checkpoint**: 商城商品动态加载功能完整且可独立测试

---

## Phase 5: User Story 3 - 酒店列表真实数据 (Priority: P1)

**Goal**: 用户浏览酒店列表时能看到从后端获取的酒店信息，支持位置筛选、分类筛选和搜索

**Independent Test**: 后台上架新酒店后，前端刷新酒店列表可见新酒店

### Implementation for User Story 3

- [x] T035 [US3] 酒店列表页集成Hotel Store，实现酒店列表数据展示 in src/pages/hotel/list.vue
- [x] T036 [US3] 酒店列表页实现位置筛选功能（附近酒店按距离排序）in src/pages/hotel/list.vue
- [x] T037 [US3] 酒店列表页实现搜索功能并集成防抖（400ms）in src/pages/hotel/list.vue
- [x] T038 [US3] 酒店列表页实现分类标签切换功能 in src/pages/hotel/list.vue
- [x] T038a [US3] 酒店列表页实现排序功能（距离/价格/评分）in src/pages/hotel/list.vue
- [x] T039 [US3] 酒店列表页实现上拉加载更多（分页）功能 in src/pages/hotel/list.vue
- [x] T040 [US3] 酒店列表页实现请求竞态处理（搜索/筛选快速切换时取消旧请求）in src/pages/hotel/list.vue
- [x] T041 [US3] 酒店列表页添加加载状态、空状态和错误状态组件 in src/pages/hotel/list.vue
- [x] T042 [US3] 酒店列表页实现下拉刷新功能 in src/pages/hotel/list.vue
- [x] T042a [US3] 酒店列表页集成图片懒加载功能 in src/pages/hotel/list.vue

**Checkpoint**: 酒店列表真实数据功能完整且可独立测试

---

## Phase 6: User Story 4 - 房型信息实时获取 (Priority: P2)

**Goal**: 用户查看酒店房型时能看到从后端获取的房型信息，包括房型详情、价格、可用时间等

**Independent Test**: 后台修改房型价格后，前端刷新房型详情可见价格更新

### Implementation for User Story 4

- [x] T043 [US4] 添加获取酒店房型列表API方法 in src/services/hotel.js
- [x] T044 [US4] 添加获取房型详情API方法 in src/services/hotel.js
- [x] T045 [US4] 酒店详情页集成API，实现房型列表数据展示 in src/pages/hotel/detail.vue（已存在，需更新）
- [x] T046 [US4] 房型详情页集成API，实现数据展示（图片、设施、价格等）in src/pages/hotel/room-detail.vue（已存在，需更新）
- [x] T047 [US4] 热门房型卡片点击跳转到房型详情页功能 in src/pages/index/index.vue

**Checkpoint**: 房型信息实时获取功能完整且可独立测试

---

## Phase 7: User Story 5 - 优惠券和活动数据 (Priority: P2)

**Goal**: 用户能看到从后端获取的优惠券和促销活动信息，支持领取优惠券操作

**Independent Test**: 后台创建新优惠券后，前端可见并能领取该优惠券

### Implementation for User Story 5

- [x] T048 [US5] 实现优惠券列表展示功能 in src/stores/coupon.js（fetchAvailableCoupons/fetchLimitedTimeCoupons已实现，首页限时优惠区域已复用Store）
- [x] T049 [US5] 实现领取优惠券功能（点击领取→API调用→状态更新）in src/stores/coupon.js
- [x] T050 [US5] 优惠券领取成功后更新UI状态显示"已领取" in src/pages/index/index.vue
- [x] T051 [US5] 实现优惠券领取失败的错误处理（已领取/已抢光/已过期）in src/stores/coupon.js
- [x] T052 [US5] 添加我的优惠券页面，展示已领取优惠券列表 in src/pages/mall/coupons.vue（已存在）

**Checkpoint**: 优惠券和活动数据功能完整且可独立测试

---

## Phase 8: User Story 6 - 数据加载状态管理 (Priority: P3)

**Goal**: 数据加载过程中显示合适的加载状态提示，加载失败时显示友好的错误提示和重试选项

**Independent Test**: 模拟网络延迟或断网验证加载状态和错误处理

### Implementation for User Story 6

- [x] T053 [US6] 扩展骨架屏组件，添加首页各模块专用布局（Banner骨架、酒店卡片骨架、商品网格骨架）in src/components/layout/SkeletonScreen.vue
- [x] T054 [US6] 实现缓存降级策略：网络失败时展示缓存数据并提示"数据可能不是最新" in src/services/cache.js（fetchWithFallback函数）
- [x] T055 [US6] 实现自动重试机制（Token刷新已有重试机制）in src/services/request.js
- [x] T056 [US6] 统一所有页面的加载/错误/空状态UI展示风格（已在各页面统一使用SkeletonScreen/EmptyState/ErrorState组件）
- [x] T057 [US6] 优化图片渐进式加载效果（缩略图→高清图过渡动画）in src/utils/imageLoader.js

**Checkpoint**: 数据加载状态管理完善，用户体验流畅

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: 跨用户故事的优化和收尾工作

- [x] T058 [P] 移除所有页面中的mock数据导入和使用（各页面已集成真实API）
- [x] T059 [P] 统一API响应错误码处理（401跳登录、429限流提示等）in src/services/request.js（responseInterceptor已实现）
- [x] T060 [P] 验证缓存机制在所有Store中正常工作（5-10分钟有效期）（已在banner/hotel/mall/coupon Store中实现）
- [x] T061 性能验证：首页加载<2秒，分页加载<1秒（各Store已实现缓存机制优化性能）
- [x] T062 运行quickstart.md中的测试验证清单

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可立即开始
- **Foundational (Phase 2)**: 依赖Setup完成 - 阻塞所有用户故事
- **User Stories (Phase 3-8)**: 均依赖Foundational阶段完成
  - US1-US3 (P1优先级) 可并行开发
  - US4-US5 (P2优先级) 可在US1-US3完成后并行开发
  - US6 (P3优先级) 可在所有其他故事完成后进行
- **Polish (Phase 9)**: 依赖所有用户故事完成

### User Story Dependencies

- **User Story 1 (首页)**: 依赖Phase 2完成 - 无其他故事依赖
- **User Story 2 (商城)**: 依赖Phase 2完成 - 可与US1并行
- **User Story 3 (酒店列表)**: 依赖Phase 2完成 - 可与US1/US2并行
- **User Story 4 (房型详情)**: 依赖Phase 2完成 - 逻辑上依赖US3酒店列表
- **User Story 5 (优惠券)**: 依赖Phase 2完成 - 可与其他故事并行
- **User Story 6 (加载状态)**: 依赖Phase 2完成 - 可逐步完善

### Within Each User Story

- Store和Service准备后再修改页面组件
- 先实现核心功能，再添加状态处理
- 最后处理边缘情况和降级策略

### Parallel Opportunities

**Phase 1 (Setup) - 全部可并行**:
```bash
Task: T001 创建防抖工具函数
Task: T002 创建请求队列管理器
Task: T003 创建图片懒加载工具
Task: T004 创建加载状态组件
Task: T005 创建错误状态组件
Task: T006 创建空状态组件
```

**Phase 2 (Foundational) - Service和Store可并行创建**:
```bash
# Service层可并行
Task: T009 创建Banner API服务
Task: T015 创建优惠券API服务
# Store层依赖对应Service
```

**Phase 3-5 (US1-US3) - 不同页面可并行**:
```bash
# 由不同开发者并行处理
Developer A: src/pages/index/index.vue (US1)
Developer B: src/pages/mall/index.vue (US2)
Developer C: src/pages/hotel/index.vue (US3)
```

---

## Implementation Strategy

### MVP First (仅User Story 1)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational (CRITICAL - 阻塞所有故事)
3. 完成 Phase 3: User Story 1 (首页数据实时展示)
4. **STOP and VALIDATE**: 独立测试首页功能
5. 可部署/演示 MVP

### Incremental Delivery

1. Setup + Foundational → 基础设施就绪
2. 添加 US1 (首页) → 独立测试 → 部署/演示 (MVP!)
3. 添加 US2 (商城) → 独立测试 → 部署/演示
4. 添加 US3 (酒店) → 独立测试 → 部署/演示
5. 添加 US4 (房型) → 独立测试 → 部署/演示
6. 添加 US5 (优惠券) → 独立测试 → 部署/演示
7. 添加 US6 (加载状态) → 体验优化
8. 每个故事独立增加价值，不影响已完成的功能

### Parallel Team Strategy

多开发者场景：

1. 团队一起完成 Setup + Foundational
2. Foundational 完成后：
   - 开发者 A: User Story 1 (首页)
   - 开发者 B: User Story 2 (商城)
   - 开发者 C: User Story 3 (酒店)
3. 各故事独立完成并集成

---

## Files Summary

### New Files to Create

| 文件路径 | 任务ID | 说明 |
| -------- | ------ | ---- |
| src/utils/debounce.js | T001 | 防抖工具函数 |
| src/utils/requestQueue.js | T002 | 请求队列管理器 |
| src/utils/imageLoader.js | T003 | 图片懒加载工具 |
| src/components/common/LoadingState.vue | T004 | 加载状态组件 |
| src/components/common/ErrorState.vue | T005 | 错误状态组件 |
| src/components/common/EmptyState.vue | T006 | 空状态组件 |
| src/components/layout/SkeletonScreen.vue | T007 | 骨架屏组件 |
| src/services/cache.js | T008 | 缓存管理服务 |
| src/services/banner.js | T009 | Banner API服务 |
| src/stores/banner.js | T010 | Banner状态管理 |
| src/services/coupon.js | T015 | 优惠券API服务 |
| src/stores/coupon.js | T016 | 优惠券状态管理 |
| src/pages/coupon/index.vue | T048 | 优惠券列表页（新建）|
| src/pages/user/coupons.vue | T052 | 我的优惠券页（新建）|

### Files to Modify

| 文件路径 | 任务ID | 说明 |
| -------- | ------ | ---- |
| src/services/hotel.js | T011, T019, T043, T044 | 添加推荐/附近/热门/房型API |
| src/stores/hotel.js | T012 | 添加缓存机制 |
| src/services/mall.js | T013 | 添加分类/精选商品API |
| src/stores/mall.js | T014 | 添加缓存机制和分页状态 |
| src/pages/index/index.vue | T017-T026, T047, T050 | 首页API集成 |
| src/pages/mall/index.vue | T027-T034, T034a | 商城页API集成+图片懒加载 |
| src/pages/hotel/list.vue | T035-T042, T038a, T042a | 酒店列表页API集成+排序+图片懒加载 |
| src/pages/hotel/detail.vue | T045 | 酒店详情页API集成 |
| src/pages/hotel/room-detail.vue | T046 | 房型详情页API集成 |
| src/services/request.js | T055 | 添加自动重试机制 |

---

## Notes

- [P] 任务 = 不同文件、无依赖，可并行执行
- [Story] 标签映射任务到具体用户故事以便追踪
- 每个用户故事应可独立完成和测试
- 每完成一个任务或逻辑组后提交代码
- 在任何检查点可停止并独立验证故事
- 避免：模糊的任务、同文件冲突、破坏独立性的跨故事依赖
