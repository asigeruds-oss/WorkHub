import http from './http'

/**
 * 知识中心Wiki API服务
 */
export default {
  /**
   * 获取页面列表
   * @param {Object} params - 查询参数
   * @param {string} [params.parent_id] - 按父页面ID筛选
   * @param {string} [params.tags] - 按标签筛选，逗号分隔
   * @param {string} [params.path] - 按路径前缀筛选
   * @param {number} [params.page] - 分页页码，默认为1
   * @param {number} [params.page_size] - 每页数量，默认为10
   * @returns {Promise} - 页面列表响应
   */
  getPages(params = {}) {
    return http.get('/api/wiki/pages/', { params })
  },

  /**
   * 获取单个页面
   * @param {string} pageId - 页面ID
   * @returns {Promise} - 页面详情响应
   */
  getPage(pageId) {
    return http.get(`/api/wiki/pages/${pageId}/`)
  },

  /**
   * 创建页面
   * @param {Object} pageData - 页面数据
   * @param {string} pageData.title - 页面标题
   * @param {string} pageData.content - 页面内容
   * @param {string} [pageData.parent_id] - 父页面ID
   * @param {Array<string>} [pageData.tags] - 标签数组
   * @param {boolean} [pageData.is_folder] - 是否为文件夹
   * @returns {Promise} - 新创建的页面响应
   */
  createPage(pageData) {
    return http.post('/api/wiki/pages/', pageData)
  },

  /**
   * 更新页面
   * @param {string} pageId - 页面ID
   * @param {Object} pageData - 页面更新数据
   * @returns {Promise} - 更新后的页面响应
   */
  updatePage(pageId, pageData) {
    return http.put(`/api/wiki/pages/${pageId}/`, pageData)
  },

  /**
   * 部分更新页面
   * @param {string} pageId - 页面ID
   * @param {Object} pageData - 部分更新数据
   * @returns {Promise} - 更新后的页面响应
   */
  patchPage(pageId, pageData) {
    return http.patch(`/api/wiki/pages/${pageId}/`, pageData)
  },

  /**
   * 删除页面
   * @param {string} pageId - 页面ID
   * @returns {Promise} - 删除响应
   */
  deletePage(pageId) {
    return http.delete(`/api/wiki/pages/${pageId}/`)
  },

  /**
   * 获取页面历史版本
   * @param {string} pageId - 页面ID
   * @param {Object} params - 查询参数
   * @param {number} [params.page] - 分页页码，默认为1
   * @param {number} [params.page_size] - 每页数量，默认为10
   * @returns {Promise} - 历史版本列表响应
   */
  getPageHistory(pageId, params = {}) {
    return http.get(`/api/wiki/pages/${pageId}/history/`, { params })
  },

  /**
   * 获取特定版本的页面内容
   * @param {string} pageId - 页面ID
   * @param {number} version - 版本号
   * @returns {Promise} - 特定版本的页面响应
   */
  getPageVersion(pageId, version) {
    return http.get(`/api/wiki/pages/${pageId}/history/${version}/`)
  },

  /**
   * 搜索页面
   * @param {Object} params - 搜索参数
   * @param {string} params.query - 搜索关键词
   * @param {string} [params.tags] - 按标签过滤，逗号分隔
   * @param {string} [params.path] - 按路径前缀过滤
   * @param {number} [params.page] - 分页页码，默认为1
   * @param {number} [params.page_size] - 每页数量，默认为10
   * @returns {Promise} - 搜索结果响应
   */
  search(params) {
    return http.get('/api/wiki/search/', { params })
  },

  /**
   * 获取所有标签
   * @param {Object} params - 查询参数
   * @param {number} [params.page] - 分页页码，默认为1
   * @param {number} [params.page_size] - 每页数量，默认为10
   * @returns {Promise} - 标签列表响应
   */
  getTags(params = {}) {
    return http.get('/api/wiki/tags/', { params })
  },

  /**
   * 获取特定标签的页面
   * @param {string} tagName - 标签名称
   * @param {Object} params - 查询参数
   * @param {number} [params.page] - 分页页码，默认为1
   * @param {number} [params.page_size] - 每页数量，默认为10
   * @returns {Promise} - 带有特定标签的页面列表响应
   */
  getPagesByTag(tagName, params = {}) {
    return http.get(`/api/wiki/tags/${tagName}/pages/`, { params })
  },

  /**
   * 获取页面的评论
   * @param {string} pageId - 页面ID
   * @param {Object} params - 查询参数
   * @param {number} [params.page] - 分页页码，默认为1
   * @param {number} [params.page_size] - 每页数量，默认为10
   * @returns {Promise} - 评论列表响应
   */
  getComments(pageId, params = {}) {
    return http.get(`/api/wiki/pages/${pageId}/comments/`, { params })
  },

  /**
   * 添加评论
   * @param {string} pageId - 页面ID
   * @param {Object} commentData - 评论数据
   * @param {string} commentData.content - 评论内容
   * @returns {Promise} - 新创建的评论响应
   */
  addComment(pageId, commentData) {
    return http.post(`/api/wiki/pages/${pageId}/comments/`, commentData)
  },

  /**
   * 创建评论（别名）
   */
  createComment(pageId, commentData) {
    return this.addComment(pageId, commentData)
  },

  /**
   * 删除评论
   * @param {string} pageId - 页面ID
   * @param {string} commentId - 评论ID
   * @returns {Promise} - 删除评论响应
   */
  deleteComment(pageId, commentId) {
    return http.delete(`/api/wiki/pages/${pageId}/comments/${commentId}/`)
  },

  /**
   * 搜索页面（别名）
   * @param {Object} params - 搜索参数
   * @returns {Promise} - 搜索结果响应
   */
  searchPages(params) {
    return this.search(params)
  }
}
