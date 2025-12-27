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
      // 通知设置
      notifications: {
        enabled: storedSettings?.notifications?.enabled !== false,
        push_channel: storedSettings?.notifications?.push_channel || 'dingtalk',
        enable_daily_reminder: storedSettings?.notifications?.enable_daily_reminder !== false,
        enable_soon_reminder: storedSettings?.notifications?.enable_soon_reminder !== false,
        enable_urgent_reminder: storedSettings?.notifications?.enable_urgent_reminder !== false,
        enable_overdue_reminder: storedSettings?.notifications?.enable_overdue_reminder !== false,
        daily_reminder_hours: storedSettings?.notifications?.daily_reminder_hours || 24,
        soon_reminder_hours: storedSettings?.notifications?.soon_reminder_hours || 4,
        urgent_reminder_hours: storedSettings?.notifications?.urgent_reminder_hours || 2,
        daily_reminder_time: storedSettings?.notifications?.daily_reminder_time || '09:00'
      }
    }
  },
  getters: {
    getNotificationSettings: (state) => state.notifications,
  },
  actions: {
    // 更新通知设置
    updateNotificationSettings(settings) {
      this.notifications = { ...this.notifications, ...settings }
      this.saveSettings()
    },
    
    // 保存设置到 localStorage
    saveSettings() {
      const settings = {
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

