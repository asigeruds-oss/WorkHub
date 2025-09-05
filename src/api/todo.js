import http from './http'
import axios from 'axios'

/**
 * Todo相关的API服务
 */
export const TodoAPI = {
  /**
   * 获取所有待办事项
   * @param {Object} options - 查询选项
   * @param {string} options.search - 搜索关键词
   * @param {string} options.ordering - 排序字段
   * @param {number} options.page - 页码
   * @param {number} options.pageSize - 每页数量
   * @returns {Promise<Array>} - 返回待办事项列表
   */
  async getTodos(options = {}) {
    try {
      const { search, ordering, page, pageSize, status } = options
      
      // 构建查询参数
      const params = {}
      if (search) params.search = search
      if (ordering) params.ordering = ordering
      if (page) params.page = page
      if (pageSize) params.page_size = pageSize
      if (status) params.status = status
      
      console.log('[TodoAPI] 获取待办事项，查询参数:', params)
      
      // 使用axios而不是http实例
      const response = await axios.get('/api/todos/', { params })
      
      // 输出原始响应结构，便于调试
      console.log('[TodoAPI] 待办事项API响应:', response)
      
      // 处理DRF返回的数据格式，数据可能在data字段中
      const todos = response.data.data || response.data.results || response.data
      console.log('解析后的待办事项数据:', todos)
      
      return {
        items: todos,
        pagination: {
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous
        }
      }
    } catch (error) {
      console.error('获取待办事项失败:', error)
      throw error
    }
  },

  /**
   * 添加新的待办事项
   * @param {string} title - 标题
   * @param {string} description - 描述
   * @param {Object} additionalData - 额外数据（优先级、截止日期等）
   * @returns {Promise<Object>} - 返回新建的待办事项
   */
  async addTodo(title, description = '', additionalData = {}) {
    console.log(`[TodoAPI] 开始添加待办事项，标题: "${title}"，描述长度: ${description.length}，附加数据:`, additionalData)
    
    try {
      const todoData = {
        title,
        description,
        status: 'pending',
        ...additionalData
      }
      
      console.log(`[TodoAPI] 准备发送POST请求到 /api/todos/，数据:`, todoData)
      
      const startTime = performance.now()
      
      // 在请求之前检查当前的token
      const currentToken = localStorage.getItem('accessToken')
      console.log(`[TodoAPI] 当前token ${currentToken ? '存在' : '不存在'}${currentToken ? '，长度: ' + currentToken.length : ''}`)
      
      // 直接使用axios发送请求，确保代理正常工作
      console.log('[TodoAPI] 使用axios.post直接发送请求，不使用http实例')
      const response = await axios.post('/api/todos/', todoData).catch(err => {
        console.error('[TodoAPI] HTTP请求出错:', err)
        throw err
      })
      
      const endTime = performance.now()
      console.log(`[TodoAPI] 添加待办事项请求耗时: ${endTime - startTime}ms`)
      console.log('[TodoAPI] 服务器响应:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      })
      
      // 处理DRF返回的数据格式，数据可能在data字段中
      const result = response.data.data || response.data
      console.log('[TodoAPI] 处理后返回的数据:', result)
      
      return result
    } catch (error) {
      console.error('[TodoAPI] 添加待办事项失败:', {
        name: error.name,
        message: error.message,
        config: error.config ? {
          url: error.config.url,
          method: error.config.method,
          baseURL: error.config.baseURL,
          headers: error.config.headers
        } : '无请求配置',
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : '无响应数据'
      })
      throw error
    }
  },

  /**
   * 更新待办事项
   * @param {number} id - 待办事项ID
   * @param {Object} updates - 需要更新的字段
   * @returns {Promise<Object>} - 返回更新后的待办事项
   */
  async updateTodo(id, updates) {
    console.log(`[TodoAPI] 开始更新待办事项 ID:${id}，更新内容:`, updates)
    
    if (!id) {
      console.error('[TodoAPI] 更新待办事项时ID不存在')
      throw new Error('更新待办事项时ID不存在')
    }
    
    try {
      // 确保使用正确的相对路径，以便Vite代理生效
      const requestUrl = `/api/todos/${id}/`
      console.log(`[TodoAPI] 发送PATCH请求到相对路径: ${requestUrl}`)
      console.log(`[TodoAPI] 请求体: ${JSON.stringify(updates)}`)
      
      const startTime = performance.now()
      
      // 尝试使用axios直接发送，确保代理正常工作
      console.log('[TodoAPI] 使用axios.patch而不是http.patch尝试发送请求')
      const response = await axios.patch(requestUrl, updates)
      
      const endTime = performance.now()
      console.log(`[TodoAPI] API请求耗时: ${endTime - startTime}ms`)
      console.log('[TodoAPI] 服务器响应:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      })
      
      // 处理DRF返回的数据格式，数据可能在data字段中
      const result = response.data.data || response.data
      console.log('[TodoAPI] 处理后返回的数据:', result)
      
      return result
    } catch (error) {
      console.error('[TodoAPI] 更新待办事项失败:', {
        name: error.name,
        message: error.message,
        config: error.config ? {
          url: error.config.url,
          method: error.config.method,
          baseURL: error.config.baseURL,
          headers: error.config.headers
        } : '无请求配置',
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : '无响应数据'
      })
      throw error
    }
  },

  /**
   * 删除待办事项
   * @param {number} id - 待办事项ID
   * @returns {Promise<void>}
   */
  async deleteTodo(id) {
    try {
      console.log(`[TodoAPI] 开始删除待办事项 ID:${id}`)
      
      const requestUrl = `/api/todos/${id}/`
      console.log(`[TodoAPI] 发送DELETE请求到: ${requestUrl}`)
      
      // 使用axios发送请求
      const response = await axios.delete(requestUrl)
      console.log(`[TodoAPI] 删除成功，响应状态:`, response.status)
      
      return response.data
    } catch (error) {
      console.error('[TodoAPI] 删除待办事项失败:', error)
      throw error
    }
  },
  
  /**
   * 测试API连接
   * @returns {Promise<Object>} 测试结果
   */
  async testConnection() {
    console.log('[TodoAPI] 开始测试API连接')
    try {
      // 尝试发送一个简单的GET请求到API根路径
      const startTime = performance.now()
      
      // 直接使用axios而不是http实例来测试是否是实例问题
      const axiosResponse = await axios.get('/api')
        .catch(err => {
          console.log('[TodoAPI] 直接使用axios的请求失败:', err.message)
          return { status: 'axios失败', error: err.message }
        })
      
      // 使用http实例测试
      const httpResponse = await http.get('/api')
        .catch(err => {
          console.log('[TodoAPI] 使用http实例的请求失败:', err.message)
          return { status: 'http实例失败', error: err.message }
        })
      
      const endTime = performance.now()
      
      return {
        axiosTest: axiosResponse,
        httpTest: httpResponse,
        time: endTime - startTime,
        httpInstance: !!http,
        axiosInstance: !!axios
      }
    } catch (error) {
      console.error('[TodoAPI] 测试连接失败:', error)
      return {
        status: 'error',
        message: error.message,
        stack: error.stack
      }
    }
  },
  
  /**
   * 将待办事项标记为已完成
   * @param {number} id - 待办事项ID
   * @returns {Promise<Object>} - 返回更新后的待办事项
   */
  async completeTodo(id) {
    try {
      console.log(`[TodoAPI] 将待办事项ID:${id}标记为已完成`)
      const response = await axios.post(`/api/todos/${id}/complete/`)
      console.log('[TodoAPI] 完成操作响应:', response.status)
      return response.data.data || response.data
    } catch (error) {
      console.error('[TodoAPI] 将待办事项标记为已完成失败:', error)
      throw error
    }
  },

  /**
   * 重新打开已完成的待办事项
   * @param {number} id - 待办事项ID
   * @returns {Promise<Object>} - 返回更新后的待办事项
   */
  async reopenTodo(id) {
    try {
      console.log(`[TodoAPI] 重新打开待办事项ID:${id}`)
      const response = await axios.post(`/api/todos/${id}/reopen/`)
      console.log('[TodoAPI] 重新打开操作响应:', response.status)
      return response.data.data || response.data
    } catch (error) {
      console.error('[TodoAPI] 重新打开待办事项失败:', error)
      throw error
    }
  },

  /**
   * 归档待办事项
   * @param {number} id - 待办事项ID
   * @returns {Promise<Object>} - 返回更新后的待办事项
   */
  async archiveTodo(id) {
    try {
      console.log(`[TodoAPI] 归档待办事项ID:${id}`)
      const response = await axios.post(`/api/todos/${id}/archive/`)
      console.log('[TodoAPI] 归档操作响应:', response.status)
      return response.data.data || response.data
    } catch (error) {
      console.error('[TodoAPI] 归档待办事项失败:', error)
      throw error
    }
  }
}
