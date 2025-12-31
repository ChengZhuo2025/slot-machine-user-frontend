import { get, post, put, del } from './request'

// 商城相关API

// 获取商品分类
export const getProductCategories = () => {
  return get('/products/categories')
}

// 获取商品列表
export const getProductList = (params = {}) => {
  return get('/products', params)
}

// 获取商品详情
export const getProductDetail = (id) => {
  return get(`/products/${id}`)
}

// 获取精选商品
export const getSelectedProducts = (params = {}) => {
  return get('/products/selected', params)
}

// 获取热门商品
export const getHotProducts = (params = {}) => {
  return get('/products/hot', params)
}

// 搜索商品
export const searchProducts = (keyword, params = {}) => {
  return get('/products/search', { keyword, ...params })
}

// 添加到购物车
export const addToCart = (data) => {
  return post('/cart/add', data)
}

// 获取购物车
export const getCart = () => {
  return get('/cart')
}

// 更新购物车商品数量
export const updateCartItem = (id, quantity) => {
  return put(`/cart/${id}`, { quantity })
}

// 删除购物车商品
export const removeCartItem = (id) => {
  return del(`/cart/${id}`)
}

// 清空购物车
export const clearCart = () => {
  return del('/cart')
}

// 创建订单
export const createOrder = (data) => {
  return post('/orders', data)
}

// 获取订单列表
export const getOrderList = (params = {}) => {
  return get('/orders', params)
}

// 获取订单详情
export const getOrderDetail = (id) => {
  return get(`/orders/${id}`)
}

// 取消订单
export const cancelOrder = (id, reason) => {
  return post(`/orders/${id}/cancel`, { reason })
}

// 确认收货
export const confirmOrder = (id) => {
  return post(`/orders/${id}/confirm`)
}

// 申请退款
export const applyRefund = (id, data) => {
  return post(`/orders/${id}/refund`, data)
}

// 商品评价
export const reviewProduct = (orderId, data) => {
  return post(`/orders/${orderId}/review`, data)
}

// 获取商品评价
export const getProductReviews = (productId, params = {}) => {
  return get(`/products/${productId}/reviews`, params)
}