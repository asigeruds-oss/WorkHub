<template>
  <v-navigation-drawer
    v-model="localDrawer"
    :permanent="!isMobile && isPermanent"
    :temporary="isMobile || !isPermanent"
    :rail="isRail && !isMobile"
    :width="drawerWidth"
    :class="[
      'app-navigation-drawer',
      { 'drawer-mobile': isMobile, 'drawer-rail': isRail },
    ]"
    @update:model-value="handleDrawerUpdate"
  >
    <!-- 导航头部 -->
    <div class="drawer-header">
      <div class="header-content">
        <v-btn
          v-if="!isRail"
          icon
          variant="text"
          size="small"
          class="close-btn"
          @click="localDrawer = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>

        <div class="brand-section" @click="navigateTo('/')">
          <v-icon :size="isRail ? 32 : 40" color="primary" class="brand-icon">
            mdi-briefcase-variant
          </v-icon>
          <div v-if="!isRail" class="brand-text">
            <h2 class="brand-title">ContentHub</h2>
            <p class="brand-subtitle">高效协作平台</p>
          </div>
        </div>
      </div>
    </div>

    <v-divider></v-divider>

    <!-- 主导航菜单 -->
    <v-list
      nav
      density="comfortable"
      class="navigation-list"
      :class="{ 'rail-list': isRail }"
    >
      <template v-for="item in accessibleMenu" :key="item.id">
        <v-list-item
          :to="item.path"
          :active="isActive(item.path)"
          :prepend-icon="item.icon"
          :title="item.title"
          :subtitle="isRail ? undefined : item.description"
          class="nav-item"
          rounded="lg"
        >
          <template v-if="item.badge && !isRail" #append>
            <v-badge
              :content="item.badge"
              :color="item.badgeColor || 'primary'"
              inline
            ></v-badge>
          </template>

          <v-tooltip
            v-if="isRail"
            activator="parent"
            location="end"
            :text="item.title"
          ></v-tooltip>
        </v-list-item>
      </template>
    </v-list>

    <!-- 底部操作区 -->
    <template #append>
      <div class="drawer-footer">
        <v-divider class="mb-2"></v-divider>

        <!-- Rail 模式切换按钮（仅桌面端） -->
        <v-list-item
          v-if="!isMobile && isAuthenticated"
          @click="toggleRail"
          class="action-item"
          rounded="lg"
        >
          <template #prepend>
            <v-icon>{{
              isRail ? "mdi-chevron-right" : "mdi-chevron-left"
            }}</v-icon>
          </template>
          <v-list-item-title v-if="!isRail">收起侧边栏</v-list-item-title>

          <v-tooltip
            v-if="isRail"
            activator="parent"
            location="end"
            text="展开侧边栏"
          ></v-tooltip>
        </v-list-item>

        <!-- 登录/登出按钮 -->
        <v-list-item
          v-if="!isAuthenticated"
          to="/login"
          prepend-icon="mdi-login"
          title="登录"
          class="action-item"
          color="primary"
          rounded="lg"
        >
          <v-tooltip
            v-if="isRail"
            activator="parent"
            location="end"
            text="登录"
          ></v-tooltip>
        </v-list-item>

        <v-list-item
          v-else
          @click="handleLogout"
          prepend-icon="mdi-logout"
          class="action-item logout-item"
          rounded="lg"
        >
          <v-list-item-title v-if="!isRail">退出登录</v-list-item-title>

          <v-tooltip
            v-if="isRail"
            activator="parent"
            location="end"
            text="退出登录"
          ></v-tooltip>
        </v-list-item>

        <!-- 版本信息 -->
        <div v-if="!isRail" class="version-info">
          <p class="text-caption text-center text-disabled">v1.0.0</p>
        </div>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useDisplay } from "vuetify";
import { useAuthStore } from "@/stores/auth";
import {
  navigationConfig,
  getAccessibleMenuItems,
  isPathActive,
} from "@/config/navigation";

// Props & Emits
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  permanent: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "logout"]);

// Composables
const router = useRouter();
const route = useRoute();
const { mobile } = useDisplay();
const authStore = useAuthStore();

// State
const isRail = ref(false);
const localDrawer = ref(props.modelValue);

// Computed
const isMobile = computed(() => mobile.value);
const isPermanent = computed(() => props.permanent && !isMobile.value);
const isAuthenticated = computed(() => authStore.isAuthenticated);

const drawerWidth = computed(() => {
  if (isRail.value) return 72;
  return isMobile.value ? 280 : 260;
});

const accessibleMenu = computed(() => {
  return getAccessibleMenuItems(
    navigationConfig.mainMenu,
    isAuthenticated.value
  );
});

// Methods
function isActive(path) {
  return isPathActive(route.path, path);
}

function navigateTo(path) {
  router.push(path);
  if (isMobile.value) {
    localDrawer.value = false;
  }
}

function toggleRail() {
  isRail.value = !isRail.value;
}

function handleLogout() {
  emit("logout");
  localDrawer.value = false;
}

function handleDrawerUpdate(value) {
  localDrawer.value = value;
  emit("update:modelValue", value);
}

// Watchers
watch(
  () => props.modelValue,
  (newValue) => {
    localDrawer.value = newValue;
  }
);

watch(isMobile, (newValue) => {
  if (!newValue) {
    isRail.value = false;
  }
});
</script>

<style scoped>
.app-navigation-drawer {
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 导航头部 */
.drawer-header {
  padding: 16px;
  position: relative;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.close-btn {
  align-self: flex-end;
  opacity: 0.6;
  transition: all 0.2s ease;
}

.close-btn:hover {
  opacity: 1;
  transform: rotate(90deg);
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.brand-section:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
  transform: translateX(2px);
}

.brand-icon {
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.brand-section:hover .brand-icon {
  transform: scale(1.1) rotate(-5deg);
}

.brand-text {
  flex: 1;
  min-width: 0;
}

.brand-title {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-primary)) 0%,
    rgb(var(--v-theme-secondary)) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-subtitle {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-on-surface-variant));
  margin: 0;
  opacity: 0.8;
}

/* 导航列表 */
.navigation-list {
  padding: 8px;
}

.rail-list {
  padding: 8px 4px;
}

.nav-item {
  margin-bottom: 4px;
  transition: all 0.2s ease;
  font-weight: 500;
}

.nav-item:hover {
  transform: translateX(4px);
}

.nav-item :deep(.v-list-item__prepend) {
  transition: transform 0.2s ease;
}

.nav-item:hover :deep(.v-list-item__prepend) {
  transform: scale(1.15);
}

.nav-item :deep(.v-list-item-subtitle) {
  font-size: 0.7rem;
  opacity: 0.7;
  line-height: 1.2;
  margin-top: 2px;
}

/* Rail 模式样式 */
.drawer-rail .nav-item {
  justify-content: center;
}

.drawer-rail .nav-item:hover {
  transform: scale(1.05);
}

/* 底部操作区 */
.drawer-footer {
  padding: 8px;
}

.action-item {
  margin-bottom: 4px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.action-item:hover {
  transform: translateX(4px);
}

.logout-item {
  color: rgb(var(--v-theme-error));
}

.logout-item:hover {
  background-color: rgba(var(--v-theme-error), 0.08);
}

.version-info {
  padding: 12px 4px 4px;
}

/* 移动端适配 */
.drawer-mobile {
  z-index: 9999;
}

.drawer-mobile .drawer-header {
  padding: 12px;
}

.drawer-mobile .navigation-list {
  padding: 4px;
}

.drawer-mobile .nav-item {
  margin-bottom: 2px;
}

/* 动画 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.nav-item {
  animation: slideIn 0.3s ease-out backwards;
}

.nav-item:nth-child(1) {
  animation-delay: 0.05s;
}
.nav-item:nth-child(2) {
  animation-delay: 0.1s;
}
.nav-item:nth-child(3) {
  animation-delay: 0.15s;
}
.nav-item:nth-child(4) {
  animation-delay: 0.2s;
}
.nav-item:nth-child(5) {
  animation-delay: 0.25s;
}
</style>
