/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router/auto'
import { setupLayouts } from 'virtual:generated-layouts'
import { routes } from 'vue-router/auto-routes'
import { jwtDecode } from 'jwt-decode'
import Logger from '@/utils/logger'

const logger = new Logger('Router')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  logger.debug(`导航: ${from.path} -> ${to.path}`)
  
  // 检查路由是否需要认证
  const requiresAuth = to.meta.requiresAuth !== false
  
  // 如果路由不需要认证或是登录/注册页面，直接通过
  if (!requiresAuth || to.path === '/login' || to.path === '/register') {
    return next()
  }
  
  // 检查token是否存在和有效
  const token = localStorage.getItem('accessToken')
  
  if (!token) {
    // 没有token，跳转到登录页面
    logger.debug('无认证令牌，重定向到登录页')
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }
  
  // 检查token是否过期
  try {
    const decoded = jwtDecode(token)
    const currentTime = Date.now() / 1000
    
    if (decoded.exp < currentTime) {
      // Token已过期，尝试使用刷新令牌
      const refreshToken = localStorage.getItem('refreshToken')
      
      if (!refreshToken) {
        // 没有刷新令牌，清除数据并跳转到登录页面
        logger.debug('令牌过期且无刷新令牌，重定向到登录页')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        return next({ path: '/login', query: { redirect: to.fullPath } })
      }
      
      // 让用户先进入页面，拦截器会处理刷新令牌
      return next()
    }
    
    // Token有效，允许访问
    return next()
  } catch (error) {
    logger.error('令牌验证失败', error)
    
    // 令牌无效，清除数据并跳转到登录页面
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      logger.error('动态导入错误，重载页面未修复', err)
    } else {
      logger.debug('重载页面以修复动态导入错误')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    logger.error('路由错误', err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
