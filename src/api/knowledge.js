// 知识中心 API 服务
import http from './http'

/**
 * 获取文章列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.category - 分类ID
 * @param {Array} params.tags - 标签ID数组
 * @param {string} params.sortBy - 排序字段
 * @param {string} params.sortOrder - 排序方向 (asc/desc)
 * @returns {Promise} - HTTP 响应
 */
export const getArticles = (params = {}) => {
  return http.get('/api/knowledge/articles', { params })
}

/**
 * 获取文章详情
 * @param {number|string} id - 文章ID
 * @returns {Promise} - HTTP 响应
 */
export const getArticle = (id) => {
  return http.get(`/api/knowledge/articles/${id}`)
}

/**
 * 创建文章
 * @param {Object} data - 文章数据
 * @returns {Promise} - HTTP 响应
 */
export const createArticle = (data) => {
  return http.post('/api/knowledge/articles', data)
}

/**
 * 更新文章
 * @param {number|string} id - 文章ID
 * @param {Object} data - 文章数据
 * @returns {Promise} - HTTP 响应
 */
export const updateArticle = (id, data) => {
  return http.put(`/api/knowledge/articles/${id}`, data)
}

/**
 * 删除文章
 * @param {number|string} id - 文章ID
 * @returns {Promise} - HTTP 响应
 */
export const deleteArticle = (id) => {
  return http.delete(`/api/knowledge/articles/${id}`)
}

/**
 * 获取文章版本历史
 * @param {number|string} id - 文章ID
 * @returns {Promise} - HTTP 响应
 */
export const getArticleVersions = (id) => {
  return http.get(`/api/knowledge/articles/${id}/versions`)
}

/**
 * 恢复文章到指定版本
 * @param {number|string} id - 文章ID
 * @param {number|string} versionId - 版本ID
 * @returns {Promise} - HTTP 响应
 */
export const restoreArticleVersion = (id, versionId) => {
  return http.post(`/api/knowledge/articles/${id}/restore`, { versionId })
}

/**
 * 搜索文章
 * @param {Object} params - 搜索参数
 * @param {string} params.q - 搜索关键词
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise} - HTTP 响应
 */
export const searchArticles = (params = {}) => {
  return http.get('/api/knowledge/search', { params })
}

/**
 * 获取分类列表
 * @returns {Promise} - HTTP 响应
 */
export const getCategories = () => {
  return http.get('/api/knowledge/categories')
}

/**
 * 获取标签列表
 * @returns {Promise} - HTTP 响应
 */
export const getTags = () => {
  return http.get('/api/knowledge/tags')
}

/**
 * 上传文章图片
 * @param {FormData} formData - 包含图片的表单数据
 * @returns {Promise} - HTTP 响应
 */
export const uploadImage = (formData) => {
  return http.post('/api/knowledge/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export default {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  getArticleVersions,
  restoreArticleVersion,
  searchArticles,
  getCategories,
  getTags,
  uploadImage
}
