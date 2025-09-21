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
   * @param {number} options.page - 页码
   * @param {number} options.pageSize - 每页数量
   * @param {string} options.status - 状态过滤
   * @returns {Promise<Array>} - 返回待办事项列表
   */
  async getTodos(options = {}) {
    try {
      const { search, page, pageSize, status } = options
      
      // 构建查询参数
      const params = {}
      if (search) params.search = search
      if (page) params.page = page
      if (pageSize) params.page_size = pageSize
      if (status) params.status = status
      
      console.log('[TodoAPI] 获取待办事项，查询参数:', params)
      
      // 使用axios而不是http实例
      const response = await axios.get('/api/todos/', { params })
      
      // 输出原始响应结构，便于调试
      console.log('[TodoAPI] 待办事项API响应:', response)
      
      // 直接返回后端的标准响应格式，不需要额外处理
      return response.data
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
    try {
      const todoData = {
        title,
        description,
        status: 'pending',
        ...additionalData
      }
      
      
      const startTime = performance.now()
      
      // 在请求之前检查当前的token
      const currentToken = localStorage.getItem('accessToken')
      
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
      const response = await axios.post(`/api/todos/${id}/archive/`)
      return response.data.data || response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * 获取子待办事项列表
   * @param {number} parentId - 父待办事项ID
   * @returns {Promise<Array>} - 返回子待办事项列表
   */
  async getSubTodos(parentId) {
    try {
      console.log(`[TodoAPI] 获取待办事项ID:${parentId}的子待办列表`)
      const response = await axios.get(`/api/todos/${parentId}/subtodos/`)
      console.log('[TodoAPI] 获取子待办列表响应:', response.status, response.data)
      
      // 处理返回数据
      let subTodos = []
      if (response.data.results && Array.isArray(response.data.results)) {
        subTodos = response.data.results
      } else if (response.data.data && Array.isArray(response.data.data)) {
        subTodos = response.data.data
      } else if (Array.isArray(response.data)) {
        subTodos = response.data
      }
      
      return subTodos
    } catch (error) {
      console.error('[TodoAPI] 获取子待办事项失败:', error)
      throw error
    }
  },

  /**
   * 添加子待办事项
   * @param {number} parentId - 父待办事项ID
   * @param {string} title - 子待办标题
   * @param {string} description - 子待办描述
   * @param {Object} additionalData - 额外数据
   * @returns {Promise<Object>} - 返回新建的子待办事项
   */
  async addSubTodo(parentId, title, description = '', additionalData = {}) {
    try {
      console.log(`[TodoAPI] 添加子待办到待办事项ID:${parentId}，标题:"${title}"`)
      
      const subTodoData = {
        title,
        description,
        status: 'pending',
        ...additionalData
      }
      
      const response = await axios.post(`/api/todos/${parentId}/subtodos/`, subTodoData)
      console.log('[TodoAPI] 添加子待办响应:', response.status, response.data)
      
      return response.data.data || response.data
    } catch (error) {
      console.error('[TodoAPI] 添加子待办事项失败:', error)
      throw error
    }
  },

  /**
   * 更新子待办事项
   * @param {number} parentId - 父待办事项ID
   * @param {number} subTodoId - 子待办事项ID
   * @param {Object} updates - 需要更新的字段
   * @returns {Promise<Object>} - 返回更新后的子待办事项
   */
  async updateSubTodo(parentId, subTodoId, updates) {
    try {
      console.log(`[TodoAPI] 更新待办事项ID:${parentId}的子待办ID:${subTodoId}，更新内容:`, updates)
      const response = await axios.patch(`/api/todos/${parentId}/subtodos/${subTodoId}/`, updates)
      console.log('[TodoAPI] 更新子待办响应:', response.status, response.data)
      
      return response.data.data || response.data
    } catch (error) {
      console.error('[TodoAPI] 更新子待办事项失败:', error)
      throw error
    }
  },

  /**
   * 删除子待办事项
   * @param {number} parentId - 父待办事项ID
   * @param {number} subTodoId - 子待办事项ID
   * @returns {Promise<void>}
   */
  async deleteSubTodo(parentId, subTodoId) {
    try {
      console.log(`[TodoAPI] 删除待办事项ID:${parentId}的子待办ID:${subTodoId}`)
      const response = await axios.delete(`/api/todos/${parentId}/subtodos/${subTodoId}/`)
      console.log('[TodoAPI] 删除子待办响应:', response.status)
      
      return response.data
    } catch (error) {
      console.error('[TodoAPI] 删除子待办事项失败:', error)
      throw error
    }
  },

  /**
   * 将子待办事项标记为已完成
   * @param {number} parentId - 父待办事项ID
   * @param {number} subTodoId - 子待办事项ID
   * @returns {Promise<Object>} - 返回更新后的子待办事项
   */
  async completeSubTodo(parentId, subTodoId) {
    try {
      console.log(`[TodoAPI] 将待办事项ID:${parentId}的子待办ID:${subTodoId}标记为已完成`)
      const response = await axios.post(`/api/todos/${parentId}/subtodos/${subTodoId}/complete/`)
      console.log('[TodoAPI] 完成子待办操作响应:', response.status)
      
      return response.data.data || response.data
    } catch (error) {
      console.error('[TodoAPI] 将子待办事项标记为已完成失败:', error)
      throw error
    }
  },

  /**
   * 重新打开已完成的子待办事项
   * @param {number} parentId - 父待办事项ID
   * @param {number} subTodoId - 子待办事项ID
   * @returns {Promise<Object>} - 返回更新后的子待办事项
   */
  async reopenSubTodo(parentId, subTodoId) {
    try {
      console.log(`[TodoAPI] 重新打开待办事项ID:${parentId}的子待办ID:${subTodoId}`)
      const response = await axios.post(`/api/todos/${parentId}/subtodos/${subTodoId}/reopen/`)
      console.log('[TodoAPI] 重新打开子待办操作响应:', response.status)
      
      return response.data.data || response.data
    } catch (error) {
      console.error('[TodoAPI] 重新打开子待办事项失败:', error)
      throw error
    }
  },

  /**
   * 获取所有日常任务
   * @param {Object} options - 查询选项
   * @param {number} options.page - 页码
   * @param {number} options.pageSize - 每页数量
   * @param {string} options.search - 搜索关键词
   * @returns {Promise<Object>} - 返回日常任务列表和分页信息
   */
  async getDailyTasks(options = {}) {
    try {
      const { search, page, pageSize } = options
      
      // 构建查询参数
      const params = {}
      if (search) params.search = search
      if (page) params.page = page
      if (pageSize) params.page_size = pageSize
      
      console.log('[TodoAPI] 获取日常任务，查询参数:', params)
      
      const response = await axios.get('/api/daily-tasks/', { params })
      
      console.log('[TodoAPI] 日常任务API响应:', response)
      
      let tasks = [];
      let pagination = {
        count: 0,
        next: null,
        previous: null
      };
      
      if (response.data) {
        // 分页响应结构
        if (response.data.results && Array.isArray(response.data.results)) {
          tasks = response.data.results;
          pagination = {
            count: response.data.count || 0,
            next: response.data.next,
            previous: response.data.previous
          };
        } 
        // 数据在data字段中的结构
        else if (response.data.data && Array.isArray(response.data.data)) {
          tasks = response.data.data;
          pagination = {
            count: response.data.count || tasks.length,
            next: response.data.next,
            previous: response.data.previous
          };
        }
        // 直接就是数组的结构
        else if (Array.isArray(response.data)) {
          tasks = response.data;
          pagination = {
            count: tasks.length,
            next: null,
            previous: null
          };
        }
      }
      
      return {
        items: tasks,
        pagination: pagination
      }
    } catch (error) {
      console.error('获取日常任务失败:', error)
      throw error
    }
  },

  /**
   * 添加新的日常任务
   * @param {string} title - 标题
   * @param {string} description - 描述
   * @param {Object} additionalData - 额外数据（优先级等）
   * @returns {Promise<Object>} - 返回新建的日常任务
   */
  async addDailyTask(title, description = '', additionalData = {}) {
    try {
      const taskData = {
        title,
        description,
        ...additionalData
      }
      
      console.log(`[TodoAPI] 添加日常任务，数据:`, taskData)
      
      const response = await axios.post('/api/daily-tasks/', taskData)
      
      console.log('[TodoAPI] 添加日常任务响应:', response)
      
      return response.data.data || response.data
    } catch (error) {
      console.error('[TodoAPI] 添加日常任务失败:', error)
      throw error
    }
  },

  /**
   * 更新日常任务
   * @param {number} id - 日常任务ID
   * @param {Object} updates - 需要更新的字段
   * @returns {Promise<Object>} - 返回更新后的日常任务
   */
  async updateDailyTask(id, updates) {
    try {
      console.log(`[TodoAPI] 更新日常任务ID:${id}，更新内容:`, updates)
      
      const response = await axios.patch(`/api/daily-tasks/${id}/`, updates)
      return response.data.data || response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * 删除日常任务
   * @param {number} id - 日常任务ID
   * @returns {Promise<void>}
   */
  async deleteDailyTask(id) {
    try {
      console.log(`[TodoAPI] 删除日常任务ID:${id}`)
      
      const response = await axios.delete(`/api/daily-tasks/${id}/`)
      
      
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * 完成今日的日常任务
   * @param {number} id - 日常任务ID
   * @returns {Promise<Object>} - 返回更新后的日常任务
   */
  async completeDailyTask(id) {
    try {
      console.log(`[TodoAPI] 完成今日日常任务ID:${id}`)
      
      const response = await axios.post(`/api/daily-tasks/${id}/complete-today/`)
      
      console.log('[TodoAPI] 完成今日日常任务响应:', response)
      
      return response.data.data || response.data
    } catch (error) {
      console.error('[TodoAPI] 完成今日日常任务失败:', error)
      throw error
    }
  },

  /**
   * 取消完成今日的日常任务
   * @param {number} id - 日常任务ID
   * @returns {Promise<Object>} - 返回更新后的日常任务
   */
  async cancelCompleteDailyTask(id) {
    try {
      console.log(`[TodoAPI] 取消完成今日日常任务ID:${id}`)
      
      const response = await axios.post(`/api/daily-tasks/${id}/cancel-complete-today/`)
      
      console.log('[TodoAPI] 取消完成今日日常任务响应:', response)
      
      return response.data.data || response.data
    } catch (error) {
      console.error('[TodoAPI] 取消完成今日日常任务失败:', error)
      throw error
    }
  }
}
