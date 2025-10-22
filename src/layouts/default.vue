<template>
  <v-app>
    <!-- 应用栏 -->
    <v-app-bar
      :elevation="1"
      color="primary"
      class="app-header"
    >
      <template v-slot:prepend>
        <v-app-bar-nav-icon 
          variant="text"
          @click.stop="drawer = !drawer" 
          color="white"
          class="nav-icon-animation"
        ></v-app-bar-nav-icon>
      </template>
      
      <v-app-bar-title>
        <router-link to="/" class="text-decoration-none text-white logo-container">
          <v-icon icon="mdi-hexagon-multiple-outline" size="large" class="logo-icon mr-2"></v-icon>
          <span class="app-title">个人待办系统</span>
        </router-link>
      </v-app-bar-title>

      <v-spacer></v-spacer>
      
      <!-- 未登录时显示 -->
      <template v-if="!isAuthenticated">
        <v-btn variant="text" to="/login" color="white" rounded="pill" class="login-btn">
          <v-icon start>mdi-login</v-icon>
          登录
        </v-btn>
        <v-btn variant="outlined" to="/register" class="ml-2 register-btn" color="white" rounded="pill">
          <v-icon start>mdi-account-plus</v-icon>
          注册
        </v-btn>
      </template>
      
      <!-- 已登录时显示 -->
      <template v-else>
        <v-btn icon="mdi-bell" variant="text" color="white" class="mr-2 notification-btn">
          <v-badge
            color="error"
            :content="0"
            :model-value="false"
            floating
            dot
          ></v-badge>
        </v-btn>
        
        <v-menu location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
              variant="text"
              v-bind="props"
              class="ml-2 user-profile-btn"
              color="white"
            >
              <v-avatar size="32" color="primary-lighten-3" class="mr-2 user-avatar" variant="elevated">
                <v-icon icon="mdi-account"></v-icon>
              </v-avatar>
              {{ user?.username || '用户' }}
              <v-icon right class="dropdown-icon">mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-list width="220" elevation="6" rounded="lg" class="user-dropdown-menu">
            <v-list-item to="/settings" prepend-icon="mdi-cog" class="menu-item">
              <v-list-item-title>个人设置</v-list-item-title>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item @click="logout" prepend-icon="mdi-logout" class="menu-item">
              <v-list-item-title class="text-error">退出登录</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </v-app-bar>

    <!-- 主要内容区域 -->
    <v-main>
      <router-view />
    </v-main>
    
    <!-- 侧边栏导航 -->
    <v-navigation-drawer
      v-model="drawer"
      temporary
      :width="280"
      elevation="4"
      class="app-sidebar"
    >
      <v-list-item
        prepend-icon="mdi-hexagon-multiple-outline"
        title="个人提效中心"
        subtitle="Content Hub"
        class="my-4 sidebar-header"
      >
        <template v-slot:append>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="drawer = false"
            class="close-btn"
          ></v-btn>
        </template>
      </v-list-item>

      <v-divider></v-divider>

      <v-list density="compact" nav class="sidebar-nav">
        <v-list-item
          to="/"
          prepend-icon="mdi-home"
          title="首页"
          rounded="lg"
          :active="$route.path === '/'"
        ></v-list-item>
        
        <v-list-item
          to="/wiki"
          prepend-icon="mdi-book-open-variant"
          title="Wiki 知识库"
          rounded="lg"
          :active="$route.path.startsWith('/wiki')"
        ></v-list-item>
        
        <!-- 暂时隐藏P假条页面
        <v-list-item
          to="/autops"
          prepend-icon="mdi-file-document-edit"
          title="zzuli假条生成"
          rounded="lg"
          :active="$route.path === '/autops'"
        ></v-list-item>
        -->
        
        <template v-if="isAuthenticated">
          <v-list-item
            to="/todos"
            prepend-icon="mdi-format-list-checks"
            title="待办事项"
            rounded="lg"
            :active="$route.path === '/todos'"
          ></v-list-item>
          
          <v-list-item
            to="/cultivation"
            prepend-icon="mdi-arrow-up-bold-circle-outline"
            title="修仙系统"
            rounded="lg"
            :active="$route.path === '/cultivation'"
          ></v-list-item>
          
          <v-list-item
            to="/settings"
            prepend-icon="mdi-cog"
            title="设置"
            rounded="lg"
            :active="$route.path === '/settings'"
          ></v-list-item>
        </template>
      </v-list>
      
      <template v-slot:append>
        <div class="pa-2">
          <v-btn
            v-if="isAuthenticated"
            block
            color="error"
            variant="outlined"
            prepend-icon="mdi-logout"
            @click="logout"
            class="mb-2 logout-btn"
            rounded="lg"
          >
            退出登录
          </v-btn>
          <div class="text-caption text-center text-medium-emphasis mt-2">
            Content Hub v1.0.0
          </div>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- 页脚 -->
    <AppFooter />
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const $route = useRoute()
const drawer = ref(false)

// 计算属性
const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.getUser)

// 方法
function logout() {
  authStore.logout()
  drawer.value = false
  router.push('/login')
}
</script>

<style scoped>
/* 应用栏样式 */
.app-header {
  background: linear-gradient(135deg, #4A67FF 0%, #3F51B5 100%) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo-icon {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  transition: transform 0.3s ease;
}

.logo-container:hover .logo-icon {
  transform: rotate(15deg);
}

.app-title {
  font-weight: 600;
  letter-spacing: 0.5px;
  font-size: 1.2rem;
}

/* 导航图标动画 */
.nav-icon-animation {
  transition: transform 0.3s ease;
}

.nav-icon-animation:hover {
  transform: scale(1.1);
}

/* 按钮样式 */
.login-btn, .register-btn {
  font-weight: 500;
  letter-spacing: 0.5px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.login-btn:hover, .register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.register-btn {
  border-width: 2px;
}

.notification-btn {
  transition: transform 0.3s ease;
}

.notification-btn:hover {
  transform: rotate(15deg);
}

.user-avatar {
  border: 2px solid rgba(255, 255, 255, 0.8);
  transition: transform 0.3s ease;
}

.user-profile-btn:hover .user-avatar {
  transform: scale(1.1);
}

.dropdown-icon {
  transition: transform 0.3s ease;
}

.user-profile-btn:hover .dropdown-icon {
  transform: rotate(180deg);
}

/* 用户下拉菜单 */
.user-dropdown-menu {
  overflow: hidden;
  border-radius: 12px;
}

.menu-item {
  transition: background-color 0.2s ease;
  border-radius: 8px;
  margin: 4px;
}

/* 侧边栏样式 */
.app-sidebar {
  border-radius: 0 12px 12px 0;
}

.sidebar-header {
  padding: 16px;
}

.sidebar-nav :deep(.v-list-item) {
  margin: 4px 8px;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.sidebar-nav :deep(.v-list-item--active) {
  border-left-color: rgb(var(--v-theme-primary));
  background: linear-gradient(90deg, 
    rgba(var(--v-theme-primary-rgb), 0.1) 0%, 
    rgba(var(--v-theme-primary-rgb), 0.05) 70%,
    rgba(var(--v-theme-primary-rgb), 0) 100%
  ) !important;
}

.sidebar-nav :deep(.v-list-item:hover) {
  background-color: rgba(var(--v-theme-primary-rgb), 0.05);
}

.close-btn {
  opacity: 0.6;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.close-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

.logout-btn {
  border-radius: 8px;
  font-weight: 500;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
  border-width: 2px;
}

.logout-btn:hover {
  background-color: rgba(var(--v-theme-error-rgb), 0.1);
  transform: translateY(-1px);
}
</style>
