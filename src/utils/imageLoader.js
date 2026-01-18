/**
 * 图片懒加载工具
 * T003: 创建图片懒加载工具
 */

/**
 * 图片加载状态枚举
 */
export const ImageLoadState = {
  PENDING: 'pending',
  LOADING: 'loading',
  LOADED: 'loaded',
  ERROR: 'error'
}

/**
 * 默认占位图
 */
const DEFAULT_PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23f5f5f5" width="200" height="200"/%3E%3C/svg%3E'
const DEFAULT_ERROR_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" fill="%23999" font-size="14" text-anchor="middle" dy=".3em"%3E加载失败%3C/text%3E%3C/svg%3E'

/**
 * 图片懒加载管理器
 */
class ImageLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: options.rootMargin || '50px',
      threshold: options.threshold || 0.01,
      placeholder: options.placeholder || DEFAULT_PLACEHOLDER,
      errorImage: options.errorImage || DEFAULT_ERROR_IMAGE,
      ...options
    }

    // 存储观察者实例
    this.observer = null
    // 存储元素与回调的映射
    this.callbacks = new WeakMap()

    // 初始化 IntersectionObserver
    this.initObserver()
  }

  /**
   * 初始化观察者
   */
  initObserver() {
    // 检查 IntersectionObserver 支持
    if (typeof IntersectionObserver === 'undefined') {
      console.warn('IntersectionObserver not supported, using fallback')
      return
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target)
            this.observer.unobserve(entry.target)
          }
        })
      },
      {
        rootMargin: this.options.rootMargin,
        threshold: this.options.threshold
      }
    )
  }

  /**
   * 观察元素
   * @param {HTMLElement} el - 图片元素
   * @param {object} options - 加载选项
   * @param {string} options.src - 图片源地址
   * @param {string} options.thumbnail - 缩略图地址（可选）
   * @param {Function} options.onLoad - 加载成功回调
   * @param {Function} options.onError - 加载失败回调
   */
  observe(el, options = {}) {
    if (!el) return

    // 存储回调和选项
    this.callbacks.set(el, options)

    // 设置占位图
    if (el.tagName === 'IMG') {
      el.src = options.placeholder || this.options.placeholder
    } else {
      el.style.backgroundImage = `url(${options.placeholder || this.options.placeholder})`
    }

    // 添加加载状态类
    el.classList.add('lazy-image', 'lazy-pending')

    if (this.observer) {
      this.observer.observe(el)
    } else {
      // 降级：直接加载
      this.loadImage(el)
    }
  }

  /**
   * 加载图片
   * @param {HTMLElement} el - 图片元素
   */
  loadImage(el) {
    const options = this.callbacks.get(el) || {}
    const { src, thumbnail, onLoad, onError } = options

    if (!src) return

    // 更新状态
    el.classList.remove('lazy-pending')
    el.classList.add('lazy-loading')

    // 如果有缩略图，先加载缩略图
    if (thumbnail) {
      this.loadWithThumbnail(el, thumbnail, src, onLoad, onError)
    } else {
      this.loadDirectly(el, src, onLoad, onError)
    }
  }

  /**
   * 带缩略图的渐进式加载
   */
  loadWithThumbnail(el, thumbnail, fullSrc, onLoad, onError) {
    // 先加载缩略图
    const thumbImg = new Image()
    thumbImg.onload = () => {
      this.setImageSrc(el, thumbnail)
      el.classList.add('lazy-thumbnail')

      // 再加载高清图
      const fullImg = new Image()
      fullImg.onload = () => {
        this.setImageSrc(el, fullSrc)
        el.classList.remove('lazy-loading', 'lazy-thumbnail')
        el.classList.add('lazy-loaded')
        onLoad && onLoad(fullSrc)
      }
      fullImg.onerror = () => {
        // 高清图加载失败，保持缩略图
        el.classList.remove('lazy-loading')
        el.classList.add('lazy-loaded')
        onLoad && onLoad(thumbnail)
      }
      fullImg.src = fullSrc
    }
    thumbImg.onerror = () => {
      // 缩略图也失败，直接加载高清图
      this.loadDirectly(el, fullSrc, onLoad, onError)
    }
    thumbImg.src = thumbnail
  }

  /**
   * 直接加载图片
   */
  loadDirectly(el, src, onLoad, onError) {
    const img = new Image()
    img.onload = () => {
      this.setImageSrc(el, src)
      el.classList.remove('lazy-loading')
      el.classList.add('lazy-loaded')
      onLoad && onLoad(src)
    }
    img.onerror = () => {
      this.setImageSrc(el, this.options.errorImage)
      el.classList.remove('lazy-loading')
      el.classList.add('lazy-error')
      onError && onError(new Error('Image load failed'))
    }
    img.src = src
  }

  /**
   * 设置图片源
   */
  setImageSrc(el, src) {
    if (el.tagName === 'IMG') {
      el.src = src
    } else {
      el.style.backgroundImage = `url(${src})`
    }
  }

  /**
   * 取消观察
   */
  unobserve(el) {
    if (this.observer && el) {
      this.observer.unobserve(el)
    }
    this.callbacks.delete(el)
  }

  /**
   * 销毁
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
  }
}

// 创建默认实例
export const imageLoader = new ImageLoader()

// 导出类
export { ImageLoader }

/**
 * 生成缩略图URL
 * 支持七牛云、阿里OSS等CDN图片处理
 * @param {string} url - 原图URL
 * @param {number} width - 目标宽度
 * @param {string} format - 图片格式 (webp, jpg, png)
 * @returns {string} 缩略图URL
 */
export function getThumbnailUrl(url, width = 200, format = 'webp') {
  if (!url) return ''

  // 检测CDN类型并生成对应参数
  if (url.includes('qiniu') || url.includes('qbox')) {
    // 七牛云
    return `${url}?imageView2/2/w/${width}/format/${format}`
  } else if (url.includes('aliyuncs.com')) {
    // 阿里OSS
    return `${url}?x-oss-process=image/resize,w_${width}/format,${format}`
  } else if (url.includes('myqcloud.com')) {
    // 腾讯云
    return `${url}?imageMogr2/thumbnail/${width}x/format/${format}`
  }

  // 默认返回原图
  return url
}

/**
 * 获取高清图URL
 * @param {string} url - 原图URL
 * @param {number} width - 目标宽度（默认750px for 2x屏）
 * @returns {string}
 */
export function getFullSizeUrl(url, width = 750) {
  return getThumbnailUrl(url, width, 'webp')
}

export default imageLoader
