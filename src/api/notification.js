import http from './http'

/**
 * 通知设置相关的API服务
 */
export const NotificationAPI = {
  /**
   * 获取通知设置
   * @returns {Promise<Object>} - 返回通知设置对象
   */
  async getSettings() {
    try {
      const response = await http.get('/api/notification-settings/')
      return response.data
    } catch (error) {
      console.error('获取通知设置失败:', error)
      throw error
    }
  },

  /**
   * 更新通知设置
   * @param {Object} settings - 通知设置
   * @returns {Promise<Object>} - 返回更新后的通知设置
   */
  async updateSettings(settings) {
    try {
      const response = await http.put('/api/notification-settings/', settings)
      return response.data
    } catch (error) {
      console.error('更新通知设置失败:', error)
      throw error
    }
  },

  /**
   * 部分更新通知设置
   * @param {Object} settings - 要更新的通知设置字段
   * @returns {Promise<Object>} - 返回更新后的通知设置
   */
  async patchSettings(settings) {
    try {
      const response = await http.patch('/api/notification-settings/', settings)
      return response.data
    } catch (error) {
      console.error('部分更新通知设置失败:', error)
      throw error
    }
  },

  /**
   * 重置通知设置为默认值
   * @returns {Promise<Object>} - 返回重置后的通知设置
   */
  async resetSettings() {
    try {
      const response = await http.post('/api/notification-settings/', { action: 'reset' })
      return response.data
    } catch (error) {
      console.error('重置通知设置失败:', error)
      throw error
    }
  }
}
