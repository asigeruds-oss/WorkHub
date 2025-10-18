<template>
  <v-dialog
    v-model="localValue"
    max-width="800"
    persistent
  >
    <v-card v-if="page">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-pencil</v-icon>
        编辑页面
      </v-card-title>
      
      <v-divider />
      
      <v-card-text class="pa-6">
        <v-form ref="form" v-model="valid">
          <!-- 页面标题 -->
          <v-text-field
            v-model="pageData.title"
            label="页面标题"
            variant="outlined"
            :rules="[rules.required]"
            class="mb-4"
          />
          
          <!-- 标签 -->
          <v-combobox
            v-model="pageData.tags"
            :items="availableTags"
            label="标签"
            variant="outlined"
            multiple
            chips
            closable-chips
            class="mb-4"
          />
          
          <!-- 页面内容 -->
          <div class="mb-4">
            <label class="text-subtitle-2 font-weight-bold mb-2 d-block">
              页面内容
            </label>
            
            <!-- 编辑器工具栏 -->
            <v-card variant="outlined" class="editor-toolbar">
              <v-card-text class="pa-2">
                <v-btn-group density="compact" variant="text">
                  <v-btn @click="insertMarkdown('**', '**')">
                    <v-icon>mdi-format-bold</v-icon>
                  </v-btn>
                  <v-btn @click="insertMarkdown('*', '*')">
                    <v-icon>mdi-format-italic</v-icon>
                  </v-btn>
                  <v-btn @click="insertMarkdown('`', '`')">
                    <v-icon>mdi-code-tags</v-icon>
                  </v-btn>
                  <v-btn @click="insertMarkdown('## ', '')">
                    <v-icon>mdi-format-header-2</v-icon>
                  </v-btn>
                  <v-btn @click="insertMarkdown('- ', '')">
                    <v-icon>mdi-format-list-bulleted</v-icon>
                  </v-btn>
                  <v-btn @click="insertMarkdown('[链接文字](', ')')">
                    <v-icon>mdi-link</v-icon>
                  </v-btn>
                </v-btn-group>
                
                <v-spacer />
                
                <v-btn-toggle
                  v-model="editorMode"
                  density="compact"
                  variant="outlined"
                >
                  <v-btn value="edit">编辑</v-btn>
                  <v-btn value="preview">预览</v-btn>
                </v-btn-toggle>
              </v-card-text>
            </v-card>
            
            <!-- 编辑区域 -->
            <v-textarea
              v-if="editorMode === 'edit'"
              ref="contentEditor"
              v-model="pageData.content"
              variant="outlined"
              rows="15"
              :rules="[rules.required]"
              hide-details
            />
            
            <!-- 预览区域 -->
            <v-card
              v-else
              variant="outlined"
              class="preview-area"
              min-height="400"
            >
              <v-card-text>
                <div
                  v-if="pageData.content.trim()"
                  class="markdown-content"
                  v-html="previewContent"
                />
                <div v-else class="text-center text-medium-emphasis py-8">
                  <v-icon size="48">mdi-eye-outline</v-icon>
                  <p class="mt-2">预览内容将在这里显示</p>
                </div>
              </v-card-text>
            </v-card>
          </div>
          
          <!-- 修改说明 -->
          <v-text-field
            v-model="pageData.comment"
            label="修改说明（可选）"
            variant="outlined"
            placeholder="描述本次修改的内容..."
          />
        </v-form>
      </v-card-text>
      
      <v-divider />
      
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn @click="cancel">取消</v-btn>
        <v-btn
          color="primary"
          @click="save"
          :disabled="!valid"
          :loading="saving"
        >
          保存修改
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { marked } from 'marked'
import WikiAPI from '@/api/wiki'

const props = defineProps({
  modelValue: Boolean,
  page: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'updated'])

// 状态
const form = ref(null)
const contentEditor = ref(null)
const valid = ref(false)
const saving = ref(false)
const editorMode = ref('edit')

// 数据
const pageData = ref({
  title: '',
  content: '',
  tags: [],
  comment: ''
})

const availableTags = ref([])

// 规则
const rules = {
  required: value => !!value || '此字段为必填项'
}

// 计算属性
const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const previewContent = computed(() => {
  if (!pageData.value.content.trim()) return ''
  return marked(pageData.value.content)
})

// 方法
const loadAvailableTags = async () => {
  try {
    const response = await WikiAPI.getTags()
    availableTags.value = response.data.map(tag => tag.name) || []
  } catch (error) {
    console.error('加载标签失败:', error)
    availableTags.value = []
  }
}

const insertMarkdown = (before, after) => {
  if (!contentEditor.value) return
  
  const textarea = contentEditor.value.$el.querySelector('textarea')
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = pageData.value.content.substring(start, end)
  
  const newText = before + selectedText + after
  const newContent = 
    pageData.value.content.substring(0, start) +
    newText +
    pageData.value.content.substring(end)
  
  pageData.value.content = newContent
  
  // 设置新的光标位置
  setTimeout(() => {
    const newCursorPos = start + before.length + selectedText.length
    textarea.setSelectionRange(newCursorPos, newCursorPos)
    textarea.focus()
  }, 0)
}

const save = async () => {
  if (!form.value.validate() || !props.page) return
  
  saving.value = true
  try {
    const data = {
      title: pageData.value.title.trim(),
      content: pageData.value.content.trim(),
      tags: pageData.value.tags
    }
    
    if (pageData.value.comment.trim()) {
      data.comment = pageData.value.comment.trim()
    }
    
    const response = await WikiAPI.patchPage(props.page.id, data)
    emit('updated', response.data)
    localValue.value = false
  } catch (error) {
    console.error('更新页面失败:', error)
    alert('更新页面失败，请稍后再试')
  } finally {
    saving.value = false
  }
}

const cancel = () => {
  localValue.value = false
}

const loadPageData = () => {
  if (props.page) {
    pageData.value = {
      title: props.page.title || '',
      content: props.page.content || '',
      tags: props.page.tags || [],
      comment: ''
    }
  }
}

// 监听
watch(() => props.page, loadPageData, { immediate: true })

watch(localValue, (newValue) => {
  if (newValue) {
    loadAvailableTags()
    loadPageData()
    editorMode.value = 'edit'
  }
})
</script>

<style scoped>
.editor-toolbar {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom: none;
}

.editor-toolbar + .v-textarea :deep(.v-field) {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.preview-area {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

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
