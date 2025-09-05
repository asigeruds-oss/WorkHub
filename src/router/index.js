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

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  console.log('路由守卫 - 从', from.path, '到', to.path)
  console.log('路由守卫 - 目标路由完整信息:', {
    name: to.name,
    path: to.path,
    fullPath: to.fullPath,
    query: to.query,
    params: to.params,
    meta: to.meta
  })
  
  // 检查路由是否需要认证
  const requiresAuth = to.meta.requiresAuth !== false
  console.log('路由守卫 - 路由是否需要认证:', requiresAuth)
  
  // 如果路由不需要认证或是登录/注册页面，直接通过
  if (!requiresAuth || to.path === '/login' || to.path === '/register') {
    console.log('路由守卫 - 无需认证或登录/注册页面，直接通过')
    return next()
  }
  
  // 检查token是否存在和有效
  const token = localStorage.getItem('accessToken')
  console.log('路由守卫 - 检查令牌:', token ? token.substring(0, 20) + '...' : 'undefined')
  
  if (!token) {
    // 没有token，跳转到登录页面
    console.log('路由守卫 - 没有令牌，跳转到登录页面')
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
    console.error('令牌验证失败', error)
    
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
      console.error('Dynamic import error, reloading page did not fix it', err)
    } else {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
