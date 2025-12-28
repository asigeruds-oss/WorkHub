<template>
  <v-app>
    <!-- 现代化应用头部 -->
    <AppHeader
      @toggle-drawer="drawer = !drawer"
      @search="handleSearch"
      @notification="handleNotification"
    />

    <!-- 侧边栏导航 -->
    <AppNavigationDrawer
      v-model="drawer"
      :permanent="false"
      @logout="handleLogout"
    />

    <!-- 主要内容区域 -->
    <v-main class="main-content">
      <div class="content-wrapper">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </v-main>

    <!-- 页脚 -->
    <AppFooter />
  </v-app>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import AppHeader from "@/components/navigation/AppHeader.vue";
import AppNavigationDrawer from "@/components/navigation/AppNavigationDrawer.vue";

const authStore = useAuthStore();
const router = useRouter();
const drawer = ref(false);

// 方法
function handleLogout() {
  authStore.logout();
  drawer.value = false;
  router.push("/login");
}

function handleSearch() {
  // 处理搜索逻辑
  console.log("Search clicked");
}

function handleNotification() {
  // 处理通知逻辑
  console.log("Notification clicked");
}
</script>

<style scoped>
/* 主内容区域 */
.main-content {
  min-height: calc(100vh - 64px);
  background-color: rgb(var(--v-theme-background));
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

/* 页面过渡动画 */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 移动端适配 */
@media (max-width: 600px) {
  .main-content {
    min-height: calc(100vh - 56px);
  }
}
</style>
