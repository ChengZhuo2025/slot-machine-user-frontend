<template>
  <view class="feedback">
    <!-- 反馈表单 -->
    <view class="feedback-form">
      <!-- 反馈类型 -->
      <view class="form-section">
        <text class="section-label">反馈类型</text>
        <view class="type-tags">
          <view
            v-for="type in feedbackTypes"
            :key="type.value"
            class="type-tag"
            :class="{ 'type-tag--active': formData.type === type.value }"
            @click="formData.type = type.value"
          >
            <Icon :name="type.icon" size="small" :color="formData.type === type.value ? '#fff' : '#be32d7'" />
            <text class="tag-text">{{ type.label }}</text>
          </view>
        </view>
      </view>

      <!-- 反馈内容 -->
      <view class="form-section">
        <text class="section-label">反馈内容</text>
        <textarea
          v-model="formData.content"
          class="feedback-textarea"
          placeholder="请详细描述您遇到的问题或建议, 我们会认真对待每一条反馈"
          maxlength="500"
          :show-count="true"
        />
      </view>

      <!-- 上传图片 -->
      <view class="form-section">
        <text class="section-label">图片(选填)</text>
        <view class="image-upload">
          <view
            v-for="(image, index) in formData.images"
            :key="index"
            class="image-item"
          >
            <image :src="image" class="upload-image" mode="aspectFill" />
            <view class="image-delete" @click="removeImage(index)">
              <Icon name="close" size="small" color="#fff" />
            </view>
          </view>
          <view
            v-if="formData.images.length < 3"
            class="image-upload-btn"
            @click="handleImageUpload"
          >
            <Icon name="add" size="large" color="#999" />
            <text class="upload-text">{{ formData.images.length }}/3</text>
          </view>
        </view>
      </view>

      <!-- 联系方式 -->
      <view class="form-section">
        <text class="section-label">联系方式(选填)</text>
        <input
          v-model="formData.contact"
          class="feedback-input"
          placeholder="手机号或邮箱, 便于我们联系您"
        />
      </view>

      <!-- 提交按钮 -->
      <button class="btn-submit" @click="handleSubmit">
        <text>提交反馈</text>
      </button>
    </view>

    <!-- 历史反馈 -->
    <view class="feedback-history">
      <view class="history-header">
        <text class="history-title">我的反馈</text>
        <text class="history-count">{{ feedbackList.length }}条</text>
      </view>

      <view v-if="feedbackList.length" class="history-list">
        <view
          v-for="item in feedbackList"
          :key="item.id"
          class="history-item"
          @click="handleViewDetail(item)"
        >
          <view class="item-header">
            <view class="item-type">
              <Icon :name="getTypeIcon(item.type)" size="small" :color="getTypeColor(item.type)" />
              <text class="type-name">{{ getTypeName(item.type) }}</text>
            </view>
            <view class="item-status" :style="{ color: getStatusColor(item.status) }">
              <text>{{ getStatusName(item.status) }}</text>
            </view>
          </view>
          <text class="item-content">{{ item.content }}</text>
          <view class="item-footer">
            <text class="item-time">{{ item.createTime }}</text>
            <Icon name="chevronRight" size="small" color="#999" />
          </view>
        </view>
      </view>

      <view v-else class="empty-state">
        <Icon name="inbox" size="xlarge" color="#ccc" />
        <text class="empty-text">暂无反馈记录</text>
      </view>
    </view>
  </view>
</template>

<script>
import { reactive, ref } from 'vue'
import Icon from '../common/Icon.vue'

export default {
  name: 'Feedback',
  components: { Icon },
  setup() {
    const feedbackTypes = [
      { label: '功能异常', value: 'bug', icon: 'bug' },
      { label: '产品建议', value: 'suggestion', icon: 'lightbulb' },
      { label: '投诉', value: 'complaint', icon: 'warning' },
      { label: '其他', value: 'other', icon: 'others' }
    ]

    const formData = reactive({
      type: 'suggestion',
      content: '',
      images: [],
      contact: ''
    })

    const feedbackList = ref([
      {
        id: 1,
        type: 'bug',
        content: '酒店预订页面加载很慢,经常超时',
        status: 'replied',
        createTime: '2024-12-20 14:30',
        reply: '感谢您的反馈, 我们已经优化了加载速度'
      },
      {
        id: 2,
        type: 'suggestion',
        content: '希望能增加夜间模式, 晚上使用更舒适',
        status: 'processing',
        createTime: '2024-12-15 10:20'
      }
    ])

    const handleImageUpload = () => {
      uni.chooseImage({
        count: 3 - formData.images.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          formData.images.push(...res.tempFilePaths)
        }
      })
    }

    const removeImage = (index) => {
      formData.images.splice(index, 1)
    }

    const handleSubmit = () => {
      if (!formData.content.trim()) {
        uni.showToast({ title: '请输入反馈内容', icon: 'none' })
        return
      }

      uni.showLoading({ title: '提交中...' })
      setTimeout(() => {
        uni.hideLoading()
        uni.showToast({ title: '提交成功,感谢您的反馈', icon: 'success' })

        // 重置表单
        Object.assign(formData, {
          type: 'suggestion',
          content: '',
          images: [],
          contact: ''
        })

        // 添加到历史记录
        feedbackList.value.unshift({
          id: Date.now(),
          type: formData.type,
          content: formData.content,
          status: 'pending',
          createTime: new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }).replace(/\//g, '-')
        })
      }, 1000)
    }

    const handleViewDetail = (item) => {
      const content = item.reply
        ? `${item.content}\n\n客服回复:\n${item.reply}`
        : item.content

      uni.showModal({
        title: getTypeName(item.type),
        content,
        showCancel: false
      })
    }

    const getTypeIcon = (type) => {
      return feedbackTypes.find(t => t.value === type)?.icon || 'moreHorizontal'
    }

    const getTypeName = (type) => {
      return feedbackTypes.find(t => t.value === type)?.label || '其他'
    }

    const getTypeColor = (type) => {
      const colors = {
        bug: '#EF4444',
        suggestion: '#be32d7',
        complaint: '#F59E0B',
        other: '#999'
      }
      return colors[type] || '#999'
    }

    const getStatusName = (status) => {
      const names = {
        pending: '待处理',
        processing: '处理中',
        replied: '已回复',
        closed: '已关闭'
      }
      return names[status] || '未知'
    }

    const getStatusColor = (status) => {
      const colors = {
        pending: '#999',
        processing: '#3B82F6',
        replied: '#10c467',
        closed: '#666'
      }
      return colors[status] || '#999'
    }

    return {
      feedbackTypes,
      formData,
      feedbackList,
      handleImageUpload,
      removeImage,
      handleSubmit,
      handleViewDetail,
      getTypeIcon,
      getTypeName,
      getTypeColor,
      getStatusName,
      getStatusColor
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.feedback {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.feedback-form {
  background: $background-primary;
  border-radius: 20rpx;
  padding: $spacing-base;
  margin-bottom: $spacing-base;

  .form-section {
    margin-bottom: $spacing-base;

    &:last-child {
      margin-bottom: 0;
    }

    .section-label {
      display: block;
      font-size: $font-size-sm;
      color: $text-primary;
      font-weight: $font-weight-semibold;
      margin-bottom: $spacing-sm;
    }

    .type-tags {
      @include flex();
      flex-wrap: wrap;
      gap: $spacing-sm;

      .type-tag {
        @include flex();
        align-items: center;
        gap: 6rpx;
        padding: $spacing-sm $spacing-sm $spacing-sm 16rpx;
        background: rgba($primary-dark, 0.1);
        border-radius: 12rpx;
        transition: all $transition-base;

        &--active {
          background: $primary-dark;

          .tag-text {
            color: #fff !important;
            font-weight: $font-weight-semibold;
          }
        }

        .tag-text {
          font-size: $font-size-xs;
          color: $primary-dark;
        }
      }
    }

    .feedback-textarea {
      width: 100%;
      height: 200rpx;
      padding: $spacing-sm;
      background: $background-secondary;
      border-radius: $border-radius-base;
      font-size: $font-size-sm;
      color: $text-primary;
      line-height: 1.5;
    }

    .feedback-input {
      width: 100%;
      height: 80rpx;
      padding: $spacing-sm;
      background: $background-secondary;
      border-radius: $border-radius-base;
      font-size: $font-size-sm;
      color: $text-primary;
    }

    .image-upload {
      @include flex();
      flex-wrap: wrap;
      gap: $spacing-sm;

      .image-item {
        position: relative;
        width: 160rpx;
        height: 160rpx;
        border-radius: $border-radius-base;
        overflow: hidden;

        .upload-image {
          width: 100%;
          height: 100%;
        }

        .image-delete {
          position: absolute;
          top: 8rpx;
          right: 8rpx;
          width: 40rpx;
          height: 40rpx;
          background: rgba(0, 0, 0, 0.6);
          border-radius: 50%;
          @include flex-center();
        }
      }

      .image-upload-btn {
        width: 160rpx;
        height: 160rpx;
        background: $background-secondary;
        border-radius: $border-radius-base;
        border: 2rpx dashed $border-color;
        @include flex-center();
        flex-direction: column;
        gap: 8rpx;

        &:active {
          opacity: 0.6;
        }

        .upload-text {
          font-size: $font-size-xs;
          color: $text-tertiary;
        }
      }
    }
  }

  .btn-submit {
    width: 100%;
    height: 80rpx;
    background: $gradient-primary;
    border-radius: 20rpx;
    @include flex-center();
    font-size: $font-size-sm;
    color: #fff;
    font-weight: $font-weight-semibold;
    border: none;
    margin-top: $spacing-base;

    &:active {
      opacity: 0.8;
    }

    &::after {
      border: none;
    }
  }
}

.feedback-history {
  .history-header {
    @include flex-between();
    align-items: center;
    margin-bottom: $spacing-sm;

    .history-title {
      font-size: $font-size-base;
      font-weight: $font-weight-semibold;
      color: $text-primary;
    }

    .history-count {
      font-size: $font-size-xs;
      color: $text-tertiary;
    }
  }

  .history-list {
    .history-item {
      background: $background-primary;
      border-radius: 20rpx;
      padding: $spacing-base;
      margin-bottom: $spacing-sm;
      transition: transform $transition-base;

      &:active {
        transform: scale(0.98);
      }

      .item-header {
        @include flex-between();
        align-items: center;
        margin-bottom: $spacing-xs;

        .item-type {
          @include flex();
          align-items: center;
          gap: 6rpx;

          .type-name {
            font-size: $font-size-xs;
            color: $text-secondary;
          }
        }

        .item-status {
          font-size: $font-size-xs;
        }
      }

      .item-content {
        font-size: $font-size-sm;
        color: $text-primary;
        line-height: 1.5;
        margin-bottom: $spacing-xs;
        @include line-clamp(2);
      }

      .item-footer {
        @include flex-between();
        align-items: center;

        .item-time {
          font-size: $font-size-xs;
          color: $text-tertiary;
        }
      }
    }
  }

  .empty-state {
    @include flex-center();
    flex-direction: column;
    gap: $spacing-base;
    padding: $spacing-xl * 2 0;

    .empty-text {
      font-size: $font-size-sm;
      color: $text-tertiary;
    }
  }
}
</style>
