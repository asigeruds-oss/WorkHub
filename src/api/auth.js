import http from './http'

/**
 * 认证相关的API服务
 */
export const AuthAPI = {
  /**
   * 用户登录
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise<{access: string, refresh: string}>} - 返回包含访问令牌和刷新令牌的对象
   */
  async login(username, password) {
    try {
      const response = await http.post('/api/token/', {
        username,
        password,
      })
      
      return response.data
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  },

  /**
   * 注册新用户
   * @param {Object} userData - 用户数据
   * @param {string} userData.username - 用户名
   * @param {string} userData.email - 电子邮箱
   * @param {string} userData.password - 密码
   * @param {string} userData.password2 - 确认密码
   * @param {string} userData.first_name - 姓
   * @param {string} userData.last_name - 名
   * @param {string} userData.gender - 性别 (M/F/O)
   * @param {string} userData.phone - 手机号码
   * @returns {Promise<Object>} - 返回用户信息
   */
  async register(userData) {
    try {
      console.log('发送注册请求，数据:', userData)
      const response = await http.post('/api/register/', userData)
      
      console.log('注册API响应:', response.data)
      return response.data
    } catch (error) {
      console.error('注册失败:', error.response || error)
      throw error
    }
  },

  /**
   * 获取当前用户信息
   * @param {string} token - 访问令牌
   * @returns {Promise<Object>} - 返回用户信息
   */
  async getUserInfo(token) {
    try {
      const response = await http.get('/api/me/')
      
      return response.data
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  },

  /**
   * 刷新访问令牌
   * @param {string} refreshToken - 刷新令牌
   * @returns {Promise<{access: string}>} - 返回新的访问令牌
   */
  async refreshToken(refreshToken) {
    try {
      const response = await http.post('/api/token/refresh/', {
        refresh: refreshToken
      })
      
      return response.data
    } catch (error) {
      console.error('刷新令牌失败:', error)
      throw error
    }
  },

  /**
   * 验证令牌
   * @param {string} token - 访问令牌
   * @returns {Promise<boolean>} - 返回令牌是否有效
   */
  async verifyToken(token) {
    try {
      await http.post('/api/token/verify/', {
        token: token
      })
      
      return true
    } catch (error) {
      console.error('令牌验证失败:', error)
      return false
    }
  },

  /**
   * 退出登录 (客户端操作，清除本地存储)
   */
  logout() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }
}
