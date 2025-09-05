<template>
  <v-container class="fill-height">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="pa-4">
          <v-card-title class="text-center text-h4 pb-4">登录</v-card-title>
          
          <v-form ref="form">
            <v-alert
              v-if="error"
              type="error"
              closable
              class="mb-4"
            >
              {{ error }}
            </v-alert>
            
            <v-text-field
              v-model="username"
              label="用户名"
              :rules="[v => !!v || '用户名不能为空']"
              required
              autofocus
              prepend-icon="mdi-account"
            ></v-text-field>
            
            <v-text-field
              v-model="password"
              label="密码"
              :type="showPassword ? 'text' : 'password'"
              :rules="[v => !!v || '密码不能为空']"
              required
              prepend-icon="mdi-lock"
              :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append="showPassword = !showPassword"
              @keyup.enter="handleLogin"
            ></v-text-field>
            
            <v-btn
              @click="handleLogin"
              color="primary"
              block
              class="mt-4"
              :loading="authStore.isLoading"
            >
              登录
            </v-btn>
            
            <div class="text-center mt-4">
              <span>还没有账号？</span>
              <router-link to="/register" class="text-decoration-none">
                立即注册
              </router-link>
            </div>
            
            <v-btn
              @click="testAxios"
              variant="text"
              block
              class="mt-4"
            >
              测试API连接
            </v-btn>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { AuthAPI } from '@/api/auth'
import { eventBus } from '@/utils/eventBus'

// 组件状态
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const form = ref(null)

// 获取路由和store
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 处理登录
async function handleLogin() {
  console.log('提交登录表单 - 使用AuthStore')
  
  // 直接跳过验证，尝试发送请求
  error.value = ''
  console.log('开始登录:', { username: username.value })
  
  try {
    // 使用store进行登录，store会内部调用AuthAPI
    await authStore.login(username.value, password.value)
    console.log('登录成功，已获取用户信息:', authStore.getUser)
    
    // 登录成功后跳转
    const redirectPath = route.query.redirect || '/'
    console.log('重定向到:', redirectPath)
    
    // 检查路由是否正常初始化
    console.log('路由器实例:', router)
    console.log('当前路由:', route.path)
    console.log('路由方法:', Object.keys(router).filter(k => typeof router[k] === 'function'))
    
    // 使用多种方法尝试跳转
    console.log('尝试跳转到:', redirectPath)
    console.log('当前路径:', window.location.pathname)
    console.log('当前路由路径:', router.currentRoute.value.path)
    
    // 通过事件总线通知登录成功
    eventBus.emit('auth:login-success', {
      user: authStore.getUser,
      redirectPath
    })
    
    // 方法1: 使用 router.push
    try {
      console.log('方法1: 使用router.push')
      router.push({
        path: redirectPath
      })
    } catch (err) {
      console.error('方法1失败:', err)
    }
    
    // 方法2: 使用 router.replace
    setTimeout(() => {
      if (router.currentRoute.value.path !== redirectPath) {
        try {
          console.log('方法2: 使用router.replace')
          router.replace(redirectPath)
        } catch (err) {
          console.error('方法2失败:', err)
        }
      }
    }, 500)
    
    // 方法3: 使用 router.go + router.push
    setTimeout(() => {
      if (router.currentRoute.value.path !== redirectPath) {
        try {
          console.log('方法3: router.go(0)然后push')
          router.go(0)
          setTimeout(() => router.push(redirectPath), 100)
        } catch (err) {
          console.error('方法3失败:', err)
        }
      }
    }, 1000)
    
    // 方法4: 最后使用window.location (备用方案)
    setTimeout(() => {
      if (window.location.pathname !== redirectPath) {
        console.log('方法4: 使用window.location.href')
        window.location.href = redirectPath
      }
    }, 1500)
  } catch (err) {
    console.error('登录页面捕获到错误:', err)
    error.value = err.response?.data?.detail || '登录失败，请检查用户名和密码'
    
    if (err.response) {
      console.error('响应状态:', err.response.status)
      console.error('响应数据:', err.response.data)
    }
    
    // 清除可能部分保存的令牌
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }
}

// 测试Axios连接
async function testAxios() {
  try {
    error.value = '正在测试API连接...'
    console.log('测试AuthAPI服务')
    
    // 测试使用AuthAPI服务
    const data = await AuthAPI.login(
      username.value || 'test',
      password.value || 'test'
    )
    
    console.log('测试请求成功:', data)
    error.value = `测试请求成功: ${JSON.stringify(data)}`
  } catch (err) {
    console.error('测试请求失败:', err)
    error.value = `测试请求失败: ${err.message}`
    
    // 显示详细错误信息
    if (err.response) {
      error.value += `\n状态码: ${err.response.status}\n数据: ${JSON.stringify(err.response.data)}`
    }
  }
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
