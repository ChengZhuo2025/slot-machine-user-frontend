<script>
export default {
  onLaunch: function () {
    console.log("App Launch");
  },
  onShow: function () {
    console.log("App Show");
  },
  onHide: function () {
    console.log("App Hide");
  },
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
