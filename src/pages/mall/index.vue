<template>
  <view class="page">
    <view class="page-bgimg"></view>
    
    <!-- 自定义标题栏 -->
    <view class="header-bar" :class="{ 'scrolled': isScrolled }">
      <view class="header-left">
        <text class="header-title">商城</text>
      </view>
      <view class="header-center">
        <view class="search-bar-mini" @click="goToSearch">
          <Icon name="search" size="small" color="#999" />
          <text class="search-placeholder">搜索商品名称、关键词</text>
        </view>
      </view>
      <view class="header-right">
        <view class="cart-icon" @click="goToCart">
          <Icon name="shopping-cart" size="medium" color="#333" />
          <view v-if="cartCount > 0" class="cart-badge">
            <text class="cart-count">{{ cartCount > 99 ? '99+' : cartCount }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 搜索模块 -->
    <view class="search-section animate__animated animate__fadeInDown">      
      <!-- 历史搜索 -->
      <view v-if="showSearchHistory && searchHistory.length > 0" class="search-history">
        <view class="history-header">
          <text class="history-title">历史搜索</text>
          <text class="clear-history" @click="clearSearchHistory">清空</text>
        </view>
        <view class="history-tags">
          <text 
            v-for="(item, index) in searchHistory" 
            :key="index"
            class="history-tag"
            @click="selectSearchHistory(item)"
          >
            {{ item }}
          </text>
        </view>
      </view>
      
      <!-- 热门搜索 -->
      <view v-if="showSearchHistory" class="hot-search">
        <view class="hot-header">
          <text class="hot-title">热门搜索</text>
        </view>
        <view class="hot-tags">
          <text 
            v-for="(item, index) in hotSearchKeywords" 
            :key="index"
            class="hot-tag"
            @click="selectHotSearch(item)"
          >
            {{ item }}
          </text>
        </view>
      </view>
    </view>

    <!-- 商品分类导航 -->
    <view class="category-section  animate__animated animate__fadeInRight"> 
      <scroll-view 
        class="category-scroll" 
        scroll-x="true" 
        :show-scrollbar="false"
      >
        <view class="category-list">
          <view 
            v-for="(category, index) in categories" 
            :key="category.id"
            class="category-item"
            :class="{ active: selectedCategoryIndex === index }"
            @click="selectCategory(index)"
          >
            <Icon :name="category.icon" size="medium" :color="selectedCategoryIndex === index ? '#d746f0' : '#666'" />
            <text class="category-name">{{ category.name }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- Banner轮播图 -->
    <view class="banner-section animate__animated animate__bounceIn">
      <swiper 
        class="banner-swiper" 
        indicator-dots 
        autoplay 
        interval="3000" 
        duration="500"
        indicator-color="rgba(255,255,255,0.5)"
        indicator-active-color="#d746f0"
      >
        <swiper-item v-for="(banner, index) in banners" :key="index">
          <image 
            class="banner-image" 
            :src="banner.image" 
            mode="aspectFill"
            @click="onBannerClick(banner)"
          />
        </swiper-item>
      </swiper>
    </view>

    <!-- 商品列表 -->
    <scroll-view
      class="product-list-scroll"
      scroll-y="true"
      :show-scrollbar="false"
      @scrolltolower="onLoadMore"
      @scroll="onScroll"
    >
      <view class="product-section">
        <view class="section-header animate__animated animate__fadeInUp">
          <text class="section-title">{{ categories[selectedCategoryIndex].name }}</text>
          <view class="header-right-actions">
            <!-- 筛选标签 -->
            <view class="sort-tags">
              <view 
                v-for="(sort, index) in sortOptions" 
                :key="sort.key"
                class="sort-tag"
                :class="{ active: selectedSortIndex === index }"
                @click="selectSort(index)"
              >
                <text class="sort-tag-text">{{ sort.name }}</text>
                <Icon 
                  v-if="sort.icon"
                  :name="sort.icon" 
                  size="small" 
                  :color="selectedSortIndex === index ? '#d746f0' : '#666'" 
                />
              </view>
            </view>
            <!-- 布局切换 -->
            <view class="layout-toggle">
              <view 
                class="layout-btn" 
                :class="{ active: layoutMode === 'grid' }"
                @click="setLayoutMode('grid')"
              >
                <Icon 
                  name="grid" 
                  size="small" 
                  :color="layoutMode === 'grid' ? '#d746f0' : '#999'" 
                />
              </view>
              <view 
                class="layout-btn" 
                :class="{ active: layoutMode === 'list' }"
                @click="setLayoutMode('list')"
              >
                <Icon 
                  name="list" 
                  size="small" 
                  :color="layoutMode === 'list' ? '#d746f0' : '#999'" 
                />
              </view>
            </view>
          </view>
        </view>
        
        <!-- 商品网格 -->
        <view class="products-grid" :class="{ 'list-mode': layoutMode === 'list' }">
          <view
            v-for="(product, index) in filteredProducts"
            :key="product.id"
            class="product-item animate__animated animate__fadeInUp"
            :style="{ animationDelay: (index % 6) * 100 + 'ms' }"
            @click="goToProductDetail(product)"
          >
            <view class="product-image-container">
              <image
                :src="product.image"
                class="product-image"
                mode="aspectFill"
              />
              <!-- 商品标签 -->
              <view v-if="product.isNew" class="product-tag new-tag">
                <text class="tag-text">新品</text>
              </view>
              <view v-else-if="product.isHot" class="product-tag hot-tag">
                <text class="tag-text">热销</text>
              </view>
            </view>
            <view class="product-info">
              <text class="product-name">{{ product.name }}</text>
              <view class="product-price">
                <text class="price-current">¥{{ product.price }}</text>
                <text class="price-member">会员¥{{ product.memberPrice }}</text>
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
        
        <!-- 加载更多 -->
        <view v-if="isLoadingMore" class="loading-more">
          <text class="loading-text">加载中...</text>
        </view>
        
        <!-- 没有更多数据 -->
        <view v-if="filteredProducts.length > 0" class="no-more">
          <view class="no-more-line"></view>
          <text class="no-more-text">{{ hasMore ? '上拉加载更多' : '没有更多商品了' }}</text>
          <view class="no-more-line"></view>
        </view>
        
        <!-- 空状态 -->
        <view v-if="filteredProducts.length === 0 && !isLoading" class="empty-state">
          <Icon name="shopping-cart" size="large" color="#ccc" />
          <text class="empty-text">{{ searchKeyword ? '没有找到相关商品' : '暂无商品数据' }}</text>
        </view>
      </view>
    </scroll-view>


    <!-- 自定义底部导航 -->
    <CustomTabBar :current="1" />

    <!-- 规格选择器 -->
    <SpecSelector
      :show="showSpecSelector"
      :product="selectedProduct"
      :mode="specSelectorMode"
      @close="handleSpecSelectorClose"
      @add-to-cart="handleSpecAddToCart"
      @buy-now="handleSpecBuyNow"
    />
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import Icon from '@/components/common/Icon.vue'
import CustomTabBar from '@/components/layout/CustomTabBar.vue'
import SpecSelector from '@/components/mall/SpecSelector.vue'
import { useCartStore } from '@/stores/cart'

export default {
  name: 'MallIndexPage',
  components: {
    Icon,
    CustomTabBar,
    SpecSelector
  },
  // 页面配置
  onPageScroll(e) {
    // 这里需要通过组件实例来更新状态
    if (this.updateScrollState) {
      this.updateScrollState(e.scrollTop)
    }
  },
  setup() {
    const cartStore = useCartStore()

    // 页面状态
    const isLoading = ref(false)
    const isRefreshing = ref(false)
    const isLoadingMore = ref(false)
    const hasMore = ref(false)
    const layoutMode = ref('grid') // grid 或 list
    const isScrolled = ref(false) // 滚动状态
    
    // 搜索相关
    const searchKeyword = ref('')
    const showSearchHistory = ref(false)
    const searchHistory = ref(['杜蕾斯', '润滑剂', '毛巾', '洗发水'])
    const hotSearchKeywords = ref(['热销商品', '新品上市', '会员专享', '限时特惠', '酒店用品'])
    
    // 分类数据
    const categories = ref([
      { id: 'all', name: '全部', icon: 'grid' },
      { id: 'hotel', name: '酒店用品', icon: 'towels' },
      { id: 'care', name: '清洁护理', icon: 'bath' },
      { id: 'adult', name: '情趣用品', icon: 'heart' },
      { id: 'health', name: '营养保健', icon: 'pill' },
      { id: 'other', name: '其他精选', icon: 'goods' }
    ])
    const selectedCategoryIndex = ref(0)
    
    // Banner轮播图数据
    const banners = ref([
      {
        id: 1,
        image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/banner01.jpg',
        title: '新品上市',
        link: '/pages/mall/category?id=new'
      },
      {
        id: 2,
        image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/banner02.jpg',
        title: '会员专享',
        link: '/pages/mall/category?id=member'
      },
      {
        id: 3,
        image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/banner03.jpg',
        title: '限时特惠',
        link: '/pages/mall/category?id=sale'
      }
    ])
    
    // 购物车状态 - 从 store 获取
    const cartCount = computed(() => cartStore.totalCount)

    // 规格选择器相关
    const showSpecSelector = ref(false)
    const selectedProduct = ref({})
    const specSelectorMode = ref('cart') // 'cart' 或 'buy' 或 'both'
    
    // 排序选项
    const sortOptions = ref([
      { key: 'default', name: '新品' },
      { key: 'sales', name: '热销' },
      { key: 'price_asc', name: '价格', icon: 'chevron-up' },
      { key: 'price_desc', name: '价格', icon: 'chevron-down' },
    ])
    const selectedSortIndex = ref(0)
    
    // 商品数据 - 详细的Mock数据（包含首页商品）
    const allProducts = ref([
      // 酒店用品
      {
        id: 1,
        name: '五星级酒店毛巾套装',
        price: 89.9,
        memberPrice: 69.9,
        category: 'hotel',
        image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good07.jpg',
        images: ['https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good07.jpg'],
        sales: 1200,
        rating: 4.8,
        stock: 100,
        isNew: false,
        isHot: true,
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
      {
        id: 2,
        name: '酒店专用拖鞋',
        price: 29.9,
        memberPrice: 24.9,
        category: 'hotel',
        image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good08.jpg',
        images: ['https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good08.jpg'],
        sales: 800,
        rating: 4.6,
        stock: 200,
        isNew: false,
        isHot: false,
        specs: [
          {
            name: '尺码',
            options: [
              { name: 'S(36-37)', value: 's', price: 0, stock: 50 },
              { name: 'M(38-39)', value: 'm', price: 0, stock: 80 },
              { name: 'L(40-41)', value: 'l', price: 0, stock: 70 }
            ]
          }
        ]
      },
      {
        id: 3,
        name: '全季禅茶香薰精油',
        price: 59.9,
        memberPrice: 49.9,
        category: 'hotel',
        image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good09.jpg',
        images: ['https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good09.jpg'],
        sales: 650,
        rating: 4.7,
        stock: 150,
        isNew: true,
        isHot: false,
        specs: [
          {
            name: '香型',
            options: [
              { name: '薰衣草', value: 'lavender', price: 0, stock: 50 },
              { name: '檀香', value: 'sandalwood', price: 5, stock: 50 },
              { name: '茉莉花', value: 'jasmine', price: 0, stock: 50 }
            ]
          }
        ]
      },
      {
        id: 4,
        name: '酒店床品四件套',
        price: 199.9,
        memberPrice: 159.9,
        category: 'hotel',
        image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good10.jpg',
        images: ['https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good10.jpg'],
        sales: 420,
        rating: 4.9,
        stock: 80,
        isNew: false,
        isHot: false,
        specs: [
          {
            name: '尺寸',
            options: [
              { name: '1.5m床', value: '1.5m', price: 0, stock: 30 },
              { name: '1.8m床', value: '1.8m', price: 20, stock: 50 }
            ]
          },
          {
            name: '颜色',
            options: [
              { name: '白色', value: 'white', price: 0, stock: 40 },
              { name: '灰色', value: 'gray', price: 0, stock: 40 }
            ]
          }
        ]
      },
      
      // 清洁护理
      {
        id: 5,
        name: '海瑟薇氨基酸洗发水',
        price: 39.9,
        memberPrice: 32.9,
        category: 'care',
        image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good11.jpg',
        images: ['https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good11.jpg'],
        sales: 2100,
        rating: 4.5,
        stock: 300,
        isNew: false,
        isHot: true,
        specs: [
          {
            name: '规格',
            options: [
              { name: '500ml', value: '500ml', price: 0, stock: 150 },
              { name: '750ml', value: '750ml', price: 10, stock: 150 }
            ]
          }
        ]
      },
      {
        id: 6,
        name: 'Adidas男士沐浴露',
        price: 35.9,
        memberPrice: 29.9,
        category: 'care',
        image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good12.jpg',
        images: ['https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good12.jpg'],
        sales: 1800,
        rating: 4.6,
        stock: 250,
        isNew: false,
        isHot: true,
        specs: [
          {
            name: '容量',
            options: [
              { name: '400ml', value: '400ml', price: 0, stock: 130 },
              { name: '600ml', value: '600ml', price: 8, stock: 120 }
            ]
          }
        ]
      },
      {
        id: 7,
        name: '专用小苏打洁牙三套装',
        price: 25.9,
        memberPrice: 21.9,
        category: 'care',
        image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good13.jpg',
        images: ['https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good13.jpg'],
        sales: 1500,
        rating: 4.4,
        stock: 180,
        isNew: false,
        isHot: false,
        specs: [
          {
            name: '套装',
            options: [
              { name: '3支装', value: '3pcs', price: 0, stock: 180 }
            ]
          }
        ]
      },
      {
        id: 8,
        name: '洁尔阴男士抑菌清洗液',
        price: 89.9,
        memberPrice: 75.9,
        category: 'care',
        image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good14.jpg',
        images: ['https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good14.jpg'],
        sales: 890,
        rating: 4.8,
        stock: 120,
        isNew: true,
        isHot: false,
        specs: [
          {
            name: '规格',
            options: [
              { name: '200ml', value: '200ml', price: 0, stock: 60 },
              { name: '300ml', value: '300ml', price: 15, stock: 60 }
            ]
          }
        ]
      },

      // 情趣用品（包含首页商品）
      {
        id: 9,
        name: '杜蕾斯至薄装安全套',
        price: 89.9,
        memberPrice: 69.9,
        category: 'adult',
        image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good01.jpg',
        images: ['https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good01.jpg'],
        sales: 3200,
        rating: 4.9,
        stock: 500,
        isNew: false,
        isHot: true,
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
      {
        id: 10,
        name: 'KY私密润滑剂50ml',
        price: 129.9,
        memberPrice: 99.9,
        category: 'adult',
        image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good02.jpg',
        images: ['https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good02.jpg'],
        sales: 2800,
        rating: 4.7,
        stock: 350,
        isNew: false,
        isHot: true,
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
      {
        id: 11,
        name: '维多利亚蕾丝情趣内衣',
        price: 299.9,
        memberPrice: 239.9,
        category: 'adult',
        image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good03.jpg',
        images: ['https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good03.jpg'],
        sales: 1850,
        rating: 4.8,
        stock: 150,
        isNew: true,
        isHot: false,
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
      {
        id: 12,
        name: '伊珞EROCOME震动棒',
        price: 169.9,
        memberPrice: 139.9,
        category: 'adult',
        image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good06.jpg',
        images: ['https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good06.jpg'],
        sales: 1200,
        rating: 4.6,
        stock: 100,
        isNew: false,
        isHot: false,
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

      // 营养保健（包含首页商品）
      {
        id: 13,
        name: 'Fairvital德国玛卡胶囊',
        price: 210.9,
        memberPrice: 159.9,
        category: 'health',
        image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good04.jpg',
        images: ['https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good04.jpg'],
        sales: 1580,
        rating: 4.8,
        stock: 200,
        isNew: true,
        isHot: true,
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
      {
        id: 14,
        name: '万艾可枸橼酸西地那非',
        price: 299.9,
        memberPrice: 249.9,
        category: 'health',
        image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good15.jpg',
        images: ['https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good15.jpg'],
        sales: 650,
        rating: 4.8,
        stock: 80,
        isNew: false,
        isHot: false,
        specs: [
          {
            name: '规格',
            options: [
              { name: '4片装', value: '4pcs', price: 0, stock: 40 },
              { name: '8片装', value: '8pcs', price: 80, stock: 40 }
            ]
          }
        ]
      },
      {
        id: 15,
        name: '康恩贝金罐蛋白粉',
        price: 199.9,
        memberPrice: 169.9,
        category: 'health',
        image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good16.jpg',
        images: ['https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good16.jpg'],
        sales: 420,
        rating: 4.5,
        stock: 120,
        isNew: false,
        isHot: false,
        specs: [
          {
            name: '口味',
            options: [
              { name: '原味', value: 'original', price: 0, stock: 60 },
              { name: '巧克力味', value: 'chocolate', price: 10, stock: 60 }
            ]
          }
        ]
      },
      {
        id: 16,
        name: '倍能适益生菌胶囊',
        price: 89.9,
        memberPrice: 72.9,
        category: 'health',
        image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good17.jpg',
        images: ['https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good17.jpg'],
        sales: 750,
        rating: 4.7,
        stock: 150,
        isNew: false,
        isHot: false,
        specs: [
          {
            name: '规格',
            options: [
              { name: '30粒装', value: '30pcs', price: 0, stock: 80 },
              { name: '60粒装', value: '60pcs', price: 30, stock: 70 }
            ]
          }
        ]
      },

      // 清洁护理（包含首页商品）
      {
        id: 17,
        name: '简禾酒精杀菌消毒湿巾',
        price: 19.9,
        memberPrice: 16.9,
        category: 'care',
        image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good05.jpg',
        images: ['https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good05.jpg'],
        sales: 3800,
        rating: 4.5,
        stock: 500,
        isNew: false,
        isHot: true,
        specs: [
          {
            name: '规格',
            options: [
              { name: '80片装', value: '80pcs', price: 0, stock: 250 },
              { name: '120片装', value: '120pcs', price: 10, stock: 250 }
            ]
          }
        ]
      },

      // 其他精选
      {
        id: 18,
        name: '德国哈恩益生菌漱口水',
        price: 79.9,
        memberPrice: 65.9,
        category: 'other',
        image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good18.jpg',
        images: ['https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good18.jpg'],
        sales: 560,
        rating: 4.6,
        stock: 180,
        isNew: true,
        isHot: false,
        specs: [
          {
            name: '规格',
            options: [
              { name: '300ml', value: '300ml', price: 0, stock: 90 },
              { name: '500ml', value: '500ml', price: 20, stock: 90 }
            ]
          }
        ]
      },
      {
        id: 19,
        name: '德芙心形巧克力礼盒',
        price: 129.9,
        memberPrice: 109.9,
        category: 'other',
        image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good19.jpg',
        images: ['https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good19.jpg'],
        sales: 340,
        rating: 4.8,
        stock: 100,
        isNew: false,
        isHot: false,
        specs: [
          {
            name: '规格',
            options: [
              { name: '普通装', value: 'normal', price: 0, stock: 50 },
              { name: '豪华装', value: 'deluxe', price: 30, stock: 50 }
            ]
          }
        ]
      },
      {
        id: 20,
        name: 'X6S蓝牙迷你小音箱',
        price: 299.9,
        memberPrice: 259.9,
        category: 'other',
        image: 'https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good20.jpg',
        images: ['https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/good20.jpg'],
        sales: 280,
        rating: 4.7,
        stock: 120,
        isNew: false,
        isHot: false,
        specs: [
          {
            name: '颜色',
            options: [
              { name: '黑色', value: 'black', price: 0, stock: 40 },
              { name: '白色', value: 'white', price: 0, stock: 40 },
              { name: '粉色', value: 'pink', price: 0, stock: 40 }
            ]
          }
        ]
      }
    ])
    
    // 筛选后的商品列表
    const filteredProducts = computed(() => {
      let result = [...allProducts.value]
      
      // 分类筛选
      if (selectedCategoryIndex.value > 0) {
        const selectedCategory = categories.value[selectedCategoryIndex.value].id
        result = result.filter(product => product.category === selectedCategory)
      }
      
      // 关键词搜索
      if (searchKeyword.value.trim()) {
        const keyword = searchKeyword.value.trim().toLowerCase()
        result = result.filter(product => 
          product.name.toLowerCase().includes(keyword)
        )
      }
      
      // 排序
      const sortKey = sortOptions.value[selectedSortIndex.value].key
      result.sort((a, b) => {
        switch (sortKey) {
          case 'default': // 新品优先
            if (a.isNew !== b.isNew) {
              return b.isNew ? 1 : -1
            }
            return b.id - a.id // 按ID倒序（新商品ID更大）
          case 'sales': // 热销优先
            return b.sales - a.sales
          case 'price_asc': // 价格从低到高
            return a.price - b.price
          case 'price_desc': // 价格从高到低
            return b.price - a.price
          default:
            return 0
        }
      })
      
      return result
    })
    
    // 方法定义
    const goToSearch = () => {
      uni.navigateTo({
        url: '/pages/mall/search'
      })
    }
    
    const scanCode = () => {
      uni.scanCode({
        success: (res) => {
          console.log('扫码结果:', res)
          uni.showToast({ title: '扫码购买功能开发中', icon: 'none' })
        },
        fail: () => {
          uni.showToast({ title: '扫码失败', icon: 'none' })
        }
      })
    }
    
    const onSearchInput = () => {
      showSearchHistory.value = searchKeyword.value.length === 0
    }
    
    const onSearchConfirm = () => {
      if (searchKeyword.value.trim()) {
        // 跳转到搜索页面
        uni.navigateTo({
          url: `/pages/mall/search?keyword=${encodeURIComponent(searchKeyword.value.trim())}`
        })
      } else {
        // 如果没有输入关键词，直接跳转到搜索页面
        uni.navigateTo({
          url: '/pages/mall/search'
        })
      }
    }
    
    const addToSearchHistory = (keyword) => {
      const history = [...searchHistory.value]
      const index = history.indexOf(keyword)
      if (index > -1) {
        history.splice(index, 1)
      }
      history.unshift(keyword)
      searchHistory.value = history.slice(0, 10)
      
      // 保存到本地存储
      uni.setStorageSync('mall_search_history', searchHistory.value)
    }
    
    const selectSearchHistory = (keyword) => {
      searchKeyword.value = keyword
      showSearchHistory.value = false
    }
    
    const selectHotSearch = (keyword) => {
      searchKeyword.value = keyword
      showSearchHistory.value = false
      addToSearchHistory(keyword)
    }
    
    const clearSearchHistory = () => {
      searchHistory.value = []
      uni.removeStorageSync('mall_search_history')
    }
    
    const selectCategory = (index) => {
      selectedCategoryIndex.value = index
    }
    
    const selectSort = (index) => {
      selectedSortIndex.value = index
    }
    
    const setLayoutMode = (mode) => {
      console.log('切换布局模式:', mode)
      layoutMode.value = mode
    }
    
    const onBannerClick = (banner) => {
      console.log('点击Banner:', banner)
      if (banner.link) {
        uni.navigateTo({ url: banner.link })
      }
    }
    
    const onRefresh = () => {
      isRefreshing.value = true
      // 模拟刷新数据
      setTimeout(() => {
        isRefreshing.value = false
        uni.showToast({ title: '刷新成功', icon: 'success' })
      }, 1000)
    }
    
    const onLoadMore = () => {
      if (isLoadingMore.value || !hasMore.value) return
      // 模拟加载更多
      console.log('加载更多商品')
    }
    
    const goToProductDetail = (product) => {
      uni.navigateTo({
        url: `/pages/mall/product-detail?id=${product.id}`
      })
    }
    
    const addToCart = (product) => {
      // 打开规格选择器
      selectedProduct.value = product
      specSelectorMode.value = 'cart'
      showSpecSelector.value = true
    }

    const buyNow = (product) => {
      // 打开规格选择器
      selectedProduct.value = product
      specSelectorMode.value = 'buy'
      showSpecSelector.value = true
    }

    // 规格选择器关闭
    const handleSpecSelectorClose = () => {
      showSpecSelector.value = false
    }

    // 规格选择器确认添加到购物车
    const handleSpecAddToCart = (result) => {
      // 构建购物车商品数据
      const cartItem = {
        id: result.productId,
        name: selectedProduct.value.name,
        price: result.price,
        memberPrice: selectedProduct.value.memberPrice,
        image: result.image || selectedProduct.value.image,
        quantity: result.quantity,
        specs: result.specsText, // 规格文本,如"红色 M"
        stock: 999, // 默认库存
        isValid: true
      }

      // 添加到购物车 store
      cartStore.addToCart(cartItem)

      uni.showToast({
        title: '已添加到购物车',
        icon: 'success',
        duration: 1500
      })

      // 震动反馈
      uni.vibrateShort({
        type: 'light'
      })

      // 关闭规格选择器
      showSpecSelector.value = false
    }

    // 规格选择器确认立即购买
    const handleSpecBuyNow = (result) => {
      // 关闭规格选择器
      showSpecSelector.value = false

      // 跳转到订单确认页面,传递商品信息
      uni.navigateTo({
        url: `/pages/mall/order-confirm?productId=${result.productId}&quantity=${result.quantity}&specs=${encodeURIComponent(result.specsText)}`
      })
    }
    
    const goToCart = () => {
      uni.navigateTo({ url: '/pages/mall/cart' })
    }
    
    // 滚动监听
    const onScroll = (e) => {
      const { scrollTop } = e.detail
      isScrolled.value = scrollTop > 50
    }
    
    // 页面滚动状态更新
    const updateScrollState = (scrollTop) => {
      isScrolled.value = scrollTop > 50
    }
    
    // 初始化
    onMounted(() => {
      // 加载搜索历史
      const history = uni.getStorageSync('mall_search_history')
      if (history && Array.isArray(history)) {
        searchHistory.value = history
      }
    })
    
    return {
      // 状态
      isLoading,
      isRefreshing,
      isLoadingMore,
      hasMore,
      layoutMode,
      searchKeyword,
      showSearchHistory,
      searchHistory,
      hotSearchKeywords,
      categories,
      selectedCategoryIndex,
      sortOptions,
      selectedSortIndex,
      banners,
      cartCount,
      filteredProducts,
      isScrolled,
      showSpecSelector,
      selectedProduct,
      specSelectorMode,

      // 方法
      goToSearch,
      scanCode,
      onSearchInput,
      onSearchConfirm,
      selectSearchHistory,
      selectHotSearch,
      clearSearchHistory,
      selectCategory,
      selectSort,
      setLayoutMode,
      onBannerClick,
      onRefresh,
      onLoadMore,
      goToProductDetail,
      addToCart,
      buyNow,
      goToCart,
      onScroll,
      updateScrollState,
      handleSpecSelectorClose,
      handleSpecAddToCart,
      handleSpecBuyNow
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
  padding-bottom: 20rpx;
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
      cursor: pointer;
      
      .search-placeholder {
        flex: 1;
        font-size: $font-size-sm;
        color: $text-placeholder;
      }
      
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
    
    .cart-icon {
      position: relative;
      width: 54rpx;
      height: 54rpx;
      @include flex-center();
      
      .cart-badge {
        position: absolute;
        top: -10rpx;
        right: -10rpx;
        min-width: 32rpx;
        height: 32rpx;
        @include flex-center();
        background: rgba($error-color, 0.85);
        border-radius: $border-radius-full;
        
        .cart-count {
          font-size: $font-size-xs;
          font-weight: $font-weight-semibold;
          color: #fff;
          line-height: 1;
        }
      }
    }
  }
}

// 搜索区域
.search-section {
  position: relative;
  z-index: 10;
  padding: $spacing-base $spacing-lg;
  margin-top: 70rpx;
  
  // 历史搜索
  .search-history {
    margin-top: $spacing-base;
    
    .history-header {
      @include flex-between();
      align-items: center;
      margin-bottom: $spacing-sm;
      
      .history-title {
        font-size: $font-size-sm;
        color: $text-secondary;
        font-weight: $font-weight-medium;
      }
      
      .clear-history {
        font-size: $font-size-sm;
        color: $primary-color;
      }
    }
    
    .history-tags {
      @include flex();
      flex-wrap: wrap;
      gap: $spacing-sm;
      
      .history-tag {
        padding: $spacing-xs $spacing-base;
        background: $background-primary;
        border-radius: $border-radius-base;
        font-size: $font-size-sm;
        color: $text-secondary;
      }
    }
  }
  
  // 热门搜索
  .hot-search {
    margin-top: $spacing-base;
    
    .hot-header {
      margin-bottom: $spacing-sm;
      
      .hot-title {
        font-size: $font-size-sm;
        color: $text-secondary;
        font-weight: $font-weight-medium;
      }
    }
    
    .hot-tags {
      @include flex();
      flex-wrap: wrap;
      gap: $spacing-sm;
      
      .hot-tag {
        padding: $spacing-xs $spacing-base;
        background: linear-gradient(45deg, $primary-light, $primary-dark);
        color: #fff;
        border-radius: $border-radius-base;
        font-size: $font-size-sm;
      }
    }
  }
}

// 分类导航
.category-section {
  position: relative;
  z-index: 10;
  padding-right: $spacing-lg;
  
  .category-scroll {
    white-space: nowrap;
    
    .category-list {
      @include flex();
      padding: $spacing-sm $spacing-lg $spacing-sm calc($spacing-lg + $spacing-lg);
      
      .category-item {
        @include flex();
        flex-direction: column;
        align-items: center;
        gap: $spacing-xs;
        margin-right: $spacing-lg;
        transition: all 0.3s ease;
        
        &.active {
          .category-name {
            color: $primary-color;
            font-weight: $font-weight-semibold;
          }
        }
        
        .category-name {
          font-size: $font-size-sm;
          color: $text-secondary;
          white-space: nowrap;
        }
      }
    }
  }
}

// Banner轮播图
.banner-section {
  position: relative;
  z-index: 10;
  margin: $spacing-base $spacing-lg;
  
  .banner-swiper {
    height: 320rpx;
    border-radius: $border-radius-xl;
    overflow: hidden;
    
    .banner-image {
      width: 100%;
      height: 100%;
    }
  }
}

// 商品列表
.product-list-scroll {
  flex: 1;
  
  .product-section {
    padding: $spacing-lg;
    
    .section-header {
      @include flex-between();
      align-items: center;
      margin-bottom: $spacing-lg;
      
      .section-title {
        font-size: $font-size-lg;
        font-weight: $font-weight-semibold;
        color: $text-primary;
      }
      
      .header-right-actions {
        @include flex();
        align-items: center;
        gap: $spacing-lg;
        
        .sort-tags {
          @include flex();
          gap: $spacing-base;
          
          .sort-tag {
            @include flex();
            align-items: center;
            transition: all 0.3s ease;
            
            &.active {              
              .sort-tag-text {
                color: $primary-color;
                font-weight: $font-weight-semibold;
              }
            }
            
            .sort-tag-text {
              font-size: $font-size-sm;
              color: $text-secondary;
              white-space: nowrap;
            }
          }
        }
        
        .layout-toggle {
          @include flex();
          gap: $spacing-sm;
          
          .layout-btn {
            width: 48rpx;
            height: 48rpx;
            @include flex-center();
            background-color: rgba($background-primary, 0.5);
            border-radius: $border-radius-base;
            transition: all 0.3s ease;
            cursor: pointer;
            
            &:active {
              transform: scale(0.9);
            }
            
            &.active {
              background-color: rgba($primary-color, 0.1);
            }
          }
        }
      }
    }
    
    // 商品网格 - 复用首页样式
    .products-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: $spacing-base;
      
      &.list-mode {
        grid-template-columns: 1fr;
        
        .product-item {
          @include flex();
          
          .product-image-container {
            display: flex;
            width: 200rpx;
            flex-shrink: 0;
            margin-right: $spacing-base;
            margin-bottom: 0;
            
            .product-image {
              width: 240rpx;
              height: 170rpx;
            }
          }
          
          .product-info {
            flex: 1;

            .product-name {
              display: block;
              margin-bottom: $spacing-xs;
              font-size: $font-size-base;
              color: $text-primary;
              font-weight: $font-weight-medium;
              line-height: 1.3;
            }

            .product-price {
              margin-bottom: $spacing-sm;
            }
          }
        }
      }

      .product-item {
        @include card();
        padding: $spacing-base;
        transition: all 0.2s ease;
        
        &:active {
          transform: scale(0.98);
          opacity: 0.8;
        }
      }

      .product-image-container {
        position: relative;
        width: 100%;
        margin-bottom: $spacing-xs;
        
        .product-image {
          width: 100%;
          height: 280rpx;
          border-radius: $border-radius-base;
          background-color: $background-tertiary;
        }
        
        .product-tag {
          position: absolute;
          @include flex-center();
          bottom: 12rpx;
          left: $spacing-xs;
          padding: $spacing-xs $spacing-sm;
          border-radius: $border-radius-base;
          z-index: 2;
          
          .tag-text {
            font-size: $font-size-xs;
            font-weight: $font-weight-semibold;
            color: #fff;
            line-height: 1.3;
          }
          
          &.new-tag {
            background: linear-gradient(45deg, #39dc88, $success-color);
          }
          
          &.hot-tag {
            background: linear-gradient(45deg, $error-color, #ff6b6b);
          }
        }
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
            max-width: 200rpx;
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
              color: #fff;
              font-weight: $font-weight-medium;
            }
          }
        }
      }
    }
    
    // 加载状态
    .loading-more {
      text-align: center;
      padding: $spacing-lg;
      margin-top: $spacing-sm;
      
      .loading-text {
        font-size: $font-size-sm;
        color: $text-tertiary;
      }
    }
    
    // 触底提示 - 带左右分割线
    .no-more {
      @include flex-center();
      align-items: center;
      padding: $spacing-sm;
      margin-top: $spacing-base;
      gap: $spacing-base;
      
      .no-more-line {
        flex: 1;
        height: 2rpx;
        background-color: $border-color;
      }
      
      .no-more-text {
        font-size: $font-size-sm;
        color: $text-tertiary;
        white-space: nowrap;
      }
    }
    
    // 空状态
    .empty-state {
      @include flex-center();
      flex-direction: column;
      padding: $spacing-2xl;
      gap: $spacing-base;
      
      .empty-text {
        font-size: $font-size-base;
        color: $text-tertiary;
      }
    }
  }
}


// 动画延迟变量
.product-item:nth-child(1) { animation-delay: 0ms; }
.product-item:nth-child(2) { animation-delay: 100ms; }
.product-item:nth-child(3) { animation-delay: 200ms; }
.product-item:nth-child(4) { animation-delay: 300ms; }
.product-item:nth-child(5) { animation-delay: 400ms; }
.product-item:nth-child(6) { animation-delay: 500ms; }

// 响应式适配
@media screen and (max-width: 750px) {
  .category-list {
    .category-item {
      gap: $spacing-xs;
      
      .category-name {
        font-size: $font-size-xs;
      }
    }
  }
  
  .products-grid {
    gap: $spacing-sm;
    
    .product-item {
      padding: $spacing-sm;
      
      .product-image-container {
        .product-image {
          height: 240rpx;
        }
      }
    }
  }
}
</style>