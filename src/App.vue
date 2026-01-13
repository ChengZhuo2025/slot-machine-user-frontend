<script>
/**
 * T018: 应用启动时 token 懒加载策略
 * 仅检查本地 token 有效期，不主动调用刷新 API
 * Token 刷新延迟到首次受保护请求时触发
 */
export default {
  onLaunch: function () {
    console.log("App Launch");

    // T018: 检查本地 token 有效期（懒加载策略）
    this.checkTokenValidity();
  },
  onShow: function () {
    console.log("App Show");
  },
  onHide: function () {
    console.log("App Hide");
  },
  methods: {
    /**
     * 检查本地 token 有效期
     * 仅做本地检查，不主动刷新 token
     * 如果 token 已完全过期，清除本地存储
     */
    checkTokenValidity() {
      const tokenExpireTime = uni.getStorageSync('tokenExpireTime');
      const refreshToken = uni.getStorageSync('refreshToken');

      if (!refreshToken || !tokenExpireTime) {
        // 没有登录凭证，无需处理
        return;
      }

      const now = Date.now();

      // 如果 token 已完全过期（超过 refresh_token 有效期，约 7 天）
      // 这里只做简单检查，具体刷新逻辑在 request.js 中处理
      // 7 天 = 7 * 24 * 60 * 60 * 1000 = 604800000 毫秒
      const sevenDays = 7 * 24 * 60 * 60 * 1000;

      if (now > tokenExpireTime + sevenDays) {
        // refresh_token 也可能已过期，清除本地凭证
        console.log('Token 已过期，清除本地凭证');
        uni.removeStorageSync('token');
        uni.removeStorageSync('refreshToken');
        uni.removeStorageSync('tokenExpireTime');
      }

      // 其他情况（token 即将过期但 refresh_token 有效）
      // 不在这里主动刷新，延迟到首次受保护请求时触发
      // 这是懒加载策略的核心：避免应用启动时的额外网络请求
    }
  }
};
</script>

<style>
/*每个页面公共css */
/* 引入全局样式，包含MiSans字体定义 */
@import '@/styles/index.scss';

/* 全局字体应用 */
* {
  font-family: 'MiSans', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif !important;
}

/* 字体粗细工具类 */
.Light {
  font-weight: 300;
}

.Regular {
  font-weight: 400;
}

.Medium {
  font-weight: 500;
}

.Semibold {
  font-weight: 600;
}

.Bold {
  font-weight: 700;
}

.Heavy {
  font-weight: 900;
}

</style>
