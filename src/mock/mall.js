// 商城相关Mock数据
export default function(Mock, mockResponse, mockPageResponse) {
  
  // 获取商品分类
  Mock.mock(/\/api\/mall\/categories/, 'get', () => {
    const categories = [
      { id: 1, name: '全部', icon: 'all' },
      { id: 2, name: '酒店用品', icon: 'hotel' },
      { id: 3, name: '个护用品', icon: 'care' },
      { id: 4, name: '服饰配饰', icon: 'clothing' },
      { id: 5, name: '数码产品', icon: 'digital' },
      { id: 6, name: '其他商品', icon: 'other' }
    ]
    
    return mockResponse(categories)
  })

  // 固定的商品数据（与商城首页保持一致）
  const fixedProducts = {
    1: {
      id: 1,
      name: '五星级酒店毛巾套装',
      price: 89.9,
      memberPrice: 69.9,
      image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good07.jpg',
      images: ['https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good07.jpg'],
      stock: 100,
      sales: 1200,
      rating: 4.8,
      specs: [
        {
          name: '颜色',
          options: [
            { name: '白色', value: 'white', price: 0, stock: 50 },
            { name: '米色', value: 'beige', price: 0, stock: 50 }
          ]
        },
        {
          name: '套装',
          options: [
            { name: '3件套', value: '3pcs', price: 0, stock: 60 },
            { name: '5件套', value: '5pcs', price: 20, stock: 40 }
          ]
        }
      ]
    },
    9: {
      id: 9,
      name: '杜蕾斯至薄装安全套',
      price: 89.9,
      memberPrice: 69.9,
      image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good01.jpg',
      images: ['https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good01.jpg'],
      stock: 500,
      sales: 3200,
      rating: 4.9,
      specs: [
        {
          name: '数量',
          options: [
            { name: '12只装', value: '12pcs', price: 0, stock: 250 },
            { name: '24只装', value: '24pcs', price: 30, stock: 250 }
          ]
        }
      ]
    },
    10: {
      id: 10,
      name: 'KY私密润滑剂50ml',
      price: 129.9,
      memberPrice: 99.9,
      image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good02.jpg',
      images: ['https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good02.jpg'],
      stock: 350,
      sales: 2800,
      rating: 4.7,
      specs: [
        {
          name: '类型',
          options: [
            { name: '水溶性', value: 'water', price: 0, stock: 180 },
            { name: '硅基', value: 'silicon', price: 10, stock: 170 }
          ]
        }
      ]
    },
    11: {
      id: 11,
      name: '维多利亚蕾丝情趣内衣',
      price: 299.9,
      memberPrice: 239.9,
      image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good03.jpg',
      images: ['https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good03.jpg'],
      stock: 150,
      sales: 1850,
      rating: 4.8,
      specs: [
        {
          name: '颜色',
          options: [
            { name: '黑色', value: 'black', price: 0, stock: 50 },
            { name: '红色', value: 'red', price: 0, stock: 50 },
            { name: '白色', value: 'white', price: 0, stock: 50 }
          ]
        },
        {
          name: '尺码',
          options: [
            { name: 'S', value: 's', price: 0, stock: 50 },
            { name: 'M', value: 'm', price: 0, stock: 60 },
            { name: 'L', value: 'l', price: 0, stock: 40 }
          ]
        }
      ]
    },
    12: {
      id: 12,
      name: '伊珞EROCOME震动棒',
      price: 169.9,
      memberPrice: 139.9,
      image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good06.jpg',
      images: ['https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good06.jpg'],
      stock: 100,
      sales: 1200,
      rating: 4.6,
      specs: [
        {
          name: '颜色',
          options: [
            { name: '粉色', value: 'pink', price: 0, stock: 50 },
            { name: '紫色', value: 'purple', price: 0, stock: 50 }
          ]
        }
      ]
    },
    13: {
      id: 13,
      name: 'Fairvital德国玛卡胶囊',
      price: 210.9,
      memberPrice: 159.9,
      image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good04.jpg',
      images: ['https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good04.jpg'],
      stock: 200,
      sales: 1580,
      rating: 4.8,
      specs: [
        {
          name: '规格',
          options: [
            { name: '60粒装', value: '60pcs', price: 0, stock: 100 },
            { name: '120粒装', value: '120pcs', price: 50, stock: 100 }
          ]
        }
      ]
    },
    17: {
      id: 17,
      name: '简禾酒精杀菌消毒湿巾',
      price: 19.9,
      memberPrice: 16.9,
      image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good05.jpg',
      images: ['https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good05.jpg'],
      stock: 500,
      sales: 3800,
      rating: 4.5,
      specs: [
        {
          name: '规格',
          options: [
            { name: '80片装', value: '80pcs', price: 0, stock: 250 },
            { name: '120片装', value: '120pcs', price: 10, stock: 250 }
          ]
        }
      ]
    }
  }

  // 获取商品详情（必须在商品列表之前注册，避免被商品列表接口拦截）
  Mock.mock(/\/api\/mall\/products\/\d+$/, 'get', (options) => {
    const productId = parseInt(options.url.match(/\/api\/mall\/products\/(\d+)/)[1])

    // 如果是首页商品，返回固定数据
    if (fixedProducts[productId]) {
      const fixedProduct = fixedProducts[productId]
      return mockResponse({
        ...fixedProduct,
        subtitle: `${fixedProduct.name} - 优质正品保证`,
        originalPrice: fixedProduct.price * 1.5,
        reviewCount: Math.floor(fixedProduct.sales * 0.3),
        categoryId: productId <= 4 ? 2 : (productId <= 8 ? 3 : (productId <= 12 ? 4 : (productId <= 16 ? 5 : 6))),
        brand: fixedProduct.name.split(/[、-]/)[0],
        description: `${fixedProduct.name}，精选优质材料，品质保证。适合日常使用，性价比超高。`,
        detailImages: Array.from({length: 3}, (_, i) => fixedProduct.image),
        params: [
          { label: '品牌', value: fixedProduct.name.split(/[、-]/)[0] },
          { label: '产地', value: '中国' },
          { label: '保质期', value: '3年' }
        ],
        shipping: {
          isFree: fixedProduct.price >= 99,
          fee: fixedProduct.price >= 99 ? 0 : 10,
          time: '1-2天',
          policy: '支持7天无理由退换货',
          from: '浙江杭州'
        },
        service: {
          warranty: '30天',
          returns: '支持退换货',
          description: '正品保证，假一赔十'
        }
      })
    }

    // 其他商品返回随机数据
    const product = Mock.mock({
      id: parseInt(productId),
      name: Mock.Random.ctitle(8, 20),
      subtitle: Mock.Random.ctitle(15, 40),
      // 商品轮播图
      images: Array.from({length: 8}, (_, i) => 
        `https://picsum.photos/800/800?random=${Mock.Random.integer(1, 100)}`
      ),
      // 商品详情图
      detailImages: Array.from({length: 6}, (_, i) => 
        `https://picsum.photos/750/1000?random=${Mock.Random.integer(100, 200)}`
      ),
      price: Mock.Random.float(19.9, 299.9, 1, 2),
      originalPrice: function() {
        return parseFloat((this.price * Mock.Random.float(1.2, 2.5, 1, 2)).toFixed(2))
      },
      memberPrice: function() {
        return parseFloat((this.price * Mock.Random.float(0.8, 0.9, 1, 2)).toFixed(2))
      },
      stock: Mock.Random.integer(10, 500),
      sales: Mock.Random.integer(100, 5000),
      rating: Mock.Random.float(4.2, 5.0, 1, 1),
      reviewCount: Mock.Random.integer(50, 1000),
      categoryId: Mock.Random.integer(2, 6),
      brand: Mock.Random.ctitle(3, 8),
      description: Mock.Random.cparagraph(3, 6),
      // 商品规格（支持多规格组合）
      specs: [
        {
          name: '颜色',
          options: [
            { 
              name: '红色', 
              value: 'red', 
              image: `https://picsum.photos/100/100?random=${Mock.Random.integer(1, 50)}`,
              price: 0, 
              stock: Mock.Random.integer(10, 100) 
            },
            { 
              name: '蓝色', 
              value: 'blue', 
              image: `https://picsum.photos/100/100?random=${Mock.Random.integer(51, 100)}`,
              price: 10, 
              stock: Mock.Random.integer(10, 100) 
            },
            { 
              name: '白色', 
              value: 'white', 
              image: `https://picsum.photos/100/100?random=${Mock.Random.integer(101, 150)}`,
              price: 0, 
              stock: Mock.Random.integer(10, 100) 
            },
            { 
              name: '黑色', 
              value: 'black', 
              image: `https://picsum.photos/100/100?random=${Mock.Random.integer(151, 200)}`,
              price: 5, 
              stock: Mock.Random.integer(10, 100) 
            }
          ]
        },
        {
          name: '尺寸',
          options: [
            { name: 'S', value: 's', price: 0, stock: Mock.Random.integer(5, 50) },
            { name: 'M', value: 'm', price: 0, stock: Mock.Random.integer(5, 50) },
            { name: 'L', value: 'l', price: 10, stock: Mock.Random.integer(5, 50) },
            { name: 'XL', value: 'xl', price: 20, stock: Mock.Random.integer(5, 50) }
          ]
        }
      ],
      // 商品参数
      params: [
        { label: '品牌', value: Mock.Random.ctitle(3, 8) },
        { label: '材质', value: Mock.Random.pick(['纯棉', '涤纶', '真丝', '羊毛', '混纺']) },
        { label: '产地', value: Mock.Random.pick(['中国', '日本', '韩国', '美国', '欧洲']) },
        { label: '重量', value: `${Mock.Random.integer(100, 2000)}g` },
        { label: '尺寸', value: `${Mock.Random.integer(10, 50)}cm × ${Mock.Random.integer(10, 50)}cm` },
        { label: '保质期', value: Mock.Random.pick(['3年', '5年', '长期', '2年']) },
        { label: '适用人群', value: Mock.Random.pick(['成人', '儿童', '老人', '通用']) },
        { label: '包装', value: Mock.Random.pick(['礼盒装', '简装', '精装', '散装']) }
      ],
      // 配送信息
      shipping: {
        isFree: Mock.Random.boolean(),
        fee: Mock.Random.float(0, 15, 1, 2),
        time: Mock.Random.pick(['1-2天', '2-3天', '3-5天', '5-7天']),
        policy: '支持7天无理由退换货',
        from: Mock.Random.pick(['北京', '上海', '广州', '深圳', '杭州'])
      },
      // 售后服务
      service: {
        warranty: Mock.Random.pick(['7天', '15天', '30天', '1年', '2年']),
        returns: '支持退换货',
        installation: Mock.Random.boolean(),
        repair: Mock.Random.boolean()
      },
      // 商品标签
      tags: Mock.Random.shuffle([
        '热销', '新品', '限量', '推荐', '会员专享', '包邮', '质量保证', '官方正品'
      ]).slice(0, Mock.Random.integer(2, 4)),
      // 是否收藏
      isFavorite: Mock.Random.boolean(),
      // 评价统计
      reviewStats: {
        total: Mock.Random.integer(50, 1000),
        rating: Mock.Random.float(4.2, 5.0, 1, 1),
        star5: Mock.Random.integer(100, 500),
        star4: Mock.Random.integer(50, 200),
        star3: Mock.Random.integer(10, 50),
        star2: Mock.Random.integer(0, 20),
        star1: Mock.Random.integer(0, 10),
        withImages: Mock.Random.integer(20, 200),
        withContent: Mock.Random.integer(30, 300)
      }
    })
    
    return mockResponse(product)
  })
  
  // 获取商品评价（必须在商品列表之前注册）
  Mock.mock(/\/api\/mall\/products\/\d+\/reviews/, 'get', (options) => {
    const url = new URL('http://localhost' + options.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const pageSize = parseInt(url.searchParams.get('pageSize')) || 10
    const rating = parseInt(url.searchParams.get('rating'))
    const hasImages = url.searchParams.get('hasImages') === 'true'
    
    const reviews = Mock.mock({
      'list|100': [{
        'id|+1': 1,
        'userId': () => Mock.Random.integer(1000, 9999),
        'userName': () => Mock.Random.cname(),
        'userAvatar': () => `https://picsum.photos/100/100?random=${Mock.Random.integer(1, 100)}`,
        'isAnonymous|1': [true, false],
        'rating|1-5': 5,
        'content': () => Mock.Random.cparagraph(1, 3),
        'images': () => {
          const hasImg = Mock.Random.boolean()
          return hasImg ? Array.from({length: Mock.Random.integer(1, 9)}, (_, i) => 
            `https://picsum.photos/300/300?random=${Mock.Random.integer(1, 500)}`
          ) : []
        },
        'specs': () => Mock.Random.pick(['红色 M', '蓝色 L', '白色 S', '黑色 XL', '红色 S', '蓝色 M']),
        'createTime': () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
        'helpful|0-50': 5,
        'isHelpful': false,
        // 商家回复
        'reply': () => Mock.Random.boolean() ? {
          content: Mock.Random.csentence(10, 30),
          replyTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
        } : null,
        // 追加评价
        'appendReview': () => Mock.Random.boolean() ? {
          content: Mock.Random.cparagraph(1, 2),
          images: Array.from({length: Mock.Random.integer(0, 3)}, (_, i) => 
            `https://picsum.photos/300/300?random=${Mock.Random.integer(500, 1000)}`
          ),
          createTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
        } : null
      }]
    }).list
    
    // 根据评分筛选
    let filteredReviews = reviews
    if (rating) {
      filteredReviews = filteredReviews.filter(review => review.rating === rating)
    }
    
    // 根据是否有图片筛选
    if (hasImages) {
      filteredReviews = filteredReviews.filter(review => review.images && review.images.length > 0)
    }
    
    return mockPageResponse(filteredReviews, page, pageSize)
  })
  
  // 获取商品列表（必须在商品详情和评价之后注册）
  Mock.mock(/\/api\/mall\/products\/?$/, 'get', (options) => {
    const url = new URL('http://localhost' + options.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const pageSize = parseInt(url.searchParams.get('pageSize')) || 10
    const keyword = url.searchParams.get('keyword')
    const categoryId = parseInt(url.searchParams.get('categoryId'))
    const sortBy = url.searchParams.get('sortBy') // price, sales, rating
    const sortOrder = url.searchParams.get('sortOrder') // asc, desc
    
    const products = Mock.mock({
      'list|100': [{
        'id|+1': 1,
        'name': () => Mock.Random.ctitle(5, 20),
        'subtitle': () => Mock.Random.ctitle(10, 30),
        'images': () => Array.from({length: 5}, (_, i) => 
          `https://picsum.photos/400/400?random=${Mock.Random.integer(1, 100)}`
        ),
        'coverImage': () => `https://picsum.photos/300/300?random=${Mock.Random.integer(1, 100)}`,
        'price': () => Mock.Random.float(9.9, 999.9, 1, 2),
        'originalPrice': function() {
          return parseFloat((this.price * Mock.Random.float(1.1, 2.0, 1, 2)).toFixed(2))
        },
        'memberPrice': function() {
          return parseFloat((this.price * Mock.Random.float(0.8, 0.95, 1, 2)).toFixed(2))
        },
        'stock|0-100': 50,
        'sales|0-1000': 100,
        'rating': () => Mock.Random.float(4.0, 5.0, 1, 1),
        'reviewCount|0-500': 50,
        'categoryId|2-6': 2,
        'tags': () => Mock.Random.shuffle([
          '热销', '新品', '限量', '推荐', '会员专享', '包邮'
        ]).slice(0, Mock.Random.integer(0, 3)),
        'isRecommended|1': [true, false],
        'isMemberExclusive|1': [true, false],
        'shipping': () => Mock.Random.pick(['free', 'paid']),
        'shippingFee': () => Mock.Random.float(0, 15, 1, 2),
        'brand': () => Mock.Random.ctitle(2, 8),
        'description': () => Mock.Random.cparagraph(1, 3),
        'specs': () => {
          const colors = Mock.Random.shuffle(['红色', '蓝色', '白色', '黑色', '粉色']).slice(0, Mock.Random.integer(1, 3))
          const sizes = Mock.Random.shuffle(['S', 'M', 'L', 'XL']).slice(0, Mock.Random.integer(1, 3))
          return { colors, sizes }
        }
      }]
    }).list
    
    // 根据关键词筛选
    let filteredProducts = products
    if (keyword) {
      filteredProducts = products.filter(product => 
        product.name.includes(keyword) || product.subtitle.includes(keyword)
      )
    }
    
    // 根据分类筛选
    if (categoryId && categoryId !== 1) {
      filteredProducts = filteredProducts.filter(product => product.categoryId === categoryId)
    }
    
    // 排序
    if (sortBy) {
      filteredProducts.sort((a, b) => {
        let comparison = 0
        switch (sortBy) {
          case 'price':
            comparison = a.price - b.price
            break
          case 'sales':
            comparison = a.sales - b.sales
            break
          case 'rating':
            comparison = a.rating - b.rating
            break
          default:
            comparison = 0
        }
        return sortOrder === 'desc' ? -comparison : comparison
      })
    }
    
    return mockPageResponse(filteredProducts, page, pageSize)
  })
  
  // 获取购物车列表
  Mock.mock(/\/api\/mall\/cart$/, 'get', () => {
    const cartItems = Mock.mock({
      'list|3-8': [{
        'id|+1': 1,
        'productId': () => Mock.Random.integer(1, 100),
        'name': () => Mock.Random.ctitle(8, 15),
        'subtitle': () => Mock.Random.ctitle(10, 20),
        'image': () => `https://picsum.photos/200/200?random=${Mock.Random.integer(1, 100)}`,
        'price': () => Mock.Random.float(9.9, 199.9, 1, 2),
        'originalPrice': function() {
          return parseFloat((this.price * Mock.Random.float(1.2, 2.0, 1, 2)).toFixed(2))
        },
        'memberPrice': function() {
          return parseFloat((this.price * Mock.Random.float(0.8, 0.95, 1, 2)).toFixed(2))
        },
        'quantity|1-5': 1,
        'specs': () => Mock.Random.pick(['红色 M', '蓝色 L', '白色 S', '黑色 XL']),
        'specValues': () => ({
          color: Mock.Random.pick(['红色', '蓝色', '白色', '黑色']),
          size: Mock.Random.pick(['S', 'M', 'L', 'XL'])
        }),
        'selected': true,
        'stock': () => Mock.Random.integer(10, 100),
        'isValid': true,
        'invalidReason': '',
        'isMemberExclusive': false,
        'tags': () => Mock.Random.shuffle(['热销', '新品', '包邮']).slice(0, Mock.Random.integer(0, 2))
      }]
    }).list
    
    // 添加一些无效商品
    if (Mock.Random.boolean()) {
      cartItems.push(Mock.mock({
        'id': cartItems.length + 1,
        'productId': Mock.Random.integer(1, 100),
        'name': Mock.Random.ctitle(8, 15),
        'subtitle': Mock.Random.ctitle(10, 20),
        'image': `https://picsum.photos/200/200?random=${Mock.Random.integer(1, 100)}`,
        'price': Mock.Random.float(9.9, 199.9, 1, 2),
        'originalPrice': 0,
        'memberPrice': 0,
        'quantity': 1,
        'specs': Mock.Random.pick(['红色 M', '蓝色 L']),
        'specValues': {
          color: Mock.Random.pick(['红色', '蓝色']),
          size: Mock.Random.pick(['M', 'L'])
        },
        'selected': false,
        'stock': 0,
        'isValid': false,
        'invalidReason': Mock.Random.pick(['商品已下架', '库存不足', '规格已失效']),
        'isMemberExclusive': false,
        'tags': []
      }))
    }
    
    const validItems = cartItems.filter(item => item.isValid)
    const selectedItems = validItems.filter(item => item.selected)
    
    const summary = {
      totalItems: cartItems.length,
      validItems: validItems.length,
      invalidItems: cartItems.length - validItems.length,
      selectedItems: selectedItems.length,
      totalPrice: parseFloat(selectedItems
        .reduce((sum, item) => sum + item.price * item.quantity, 0)
        .toFixed(2)),
      totalOriginalPrice: parseFloat(selectedItems
        .reduce((sum, item) => sum + item.originalPrice * item.quantity, 0)
        .toFixed(2)),
      totalSaved: 0
    }
    
    summary.totalSaved = parseFloat((summary.totalOriginalPrice - summary.totalPrice).toFixed(2))
    
    return mockResponse({ items: cartItems, summary })
  })
  
  // 添加商品到购物车
  Mock.mock(/\/api\/mall\/cart$/, 'post', (options) => {
    const body = JSON.parse(options.body)
    
    // 模拟添加成功
    const cartItem = Mock.mock({
      id: Mock.Random.integer(100, 999),
      productId: body.productId,
      name: body.name || Mock.Random.ctitle(8, 15),
      image: body.image || `https://picsum.photos/200/200?random=${Mock.Random.integer(1, 100)}`,
      price: body.price || Mock.Random.float(9.9, 199.9, 1, 2),
      quantity: body.quantity || 1,
      specs: body.specs || '默认规格',
      specValues: body.specValues || {},
      selected: true,
      stock: Mock.Random.integer(10, 100),
      isValid: true
    })
    
    return mockResponse({
      success: true,
      cartItem: cartItem,
      cartCount: Mock.Random.integer(1, 15),
      message: '已添加到购物车'
    })
  })
  
  // 更新购物车商品（数量、选中状态等）
  Mock.mock(/\/api\/mall\/cart\/\d+$/, 'put', (options) => {
    const body = JSON.parse(options.body)
    const cartId = options.url.match(/\/api\/mall\/cart\/(\d+)/)[1]
    
    // 模拟更新成功
    return mockResponse({
      success: true,
      cartItem: {
        id: parseInt(cartId),
        quantity: body.quantity,
        selected: body.selected,
        ...body
      },
      message: '更新成功'
    })
  })
  
  // 批量更新购物车商品（全选/取消全选）
  Mock.mock(/\/api\/mall\/cart\/batch$/, 'put', (options) => {
    const body = JSON.parse(options.body)
    
    return mockResponse({
      success: true,
      updatedCount: body.ids ? body.ids.length : 0,
      message: '批量更新成功'
    })
  })
  
  // 删除购物车商品
  Mock.mock(/\/api\/mall\/cart\/\d+$/, 'delete', (options) => {
    const cartId = options.url.match(/\/api\/mall\/cart\/(\d+)/)[1]
    
    return mockResponse({
      success: true,
      deletedId: parseInt(cartId),
      message: '已移除商品'
    })
  })
  
  // 批量删除购物车商品
  Mock.mock(/\/api\/mall\/cart\/batch$/, 'delete', (options) => {
    const body = JSON.parse(options.body)
    
    return mockResponse({
      success: true,
      deletedCount: body.ids ? body.ids.length : 0,
      message: '已移除选中商品'
    })
  })
  
  // 清空失效商品
  Mock.mock(/\/api\/mall\/cart\/invalid$/, 'delete', () => {
    return mockResponse({
      success: true,
      deletedCount: Mock.Random.integer(1, 3),
      message: '已清空失效商品'
    })
  })
  
  // 创建订单
  Mock.mock(/\/api\/mall\/orders$/, 'post', (options) => {
    const body = JSON.parse(options.body)
    
    const orderNo = 'ML' + Mock.Random.datetime('yyyyMMddHHmmss') + Mock.Random.integer(100, 999)
    const createTime = new Date()
    const paymentDeadline = new Date(createTime.getTime() + 30 * 60 * 1000) // 30分钟后
    
    const order = {
      id: Mock.Random.integer(1000, 9999),
      orderNo: orderNo,
      status: 'pending', // pending-待支付, paid-待发货, shipped-待收货, completed-已完成, cancelled-已取消, refunded-已退款
      statusText: '待支付',
      items: body.items || [],
      address: body.address || {},
      remark: body.remark || '',
      paymentMethod: body.paymentMethod || 'wechat',
      // 金额信息
      productAmount: body.productAmount || 0,
      shippingFee: body.shippingFee || 0,
      discount: body.discount || 0,
      couponAmount: body.couponAmount || 0,
      totalAmount: body.totalAmount || 0,
      // 时间信息
      createTime: createTime.toISOString(),
      paymentDeadline: paymentDeadline.toISOString(),
      payTime: null,
      shipTime: null,
      completeTime: null,
      cancelTime: null,
      // 优惠券信息
      couponId: body.couponId || null,
      couponName: body.couponName || null
    }
    
    return mockResponse(order, '订单创建成功，请在30分钟内完成支付')
  })
  
  // 获取订单列表
  Mock.mock(/\/api\/mall\/orders$/, 'get', (options) => {
    const url = new URL('http://localhost' + options.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const pageSize = parseInt(url.searchParams.get('pageSize')) || 10
    const status = url.searchParams.get('status') // all, pending, paid, shipped, completed, cancelled
    
    const orders = Mock.mock({
      'list|20': [{
        'id|+1': 1000,
        'orderNo': () => 'ML' + Mock.Random.datetime('yyyyMMddHHmmss') + Mock.Random.integer(100, 999),
        'status': () => Mock.Random.pick(['pending', 'paid', 'shipped', 'completed', 'cancelled']),
        'statusText': function() {
          const statusMap = {
            pending: '待支付',
            paid: '待发货',
            shipped: '待收货',
            completed: '已完成',
            cancelled: '已取消',
            refunded: '已退款'
          }
          return statusMap[this.status]
        },
        'items': () => Mock.mock({
          'list|1-3': [{
            'id|+1': 1,
            'productId': () => Mock.Random.integer(1, 100),
            'name': () => Mock.Random.ctitle(8, 15),
            'image': () => `https://picsum.photos/200/200?random=${Mock.Random.integer(1, 100)}`,
            'price': () => Mock.Random.float(9.9, 199.9, 1, 2),
            'quantity|1-3': 1,
            'specs': () => Mock.Random.pick(['红色 M', '蓝色 L', '白色 S', '黑色 XL'])
          }]
        }).list,
        'totalAmount': () => Mock.Random.float(50, 500, 1, 2),
        'productAmount': function() {
          return parseFloat((this.totalAmount * Mock.Random.float(0.9, 1.0, 1, 2)).toFixed(2))
        },
        'shippingFee': () => Mock.Random.float(0, 15, 1, 2),
        'discount': () => Mock.Random.float(0, 50, 1, 2),
        'createTime': () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
        'payTime': function() {
          return this.status !== 'pending' && this.status !== 'cancelled' 
            ? Mock.Random.datetime('yyyy-MM-dd HH:mm:ss') 
            : null
        },
        'canCancel': function() { return this.status === 'pending' },
        'canPay': function() { return this.status === 'pending' },
        'canConfirm': function() { return this.status === 'shipped' },
        'canReview': function() { return this.status === 'completed' },
        'canRefund': function() { return this.status === 'paid' }
      }]
    }).list
    
    // 根据状态筛选
    let filteredOrders = orders
    if (status && status !== 'all') {
      filteredOrders = orders.filter(order => order.status === status)
    }
    
    return mockPageResponse(filteredOrders, page, pageSize)
  })
  
  // 获取订单详情
  Mock.mock(/\/api\/mall\/orders\/\d+$/, 'get', (options) => {
    const orderId = options.url.match(/\/api\/mall\/orders\/(\d+)/)[1]
    
    const status = Mock.Random.pick(['pending', 'paid', 'shipped', 'completed', 'cancelled'])
    const createTime = Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
    
    const order = Mock.mock({
      id: parseInt(orderId),
      orderNo: 'ML' + Mock.Random.datetime('yyyyMMddHHmmss') + Mock.Random.integer(100, 999),
      status: status,
      statusText: {
        pending: '待支付',
        paid: '待发货',
        shipped: '待收货',
        completed: '已完成',
        cancelled: '已取消',
        refunded: '已退款'
      }[status],
      statusDesc: {
        pending: '请在30分钟内完成支付',
        paid: '商家正在准备发货',
        shipped: '商品正在配送中，请注意查收',
        completed: '交易已完成，感谢您的购买',
        cancelled: '订单已取消',
        refunded: '订单已退款'
      }[status],
      // 商品列表
      items: Mock.mock({
        'list|1-3': [{
          'id|+1': 1,
          'productId': () => Mock.Random.integer(1, 100),
          'name': () => Mock.Random.ctitle(8, 15),
          'subtitle': () => Mock.Random.ctitle(10, 20),
          'image': () => `https://picsum.photos/200/200?random=${Mock.Random.integer(1, 100)}`,
          'price': () => Mock.Random.float(9.9, 199.9, 1, 2),
          'quantity|1-3': 1,
          'specs': () => Mock.Random.pick(['红色 M', '蓝色 L', '白色 S', '黑色 XL']),
          'isReviewed': () => status === 'completed' ? Mock.Random.boolean() : false
        }]
      }).list,
      // 收货地址
      address: {
        id: Mock.Random.integer(1, 100),
        name: Mock.Random.cname(),
        phone: Mock.Random.pick(['138', '139', '186', '188']) + Mock.Random.string('number', 8),
        province: Mock.Random.province(),
        city: Mock.Random.city(),
        district: Mock.Random.county(),
        detail: Mock.Random.ctitle(10, 30),
        fullAddress: function() {
          return this.province + this.city + this.district + this.detail
        }
      },
      // 物流信息（已发货状态才有）
      logistics: status === 'shipped' || status === 'completed' ? {
        company: Mock.Random.pick(['顺丰速运', '中通快递', '圆通速递', '申通快递', '韵达快递']),
        trackingNo: Mock.Random.string('upper', 2) + Mock.Random.string('number', 12),
        status: Mock.Random.pick(['运输中', '派送中', '已签收']),
        timeline: Mock.mock({
          'list|3-6': [{
            'time': () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
            'desc': () => Mock.Random.pick([
              '【北京市】快件已到达北京分拨中心',
              '【北京市】快件已从北京分拨中心发出',
              '【上海市】快件已到达上海分拨中心',
              '【上海市】快件已从上海分拨中心发出',
              '【上海市】快件正在派送中，快递员：张三，电话：138****1234',
              '【上海市】快件已签收，签收人：本人'
            ])
          }]
        }).list.sort((a, b) => new Date(b.time) - new Date(a.time))
      } : null,
      // 金额信息
      productAmount: Mock.Random.float(50, 500, 1, 2),
      shippingFee: Mock.Random.float(0, 15, 1, 2),
      discount: Mock.Random.float(0, 50, 1, 2),
      couponAmount: Mock.Random.float(0, 30, 1, 2),
      totalAmount: function() {
        return parseFloat((this.productAmount + this.shippingFee - this.discount - this.couponAmount).toFixed(2))
      },
      // 支付信息
      paymentMethod: Mock.Random.pick(['wechat', 'alipay', 'balance']),
      paymentMethodText: function() {
        const map = { wechat: '微信支付', alipay: '支付宝', balance: '余额支付' }
        return map[this.paymentMethod]
      },
      // 优惠券信息
      couponId: Mock.Random.integer(1, 100),
      couponName: '满100减10优惠券',
      // 备注
      remark: Mock.Random.boolean() ? Mock.Random.csentence(5, 20) : '',
      // 时间信息
      createTime: createTime,
      paymentDeadline: status === 'pending' ? Mock.Random.datetime('yyyy-MM-dd HH:mm:ss') : null,
      payTime: status !== 'pending' && status !== 'cancelled' ? Mock.Random.datetime('yyyy-MM-dd HH:mm:ss') : null,
      shipTime: status === 'shipped' || status === 'completed' ? Mock.Random.datetime('yyyy-MM-dd HH:mm:ss') : null,
      completeTime: status === 'completed' ? Mock.Random.datetime('yyyy-MM-dd HH:mm:ss') : null,
      cancelTime: status === 'cancelled' ? Mock.Random.datetime('yyyy-MM-dd HH:mm:ss') : null,
      // 操作权限
      canCancel: status === 'pending',
      canPay: status === 'pending',
      canConfirm: status === 'shipped',
      canReview: status === 'completed',
      canRefund: status === 'paid',
      canViewLogistics: status === 'shipped' || status === 'completed'
    })
    
    return mockResponse(order)
  })
  
  // 取消订单
  Mock.mock(/\/api\/mall\/orders\/\d+\/cancel$/, 'post', (options) => {
    const orderId = options.url.match(/\/api\/mall\/orders\/(\d+)\/cancel/)[1]
    const body = JSON.parse(options.body)
    
    return mockResponse({
      success: true,
      orderId: parseInt(orderId),
      cancelReason: body.reason || '用户取消',
      cancelTime: new Date().toISOString(),
      message: '订单已取消'
    })
  })
  
  // 支付订单
  Mock.mock(/\/api\/mall\/orders\/\d+\/pay$/, 'post', (options) => {
    const orderId = options.url.match(/\/api\/mall\/orders\/(\d+)\/pay/)[1]
    const body = JSON.parse(options.body)
    
    // 模拟支付成功
    return mockResponse({
      success: true,
      orderId: parseInt(orderId),
      paymentMethod: body.paymentMethod || 'wechat',
      payTime: new Date().toISOString(),
      transactionNo: 'TXN' + Mock.Random.datetime('yyyyMMddHHmmss') + Mock.Random.integer(1000, 9999),
      message: '支付成功'
    })
  })
  
  // 确认收货
  Mock.mock(/\/api\/mall\/orders\/\d+\/confirm$/, 'post', (options) => {
    const orderId = options.url.match(/\/api\/mall\/orders\/(\d+)\/confirm/)[1]
    
    return mockResponse({
      success: true,
      orderId: parseInt(orderId),
      completeTime: new Date().toISOString(),
      message: '确认收货成功'
    })
  })
  
  // 申请退款
  Mock.mock(/\/api\/mall\/orders\/\d+\/refund$/, 'post', (options) => {
    const orderId = options.url.match(/\/api\/mall\/orders\/(\d+)\/refund/)[1]
    const body = JSON.parse(options.body)
    
    return mockResponse({
      success: true,
      orderId: parseInt(orderId),
      refundNo: 'RF' + Mock.Random.datetime('yyyyMMddHHmmss') + Mock.Random.integer(100, 999),
      refundAmount: body.refundAmount || 0,
      refundReason: body.reason || '不想要了',
      refundTime: new Date().toISOString(),
      message: '退款申请已提交，请等待审核'
    })
  })
  
  // 删除订单
  Mock.mock(/\/api\/mall\/orders\/\d+$/, 'delete', (options) => {
    const orderId = options.url.match(/\/api\/mall\/orders\/(\d+)/)[1]
    
    return mockResponse({
      success: true,
      orderId: parseInt(orderId),
      message: '订单已删除'
    })
  })
  
  // 获取热门商品
  Mock.mock(/\/api\/mall\/popular/, 'get', () => {
    // 返回与商城页面一致的商品数据
    const products = [
      {
        id: 9,
        name: '杜蕾斯至薄装安全套',
        image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good01.jpg',
        price: 89.9,
        memberPrice: 69.9,
        sales: 3200,
        tags: ['热销']
      },
      {
        id: 10,
        name: 'KY私密润滑剂50ml',
        image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good02.jpg',
        price: 129.9,
        memberPrice: 99.9,
        sales: 2800,
        tags: ['热销']
      },
      {
        id: 11,
        name: '维多利亚蕾丝情趣内衣',
        image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good03.jpg',
        price: 299.9,
        memberPrice: 239.9,
        sales: 1850,
        tags: ['新品']
      },
      {
        id: 13,
        name: 'Fairvital德国玛卡胶囊',
        image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good04.jpg',
        price: 210.9,
        memberPrice: 159.9,
        sales: 1580,
        tags: ['热销']
      },
      {
        id: 17,
        name: '简禾酒精杀菌消毒湿巾',
        image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good05.jpg',
        price: 19.9,
        memberPrice: 16.9,
        sales: 3800,
        tags: ['热销']
      },
      {
        id: 12,
        name: '伊珞EROCOME震动棒',
        image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good06.jpg',
        price: 169.9,
        memberPrice: 139.9,
        sales: 1200,
        tags: ['推荐']
      }
    ]

    return mockResponse(products)
  })
  
  // 商品搜索
  Mock.mock(/\/api\/mall\/search$/, 'get', (options) => {
    const url = new URL('http://localhost' + options.url)
    const keyword = url.searchParams.get('keyword') || ''
    const page = parseInt(url.searchParams.get('page')) || 1
    const pageSize = parseInt(url.searchParams.get('pageSize')) || 20
    const sortBy = url.searchParams.get('sortBy') // default, sales, price
    const sortOrder = url.searchParams.get('sortOrder') // asc, desc
    const categoryId = parseInt(url.searchParams.get('categoryId'))
    const minPrice = parseFloat(url.searchParams.get('minPrice'))
    const maxPrice = parseFloat(url.searchParams.get('maxPrice'))
    
    // 生成搜索结果
    const products = Mock.mock({
      'list|50': [{
        'id|+1': 1,
        'name': () => keyword + Mock.Random.ctitle(3, 10),
        'subtitle': () => Mock.Random.ctitle(10, 30),
        'image': () => `https://picsum.photos/300/300?random=${Mock.Random.integer(1, 100)}`,
        'price': () => Mock.Random.float(9.9, 999.9, 1, 2),
        'originalPrice': function() {
          return parseFloat((this.price * Mock.Random.float(1.2, 2.5, 1, 2)).toFixed(2))
        },
        'memberPrice': function() {
          return parseFloat((this.price * Mock.Random.float(0.8, 0.95, 1, 2)).toFixed(2))
        },
        'sales|0-10000': 100,
        'rating': () => Mock.Random.float(4.0, 5.0, 1, 1),
        'reviewCount|0-1000': 50,
        'stock|0-500': 50,
        'categoryId|2-6': 2,
        'tags': () => Mock.Random.shuffle(['热销', '新品', '包邮', '推荐']).slice(0, Mock.Random.integer(0, 2)),
        'isMemberExclusive|1': [true, false]
      }]
    }).list
    
    // 筛选
    let filteredProducts = products
    
    // 分类筛选
    if (categoryId && categoryId !== 1) {
      filteredProducts = filteredProducts.filter(p => p.categoryId === categoryId)
    }
    
    // 价格区间筛选
    if (minPrice) {
      filteredProducts = filteredProducts.filter(p => p.price >= minPrice)
    }
    if (maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.price <= maxPrice)
    }
    
    // 排序
    if (sortBy) {
      filteredProducts.sort((a, b) => {
        let comparison = 0
        switch (sortBy) {
          case 'price':
            comparison = a.price - b.price
            break
          case 'sales':
            comparison = a.sales - b.sales
            break
          default:
            comparison = 0
        }
        return sortOrder === 'desc' ? -comparison : comparison
      })
    }
    
    return mockPageResponse(filteredProducts, page, pageSize)
  })
  
  // 搜索建议
  Mock.mock(/\/api\/mall\/search\/suggest$/, 'get', (options) => {
    const url = new URL('http://localhost' + options.url)
    const keyword = url.searchParams.get('keyword') || ''
    
    if (!keyword) {
      return mockResponse([])
    }
    
    // 生成搜索建议
    const suggestions = Mock.mock({
      'list|5-10': [{
        'keyword': () => keyword + Mock.Random.ctitle(2, 8),
        'count': () => Mock.Random.integer(100, 10000)
      }]
    }).list
    
    return mockResponse(suggestions)
  })
  
  // 热门搜索关键词
  Mock.mock(/\/api\/mall\/search\/hot$/, 'get', () => {
    const hotKeywords = Mock.mock({
      'list|10': [{
        'keyword': () => Mock.Random.ctitle(2, 8),
        'count': () => Mock.Random.integer(1000, 50000),
        'trend': () => Mock.Random.pick(['up', 'down', 'stable'])
      }]
    }).list.sort((a, b) => b.count - a.count)
    
    return mockResponse(hotKeywords)
  })
  
  // 搜索历史
  Mock.mock(/\/api\/mall\/search\/history$/, 'get', () => {
    const history = Mock.mock({
      'list|0-10': [{
        'keyword': () => Mock.Random.ctitle(2, 8),
        'searchTime': () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
      }]
    }).list.sort((a, b) => new Date(b.searchTime) - new Date(a.searchTime))
    
    return mockResponse(history)
  })
  
  // 添加搜索历史
  Mock.mock(/\/api\/mall\/search\/history$/, 'post', (options) => {
    const body = JSON.parse(options.body)
    
    return mockResponse({
      success: true,
      keyword: body.keyword,
      searchTime: new Date().toISOString()
    })
  })
  
  // 清空搜索历史
  Mock.mock(/\/api\/mall\/search\/history$/, 'delete', () => {
    return mockResponse({
      success: true,
      message: '搜索历史已清空'
    })
  })
  
  // 提交商品评价
  Mock.mock(/\/api\/mall\/reviews$/, 'post', (options) => {
    const body = JSON.parse(options.body)
    
    const review = {
      id: Mock.Random.integer(1000, 9999),
      orderId: body.orderId,
      productId: body.productId,
      userId: Mock.Random.integer(1000, 9999),
      userName: body.isAnonymous ? '匿名用户' : Mock.Random.cname(),
      userAvatar: `https://picsum.photos/100/100?random=${Mock.Random.integer(1, 100)}`,
      isAnonymous: body.isAnonymous || false,
      rating: body.rating,
      content: body.content,
      images: body.images || [],
      specs: body.specs || '',
      createTime: new Date().toISOString(),
      helpful: 0,
      isHelpful: false,
      reply: null,
      appendReview: null
    }
    
    return mockResponse(review, '评价提交成功')
  })
  
  // 追加评价
  Mock.mock(/\/api\/mall\/reviews\/\d+\/append$/, 'post', (options) => {
    const reviewId = options.url.match(/\/api\/mall\/reviews\/(\d+)\/append/)[1]
    const body = JSON.parse(options.body)
    
    const appendReview = {
      content: body.content,
      images: body.images || [],
      createTime: new Date().toISOString()
    }
    
    return mockResponse({
      success: true,
      reviewId: parseInt(reviewId),
      appendReview: appendReview,
      message: '追加评价成功'
    })
  })
  
  // 评价点赞
  Mock.mock(/\/api\/mall\/reviews\/\d+\/helpful$/, 'post', (options) => {
    const reviewId = options.url.match(/\/api\/mall\/reviews\/(\d+)\/helpful/)[1]
    
    return mockResponse({
      success: true,
      reviewId: parseInt(reviewId),
      helpful: Mock.Random.integer(1, 100),
      message: '点赞成功'
    })
  })
  
  // 获取优惠券列表
  Mock.mock(/\/api\/mall\/coupons$/, 'get', (options) => {
    const url = new URL('http://localhost' + options.url)
    const status = url.searchParams.get('status') // available, used, expired
    
    const now = new Date()
    
    const coupons = Mock.mock({
      'list|10': [{
        'id|+1': 1,
        'name': () => Mock.Random.pick(['满减券', '折扣券', '新人券', '会员专享券']),
        'type': () => Mock.Random.pick(['discount', 'cash']), // discount-折扣券, cash-满减券
        'amount': function() {
          return this.type === 'cash' ? Mock.Random.integer(5, 50) : Mock.Random.integer(80, 95)
        },
        'condition': () => Mock.Random.integer(50, 500),
        'description': function() {
          if (this.type === 'cash') {
            return `满${this.condition}元可用`
          } else {
            return `满${this.condition}元可用`
          }
        },
        'startTime': () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
        'endTime': () => {
          const end = new Date(now)
          end.setDate(end.getDate() + Mock.Random.integer(1, 30))
          return end.toISOString()
        },
        'status': () => Mock.Random.pick(['available', 'used', 'expired']),
        'useTime': function() {
          return this.status === 'used' ? Mock.Random.datetime('yyyy-MM-dd HH:mm:ss') : null
        },
        'scope': () => Mock.Random.pick(['all', 'category', 'product']),
        'scopeText': function() {
          const map = { all: '全场通用', category: '指定分类', product: '指定商品' }
          return map[this.scope]
        }
      }]
    }).list
    
    // 根据状态筛选
    let filteredCoupons = coupons
    if (status) {
      filteredCoupons = coupons.filter(coupon => coupon.status === status)
    }
    
    return mockResponse(filteredCoupons)
  })
  
  // 领取优惠券
  Mock.mock(/\/api\/mall\/coupons\/\d+\/receive$/, 'post', (options) => {
    const couponId = options.url.match(/\/api\/mall\/coupons\/(\d+)\/receive/)[1]
    
    return mockResponse({
      success: true,
      couponId: parseInt(couponId),
      message: '领取成功'
    })
  })
  
  // 获取可用优惠券（结算页使用）
  Mock.mock(/\/api\/mall\/coupons\/available$/, 'get', (options) => {
    const url = new URL('http://localhost' + options.url)
    const amount = parseFloat(url.searchParams.get('amount')) || 0

    // 固定的优惠券数据
    const coupons = [
      {
        id: 1,
        name: '新人专享优惠券',
        type: 'cash',
        amount: 20,
        condition: 99,
        description: '满99元减20元',
        endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        canUse: amount >= 99
      },
      {
        id: 2,
        name: '限时满减券',
        type: 'cash',
        amount: 50,
        condition: 299,
        description: '满299元减50元',
        endTime: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        canUse: amount >= 299
      },
      {
        id: 3,
        name: '全场通用券',
        type: 'cash',
        amount: 10,
        condition: 50,
        description: '满50元减10元',
        endTime: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        canUse: amount >= 50
      },
      {
        id: 4,
        name: '会员专享9折券',
        type: 'discount',
        amount: 90,
        condition: 199,
        description: '满199元打9折',
        endTime: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        canUse: amount >= 199
      },
      {
        id: 5,
        name: '超级折扣券',
        type: 'discount',
        amount: 85,
        condition: 399,
        description: '满399元打8.5折',
        endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        canUse: amount >= 399
      },
      {
        id: 6,
        name: '情趣专区满减券',
        type: 'cash',
        amount: 30,
        condition: 149,
        description: '满149元减30元',
        endTime: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        canUse: amount >= 149
      },
      {
        id: 7,
        name: '小额订单优惠券',
        type: 'cash',
        amount: 5,
        condition: 29,
        description: '满29元减5元',
        endTime: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        canUse: amount >= 29
      },
      {
        id: 8,
        name: '超值满减券(已过期)',
        type: 'cash',
        amount: 100,
        condition: 500,
        description: '满500元减100元',
        endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        canUse: false
      }
    ]

    return mockResponse(coupons)
  })
}