<template>
  <v-app>
    <!-- 应用栏 -->
    <v-app-bar
      :elevation="2"
      color="primary"
    >
      <template v-slot:prepend>
        <v-app-bar-nav-icon 
          variant="text"
          @click.stop="drawer = !drawer" 
          color="white"
        ></v-app-bar-nav-icon>
      </template>
      
      <v-app-bar-title>
        <router-link to="/" class="text-decoration-none text-white">
          内容中心
        </router-link>
      </v-app-bar-title>

      <v-spacer></v-spacer>
      
      <!-- 未登录时显示 -->
      <template v-if="!isAuthenticated">
        <v-btn variant="text" to="/login" color="white">
          <v-icon start>mdi-login</v-icon>
          登录
        </v-btn>
        <v-btn variant="outlined" to="/register" class="ml-2" color="white">
          <v-icon start>mdi-account-plus</v-icon>
          注册
        </v-btn>
      </template>
      
      <!-- 已登录时显示 -->
      <template v-else>
        <v-btn icon="mdi-bell" variant="text" color="white" class="mr-2">
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
              class="ml-2"
              color="white"
            >
              <v-avatar size="32" color="surface-variant" class="mr-2">
                <v-icon icon="mdi-account"></v-icon>
              </v-avatar>
              {{ user?.username || '用户' }}
              <v-icon right>mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-list width="200" elevation="3">
            <v-list-item to="/settings" prepend-icon="mdi-cog">
              <v-list-item-title>设置</v-list-item-title>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item @click="logout" prepend-icon="mdi-logout">
              <v-list-item-title>退出登录</v-list-item-title>
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
    >
      <v-list-item
        prepend-icon="mdi-view-dashboard"
        title="内容中心"
        subtitle="Content Hub"
        class="my-4"
      ></v-list-item>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item
          to="/"
          prepend-icon="mdi-home"
          title="首页"
          rounded="lg"
          :active="$route.path === '/'"
        ></v-list-item>
        
        <v-list-item
          to="/autops"
          prepend-icon="mdi-file-document-edit"
          title="zzuli假条生成"
          rounded="lg"
          :active="$route.path === '/autops'"
        ></v-list-item>
        
        <template v-if="isAuthenticated">
          <v-list-item
            to="/todos"
            prepend-icon="mdi-format-list-checks"
            title="待办事项"
            rounded="lg"
            :active="$route.path === '/todos'"
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
            class="mb-2"
          >
            退出登录
          </v-btn>
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
