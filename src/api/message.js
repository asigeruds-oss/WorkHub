// 留言板API
import http from './http'

/**
 * 获取留言列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.sortBy - 排序字段
 * @param {string} params.sortOrder - 排序顺序
 * @returns {Promise} - HTTP响应
 */
export const getMessages = (params = {}) => {
  return http.get('/api/messages/', { params })
}

/**
 * 发送留言
 * @param {Object} data - 留言数据
 * @param {string} data.content - 留言内容
 * @param {string} data.color - 留言颜色
 * @returns {Promise} - HTTP响应
 */
export const sendMessage = (data) => {
  return http.post('/api/messages/', data)
}

/**
 * 删除留言 (可选功能)
 * @param {string} id - 留言ID
 * @returns {Promise} - HTTP响应
 */
export const deleteMessage = (id) => {
  return http.delete(`/api/messages/${id}`)
}

export default {
  getMessages,
  sendMessage,
  deleteMessage
}
