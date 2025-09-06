import { defineStore } from 'pinia'

// 从 localStorage 获取保存的设置，如果没有则使用默认值
const getStoredSettings = () => {
  try {
    const settings = localStorage.getItem('app_settings')
    return settings ? JSON.parse(settings) : null
  } catch (error) {
    console.error('读取设置失败:', error)
    return null
  }
}

export const useSettingsStore = defineStore('settings', {
  state: () => {
    // 获取存储的设置或使用默认值
    const storedSettings = getStoredSettings()
    
    return {
      // 待办事项设置
      todos: {
        defaultSortBy: storedSettings?.todos?.defaultSortBy || 'status,-priority', // 默认排序方式
        completedTodosPosition: storedSettings?.todos?.completedTodosPosition || 'bottom', // 已完成待办的位置: 'bottom' 或 'inline'
        showDateInfo: storedSettings?.todos?.showDateInfo !== false, // 是否显示日期信息
        confirmDelete: storedSettings?.todos?.confirmDelete !== false, // 删除前是否确认
        pageSize: storedSettings?.todos?.pageSize || 10, // 每页显示数量
      },
      // 主题设置
      theme: {
        mode: storedSettings?.theme?.mode || 'system', // 'light', 'dark', 'system'
        primaryColor: storedSettings?.theme?.primaryColor || 'blue', // 主题色
      },
      // 通知设置
      notifications: {
        enabled: storedSettings?.notifications?.enabled !== false, // 是否启用通知
        position: storedSettings?.notifications?.position || 'bottom-right', // 通知位置
      }
    }
  },
  getters: {
    getTodoSettings: (state) => state.todos,
    getThemeSettings: (state) => state.theme,
    getNotificationSettings: (state) => state.notifications,
  },
  actions: {
    // 更新待办事项设置
    updateTodoSettings(settings) {
      this.todos = { ...this.todos, ...settings }
      this.saveSettings()
    },
    
    // 更新主题设置
    updateThemeSettings(settings) {
      this.theme = { ...this.theme, ...settings }
      this.saveSettings()
    },
    
    // 更新通知设置
    updateNotificationSettings(settings) {
      this.notifications = { ...this.notifications, ...settings }
      this.saveSettings()
    },
    
    // 保存设置到 localStorage
    saveSettings() {
      const settings = {
        todos: this.todos,
        theme: this.theme,
        notifications: this.notifications
      }
      
      try {
        localStorage.setItem('app_settings', JSON.stringify(settings))
      } catch (error) {
        console.error('保存设置失败:', error)
      }
    },
    
    // 重置所有设置为默认值
    resetSettings() {
      this.$reset()
      this.saveSettings()
    }
  }
})
