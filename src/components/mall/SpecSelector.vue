<template>
  <view v-if="show" class="spec-selector-overlay" @click="handleClose">
    <view class="spec-selector animate__animated animate__slideInUp" @click.stop>
      <!-- 商品信息 -->
      <view class="product-info">
        <image v-if="currentImage" :src="currentImage" class="product-image" mode="aspectFill" />
        <view class="product-detail">
          <view class="product-price">
            <text class="price-symbol">¥</text>
            <text class="price-value">{{ currentPrice }}</text>
            <text v-if="product.originalPrice" class="original-price">¥{{ product.originalPrice }}</text>
          </view>
          <view class="product-stock">库存：{{ currentStock }}件</view>
          <view v-if="selectedSpecText" class="selected-spec">已选：{{ selectedSpecText }}</view>
        </view>
        <view class="close-btn" @click="handleClose">
          <Icon name="close" size="medium" color="#999" />
        </view>
      </view>

      <!-- 规格选择 -->
      <scroll-view class="spec-content" scroll-y>
        <view v-for="spec in product.specs" :key="spec.name" class="spec-group">
          <view class="spec-title">{{ spec.name }}</view>
          <view class="spec-options">
            <view
              v-for="option in spec.options"
              :key="option.value"
              class="spec-option"
              :class="{
                'spec-option--active': isOptionSelected(spec.name, option.value),
                'spec-option--disabled': isOptionDisabled(option)
              }"
              @click="handleSelectSpec(spec.name, option)"
            >
              <image
                v-if="option.image"
                :src="option.image"
                class="option-image"
                mode="aspectFill"
              />
              <text class="option-text">{{ option.name }}</text>
              <view v-if="isOptionSelected(spec.name, option.value)" class="option-check">
                <Icon name="check" size="small" color="#fff" />
              </view>
            </view>
          </view>
        </view>

        <!-- 数量选择 -->
        <view class="quantity-group">
          <view class="spec-title">数量</view>
          <view class="quantity-selector">
            <view
              class="quantity-btn"
              :class="{ 'quantity-btn--disabled': quantity <= 1 }"
              @click="handleDecrement"
            >
              <Icon name="minus" size="medium" color="#666" />
            </view>
            <input
              v-model.number="quantity"
              class="quantity-input"
              type="number"
              :disabled="true"
            />
            <view
              class="quantity-btn"
              :class="{ 'quantity-btn--disabled': quantity >= currentStock }"
              @click="handleIncrement"
            >
              <Icon name="add" size="medium" color="#666" />
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 底部按钮 -->
      <view class="spec-footer">
        <button
          v-if="mode === 'cart' || mode === 'both'"
          class="action-btn action-btn--cart"
          :disabled="!canConfirm"
          @click="handleAddToCart"
        >
          加入购物车
        </button>
        <button
          v-if="mode === 'buy' || mode === 'both'"
          class="action-btn action-btn--buy"
          :disabled="!canConfirm"
          @click="handleBuyNow"
        >
          立即购买
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, watch } from 'vue'
import Icon from '../common/Icon.vue'

export default {
  name: 'SpecSelector',
  components: {
    Icon
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    product: {
      type: Object,
      required: true
    },
    mode: {
      type: String,
      default: 'both', // 'cart' | 'buy' | 'both'
      validator: (value) => ['cart', 'buy', 'both'].includes(value)
    }
  },
  emits: ['close', 'confirm', 'add-to-cart', 'buy-now'],
  setup(props, { emit }) {
    // 选中的规格
    const selectedSpecs = ref({})
    // 数量
    const quantity = ref(1)

    // 当前选中的图片
    const currentImage = computed(() => {
      // 优先显示选中颜色的图片
      if (props.product.specs && props.product.specs.length > 0) {
        const colorSpec = props.product.specs.find(s => s.name === '颜色')
        if (colorSpec && selectedSpecs.value['颜色']) {
          const selectedOption = colorSpec.options.find(
            o => o.value === selectedSpecs.value['颜色']
          )
          if (selectedOption && selectedOption.image) {
            return selectedOption.image
          }
        }
      }
      // 否则显示商品主图
      return props.product.images?.[0] || props.product.image || ''
    })

    // 当前价格
    const currentPrice = computed(() => {
      let price = props.product.price || 0
      
      // 计算规格加价
      if (props.product.specs) {
        props.product.specs.forEach(spec => {
          const selectedValue = selectedSpecs.value[spec.name]
          if (selectedValue) {
            const option = spec.options.find(o => o.value === selectedValue)
            if (option && option.price) {
              price += option.price
            }
          }
        })
      }
      
      return price.toFixed(2)
    })

    // 当前库存
    const currentStock = computed(() => {
      // 如果所有规格都选中，返回对应SKU的库存
      if (isAllSpecsSelected.value) {
        let stock = props.product.stock || 0
        
        // 计算选中规格的库存（取最小值）
        if (props.product.specs) {
          props.product.specs.forEach(spec => {
            const selectedValue = selectedSpecs.value[spec.name]
            if (selectedValue) {
              const option = spec.options.find(o => o.value === selectedValue)
              if (option && option.stock !== undefined) {
                stock = Math.min(stock, option.stock)
              }
            }
          })
        }
        
        return stock
      }
      
      // 否则返回总库存
      return props.product.stock || 0
    })

    // 已选规格文本
    const selectedSpecText = computed(() => {
      const texts = []
      if (props.product.specs) {
        props.product.specs.forEach(spec => {
          const selectedValue = selectedSpecs.value[spec.name]
          if (selectedValue) {
            const option = spec.options.find(o => o.value === selectedValue)
            if (option) {
              texts.push(option.name)
            }
          }
        })
      }
      return texts.join(' ')
    })

    // 是否所有规格都已选中
    const isAllSpecsSelected = computed(() => {
      if (!props.product.specs || props.product.specs.length === 0) {
        return true
      }
      return props.product.specs.every(spec => selectedSpecs.value[spec.name])
    })

    // 是否可以确认
    const canConfirm = computed(() => {
      return isAllSpecsSelected.value && currentStock.value > 0 && quantity.value > 0
    })

    // 判断规格选项是否被选中
    const isOptionSelected = (specName, optionValue) => {
      return selectedSpecs.value[specName] === optionValue
    }

    // 判断规格选项是否禁用
    const isOptionDisabled = (option) => {
      return option.stock === 0
    }

    // 选择规格
    const handleSelectSpec = (specName, option) => {
      if (isOptionDisabled(option)) {
        return
      }
      
      if (selectedSpecs.value[specName] === option.value) {
        // 取消选中
        delete selectedSpecs.value[specName]
      } else {
        // 选中
        selectedSpecs.value[specName] = option.value
      }
      
      // 触发响应式更新
      selectedSpecs.value = { ...selectedSpecs.value }
    }

    // 减少数量
    const handleDecrement = () => {
      if (quantity.value > 1) {
        quantity.value--
      }
    }

    // 增加数量
    const handleIncrement = () => {
      if (quantity.value < currentStock.value) {
        quantity.value++
      }
    }

    // 关闭选择器
    const handleClose = () => {
      emit('close')
    }

    // 加入购物车
    const handleAddToCart = () => {
      if (!canConfirm.value) {
        return
      }
      
      const result = {
        productId: props.product.id,
        specs: { ...selectedSpecs.value },
        specsText: selectedSpecText.value,
        quantity: quantity.value,
        price: parseFloat(currentPrice.value),
        image: currentImage.value
      }
      
      emit('add-to-cart', result)
      emit('confirm', result)
    }

    // 立即购买
    const handleBuyNow = () => {
      if (!canConfirm.value) {
        return
      }
      
      const result = {
        productId: props.product.id,
        specs: { ...selectedSpecs.value },
        specsText: selectedSpecText.value,
        quantity: quantity.value,
        price: parseFloat(currentPrice.value),
        image: currentImage.value
      }
      
      emit('buy-now', result)
      emit('confirm', result)
    }

    // 监听显示状态，重置数据
    watch(() => props.show, (newVal) => {
      if (newVal) {
        selectedSpecs.value = {}
        quantity.value = 1
      }
    })

    return {
      selectedSpecs,
      quantity,
      currentImage,
      currentPrice,
      currentStock,
      selectedSpecText,
      isAllSpecsSelected,
      canConfirm,
      isOptionSelected,
      isOptionDisabled,
      handleSelectSpec,
      handleDecrement,
      handleIncrement,
      handleClose,
      handleAddToCart,
      handleBuyNow
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.spec-selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
}

.spec-selector {
  width: 100%;
  max-height: 80vh;
  background: $background-primary;
  border-radius: 32rpx 32rpx 0 0;
  display: flex;
  flex-direction: column;
  animation-duration: 0.3s;
}

.product-info {
  @include flex-start();
  padding: 32rpx;
  border-bottom: 1rpx solid $border-color;
  position: relative;
}

.product-image {
  width: 150rpx;
  height: 150rpx;
  border-radius: 16rpx;
  background: $background-secondary;
  flex-shrink: 0;
}

.product-detail {
  flex: 1;
  margin-left: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.product-price {
  @include flex-start();
  align-items: baseline;
  gap: 8rpx;
}

.price-symbol {
  font-size: 28rpx;
  font-weight: $font-weight-medium;
  color: $error-color;
}

.price-value {
  font-size: 48rpx;
  font-weight: $font-weight-semibold;
  color: $error-color;
  line-height: 1;
}

.original-price {
  font-size: 24rpx;
  color: $text-tertiary;
  text-decoration: line-through;
}

.product-stock {
  font-size: 24rpx;
  color: $text-secondary;
}

.selected-spec {
  font-size: 24rpx;
  color: $text-secondary;
  @include ellipsis(2);
}

.close-btn {
  position: absolute;
  top: 28rpx;
  right: 28rpx;
  width: 56rpx;
  height: 56rpx;
  @include flex-center();
  background: $background-secondary;
  border-radius: 50%;
  
  &:active {
    transform: scale(0.9);
  }
}

.spec-content {
  flex: 1;
  overflow-y: auto;
  padding: 32rpx;
}

.spec-group {
  margin-bottom: 40rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.spec-title {
  font-size: 28rpx;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin-bottom: 20rpx;
}

.spec-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.spec-option {
  position: relative;
  min-width: 120rpx;
  padding: 16rpx 24rpx;
  background: $background-secondary;
  border-radius: 12rpx;
  border: 2rpx solid transparent;
  @include flex-center();
  flex-direction: column;
  gap: 8rpx;
  transition: all $transition-base;
  
  &--active {
    border-color: $primary-color;
    background: rgba($primary-color, 0.1);
    
    .option-text {
      color: $primary-color;
      font-weight: $font-weight-semibold;
    }
  }
  
  &--disabled {
    opacity: 0.4;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 10%;
      right: 10%;
      height: 2rpx;
      background: $text-tertiary;
      transform: translateY(-50%) rotate(-15deg);
    }
  }
  
  &:active:not(&--disabled) {
    transform: scale(0.95);
  }
}

.option-image {
  width: 80rpx;
  height: 80rpx;
  border-radius: 8rpx;
}

.option-text {
  font-size: 26rpx;
  color: $text-primary;
  white-space: nowrap;
}

.option-check {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32rpx;
  height: 32rpx;
  background: $primary-color;
  border-radius: 12rpx 0 12rpx 0;
  @include flex-center();
}

.quantity-group {
  margin-top: 40rpx;
}

.quantity-selector {
  @include flex-start();
  align-items: center;
  gap: $spacing-sm;
}

.quantity-btn {
  width: 56rpx;
  height: 56rpx;
  @include flex-center();
  background: $background-secondary;
  border-radius: 12rpx;
  transition: all $transition-base;
  
  &--disabled {
    opacity: 0.4;
  }
  
  &:active:not(&--disabled) {
    transform: scale(0.9);
  }
}

.quantity-input {
  width: 120rpx;
  height: 56rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  background: $background-secondary;
  border-radius: 12rpx;
}

.spec-footer {
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid $border-color;
  @include flex-start();
  gap: 16rpx;
  margin-bottom: 130rpx;
}

.action-btn {
  flex: 1;
  @include flex-center();
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 32rpx;
  font-weight: $font-weight-semibold;
  border: none;
  transition: all $transition-base;
  
  &--cart {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    color: #fff;
  }
  
  &--buy {
    background: $gradient-primary;
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
