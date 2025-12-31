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

// 获取推荐酒店
export const getRecommendHotels = (params = {}) => {
  return get('/hotels/recommend', params)
}

// 获取附近酒店
export const getNearbyHotels = (params = {}) => {
  return get('/hotels/nearby', params)
}

// 搜索酒店
export const searchHotels = (keyword, params = {}) => {
  return get('/hotels/search', { keyword, ...params })
}

// 获取酒店房型
export const getHotelRooms = (hotelId) => {
  return get(`/hotels/${hotelId}/rooms`)
}

// 获取房间详情
export const getRoomDetail = (roomId) => {
  return get(`/rooms/${roomId}`)
}

// 获取热门房型
export const getHotRooms = (params = {}) => {
  return get('/rooms/hot', params)
}

// 检查房间可用性
export const checkRoomAvailability = (roomId, data) => {
  return post(`/rooms/${roomId}/check`, data)
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