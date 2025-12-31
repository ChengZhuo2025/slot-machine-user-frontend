import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore(
  'cart',
  () => {
    // 状态
    const items = ref([]) // 购物车商品列表
    const selectedIds = ref([]) // 选中的商品ID列表
    
    // 计算属性
    const totalCount = computed(() => {
      return items.value.reduce((total, item) => total + item.quantity, 0)
    })
    
    const totalPrice = computed(() => {
      return items.value.reduce((total, item) => {
        return total + (item.price * item.quantity)
      }, 0)
    })
    
    const isEmpty = computed(() => items.value.length === 0)
    
    // 选中的商品列表
    const selectedItems = computed(() => {
      return items.value.filter(item => selectedIds.value.includes(item.itemId))
    })
    
    // 选中商品数量
    const selectedCount = computed(() => {
      return selectedItems.value.reduce((total, item) => total + item.quantity, 0)
    })
    
    // 选中商品总价
    const selectedPrice = computed(() => {
      return selectedItems.value.reduce((total, item) => {
        return total + (item.price * item.quantity)
      }, 0)
    })
    
    // 是否全选
    const isAllSelected = computed(() => {
      return items.value.length > 0 && selectedIds.value.length === items.value.length
    })
    
    // 添加商品到购物车
    const addToCart = (product) => {
      // 生成唯一ID（商品ID + 规格组合）
      const itemId = product.itemId || `${product.id}_${JSON.stringify(product.specs || {})}`
      const existingItem = items.value.find(item => item.itemId === itemId)
      
      if (existingItem) {
        // 如果商品已存在，增加数量
        existingItem.quantity += product.quantity || 1
      } else {
        // 添加新商品
        items.value.push({
          itemId,
          id: product.id,
          name: product.name,
          price: product.price,
          memberPrice: product.memberPrice,
          image: product.image,
          quantity: product.quantity || 1,
          specs: product.specs || {},
          stock: product.stock,
          ...product
        })
        // 默认选中新添加的商品
        selectedIds.value.push(itemId)
      }
    }
    
    // 兼容旧方法名
    const addItem = addToCart
    
    // 更新商品数量
    const updateQuantity = (itemId, quantity) => {
      const item = items.value.find(item => item.itemId === itemId)
      if (item) {
        if (quantity <= 0) {
          removeFromCart(itemId)
        } else {
          item.quantity = Math.min(quantity, item.stock || 999)
        }
      }
    }
    
    // 移除商品
    const removeFromCart = (itemId) => {
      const index = items.value.findIndex(item => item.itemId === itemId)
      if (index > -1) {
        items.value.splice(index, 1)
        // 同时从选中列表中移除
        const selectedIndex = selectedIds.value.indexOf(itemId)
        if (selectedIndex > -1) {
          selectedIds.value.splice(selectedIndex, 1)
        }
      }
    }
    
    // 兼容旧方法名
    const removeItem = removeFromCart
    
    // 清空购物车
    const clearCart = () => {
      items.value = []
      selectedIds.value = []
    }
    
    // 切换单个商品的选中状态
    const toggleSelect = (itemId) => {
      const index = selectedIds.value.indexOf(itemId)
      if (index > -1) {
        // 已选中，取消选中
        selectedIds.value.splice(index, 1)
      } else {
        // 未选中，添加到选中列表
        selectedIds.value.push(itemId)
      }
    }
    
    // 全选/取消全选
    const selectAll = (selected = true) => {
      if (selected) {
        // 全选：将所有商品ID添加到选中列表
        selectedIds.value = items.value.map(item => item.itemId)
      } else {
        // 取消全选：清空选中列表
        selectedIds.value = []
      }
    }
    
    // 切换全选状态
    const toggleSelectAll = () => {
      selectAll(!isAllSelected.value)
    }
    
    // 删除选中的商品
    const removeSelectedItems = () => {
      items.value = items.value.filter(item => !selectedIds.value.includes(item.itemId))
      selectedIds.value = []
    }
    
    // 检查商品是否选中
    const isItemSelected = (itemId) => {
      return selectedIds.value.includes(itemId)
    }
    
    // 兼容旧方法名
    const toggleItemSelected = toggleSelect
    const toggleAllSelected = selectAll
    const getSelectedItems = () => selectedItems.value
    
    return {
      // 状态
      items,
      selectedIds,
      
      // 计算属性
      totalCount,
      totalPrice,
      isEmpty,
      selectedItems,
      selectedCount,
      selectedPrice,
      isAllSelected,
      
      // 方法
      addToCart,
      removeFromCart,
      updateQuantity,
      toggleSelect,
      selectAll,
      toggleSelectAll,
      clearCart,
      removeSelectedItems,
      isItemSelected,
      
      // 兼容旧方法名
      addItem,
      removeItem,
      toggleItemSelected,
      toggleAllSelected,
      getSelectedItems
    }
  },
  {
    persist: {
      paths: ['items', 'selectedIds']
    }
  }
)