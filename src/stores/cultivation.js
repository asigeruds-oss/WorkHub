import { defineStore } from 'pinia'
import { CultivationAPI } from '@/api'

export const useCultivationStore = defineStore('cultivation', {
  state: () => ({
    // 用户修炼状态
    userCultivation: null,
    
    // 所有境界
    realms: [],
    
    // 当前境界的小境界
    currentStages: [],
    
    // 用户成就
    achievements: [],
    
    // 用户奖励历史
    rewardHistory: [],
    
    // 进阶历史
    advancementHistory: [],
    
    // 用户统计数据
    userStats: null,
    
    // 待办事项（带奖励信息）
    cultivationTodos: [],
    
    // 加载状态
    loading: {
      userCultivation: false,
      realms: false,
      stages: false,
      achievements: false,
      rewardHistory: false,
      advancementHistory: false,
      userStats: false,
      cultivationTodos: false
    },
    
    // 错误信息
    error: null
  }),

  getters: {
    // 获取用户当前境界信息
    getCurrentRealm: (state) => {
      if (!state.userCultivation) return null
      return {
        realmId: state.userCultivation.current_realm,
        realmName: state.userCultivation.realm_name,
        stageId: state.userCultivation.current_stage,
        stageName: state.userCultivation.stage_name
      }
    },
    
    // 获取用户修为信息
    getExpInfo: (state) => {
      if (!state.userCultivation) return null
      return {
        totalExp: state.userCultivation.total_exp,
        currentExp: state.userCultivation.current_exp,
        progress: state.userCultivation.next_level_progress,
        canAdvance: state.userCultivation.can_advance
      }
    },
    
    // 获取用户灵石和灵力信息
    getResources: (state) => {
      if (!state.userCultivation) return null
      return {
        spiritStones: state.userCultivation.spirit_stones,
        energy: state.userCultivation.energy,
        maxEnergy: state.userCultivation.max_energy,
        energyPercentage: state.userCultivation.energy_percentage
      }
    },
    
    // 获取已完成的待办事项（带奖励信息）
    getCompletedTodos: (state) => {
      return state.cultivationTodos.filter(todo => todo.status === 'done')
    },
    
    // 获取未完成的待办事项（带奖励信息）
    getPendingTodos: (state) => {
      return state.cultivationTodos.filter(todo => todo.status === 'pending')
    },
    
    // 获取已领取奖励的待办事项
    getRewardedTodos: (state) => {
      return state.cultivationTodos.filter(todo => 
        todo.status === 'done' && todo.reward_info?.is_rewarded
      )
    },
    
    // 获取未领取奖励的待办事项
    getUnrewardedTodos: (state) => {
      return state.cultivationTodos.filter(todo => 
        todo.status === 'done' && todo.reward_info && !todo.reward_info.is_rewarded
      )
    },
    
    // 获取已完成的成就
    getAchievedAchievements: (state) => {
      return state.achievements.filter(achievement => achievement.is_achieved)
    },
    
    // 获取进行中的成就
    getOngoingAchievements: (state) => {
      return state.achievements.filter(achievement => !achievement.is_achieved)
    }
  },

  actions: {
    // 获取用户修炼状态
    async fetchUserCultivation() {
      this.loading.userCultivation = true
      this.error = null
      
      try {
        const response = await CultivationAPI.getUserCultivation()
        this.userCultivation = response.data
        return this.userCultivation
      } catch (error) {
        console.error('获取用户修炼状态失败:', error)
        this.error = error.response?.data?.message || error.message || '获取用户修炼状态失败'
        throw error
      } finally {
        this.loading.userCultivation = false
      }
    },
    
    // 获取所有境界
    async fetchRealms() {
      this.loading.realms = true
      this.error = null
      
      try {
        const response = await CultivationAPI.getAllRealms()
        this.realms = response.data
        return this.realms
      } catch (error) {
        console.error('获取修真境界失败:', error)
        this.error = error.response?.data?.message || error.message || '获取修真境界失败'
        throw error
      } finally {
        this.loading.realms = false
      }
    },
    
    // 获取指定境界的小境界
    async fetchStagesByRealm(realmId) {
      this.loading.stages = true
      this.error = null
      
      try {
        const response = await CultivationAPI.getStagesByRealm(realmId)
        this.currentStages = response.data
        return this.currentStages
      } catch (error) {
        console.error('获取小境界失败:', error)
        this.error = error.response?.data?.message || error.message || '获取小境界失败'
        throw error
      } finally {
        this.loading.stages = false
      }
    },
    
    // 获取用户成就
    async fetchUserAchievements() {
      this.loading.achievements = true
      this.error = null
      
      try {
        const response = await CultivationAPI.getUserAchievements()
        this.achievements = response.data
        return this.achievements
      } catch (error) {
        console.error('获取用户成就失败:', error)
        this.error = error.response?.data?.message || error.message || '获取用户成就失败'
        throw error
      } finally {
        this.loading.achievements = false
      }
    },
    
    // 获取奖励历史
    async fetchRewardHistory() {
      this.loading.rewardHistory = true
      this.error = null
      
      try {
        const response = await CultivationAPI.getRewardHistory()
        this.rewardHistory = response.data
        return this.rewardHistory
      } catch (error) {
        console.error('获取奖励历史失败:', error)
        this.error = error.response?.data?.message || error.message || '获取奖励历史失败'
        throw error
      } finally {
        this.loading.rewardHistory = false
      }
    },
    
    // 获取进阶历史
    async fetchAdvancementHistory() {
      this.loading.advancementHistory = true
      this.error = null
      
      try {
        const response = await CultivationAPI.getAdvancementHistory()
        this.advancementHistory = response.data.history
        return this.advancementHistory
      } catch (error) {
        console.error('获取进阶历史失败:', error)
        this.error = error.response?.data?.message || error.message || '获取进阶历史失败'
        throw error
      } finally {
        this.loading.advancementHistory = false
      }
    },
    
    // 获取用户统计数据
    async fetchUserStats() {
      this.loading.userStats = true
      this.error = null
      
      try {
        const response = await CultivationAPI.getUserStats()
        this.userStats = response.data
        return this.userStats
      } catch (error) {
        console.error('获取用户统计数据失败:', error)
        this.error = error.response?.data?.message || error.message || '获取用户统计数据失败'
        throw error
      } finally {
        this.loading.userStats = false
      }
    },
    
    // 获取修炼系统待办事项
    async fetchCultivationTodos() {
      this.loading.cultivationTodos = true
      this.error = null
      
      try {
        const response = await CultivationAPI.getCultivationTodos()
        this.cultivationTodos = response.data
        return this.cultivationTodos
      } catch (error) {
        console.error('获取修炼待办事项失败:', error)
        this.error = error.response?.data?.message || error.message || '获取修炼待办事项失败'
        throw error
      } finally {
        this.loading.cultivationTodos = false
      }
    },
    
    // 完成待办事项
    async completeTodo(todoId) {
      this.error = null
      
      try {
        const response = await CultivationAPI.completeCultivationTodo(todoId)
        
        // 更新待办事项状态
        const index = this.cultivationTodos.findIndex(todo => todo.id === todoId)
        if (index !== -1) {
          this.cultivationTodos[index] = {
            ...this.cultivationTodos[index],
            status: 'done',
            completed_at: new Date().toISOString(),
            reward_info: {
              ...this.cultivationTodos[index].reward_info,
              is_rewarded: true
            }
          }
        }
        
        // 更新用户修炼状态
        if (response.data.cultivation) {
          this.userCultivation = response.data.cultivation
        }
        
        // 刷新统计数据
        await this.fetchUserStats()
        
        return response.data
      } catch (error) {
        console.error('完成待办事项失败:', error)
        this.error = error.response?.data?.message || error.message || '完成待办事项失败'
        throw error
      }
    },
    
    // 重新打开待办事项（取消完成）
    async reopenTodo(todoId) {
      this.error = null
      
      try {
        const response = await CultivationAPI.reopenCultivationTodo(todoId)
        
        // 更新待办事项状态
        const index = this.cultivationTodos.findIndex(todo => todo.id === todoId)
        if (index !== -1) {
          this.cultivationTodos[index] = {
            ...this.cultivationTodos[index],
            status: 'pending',
            completed_at: null,
            reward_info: {
              ...this.cultivationTodos[index].reward_info,
              is_rewarded: false
            }
          }
        }
        
        // 更新用户修炼状态
        if (response.data.cultivation) {
          this.userCultivation = response.data.cultivation
        }
        
        // 刷新统计数据
        await this.fetchUserStats()
        
        return response.data
      } catch (error) {
        console.error('重新打开待办事项失败:', error)
        this.error = error.response?.data?.message || error.message || '重新打开待办事项失败'
        throw error
      }
    },
    
    // 创建待办事项
    async createTodo(todoData) {
      this.error = null
      
      try {
        const response = await CultivationAPI.createCultivationTodo(todoData)
        
        // 添加到待办事项列表
        this.cultivationTodos.unshift(response.data)
        
        return response.data
      } catch (error) {
        console.error('创建待办事项失败:', error)
        this.error = error.response?.data?.message || error.message || '创建待办事项失败'
        throw error
      }
    },
    
    // 尝试进阶
    async advanceCultivation() {
      this.error = null
      
      try {
        const response = await CultivationAPI.advanceCultivation()
        
        // 更新用户修炼状态
        if (response.data.cultivation) {
          this.userCultivation = response.data.cultivation
        }
        
        return response.data
      } catch (error) {
        console.error('进阶修为失败:', error)
        this.error = error.response?.data?.message || error.message || '进阶修为失败'
        throw error
      }
    },
    
    // 恢复灵力
    async recoverEnergy(amount = 10) {
      this.error = null
      
      try {
        const response = await CultivationAPI.recoverEnergy({ amount })
        
        // 更新用户修炼状态
        if (response.data.cultivation) {
          this.userCultivation = response.data.cultivation
        }
        
        return response.data
      } catch (error) {
        console.error('恢复灵力失败:', error)
        this.error = error.response?.data?.message || error.message || '恢复灵力失败'
        throw error
      }
    },
    
    // 领取成就奖励
    async claimAchievementReward(achievementId) {
      this.error = null
      
      try {
        const response = await CultivationAPI.claimAchievementReward(achievementId)
        
        // 更新用户修炼状态
        if (response.data.cultivation) {
          this.userCultivation = response.data.cultivation
        }
        
        // 更新成就状态
        await this.fetchUserAchievements()
        
        return response.data
      } catch (error) {
        console.error('领取成就奖励失败:', error)
        this.error = error.response?.data?.message || error.message || '领取成就奖励失败'
        throw error
      }
    },
    
    // 初始化修炼系统
    async initCultivationSystem() {
      this.error = null
      
      try {
        // 并行获取所需数据
        await Promise.all([
          this.fetchUserCultivation(),
          this.fetchRealms(),
          this.fetchUserAchievements(),
          this.fetchCultivationTodos(),
          this.fetchUserStats()
        ])
        
        // 获取当前境界的小境界
        if (this.userCultivation && this.userCultivation.current_realm) {
          await this.fetchStagesByRealm(this.userCultivation.current_realm)
        }
        
        return {
          userCultivation: this.userCultivation,
          realms: this.realms,
          currentStages: this.currentStages,
          achievements: this.achievements,
          cultivationTodos: this.cultivationTodos,
          userStats: this.userStats
        }
      } catch (error) {
        console.error('初始化修炼系统失败:', error)
        this.error = error.message || '初始化修炼系统失败'
        throw error
      }
    }
  }
})
