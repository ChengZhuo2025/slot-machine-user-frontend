<template>
  <!-- 弹窗模式 -->
  <view v-if="show && mode === 'select'" class="address-manager-modal" @click="handleClose">
    <view class="modal-content animate__animated animate__slideInUp" @click.stop>
      <view class="modal-header">
        <text class="modal-title">选择收货地址</text>
        <view class="modal-close" @click="handleClose">
          <Icon name="close" size="medium" color="#999" />
        </view>
      </view>

      <scroll-view class="address-list-scroll" scroll-y>
        <view class="address-list">
          <view
            v-for="address in addresses"
            :key="address.id"
            class="address-item"
            @click="handleSelectAddress(address)"
          >
            <view class="address-header">
              <view class="header-left">
                <text class="receiver-name">{{ address.receiverName }}</text>
                <text class="receiver-phone">{{ address.receiverPhone }}</text>
              </view>
              <view v-if="address.isDefault" class="default-badge">
                <text class="badge-text">默认</text>
              </view>
            </view>

            <view class="address-content">
              <Icon name="location" size="small" color="#8B5CF6" style="margin-top: 4rpx;" />
              <text class="address-text">
                {{ address.province }}{{ address.city }}{{ address.district }}{{ address.address }}
              </text>
            </view>

            <view v-if="address.tag" class="address-footer">
              <view class="address-tag">
                <text class="tag-text">{{ address.tag }}</text>
              </view>
            </view>
          </view>

          <view v-if="!addresses.length" class="empty-state">
            <Icon name="location" size="xlarge" color="#ccc" />
            <text class="empty-text">暂无收货地址</text>
          </view>
        </view>
      </scroll-view>

      <view class="modal-footer">
        <button class="btn-add-new" @click="handleAddNewAddress">
          <Icon name="add" size="medium" color="#d746f0" />
          <text>添加新地址</text>
        </button>
      </view>
    </view>
  </view>

  <!-- 页面模式(原有的完整组件) -->
  <view v-else-if="!show || mode === 'manage'" class="address-manager">
    <!-- 地址列表 -->
    <view class="address-list">
      <view v-for="address in addresses" :key="address.id" class="address-item">
        <view class="address-header">
          <view class="header-left">
            <text class="receiver-name">{{ address.receiverName }}</text>
            <text class="receiver-phone">{{ address.receiverPhone }}</text>
          </view>
          <view v-if="address.isDefault" class="default-badge">
            <text class="badge-text">默认</text>
          </view>
        </view>

        <view class="address-content">
          <Icon name="location" size="small" color="#8B5CF6" style="margin-top: 4rpx;" />
          <text class="address-text">
            {{ address.province }}{{ address.city }}{{ address.district }}{{ address.address }}
          </text>
        </view>

        <view class="address-footer">
          <view v-if="address.tag" class="address-tag">
            <text class="tag-text">{{ address.tag }}</text>
          </view>
          <view class="address-actions">
            <view class="action-btn" @click="handleEdit(address)">
              <Icon name="edit" size="small" color="#3B82F6" />
              <text class="btn-text">编辑</text>
            </view>
            <view class="action-btn" @click="handleDelete(address)">
              <Icon name="delete" size="small" color="#EF4444" />
              <text class="btn-text">删除</text>
            </view>
            <view v-if="!address.isDefault" class="action-btn" @click="handleSetDefault(address)">
              <Icon name="check" size="small" color="#10c467" />
              <text class="btn-text">设为默认</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="!addresses.length" class="empty-state">
        <Icon name="location" size="xlarge" color="#ccc" />
        <text class="empty-text">暂无收货地址</text>
      </view>
    </view>

    <!-- 添加地址按钮 -->
    <view class="add-button">
      <button class="btn-add" @click="handleAdd">
        <Icon name="add" size="small" color="#fff" />
        <text>添加新地址</text>
      </button>
    </view>

    <!-- 编辑地址弹窗 -->
    <view v-if="showEditModal" class="edit-modal-overlay" @click="closeEditModal">
      <view class="edit-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ editMode === 'add' ? '添加地址' : '编辑地址' }}</text>
          <view class="modal-close" @click="closeEditModal">
            <Icon name="close" size="medium" color="#666" />
          </view>
        </view>

        <view class="modal-content">
          <!-- 粘贴识别按钮 -->
          <view class="paste-section">
            <button class="btn-paste" @click="handlePasteRecognize">
              <Icon name="clipboard" size="small" color="#8B5CF6" />
              <text class="paste-text">粘贴地址智能识别</text>
            </button>
          </view>

          <view class="form-item form-item--inline">
            <text class="form-label">收货人</text>
            <input v-model="editForm.receiverName" class="form-input-inline" placeholder="请输入收货人姓名" />
          </view>

          <view class="form-item form-item--inline">
            <text class="form-label">手机号</text>
            <input v-model="editForm.receiverPhone" class="form-input-inline" type="number" maxlength="11" placeholder="请输入手机号" />
          </view>

          <view class="form-item form-item--inline" @click="showRegionPicker">
            <text class="form-label">所在地区</text>
            <view class="form-value-inline">
              <text class="value-text">{{ regionText || '请选择省市区' }}</text>
              <Icon name="chevron-right" size="small" color="#999" />
            </view>
          </view>

          <view class="form-item" style="margin-top: 20rpx;">
            <text class="form-label">详细地址</text>
            <textarea v-model="editForm.address" class="form-textarea" placeholder="请输入详细地址" maxlength="100" />
          </view>

          <view class="form-item">
            <text class="form-label">地址标签</text>
            <view class="tag-selector">
              <view
                v-for="tag in tagOptions"
                :key="tag"
                class="tag-option"
                :class="{ 'tag-option--active': editForm.tag === tag }"
                @click="editForm.tag = tag"
              >
                <text>{{ tag }}</text>
              </view>
            </view>
          </view>

          <view class="form-item form-item--switch">
            <text class="form-label">设为默认地址</text>
            <Switch :checked="editForm.isDefault" @change="onDefaultChange" />
          </view>
        </view>

        <view class="modal-footer">
          <button class="btn-save" @click="handleSave">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import Icon from '../common/Icon.vue'
import Switch from '../common/Switch.vue'

export default {
  name: 'AddressManager',
  components: {
    Icon,
    Switch
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'manage', // 'manage' 或 'select'
      validator: (value) => ['manage', 'select'].includes(value)
    }
  },
  emits: ['close', 'select'],
  setup(props, { emit }) {
    const addresses = ref([])
    const showEditModal = ref(false)
    const editMode = ref('add')
    const editForm = reactive({
      id: null,
      receiverName: '',
      receiverPhone: '',
      province: '',
      city: '',
      district: '',
      address: '',
      tag: '家',
      isDefault: false
    })
    const tagOptions = ['家', '公司', '学校', '其他']

    const regionText = computed(() => {
      if (editForm.province && editForm.city && editForm.district) {
        return `${editForm.province} ${editForm.city} ${editForm.district}`
      }
      return ''
    })

    // 加载地址列表
    const loadAddresses = () => {
      // 模拟数据
      setTimeout(() => {
        addresses.value = [
          {
            id: 1,
            receiverName: '张三',
            receiverPhone: '13800138000',
            province: '浙江省',
            city: '杭州市',
            district: '西湖区',
            address: '文三路259号',
            fullAddress: '浙江省杭州市西湖区文三路259号',
            name: '张三',
            phone: '13800138000',
            isDefault: true,
            tag: '家'
          },
          {
            id: 2,
            receiverName: '李四',
            receiverPhone: '13900139000',
            province: '浙江省',
            city: '杭州市',
            district: '余杭区',
            address: '文一西路998号',
            fullAddress: '浙江省杭州市余杭区文一西路998号',
            name: '李四',
            phone: '13900139000',
            isDefault: false,
            tag: '公司'
          }
        ]
      }, 300)
    }

    // 选择模式下选择地址
    const handleSelectAddress = (address) => {
      if (props.mode === 'select') {
        emit('select', {
          ...address,
          name: address.receiverName,
          phone: address.receiverPhone,
          fullAddress: `${address.province}${address.city}${address.district}${address.address}`
        })
      }
    }

    // 关闭弹窗
    const handleClose = () => {
      emit('close')
    }

    // 添加新地址
    const handleAddNewAddress = () => {
      handleAdd()
    }

    const handleAdd = () => {
      editMode.value = 'add'
      Object.assign(editForm, {
        id: null,
        receiverName: '',
        receiverPhone: '',
        province: '',
        city: '',
        district: '',
        address: '',
        tag: '家',
        isDefault: false
      })
      showEditModal.value = true
    }

    const handleEdit = (address) => {
      editMode.value = 'edit'
      Object.assign(editForm, address)
      showEditModal.value = true
    }

    const handleDelete = (address) => {
      uni.showModal({
        title: '删除地址',
        content: '确定要删除这个地址吗?',
        success: (res) => {
          if (res.confirm) {
            const index = addresses.value.findIndex(a => a.id === address.id)
            if (index > -1) {
              addresses.value.splice(index, 1)
              uni.showToast({ title: '删除成功', icon: 'success' })
            }
          }
        }
      })
    }

    const handleSetDefault = (address) => {
      addresses.value.forEach(a => {
        a.isDefault = a.id === address.id
      })
      uni.showToast({ title: '已设为默认地址', icon: 'success' })
    }

    const showRegionPicker = () => {
      // 这里应该调用地区选择器,这里简化处理
      uni.showToast({ title: '地区选择器功能开发中', icon: 'none' })
    }

    const onDefaultChange = (e) => {
      editForm.isDefault = e.detail.value
    }

    const handleSave = () => {
      // 验证表单
      if (!editForm.receiverName) {
        uni.showToast({ title: '请输入收货人姓名', icon: 'none' })
        return
      }
      if (!editForm.receiverPhone || !/^1\d{10}$/.test(editForm.receiverPhone)) {
        uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
        return
      }
      if (!editForm.province || !editForm.city || !editForm.district) {
        uni.showToast({ title: '请选择所在地区', icon: 'none' })
        return
      }
      if (!editForm.address) {
        uni.showToast({ title: '请输入详细地址', icon: 'none' })
        return
      }

      if (editMode.value === 'add') {
        const newAddress = { ...editForm, id: Date.now() }
        if (newAddress.isDefault) {
          addresses.value.forEach(a => { a.isDefault = false })
        }
        addresses.value.unshift(newAddress)
        uni.showToast({ title: '添加成功', icon: 'success' })
      } else {
        const index = addresses.value.findIndex(a => a.id === editForm.id)
        if (index > -1) {
          if (editForm.isDefault) {
            addresses.value.forEach(a => { a.isDefault = false })
          }
          addresses.value[index] = { ...editForm }
          uni.showToast({ title: '保存成功', icon: 'success' })
        }
      }

      closeEditModal()
    }

    const closeEditModal = () => {
      showEditModal.value = false
    }

    // 粘贴地址智能识别
    const handlePasteRecognize = async () => {
      try {
        // 获取剪贴板内容
        const clipboardData = await uni.getClipboardData()
        const text = clipboardData.data

        if (!text) {
          uni.showToast({ title: '剪贴板为空', icon: 'none' })
          return
        }

        uni.showLoading({ title: '识别中...' })

        // 智能识别地址信息
        const result = parseAddress(text)

        if (result) {
          // 填充表单
          if (result.name) editForm.receiverName = result.name
          if (result.phone) editForm.receiverPhone = result.phone
          if (result.province) editForm.province = result.province
          if (result.city) editForm.city = result.city
          if (result.district) editForm.district = result.district
          if (result.address) editForm.address = result.address

          uni.hideLoading()
          uni.showToast({ title: '识别成功', icon: 'success' })
        } else {
          uni.hideLoading()
          uni.showToast({ title: '无法识别地址信息', icon: 'none' })
        }
      } catch (error) {
        uni.hideLoading()
        uni.showToast({ title: '识别失败', icon: 'none' })
      }
    }

    // 解析地址文本
    const parseAddress = (text) => {
      const result = {}

      // 提取手机号 (11位数字)
      const phoneMatch = text.match(/1[3-9]\d{9}/)
      if (phoneMatch) {
        result.phone = phoneMatch[0]
      }

      // 提取姓名 (假设在手机号前面，2-4个中文字符)
      const nameMatch = text.match(/[\u4e00-\u9fa5]{2,4}(?=.*1[3-9]\d{9})/)
      if (nameMatch) {
        result.name = nameMatch[0]
      }

      // 提取省市区
      const provinceMatch = text.match(/([\u4e00-\u9fa5]{2,4}省|[\u4e00-\u9fa5]{2,4}自治区|[\u4e00-\u9fa5]{2,4}特别行政区|北京市|上海市|天津市|重庆市)/)
      if (provinceMatch) {
        result.province = provinceMatch[0]
      }

      const cityMatch = text.match(/([\u4e00-\u9fa5]{2,6}市|[\u4e00-\u9fa5]{2,6}自治州|[\u4e00-\u9fa5]{2,6}地区|[\u4e00-\u9fa5]{2,6}盟)/)
      if (cityMatch) {
        result.city = cityMatch[0]
      }

      const districtMatch = text.match(/([\u4e00-\u9fa5]{2,6}区|[\u4e00-\u9fa5]{2,6}县|[\u4e00-\u9fa5]{2,6}市|[\u4e00-\u9fa5]{2,6}旗)/)
      if (districtMatch) {
        result.district = districtMatch[0]
      }

      // 提取详细地址 (去除已识别的省市区和手机号等信息)
      let address = text
      if (result.name) address = address.replace(result.name, '')
      if (result.phone) address = address.replace(result.phone, '')
      if (result.province) address = address.replace(result.province, '')
      if (result.city) address = address.replace(result.city, '')
      if (result.district) address = address.replace(result.district, '')

      // 清理空格、换行等
      address = address.replace(/[\s\n\r,，]/g, '').trim()
      if (address) {
        result.address = address
      }

      return Object.keys(result).length > 0 ? result : null
    }

    loadAddresses()

    return {
      addresses,
      showEditModal,
      editMode,
      editForm,
      tagOptions,
      regionText,
      handleAdd,
      handleEdit,
      handleDelete,
      handleSetDefault,
      showRegionPicker,
      onDefaultChange,
      handleSave,
      closeEditModal,
      handlePasteRecognize,
      handleSelectAddress,
      handleClose,
      handleAddNewAddress
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

// 弹窗模式样式
.address-manager-modal {
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

.modal-content {
  width: 100%;
  max-height: 80vh;
  background: $background-primary;
  border-radius: 32rpx 32rpx 0 0;
  display: flex;
  flex-direction: column;
  animation-duration: 0.3s;
}

.modal-header {
  position: relative;
  height: 96rpx;
  @include flex-center();
  border-bottom: 1rpx solid $border-color;
}

.modal-title {
  font-size: 32rpx;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.modal-close {
  position: absolute;
  top: 22rpx;
  right: 32rpx;
  width: 52rpx;
  height: 52rpx;
  @include flex-center();
  background: $background-secondary;
  border-radius: 50%;

  &:active {
    transform: scale(0.9);
  }
}

.address-list-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 24rpx;
}

.modal-footer {
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid $border-color;
}

.btn-add-new {
  width: 100%;
  height: 80rpx;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  border: 2rpx solid $primary-color;
  border-radius: 40rpx;
  @include flex-center();
  gap: 12rpx;
  font-size: 28rpx;
  color: $primary-color;
  font-weight: $font-weight-semibold;
  transition: all $transition-base;

  &:active {
    opacity: 0.8;
    transform: scale(0.98);
  }

  &::after {
    border: none;
  }
}

// 页面模式样式
.address-manager {
  height: 80vh;
  display: flex;
  flex-direction: column;
}

.address-list {
  flex: 1;
  overflow-y: auto;
  margin-bottom: $spacing-base;

  .address-item {
    background: $background-primary;
    border-radius: 20rpx;
    padding: $spacing-base;
    margin-bottom: $spacing-sm;

    .address-header {
      @include flex-between();
      margin-bottom: $spacing-sm;

      .header-left {
        @include flex();
        gap: $spacing-base;

        .receiver-name {
          font-size: $font-size-sm;
          font-weight: $font-weight-semibold;
          color: $text-primary;
        }

        .receiver-phone {
          font-size: $font-size-xs;
          color: $text-secondary;
        }
      }

      .default-badge {
        padding: 4rpx $spacing-sm;
        background: $gradient-primary;
        border-radius: $border-radius-base;

        .badge-text {
          display: flex;
          font-size: $font-size-xs;
          color: #fff;
        }
      }
    }

    .address-content {
      @include flex();
      gap: $spacing-xs;
      margin-bottom: $spacing-sm;
      padding: $spacing-sm;
      background: $background-secondary;
      border-radius: $border-radius-base;

      .address-text {
        flex: 1;
        font-size: $font-size-sm;
        color: $text-primary;
        line-height: 1.5;
      }
    }

    .address-footer {
      @include flex-between();
      align-items: center;

      .address-tag {
        padding: 4rpx $spacing-sm;
        background: rgba($primary-dark, 0.1);
        border-radius: $border-radius-base;

        .tag-text {
          display: flex;
          font-size: $font-size-xs;
          color: $primary-dark;
        }
      }

      .address-actions {
        @include flex();
        gap: $spacing-base;

        .action-btn {
          @include flex();
          align-items: center;
          gap: 4rpx;

          .btn-text {
            font-size: $font-size-xs;
            color: $text-secondary;
          }
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

.add-button {
  .btn-add {
    width: 100%;
    height: 80rpx;
    background: $gradient-primary;
    border-radius: 20rpx;
    @include flex-center();
    gap: $spacing-xs;
    font-size: $font-size-sm;
    color: #fff;
    font-weight: $font-weight-semibold;
    border: none;

    &:active {
      opacity: 0.8;
    }

    &::after {
      border: none;
    }
  }
}

// 编辑弹窗
.edit-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  @include flex-center();
  padding: $spacing-xl;
}

.edit-modal {
  width: 100%;
  max-height: 80vh;
  background: $background-primary;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;

  .modal-header {
    @include flex-between();
    padding: $spacing-base;
    border-bottom: 2rpx solid $border-light;

    .modal-title {
      font-size: $font-size-base;
      font-weight: $font-weight-semibold;
      color: $text-primary;
    }

    .modal-close {
      width: 60rpx;
      height: 60rpx;
      @include flex-center();
    }
  }

  .modal-content {
    flex: 1;
    overflow-y: auto;
    padding: $spacing-base;

    .paste-section {
      margin-bottom: $spacing-base;

      .btn-paste {
        width: 100%;
        height: 72rpx;
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);
        border: 2rpx dashed $primary-color;
        border-radius: $border-radius-base;
        @include flex-center();
        gap: $spacing-xs;
        transition: all $transition-base;

        &:active {
          opacity: 0.8;
          transform: scale(0.98);
        }

        &::after {
          border: none;
        }

        .paste-text {
          font-size: $font-size-sm;
          color: $primary-color;
          font-weight: $font-weight-medium;
        }
      }
    }

    .form-item {
      margin-bottom: $spacing-base;

      &--inline {
        @include flex-between();
        align-items: center;
        height:92rpx;
        border-bottom: 1rpx solid #ddd;
        margin-bottom: 0;

        .form-label {
          margin-bottom: 0 !important;
          width: 160rpx;
          flex-shrink: 0;
        }

        .form-input-inline {
          flex: 1;
          height: 60rpx;
          line-height: 60rpx;
          padding: 0;
          background: transparent;
          border: none;
          font-size: $font-size-sm;
          color: $text-primary;
          text-align: right;

          &::placeholder {
            color: $text-tertiary;
          }
        }

        .form-value-inline {
          flex: 1;
          @include flex();
          justify-content: flex-end;
          align-items: center;
          gap: $spacing-xs;

          .value-text {
            font-size: $font-size-sm;
            color: $text-secondary;
          }
        }
      }

      &--switch {
        @include flex-between();
        align-items: center;
      }

      .form-label {
        font-size: $font-size-sm;
        color: $text-secondary;
        font-weight: $font-weight-medium;
        margin-bottom: $spacing-sm;
        display: block;
      }

      .form-input,
      .form-textarea {
        width: 100%;
        padding: $spacing-sm $spacing-base;
        background: $background-secondary;
        border-radius: $border-radius-base;
        border: 1rpx solid #ddd;
        font-size: $font-size-sm;
        color: $text-primary;

        &:focus {
          border-color: $primary-color;
        }
      }

      .form-input {
        height: 72rpx;
        line-height: 72rpx;
      }

      .form-textarea {
        height: 120rpx;
        line-height: 1.6;
      }

      .form-value {
        @include flex-between();
        padding: $spacing-sm;
        background: $background-secondary;
        border-radius: $border-radius-base;

        .value-text {
          font-size: $font-size-sm;
          color: $text-secondary;
        }
      }

      .tag-selector {
        @include flex();
        gap: $spacing-sm;
        flex-wrap: wrap;

        .tag-option {
          padding: $spacing-xs $spacing-base;
          background: $background-secondary;
          border-radius: $border-radius-base;
          font-size: $font-size-sm;
          color: $text-secondary;
          transition: all $transition-base;

          &--active {
            background: $gradient-primary;
            color: #fff;
          }
        }
      }
    }
  }

  .modal-footer {
    padding: $spacing-base;
    border-top: 2rpx solid $border-light;

    .btn-save {
      width: 100%;
      height: 80rpx;
      background: $gradient-primary;
      border-radius: 20rpx;
      @include flex-center();
      font-size: $font-size-sm;
      color: #fff;
      font-weight: $font-weight-semibold;
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
</style>
