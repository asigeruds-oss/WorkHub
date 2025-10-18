<template>
  <div class="leave-form-page">
    <!-- 加载中状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
    </div>

    <!-- 验证失败状态 -->
    <div v-else-if="verificationFailed || error" class="page-container">
      <!-- 顶部红色区域 -->
      <div class="header-section">
        <div class="status-icon">
          <div class="icon-circle">
            <div class="inner-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#ff5252">
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
              </svg>
            </div>
          </div>
        </div>
        <h1 class="status-title">验证失败</h1>
        <p class="status-time">{{ currentDate }}</p>
      </div>
      
      <!-- 信息列表区域 -->
      <div v-if="leaveFormInfo" class="info-list">
        <div class="info-item">
          <div class="info-label">请假时间</div>
          <div class="info-content">
            {{ formatDateRange(leaveFormInfo.start_date, leaveFormInfo.end_date) }}
          </div>
        </div>
        
        <div class="info-item">
          <div class="info-label">院系</div>
          <div class="info-content">{{ leaveFormInfo.school }}</div>
        </div>
        
        <div class="info-item">
          <div class="info-label">专业</div>
          <div class="info-content">{{ leaveFormInfo.major }}</div>
        </div>
        
        <div class="info-item">
          <div class="info-label">班级</div>
          <div class="info-content">{{ leaveFormInfo.class_name }}</div>
        </div>
        
        <div class="info-item">
          <div class="info-label">姓名</div>
          <div class="info-content name-highlight">{{ leaveFormInfo.name }}</div>
        </div>
        
        <div class="info-item" v-if="leaveFormInfo.student_id">
          <div class="info-label">学号</div>
          <div class="info-content">{{ leaveFormInfo.student_id }}</div>
        </div>
      </div>

      <!-- 无数据状态 -->
      <div v-else class="no-data">
        <p>未检测到假条信息</p>
      </div>
    </div>

    <!-- 验证成功状态 -->
    <div v-else-if="leaveFormInfo" class="page-container">
      <!-- 顶部绿色区域 -->
      <div class="header-section success">
        <div class="status-icon">
          <div class="icon-circle">
            <div class="inner-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#4caf50">
                <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
              </svg>
            </div>
          </div>
        </div>
        <h1 class="status-title">验证成功</h1>
        <p class="status-time">{{ currentDate }}</p>
      </div>
      
      <!-- 信息列表区域 -->
      <div class="info-list">
        <div class="info-item">
          <div class="info-label">请假时间</div>
          <div class="info-content">
            {{ formatDateRange(leaveFormInfo.start_date, leaveFormInfo.end_date) }}
          </div>
        </div>
        
        <div class="info-item">
          <div class="info-label">院系</div>
          <div class="info-content">{{ leaveFormInfo.school }}</div>
        </div>
        
        <div class="info-item">
          <div class="info-label">专业</div>
          <div class="info-content">{{ leaveFormInfo.major }}</div>
        </div>
        
        <div class="info-item">
          <div class="info-label">班级</div>
          <div class="info-content">{{ leaveFormInfo.class_name }}</div>
        </div>
        
        <div class="info-item">
          <div class="info-label">姓名</div>
          <div class="info-content name-highlight">{{ leaveFormInfo.name }}</div>
        </div>
        
        <div class="info-item" v-if="leaveFormInfo.student_id">
          <div class="info-label">学号</div>
          <div class="info-content">{{ leaveFormInfo.student_id }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { AutoPsAPI } from '@/api'

// 路由
const route = useRoute()

// 状态
const loading = ref(true)
const error = ref(null)
const leaveFormInfo = ref(null)
const verificationFailed = ref(false)

// 计算属性
const currentDate = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const seconds = now.getSeconds()
  
  return `${year}年${month}月${day}日 ${hours}时 ${minutes}分 ${seconds}秒`
})

// 方法
async function loadLeaveFormInfo() {
  loading.value = true
  error.value = null
  
  try {
    const uuid = route.params.uuid
    
    if (!uuid) {
      throw new Error('缺少UUID参数')
    }
    
    const response = await AutoPsAPI.getLeaveFormInfo(uuid)
    leaveFormInfo.value = response.data.data
    
    // 检查是否验证失败（根据后端返回数据判断）
    if (response.data.is_valid === false || response.data.status === 'invalid') {
      verificationFailed.value = true
    }
    
  } catch (err) {
    console.error('获取假条信息失败:', err)
    error.value = err.response?.data?.detail || err.message || '获取假条信息失败'
    
    // 如果是404或验证失败，显示验证失败页面
    if (err.response?.status === 404 || err.response?.status === 400) {
      verificationFailed.value = true
      // 模拟一些数据用于测试显示
      leaveFormInfo.value = {
        start_date: '2025-09-29',
        end_date: '2025-09-29',
        school: '政法学院',
        major: '法学',
        class_name: '法学24-02',
        name: '藏康宁',
        student_id: ''
      }
    }
  } finally {
    loading.value = false
  }
}

function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) return '未设置'
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  return `${formatDate(start)} 至 ${formatDate(end)}`
}

// 生命周期
onMounted(() => {
  document.title = '学生请假'
  loadLeaveFormInfo()
})
</script>

<style>
/* 全局样式重置 - 确保页面完全独立 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  margin: 0 !important;
  padding: 0 !important;
  overflow-x: hidden !important;
  height: 100% !important;
}

#app {
  margin: 0 !important;
  padding: 0 !important;
  height: 100% !important;
}

/* 强制隐藏任何可能的导航元素 */
.v-app-bar,
.v-navigation-drawer,
.v-footer,
.v-bottom-navigation,
.v-app-bar--fixed,
.v-navigation-drawer--fixed {
  display: none !important;
  visibility: hidden !important;
}

.leave-form-page {
  width: 100vw;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background: #f5f5f5;
  overflow-x: hidden;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
}

/* 加载状态 */
.loading-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e0e0e0;
  border-top: 4px solid #ff6b6b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 页面容器 */
.page-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 顶部状态区域 */
.header-section {
  background: linear-gradient(135deg, #ff5252 0%, #f44336 100%);
  padding: 60px 20px 40px;
  text-align: center;
  color: white;
  position: relative;
}

.header-section.success {
  background: linear-gradient(135deg, #2db435 0%, #2db435 100%);
}

.status-icon {
  margin-bottom: 24px;
  position: relative;
}

.icon-circle {
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  position: relative;
  animation: iconPulse 2s ease-in-out infinite;
}

/* 添加多层圆形背景效果 */
.icon-circle::before {
  content: '';
  position: absolute;
  width: 140px;
  height: 140px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: -1;
}

.icon-circle::after {
  content: '';
  position: absolute;
  width: 160px;
  height: 160px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: -2;
}

/* 内部白色圆圈 */
.inner-icon {
  background: white;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.icon-circle svg {
  width: 40px;
  height: 40px;
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.3);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 0 0 15px rgba(255, 255, 255, 0);
  }
}

/* 添加外圈脉冲动画 */
@keyframes outerPulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.08;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.04;
  }
}

.icon-circle::before {
  animation: outerPulse 3s ease-in-out infinite;
}

.icon-circle::after {
  animation: outerPulse 3s ease-in-out infinite 0.5s;
}

.status-title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 12px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.status-time {
  font-size: 16px;
  opacity: 0.95;
  font-weight: 400;
}

/* 信息列表区域 */
.info-list {
  flex: 1;
  background: #f5f5f5;
  padding: 12px 16px;
}

.info-item {
  background: rgb(213, 239, 215);
  border-left: 4px solid #ff5252;
  margin: 0 0 12px 0;
  padding: 18px 20px;
  border-radius: 0 6px 6px 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  position: relative;
}

.info-item::before {
  content: '';
  position: absolute;
  left: -4px;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #ff5252 0%, #f44336 100%);
  border-radius: 0 2px 2px 0;
}

.header-section.success ~ .info-list .info-item {
  border-left-color: #043905;
}

.header-section.success ~ .info-list .info-item::before {
  background: linear-gradient(180deg, #4caf50 0%, #43a047 100%);
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item:hover {
  background: #cfedd1;
  transform: translateX(2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.info-label {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.54);
  margin-bottom: 8px;
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
}

.info-content {
  font-size: 20px;
  color: rgba(0, 0, 0, 0.87);
  font-weight: 500;
  line-height: 1.3;
  margin: 0;
}

.name-highlight {
  color: #ff5252;
  font-weight: 600;
}

.header-section.success ~ .info-list .name-highlight {
  color: #4caf50;
}

/* 无数据状态 */
.no-data {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: rgba(0, 0, 0, 0.6);
  font-size: 16px;
}

/* 响应式设计 */
@media (min-width: 768px) {
  .page-container {
    max-width: 600px;
    margin: 0 auto;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.1);
  }
  
  .header-section {
    padding: 80px 40px 60px;
  }
  
  .info-list {
    padding: 20px 24px;
  }
  
  .info-item {
    padding: 22px 28px;
    margin-bottom: 16px;
  }
  
  .status-title {
    font-size: 36px;
  }
  
  .status-time {
    font-size: 18px;
  }
  
  .info-content {
    font-size: 22px;
  }
}

/* 确保页面完全占满视口，不受外部样式影响 */
:global(html), :global(body) {
  margin: 0 !important;
  padding: 0 !important;
  overflow-x: hidden !important;
  height: 100% !important;
}

:global(#app) {
  margin: 0 !important;
  padding: 0 !important;
  height: 100% !important;
}

/* 覆盖任何可能的Vuetify全局样式 */
:global(.v-app) {
  margin: 0 !important;
  padding: 0 !important;
}

:global(.v-main) {
  padding: 0 !important;
  margin: 0 !important;
}

/* 强制隐藏任何可能的导航元素 */
:global(.v-app-bar),
:global(.v-navigation-drawer),
:global(.v-footer),
:global(.v-bottom-navigation) {
  display: none !important;
}
</style>

<route>
{
  meta: {
    requiresAuth: false,
    layout: false,
    title: '假条验证'
  },
  path: '/leave_form_info/:uuid'
}
</route>