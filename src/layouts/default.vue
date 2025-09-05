<template>
  <v-app>
    <!-- 应用栏 -->
    <v-app-bar
      :elevation="1"
    >
      <v-app-bar-title>
        <router-link to="/" class="text-decoration-none text-black">
          内容管理系统
        </router-link>
      </v-app-bar-title>

      <v-spacer></v-spacer>
      
      <!-- 未登录时显示 -->
      <template v-if="!isAuthenticated">
        <v-btn variant="text" to="/login">
          登录
        </v-btn>
        <v-btn variant="outlined" to="/register" class="ml-2">
          注册
        </v-btn>
      </template>
      
      <!-- 已登录时显示 -->
      <template v-else>
        <v-btn variant="text" to="/todos">
          待办事项
        </v-btn>
        
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              variant="text"
              v-bind="props"
              class="ml-2"
            >
              {{ user?.username || '用户' }}
              <v-icon right>mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="logout">
              <v-list-item-title>
                <v-icon size="small" class="mr-2">mdi-logout</v-icon>
                退出登录
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </v-app-bar>

    <!-- 主要内容区域 -->
    <v-main>
      <router-view />
    </v-main>
    
    <!-- 页脚 -->
    <AppFooter />
  </v-app>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

// 计算属性
const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.getUser)

// 方法
function logout() {
  authStore.logout()
  router.push('/login')
}
</script>
