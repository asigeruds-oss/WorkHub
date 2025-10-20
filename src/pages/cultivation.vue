<template>
  <v-container>
    <v-row>
      <!-- 页面标题 -->
      <v-col cols="12">
        <h1 class="text-h4 font-weight-medium d-flex align-center">
          <v-icon icon="mdi-incognito" class="mr-2" color="amber-darken-2"></v-icon>
          修真之路
        </h1>
        <p class="text-subtitle-1 text-medium-emphasis mt-2">
          完成待办事项，积累修为，踏上修真之路
        </p>
      </v-col>
    </v-row>

    <!-- 加载中状态 -->
    <div v-if="loading" class="d-flex justify-center my-8">
      <v-progress-circular
        indeterminate
        size="64"
        width="4" 
        color="primary"
      ></v-progress-circular>
    </div>

    <!-- 错误提示 -->
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      closable
      class="mb-4"
    >
      {{ error }}
    </v-alert>

    <v-slide-y-transition>
      <div v-if="!loading && userCultivation">
        <!-- 修炼状态卡片 -->
        <v-row>
          <v-col cols="12" md="6">
            <v-card class="cultivation-status-card">
              <v-card-title class="d-flex align-center">
                <v-avatar
                  color="amber-lighten-1"
                  class="mr-4 cultivation-avatar"
                  :image="getRealmIconUrl()"
                >
                  <v-icon icon="mdi-incognito" size="large"></v-icon>
                </v-avatar>
                <div>
                  <div class="text-h6">{{ userCultivation.realm_name }} · {{ userCultivation.stage_name }}</div>
                  <div class="text-caption">修炼者：{{ userCultivation.username }}</div>
                </div>
                <v-spacer></v-spacer>
                <v-btn
                  v-if="userCultivation.can_advance"
                  color="primary"
                  variant="tonal"
                  prepend-icon="mdi-arrow-up-bold-circle"
                  @click="tryAdvanceCultivation"
                  :loading="advancingCultivation"
                >
                  突破
                </v-btn>
              </v-card-title>
              
              <v-divider></v-divider>
              
              <v-card-text>
                <div class="d-flex align-center mb-2">
                  <v-icon icon="mdi-flash" color="amber-darken-2" class="mr-2"></v-icon>
                  <div class="text-subtitle-1">修为值：{{ userCultivation.total_exp }}</div>
                </div>
                
                <v-progress-linear
                  :model-value="userCultivation.next_level_progress"
                  color="amber-darken-2"
                  height="10"
                  rounded
                  class="mb-3"
                >
                  <template v-slot:default="{ value }">
                    <span class="text-caption white--text">{{ Math.ceil(value) }}%</span>
                  </template>
                </v-progress-linear>
                
                <div class="d-flex justify-space-between mb-6 text-caption">
                  <span>当前层修为: {{ userCultivation.current_exp }}</span>
                  <span v-if="nextStageExp !== null">
                    下一层: {{ nextStageExp }}
                  </span>
                </div>
                
                <v-row>
                  <v-col cols="6">
                    <v-card variant="outlined" class="pa-3 resource-card">
                      <div class="d-flex align-center">
                        <v-icon icon="mdi-diamond-stone" color="blue" class="mr-2"></v-icon>
                        <div>
                          <div class="text-caption text-medium-emphasis">灵石</div>
                          <div class="text-h6">{{ userCultivation.spirit_stones }}</div>
                        </div>
                      </div>
                    </v-card>
                  </v-col>
                  
                  <v-col cols="6">
                    <v-card variant="outlined" class="pa-3 resource-card">
                      <div class="d-flex align-center">
                        <v-icon icon="mdi-lightning-bolt" color="deep-orange" class="mr-2"></v-icon>
                        <div>
                          <div class="text-caption text-medium-emphasis">灵力值</div>
                          <div class="text-h6">
                            {{ userCultivation.energy }} / {{ userCultivation.max_energy }}
                          </div>
                        </div>
                      </div>
                      
                      <v-progress-linear
                        :model-value="userCultivation.energy_percentage"
                        color="deep-orange"
                        height="4"
                        rounded
                        class="mt-2"
                      ></v-progress-linear>
                      
                      <div class="text-right mt-2">
                        <v-btn
                          size="small"
                          color="deep-orange"
                          variant="text"
                          :disabled="userCultivation.spirit_stones < 5 || userCultivation.energy >= userCultivation.max_energy"
                          @click="recoverEnergyDialog = true"
                        >
                          恢复灵力
                        </v-btn>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="6">
            <v-card class="stats-card" height="100%">
              <v-card-title>
                <v-icon icon="mdi-chart-timeline-variant" class="mr-2" color="primary"></v-icon>
                修炼统计
              </v-card-title>
              
              <v-divider></v-divider>
              
              <v-card-text v-if="userStats">
                <v-list>
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon icon="mdi-check-circle" color="success"></v-icon>
                    </template>
                    <v-list-item-title>已完成待办</v-list-item-title>
                    <template v-slot:append>
                      <span class="text-body-1">{{ userStats.todos_completed }}</span>
                    </template>
                  </v-list-item>
                  
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon icon="mdi-priority-high" color="error"></v-icon>
                    </template>
                    <v-list-item-title>高优先级完成数</v-list-item-title>
                    <template v-slot:append>
                      <span class="text-body-1">{{ userStats.high_priority_completed }}</span>
                    </template>
                  </v-list-item>
                  
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon icon="mdi-calendar-check" color="info"></v-icon>
                    </template>
                    <v-list-item-title>连续活跃天数</v-list-item-title>
                    <template v-slot:append>
                      <span class="text-body-1">{{ userStats.continuous_active_days }}</span>
                    </template>
                  </v-list-item>
                  
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon icon="mdi-crown" color="amber-darken-2"></v-icon>
                    </template>
                    <v-list-item-title>最长连续活跃</v-list-item-title>
                    <template v-slot:append>
                      <span class="text-body-1">{{ userStats.max_continuous_active_days }}</span>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        
        <!-- 待办事项和成就面板 -->
        <v-row class="mt-4">
          <v-col cols="12">
            <v-tabs v-model="activeTab" color="primary" align-tabs="center">
              <v-tab value="todos">
                <v-icon start icon="mdi-format-list-checks"></v-icon>
                修炼任务
              </v-tab>
              <v-tab value="achievements">
                <v-icon start icon="mdi-trophy"></v-icon>
                修炼成就
              </v-tab>
              <v-tab value="history">
                <v-icon start icon="mdi-history"></v-icon>
                修炼记录
              </v-tab>
              <v-tab value="realms">
                <v-icon start icon="mdi-stairs-up"></v-icon>
                境界图鉴
              </v-tab>
            </v-tabs>
            
            <v-window v-model="activeTab" class="mt-4">
              <!-- 修炼任务面板 -->
              <v-window-item value="todos">
                <cultivation-todo-list 
                  :todos="cultivationTodos" 
                  @complete-todo="handleCompleteTodo"
                  @reopen-todo="handleReopenTodo"
                  @add-todo="addTodoDialog = true"
                  @refresh="refreshTodos"
                ></cultivation-todo-list>
              </v-window-item>
              
              <!-- 修炼成就面板 -->
              <v-window-item value="achievements">
                <cultivation-achievements
                  :achievements="achievements"
                  @claim-reward="handleClaimAchievementReward"
                ></cultivation-achievements>
              </v-window-item>
              
              <!-- 修炼记录面板 -->
              <v-window-item value="history">
                <cultivation-history
                  :reward-history="rewardHistory"
                  :advancement-history="advancementHistory"
                  @fetch-history="fetchHistoryData"
                ></cultivation-history>
              </v-window-item>
              
              <!-- 境界图鉴面板 -->
              <v-window-item value="realms">
                <cultivation-realm-guide
                  :realms="realms"
                  :current-realm-id="userCultivation.current_realm"
                  :current-stage-id="userCultivation.current_stage"
                ></cultivation-realm-guide>
              </v-window-item>
            </v-window>
          </v-col>
        </v-row>
      </div>
    </v-slide-y-transition>
    
    <!-- 灵力恢复对话框 -->
    <v-dialog v-model="recoverEnergyDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          <v-icon icon="mdi-lightning-bolt" color="deep-orange" class="mr-2"></v-icon>
          恢复灵力
        </v-card-title>
        
        <v-card-text>
          <p>当前灵石: <strong>{{ userCultivation?.spirit_stones || 0 }}</strong></p>
          <p class="mb-4">消耗 <strong>5</strong> 灵石可恢复 <strong>10</strong> 点灵力。</p>
          
          <v-alert
            type="info"
            variant="tonal"
            density="compact"
            icon="mdi-information"
          >
            灵力是完成待办事项的能量来源，灵力不足时无法获得完成待办的奖励。
          </v-alert>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="recoverEnergyDialog = false"
          >
            取消
          </v-btn>
          <v-btn
            color="deep-orange"
            variant="elevated"
            @click="handleRecoverEnergy"
            :loading="recoveringEnergy"
            :disabled="userCultivation?.spirit_stones < 5"
          >
            恢复灵力
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- 进阶成功对话框 -->
    <v-dialog v-model="advancementSuccessDialog" max-width="500">
      <v-card class="advancement-success-card">
        <v-card-title class="text-center text-h5 pa-4">
          <v-icon icon="mdi-creation" color="amber-darken-2" class="mr-2"></v-icon>
          境界突破
        </v-card-title>
        
        <v-card-text class="text-center">
          <v-avatar
            size="120"
            class="mb-4 elevation-5"
            :image="getRealmIconUrl()"
          >
            <v-icon icon="mdi-incognito" size="x-large"></v-icon>
          </v-avatar>
          
          <h2 class="text-h5 font-weight-bold mb-2">恭喜进阶到</h2>
          <h3 class="text-h4 font-weight-bold amber-text text--darken-2 mb-4">
            {{ userCultivation?.realm_name }} · {{ userCultivation?.stage_name }}
          </h3>
          
          <p class="mb-4">{{ advancementMessage }}</p>
          
          <v-alert
            type="success"
            variant="tonal"
            density="compact"
            class="mb-4"
          >
            修为提升，灵力上限增加！
          </v-alert>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="elevated"
            @click="advancementSuccessDialog = false"
          >
            继续修炼
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- 添加待办对话框 -->
    <v-dialog v-model="addTodoDialog" max-width="600">
      <v-card>
        <v-card-title class="text-h5">
          <v-icon icon="mdi-plus-circle" color="primary" class="mr-2"></v-icon>
          添加修炼任务
        </v-card-title>
        
        <v-card-text>
          <v-form ref="todoForm" @submit.prevent="handleAddTodo">
            <v-text-field
              v-model="newTodo.title"
              label="任务标题"
              :rules="[v => !!v || '请输入任务标题']"
              required
              variant="outlined"
              class="mb-2"
            ></v-text-field>
            
            <v-textarea
              v-model="newTodo.description"
              label="任务描述"
              rows="3"
              variant="outlined"
              class="mb-2"
            ></v-textarea>
            
            <v-select
              v-model="newTodo.priority"
              :items="priorityOptions"
              label="优先级"
              variant="outlined"
              class="mb-2"
            ></v-select>
            
            <v-text-field
              v-model="newTodo.due_date"
              label="截止时间"
              type="datetime-local"
              variant="outlined"
              class="mb-2"
            ></v-text-field>
            
            <v-alert
              type="info"
              variant="tonal"
              density="compact"
              class="mb-2"
            >
              根据优先级不同，完成任务将获得不同的修为和灵石奖励
            </v-alert>
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="closeAddTodoDialog"
          >
            取消
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            @click="handleAddTodo"
            :loading="addingTodo"
          >
            添加
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- 全局消息提示 -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    >
      {{ snackbar.text }}
      
      <template v-slot:actions>
        <v-btn variant="text" icon="mdi-close" @click="snackbar.show = false"></v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useCultivationStore } from '@/stores'
import CultivationTodoList from '@/components/cultivation/CultivationTodoList.vue'
import CultivationAchievements from '@/components/cultivation/CultivationAchievements.vue'
import CultivationHistory from '@/components/cultivation/CultivationHistory.vue'
import CultivationRealmGuide from '@/components/cultivation/CultivationRealmGuide.vue'

// Store
const cultivationStore = useCultivationStore()

// 状态
const loading = ref(true)
const error = ref(null)
const activeTab = ref('todos')
const recoverEnergyDialog = ref(false)
const recoveringEnergy = ref(false)
const advancingCultivation = ref(false)
const advancementSuccessDialog = ref(false)
const advancementMessage = ref('')
const addTodoDialog = ref(false)
const addingTodo = ref(false)
const todoForm = ref(null)

// 新待办数据
const newTodo = reactive({
  title: '',
  description: '',
  priority: 2,
  due_date: ''
})

// 优先级选项
const priorityOptions = [
  { title: '低', value: 1 },
  { title: '中', value: 2 },
  { title: '高', value: 3 },
  { title: '紧急', value: 4 }
]

// 消息提示
const snackbar = reactive({
  show: false,
  text: '',
  color: 'success',
  timeout: 3000
})

// 计算属性
const userCultivation = computed(() => cultivationStore.userCultivation)
const realms = computed(() => cultivationStore.realms)
const currentStages = computed(() => cultivationStore.currentStages)
const achievements = computed(() => cultivationStore.achievements)
const cultivationTodos = computed(() => cultivationStore.cultivationTodos)
const userStats = computed(() => cultivationStore.userStats)
const rewardHistory = computed(() => cultivationStore.rewardHistory)
const advancementHistory = computed(() => cultivationStore.advancementHistory)

// 获取下一个境界所需修为
const nextStageExp = computed(() => {
  if (!userCultivation.value || !currentStages.value || currentStages.value.length === 0) {
    return null
  }
  
  const currentStageIndex = currentStages.value.findIndex(
    stage => stage.id === userCultivation.value.current_stage
  )
  
  // 如果是当前境界的最后一个小境界
  if (currentStageIndex === currentStages.value.length - 1) {
    // 获取下一个大境界的第一个小境界
    const nextRealmId = userCultivation.value.current_realm + 1
    const nextRealm = realms.value.find(realm => realm.id === nextRealmId)
    
    if (nextRealm) {
      return nextRealm.exp_required
    }
    
    return null
  }
  
  // 返回下一个小境界的经验值要求
  return currentStages.value[currentStageIndex + 1].exp_required
})

// 初始化
onMounted(async () => {
  try {
    await cultivationStore.initCultivationSystem()
    
    // 显示欢迎消息
    showMessage(`欢迎回来，${userCultivation.value.username}！当前境界：${userCultivation.value.realm_name} · ${userCultivation.value.stage_name}`, 'info')
    
  } catch (err) {
    error.value = err.message || '初始化修炼系统失败'
    showMessage('初始化修炼系统失败', 'error')
  } finally {
    loading.value = false
  }
})

// 方法
// 获取境界图标URL
function getRealmIconUrl() {
  // 如果没有图标，返回null，让v-avatar使用默认图标
  if (!userCultivation.value || !userCultivation.value.current_realm) {
    return null
  }
  
  // 查找当前境界
  const realm = realms.value.find(r => r.id === userCultivation.value.current_realm)
  if (!realm || !realm.icon) {
    return null
  }
  
  // 返回图标URL（假设图标存储在公共目录下）
  return `/assets/${realm.icon}`
}

// 处理恢复灵力
async function handleRecoverEnergy() {
  if (recoveringEnergy.value) return
  
  recoveringEnergy.value = true
  
  try {
    const result = await cultivationStore.recoverEnergy()
    showMessage(result.detail || '灵力恢复成功', 'success')
    recoverEnergyDialog.value = false
  } catch (err) {
    showMessage(err.message || '灵力恢复失败', 'error')
  } finally {
    recoveringEnergy.value = false
  }
}

// 尝试进阶
async function tryAdvanceCultivation() {
  if (advancingCultivation.value) return
  
  advancingCultivation.value = true
  
  try {
    const result = await cultivationStore.advanceCultivation()
    advancementMessage.value = result.detail || '恭喜进阶！'
    advancementSuccessDialog.value = true
    
    // 重新获取用户数据
    await Promise.all([
      cultivationStore.fetchUserCultivation(),
      cultivationStore.fetchAdvancementHistory()
    ])
    
    // 如果境界改变了，获取新的小境界信息
    if (result.cultivation && result.cultivation.current_realm !== userCultivation.value.current_realm) {
      await cultivationStore.fetchStagesByRealm(result.cultivation.current_realm)
    }
  } catch (err) {
    showMessage(err.message || '进阶失败', 'error')
  } finally {
    advancingCultivation.value = false
  }
}

// 处理完成待办事项
async function handleCompleteTodo(todoId) {
  try {
    const result = await cultivationStore.completeTodo(todoId)
    
    if (result.rewards) {
      showMessage(`完成待办！获得 ${result.rewards.exp} 修为和 ${result.rewards.spirit_stones} 灵石`, 'success')
    } else {
      showMessage('待办已完成', 'success')
    }
    
    // 检查是否可以进阶
    if (userCultivation.value && userCultivation.value.can_advance) {
      showMessage('修为已达到进阶条件，可以突破境界！', 'info')
    }
  } catch (err) {
    showMessage(err.message || '完成待办失败', 'error')
  }
}

// 处理重新打开待办事项
async function handleReopenTodo(todoId) {
  try {
    const result = await cultivationStore.reopenTodo(todoId)
    showMessage('已取消完成，待办已重新打开', 'info')
  } catch (err) {
    showMessage(err.message || '取消完成失败', 'error')
  }
}

// 处理添加待办事项
async function handleAddTodo() {
  if (!todoForm.value) return
  
  // 验证表单
  const { valid } = await todoForm.value.validate()
  if (!valid) return
  
  addingTodo.value = true
  
  try {
    // 准备待办数据
    const todoData = {
      title: newTodo.title,
      description: newTodo.description,
      priority: newTodo.priority,
      due_date: newTodo.due_date || null,
      status: 'pending'
    }
    
    await cultivationStore.createTodo(todoData)
    showMessage('修炼任务添加成功', 'success')
    closeAddTodoDialog()
  } catch (err) {
    showMessage(err.message || '添加任务失败', 'error')
  } finally {
    addingTodo.value = false
  }
}

// 关闭添加待办对话框
function closeAddTodoDialog() {
  addTodoDialog.value = false
  newTodo.title = ''
  newTodo.description = ''
  newTodo.priority = 2
  newTodo.due_date = ''
  if (todoForm.value) {
    todoForm.value.reset()
  }
}

// 刷新待办事项列表
async function refreshTodos() {
  try {
    await cultivationStore.fetchCultivationTodos()
    showMessage('刷新成功', 'success')
  } catch (err) {
    showMessage('刷新失败', 'error')
  }
}

// 处理领取成就奖励
async function handleClaimAchievementReward(achievementId) {
  try {
    const result = await cultivationStore.claimAchievementReward(achievementId)
    showMessage(result.detail || '成功领取成就奖励', 'success')
  } catch (err) {
    showMessage(err.message || '领取成就奖励失败', 'error')
  }
}

// 获取历史数据
async function fetchHistoryData() {
  try {
    await Promise.all([
      cultivationStore.fetchRewardHistory(),
      cultivationStore.fetchAdvancementHistory()
    ])
  } catch (err) {
    showMessage('获取历史数据失败', 'error')
  }
}

// 显示消息
function showMessage(text, color = 'success') {
  snackbar.text = text
  snackbar.color = color
  snackbar.show = true
}
</script>

<style scoped>
.cultivation-status-card {
  overflow: visible;
  transition: all 0.3s ease;
}

.cultivation-avatar {
  transition: all 0.3s ease;
  border: 3px solid rgba(255, 193, 7, 0.5);
}

.resource-card {
  transition: all 0.3s ease;
}

.resource-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.advancement-success-card {
  overflow: hidden;
  position: relative;
}

.advancement-success-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(135deg, #ffb300, #ff8f00);
  z-index: 0;
}

.advancement-success-card .v-card-title {
  position: relative;
  z-index: 1;
  color: white;
}

/* 动画 */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>

<route>
{
  meta: {
    requiresAuth: true,
    layout: 'default',
    title: '修真之路'
  },
  name: 'cultivation'
}
</route>
