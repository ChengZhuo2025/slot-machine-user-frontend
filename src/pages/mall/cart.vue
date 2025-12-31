<template>
  <view class="cart-page">
    <!-- 导航栏 -->
    <view class="header-bar">
      <view class="header-left" @click="handleBack">
        <Icon name="arrow-left" size="medium" color="#333" />
      </view>
      <view class="header-center">
        <text class="header-title">购物车</text>
        <text v-if="!isEmpty" class="header-subtitle"
          >({{ totalCount }}件)</text
        >
      </view>
      <view class="header-right">
        <text v-if="!isEmpty" class="manage-btn" @click="toggleManageMode">
          {{ isManageMode ? "完成" : "管理" }}
        </text>
      </view>
    </view>

    <scroll-view v-if="!isEmpty" class="content" scroll-y="true">
      <!-- 购物车商品列表 - 子任务 5.2 -->
      <view class="cart-list animate__animated animate__fadeIn">
        <view
          v-for="item in items"
          :key="item.itemId"
          class="cart-item"
          :class="{ 'cart-item--invalid': !item.isValid }"
        >
          <!-- 选择框 -->
          <view class="item-checkbox" @click="handleToggleSelect(item.itemId)">
            <Icon
              :name="isItemSelected(item.itemId) ? 'success-solid' : 'success'"
              size="medium"
              :color="isItemSelected(item.itemId) ? '#be32d7' : '#d1d5db'"
            />
          </view>

          <!-- 商品信息 -->
          <view class="item-content" @click="handleGoToDetail(item.productId)">
            <image :src="item.image" class="item-image" mode="aspectFill" />
            <view class="item-info">
              <text class="item-name">{{ item.name }}</text>
              <text v-if="item.specs" class="item-specs">{{ item.specs }}</text>
              <view class="item-footer">
                <view class="item-price">
                  <text class="price-symbol">¥</text>
                  <text class="price-value">{{ item.price }}</text>
                  <text v-if="item.memberPrice" class="member-price"
                    >会员¥{{ item.memberPrice }}</text
                  >
                </view>
                <!-- 数量选择器 -->
                <view v-if="!isManageMode" class="quantity-selector">
                  <view
                    class="quantity-btn"
                    :class="{ 'quantity-btn--disabled': item.quantity <= 1 }"
                    @click.stop="handleDecrement(item)"
                  >
                    <Icon name="minus" size="small" color="#666" />
                  </view>
                  <input
                    v-model.number="item.quantity"
                    class="quantity-input"
                    type="number"
                    :disabled="true"
                  />
                  <view
                    class="quantity-btn"
                    :class="{
                      'quantity-btn--disabled': item.quantity >= item.stock,
                    }"
                    @click.stop="handleIncrement(item)"
                  >
                    <Icon name="add" size="small" color="#666" />
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 删除按钮（管理模式） -->
          <view
            v-if="isManageMode"
            class="item-delete"
            @click="handleDeleteItem(item.itemId)"
          >
            <Icon name="delete" size="small" color="#ef4444" />
          </view>

          <!-- 失效提示 -->
          <view v-if="!item.isValid" class="invalid-badge">
            <text class="invalid-text">{{
              item.invalidReason || "商品已失效"
            }}</text>
          </view>
        </view>
      </view>

      <!-- 推荐商品 -->
      <view v-if="recommendProducts.length > 0" class="recommend-section">
        <view class="section-title">
          <text class="title-text">为你推荐</text>
        </view>
        <view class="recommend-list">
          <view
            v-for="product in recommendProducts"
            :key="product.id"
            class="recommend-item"
            @click="handleGoToDetail(product.id)"
          >
            <image
              :src="product.image"
              class="recommend-image"
              mode="aspectFill"
            />
            <text class="recommend-name">{{ product.name }}</text>
            <view class="recommend-price">
              <text class="price-symbol">¥</text>
              <text class="price-value">{{ product.price }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-placeholder"></view>
    </scroll-view>

    <!-- 空状态 - 子任务 5.4 -->
    <view v-else class="empty-cart animate__animated animate__fadeIn">
      <Icon name="cart" size="xlarge" color="#999" />
      <text class="empty-text">购物车空空如也</text>
      <text class="empty-desc">快去挑选心仪的商品吧~</text>
      <button class="go-shopping-btn" @click="handleGoShopping">去逛逛</button>

      <!-- 推荐商品 -->
      <view v-if="recommendProducts.length > 0" class="recommend-section">
        <view class="section-title">
          <text class="title-text">猜你喜欢</text>
        </view>
        <view class="recommend-grid">
          <view
            v-for="product in recommendProducts"
            :key="product.id"
            class="recommend-card"
            @click="handleGoToDetail(product.id)"
          >
            <image :src="product.image" class="card-image" mode="aspectFill" />
            <text class="card-name">{{ product.name }}</text>
            <view class="card-price">
              <text class="price-symbol">¥</text>
              <text class="price-value">{{ product.price }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部结算栏 - 子任务 5.3 -->
    <view v-if="!isEmpty" class="footer-bar">
      <view class="footer-left">
        <view class="select-all" @click="handleToggleSelectAll">
          <Icon
            :name="isAllSelected ? 'success-solid' : 'success'"
            size="medium"
            :color="isAllSelected ? '#be32d7' : '#d1d5db'"
          />
          <text class="select-all-text">全选</text>
        </view>
      </view>
      <view class="footer-right">
        <view v-if="!isManageMode" class="price-info">
          <text class="total-label">合计：</text>
          <text class="total-symbol">¥</text>
          <text class="total-value">{{ selectedPrice.toFixed(2) }}</text>
        </view>
        <button
          v-if="isManageMode"
          class="action-btn action-btn--delete"
          :disabled="selectedCount === 0"
          @click="handleDeleteSelected"
        >
          删除({{ selectedCount }})
        </button>
        <button
          v-else
          class="action-btn action-btn--checkout"
          :disabled="selectedCount === 0"
          @click="handleCheckout"
        >
          结算({{ selectedCount }})
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import Icon from "@/components/common/Icon.vue";
import { useCartStore } from "@/stores/cart";
import request from "@/utils/request";

export default {
  name: "CartPage",
  components: {
    Icon,
  },
  setup() {
    const router = useRouter();
    const cartStore = useCartStore();

    // 管理模式
    const isManageMode = ref(false);

    // 推荐商品
    const recommendProducts = ref([]);

    // 购物车数据（从 store 获取）
    const items = computed(() => cartStore.items);
    const isEmpty = computed(() => cartStore.isEmpty);
    const totalCount = computed(() => cartStore.totalCount);
    const selectedCount = computed(() => cartStore.selectedCount);
    const selectedPrice = computed(() => cartStore.selectedPrice);
    const isAllSelected = computed(() => cartStore.isAllSelected);

    // 获取推荐商品
    const fetchRecommendProducts = async () => {
      try {
        const res = await request({
          url: "/api/mall/popular",
          method: "GET",
        });

        if (res.code === 200) {
          recommendProducts.value = res.data || [];
        }
      } catch (error) {
        console.error("获取推荐商品失败:", error);
      }
    };

    // 返回
    const handleBack = () => {
      uni.navigateBack();
    };

    // 切换管理模式
    const toggleManageMode = () => {
      isManageMode.value = !isManageMode.value;
    };

    // 切换商品选中状态
    const handleToggleSelect = (itemId) => {
      cartStore.toggleSelect(itemId);
    };

    // 检查商品是否选中
    const isItemSelected = (itemId) => {
      return cartStore.isItemSelected(itemId);
    };

    // 切换全选
    const handleToggleSelectAll = () => {
      cartStore.toggleSelectAll();
    };

    // 减少数量
    const handleDecrement = (item) => {
      if (item.quantity > 1) {
        cartStore.updateQuantity(item.itemId, item.quantity - 1);
      }
    };

    // 增加数量
    const handleIncrement = (item) => {
      if (item.quantity < item.stock) {
        cartStore.updateQuantity(item.itemId, item.quantity + 1);
      } else {
        uni.showToast({ title: "库存不足", icon: "none" });
      }
    };

    // 删除单个商品
    const handleDeleteItem = (itemId) => {
      uni.showModal({
        title: "提示",
        content: "确定要删除该商品吗？",
        success: (res) => {
          if (res.confirm) {
            cartStore.removeFromCart(itemId);
            uni.showToast({ title: "已删除", icon: "success" });
          }
        },
      });
    };

    // 删除选中商品
    const handleDeleteSelected = () => {
      if (selectedCount.value === 0) {
        return;
      }

      uni.showModal({
        title: "提示",
        content: `确定要删除选中的${selectedCount.value}件商品吗？`,
        success: (res) => {
          if (res.confirm) {
            cartStore.removeSelectedItems();
            uni.showToast({ title: "已删除", icon: "success" });
            isManageMode.value = false;
          }
        },
      });
    };

    // 跳转商品详情
    const handleGoToDetail = (productId) => {
      uni.navigateTo({ url: `/pages/mall/product-detail?id=${productId}` });
    };

    // 去逛逛
    const handleGoShopping = () => {
      uni.switchTab({ url: "/pages/mall/index" });
    };

    // 结算
    const handleCheckout = () => {
      if (selectedCount.value === 0) {
        uni.showToast({ title: "请选择商品", icon: "none" });
        return;
      }

      // 验证选中商品
      const selectedItems = cartStore.selectedItems;
      const invalidItems = selectedItems.filter(
        (item) => !item.isValid || item.stock < item.quantity
      );

      if (invalidItems.length > 0) {
        uni.showToast({ title: "部分商品已失效或库存不足", icon: "none" });
        return;
      }

      // 跳转到订单确认页
      uni.navigateTo({ url: "/pages/mall/order-confirm" });
    };

    onMounted(() => {
      fetchRecommendProducts();
    });

    return {
      items,
      isEmpty,
      totalCount,
      selectedCount,
      selectedPrice,
      isAllSelected,
      isManageMode,
      recommendProducts,
      handleBack,
      toggleManageMode,
      handleToggleSelect,
      isItemSelected,
      handleToggleSelectAll,
      handleDecrement,
      handleIncrement,
      handleDeleteItem,
      handleDeleteSelected,
      handleGoToDetail,
      handleGoShopping,
      handleCheckout,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";
@import "@/styles/mixins.scss";

.cart-page {
  min-height: 100vh;
  background: $background-secondary;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

// 导航栏
.header-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  padding-top: env(safe-area-inset-top);
  background: $background-primary;
  @include flex-between();
  align-items: center;
  padding-left: $spacing-base;
  padding-right: $spacing-base;
  z-index: 100;
  border-bottom: 1rpx solid $border-color;
}

.header-left {
  @include flex();
  align-items: center;
  width: 60rpx;
}

.header-center {
  flex: 1;
  text-align: center;
  @include flex-center();
  gap: $spacing-xs;
}

.header-title {
  font-size: 32rpx;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.header-subtitle {
  font-size: $spacing-base;
  color: $text-secondary;
}

.header-right {
  width: 60rpx;
  @include flex();
  align-items: center;
  text-align: right;
}

.manage-btn {
  font-size: 28rpx;
  color: $primary-dark;

  &:active {
    opacity: 0.7;
  }
}

// 内容区域
.content {
  height: 100vh;
  padding-top: calc(88rpx + env(safe-area-inset-top));
}

// 购物车列表
.cart-list {
  padding: $spacing-base $spacing-base $spacing-base $spacing-sm;
}

.cart-item {
  position: relative;
  @include flex-start();
  @include shadow(base);
  background: $background-primary;
  border-radius: $spacing-base;
  padding: $spacing-base;
  margin-bottom: $spacing-sm;

  &--invalid {
    opacity: 0.6;

    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.05);
      border-radius: $spacing-sm;
      pointer-events: none;
    }
  }
}

.item-checkbox {
  margin-right: $spacing-xs;

  &:active {
    transform: scale(0.9);
  }
}

.item-content {
  flex: 1;
  @include flex-start();
  gap: $spacing-sm;
}

.item-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  background: $background-secondary;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 160rpx;
}

.item-name {
  font-size: 28rpx;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  line-height: 1.4;
  @include ellipsis(2);
}

.item-specs {
  font-size: $spacing-base;
  color: $text-secondary;
  padding: $spacing-xs 12rpx;
  background: $background-secondary;
  border-radius: $spacing-xs;
  display: inline-block;
  align-self: flex-start;
  margin-top: $spacing-xs;
}

.item-footer {
  @include flex-between();
  align-items: flex-end;
  margin-top: auto;
}

.item-price {
  @include flex-start();
  align-items: baseline;
  gap: $spacing-xs;
  flex-wrap: wrap;
}

.price-symbol {
  font-size: $spacing-base;
  font-weight: $font-weight-medium;
  color: $error-color;
}

.price-value {
  font-size: 32rpx;
  font-weight: $font-weight-semibold;
  color: $error-color;
  line-height: 1;
}

.member-price {
  font-size: $spacing-base;
  color: $warning-color;
  padding: 4rpx $spacing-xs;
  background: rgba($warning-color, 0.1);
  border-radius: 4rpx;
}

// 数量选择器
.quantity-selector {
  @include flex-start();
  align-items: center;
  gap: $spacing-xs;
}

.quantity-btn {
  width: 44rpx;
  height: 44rpx;
  @include flex-center();
  background: $background-secondary;
  border-radius: $spacing-xs;
  transition: all $transition-base;

  &--disabled {
    opacity: 0.4;
  }

  &:active:not(&--disabled) {
    transform: scale(0.9);
  }
}

.quantity-input {
  width: 64rpx;
  height: 44rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  background: $background-secondary;
  border-radius: $spacing-xs;
}

// 删除按钮
.item-delete {
  margin-left: $spacing-sm;
  width: 52rpx;
  height: 52rpx;
  @include flex-center();
  background: rgba($error-color, 0.1);
  border-radius: 12rpx;

  &:active {
    transform: scale(0.9);
  }
}

// 失效标记
.invalid-badge {
  position: absolute;
  top: $spacing-base;
  right: $spacing-base;
  padding: $spacing-xs $spacing-sm;
  background: rgba($error-color, 0.1);
  border-radius: $spacing-xs;
}

.invalid-text {
  font-size: $spacing-base;
  color: $error-color;
}

// 推荐商品区域
.recommend-section {
  padding: $spacing-2xl $spacing-base;
}

.section-title {
  margin-bottom: $spacing-sm;
  padding-left: $spacing-xs;
}

.title-text {
  font-size: 32rpx;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.recommend-list {
  display: flex;
  gap: $spacing-sm;
  overflow-x: auto;
  padding-bottom: $spacing-sm;

  &::-webkit-scrollbar {
    display: none;
  }
}

.recommend-item {
  flex-shrink: 0;
  width: 240rpx;
  background: $background-primary;
  border-radius: $spacing-sm;
  padding: $spacing-sm;

  &:active {
    transform: scale(0.98);
  }
}

.recommend-image {
  width: 100%;
  height: 200rpx;
  border-radius: 12rpx;
  background: $background-secondary;
  margin-bottom: 12rpx;
}

.recommend-name {
  font-size: 26rpx;
  color: $text-primary;
  line-height: 1.4;
  @include ellipsis(2);
  margin-bottom: $spacing-xs;
}

.recommend-price {
  @include flex-start();
  align-items: baseline;
  gap: 4rpx;

  .price-symbol {
    font-size: 20rpx;
  }

  .price-value {
    font-size: 28rpx;
  }
}

// 空状态
.empty-cart {
  min-height: calc(100vh - 88rpx - env(safe-area-inset-top));
  @include flex-center();
  flex-direction: column;
  padding: 140rpx $spacing-sm $spacing-sm;
}

.empty-text {
  font-size: 32rpx;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin: $spacing-sm 0 $spacing-xs;
}

.empty-desc {
  font-size: 28rpx;
  color: $text-secondary;
  margin-bottom: 48rpx;
}

.go-shopping-btn {
  @include flex-center();
  width: 260rpx;
  height: 76rpx;
  background: $gradient-primary;
  color: #fff;
  font-size: 28rpx;
  font-weight: $font-weight-semibold;
  border-radius: 40rpx;
  border: none;

  &:active {
    transform: scale(0.98);
  }
}

// 空状态推荐商品
.recommend-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-base;
}

.recommend-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: $background-primary;
  border-radius: $border-radius-xl;
  padding: $spacing-base;

  &:active {
    transform: scale(0.98);
  }

  .card-image {
    width: 100%;
    height: 280rpx;
    border-radius: 12rpx;
    background: $background-secondary;
    margin-bottom: 12rpx;
  }

  .card-name {
    width: 290rpx;
    font-size: 26rpx;
    color: $text-primary;
    line-height: 1.4;
    @include ellipsis();
    margin-bottom: $spacing-xs;
    display: block;
  }

  .card-price {
    @include flex-start();
    align-items: baseline;
    gap: 4rpx;

    .price-symbol {
      font-size: 20rpx;
    }

    .price-value {
      font-size: 28rpx;
    }
  }
}

// 底部占位
.bottom-placeholder {
  height: 32rpx;
}

// 底部结算栏
.footer-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  padding-bottom: env(safe-area-inset-bottom);
  background: $background-primary;
  border-top: 1rpx solid $border-color;
  @include flex-between();
  align-items: center;
  padding-left: $spacing-base;
  padding-right: $spacing-base;
  z-index: 100;
}

.footer-left {
  @include flex-start();
  align-items: center;
}

.select-all {
  @include flex-start();
  align-items: center;
  gap: 12rpx;

  &:active {
    transform: scale(0.95);
  }
}

.select-all-text {
  font-size: 28rpx;
  color: $text-primary;
}

.footer-right {
  @include flex-start();
  align-items: center;
  gap: $spacing-base;
}

.price-info {
  @include flex-start();
  align-items: baseline;
  gap: 4rpx;
}

.total-label {
  font-size: 28rpx;
  color: $text-secondary;
}

.total-symbol {
  font-size: 24rpx;
  font-weight: $font-weight-medium;
  color: $error-color;
}

.total-value {
  font-size: 40rpx;
  font-weight: $font-weight-semibold;
  color: $error-color;
  line-height: 1;
}

.action-btn {
  @include flex-center();
  min-width: 200rpx;
  height: 76rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: $font-weight-semibold;
  border: none;
  transition: all $transition-base;

  &--checkout {
    background: $gradient-primary;
    color: #fff;
  }

  &--delete {
    background: linear-gradient(135deg, $error-color 0%, #dc2626 100%);
    color: #fff;
  }

  &[disabled] {
    opacity: 0.5;
  }

  &:active:not([disabled]) {
    transform: scale(0.98);
  }
}
</style>
