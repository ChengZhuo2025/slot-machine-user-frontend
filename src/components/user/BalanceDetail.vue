<template>
  <view class="balance-detail">
    <!-- T601: 余额卡片 - 显示余额、冻结余额、累计充值、累计消费 -->
    <view class="balance-card">
      <view class="balance-main">
        <text class="balance-label">账户余额(元)</text>
        <text class="balance-value">¥{{ walletInfo.balance }}</text>
      </view>
      <view class="balance-stats">
        <view class="stat-item">
          <text class="stat-label">冻结余额</text>
          <text class="stat-value">¥{{ walletInfo.frozenBalance }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">累计充值</text>
          <text class="stat-value">¥{{ walletInfo.totalRecharged }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">累计消费</text>
          <text class="stat-value">¥{{ walletInfo.totalConsumed }}</text>
        </view>
      </view>
    </view>

    <!-- 筛选标签 -->
    <view class="filter-tabs">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        class="tab-item"
        :class="{ 'tab-item--active': currentTab === tab.value }"
        @click="changeTab(tab.value)"
      >
        <text class="tab-text">{{ tab.label }}</text>
      </view>
    </view>

    <!-- 明细列表 -->
    <scroll-view
      class="record-list"
      scroll-y="true"
      :lower-threshold="100"
      @scrolltolower="loadMore"
    >
      <view
        v-for="record in records"
        :key="record.id"
        class="record-item"
      >
        <view class="record-info">
          <text class="record-title">{{ record.description }}</text>
          <text class="record-time">{{ record.createTime }}</text>
        </view>
        <view class="record-amount" :class="record.isIncome ? 'record-amount--income' : 'record-amount--expense'">
          <text class="amount-text">
            {{ record.isIncome ? '+' : '-' }}¥{{ record.amount }}
          </text>
        </view>
      </view>

      <view v-if="loading" class="loading-more">
        <text class="loading-text">加载中...</text>
      </view>

      <view v-if="noMore" class="no-more">
        <text class="no-more-text">没有更多了</text>
      </view>

      <view v-if="!records.length && !loading" class="empty-state">
        <Icon name="list" size="xlarge" color="#ccc" />
        <text class="empty-text">暂无明细记录</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import Icon from '../common/Icon.vue'
import * as userApi from '@/services/user'
// CHK011: 导入交易类型枚举
import { getTypeName, isIncomeType } from '@/constants/transaction'
// CHK025: 导入时间格式化工具
import { formatTimestamp } from '@/utils/timeFormat'

export default {
  name: 'BalanceDetail',
  components: {
    Icon
  },
  props: {
    balance: {
      type: [Number, String],
      default: 0
    }
  },
  setup() {
    const currentTab = ref('all')
    const tabs = [
      { label: '全部', value: 'all' },
      { label: '收入', value: 'income' },
      { label: '支出', value: 'expense' }
    ]

    // T600-T602: 钱包信息状态
    const walletInfo = reactive({
      balance: '0.00',
      frozenBalance: '0.00',
      totalRecharged: '0.00',
      totalConsumed: '0.00'
    })
    const walletLoading = ref(true)

    const records = ref([])
    const page = ref(1)
    const pageSize = 20
    const loading = ref(false)
    const noMore = ref(false)
    const total = ref(0)

    // T602: 格式化货币值，保留2位小数
    const formatCurrency = (value) => {
      const num = parseFloat(value) || 0
      return num.toFixed(2)
    }

    // T600: 获取钱包信息
    const fetchWallet = async () => {
      walletLoading.value = true
      try {
        const data = await userApi.getWallet()
        walletInfo.balance = formatCurrency(data.balance)
        walletInfo.frozenBalance = formatCurrency(data.frozen_balance)
        walletInfo.totalRecharged = formatCurrency(data.total_recharged)
        walletInfo.totalConsumed = formatCurrency(data.total_consumed)
      } catch (error) {
        console.error('获取钱包信息失败:', error)
      } finally {
        walletLoading.value = false
      }
    }

    // 切换标签
    const changeTab = (tab) => {
      if (currentTab.value === tab) return
      currentTab.value = tab
      records.value = []
      page.value = 1
      noMore.value = false
      total.value = 0
      loadRecords()
    }

    // T610-T615: 加载交易记录
    const loadRecords = async () => {
      if (loading.value || noMore.value) return

      loading.value = true

      try {
        // 构建查询参数
        const params = {
          page: page.value,
          page_size: pageSize
        }

        // T613: 类型筛选
        if (currentTab.value === 'income') {
          params.type = 'income'
        } else if (currentTab.value === 'expense') {
          params.type = 'expense'
        }

        // T610: 调用 API 获取交易记录
        const data = await userApi.getTransactions(params)

        // T611: 处理交易列表数据
        // CHK011: 使用交易类型枚举
        const newRecords = (data.list || []).map(item => ({
          id: item.id,
          type: item.type,
          amount: formatCurrency(item.amount),
          description: item.type_name || item.description || getTypeName(item.type),
          createTime: formatTime(item.created_at),
          isIncome: isIncomeType(item.type)
        }))

        records.value.push(...newRecords)
        total.value = data.total || 0

        // T615: 判断是否还有更多数据
        if (records.value.length >= total.value || newRecords.length < pageSize) {
          noMore.value = true
        }
      } catch (error) {
        console.error('加载交易记录失败:', error)
        // T614: 错误时也标记为无更多，避免无限重试
        if (page.value === 1) {
          noMore.value = true
        }
      } finally {
        loading.value = false
      }
    }

    // 获取交易类型描述
    const getTypeDescription = (type) => {
      const typeMap = {
        recharge: '充值到账',
        withdraw: '提现',
        consume: '订单消费',
        refund: '订单退款',
        reward: '系统奖励'
      }
      return typeMap[type] || '其他'
    }

    // CHK025: 格式化时间（使用统一的时间格式化工具）
    const formatTime = (timestamp) => {
      return formatTimestamp(timestamp, 'full')
    }

    // T612: 加载更多
    const loadMore = () => {
      if (!loading.value && !noMore.value) {
        page.value++
        loadRecords()
      }
    }

    // 初始加载
    onMounted(() => {
      fetchWallet()
      loadRecords()
    })

    return {
      currentTab,
      tabs,
      walletInfo,
      walletLoading,
      records,
      loading,
      noMore,
      changeTab,
      loadMore,
      formatCurrency
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.balance-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.balance-card {
  background: $gradient-primary;
  border-radius: 20rpx;
  padding: $spacing-lg;
  margin-bottom: $spacing-lg;

  .balance-main {
    @include flex-center();
    flex-direction: column;
    gap: $spacing-xs;
    margin-bottom: $spacing-base;
    padding-bottom: $spacing-base;
    border-bottom: 1rpx solid rgba(255, 255, 255, 0.2);
  }

  .balance-label {
    font-size: $font-size-sm;
    color: rgba(255, 255, 255, 0.9);
  }

  .balance-value {
    font-size: 56rpx;
    font-weight: $font-weight-semibold;
    color: #fff;
    line-height: 1;
  }

  .balance-stats {
    display: flex;
    justify-content: space-around;

    .stat-item {
      @include flex-center();
      flex-direction: column;
      gap: 8rpx;

      .stat-label {
        font-size: $font-size-xs;
        color: rgba(255, 255, 255, 0.7);
      }

      .stat-value {
        font-size: $font-size-sm;
        font-weight: $font-weight-medium;
        color: #fff;
      }
    }
  }
}

.filter-tabs {
  @include flex-start();
  border-bottom: 2rpx solid #ddd;
  margin-bottom: $spacing-base;
  margin-top: -$spacing-sm;

  .tab-item {
    flex: 1;
    @include flex-center();
    height: 88rpx;
    position: relative;
    transition: all $transition-base;

    .tab-text {
      font-size: 28rpx;
      color: $text-secondary;
      transition: all $transition-base;
    }

    &--active {
      .tab-text {
        font-size: 30rpx;
        font-weight: $font-weight-semibold;
        color: $primary-color;
      }

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60rpx;
        height: 6rpx;
        background: linear-gradient(90deg, $primary-color 0%, #8b5cf6 100%);
        border-radius: 3rpx;
      }
    }
  }
}

.record-list {
  flex: 1;
  overflow-y: auto;

  .record-item {
    background: $background-primary;
    border-radius: 20rpx;
    padding: $spacing-base $spacing-lg;;
    margin-bottom: $spacing-base;
    @include flex-between();
    align-items: center;
    gap: $spacing-base;

    .record-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: $spacing-xs;
      min-width: 0;

      .record-title {
        font-size: $font-size-sm;
        font-weight: $font-weight-semibold;
        color: $text-primary;
        @include ellipsis();
      }

      .record-time {
        font-size: $font-size-xs;
        color: $text-tertiary;
      }
    }

    .record-amount {
      flex-shrink: 0;

      .amount-text {
        font-size: $font-size-base;
        font-weight: $font-weight-semibold;
      }

      // CHK011: 金额颜色样式
      &--income {
        .amount-text {
          color: $success-color;
        }
      }

      &--expense {
        .amount-text {
          color: $error-color;
        }
      }
    }
  }

  .loading-more,
  .no-more {
    @include flex-center();
    padding: $spacing-lg;

    .loading-text,
    .no-more-text {
      font-size: $font-size-sm;
      color: $text-tertiary;
    }
  }

  .empty-state {
    @include flex-center();
    flex-direction: column;
    gap: $spacing-lg;
    padding: $spacing-xl * 2 0;

    .empty-text {
      font-size: $font-size-base;
      color: $text-tertiary;
    }
  }
}
</style>
