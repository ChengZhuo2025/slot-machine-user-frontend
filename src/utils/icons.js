// 图标工具函数和配置

// MynaUI 图标名称映射 - 使用真实的MynaUI图标
export const ICON_NAMES = {
  // 导航相关
  HOME: 'home',
  SHOPPING_CART: 'shopping-cart',
  SCAN: 'scan',
  WALLET: 'wallet',
  USER: 'user',
  
  // 基础操作
  SEARCH: 'search',
  FILTER: 'filter',
  ADD: 'add',
  MINUS: 'minus',
  EDIT: 'edit',
  DELETE: 'delete',
  CLOSE: 'close',
  CHECK: 'check',
  
  // 箭头导航
  ARROW_LEFT: 'arrow-left',
  ARROW_RIGHT: 'arrow-right',
  ARROW_UP: 'arrow-up',
  ARROW_DOWN: 'arrow-down',
  CHEVRON_LEFT: 'chevron-left',
  CHEVRON_RIGHT: 'chevron-right',
  CHEVRON_UP: 'chevron-up',
  CHEVRON_DOWN: 'chevron-down',
  
  // 位置和联系
  LOCATION: 'location',
  PHONE: 'phone',
  MESSAGE: 'message',
  
  // 社交互动
  HEART: 'heart',
  STAR: 'star',
  SHARE: 'share',
  
  // 媒体相关
  CAMERA: 'camera',
  GALLERY: 'gallery',
  
  // 设置相关
  SETTINGS: 'settings',
  
  // 酒店相关
  HOTEL: 'hotel',
  BED: 'bed',
  WIFI: 'wifi',
  PARKING: 'parking',
  RESTAURANT: 'restaurant',
  GYM: 'gym',
  SPA: 'spa',
  POOL: 'pool',
  
  // 房间设施
  AIR_CONDITIONING: 'air-conditioning',
  HEATING: 'heating',
  TV: 'tv',
  FRIDGE: 'fridge',
  SAFE: 'safe',
  
  // 时间和计划
  CLOCK: 'clock',
  CALENDAR: 'calendar',
  
  // 支付和金融
  MONEY: 'money',
  CREDIT_CARD: 'credit-card',
  GIFT: 'gift',
  DISCOUNT: 'discount',
  
  // 等级和奖励
  TROPHY: 'trophy',
  MEDAL: 'medal',
  CROWN: 'crown',
  DIAMOND: 'diamond',
  
  // 票据和码
  TICKET: 'ticket',
  QRCODE: 'qrcode',
  BARCODE: 'barcode',
  KEY: 'key',
  
  // 通知和消息
  NOTIFICATION: 'notification',
  MAIL: 'mail',
  
  // 帮助和状态
  HELP: 'help',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  SUCCESS: 'success',
  
  // 用户类型
  BUSINESS: 'business',
  FAMILY: 'family',
  PET: 'pet',
  
  // 吸烟相关
  SMOKING: 'smoking',
  NO_SMOKING: 'no-smoking'
}

// MynaUI 图标映射表 - 内部使用的实际图标名称
export const MYNAUI_ICON_MAP = {
  // 导航图标
  'home': 'mynaui:home',
  'shopping-cart': 'mynaui:shopping-cart',
  'scan': 'mynaui:scan',
  'wallet': 'mynaui:wallet',
  'user': 'mynaui:user-circle',
  
  // 功能图标
  'search': 'mynaui:search',
  'filter': 'mynaui:filter',
  'location': 'mynaui:location',
  'phone': 'mynaui:phone',
  'message': 'mynaui:message',
  'heart': 'mynaui:heart',
  'star': 'mynaui:star',
  'share': 'mynaui:share',
  'camera': 'mynaui:camera',
  'gallery': 'mynaui:gallery',
  'settings': 'mynaui:settings',
  'edit': 'mynaui:edit',
  'delete': 'mynaui:trash',
  'add': 'mynaui:plus',
  'minus': 'mynaui:minus',
  'close': 'mynaui:x',
  'check': 'mynaui:check',
  'arrow-left': 'mynaui:arrow-left',
  'arrow-right': 'mynaui:arrow-right',
  'arrow-up': 'mynaui:arrow-up',
  'arrow-down': 'mynaui:arrow-down',
  'chevron-left': 'mynaui:chevron-left',
  'chevron-right': 'mynaui:chevron-right',
  'chevron-up': 'mynaui:chevron-up',
  'chevron-down': 'mynaui:chevron-down',
  
  // 业务图标
  'hotel': 'mynaui:building',
  'bed': 'mynaui:bed',
  'wifi': 'mynaui:wifi',
  'parking': 'mynaui:car',
  'restaurant': 'mynaui:cutlery',
  'gym': 'mynaui:dumbbell',
  'spa': 'mynaui:spa',
  'pool': 'mynaui:waves',
  'business': 'mynaui:briefcase',
  'family': 'mynaui:users',
  'pet': 'mynaui:paw',
  'smoking': 'mynaui:smoking',
  'no-smoking': 'mynaui:smoking-no',
  'air-conditioning': 'mynaui:air-conditioner',
  'heating': 'mynaui:fire',
  'tv': 'mynaui:tv',
  'fridge': 'mynaui:fridge',
  'safe': 'mynaui:lock',
  'key': 'mynaui:key',
  'clock': 'mynaui:clock',
  'calendar': 'mynaui:calendar',
  'money': 'mynaui:coin',
  'credit-card': 'mynaui:credit-card',
  'gift': 'mynaui:gift',
  'discount': 'mynaui:discount',
  'trophy': 'mynaui:trophy',
  'medal': 'mynaui:medal',
  'crown': 'mynaui:crown',
  'diamond': 'mynaui:diamond',
  'ticket': 'mynaui:ticket',
  'qrcode': 'mynaui:qr-code',
  'barcode': 'mynaui:barcode',
  'notification': 'mynaui:bell',
  'mail': 'mynaui:mail',
  'help': 'mynaui:help-circle',
  'info': 'mynaui:info-circle',
  'warning': 'mynaui:alert-triangle',
  'error': 'mynaui:x-circle',
  'success': 'mynaui:check-circle'
}

// 图标尺寸配置
export const ICON_SIZES = {
  SMALL: 'small',      // 32rpx
  MEDIUM: 'medium',    // 48rpx (默认)
  LARGE: 'large',      // 64rpx
  XLARGE: 'xlarge'     // 80rpx
}

// 常用图标组合
export const ICON_GROUPS = {
  // 底部导航图标
  TABBAR: [
    { name: ICON_NAMES.HOME, label: '首页' },
    { name: ICON_NAMES.SHOPPING_CART, label: '商城' },
    { name: ICON_NAMES.SCAN, label: '扫一扫' },
    { name: ICON_NAMES.WALLET, label: '赚钱' },
    { name: ICON_NAMES.USER, label: '我的' }
  ],
  
  // 酒店设施图标
  HOTEL_FACILITIES: [
    { name: ICON_NAMES.WIFI, label: 'WiFi' },
    { name: ICON_NAMES.PARKING, label: '停车场' },
    { name: ICON_NAMES.RESTAURANT, label: '餐厅' },
    { name: ICON_NAMES.GYM, label: '健身房' },
    { name: ICON_NAMES.SPA, label: 'SPA' },
    { name: ICON_NAMES.POOL, label: '游泳池' }
  ],
  
  // 房间设施图标
  ROOM_FACILITIES: [
    { name: ICON_NAMES.AIR_CONDITIONING, label: '空调' },
    { name: ICON_NAMES.HEATING, label: '暖气' },
    { name: ICON_NAMES.TV, label: '电视' },
    { name: ICON_NAMES.FRIDGE, label: '冰箱' },
    { name: ICON_NAMES.SAFE, label: '保险箱' },
    { name: ICON_NAMES.WIFI, label: 'WiFi' }
  ],
  
  // 支付方式图标
  PAYMENT_METHODS: [
    { name: ICON_NAMES.MONEY, label: '现金' },
    { name: ICON_NAMES.CREDIT_CARD, label: '银行卡' },
    { name: ICON_NAMES.WALLET, label: '电子钱包' }
  ]
}

// 获取图标颜色的工具函数
export const getIconColor = (type = 'default') => {
  const colorMap = {
    primary: '#8B5CF6',
    secondary: '#34b8f9',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    default: '#666666',
    disabled: '#CCCCCC'
  }
  
  return colorMap[type] || colorMap.default
}

// 创建图标配置的工具函数
export const createIconConfig = (name, options = {}) => {
  return {
    name,
    size: options.size || ICON_SIZES.MEDIUM,
    color: options.color || getIconColor(options.type),
    clickable: options.clickable || false,
    ...options
  }
}

// 批量创建图标配置
export const createIconConfigs = (configs) => {
  return configs.map(config => {
    if (typeof config === 'string') {
      return createIconConfig(config)
    }
    return createIconConfig(config.name, config)
  })
}

// 导出默认图标配置
export default {
  ICON_NAMES,
  ICON_SIZES,
  ICON_GROUPS,
  getIconColor,
  createIconConfig,
  createIconConfigs
}