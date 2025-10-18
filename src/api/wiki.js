// Wiki API 服务
import http from './http'

/**
 * 页面管理 API
 */

/**
 * 获取页面列表
 * @param {Object} params - 查询参数
 * @param {number} params.limit - 每页数量，默认10，最大100
 * @param {number} params.page - 页码，默认1
 */
export const getPages = (params = {}) => {
  return http.get('/api/wiki/pages/', { params })
}

/**
 * 创建页面
 * @param {Object} data - 页面数据
 * @param {string} data.title - 页面标题
 * @param {string} data.content - 页面内容（Markdown）
 * @param {number} data.parent_id - 父页面ID（可选）
 * @param {Array} data.tags - 标签数组（可选）
 * @param {Object} data.permissions - 权限设置（可选）
 */
export const createPage = (data) => {
  return http.post('/api/wiki/pages/', data)
}

/**
 * 获取页面详情
 * @param {number|string} id - 页面ID
 */
export const getPage = (id) => {
  return http.get(`/api/wiki/pages/${id}/`)
}

/**
 * 更新页面（完整更新）
 * @param {number|string} id - 页面ID
 * @param {Object} data - 页面数据
 */
export const updatePage = (id, data) => {
  return http.put(`/api/wiki/pages/${id}/`, data)
}

/**
 * 更新页面（部分更新）
 * @param {number|string} id - 页面ID
 * @param {Object} data - 部分页面数据
 */
export const patchPage = (id, data) => {
  return http.patch(`/api/wiki/pages/${id}/`, data)
}

/**
 * 删除页面
 * @param {number|string} id - 页面ID
 */
export const deletePage = (id) => {
  return http.delete(`/api/wiki/pages/${id}/`)
}

/**
 * 树形结构与导航 API
 */

/**
 * 获取页面树形结构
 * @param {Object} params - 查询参数
 * @param {string} params.path - 路径前缀过滤（可选）
 */
export const getPageTree = (params = {}) => {
  return http.get('/api/wiki/pages/tree/', { params })
}

/**
 * 获取页面的直接子页面
 * @param {number|string} id - 父页面ID
 * @param {Object} params - 查询参数
 * @param {number} params.limit - 每页数量，默认10
 * @param {number} params.page - 页码，默认1
 */
export const getPageChildren = (id, params = {}) => {
  return http.get(`/api/wiki/pages/${id}/children/`, { params })
}

/**
 * 获取页面的面包屑导航
 * @param {number|string} id - 页面ID
 */
export const getPageBreadcrumb = (id) => {
  return http.get(`/api/wiki/pages/${id}/breadcrumb/`)
}

/**
 * 移动页面
 * @param {number|string} id - 要移动的页面ID
 * @param {Object} data - 移动参数
 * @param {number} data.parent_id - 新的父页面ID（null表示移动到根目录）
 */
export const movePage = (id, data) => {
  return http.post(`/api/wiki/pages/${id}/move/`, data)
}

/**
 * 历史版本管理 API
 */

/**
 * 获取页面历史版本列表
 * @param {number|string} id - 页面ID
 * @param {Object} params - 查询参数
 * @param {number} params.limit - 每页数量，默认10
 * @param {number} params.offset - 偏移量，默认0
 */
export const getPageHistory = (id, params = {}) => {
  return http.get(`/api/wiki/pages/${id}/history/`, { params })
}

/**
 * 获取特定历史版本详情
 * @param {number|string} id - 页面ID
 * @param {number|string} version - 版本号
 */
export const getPageVersion = (id, version) => {
  return http.get(`/api/wiki/pages/${id}/history/${version}/`)
}

/**
 * 搜索 API
 */

/**
 * 搜索页面
 * @param {Object} params - 搜索参数
 * @param {string} params.query - 搜索关键词（可选）
 * @param {string} params.tags - 标签列表，用逗号分隔（可选）
 * @param {string} params.path - 路径前缀过滤（可选）
 * @param {number} params.limit - 每页数量，默认10
 * @param {number} params.page - 页码，默认1
 */
export const searchPages = (params = {}) => {
  return http.get('/api/wiki/search/', { params })
}

/**
 * 标签管理 API
 */

/**
 * 获取所有标签
 */
export const getTags = () => {
  return http.get('/api/wiki/tags/')
}

/**
 * 获取标签详情
 * @param {number|string} id - 标签ID
 */
export const getTag = (id) => {
  return http.get(`/api/wiki/tags/${id}/`)
}

/**
 * 获取标签下的页面
 * @param {number|string} id - 标签ID
 * @param {Object} params - 查询参数
 * @param {number} params.limit - 每页数量，默认10
 * @param {number} params.page - 页码，默认1
 */
export const getTagPages = (id, params = {}) => {
  return http.get(`/api/wiki/tags/${id}/pages/`, { params })
}

/**
 * 评论管理 API
 */

/**
 * 获取页面评论列表
 * @param {number|string} pageId - 页面ID
 */
export const getPageComments = (pageId) => {
  return http.get(`/api/wiki/pages/${pageId}/comments/`)
}

/**
 * 创建评论
 * @param {number|string} pageId - 页面ID
 * @param {Object} data - 评论数据
 * @param {string} data.content - 评论内容
 * @param {number} data.parent - 父评论ID（可选，用于回复）
 */
export const createComment = (pageId, data) => {
  return http.post(`/api/wiki/pages/${pageId}/comments/`, data)
}

/**
 * 获取评论详情
 * @param {number|string} pageId - 页面ID
 * @param {number|string} commentId - 评论ID
 */
export const getComment = (pageId, commentId) => {
  return http.get(`/api/wiki/pages/${pageId}/comments/${commentId}/`)
}

/**
 * 更新评论
 * @param {number|string} pageId - 页面ID
 * @param {number|string} commentId - 评论ID
 * @param {Object} data - 评论数据
 * @param {string} data.content - 评论内容
 */
export const updateComment = (pageId, commentId, data) => {
  return http.patch(`/api/wiki/pages/${pageId}/comments/${commentId}/`, data)
}

/**
 * 删除评论
 * @param {number|string} pageId - 页面ID
 * @param {number|string} commentId - 评论ID
 */
export const deleteComment = (pageId, commentId) => {
  return http.delete(`/api/wiki/pages/${pageId}/comments/${commentId}/`)
}

/**
 * 获取评论的回复
 * @param {number|string} pageId - 页面ID
 * @param {number|string} commentId - 评论ID
 */
export const getCommentReplies = (pageId, commentId) => {
  return http.get(`/api/wiki/pages/${pageId}/comments/${commentId}/replies/`)
}

// 默认导出所有API方法
export default {
  // 页面管理
  getPages,
  createPage,
  getPage,
  updatePage,
  patchPage,
  deletePage,
  
  // 树形结构与导航
  getPageTree,
  getPageChildren,
  getPageBreadcrumb,
  movePage,
  
  // 历史版本管理
  getPageHistory,
  getPageVersion,
  
  // 搜索
  searchPages,
  
  // 标签管理
  getTags,
  getTag,
  getTagPages,
  
  // 评论管理
  getPageComments,
  createComment,
  getComment,
  updateComment,
  deleteComment,
  getCommentReplies
}