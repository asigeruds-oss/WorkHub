<template>
  <div class="pure-loading-container">
    <div class="loading-spinner">
      <v-progress-circular
        :size="80"
        :width="8"
        indeterminate
        color="primary"
      ></v-progress-circular>
    </div>
    <div class="loading-message">
      数据加载中，请稍候...
    </div>
  </div>
</template>

<script setup>
// 纯加载页面逻辑
</script>

<route>
{
  // 指定不使用任何布局
  meta: {
    layout: false,
    requiresAuth: false // 设置为false表示不需要登录
  }
}
</route>

<style scoped>
.pure-loading-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-spinner {
  margin-bottom: 2rem;
}

.loading-message {
  font-size: 1.8rem;
  color: #1976D2;
  font-weight: 500;
  margin-top: 1rem;
  text-align: center;
}
</style>
