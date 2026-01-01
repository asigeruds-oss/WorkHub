import axios from 'axios'
import router from '@/router'
import Logger from '@/utils/logger'

const logger = new Logger('HTTP')

/**
 * 创建一个基础的axios实例
 * 注意：不设置baseURL，让请求默认使用相对路径，这样可以正确地被Vite的代理处理
 */
const http = axios.create({
  // 不设置baseURL，让请求使用相对路径，利用Vite的代理功能
  timeout: 15000, // 请求超时时间
})

/**
 * 请求拦截器
 * - 为每个请求自动添加认证令牌（如果存在）
 */
http.interceptors.request.use(
  config => {
    logger.debug(`${config.method.toUpperCase()} ${config.url}`, {
      data: config.data,
      params: config.params,
    })
    
    const accessToken = localStorage.getItem('accessToken')
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
      logger.debug('已添加认证Token')
    }
    
    return config
  },
  error => {
    logger.error('请求拦截器错误', error)
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 * - 处理常见错误（401未授权、403禁止访问等）
 * - 处理令牌过期情况
 */
http.interceptors.response.use(
  response => {
    return response
  },
  async error => {
    const originalRequest = error.config
    
    // 如果是401未授权错误且没有重试过
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        // 尝试刷新令牌
        const refreshToken = localStorage.getItem('refreshToken')
        
        if (!refreshToken) {
          // 如果没有刷新令牌，直接跳转到登录页
          logger.warn('无刷新令牌，跳转登录页')
          localStorage.removeItem('accessToken')
          localStorage.removeItem('user')
          router.push('/login')
          return Promise.reject(error)
        }
        
        // 刷新令牌
        logger.debug('尝试刷新访问令牌')
        const response = await axios.post('/api/token/refresh/', {
          refresh: refreshToken
        })
        
        // 更新存储的访问令牌
        const { access } = response.data
        localStorage.setItem('accessToken', access)
        logger.debug('令牌刷新成功')
        
        // 更新原始请求的认证头并重试
        originalRequest.headers.Authorization = `Bearer ${access}`
        return http(originalRequest)
      } catch (refreshError) {
        // 刷新令牌失败，清除所有认证数据并跳转到登录页
        logger.warn('令牌刷新失败，跳转登录页')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        router.push('/login')
        return Promise.reject(refreshError)
      }
    }
    
    // 其他错误处理
    if (error.response?.status === 403) {
      logger.warn('403: 没有权限执行此操作')
    }
    
    return Promise.reject(error)
  }
)

export default http
