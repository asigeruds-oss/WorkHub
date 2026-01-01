<template>
  <v-app-bar
    :elevation="scrolled ? 2 : 0"
    :class="['app-header', { 'header-scrolled': scrolled }]"
    :height="isMobile ? 56 : 64"
    flat
  >
    <!-- 左侧区域 -->
    <template #prepend>
      <v-app-bar-nav-icon
        v-if="showMenuButton"
        variant="text"
        @click="handleMenuClick"
        class="menu-button"
      >
        <v-icon>mdi-menu</v-icon>
      </v-app-bar-nav-icon>

      <router-link v-if="!isMobile" to="/" class="logo-link">
        <v-icon size="32" color="primary" class="logo-icon">
          mdi-briefcase-variant
        </v-icon>
        <span class="logo-text">WorkHub</span>
      </router-link>
    </template>

    <!-- 标题（移动端显示） -->
    <v-app-bar-title v-if="isMobile" class="mobile-title">
      {{ pageTitle }}
    </v-app-bar-title>

    <v-spacer></v-spacer>

    <!-- 右侧操作区 -->
    <div class="header-actions">
      <!-- 搜索按钮 -->
      <v-btn
        v-if="!isMobile && isAuthenticated"
        icon
        variant="text"
        class="action-btn"
        @click="handleSearch"
      >
        <v-icon>mdi-magnify</v-icon>
        <v-tooltip activator="parent" location="bottom">搜索</v-tooltip>
      </v-btn>

      <!-- 通知按钮 -->
      <v-btn
        v-if="isAuthenticated"
        icon
        variant="text"
        class="action-btn notification-btn"
        @click="handleNotification"
      >
        <v-badge
          v-if="notificationCount > 0"
          :content="notificationCount"
          color="error"
          floating
        >
          <v-icon>mdi-bell</v-icon>
        </v-badge>
        <v-icon v-else>mdi-bell-outline</v-icon>
        <v-tooltip activator="parent" location="bottom">通知</v-tooltip>
      </v-btn>

      <!-- 主题切换 -->
      <v-btn
        v-if="!isMobile"
        icon
        variant="text"
        class="action-btn"
        @click="toggleTheme"
      >
        <v-icon>{{ themeIcon }}</v-icon>
        <v-tooltip activator="parent" location="bottom">
          {{ isDark ? "切换到浅色" : "切换到深色" }}
        </v-tooltip>
      </v-btn>

      <!-- 未登录状态 -->
      <template v-if="!isAuthenticated">
        <v-btn
          v-if="!isMobile"
          variant="text"
          to="/login"
          class="login-btn"
          prepend-icon="mdi-login"
        >
          登录
        </v-btn>
        <v-btn
          color="primary"
          to="/register"
          class="register-btn"
          :variant="isMobile ? 'text' : 'flat'"
        >
          <v-icon v-if="isMobile">mdi-account-plus</v-icon>
          <span v-else>注册</span>
        </v-btn>
      </template>

      <!-- 已登录状态 - 用户菜单 -->
      <v-menu v-else location="bottom end" :offset="8">
        <template #activator="{ props }">
          <v-btn v-bind="props" variant="text" class="user-menu-btn">
            <v-avatar
              :size="isMobile ? 32 : 36"
              color="primary"
              class="user-avatar"
            >
              <v-icon>mdi-account</v-icon>
            </v-avatar>
            <span v-if="!isMobile" class="username">
              {{ username }}
            </span>
            <v-icon v-if="!isMobile" size="small" class="dropdown-icon">
              mdi-chevron-down
            </v-icon>
          </v-btn>
        </template>

        <v-list class="user-menu-list" min-width="200">
          <template v-for="(item, index) in userMenuItems" :key="index">
            <v-divider v-if="item.divider"></v-divider>
            <v-list-item
              v-else
              :to="item.path"
              @click="item.action ? handleMenuAction(item.action) : null"
            >
              <template #prepend>
                <v-icon :color="item.color">{{ item.icon }}</v-icon>
              </template>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
          </template>
        </v-list>
      </v-menu>
    </div>
  </v-app-bar>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useDisplay, useTheme } from "vuetify";
import { useAuthStore } from "@/stores/auth";
import { navigationConfig, getAccessibleMenuItems } from "@/config/navigation";

// Props & Emits
const emit = defineEmits(["toggle-drawer", "search", "notification"]);

// Composables
const router = useRouter();
const route = useRoute();
const { mobile } = useDisplay();
const theme = useTheme();
const authStore = useAuthStore();

// State
const scrolled = ref(false);
const notificationCount = ref(0);

// Computed
const isMobile = computed(() => mobile.value);
const isAuthenticated = computed(() => authStore.isAuthenticated);
const isAdmin = computed(() => authStore.isAdmin);
const username = computed(() => authStore.getUser?.username || "用户");

const isDark = computed(() => theme.global.current.value.dark);
const themeIcon = computed(() =>
  isDark.value ? "mdi-weather-sunny" : "mdi-weather-night"
);

const showMenuButton = computed(() => {
  return true; // 始终显示菜单按钮
});

const pageTitle = computed(() => {
  const titles = {
    "/": "工作台",
    "/wiki": "知识库",
    "/todos": "任务中心",
    "/notion": "Notion",
    "/settings": "设置",
  };
  return titles[route.path] || "WorkHub";
});

const userMenuItems = computed(() => {
  return getAccessibleMenuItems(
    navigationConfig.userMenu,
    isAuthenticated.value,
    isAdmin.value
  );
});

// Methods
function handleMenuClick() {
  emit("toggle-drawer");
}

function handleSearch() {
  emit("search");
  // 可以打开搜索对话框或跳转到搜索页面
  router.push("/wiki/search");
}

function handleNotification() {
  emit("notification");
  // 打开通知面板
}

function toggleTheme() {
  theme.global.name.value = isDark.value ? "light" : "dark";
  // 保存主题偏好到 localStorage
  localStorage.setItem("theme", theme.global.name.value);
}

function handleMenuAction(action) {
  switch (action) {
    case "profile":
      router.push("/settings");
      break;
    case "toggleTheme":
      toggleTheme();
      break;
    case "logout":
      authStore.logout();
      router.push("/login");
      break;
  }
}

function handleScroll() {
  scrolled.value = window.scrollY > 10;
}

// Lifecycle
onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  // 可以在这里获取通知数量
  // notificationCount.value = await fetchNotificationCount();
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>
.app-header {
  background-color: rgb(var(--v-theme-surface)) !important;
  border-bottom: 1px solid rgba(var(--v-border-color), 0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.header-scrolled {
  border-bottom-color: rgba(var(--v-border-color), var(--v-border-opacity));
  backdrop-filter: blur(10px);
  background-color: rgba(var(--v-theme-surface), 0.8) !important;
}

/* 菜单按钮 */
.menu-button {
  transition: all 0.2s ease;
}

.menu-button:hover {
  transform: scale(1.1);
}

/* Logo */
.logo-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
  margin-left: 8px;
}

.logo-link:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
  transform: translateX(2px);
}

.logo-icon {
  transition: transform 0.3s ease;
}

.logo-link:hover .logo-icon {
  transform: rotate(-10deg) scale(1.1);
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-primary)) 0%,
    rgb(var(--v-theme-secondary)) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 移动端标题 */
.mobile-title {
  font-size: 1.125rem;
  font-weight: 600;
}

/* 操作按钮区域 */
.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-btn {
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: scale(1.1);
}

.notification-btn :deep(.v-badge__badge) {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* 登录/注册按钮 */
.login-btn {
  margin-right: 8px;
  font-weight: 500;
}

.register-btn {
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* 用户菜单 */
.user-menu-btn {
  padding: 4px 8px !important;
  height: auto !important;
  transition: all 0.2s ease;
}

.user-menu-btn:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.user-avatar {
  transition: transform 0.2s ease;
}

.user-menu-btn:hover .user-avatar {
  transform: scale(1.1);
}

.username {
  margin: 0 8px;
  font-weight: 500;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-icon {
  opacity: 0.6;
  transition: transform 0.2s ease;
}

.user-menu-btn:hover .dropdown-icon {
  transform: rotate(180deg);
}

/* 用户下拉菜单 */
.user-menu-list {
  border-radius: 12px;
  overflow: hidden;
}

.user-menu-list :deep(.v-list-item) {
  transition: all 0.2s ease;
  border-radius: 8px;
  margin: 4px;
}

.user-menu-list :deep(.v-list-item:hover) {
  transform: translateX(4px);
}

/* 响应式调整 */
@media (max-width: 600px) {
  .header-actions {
    gap: 0;
  }
}
</style>
