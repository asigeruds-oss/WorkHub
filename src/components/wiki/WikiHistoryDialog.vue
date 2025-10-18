<template>
  <v-dialog
    v-model="localValue"
    max-width="800"
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-history</v-icon>
        页面历史版本
      </v-card-title>
      
      <v-divider />
      
      <v-card-text class="pa-0">
        <!-- 版本列表 -->
        <div v-if="versions.length > 0">
          <v-list>
            <v-list-item
              v-for="version in versions"
              :key="version.version"
              @click="viewVersion(version)"
            >
              <template v-slot:prepend>
                <v-avatar color="primary" size="32">
                  {{ version.version }}
                </v-avatar>
              </template>
              
              <v-list-item-title>
                版本 {{ version.version }}
              </v-list-item-title>
              
              <v-list-item-subtitle>
                <div class="d-flex align-center">
                  <span>{{ version.updated_by }}</span>
                  <span class="mx-2">•</span>
                  <span>{{ formatDate(version.updated_at) }}</span>
                  <span v-if="version.comment" class="mx-2">•</span>
                  <span v-if="version.comment" class="font-italic">
                    {{ version.comment }}
                  </span>
                </div>
              </v-list-item-subtitle>
              
              <template v-slot:append>
                <v-btn
                  icon="mdi-eye"
                  variant="text"
                  size="small"
                  @click.stop="viewVersion(version)"
                />
              </template>
            </v-list-item>
          </v-list>
        </div>
        
        <!-- 无历史版本 -->
        <div v-else-if="!loading" class="text-center py-8">
          <v-icon size="64" color="grey">mdi-history</v-icon>
          <h3 class="text-h6 mt-4 mb-2">暂无历史版本</h3>
          <p class="text-body-2 text-medium-emphasis">
            页面编辑后会显示历史版本
          </p>
        </div>
        
        <!-- 加载状态 -->
        <div v-if="loading" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" />
          <p class="mt-4">加载中...</p>
        </div>
      </v-card-text>
      
      <v-divider />
      
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn @click="localValue = false">关闭</v-btn>
      </v-card-actions>
    </v-card>
    
    <!-- 版本详情对话框 -->
    <v-dialog
      v-model="showVersionDetail"
      max-width="1000"
    >
      <v-card v-if="selectedVersion">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-file-document</v-icon>
          版本 {{ selectedVersion.version }} 详情
        </v-card-title>
        
        <v-divider />
        
        <v-card-text class="pa-6">
          <!-- 版本信息 -->
          <div class="mb-4">
            <v-chip color="primary" class="mr-2">
              版本 {{ selectedVersion.version }}
            </v-chip>
            <v-chip color="orange" class="mr-2">
              {{ selectedVersion.updated_by }}
            </v-chip>
            <v-chip color="green">
              {{ formatDate(selectedVersion.updated_at) }}
            </v-chip>
          </div>
          
          <!-- 修改说明 -->
          <div v-if="selectedVersion.comment" class="mb-4">
            <h4 class="text-subtitle-1 font-weight-bold mb-2">修改说明</h4>
            <p class="text-body-2">{{ selectedVersion.comment }}</p>
          </div>
          
          <!-- 页面标题 -->
          <div class="mb-4">
            <h4 class="text-subtitle-1 font-weight-bold mb-2">页面标题</h4>
            <h2 class="text-h5">{{ selectedVersion.title }}</h2>
          </div>
          
          <!-- 页面内容 -->
          <div>
            <h4 class="text-subtitle-1 font-weight-bold mb-2">页面内容</h4>
            <v-card variant="outlined">
              <v-card-text>
                <div
                  class="markdown-content"
                  v-html="renderVersionContent"
                />
              </v-card-text>
            </v-card>
          </div>
        </v-card-text>
        
        <v-divider />
        
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn @click="showVersionDetail = false">关闭</v-btn>
          <v-btn
            color="warning"
            @click="restoreVersion"
            :loading="restoring"
          >
            恢复到此版本
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { marked } from 'marked'
import WikiAPI from '@/api/wiki'

const props = defineProps({
  modelValue: Boolean,
  pageId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

// 状态
const loading = ref(false)
const restoring = ref(false)
const versions = ref([])
const selectedVersion = ref(null)
const showVersionDetail = ref(false)

// 计算属性
const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const renderVersionContent = computed(() => {
  if (!selectedVersion.value?.content) return ''
  return marked(selectedVersion.value.content)
})

// 方法
const loadVersions = async () => {
  if (!props.pageId) return
  
  loading.value = true
  try {
    const response = await WikiAPI.getPageHistory(props.pageId)
    versions.value = response.data.versions || []
  } catch (error) {
    console.error('加载历史版本失败:', error)
    versions.value = []
  } finally {
    loading.value = false
  }
}

const viewVersion = async (version) => {
  try {
    const response = await WikiAPI.getPageVersion(props.pageId, version.version)
    selectedVersion.value = response.data
    showVersionDetail.value = true
  } catch (error) {
    console.error('加载版本详情失败:', error)
    alert('加载版本详情失败，请稍后再试')
  }
}

const restoreVersion = () => {
  if (!selectedVersion.value) return
  
  if (!confirm(`确定要恢复到版本 ${selectedVersion.value.version} 吗？\n这将创建一个新的版本。`)) {
    return
  }
  
  restoring.value = true
  
  // 注意：API文档中没有直接的恢复版本接口
  // 这里使用更新接口来实现恢复功能
  WikiAPI.patchPage(props.pageId, {
    title: selectedVersion.value.title,
    content: selectedVersion.value.content,
    comment: `恢复到版本 ${selectedVersion.value.version}`
  }).then(() => {
    alert('版本恢复成功')
    showVersionDetail.value = false
    localValue.value = false
    // 触发页面刷新
    window.location.reload()
  }).catch(error => {
    console.error('恢复版本失败:', error)
    alert('恢复版本失败，请稍后再试')
  }).finally(() => {
    restoring.value = false
  })
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 监听
watch(localValue, (newValue) => {
  if (newValue && props.pageId) {
    loadVersions()
  }
})

watch(() => props.pageId, (newPageId) => {
  if (newPageId && localValue.value) {
    loadVersions()
  }
})
</script>

<style scoped>
.markdown-content {
  line-height: 1.7;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin: 1.5rem 0 0.75rem 0;
  font-weight: 600;
}

.markdown-content :deep(p) {
  margin-bottom: 1rem;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 1rem 0;
  padding-left: 2rem;
}

.markdown-content :deep(code) {
  background-color: rgb(var(--v-theme-surface-variant));
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: monospace;
}

.markdown-content :deep(pre) {
  background-color: rgb(var(--v-theme-surface-variant));
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1rem 0;
}
</style>
