<template>
  <div class="resume-container">
    <!-- 顶部个人信息区域 -->
    <v-container class="hero-section py-12">
      <v-row align="center" justify="center">
        <v-col cols="12" md="10" lg="8" class="text-center">
          <v-avatar size="150" class="mb-5">
            <v-img src="https://lyle-mac.oss-cn-hangzhou.aliyuncs.com/blog/20250921121120.png" alt="个人头像"></v-img>
          </v-avatar>
          <div class="text-center w-100">
            <h1 class="text-h2 font-weight-bold gradient-text mb-4">XXX</h1>
          </div>
          <p class="text-h6 text-medium-emphasis mb-5">
            后端开发工程师
          </p>
          <div class="contact-info mb-8">
            <v-chip class="ma-2" prepend-icon="mdi-phone">13235295320</v-chip>
            <v-chip class="ma-2" prepend-icon="mdi-email">zhang_yolo_2004@163.com</v-chip>
          </div>
          <v-btn
            color="primary"
            size="large"
            rounded="pill"
            :to="isLoggedIn ? '/todos' : '/login'"
            elevation="2"
            class="px-8 py-2 text-subtitle-1"
          >
            {{ isLoggedIn ? '进入个人管理系统' : '登录管理系统' }}
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
    
    <!-- 教育背景部分 -->
    <v-container class="education-section py-10">
      <v-row>
        <v-col cols="12">
          <h2 class="section-title text-h4 font-weight-bold mb-6">
            <v-icon color="primary" class="mr-2">mdi-school</v-icon>
            教育背景
          </h2>
          <v-card class="resume-card" elevation="1">
            <v-card-text>
              <div class="d-flex flex-column flex-md-row justify-space-between align-center mb-3">
                <h3 class="text-h5 font-weight-bold">郑州轻工业大学</h3>
                <span class="text-caption">2021 - 2025</span>
              </div>
              <p class="text-subtitle-1 font-weight-medium text-primary mb-2">人工智能专业 本科</p>
              <p class="text-body-1 mb-3">计算机专业省内排名第一</p>
              <v-chip size="small" color="primary" variant="outlined" class="mr-2">绩点排名：专业前 5%</v-chip>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    
    <!-- 工作经历部分 -->
    <div class="experience-section py-10">
      <v-container>
        <v-row>
          <v-col cols="12">
            <h2 class="section-title text-h4 font-weight-bold mb-6">
              <v-icon color="primary" class="mr-2">mdi-briefcase</v-icon>
              工作经历
            </h2>
            
            <!-- 工作经历卡片1 -->
            <v-card class="resume-card mb-8" elevation="1">
              <v-card-text>
                <div class="d-flex flex-column flex-md-row justify-space-between align-center mb-3">
                  <h3 class="text-h5 font-weight-bold">广州嘉为科技有限公司</h3>
                  <span class="text-caption">2025.7 ~ 至今</span>
                </div>
                <p class="text-subtitle-1 font-weight-medium text-primary mb-2">AiOps 研发组 | 后端开发</p>
                
                <div class="project-section mt-4">
                  <p class="text-h6 font-weight-bold">核心项目：IT 服务管理中心・鲸脉 (ITSM)</p>
                  <p class="text-body-1 mb-2">数字化服务管理 SaaS 平台</p>
                  <p class="text-body-2 mb-4">面向企业级 IT 运维场景，构建集服务台、服务目录、SLA 服务级别、流程管理、报表管理、值班管理于一体的数字化服务管理平台。采用 "3.x 插件 + 4.x App" 双模式支撑定制化需求，技术栈为后端 Django + 前端 Vue，服务于企业 IT 运维效率提升与流程规范化。</p>
                  
                  <p class="text-subtitle-2 font-weight-bold">个人职责：</p>
                  <ul class="responsibility-list pl-4">
                    <li><strong>缺陷修复与系统稳定：</strong>主导 3.x 版本核心功能缺陷排查与修复，累计处理工单流转异常、SLA 计时偏差等关键缺陷 20+，通过 Django Debug Toolbar 定位 ORM 查询逻辑、插件依赖冲突等根因，修复后系统故障响应率降低 40%，用户投诉量减少 60%。</li>
                    <li><strong>需求开发与功能落地：</strong>参与 4.x 版本定制化功能开发，基于 Django REST Framework 设计实现报表管理模块 "跨部门工单统计" 接口，定义数据模型与序列化逻辑，配合 Vue 前端完成数据可视化展示；开发流程管理分支审批功能，通过 Django 信号机制实现节点触发逻辑，满足 10+ 企业定制化需求。</li>
                    <li><strong>技术支持与效率提升：</strong>面向一线交付团队提供技术支撑，梳理插件部署、流程配置等高频问题 30+，输出《3.x 插件配置指南》《流程异常排查手册》，将平均问题解决时间从 2 小时压缩至 30 分钟，团队交付效率提升 35%。</li>
                  </ul>
                </div>
              </v-card-text>
            </v-card>
            
            <!-- 工作经历卡片2 -->
            <v-card class="resume-card" elevation="1">
              <v-card-text>
                <div class="d-flex flex-column flex-md-row justify-space-between align-center mb-3">
                  <h3 class="text-h5 font-weight-bold">华科信安科技有限公司</h3>
                  <span class="text-caption">2024.10 ~ 2024.11</span>
                </div>
                <p class="text-subtitle-1 font-weight-medium text-primary mb-2">研发部 | 后端开发实习生</p>
                
                <div class="project-section mt-4">
                  <p class="text-h6 font-weight-bold">核心项目：等保测评 AI 工具箱</p>
                  <p class="text-body-2 mb-4">聚焦等保测评业务全流程，整合项目管理、客户管理、知识库等功能模块，引入 Qwen 大模型实现 AI 辅助测评，通过自动化文档生成、智能合规分析等能力，提升测评工作效率与准确性。</p>
                  
                  <p class="text-subtitle-2 font-weight-bold">个人职责：</p>
                  <ul class="responsibility-list pl-4">
                    <li><strong>接口开发与数据交互：</strong>基于 Django 设计并实现客户管理、项目进度跟踪等 6 个核心页面的后端接口，采用 MySQL 优化查询语句，接口响应时间均控制在 200ms 内，支撑前端 Vue 页面高效数据渲染。</li>
                    <li><strong>文档自动化与模型部署：</strong>负责测评文档自动生成功能开发，通过 Python 处理文档模板与数据填充逻辑，实现 Word 格式测评报告一键导出，减少人工录入工作量 80%；使用 vLLM 部署 Qwen 大模型，配置模型缓存策略，模型调用响应速度提升 50%。</li>
                    <li><strong>系统测试与质量保障：</strong>执行功能测试与边界场景验证，设计测试用例 50+，发现并反馈数据校验缺失、权限控制漏洞等问题 15 处，推动系统上线前缺陷修复率达 100%。</li>
                  </ul>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>
    
    <!-- 技能部分 -->
    <v-container class="skills-section py-10">
      <v-row>
        <v-col cols="12">
          <h2 class="section-title text-h4 font-weight-bold mb-6">
            <v-icon color="primary" class="mr-2">mdi-lightbulb</v-icon>
            技术能力
          </h2>
          <v-card class="resume-card" elevation="1">
            <v-card-text>
              <v-row>
                <v-col cols="12" md="4" class="skill-category">
                  <h3 class="text-h6 font-weight-bold mb-4">后端技术</h3>
                  <div class="skill-chips">
                    <v-chip class="ma-1" color="primary" variant="tonal">Python</v-chip>
                    <v-chip class="ma-1" color="primary" variant="tonal">Django</v-chip>
                    <v-chip class="ma-1" color="primary" variant="tonal">Django REST Framework</v-chip>
                    <v-chip class="ma-1" color="primary" variant="tonal">MySQL</v-chip>
                    <v-chip class="ma-1" color="primary" variant="tonal">Redis</v-chip>
                  </div>
                </v-col>
                
                <v-col cols="12" md="4" class="skill-category">
                  <h3 class="text-h6 font-weight-bold mb-4">前端技术</h3>
                  <div class="skill-chips">
                    <v-chip class="ma-1" color="secondary" variant="tonal">Vue.js</v-chip>
                    <v-chip class="ma-1" color="secondary" variant="tonal">JavaScript</v-chip>
                    <v-chip class="ma-1" color="secondary" variant="tonal">HTML/CSS</v-chip>
                    <v-chip class="ma-1" color="secondary" variant="tonal">Vuetify</v-chip>
                  </div>
                </v-col>
                
                <v-col cols="12" md="4" class="skill-category">
                  <h3 class="text-h6 font-weight-bold mb-4">工具与其他</h3>
                  <div class="skill-chips">
                    <v-chip class="ma-1" color="info" variant="tonal">Git</v-chip>
                    <v-chip class="ma-1" color="info" variant="tonal">Docker</v-chip>
                    <v-chip class="ma-1" color="info" variant="tonal">Linux</v-chip>
                    <v-chip class="ma-1" color="info" variant="tonal">RESTful API</v-chip>
                    <v-chip class="ma-1" color="info" variant="tonal">AI模型部署</v-chip>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    
    <!-- 个性化欢迎卡片 -->
    <v-container v-if="isLoggedIn" class="welcome-section py-8">
      <v-row justify="center">
        <v-col cols="12" md="8">
          <v-card class="welcome-card" rounded="xl" elevation="0">
            <v-card-text class="d-flex align-center">
              <div>
                <h3 class="text-h5 font-weight-bold">欢迎回来，{{ username }}</h3>
                <p class="text-body-1 mt-2">您可以继续使用个人管理系统，提高工作效率。</p>
              </div>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                to="/todos"
                rounded="pill"
                class="px-6"
              >
                进入系统
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
          <h2 class="text-h4 font-weight-bold mb-6">欢迎访问我的个人网站</h2>
          <p class="text-body-1 mb-8">
            这是我的个人网站，同时也有一个高效的个人管理系统
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
/* 共用样式 */
.resume-container {
  background-color: #f8f9fa;
  min-height: 100vh;
  overflow-x: hidden;
}

.section-title {
  color: #333;
  position: relative;
  padding-bottom: 15px;
  margin-bottom: 30px;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 4px;
  background: var(--v-primary-base, #1976d2);
  border-radius: 2px;
}

.resume-card {
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05) !important;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.resume-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
}

/* 顶部英雄区域 */
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
  margin: 0 auto;
  text-align: center;
  width: auto;
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

/* 工作经历部分 */
.experience-section {
  background-color: #fff;
  position: relative;
  z-index: 0;
}

.project-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.responsibility-list li {
  margin-bottom: 12px;
  position: relative;
  line-height: 1.6;
}

/* 技能部分 */
.skills-section {
  position: relative;
  z-index: 0;
}

.skill-category {
  margin-bottom: 20px;
}

.skill-chips {
  display: flex;
  flex-wrap: wrap;
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
