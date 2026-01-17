# Quick Start: P2阶段API迁移开发指南

**Feature**: P2阶段API真实接口迁移
**Date**: 2026-01-17
**Status**: Complete

## 概述

本指南帮助开发者快速上手P2阶段的API迁移工作。所有代码修改均在现有项目结构上进行，不引入新的框架或依赖。

## 前置条件

1. **后端服务运行中**: `http://localhost:8000`
2. **Node.js**: >= 16.0
3. **UniApp开发环境**: HBuilderX

## 快速开始步骤

### 1. 确认分支

```bash
git checkout 002-p2-real-api-migration
```

### 2. 安装依赖（如有需要）

```bash
npm install
```

### 3. 启动开发服务

```bash
npm run dev:h5
# 或
npm run dev:mp-weixin
```

### 4. 确认后端连接

访问 `http://localhost:8000/swagger/index.html` 确认后端API可用。

## 开发顺序

按照优先级逐步迁移，每完成一个模块需验证后再进行下一个：

```
P1 优先级 (核心业务)
├── 1. 首页Banner API
├── 2. 推荐酒店 API
├── 3. 热门房型 API
├── 4. 商城分类和商品列表 API
└── 5. 附近酒店 API

P2 优先级 (次要业务)
├── 6. 房型详情 API
├── 7. 优惠券列表 API
└── 8. 优惠券领取 API

P3 优先级 (体验优化)
├── 9. 加载状态组件
├── 10. 错误状态组件
└── 11. 缓存机制完善
```

## 代码模式

### 模式1: 新建API服务

**文件**: `src/services/banner.js`

```javascript
import { get } from './request'

/**
 * 获取首页Banner列表
 * @param {Object} params - 查询参数
 * @param {string} [params.position='home'] - 广告位置
 * @param {number} [params.limit=5] - 返回数量
 * @returns {Promise<Array>}
 */
export const getBanners = (params = {}) => {
  return get('/banners', {
    position: 'home',
    limit: 5,
    ...params
  })
}
```

### 模式2: 新建Store状态管理

**文件**: `src/stores/banner.js`

```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getBanners } from '@/services/banner'

export const useBannerStore = defineStore('banner', () => {
  // 状态
  const banners = ref([])
  const loading = ref(false)
  const error = ref(null)
  const cacheTimestamp = ref(0)
  const CACHE_MAX_AGE = 10 * 60 * 1000 // 10分钟

  // 计算属性
  const isCacheValid = computed(() => {
    return Date.now() - cacheTimestamp.value < CACHE_MAX_AGE
  })

  // 动作
  async function fetchBanners(forceRefresh = false) {
    // 如果缓存有效且不强制刷新，直接返回
    if (!forceRefresh && isCacheValid.value && banners.value.length > 0) {
      return banners.value
    }

    loading.value = true
    error.value = null

    try {
      const data = await getBanners()
      banners.value = data
      cacheTimestamp.value = Date.now()
      return data
    } catch (e) {
      error.value = e.message
      // 降级策略: 如果有缓存数据，继续使用
      if (banners.value.length > 0) {
        return banners.value
      }
      throw e
    } finally {
      loading.value = false
    }
  }

  // 重置状态
  function reset() {
    banners.value = []
    cacheTimestamp.value = 0
    error.value = null
  }

  return {
    banners,
    loading,
    error,
    isCacheValid,
    fetchBanners,
    reset
  }
})
```

### 模式3: 页面组件使用

**文件**: `src/pages/index/index.vue`

```vue
<script setup>
import { onMounted, onPullDownRefresh } from '@dcloudio/uni-app'
import { useBannerStore } from '@/stores/banner'

const bannerStore = useBannerStore()

onMounted(async () => {
  await bannerStore.fetchBanners()
})

// 下拉刷新
onPullDownRefresh(async () => {
  await bannerStore.fetchBanners(true) // 强制刷新
  uni.stopPullDownRefresh()
})
</script>

<template>
  <!-- 加载状态 -->
  <view v-if="bannerStore.loading" class="loading">
    <SkeletonBanner />
  </view>

  <!-- 错误状态 -->
  <view v-else-if="bannerStore.error && !bannerStore.banners.length" class="error">
    <ErrorState :message="bannerStore.error" @retry="bannerStore.fetchBanners(true)" />
  </view>

  <!-- 正常内容 -->
  <view v-else>
    <swiper class="banner-swiper">
      <swiper-item v-for="banner in bannerStore.banners" :key="banner.id">
        <image :src="banner.image_url" mode="aspectFill" />
      </swiper-item>
    </swiper>
  </view>
</template>
```

### 模式4: 防抖搜索

**文件**: `src/utils/debounce.js`

```javascript
/**
 * 防抖函数
 * @param {Function} fn - 要执行的函数
 * @param {number} delay - 延迟时间(毫秒)
 * @returns {Function}
 */
export function debounce(fn, delay = 400) {
  let timer = null
  return function(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}
```

**使用示例**:

```vue
<script setup>
import { ref } from 'vue'
import { debounce } from '@/utils/debounce'
import { useMallStore } from '@/stores/mall'

const keyword = ref('')
const mallStore = useMallStore()

// 防抖搜索
const handleSearch = debounce((value) => {
  mallStore.searchProducts(value)
}, 400)
</script>

<template>
  <input v-model="keyword" @input="handleSearch(keyword)" placeholder="搜索商品" />
</template>
```

### 模式5: 请求取消

**文件**: `src/utils/requestQueue.js`

```javascript
/**
 * 请求队列管理器
 * 用于处理请求竞态条件
 */
class RequestQueue {
  constructor() {
    this.pendingRequests = new Map()
  }

  /**
   * 获取请求控制器
   * @param {string} key - 请求标识
   * @returns {AbortController}
   */
  getController(key) {
    // 取消之前的同类请求
    if (this.pendingRequests.has(key)) {
      const oldController = this.pendingRequests.get(key)
      oldController.abort()
    }

    // 创建新控制器
    const controller = new AbortController()
    this.pendingRequests.set(key, controller)
    return controller
  }

  /**
   * 完成请求
   * @param {string} key - 请求标识
   */
  complete(key) {
    this.pendingRequests.delete(key)
  }

  /**
   * 清除所有请求
   */
  clearAll() {
    this.pendingRequests.forEach(controller => controller.abort())
    this.pendingRequests.clear()
  }
}

export const requestQueue = new RequestQueue()
```

## 测试验证

每个模块迁移后，需进行以下验证：

### 功能验证

- [ ] 数据正确从API获取
- [ ] 分页/滚动加载正常
- [ ] 下拉刷新正常
- [ ] 筛选/排序正常

### 异常验证

- [ ] 网络断开时显示错误提示
- [ ] 401时跳转登录页
- [ ] 数据为空时显示空状态
- [ ] 快速切换不产生数据错乱

### 性能验证

- [ ] 首次加载<2秒
- [ ] 分页加载<1秒
- [ ] 缓存命中时无网络请求

## 常见问题

### Q: Mock数据如何保留？

A: 不删除mock数据文件，在Store中添加`useMock`开关：

```javascript
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

async function fetchData() {
  if (USE_MOCK) {
    return mockData
  }
  return await apiCall()
}
```

### Q: 如何处理后端字段名不一致？

A: 在Store中添加数据转换层：

```javascript
function transformHotel(raw) {
  return {
    id: raw.id,
    name: raw.name,
    star: raw.star_rating, // 后端用star_rating，前端用star
    location: `${raw.city}${raw.district}`,
    coverImage: raw.images?.facade || '',
    price: raw.min_price
  }
}
```

### Q: 如何调试API请求？

A: 打开浏览器开发者工具Network面板，或在request.js中添加日志：

```javascript
const requestInterceptor = async (config) => {
  console.log('[API Request]', config.method, config.url, config.data)
  // ...
}
```

## 文件清单

完成P2迁移后，应有以下新增/修改文件：

### 新建文件

- `src/services/banner.js`
- `src/services/coupon.js`
- `src/services/cache.js`
- `src/stores/banner.js`
- `src/stores/coupon.js`
- `src/utils/debounce.js`
- `src/utils/imageLoader.js`
- `src/utils/requestQueue.js`
- `src/components/common/LoadingState.vue`
- `src/components/common/ErrorState.vue`
- `src/components/common/EmptyState.vue`
- `src/components/layout/SkeletonScreen.vue`

### 修改文件

- `src/services/hotel.js` - 添加缓存支持
- `src/services/mall.js` - 添加缓存支持
- `src/pages/index/index.vue` - 移除mock数据，使用Store
- `src/pages/hotel/index.vue` - 移除mock数据，使用Store
- `src/pages/mall/index.vue` - 移除mock数据，使用Store

## 下一步

完成本指南后，运行 `/speckit.tasks` 生成详细任务列表。
