<template>
  <view class="page">
    <view class="page-bgimg"></view>
    <!-- 页面头部 -->
    <view class="page-header safe-area-inset-top">
      <!-- 标题栏 -->
      <view class="navbar" :class="{ 'navbar-scrolled': isScrolled }">
        <view class="navbar-content">
          <text class="navbar-title">爱上杜美人</text>
          <view class="navbar-actions" @click="openMessage">
            <Icon name="bell" size="medium" color="#fff" />
            <view v-if="unreadMessageCount > 0" class="message-badge">
              <text class="message-count">{{
                unreadMessageCount > 99 ? "99+" : unreadMessageCount
              }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 页面内容 -->
    <scroll-view class="page-content" scroll-y="true" @scroll="onPageScroll" :show-scrollbar="false">
      <!-- Banner轮播图 -->
      <view class="banner-section animate__animated animate__fadeInDown">
        <swiper
          class="banner-swiper"
          indicator-dots
          indicator-color="rgba(255,255,255,0.3)"
          indicator-active-color="#d746f0"
          autoplay
          interval="4000"
          duration="500"
          circular
        >
          <swiper-item v-for="(banner, index) in banners" :key="index">
            <image
              :src="banner.image"
              class="banner-image"
              mode="aspectFill"
              @click="onBannerClick(banner)"
            />
          </swiper-item>
        </swiper>
      </view>

      <!-- 酒店推荐区 -->
      <view
        class="hotel-recommend-section animate__animated animate__fadeInUp"
        @click="goToHotelDetail(recommendHotels[0])"
      >
        <view class="hotel-info">
          <view class="hotel-name-row">
            <text class="hotel-name">{{ recommendHotels[0].name }}</text>
            <view class="hotel-stars">
              <Icon name="starSolid" size="small" color="#FFD700" />
              <Icon name="starSolid" size="small" color="#FFD700" />
              <Icon name="starSolid" size="small" color="#FFD700" />
              <Icon name="starSolid" size="small" color="#FFD700" />
              <Icon name="starSolid" size="small" color="#FFD700" />
            </view>
          </view>
          <text class="hotel-address">{{ recommendHotels[0].address }}</text>
        </view>
        <view class="hotel-meta">
          <view class="hotel-rating">
            <Icon name="location" size="small" color="#be32d7" />
            <text class="hotel-distance"
              >{{ recommendHotels[0].distance }}km</text
            >
          </view>
          <view class="hotel-actions">
            <view
              class="action-button"
              @click.stop="navigateToHotel(recommendHotels[0])"
            >
              <Icon name="send" size="small" color="#fff" />
              <text class="action-text">导航</text>
            </view>
            <view
              class="action-button"
              @click.stop="goToHotelDetail(recommendHotels[0])"
            >
              <Icon name="more" size="small" color="#fff" />
              <text class="action-text">更多</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 热门房型推荐 -->
      <view class="section room-recommend-section animate__animated animate__fadeInLeft">
        <view class="section-header">
          <Icon name="heart" size="small" color="#fff" />
          <text class="section-title">热门房型 · 一键速订</text>
        </view>
        <view class="room-list-vertical">
          <view
            v-for="(room, index) in hotRooms"
            :key="room.id"
            class="room-card animate__animated animate__fadeInUp animate__delay-300ms"
            @click="goToRoomDetail(room)"
          >
            <view class="room-time-badge">
              <text class="time-text">今天{{ room.availableTime }}</text>
            </view>
            <image
              :src="room.coverImage"
              class="room-card-image"
              mode="aspectFill"
            />
            <view class="room-card-content">
              <text class="room-card-name">{{ room.name }}</text>
              <view class="room-tag">
                <Icon name="bed" size="small" color="#d746f0" />
                <text class="tag-text">{{ room.capacity || "仅剩2间" }}</text>
              </view>
              <text class="room-card-description"
                >套餐: {{ room.description }}</text
              >
              <view class="room-card-footer">
                <view class="room-price-info">
                  <text class="price-symbol">¥</text>
                  <text class="price-amount">{{ room.memberPrice }}</text>
                </view>
                <view class="book-button-new">
                  <text class="book-text-new">立即预订</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 会员服务区 -->
      <view class="member-service-section animate__animated animate__fadeInRight">
        <!-- 未开通会员状态 -->
        <view
          v-if="!userStore.isMember"
          class="member-card member-card-inactive"
          @click="openMembership"
        >
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

        <!-- 已开通会员状态 -->
        <view v-else class="member-card member-card-active">
          <view class="member-content">
            <view class="member-header">
              <Icon name="crown" size="medium" color="#FFD700" />
              <text class="member-level-text">您已开通{{ userStore.memberLevel || "黄金" }}会员</text>
            </view>
            <text class="member-expiry-text">有效期至 {{ userStore.memberExpiry || "2024.12.31" }}</text>
          </view>
          <view class="member-action-button member-action-manage">
            <text class="action-button-text">升级续费</text>
            <Icon name="chevron-right" size="small" color="#fff" />
          </view>
        </view>
      </view>

      <!-- 附近酒店区域 -->
      <view class="section nearby-hotels-section animate__animated animate__fadeInUp">
        <view class="section-header">
          <text class="section-title">附近酒店</text>
          <view class="section-more" @click="goToHotels">
            <text class="section-more-text">更多</text>
            <Icon name="chevron-right" size="small" color="#fff" />
          </view>
        </view>
        <view class="hotel-tabs">
          <view class="tabs-list-fixed">
            <view
              v-for="(tab, index) in hotelTabs"
              :key="index"
              class="tab-item"
              :class="{ active: activeHotelTab === index }"
              @click="switchHotelTab(index)"
            >
              <text class="tab-text">{{ tab.name }}</text>
            </view>
          </view>
        </view>
        <view class="hotel-cards">
          <view
            v-for="(hotel, index) in nearbyHotels"
            :key="hotel.id"
            class="hotel-card animate__animated animate__fadeInRight"
            @click="goToHotelDetail(hotel)"
          >
            <image
              :src="hotel.coverImage"
              class="hotel-card-image"
              mode="aspectFill"
            />
            <view class="hotel-card-info">
              <text class="hotel-card-name">{{ hotel.name }}</text>
              <view class="hotel-card-meta">
                <view class="hotel-remaining">
                  <Icon name="bed" size="small" color="#999" />
                  <text class="hotel-card-remaining"
                    >剩余{{ hotel.remaining }}间</text
                  >
                </view>
                <view class="hotel-distance-badge">
                  <Icon name="location" size="xsmall" color="#6366f1" />
                  <text class="distance-text">{{ hotel.distance || '2.5' }}km</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 优惠信息区 -->
      <view class="section coupon-section animate__animated animate__fadeInLeft">
        <view class="section-header">
          <text class="section-title">限时优惠</text>
        </view>
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

      <!-- 精选优品区 -->
      <view class="section products-section animate__animated animate__fadeInRight">
         <view class="section-header">
          <text class="section-title">精选优品</text>
          <view class="section-more" @click="goToMall">
            <text class="section-more-text">更多</text>
            <Icon name="chevron-right" size="small" color="#fff" />
          </view>
        </view>
        <view class="products-grid">
          <view
            v-for="product in selectedProducts"
            :key="product.id"
            class="product-item"
            @click="goToProductDetail(product)"
          >
            <image
              :src="product.image"
              class="product-image"
              mode="aspectFill"
            />
            <view class="product-info">
              <text class="product-name">{{ product.name }}</text>
              <view class="product-price">
                <text class="price-current">¥{{ product.price }}</text>
                <text class="price-member">会员¥{{ product.memberPrice }}</text>
              </view>
              <view class="product-actions">
                <view class="cart-button" @click.stop="addToCart(product)">
                  <Icon name="shopping-cart-check" size="small" color="#be32d7"
                  />
                </view>
                <view class="buy-button" @click.stop="buyNow(product)">
                  <text class="buy-text">立即购买</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 申请入口区 -->
      <view class="apply-section-new animate__animated animate__fadeInUp">
        <view class="apply-buttons-grid">
          <view class="apply-button-item" @click="applyOperation">
            <view class="apply-text-content">
              <text class="apply-main-title">申请运营</text>
              <text class="apply-sub-desc">酒店方申请入驻运营</text>
            </view>
            <Icon name="chevron-right" size="medium" color="#fff" />
          </view>
          <view class="apply-button-item" @click="applyAgent">
            <view class="apply-text-content">
              <text class="apply-main-title">申请代理</text>
              <text class="apply-sub-desc">我想代理这个品牌</text>
            </view>
            <Icon name="chevron-right" size="medium" color="#fff" />
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

      <!-- 底部间距 -->
      <view class="bottom-spacing"></view>
    </scroll-view>

    <!-- 客服支持浮动按钮 -->
    <view class="customer-service" @click="openCustomerService">
      <Icon name="headphones" size="medium" color="#fff" />
      <text class="service-text">客服</text>
    </view>

    <!-- 自定义底部导航 -->
    <CustomTabBar :current="0" @change="onTabChange" />
  </view>
</template>

<script>
import { ref, reactive, onMounted } from "vue";
import { useAppStore } from "@/stores/app";
import { useUserStore } from "@/stores/user";
import Icon from "@/components/common/Icon.vue";
import CustomTabBar from "@/components/layout/CustomTabBar.vue";

export default {
  name: "IndexPage",
  components: {
    Icon,
    CustomTabBar,
  },
  // 页面配置
  onPageScroll(e) {
    // 这里需要通过组件实例来更新状态
    if (this.updateScrollState) {
      this.updateScrollState(e.scrollTop);
    }
  },
  setup() {
    const appStore = useAppStore();
    const userStore = useUserStore();

    // 页面状态
    const unreadMessageCount = ref(3);
    const currentLocation = ref("北京市朝阳区");
    const activeHotelTab = ref(0);
    const isScrolled = ref(false);

    // 优惠券状态管理
    const couponStatus = reactive({
      newbie: false,
      discount: false,
      monthlyCard: false
    });

    // 轮播图数据 (750x300px)
    const banners = ref([
      {
        id: 1,
        image:
          "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/banner-03.png",
        title: "新用户专享优惠",
        link: "",
      },
      {
        id: 2,
        image:
          "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/banner-04.png",
        title: "热门酒店推荐",
        link: "",
      },
      {
        id: 3,
        image:
          "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/banner-03.png",
        title: "商城限时特惠",
        link: "",
      },
      {
        id: 4,
        image:
          "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/banner-04.png",
        title: "分销赚钱计划",
        link: "",
      },
    ]);

    // 推荐酒店 (200x150px)
    const recommendHotels = ref([
      {
        id: 1,
        name: "木兮云庐 HOTEL【云谷学校店】",
        address: "浙江省杭州市西湖区振华路666号4幢...",
        distance: 21.24,
        coverImage: "https://picsum.photos/200/150?random=10",
      },
    ]);

    // 热门房型 (280x200px)
    const hotRooms = ref([
      {
        id: 1,
        name: "90分钟体验房",
        description: "90分钟大床房+无限次互动体验",
        remaining: 5,
        availableTime: "11:30可约",
        originalPrice: 399,
        memberPrice: 299,
        coverImage: "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/room02.jpg",
      },
      {
        id: 2,
        name: "钟点大床房",
        description: "3小时大床房+浪漫主题+专属服务",
        remaining: 3,
        availableTime: "14:00可约",
        originalPrice: 599,
        memberPrice: 459,
        coverImage: "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/room03.jpg",
      },
      {
        id: 3,
        name: "主题大床房",
        description: "12小时主题房+畅爽体验+专业设备",
        remaining: 2,
        availableTime: "16:30可约",
        originalPrice: 799,
        memberPrice: 659,
        coverImage: "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/room01.jpg",
      },
    ]);

    // 酒店分类标签
    const hotelTabs = ref([
      { name: "电竞酒店", type: "gaming" },
      { name: "主题酒店", type: "theme" },
      { name: "私享酒店", type: "private" },
      { name: "尊住酒店", type: "luxury" },
    ]);

    // 不同分类的酒店数据
    const hotelsByCategory = ref({
      gaming: [
        {
          id: 1,
          name: "城市猎手电竞酒店",
          priceRange: { min: 199, max: 399 },
          remaining: 8,
          distance: 1.2,
          coverImage: "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel01.jpg",
        },
        {
          id: 5,
          name: "王者荣耀电竞主题",
          priceRange: { min: 259, max: 459 },
          remaining: 6,
          distance: 2.8,
          coverImage: "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel02.jpg",
        },
        {
          id: 6,
          name: "英雄联盟竞技酒店",
          priceRange: { min: 299, max: 529 },
          remaining: 4,
          distance: 3.5,
          coverImage: "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel03.jpg",
        },
        {
          id: 7,
          name: "绝地求生战队基地",
          priceRange: { min: 329, max: 589 },
          remaining: 3,
          distance: 4.1,
          coverImage: "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel04.jpg",
        },
      ],
      theme: [
        {
          id: 8,
          name: "浪漫巴黎情侣主题",
          priceRange: { min: 299, max: 599 },
          remaining: 5,
          distance: 1.8,
          coverImage: "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel05.jpg",
        },
        {
          id: 9,
          name: "维多利亚复古庄园",
          priceRange: { min: 399, max: 699 },
          remaining: 3,
          distance: 3.2,
          coverImage: "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel06.jpg",
        },
        {
          id: 10,
          name: "东京樱花日式温泉",
          priceRange: { min: 459, max: 799 },
          remaining: 2,
          distance: 5.6,
          coverImage: "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel07.jpg",
        },
        {
          id: 11,
          name: "马尔代夫海景套房",
          priceRange: { min: 599, max: 999 },
          remaining: 1,
          distance: 8.3,
          coverImage: "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel08.jpg",
        },
      ],
      private: [
        {
          id: 12,
          name: "都市秘境私人会所",
          priceRange: { min: 599, max: 999 },
          remaining: 2,
          distance: 2.3,
          coverImage: "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel09.jpg",
        },
        {
          id: 13,
          name: "紫禁城尊享私邸",
          priceRange: { min: 799, max: 1299 },
          remaining: 1,
          distance: 6.7,
          coverImage: "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel10.jpg",
        },
        {
          id: 14,
          name: "香格里拉私密空间",
          priceRange: { min: 899, max: 1599 },
          remaining: 2,
          distance: 4.9,
          coverImage: "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel11.jpg",
        },
        {
          id: 15,
          name: "黄金海岸独栋别墅",
          priceRange: { min: 1299, max: 2399 },
          remaining: 1,
          distance: 12.5,
          coverImage: "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel12.jpg",
        },
      ],
      luxury: [
        {
          id: 16,
          name: "丽思卡尔顿总统套房",
          priceRange: { min: 1599, max: 2999 },
          remaining: 1,
          distance: 3.4,
          coverImage: "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel13.jpg",
        },
        {
          id: 17,
          name: "四季酒店皇家套房",
          priceRange: { min: 1899, max: 3599 },
          remaining: 1,
          distance: 5.1,
          coverImage: "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel14.jpg",
        },
        {
          id: 18,
          name: "半岛酒店至尊体验",
          priceRange: { min: 2299, max: 4299 },
          remaining: 1,
          distance: 7.8,
          coverImage: "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel15.jpg",
        },
        {
          id: 19,
          name: "宝格丽奢华臻选",
          priceRange: { min: 2999, max: 5999 },
          remaining: 1,
          distance: 9.2,
          coverImage: "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel16.jpg",
        },
      ],
    });

    // 当前显示的酒店数据
    const nearbyHotels = ref(hotelsByCategory.value.gaming);

    // 精选商品 (150x150px)
    const selectedProducts = ref([
      {
        id: 1,
        name: "杜蕾斯至薄装安全套",
        price: 89.9,
        memberPrice: 69.9,
        image: "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good01.jpg",
      },
      {
        id: 2,
        name: "KY私密润滑剂50ml",
        price: 129.9,
        memberPrice: 99.9,
        image: "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good02.jpg",
      },
      {
        id: 3,
        name: "维多利亚蕾丝情趣内衣",
        price: 299.9,
        memberPrice: 239.9,
        image: "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good03.jpg",
      },
      {
        id: 4,
        name: "Fairvital德国玛卡胶囊",
        price: 210.9,
        memberPrice: 159.9,
        image: "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good04.jpg",
      },
      {
        id: 5,
        name: "简禾酒精杀菌消毒湿巾",
        price: 19.9,
        memberPrice: 16.9,
        image: "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good05.jpg",
      },
      {
        id: 6,
        name: " 伊珞EROCOME震动棒",
        price: 169.9,
        memberPrice: 139.9,
        image: "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good06.jpg",
      },
    ]);

    // 事件处理函数
    const onBannerClick = (banner) => {
      if (banner.link) {
        if (
          banner.link.includes("/pages/mall/index") ||
          banner.link.includes("/pages/distribution/index")
        ) {
          uni.switchTab({ url: banner.link });
        } else {
          uni.navigateTo({ url: banner.link });
        }
      }
    };

    const openMessage = () => {
      // TODO: 跳转到消息列表页面
      uni.showToast({ title: "消息功能开发中", icon: "none" });
    };

    const switchLocation = () => {
      // TODO: 实现位置切换功能
      uni.showToast({ title: "位置切换功能开发中", icon: "none" });
    };

    const navigateToHotel = (hotel) => {
      // TODO: 调用地图应用导航
      uni.showToast({ title: `导航到${hotel.name}`, icon: "none" });
    };

    const goToHotels = () => {
      uni.navigateTo({ url: "/pages/hotel/list" });
    };

    const goToHotelDetail = (hotel) => {
      uni.navigateTo({ url: `/pages/hotel/detail?id=${hotel.id}` });
    };

    const goToRoomDetail = (room) => {
      uni.navigateTo({ url: `/pages/hotel/room-detail?id=${room.id}` });
    };

    const openMembership = () => {
      // TODO: 跳转到会员开通页面
      uni.showToast({ title: "会员开通功能开发中", icon: "none" });
    };

    const switchHotelTab = (index) => {
      activeHotelTab.value = index;
      const tabType = hotelTabs.value[index].type;
      nearbyHotels.value = hotelsByCategory.value[tabType];
      console.log("切换到分类:", hotelTabs.value[index].name);
    };

    const receiveCoupon = (type) => {
      if (couponStatus[type]) {
        uni.showToast({ title: "您已领取过该优惠券", icon: "none" });
        return;
      }
      
      // 更新状态
      couponStatus[type] = true;
      
      let message = '';
      switch(type) {
        case 'newbie':
          message = '新人体验券领取成功！';
          break;
        case 'discount':
          message = '满减券领取成功！';
          break;
        default:
          message = '优惠券领取成功！';
      }
      
      uni.showToast({ title: message, icon: "success" });
    };

    const buyMonthlyCard = () => {
      if (couponStatus.monthlyCard) {
        uni.showToast({ title: "您已开通包月卡", icon: "none" });
        return;
      }
      
      // 更新状态
      couponStatus.monthlyCard = true;
      uni.showToast({ title: "包月卡开通成功！", icon: "success" });
    };

    const goToMall = () => {
      uni.switchTab({ url: "/pages/mall/index" });
    };

    const goToProductDetail = (product) => {
      uni.navigateTo({ url: `/pages/mall/product-detail?id=${product.id}` });
    };

    const addToCart = (product) => {
      // TODO: 添加到购物车
      uni.showToast({ title: "已加入购物车", icon: "success" });
    };

    const buyNow = (product) => {
      // TODO: 立即购买
      uni.navigateTo({
        url: `/pages/mall/product-detail?id=${product.id}&action=buy`,
      });
    };

    const applyOperation = () => {
      // TODO: 跳转到运营申请页面
      uni.showToast({ title: "运营申请功能开发中", icon: "none" });
    };

    const applyAgent = () => {
      // TODO: 跳转到代理申请页面
      uni.showToast({ title: "代理申请功能开发中", icon: "none" });
    };

    const openCustomerService = () => {
      // TODO: 显示客服选项弹窗
      uni.showActionSheet({
        itemList: ["在线客服", "电话客服", "帮助中心"],
        success: (res) => {
          const options = ["在线客服", "电话客服", "帮助中心"];
          uni.showToast({
            title: `选择了${options[res.tapIndex]}`,
            icon: "none",
          });
        },
      });
    };

    const onTabChange = (tab) => {
      console.log("Tab changed:", tab);
    };


    // 滚动监听
    const onPageScroll = (e) => {
      const { scrollTop } = e.detail;
      isScrolled.value = scrollTop > 50;
    };

    // 页面滚动状态更新
    const updateScrollState = (scrollTop) => {
      isScrolled.value = scrollTop > 50;
    };

    // 数据加载
    const loadPageData = async () => {
      try {
        // TODO: 从API加载实际数据
        console.log("加载首页数据");
      } catch (error) {
        console.error("加载首页数据失败:", error);
      }
    };

    // 下拉刷新
    const onPullDownRefresh = () => {
      loadPageData().finally(() => {
        uni.stopPullDownRefresh();
      });
    };

    onMounted(() => {
      loadPageData();
      appStore.getSystemInfo();
    });

    return {
      userStore,
      unreadMessageCount,
      currentLocation,
      activeHotelTab,
      isScrolled,
      banners,
      recommendHotels,
      hotRooms,
      hotelTabs,
      hotelsByCategory,
      nearbyHotels,
      selectedProducts,
      onBannerClick,
      openMessage,
      switchLocation,
      navigateToHotel,
      goToHotels,
      goToHotelDetail,
      goToRoomDetail,
      openMembership,
      switchHotelTab,
      couponStatus,
      receiveCoupon,
      buyMonthlyCard,
      goToMall,
      goToProductDetail,
      addToCart,
      buyNow,
      applyOperation,
      applyAgent,
      openCustomerService,
      onTabChange,
      onPageScroll,
      updateScrollState,
      onPullDownRefresh,
    };
  },

  // 页面生命周期
  onPullDownRefresh() {
    this.onPullDownRefresh();
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";
@import "@/styles/mixins.scss";

.page {
  width: 100vw;
  height: 100vh;
}

.page-bgimg {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 0;
  width: 100vw;
  height: 100vh;
  background-image: url(../../static/images/bg.jpg);
  background-size: cover;
  background-attachment: fixed;
  background-position: center center;
  background-repeat: no-repeat;
}
// 页面头部
.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: $z-index-fixed;
}

// 导航栏
.navbar {
  background: none;
  box-shadow: none;
  width: 100%;
  height: 88rpx;
  overflow: hidden;
  transition: all 0.3s ease;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
    width: 100vw;
    height: 100vh;
    background-image: url(../../static/images/bg.jpg);
    background-size: cover;
    background-attachment: fixed;
    background-position: center center;
    background-repeat: no-repeat;
  transition: all 0.3s ease;
  }

  &.navbar-scrolled {
    &::before {
      opacity: 0.85;
    }
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(12rpx);
  }

  .navbar-content {
    height: 88rpx;
    @include flex-between();
    padding: 0 $spacing-lg;
    position: relative;
    z-index: 1;
  }

  .navbar-title {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $background-primary;
    z-index: 10;
  }

  .navbar-actions {
    position: relative;
    @include flex-center();

    .message-badge {
      position: absolute;
      top: -8rpx;
      right: -8rpx;
      min-width: 32rpx;
      height: 32rpx;
      background: rgba(255, 0, 0, 0.7);
      border-radius: 16rpx;
      @include flex-center();

      .message-count {
        font-size: 20rpx;
        color: #fff;
        line-height: 1;
      }
    }
  }
}

// Banner轮播
.banner-section {
  margin: 0 $spacing-lg $spacing-xl;
  padding-top: 110rpx;

  .banner-swiper {
    height: 300rpx;
    border-radius: $border-radius-xl;
    box-shadow:
      0 6rpx 40rpx rgba(255, 255, 255, 0.5),
      0 0 20rpx rgba(255, 255, 255, 0.8);

    overflow: hidden;
  }

  .banner-image {
    width: 100%;
    height: 100%;
  }
}

// 页面内容
.page-content {
  flex: 1;
  padding: 0 0 $spacing-lg;
}

// 通用section样式
.section {
  margin: 0 $spacing-lg $spacing-xl;

  .section-header {
    margin-bottom: $spacing-sm;
    @include flex();
    align-items: center;
    gap: $spacing-xs;
  }

  .section-title {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $background-primary;
  }

  .section-more {
    display: flex;
    align-items: center;

    .section-more-text {
      font-size: $font-size-xs;
      color: $background-primary;
    }
  }
}

// 酒店推荐区
.hotel-recommend-section {
  margin: 0 $spacing-lg $spacing-xl;
  position: relative;

  .hotel-info {
    margin-bottom: $spacing-sm;

    .hotel-name-row {
      @include flex();
      align-items: center;
      justify-content: space-between;

      .hotel-name {
        font-size: $font-size-lg;
        font-weight: $font-weight-bold;
        color: $background-primary;
        @include ellipsis();
        flex: 1;
        margin-right: $spacing-sm;
      }

      .hotel-stars {
        @include flex();
        align-items: center;
        gap: 2rpx;
      }
    }

    .hotel-address {
      font-size: $font-size-sm;
      color: $background-primary;
      opacity: 0.75;
      @include ellipsis();
    }
  }

  .hotel-meta {
    @include flex-between();
    align-items: center;

    .hotel-rating {
      display: flex;
      @include flex-center();
      gap: $spacing-xs;
      padding: $spacing-xs $spacing-base $spacing-xs $spacing-xs;
      background: $background-primary;
      border-radius: $border-radius-2xl;

      .hotel-distance {
        font-size: $font-size-sm;
        color: $primary-dark;
      }
    }

    .hotel-actions {
      @include flex();
      gap: $spacing-sm;

      .action-button {
        @include flex();
        align-items: center;
        gap: $spacing-xs;
        padding: $spacing-xs $spacing-base $spacing-xs $spacing-sm;
        background: $gradient-primary;
        border-radius: $border-radius-2xl;
        box-shadow: 0 0 12rpx rgba(255, 255, 255, 0.5);
        transition: all 0.2s ease;

        &:active {
          transform: scale(0.95);
          box-shadow: 0 0 8rpx rgba(255, 255, 255, 0.3);
        }

        .action-text {
          font-size: $font-size-sm;
          color: #fff;
          font-weight: $font-weight-medium;
        }
      }
    }
  }
}

// 热门房型推荐
.room-recommend-section {
  .section-header-left {
    @include flex();
    align-items: center;
    gap: $spacing-sm;
  }

  .room-list-vertical {
    @include flex();
    flex-direction: column;
    gap: $spacing-base;
  }

  .room-card {
    @include card();
    position: relative;
    overflow: hidden;
    padding: $spacing-base;
    @include flex();
    gap: $spacing-base;
  }

  .room-time-badge {
    position: absolute;
    top: -4rpx;
    right: 0;
    padding: $spacing-xs $spacing-base;
    background: $gradient-warning;
    border-radius: 0 0 0 $border-radius-xl;
    margin-left: $spacing-sm;

    .time-text {
      font-size: $font-size-xs;
      color: #8B4513;
      font-weight: $font-weight-medium;
      line-height: 1;
    }
  }

  .room-card-image {
    width: 200rpx;
    height: 206rpx;
    flex-shrink: 0;
    border-radius: $border-radius-base;
  }

  .room-card-content {
    flex: 1;
  }

  .room-card-name {
    display: block;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    flex: 1;
    line-height: 1.6;
  }
  .room-tag {
    @include flex();
    align-items: center;
    gap: $spacing-xs;
    display: inline-flex;

    .tag-text {
      font-size: $font-size-xs;
      font-weight: $font-weight-semibold;
      color: $primary-color;
    }
  }

  .room-card-description {
    display: block;
    font-size: $font-size-xs;
    color: $text-secondary;
    line-height: 1.4;
    @include ellipsis();
    margin-bottom: $spacing-sm;
  }

  .room-card-footer {
    @include flex-between();
    align-items: center;

    .room-price-info {
      @include flex();
      align-items: baseline;

      .price-symbol {
        font-size: $font-size-sm;
        color: $error-color;
        font-weight: $font-weight-medium;
      }

      .price-amount {
        font-size: $font-size-lg;
        color: $error-color;
        font-weight: $font-weight-semibold;
        margin-left: 2rpx;
      }
    }

    .book-button-new {
      padding: $spacing-xs $spacing-lg;
      background: $gradient-primary;
      border-radius: $border-radius-2xl;
      transition: all 0.2s ease;

      &:active {
        transform: scale(0.95);
        opacity: 0.8;
      }

      .book-text-new {
        display: flex;
        font-size: $font-size-sm;
        color: #fff;
        font-weight: $font-weight-semibold;
      }
    }
  }
}

// 会员服务区
.member-service-section {
  margin: 0 $spacing-lg $spacing-xl;

  .member-card {
    padding: $spacing-lg;
    border-radius: $border-radius-xl;
    @include flex-between();
    align-items: center;
    position: relative;
    box-shadow: 0 8rpx 28rpx rgba(115, 0, 200, 0.2);

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
            color: #8B4513;
            font-weight: $font-weight-bold;
          }
        }
        
        .member-benefits-text {
          font-size: $font-size-xs;
          color: #A0522D;
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
          color: #8B4513;
          font-weight: $font-weight-bold;
        }
      }
    }

    &.member-card-active {
      background: linear-gradient(135deg, #ffe138 0%, #FFA500 100%);

      .member-content {
        flex: 1;
        
        .member-header {
          @include flex();
          align-items: center;
          gap: $spacing-xs;
          margin-bottom: $spacing-xs;

          .member-level-text {
            font-size: $font-size-base;
            color: #8B4513;
            font-weight: $font-weight-bold;
          }
        }

        .member-expiry-text {
          font-size: $font-size-sm;
          color: #A0522D;
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
          color: #8B4513;
          font-weight: $font-weight-bold;
        }
      }
    }
  }
}

// 附近酒店区域
.nearby-hotels-section {
  .section-header {
    @include flex-between();
    align-items: center;
  }

  .hotel-tabs {
    margin-bottom: $spacing-base;

    .tabs-list-fixed {
      @include flex();
      gap: $spacing-sm;
      justify-content: space-between;
    }

    .tab-item {
      flex: 1;
      padding: $spacing-sm $spacing-xs;
      background-color: rgba(255, 255, 255, 0.75);
      border-radius: $border-radius-lg;
      @include flex-center();
      transition: all 0.2s ease;

      &:active {
        transform: scale(0.95);
      }

      &.active {
        background: $gradient-primary;

        .tab-text {
          color: $background-primary;
          font-weight: $font-weight-semibold;
        }
      }

      .tab-text {
        display: flex;
        align-items: center;
        font-size: $font-size-xs;
        color: $text-secondary;
        font-weight: $font-weight-medium;
        white-space: nowrap;
      }
    }
  }

  .hotel-cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-base;

    .hotel-card {
      @include card();
      display: flex;
      flex-direction: column;
      padding: 0;
      overflow: hidden;
    }

    .hotel-card-image {
      width: 100%;
      height: 200rpx;
    }

    .hotel-card-info {
      padding: $spacing-sm $spacing-base $spacing-base;

      .hotel-card-name {
        display: block;
        font-size: $font-size-base;
        font-weight: $font-weight-semibold;
        color: $text-primary;
        @include ellipsis();
        margin-bottom: $spacing-xs;
      }

      .hotel-card-meta {
        @include flex-between();
        align-items: flex-end;

        .hotel-remaining {
          @include flex();
          align-items: center;
          gap: $spacing-xs;

          .hotel-card-remaining {
            font-size: $font-size-xs;
            font-weight: $font-weight-medium;
            color: $text-tertiary;
          }
        }

        .hotel-distance-badge {
          @include flex();
          align-items: center;
          gap: 4rpx;
          padding: 4rpx 10rpx;
          background: rgba(99, 102, 241, 0.1);
          border-radius: 20rpx;

          .distance-text {
            font-size: $font-size-xs;
            font-weight: $font-weight-medium;
            color: #6366f1;
          }
        }

        .hotel-card-price {
          font-size: $font-size-base;
          font-weight: $font-weight-semibold;
          color: $error-color;
        }
      }
    }
  }
}

// 优惠信息区
.coupon-section {
  .coupon-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-base;

    .coupon-item {
      @include card();
      padding: $spacing-base $spacing-sm;
      text-align: center;
      position: relative;
      background: linear-gradient(135deg, #fee2e2, #fecaca);

      &.monthly-card {
        background: linear-gradient(135deg, #fef3c7, #fde68a);
      }

      .coupon-amount {
        padding-bottom: $spacing-xs;
        margin-bottom: $spacing-sm;
        border-bottom: 2rpx dashed rgba(0,0,0,0.2);

        .coupon-value {
          font-size: 48rpx;
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

        .coupon-button-text {
          display: flex;
          font-size: $font-size-sm;
          color: #fff;
          font-weight: $font-weight-semibold;
        }
        
        &.claimed {
          background: $text-tertiary;
          opacity: 0.6;
          pointer-events: none;
          
          .coupon-button-text {
            color: #fff;
          }
        }
      }
    }
  }
}

// 精选优品区
.products-section {
  .section-header {
    @include flex-between();
    align-items: center;
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-base;

    .product-item {
      @include card();
      padding: $spacing-base;
    }

    .product-image {
      width: 100%;
      height: 280rpx;
      border-radius: $border-radius-base;
      margin-bottom: $spacing-xs;
    }

    .product-info {
      .product-name {
        font-size: $font-size-sm;
        font-weight: $font-weight-medium;
        color: $text-primary;
        @include ellipsis();
        margin-bottom: $spacing-sm;
        line-height: 1;
      }

      .product-price {
        @include flex();
        align-items: baseline;
        margin-bottom: $spacing-base;

        .price-current {
          font-size: $font-size-base;
          color: $error-color;
          font-weight: $font-weight-semibold;
          margin-right: $spacing-sm;
        }

        .price-member {
          font-size: $font-size-xs;
          font-weight: $font-weight-semibold;
          color: $warning-color;
        }
      }

      .product-actions {
        @include flex-between();
        align-items: center;

        .cart-button {
          @include flex-center();
          width: 48rpx;
          transition: all 0.2s ease;

          &:active {
            transform: scale(0.9);
          }
        }

        .buy-button {
          flex: 1;
          height: 56rpx;
          @include flex-center();
          background: $gradient-primary;
          border-radius: $border-radius-2xl;
          margin-left: $spacing-sm;
          transition: all 0.2s ease;

          &:active {
            transform: scale(0.95);
            opacity: 0.8;
          }

          .buy-text {
            font-size: $font-size-sm;
            font-weight: $font-weight-semibold;
            color: $background-primary;
          }
        }
      }
    }
  }
}

// 申请入口区
.apply-section-new {
  margin: 0 $spacing-lg $spacing-xl;
  
  .apply-buttons-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-base;
    
    .apply-button-item {
      @include flex-between();
      align-items: center;
      padding: $spacing-lg $spacing-sm $spacing-lg $spacing-lg;
      background: rgba(255, 255, 255, 0.2);
      border-radius: $border-radius-lg;
      box-shadow: 0 8rpx 28rpx rgba(115, 0, 200, 0.1);
      transition: all 0.2s ease;

      &:active {
        transform: scale(0.95);
        background: rgba(255, 255, 255, 0.3);
      }
      
      .apply-text-content {
        flex: 1;
        
        .apply-main-title {
          font-size: $font-size-base;
          font-weight: $font-weight-semibold;
          color: #fff;
          display: block;
        }
        
        .apply-sub-desc {
          font-size: $font-size-xs;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.3;
        }
      }
    }
  }
}

// 公司版权信息区
.footer-section {  
  .company-info {
    text-align: center;
    padding-bottom: $spacing-lg;
    
    .company-name {
      font-size: $font-size-sm;
      font-weight: $font-weight-semibold;
      color: $background-primary;
      display: block;
      margin-bottom: $spacing-xs;
    }
    
    .company-details {
      font-size: $font-size-xs;
      color: $background-primary;
      display: block;
      margin-bottom: $spacing-xs;
    }
    
    .icp-info {
      font-size: $font-size-xs;
      color: $background-primary;
      opacity: 0.6;
      display: block;
    }
  }
}

// 客服支持
.customer-service {
  position: fixed;
  right: $spacing-lg;
  bottom: 180rpx;
  width: 120rpx;
  height: 120rpx;
  background: $gradient-primary;
  border-radius: 60rpx;
  @include flex-center();
  flex-direction: column;
  @include shadow(lg);
  z-index: $z-index-fixed;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.9);
    box-shadow: 0 4rpx 16rpx rgba(115, 0, 200, 0.3);
  }

  .service-text {
    font-size: $font-size-xs;
    color: #fff;
    font-weight: $font-weight-medium;
    margin-bottom: $spacing-xs;
  }
}

// 底部间距
.bottom-spacing {
  height: $spacing-2xl;
  margin-bottom: $spacing-base;
}
</style>
