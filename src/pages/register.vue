<template>
  <v-container class="fill-height">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="5">
        <v-card class="pa-4" elevation="3" rounded="lg">
          <v-card-title class="text-center text-h4 font-weight-medium pb-4">
            <v-icon icon="mdi-account-plus" size="large" color="primary" class="mr-2"></v-icon>
            注册账号
          </v-card-title>
          
          <v-form ref="form" @submit.prevent="handleRegister">
            <v-alert
              v-if="error"
              type="error"
              closable
              class="mb-4"
              variant="tonal"
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
              variant="outlined"
            ></v-text-field>
            
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="firstName"
                  label="姓"
                  :rules="[v => !!v || '姓不能为空']"
                  required
                  prepend-icon="mdi-card-account-details-outline"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="lastName"
                  label="名"
                  :rules="[v => !!v || '名不能为空']"
                  required
                  variant="outlined"
                ></v-text-field>
              </v-col>
            </v-row>
            
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
              variant="outlined"
            ></v-text-field>
            
            <v-row>
              <v-col cols="6">
                <v-select
                  v-model="gender"
                  label="性别"
                  :items="[
                    { title: '男', value: 'M' },
                    { title: '女', value: 'F' },
                    { title: '其他', value: 'O' }
                  ]"
                  item-title="title"
                  item-value="value"
                  required
                  :rules="[v => !!v || '请选择性别']"
                  prepend-icon="mdi-gender-male-female"
                  variant="outlined"
                ></v-select>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="phone"
                  label="手机号码"
                  :rules="[
                    v => !!v || '手机号码不能为空',
                    v => /^1[3-9]\d{9}$/.test(v) || '请输入有效的手机号码'
                  ]"
                  required
                  prepend-icon="mdi-phone"
                  variant="outlined"
                ></v-text-field>
              </v-col>
            </v-row>
            
            <v-text-field
              v-model="password"
              label="密码"
              :type="showPassword ? 'text' : 'password'"
              :rules="passwordRules"
              required
              prepend-icon="mdi-lock"
              :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append="showPassword = !showPassword"
              variant="outlined"
              hint="密码需要包含大小写字母、数字和特殊字符"
              persistent-hint
            ></v-text-field>
            
            <v-text-field
              v-model="confirmPassword"
              label="确认密码"
              :type="showConfirmPassword ? 'text' : 'password'"
              :rules="confirmPasswordRules"
              required
              prepend-icon="mdi-lock-check"
              :append-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append="showConfirmPassword = !showConfirmPassword"
              variant="outlined"
            ></v-text-field>
            
            <v-alert
              v-if="passwordError"
              type="warning"
              variant="outlined"
              icon="mdi-shield-alert"
              density="compact"
              class="my-3"
            >
              {{ passwordError }}
            </v-alert>
            
            <v-checkbox
              v-model="agreeTerms"
              label="我已阅读并同意服务条款和隐私政策"
              :rules="[v => !!v || '必须同意服务条款才能注册']"
              required
            ></v-checkbox>
            
            <v-btn
              type="submit"
              color="primary"
              block
              class="mt-4"
              :loading="authStore.isLoading"
              :disabled="!agreeTerms"
              elevation="2"
              size="large"
            >
              <v-icon left class="mr-2">mdi-account-plus</v-icon>
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
const firstName = ref('')
const lastName = ref('')
const gender = ref('M')
const phone = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const error = ref('')
const passwordError = ref('')
const agreeTerms = ref(false)
const form = ref(null)

// 密码验证规则
const passwordRules = [
  v => !!v || '密码不能为空',
  v => v.length >= 8 || '密码至少需要8个字符',
  v => {
    // 验证密码是否包含大小写字母、数字和特殊字符
    const hasUpperCase = /[A-Z]/.test(v);
    const hasLowerCase = /[a-z]/.test(v);
    const hasDigit = /\d/.test(v);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(v);
    
    return (hasUpperCase && hasLowerCase && hasDigit && hasSpecial) || 
           '密码需包含大小写字母、数字和特殊字符';
  }
]

// 确认密码验证规则
const confirmPasswordRules = [
  v => !!v || '请确认密码',
  v => v === password.value || '两次输入的密码不一致'
]

// 获取路由和store
const router = useRouter()
const authStore = useAuthStore()

// 密码强度检查
function checkPasswordStrength(pwd) {
  let strength = 0;
  if (pwd.length >= 8) strength += 1;
  if (/[A-Z]/.test(pwd)) strength += 1;
  if (/[a-z]/.test(pwd)) strength += 1;
  if (/\d/.test(pwd)) strength += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength += 1;
  return strength;
}

// 处理注册
async function handleRegister() {
  error.value = '';
  passwordError.value = '';
  
  // 表单验证
  const { valid } = await form.value.validate();
  if (!valid) return;
  
  if (password.value !== confirmPassword.value) {
    passwordError.value = '两次输入的密码不一致';
    return;
  }
  
  // 检查密码强度
  const strength = checkPasswordStrength(password.value);
  if (strength < 4) {
    passwordError.value = '密码强度不足，请确保包含大小写字母、数字和特殊字符';
    return;
  }
  
  try {
    // 准备注册数据
    const registerData = {
      username: username.value,
      email: email.value,
      password: password.value,
      password2: confirmPassword.value,
      first_name: firstName.value,
      last_name: lastName.value,
      gender: gender.value,
      phone: phone.value
    };
    
    console.log('注册数据:', registerData);
    
    // 调用注册API
    await authStore.register(registerData);
    
    // 注册成功后自动登录
    await authStore.login(username.value, password.value);
    
    router.replace('/');
  } catch (err) {
    console.error('注册失败:', err);
    
    if (err.response?.data) {
      // 处理详细的错误信息
      const errorData = err.response.data;
      
      if (typeof errorData === 'object') {
        // 如果错误是对象形式，提取所有字段的错误
        const errorMessages = [];
        
        for (const field in errorData) {
          if (Array.isArray(errorData[field])) {
            errorMessages.push(`${field}: ${errorData[field].join(', ')}`);
          } else if (typeof errorData[field] === 'string') {
            errorMessages.push(`${field}: ${errorData[field]}`);
          }
        }
        
        if (errorMessages.length > 0) {
          error.value = errorMessages.join('\n');
        } else {
          error.value = '注册失败，请检查填写的信息';
        }
      } else {
        error.value = err.response.data.detail || '注册失败，请重试';
      }
    } else {
      error.value = '注册失败，请重试';
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
