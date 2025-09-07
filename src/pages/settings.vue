<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-4">
          <h1 class="text-h4 font-weight-medium">
            <v-icon icon="mdi-cog" class="mr-2"></v-icon>
            设置
          </h1>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            variant="outlined"
            @click="confirmReset"
            class="ml-2"
            prepend-icon="mdi-refresh"
          >
            重置设置
          </v-btn>
        </div>

        <v-card class="mb-6" elevation="2" rounded="lg">
          <v-tabs
            v-model="activeTab"
            bg-color="primary"
            align-tabs="center"
            slider-color="white"
          >
            <v-tab value="todos" class="text-white">
              <v-icon icon="mdi-checkbox-marked-circle-outline" class="mr-2"></v-icon>
              待办事项
            </v-tab>
            <v-tab value="theme" class="text-white">
              <v-icon icon="mdi-palette" class="mr-2"></v-icon>
              主题
            </v-tab>
            <v-tab value="notifications" class="text-white">
              <v-icon icon="mdi-bell" class="mr-2"></v-icon>
              通知
            </v-tab>
          </v-tabs>

          <v-window v-model="activeTab">
            <!-- 待办事项设置 -->
            <v-window-item value="todos">
              <v-card-text class="pa-4">
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="todoSettings.defaultSortBy"
                      label="默认排序方式"
                      :items="sortOptions"
                      item-title="text"
                      item-value="value"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-sort"
                      @update:model-value="updateTodoSettings"
                      class="mb-4"
                    ></v-select>
                  </v-col>
                  
                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="todoSettings.completedTodosPosition"
                      label="已完成待办位置"
                      :items="completedPositionOptions"
                      item-title="text"
                      item-value="value"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-format-list-checks"
                      @update:model-value="updateTodoSettings"
                      class="mb-4"
                    ></v-select>
                  </v-col>
                  
                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="todoSettings.pageSize"
                      label="每页显示数量"
                      :items="pageSizeOptions"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-numeric"
                      @update:model-value="updateTodoSettings"
                      class="mb-4"
                    ></v-select>
                  </v-col>
                  
                  <v-col cols="12">
                    <v-divider class="mb-4"></v-divider>
                    <v-switch
                      v-model="todoSettings.showDateInfo"
                      label="显示待办日期信息"
                      color="primary"
                      hide-details
                      class="mb-2"
                      @update:model-value="updateTodoSettings"
                    ></v-switch>
                    
                    <v-switch
                      v-model="todoSettings.confirmDelete"
                      label="删除前确认"
                      color="primary"
                      hide-details
                      class="mb-2"
                      @update:model-value="updateTodoSettings"
                    ></v-switch>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-window-item>
            
            <!-- 主题设置 -->
            <v-window-item value="theme">
              <v-card-text class="pa-4">
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="themeSettings.mode"
                      label="主题模式"
                      :items="themeModeOptions"
                      item-title="text"
                      item-value="value"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-theme-light-dark"
                      @update:model-value="updateThemeSettings"
                      class="mb-4"
                    ></v-select>
                  </v-col>
                  
                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="themeSettings.primaryColor"
                      label="主题颜色"
                      :items="colorOptions"
                      item-title="text"
                      item-value="value"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-palette"
                      @update:model-value="updateThemeSettings"
                      class="mb-4"
                    >
                      <template v-slot:item="{ item, props }">
                        <v-list-item v-bind="props">
                          <template v-slot:prepend>
                            <v-avatar
                              :color="item.raw.value"
                              size="24"
                              class="mr-3"
                            ></v-avatar>
                          </template>
                          <v-list-item-title>{{ item.raw.text }}</v-list-item-title>
                        </v-list-item>
                      </template>
                    </v-select>
                  </v-col>
                  
                  <v-col cols="12">
                    <div class="d-flex justify-center mt-4">
                      <v-sheet
                        class="pa-6 rounded-lg text-center"
                        :color="themeSettings.primaryColor"
                        width="100%"
                        height="100"
                        elevation="3"
                      >
                        <span class="text-h6 text-white">预览主题颜色</span>
                      </v-sheet>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-window-item>
            
            <!-- 通知设置 -->
            <v-window-item value="notifications">
              <v-card-text class="pa-4">
                <v-row>
                  <v-col cols="12">
                    <v-switch
                      v-model="notificationSettings.enabled"
                      label="启用通知"
                      color="primary"
                      hide-details
                      class="mb-4"
                      @update:model-value="updateNotificationSettings"
                    ></v-switch>
                    
                    <v-divider class="my-4" v-if="notificationSettings.enabled"></v-divider>
                    
                    <div v-if="notificationSettings.enabled">
                      <v-row>
                        <v-col cols="12" sm="6">
                          <v-select
                            v-model="notificationSettings.push_channel"
                            label="通知渠道"
                            :items="pushChannelOptions"
                            item-title="text"
                            item-value="value"
                            variant="outlined"
                            density="comfortable"
                            prepend-inner-icon="mdi-message-settings-variant"
                            @update:model-value="updateNotificationSettings"
                            class="mb-4"
                          ></v-select>
                        </v-col>
                        
                        <v-col cols="12" sm="6">
                          <v-select
                            v-model="notificationSettings.position"
                            label="通知位置"
                            :items="notificationPositionOptions"
                            item-title="text"
                            item-value="value"
                            variant="outlined"
                            density="comfortable"
                            prepend-inner-icon="mdi-arrow-decision"
                            @update:model-value="updateNotificationSettings"
                            class="mb-4"
                          ></v-select>
                        </v-col>
                      </v-row>
                      
                      <v-card class="mb-4 pa-3" variant="outlined">
                        <v-card-title class="text-subtitle-1">提醒规则</v-card-title>
                        <v-card-text>
                          <v-row>
                            <v-col cols="12">
                              <v-switch
                                v-model="notificationSettings.enable_daily_reminder"
                                label="日常提醒"
                                color="primary"
                                hide-details
                                class="mb-3"
                                @update:model-value="updateNotificationSettings"
                              ></v-switch>
                              
                              <div v-if="notificationSettings.enable_daily_reminder" class="ml-8 mb-4">
                                <v-row>
                                  <v-col cols="12" sm="6">
                                    <v-slider
                                      v-model="notificationSettings.daily_reminder_hours"
                                      :min="1"
                                      :max="72"
                                      :step="1"
                                      label="提前小时数"
                                      thumb-label="always"
                                      @update:model-value="updateNotificationSettings"
                                    >
                                      <template v-slot:append>
                                        <v-text-field
                                          v-model="notificationSettings.daily_reminder_hours"
                                          type="number"
                                          style="width: 70px"
                                          density="compact"
                                          hide-details
                                          variant="outlined"
                                          @update:model-value="updateNotificationSettings"
                                        ></v-text-field>
                                      </template>
                                    </v-slider>
                                  </v-col>
                                  <v-col cols="12" sm="6">
                                    <v-text-field
                                      v-model="notificationSettings.daily_reminder_time"
                                      label="每日提醒时间"
                                      type="time"
                                      variant="outlined"
                                      density="compact"
                                      hint="设置每日固定提醒时间"
                                      persistent-hint
                                      @update:model-value="updateNotificationSettings"
                                    ></v-text-field>
                                  </v-col>
                                </v-row>
                              </div>
                              
                              <v-switch
                                v-model="notificationSettings.enable_soon_reminder"
                                label="较紧急提醒"
                                color="warning"
                                hide-details
                                class="mb-3"
                                @update:model-value="updateNotificationSettings"
                              ></v-switch>
                              
                              <div v-if="notificationSettings.enable_soon_reminder" class="ml-8 mb-4">
                                <v-slider
                                  v-model="notificationSettings.soon_reminder_hours"
                                  :min="1"
                                  :max="24"
                                  :step="1"
                                  label="提前小时数"
                                  thumb-label="always"
                                  color="warning"
                                  @update:model-value="updateNotificationSettings"
                                >
                                  <template v-slot:append>
                                    <v-text-field
                                      v-model="notificationSettings.soon_reminder_hours"
                                      type="number"
                                      style="width: 70px"
                                      density="compact"
                                      hide-details
                                      variant="outlined"
                                      @update:model-value="updateNotificationSettings"
                                    ></v-text-field>
                                  </template>
                                </v-slider>
                              </div>
                              
                              <v-switch
                                v-model="notificationSettings.enable_urgent_reminder"
                                label="紧急提醒"
                                color="error"
                                hide-details
                                class="mb-3"
                                @update:model-value="updateNotificationSettings"
                              ></v-switch>
                              
                              <div v-if="notificationSettings.enable_urgent_reminder" class="ml-8 mb-4">
                                <v-slider
                                  v-model="notificationSettings.urgent_reminder_hours"
                                  :min="1"
                                  :max="8"
                                  :step="1"
                                  label="提前小时数"
                                  thumb-label="always"
                                  color="error"
                                  @update:model-value="updateNotificationSettings"
                                >
                                  <template v-slot:append>
                                    <v-text-field
                                      v-model="notificationSettings.urgent_reminder_hours"
                                      type="number"
                                      style="width: 70px"
                                      density="compact"
                                      hide-details
                                      variant="outlined"
                                      @update:model-value="updateNotificationSettings"
                                    ></v-text-field>
                                  </template>
                                </v-slider>
                              </div>
                              
                              <v-switch
                                v-model="notificationSettings.enable_overdue_reminder"
                                label="过期提醒"
                                color="grey"
                                hide-details
                                class="mb-3"
                                @update:model-value="updateNotificationSettings"
                              ></v-switch>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                      
                      <div class="d-flex align-center mt-4">
                        <v-btn
                          color="info"
                          prepend-icon="mdi-bell-ring"
                          @click="testNotification"
                          class="mr-4"
                        >
                          测试通知
                        </v-btn>
                        
                        <v-btn
                          color="warning"
                          prepend-icon="mdi-refresh"
                          @click="resetNotificationSettings"
                          variant="outlined"
                        >
                          重置通知设置
                        </v-btn>
                        
                        <v-spacer></v-spacer>
                        
                        <v-btn
                          color="primary"
                          prepend-icon="mdi-content-save"
                          @click="syncNotificationSettings"
                        >
                          保存到服务器
                        </v-btn>
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-window-item>
          </v-window>
        </v-card>

        <!-- 提示信息 -->
        <v-alert
          type="info"
          border="start"
          icon="mdi-information"
          class="mb-4"
        >
          设置会自动保存，并应用于下一次使用。
        </v-alert>
      </v-col>
    </v-row>
    
    <!-- 确认重置设置对话框 -->
    <v-dialog v-model="resetDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">确认重置</v-card-title>
        <v-card-text>
          确定要将所有设置重置为默认值吗？此操作不可撤销。
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="resetDialog = false">取消</v-btn>
          <v-btn 
            color="error"
            @click="resetSettings"
          >
            重置
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- 提示消息 -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    >
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="snackbar.show = false"
        >
          关闭
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useRouter } from 'vue-router'

// 初始化 store
const settingsStore = useSettingsStore()
const router = useRouter()

// 组件状态
const activeTab = ref('todos')
const resetDialog = ref(false)
const snackbar = reactive({
  show: false,
  text: '',
  color: 'success',
  timeout: 3000
})

// 待办事项设置
const todoSettings = reactive({ ...settingsStore.getTodoSettings })

// 主题设置
const themeSettings = reactive({ ...settingsStore.getThemeSettings })

// 通知设置
const notificationSettings = reactive({ ...settingsStore.getNotificationSettings })

// 待办事项排序选项
const sortOptions = [
  { text: '创建时间 (新→旧)', value: '-created_at' },
  { text: '创建时间 (旧→新)', value: 'created_at' },
  { text: '更新时间 (新→旧)', value: '-updated_at' },
  { text: '截止日期 (近→远)', value: 'due_date' },
  { text: '优先级 (高→低)', value: '-priority' },
  { text: '优先级 (低→高)', value: 'priority' },
  { text: '状态 (未完成在前)', value: 'status,-priority' },
]

// 已完成待办位置选项
const completedPositionOptions = [
  { text: '在未完成待办下方', value: 'bottom' },
  { text: '按排序方式混合显示', value: 'inline' },
]

// 每页显示数量选项
const pageSizeOptions = [5, 10, 15, 20, 25, 50]

// 主题模式选项
const themeModeOptions = [
  { text: '浅色模式', value: 'light' },
  { text: '深色模式', value: 'dark' },
  { text: '跟随系统', value: 'system' },
]

// 颜色选项
const colorOptions = [
  { text: '蓝色', value: 'blue' },
  { text: '深蓝色', value: 'indigo' },
  { text: '紫色', value: 'purple' },
  { text: '粉色', value: 'pink' },
  { text: '红色', value: 'red' },
  { text: '橙色', value: 'orange' },
  { text: '黄色', value: 'amber' },
  { text: '绿色', value: 'green' },
  { text: '青色', value: 'teal' },
  { text: '灰色', value: 'grey' },
]

// 通知位置选项
const notificationPositionOptions = [
  { text: '右上角', value: 'top-right' },
  { text: '右下角', value: 'bottom-right' },
  { text: '左上角', value: 'top-left' },
  { text: '左下角', value: 'bottom-left' },
  { text: '顶部中央', value: 'top-center' },
  { text: '底部中央', value: 'bottom-center' },
]

// 通知渠道选项
const pushChannelOptions = [
  { text: '微信', value: 'wechat' },
  { text: '钉钉', value: 'dingtalk' },
  { text: '全部渠道', value: 'both' },
  { text: '不使用外部推送', value: 'none' },
]

// 更新待办事项设置
function updateTodoSettings() {
  settingsStore.updateTodoSettings({
    defaultSortBy: todoSettings.defaultSortBy,
    completedTodosPosition: todoSettings.completedTodosPosition,
    showDateInfo: todoSettings.showDateInfo,
    confirmDelete: todoSettings.confirmDelete,
    pageSize: todoSettings.pageSize
  })
  
  showNotification('待办事项设置已更新')
}

// 更新主题设置
function updateThemeSettings() {
  settingsStore.updateThemeSettings({
    mode: themeSettings.mode,
    primaryColor: themeSettings.primaryColor
  })
  
  // TODO: 应用主题变更
  showNotification('主题设置已更新')
}

// 引入通知API
import { NotificationAPI } from '@/api/notification'

// 更新通知设置
function updateNotificationSettings() {
  // 仅在本地更新，不发送API请求
  settingsStore.updateNotificationSettings({
    enabled: notificationSettings.enabled,
    position: notificationSettings.position,
    push_channel: notificationSettings.push_channel,
    enable_daily_reminder: notificationSettings.enable_daily_reminder,
    enable_soon_reminder: notificationSettings.enable_soon_reminder,
    enable_urgent_reminder: notificationSettings.enable_urgent_reminder,
    enable_overdue_reminder: notificationSettings.enable_overdue_reminder,
    daily_reminder_hours: Number(notificationSettings.daily_reminder_hours),
    soon_reminder_hours: Number(notificationSettings.soon_reminder_hours),
    urgent_reminder_hours: Number(notificationSettings.urgent_reminder_hours),
    daily_reminder_time: notificationSettings.daily_reminder_time
  })
  
  showNotification('通知设置已本地更新')
}

// 同步通知设置到服务器
async function syncNotificationSettings() {
  try {
    // 确保数值类型正确
    const settings = {
      push_channel: notificationSettings.push_channel,
      enable_daily_reminder: notificationSettings.enable_daily_reminder,
      enable_soon_reminder: notificationSettings.enable_soon_reminder,
      enable_urgent_reminder: notificationSettings.enable_urgent_reminder,
      enable_overdue_reminder: notificationSettings.enable_overdue_reminder,
      daily_reminder_hours: Number(notificationSettings.daily_reminder_hours),
      soon_reminder_hours: Number(notificationSettings.soon_reminder_hours),
      urgent_reminder_hours: Number(notificationSettings.urgent_reminder_hours),
      daily_reminder_time: notificationSettings.daily_reminder_time
    }
    
    // 发送更新请求 - 不再使用ID
    const response = await NotificationAPI.updateSettings(settings)
    
    // 更新本地设置
    Object.assign(notificationSettings, response)
    
    // 更新store中的设置
    settingsStore.updateNotificationSettings(notificationSettings)
    
    showNotification('通知设置已保存到服务器', 'success')
  } catch (error) {
    console.error('同步通知设置失败', error)
    showNotification('保存设置到服务器失败: ' + (error.message || '未知错误'), 'error')
  }
}

// 重置通知设置
async function resetNotificationSettings() {
  try {
    // 使用更新后的API - 不再使用特定URL而是通过参数指定action
    const response = await NotificationAPI.resetSettings()
    
    // 更新本地设置
    Object.assign(notificationSettings, response)
    
    // 更新store中的设置
    settingsStore.updateNotificationSettings(notificationSettings)
    
    showNotification('通知设置已重置为默认值', 'info')
  } catch (error) {
    console.error('重置通知设置失败', error)
    showNotification('重置通知设置失败: ' + (error.message || '未知错误'), 'error')
  }
}

// 确认重置设置
function confirmReset() {
  resetDialog.value = true
}

// 重置所有设置
function resetSettings() {
  settingsStore.resetSettings()
  
  // 更新本地状态
  Object.assign(todoSettings, settingsStore.getTodoSettings)
  Object.assign(themeSettings, settingsStore.getThemeSettings)
  Object.assign(notificationSettings, settingsStore.getNotificationSettings)
  
  resetDialog.value = false
  showNotification('所有设置已重置为默认值', 'info')
}

// 测试通知
function testNotification() {
  showNotification('这是一条测试通知', 'success')
}

// 显示通知
function showNotification(text, color = 'success', timeout = 3000) {
  snackbar.show = true
  snackbar.text = text
  snackbar.color = color
  snackbar.timeout = timeout
}

// 从API加载通知设置
async function loadNotificationSettings() {
  try {
    const settings = await NotificationAPI.getSettings()
    
    // 更新本地设置
    Object.assign(notificationSettings, settings)
    
    // 更新store中的设置
    settingsStore.updateNotificationSettings(notificationSettings)
    
    return settings
  } catch (error) {
    console.error('加载通知设置失败', error)
    showNotification('加载通知设置失败: ' + (error.message || '未知错误'), 'error')
    return null
  }
}

// 生命周期钩子
onMounted(async () => {
  // 页面加载完成
  await loadNotificationSettings()
})
</script>

<style scoped>
.v-card-text {
  padding-top: 24px !important;
}

.theme-preview {
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
  text-align: center;
}
</style>

<route>
{
  meta: {
    requiresAuth: true,
    layout: 'default',
    title: '设置'
  }
}
</route>
