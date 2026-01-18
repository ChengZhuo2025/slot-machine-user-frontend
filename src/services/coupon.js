import { get, post } from './request'

/**
 * 优惠券API服务
 * T015: 创建优惠券API服务
 */

/**
 * 获取可领取的优惠券列表
 * @param {object} params - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.page_size=10] - 每页数量
 * @param {string} [params.applicable_scope] - 适用范围: all|rental|mall|hotel
 * @returns {Promise<{
 *   list: Array<{
 *     id: number,
 *     name: string,
 *     type: 'fixed'|'percent',
 *     value: number,
 *     min_amount: number,
 *     max_discount: number,
 *     applicable_scope: string,
 *     start_time: string,
 *     end_time: string,
 *     total_count: number,
 *     received_count: number,
 *     remain_count: number,
 *     per_user_limit: number,
 *     description: string,
 *     can_receive: boolean,
 *     received_by_user: number
 *   }>,
 *   total: number,
 *   page: number,
 *   page_size: number
 * }>}
 */
export const getAvailableCoupons = (params = {}) => {
  return get('/marketing/coupons', params)
}

/**
 * 领取优惠券
 * @param {number} couponId - 优惠券ID
 * @returns {Promise<{
 *   id: number,
 *   coupon_id: number,
 *   user_id: number,
 *   status: number,
 *   expired_at: string,
 *   received_at: string
 * }>}
 */
export const receiveCoupon = (couponId) => {
  return post(`/marketing/coupons/${couponId}/receive`)
}

/**
 * 获取我的优惠券列表
 * @param {object} params - 查询参数
 * @param {number} [params.status] - 状态: 0=未使用, 1=已使用, 2=已过期
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.page_size=10] - 每页数量
 * @returns {Promise<{
 *   list: Array<{
 *     id: number,
 *     user_id: number,
 *     coupon_id: number,
 *     coupon: object,
 *     status: number,
 *     expired_at: string,
 *     used_at: string,
 *     received_at: string
 *   }>,
 *   total: number,
 *   page: number,
 *   page_size: number
 * }>}
 */
export const getMyCoupons = (params = {}) => {
  return get('/marketing/user-coupons', params)
}

/**
 * 获取可用优惠券（下单时使用）
 * @param {object} params - 查询参数
 * @param {number} params.amount - 订单金额
 * @param {string} [params.scope] - 适用范围
 * @returns {Promise<Array>}
 */
export const getUsableCoupons = (params = {}) => {
  return get('/marketing/user-coupons/available', params)
}

/**
 * 获取优惠券数量统计
 * @returns {Promise<{
 *   total: number,
 *   unused: number,
 *   used: number,
 *   expired: number
 * }>}
 */
export const getCouponCount = () => {
  return get('/marketing/user-coupons/count')
}

/**
 * 获取限时优惠活动的优惠券
 * 用于首页展示
 * @param {number} limit - 数量限制
 * @returns {Promise<Array>}
 */
export const getLimitedTimeCoupons = (limit = 3) => {
  return get('/marketing/coupons', {
    limit,
    sort: 'end_time_asc' // 按结束时间升序，显示即将结束的
  })
}

export default {
  getAvailableCoupons,
  receiveCoupon,
  getMyCoupons,
  getUsableCoupons,
  getCouponCount,
  getLimitedTimeCoupons
}
