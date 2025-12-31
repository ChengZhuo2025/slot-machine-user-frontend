<template>
  <view class="page">
    <view class="page-bgimg"></view>

    <!-- 自定义标题栏 -->
    <view class="header-bar" :class="{ scrolled: isScrolled }">
      <view class="header-left">
        <text class="header-title">个人中心</text>
      </view>
      <view class="header-center"></view>
      <view class="header-right" @click="openModal('message')">
        <Icon name="bell" size="medium" :color="isScrolled ? '#333' : '#fff'" />
        <view v-if="unreadMessageCount > 0" class="message-badge">
          <text class="badge-text">{{ unreadMessageCount > 99 ? '99+' : unreadMessageCount }}</text>
        </view>
      </view>
    </view>

    <!-- 页面内容 -->
    <scroll-view class="page-content" scroll-y="true" @scroll="onScroll" :show-scrollbar="false">
      <!-- 顶部氛围与资产总览 -->
      <view class="hero-section animate__animated animate__fadeInDown">
        <view class="hero-glass"></view>
        <view class="hero-card">
          <view class="hero-main">
            <view class="user-avatar-container" @click="changeAvatar">
              <image :src="userInfo.avatar || '/static/images/default-avatar.png'" class="user-avatar" mode="aspectFill" />
              <view v-if="memberInfo.isVip" class="vip-badge">
                <Icon name="crown" size="small" color="#fff" />
              </view>
            </view>

            <view class="user-info" @click="openModal('editProfile')">
              <view class="user-name-row">
                <text class="user-name">{{ userInfo.nickname || '未设置昵称' }}</text>
                <view v-if="userInfo.isVerified" class="verified-icon">
                  <Icon name="check" size="small" color="#fff" />
                </view>
              </view>
              <text class="user-phone">注册手机号: {{ maskedPhone }}</text>
            </view>

            <view class="checkin-btn" @click="openModal('checkin')">
              <Icon name="calendarCheck" size="small" color="#fff" />
              <text class="checkin-text">签到</text>
            </view>
          </view>

          <view class="member-service-section animate__animated animate__bounceIn">
            <view v-if="!userStore.isMember" class="member-card member-card-inactive" @click="openModal('membership')">
              <view class="member-content">
                <view class="member-header">
                  <Icon name="crown" size="medium" color="#8B4513" />
                  <text class="member-status-text">暂未开通会员服务</text>
                </view>
                <text class="member-benefits-text">专享折扣 · 优先预订 · 积分翻倍</text>
              </view>
              <view class="member-action-button">
                <text class="action-button-text">立即开通</text>
                <Icon name="chevron-right" size="small" color="#8B4513" />
              </view>
            </view>

            <view v-else class="member-card member-card-active">
              <view class="member-content">
                <view class="member-header">
                  <Icon name="crown" size="medium" color="#FFD700" />
                  <text class="member-level-text">您已开通{{ userStore.memberLevel || '黄金' }}会员</text>
                </view>
                <text class="member-expiry-text">有效期至 {{ userStore.memberExpiry || '2024.12.31' }}</text>
              </view>
              <view class="member-action-button member-action-manage">
                <text class="action-button-text">升级续费</text>
                <Icon name="chevron-right" size="small" color="#fff" />
              </view>
            </view>
          </view>

          <view class="hero-stats">
            <view class="stat-card">
              <view class="stat-title">账户余额</view>
              <view class="stat-value">¥{{ accountBalance }}</view>
              <view class="stat-actions">
                <view class="stat-btn" @click="openModal('balanceDetail')">
                  <text class="btn-text">余额明细</text>
                </view>
                <view class="stat-btn" @click="openModal('withdraw')">
                  <text class="btn-text">余额提现</text>
                </view>
              </view>
            </view>
            <view class="stat-card">
              <view class="stat-title">积分余额</view>
              <view class="stat-value">{{ pointsBalance }}</view>
              <view class="stat-actions">
                <view class="stat-btn" @click="openModal('pointsDetail')">
                  <text class="btn-text">积分明细</text>
                </view>
                <view class="stat-btn" @click="openModal('pointsExchange')">
                  <text class="btn-text">积分兑换</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 快捷菜单 -->
      <view class="quick-actions animate__animated animate__fadeInUp">
        <view v-for="(action, index) in quickActions" :key="index" class="quick-action-item" @click="goToQuickAction(action.action, action.title)">
          <view class="quick-icon">
            <Icon :name="action.icon" size="medium" :color="action.color" />
          </view>
          <text class="quick-title">{{ action.title }}</text>
        </view>
      </view>

      <!-- 优惠信息区域 -->
      <view class="coupon-section animate__animated animate__fadeInLeft">
        <view class="coupon-grid">
          <view class="coupon-item" @click="receiveCoupon('newbie')">
            <view class="coupon-amount">
              <text class="coupon-value">50</text>
              <text class="coupon-unit">元</text>
            </view>
            <view class="coupon-info">
              <text class="coupon-title">新人体验券</text>
              <text class="coupon-desc">新用户专享</text>
            </view>
            <view class="coupon-button" :class="{ claimed: couponStatus.newbie }">
              <text class="coupon-button-text">{{ couponStatus.newbie ? '已领取' : '领取' }}</text>
            </view>
          </view>
          <view class="coupon-item" @click="receiveCoupon('discount')">
            <view class="coupon-amount">
              <text class="coupon-value">100</text>
              <text class="coupon-unit">元</text>
            </view>
            <view class="coupon-info">
              <text class="coupon-title">满减券</text>
              <text class="coupon-desc">满300可用</text>
            </view>
            <view class="coupon-button" :class="{ claimed: couponStatus.discount }">
              <text class="coupon-button-text">{{ couponStatus.discount ? '已领取' : '领取' }}</text>
            </view>
          </view>
          <view class="coupon-item monthly-card" @click="buyMonthlyCard">
            <view class="coupon-amount">
              <text class="coupon-value">599</text>
              <text class="coupon-unit">元</text>
            </view>
            <view class="coupon-info">
              <text class="coupon-title">包月卡</text>
              <text class="coupon-desc">免费互动4次</text>
            </view>
            <view class="coupon-button" :class="{ claimed: couponStatus.monthlyCard }">
              <text class="coupon-button-text">{{ couponStatus.monthlyCard ? '已开通' : '开通' }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 系统设置区域 -->
      <view class="tools-section animate__animated animate__fadeInUp">
        <view class="section-header">
          <text class="section-title">系统设置</text>
          <text class="section-subtitle">个性化配置和安全设置</text>
        </view>
        <view class="tools-list">
          <view v-for="(tool, index) in toolsList" :key="index" class="tool-item" @click="goToTool(tool.action, tool.label)">
            <view class="tool-icon" :style="{ background: tool.bg || '#F3F4F6' }">
              <Icon :name="tool.icon" size="medium" :color="tool.color" />
            </view>
            <view class="tool-texts">
              <text class="tool-label">{{ tool.label }}</text>
              <text class="tool-desc">{{ tool.desc }}</text>
            </view>
            <view class="tool-action">
              <Icon name="chevron-right" size="medium" color="#ddd" />
            </view>
          </view>
        </view>
      </view>

      <!-- 帮助&反馈区域 -->
      <view class="settings-section animate__animated animate__fadeInUp">
        <view class="section-header">
          <text class="section-title">帮助&反馈</text>
          <text class="section-subtitle">意见反馈和客户服务</text>
        </view>
        <view class="settings-list">
          <view v-for="(setting, index) in settingsList" :key="index" class="setting-item" @click="goToSetting(setting.action, setting.label)">
            <view class="setting-icon" :style="{ background: setting.bg || '#F3F4F6' }">
              <Icon :name="setting.icon" size="medium" :color="setting.color" />
            </view>
            <view class="setting-texts">
              <text class="setting-label">{{ setting.label }}</text>
              <text class="setting-desc">{{ setting.desc }}</text>
            </view>
            <view class="setting-action">
              <Icon name="chevron-right" size="medium" color="#ddd" />
            </view>
          </view>
        </view>
      </view>

      <!-- 公司版权信息 -->
      <view class="footer-section animate__animated animate__fadeInUp">
        <view class="company-info">
          <text class="company-name">© 2024 爱上杜美人科技有限公司</text>
          <text class="company-details">杭州市西湖区文三路259号 | 客服热线：400-888-9999</text>
          <text class="icp-info">浙ICP备2024001234号-1 | 浙公网安备33010602012345号</text>
        </view>
      </view>
    </scroll-view>

    <!-- 自定义底部导航 -->
    <CustomTabBar :current="4" />

    <!-- Modal弹窗 -->
    <Modal v-model="modals.editProfile" title="编辑资料" size="large">
      <EditProfile :userInfo="userInfo" @save="handleProfileSave" @avatarChange="handleAvatarChange" />
    </Modal>

    <Modal v-model="modals.checkin" title="签到打卡" size="large">
      <CheckIn @checkin="handleCheckin" />
    </Modal>

    <Modal v-model="modals.balanceDetail" title="余额明细" size="full">
      <BalanceDetail :balance="accountBalance" />
    </Modal>

    <Modal v-model="modals.withdraw" title="余额提现" size="large">
      <Withdraw :balance="accountBalance" @success="handleWithdrawSuccess" />
    </Modal>

    <Modal v-model="modals.pointsDetail" title="积分明细" size="full">
      <PointsDetail :points="pointsBalance" />
    </Modal>

    <Modal v-model="modals.pointsExchange" title="积分兑换" size="full">
      <PointsExchange :points="pointsBalance" @exchange="handlePointsExchange" />
    </Modal>

    <Modal v-model="modals.orders" title="我的订单" size="full">
      <MyOrders />
    </Modal>

    <Modal v-model="modals.favorites" title="我的收藏" size="full">
      <MyFavorites />
    </Modal>

    <Modal v-model="modals.address" title="收货地址" size="full">
      <AddressManager />
    </Modal>

    <Modal v-model="modals.message" title="消息中心" size="full">
      <MessageCenter />
    </Modal>

    <Modal v-model="modals.notifications" title="通知设置" size="full">
      <NotificationSettings />
    </Modal>

    <Modal v-model="modals.security" title="账户安全" size="full">
      <AccountSecurity />
    </Modal>

    <Modal v-model="modals.privacy" title="隐私设置" size="full">
      <PrivacySettings />
    </Modal>

    <Modal v-model="modals.feedback" title="意见反馈" size="full">
      <Feedback />
    </Modal>

    <Modal v-model="modals.helpCenter" title="帮助中心" size="full">
      <HelpCenter />
    </Modal>

    <Modal v-model="modals.customerService" title="联系客服" size="full">
      <CustomerService />
    </Modal>

    <Modal v-model="modals.about" title="关于我们" size="full">
      <About />
    </Modal>

    <Modal v-model="modals.membership" title="会员服务" size="large">
      <view class="placeholder-content">
        <Icon name="crown" size="xlarge" color="#ccc" />
        <text class="placeholder-text">会员开通功能开发中</text>
      </view>
    </Modal>
  </view>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import CustomTabBar from '@/components/layout/CustomTabBar.vue'
import Icon from '@/components/common/Icon.vue'
import Modal from '@/components/common/Modal.vue'
import EditProfile from '@/components/user/EditProfile.vue'
import CheckIn from '@/components/user/CheckIn.vue'
import BalanceDetail from '@/components/user/BalanceDetail.vue'
import Withdraw from '@/components/user/Withdraw.vue'
import PointsDetail from '@/components/user/PointsDetail.vue'
import PointsExchange from '@/components/user/PointsExchange.vue'
import MyOrders from '@/components/user/MyOrders.vue'
import MyFavorites from '@/components/user/MyFavorites.vue'
import AddressManager from '@/components/user/AddressManager.vue'
import MessageCenter from '@/components/user/MessageCenter.vue'
import NotificationSettings from '@/components/user/NotificationSettings.vue'
import AccountSecurity from '@/components/user/AccountSecurity.vue'
import PrivacySettings from '@/components/user/PrivacySettings.vue'
import Feedback from '@/components/user/Feedback.vue'
import HelpCenter from '@/components/user/HelpCenter.vue'
import CustomerService from '@/components/user/CustomerService.vue'
import About from '@/components/user/About.vue'

export default {
  name: 'UserIndexPage',
  components: {
    CustomTabBar,
    Icon,
    Modal,
    EditProfile,
    CheckIn,
    BalanceDetail,
    Withdraw,
    PointsDetail,
    PointsExchange,
    MyOrders,
    MyFavorites,
    AddressManager,
    MessageCenter,
    NotificationSettings,
    AccountSecurity,
    PrivacySettings,
    Feedback,
    HelpCenter,
    CustomerService,
    About
  },
  // 页面配置
  onPageScroll(e) {
    // 这里需要通过组件实例来更新状态
    if (this.updateScrollState) {
      this.updateScrollState(e.scrollTop);
    }
  },
  setup() {
    const userStore = useUserStore()
    const isScrolled = ref(false)

    // Modal状态管理
    const modals = reactive({
      editProfile: false,
      checkin: false,
      balanceDetail: false,
      withdraw: false,
      pointsDetail: false,
      pointsExchange: false,
      orders: false,
      favorites: false,
      address: false,
      message: false,
      notifications: false,
      security: false,
      privacy: false,
      feedback: false,
      helpCenter: false,
      customerService: false,
      about: false,
      membership: false
    })

    // 用户基本信息
    const userInfo = reactive({
      nickname: '大包子',
      avatar: '',
      phone: '18600165902',
      isVerified: true
    })

    const memberInfo = reactive({
      isVip: true,
      expiresAt: '2025.12.31'
    })

    const accountBalance = ref('1,258.50')
    const pointsBalance = ref('8,520')
    const unreadMessageCount = ref(5)

    const couponStatus = reactive({
      newbie: false,
      discount: false,
      monthlyCard: false
    })

    const quickActions = ref([
      { title: '我的订单', icon: 'list', color: '#3B82F6', action: 'orders' },
      { title: '我的收藏', icon: 'heart', color: '#EF4444', action: 'favorites' },
      { title: '收货地址', icon: 'location', color: '#10c467', action: 'address' },
      { title: '分销中心', icon: 'wallet', color: '#F59E0B', action: 'distribution' }
    ])

    const toolsList = ref([
      { label: '通知设置', icon: 'notification', color: '#F59E0B', action: 'notifications', desc: '控制推送提醒', bg: 'rgba(245, 158, 11, 0.1)' },
      { label: '账户安全', icon: 'safe', color: '#d746f0', action: 'security', desc: '动态验证更安全', bg: 'rgba(215, 70, 240, 0.1)' },
      { label: '隐私设置', icon: 'eye', color: '#8B5CF6', action: 'privacy', desc: '管理信息权限', bg: 'rgba(139, 92, 246, 0.1)' },
      { label: '清除缓存', icon: 'delete', color: '#EF4444', action: 'clear_cache', desc: '释放存储空间', bg: 'rgba(239, 68, 68, 0.1)' }
    ])

    const settingsList = ref([
      { label: '建议反馈', icon: 'edit', color: '#10c467', action: 'feedback', desc: '告诉我们您的建议', bg: 'rgba(16, 196, 103, 0.1)' },
      { label: '帮助中心', icon: 'help', color: '#F59E0B', action: 'help_center', desc: '常见问题和使用指南', bg: 'rgba(245, 158, 11, 0.1)' },
      { label: '联系客服', icon: 'headphones', color: '#3B82F6', action: 'customer_service', desc: '专属客服在线服务', bg: 'rgba(59, 130, 246, 0.1)' },
      { label: '关于我们', icon: 'info', color: '#6B7280', action: 'about', desc: '了解品牌故事和版本信息', bg: 'rgba(107, 114, 128, 0.1)' }
    ])

    const maskedPhone = computed(() => {
      if (!userInfo.phone) return '未绑定手机'
      return userInfo.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    })

    // 打开Modal
    const openModal = (modalName) => {
      modals[modalName] = true
    }

    // 修改头像
    const changeAvatar = () => {
      uni.chooseImage({
        count: 1,
        sourceType: ['album', 'camera'],
        success: (res) => {
          userInfo.avatar = res.tempFilePaths[0]
          uni.showToast({ title: '头像已更新', icon: 'success' })
        }
      })
    }

    // 处理资料保存
    const handleProfileSave = (data) => {
      Object.assign(userInfo, data)
      modals.editProfile = false
      uni.showToast({ title: '资料已更新', icon: 'success' })
    }

    // 处理头像修改
    const handleAvatarChange = (avatar) => {
      userInfo.avatar = avatar
    }

    // 处理签到
    const handleCheckin = (data) => {
      pointsBalance.value = String(parseInt(pointsBalance.value.replace(/,/g, '')) + data.points)
    }

    // 处理提现成功
    const handleWithdrawSuccess = (data) => {
      const balance = parseFloat(accountBalance.value.replace(/,/g, ''))
      const newBalance = balance - parseFloat(data.amount)
      accountBalance.value = newBalance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      modals.withdraw = false
    }

    // 处理积分兑换
    const handlePointsExchange = (product) => {
      const points = parseInt(pointsBalance.value.replace(/,/g, ''))
      const newPoints = points - product.points
      pointsBalance.value = newPoints.toLocaleString('zh-CN')
    }

    // 快捷操作
    const goToQuickAction = (action, title) => {
      switch (action) {
        case 'orders':
          openModal('orders')
          break
        case 'favorites':
          openModal('favorites')
          break
        case 'address':
          openModal('address')
          break
        case 'distribution':
          uni.switchTab({ url: '/pages/distribution/index' })
          break
        default:
          uni.showToast({ title: `${title}功能开发中`, icon: 'none' })
      }
    }

    // 工具设置
    const goToTool = (action, label) => {
      switch (action) {
        case 'notifications':
          openModal('notifications')
          break
        case 'security':
          openModal('security')
          break
        case 'privacy':
          openModal('privacy')
          break
        case 'clear_cache':
          uni.showModal({
            title: '清除缓存',
            content: '确定要清除应用缓存吗?',
            success: (res) => {
              if (res.confirm) {
                uni.showToast({ title: '缓存清除成功', icon: 'success' })
              }
            }
          })
          break
        default:
          uni.showToast({ title: `${label}功能开发中`, icon: 'none' })
      }
    }

    // 帮助反馈
    const goToSetting = (action, label) => {
      switch (action) {
        case 'feedback':
          openModal('feedback')
          break
        case 'help_center':
          openModal('helpCenter')
          break
        case 'customer_service':
          openModal('customerService')
          break
        case 'about':
          openModal('about')
          break
        default:
          uni.showToast({ title: `${label}功能开发中`, icon: 'none' })
      }
    }

    // 滚动监听
    const onScroll = (e) => {
      const { scrollTop } = e.detail;
      isScrolled.value = scrollTop > 50;
    };

    // 页面滚动状态更新
    const updateScrollState = (scrollTop) => {
      isScrolled.value = scrollTop > 50;
    };


    // 优惠券相关
    const receiveCoupon = (type) => {
      if (couponStatus[type]) {
        uni.showToast({ title: '您已领取过该优惠券', icon: 'none' })
        return
      }
      couponStatus[type] = true
      uni.showToast({ title: '优惠券领取成功', icon: 'success' })
    }

    const buyMonthlyCard = () => {
      if (couponStatus.monthlyCard) {
        uni.showToast({ title: '您已开通包月卡', icon: 'none' })
        return
      }
      couponStatus.monthlyCard = true
      uni.showToast({ title: '包月卡开通成功', icon: 'success' })
    }

    onMounted(() => {
      console.log('个人中心页面加载完成')
    })

    return {
      userStore,
      isScrolled,
      modals,
      userInfo,
      memberInfo,
      accountBalance,
      pointsBalance,
      unreadMessageCount,
      couponStatus,
      quickActions,
      toolsList,
      settingsList,
      maskedPhone,
      openModal,
      changeAvatar,
      handleProfileSave,
      handleAvatarChange,
      handleCheckin,
      handleWithdrawSuccess,
      handlePointsExchange,
      goToQuickAction,
      goToTool,
      goToSetting,
      onScroll,
      updateScrollState,
      receiveCoupon,
      buyMonthlyCard
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.page {
  min-height: 100vh;
  background-color: $background-secondary;
  padding-bottom: 30rpx;
  display: flex;
  flex-direction: column;
}

.page-bgimg {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 0;
  width: 100vw;
  height: 100vh;
  background-image: url(../../static/images/bg2.jpg);
  background-size: cover;
  background-attachment: fixed;
  background-position: center center;
  background-repeat: no-repeat;
}

// 标题栏
.header-bar {
  @include flex-between();
  align-items: center;
  padding: $spacing-base $spacing-lg;
  position: fixed;
  width: 100vw;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;

  &.scrolled {
    background-color: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20rpx);
    @include shadow(sm);

    .header-left .header-title {
      color: $text-primary;
    }
  }

  .header-left {
    flex: 0 0 auto;

    .header-title {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: #fff;
      transition: color 0.3s ease;
    }
  }

  .header-center {
    flex: 1;
    text-align: center;
  }

  .header-right {
    flex: 0 0 auto;
    width: 54rpx;
    height: 54rpx;
    @include flex-center();
    position: relative;
  }

  .message-badge {
    position: absolute;
    top: -10rpx;
    right: -10rpx;
    background: rgba($error-color, 0.85);
    border-radius: $border-radius-full;
    min-width: 32rpx;
    height: 32rpx;
    @include flex-center();

    .badge-text {
      font-size: $font-size-xs;
      font-weight: $font-weight-semibold;
      color: #fff;
      line-height: 1;
    }
  }
}

.page-content {
  flex: 1;
  padding: 0 0 $spacing-lg;
}

// 顶部英雄区域
.hero-section {
  position: relative;

  .hero-glass {
    position: absolute;
    border-radius: 0 0 30rpx 30rpx;
    inset: -32rpx -32rpx 0;
    filter: blur(20rpx);
    background:
      radial-gradient(
        circle at 20% 20%,
        rgba(215, 70, 240, 0.65),
        transparent 70%
      ),
      radial-gradient(
        circle at 85% 15%,
        rgba(59, 130, 246, 0.65),
        transparent 80%
      ),
      linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.35),
        rgba(255, 255, 255, 0.25)
      );
    z-index: 0;
  }

  .hero-card {
    position: relative;
    z-index: 1;
    padding: 120rpx $spacing-lg $spacing-lg;
    overflow: hidden;
  }

  .hero-main {
    display: flex;
    align-items: center;
    gap: $spacing-base;
    padding-bottom: $spacing-base;
  }

  .user-avatar-container {
    position: relative;
    width: 110rpx;
    height: 110rpx;
    border-radius: 50%;
    border: 8rpx solid rgba(255, 255, 255, 0.6);
    box-shadow: 0 12rpx 28rpx rgba(155, 0, 200, 0.15);
    flex-shrink: 0;

    .user-avatar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }

    .vip-badge {
      position: absolute;
      top: -8rpx;
      right: -8rpx;
      width: 44rpx;
      height: 44rpx;
      border-radius: 50%;
      border: 3rpx solid rgba(255, 255, 255, 0.35);
      background: linear-gradient(135deg, #ffe96b 0%, #ffb300 100%);
      @include flex-center();
    }
  }

  .user-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4rpx;
    min-width: 0;

    .user-name-row {
      @include flex();
      align-items: center;
      gap: 8rpx;

      .user-name {
        font-size: $font-size-lg;
        font-weight: $font-weight-bold;
        color: #fff;
        letter-spacing: 1rpx;
        @include ellipsis();
      }

      .verified-icon {
        width: 32rpx;
        height: 32rpx;
        border-radius: $border-radius-full;
        background: rgba(16, 196, 103, 0.75);
        @include flex-center();
        flex-shrink: 0;
      }
    }

    .user-phone {
      font-size: $font-size-xs;
      font-weight: $font-weight-medium;
      color: rgba(255, 255, 255, 0.75);
      @include ellipsis();
    }
  }
  
  .checkin-btn {
    @include flex-center();
    gap: 8rpx;
    padding: $spacing-sm $spacing-base $spacing-sm $spacing-sm;
    background: rgba(255, 255, 255, 0.2);
    border-radius: $border-radius-2xl;
    box-shadow: 0 12rpx 28rpx rgba(155, 0, 200, 0.08);
    transition: all 0.2s ease;
    flex-shrink: 0;
    
    &:active {
      transform: scale(0.95);
      background: rgba(255, 255, 255, 0.3);
    }
    
    .checkin-text {
      font-size: $font-size-xs;
      color: rgba(255, 255, 255, 0.9);
      font-weight: $font-weight-semibold;
    }
  }

  .hero-stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: $spacing-base;
    margin-top: $spacing-base;

    .stat-card {
      @include flex-center();
      padding: $spacing-base;
      border-radius: 24rpx;
      background: rgba(255, 255, 255, 1);
      flex-direction: column;
      transition: transform $transition-base;

      &:active {
        transform: scale(0.98);
      }

      .stat-title {
        font-size: $font-size-sm;
        color: $text-secondary;
        font-weight: $font-weight-medium;
      }

      .stat-value {
        font-size: $font-size-xl;
        font-weight: $font-weight-semibold;
        line-height: 1;
        letter-spacing: 2rpx;
        margin: $spacing-sm 0;
        background: $gradient-primary;
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .stat-actions {
        flex: 1;
        width: 100%;
        @include flex-center();
        gap: $spacing-sm;
        margin-top: $spacing-xs;

        .stat-btn {
          flex: 1;
          padding: $spacing-xs;
          border-radius: $border-radius-base;
          @include flex-center();
          transition: all 0.2s ease;

          &:nth-child(1) {
            border: 2rpx solid $primary-dark;

            .btn-text {
              font-size: $font-size-xs;
              color: $primary-dark;
              font-weight: $font-weight-medium;
            }
          }

          &:nth-child(2) {
            background: $gradient-primary;

            .btn-text {
              font-size: $font-size-xs;
              color: rgba(255, 255, 255, 0.9);
              font-weight: $font-weight-medium;
            }
          }

          &:active {
            transform: scale(0.95);
            background: rgba(255, 255, 255, 0.25);
          }
        }
      }
    }
  }
}

// 快捷菜单区域
.quick-actions {
  padding: 0 $spacing-base $spacing-lg;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-base;

  .quick-action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-sm;
    transition: all 0.2s ease;

    &:active {
      transform: scale(0.95);
    }

    .quick-icon {
      width: 88rpx;
      height: 88rpx;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 12rpx 32rpx rgba(115, 0, 200, 0.1);
      @include flex-center();
    }

    .quick-title {
      font-size: $font-size-xs;
      color: $text-primary;
      font-weight: $font-weight-semibold;
      text-align: center;
      line-height: 1.2;
    }
  }
}

// 通用区域头部样式
.section-header {
  @include flex-center();
  gap: $spacing-sm;
  flex-wrap: wrap;
  padding: $spacing-xs $spacing-xs $spacing-sm;

  .section-line {
    flex: 1;
    height: 1px;
    background: rgba(0, 0, 0, 0.2);
  }

  .section-title {
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
    color: $text-primary;
  }

  .section-subtitle {
    font-size: $font-size-xs;
    color: $text-tertiary;
    flex: 1;
    min-width: 220rpx;
  }

  .header-action {
    @include flex-center();
    margin-left: auto;

    .action-text {
      font-size: $font-size-sm;
      color: $text-secondary;
      font-weight: $font-weight-medium;
    }
  }
}

// 会员服务区
.member-service-section {
  .member-card {
    padding: $spacing-lg;
    border-radius: $border-radius-xl;
    box-shadow: 0 8rpx 16rpx rgba(115, 0, 200, 0.2);
    @include flex-between();
    align-items: center;
    position: relative;

    &.member-card-inactive {
      background: linear-gradient(135deg, #ffe96b 0%, #ffb300 100%);

      .member-content {
        flex: 1;

        .member-header {
          @include flex();
          align-items: center;
          gap: $spacing-xs;

          .member-status-text {
            font-size: $font-size-base;
            color: #8b4513;
            font-weight: $font-weight-bold;
          }
        }

        .member-benefits-text {
          font-size: $font-size-xs;
          color: #a0522d;
          line-height: 1.4;
          font-weight: $font-weight-medium;
        }
      }

      .member-action-button {
        @include flex();
        align-items: center;
        gap: $spacing-xs;
        padding: $spacing-sm $spacing-sm $spacing-sm $spacing-lg;
        background: rgba(255, 255, 255, 0.65);
        border-radius: 40rpx;
        transition: all 0.2s ease;

        &:active {
          transform: scale(0.95);
          background: rgba(255, 255, 255, 0.8);
        }

        .action-button-text {
          font-size: $font-size-sm;
          color: #8b4513;
          font-weight: $font-weight-bold;
        }
      }
    }

    &.member-card-active {
      background: linear-gradient(135deg, #ffe138 0%, #ffa500 100%);

      .member-content {
        flex: 1;

        .member-header {
          @include flex();
          align-items: center;
          gap: $spacing-xs;
          margin-bottom: $spacing-xs;

          .member-level-text {
            font-size: $font-size-base;
            color: #8b4513;
            font-weight: $font-weight-bold;
          }
        }

        .member-expiry-text {
          font-size: $font-size-sm;
          color: #a0522d;
          font-weight: $font-weight-medium;
        }
      }

      .member-action-manage {
        @include flex();
        align-items: center;
        gap: $spacing-xs;
        padding: $spacing-sm $spacing-xs $spacing-sm $spacing-base;
        background: rgba(139, 69, 19, 0.15);
        border-radius: $border-radius-lg;
        transition: all 0.2s ease;

        &:active {
          transform: scale(0.95);
          background: rgba(139, 69, 19, 0.25);
        }

        .action-button-text {
          font-size: $font-size-sm;
          color: #8b4513;
          font-weight: $font-weight-bold;
        }
      }
    }
  }
}

// 工具服务区域
.tools-section {
  margin: 0 $spacing-lg $spacing-lg;

  .tools-list {
    background: $background-primary;
    border-radius: $border-radius-xl;
    padding: $spacing-xs 0;
    overflow: hidden;

    .tool-item {
      display: flex;
      align-items: center;
      gap: $spacing-base;
      padding: $spacing-base $spacing-lg;
      border-bottom: 2rpx solid $border-light;
      transition: background-color $transition-base;

      &:last-child {
        border-bottom: none;
      }

      &:active {
        background: $background-secondary;
      }

      .tool-icon {
        width: 96rpx;
        height: 96rpx;
        border-radius: 24rpx;
        @include flex-center();
      }

      .tool-texts {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4rpx;

        .tool-label {
          font-size: $font-size-base;
          font-weight: $font-weight-semibold;
          color: $text-primary;
        }

        .tool-desc {
          font-size: $font-size-xs;
          color: $text-tertiary;
        }
      }

      .tool-action {
        @include flex-center();
      }
    }
  }
}

// 优惠信息区域
.coupon-section {
  margin: 0 $spacing-lg $spacing-lg;

  .coupon-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-base;

    .coupon-item {
      padding: $spacing-base $spacing-sm;
      border-radius: $border-radius-xl;
      text-align: center;
      position: relative;
      background: #fff;
      box-shadow: 0 12rpx 32rpx rgba(115, 0, 200, 0.1);
      transition: transform $transition-base;

      &:active {
        transform: scale(0.95);
      }

      &.monthly-card {
        background: linear-gradient(135deg, #fef3c7, #fde68a);
      }

      .coupon-amount {
        padding-bottom: $spacing-xs;
        margin-bottom: $spacing-sm;
        border-bottom: 2rpx dashed rgba(0, 0, 0, 0.2);

        .coupon-value {
          font-size: $font-size-xl;
          font-weight: $font-weight-semibold;
          color: $error-color;
        }

        .coupon-unit {
          font-size: $font-size-sm;
          color: $error-color;
          margin-left: 4rpx;
        }
      }

      .coupon-info {
        .coupon-title {
          font-size: $font-size-sm;
          font-weight: $font-weight-semibold;
          color: $text-primary;
          display: block;
        }

        .coupon-desc {
          font-size: $font-size-xs;
          color: $text-secondary;
        }
      }

      .coupon-button {
        @include flex-center();
        padding: $spacing-xs $spacing-lg;
        background: $gradient-primary;
        border-radius: $border-radius-2xl;
        margin: $spacing-sm auto 0;
        transition: all 0.2s ease;

        &:active {
          transform: scale(0.95);
          opacity: 0.8;
        }

        &.claimed {
          background: $background-tertiary;

          .coupon-button-text {
            color: $text-tertiary;
          }
        }

        .coupon-button-text {
          display: flex;
          font-size: $font-size-sm;
          color: #fff;
          font-weight: $font-weight-semibold;
        }
      }
    }
  }
}

// 设置中心区域
.settings-section {
  margin: 0 $spacing-lg $spacing-xl;

  .settings-list {
    background: $background-primary;
    border-radius: $border-radius-xl;
    padding: $spacing-xs 0;
    overflow: hidden;

    .setting-item {
      display: flex;
      align-items: center;
      gap: $spacing-base;
      padding: $spacing-base $spacing-lg;
      border-bottom: 2rpx solid $border-light;
      transition: background-color $transition-base;

      &:last-child {
        border-bottom: none;
      }

      &:active {
        background: $background-secondary;
      }

      .setting-icon {
        width: 88rpx;
        height: 88rpx;
        border-radius: 20rpx;
        @include flex-center();
      }

      .setting-texts {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4rpx;

        .setting-label {
          font-size: $font-size-base;
          font-weight: $font-weight-semibold;
          color: $text-primary;
        }

        .setting-desc {
          font-size: $font-size-xs;
          color: $text-tertiary;
        }
      }

      .setting-action {
        @include flex-center();
      }
    }
  }
}

// 版权信息区域
.footer-section {
  .company-info {
    text-align: center;

    .company-name {
      font-size: $font-size-sm;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      display: block;
      margin-bottom: $spacing-xs;
    }

    .company-details {
      font-size: $font-size-xs;
      color: $text-secondary;
      display: block;
      margin-bottom: $spacing-xs;
    }

    .icp-info {
      font-size: $font-size-xs;
      color: $text-tertiary;
      display: block;
    }
  }
}

.placeholder-content {
  @include flex-center();
  flex-direction: column;
  gap: $spacing-lg;
  padding: $spacing-xl * 3;

  .placeholder-text {
    font-size: $font-size-base;
    color: $text-tertiary;
  }
}
</style>
