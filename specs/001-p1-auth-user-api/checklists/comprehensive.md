# Comprehensive Requirements Quality Checklist

**Purpose**: PR 评审 - 全面审查认证与用户模块 API 对接的需求质量
**Created**: 2026-01-13
**Feature**: 001-p1-auth-user-api
**Depth**: Standard (20-30 items)

---

## Requirement Completeness

- [ ] CHK001 - 是否明确定义了手机号格式验证规则（如仅支持中国大陆手机号）？ [Gap, Spec §FR-001]
- [ ] CHK002 - 是否定义了验证码输入错误次数限制及锁定机制？ [Gap, Edge Cases]
- [ ] CHK003 - 是否明确定义了微信登录失败时的降级方案（如 code 获取失败）？ [Gap, Spec §FR-002]
- [ ] CHK004 - 是否定义了 Token 刷新失败时的重试策略（重试次数、间隔）？ [Gap, Spec §FR-004]
- [ ] CHK005 - 是否定义了用户头像上传的文件大小、格式限制？ [Gap, Spec §FR-010]
- [ ] CHK006 - 是否定义了交易记录分页的默认页大小和最大限制？ [Gap, Spec §FR-012]

## Requirement Clarity

- [ ] CHK007 - "验证码有效期5分钟"是否明确从发送时刻还是用户收到时刻计算？ [Clarity, Spec §FR-001]
- [ ] CHK008 - "剩余时间 <5 分钟时自动刷新"的时间判断是基于本地时钟还是服务器时间？ [Clarity, Spec §FR-005]
- [ ] CHK009 - "用户友好的中文错误提示"是否有统一的错误码与提示语映射表？ [Clarity, Spec §SC-006]
- [ ] CHK010 - 手机号"脱敏显示"的具体规则是否明确（如 138****1234）？ [Clarity, User Story 4]
- [ ] CHK011 - 交易记录"类型"字段的枚举值是否完整定义？ [Clarity, Key Entities - Transaction]

## Requirement Consistency

- [ ] CHK012 - FR-007（401 重定向登录页）与 FR-007a（懒加载刷新）在 token 过期场景下的优先级是否一致？ [Consistency, Spec §FR-007/FR-007a]
- [ ] CHK013 - 页面清单中"需要登录"列与 User Story 6 中"受保护页面列表"是否完全一致？ [Consistency, Spec §US6 vs 页面清单]
- [ ] CHK014 - Edge Cases 中的错误提示文案与 SC-006 的"用户友好提示"要求是否对齐？ [Consistency]

## Acceptance Criteria Quality

- [ ] CHK015 - SC-001 "30秒内完成登录"的计时起点和终点是否可客观测量？ [Measurability, Spec §SC-001]
- [ ] CHK016 - SC-003 "Token 刷新对用户透明"如何客观验证"无感知"？ [Measurability, Spec §SC-003]
- [ ] CHK017 - SC-007 "UI 界面和交互保持不变"是否有基线快照或对比标准？ [Measurability, Spec §SC-007]

## Scenario Coverage

- [ ] CHK018 - 是否定义了用户在验证码倒计时期间切换页面/应用后返回的行为？ [Coverage, User Story 1]
- [ ] CHK019 - 是否定义了微信登录授权弹窗被系统拦截（非用户拒绝）的处理？ [Coverage, User Story 2]
- [ ] CHK020 - 是否定义了 Token 刷新过程中网络断开的恢复流程？ [Coverage, User Story 3]
- [ ] CHK021 - 是否定义了用户在编辑个人信息时网络中断的数据保存策略？ [Coverage, User Story 4]

## Edge Case Coverage

- [ ] CHK022 - 是否定义了并发刷新队列超时或队列溢出的处理？ [Edge Case, Spec §FR-005a]
- [ ] CHK023 - 是否定义了旧设备被踢出时正在进行的操作（如支付）如何处理？ [Edge Case, Clarifications - 多设备登录]
- [ ] CHK024 - 是否定义了钱包余额显示的精度和舍入规则？ [Edge Case, Key Entities - Wallet]
- [ ] CHK025 - 是否定义了交易记录时间戳的时区处理（本地/服务器时区）？ [Edge Case, Key Entities - Transaction]

## Non-Functional Requirements

- [ ] CHK026 - 是否定义了 Token 存储的安全要求（如是否需要加密存储）？ [Security, Clarifications - Token 存储]
- [ ] CHK027 - 是否定义了敏感信息（手机号、余额）在日志中的脱敏要求？ [Security, Gap]
- [ ] CHK028 - 是否定义了 API 请求的并发限制（同时进行的请求数上限）？ [Performance, Gap]
- [ ] CHK029 - 是否定义了离线状态下已登录用户的体验要求？ [Availability, Gap]

## Dependencies & Assumptions

- [ ] CHK030 - 假设"后端 API 运行在 localhost:8000"是否有环境切换（开发/测试/生产）的配置说明？ [Assumption, Spec §Assumptions]
- [ ] CHK031 - 假设"access_token 有效期约 2 小时"是否需要从后端响应中动态获取？ [Assumption, Spec §Assumptions]

---

## Summary

| Category | Items | Status |
|----------|-------|--------|
| Requirement Completeness | 6 | Pending |
| Requirement Clarity | 5 | Pending |
| Requirement Consistency | 3 | Pending |
| Acceptance Criteria Quality | 3 | Pending |
| Scenario Coverage | 4 | Pending |
| Edge Case Coverage | 4 | Pending |
| Non-Functional Requirements | 4 | Pending |
| Dependencies & Assumptions | 2 | Pending |
| **Total** | **31** | - |
