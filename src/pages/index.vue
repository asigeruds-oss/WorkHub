<template>
  <div class="home-container">
    <!-- 装饰性背景 -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <!-- 顶部欢迎区域 -->
    <v-container class="hero-section py-12">
      <v-row align="center" justify="center">
        <v-col cols="12" md="10" lg="8" class="text-center">
          <div class="avatar-wrapper mb-6">
            <v-avatar size="140" class="elevation-8 avatar-main">
              <v-img src="https://lyle-mac.oss-cn-hangzhou.aliyuncs.com/blog/20250921121120.png" alt="个人头像"></v-img>
            </v-avatar>
            <div class="avatar-ring"></div>
          </div>
          <h1 class="text-h3 font-weight-bold gradient-text mb-4 title-animate">个人内容中心</h1>
          <p class="text-h6 mb-8 subtitle-text">
            <span class="feature-tag">📚 知识管理</span>
            <span class="separator">·</span>
            <span class="feature-tag">✅ 任务追踪</span>
            <span class="separator">·</span>
            <span class="feature-tag">🌱 个人成长</span>
            <span class="separator">·</span>
            <span class="feature-tag">💬 想法记录</span>
          </p>
          <v-btn
            v-if="!isLoggedIn"
            color="primary"
            size="x-large"
            rounded="pill"
            to="/login"
            elevation="8"
            class="cta-button px-10 py-3"
          >
            <v-icon start size="24">mdi-rocket-launch</v-icon>
            立即开始探索
            <v-icon end size="24">mdi-arrow-right</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>

    <!-- 已登录用户的仪表板 -->
    <v-container v-if="isLoggedIn" class="dashboard-section py-8">
      <v-row>
        <v-col cols="12">
          <div class="welcome-banner pa-6 mb-6">
            <div class="d-flex align-center">
              <v-icon size="48" color="primary" class="mr-4">mdi-emoticon-excited-outline</v-icon>
              <div>
                <h2 class="text-h4 font-weight-bold mb-1">
                  欢迎回来，{{ username }}！
                </h2>
                <p class="text-body-1 text-medium-emphasis mb-0">
                  今天也要元气满满地开始吧 ✨
                </p>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- 快速统计卡片 -->
      <v-row>
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card stat-card-primary" elevation="4" rounded="xl">
            <v-card-text class="pa-5">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <p class="text-caption text-medium-emphasis mb-2 stat-label">待办任务</p>
                  <h3 class="text-h3 font-weight-bold stat-number">{{ stats.todos }}</h3>
                  <p class="text-caption mt-1 stat-hint">
                    <v-icon size="12" class="mr-1">mdi-trending-up</v-icon>
                    保持高效
                  </p>
                </div>
                <div class="stat-icon-wrapper stat-icon-primary">
                  <v-icon size="36" color="white">mdi-checkbox-marked-circle-outline</v-icon>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card stat-card-success" elevation="4" rounded="xl">
            <v-card-text class="pa-5">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <p class="text-caption text-medium-emphasis mb-2 stat-label">Wiki 文章</p>
                  <h3 class="text-h3 font-weight-bold stat-number">{{ stats.wikis }}</h3>
                  <p class="text-caption mt-1 stat-hint">
                    <v-icon size="12" class="mr-1">mdi-book-open-variant</v-icon>
                    知识积累
                  </p>
                </div>
                <div class="stat-icon-wrapper stat-icon-success">
                  <v-icon size="36" color="white">mdi-book-open-page-variant</v-icon>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card stat-card-warning" elevation="4" rounded="xl">
            <v-card-text class="pa-5">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <p class="text-caption text-medium-emphasis mb-2 stat-label">修炼境界</p>
                  <h3 class="text-h3 font-weight-bold stat-number">{{ stats.cultivation }}</h3>
                  <p class="text-caption mt-1 stat-hint">
                    <v-icon size="12" class="mr-1">mdi-star</v-icon>
                    持续精进
                  </p>
                </div>
                <div class="stat-icon-wrapper stat-icon-warning">
                  <v-icon size="36" color="white">mdi-meditation</v-icon>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card stat-card-info" elevation="4" rounded="xl">
            <v-card-text class="pa-5">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <p class="text-caption text-medium-emphasis mb-2 stat-label">留言数量</p>
                  <h3 class="text-h3 font-weight-bold stat-number">{{ stats.messages }}</h3>
                  <p class="text-caption mt-1 stat-hint">
                    <v-icon size="12" class="mr-1">mdi-forum</v-icon>
                    互动交流
                  </p>
                </div>
                <div class="stat-icon-wrapper stat-icon-info">
                  <v-icon size="36" color="white">mdi-message-text</v-icon>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- 功能模块卡片 -->
    <v-container class="features-section py-10">
      <v-row>
        <v-col cols="12" class="text-center mb-4">
          <div class="section-header">
            <v-chip size="large" color="primary" variant="tonal" class="mb-4 px-6 py-5">
              <v-icon start size="20">mdi-apps</v-icon>
              <span class="text-subtitle-1 font-weight-bold">功能模块</span>
            </v-chip>
            <h2 class="section-title text-h3 font-weight-bold mb-3">
              探索所有功能
            </h2>
            <p class="text-body-1 text-medium-emphasis">
              一站式的个人内容管理解决方案
            </p>
          </div>
        </v-col>
      </v-row>

      <v-row>
        <!-- Wiki 知识库 -->
        <v-col cols="12" md="6" lg="4">
          <v-card class="feature-card feature-card-glow" elevation="0" rounded="xl" @click="navigateTo('/wiki')">
            <div class="feature-card-gradient feature-gradient-primary"></div>
            <v-card-text class="pa-6 position-relative">
              <div class="d-flex align-center mb-4">
                <div class="feature-icon-wrapper feature-icon-primary mr-4">
                  <v-icon size="32" color="white">mdi-book-open-page-variant</v-icon>
                </div>
                <div>
                  <h3 class="text-h5 font-weight-bold">Wiki 知识库</h3>
                  <p class="text-caption text-medium-emphasis mb-0">构建你的知识体系</p>
                </div>
              </div>
              <p class="text-body-2 mb-4 feature-description">
                树形结构管理文章，支持 Markdown 编辑、标签分类、评论互动，打造个人知识图谱
              </p>
              <div class="mb-3">
                <v-chip size="small" color="primary" variant="tonal" class="mr-2 mb-2">Markdown</v-chip>
                <v-chip size="small" color="primary" variant="tonal" class="mr-2 mb-2">树形结构</v-chip>
                <v-chip size="small" color="primary" variant="tonal" class="mb-2">版本历史</v-chip>
              </div>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions class="pa-6">
              <v-btn color="primary" variant="flat" :to="isLoggedIn ? '/wiki' : '/login'" block rounded="lg">
                进入知识库
                <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <!-- 待办事项 -->
        <v-col cols="12" md="6" lg="4">
          <v-card class="feature-card" elevation="2" rounded="lg" hover @click="navigateTo('/todos')">
            <v-card-text class="pa-6">
              <div class="d-flex align-center mb-4">
                <v-avatar color="success" size="60" class="mr-4">
                  <v-icon size="32" color="white">mdi-checkbox-marked-circle-outline</v-icon>
                </v-avatar>
                <div>
                  <h3 class="text-h5 font-weight-bold">待办事项</h3>
                  <p class="text-caption text-medium-emphasis">高效管理任务清单</p>
                </div>
              </div>
              <p class="text-body-2 mb-4">
                创建、分类、追踪你的待办任务，设置优先级和截止日期，让工作和生活更有条理
              </p>
              <v-chip size="small" color="success" variant="tonal" class="mr-2">任务管理</v-chip>
              <v-chip size="small" color="success" variant="tonal" class="mr-2">优先级</v-chip>
              <v-chip size="small" color="success" variant="tonal">提醒功能</v-chip>
            </v-card-text>
            <v-card-actions class="pa-6 pt-0">
              <v-btn color="success" variant="text" :to="isLoggedIn ? '/todos' : '/login'">
                查看任务
                <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <!-- 修炼系统 -->
        <v-col cols="12" md="6" lg="4">
          <v-card class="feature-card" elevation="2" rounded="lg" hover @click="navigateTo('/cultivation')">
            <v-card-text class="pa-6">
              <div class="d-flex align-center mb-4">
                <v-avatar color="warning" size="60" class="mr-4">
                  <v-icon size="32" color="white">mdi-meditation</v-icon>
                </v-avatar>
                <div>
                  <h3 class="text-h5 font-weight-bold">修炼系统</h3>
                  <p class="text-caption text-medium-emphasis">追踪个人成长轨迹</p>
                </div>
              </div>
              <p class="text-body-2 mb-4">
                游戏化的成长记录系统，通过完成日常任务积累经验值，提升境界，见证自己的进步
              </p>
              <v-chip size="small" color="warning" variant="tonal" class="mr-2">经验系统</v-chip>
              <v-chip size="small" color="warning" variant="tonal" class="mr-2">境界提升</v-chip>
              <v-chip size="small" color="warning" variant="tonal">成就徽章</v-chip>
            </v-card-text>
            <v-card-actions class="pa-6 pt-0">
              <v-btn color="warning" variant="text" :to="isLoggedIn ? '/cultivation' : '/login'">
                开始修炼
                <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <!-- AutoOps 自动化 -->
        <v-col cols="12" md="6" lg="4">
          <!--暂时不指向P假体网站-->
          <v-card class="feature-card" elevation="2" rounded="lg" hover @click="navigateTo('/autops1')">
            <v-card-text class="pa-6">
              <div class="d-flex align-center mb-4">
                <v-avatar color="info" size="60" class="mr-4">
                  <v-icon size="32" color="white">mdi-robot</v-icon>
                </v-avatar>
                <div>
                  <h3 class="text-h5 font-weight-bold">AutoOps</h3>
                  <p class="text-caption text-medium-emphasis">自动化运维工具</p>
                </div>
              </div>
              <p class="text-body-2 mb-4">
                自动化脚本执行、系统监控、日志分析等运维工具，提升工作效率
              </p>
              <v-chip size="small" color="info" variant="tonal" class="mr-2">自动化</v-chip>
              <v-chip size="small" color="info" variant="tonal" class="mr-2">运维工具</v-chip>
              <v-chip size="small" color="info" variant="tonal">效率提升</v-chip>
            </v-card-text>
            <v-card-actions class="pa-6 pt-0">
              <v-btn color="info" variant="text" :to="isLoggedIn ? '/autops' : '/login'">
                进入 AutoOps
                <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <!-- Notion 集成 -->
        <v-col cols="12" md="6" lg="4">
          <v-card class="feature-card" elevation="2" rounded="lg" hover @click="navigateTo('/notion')">
            <v-card-text class="pa-6">
              <div class="d-flex align-center mb-4">
                <v-avatar color="purple" size="60" class="mr-4">
                  <v-icon size="32" color="white">mdi-note-text</v-icon>
                </v-avatar>
                <div>
                  <h3 class="text-h5 font-weight-bold">Notion</h3>
                  <p class="text-caption text-medium-emphasis">笔记与文档管理</p>
                </div>
              </div>
              <p class="text-body-2 mb-4">
                与 Notion 无缝集成，同步笔记和文档，实现多平台内容管理
              </p>
              <v-chip size="small" color="purple" variant="tonal" class="mr-2">笔记同步</v-chip>
              <v-chip size="small" color="purple" variant="tonal" class="mr-2">文档管理</v-chip>
              <v-chip size="small" color="purple" variant="tonal">集成</v-chip>
            </v-card-text>
            <v-card-actions class="pa-6 pt-0">
              <v-btn color="purple" variant="text" :to="isLoggedIn ? '/notion' : '/login'">
                查看笔记
                <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <!-- 设置中心 -->
        <v-col cols="12" md="6" lg="4">
          <v-card class="feature-card" elevation="2" rounded="lg" hover @click="navigateTo('/settings')">
            <v-card-text class="pa-6">
              <div class="d-flex align-center mb-4">
                <v-avatar color="grey-darken-1" size="60" class="mr-4">
                  <v-icon size="32" color="white">mdi-cog</v-icon>
                </v-avatar>
                <div>
                  <h3 class="text-h5 font-weight-bold">设置中心</h3>
                  <p class="text-caption text-medium-emphasis">个性化配置</p>
                </div>
              </div>
              <p class="text-body-2 mb-4">
                管理个人信息、通知设置、主题偏好等，打造专属于你的使用体验
              </p>
              <v-chip size="small" color="grey-darken-1" variant="tonal" class="mr-2">个人资料</v-chip>
              <v-chip size="small" color="grey-darken-1" variant="tonal" class="mr-2">主题切换</v-chip>
              <v-chip size="small" color="grey-darken-1" variant="tonal">通知</v-chip>
            </v-card-text>
            <v-card-actions class="pa-6 pt-0">
              <v-btn color="grey-darken-1" variant="text" :to="isLoggedIn ? '/settings' : '/login'">
                进入设置
                <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- 未登录用户的行动号召 -->
    <v-container v-if="!isLoggedIn" class="cta-section py-12">
      <v-row justify="center">
        <v-col cols="12" md="8" class="text-center">
          <v-card class="cta-card pa-8" elevation="4" rounded="xl">
            <v-icon size="80" color="primary" class="mb-4">mdi-rocket-launch</v-icon>
            <h2 class="text-h4 font-weight-bold mb-4">开启你的高效之旅</h2>
            <p class="text-body-1 mb-6 text-medium-emphasis">
              注册账号，开始使用个人内容中心的所有功能
            </p>
            <div class="d-flex justify-center flex-wrap gap-4">
              <v-btn
                color="primary"
                size="large"
                rounded="pill"
                to="/register"
                class="px-10"
              >
                立即注册
              </v-btn>
              <v-btn
                variant="outlined"
                color="primary"
                size="large"
                rounded="pill"
                to="/login"
                class="px-10"
              >
                已有账号？登录
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTodoStore } from '@/stores/todo'
import { useCultivationStore } from '@/stores/cultivation'

const authStore = useAuthStore()
const todoStore = useTodoStore()
const cultivationStore = useCultivationStore()
const router = useRouter()

// 统计数据
const stats = ref({
  todos: 0,
  wikis: 0,
  cultivation: '-',
  messages: 0
})

// 计算属性
const isLoggedIn = computed(() => {
  return authStore.isAuthenticated
})

const username = computed(() => {
  return authStore.user?.username || '访客'
})

// 导航方法
const navigateTo = (path) => {
  if (isLoggedIn.value) {
    router.push(path)
  } else {
    router.push('/login')
  }
}

// 加载统计数据
const loadStats = async () => {
  if (!isLoggedIn.value) return

  try {
    // 加载待办任务统计
    await todoStore.loadTodos()
    stats.value.todos = todoStore.todos.filter(t => !t.completed).length

    // 加载修炼系统数据
    await cultivationStore.loadUserProfile()
    stats.value.cultivation = cultivationStore.userProfile?.realm || '-'

    // TODO: 添加 Wiki 和留言板的统计
    // 这里可以调用相应的 API 获取数据
    stats.value.wikis = 0
    stats.value.messages = 0
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 在组件挂载时检查认证状态和加载数据
onMounted(async () => {
  // 检查localStorage中的令牌
  const accessToken = localStorage.getItem('accessToken')
  
  // 如果有令牌但authStore中没有用户信息，尝试获取
  if (accessToken && !authStore.user) {
    await authStore.checkAuthStatus()
  }

  // 加载统计数据
  if (isLoggedIn.value) {
    await loadStats()
  }
})
</script>

<style scoped>
/* 主容器 */
.home-container {
  background: linear-gradient(180deg, #f5f7fa 0%, #ffffff 50%, #fafbfc 100%);
  min-height: 100vh;
  overflow-x: hidden;
  position: relative;
}

/* 装饰性背景 */
.bg-decoration {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.06;
  animation: float 20s ease-in-out infinite;
}

.circle-1 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  top: -250px;
  right: -250px;
  animation-delay: 0s;
}

.circle-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  bottom: -200px;
  left: -200px;
  animation-delay: 5s;
}

.circle-3 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 10s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

/* 顶部欢迎区域 */
.hero-section {
  padding-top: 80px;
  padding-bottom: 60px;
  position: relative;
  background: transparent;
  z-index: 1;
}

/* 头像样式 */
.avatar-wrapper {
  position: relative;
  display: inline-block;
  animation: avatarFloat 3s ease-in-out infinite;
}

.avatar-main {
  position: relative;
  z-index: 2;
  border: 4px solid white;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3) !important;
}

.avatar-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 160px;
  height: 160px;
  border-radius: 50%;
  border: 2px solid rgba(102, 126, 234, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes avatarFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse {
  0%, 100% { 
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.5;
  }
  50% { 
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.8;
  }
}

.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

.title-animate {
  animation: titleSlide 1s ease-out;
}

@keyframes titleSlide {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.subtitle-text {
  color: #666;
  font-weight: 400;
}

.feature-tag {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(102, 126, 234, 0.08);
  border-radius: 20px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.feature-tag:hover {
  background: rgba(102, 126, 234, 0.15);
  transform: translateY(-2px);
}

.separator {
  margin: 0 12px;
  color: #ccc;
}

.cta-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.35) !important;
  transition: all 0.3s ease !important;
  font-size: 1.1rem !important;
  letter-spacing: 0.5px;
}

.cta-button:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.45) !important;
}

/* 仪表板区域 */
.dashboard-section {
  background-color: transparent;
  position: relative;
  z-index: 1;
}

.welcome-banner {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  border-radius: 20px;
  border: 1px solid rgba(102, 126, 234, 0.15);
  backdrop-filter: blur(10px);
  animation: slideInLeft 0.8s ease-out;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.stat-card {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: white;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card-primary { border-left: 4px solid #667eea; }
.stat-card-success { border-left: 4px solid #4caf50; }
.stat-card-warning { border-left: 4px solid #ff9800; }
.stat-card-info { border-left: 4px solid #2196f3; }

.stat-label {
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.stat-number {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
}

.stat-hint {
  color: #999;
  font-style: italic;
}

.stat-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card:hover .stat-icon-wrapper {
  transform: rotate(10deg) scale(1.1);
}

.stat-icon-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-icon-success { background: linear-gradient(135deg, #4caf50 0%, #81c784 100%); }
.stat-icon-warning { background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%); }
.stat-icon-info { background: linear-gradient(135deg, #2196f3 0%, #64b5f6 100%); }

/* 功能模块区域 */
.features-section {
  background-color: transparent;
  position: relative;
  z-index: 1;
}

.section-header {
  animation: fadeInDown 1s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-title {
  color: #333;
  position: relative;
  background: linear-gradient(135deg, #333 0%, #667eea 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.feature-card {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  height: 100%;
  border: 2px solid rgba(0, 0, 0, 0.06);
  background: white;
  position: relative;
  overflow: visible;
}

.feature-card-glow {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.feature-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: 0 20px 60px rgba(102, 126, 234, 0.25) !important;
  border-color: rgba(102, 126, 234, 0.3);
}

.feature-card-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feature-card:hover .feature-card-gradient {
  opacity: 1;
}

.feature-gradient-primary {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.feature-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s ease;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.feature-card:hover .feature-icon-wrapper {
  transform: scale(1.15) rotate(-5deg);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.2);
}

.feature-icon-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.feature-description {
  color: #666;
  line-height: 1.7;
  min-height: 60px;
}

/* 行动号召区域 */
.cta-section {
  background: transparent;
  padding: 80px 0;
  position: relative;
  z-index: 1;
}

.cta-card {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  border: 2px solid rgba(102, 126, 234, 0.2);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  animation: ctaFadeIn 1.2s ease-out;
}

.cta-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: rotate(45deg);
  animation: shine 3s infinite;
}

@keyframes ctaFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes shine {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

.gap-4 {
  gap: 1rem;
}

/* 通用样式 */
:deep(.v-btn) {
  letter-spacing: 0.5px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: none;
}

:deep(.v-btn:hover) {
  transform: translateY(-3px);
}

:deep(.v-btn:active) {
  transform: translateY(-1px);
}

:deep(.v-card) {
  border-radius: 20px;
}

:deep(.v-avatar) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.v-chip) {
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.v-chip:hover) {
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 960px) {
  .hero-section {
    padding-top: 40px;
    padding-bottom: 40px;
  }

  .gradient-text {
    font-size: 2rem !important;
  }

  .feature-card {
    margin-bottom: 1.5rem;
  }

  .circle-1,
  .circle-2,
  .circle-3 {
    display: none;
  }

  .avatar-wrapper {
    margin-bottom: 2rem !important;
  }

  .feature-tag {
    font-size: 0.85rem;
    padding: 3px 10px;
  }

  .separator {
    margin: 0 8px;
  }
}

@media (max-width: 600px) {
  .gradient-text {
    font-size: 1.75rem !important;
  }

  .stat-card {
    margin-bottom: 1rem;
  }

  .stat-icon-wrapper {
    width: 52px;
    height: 52px;
  }

  .stat-icon-wrapper :deep(.v-icon) {
    font-size: 28px !important;
  }

  .feature-icon-wrapper {
    width: 56px;
    height: 56px;
  }

  .feature-icon-wrapper :deep(.v-icon) {
    font-size: 28px !important;
  }

  .cta-section {
    padding: 40px 0;
  }
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-card,
.stat-card {
  animation: fadeInUp 0.8s ease-out backwards;
}

.feature-card:nth-child(1),
.stat-card:nth-child(1) { animation-delay: 0.1s; }
.feature-card:nth-child(2),
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.feature-card:nth-child(3),
.stat-card:nth-child(3) { animation-delay: 0.3s; }
.feature-card:nth-child(4),
.stat-card:nth-child(4) { animation-delay: 0.4s; }
.feature-card:nth-child(5) { animation-delay: 0.5s; }
.feature-card:nth-child(6) { animation-delay: 0.6s; }

/* 滚动平滑 */
html {
  scroll-behavior: smooth;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
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
