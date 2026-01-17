# 需求质量审查检查清单: P2阶段API真实接口迁移

**Purpose**: PR评审时验证需求文档的完整性、清晰度和一致性
**Created**: 2026-01-17
**Feature**: [spec.md](../spec.md) | [plan.md](../plan.md)
**Depth**: 标准级别（全面覆盖）
**Audience**: 评审者（PR Review）

---

## API契约与数据一致性

- [ ] CHK001 - Banner API契约是否定义了所有必需字段的验证规则？[Completeness, contracts/banner.yaml]
- [ ] CHK002 - Hotel API响应中`images`字段从对象改为数组，前端转换逻辑需求是否明确？[Clarity, data-model.md §Hotel]
- [ ] CHK003 - 商品列表响应使用`list`而非`items`，这一差异是否在所有相关文档中保持一致？[Consistency, data-model.md §列表响应格式]
- [ ] CHK004 - 优惠券`type`字段的`percent`类型，折扣值格式（0.1表示9折）是否足够清晰？[Clarity, contracts/coupon.yaml]
- [ ] CHK005 - 房型状态码（0=停用,1=可用,2=已预订,3=使用中）是否在UI展示需求中有对应定义？[Gap, data-model.md §Room]
- [ ] CHK006 - API端点`/hotels/recommended`与`/hotels?longitude=&latitude=`的使用场景区分是否明确？[Clarity, research.md §6]
- [ ] CHK007 - 分页参数`page/page_size`在所有列表API中是否保持一致命名？[Consistency, contracts/]

## 缓存与状态管理

- [ ] CHK008 - "短期内存缓存（5-10分钟）"的具体时长选择标准是否定义？[Clarity, spec.md §Clarifications]
- [ ] CHK009 - 不同数据类型（Banner/酒店/商品/优惠券）是否应有不同的缓存策略？需求未明确[Gap]
- [ ] CHK010 - "后台静默刷新"触发条件和失败处理是否有明确需求？[Completeness, research.md §1]
- [ ] CHK011 - 缓存数据结构中`isValid`计算属性的边界条件是否定义？[Clarity, research.md §1]
- [ ] CHK012 - 跨页面共享缓存时，数据同步和一致性需求是否明确？[Gap]
- [ ] CHK013 - 用户登出时缓存清除策略是否有需求定义？[Gap]
- [ ] CHK014 - Pinia持久化（pinia-plugin-persistedstate）的使用范围和配置需求是否明确？[Clarity, plan.md §Technical Context]

## 请求管理与竞态处理

- [ ] CHK015 - 请求取消的"同类请求"定义标准是否清晰？[Clarity, spec.md §Clarifications]
- [ ] CHK016 - 请求标识策略（如`product-list-${categoryId}-${sortType}`）是否覆盖所有需要竞态处理的场景？[Coverage, research.md §2]
- [ ] CHK017 - AbortController在UniApp跨平台环境的兼容性是否已验证？[Assumption, research.md §2]
- [ ] CHK018 - 被取消请求的错误处理（区分用户取消vs网络错误）需求是否定义？[Gap]

## 错误处理与用户体验

- [ ] CHK019 - 错误提示"中文友好提示"的具体文案是否有需求定义或设计稿？[Gap, spec.md §III]
- [ ] CHK020 - 401响应"自动跳转登录"与当前页面状态保存需求是否明确？[Completeness, spec.md §III]
- [ ] CHK021 - 429限流响应的"稍后重试"具体时间建议是否需要展示给用户？[Clarity, spec.md §III]
- [ ] CHK022 - 空状态"引导页面"的设计需求和跳转目标是否定义？[Gap, spec.md §Edge Cases]
- [ ] CHK023 - "最多3次自动重试，间隔1秒"的重试策略是否适用于所有API？[Clarity, research.md §5]
- [ ] CHK024 - 降级策略中"数据可能不是最新"的提示UI样式是否有设计需求？[Gap, research.md §5]
- [ ] CHK025 - 位置权限被拒绝时"显示热门酒店"的具体筛选条件是否定义？[Clarity, spec.md §Edge Cases]

## 性能需求

- [ ] CHK026 - "首页2秒内加载完成"是否定义了测量起点和终点？[Measurability, plan.md §Technical Context]
- [ ] CHK027 - "分页1秒内响应"是否包含网络延迟还是仅指渲染时间？[Clarity, plan.md §Technical Context]
- [ ] CHK028 - 性能目标在不同网络条件（3G/4G/WiFi）下是否有差异化要求？[Gap]
- [ ] CHK029 - "缓存命中率>60%"的统计方式和监控方案是否定义？[Measurability, research.md §8]
- [ ] CHK030 - "API错误率<1%"的计算周期和告警阈值是否明确？[Clarity, research.md §8]

## 图片加载优化

- [ ] CHK031 - 缩略图尺寸"宽度200px"与高清图"宽度750px"是否适用于所有图片类型？[Coverage, research.md §3]
- [ ] CHK032 - 图片CDN域名或后端图片处理服务的依赖是否明确？[Assumption, spec.md §Assumptions]
- [ ] CHK033 - IntersectionObserver在UniApp小程序端的兼容性是否已确认？[Assumption, research.md §3]
- [ ] CHK034 - 图片加载失败的fallback图片需求是否定义？[Gap]

## 搜索功能

- [ ] CHK035 - 防抖延迟"300-500ms"的最终取值依据是否记录？（research.md选择400ms）[Clarity, spec.md vs research.md]
- [ ] CHK036 - 搜索关键词最小长度和特殊字符处理需求是否定义？[Gap, contracts/product.yaml]
- [ ] CHK037 - 搜索历史记录存储和展示需求是否在范围内？[Gap]

## 用户故事覆盖

- [ ] CHK038 - US4（房型信息）依赖US3（酒店列表）的关系是否在需求中明确？[Consistency, spec.md §US4]
- [ ] CHK039 - US5（优惠券领取）的并发领取冲突处理需求是否定义？[Gap, spec.md §US5]
- [ ] CHK040 - US6（加载状态管理）的骨架屏设计是否有具体UI规格？[Gap, spec.md §US6]

## 依赖与假设

- [ ] CHK041 - "后端API已经就绪"的假设是否有验证机制或mock fallback？[Assumption, spec.md §Assumptions]
- [ ] CHK042 - Token刷新机制（P1已实现）与本次迁移的集成点是否明确？[Dependency, spec.md §III]
- [ ] CHK043 - 后端响应格式`code=0`与`code=200`同时表示成功，处理逻辑是否一致？[Consistency, spec.md §Assumptions]

---

## Notes

- 检查项标记`[Gap]`表示需求可能缺失，需补充
- 检查项标记`[Assumption]`表示存在未验证的假设
- 检查项标记`[Clarity]`表示需求表述可能不够清晰
- 检查项标记`[Consistency]`表示可能存在不一致
- 检查项标记`[Measurability]`表示验收标准可能不可度量
- 检查项标记`[Coverage]`表示场景覆盖可能不完整
- 检查项标记`[Completeness]`表示需求可能不完整
