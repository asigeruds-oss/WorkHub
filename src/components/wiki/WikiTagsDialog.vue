<template>
  <v-dialog
    v-model="localValue"
    max-width="600"
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-tag-multiple</v-icon>
        标签管理
      </v-card-title>
      
      <v-divider />
      
      <v-card-text class="pa-6">
        <!-- 标签列表 -->
        <div v-if="tags.length > 0">
          <h4 class="text-subtitle-1 font-weight-bold mb-4">
            所有标签 ({{ tags.length }})
          </h4>
          
          <v-chip-group column>
            <v-chip
              v-for="tag in tags"
              :key="tag.id"
              size="large"
              closable
              @click="searchByTag(tag.name)"
              @click:close="deleteTag(tag)"
            >
              <template v-slot:prepend>
                <v-icon>mdi-tag</v-icon>
              </template>
              {{ tag.name }}
            </v-chip>
          </v-chip-group>
        </div>
        
        <!-- 无标签 -->
        <div v-else class="text-center py-8">
          <v-icon size="64" color="grey">mdi-tag-outline</v-icon>
          <h3 class="text-h6 mt-4 mb-2">暂无标签</h3>
          <p class="text-body-2 text-medium-emphasis">
            标签会在创建页面时自动生成
          </p>
        </div>
        
        <!-- 加载状态 -->
        <v-overlay
          v-model="loading"
          contained
          class="d-flex align-center justify-center"
        >
          <v-progress-circular indeterminate color="primary" />
        </v-overlay>
      </v-card-text>
      
      <v-divider />
      
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn @click="localValue = false">关闭</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import WikiAPI from '@/api/wiki'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])

const router = useRouter()

// 状态
const loading = ref(false)
const tags = ref([])

// 计算属性
const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 方法
const loadTags = async () => {
  loading.value = true
  try {
    const response = await WikiAPI.getTags()
    tags.value = response.data || []
  } catch (error) {
    console.error('加载标签失败:', error)
    tags.value = []
  } finally {
    loading.value = false
  }
}

const searchByTag = (tagName) => {
  localValue.value = false
  router.push(`/wiki/search?tags=${encodeURIComponent(tagName)}`)
}

const deleteTag = async (tag) => {
  if (!confirm(`确定要删除标签"${tag.name}"吗？\n注意：这不会删除使用该标签的页面。`)) {
    return
  }
  
  try {
    // 注意：API文档中没有删除标签的接口，这里只是示例
    // await WikiAPI.deleteTag(tag.id)
    console.log('删除标签:', tag.name)
    // 暂时从本地移除
    const index = tags.value.findIndex(t => t.id === tag.id)
    if (index !== -1) {
      tags.value.splice(index, 1)
    }
  } catch (error) {
    console.error('删除标签失败:', error)
    alert('删除标签失败，请稍后再试')
  }
}

// 监听
watch(localValue, (newValue) => {
  if (newValue) {
    loadTags()
  }
})
</script>
