// 用户相关Mock数据
export default function(Mock, mockResponse, mockPageResponse) {
  
  // 用户登录
  Mock.mock(/\/api\/user\/login/, 'post', (options) => {
    const body = JSON.parse(options.body)
    const { phone, password, code } = body
    
    // 模拟登录验证
    if (phone === '13800138000' && (password === '123456' || code === '1234')) {
      return mockResponse({
        token: Mock.Random.string('lower', 32),
        user: {
          id: 1,
          phone: phone,
          nickname: '演示用户',
          avatar: 'https://picsum.photos/200/200?random=1',
          gender: 1,
          birthday: '1990-01-01',
          email: 'demo@example.com',
          realName: '张三',
          idCard: '110101199001011234',
          isRealNameAuth: true,
          registerTime: '2024-01-01 10:00:00',
          lastLoginTime: '2024-12-27 10:00:00'
        },
        member: {
          id: 1,
          userId: 1,
          level: 2,
          levelName: '银卡会员',
          points: 1580,
          balance: 299.80,
          expireTime: '2025-12-31 23:59:59',
          status: 'active',
          benefits: [
            '专享95折优惠',
            '生日特惠券',
            '积分双倍',
            '优先客服'
          ]
        }
      })
    } else {
      return mockResponse(null, '账号或密码错误', 400)
    }
  })
  
  // 发送验证码
  Mock.mock(/\/api\/user\/send-code/, 'post', (options) => {
    const body = JSON.parse(options.body)
    const { phone, type } = body
    
    return mockResponse({
      success: true,
      message: '验证码已发送',
      codeId: Mock.Random.string('lower', 16)
    })
  })
  
  // 用户注册
  Mock.mock(/\/api\/user\/register/, 'post', (options) => {
    const body = JSON.parse(options.body)
    
    return mockResponse({
      token: Mock.Random.string('lower', 32),
      user: {
        id: Mock.Random.integer(1000, 9999),
        phone: body.phone,
        nickname: '新用户' + Mock.Random.integer(1000, 9999),
        avatar: 'https://picsum.photos/200/200?random=' + Mock.Random.integer(1, 100),
        registerTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
      }
    })
  })
  
  // 获取用户信息
  Mock.mock(/\/api\/user\/info/, 'get', () => {
    return mockResponse({
      user: {
        id: 1,
        phone: '13800138000',
        nickname: '演示用户',
        avatar: 'https://picsum.photos/200/200?random=1',
        gender: 1,
        birthday: '1990-01-01',
        email: 'demo@example.com',
        realName: '张三',
        idCard: '110101199001011234',
        isRealNameAuth: true,
        registerTime: '2024-01-01 10:00:00',
        lastLoginTime: '2024-12-27 10:00:00'
      },
      member: {
        id: 1,
        userId: 1,
        level: 2,
        levelName: '银卡会员',
        points: 1580,
        balance: 299.80,
        expireTime: '2025-12-31 23:59:59',
        status: 'active',
        benefits: [
          '专享95折优惠',
          '生日特惠券',
          '积分双倍',
          '优先客服'
        ]
      }
    })
  })
  
  // 更新用户信息
  Mock.mock(/\/api\/user\/update/, 'put', (options) => {
    const body = JSON.parse(options.body)
    
    return mockResponse({
      user: {
        id: 1,
        ...body,
        updateTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
      }
    })
  })
  
  // 修改密码
  Mock.mock(/\/api\/user\/change-password/, 'put', () => {
    return mockResponse({
      success: true,
      message: '密码修改成功'
    })
  })
  
  // 实名认证
  Mock.mock(/\/api\/user\/real-name-auth/, 'post', (options) => {
    const body = JSON.parse(options.body)
    
    return mockResponse({
      authId: Mock.Random.string('lower', 16),
      status: 'pending',
      message: '实名认证申请已提交，预计1-3个工作日内完成审核'
    })
  })
  
  // 获取用户订单
  Mock.mock(/\/api\/user\/orders/, 'get', (options) => {
    const url = new URL('http://localhost' + options.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const pageSize = parseInt(url.searchParams.get('pageSize')) || 10
    const status = url.searchParams.get('status')
    
    const orders = Mock.mock({
      'list|50': [{
        'id|+1': 1,
        'orderNo': () => 'LD' + Mock.Random.datetime('yyyyMMddHHmmss') + Mock.Random.integer(100, 999),
        'type|1': ['hotel', 'product'],
        'title': () => Mock.Random.ctitle(10, 20),
        'image': () => 'https://picsum.photos/200/150?random=' + Mock.Random.integer(1, 100),
        'price': () => Mock.Random.float(99, 999, 2, 2),
        'quantity|1-3': 1,
        'status|1': ['pending', 'paid', 'used', 'completed', 'cancelled'],
        'createTime': () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
        'hotelName': () => Mock.Random.ctitle(5, 15) + '酒店',
        'roomType': () => Mock.Random.pick(['豪华大床房', '商务标准间', '情侣主题房', '家庭套房']),
        'checkInTime': () => Mock.Random.datetime('yyyy-MM-dd HH:mm'),
        'duration|1-8': 1
      }]
    }).list
    
    // 根据状态筛选
    const filteredOrders = status ? orders.filter(order => order.status === status) : orders
    
    return mockPageResponse(filteredOrders, page, pageSize)
  })
  
  // 获取优惠券列表
  Mock.mock(/\/api\/user\/coupons/, 'get', (options) => {
    const url = new URL('http://localhost' + options.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const pageSize = parseInt(url.searchParams.get('pageSize')) || 10
    const status = url.searchParams.get('status') || 'unused'
    
    const coupons = Mock.mock({
      'list|20': [{
        'id|+1': 1,
        'name': () => Mock.Random.pick(['新用户专享券', '满减优惠券', '会员专享券', '生日特惠券']),
        'type|1': ['discount', 'cash', 'gift'],
        'value|10-100': 10,
        'minAmount|100-500': 100,
        'description': () => Mock.Random.ctitle(10, 30),
        'startTime': () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
        'endTime': () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
        'status|1': ['unused', 'used', 'expired'],
        'scope|1': ['all', 'hotel', 'product'],
        'receiveTime': () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
      }]
    }).list
    
    const filteredCoupons = coupons.filter(coupon => coupon.status === status)
    
    return mockPageResponse(filteredCoupons, page, pageSize)
  })
  
  // 获取收货地址
  Mock.mock(/\/api\/user\/addresses/, 'get', () => {
    const addresses = Mock.mock({
      'list|3-5': [{
        'id|+1': 1,
        'receiverName': () => Mock.Random.cname(),
        'receiverPhone': () => Mock.Random.pick(['138', '139', '186', '188']) + Mock.Random.string('number', 8),
        'province': () => Mock.Random.province(),
        'city': () => Mock.Random.city(),
        'district': () => Mock.Random.county(),
        'address': () => Mock.Random.ctitle(10, 30),
        'isDefault|1': [true, false],
        'tag|1': ['家', '公司', '学校', '其他']
      }]
    }).list
    
    return mockResponse(addresses)
  })
  
  // 新增收货地址
  Mock.mock(/\/api\/user\/addresses/, 'post', (options) => {
    const body = JSON.parse(options.body)
    
    return mockResponse({
      id: Mock.Random.integer(100, 999),
      ...body,
      createTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
    })
  })
  
  // 更新收货地址
  Mock.mock(/\/api\/user\/addresses\/\d+/, 'put', (options) => {
    const body = JSON.parse(options.body)
    
    return mockResponse({
      ...body,
      updateTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
    })
  })
  
  // 删除收货地址
  Mock.mock(/\/api\/user\/addresses\/\d+/, 'delete', () => {
    return mockResponse({
      success: true,
      message: '地址删除成功'
    })
  })

  // 获取签到记录
  Mock.mock(/\/api\/user\/check-in\/records/, 'get', (options) => {
    const url = new URL('http://localhost' + options.url)
    const year = parseInt(url.searchParams.get('year')) || new Date().getFullYear()
    const month = parseInt(url.searchParams.get('month')) || new Date().getMonth() + 1

    // 生成当月签到记录
    const daysInMonth = new Date(year, month, 0).getDate()
    const checkedDays = []
    for (let i = 1; i <= daysInMonth; i++) {
      if (Math.random() > 0.5) {
        checkedDays.push(i)
      }
    }

    return mockResponse({
      year,
      month,
      checkedDays,
      continuousDays: Mock.Random.integer(1, 15),
      totalDays: checkedDays.length,
      totalPoints: checkedDays.length * 10
    })
  })

  // 执行签到
  Mock.mock(/\/api\/user\/check-in/, 'post', () => {
    return mockResponse({
      success: true,
      points: Mock.Random.integer(10, 50),
      continuousDays: Mock.Random.integer(1, 30),
      message: '签到成功,获得积分奖励'
    })
  })

  // 获取余额明细
  Mock.mock(/\/api\/user\/balance\/records/, 'get', (options) => {
    const url = new URL('http://localhost' + options.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const pageSize = parseInt(url.searchParams.get('pageSize')) || 20

    const records = Mock.mock({
      'list|100': [{
        'id|+1': 1,
        'type|1': ['recharge', 'withdraw', 'consume', 'refund', 'reward'],
        'amount': () => Mock.Random.float(1, 500, 2, 2),
        'balance': () => Mock.Random.float(100, 5000, 2, 2),
        'description': () => Mock.Random.pick([
          '充值到账',
          '提现',
          '订单消费',
          '订单退款',
          '系统奖励',
          '会员充值',
          '购买商品',
          '酒店预订'
        ]),
        'createTime': () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
        'orderNo': () => 'TR' + Mock.Random.datetime('yyyyMMddHHmmss') + Mock.Random.integer(100, 999)
      }]
    }).list

    return mockPageResponse(records, page, pageSize)
  })

  // 申请提现
  Mock.mock(/\/api\/user\/withdraw\/apply/, 'post', (options) => {
    const body = JSON.parse(options.body)

    return mockResponse({
      withdrawId: Mock.Random.string('lower', 16),
      amount: body.amount,
      status: 'pending',
      message: '提现申请已提交，预计1-3个工作日到账'
    })
  })

  // 获取积分明细
  Mock.mock(/\/api\/user\/points\/records/, 'get', (options) => {
    const url = new URL('http://localhost' + options.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const pageSize = parseInt(url.searchParams.get('pageSize')) || 20

    const records = Mock.mock({
      'list|100': [{
        'id|+1': 1,
        'type|1': ['earn', 'consume', 'expire'],
        'points': () => Mock.Random.integer(10, 500),
        'balance': () => Mock.Random.integer(100, 10000),
        'description': () => Mock.Random.pick([
          '签到奖励',
          '消费获得',
          '积分兑换',
          '积分过期',
          '邀请好友',
          '完成任务',
          '订单评价',
          '生日礼物'
        ]),
        'createTime': () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
      }]
    }).list

    return mockPageResponse(records, page, pageSize)
  })

  // 获取积分商品
  Mock.mock(/\/api\/user\/points\/products/, 'get', (options) => {
    const url = new URL('http://localhost' + options.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const pageSize = parseInt(url.searchParams.get('pageSize')) || 10

    const products = Mock.mock({
      'list|30': [{
        'id|+1': 1,
        'name': () => Mock.Random.ctitle(5, 15),
        'image': () => 'https://picsum.photos/300/300?random=' + Mock.Random.integer(1, 100),
        'points|100-5000': 100,
        'stock|0-100': 50,
        'description': () => Mock.Random.ctitle(20, 50),
        'type|1': ['coupon', 'product', 'service']
      }]
    }).list

    return mockPageResponse(products, page, pageSize)
  })

  // 积分兑换
  Mock.mock(/\/api\/user\/points\/exchange/, 'post', (options) => {
    const body = JSON.parse(options.body)

    return mockResponse({
      success: true,
      exchangeId: Mock.Random.string('lower', 16),
      message: '兑换成功'
    })
  })

  // 获取收藏列表
  Mock.mock(/\/api\/user\/favorites/, 'get', (options) => {
    const url = new URL('http://localhost' + options.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const pageSize = parseInt(url.searchParams.get('pageSize')) || 10
    const type = url.searchParams.get('type') || 'all'

    const favorites = Mock.mock({
      'list|50': [{
        'id|+1': 1,
        'type|1': ['hotel', 'product'],
        'itemId|+1': 100,
        'title': () => Mock.Random.ctitle(10, 20),
        'image': () => 'https://picsum.photos/300/200?random=' + Mock.Random.integer(1, 100),
        'price': () => Mock.Random.float(99, 999, 2, 2),
        'description': () => Mock.Random.ctitle(20, 50),
        'createTime': () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
      }]
    }).list

    const filtered = type === 'all' ? favorites : favorites.filter(item => item.type === type)

    return mockPageResponse(filtered, page, pageSize)
  })

  // 添加收藏
  Mock.mock(/\/api\/user\/favorites/, 'post', (options) => {
    const body = JSON.parse(options.body)

    return mockResponse({
      id: Mock.Random.integer(100, 999),
      ...body,
      createTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
    })
  })

  // 取消收藏
  Mock.mock(/\/api\/user\/favorites\/\d+/, 'delete', () => {
    return mockResponse({
      success: true,
      message: '取消收藏成功'
    })
  })

  // 获取消息列表
  Mock.mock(/\/api\/user\/messages/, 'get', (options) => {
    const url = new URL('http://localhost' + options.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const pageSize = parseInt(url.searchParams.get('pageSize')) || 20
    const type = url.searchParams.get('type') || 'all'

    const messages = Mock.mock({
      'list|50': [{
        'id|+1': 1,
        'type|1': ['system', 'order', 'activity', 'service'],
        'title': () => Mock.Random.ctitle(10, 20),
        'content': () => Mock.Random.cparagraph(2, 5),
        'isRead|1': [true, false],
        'createTime': () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
      }]
    }).list

    const filtered = type === 'all' ? messages : messages.filter(item => item.type === type)

    return mockPageResponse(filtered, page, pageSize)
  })

  // 标记消息已读
  Mock.mock(/\/api\/user\/messages\/\d+\/read/, 'put', () => {
    return mockResponse({
      success: true
    })
  })

  // 获取会员套餐
  Mock.mock(/\/api\/user\/member\/packages/, 'get', () => {
    const packages = Mock.mock({
      'list|4': [{
        'id|+1': 1,
        'name': () => Mock.Random.pick(['月度会员', '季度会员', '年度会员', '终身会员']),
        'duration|1': [1, 3, 12, 999],
        'price': () => Mock.Random.float(29.9, 999, 2, 2),
        'originalPrice': () => Mock.Random.float(50, 1999, 2, 2),
        'benefits': () => Mock.Random.pick([
          ['95折优惠', '积分双倍', '专属客服'],
          ['9折优惠', '积分三倍', '专属客服', '生日礼物'],
          ['85折优惠', '积分五倍', '专属客服', '生日礼物', '免费配送'],
          ['8折优惠', '积分十倍', '专属客服', '生日礼物', '免费配送', '优先体验']
        ]),
        'isRecommended|1': [true, false]
      }]
    }).list

    return mockResponse(packages)
  })

  // 购买会员
  Mock.mock(/\/api\/user\/member\/purchase/, 'post', (options) => {
    const body = JSON.parse(options.body)

    return mockResponse({
      orderId: Mock.Random.string('lower', 16),
      message: '会员购买成功'
    })
  })

  // 获取意见反馈列表
  Mock.mock(/\/api\/user\/feedback\/list/, 'get', (options) => {
    const url = new URL('http://localhost' + options.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const pageSize = parseInt(url.searchParams.get('pageSize')) || 10

    const feedbacks = Mock.mock({
      'list|20': [{
        'id|+1': 1,
        'type|1': ['bug', 'suggestion', 'complaint', 'other'],
        'content': () => Mock.Random.cparagraph(3, 8),
        'images': () => Mock.Random.range(0, 3).map(() => 'https://picsum.photos/400/300?random=' + Mock.Random.integer(1, 100)),
        'status|1': ['pending', 'processing', 'replied', 'closed'],
        'reply': () => Mock.Random.boolean() ? Mock.Random.cparagraph(2, 5) : null,
        'createTime': () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
        'replyTime': () => Mock.Random.boolean() ? Mock.Random.datetime('yyyy-MM-dd HH:mm:ss') : null
      }]
    }).list

    return mockPageResponse(feedbacks, page, pageSize)
  })

  // 提交意见反馈
  Mock.mock(/\/api\/user\/feedback\/submit/, 'post', (options) => {
    const body = JSON.parse(options.body)

    return mockResponse({
      id: Mock.Random.integer(100, 999),
      message: '提交成功,我们会尽快处理您的反馈'
    })
  })

  // 获取帮助中心分类
  Mock.mock(/\/api\/help\/categories/, 'get', () => {
    return mockResponse([
      { id: 1, name: '新手指南', icon: 'help' },
      { id: 2, name: '账户问题', icon: 'user' },
      { id: 3, name: '订单相关', icon: 'list' },
      { id: 4, name: '支付问题', icon: 'credit-card' },
      { id: 5, name: '会员权益', icon: 'crown' },
      { id: 6, name: '其他问题', icon: 'more' }
    ])
  })

  // 获取帮助文章列表
  Mock.mock(/\/api\/help\/articles/, 'get', (options) => {
    const url = new URL('http://localhost' + options.url)
    const categoryId = parseInt(url.searchParams.get('categoryId'))

    const articles = Mock.mock({
      'list|10-15': [{
        'id|+1': 1,
        categoryId: categoryId || Mock.Random.integer(1, 6),
        'title': () => Mock.Random.ctitle(10, 30),
        'content': () => Mock.Random.cparagraph(10, 20),
        'views|100-10000': 100,
        'helpful|50-500': 50,
        'createTime': () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
      }]
    }).list

    return mockResponse(articles)
  })

  // 获取客服信息
  Mock.mock(/\/api\/customer-service\/info/, 'get', () => {
    return mockResponse({
      hotline: '400-888-9999',
      serviceTime: '7x24小时',
      email: 'service@lovedumeinv.com',
      wechat: 'lovedumeinv_service',
      qq: '123456789',
      workingHours: '周一至周日 9:00-22:00',
      address: '浙江省杭州市西湖区文三路259号'
    })
  })

  // 获取关于我们信息
  Mock.mock(/\/api\/about\/info/, 'get', () => {
    return mockResponse({
      companyName: '爱上杜美人科技有限公司',
      version: '1.0.0',
      releaseDate: '2024-12-27',
      description: '爱上杜美人是一个创新型主题酒店服务平台,通过智能硬件技术与传统酒店业相结合,为用户提供个性化的主题房间体验服务。',
      address: '浙江省杭州市西湖区文三路259号',
      phone: '400-888-9999',
      email: 'contact@lovedumeinv.com',
      icp: '浙ICP备2024001234号-1',
      copyright: '© 2024 爱上杜美人科技有限公司 版权所有'
    })
  })

  // 获取通知设置
  Mock.mock(/\/api\/user\/notification\/settings/, 'get', () => {
    return mockResponse({
      enableNotification: true,
      systemNotification: true,
      orderNotification: true,
      activityNotification: true,
      inAppNotification: true,
      pushNotification: true,
      soundNotification: true,
      vibrationNotification: false,
      enableDND: false,
      dndStartTime: '22:00',
      dndEndTime: '08:00'
    })
  })

  // 更新通知设置
  Mock.mock(/\/api\/user\/notification\/settings/, 'put', (options) => {
    const body = JSON.parse(options.body)

    return mockResponse({
      success: true,
      message: '设置已保存',
      settings: body
    })
  })

  // 获取账户安全信息
  Mock.mock(/\/api\/user\/security\/info/, 'get', () => {
    return mockResponse({
      phone: '138****8888',
      email: 'user@example.com',
      wechat: '已绑定',
      biometricEnabled: true,
      hasPassword: true,
      phoneVerified: true,
      emailVerified: true
    })
  })

  // 获取登录历史
  Mock.mock(/\/api\/user\/security\/login-history/, 'get', (options) => {
    const url = new URL('http://localhost' + options.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const pageSize = parseInt(url.searchParams.get('pageSize')) || 20

    const history = Mock.mock({
      'list|30': [{
        'id|+1': 1,
        'device': () => Mock.Random.pick(['iPhone 15 Pro', 'Huawei Mate 60', 'iPad Air', 'Xiaomi 14', 'Samsung S24']),
        'os': () => Mock.Random.pick(['iOS 17.2', 'Android 14', 'HarmonyOS 4.0']),
        'location': () => Mock.Random.city() + Mock.Random.county(),
        'ip': () => Mock.Random.ip(),
        'status|1': ['success', 'failed'],
        'loginTime': () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
      }]
    }).list

    return mockPageResponse(history, page, pageSize)
  })

  // 获取设备列表
  Mock.mock(/\/api\/user\/security\/devices/, 'get', () => {
    const devices = Mock.mock({
      'list|3-5': [{
        'id|+1': 1,
        'deviceName': () => Mock.Random.pick(['iPhone 15 Pro', 'Huawei Mate 60', 'iPad Air', 'Xiaomi 14']),
        'deviceType|1': ['mobile', 'tablet', 'pc'],
        'os': () => Mock.Random.pick(['iOS 17.2', 'Android 14', 'HarmonyOS 4.0']),
        'location': () => Mock.Random.city(),
        'lastLoginTime': () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
        'isCurrent|1': [true, false]
      }]
    }).list

    return mockResponse(devices)
  })

  // 移除设备
  Mock.mock(/\/api\/user\/security\/devices\/\d+/, 'delete', () => {
    return mockResponse({
      success: true,
      message: '设备已移除'
    })
  })

  // 获取隐私设置
  Mock.mock(/\/api\/user\/privacy\/settings/, 'get', () => {
    return mockResponse({
      showPhone: false,
      showEmail: false,
      allowSearch: true,
      allowRecommend: true,
      collectUsageData: true,
      personalizedAds: false
    })
  })

  // 更新隐私设置
  Mock.mock(/\/api\/user\/privacy\/settings/, 'put', (options) => {
    const body = JSON.parse(options.body)

    return mockResponse({
      success: true,
      message: '隐私设置已更新',
      settings: body
    })
  })
}