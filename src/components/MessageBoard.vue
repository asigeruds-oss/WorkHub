<template>
  <div class="message-board-container">
    <!-- 留言表单区域 -->
    <v-card class="mb-6 message-form-card">
      <v-card-title class="text-h6 font-weight-bold">
        留言板
        <v-spacer></v-spacer>
        <v-btn
          icon
          @click="showForm = !showForm"
          :aria-label="showForm ? '收起留言表单' : '展开留言表单'"
        >
          <v-icon>{{ showForm ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
        </v-btn>
      </v-card-title>
      
      <v-expand-transition>
        <div v-if="showForm">
          <v-card-text>
            <v-form ref="messageForm" v-model="valid" @submit.prevent="submitMessage">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="message.nickname"
                    label="昵称"
                    outlined
                    dense
                    :readonly="loading"
                    :rules="[rules.required]"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="message.color"
                    :items="colorOptions"
                    label="留言颜色"
                    outlined
                    dense
                    :disabled="loading"
                  ></v-select>
                </v-col>
              </v-row>
              
              <v-textarea
                v-model="message.content"
                label="留言内容"
                outlined
                dense
                :readonly="loading"
                :rules="[rules.required, rules.maxLength]"
                rows="3"
                counter="100"
              ></v-textarea>
              
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  text
                  color="grey darken-1"
                  @click="resetForm"
                  :disabled="loading"
                >
                  清空
                </v-btn>
                <v-btn
                  color="primary"
                  type="submit"
                  :loading="loading"
                  :disabled="!valid"
                >
                  发送留言
                </v-btn>
              </v-card-actions>
            </v-form>
          </v-card-text>
        </div>
      </v-expand-transition>
    </v-card>
    
    <!-- 留言飞过效果展示区域 -->
    <div class="message-fly-container" ref="flyContainer">
      <transition-group name="fly-message" tag="div">
        <div 
          v-for="msg in displayMessages" 
          :key="msg.id" 
          class="flying-message"
          :class="[`flying-message-${msg.position}`]"
          :style="{ 
            color: msg.color, 
            animationDuration: `${msg.duration}s`,
            top: `${msg.top}%`
          }"
        >
          <span class="nickname">{{ msg.nickname }}:</span>
          {{ msg.content }}
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'

// 表单状态
const messageForm = ref(null)
const valid = ref(false)
const loading = ref(false)
const showForm = ref(true)

// 留言数据
const message = reactive({
  nickname: '',
  content: '',
  color: '#1976D2' // 默认蓝色
})

// 颜色选项
const colorOptions = [
  { text: '蓝色', value: '#1976D2' },
  { text: '红色', value: '#F44336' },
  { text: '绿色', value: '#4CAF50' },
  { text: '紫色', value: '#9C27B0' },
  { text: '橙色', value: '#FF9800' },
]

// 验证规则
const rules = {
  required: v => !!v || '此字段为必填项',
  maxLength: v => (v && v.length <= 100) || '留言不能超过100个字符'
}

// 飞过的留言数据
const messages = ref([])
const displayMessages = ref([])
const maxDisplayMessages = 10
const flyContainer = ref(null)

// 随机ID生成
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 提交留言
async function submitMessage() {
  if (!messageForm.value.validate()) {
    return
  }
  
  loading.value = true
  
  try {
    // 创建新留言对象
    const newMessage = {
      id: generateId(),
      nickname: message.nickname,
      content: message.content,
      color: message.color,
      timestamp: new Date(),
      position: Math.floor(Math.random() * 3), // 0, 1, 2 对应不同的轨道
      duration: 5 + Math.random() * 10, // 5-15秒随机飞过时间
      top: 10 + Math.floor(Math.random() * 60) // 10%-70%的随机位置
    }
    
    // 添加到消息列表
    messages.value.push(newMessage)
    
    // 添加到显示列表
    addMessageToDisplay(newMessage)
    
    // 重置表单
    resetForm()
    
    // 收起表单
    showForm.value = false
    
    // 模拟消息发送成功
    setTimeout(() => {
      loading.value = false
    }, 500)
  } catch (error) {
    console.error('发送留言失败:', error)
    loading.value = false
  }
}

// 添加消息到显示列表
function addMessageToDisplay(msg) {
  if (displayMessages.value.length >= maxDisplayMessages) {
    // 如果已达到最大显示数量，移除最旧的一条
    displayMessages.value.shift()
  }
  displayMessages.value.push(msg)
  
  // 设置自动移除定时器
  setTimeout(() => {
    displayMessages.value = displayMessages.value.filter(m => m.id !== msg.id)
  }, msg.duration * 1000)
}

// 重置表单
function resetForm() {
  message.content = ''
  
  // 重置表单验证状态
  if (messageForm.value) {
    messageForm.value.resetValidation()
  }
}

// 随机生成和添加留言的定时器
let messageTimer = null

// 随机添加一些预设留言用于演示
const demoMessages = [
  { nickname: '快乐的小鸟', content: '这个工具真的太棒了！谢谢开发者！', color: '#4CAF50' },
  { nickname: '学习达人', content: '希望能增加更多模板，非常实用', color: '#1976D2' },
  { nickname: '小明同学', content: '请假条格式很规范，老师一看就通过了', color: '#F44336' },
  { nickname: '彩虹', content: '网站UI很漂亮，体验很好', color: '#9C27B0' },
  { nickname: '路人甲', content: '希望能够添加更多院系的信息', color: '#FF9800' },
  { nickname: '懒懒熊', content: '能不能增加一个历史记录功能？', color: '#795548' },
  { nickname: '未来星', content: '第一次使用，很方便！', color: '#607D8B' },
  { nickname: '班长', content: '同学们可以放心使用，格式符合要求', color: '#009688' }
]

// 随机生成一条演示留言
function generateDemoMessage() {
  const randomIndex = Math.floor(Math.random() * demoMessages.length)
  const demoMsg = demoMessages[randomIndex]
  
  const newMessage = {
    id: generateId(),
    nickname: demoMsg.nickname,
    content: demoMsg.content,
    color: demoMsg.color,
    timestamp: new Date(),
    position: Math.floor(Math.random() * 3),
    duration: 8 + Math.random() * 7, // 8-15秒
    top: 10 + Math.floor(Math.random() * 60)
  }
  
  messages.value.push(newMessage)
  addMessageToDisplay(newMessage)
}

onMounted(() => {
  // 初始显示几条随机留言
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      generateDemoMessage()
    }, i * 1500)
  }
  
  // 设置定时器，每隔一段时间随机生成一条留言
  messageTimer = setInterval(() => {
    if (Math.random() > 0.3) { // 70%的几率生成一条新留言
      generateDemoMessage()
    }
  }, 5000)
})

onBeforeUnmount(() => {
  // 清除定时器
  if (messageTimer) {
    clearInterval(messageTimer)
  }
})
</script>

<style scoped>
.message-board-container {
  position: relative;
  width: 100%;
  min-height: 300px;
}

.message-form-card {
  background-color: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 1rem;
}

.message-fly-container {
  position: relative;
  width: 100%;
  height: 250px;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  overflow: hidden;
  margin-top: 1rem;
  border: 1px solid #e0e0e0;
}

.flying-message {
  position: absolute;
  white-space: nowrap;
  padding: 6px 12px;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  max-width: 90%;
  overflow: hidden;
  text-overflow: ellipsis;
  animation: fly-across linear;
  transform: translateX(100%);
}

.flying-message-0 {
  top: 20%;
}

.flying-message-1 {
  top: 40%;
}

.flying-message-2 {
  top: 60%;
}

.nickname {
  font-weight: bold;
  margin-right: 4px;
}

/* 飞过动画 */
@keyframes fly-across {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-120%);
  }
}

/* 进入和离开动画 */
.fly-message-enter-active {
  animation: fly-across linear;
}

.fly-message-leave-active {
  animation: fly-across linear;
  opacity: 0;
  transition: opacity 0.5s;
}

.fly-message-enter-from {
  transform: translateX(100%);
}

.fly-message-leave-to {
  opacity: 0;
}
</style>
