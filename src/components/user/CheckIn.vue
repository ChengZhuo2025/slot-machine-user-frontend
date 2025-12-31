<template>
  <view class="check-in">
    <!-- 签到统计 -->
    <view class="check-stats">
      <view class="stat-card">
        <text class="stat-value">{{ checkInData.continuousDays }}</text>
        <text class="stat-label">连续签到(天)</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ checkInData.totalDays }}</text>
        <text class="stat-label">本月累计(天)</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ checkInData.totalPoints }}</text>
        <text class="stat-label">累计积分</text>
      </view>
    </view>

    <!-- 日历 -->
    <view class="check-calendar">
      <view class="calendar-header">
        <view class="header-btn" @click="prevMonth">
          <Icon name="chevron-left" size="medium" color="#666" />
        </view>
        <text class="calendar-title">{{ currentYear }}年{{ currentMonth }}月</text>
        <view class="header-btn" @click="nextMonth">
          <Icon name="chevron-right" size="medium" color="#666" />
        </view>
      </view>

      <view class="calendar-weekdays">
        <text
          v-for="day in weekdays"
          :key="day"
          class="weekday-item"
        >{{ day }}</text>
      </view>

      <view class="calendar-days">
        <view
          v-for="(day, index) in calendarDays"
          :key="index"
          class="day-item"
          :class="{
            'day-item--empty': !day,
            'day-item--checked': day && isChecked(day),
            'day-item--today': day && isToday(day)
          }"
        >
          <text v-if="day" class="day-number">{{ day }}</text>
        </view>
      </view>
    </view>

    <!-- 签到按钮 -->
    <view class="check-action">
      <button
        class="btn-checkin"
        :class="{ 'btn-checkin--disabled': todayChecked }"
        :disabled="todayChecked"
        @click="handleCheckIn"
      >
        {{ todayChecked ? '今日已签到' : '立即签到' }}
      </button>
      <text class="checkin-tip">{{ todayChecked ? '已获得今日积分奖励' : '签到可获得10-50积分奖励' }}</text>
    </view>

    <!-- 签到规则 -->
    <view class="check-rules">
      <view class="rules-header">
        <Icon name="gift" size="medium" color="#8B5CF6" />
        <text class="rules-title">签到规则</text>
      </view>
      <view class="rules-list">
        <view class="rule-item">
          <Icon name="check" size="small" color="#10c467" />
          <text class="rule-text">每日签到可获得10-50积分奖励</text>
        </view>
        <view class="rule-item">
          <Icon name="check" size="small" color="#10c467" />
          <text class="rule-text">连续签到7天额外奖励100积分</text>
        </view>
        <view class="rule-item">
          <Icon name="check" size="small" color="#10c467" />
          <text class="rule-text">连续签到30天额外奖励500积分</text>
        </view>
        <view class="rule-item">
          <Icon name="check" size="small" color="#10c467" />
          <text class="rule-text">会员用户积分奖励翻倍</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import Icon from '../common/Icon.vue'

export default {
  name: 'CheckIn',
  components: {
    Icon
  },
  emits: ['checkin'],
  setup(props, { emit }) {
    // 当前年月
    const currentYear = ref(new Date().getFullYear())
    const currentMonth = ref(new Date().getMonth() + 1)

    // 签到数据
    const checkInData = reactive({
      checkedDays: [],
      continuousDays: 0,
      totalDays: 0,
      totalPoints: 0
    })

    // 星期
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']

    // 今天是否已签到
    const todayChecked = computed(() => {
      const today = new Date().getDate()
      return checkInData.checkedDays.includes(today)
    })

    // 日历天数
    const calendarDays = computed(() => {
      const year = currentYear.value
      const month = currentMonth.value

      // 当月第一天是星期几
      const firstDay = new Date(year, month - 1, 1).getDay()

      // 当月有多少天
      const daysInMonth = new Date(year, month, 0).getDate()

      // 生成日历数组
      const days = []

      // 填充第一周的空白
      for (let i = 0; i < firstDay; i++) {
        days.push(null)
      }

      // 填充当月天数
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(i)
      }

      return days
    })

    // 是否已签到
    const isChecked = (day) => {
      return checkInData.checkedDays.includes(day)
    }

    // 是否今天
    const isToday = (day) => {
      const today = new Date()
      return currentYear.value === today.getFullYear() &&
             currentMonth.value === today.getMonth() + 1 &&
             day === today.getDate()
    }

    // 上个月
    const prevMonth = () => {
      if (currentMonth.value === 1) {
        currentYear.value--
        currentMonth.value = 12
      } else {
        currentMonth.value--
      }
      loadCheckInRecords()
    }

    // 下个月
    const nextMonth = () => {
      const today = new Date()
      // 不能查看未来月份
      if (currentYear.value === today.getFullYear() && currentMonth.value === today.getMonth() + 1) {
        uni.showToast({
          title: '不能查看未来日期',
          icon: 'none'
        })
        return
      }

      if (currentMonth.value === 12) {
        currentYear.value++
        currentMonth.value = 1
      } else {
        currentMonth.value++
      }
      loadCheckInRecords()
    }

    // 加载签到记录
    const loadCheckInRecords = async () => {
      try {
        uni.showLoading({ title: '加载中...' })

        // 这里应该调用API
        // const res = await api.getCheckInRecords({ year: currentYear.value, month: currentMonth.value })

        // 模拟数据
        setTimeout(() => {
          const mockData = {
            year: currentYear.value,
            month: currentMonth.value,
            checkedDays: [],
            continuousDays: Math.floor(Math.random() * 15) + 1,
            totalDays: 0,
            totalPoints: 0
          }

          // 随机生成已签到天数
          const daysInMonth = new Date(currentYear.value, currentMonth.value, 0).getDate()
          for (let i = 1; i <= daysInMonth; i++) {
            if (Math.random() > 0.6) {
              mockData.checkedDays.push(i)
            }
          }

          mockData.totalDays = mockData.checkedDays.length
          mockData.totalPoints = mockData.totalDays * 10

          Object.assign(checkInData, mockData)
          uni.hideLoading()
        }, 500)
      } catch (error) {
        uni.hideLoading()
        console.error('加载签到记录失败:', error)
      }
    }

    // 签到
    const handleCheckIn = async () => {
      try {
        uni.showLoading({ title: '签到中...' })

        // 这里应该调用API
        // const res = await api.checkIn()

        // 模拟签到
        setTimeout(() => {
          const today = new Date().getDate()
          checkInData.checkedDays.push(today)
          checkInData.continuousDays++
          checkInData.totalDays++

          const points = Math.floor(Math.random() * 41) + 10
          checkInData.totalPoints += points

          uni.hideLoading()
          uni.showToast({
            title: `签到成功,获得${points}积分`,
            icon: 'success'
          })

          emit('checkin', { points, continuousDays: checkInData.continuousDays })
        }, 800)
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: '签到失败,请稍后再试',
          icon: 'none'
        })
      }
    }

    onMounted(() => {
      loadCheckInRecords()
    })

    return {
      currentYear,
      currentMonth,
      checkInData,
      weekdays,
      todayChecked,
      calendarDays,
      isChecked,
      isToday,
      prevMonth,
      nextMonth,
      handleCheckIn
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.check-in {
  padding-bottom: $spacing-xl;
}

.check-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-sm;
  margin-bottom: $spacing-base;

  .stat-card {
    background: $background-primary;
    border-radius: 20rpx;
    padding: $spacing-base;
    @include flex-center();
    flex-direction: column;
    gap: $spacing-xs;

    .stat-value {
      font-size: 48rpx;
      font-weight: $font-weight-semibold;
      color: $primary-dark;
      line-height: 1;
    }

    .stat-label {
      font-size: $font-size-xs;
      color: $text-secondary;
    }
  }
}

.check-calendar {
  background: $background-primary;
  border-radius: 20rpx;
  padding: $spacing-base;
  margin-bottom: $spacing-base;

  .calendar-header {
    @include flex-between();
    align-items: center;
    margin-bottom: $spacing-lg;

    .header-btn {
      width: 60rpx;
      height: 60rpx;
      @include flex-center();
      border-radius: $border-radius-full;
      transition: background-color $transition-base;

      &:active {
        background: $background-secondary;
      }
    }

    .calendar-title {
      font-size: $font-size-base;
      font-weight: $font-weight-semibold;
      color: $text-primary;
    }
  }

  .calendar-weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: $spacing-base;
    margin-bottom: $spacing-base;

    .weekday-item {
      text-align: center;
      font-size: $font-size-sm;
      color: $text-secondary;
      font-weight: $font-weight-medium;
    }
  }

  .calendar-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: $spacing-xs;

    .day-item {
      aspect-ratio: 1;
      @include flex-center();
      position: relative;
      border-radius: $border-radius-base;
      transition: all $transition-base;

      &--empty {
        visibility: hidden;
      }

      &--checked {
        background: rgba($primary-dark, 0.1);
        border-radius: $border-radius-full;

        .day-number {
          color: $primary-dark !important;
        }
      }

      &--today {
        border: 4rpx solid $primary-dark;
        border-radius: $border-radius-full;
      }

      .day-number {
        font-size: $font-size-base;
        color: $text-primary;
        font-weight: $font-weight-medium;
      }

      .check-icon {
        position: absolute;
        bottom: 4rpx;
        right: 4rpx;
      }
    }
  }
}

.check-action {
  @include flex-center();
  flex-direction: column;
  gap: $spacing-sm;
  margin-bottom: $spacing-base;

  .btn-checkin {
    width: 100%;
    height: 80rpx;
    background: $gradient-primary;
    border-radius: 20rpx;
    @include flex-center();
    font-size: $font-size-sm;
    color: #fff;
    font-weight: $font-weight-semibold;
    border: none;
    transition: opacity $transition-base;

    &:active:not(.btn-checkin--disabled) {
      opacity: 0.8;
    }

    &--disabled {
      background: $background-tertiary;
      color: $text-tertiary;
    }

    &::after {
      border: none;
    }
  }

  .checkin-tip {
    font-size: $font-size-xs;
    color: $text-secondary;
  }
}

.check-rules {
  background: linear-gradient(135deg, #f6f7fb 0%, #fff 100%);
  border-radius: 20rpx;
  padding: $spacing-base;

  .rules-header {
    @include flex();
    align-items: center;
    gap: $spacing-xs;
    margin-bottom: $spacing-sm;

    .rules-title {
      font-size: $font-size-sm;
      font-weight: $font-weight-semibold;
      color: $text-primary;
    }
  }

  .rules-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;

    .rule-item {
      @include flex();
      align-items: flex-start;
      gap: $spacing-xs;

      .rule-text {
        flex: 1;
        font-size: $font-size-xs;
        color: $text-secondary;
        line-height: 1.6;
      }
    }
  }
}
</style>
