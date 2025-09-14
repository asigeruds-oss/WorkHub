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

export default {
  submitFeedback
}
