import { get } from './request'

/**
 * Banner API服务
 * T009: 创建Banner API服务
 */

/**
 * 获取轮播Banner列表
 * @param {object} params - 查询参数
 * @param {string} [params.position='home'] - 广告位置: home|mall|hotel
 * @param {number} [params.limit=5] - 返回数量限制
 * @returns {Promise<Array<{
 *   id: number,
 *   title: string,
 *   image: string,
 *   link_type: string,
 *   link_value: string,
 *   position: string
 * }>>}
 */
export const getBanners = (params = {}) => {
  const { position = 'home', limit = 5 } = params
  return get('/banners', { position, limit })
}

/**
 * 获取首页Banner
 * @param {number} limit - 数量限制
 * @returns {Promise<Array>}
 */
export const getHomeBanners = (limit = 5) => {
  return getBanners({ position: 'home', limit })
}

/**
 * 获取商城Banner
 * @param {number} limit - 数量限制
 * @returns {Promise<Array>}
 */
export const getMallBanners = (limit = 5) => {
  return getBanners({ position: 'mall', limit })
}

/**
 * 获取酒店页Banner
 * @param {number} limit - 数量限制
 * @returns {Promise<Array>}
 */
export const getHotelBanners = (limit = 5) => {
  return getBanners({ position: 'hotel', limit })
}

export default {
  getBanners,
  getHomeBanners,
  getMallBanners,
  getHotelBanners
}
