import { TodoAPI } from '@/api/todo'

export const useTodoStore = defineStore('todo', {
  state: () => ({
    todos: [],
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
    }
  }),

  getters: {
    getAllTodos: (state) => state.todos,
    getCompletedTodos: (state) => state.todos.filter(todo => todo.status === 'done'),
    getIncompleteTodos: (state) => state.todos.filter(todo => todo.status === 'pending'),
    getArchivedTodos: (state) => state.todos.filter(todo => todo.status === 'archived'),
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    getPagination: (state) => state.pagination,
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
        
        // 不再直接修改本地数据，而是通过fetchTodos刷新
        // this.todos.push(data)
        
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
    }
  },
})
