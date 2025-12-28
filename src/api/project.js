import axios from 'axios'

/**
 * Project相关的API服务
 */
export const ProjectAPI = {
  /**
   * 获取项目列表
   * @param {Object} options - 查询选项
   * @param {string} options.status - 按状态筛选: active, archived, completed
   * @param {string} options.search - 搜索关键词
   * @param {string} options.ordering - 排序
   * @param {number} options.page - 页码
   * @param {number} options.page_size - 每页数量
   * @returns {Promise<Object>} - 返回项目列表
   */
  async getProjects(options = {}) {
    try {
      const params = { ...options }
      const response = await axios.get('/api/projects/', { params })
      return response.data
    } catch (error) {
      console.error('获取项目列表失败:', error)
      throw error
    }
  },

  /**
   * 创建项目
   * @param {Object} data - 项目数据
   * @returns {Promise<Object>} - 返回创建的项目
   */
  async createProject(data) {
    try {
      const response = await axios.post('/api/projects/', data)
      return response.data
    } catch (error) {
      console.error('创建项目失败:', error)
      throw error
    }
  },

  /**
   * 获取项目详情
   * @param {number|string} id - 项目ID
   * @returns {Promise<Object>} - 返回项目详情
   */
  async getProject(id) {
    try {
      const response = await axios.get(`/api/projects/${id}/`)
      return response.data
    } catch (error) {
      console.error('获取项目详情失败:', error)
      throw error
    }
  },

  /**
   * 更新项目
   * @param {number|string} id - 项目ID
   * @param {Object} data - 更新的数据
   * @returns {Promise<Object>} - 返回更新后的项目
   */
  async updateProject(id, data) {
    try {
      const response = await axios.patch(`/api/projects/${id}/`, data)
      return response.data
    } catch (error) {
      console.error('更新项目失败:', error)
      throw error
    }
  },

  /**
   * 删除项目
   * @param {number|string} id - 项目ID
   */
  async deleteProject(id) {
    try {
      await axios.delete(`/api/projects/${id}/`)
    } catch (error) {
      console.error('删除项目失败:', error)
      throw error
    }
  },

  /**
   * 归档项目
   * @param {number|string} id - 项目ID
   */
  async archiveProject(id) {
    try {
      const response = await axios.post(`/api/projects/${id}/archive/`)
      return response.data
    } catch (error) {
      console.error('归档项目失败:', error)
      throw error
    }
  },

  /**
   * 激活项目
   * @param {number|string} id - 项目ID
   */
  async activateProject(id) {
    try {
      const response = await axios.post(`/api/projects/${id}/activate/`)
      return response.data
    } catch (error) {
      console.error('激活项目失败:', error)
      throw error
    }
  },

  /**
   * 完成项目
   * @param {number|string} id - 项目ID
   */
  async completeProject(id) {
    try {
      const response = await axios.post(`/api/projects/${id}/complete/`)
      return response.data
    } catch (error) {
      console.error('完成项目失败:', error)
      throw error
    }
  },

  /**
   * 获取项目统计
   * @returns {Promise<Object>} - 返回统计数据
   */
  async getStatistics() {
    try {
      const response = await axios.get('/api/projects/statistics/')
      return response.data
    } catch (error) {
      console.error('获取项目统计失败:', error)
      throw error
    }
  }
}
