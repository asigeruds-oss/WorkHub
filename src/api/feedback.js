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

export default {
  submitFeedback,
  getFeedbackReply
}
