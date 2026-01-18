<template>
  <view
    class="icon"
    :class="[
      `icon--${size}`,
      { 'icon--clickable': clickable }
    ]"
    :style="iconStyle"
    @click="handleClick"
  >
    <Iconify
      :icon="iconName"
      :color="color"
      :style="{ fontSize: iconSize }"
      class="icon__svg"
    />
  </view>
</template>

<script>
import { computed } from 'vue'
import { Icon as Iconify } from '@iconify/vue'

// MynaUI 图标映射 - 使用真实的MynaUI图标名称
const MYNA_ICONS = {
  // 导航图标
  'home': 'mynaui:home',
  'shopping-cart': 'heroicons:shopping-bag',
  'scan': 'fluent:scan-dash-20-filled',  // 使用相机扫描图标
  'wallet': 'solar:wallet-outline',
  'user': 'mynaui:user-circle',
  
  // 功能图标
  'search': 'mynaui:search',
  'filter': 'mynaui:filter',
  'location': 'mynaui:location',
  'phone': 'mynaui:telephone',
  'message': 'mynaui:message',
  'bell': 'mynaui:bell',
  'heart': 'mynaui:heart',
  'heartSolid': 'mynaui:heart-solid',
  'star': 'mynaui:star',
  'starSolid': 'mynaui:star-solid',
  'eye': 'mynaui:eye',
  'like': 'mynaui:like',
  'share': 'mynaui:share',
  'forward': 'mynaui:fat-corner-up-right',
  'camera': 'mynaui:camera',
  'gallery': 'mynaui:image',
  'image': 'mynaui:image',
  'settings': 'mynaui:stop-hexagon',
  'gear': 'ph:gear-light',
  'edit': 'mynaui:edit',
  'delete': 'mynaui:trash',
  'add': 'mynaui:plus',
  'minus': 'mynaui:minus',
  'close': 'mynaui:x',
  'check': 'mynaui:check',
  'copy': 'mynaui:copy',
  'send': 'mynaui:navigation-one',
  'arrow-left': 'mynaui:arrow-left',
  'arrow-right': 'mynaui:arrow-right',
  'arrow-up': 'mynaui:arrow-up',
  'arrow-down': 'mynaui:arrow-down',
  'chevron-left': 'mynaui:chevron-left',
  'chevron-right': 'mynaui:chevron-right',
  'chevron-up': 'mynaui:chevron-up',
  'chevron-down': 'mynaui:chevron-down',
  'grid': 'mynaui:grid',
  'list': 'mynaui:list',
  'more': 'mynaui:dots',
  
  // 业务图标
  'hotel': 'mynaui:building',
  'bed': 'hugeicons:bed-double',
  'wifi': 'mynaui:wifi',
  'air-conditioner': 'mynaui:air-conditioner',
  'parking': 'mynaui:parking',
  'restaurant': 'mynaui:bowl',
  'coffee': 'mynaui:coffee',
  'gym': 'solar:treadmill-linear',
  'bath': 'mynaui:bath',
  'spa': 'mynaui:droplet',
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
  'key': 'clarity:key-line',
  'clock': 'mynaui:clock-circle',
  'calendar': 'mynaui:calendar',
  'calendarCheck': 'mynaui:calendar-check',
  'points': 'mynaui:database',
  'money': 'hugeicons:piggy-bank',  // 多个硬币图标
  'credit-card': 'mynaui:credit-card',
  'gift': 'mynaui:gift',
  'discount': 'mynaui:ticket',
  'trophy': 'fluent:trophy-48-regular',
  'medal': 'hugeicons:medal-01',
  'crown': 'material-symbols:crown-rounded',
  'diamond': 'hugeicons:diamond-02',
  'ticket': 'mynaui:ticket',
  'qrcode': 'f7:qrcode',
  'barcode': 'mynaui:scan',  // 扫描图标
  'notification': 'mynaui:bell',
  'mail': 'proicons:mail',
  'help': 'mynaui:question-circle',
  'info': 'mynaui:info-circle',
  'warning': 'mynaui:danger-triangle',
  'error': 'mynaui:x-circle',
  'success': 'mynaui:check-circle',
  'success-solid': 'mynaui:check-circle-solid',
  'x-circle': 'mynaui:x-circle',
  'rotate-ccw': 'lucide:rotate-ccw',
  'alert-circle': 'ion:alert-circle-outline',
  'headphones': 'mynaui:headphones',
  'shopping-bag': 'heroicons:shopping-bag',
  'shopping-cart-check': 'fa6-solid:cart-shopping',
  'towels': 'hugeicons:towels',
  'pill': 'ph:pill',
  'goods': 'ep:goods',
  'book': 'mage:book',
  'sun': 'mynaui:sun',
  'refresh': 'mynaui:yen-circle',
  'chart': 'mynaui:chart-bar-one',
  'percentage': 'basil:chart-pie-alt-outline',
  'rocket': 'mynaui:rocket',
  'map': 'mynaui:map',
  'monitor': 'si:monitor-line',
  'volume': 'mynaui:volume',
  'volumeOff': 'mynaui:volume-x',
  'volumeSlash': 'mynaui:volume-slash',
  'spray': 'ph:spray-bottle',
  'ruler': 'mynaui:ruler',
  'sparkle': 'mynaui:sparkles',
  'microphone': 'mynaui:microphone', 
  'food': 'hugeicons:serving-food',
  'armchair': 'solar:armchair-linear',
  'chair': 'hugeicons:office-chair',
  'movie': 'fluent:video-32-regular',
  'keyboard': 'mynaui:keyboard',
  'elevator': 'mynaui:elevator',
  'wardrobe': 'hugeicons:wardrobe-01',
  'desk': 'hugeicons:desk-02',
  'room': 'fluent:conference-room-28-regular',
  'receipt': 'solar:file-text-linear',
  'wechatPay': 'tdesign:logo-wechatpay-filled',
  'wechat': 'mdi:wechat',
  'brand-wechat': 'ph:wechat-logo',
  'alipay': 'ant-design:alipay-outlined',
  'file': 'mynaui:file-text',
  'unlock': 'mynaui:lock-open-password',
  'shield-check': 'solar:shield-check-linear',
  'zap': 'mynaui:zap',
  'zap-off': 'mynaui:zap-off',
  'moon': 'mynaui:moon',
  'fingerprint': 'fluent:fingerprint-32-regular',
  'link': 'formkit:link',
  'download': 'mynaui:download',
  'userMinus': 'hugeicons:user-block-01',
  'bug': 'solar:bug-outline',
  'lightbulb': 'basil:lightbulb-alt-outline',
  'others': 'hugeicons:chat-feedback-01',
  'service': 'hugeicons:service',
  'brand-weibo': 'ri:weibo-fill',
  'brand-tiktok': 'ic:round-tiktok',
  'thumbs-up': 'proicons:thumbs-up',
  'cart': 'famicons:cart-outline',
  'package': 'mynaui:package',
  'truck': 'mynaui:truck',
}

export default {
  name: 'Icon',
  components: {
    Iconify
  },
  props: {
    name: {
      type: String,
      required: true
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['xsmall', 'small', 'medium', 'large', 'xlarge'].includes(value)
    },
    color: {
      type: String,
      default: 'inherit'
    },
    clickable: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click'],
  setup(props, { emit }) {
    const iconName = computed(() => {
      return MYNA_ICONS[props.name] || 'mynaui:help-circle'
    })
    
    const iconSize = computed(() => {
      const sizeMap = {
        xsmall: '26rpx',
        small: '32rpx',
        medium: '48rpx',
        large: '64rpx',
        xlarge: '80rpx'
      }
      return sizeMap[props.size] || sizeMap.medium
    })
    
    const iconStyle = computed(() => {
      return {
        cursor: props.clickable ? 'pointer' : 'default'
      }
    })
    
    const handleClick = (event) => {
      if (props.clickable) {
        emit('click', event)
      }
    }
    
    return {
      iconName,
      iconSize,
      iconStyle,
      handleClick
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &--xsmall {
    width: 26rpx;
    height: 26rpx;
  }

  &--small {
    width: 32rpx;
    height: 32rpx;
  }
  
  &--medium {
    width: 48rpx;
    height: 48rpx;
  }
  
  &--large {
    width: 64rpx;
    height: 64rpx;
  }
  
  &--xlarge {
    width: 80rpx;
    height: 80rpx;
  }
  
  &--clickable {
    transition: transform 0.2s ease;
    
    &:active {
      transform: scale(0.9);
    }
  }
  
  &__svg {
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>