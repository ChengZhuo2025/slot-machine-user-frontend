<template>
  <view class="help-center">
    <!-- 搜索框 -->
    <view class="search-box">
      <view class="search-input">
        <Icon name="search" size="medium" color="#999" />
        <input v-model="searchKeyword" placeholder="搜索帮助内容" @confirm="handleSearch" />
      </view>
    </view>

    <!-- 热门问题（手风琴） -->
    <view v-if="!currentCategory" class="hot-questions">
      <view class="section-header">
        <Icon name="heating" size="small" color="#EF4444" />
        <text class="section-title">热门问题</text>
      </view>
      <view class="question-list">
        <view
          v-for="question in hotQuestions"
          :key="question.id"
          class="question-item"
          @click="toggleHot(question.id)"
        >
          <view class="question-title"> 
            <Icon name="help" size="small" color="#8B5CF6" />
            <view class="question-main">
              <text class="question-text">{{ question.title }}</text>
              <view class="chevron" :class="{ open: openHotId === question.id }">
                <Icon name="chevron-down" size="small" color="#999" />
              </view>
            </view>
          </view>
          <!-- 展开内容紧贴当前卡片内部（动画） -->
          <view class="accordion" :class="{ open: openHotId === question.id }">
            <view class="accordion-content">
              <text class="content-text">{{ question.content || '帮助内容详情' }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 分类列表（图标风格对齐 tool-item） -->
    <view v-if="!currentCategory" class="category-list">
      <view class="section-header">
        <Icon name="grid" size="small" color="#8B5CF6" />
        <text class="section-title">问题分类</text>
      </view>
      <view class="categories">
        <view
          v-for="category in categories"
          :key="category.id"
          class="category-item"
          @click="handleCategoryClick(category)"
        >
          <view
            class="category-icon"
            :style="{ background: getIconBg(category.color) }"
          >
            <Icon :name="category.icon" size="medium" :color="category.color" />
          </view>
          <text class="category-name">{{ category.name }}</text>
          <text class="category-count">{{ category.count }}条</text>
        </view>
      </view>
    </view>

    <!-- 文章列表（手风琴） -->
    <view v-if="currentCategory" class="article-list">
      <view class="list-header">
        <view class="back-btn" @click="backToCategory">
          <Icon name="chevron-left" size="small" color="#666" />
          <text class="back-text">返回</text>
        </view>
        <text class="category-title">{{ currentCategory.name }}</text>
      </view>

      <view class="articles">
        <view
          v-for="article in currentArticles"
          :key="article.id"
          class="article-item"
          @click="toggleArticle(article.id)"
        >
          <view class="article-title"> 
            <view class="article-content">
              <text class="article-title">{{ article.title }}</text>
              <view class="article-meta">
                <view class="meta-item">
                  <Icon name="eye" size="xsmall" color="#999" />
                  <text class="meta-text">{{ article.views }}</text>
                </view>
                <view class="meta-item">
                  <Icon name="thumbs-up" size="xsmall" color="#999" />
                  <text class="meta-text">{{ article.helpful }}</text>
                </view>
              </view>
            </view>
            <view class="chevron" :class="{ open: openArticleId === article.id }">
              <Icon name="chevron-down" size="small" color="#999" />
            </view>
          </view>

          <!-- 展开内容紧贴当前卡片内部（动画） -->
          <view class="accordion" :class="{ open: openArticleId === article.id }">
            <view class="accordion-content">
              <text class="content-text">{{ article.content || '帮助内容详情' }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 联系客服 -->
    <view class="contact-service">
      <view class="service-card">
        <view class="service-info">
          <text class="service-title">没有找到答案?</text>
          <text class="service-desc">联系在线客服获取帮助</text>
        </view>
        <button class="btn-contact" @click="showFeedbackModal = true">
          <text>提交反馈</text>
        </button>
        <button class="btn-contact" @click="showCustomerServiceModal = true">
          <text>联系客服</text>
        </button>
      </view>
    </view>

    <!-- 弹窗：反馈、客服 -->
    <Modal v-model="showFeedbackModal" title="意见反馈" size="full">
      <Feedback />
    </Modal>
    <Modal v-model="showCustomerServiceModal" title="联系客服" size="full">
      <CustomerService />
    </Modal>
  </view>
</template>

<script>
import { ref, computed } from 'vue'
import Icon from '../common/Icon.vue'
import Modal from '../common/Modal.vue'
import CustomerService from './CustomerService.vue'
import Feedback from './Feedback.vue'

export default {
  name: 'HelpCenter',
  components: { Icon, Modal, CustomerService, Feedback },
  setup() {
    const searchKeyword = ref('')
    const currentCategory = ref(null)

    const categories = ref([
      { id: 1, name: '新手指南', icon: 'book', color: '#8B5CF6', count: 12 },
      { id: 2, name: '账户问题', icon: 'user', color: '#3B82F6', count: 8 },
      { id: 3, name: '订单相关', icon: 'shopping-bag', color: '#10c467', count: 15 },
      { id: 4, name: '支付问题', icon: 'wallet', color: '#F59E0B', count: 10 },
      { id: 5, name: '会员权益', icon: 'crown', color: '#EF4444', count: 6 },
      { id: 6, name: '其他问题', icon: 'others', color: '#999999', count: 9 }
    ])

    const hotQuestions = ref([
      { id: 1, title: '如何预订酒店房间?', views: 1256, helpful: 892, content: '在首页选择目的地和日期，筛选心仪酒店后点击预订，按照引导完成下单。' },
      { id: 2, title: '如何取消订单?', views: 980, helpful: 745, content: '进入“我的订单”，选择需取消的订单，点击取消并按提示操作。' },
      { id: 3, title: '会员等级如何升级?', views: 856, helpful: 623, content: '完成消费或参与活动获取积分，积分达到阈值后自动升级会员等级。' },
      { id: 4, title: '如何使用优惠券?', views: 742, helpful: 558, content: '在下单结算页选择可用优惠券，系统会自动抵扣对应金额。' },
      { id: 5, title: '订单退款多久到账?', views: 689, helpful: 487, content: '通常 3-7 个工作日原路退回，具体视支付渠道处理进度。' }
    ])

    const articles = ref([
      { id: 1, categoryId: 1, title: '新用户如何快速上手?', content: '详细的新用户使用指南...', views: 2345, helpful: 1567 },
      { id: 2, categoryId: 1, title: '如何完成实名认证?', content: '实名认证步骤说明...', views: 1876, helpful: 1234 },
      { id: 3, categoryId: 2, title: '忘记密码怎么办?', content: '密码找回流程...', views: 1456, helpful: 987 },
      { id: 4, categoryId: 3, title: '如何查看订单详情?', content: '订单查看方法...', views: 2156, helpful: 1678 }
    ])

    const currentArticles = computed(() => {
      if (!currentCategory.value) return []
      return articles.value.filter(a => a.categoryId === currentCategory.value.id)
    })

    // 手风琴状态（单开互斥）
    const openHotId = ref(null)
    const openArticleId = ref(null)

    const showCustomerServiceModal = ref(false)
    const showFeedbackModal = ref(false)

    const handleSearch = () => {
      if (!searchKeyword.value.trim()) {
        uni.showToast({ title: '请输入搜索关键词', icon: 'none' })
        return
      }
      uni.showToast({ title: '搜索功能开发中', icon: 'none' })
    }

    const handleCategoryClick = (category) => {
      currentCategory.value = category
      openArticleId.value = null
    }

    const backToCategory = () => {
      currentCategory.value = null
      openArticleId.value = null
    }

    const toggleHot = (id) => {
      openHotId.value = openHotId.value === id ? null : id
    }

    const toggleArticle = (id) => {
      openArticleId.value = openArticleId.value === id ? null : id
    }

    // 颜色背景转 rgba，用于与 tool-item 图标背景风格一致（浅色块）
    const getIconBg = (hex) => {
      // 兼容 #RRGGBB 或 #RGB
      const normalize = (h) => {
        if (!h) return 'rgba(0,0,0,0.06)'
        let c = h.replace('#', '')
        if (c.length === 3) {
          c = c.split('').map(ch => ch + ch).join('')
        }
        const r = parseInt(c.slice(0, 2), 16)
        const g = parseInt(c.slice(2, 4), 16)
        const b = parseInt(c.slice(4, 6), 16)
        return `rgba(${r}, ${g}, ${b}, 0.10)`
      }
      return normalize(hex)
    }

    return {
      // state
      searchKeyword,
      currentCategory,
      categories,
      hotQuestions,
      articles,
      currentArticles,
      openHotId,
      openArticleId,
      showCustomerServiceModal,
      showFeedbackModal,
      // methods
      handleSearch,
      handleCategoryClick,
      backToCategory,
      toggleHot,
      toggleArticle,
      getIconBg
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.help-center {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.search-box {
  margin-bottom: $spacing-base;

  .search-input {
    @include flex();
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-sm $spacing-base;
    background: $background-primary;
    border-radius: $border-radius-full;

    input {
      flex: 1;
      font-size: $font-size-sm;
      color: $text-primary;
    }
  }
}

.section-header {
  @include flex();
  align-items: center;
  gap: $spacing-xs;
  margin-bottom: $spacing-sm;

  .section-title {
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    color: $text-primary;
  }
}

/* 手风琴通用内容块 */
.accordion-content {
  padding: $spacing-base $spacing-xs 0;
  margin-top: $spacing-base;
  border-top: 1rpx solid #ddd;

  .content-text {
    font-size: $font-size-sm;
    color: $text-secondary;
    line-height: 1.6;
  }
}

/* 热门问题 */
.hot-questions {
  margin-bottom: $spacing-base;

  .question-list {
    .question-item {
      @include flex();
      flex-direction: column;
      padding:20rpx $spacing-base;
      background: $background-primary;
      border-radius: 20rpx;
      margin-bottom: $spacing-sm;
      transition: transform $transition-base;

      .question-title {
        @include flex();
        align-items: center;
        gap: $spacing-xs;
        transition: transform $transition-base;

        &:active {
          transform: scale(0.98);
        }

        .question-main {
          flex: 1;
          @include flex();
          align-items: center;
          gap: $spacing-xs;

          .question-text {
            flex: 1;
            font-size: $font-size-sm;
            color: $text-primary;
            @include ellipsis();
          }

          .chevron {
            transition: transform $transition-base;
            &.open {
              transform: rotate(180deg);
            }
          }
        }
      }
    }
  }
}

/* 分类列表（图标统一为 tool-item 风格） */
.category-list {
  margin-bottom: $spacing-base;

  .categories {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-sm;

    .category-item {
      background: $background-primary;
      border-radius: 20rpx;
      padding: $spacing-base;
      @include flex-center();
      flex-direction: column;
      gap: $spacing-xs;
      transition: transform $transition-base;

      &:active {
        transform: scale(0.95);
      }

      /* 对齐 pages/user/index.vue 中 .tool-icon 风格 */
      .category-icon {
        width: 88rpx;
        height: 88rpx;
        border-radius: $border-radius-full;
        @include flex-center();
      }

      .category-name {
        font-size: $font-size-sm;
        color: $text-primary;
        font-weight: $font-weight-medium;
      }

      .category-count {
        font-size: $font-size-xs;
        color: $text-tertiary;
      }
    }
  }
}

/* 文章列表（手风琴） */
.article-list {
  flex: 1;
  display: flex;
  flex-direction: column;

  .list-header {
    @include flex();
    align-items: center;
    gap: $spacing-base;
    margin-bottom: $spacing-base;

    .back-btn {
      @include flex();
      align-items: center;

      &:active {
        opacity: 0.6;
      }

      .back-text {
        font-size: $font-size-xs;
        color: $text-secondary;
      }
    }

    .category-title {
      font-size: $font-size-base;
      font-weight: $font-weight-semibold;
      color: $text-primary;
    }
  }

  .articles {
    .article-item {
      @include flex();
      flex-direction: column;
      padding: $spacing-base;
      background: $background-primary;
      border-radius: 20rpx;
      margin-bottom: $spacing-sm;

      .article-title {
        @include flex-between();
        align-items: center;
        gap: $spacing-base;

        .article-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: $spacing-xs;
          min-width: 0;

          .article-title {
            font-size: $font-size-sm;
            color: $text-primary;
            font-weight: $font-weight-medium;
            @include ellipsis();
          }

          .article-meta {
            @include flex();
            gap: $spacing-lg;

            .meta-item {
              @include flex();
              align-items: center;
              gap: 4rpx;

              .meta-text {
                font-size: $font-size-xs;
                color: $text-tertiary;
              }
            }
          }
        }
      }
    }
  }
}

.contact-service {
  margin-top: auto;
  padding: $spacing-xs 0 $spacing-base;

  .service-card {
    background: $background-primary;
    border-radius: 20rpx;
    padding: $spacing-base;
    @include flex();
    align-items: center;
    gap: $spacing-sm;

    .service-info {
      flex: 1;
      display: flex;
      flex-direction: column;

      .service-title {
        font-size: $font-size-sm;
        color: $text-primary;
        font-weight: $font-weight-semibold;
      }

      .service-desc {
        font-size: $font-size-xs;
        color: rgba($text-primary, 0.5);
      }
    }

    .btn-contact {
      padding: $spacing-xs $spacing-base;
      background: $gradient-primary;
      border-radius: 16rpx;
      font-size: $font-size-xs;
      color: $background-primary;
      font-weight: $font-weight-semibold;
      line-height: 1.6;
      border: none;

      &:active {
        opacity: 0.8;
      }

      &::after {
        border: none;
      }
    }
  }
}
/* 手风琴容器动画 */
.accordion {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: max-height 0.25s ease, opacity 0.25s ease;
}

.accordion.open {
  max-height: 600rpx; /* 估算最大高度，如内容更长可再调 */
  opacity: 1;
}

</style>