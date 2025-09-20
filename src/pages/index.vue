<template>
  <div class="homepage-container">
    <!-- 顶部英雄区域 -->
    <v-container class="hero-section py-12">
      <v-row align="center" justify="center">
        <v-col cols="12" md="10" lg="8" class="text-center">
          <h1 class="text-h2 font-weight-bold gradient-text mb-6">专注成就卓越</h1>
          <p class="text-h6 text-medium-emphasis mb-8">
            简洁、高效的待办系统，帮助你将注意力集中在<span class="text-primary font-weight-bold">当下最重要的一件事</span>上
          </p>
          <v-btn
            color="primary"
            size="x-large"
            rounded="pill"
            :to="isLoggedIn ? '/todos' : '/login'"
            elevation="4"
            class="px-8 py-3 text-subtitle-1"
          >
            {{ isLoggedIn ? '开始专注' : '立即开始' }}
            <v-icon end icon="mdi-arrow-right" class="ml-2"></v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
    
    <!-- 波浪分隔符 -->
    <div class="wave-divider">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" preserveAspectRatio="none">
        <path class="wave-path" d="M0,0 C240,95 480,95 720,45 C960,-5 1200,-5 1440,45 L1440,100 L0,100 Z"></path>
      </svg>
    </div>
    
    <!-- 特性部分 -->
    <v-container class="features-section py-12">
      <v-row class="mb-10">
        <v-col cols="12" class="text-center">
          <h2 class="text-h4 font-weight-bold mb-2">为什么选择单任务专注</h2>
          <p class="text-subtitle-1 text-medium-emphasis">科学研究表明，专注于单一任务能提高生产力和工作质量</p>
        </v-col>
      </v-row>
      
      <v-row>
        <v-col cols="12" md="4">
          <v-card class="feature-card h-100" rounded="lg" elevation="0">
            <div class="feature-icon-container">
              <v-icon icon="mdi-target" size="x-large" color="primary"></v-icon>
            </div>
            <v-card-title class="text-h5 font-weight-bold">聚焦单一目标</v-card-title>
            <v-card-text class="text-body-1">
              将注意力集中在一个任务上，避免分心和切换成本，提高完成效率和质量。
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" md="4">
          <v-card class="feature-card h-100" rounded="lg" elevation="0">
            <div class="feature-icon-container">
              <v-icon icon="mdi-brain" size="x-large" color="primary"></v-icon>
            </div>
            <v-card-title class="text-h5 font-weight-bold">减少认知负荷</v-card-title>
            <v-card-text class="text-body-1">
              人类大脑在同时处理多任务时效率会大幅下降，单任务专注能减轻大脑负担。
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" md="4">
          <v-card class="feature-card h-100" rounded="lg" elevation="0">
            <div class="feature-icon-container">
              <v-icon icon="mdi-chart-line" size="x-large" color="primary"></v-icon>
            </div>
            <v-card-title class="text-h5 font-weight-bold">提升完成质量</v-card-title>
            <v-card-text class="text-body-1">
              全神贯注于单一任务，能够深入思考并带来更高质量的工作成果和创意灵感。
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    
    <!-- 主要功能展示 -->
    <div class="highlight-section py-12 mt-6">
      <v-container>
        <v-row align="center">
          <v-col cols="12" md="6">
            <div class="highlight-content">
              <span class="overline text-primary font-weight-bold">核心功能</span>
            <h2 class="text-h4 font-weight-bold my-4">标记"正在处理"的任务</h2>
            <p class="text-body-1 mb-6">
              将一个任务标记为"正在处理"状态，系统会自动突出显示该任务，并使其他任务视觉上淡化，帮助你将注意力集中在当前最重要的任务上。
            </p>
            <v-btn 
              color="primary" 
              variant="outlined" 
              rounded="pill"
              class="px-6"
              :to="isLoggedIn ? '/todos' : '/login'"
            >
              了解更多
            </v-btn>
          </div>
        </v-col>
        <v-col cols="12" md="6">
          <div class="highlight-image-container">
            <v-img
              src="https://framerusercontent.com/images/qJeaFhqaK0Nxj8EOVgdJ9Idkcs.png"
              alt="专注一件事示例"
              class="highlight-image"
              cover
            ></v-img>
            <div class="image-decoration"></div>
          </div>
        </v-col>
      </v-row>
      </v-container>
    </div>
    
    <!-- 个性化欢迎卡片 -->
    <v-container v-if="isLoggedIn" class="welcome-section py-8">
      <v-row justify="center">
        <v-col cols="12" md="8">
          <v-card class="welcome-card" rounded="xl" elevation="0">
            <v-card-text class="d-flex align-center">
              <div>
                <h3 class="text-h5 font-weight-bold">欢迎回来，{{ username }}</h3>
                <p class="text-body-1 mt-2">继续专注于你的任务，提高生产力和工作质量。</p>
              </div>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                to="/todos"
                rounded="pill"
                class="px-6"
              >
                查看待办
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    
    <!-- 行动号召 -->
    <v-container v-else class="cta-section py-12 mt-6">
      <v-row justify="center">
        <v-col cols="12" md="8" class="text-center">
          <h2 class="text-h4 font-weight-bold mb-6">开始专注之旅</h2>
          <p class="text-body-1 mb-8">
            立即注册，体验一次只专注于一件事情的高效工作方式
          </p>
          <div class="d-flex justify-center">
            <v-btn
              color="primary"
              size="large"
              rounded="pill"
              to="/login"
              class="px-8 mr-4"
            >
              登录
            </v-btn>
            <v-btn
              variant="outlined"
              color="primary"
              size="large"
              rounded="pill"
              to="/register"
              class="px-8"
            >
              注册
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
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

<style scoped>
.homepage-container {
  overflow-x: hidden;
}

/* 英雄区域样式 */
.hero-section {
  padding-top: 80px;
  padding-bottom: 120px;
  position: relative;
  background: linear-gradient(180deg, rgba(245, 247, 250, 0.85) 0%, rgba(255, 255, 255, 1) 100%);
  overflow: hidden;
}

.gradient-text {
  background: linear-gradient(45deg, var(--v-primary-base, #1976d2), #42b883);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

/* 波浪分隔符 */
.wave-divider {
  height: 100px;
  width: 100%;
  overflow: hidden;
  line-height: 0;
  margin-top: -100px;
  position: relative;
  z-index: 1;
}

.wave-path {
  fill: white;
}

/* 特性卡片样式 */
.features-section {
  background-color: white;
  position: relative;
  z-index: 2;
}

.feature-card {
  padding: 32px 24px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08) !important;
}

.feature-icon-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background-color: rgba(var(--v-theme-primary), 0.1);
  margin-bottom: 16px;
}

/* 主要功能展示 */
.highlight-section {
  background-color: #f8fafc;
  border-radius: 24px;
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
}

.highlight-content {
  padding: 24px;
}

.highlight-image-container {
  position: relative;
  padding: 24px;
}

.highlight-image {
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
  position: relative;
  z-index: 2;
  overflow: hidden;
}

.image-decoration {
  position: absolute;
  top: 0;
  right: 0;
  width: 180px;
  height: 180px;
  background: linear-gradient(45deg, var(--v-primary-base, #1976d2), #42b883);
  border-radius: 24px;
  transform: translate(20%, -20%);
  z-index: 1;
  opacity: 0.6;
}

/* 个性化欢迎卡片 */
.welcome-card {
  background: linear-gradient(45deg, rgba(var(--v-theme-primary), 0.07), rgba(66, 184, 131, 0.07));
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
}

/* 行动号召区域 */
.cta-section {
  background-color: white;
  padding: 80px 0;
}

/* 苹果风格设计元素 */
:deep(.v-btn) {
  letter-spacing: 0.5px;
  font-weight: 500;
}

:deep(.v-card) {
  border-radius: 16px;
}

@media (max-width: 960px) {
  .hero-section {
    padding-top: 40px;
    padding-bottom: 80px;
  }
  
  .highlight-image-container {
    margin-top: 40px;
  }
}
</style>

<route>
{
  meta: {
    requiresAuth: false,
    layout: 'default'
  }
}
</route>
