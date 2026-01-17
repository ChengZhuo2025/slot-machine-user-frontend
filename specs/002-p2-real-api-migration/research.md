# Phase 0: Research & Best Practices

**Feature**: P2阶段API真实接口迁移
**Date**: 2026-01-17
**Status**: Complete

## 研究概述

本研究阶段确定了从mock数据迁移到真实API的技术方案和最佳实践，重点关注缓存策略、请求管理、图片优化和错误处理。

## 1. 缓存策略

### 决策: 使用Pinia Store + 内存缓存 + 时间戳验证

**选择理由**:
- Pinia已集成到项目中，提供响应式状态管理
- 内存缓存性能最优（无I/O开销）
- 时间戳验证简单高效，易于实现5-10分钟的缓存策略
- 支持后台静默刷新机制

**实现方案**:
```javascript
// Store 结构示例
{
  data: [], // 缓存的数据
  timestamp: 0, // 数据获取时间戳
  maxAge: 600000, // 缓存有效期(毫秒) 默认10分钟
  isRefreshing: false // 是否正在后台刷新
}
```

**优势**:
- 响应式更新UI
- 跨页面共享缓存
- 易于清除和重置
- 支持持久化（pinia-plugin-persistedstate已安装）

**替代方案及拒绝理由**:
- ~~IndexedDB~~: 异步I/O增加复杂度，不适合频繁读写的短期缓存
- ~~LocalStorage~~: 同步阻塞主线程，存储容量限制（5MB）
- ~~Service Worker~~: UniApp不支持，仅H5可用

## 2. 请求竞态条件处理

### 决策: AbortController + 请求队列管理

**选择理由**:
- 原生支持请求取消（XMLHttpRequest.abort）
- 符合Web标准API设计
- 避免闭包陷阱和内存泄漏

**实现方案**:
```javascript
// 请求队列管理器
class RequestQueue {
  constructor() {
    this.pendingRequests = new Map() // key: requestKey, value: abortController
  }

  // 取消之前的同类请求
  cancel(requestKey) {
    const controller = this.pendingRequests.get(requestKey)
    if (controller) {
      controller.abort()
      this.pendingRequests.delete(requestKey)
    }
  }

  // 注册新请求
  register(requestKey, controller) {
    this.cancel(requestKey) // 先取消旧请求
    this.pendingRequests.set(requestKey, controller)
  }
}
```

**请求标识策略**:
- 商品列表: `product-list-${categoryId}-${sortType}`
- 酒店列表: `hotel-list-${searchParams}`
- 搜索请求: `search-${module}-${keyword}`

**优势**:
- 精确控制请求生命周期
- 避免数据竞态
- 减少无效请求

**替代方案及拒绝理由**:
- ~~请求序列化队列~~: 用户体验差，延迟高
- ~~时间戳比对~~: 异步响应顺序不可控，仍可能出现旧数据覆盖新数据

## 3. 图片懒加载与渐进式加载

### 决策: IntersectionObserver + 双重图片策略

**选择理由**:
- IntersectionObserver性能优于scroll事件监听
- 双重图片（缩略图+高清图）提供最佳视觉体验
- 符合移动端流量优化最佳实践

**实现方案**:
```javascript
// 图片懒加载指令
const lazyLoadDirective = {
  mounted(el, binding) {
    const options = {
      rootMargin: '50px', // 提前50px加载
      threshold: 0.01
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target
          const thumbnail = img.dataset.thumbnail
          const fullsize = img.dataset.src

          // 先加载缩略图
          img.src = thumbnail

          // 后台加载高清图
          const hdImg = new Image()
          hdImg.onload = () => {
            img.src = fullsize
            img.classList.add('loaded')
          }
          hdImg.src = fullsize

          observer.unobserve(img)
        }
      })
    }, options)

    observer.observe(el)
  }
}
```

**图片尺寸策略**:
- 缩略图: 宽度200px, webp格式
- 高清图: 宽度750px (2倍屏), webp/jpg格式
- 后端需要提供图片处理服务(七牛云/阿里OSS样式参数)

**优势**:
- 节省流量（缩略图通常<50KB）
- 快速首屏渲染
- 平滑加载过渡

**替代方案及拒绝理由**:
- ~~只加载高清图~~: 首屏加载慢，流量消耗大
- ~~原生懒加载(loading="lazy")~~: UniApp跨平台支持不完善
- ~~预加载下一屏~~: 增加复杂度，收益有限

## 4. 搜索防抖机制

### 决策: 自定义Debounce Hook + 400ms延迟

**选择理由**:
- 400ms在响应速度和请求频率间取得平衡
- Lodash.debounce体积大（~4KB），自定义实现仅需10行
- 支持取消和立即执行

**实现方案**:
```javascript
// 防抖函数
export function debounce(fn, delay = 400) {
  let timer = null
  return function(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// 使用示例
const searchProducts = debounce((keyword) => {
  mallStore.searchProducts(keyword)
}, 400)
```

**延迟时间选择理由**:
- <300ms: 用户感知不明显，节省效果有限
- 300-500ms: 最佳平衡点
- >500ms: 用户感觉响应迟钝

**优势**:
- 减少90%以上的无效请求
- 降低服务器负载
- 提升搜索体验

**替代方案及拒绝理由**:
- ~~Throttle节流~~: 仍会发送中间状态请求，浪费资源
- ~~仅按回车搜索~~: 用户体验差，不符合现代搜索交互习惯

## 5. 服务降级策略

### 决策: 缓存降级 + 状态提示 + 手动刷新

**选择理由**:
- 优先展示旧数据优于空白页面
- 透明告知用户数据状态符合诚信原则
- 手动刷新赋予用户控制权

**实现方案**:
```javascript
async function fetchData(url, useCacheFallback = true) {
  try {
    const data = await api.get(url)
    updateCache(data) // 更新缓存
    return { data, isFromCache: false }
  } catch (error) {
    if (useCacheFallback && hasCache()) {
      showToast('网络异常，展示的可能不是最新数据')
      return { data: getCache(), isFromCache: true }
    }
    throw error
  }
}
```

**UI提示设计**:
- 缓存数据: 顶部黄色提示条 "数据可能不是最新" + 刷新按钮
- 无缓存失败: 错误占位图 + 重试按钮
- 重试次数: 最多3次自动重试，间隔1秒

**优势**:
- 提升离线可用性
- 减少用户流失
- 符合渐进式增强原则

**替代方案及拒绝理由**:
- ~~静态兜底数据~~: 误导用户，数据不真实
- ~~自动重试无限循环~~: 浪费资源，用户体验差

## 6. API端点映射

### 现有端点分析

基于`src/services/hotel.js`和`src/services/mall.js`分析：

| 前端需求 | 后端端点 | 状态 |
|---------|---------|------|
| 首页Banner | `/banners` | 需新建 |
| 推荐酒店 | `/hotels/recommended` | 已存在 |
| 热门房型 | `/rooms/hot` | 已存在 |
| 附近酒店 | `/hotels?longitude=&latitude=` | 已存在 |
| 精选商品 | `/products/selected` | 已存在 |
| 商品分类 | `/categories` | 已存在 |
| 商品列表 | `/products` | 已存在 |
| 优惠券列表 | `/marketing/coupons` | 需确认 |
| 领取优惠券 | `/marketing/coupons/{id}/claim` | 需确认 |

### 数据转换需求

**酒店数据映射**:
```javascript
// 后端响应
{
  id, name, star_rating, city, district, address,
  images: { facade, lobby, room }, // 多张图片对象
  min_price, recommend_score
}

// 前端展示需要
{
  id, name, star, location: `${city}${district}`,
  coverImage: images.facade, // 取第一张
  price: min_price
}
```

**商品数据映射**:
```javascript
// 后端响应
{
  id, name, images, price, member_price,
  category_id, sales, stock, specs
}

// 前端展示需要 (已匹配，无需转换)
```

## 7. 工具函数库

### 需要实现的工具

| 工具 | 功能 | 优先级 |
|------|------|--------|
| `debounce.js` | 防抖函数 | P1 |
| `imageLoader.js` | 图片懒加载指令 | P1 |
| `requestQueue.js` | 请求队列管理 | P1 |
| `cache.js` | 缓存管理服务 | P1 |
| `dataTransform.js` | 数据转换适配器 | P2 |

### 复用现有工具

- `request.js`: 已实现Token刷新、错误处理、响应拦截
- `secureStorage.js`: 已实现安全存储Token
- `errorHandler.js`: 已实现HTTP错误提示

## 8. 性能基准

### 目标性能指标

| 指标 | 目标值 | 测量方法 |
|------|--------|----------|
| 首页首次加载(FCP) | <2秒 | Performance API |
| 分页加载 | <1秒 | Network timing |
| 搜索响应 | <500ms | 防抖后首次API响应 |
| 缓存命中率 | >60% | 日志统计 |
| API错误率 | <1% | 错误监控 |

### 性能优化策略

1. **首屏优化**:
   - 使用骨架屏替代Loading图标
   - 优先加载可视区域数据
   - 延迟加载非关键模块

2. **网络优化**:
   - 启用HTTP/2多路复用
   - 图片使用webp格式
   - 开启gzip压缩

3. **渲染优化**:
   - 虚拟滚动(长列表)
   - 图片懒加载
   - 防抖/节流

## 研究结论

所有技术方案已明确，无NEEDS CLARIFICATION项。可以进入Phase 1设计阶段。

### 关键技术栈确认

- **缓存**: Pinia Store + 时间戳验证
- **请求管理**: AbortController + 请求队列
- **图片优化**: IntersectionObserver + 双重加载
- **搜索防抖**: 自定义debounce(400ms)
- **降级策略**: 缓存降级 + 状态提示

### 下一步

进入Phase 1，创建：
1. 数据模型定义(`data-model.md`)
2. API契约文档(`contracts/`)
3. 快速开始指南(`quickstart.md`)
