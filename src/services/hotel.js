import { get, post } from './request'

// 酒店相关API

// 获取酒店列表
export const getHotelList = (params = {}) => {
  return get('/hotels', params)
}

// 获取酒店详情
export const getHotelDetail = (id) => {
  return get(`/hotels/${id}`)
}

/**
 * 获取推荐酒店列表
 *
 * @param {object} params - 查询参数
 * @param {number} [params.limit=10] - 返回数量限制
 * @returns {Promise<Array<{
 *   id: number,
 *   name: string,
 *   star_rating: number,
 *   city: string,
 *   district: string,
 *   address: string,
 *   images: object,
 *   recommend_score: number,
 *   min_price: number
 * }>>} 推荐酒店列表
 */
export const getRecommendHotels = (params = {}) => {
  return get('/hotels/recommended', params)
}

/**
 * 获取附近酒店
 *
 * 使用酒店列表接口的经纬度参数进行附近搜索
 *
 * @param {object} params - 查询参数
 * @param {number} params.longitude - 经度（必需）
 * @param {number} params.latitude - 纬度（必需）
 * @param {number} [params.radius_km=10] - 搜索半径（公里），默认10
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.page_size=10] - 每页数量
 * @returns {Promise<Array>}
 */
export const getNearbyHotels = (params = {}) => {
  const { longitude, latitude, radius_km = 10, ...rest } = params
  if (!longitude || !latitude) {
    console.warn('getNearbyHotels: 需要提供 longitude 和 latitude 参数')
    return Promise.resolve({ code: 400, data: [], message: '缺少经纬度参数' })
  }
  return get('/hotels', { longitude, latitude, radius_km, ...rest })
}

// 搜索酒店
// 使用列表接口的搜索参数
export const searchHotels = (keyword, params = {}) => {
  return get('/hotels', { keyword, ...params })
}

// 获取酒店房型
export const getHotelRooms = (hotelId) => {
  return get(`/hotels/${hotelId}/rooms`)
}

// 获取房间详情
export const getRoomDetail = (roomId) => {
  return get(`/rooms/${roomId}`)
}

/**
 * 获取全站热门房型列表
 *
 * @param {object} params - 查询参数
 * @param {number} [params.limit=10] - 返回数量限制
 * @returns {Promise<Array<{
 *   id: number,
 *   room_no: string,
 *   room_type: string,
 *   hotel_id: number,
 *   hotel_name: string,
 *   images: object,
 *   hourly_price: number,
 *   daily_price: number,
 *   booking_count: number,
 *   average_rating: number,
 *   hot_score: number
 * }>>} 热门房型列表
 */
export const getHotRooms = (params = {}) => {
  return get('/rooms/hot', params)
}

/**
 * 获取酒店内的热门房型列表
 *
 * @param {number} hotelId - 酒店ID
 * @param {object} params - 查询参数
 * @param {number} [params.limit=10] - 返回数量限制
 * @returns {Promise<Array<{
 *   id: number,
 *   room_no: string,
 *   room_type: string,
 *   images: object,
 *   hourly_price: number,
 *   daily_price: number,
 *   booking_count: number,
 *   average_rating: number,
 *   hot_score: number
 * }>>} 酒店内热门房型列表
 */
export const getHotelHotRooms = (hotelId, params = {}) => {
  return get(`/hotels/${hotelId}/rooms/hot`, params)
}

// 检查房间可用性
export const checkRoomAvailability = (roomId, params = {}) => {
  return get(`/rooms/${roomId}/availability`, params)
}

// 预订房间
export const bookRoom = (data) => {
  return post('/bookings', data)
}

// 获取预订列表
export const getBookingList = (params = {}) => {
  return get('/bookings', params)
}

// 获取预订详情
export const getBookingDetail = (id) => {
  return get(`/bookings/${id}`)
}

// 取消预订
export const cancelBooking = (id, reason) => {
  return post(`/bookings/${id}/cancel`, { reason })
}