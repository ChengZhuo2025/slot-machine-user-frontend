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
    <scroll-view
      class="page-content"
      scroll-y="true"
      @scroll="onPageScroll"
      :show-scrollbar="false"
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onPullDownRefresh"
    >
      <!-- Banner轮播图 -->
      <view class="banner-section animate__animated animate__fadeInDown">
        <!-- 骨架屏 -->
        <SkeletonScreen v-if="bannerStore.loading.home && !bannerStore.hasHomeBanners" type="banner" />
        <!-- Banner内容 -->
        <swiper
          v-else-if="bannerStore.hasHomeBanners"
          class="banner-swiper"
          indicator-dots
          indicator-color="rgba(255,255,255,0.3)"
          indicator-active-color="#d746f0"
          autoplay
          interval="4000"
          duration="500"
          circular
        >
          <swiper-item v-for="banner in bannerStore.homeBanners" :key="banner.id">
            <image
              :src="banner.image"
              class="banner-image"
              mode="aspectFill"
              @click="onBannerClick(banner)"
            />
          </swiper-item>
        </swiper>
        <!-- 默认占位 -->
        <view v-else class="banner-placeholder">
          <text class="placeholder-text">暂无轮播图</text>
        </view>
      </view>

      <!-- 酒店推荐区 -->
      <view class="hotel-recommend-section animate__animated animate__fadeInUp">
        <!-- 骨架屏 -->
        <SkeletonScreen v-if="hotelStore.loading.recommended && !hotelStore.hasRecommendedHotels" type="hotel-card" />
        <!-- 推荐酒店内容 -->
        <template v-else-if="hotelStore.hasRecommendedHotels">
          <view @click="goToHotelDetail(hotelStore.recommendedHotels[0])">
            <view class="hotel-info">
              <view class="hotel-name-row">
                <text class="hotel-name">{{ hotelStore.recommendedHotels[0].name }}</text>
                <view class="hotel-stars">
                  <Icon v-for="i in (hotelStore.recommendedHotels[0].star_rating || 5)" :key="i" name="starSolid" size="small" color="#FFD700" />
                </view>
              </view>
              <text class="hotel-address">{{ hotelStore.recommendedHotels[0].full_address || hotelStore.recommendedHotels[0].address }}</text>
            </view>
            <view class="hotel-meta">
              <view class="hotel-rating">
                <Icon name="location" size="small" color="#be32d7" />
                <text class="hotel-distance">{{ hotelStore.recommendedHotels[0].distance || '0' }}km</text>
              </view>
              <view class="hotel-actions">
                <view class="action-button" @click.stop="navigateToHotel(hotelStore.recommendedHotels[0])">
                  <Icon name="send" size="small" color="#fff" />
                  <text class="action-text">导航</text>
                </view>
                <view class="action-button" @click.stop="goToHotelDetail(hotelStore.recommendedHotels[0])">
                  <Icon name="more" size="small" color="#fff" />
                  <text class="action-text">更多</text>
                </view>
              </view>
            </view>
          </view>
        </template>
        <!-- 空状态 -->
        <view v-else class="empty-placeholder">
          <text class="placeholder-text">暂无推荐酒店</text>
        </view>
      </view>

      <!-- 热门房型推荐 -->
      <view class="section room-recommend-section animate__animated animate__fadeInLeft">
        <view class="section-header">
          <Icon name="heart" size="small" color="#fff" />
          <text class="section-title">热门房型 · 一键速订</text>
        </view>
        <!-- 骨架屏 -->
        <view v-if="hotelStore.loading.hotRooms && !hotelStore.hasHotRooms" class="room-list-vertical">
          <SkeletonScreen v-for="i in 3" :key="i" type="hotel-card" />
        </view>
        <!-- 房型列表 -->
        <view v-else-if="hotelStore.hasHotRooms" class="room-list-vertical">
          <view
            v-for="room in hotelStore.hotRooms"
            :key="room.id"
            class="room-card animate__animated animate__fadeInUp animate__delay-300ms"
            @click="goToRoomDetail(room)"
          >
            <view class="room-time-badge">
              <text class="time-text">今天{{ formatAvailableTime(room) }}</text>
            </view>
            <image
              :src="getRoomCoverImage(room)"
              class="room-card-image"
              mode="aspectFill"
            />
            <view class="room-card-content">
              <text class="room-card-name">{{ room.room_type || room.name }}</text>
              <view class="room-tag">
                <Icon name="bed" size="small" color="#d746f0" />
                <text class="tag-text">{{ room.max_guests ? `可住${room.max_guests}人` : '仅剩2间' }}</text>
              </view>
              <text class="room-card-description">套餐: {{ room.bed_type || '大床房' }} · {{ room.area ? `${room.area}㎡` : '舒适空间' }}</text>
              <view class="room-card-footer">
                <view class="room-price-info">
                  <text class="price-symbol">¥</text>
                  <text class="price-amount">{{ room.hourly_price || room.daily_price }}</text>
                </view>
                <view class="book-button-new">
                  <text class="book-text-new">立即预订</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        <!-- 空状态 -->
        <EmptyState v-else type="hotel" title="暂无热门房型" />
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
          <text class="section-title">{{ locationDenied ? '热门酒店' : '附近酒店' }}</text>
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
        <!-- 骨架屏 -->
        <view v-if="hotelStore.loading.nearby && !hasNearbyHotels" class="hotel-cards">
          <SkeletonScreen v-for="i in 4" :key="i" type="product-card" />
        </view>
        <!-- 酒店列表 -->
        <view v-else-if="hasNearbyHotels" class="hotel-cards">
          <view
            v-for="hotel in displayedNearbyHotels"
            :key="hotel.id"
            class="hotel-card animate__animated animate__fadeInRight"
            @click="goToHotelDetail(hotel)"
          >
            <image
              :src="getHotelCoverImage(hotel)"
              class="hotel-card-image"
              mode="aspectFill"
            />
            <view class="hotel-card-info">
              <text class="hotel-card-name">{{ hotel.name }}</text>
              <view class="hotel-card-meta">
                <view class="hotel-remaining">
                  <Icon name="bed" size="small" color="#999" />
                  <text class="hotel-card-remaining">剩余{{ hotel.room_count || hotel.remaining || 5 }}间</text>
                </view>
                <view class="hotel-distance-badge">
                  <Icon name="location" size="xsmall" color="#6366f1" />
                  <text class="distance-text">{{ hotel.distance || '2.5' }}km</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        <!-- 空状态 -->
        <EmptyState v-else type="hotel" title="暂无酒店信息" />
      </view>

      <!-- 优惠信息区 -->
      <view class="section coupon-section animate__animated animate__fadeInLeft">
        <view class="section-header">
          <text class="section-title">限时优惠</text>
        </view>
        <!-- 骨架屏 -->
        <view v-if="couponStore.loading.limited && !couponStore.limitedTimeCoupons.length" class="coupon-grid">
          <SkeletonScreen v-for="i in 3" :key="i" type="coupon" />
        </view>
        <!-- 优惠券列表 -->
        <view v-else-if="couponStore.limitedTimeCoupons.length" class="coupon-grid">
          <view
            v-for="coupon in couponStore.limitedTimeCoupons"
            :key="coupon.id"
            class="coupon-item"
            @click="handleReceiveCoupon(coupon)"
          >
            <view class="coupon-amount">
              <text class="coupon-value">{{ formatCouponValue(coupon) }}</text>
              <text class="coupon-unit">{{ coupon.type === 'percent' ? '折' : '元' }}</text>
            </view>
            <view class="coupon-info">
              <text class="coupon-title">{{ coupon.name }}</text>
              <text class="coupon-desc">{{ formatCouponCondition(coupon) }}</text>
            </view>
            <view class="coupon-button" :class="{ claimed: !coupon.can_receive || couponStore.isReceiving(coupon.id) }">
              <text class="coupon-button-text">{{ getCouponButtonText(coupon) }}</text>
            </view>
          </view>
        </view>
        <!-- 默认优惠券 -->
        <view v-else class="coupon-grid">
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
        <!-- 骨架屏 -->
        <view v-if="mallStore.loading.selected && !mallStore.hasSelectedProducts" class="products-grid">
          <SkeletonScreen v-for="i in 4" :key="i" type="product-card" />
        </view>
        <!-- 商品列表 -->
        <view v-else-if="mallStore.hasSelectedProducts" class="products-grid">
          <view
            v-for="product in mallStore.selectedProducts"
            :key="product.id"
            class="product-item"
            @click="goToProductDetail(product)"
          >
            <image
              :src="getProductImage(product)"
              class="product-image"
              mode="aspectFill"
            />
            <view class="product-info">
              <text class="product-name">{{ product.name }}</text>
              <view class="product-price">
                <text class="price-current">¥{{ product.price }}</text>
                <text class="price-member">会员¥{{ product.original_price || product.price * 0.9 }}</text>
              </view>
              <view class="product-actions">
                <view class="cart-button" @click.stop="addToCart(product)">
                  <Icon name="shopping-cart-check" size="small" color="#be32d7" />
                </view>
                <view class="buy-button" @click.stop="buyNow(product)">
                  <text class="buy-text">立即购买</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        <!-- 空状态 -->
        <EmptyState v-else type="product" title="暂无精选商品" />
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

      <!-- 缓存数据提示 -->
      <view v-if="showCacheWarning" class="cache-warning">
        <Icon name="info" size="small" color="#F59E0B" />
        <text class="cache-warning-text">网络异常，展示的可能不是最新数据</text>
        <view class="cache-refresh" @click="forceRefreshAll">
          <Icon name="rotate-ccw" size="small" color="#F59E0B" />
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
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { useAppStore } from "@/stores/app";
import { useUserStore } from "@/stores/user";
import { useBannerStore } from "@/stores/banner";
import { useHotelStore } from "@/stores/hotel";
import { useMallStore } from "@/stores/mall";
import { useCouponStore } from "@/stores/coupon";
import Icon from "@/components/common/Icon.vue";
import CustomTabBar from "@/components/layout/CustomTabBar.vue";
import SkeletonScreen from "@/components/layout/SkeletonScreen.vue";
import EmptyState from "@/components/common/EmptyState.vue";

export default {
  name: "IndexPage",
  components: {
    Icon,
    CustomTabBar,
    SkeletonScreen,
    EmptyState,
  },
  setup() {
    const appStore = useAppStore();
    const userStore = useUserStore();
    const bannerStore = useBannerStore();
    const hotelStore = useHotelStore();
    const mallStore = useMallStore();
    const couponStore = useCouponStore();

    // 页面状态
    const unreadMessageCount = ref(3);
    const activeHotelTab = ref(0);
    const isScrolled = ref(false);
    const isRefreshing = ref(false);
    const locationDenied = ref(false);
    const currentLocation = ref(null);
    const showCacheWarning = ref(false);

    // 优惠券状态管理（本地mock）
    const couponStatus = reactive({
      newbie: false,
      discount: false,
      monthlyCard: false
    });

    // 酒店分类标签
    const hotelTabs = ref([
      { name: "电竞酒店", type: "gaming" },
      { name: "主题酒店", type: "theme" },
      { name: "私享酒店", type: "private" },
      { name: "尊住酒店", type: "luxury" },
    ]);

    // 本地mock酒店数据（位置权限被拒绝或API失败时使用）
    const localHotelsByCategory = ref({
      gaming: [
        { id: 1, name: "城市猎手电竞酒店", room_count: 8, distance: 1.2, images: ["https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel01.jpg"] },
        { id: 5, name: "王者荣耀电竞主题", room_count: 6, distance: 2.8, images: ["https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel02.jpg"] },
        { id: 6, name: "英雄联盟竞技酒店", room_count: 4, distance: 3.5, images: ["https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel03.jpg"] },
        { id: 7, name: "绝地求生战队基地", room_count: 3, distance: 4.1, images: ["https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel04.jpg"] },
      ],
      theme: [
        { id: 8, name: "浪漫巴黎情侣主题", room_count: 5, distance: 1.8, images: ["https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel05.jpg"] },
        { id: 9, name: "维多利亚复古庄园", room_count: 3, distance: 3.2, images: ["https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel06.jpg"] },
        { id: 10, name: "东京樱花日式温泉", room_count: 2, distance: 5.6, images: ["https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel07.jpg"] },
        { id: 11, name: "马尔代夫海景套房", room_count: 1, distance: 8.3, images: ["https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel08.jpg"] },
      ],
      private: [
        { id: 12, name: "都市秘境私人会所", room_count: 2, distance: 2.3, images: ["https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel09.jpg"] },
        { id: 13, name: "紫禁城尊享私邸", room_count: 1, distance: 6.7, images: ["https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel10.jpg"] },
        { id: 14, name: "香格里拉私密空间", room_count: 2, distance: 4.9, images: ["https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel11.jpg"] },
        { id: 15, name: "黄金海岸独栋别墅", room_count: 1, distance: 12.5, images: ["https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel12.jpg"] },
      ],
      luxury: [
        { id: 16, name: "丽思卡尔顿总统套房", room_count: 1, distance: 3.4, images: ["https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel13.jpg"] },
        { id: 17, name: "四季酒店皇家套房", room_count: 1, distance: 5.1, images: ["https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel14.jpg"] },
        { id: 18, name: "半岛酒店至尊体验", room_count: 1, distance: 7.8, images: ["https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel15.jpg"] },
        { id: 19, name: "宝格丽奢华臻选", room_count: 1, distance: 9.2, images: ["https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel16.jpg"] },
      ],
    });

    // 计算显示的附近酒店
    const hasNearbyHotels = computed(() => {
      return hotelStore.hasNearbyHotels || localHotelsByCategory.value[hotelTabs.value[activeHotelTab.value].type]?.length > 0;
    });

    const displayedNearbyHotels = computed(() => {
      // 优先使用API数据
      if (hotelStore.hasNearbyHotels && !locationDenied.value) {
        return hotelStore.nearbyHotels.slice(0, 4);
      }
      // 降级使用本地数据
      const tabType = hotelTabs.value[activeHotelTab.value].type;
      return localHotelsByCategory.value[tabType] || [];
    });

    // 获取位置信息
    const getLocation = () => {
      return new Promise((resolve, reject) => {
        uni.getLocation({
          type: 'gcj02',
          success: (res) => {
            currentLocation.value = {
              longitude: res.longitude,
              latitude: res.latitude
            };
            locationDenied.value = false;
            resolve(res);
          },
          fail: (err) => {
            console.warn('获取位置失败:', err);
            locationDenied.value = true;
            reject(err);
          }
        });
      });
    };

    // 加载所有首页数据
    const loadPageData = async (forceRefresh = false) => {
      showCacheWarning.value = false;

      try {
        // 并行加载所有数据
        const promises = [
          bannerStore.fetchHomeBanners(forceRefresh),
          hotelStore.fetchRecommendedHotels(forceRefresh),
          hotelStore.fetchHotRooms(forceRefresh),
          mallStore.fetchSelectedProducts(forceRefresh),
          couponStore.fetchLimitedTimeCoupons(forceRefresh),
        ];

        // 尝试获取位置并加载附近酒店
        try {
          await getLocation();
          if (currentLocation.value) {
            promises.push(hotelStore.fetchNearbyHotels(currentLocation.value, forceRefresh));
          }
        } catch (locErr) {
          // 位置获取失败，使用热门酒店替代
          console.log('位置获取失败，显示热门酒店');
        }

        await Promise.allSettled(promises);

        // 检查是否使用了缓存数据
        if (bannerStore.isFromCache.home ||
            hotelStore.isFromCache.recommended ||
            mallStore.isFromCache.selected) {
          showCacheWarning.value = true;
        }
      } catch (error) {
        console.error("加载首页数据失败:", error);
      }
    };

    // 强制刷新所有数据
    const forceRefreshAll = async () => {
      showCacheWarning.value = false;
      isRefreshing.value = true;
      try {
        await loadPageData(true);
      } finally {
        isRefreshing.value = false;
      }
    };

    // 下拉刷新
    const onPullDownRefresh = async () => {
      isRefreshing.value = true;
      try {
        await loadPageData(true);
      } finally {
        isRefreshing.value = false;
      }
    };

    // 工具函数
    const getHotelCoverImage = (hotel) => {
      if (hotel.images && hotel.images.length > 0) {
        return hotel.images[0];
      }
      return hotel.coverImage || 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel01.jpg';
    };

    const getRoomCoverImage = (room) => {
      if (room.images && room.images.length > 0) {
        return room.images[0];
      }
      return room.coverImage || 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/room01.jpg';
    };

    const getProductImage = (product) => {
      if (product.images && product.images.length > 0) {
        return product.images[0];
      }
      return product.image || 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good01.jpg';
    };

    const formatAvailableTime = (room) => {
      if (room.status === 1) {
        return '可预订';
      }
      return '11:30可约';
    };

    const formatCouponValue = (coupon) => {
      if (coupon.type === 'percent') {
        // 折扣类型：0.1表示9折
        return Math.round((1 - coupon.value) * 10);
      }
      return coupon.value;
    };

    const formatCouponCondition = (coupon) => {
      if (coupon.min_amount > 0) {
        return `满${coupon.min_amount}可用`;
      }
      return '无门槛';
    };

    const getCouponButtonText = (coupon) => {
      if (couponStore.isReceiving(coupon.id)) {
        return '领取中...';
      }
      if (coupon.received_by_user >= coupon.per_user_limit) {
        return '已领取';
      }
      if (coupon.remain_count <= 0) {
        return '已抢光';
      }
      if (!coupon.can_receive) {
        return '已领取';
      }
      return '领取';
    };

    // 领取优惠券
    const handleReceiveCoupon = async (coupon) => {
      if (!coupon.can_receive || couponStore.isReceiving(coupon.id)) {
        return;
      }

      const result = await couponStore.receiveCouponById(coupon.id);
      uni.showToast({
        title: result.message,
        icon: result.success ? 'success' : 'none'
      });
    };

    // 本地优惠券领取（mock）
    const receiveCoupon = (type) => {
      if (couponStatus[type]) {
        uni.showToast({ title: "您已领取过该优惠券", icon: "none" });
        return;
      }

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

      couponStatus.monthlyCard = true;
      uni.showToast({ title: "包月卡开通成功！", icon: "success" });
    };

    // 事件处理函数
    const onBannerClick = (banner) => {
      if (banner.link_value) {
        const link = banner.link_value;
        if (link.includes("/pages/mall/index") || link.includes("/pages/distribution/index")) {
          uni.switchTab({ url: link });
        } else {
          uni.navigateTo({ url: link });
        }
      } else if (banner.link) {
        // 兼容旧格式
        if (banner.link.includes("/pages/mall/index") || banner.link.includes("/pages/distribution/index")) {
          uni.switchTab({ url: banner.link });
        } else {
          uni.navigateTo({ url: banner.link });
        }
      }
    };

    const openMessage = () => {
      uni.showToast({ title: "消息功能开发中", icon: "none" });
    };

    const navigateToHotel = (hotel) => {
      if (hotel.longitude && hotel.latitude) {
        uni.openLocation({
          latitude: hotel.latitude,
          longitude: hotel.longitude,
          name: hotel.name,
          address: hotel.full_address || hotel.address
        });
      } else {
        uni.showToast({ title: `导航到${hotel.name}`, icon: "none" });
      }
    };

    const goToHotels = () => {
      uni.navigateTo({ url: "/pages/hotel/list" });
    };

    const goToHotelDetail = (hotel) => {
      uni.navigateTo({ url: `/pages/hotel/detail?id=${hotel.id}` });
    };

    const goToRoomDetail = (room) => {
      // T047: 热门房型卡片点击跳转到房型详情页
      uni.navigateTo({ url: `/pages/hotel/room-detail?id=${room.id}&hotelId=${room.hotel_id}` });
    };

    const openMembership = () => {
      uni.showToast({ title: "会员开通功能开发中", icon: "none" });
    };

    const switchHotelTab = (index) => {
      activeHotelTab.value = index;
    };

    const goToMall = () => {
      uni.switchTab({ url: "/pages/mall/index" });
    };

    const goToProductDetail = (product) => {
      uni.navigateTo({ url: `/pages/mall/product-detail?id=${product.id}` });
    };

    const addToCart = (product) => {
      uni.showToast({ title: "已加入购物车", icon: "success" });
    };

    const buyNow = (product) => {
      uni.navigateTo({
        url: `/pages/mall/product-detail?id=${product.id}&action=buy`,
      });
    };

    const applyOperation = () => {
      uni.showToast({ title: "运营申请功能开发中", icon: "none" });
    };

    const applyAgent = () => {
      uni.showToast({ title: "代理申请功能开发中", icon: "none" });
    };

    const openCustomerService = () => {
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

    onMounted(() => {
      loadPageData();
      appStore.getSystemInfo();
    });

    return {
      userStore,
      bannerStore,
      hotelStore,
      mallStore,
      couponStore,
      unreadMessageCount,
      activeHotelTab,
      isScrolled,
      isRefreshing,
      locationDenied,
      showCacheWarning,
      hotelTabs,
      localHotelsByCategory,
      hasNearbyHotels,
      displayedNearbyHotels,
      couponStatus,
      // 工具函数
      getHotelCoverImage,
      getRoomCoverImage,
      getProductImage,
      formatAvailableTime,
      formatCouponValue,
      formatCouponCondition,
      getCouponButtonText,
      // 事件处理
      onBannerClick,
      openMessage,
      navigateToHotel,
      goToHotels,
      goToHotelDetail,
      goToRoomDetail,
      openMembership,
      switchHotelTab,
      handleReceiveCoupon,
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
      forceRefreshAll,
    };
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

  .banner-placeholder {
    height: 300rpx;
    border-radius: $border-radius-xl;
    background: rgba(255, 255, 255, 0.1);
    @include flex-center();

    .placeholder-text {
      color: rgba(255, 255, 255, 0.6);
      font-size: $font-size-sm;
    }
  }
}

// 页面内容
.page-content {
  flex: 1;
  padding: 0 0 $spacing-lg;
}

// 空占位
.empty-placeholder {
  padding: $spacing-xl;
  @include flex-center();

  .placeholder-text {
    color: rgba(255, 255, 255, 0.6);
    font-size: $font-size-sm;
  }
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

// 缓存警告提示
.cache-warning {
  margin: 0 $spacing-lg $spacing-base;
  padding: $spacing-sm $spacing-base;
  background: rgba(245, 158, 11, 0.15);
  border-radius: $border-radius-base;
  @include flex();
  align-items: center;
  gap: $spacing-sm;

  .cache-warning-text {
    flex: 1;
    font-size: $font-size-xs;
    color: #F59E0B;
  }

  .cache-refresh {
    padding: $spacing-xs;
    @include flex-center();
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
