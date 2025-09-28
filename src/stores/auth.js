import { defineStore } from 'pinia'
import { AuthAPI } from '@/api/auth'
import { jwtDecode } from 'jwt-decode'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    getUser: (state) => state.user,
    getError: (state) => state.error,
    isLoading: (state) => state.loading,
  },

  actions: {
    async register(userData) {
      this.loading = true
      this.error = null
      
      try {
        console.log('Store 处理注册请求:', userData)
        const data = await AuthAPI.register(userData)
        console.log('注册成功，返回数据:', data)
        return data
      } catch (error) {
        console.error('注册 Store 错误:', error.response || error)
        this.error = error.response?.data?.message || error.response?.data?.detail || '注册失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async login(username, password) {
      this.loading = true
      this.error = null
      
      try {
        console.log('尝试登录:', { username })
        
        const data = await AuthAPI.login(username, password)

        console.log('登录成功, 获取到令牌:', data)
        
        const { access, refresh } = data

        this.accessToken = access
        this.refreshToken = refresh
        
        localStorage.setItem('accessToken', access)
        localStorage.setItem('refreshToken', refresh)
        
        await this.fetchUserInfo()
        
        return data
      } catch (error) {
        console.error('登录失败:', error)
        this.error = error.response?.data?.message || error.response?.data?.detail || '登录失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchUserInfo() {
      if (!this.accessToken) return null
      
      try {
        const data = await AuthAPI.getUserInfo(this.accessToken)
        
        this.user = data
        localStorage.setItem('user', JSON.stringify(data))
        
        return data
      } catch (error) {
        console.error('获取用户信息失败', error)
        if (error.response?.status === 401) {
          await this.refreshAccessToken()
          return this.fetchUserInfo()
        }
        throw error
      }
    },

    async refreshAccessToken() {
      if (!this.refreshToken) {
        this.logout()
        throw new Error('没有刷新令牌可用')
      }

      try {
        const data = await AuthAPI.refreshToken(this.refreshToken)

        const { access } = data
        
        this.accessToken = access
        localStorage.setItem('accessToken', access)
        
        return access
      } catch (error) {
        console.error('刷新令牌失败', error)
        this.logout()
        throw error
      }
    },

    isTokenExpired() {
      if (!this.accessToken) return true
      
      try {
        const decoded = jwtDecode(this.accessToken)
        const currentTime = Date.now() / 1000
        
        return decoded.exp < currentTime
      } catch {
        return true
      }
    },

    async checkAuthStatus() {
      if (!this.accessToken) return false
      
      if (this.isTokenExpired()) {
        try {
          await this.refreshAccessToken()
          return true
        } catch {
          return false
        }
      }
      
      if (!this.user) {
        try {
          await this.fetchUserInfo()
        } catch {
          return false
        }
      }
      
      return true
    },

    logout() {
      this.accessToken = null
      this.refreshToken = null
      this.user = null
      this.error = null
      
      AuthAPI.logout()
    }
  },
})
