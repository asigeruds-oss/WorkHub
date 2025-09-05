import axios from 'axios'
import router from '@/router'

// Axios全局配置
// 不设置baseURL，让请求使用相对路径，这样可以正确地被Vite的代理处理
// axios.defaults.baseURL = import.meta.env.VITE_API_URL || ''
axios.defaults.headers.common['Content-Type'] = 'application/json'
axios.defaults.timeout = 10000

// 开发环境调试
if (import.meta.env.DEV) {
  axios.interceptors.request.use(request => {
    console.log('Starting Request:', request.method, request.url, request.data)
    return request
  })
  
  axios.interceptors.response.use(
    response => {
      console.log('Response:', response.status, response.data)
      return response
    },
    error => {
      console.error('Response Error:', error.message, error.response?.data)
      return Promise.reject(error)
    }
  )
}

// 创建请求拦截器
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 创建响应拦截器
axios.interceptors.response.use(
  response => {
    return response
  },
  async error => {
    const originalRequest = error.config
    
    // 如果是401错误且不是刷新令牌请求且没有重试过
    if (error.response?.status === 401 
        && !originalRequest._retry 
        && !originalRequest.url.includes('/api/token/refresh')) {
        
      originalRequest._retry = true
      
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        
        if (!refreshToken) {
          // 没有刷新令牌，登出并跳转到登录页面
          clearAuthData()
          router.push('/login')
          return Promise.reject(error)
        }
        
        // 尝试刷新令牌
        const response = await axios.post('/api/token/refresh/', {
          refresh: refreshToken
        })
        
        const { access } = response.data
        
        // 保存新令牌
        localStorage.setItem('accessToken', access)
        
        // 使用新令牌重试原始请求
        originalRequest.headers.Authorization = `Bearer ${access}`
        return axios(originalRequest)
      } catch (refreshError) {
        // 刷新令牌失败，清除认证数据并跳转到登录页面
        clearAuthData()
        router.push('/login')
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

// 清除认证数据的辅助函数
function clearAuthData() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}

export default axios
