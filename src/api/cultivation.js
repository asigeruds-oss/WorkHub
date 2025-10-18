// 修炼系统API
import http from './http'

/**
 * 获取所有修真境界
 * @returns {Promise} - 所有修真境界数据
 */
export const getAllRealms = () => {
  return http.get('/api/cultivation/realms/')
}

/**
 * 获取指定境界下的所有小境界
 * @param {number} realmId - 境界ID
 * @returns {Promise} - 指定境界下的所有小境界
 */
export const getStagesByRealm = (realmId) => {
  return http.get(`/api/cultivation/realms/${realmId}/stages/`)
}

/**
 * 获取当前用户的修炼状态
 * @returns {Promise} - 当前用户的修炼状态数据
 */
export const getUserCultivation = () => {
  return http.get('/api/cultivation/user-cultivation/my_cultivation/')
}

/**
 * 尝试提升修炼境界
 * @returns {Promise} - 提升结果
 */
export const advanceCultivation = () => {
  return http.post('/api/cultivation/user-cultivation/advance_cultivation/')
}

/**
 * 获取用户修炼境界进阶历史
 * @returns {Promise} - 用户修炼境界进阶历史
 */
export const getAdvancementHistory = () => {
  return http.get('/api/cultivation/user-cultivation/advancement_history/')
}

/**
 * 消耗灵石恢复灵力
 * @param {Object} data - 恢复参数
 * @param {number} data.amount - 要恢复的灵力数量
 * @returns {Promise} - 恢复结果
 */
export const recoverEnergy = (data) => {
  return http.post('/api/cultivation/user-cultivation/recover_energy/', data)
}

/**
 * 获取用户的奖励历史
 * @returns {Promise} - 用户奖励历史
 */
export const getRewardHistory = () => {
  return http.get('/api/cultivation/reward-history/')
}

/**
 * 获取所有可获得的成就
 * @returns {Promise} - 所有成就数据
 */
export const getAllAchievements = () => {
  return http.get('/api/cultivation/achievements/')
}

/**
 * 获取当前用户已获得的成就
 * @returns {Promise} - 用户已获得的成就
 */
export const getUserAchievements = () => {
  return http.get('/api/cultivation/achievements/my_achievements/')
}

/**
 * 领取已达成成就的奖励
 * @param {number} achievementId - 成就ID
 * @returns {Promise} - 领取结果
 */
export const claimAchievementReward = (achievementId) => {
  return http.post(`/api/cultivation/achievements/${achievementId}/claim_reward/`)
}

/**
 * 获取当前用户的统计数据
 * @returns {Promise} - 用户统计数据
 */
export const getUserStats = () => {
  return http.get('/api/cultivation/user-stats/my_stats/')
}

/**
 * 获取带奖励信息的待办事项
 * @returns {Promise} - 带奖励信息的待办事项
 */
export const getCultivationTodos = () => {
  return http.get('/api/cultivation/todos/')
}

/**
 * 完成修炼系统中的待办事项
 * @param {number} todoId - 待办事项ID
 * @returns {Promise} - 完成结果，包含奖励信息
 */
export const completeCultivationTodo = (todoId) => {
  return http.post(`/api/cultivation/todos/${todoId}/complete/`)
}

/**
 * 重新打开修炼系统中的待办事项（取消完成）
 * @param {number} todoId - 待办事项ID
 * @returns {Promise} - 操作结果
 */
export const reopenCultivationTodo = (todoId) => {
  return http.post(`/api/cultivation/todos/${todoId}/reopen/`)
}

/**
 * 在修炼系统中创建新的待办事项
 * @param {Object} todoData - 待办事项数据
 * @returns {Promise} - 新创建的待办事项
 */
export const createCultivationTodo = (todoData) => {
  return http.post('/api/cultivation/todos/', todoData)
}

export default {
  getAllRealms,
  getStagesByRealm,
  getUserCultivation,
  advanceCultivation,
  getAdvancementHistory,
  recoverEnergy,
  getRewardHistory,
  getAllAchievements,
  getUserAchievements,
  claimAchievementReward,
  getUserStats,
  getCultivationTodos,
  completeCultivationTodo,
  reopenCultivationTodo,
  createCultivationTodo
}
