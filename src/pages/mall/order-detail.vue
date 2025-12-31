<template>
  <view class="order-detail-page">
    <!-- 导航栏 -->
    <view class="header-bar">
      <view class="header-left" @click="handleBack">
        <Icon name="arrow-left" size="medium" color="#333" />
      </view>
      <view class="header-center">
        <text class="header-title">订单详情</text>
      </view>
      <view class="header-right"></view>
    </view>

    <scroll-view class="content" scroll-y="true" :show-scrollbar="false">
      <!-- 订单状态卡片 - 子任务 8.2 -->
      <view
        class="status-card animate__animated animate__bounceIn"
        :style="{ background: statusConfig.bgGradient }"
      >
        <view class="status-icon-wrapper">
          <Icon
            :name="statusConfig.icon"
            size="xlarge"
            :color="statusConfig.color"
          />
        </view>
        <view class="status-content">
          <text class="status-text" :style="{ color: statusConfig.color }">
            {{ statusConfig.text }}
          </text>
          <text v-if="statusConfig.desc" class="status-desc">{{
            statusConfig.desc
          }}</text>
        </view>
      </view>

      <!-- 物流信息 - 子任务 8.3 -->
      <view
        v-if="
          order.logistics &&
          (order.status === 'shipped' || order.status === 'completed')
        "
        class="logistics-card animate__animated animate__fadeInUp"
        style="animation-delay: 100ms"
      >
        <view class="logistics-header">
          <view class="header-left">
            <view class="logistics-icon">
              <Icon name="truck" size="medium" color="#999" />
            </view>
            <view class="logistics-info">
              <text class="logistics-company">{{
                order.logistics.company
              }}</text>
              <view class="tracking-no" @click="handleCopyTrackingNo">
                <text class="tracking-text">{{
                  order.logistics.trackingNo
                }}</text>
                <Icon name="copy" size="small" color="#be32d7" />
              </view>
            </view>
          </view>
          <text class="logistics-status">{{ order.logistics.status }}</text>
        </view>

        <!-- 物流轨迹 -->
        <view
          v-if="order.logistics.timeline && order.logistics.timeline.length > 0"
          class="logistics-timeline"
        >
          <view
            v-for="(item, index) in order.logistics.timeline"
            :key="index"
            class="timeline-item"
            :class="{ 'timeline-item--first': index === 0 }"
          >
            <view class="timeline-dot"></view>
            <view class="timeline-content">
              <text class="timeline-desc">{{ item.desc }}</text>
              <text class="timeline-time">{{ item.time }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 收货地址 - 子任务 8.4 -->
      <view
        class="address-card animate__animated animate__fadeInUp"
        style="animation-delay: 200ms"
      >
        <view class="section-title">
          <Icon name="location" size="small" color="#333" />
          <text class="title-text">收货信息</text>
        </view>
        <view class="address-content">
          <view class="address-name-phone">
            <text class="receiver-name">{{ order.address?.name }}</text>
            <text class="receiver-phone">{{ order.address?.phone }}</text>
          </view>
          <text class="address-detail">{{ order.address?.fullAddress }}</text>
        </view>
      </view>

      <!-- 商品列表 - 子任务 8.4 -->
      <view
        class="goods-card animate__animated animate__fadeInUp"
        style="animation-delay: 300ms"
      >
        <view class="section-title">
          <Icon name="shopping-bag" size="small" color="#333" />
          <text class="title-text">商品清单</text>
        </view>
        <view class="goods-list">
          <view
            v-for="item in order.items"
            :key="item.id"
            class="goods-item"
            @click="handleGoToProduct(item.productId)"
          >
            <image :src="item.image" class="goods-image" mode="aspectFill" />
            <view class="goods-info">
              <text class="goods-name">{{ item.name }}</text>
              <text v-if="item.specs" class="goods-specs">{{
                item.specs
              }}</text>
              <view class="goods-footer">
                <view class="goods-price">
                  <text class="price-symbol">¥</text>
                  <text class="price-value">{{ item.price }}</text>
                </view>
                <text class="goods-quantity">x{{ item.quantity }}</text>
              </view>
            </view>
            <!-- 评价按钮 -->
            <view
              v-if="order.status === 'completed' && !item.isReviewed"
              class="review-btn"
              @click.stop="handleReviewProduct(item)"
            >
              评价
            </view>
          </view>
        </view>
      </view>

      <!-- 订单信息 - 子任务 8.4 -->
      <view
        class="order-info-card animate__animated animate__fadeInUp"
        style="animation-delay: 400ms"
      >
        <view class="section-title">
          <Icon name="file" size="small" color="#333" />
          <text class="title-text">订单信息</text>
        </view>
        <view class="order-info-list">
          <view class="info-row">
            <text class="label">• 订单编号</text>
            <view class="value-box" @click="handleCopyOrderNo">
              <text class="value">{{ order.orderNo }}</text>
              <Icon name="copy" size="small" color="#6366f1" />
            </view>
          </view>
          <view class="info-row">
            <text class="label">• 下单时间</text>
            <text class="value">{{ order.createTime }}</text>
          </view>
          <view v-if="order.payTime" class="info-row">
            <text class="label">• 支付时间</text>
            <text class="value">{{ order.payTime }}</text>
          </view>
          <view v-if="order.shipTime" class="info-row">
            <text class="label">• 发货时间</text>
            <text class="value">{{ order.shipTime }}</text>
          </view>
          <view v-if="order.completeTime" class="info-row">
            <text class="label">• 完成时间</text>
            <text class="value">{{ order.completeTime }}</text>
          </view>
          <view class="info-row">
            <text class="label">• 支付方式</text>
            <text class="value">{{ order.paymentMethodText }}</text>
          </view>
          <view v-if="order.remark" class="info-row">
            <text class="label">• 订单备注</text>
            <text class="value">{{ order.remark }}</text>
          </view>
        </view>
      </view>

      <!-- 价格明细 - 子任务 8.4 -->
      <PriceDetail
        :items="priceItems"
        :total="order.totalAmount"
        class="animate__animated animate__fadeInUp"
        style="animation-delay: 500ms"
      />

      <!-- 底部占位 -->
      <view class="bottom-placeholder"></view>
    </scroll-view>

    <!-- 底部操作栏 - 子任务 8.5 -->
    <view
      v-if="actionButtons.length > 0"
      class="footer-bar animate__animated animate__slideInUp"
    >
      <button
        v-for="btn in actionButtons"
        :key="btn.action"
        class="action-btn"
        :class="[`action-btn--${btn.type}`]"
        @click="handleAction(btn.action)"
      >
        {{ btn.text }}
      </button>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import Icon from "@/components/common/Icon.vue";
import PriceDetail from "@/components/hotel/PriceDetail.vue";
import request from "@/utils/request";

export default {
  name: "OrderDetailPage",
  components: {
    Icon,
    PriceDetail,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();

    // 订单数据
    const order = ref({
      id: null,
      orderNo: "",
      status: "pending",
      statusText: "",
      statusDesc: "",
      items: [],
      address: null,
      logistics: null,
      productAmount: 0,
      shippingFee: 0,
      discount: 0,
      couponAmount: 0,
      totalAmount: 0,
      paymentMethod: "",
      paymentMethodText: "",
      remark: "",
      createTime: "",
      payTime: null,
      shipTime: null,
      completeTime: null,
      cancelTime: null,
    });

    // 订单状态配置
    const statusConfig = computed(() => {
      const configs = {
        pending: {
          text: "待支付",
          desc: "请在30分钟内完成支付",
          icon: "clock",
          color: "#f59e0b",
          bgGradient: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
        },
        paid: {
          text: "待发货",
          desc: "商家正在准备发货",
          icon: "package",
          color: "#3b82f6",
          bgGradient: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
        },
        shipped: {
          text: "待收货",
          desc: "商品正在配送中，请注意查收",
          icon: "truck",
          color: "#6366f1",
          bgGradient: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
        },
        completed: {
          text: "已完成",
          desc: "交易已完成，感谢您的购买",
          icon: "success",
          color: "#10b981",
          bgGradient: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
        },
        cancelled: {
          text: "已取消",
          desc: "订单已取消",
          icon: "x-circle",
          color: "#6b7280",
          bgGradient: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
        },
        refunded: {
          text: "已退款",
          desc: "订单已退款",
          icon: "refresh",
          color: "#ef4444",
          bgGradient: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
        },
      };
      return configs[order.value.status] || configs.pending;
    });

    // 价格明细
    const priceItems = computed(() => {
      const items = [
        {
          label: "商品金额",
          value: order.value.productAmount?.toFixed(2) || "0.00",
        },
        { label: "运费", value: order.value.shippingFee?.toFixed(2) || "0.00" },
      ];

      if (order.value.couponAmount > 0) {
        items.push({
          label: "优惠券",
          value: `-${order.value.couponAmount.toFixed(2)}`,
          highlight: true,
        });
      }

      if (order.value.discount > 0) {
        items.push({
          label: "优惠",
          value: `-${order.value.discount.toFixed(2)}`,
          highlight: true,
        });
      }

      return items;
    });

    // 操作按钮
    const actionButtons = computed(() => {
      const buttons = [];

      switch (order.value.status) {
        case "pending":
          buttons.push(
            { text: "取消订单", action: "cancel", type: "secondary" },
            { text: "立即支付", action: "pay", type: "primary" }
          );
          break;
        case "paid":
          buttons.push(
            { text: "申请退款", action: "refund", type: "secondary" },
            { text: "查看物流", action: "logistics", type: "primary" }
          );
          break;
        case "shipped":
          buttons.push(
            { text: "查看物流", action: "logistics", type: "secondary" },
            { text: "确认收货", action: "confirm", type: "primary" }
          );
          break;
        case "completed":
          buttons.push({
            text: "再次购买",
            action: "rebuy",
            type: "secondary",
          });
          // 检查是否有未评价的商品
          const hasUnreviewed = order.value.items?.some(
            (item) => !item.isReviewed
          );
          if (hasUnreviewed) {
            buttons.push({
              text: "评价商品",
              action: "review",
              type: "primary",
            });
          }
          break;
      }

      return buttons;
    });

    // 获取订单详情
    const fetchOrderDetail = async () => {
      try {
        const orderId = route.query.id || route.params.id;
        if (!orderId) {
          uni.showToast({ title: "订单不存在", icon: "none" });
          return;
        }

        uni.showLoading({ title: "加载中..." });

        const res = await request({
          url: `/api/mall/orders/${orderId}`,
          method: "GET",
        });

        uni.hideLoading();

        if (res.code === 200) {
          order.value = res.data;
        } else {
          uni.showToast({ title: res.message || "加载失败", icon: "none" });
        }
      } catch (error) {
        uni.hideLoading();
        console.error("获取订单详情失败:", error);
        uni.showToast({ title: "加载失败", icon: "none" });
      }
    };

    // 返回
    const handleBack = () => {
      uni.navigateBack();
    };

    // 复制物流单号
    const handleCopyTrackingNo = () => {
      uni.setClipboardData({
        data: order.value.logistics.trackingNo,
        success: () => {
          uni.showToast({ title: "已复制物流单号", icon: "success" });
        },
      });
    };

    // 复制订单号
    const handleCopyOrderNo = () => {
      uni.setClipboardData({
        data: order.value.orderNo,
        success: () => {
          uni.showToast({ title: "已复制订单号", icon: "success" });
        },
      });
    };

    // 跳转商品详情
    const handleGoToProduct = (productId) => {
      uni.navigateTo({ url: `/pages/mall/product-detail?id=${productId}` });
    };

    // 评价商品
    const handleReviewProduct = (item) => {
      uni.navigateTo({
        url: `/pages/mall/review?orderId=${order.value.id}&productId=${item.productId}`,
      });
    };

    // 处理操作按钮点击
    const handleAction = async (action) => {
      switch (action) {
        case "cancel":
          await handleCancelOrder();
          break;
        case "pay":
          handlePayOrder();
          break;
        case "refund":
          await handleRefundOrder();
          break;
        case "logistics":
          handleViewLogistics();
          break;
        case "confirm":
          await handleConfirmReceipt();
          break;
        case "review":
          handleReviewOrder();
          break;
        case "rebuy":
          handleRebuy();
          break;
      }
    };

    // 取消订单
    const handleCancelOrder = async () => {
      uni.showModal({
        title: "提示",
        content: "确定要取消订单吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showLoading({ title: "处理中..." });

              const result = await request({
                url: `/api/mall/orders/${order.value.id}/cancel`,
                method: "POST",
                data: { reason: "用户取消" },
              });

              uni.hideLoading();

              if (result.code === 200) {
                uni.showToast({ title: "订单已取消", icon: "success" });
                fetchOrderDetail();
              } else {
                uni.showToast({
                  title: result.message || "取消失败",
                  icon: "none",
                });
              }
            } catch (error) {
              uni.hideLoading();
              console.error("取消订单失败:", error);
              uni.showToast({ title: "操作失败", icon: "none" });
            }
          }
        },
      });
    };

    // 支付订单
    const handlePayOrder = () => {
      // 跳转到支付页面或调起支付
      uni.showToast({ title: "跳转支付...", icon: "none" });
    };

    // 申请退款
    const handleRefundOrder = async () => {
      uni.showModal({
        title: "提示",
        content: "确定要申请退款吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showLoading({ title: "处理中..." });

              const result = await request({
                url: `/api/mall/orders/${order.value.id}/refund`,
                method: "POST",
                data: {
                  refundAmount: order.value.totalAmount,
                  reason: "不想要了",
                },
              });

              uni.hideLoading();

              if (result.code === 200) {
                uni.showToast({ title: "退款申请已提交", icon: "success" });
                fetchOrderDetail();
              } else {
                uni.showToast({
                  title: result.message || "申请失败",
                  icon: "none",
                });
              }
            } catch (error) {
              uni.hideLoading();
              console.error("申请退款失败:", error);
              uni.showToast({ title: "操作失败", icon: "none" });
            }
          }
        },
      });
    };

    // 查看物流
    const handleViewLogistics = () => {
      // 可以跳转到专门的物流详情页，或者在当前页面展开
      uni.showToast({ title: "查看物流信息", icon: "none" });
    };

    // 确认收货
    const handleConfirmReceipt = async () => {
      uni.showModal({
        title: "提示",
        content: "确认已收到商品吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showLoading({ title: "处理中..." });

              const result = await request({
                url: `/api/mall/orders/${order.value.id}/confirm`,
                method: "POST",
              });

              uni.hideLoading();

              if (result.code === 200) {
                uni.showToast({ title: "确认收货成功", icon: "success" });
                fetchOrderDetail();
              } else {
                uni.showToast({
                  title: result.message || "操作失败",
                  icon: "none",
                });
              }
            } catch (error) {
              uni.hideLoading();
              console.error("确认收货失败:", error);
              uni.showToast({ title: "操作失败", icon: "none" });
            }
          }
        },
      });
    };

    // 评价订单
    const handleReviewOrder = () => {
      // 跳转到评价页面
      const unreviewed = order.value.items.find((item) => !item.isReviewed);
      if (unreviewed) {
        uni.navigateTo({
          url: `/pages/mall/review?orderId=${order.value.id}&productId=${unreviewed.productId}`,
        });
      }
    };

    // 再次购买
    const handleRebuy = () => {
      // 将订单商品加入购物车
      uni.showToast({ title: "已加入购物车", icon: "success" });
    };

    onMounted(() => {
      fetchOrderDetail();
    });

    return {
      order,
      statusConfig,
      priceItems,
      actionButtons,
      handleBack,
      handleCopyTrackingNo,
      handleCopyOrderNo,
      handleGoToProduct,
      handleReviewProduct,
      handleAction,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";
@import "@/styles/mixins.scss";

.order-detail-page {
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
  padding-left: 24rpx;
  padding-right: 24rpx;
  z-index: 100;
  border-bottom: 1rpx solid $border-color;

  .header-left {
    width: 80rpx;
  }

  .header-center {
    flex: 1;
    text-align: center;
  }

  .header-title {
    font-size: 32rpx;
    font-weight: $font-weight-semibold;
    color: $text-primary;
  }

  .header-right {
    width: 80rpx;
  }
}

// 内容区域
.content {
  height: 100vh;
  padding: calc(110rpx + env(safe-area-inset-top)) 24rpx 100rpx;
}

// 订单状态卡片
.status-card {
  @include flex-start();
  align-items: center;
  gap: 24rpx;
  padding: 48rpx 32rpx;
  margin-bottom: 16rpx;
  border-radius: 16rpx;
}

.status-icon-wrapper {
  flex-shrink: 0;
}

.status-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.status-text {
  font-size: 36rpx;
  font-weight: $font-weight-semibold;
  line-height: 1.2;
}

.status-desc {
  font-size: 24rpx;
  color: rgba(0, 0, 0, 0.6);
  line-height: 1.4;
}

// 物流信息卡片
.logistics-card {
  background: $background-primary;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 16rpx;
}

.logistics-header {
  @include flex-between();
  align-items: flex-start;
  margin-bottom: 24rpx;

  .header-left {
    @include flex();
    align-items: center;
    gap: 16rpx;
    flex: 1;

    .logistics-icon {
      @include flex-center();
      width: 78rpx;
      height: 78rpx;
      background: $background-tertiary;
      border-radius: $border-radius-lg;
      border: 1rpx solid $border-color;
    }
  }
}

.logistics-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.logistics-company {
  font-size: 26rpx;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.tracking-no {
  @include flex-start();
  align-items: center;
  gap: 8rpx;

  &:active {
    opacity: 0.7;
  }
}

.tracking-text {
  font-size: 24rpx;
  color: $text-secondary;
}

.logistics-status {
  font-size: 24rpx;
  font-weight: $font-weight-medium;
  color: $primary-dark;
}

// 物流轨迹
.logistics-timeline {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.timeline-item {
  position: relative;
  @include flex-start();
  gap: 16rpx;
  padding-left: 32rpx;

  &::before {
    content: "";
    position: absolute;
    left: 11rpx;
    top: 24rpx;
    bottom: -24rpx;
    width: 2rpx;
    background: $border-color;
  }

  &:last-child::before {
    display: none;
  }

  &--first {
    .timeline-dot {
      background: $primary-color;
      border-color: $primary-dark;
    }

    .timeline-desc {
      color: $primary-dark;
      font-weight: $font-weight-semibold;
    }
  }
}

.timeline-dot {
  position: absolute;
  left: 0;
  top: 8rpx;
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background: $background-secondary;
  border: 4rpx solid $border-color;
  flex-shrink: 0;
}

.timeline-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.timeline-desc {
  font-size: 26rpx;
  color: $text-primary;
  line-height: 1.5;
}

.timeline-time {
  font-size: 24rpx;
  color: $text-tertiary;
}

// 收货地址卡片
.address-card {
  background: $background-primary;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 16rpx;
}

.section-title {
  @include flex-start();
  align-items: center;
  gap: 8rpx;
  margin-bottom: 24rpx;
}

.title-text {
  font-size: 26rpx;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.address-content {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.address-name-phone {
  @include flex();
  align-items: center;
  gap: 24rpx;
}

.receiver-name {
  font-size: 32rpx;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.receiver-phone {
  font-size: 26rpx;
  color: $text-secondary;
}

.address-detail {
  font-size: 26rpx;
  color: $text-secondary;
  line-height: 1.5;
}

// 商品列表卡片
.goods-card {
  background: $background-primary;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 16rpx;
}

.goods-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.goods-item {
  position: relative;
  @include flex-start();
  gap: 16rpx;

  &:active {
    opacity: 0.8;
  }
}

.goods-image {
  width: 140rpx;
  height: 140rpx;
  border-radius: 12rpx;
  background: $background-secondary;
  flex-shrink: 0;
}

.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 140rpx;
}

.goods-name {
  font-size: 26rpx;
  font-weight: $font-weight-medium;
  color: $text-primary;
  line-height: 1.4;
  @include ellipsis(2);
}

.goods-specs {
  font-size: 24rpx;
  color: $text-secondary;
  padding: 8rpx 12rpx;
  background: $background-secondary;
  border-radius: 8rpx;
  display: inline-block;
  align-self: flex-start;
  margin-top: 8rpx;
}

.goods-footer {
  @include flex-between();
  align-items: flex-end;
  margin-top: auto;
}

.goods-price {
  @include flex-start();
  align-items: baseline;
  gap: 4rpx;
}

.price-symbol {
  font-size: 24rpx;
  font-weight: $font-weight-medium;
  color: $error-color;
}

.price-value {
  font-size: 36rpx;
  font-weight: $font-weight-semibold;
  color: $error-color;
  line-height: 1;
}

.goods-quantity {
  font-size: 26rpx;
  color: $text-secondary;
}

.review-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 12rpx 24rpx;
  background: linear-gradient(135deg, $primary-color 0%, #4f46e5 100%);
  color: #fff;
  font-size: 24rpx;
  font-weight: $font-weight-medium;
  border-radius: 24rpx;

  &:active {
    transform: scale(0.95);
  }
}

// 订单信息卡片
.order-info-card {
  background: $background-primary;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 16rpx;
}

.order-info-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.info-row {
  @include flex-between();
  align-items: flex-start;
  gap: 32rpx;
}

.label {
  font-size: 26rpx;
  color: $text-secondary;
  flex-shrink: 0;
  width: 160rpx;
}

.value {
  flex: 1;
  font-size: 26rpx;
  color: $text-primary;
  text-align: right;
  word-break: break-all;
}

.value-box {
  flex: 1;
  @include flex-end();
  align-items: center;
  gap: 8rpx;

  &:active {
    opacity: 0.7;
  }
}

// 底部占位
.bottom-placeholder {
  height: 32rpx;
}

// 底部操作栏
.footer-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  padding-bottom: env(safe-area-inset-bottom);
  background: $background-primary;
  border-top: 1rpx solid $border-color;
  @include flex-end();
  align-items: center;
  padding-left: 24rpx;
  padding-right: 24rpx;
  gap: 16rpx;
  z-index: 100;
}

.action-btn {
  @include flex-center();
  min-width: 200rpx;
  height: 72rpx;
  padding: 0 32rpx;
  border-radius: 36rpx;
  font-size: 26rpx;
  font-weight: $font-weight-medium;
  border: none;
  margin: 0;
  transition: all $transition-base;

  &::after {
    border: none
  }

  &--secondary {
    background: $background-secondary;
    color: $text-primary;
    border: 1rpx solid $border-color;
  }

  &--primary {
    background: $gradient-primary;
    color: #fff;
  }

  &:active {
    transform: scale(0.98);
  }
}
</style>
