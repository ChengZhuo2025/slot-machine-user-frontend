<template>
  <view class="page">
    <view class="page-bgimg"></view>

    <!-- 自定义标题栏 -->
    <view class="header-bar" :class="{ scrolled: isScrolled }">
      <view class="header-left">
        <text class="header-title">分销</text>
      </view>
      <view class="header-center">
        <view class="search-bar-mini">
          <Icon name="search" size="small" color="#999" />
          <input
            class="search-input-mini"
            type="text"
            placeholder="搜索订单或团队成员"
            v-model="searchKeyword"
            @input="onSearchInput"
            @confirm="onSearchConfirm"
          />
        </view>
      </view>
      <view class="header-right">
        <view class="help-icon" @click="showHelp">
          <Icon name="help" size="medium" color="#333" />
        </view>
      </view>
    </view>

    <!-- 页面内容 -->
    <scroll-view class="page-content" scroll-y="true" @scroll="onScroll" :show-scrollbar="false">
      <!-- 分销英雄区 -->
      <view class="hero-section animate__animated animate__fadeInDown">
        <view class="hero-card">
          <view class="hero-header">
            <!-- 左侧头像 -->
            <view class="user-avatar-container" @click="showProfile">
              <image
                :src="userInfo.avatar || '/static/images/default-avatar.png'"
                class="user-avatar"
                mode="aspectFill"
              />
            </view>

            <!-- 中间分销商信息 -->
            <view class="user-info">
              <view class="user-name-row" @click="showProfile">
                <text class="user-name">{{
                  userInfo.nickname || "推广达人"
                }}</text>
                <view class="status-chip">
                  <text class="chip-text">{{ distributionStatus.level }}</text>
                </view>
              </view>
              <view class="code-row" @click="copyPromotionCode">
                <text class="code-label">推广码:</text>
                <text class="code-value">{{
                  distributionStatus.promotionCode
                }}</text>
                <view class="code-action">
                  <Icon name="copy" size="small" color="#d746f0" />
                  <text class="copy-text">复制</text>
                </view>
              </view>
            </view>

            <!-- 右侧攻略按钮 -->
            <view class="strategy-btn" @click="showUpgradeInfo">
              <Icon name="book" size="small" color="#be32d7" />
              <text class="strategy-text">攻略</text>
            </view>
          </view>
          <view class="hero-stats">
            <swiper
              class="stats-swiper"
              indicator-dots
              indicator-color="rgba(255,255,255,0.3)"
              indicator-active-color="#d746f0"
              autoplay
              interval="4000"
              duration="500"
              circular
              @change="onStatsSlideChange"
            >
              <!-- 第一屏：2个数据卡片 -->
              <swiper-item>
                <view class="stats-grid">
                  <view
                    class="stat-card gradient-purple"
                    @click="goToEarningsDetail('total')"
                  >
                    <text class="stat-label">累计收益</text>
                    <text class="stat-value"
                      >¥{{ earningsData.totalEarnings }}</text
                    >
                    <view class="stat-btn">
                      <text class="btn-text">查看明细</text>
                    </view>
                  </view>
                  <view
                    class="stat-card gradient-blue"
                    @click="goToEarningsDetail('month')"
                  >
                    <text class="stat-label">本月收益</text>
                    <text class="stat-value"
                      >¥{{ earningsData.monthEarnings }}</text
                    >
                    <view class="stat-btn">
                      <text class="btn-text">查看明细</text>
                    </view>
                  </view>
                </view>
              </swiper-item>

              <!-- 第二屏：2个数据卡片 -->
              <swiper-item>
                <view class="stats-grid">
                  <view
                    class="stat-card gradient-orange"
                    @click="goToEarningsDetail('yesterday')"
                  >
                    <text class="stat-label">昨日收益</text>
                    <text class="stat-value"
                      >¥{{ earningsData.yesterdayEarnings }}</text
                    >
                    <view class="stat-btn">
                      <text class="btn-text">查看明细</text>
                    </view>
                  </view>
                  <view
                    class="stat-card gradient-red"
                    @click="goToEarningsDetail('pending')"
                  >
                    <text class="stat-label">待结算金额</text>
                    <text class="stat-value"
                      >¥{{ earningsData.pendingSettlement }}</text
                    >
                    <view class="stat-btn">
                      <text class="btn-text">查看明细</text>
                    </view>
                  </view>
                </view>
              </swiper-item>

              <!-- 第三屏：2个数据卡片 -->
              <swiper-item>
                <view class="stats-grid">
                  <view class="stat-card gradient-teal" @click="goToWithdraw">
                    <text class="stat-label">可提现金额</text>
                    <text class="stat-value"
                      >¥{{ earningsData.withdrawableAmount }}</text
                    >
                    <view class="stat-btn primary">
                      <text class="btn-text">立即提现</text>
                    </view>
                  </view>
                  <view
                    class="stat-card gradient-green"
                    @click="goToPromotionDetail"
                  >
                    <text class="stat-label">推广用户</text>
                    <text class="stat-value">{{
                      earningsData.promotedUsers
                    }}</text>
                    <view class="stat-btn">
                      <text class="btn-text">拉新明细</text>
                    </view>
                  </view>
                </view>
              </swiper-item>
            </swiper>
          </view>
        </view>
      </view>

      <!-- 分类标签栏 -->
      <view class="category-tabs animate__animated animate__fadeInUp">
        <view class="tab-container">
          <view
            v-for="(tab, index) in tabList"
            :key="tab.id"
            class="tab-item"
            :class="{ active: activeTab === tab.id }"
            @click="switchTab(tab.id)"
          >
            <Icon
              :name="tab.icon"
              size="medium"
              :color="activeTab === tab.id ? '#be32d7' : '#999'"
            />
            <text class="tab-text">{{ tab.name }}</text>
          </view>
        </view>
      </view>

      <!-- 推广工具 -->
      <view
        class="toolkit-section animate__animated animate__fadeInUp"
        v-show="activeTab === 0"
      >
        <view class="section-header">
          <text class="section-title">推广工具箱</text>
          <text class="section-subtitle">复制粘贴，一键触达高效传播</text>
        </view>
        <view class="toolkit-grid">
          <view
            v-for="(tool, index) in promotionTools"
            :key="index"
            class="toolkit-card"
            @click="tool.handler()"
          >
            <view class="tool-icon" :style="{ background: tool.bg }">
              <Icon :name="tool.icon" size="medium" color="#fff" />
            </view>
            <view class="tool-texts">
              <text class="tool-title">{{ tool.title }}</text>
              <text class="tool-desc">{{ tool.desc }}</text>
            </view>
            <Icon name="chevron-right" size="medium" color="#ddd" />
          </view>
        </view>
      </view>

      <!-- 推广数据 -->
      <view class="data-section" v-show="activeTab === 1">
        <!-- 业绩进阶 -->
        <view class="performance-section animate__animated animate__fadeInUp">
          <view class="section-header">
            <text class="section-title">收益进阶</text>
            <text class="section-subtitle">锁定目标计划，收益稳步提升</text>
          </view>
          <view class="performance-grid">
            <view
              v-for="(card, index) in performanceCards"
              :key="index"
              class="performance-card"
            >
              <view class="card-header">
                <Icon :name="card.icon" size="small" :color="card.color" />
                <text class="card-title">{{ card.title }}</text>
              </view>
              <text class="card-value">{{ card.value }}</text>
              <view class="card-footer">
                <text class="card-note">{{ card.note }}</text>
                <text class="card-trend" :class="{ positive: card.trend > 0 }"
                  >{{ card.trend > 0 ? "+" : "" }}{{ card.trend }}%</text
                >
              </view>
            </view>
          </view>
          <view class="goal-progress">
            <view
              v-for="(goal, index) in goalProgress"
              :key="index"
              class="goal-row"
            >
              <view class="goal-top">
                <text class="goal-name">{{ goal.name }}</text>
                <text class="goal-rate">{{ goal.progress }}%</text>
              </view>
              <view class="goal-bar">
                <view
                  class="goal-fill"
                  :style="{ width: goal.progress + '%' }"
                ></view>
              </view>
              <text class="goal-desc">{{ goal.desc }}</text>
            </view>
          </view>
        </view>

        <!-- 推广漏斗 -->
        <view class="funnel-section animate__animated animate__fadeInLeft">
          <view class="section-header">
            <text class="section-title">推广漏斗</text>
            <text class="section-subtitle">关注关键节点，优化转化率</text>
          </view>
          <view class="funnel-cards">
            <view
              v-for="(step, index) in funnelSteps"
              :key="index"
              class="funnel-card"
            >
              <view class="step-top">
                <text class="step-name">{{ step.name }}</text>
                <text class="step-value">{{ step.value }}</text>
              </view>
              <view class="step-progress">
                <view
                  class="step-fill"
                  :style="{ width: step.rate + '%' }"
                ></view>
              </view>
              <text class="step-desc">{{ step.desc }}</text>
            </view>
          </view>
          <view class="funnel-actions">
            <view
              class="funnel-tip"
              v-for="(tip, index) in funnelTips"
              :key="index"
            >
              <Icon :name="tip.icon" size="small" :color="tip.color" />
              <text class="tip-text">{{ tip.text }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 成长任务 -->
      <view
        class="task-section animate__animated animate__fadeInUp"
        v-show="activeTab === 2"
      >
        <view class="section-header">
          <text class="section-title">成长任务</text>
          <text class="section-subtitle">完成任务加速升级，解锁更多佣金</text>
        </view>
        <view class="task-list">
          <view
            v-for="(task, index) in growthTasks"
            :key="index"
            class="task-item"
          >
            <view class="task-info">
              <view class="task-icon">
                <Icon :name="task.icon" size="small" :color="task.color" />
              </view>
              <text class="task-title">{{ task.title }}</text>
            </view>
            <text class="task-desc">{{ task.desc }}</text>
            <view class="task-meta">
              <text class="task-reward">+{{ task.reward }}</text>
              <view class="task-progress">
                <view
                  class="task-fill"
                  :style="{ width: task.progress + '%' }"
                ></view>
              </view>
              <text class="task-status">{{ task.status }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 规则说明 -->
      <view
        class="guide-section animate__animated animate__fadeInUp"
        v-show="activeTab === 3"
      >
        <view class="section-header">
          <text class="section-title">佣金规则</text>
          <text class="section-subtitle">了解佣金计算规则与结算周期</text>
        </view>
        <view class="guide-grid">
          <view
            v-for="(item, index) in commissionRules"
            :key="index"
            class="guide-card"
          >
            <view class="guide-icon" :style="{ background: item.bg }">
              <Icon :name="item.icon" size="medium" :color="item.color" />
            </view>
            <view class="guide-content">
              <text class="guide-title">{{ item.title }}</text>
              <text class="guide-desc">{{ item.desc }}</text>
            </view>
            <view class="guide-action" @click="item.handler()">
              <text class="guide-link">{{ item.action }}</text>
              <Icon name="chevron-right" size="medium" color="#ddd" />
            </view>
          </view>
        </view>

        <view class="section-header" style="margin-top: 40rpx">
          <text class="section-title">实战指南</text>
          <text class="section-subtitle">掌握推广技巧，收益更上一层楼</text>
        </view>
        <view class="guide-grid">
          <view
            v-for="(item, index) in practiceGuides"
            :key="index"
            class="guide-card"
          >
            <view class="guide-icon" :style="{ background: item.bg }">
              <Icon :name="item.icon" size="medium" :color="item.color" />
            </view>
            <view class="guide-content">
              <text class="guide-title">{{ item.title }}</text>
              <text class="guide-desc">{{ item.desc }}</text>
            </view>
            <view class="guide-action" @click="item.handler()">
              <text class="guide-link">{{ item.action }}</text>
              <Icon name="chevron-right" size="medium" color="#ddd" />
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 自定义底部导航 -->
    <CustomTabBar :current="3" />
  </view>
</template>

<script>
import { ref, reactive, computed, onMounted } from "vue";
import { onShow } from "@dcloudio/uni-app";
import CustomTabBar from "@/components/layout/CustomTabBar.vue";
import Icon from "@/components/common/Icon.vue";
import { requireAuth } from "@/utils/authGuard";

export default {
  name: "DistributionIndexPage",
  components: {
    CustomTabBar,
    Icon,
  },
  // 页面配置
  onPageScroll(e) {
    // 这里需要通过组件实例来更新状态
    if (this.updateScrollState) {
      this.updateScrollState(e.scrollTop);
    }
  },
  setup() {
    // 页面状态
    const isScrolled = ref(false); // 滚动状态

    // 搜索相关
    const searchKeyword = ref("");
    const showSearchHistory = ref(false);
    const searchHistory = ref([
      "流水号DM001",
      "张三",
      "138****8888",
      "上月订单",
    ]);

    // 分销状态
    const distributionStatus = reactive({
      isActivated: false,
      level: "LV1",
      roleName: "初级推广员",
      promotionCode: "DM888666",
    });

    // 用户信息
    const userInfo = reactive({
      nickname: "推广达人",
      avatar: "",
    });

    // 收益数据
    const earningsData = reactive({
      totalEarnings: "2,358.50",
      monthEarnings: "568.37",
      yesterdayEarnings: "128.62",
      pendingSettlement: "256.80",
      withdrawableAmount: "1,299.85",
      promotedUsers: 42,
    });

    // 轮播当前索引
    const currentSlideIndex = ref(0);

    // 分类标签状态
    const activeTab = ref(0);
    const tabList = ref([
      { id: 0, name: "推广工具", icon: "business" },
      { id: 1, name: "推广数据", icon: "points" },
      { id: 2, name: "成长任务", icon: "chart" },
      { id: 3, name: "规则说明", icon: "info" },
    ]);

    const performanceTargets = reactive({
      total: "3,500.00",
      monthTrend: 18.5,
      activeUsers: 34,
    });

    const performanceSnapshot = reactive({
      yesterdayEarnings: "168.40",
      averageOrder: "236.50",
      pendingSettlement: "482.00",
      withdrawTimes: 3,
      trends: {
        yesterday: 12.5,
        average: 6.3,
        settlement: 9.8,
        withdraw: -1.5,
      },
    });

    // 推广数据
    const promotionData = reactive({
      todayVisits: 125,
      registerRate: 15.6,
      purchaseRate: 8.2,
      repurchaseRate: 35.8,
    });

    const quickActions = ref([
      {
        title: "立即提现",
        desc: "24小时到账",
        icon: "credit-card",
        action: "withdraw",
      },
      {
        title: "生成海报",
        desc: "专属二维码",
        icon: "qrcode",
        action: "poster",
      },
      {
        title: "邀请好友",
        desc: "双重奖励",
        icon: "share",
        action: "share",
      },
    ]);

    const goalProgress = ref([
      {
        name: "月度收益目标",
        progress: 64,
        desc: "还差 ¥1,260.20 达成目标",
      },
      {
        name: "新增有效用户",
        progress: 52,
        desc: "本月已新增 26 位有效用户",
      },
      {
        name: "分享触达次数",
        progress: 78,
        desc: "距离奖励还差 220 次曝光",
      },
    ]);

    const funnelSteps = ref([
      {
        name: "访问量",
        value: promotionData.todayVisits,
        rate: 100,
        desc: "今日推广链接访问总数",
      },
      {
        name: "注册转化",
        value: promotionData.registerRate + "%",
        rate: promotionData.registerRate,
        desc: "访客成功注册占比",
      },
      {
        name: "首单转化",
        value: promotionData.purchaseRate + "%",
        rate: promotionData.purchaseRate,
        desc: "注册用户完成首单占比",
      },
      {
        name: "复购率",
        value: promotionData.repurchaseRate + "%",
        rate: promotionData.repurchaseRate,
        desc: "客户再次下单占比",
      },
    ]);

    const funnelTips = ref([
      {
        icon: "trophy",
        color: "#F59E0B",
        text: "优化落地页文案可提升注册转化率",
      },
      {
        icon: "medal",
        color: "#10c467",
        text: "老客复购可通过限时券刺激",
      },
    ]);

    const growthTasks = ref([
      {
        title: "完成 5 次分享",
        icon: "share",
        desc: "分享到朋友圈或社群，吸引首批访客",
        reward: "120 成长值",
        progress: 80,
        status: "进度 4/5",
      },
      {
        title: "邀请 10 位好友注册",
        icon: "user",
        desc: "好友注册并完成手机号验证",
        reward: "¥50 现金券",
        progress: 40,
        status: "进度 4/10",
      },
      {
        title: "复购用户关怀",
        icon: "gift",
        desc: "对首次消费用户发送关怀信息",
        reward: "180 成长值",
        progress: 55,
        status: "进度 11/20",
      },
    ]);

    const promotionTools = ref([]);

    const performanceCards = computed(() => [
      {
        icon: "sun",
        color: "#F59E0B",
        title: "昨日收益",
        value: `¥${performanceSnapshot.yesterdayEarnings}`,
        note: "昨日佣金入账",
        trend: performanceSnapshot.trends.yesterday,
      },
      {
        icon: "shopping-bag",
        color: "#3B82F6",
        title: "客单价",
        value: `¥${performanceSnapshot.averageOrder}`,
        note: "订单均值",
        trend: performanceSnapshot.trends.average,
      },
      {
        icon: "wallet",
        color: "#10c467",
        title: "待结算金额",
        value: `¥${performanceSnapshot.pendingSettlement}`,
        note: "预计三日内到账",
        trend: performanceSnapshot.trends.settlement,
      },
      {
        icon: "refresh",
        color: "#d746f0",
        title: "本月提现",
        value: `${performanceSnapshot.withdrawTimes} 次`,
        note: "已完成提现次数",
        trend: performanceSnapshot.trends.withdraw,
      },
    ]);

    // 方法
    const showHelp = () => {
      uni.showToast({ title: "帮助中心开发中", icon: "none" });
    };

    const showProfile = () => {
      uni.showToast({ title: "个人资料完善中", icon: "none" });
    };

    const showUpgradeInfo = () => {
      uni.showToast({ title: "等级升级功能开发中", icon: "none" });
    };

    const copyPromotionCode = () => {
      uni.setClipboardData({
        data: distributionStatus.promotionCode,
        success: () => {
          uni.showToast({ title: "推广码已复制", icon: "success" });
        },
      });
    };

    const goToWithdraw = () => {
      uni.showToast({ title: "提现功能开发中", icon: "none" });
    };

    const generateShareLink = () => {
      uni.showToast({ title: "分享链接生成中", icon: "loading" });
      setTimeout(() => {
        uni.showToast({ title: "分享链接已生成", icon: "success" });
      }, 1500);
    };

    const generateQRPoster = () => {
      uni.showToast({ title: "二维码海报生成中", icon: "loading" });
    };

    const downloadMaterials = () => {
      uni.showToast({ title: "推广素材下载中", icon: "loading" });
    };

    const shareToSocial = () => {
      uni.share({
        provider: "weixin",
        scene: "WXSceneSession",
        type: 0,
        href: "https://example.com/promotion",
        title: "爱上杜美人 - 邀请好友享优惠",
        summary: "高端主题酒店，智能设备体验，邀请好友注册即可享受专属优惠！",
        imageUrl: "/static/images/share-banner.jpg",
      });
    };

    const generateCoupon = (type) => {
      const title = type === "newbie" ? "新人体验券" : "100元满减券";
      uni.showToast({ title: `${title}生成中`, icon: "loading" });
      setTimeout(() => {
        uni.showToast({ title: `${title}已生成`, icon: "success" });
      }, 1500);
    };

    const showDetailedRules = () => {
      uni.showToast({ title: "详细规则页面开发中", icon: "none" });
    };

    const openPlaybook = () => {
      uni.showToast({ title: "打法手册开发中", icon: "none" });
    };

    const contactManager = () => {
      uni.showToast({ title: "专属经理即将上线", icon: "none" });
    };

    const openSettlementFaq = () => {
      uni.showToast({ title: "结算FAQ整理中", icon: "none" });
    };

    const openCommissionPolicy = () => {
      uni.showToast({ title: "佣金政策开发中", icon: "none" });
    };

    const openLevelRules = () => {
      uni.showToast({ title: "等级规则开发中", icon: "none" });
    };

    const openUpgradeGuide = () => {
      uni.showToast({ title: "升级攻略开发中", icon: "none" });
    };

    // 搜索相关方法
    const onSearchInput = () => {
      showSearchHistory.value = searchKeyword.value.length === 0;
    };

    const onSearchConfirm = () => {
      if (searchKeyword.value.trim()) {
        addToSearchHistory(searchKeyword.value.trim());
        showSearchHistory.value = false;
        // 执行搜索逻辑
        performSearch(searchKeyword.value.trim());
      }
    };

    const addToSearchHistory = (keyword) => {
      const history = [...searchHistory.value];
      const index = history.indexOf(keyword);
      if (index > -1) {
        history.splice(index, 1);
      }
      history.unshift(keyword);
      searchHistory.value = history.slice(0, 10);

      // 保存到本地存储
      uni.setStorageSync("distribution_search_history", searchHistory.value);
    };

    const performSearch = (keyword) => {
      console.log("搜索关键词:", keyword);
      // TODO: 实现搜索逻辑（订单、团队成员）
      uni.showToast({ title: `正在搜索“${keyword}”`, icon: "loading" });
    };

    // 滚动监听
    const onScroll = (e) => {
      const { scrollTop } = e.detail;
      isScrolled.value = scrollTop > 50;
    };

    // 页面滚动状态更新
    const updateScrollState = (scrollTop) => {
      isScrolled.value = scrollTop > 50;
    };

    const handleQuickAction = (action) => {
      if (!action) return;
      switch (action.action) {
        case "withdraw":
          goToWithdraw();
          break;
        case "poster":
          generateQRPoster();
          break;
        case "share":
          shareToSocial();
          break;
        default:
          uni.showToast({ title: "功能即将上线", icon: "none" });
      }
    };

    // 新增的方法
    const goToEarningsDetail = (type) => {
      console.log(`查看收益明细: ${type}`);
      uni.showToast({ title: `${type}收益明细功能开发中`, icon: "none" });
    };

    const goToPromotionDetail = () => {
      console.log("查看推广明细");
      uni.showToast({ title: "推广明细功能开发中", icon: "none" });
    };

    const onStatsSlideChange = (e) => {
      currentSlideIndex.value = e.detail.current;
      console.log("轮播切换到第", e.detail.current + 1, "屏");
    };

    // 分类标签切换
    const switchTab = (tabId) => {
      activeTab.value = tabId;
    };

    promotionTools.value = [
      {
        title: "专属分享链接",
        desc: "复制后发送好友/群聊",
        icon: "forward",
        bg: "linear-gradient(135deg, #d746f0 0%, #8B5CF6 100%)",
        handler: () => generateShareLink(),
      },
      {
        title: "二维码海报",
        desc: "多套模板随心切换",
        icon: "qrcode",
        bg: "linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)",
        handler: () => generateQRPoster(),
      },
      {
        title: "推广素材包",
        desc: "图文视频一键下载",
        icon: "image",
        bg: "linear-gradient(135deg, #10c467 0%, #34D399 100%)",
        handler: () => downloadMaterials(),
      },
      {
        title: "社交分享",
        desc: "同步发布至主流平台",
        icon: "share",
        bg: "linear-gradient(135deg, #F59E0B 0%, #F97316 100%)",
        handler: () => shareToSocial(),
      },
      {
        title: "新人体验券",
        desc: "首单立减50元新手福利",
        icon: "gift",
        bg: "linear-gradient(135deg, #ff8989 0%, #f35641 100%)",
        handler: () => generateCoupon("newbie"),
      },
      {
        title: "100元满减券",
        desc: "满299元可用，限时限量",
        icon: "ticket",
        bg: "linear-gradient(135deg, #FD79A8 0%, #FDCB6E 100%)",
        handler: () => generateCoupon("discount"),
      },
    ];

    // 佣金规则部分
    const commissionRules = ref([
      {
        title: "佣金比例说明",
        desc: "了解不同等级佣金比例与奖励机制",
        action: "查看详情",
        icon: "percentage",
        color: "#d746f0",
        bg: "rgba(215, 70, 240, 0.12)",
        handler: () => openCommissionPolicy(),
      },
      {
        title: "结算周期规则",
        desc: "提现时效、到账说明一文了解",
        action: "查看规则",
        icon: "clock",
        color: "#F59E0B",
        bg: "rgba(245, 158, 11, 0.12)",
        handler: () => openSettlementFaq(),
      },
      {
        title: "等级升级条件",
        desc: "了解各级别升级条件和权益",
        action: "查看条件",
        icon: "trophy",
        color: "#10c467",
        bg: "rgba(16, 196, 103, 0.12)",
        handler: () => openLevelRules(),
      },
    ]);

    // 实战指南部分
    const practiceGuides = ref([
      {
        title: "推广技巧手册",
        desc: "爆款案例与转化脚本随时查阅",
        action: "浏览手册",
        icon: "book",
        color: "#3B82F6",
        bg: "rgba(59, 130, 246, 0.12)",
        handler: () => openPlaybook(),
      },
      {
        title: "升级攻略指南",
        desc: "快速升级攻略与收益翻倍秘籍",
        action: "学习攻略",
        icon: "rocket",
        color: "#8B5CF6",
        bg: "rgba(139, 92, 246, 0.12)",
        handler: () => openUpgradeGuide(),
      },
      {
        title: "专属运营经理",
        desc: "加好友即可获得一对一扶持",
        action: "立即联系",
        icon: "headphones",
        color: "#EF4444",
        bg: "rgba(239, 68, 68, 0.12)",
        handler: () => contactManager(),
      },
    ]);

    // T301: 添加登录守卫
    onShow(() => {
      requireAuth();
    });

    // 生命周期
    onMounted(() => {
      // 新用户进入分销页面默认自动开通分销权限
      setTimeout(() => {
        distributionStatus.isActivated = true;
        console.log("分销权限已自动开通");
      }, 500);

      // 加载搜索历史
      const history = uni.getStorageSync("distribution_search_history");
      if (history && Array.isArray(history)) {
        searchHistory.value = history;
      }
    });

    return {
      // 状态
      isScrolled,
      searchKeyword,
      showSearchHistory,
      searchHistory,
      distributionStatus,
      userInfo,
      earningsData,
      performanceTargets,
      promotionData,
      quickActions,
      performanceCards,
      goalProgress,
      funnelSteps,
      funnelTips,
      growthTasks,
      promotionTools,
      commissionRules,
      practiceGuides,

      // 方法
      showHelp,
      showProfile,
      showUpgradeInfo,
      copyPromotionCode,
      goToWithdraw,
      generateShareLink,
      generateQRPoster,
      downloadMaterials,
      shareToSocial,
      showDetailedRules,
      handleQuickAction,
      onSearchInput,
      onSearchConfirm,
      onScroll,
      updateScrollState,
      goToEarningsDetail,
      goToPromotionDetail,
      onStatsSlideChange,
      activeTab,
      tabList,
      switchTab,
      generateCoupon,
      openLevelRules,
      openUpgradeGuide,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";
@import "@/styles/mixins.scss";

.page {
  min-height: 100vh;
  background-color: $background-secondary;
  padding-bottom: 120rpx;
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
  padding: $spacing-sm $spacing-lg;
  position: fixed;
  width: 100vw;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;

  &.scrolled {
    background-color: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20rpx);
    @include shadow(sm);
  }

  .header-left {
    flex: 0 0 auto;

    .header-title {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: $text-primary;
    }
  }

  .header-center {
    flex: 1;
    margin: 0 $spacing-base;

    .search-bar-mini {
      @include flex();
      align-items: center;
      background-color: $background-primary;
      border-radius: 48rpx;
      padding: $spacing-sm $spacing-base;
      gap: $spacing-xs;

      .search-input-mini {
        flex: 1;
        font-size: $font-size-sm;
        color: $text-primary;

        &::placeholder {
          color: $text-placeholder;
        }
      }
    }
  }

  .header-right {
    flex: 0 0 auto;

    .help-icon {
      width: 54rpx;
      height: 54rpx;
      @include flex-center();
    }
  }
}

.page-content {
  flex: 1;
  padding: 100rpx 0 $spacing-xs;
}

.hero-section {
  position: relative;

  .hero-card {
    position: relative;
    z-index: 1;
    padding: $spacing-lg $spacing-lg $spacing-sm;
    overflow: hidden;
  }

  .hero-header {
    display: flex;
    gap: $spacing-base;
    align-items: center;
  }

  // 用户头像区域
  .user-avatar-container {
    position: relative;
    width: 120rpx;
    height: 120rpx;
    flex-shrink: 0;

    .user-avatar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 4rpx solid rgba(255, 255, 255, 0.3);
    }
  }

  // 用户信息区域
  .user-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
    min-width: 0;

    .user-name-row {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
      flex-wrap: wrap;

      .user-name {
        font-size: $font-size-lg;
        font-weight: $font-weight-semibold;
        color: $text-primary;
        flex-shrink: 0;
      }

      .status-chip {
        padding: 6rpx 16rpx;
        border-radius: $border-radius-full;
        background: linear-gradient(135deg, #61a8ff 0%, #a245ff 100%);

        .chip-text {
          display: flex;
          font-size: $font-size-xs;
          color: #ffffff;
          line-height: 1;
          font-weight: $font-weight-semibold;
        }
      }
    }

    .code-row {
      display: flex;
      align-items: center;
      gap: $spacing-xs;

      .code-label {
        font-size: $font-size-xs;
        color: $text-secondary;
        flex-shrink: 0;
      }

      .code-value {
        flex: 1;
        font-size: $font-size-xs;
        font-weight: $font-weight-semibold;
        color: $primary-dark;
      }

      .code-action {
        @include flex-center();
        gap: $spacing-xs;

        .copy-text {
          font-size: $font-size-xs;
          color: $text-secondary;
        }
      }
    }
  }

  // 攻略按钮
  .strategy-btn {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    flex-wrap: nowrap;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    margin-left: $spacing-xl;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 1rem;
    border: 1rpx solid $primary-dark;
    box-shadow: 0 0.375rem 0.875rem rgba(155, 0, 200, 0.08);
    transition: all 0.2s ease;
    flex-shrink: 0;

    .strategy-text {
      font-size: $font-size-xs;
      color: $primary-dark;
      font-weight: $font-weight-medium;
    }
  }

  .hero-stats {
    margin: 0 -32rpx 0;

    .stats-swiper {
      height: 350rpx;
      overflow: hidden;
      
      // 自定义swiper指示器样式
      ::v-deep .uni-swiper-dots {
        display: flex;
        justify-content: center;
        position: absolute;
        bottom: 20rpx;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10;
      }
      
      ::v-deep .uni-swiper-dot {
        width: 32rpx !important;
        height: 8rpx !important;
        border-radius: 6rpx !important;
        background: rgba(255, 255, 255, 1) !important;
        opacity: 0.5 !important;
        transition: all 0.3s ease !important;
      }
      
      ::v-deep .uni-swiper-dot-active {
        background: #d746f0 !important;
        opacity: 1 !important;
        width: 40rpx !important;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: $spacing-base;
        padding: $spacing-lg;

        .stat-card {
          @include card();
          padding: $spacing-lg;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          backdrop-filter: blur(12rpx);
          border-radius: 20rpx;
          transition: transform 0.2s ease;
          min-height: 180rpx;

          &:active {
            transform: scale(0.98);
          }

          // 深色渐变背景样式
          &.gradient-purple {
            background: linear-gradient(135deg, #6baeff 0%, #a64dff 100%);
          }

          &.gradient-blue {
            background: linear-gradient(135deg, #71bdff 0%, #49aafe 100%);
          }

          &.gradient-green {
            background: linear-gradient(135deg, #58ecb1 0%, #33cb7f 100%);
          }

          &.gradient-orange {
            background: linear-gradient(135deg, #f4c646 0%, #f1a93e 100%);
          }

          &.gradient-red {
            background: linear-gradient(135deg, #ff8989 0%, #f35641 100%);
          }

          &.gradient-teal {
            background: $gradient-primary;
          }

          .stat-label {
            font-size: $font-size-sm;
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 12rpx;
            font-weight: $font-weight-medium;
          }

          .stat-value {
            font-size: $font-size-xl;
            font-weight: $font-weight-bold;
            color: #ffffff;
            margin-bottom: 20rpx;
            letter-spacing: 1rpx;
          }

          .stat-btn {
            padding: 12rpx 20rpx;
            border-radius: 32rpx;
            background: rgba(255, 255, 255, 0.3);
            border: 2rpx solid rgba(255, 255, 255, 0.45);
            backdrop-filter: blur(8rpx);
            transition: all 0.2s ease;

            &:active {
              background: rgba(255, 255, 255, 0.3);
            }

            &.primary {
              background: rgba(255, 255, 255, 0.85);
              border: none;

              .btn-text {
                color: $primary-dark;
                font-weight: $font-weight-semibold;
              }
            }

            .btn-text {
              font-size: $font-size-xs;
              color: #ffffff;
              text-align: center;
              display: block;
              font-weight: $font-weight-semibold;
            }
          }
        }
      }
    }
  }
}

.section-header {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-xs $spacing-xs $spacing-base ;
  flex-wrap: wrap;

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
}

// 分类标签栏
.category-tabs {
  margin: 0 $spacing-lg $spacing-lg;

  .tab-container {
    @include flex-center();
    gap: $spacing-sm;
    border-bottom: 1rpx solid rgba(0, 0, 0, 0.15);
  }

  .tab-item {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    padding-bottom: $spacing-base;
    transition: all 0.3s ease;

    &.active {
      &::before {
        content: "";
        position: absolute;
        bottom: -1rpx;
        left: 50%;
        transform: translateX(-50%);
        width: 65%;
        height: 4rpx;
        background: $primary-dark;
      }

      .tab-text {
        color: $primary-dark;
      }
    }

    .tab-text {
      font-size: $font-size-xs;
      color: $text-secondary;
      font-weight: $font-weight-semibold;
      transition: all 0.3s ease;
    }
  }
}

.data-section {
  .performance-section {
    margin: 0 $spacing-lg $spacing-lg;
  }

  .funnel-section {
    margin: 0 $spacing-lg $spacing-lg;
  }
}

.performance-section,
.funnel-section,
.toolkit-section,
.task-section,
.guide-section {
  margin: 0 $spacing-lg $spacing-lg;
}

.performance-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: $spacing-base;
  margin-bottom: $spacing-base;

  .performance-card {
    @include card();
    padding: $spacing-lg;
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;

    .card-header {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
    }

    .card-title {
      font-size: $font-size-sm;
      color: $text-secondary;
    }

    .card-value {
      font-size: $font-size-xl;
      font-weight: $font-weight-semibold;
      color: $text-primary;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .card-note {
        font-size: $font-size-xs;
        color: $text-tertiary;
      }

      .card-trend {
        font-size: $font-size-xs;
        color: $error-color;

        &.positive {
          color: $success-color;
        }
      }
    }
  }
}

.goal-progress {
  @include card();
  padding: $spacing-lg;
  display: flex;
  flex-direction: column;
  gap: $spacing-base;

  .goal-row {
    display: flex;
    flex-direction: column;
    gap: 8rpx;

    .goal-top {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .goal-name {
        font-size: $font-size-sm;
        color: $text-primary;
        font-weight: $font-weight-medium;
      }

      .goal-rate {
        font-size: $font-size-xs;
        color: $primary-color;
        font-weight: $font-weight-medium;
      }
    }

    .goal-bar {
      position: relative;
      height: 16rpx;
      border-radius: $border-radius-full;
      background: $background-tertiary;
      overflow: hidden;

      .goal-fill {
        height: 100%;
        border-radius: inherit;
        background: $gradient-primary;
        transition: width 0.6s ease;
      }
    }

    .goal-desc {
      font-size: $font-size-xs;
      color: $text-tertiary;
    }
  }
}

.funnel-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: $spacing-base;

  .funnel-card {
    @include card();
    padding: $spacing-lg;
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;

    .step-top {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .step-name {
        font-size: $font-size-base;
        font-weight: $font-weight-medium;
        color: $text-primary;
      }

      .step-value {
        font-size: $font-size-sm;
        color: $primary-color;
      }
    }

    .step-progress {
      position: relative;
      height: 16rpx;
      border-radius: $border-radius-full;
      background: $background-tertiary;
      overflow: hidden;

      .step-fill {
        height: 100%;
        background: $gradient-primary;
        border-radius: inherit;
      }
    }

    .step-desc {
      font-size: $font-size-xs;
      color: $text-tertiary;
    }
  }
}

.funnel-actions {
  margin-top: $spacing-base;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;

  .funnel-tip {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-base;
    border-radius: 24rpx;
    background: $background-primary;
    box-shadow: 0 12rpx 28rpx rgba(33, 42, 70, 0.08);

    .tip-text {
      font-size: $font-size-xs;
      color: $text-secondary;
    }
  }
}

.toolkit-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-base;

  .toolkit-card {
    @include card();
    padding: $spacing-base;
    display: flex;
    align-items: center;
    gap: $spacing-base;

    .tool-icon {
      width: 88rpx;
      height: 88rpx;
      border-radius: $border-radius-lg;
      @include flex-center();
      opacity: 0.8;
    }

    .tool-texts {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6rpx;

      .tool-title {
        font-size: $font-size-base;
        font-weight: $font-weight-semibold;
        color: $text-primary;
      }

      .tool-desc {
        font-size: $font-size-xs;
        color: $text-tertiary;
      }
    }
  }
}

.task-list {
  @include card();
  padding: $spacing-lg;
  display: flex;
  flex-direction: column;
  gap: $spacing-base;

  .task-item {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-sm $spacing-base;
    border-bottom: 1rpx solid $border-color;

    &:last-child {
      border-bottom: none;
    }

    .task-info {
      @include flex();
      align-items: center;
      gap: $spacing-sm;

      .task-icon {
        width: 24rpx;
        height: 24rpx;
        @include flex-center();
      }

      .task-title {
        display: flex;
        font-size: $font-size-base;
        color: $text-primary;
        font-weight: $font-weight-semibold;
        line-height: 1;
      }
    }

    .task-desc {
      font-size: $font-size-xs;
      color: $text-tertiary;
    }

    .task-meta {
      display: flex;
      flex-direction: column;
      gap: 8rpx;

      .task-reward {
        font-size: $font-size-xs;
        color: $primary-color;
        font-weight: $font-weight-medium;
      }

      .task-progress {
        height: 16rpx;
        border-radius: $border-radius-full;
        background: $background-tertiary;
        overflow: hidden;

        .task-fill {
          height: 100%;
          border-radius: inherit;
          background: $gradient-primary;
        }
      }

      .task-status {
        font-size: $font-size-xs;
        color: $text-tertiary;
      }
    }
  }
}

.guide-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-base;
  margin-bottom: $spacing-base;

  .guide-card {
    @include card();
    padding: $spacing-base;
    display: flex;
    align-items: center;
    gap: $spacing-base;

    .guide-icon {
      width: 88rpx;
      height: 88rpx;
      border-radius: $border-radius-lg;
      @include flex-center();
    }

    .guide-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6rpx;
      max-width: 340rpx;

      .guide-title {
        font-size: $font-size-base;
        font-weight: $font-weight-semibold;
        color: $text-primary;
      }

      .guide-desc {
        font-size: $font-size-xs;
        color: $text-tertiary;
        @include ellipsis();
      }
    }

    .guide-action {
      display: flex;
      align-items: center;

      .guide-link {
        font-size: $font-size-xs;
        color: $primary-dark;
        font-weight: $font-weight-medium;
      }
    }
  }
}

.view-more-btn {
  @include card();
  padding: $spacing-base;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-xs;

  .more-text {
    font-size: $font-size-base;
    color: $text-secondary;
  }
}
</style>
