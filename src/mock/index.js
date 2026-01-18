import Mock from 'mockjs'
import userMock from './user'
import hotelMock from './hotel'
import mallMock from './mall'
import distributionMock from './distribution'

// T720: 功能标志 - 设置为 false 禁用 mock 数据，使用真实 API
const USE_MOCK = false

// 设置Mock延迟时间，模拟真实网络请求
Mock.setup({
  timeout: '200-800'
})

// 通用响应格式
const mockResponse = (data, message = '操作成功', code = 200) => {
  return {
    code,
    message,
    data,
    timestamp: Date.now()
  }
}

// 分页响应格式
const mockPageResponse = (list, page = 1, pageSize = 10, total = null) => {
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const pageData = list.slice(startIndex, endIndex)
  
  return mockResponse({
    list: pageData,
    pagination: {
      current: page,
      pageSize,
      total: total || list.length,
      pages: Math.ceil((total || list.length) / pageSize)
    }
  })
}

// 导入并注册所有Mock接口
const setupMock = () => {
  // T720: 检查功能标志，如果禁用则跳过 mock 初始化
  if (!USE_MOCK) {
    console.log('ℹ️ Mock数据服务已禁用，使用真实API')
    return
  }

  console.log('🔧 正在初始化Mock数据服务...')

  // 注册用户相关接口
  userMock(Mock, mockResponse, mockPageResponse)

  // 注册酒店相关接口
  hotelMock(Mock, mockResponse, mockPageResponse)

  // 注册商城相关接口
  mallMock(Mock, mockResponse, mockPageResponse)

  // 注册分销相关接口
  distributionMock(Mock, mockResponse, mockPageResponse)

  console.log('✅ Mock数据服务初始化完成')
}

// 根据 USE_MOCK 标志决定是否启用 Mock
setupMock()

export { Mock, mockResponse, mockPageResponse }
export default setupMock