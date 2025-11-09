<template>
  <v-app>
    <!-- 应用栏 - 吉祥物主题 -->
    <v-app-bar
      :elevation="2"
      color="mascot-primary"
      class="app-header mascot-app-bar"
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
          <MascotCow size="small" :animate="false" :show-clock="true" class="mr-2 header-mascot" />
          <span class="app-title">青牛线</span>
        </router-link>
      </v-app-bar-title>

      <v-spacer></v-spacer>
      
      <!-- 未登录时显示 -->
      <template v-if="!isAuthenticated">
        <v-btn variant="text" to="/login" color="white" rounded="xl" class="login-btn mascot-header-btn">
          <v-icon start>mdi-login</v-icon>
          登录
        </v-btn>
        <v-btn variant="outlined" to="/register" class="ml-2 register-btn mascot-header-btn" color="white" rounded="xl">
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
              rounded="xl"
            >
              <v-avatar size="32" color="mascot-cream" class="mr-2 user-avatar" variant="elevated">
                <v-icon icon="mdi-account" color="mascot-brown"></v-icon>
              </v-avatar>
              {{ user?.username || '用户' }}
              <v-icon right class="dropdown-icon">mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-list width="220" elevation="6" rounded="xl" class="user-dropdown-menu mascot-dropdown">
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
    
    <!-- 侧边栏导航 - 吉祥物主题 -->
    <v-navigation-drawer
      v-model="drawer"
      temporary
      :width="280"
      elevation="4"
      class="app-sidebar mascot-sidebar"
    >
      <v-list-item
        prepend-icon="mdi-cow"
        title="青牛线"
        subtitle="个人提效中心"
        class="my-4 sidebar-header mascot-sidebar-header"
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

      <v-divider class="mascot-divider-simple"></v-divider>

      <v-list density="compact" nav class="sidebar-nav mascot-sidebar-nav">
        <v-list-item
          to="/"
          prepend-icon="mdi-home"
          title="首页"
          rounded="xl"
          :active="$route.path === '/'"
        ></v-list-item>
        
        <v-list-item
          to="/wiki"
          prepend-icon="mdi-book-open-variant"
          title="Wiki 知识库"
          rounded="xl"
          :active="$route.path.startsWith('/wiki')"
        ></v-list-item>
        
        <!-- 暂时隐藏P假条页面
        <v-list-item
          to="/autops"
          prepend-icon="mdi-file-document-edit"
          title="zzuli假条生成"
          rounded="xl"
          :active="$route.path === '/autops'"
        ></v-list-item>
        -->
        
        <template v-if="isAuthenticated">
          <v-list-item
            to="/todos"
            prepend-icon="mdi-format-list-checks"
            title="待办事项"
            rounded="xl"
            :active="$route.path === '/todos'"
          ></v-list-item>
          
          <v-list-item
            to="/cultivation"
            prepend-icon="mdi-arrow-up-bold-circle-outline"
            title="修仙系统"
            rounded="xl"
            :active="$route.path === '/cultivation'"
          ></v-list-item>
          
          <v-list-item
            to="/settings"
            prepend-icon="mdi-cog"
            title="设置"
            rounded="xl"
            :active="$route.path === '/settings'"
          ></v-list-item>
        </template>
      </v-list>
      
      <template v-slot:append>
        <div class="pa-4 mascot-sidebar-footer">
          <v-btn
            v-if="isAuthenticated"
            block
            color="error"
            variant="outlined"
            prepend-icon="mdi-logout"
            @click="logout"
            class="mb-3 logout-btn mascot-logout-btn"
            rounded="xl"
          >
            退出登录
          </v-btn>
          <div class="text-caption text-center text-medium-emphasis">
            青牛线 v1.0.0
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
import MascotCow from '@/components/MascotCow.vue'

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
/* ========== 吉祥物主题样式 ========== */

/* 应用栏样式 - 吉祥物主题 */
.mascot-app-bar {
  background: linear-gradient(135deg, #8B6914 0%, #8B4513 100%) !important;
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.25) !important;
  border-bottom: 3px solid #5D2E0F;
}

.header-mascot {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.logo-container {
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
}

.logo-container:hover {
  transform: translateY(-2px);
}

.app-title {
  font-weight: 700;
  letter-spacing: 1px;
  font-size: 1.3rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 导航图标动画 */
.nav-icon-animation {
  transition: all 0.3s ease;
  border-radius: 12px;
}

.nav-icon-animation:hover {
  transform: scale(1.15) rotate(15deg);
  background: rgba(255, 255, 255, 0.1);
}

/* 按钮样式 - 吉祥物主题 */
.mascot-header-btn {
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-width: 2px;
  padding: 8px 20px;
}

.login-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 16px rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.15);
}

.register-btn {
  border-width: 3px !important;
  font-weight: 700;
}

.register-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 16px rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.95);
  color: #8B4513 !important;
}

.notification-btn {
  transition: all 0.3s ease;
  border-radius: 12px;
}

.notification-btn:hover {
  transform: rotate(15deg) scale(1.1);
  background: rgba(255, 255, 255, 0.1);
}

.user-avatar {
  border: 3px solid rgba(255, 248, 220, 0.9);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.user-profile-btn {
  transition: all 0.3s ease;
  padding: 4px 16px;
}

.user-profile-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.user-profile-btn:hover .user-avatar {
  transform: scale(1.15);
  border-color: #FFD700;
}

.dropdown-icon {
  transition: transform 0.3s ease;
}

.user-profile-btn:hover .dropdown-icon {
  transform: rotate(180deg);
}

/* 用户下拉菜单 - 吉祥物主题 */
.mascot-dropdown {
  overflow: hidden;
  border-radius: 20px;
  border: 3px solid #8B4513;
  background: linear-gradient(135deg, #FFF8DC 0%, #FFFAED 100%);
}

.mascot-dropdown .menu-item {
  transition: all 0.2s ease;
  border-radius: 12px;
  margin: 6px;
  font-weight: 500;
}

.mascot-dropdown .menu-item:hover {
  background: rgba(139, 69, 19, 0.1);
  transform: translateX(4px);
}

/* 侧边栏样式 - 吉祥物主题 */
.mascot-sidebar {
  border-radius: 0 24px 24px 0;
  border-right: 3px solid #8B4513;
  background: linear-gradient(180deg, #FFFAED 0%, #FFF8DC 100%);
}

.mascot-sidebar-header {
  padding: 20px;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border-radius: 0 0 20px 20px;
  margin: 0 !important;
  border-bottom: 3px solid #8B4513;
}

.mascot-sidebar-header :deep(.v-list-item__prepend) {
  color: #5D2E0F;
}

.mascot-sidebar-header :deep(.v-list-item-title) {
  color: #5D2E0F;
  font-weight: 700;
  font-size: 1.1rem;
}

.mascot-sidebar-header :deep(.v-list-item-subtitle) {
  color: #8B4513;
  font-weight: 600;
}

.mascot-divider-simple {
  display: none;
}

.mascot-sidebar-nav :deep(.v-list-item) {
  margin: 6px 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-left: 4px solid transparent;
  font-weight: 500;
}

.mascot-sidebar-nav :deep(.v-list-item--active) {
  border-left-color: #8B4513;
  background: linear-gradient(90deg, 
    rgba(255, 215, 0, 0.2) 0%, 
    rgba(255, 215, 0, 0.1) 70%,
    rgba(255, 215, 0, 0) 100%
  ) !important;
  color: #5D2E0F;
  font-weight: 700;
}

.mascot-sidebar-nav :deep(.v-list-item:hover) {
  background: rgba(139, 69, 19, 0.08);
  transform: translateX(4px);
}

.mascot-sidebar-nav :deep(.v-list-item__prepend) {
  color: #8B4513;
}

.mascot-sidebar-nav :deep(.v-list-item--active .v-list-item__prepend) {
  color: #5D2E0F;
}

.close-btn {
  opacity: 0.7;
  transition: all 0.3s ease;
  color: #5D2E0F;
}

.close-btn:hover {
  opacity: 1;
  transform: scale(1.2) rotate(90deg);
  background: rgba(93, 46, 15, 0.1);
}

.mascot-sidebar-footer {
  background: linear-gradient(0deg, rgba(255, 215, 0, 0.1) 0%, transparent 100%);
  border-top: 2px solid rgba(139, 69, 19, 0.2);
}

.mascot-logout-btn {
  border-radius: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  border-width: 3px !important;
}

.mascot-logout-btn:hover {
  background-color: rgba(220, 53, 69, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.2);
}
</style>
