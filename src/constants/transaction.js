/**
 * CHK011: 交易类型枚举定义
 * 完整定义所有交易类型及其显示信息
 */

// 交易类型枚举
export const TRANSACTION_TYPES = {
  // 收入类型
  RECHARGE: 'recharge',       // 充值
  REFUND: 'refund',           // 退款
  REWARD: 'reward',           // 奖励
  COMMISSION: 'commission',   // 佣金
  CASHBACK: 'cashback',       // 返现
  TRANSFER_IN: 'transfer_in', // 转入

  // 支出类型
  CONSUME: 'consume',         // 消费
  WITHDRAW: 'withdraw',       // 提现
  TRANSFER_OUT: 'transfer_out', // 转出
  DEDUCTION: 'deduction',     // 扣款
  FREEZE: 'freeze',           // 冻结

  // 其他
  ADJUSTMENT: 'adjustment',   // 调整
  OTHER: 'other'              // 其他
}

// 交易类型显示名称映射
export const TRANSACTION_TYPE_NAMES = {
  [TRANSACTION_TYPES.RECHARGE]: '充值到账',
  [TRANSACTION_TYPES.REFUND]: '订单退款',
  [TRANSACTION_TYPES.REWARD]: '系统奖励',
  [TRANSACTION_TYPES.COMMISSION]: '分销佣金',
  [TRANSACTION_TYPES.CASHBACK]: '消费返现',
  [TRANSACTION_TYPES.TRANSFER_IN]: '转入',
  [TRANSACTION_TYPES.CONSUME]: '订单消费',
  [TRANSACTION_TYPES.WITHDRAW]: '余额提现',
  [TRANSACTION_TYPES.TRANSFER_OUT]: '转出',
  [TRANSACTION_TYPES.DEDUCTION]: '系统扣款',
  [TRANSACTION_TYPES.FREEZE]: '余额冻结',
  [TRANSACTION_TYPES.ADJUSTMENT]: '余额调整',
  [TRANSACTION_TYPES.OTHER]: '其他'
}

// 收入类型列表（显示为正数，绿色）
export const INCOME_TYPES = [
  TRANSACTION_TYPES.RECHARGE,
  TRANSACTION_TYPES.REFUND,
  TRANSACTION_TYPES.REWARD,
  TRANSACTION_TYPES.COMMISSION,
  TRANSACTION_TYPES.CASHBACK,
  TRANSACTION_TYPES.TRANSFER_IN
]

// 支出类型列表（显示为负数，红色）
export const EXPENSE_TYPES = [
  TRANSACTION_TYPES.CONSUME,
  TRANSACTION_TYPES.WITHDRAW,
  TRANSACTION_TYPES.TRANSFER_OUT,
  TRANSACTION_TYPES.DEDUCTION,
  TRANSACTION_TYPES.FREEZE
]

/**
 * 获取交易类型显示名称
 * @param {string} type - 交易类型
 * @returns {string}
 */
export const getTypeName = (type) => {
  return TRANSACTION_TYPE_NAMES[type] || '其他'
}

/**
 * 判断是否为收入类型
 * @param {string} type - 交易类型
 * @returns {boolean}
 */
export const isIncomeType = (type) => {
  return INCOME_TYPES.includes(type)
}

/**
 * 判断是否为支出类型
 * @param {string} type - 交易类型
 * @returns {boolean}
 */
export const isExpenseType = (type) => {
  return EXPENSE_TYPES.includes(type)
}

export default {
  TRANSACTION_TYPES,
  TRANSACTION_TYPE_NAMES,
  INCOME_TYPES,
  EXPENSE_TYPES,
  getTypeName,
  isIncomeType,
  isExpenseType
}
