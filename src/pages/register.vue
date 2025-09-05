<template>
  <v-container class="fill-height">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="pa-4">
          <v-card-title class="text-center text-h4 pb-4">注册账号</v-card-title>
          
          <v-form ref="form" @submit.prevent="handleRegister">
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
              :rules="[v => !!v || '用户名不能为空', v => v.length >= 3 || '用户名至少需要3个字符']"
              required
              autofocus
              prepend-icon="mdi-account"
            ></v-text-field>
            
            <v-text-field
              v-model="email"
              label="电子邮箱"
              :rules="[
                v => !!v || '电子邮箱不能为空',
                v => /.+@.+\..+/.test(v) || '请输入有效的电子邮箱'
              ]"
              required
              prepend-icon="mdi-email"
              type="email"
            ></v-text-field>
            
            <v-text-field
              v-model="password"
              label="密码"
              :type="showPassword ? 'text' : 'password'"
              :rules="[
                v => !!v || '密码不能为空',
                v => v.length >= 6 || '密码至少需要6个字符'
              ]"
              required
              prepend-icon="mdi-lock"
              :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append="showPassword = !showPassword"
            ></v-text-field>
            
            <v-text-field
              v-model="confirmPassword"
              label="确认密码"
              :type="showConfirmPassword ? 'text' : 'password'"
              :rules="[
                v => !!v || '请确认密码',
                v => v === password || '两次输入的密码不一致'
              ]"
              required
              prepend-icon="mdi-lock-check"
              :append-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append="showConfirmPassword = !showConfirmPassword"
            ></v-text-field>
            
            <v-btn
              type="submit"
              color="primary"
              block
              class="mt-4"
              :loading="authStore.isLoading"
            >
              注册
            </v-btn>
            
            <div class="text-center mt-4">
              <span>已有账号？</span>
              <router-link to="/login" class="text-decoration-none">
                立即登录
              </router-link>
            </div>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 组件状态
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const error = ref('')
const form = ref(null)

// 获取路由和store
const router = useRouter()
const authStore = useAuthStore()

// 处理注册
async function handleRegister() {
  if (!form.value.validate().valid) return
  
  error.value = ''
  
  if (password.value !== confirmPassword.value) {
    error.value = '两次输入的密码不一致'
    return
  }
  
  try {
    await authStore.register(username.value, email.value, password.value)
    
    // 注册成功后自动登录
    await authStore.login(username.value, password.value)
    
    router.replace('/')
  } catch (err) {
    error.value = err.response?.data?.detail || '注册失败，请重试'
    console.error('注册失败：', err)
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
