<template>
  <view class="balance-detail">
    <!-- 余额卡片 -->
    <view class="balance-card">
      <text class="balance-label">账户余额(元)</text>
      <text class="balance-value">¥{{ balance }}</text>
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
        <view class="record-amount" :class="`record-amount--${record.type}`">
          <text class="amount-text">
            {{ ['recharge', 'refund', 'reward'].includes(record.type) ? '+' : '-' }}¥{{ record.amount }}
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
import { ref, reactive, computed } from 'vue'
import Icon from '../common/Icon.vue'

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

    const records = ref([])
    const page = ref(1)
    const pageSize = 20
    const loading = ref(false)
    const noMore = ref(false)

    // 切换标签
    const changeTab = (tab) => {
      if (currentTab.value === tab) return
      currentTab.value = tab
      records.value = []
      page.value = 1
      noMore.value = false
      loadRecords()
    }

    // 加载记录
    const loadRecords = async () => {
      if (loading.value || noMore.value) return

      loading.value = true

      try {
        // 这里应该调用API
        // const res = await api.getBalanceRecords({ page: page.value, pageSize, type: currentTab.value })

        // 模拟数据
        setTimeout(() => {
          const mockData = []
          const types = currentTab.value === 'all'
            ? ['recharge', 'withdraw', 'consume', 'refund', 'reward']
            : currentTab.value === 'income'
            ? ['recharge', 'refund', 'reward']
            : ['withdraw', 'consume']

          for (let i = 0; i < pageSize; i++) {
            const type = types[Math.floor(Math.random() * types.length)]
            const descriptions = {
              recharge: '充值到账',
              withdraw: '提现',
              consume: ['订单消费', '购买商品', '酒店预订'][Math.floor(Math.random() * 3)],
              refund: '订单退款',
              reward: '系统奖励'
            }

            mockData.push({
              id: Date.now() + i,
              type,
              amount: (Math.random() * 500 + 1).toFixed(2),
              balance: (Math.random() * 5000 + 100).toFixed(2),
              description: descriptions[type],
              createTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleString('zh-CN'),
              orderNo: 'TR' + Date.now() + Math.floor(Math.random() * 1000)
            })
          }

          records.value.push(...mockData)

          if (page.value >= 3) {
            noMore.value = true
          }

          loading.value = false
        }, 500)
      } catch (error) {
        loading.value = false
        console.error('加载余额明细失败:', error)
      }
    }

    // 加载更多
    const loadMore = () => {
      if (!loading.value && !noMore.value) {
        page.value++
        loadRecords()
      }
    }

    // 初始加载
    loadRecords()

    return {
      currentTab,
      tabs,
      records,
      loading,
      noMore,
      changeTab,
      loadMore
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
  padding: $spacing-base;
  @include flex-center();
  flex-direction: column;
  gap: $spacing-xs;
  margin-bottom: $spacing-lg;

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

      &--recharge,
      &--refund,
      &--reward {
        .amount-text {
          color: $success-color;
        }
      }

      &--withdraw,
      &--consume {
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
