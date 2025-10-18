<template>
  <div class="realm-guide">
    <v-alert
      v-if="realms.length === 0"
      type="info"
      variant="tonal"
      border="start"
      class="mb-4"
    >
      正在加载境界信息...
    </v-alert>
    
    <!-- 境界列表 -->
    <v-expansion-panels variant="popout">
      <v-expansion-panel
        v-for="realm in sortedRealms"
        :key="realm.id"
        :disabled="isRealmLocked(realm)"
        :class="{
          'current-realm': currentRealmId === realm.id,
          'locked-realm': isRealmLocked(realm)
        }"
      >
        <v-expansion-panel-title>
          <div class="d-flex align-center">
            <v-avatar
              :color="getRealmColor(realm)"
              class="mr-4"
              size="36"
              :image="getRealmIconUrl(realm)"
            >
              <v-icon 
                v-if="!realm.icon" 
                :icon="isRealmLocked(realm) ? 'mdi-lock' : 'mdi-incognito'" 
                :color="isRealmLocked(realm) ? 'grey' : 'white'"
              ></v-icon>
            </v-avatar>
            
            <div>
              <strong>{{ realm.name }}</strong>
              <div class="text-caption text-medium-emphasis">
                {{ getRealmStatus(realm) }}
              </div>
            </div>
            
            <v-spacer></v-spacer>
            
            <v-chip
              v-if="isRealmLocked(realm)"
              color="grey"
              size="small"
              variant="outlined"
              class="mr-2"
            >
              <span class="text-caption">需要 {{ realm.exp_required }} 修为</span>
            </v-chip>
            
            <v-chip
              v-else-if="currentRealmId === realm.id"
              color="amber-darken-2"
              size="small"
              variant="elevated"
              class="mr-2"
            >
              <span class="text-caption">当前境界</span>
            </v-chip>
            
            <v-chip
              v-else
              color="success"
              size="small"
              variant="outlined"
              class="mr-2"
            >
              <span class="text-caption">已解锁</span>
            </v-chip>
          </div>
        </v-expansion-panel-title>
        
        <v-expansion-panel-text>
          <div class="realm-description mb-4">
            {{ realm.description }}
          </div>
          
          <v-divider class="mb-4"></v-divider>
          
          <!-- 小境界列表 -->
          <v-list lines="one">
            <v-list-subheader>境界阶段</v-list-subheader>
            
            <v-list-item
              v-for="stage in getStagesForRealm(realm.id)"
              :key="stage.id"
              :active="currentStageId === stage.id"
              :disabled="isStageLocked(stage)"
              :class="{
                'current-stage': currentStageId === stage.id
              }"
              rounded="lg"
            >
              <template v-slot:prepend>
                <v-avatar
                  :color="getStageColor(stage)"
                  size="32"
                >
                  <span class="text-caption">{{ stage.order }}</span>
                </v-avatar>
              </template>
              
              <v-list-item-title>{{ stage.name }}</v-list-item-title>
              
              <v-list-item-subtitle>
                {{ stage.description }}
              </v-list-item-subtitle>
              
              <template v-slot:append>
                <v-chip
                  v-if="isStageLocked(stage)"
                  color="grey"
                  size="small"
                  variant="outlined"
                >
                  <span class="text-caption">需要 {{ stage.exp_required }} 修为</span>
                </v-chip>
                
                <v-chip
                  v-else-if="currentStageId === stage.id"
                  color="amber-darken-2"
                  size="small"
                  variant="elevated"
                >
                  <span class="text-caption">当前</span>
                </v-chip>
                
                <v-chip
                  v-else
                  color="success"
                  size="small"
                  variant="outlined"
                >
                  <span class="text-caption">已达成</span>
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCultivationStore } from '@/stores'

// Store
const cultivationStore = useCultivationStore()

// 属性
const props = defineProps({
  realms: {
    type: Array,
    default: () => []
  },
  currentRealmId: {
    type: Number,
    default: null
  },
  currentStageId: {
    type: Number,
    default: null
  }
})

// 状态
const stagesByRealm = ref({})

// 计算属性
const sortedRealms = computed(() => {
  return [...props.realms].sort((a, b) => a.order - b.order)
})

// 生命周期钩子
onMounted(async () => {
  // 获取所有境界的小境界信息
  for (const realm of props.realms) {
    if (!stagesByRealm.value[realm.id]) {
      try {
        const stages = await cultivationStore.fetchStagesByRealm(realm.id)
        stagesByRealm.value[realm.id] = stages
      } catch (error) {
        console.error(`获取境界 ${realm.id} 的小境界失败:`, error)
      }
    }
  }
})

// 方法
function getStagesForRealm(realmId) {
  return stagesByRealm.value[realmId] || []
}

function getRealmIconUrl(realm) {
  // 如果没有图标，返回null，让v-avatar使用默认图标
  if (!realm || !realm.icon) {
    return null
  }
  
  // 返回图标URL（假设图标存储在公共目录下）
  return `/assets/${realm.icon}`
}

function isRealmLocked(realm) {
  // 如果当前修为小于该境界所需修为，则锁定
  const userCultivation = cultivationStore.userCultivation
  if (!userCultivation) return true
  
  return userCultivation.total_exp < realm.exp_required
}

function isStageLocked(stage) {
  // 如果当前修为小于该小境界所需修为，则锁定
  const userCultivation = cultivationStore.userCultivation
  if (!userCultivation) return true
  
  return userCultivation.total_exp < stage.exp_required
}

function getRealmStatus(realm) {
  if (isRealmLocked(realm)) {
    return `需要 ${realm.exp_required} 修为解锁`
  }
  
  if (props.currentRealmId === realm.id) {
    return '当前境界'
  }
  
  return '已解锁'
}

function getRealmColor(realm) {
  if (isRealmLocked(realm)) {
    return 'grey'
  }
  
  if (props.currentRealmId === realm.id) {
    return 'amber-darken-2'
  }
  
  return 'success'
}

function getStageColor(stage) {
  if (isStageLocked(stage)) {
    return 'grey-lighten-1'
  }
  
  if (props.currentStageId === stage.id) {
    return 'amber-darken-2'
  }
  
  return 'success-lighten-1'
}
</script>

<style scoped>
.realm-guide {
  padding-bottom: 16px;
}

.current-realm {
  border-left: 3px solid var(--v-amber-darken-2-base, #ff8f00);
}

.locked-realm {
  opacity: 0.7;
}

.realm-description {
  line-height: 1.6;
  text-indent: 2em;
}

.current-stage {
  background-color: rgba(255, 193, 7, 0.1);
}

/* 境界图鉴动画 */
.v-expansion-panel {
  transition: all 0.3s ease;
}

.v-expansion-panel:hover {
  transform: translateY(-2px);
}
</style>
