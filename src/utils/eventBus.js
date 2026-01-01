import { reactive } from 'vue'

/**
 * 简单的事件总线，用于组件间通信
 */
export const eventBus = reactive({
  /**
   * 事件处理器存储
   */
  _handlers: {},
  
  /**
   * 注册事件处理器
   * @param {string} event - 事件名称
   * @param {Function} handler - 事件处理函数
   */
  on(event, handler) {
    if (!this._handlers[event]) {
      this._handlers[event] = []
    }
    this._handlers[event].push(handler)
  },
  
  /**
   * 移除事件处理器
   * @param {string} event - 事件名称
   * @param {Function} [handler] - 事件处理函数，如果不提供则移除所有该事件的处理器
   */
  off(event, handler) {
    if (!this._handlers[event]) return
    
    if (!handler) {
      delete this._handlers[event]
      return
    }
    
    this._handlers[event] = this._handlers[event].filter(h => h !== handler)
  },
  
  /**
   * 触发事件
   * @param {string} event - 事件名称
   * @param {*} [payload] - 事件数据
   */
  emit(event, payload) {
    if (!this._handlers[event]) return
    
    this._handlers[event].forEach(handler => {
      try {
        handler(payload)
      } catch (error) {
        console.error(`[事件总线] 处理事件 ${event} 时出错:`, error)
      }
    })
  }
})
