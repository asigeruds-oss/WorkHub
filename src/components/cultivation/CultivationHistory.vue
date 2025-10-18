<template>
  <div class="cultivation-history">
    <!-- 历史记录类型切换 -->
    <div class="d-flex align-center mb-4">
      <v-btn-toggle
        v-model="activeHistory"
        mandatory
        color="primary"
        rounded="lg"
        density="comfortable"
      >
        <v-btn value="rewards">
          <v-icon start>mdi-gift</v-icon>
          奖励历史
        </v-btn>
        <v-btn value="advancement">
          <v-icon start>mdi-stairs-up</v-icon>
          进阶历史
        </v-btn>
      </v-btn-toggle>
      
      <v-spacer></v-spacer>
      
      <v-btn
        prepend-icon="mdi-refresh"
        variant="text"
        @click="fetchHistory"
        color="primary"
      >
        刷新
      </v-btn>
    </div>
    
    <!-- 奖励历史 -->
    <div v-if="activeHistory === 'rewards'">
      <v-alert
        v-if="rewardHistory.length === 0"
        type="info"
        variant="tonal"
        border="start"
        class="mb-4"
      >
        暂无奖励记录，完成任务可获得奖励
      </v-alert>
      
      <v-timeline v-else side="end" align="start">
        <v-timeline-item
          v-for="reward in rewardHistory"
          :key="reward.id"
          :dot-color="getRewardColor(reward)"
          size="small"
          :icon="getRewardIcon(reward)"
        >
          <div class="d-flex flex-column">
            <div class="text-caption text-medium-emphasis mb-1">
              {{ formatDateTime(reward.created_at) }}
            </div>
            <div class="text-subtitle-1 mb-1">{{ reward.description }}</div>
            <div class="d-flex align-center mb-1">
              <v-chip
                size="x-small"
                color="amber-darken-2"
                class="mr-2"
              >
                <v-icon start size="x-small">mdi-flash</v-icon>
                {{ reward.exp }} 修为
              </v-chip>
              
              <v-chip
                size="x-small"
                color="blue"
                class="mr-2"
              >
                <v-icon start size="x-small">mdi-diamond-stone</v-icon>
                {{ reward.spirit_stones }} 灵石
              </v-chip>
              
              <v-chip
                size="x-small"
                color="deep-orange"
              >
                <v-icon start size="x-small">mdi-lightning-bolt</v-icon>
                -{{ reward.energy_cost }} 灵力
              </v-chip>
            </div>
          </div>
        </v-timeline-item>
      </v-timeline>
    </div>
    
    <!-- 进阶历史 -->
    <div v-else>
      <v-alert
        v-if="advancementHistory.length === 0"
        type="info"
        variant="tonal"
        border="start"
        class="mb-4"
      >
        暂无进阶记录，积累修为可提升境界
      </v-alert>
      
      <v-timeline v-else side="end" align="start">
        <v-timeline-item
          v-for="advancement in advancementHistory"
          :key="advancement.id"
          dot-color="amber-darken-2"
          size="small"
          icon="mdi-creation"
        >
          <div class="d-flex flex-column">
            <div class="text-caption text-medium-emphasis mb-1">
              {{ formatDateTime(advancement.created_at) }}
            </div>
            <div class="text-subtitle-1 mb-1">{{ advancement.description }}</div>
            <div class="text-caption">
              从 <strong>{{ advancement.old_realm }} · {{ advancement.old_stage }}</strong> 
              晋升到 
              <strong>{{ advancement.new_realm }} · {{ advancement.new_stage }}</strong>
            </div>
          </div>
        </v-timeline-item>
      </v-timeline>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 属性
const props = defineProps({
  rewardHistory: {
    type: Array,
    default: () => []
  },
  advancementHistory: {
    type: Array,
    default: () => []
  }
})

// 事件
const emit = defineEmits(['fetch-history'])

// 状态
const activeHistory = ref('rewards')

// 生命周期钩子
onMounted(() => {
  if (props.rewardHistory.length === 0 && props.advancementHistory.length === 0) {
    fetchHistory()
  }
})

// 方法
function fetchHistory() {
  emit('fetch-history')
}

function getRewardColor(reward) {
  if (reward.description.includes('成就')) {
    return 'amber-darken-2'
  }
  return 'primary'
}

function getRewardIcon(reward) {
  if (reward.description.includes('成就')) {
    return 'mdi-trophy'
  }
  return 'mdi-check-circle'
}

function formatDateTime(dateString) {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  })
}
</script>

<style scoped>
.cultivation-history {
  padding-bottom: 16px;
}

.v-timeline-item {
  margin-bottom: 16px;
}
</style>
