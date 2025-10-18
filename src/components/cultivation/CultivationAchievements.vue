<template>
  <div class="cultivation-achievements">
    <v-alert
      v-if="achievements.length === 0"
      type="info"
      variant="tonal"
      border="start"
      class="mb-4"
    >
      正在加载成就...
    </v-alert>
    
    <!-- 成就类别切换 -->
    <div class="d-flex align-center mb-4">
      <v-btn-toggle
        v-model="activeFilter"
        mandatory
        color="primary"
        rounded="lg"
        density="comfortable"
      >
        <v-btn value="ongoing">
          <v-icon start>mdi-progress-clock</v-icon>
          进行中
        </v-btn>
        <v-btn value="achieved">
          <v-icon start>mdi-check-circle</v-icon>
          已达成
        </v-btn>
      </v-btn-toggle>
      
      <v-spacer></v-spacer>
      
      <v-btn
        prepend-icon="mdi-refresh"
        variant="text"
        @click="$emit('refresh')"
        color="primary"
      >
        刷新
      </v-btn>
    </div>
    
    <!-- 成就网格 -->
    <v-row>
      <v-col
        v-for="achievement in filteredAchievements"
        :key="achievement.id"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card
          class="achievement-card"
          :class="{
            'achievement-completed': achievement.is_achieved
          }"
        >
          <div class="achievement-icon-wrapper">
            <v-avatar
              size="64"
              :color="achievement.is_achieved ? 'amber-lighten-1' : 'grey-lighten-1'"
              class="achievement-avatar"
            >
              <v-icon 
                :icon="getAchievementIcon(achievement)" 
                size="large"
                :color="achievement.is_achieved ? 'white' : 'grey-darken-1'"
              ></v-icon>
            </v-avatar>
          </div>
          
          <v-card-title class="pt-0">{{ achievement.achievement_name }}</v-card-title>
          
          <v-card-text>
            <p class="text-body-2 mb-3">{{ achievement.achievement_description }}</p>
            
            <div class="d-flex align-center mb-2">
              <div class="text-caption text-medium-emphasis mr-2">进度:</div>
              <div class="text-caption font-weight-medium">
                {{ achievement.current_value }} / {{ achievement.target_value }}
              </div>
              <v-spacer></v-spacer>
              <div class="text-caption font-weight-medium">
                {{ achievement.progress_percentage }}%
              </div>
            </div>
            
            <v-progress-linear
              :model-value="achievement.progress_percentage"
              :color="achievement.is_achieved ? 'success' : 'primary'"
              height="6"
              rounded
              class="mb-3"
            ></v-progress-linear>
            
            <div class="d-flex align-center mt-4">
              <div>
                <div class="text-caption text-medium-emphasis">奖励</div>
                <div class="d-flex align-center">
                  <v-chip
                    size="x-small"
                    color="amber-darken-2"
                    class="mr-2"
                  >
                    <v-icon start size="x-small">mdi-flash</v-icon>
                    {{ achievement.exp_reward || 0 }}
                  </v-chip>
                  
                  <v-chip
                    size="x-small"
                    color="blue"
                  >
                    <v-icon start size="x-small">mdi-diamond-stone</v-icon>
                    {{ achievement.spirit_stones_reward || 0 }}
                  </v-chip>
                </div>
              </div>
              
              <v-spacer></v-spacer>
              
              <v-btn
                v-if="achievement.is_achieved"
                color="primary"
                variant="tonal"
                size="small"
                :disabled="achievement.reward_claimed || claimingReward[achievement.id]"
                @click="claimReward(achievement)"
                :loading="claimingReward[achievement.id]"
              >
                {{ achievement.reward_claimed ? '已领取' : '领取奖励' }}
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- 无结果提示 -->
    <div 
      v-if="filteredAchievements.length === 0 && achievements.length > 0" 
      class="text-center py-8 text-medium-emphasis"
    >
      <v-icon icon="mdi-trophy-variant" size="large" class="mb-2"></v-icon>
      <div>没有{{ activeFilter === 'ongoing' ? '进行中' : '已达成' }}的成就</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'

// 属性
const props = defineProps({
  achievements: {
    type: Array,
    default: () => []
  }
})

// 事件
const emit = defineEmits(['claim-reward', 'refresh'])

// 状态
const activeFilter = ref('ongoing')
const claimingReward = reactive({})

// 计算属性
const filteredAchievements = computed(() => {
  return props.achievements.filter(achievement => {
    if (activeFilter.value === 'ongoing') {
      return !achievement.is_achieved
    }
    return achievement.is_achieved
  })
})

// 方法
function getAchievementIcon(achievement) {
  // 根据成就类型返回图标
  const type = achievement.achievement_type || ''
  
  if (type.includes('todo_count')) return 'mdi-format-list-checks'
  if (type.includes('continuous_days')) return 'mdi-calendar-check'
  if (type.includes('high_priority')) return 'mdi-priority-high'
  
  // 默认图标
  return achievement.is_achieved ? 'mdi-trophy' : 'mdi-trophy-outline'
}

function claimReward(achievement) {
  if (claimingReward[achievement.id]) return
  
  claimingReward[achievement.id] = true
  
  // 发送领取奖励事件
  emit('claim-reward', achievement.id)
    .finally(() => {
      claimingReward[achievement.id] = false
    })
}
</script>

<style scoped>
.achievement-card {
  position: relative;
  overflow: visible;
  transition: all 0.3s ease;
  height: 100%;
}

.achievement-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
}

.achievement-completed {
  border-top: 3px solid var(--v-success-base, #4caf50);
}

.achievement-icon-wrapper {
  display: flex;
  justify-content: center;
  margin-top: -24px;
  margin-bottom: 8px;
}

.achievement-avatar {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
