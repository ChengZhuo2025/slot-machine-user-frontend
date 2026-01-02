import { get, post, put } from './request'

// 用户相关API

// 用户登录
export const login = (data) => {
  return post('/user/login', data)
}

// 用户注册
export const register = (data) => {
  return post('/auth/register', data)
}

// 退出登录
export const logout = () => {
  return post('/auth/logout')
}

// 获取用户信息
export const getUserInfo = () => {
  return get('/user/info')
}

// 更新用户信息
export const updateUserInfo = (data) => {
  return put('/user/info', data)
}

// 修改密码
export const changePassword = (data) => {
  return put('/user/password', data)
}

// 获取会员信息
export const getMemberInfo = () => {
  return get('/user/member')
}

// 开通会员
export const openMembership = (data) => {
  return post('/user/member', data)
}

// 实名认证
export const verifyIdentity = (data) => {
  return post('/user/verify', data)
}

// 绑定手机号
export const bindPhone = (data) => {
  return post('/user/bind-phone', data)
}

// 发送验证码
export const sendSmsCode = (phone) => {
  return post('/user/send-code', { phone })
}

// 上传头像
export const uploadAvatar = (filePath) => {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: 'http://localhost:3000/api/user/avatar',
      filePath,
      name: 'avatar',
      header: {
        'Authorization': `Bearer ${uni.getStorageSync('token')}`
      },
      success: (response) => {
        const data = JSON.parse(response.data)
        if (data.code === 0) {
          resolve(data.data)
        } else {
          uni.showToast({
            title: data.message || '上传失败',
            icon: 'none'
          })
          reject(new Error(data.message || '上传失败'))
        }
      },
      fail: (error) => {
        uni.showToast({
          title: '上传失败',
          icon: 'none'
        })
        reject(error)
      }
    })
  })
}