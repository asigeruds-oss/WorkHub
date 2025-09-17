import { TodoAPI } from '@/api/todo'

export const useTodoStore = defineStore('todo', {
  state: () => ({
    todos: [],
    dailyTasks: [], // 添加日常任务数组
    loading: false,
    error: null,
    pagination: {
      count: 0,
      next: null,
      previous: null,
      currentPage: 1
    },
    filters: {
      search: '',
      status: '',
      ordering: '-created_at'
    },
    dailyTaskPagination: { // 日常任务的分页信息
      count: 0,
      next: null,
      previous: null,
      currentPage: 1
    }
  }),

  getters: {
    getAllTodos: (state) => state.todos,
    getCompletedTodos: (state) => state.todos.filter(todo => todo.status === 'done'),
    getIncompleteTodos: (state) => state.todos.filter(todo => todo.status === 'pending'),
    getArchivedTodos: (state) => state.todos.filter(todo => todo.status === 'archived'),
    getAllDailyTasks: (state) => state.dailyTasks, // 获取所有日常任务
    getCompletedDailyTasks: (state) => state.dailyTasks.filter(task => task.is_completed_today), // 今日已完成的日常任务
    getIncompleteDailyTasks: (state) => state.dailyTasks.filter(task => !task.is_completed_today), // 今日未完成的日常任务
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    getPagination: (state) => state.pagination,
    getDailyTaskPagination: (state) => state.dailyTaskPagination, // 日常任务分页
    getFilters: (state) => state.filters,
  },

  actions: {
    async fetchTodos(options = {}) {
      this.loading = true
      this.error = null
      
      try {
        console.log('开始获取待办事项, 选项:', options)
        
        // 合并当前过滤器状态与传入的选项
        const queryOptions = {
          search: options.search !== undefined ? options.search : this.filters.search,
          ordering: options.ordering !== undefined ? options.ordering : this.filters.ordering,
          status: options.status !== undefined ? options.status : this.filters.status,
          page: options.page || this.pagination.currentPage,
          pageSize: options.pageSize || 10
        }
        
        // 更新过滤器状态
        if (options.search !== undefined) this.filters.search = options.search
        if (options.ordering !== undefined) this.filters.ordering = options.ordering
        if (options.status !== undefined) this.filters.status = options.status
        if (options.page) this.pagination.currentPage = options.page
        
        const result = await TodoAPI.getTodos(queryOptions)
        
        // 检查数据是否有效
        if (Array.isArray(result.items)) {
          console.log(`成功获取到${result.items.length}个待办事项`)
          this.todos = result.items
          this.pagination = {
            ...this.pagination,
            ...result.pagination,
            currentPage: queryOptions.page
          }
        } else {
          console.error('待办事项数据无效:', result)
          this.error = '待办事项数据格式错误'
          this.todos = []
        }
        
        return result.items
      } catch (error) {
        console.error('获取待办事项失败:', error)
        this.error = error.response?.data?.message || error.response?.data?.detail || '获取待办事项失败'
        this.todos = []
        throw error
      } finally {
        this.loading = false
      }
    },

    async addTodo(title, description = '', additionalData = {}) {
      console.log(`[TodoStore] 开始添加待办事项，标题: "${title}"，描述长度: ${description.length}，附加数据:`, additionalData)
      
      this.loading = true
      this.error = null
      
      try {
        // 合并基本字段和额外字段
        const todoData = {
          title,
          description,
          ...additionalData
        }
        
        console.log(`[TodoStore] 调用 TodoAPI.addTodo 添加待办事项`, todoData)
        const startTime = performance.now()
        
        const data = await TodoAPI.addTodo(title, description, additionalData)
        
        const endTime = performance.now()
        console.log(`[TodoStore] TodoAPI.addTodo 调用耗时: ${endTime - startTime}ms`)
        console.log('[TodoStore] 添加待办事项返回数据:', data)
        
        // 更新本地数据以确保UI立即更新
        if (data) {
          // 如果是新添加的项目，加入本地数组
          this.todos.push(data);
          
          // 增加总数统计
          this.pagination.count = (this.pagination.count || 0) + 1;
          
          console.log(`[TodoStore] 本地添加待办事项成功，当前有 ${this.todos.length} 个待办事项`);
        }
        
        return data
      } catch (error) {
        console.error('[TodoStore] 添加待办事项失败:', {
          name: error.name,
          message: error.message,
          response: error.response ? {
            status: error.response.status,
            data: error.response.data
          } : '无响应数据'
        })
        
        this.error = error.response?.data?.message || error.response?.data?.detail || '添加待办事项失败'
        throw error
      } finally {
        this.loading = false
        console.log('[TodoStore] addTodo 操作完成')
      }
    },

    async updateTodo(id, updates) {
      console.log(`[TodoStore] 开始更新待办事项 ID:${id}，更新内容:`, updates)
      
      if (!id) {
        console.error('[TodoStore] 更新待办事项时ID不存在')
        throw new Error('更新待办事项时ID不存在')
      }
      
      this.loading = true
      this.error = null
      
      try {
        console.log(`[TodoStore] 调用 TodoAPI.updateTodo(${id}, ${JSON.stringify(updates)})`)
        const startTime = performance.now()
        
        const data = await TodoAPI.updateTodo(id, updates)
        
        const endTime = performance.now()
        console.log(`[TodoStore] API调用耗时: ${endTime - startTime}ms`)
        console.log('[TodoStore] TodoAPI.updateTodo 返回数据:', data)
        
        // 更新本地数据
        const index = this.todos.findIndex(todo => todo.id === id)
        if (index !== -1) {
          console.log(`[TodoStore] 在本地数据中找到索引 ${index}，更新本地数据`)
          this.todos[index] = { ...this.todos[index], ...data }
        } else {
          console.warn(`[TodoStore] 在本地数据中未找到ID为${id}的待办事项`)
        }
        
        return data
      } catch (error) {
        console.error('[TodoStore] 更新待办事项失败:', {
          name: error.name,
          message: error.message,
          response: error.response ? {
            status: error.response.status,
            data: error.response.data
          } : '无响应数据'
        })
        
        this.error = error.response?.data?.message || error.response?.data?.detail || '更新待办事项失败'
        throw error
      } finally {
        this.loading = false
        console.log('[TodoStore] updateTodo 操作完成')
      }
    },

    async toggleTodoStatus(id) {
      const todo = this.todos.find(todo => todo.id === id)
      if (!todo) return
      
      if (todo.status === 'pending') {
        return this.completeTodo(id)
      } else if (todo.status === 'done') {
        return this.reopenTodo(id)
      }
    },
    
    async completeTodo(id) {
      this.loading = true
      this.error = null
      
      try {
        const data = await TodoAPI.completeTodo(id)
        
        const index = this.todos.findIndex(todo => todo.id === id)
        if (index !== -1) {
          this.todos[index] = { ...this.todos[index], ...data }
        }
        
        return data
      } catch (error) {
        this.error = error.response?.data?.message || error.response?.data?.detail || '将待办事项标记为已完成失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async reopenTodo(id) {
      this.loading = true
      this.error = null
      
      try {
        const data = await TodoAPI.reopenTodo(id)
        
        const index = this.todos.findIndex(todo => todo.id === id)
        if (index !== -1) {
          this.todos[index] = { ...this.todos[index], ...data }
        }
        
        return data
      } catch (error) {
        this.error = error.response?.data?.message || error.response?.data?.detail || '重新打开待办事项失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async archiveTodo(id) {
      this.loading = true
      this.error = null
      
      try {
        const data = await TodoAPI.archiveTodo(id)
        
        const index = this.todos.findIndex(todo => todo.id === id)
        if (index !== -1) {
          this.todos[index] = { ...this.todos[index], ...data }
        }
        
        return data
      } catch (error) {
        this.error = error.response?.data?.message || error.response?.data?.detail || '归档待办事项失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteTodo(id) {
      this.loading = true
      this.error = null
      
      try {
        await TodoAPI.deleteTodo(id)
        this.todos = this.todos.filter(todo => todo.id !== id)
      } catch (error) {
        this.error = error.response?.data?.message || '删除待办事项失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    // 子待办相关方法
    async fetchSubTodos(parentId) {
      this.loading = true
      this.error = null
      
      try {
        const data = await TodoAPI.getSubTodos(parentId)
        return data
      } catch (error) {
        this.error = error.response?.data?.message || error.response?.data?.detail || '获取子待办失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async addSubTodo(parentId, title, description = '', additionalData = {}) {
      this.loading = true
      this.error = null
      
      try {
        const data = await TodoAPI.addSubTodo(parentId, title, description, additionalData)
        return data
      } catch (error) {
        this.error = error.response?.data?.message || error.response?.data?.detail || '添加子待办失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async updateSubTodo(parentId, subTodoId, updates) {
      this.loading = true
      this.error = null
      
      try {
        const data = await TodoAPI.updateSubTodo(parentId, subTodoId, updates)
        return data
      } catch (error) {
        this.error = error.response?.data?.message || error.response?.data?.detail || '更新子待办失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async deleteSubTodo(parentId, subTodoId) {
      this.loading = true
      this.error = null
      
      try {
        await TodoAPI.deleteSubTodo(parentId, subTodoId)
      } catch (error) {
        this.error = error.response?.data?.message || error.response?.data?.detail || '删除子待办失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async completeSubTodo(parentId, subTodoId) {
      this.loading = true
      this.error = null
      
      try {
        const data = await TodoAPI.completeSubTodo(parentId, subTodoId)
        return data
      } catch (error) {
        this.error = error.response?.data?.message || error.response?.data?.detail || '将子待办标记为已完成失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async reopenSubTodo(parentId, subTodoId) {
      this.loading = true
      this.error = null
      
      try {
        const data = await TodoAPI.reopenSubTodo(parentId, subTodoId)
        return data
      } catch (error) {
        this.error = error.response?.data?.message || error.response?.data?.detail || '重新打开子待办失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    // 日常任务相关方法
    async fetchDailyTasks(options = {}) {
      this.loading = true
      this.error = null
      
      try {
        const { page, pageSize, search } = options
        const queryOptions = {
          page: page || this.dailyTaskPagination.currentPage,
          pageSize: pageSize || 10,
          search: search || ''
        }
        
        const result = await TodoAPI.getDailyTasks(queryOptions)
        
        if (Array.isArray(result.items)) {
          this.dailyTasks = result.items
          this.dailyTaskPagination = {
            ...this.dailyTaskPagination,
            ...result.pagination,
            currentPage: queryOptions.page
          }
        } else {
          this.error = '日常任务数据格式错误'
          this.dailyTasks = []
        }
        
        return result.items
      } catch (error) {
        console.error('获取日常任务失败:', error)
        this.error = error.response?.data?.message || error.response?.data?.detail || '获取日常任务失败'
        this.dailyTasks = []
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async addDailyTask(title, description = '', additionalData = {}) {
      this.loading = true
      this.error = null
      
      try {
        const data = await TodoAPI.addDailyTask(title, description, additionalData)
        
        if (data) {
          this.dailyTasks.push(data)
          this.dailyTaskPagination.count = (this.dailyTaskPagination.count || 0) + 1
        }
        
        return data
      } catch (error) {
        this.error = error.response?.data?.message || error.response?.data?.detail || '添加日常任务失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async updateDailyTask(id, updates) {
      this.loading = true
      this.error = null
      
      try {
        const data = await TodoAPI.updateDailyTask(id, updates)
        
        const index = this.dailyTasks.findIndex(task => task.id === id)
        if (index !== -1) {
          this.dailyTasks[index] = { ...this.dailyTasks[index], ...data }
        }
        
        return data
      } catch (error) {
        this.error = error.response?.data?.message || error.response?.data?.detail || '更新日常任务失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async deleteDailyTask(id) {
      this.loading = true
      this.error = null
      
      try {
        await TodoAPI.deleteDailyTask(id)
        this.dailyTasks = this.dailyTasks.filter(task => task.id !== id)
        this.dailyTaskPagination.count = Math.max(0, (this.dailyTaskPagination.count || 0) - 1)
      } catch (error) {
        this.error = error.response?.data?.message || error.response?.data?.detail || '删除日常任务失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async completeDailyTask(id) {
      this.loading = true
      this.error = null
      
      try {
        console.log(`[TodoStore] 开始调用完成日常任务 API, ID: ${id}`)
        const data = await TodoAPI.completeDailyTask(id)
        console.log(`[TodoStore] 完成日常任务 API 调用成功:`, data)
        
        const index = this.dailyTasks.findIndex(task => task.id === id)
        if (index !== -1) {
          console.log(`[TodoStore] 更新本地日常任务状态, 索引: ${index}`)
          this.dailyTasks[index] = { ...this.dailyTasks[index], ...data }
        } else {
          console.warn(`[TodoStore] 未找到ID为 ${id} 的日常任务，无法更新本地状态`)
        }
        
        return data
      } catch (error) {
        console.error(`[TodoStore] 完成日常任务失败:`, error)
        this.error = error.response?.data?.message || error.response?.data?.detail || '完成日常任务失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async cancelCompleteDailyTask(id) {
      this.loading = true
      this.error = null
      
      try {
        console.log(`[TodoStore] 开始调用取消完成日常任务 API, ID: ${id}`)
        const data = await TodoAPI.cancelCompleteDailyTask(id)
        console.log(`[TodoStore] 取消完成日常任务 API 调用成功:`, data)
        
        const index = this.dailyTasks.findIndex(task => task.id === id)
        if (index !== -1) {
          console.log(`[TodoStore] 更新本地日常任务状态, 索引: ${index}`)
          this.dailyTasks[index] = { ...this.dailyTasks[index], ...data }
        } else {
          console.warn(`[TodoStore] 未找到ID为 ${id} 的日常任务，无法更新本地状态`)
        }
        
        return data
      } catch (error) {
        console.error(`[TodoStore] 取消完成日常任务失败:`, error)
        this.error = error.response?.data?.message || error.response?.data?.detail || '取消完成日常任务失败'
        throw error
      } finally {
        this.loading = false
      }
    }
  },
})
