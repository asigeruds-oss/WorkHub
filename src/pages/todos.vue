<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-4">
          <h1 class="text-h4">待办事项</h1>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="openAddDialog"
            prepend-icon="mdi-plus"
            class="mr-2"
          >
            添加新任务
          </v-btn>
          <v-btn
            v-if="isDev"
            color="info"
            @click="testApiConnection"
            prepend-icon="mdi-connection"
            variant="outlined"
          >
            测试API连接
          </v-btn>
        </div>

        <!-- 加载状态 -->
        <div v-if="todoStore.isLoading" class="d-flex justify-center my-4">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>

        <!-- 错误提示 -->
        <v-alert v-if="todoStore.getError" type="error" class="mb-4" closable>
          {{ todoStore.getError }}
        </v-alert>
        
        <!-- 开发环境下的调试信息面板 -->
        <v-card v-if="isDev" class="mb-4 bg-grey-lighten-4">
          <v-card-title class="text-subtitle-1">
            <v-icon icon="mdi-bug" class="mr-2"></v-icon>
            调试信息
            <v-spacer></v-spacer>
            <v-btn size="small" variant="text" @click="showDebugPanel = !showDebugPanel">
              {{ showDebugPanel ? '隐藏' : '显示' }}
            </v-btn>
          </v-card-title>
          <v-expand-transition>
            <v-card-text v-if="showDebugPanel" class="text-body-2">
              <pre class="text-caption">{{ JSON.stringify(todoStore.getAllTodos, null, 2) }}</pre>
            </v-card-text>
          </v-expand-transition>
        </v-card>

        <!-- 筛选和搜索 -->
        <v-card class="mb-4">
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6" md="3">
                <v-select
                  v-model="filter"
                  label="状态筛选"
                  :items="filterOptions"
                  item-title="text"
                  item-value="value"
                  hide-details
                  variant="outlined"
                  density="comfortable"
                  @update:model-value="applyFilters"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-select
                  v-model="sortBy"
                  label="排序方式"
                  :items="sortOptions"
                  item-title="text"
                  item-value="value"
                  hide-details
                  variant="outlined"
                  density="comfortable"
                  @update:model-value="applyFilters"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="12" md="6">
                <v-text-field
                  v-model="search"
                  label="搜索"
                  prepend-icon="mdi-magnify"
                  hide-details
                  variant="outlined"
                  density="comfortable"
                  @keyup.enter="applyFilters"
                >
                  <template v-slot:append>
                    <v-btn icon="mdi-magnify" variant="text" @click="applyFilters"></v-btn>
                  </template>
                </v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- 没有待办事项 -->
        <v-card v-if="filteredTodos.length === 0 && !todoStore.isLoading" class="pa-4">
          <v-card-text class="text-center">
            <v-icon icon="mdi-checkbox-blank-off-outline" size="large" class="mb-2"></v-icon>
            <div class="text-body-1">暂无待办事项</div>
            <v-btn color="primary" class="mt-4" @click="openAddDialog">
              添加第一个任务
            </v-btn>
          </v-card-text>
        </v-card>

        <!-- 待办事项列表 -->
        <div v-else>
          <v-card 
            v-for="todo in filteredTodos" 
            :key="todo.id" 
            class="mb-3"
            :class="{
              'completed-todo': todo.status === 'done',
              'archived-todo': todo.status === 'archived'
            }"
          >
            <v-card-text>
              <div class="d-flex align-center">
                <v-checkbox
                  :model-value="todo.status === 'done'"
                  @change="toggleTodoStatus(todo)"
                  :disabled="todo.status === 'archived'"
                  hide-details
                  density="compact"
                ></v-checkbox>
                
                <div class="ml-2 flex-grow-1">
                  <div :class="{
                    'text-decoration-line-through': todo.status === 'done',
                    'font-weight-medium': todo.status === 'pending',
                    'text-grey': todo.status === 'archived'
                  }">
                    {{ todo.title }}
                    <v-chip
                      v-if="todo.priority"
                      size="x-small"
                      :color="getPriorityColor(todo.priority)"
                      class="ml-2"
                    >
                      {{ getPriorityLabel(todo.priority) }}
                    </v-chip>
                  </div>
                  <div v-if="todo.description" class="text-body-2 text-grey">
                    {{ todo.description }}
                  </div>
                  <div class="d-flex align-center text-caption text-grey mt-2">
                    <v-icon icon="mdi-calendar" size="small" class="mr-1"></v-icon>
                    <span>创建于: {{ formatDate(todo.created_at) }}</span>
                    <span v-if="todo.due_date" class="ml-3">
                      <v-icon icon="mdi-clock-outline" size="small" class="mr-1"></v-icon>
                      截止日期: {{ formatDate(todo.due_date) }}
                    </span>
                  </div>
                </div>
                
                <div class="d-flex">
                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <v-btn
                        icon="mdi-dots-vertical"
                        variant="text"
                        size="small"
                        v-bind="props"
                      ></v-btn>
                    </template>
                    <v-list>
                      <v-list-item @click="openEditDialog(todo)">
                        <template v-slot:prepend>
                          <v-icon icon="mdi-pencil"></v-icon>
                        </template>
                        <v-list-item-title>编辑</v-list-item-title>
                      </v-list-item>
                      
                      <v-list-item v-if="todo.status === 'pending'" @click="completeTodo(todo)">
                        <template v-slot:prepend>
                          <v-icon icon="mdi-check"></v-icon>
                        </template>
                        <v-list-item-title>标记为已完成</v-list-item-title>
                      </v-list-item>
                      
                      <v-list-item v-if="todo.status === 'done'" @click="reopenTodo(todo)">
                        <template v-slot:prepend>
                          <v-icon icon="mdi-refresh"></v-icon>
                        </template>
                        <v-list-item-title>重新打开</v-list-item-title>
                      </v-list-item>
                      
                      <v-list-item v-if="todo.status !== 'archived'" @click="archiveTodo(todo)">
                        <template v-slot:prepend>
                          <v-icon icon="mdi-archive"></v-icon>
                        </template>
                        <v-list-item-title>归档</v-list-item-title>
                      </v-list-item>
                      
                      <v-list-item @click="openDeleteDialog(todo)" class="text-error">
                        <template v-slot:prepend>
                          <v-icon icon="mdi-delete" color="error"></v-icon>
                        </template>
                        <v-list-item-title>删除</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
              </div>
            </v-card-text>
          </v-card>
          
          <!-- 分页控件 -->
          <div class="d-flex justify-center mt-4">
            <v-pagination
              v-if="todoStore.getPagination.count > 0"
              v-model="currentPage"
              :length="Math.ceil(todoStore.getPagination.count / pageSize)"
              :total-visible="5"
              @update:model-value="handlePageChange"
            ></v-pagination>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- 添加/编辑对话框 -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>
          {{ isEditing ? '编辑任务' : '添加新任务' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="form" @submit.prevent="isEditing ? updateTodo() : addTodo()">
            <v-text-field
              v-model="currentTodo.title"
              label="标题"
              :rules="[(v) => !!v && v.trim() !== '' || '标题不能为空']"
              required
              @input="() => { if(form.value) form.value.resetValidation() }"
            ></v-text-field>
            
            <v-textarea
              v-model="currentTodo.description"
              label="描述"
              rows="3"
            ></v-textarea>
            
            <v-select
              v-model="currentTodo.priority"
              label="优先级"
              :items="priorityOptions"
              item-title="text"
              item-value="value"
            ></v-select>
            
            <v-select
              v-if="isEditing"
              v-model="currentTodo.status"
              label="状态"
              :items="statusOptions"
              item-title="text"
              item-value="value"
            ></v-select>
            
            <v-text-field
              v-model="currentTodo.due_date"
              label="截止日期"
              type="date"
              hint="选择任务截止日期"
              persistent-hint
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialog = false">取消</v-btn>
          <v-btn
            color="primary"
            @click="handleFormSubmit"
            :loading="todoStore.isLoading"
            type="submit"
          >
            {{ isEditing ? '更新' : '添加' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 删除确认对话框 -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          确认删除
        </v-card-title>
        <v-card-text>
          确定要删除任务"{{ currentTodo.title }}"吗？此操作不可撤销。
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="deleteDialog = false">取消</v-btn>
          <v-btn
            color="error"
            @click="deleteTodo()"
            :loading="todoStore.isLoading"
          >
            删除
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTodoStore } from '@/stores/todo'
import { TodoAPI } from '@/api/todo'
import axios from 'axios'

// 初始化store
const todoStore = useTodoStore()

// 组件状态
const dialog = ref(false)
const deleteDialog = ref(false)
const isEditing = ref(false)
const currentTodo = ref({
  title: '',
  description: '',
  status: 'pending',
  priority: 2, // 中等优先级，使用数字
  due_date: null
})
const filter = ref('all')
const search = ref('')
const sortBy = ref('-created_at')
const form = ref(null)
const showDebugPanel = ref(false)
const currentPage = ref(1)
const pageSize = 10

// 是否为开发环境
const isDev = import.meta.env.MODE === 'development' || import.meta.env.DEV

// 筛选选项
const filterOptions = [
  { text: '全部', value: 'all' },
  { text: '待办', value: 'pending' },
  { text: '已完成', value: 'done' },
  { text: '已归档', value: 'archived' }
]

// 排序选项
const sortOptions = [
  { text: '创建时间 (新→旧)', value: '-created_at' },
  { text: '创建时间 (旧→新)', value: 'created_at' },
  { text: '更新时间 (新→旧)', value: '-updated_at' },
  { text: '截止日期 (近→远)', value: 'due_date' },
  { text: '优先级 (高→低)', value: '-priority' },
  { text: '优先级 (低→高)', value: 'priority' },
]

// 优先级选项
const priorityOptions = [
  { text: '高', value: 3 },
  { text: '中', value: 2 },
  { text: '低', value: 1 },
]

// 状态选项
const statusOptions = [
  { text: '待办', value: 'pending' },
  { text: '已完成', value: 'done' },
  { text: '已归档', value: 'archived' },
]

// 获取优先级颜色
function getPriorityColor(priority) {
  switch (Number(priority)) {
    case 3: return 'error'
    case 2: return 'warning'
    case 1: return 'success'
    default: return 'grey'
  }
}

// 获取优先级标签
function getPriorityLabel(priority) {
  switch (Number(priority)) {
    case 3: return '高'
    case 2: return '中'
    case 1: return '低'
    default: return '未设置'
  }
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return '未设置'
  
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 处理表单提交
async function handleFormSubmit() {
  console.log('表单提交按钮被点击')
  
  // 如果表单引用不存在
  if (!form.value) {
    console.error('表单实例不存在，无法提交表单')
    return
  }
  
  try {
    // 手动触发表单验证 - 等待Promise解析
    const { valid } = await form.value.validate()
    console.log('表单验证结果:', valid)
    
    if (!valid) {
      console.error('表单验证未通过，不能提交表单')
      return
    }
    
    // 检查标题是否为空
    if (!currentTodo.value.title || currentTodo.value.title.trim() === '') {
      console.error('标题为空，不能提交表单')
      return
    }
    
    // 根据编辑状态调用相应函数
    if (isEditing.value) {
      console.log('提交更新表单')
      await updateTodo()
    } else {
      console.log('提交新增表单')
      await addTodo()
    }
  } catch (error) {
    console.error('表单提交过程发生错误:', error)
  }
}

// 计算属性：筛选和搜索后的待办事项
const filteredTodos = computed(() => {
  // 直接使用API过滤后的结果
  return todoStore.getAllTodos
})

// 应用过滤器
function applyFilters() {
  // 转换filter.value为API需要的status参数
  let status = ''
  if (filter.value === 'pending' || filter.value === 'done' || filter.value === 'archived') {
    status = filter.value
  }
  
  fetchTodos({
    status,
    search: search.value,
    ordering: sortBy.value,
    page: 1 // 重置为第一页
  })
}

// 处理分页变化
function handlePageChange(page) {
  fetchTodos({ page })
}

// 封装获取待办事项的函数
async function fetchTodos(options = {}) {
  try {
    await todoStore.fetchTodos(options)
  } catch (error) {
    console.error('加载待办事项失败:', error)
  }
}

// 测试API连接
async function testApiConnection() {
  try {
    console.log('开始测试API连接 - 确认使用相对路径的代理请求')
    // 显示一个简单的提示
    alert('正在测试API连接，请查看控制台日志')
    
    // 测试1: 直接使用axios发送请求到代理路径
    console.log('测试1: 使用全局axios直接发送请求到/api/todos/')
    try {
      // 不设置baseURL，使用相对路径
      const response = await axios.get('/api/todos/')
      console.log('测试1结果:', response)
    } catch (error) {
      console.error('测试1失败:', error.message)
      console.log('错误详情:', error)
    }
    
    // 测试2: 使用http实例发送请求
    console.log('测试2: 使用TodoAPI直接添加一个待办事项')
    try {
      const testData = {
        title: `测试待办事项 ${new Date().toLocaleTimeString()}`,
        description: '这是一个使用TodoAPI添加的测试',
        priority: 3 // 高优先级，使用数字
      }
      
      const result = await TodoAPI.addTodo(
        testData.title,
        testData.description,
        { priority: testData.priority }
      )
      console.log('测试2结果:', result)
    } catch (error) {
      console.error('测试2失败:', error)
    }
    
    // 测试3: 尝试直接使用axios添加一个待办事项
    console.log('测试3: 直接使用axios添加待办事项')
    try {
      const testData = {
        title: `直接axios测试 ${new Date().toLocaleTimeString()}`,
        description: '这是一个使用axios直接添加的测试',
        priority: 2, // 中等优先级，使用数字
        status: 'pending'
      }
      
      // 直接使用axios尝试添加
      const addResponse = await axios.post('/api/todos/', testData)
      console.log('测试3结果:', addResponse)
    } catch (error) {
      console.error('测试3失败:', error.message)
      console.log('错误详情:', {
        config: error.config,
        response: error.response
      })
    }
    
    alert('API连接测试完成，请查看控制台日志')
  } catch (error) {
    console.error('API连接测试失败:', error)
    alert(`API连接测试失败: ${error.message}`)
  }
}

// 生命周期钩子
onMounted(async () => {
  try {
    await todoStore.fetchTodos({
      page: currentPage.value,
      pageSize
    })
  } catch (error) {
    console.error('加载待办事项失败:', error)
  }
})

// 方法
function openAddDialog() {
  isEditing.value = false
  currentTodo.value = {
    title: '',
    description: '',
    status: 'pending',
    priority: 2, // 中等优先级，使用数字
    due_date: null
  }
  dialog.value = true
}

function openEditDialog(todo) {
  isEditing.value = true
  currentTodo.value = { ...todo }
  dialog.value = true
}

function openDeleteDialog(todo) {
  currentTodo.value = { ...todo }
  deleteDialog.value = true
}

async function addTodo() {
  console.log('添加任务 - 表单引用对象:', form.value)
  
  // 确保表单实例存在
  if (!form.value) {
    console.error('表单实例不存在，无法进行验证')
    return
  }
  
  try {
    // 执行表单验证 - Vuetify 3中validate()返回Promise
    const { valid } = await form.value.validate()
    console.log('表单验证结果:', valid)
    
    if (!valid) {
      console.log('表单验证失败，不执行添加操作')
      return
    }
  } catch (error) {
    console.error('表单验证过程发生错误:', error)
    return
  }
  
  console.log('开始添加待办事项:', {
    title: currentTodo.value.title,
    description: currentTodo.value.description,
    priority: currentTodo.value.priority,
    due_date: currentTodo.value.due_date
  })
  
  try {
    // 使用计时器记录API调用耗时
    const startTime = performance.now()
    
    // 记录执行流程
    console.log('准备调用todoStore.addTodo方法')
    
    await todoStore.addTodo(
      currentTodo.value.title, 
      currentTodo.value.description,
      {
        priority: currentTodo.value.priority,
        due_date: currentTodo.value.due_date
      }
    )
    
    const endTime = performance.now()
    console.log(`添加待办事项API调用耗时: ${endTime - startTime}ms`)
    
    console.log('待办事项添加成功，关闭对话框')
    dialog.value = false
    
    // 刷新列表以获取最新数据
    console.log('添加成功，刷新任务列表')
    applyFilters()
  } catch (error) {
    console.error('添加待办事项失败:', error)
    console.log('错误详情:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      } : '无响应数据'
    })
  }
}

async function updateTodo() {
  console.log('表单引用对象:', form.value)
  
  // 确保表单实例存在
  if (!form.value) {
    console.error('表单实例不存在，无法进行验证')
    return
  }
  
  try {
    // 执行表单验证 - Vuetify 3中validate()返回Promise
    const { valid } = await form.value.validate()
    console.log('表单验证结果:', valid)
    
    if (!valid) {
      console.log('表单验证失败，不执行更新操作')
      return
    }
  } catch (error) {
    console.error('表单验证过程发生错误:', error)
    return
  }
  
  // 检查ID是否存在
  if (!currentTodo.value.id) {
    console.error('尝试更新待办事项时ID不存在:', currentTodo.value)
    return
  }
  
  console.log('开始更新待办事项:', {
    id: currentTodo.value.id,
    updates: {
      title: currentTodo.value.title,
      description: currentTodo.value.description,
      status: currentTodo.value.status,
      priority: currentTodo.value.priority,
      due_date: currentTodo.value.due_date
    }
  })
  
  try {
    // 创建更新对象，记录每一步
    const updates = {
      title: currentTodo.value.title,
      description: currentTodo.value.description,
      status: currentTodo.value.status,
      priority: currentTodo.value.priority,
      due_date: currentTodo.value.due_date
    }
    
    console.log(`准备调用todoStore.updateTodo(${currentTodo.value.id}, ${JSON.stringify(updates)})`)
    
    // 使用计时器记录API调用耗时
    const startTime = performance.now()
    
    const updatedTodo = await todoStore.updateTodo(currentTodo.value.id, updates)
    
    const endTime = performance.now()
    console.log(`API调用耗时: ${endTime - startTime}ms`)
    
    console.log('待办事项更新成功:', updatedTodo)
    dialog.value = false
    
    // 刷新列表以获取最新数据
    console.log('更新成功，刷新任务列表')
    applyFilters()
  } catch (error) {
    console.error('更新待办事项失败:', error)
    console.log('错误详情:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      } : '无响应数据'
    })
  }
}

async function deleteTodo() {
  try {
    await todoStore.deleteTodo(currentTodo.value.id)
    deleteDialog.value = false
  } catch (error) {
    console.error('删除待办事项失败:', error)
  }
}

async function toggleTodoStatus(todo) {
  try {
    await todoStore.toggleTodoStatus(todo.id)
    // 刷新列表以获取最新数据
    applyFilters()
  } catch (error) {
    console.error('更新待办事项状态失败:', error)
  }
}

// 将待办事项标记为已完成
async function completeTodo(todo) {
  try {
    await todoStore.completeTodo(todo.id)
    // 刷新列表以获取最新数据
    applyFilters()
  } catch (error) {
    console.error('标记待办事项为已完成失败:', error)
  }
}

// 重新打开已完成的待办事项
async function reopenTodo(todo) {
  try {
    await todoStore.reopenTodo(todo.id)
    // 刷新列表以获取最新数据
    applyFilters()
  } catch (error) {
    console.error('重新打开待办事项失败:', error)
  }
}

// 归档待办事项
async function archiveTodo(todo) {
  try {
    await todoStore.archiveTodo(todo.id)
    // 刷新列表以获取最新数据
    applyFilters()
  } catch (error) {
    console.error('归档待办事项失败:', error)
  }
}
</script>

<style scoped>
.completed-todo {
  opacity: 0.7;
}

.archived-todo {
  opacity: 0.5;
  background-color: #f5f5f5;
}
</style>

<route>
{
  meta: {
    requiresAuth: true,
    layout: 'default'
  }
}
</route>
