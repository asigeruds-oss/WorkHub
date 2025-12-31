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
  },

  // ==================== 用户组管理 ====================

  /**
   * 获取用户组列表
   * @returns {Promise<{groups: Array}>}
   */
  async getGroups() {
    try {
      const response = await http.get('/api/auth/groups/')
      return response.data
    } catch (error) {
      console.error('获取用户组列表失败:', error)
      throw error
    }
  },

  /**
   * 创建用户组
   * @param {Object} data - 用户组数据
   * @param {string} data.name - 用户组名称
   * @returns {Promise<Object>}
   */
  async createGroup(data) {
    try {
      const response = await http.post('/api/auth/groups/', data)
      return response.data
    } catch (error) {
      console.error('创建用户组失败:', error)
      throw error
    }
  },

  // ==================== 用户搜索 ====================

  /**
   * 搜索用户
   * @param {Object} params - 查询参数
   * @param {string} params.query - 搜索关键词
   * @param {number} params.limit - 返回数量（默认20）
   * @param {number} params.offset - 偏移量（用于分页，默认0）
   * @returns {Promise<{users: Array, total: number}>}
   */
  async searchUsers(params) {
    try {
      const response = await http.get('/api/auth/users/search/', { params })
      return response.data
    } catch (error) {
      console.error('搜索用户失败:', error)
      throw error
    }
  },

  // ==================== 权限管理 ====================

  /**
   * 获取当前用户的权限信息
   * @returns {Promise<Object>} - 返回用户信息、组、权限
   */
  async getPermissions() {
    try {
      const response = await http.get('/api/auth/me/permissions/')
      return response.data
    } catch (error) {
      console.error('获取权限信息失败:', error)
      throw error
    }
  },

  /**
   * 更新用户组
   * @param {number} groupId - 用户组ID
   * @param {Object} data - 更新数据
   * @returns {Promise<Object>}
   */
  async updateGroup(groupId, data) {
    try {
      const response = await http.patch(`/api/auth/groups/${groupId}/`, data)
      return response.data
    } catch (error) {
      console.error('更新用户组失败:', error)
      throw error
    }
  },

  /**
   * 删除用户组
   * @param {number} groupId - 用户组ID
   * @returns {Promise<void>}
   */
  async deleteGroup(groupId) {
    try {
      await http.delete(`/api/auth/groups/${groupId}/`)
    } catch (error) {
      console.error('删除用户组失败:', error)
      throw error
    }
  },

  /**
   * 批量删除用户组
   * @param {Array<number>} groupIds - 用户组ID数组
   * @returns {Promise<Object>}
   */
  async batchDeleteGroups(groupIds) {
    try {
      const response = await http.post('/api/auth/groups/batch-delete/', { group_ids: groupIds })
      return response.data
    } catch (error) {
      console.error('批量删除用户组失败:', error)
      throw error
    }
  },

  // ==================== 用户组成员管理 ====================

  /**
   * 获取用户组成员列表
   * @param {number} groupId - 用户组ID
   * @returns {Promise<Object>}
   */
  async getGroupUsers(groupId) {
    try {
      const response = await http.get(`/api/auth/groups/${groupId}/users/`)
      return response.data
    } catch (error) {
      console.error('获取用户组成员失败:', error)
      throw error
    }
  },

  /**
   * 添加用户到用户组
   * @param {number} groupId - 用户组ID
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>}
   */
  async addUserToGroup(groupId, userId) {
    try {
      const response = await http.post(`/api/auth/groups/${groupId}/users/`, { user_id: userId })
      return response.data
    } catch (error) {
      console.error('添加用户到组失败:', error)
      throw error
    }
  },

  /**
   * 从用户组移除用户
   * @param {number} groupId - 用户组ID
   * @param {number} userId - 用户ID
   * @returns {Promise<void>}
   */
  async removeUserFromGroup(groupId, userId) {
    try {
      await http.delete(`/api/auth/groups/${groupId}/users/${userId}/`)
    } catch (error) {
      console.error('从组移除用户失败:', error)
      throw error
    }
  },

  // ==================== 用户权限编辑 ====================

  /**
   * 获取特定用户的权限信息
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>}
   */
  async getUserPermissions(userId) {
    try {
      const response = await http.get(`/api/auth/users/${userId}/permissions/`)
      return response.data
    } catch (error) {
      console.error('获取用户权限失败:', error)
      throw error
    }
  },

  /**
   * 修改用户权限等级
   * @param {number} userId - 用户ID
   * @param {Object} data - 权限数据
   * @returns {Promise<Object>}
   */
  async updateUserPermissions(userId, data) {
    try {
      const response = await http.patch(`/api/auth/users/${userId}/permissions/`, data)
      return response.data
    } catch (error) {
      console.error('修改用户权限失败:', error)
      throw error
    }
  },

  /**
   * 批量设置用户的用户组
   * @param {number} userId - 用户ID
   * @param {Array<number>} groupIds - 用户组ID数组
   * @returns {Promise<Object>}
   */
  async setUserGroups(userId, groupIds) {
    try {
      const response = await http.put(`/api/auth/users/${userId}/groups/`, { group_ids: groupIds })
      return response.data
    } catch (error) {
      console.error('设置用户组失败:', error)
      throw error
    }
  },

  // ==================== 统计信息 ====================

  /**
   * 获取权限系统统计信息
   * @returns {Promise<Object>}
   */
  async getStats() {
    try {
      const response = await http.get('/api/auth/stats/')
      return response.data
    } catch (error) {
      console.error('获取统计信息失败:', error)
      throw error
    }
  }
}
