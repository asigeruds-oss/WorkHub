<template>
  <!-- 使用整个视口显示加载画面 -->
  <div class="loading-container">
    <div class="loading-content">
      <v-progress-circular
        :size="70"
        :width="7"
        indeterminate
        color="primary"
      ></v-progress-circular>
      <div class="loading-text mt-4">加载中...</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 定义页面加载持续的时间（毫秒），设为null表示永不结束
const loadingDuration = null; // 可以设置具体时间，如5000表示5秒后跳转

// 在组件挂载时设置样式以隐藏导航和其他页面元素
onMounted(() => {
  // 隐藏默认布局
  document.body.classList.add('loading-page-active');
  
  // 如果需要在一定时间后自动跳转，取消下面的注释
  /*
  if (loadingDuration) {
    setTimeout(() => {
      // 跳转到首页或其他页面
      router.push('/');
    }, loadingDuration);
  }
  */
});

// 在组件卸载前恢复原样式
onBeforeUnmount(() => {
  document.body.classList.remove('loading-page-active');
});
</script>

<style scoped>
.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--v-background-base, #f5f5f5);
  z-index: 9999;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-text {
  font-size: 1.5rem;
  color: var(--v-primary-base, #1976D2);
  margin-top: 1rem;
}
</style>

<style>
/* 全局样式，用于隐藏导航和页面布局 */
body.loading-page-active .v-app-bar,
body.loading-page-active .v-navigation-drawer,
body.loading-page-active .v-footer {
  display: none !important;
}

body.loading-page-active .v-main {
  padding: 0 !important;
}
</style>
