// 分销相关Mock数据
export default function(Mock, mockResponse, mockPageResponse) {
  
  // 获取分销用户信息
  Mock.mock(/\/api\/distribution\/profile/, 'get', () => {
    const profile = Mock.mock({
      id: 1,
      userId: 1,
      level: Mock.Random.integer(1, 5),
      levelName: Mock.Random.pick(['初级分销商', '中级分销商', '高级分销商', '金牌分销商', '钻石分销商']),
      totalEarnings: Mock.Random.float(1000, 50000, 2, 2),
      monthEarnings: Mock.Random.float(100, 5000, 2, 2),
      availableEarnings: Mock.Random.float(50, 2000, 2, 2),
      totalWithdrawals: Mock.Random.float(500, 30000, 2, 2),
      inviteCount: Mock.Random.integer(10, 500),
      directReferrals: Mock.Random.integer(5, 50),
      indirectReferrals: Mock.Random.integer(20, 200),
      commissionRate: Mock.Random.float(0.05, 0.15, 2, 2),
      status: Mock.Random.pick(['active', 'pending', 'suspended']),
      joinTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
      lastActiveTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://example.com/invite?code=${Mock.Random.string('upper', 8)}`,
      inviteCode: Mock.Random.string('upper', 8),
      inviteLink: `https://example.com/invite?code=${Mock.Random.string('upper', 8)}`
    })
    
    return mockResponse(profile)
  })
  
  // 获取收益统计
  Mock.mock(/\/api\/distribution\/earnings\/stats/, 'get', (options) => {
    const url = new URL('http://localhost' + options.url)
    const period = url.searchParams.get('period') || 'month' // day, week, month, year
    
    const stats = Mock.mock({
      period,
      totalEarnings: Mock.Random.float(1000, 10000, 2, 2),
      orderCommissions: Mock.Random.float(500, 5000, 2, 2),
      inviteCommissions: Mock.Random.float(200, 2000, 2, 2),
      bonusCommissions: Mock.Random.float(100, 1000, 2, 2),
      orderCount: Mock.Random.integer(10, 100),
      newInvites: Mock.Random.integer(5, 30),
      chartData: Array.from({length: 30}, (_, i) => ({
        date: Mock.Random.date('yyyy-MM-dd'),
        earnings: Mock.Random.float(10, 200, 2, 2),
        orders: Mock.Random.integer(1, 10)
      }))
    })
    
    return mockResponse(stats)
  })
  
  // 获取收益明细
  Mock.mock(/\/api\/distribution\/earnings/, 'get', (options) => {
    const url = new URL('http://localhost' + options.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const pageSize = parseInt(url.searchParams.get('pageSize')) || 10
    const type = url.searchParams.get('type') // order, invite, bonus
    
    const earnings = Mock.mock({
      'list|50': [{
        'id|+1': 1,
        'type|1': ['order', 'invite', 'bonus'],
        'amount': () => Mock.Random.float(1, 100, 2, 2),
        'orderId': () => Mock.Random.string('upper', 2) + Mock.Random.datetime('yyyyMMddHHmmss'),
        'orderAmount': () => Mock.Random.float(50, 500, 2, 2),
        'commissionRate': () => Mock.Random.float(0.05, 0.15, 2, 2),
        'inviteeName': () => Mock.Random.cname(),
        'inviteePhone': () => Mock.Random.pick(['138', '139', '186']) + '****' + Mock.Random.string('number', 4),
        'description': () => Mock.Random.pick([
          '订单分佣',
          '邀请奖励',
          '团队奖励',
          '活动奖励',
          '等级奖励'
        ]),
        'status|1': ['pending', 'completed', 'failed'],
        'createTime': () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
        'settleTime': () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
      }]
    }).list
    
    // 根据类型筛选
    let filteredEarnings = earnings
    if (type) {
      filteredEarnings = earnings.filter(earning => earning.type === type)
    }
    
    return mockPageResponse(filteredEarnings, page, pageSize)
  })
  
  // 获取邀请用户列表
  Mock.mock(/\/api\/distribution\/invites/, 'get', (options) => {
    const url = new URL('http://localhost' + options.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const pageSize = parseInt(url.searchParams.get('pageSize')) || 10
    const level = parseInt(url.searchParams.get('level')) // 1: 直接邀请, 2: 间接邀请
    
    const invites = Mock.mock({
      'list|100': [{
        'id|+1': 1,
        'userId': () => Mock.Random.integer(1000, 9999),
        'nickname': () => Mock.Random.cname(),
        'avatar': () => `https://picsum.photos/100/100?random=${Mock.Random.integer(1, 100)}`,
        'phone': () => Mock.Random.pick(['138', '139', '186']) + '****' + Mock.Random.string('number', 4),
        'level|1-2': 1,
        'totalOrders': () => Mock.Random.integer(0, 50),
        'totalAmount': () => Mock.Random.float(0, 5000, 2, 2),
        'totalEarnings': () => Mock.Random.float(0, 500, 2, 2),
        'status|1': ['active', 'inactive'],
        'inviteTime': () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
        'lastOrderTime': () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
        'subInvites|0-10': 0
      }]
    }).list
    
    // 根据层级筛选
    let filteredInvites = invites
    if (level) {
      filteredInvites = invites.filter(invite => invite.level === level)
    }
    
    return mockPageResponse(filteredInvites, page, pageSize)
  })
  
  // 申请提现
  Mock.mock(/\/api\/distribution\/withdrawals/, 'post', (options) => {
    const body = JSON.parse(options.body)
    
    const withdrawal = Mock.mock({
      id: Mock.Random.integer(1000, 9999),
      amount: body.amount,
      method: body.method, // wechat, alipay, bank
      account: body.account,
      fee: parseFloat((body.amount * 0.01).toFixed(2)), // 1% 手续费
      actualAmount: parseFloat((body.amount * 0.99).toFixed(2)),
      status: 'pending',
      applyTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
      remark: body.remark || ''
    })
    
    return mockResponse(withdrawal, '提现申请已提交，预计1-3个工作日到账')
  })
  
  // 获取提现记录
  Mock.mock(/\/api\/distribution\/withdrawals/, 'get', (options) => {
    const url = new URL('http://localhost' + options.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const pageSize = parseInt(url.searchParams.get('pageSize')) || 10
    const status = url.searchParams.get('status')
    
    const withdrawals = Mock.mock({
      'list|30': [{
        'id|+1': 1,
        'amount': () => Mock.Random.float(50, 1000, 2, 2),
        'fee': function() {
          return parseFloat((this.amount * 0.01).toFixed(2))
        },
        'actualAmount': function() {
          return parseFloat((this.amount - this.fee).toFixed(2))
        },
        'method|1': ['wechat', 'alipay', 'bank'],
        'account': () => Mock.Random.pick(['微信', '支付宝', '银行卡']) + '(****' + Mock.Random.string('number', 4) + ')',
        'status|1': ['pending', 'processing', 'completed', 'failed'],
        'applyTime': () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
        'processTime': () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
        'remark': () => Mock.Random.csentence(0, 20)
      }]
    }).list
    
    // 根据状态筛选
    let filteredWithdrawals = withdrawals
    if (status) {
      filteredWithdrawals = withdrawals.filter(withdrawal => withdrawal.status === status)
    }
    
    return mockPageResponse(filteredWithdrawals, page, pageSize)
  })
  
  // 获取分销素材
  Mock.mock(/\/api\/distribution\/materials/, 'get', (options) => {
    const url = new URL('http://localhost' + options.url)
    const type = url.searchParams.get('type') // image, video, text
    
    const materials = Mock.mock({
      'list|20': [{
        'id|+1': 1,
        'title': () => Mock.Random.ctitle(5, 15),
        'type|1': ['image', 'video', 'text'],
        'content': () => Mock.Random.cparagraph(2, 4),
        'url': () => `https://picsum.photos/800/600?random=${Mock.Random.integer(1, 100)}`,
        'thumbnail': () => `https://picsum.photos/400/300?random=${Mock.Random.integer(1, 100)}`,
        'tags': () => Mock.Random.shuffle(['热门', '推荐', '新品', '活动']).slice(0, Mock.Random.integer(1, 2)),
        'downloadCount|0-1000': 50,
        'createTime': () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
      }]
    }).list
    
    // 根据类型筛选
    let filteredMaterials = materials
    if (type) {
      filteredMaterials = materials.filter(material => material.type === type)
    }
    
    return mockResponse(filteredMaterials)
  })
  
  // 获取分销规则
  Mock.mock(/\/api\/distribution\/rules/, 'get', () => {
    const rules = {
      commissionRates: [
        { level: 1, name: '初级分销商', rate: 0.05, requirement: '邀请5人注册' },
        { level: 2, name: '中级分销商', rate: 0.08, requirement: '邀请20人注册，团队消费满5000元' },
        { level: 3, name: '高级分销商', rate: 0.10, requirement: '邀请50人注册，团队消费满20000元' },
        { level: 4, name: '金牌分销商', rate: 0.12, requirement: '邀请100人注册，团队消费满50000元' },
        { level: 5, name: '钻石分销商', rate: 0.15, requirement: '邀请200人注册，团队消费满100000元' }
      ],
      withdrawalRules: {
        minAmount: 50,
        maxAmount: 5000,
        fee: 0.01,
        workingDays: '1-3个工作日',
        methods: ['微信', '支付宝', '银行卡']
      },
      inviteRules: {
        directCommission: 0.02, // 直接邀请2%
        indirectCommission: 0.01, // 间接邀请1%
        maxLevels: 2 // 最多2级
      },
      settlement: {
        period: '每月1号结算上月佣金',
        threshold: 10 // 最低10元才结算
      }
    }
    
    return mockResponse(rules)
  })
  
  // 生成推广海报
  Mock.mock(/\/api\/distribution\/poster/, 'post', (options) => {
    const body = JSON.parse(options.body)
    
    const poster = {
      id: Mock.Random.string('lower', 16),
      type: body.type || 'default',
      url: `https://picsum.photos/750/1334?random=${Mock.Random.integer(1, 100)}`,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${body.inviteLink}`,
      createTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
    }
    
    return mockResponse(poster, '海报生成成功')
  })
}