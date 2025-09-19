<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card class="pa-4">
          <v-card-title class="text-h4 mb-4">欢迎使用个人待办系统</v-card-title>
          <v-card-text>
            <p class="text-body-1">
              提效、预计接入WIKI。构造个人知识库。实现AI助理功能。
            </p>
            <p class="text-body-1 mt-4">
              {{ isLoggedIn ? `欢迎回来，${username}！` : '请登录以使用所有功能。' }}
            </p>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <template v-if="isLoggedIn">
              <v-btn color="primary" to="/todos">
                查看待办事项
              </v-btn>
              <v-btn color="error" variant="text" @click="logout" class="ml-2">
                退出登录
              </v-btn>
            </template>
            <template v-else>
              <v-btn color="primary" to="/login">
                登录
              </v-btn>
              <v-btn color="secondary" variant="text" to="/register" class="ml-2">
                注册
              </v-btn>
            </template>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    
    <v-row class="mt-6">
      <v-col cols="12" md="4">
        <v-card class="pa-4 h-100">
          <v-card-title class="text-h6"></v-card-title>
          <v-card-text>
            
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card class="pa-4 h-100">
          <v-card-title class="text-h6"></v-card-title>
          <v-card-text>
            
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card class="pa-4 h-100">
          <v-card-title class="text-h6"></v-card-title>
          <v-card-text>
            
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

// 计算属性
const isLoggedIn = computed(() => {
  const result = authStore.isAuthenticated
  console.log('主页 - 用户是否已登录:', result)
  return result
})

const username = computed(() => {
  const name = authStore.user?.username || ''
  console.log('主页 - 用户名:', name)
  return name
})

// 在组件挂载时检查认证状态
onMounted(() => {
  // 检查localStorage中的令牌
  const accessToken = localStorage.getItem('accessToken')
  const refreshToken = localStorage.getItem('refreshToken')
  const user = localStorage.getItem('user')
  
  console.log('主页 - 检查本地存储:')
  console.log('- accessToken:', accessToken ? accessToken.substring(0, 20) + '...' : 'undefined')
  console.log('- refreshToken:', refreshToken ? refreshToken.substring(0, 20) + '...' : 'undefined')
  console.log('- user:', user)
  
  // 如果有令牌但authStore中没有用户信息，尝试获取
  if (accessToken && !authStore.user) {
    console.log('主页 - 有令牌但没有用户信息，尝试获取')
    authStore.checkAuthStatus()
  }
})

// 方法
function logout() {
  authStore.logout()
  router.push('/login')
}
</script>

<route>
{
  meta: {
    requiresAuth: false,
    layout: 'default'
  }
}
</route>
