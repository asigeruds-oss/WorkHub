<template>
  <router-view />
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { eventBus } from "@/utils/eventBus";

const router = useRouter();
const authStore = useAuthStore();

// 处理登录成功事件
function handleLoginSuccess({ redirectPath }) {
  console.log("[App.vue] 收到登录成功事件，跳转到:", redirectPath);

  // 尝试使用路由跳转
  router
    .push(redirectPath || "/")
    .then(() => console.log("[App.vue] 路由跳转成功"))
    .catch((err) => {
      console.error("[App.vue] 路由跳转失败:", err);
      // 如果路由跳转失败，使用window.location
      window.location.href = redirectPath || "/";
    });
}

onMounted(async () => {
  // 如果已登录，在应用启动时获取最新用户信息
  if (authStore.isAuthenticated) {
    try {
      await authStore.fetchUserInfo();
    } catch (error) {
      console.error("[App.vue] 获取用户信息失败:", error);
    }
  }

  // 监听登录成功事件
  eventBus.on("auth:login-success", handleLoginSuccess);
});

onUnmounted(() => {
  // 清理事件监听
  eventBus.off("auth:login-success", handleLoginSuccess);
});
</script>
