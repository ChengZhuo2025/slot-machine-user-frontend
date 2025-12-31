<template>
  <view class="points-detail">
    <view class="points-card">
      <text class="card-label">积分余额</text>
      <text class="card-value">{{ points }}</text>
    </view>

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

    <scroll-view class="record-list" scroll-y="true" @scrolltolower="loadMore">
      <view v-for="record in records" :key="record.id" class="record-item">
        <view class="record-info">
          <text class="record-title">{{ record.description }}</text>
          <text class="record-time">{{ record.createTime }}</text>
        </view>
        <view class="record-points" :class="`record-points--${record.type}`">
          <text class="points-text">{{ record.type === 'earn' ? '+' : '-' }}{{ record.points }}</text>
        </view>
      </view>

      <view v-if="loading" class="loading-more">
        <text class="loading-text">加载中...</text>
      </view>

      <view v-if="noMore" class="no-more">
        <text class="no-more-text">没有更多了</text>
      </view>

      <view v-if="!records.length && !loading" class="empty-state">
        <Icon name="points" size="xlarge" color="#ccc" />
        <text class="empty-text">暂无积分记录</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { ref } from 'vue'
import Icon from '../common/Icon.vue'

export default {
  name: 'PointsDetail',
  components: { Icon },
  props: {
    points: {
      type: [Number, String],
      default: 0
    }
  },
  setup() {
    const currentTab = ref('all')
    const tabs = [
      { label: '全部', value: 'all' },
      { label: '获得', value: 'earn' },
      { label: '消费', value: 'consume' }
    ]

    const records = ref([])
    const page = ref(1)
    const loading = ref(false)
    const noMore = ref(false)

    const changeTab = (tab) => {
      currentTab.value = tab
      records.value = []
      page.value = 1
      noMore.value = false
      loadRecords()
    }

    const loadRecords = () => {
      if (loading.value || noMore.value) return
      loading.value = true

      setTimeout(() => {
        const mockData = []
        const types = currentTab.value === 'all' ? ['earn', 'consume'] : [currentTab.value]
        const descriptions = {
          earn: ['签到奖励', '消费获得', '邀请好友', '完成任务', '订单评价'],
          consume: ['积分兑换', '商品兑换']
        }

        for (let i = 0; i < 20; i++) {
          const type = types[Math.floor(Math.random() * types.length)]
          mockData.push({
            id: Date.now() + i,
            type,
            points: Math.floor(Math.random() * 500) + 10,
            description: descriptions[type][Math.floor(Math.random() * descriptions[type].length)],
            createTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleString('zh-CN')
          })
        }

        records.value.push(...mockData)
        if (page.value >= 3) noMore.value = true
        loading.value = false
      }, 500)
    }

    const loadMore = () => {
      if (!loading.value && !noMore.value) {
        page.value++
        loadRecords()
      }
    }

    loadRecords()

    return { currentTab, tabs, records, loading, noMore, changeTab, loadMore }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.points-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.points-card {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 20rpx;
  padding: $spacing-base;
  @include flex-center();
  flex-direction: column;
  gap: $spacing-xs;
  margin-bottom: $spacing-lg;

  .card-label {
    font-size: $font-size-sm;
    color: rgba(255, 255, 255, 0.9);
  }

  .card-value {
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

  .record-item {
    background: $background-primary;
    border-radius: 20rpx;
    padding: $spacing-base $spacing-lg;
    margin-bottom: $spacing-base;
    @include flex-between();
    gap: $spacing-base;

    .record-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: $spacing-xs;

      .record-title {
        font-size: $font-size-sm;
        font-weight: $font-weight-semibold;
        color: $text-primary;
      }

      .record-time {
        font-size: $font-size-xs;
        color: $text-tertiary;
      }
    }

    .record-points {
      .points-text {
        font-size: $font-size-base;
        font-weight: $font-weight-semibold;
      }

      &--earn .points-text { color: $success-color; }
      &--consume .points-text { color: $error-color; }
    }
  }

  .loading-more,
  .no-more,
  .empty-state {
    @include flex-center();
    padding: $spacing-lg;

    .loading-text,
    .no-more-text,
    .empty-text {
      font-size: $font-size-sm;
      color: $text-tertiary;
    }
  }

  .empty-state {
    flex-direction: column;
    gap: $spacing-lg;
    padding-top: $spacing-xl * 2;
  }
}
</style>
