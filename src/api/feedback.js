// 反馈功能API
import http from './http'

/**
 * 提交用户反馈
 * @param {Object} data - 反馈数据
 * @param {string} data.name - 用户姓名（可选）
 * @param {string} data.email - 用户邮箱（可选）
 * @param {string} data.type - 反馈类型（suggestion/bug/question/other）
 * @param {string} data.content - 反馈内容
 * @returns {Promise} - HTTP响应
 */
export const submitFeedback = (data) => {
  return http.post('/api/feedback/', data)
}

/**
 * 获取反馈回复内容
 * 从后端获取反馈回复，包括文字内容和显示位置
 * @returns {Promise} - 包含回复内容和位置信息的响应
 */
export const getFeedbackReply = () => {
  return http.get('/api/feedback/reply')
}

/**
 * 获取反馈列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.source - 反馈来源（可选）
 * @param {string} params.type - 反馈类型（可选）
 * @param {string} params.status - 反馈状态（可选）
 * @returns {Promise} - HTTP响应
 */
export const getFeedbackList = (params) => {
  return http.get('/api/feedback/list', { params })
}

/**
 * 获取反馈的回复列表
 * @param {number} feedbackId - 反馈ID
 * @returns {Promise} - HTTP响应
 */
export const getFeedbackReplies = (feedbackId) => {
  return http.get(`/api/feedback/${feedbackId}/replies`)
}

/**
 * 回复反馈
 * @param {number} feedbackId - 反馈ID
 * @param {Object} data - 回复数据
 * @param {string} data.author - 回复人姓名
 * @param {string} data.content - 回复内容
 * @param {boolean} data.is_admin - 是否为管理员回复
 * @returns {Promise} - HTTP响应
 */
export const replyFeedback = (feedbackId, data) => {
  return http.post(`/api/feedback/${feedbackId}/reply`, data)
}

export default {
  submitFeedback,
  getFeedbackReply,
  getFeedbackList,
  getFeedbackReplies,
  replyFeedback
}
