<template>
  <v-dialog
    v-model="localValue"
    max-width="800"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-plus</v-icon>
        创建新页面
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
          
          <!-- 父页面选择 -->
          <v-autocomplete
            v-model="pageData.parent_id"
            :items="parentOptions"
            item-title="title"
            item-value="id"
            label="父页面（可选）"
            variant="outlined"
            clearable
            class="mb-4"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item
                v-bind="props"
                :style="{ paddingLeft: `${(item.raw.depth || 0) * 16 + 16}px` }"
              >
                <template v-slot:prepend>
                  <v-icon>
                    {{ item.raw.has_children ? 'mdi-folder' : 'mdi-file-document-outline' }}
                  </v-icon>
                </template>
              </v-list-item>
            </template>
          </v-autocomplete>
          
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
              placeholder="请输入页面内容，支持 Markdown 语法..."
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
          
          <!-- 权限设置 -->
          <v-expansion-panels class="mb-4">
            <v-expansion-panel>
              <v-expansion-panel-title>
                <v-icon class="mr-2">mdi-shield-outline</v-icon>
                权限设置
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-combobox
                      v-model="pageData.permissions.read"
                      :items="permissionOptions"
                      label="读取权限"
                      variant="outlined"
                      multiple
                      chips
                      closable-chips
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-combobox
                      v-model="pageData.permissions.edit"
                      :items="permissionOptions"
                      label="编辑权限"
                      variant="outlined"
                      multiple
                      chips
                      closable-chips
                    />
                  </v-col>
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-form>
      </v-card-text>
      
      <v-divider />
      
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn @click="cancel">取消</v-btn>
        <v-btn
          color="primary"
          @click="create"
          :disabled="!valid"
          :loading="creating"
        >
          创建页面
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
  parentId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'created'])

// 状态
const form = ref(null)
const contentEditor = ref(null)
const valid = ref(false)
const creating = ref(false)
const editorMode = ref('edit')

// 数据
const pageData = ref({
  title: '',
  content: '',
  parent_id: null,
  tags: [],
  permissions: {
    read: ['all'],
    edit: ['admin']
  }
})

const parentOptions = ref([])
const availableTags = ref([])

// 规则
const rules = {
  required: value => !!value || '此字段为必填项'
}

// 权限选项
const permissionOptions = [
  'all',
  'admin',
  'team-editors',
  'team-developers'
]

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
const loadParentOptions = async () => {
  try {
    const response = await WikiAPI.getPageTree()
    parentOptions.value = flattenTree(response.data.tree || [])
  } catch (error) {
    console.error('加载父页面选项失败:', error)
    parentOptions.value = []
  }
}

const flattenTree = (tree, depth = 0) => {
  const result = []
  for (const item of tree) {
    result.push({
      id: item.id,
      title: item.title,
      depth,
      has_children: item.has_children
    })
    if (item.children && item.children.length > 0) {
      result.push(...flattenTree(item.children, depth + 1))
    }
  }
  return result
}

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

const create = async () => {
  if (!form.value.validate()) return
  
  creating.value = true
  try {
    const data = {
      title: pageData.value.title.trim(),
      content: pageData.value.content.trim(),
      tags: pageData.value.tags,
      permissions: pageData.value.permissions
    }
    
    if (pageData.value.parent_id) {
      data.parent_id = pageData.value.parent_id
    }
    
    const response = await WikiAPI.createPage(data)
    emit('created', response.data)
    reset()
    localValue.value = false
  } catch (error) {
    console.error('创建页面失败:', error)
    alert('创建页面失败，请稍后再试')
  } finally {
    creating.value = false
  }
}

const cancel = () => {
  reset()
  localValue.value = false
}

const reset = () => {
  pageData.value = {
    title: '',
    content: '',
    parent_id: props.parentId,
    tags: [],
    permissions: {
      read: ['all'],
      edit: ['admin']
    }
  }
  editorMode.value = 'edit'
  if (form.value) {
    form.value.reset()
  }
}

// 监听
watch(() => props.parentId, (newParentId) => {
  pageData.value.parent_id = newParentId
})

watch(localValue, (newValue) => {
  if (newValue) {
    loadParentOptions()
    loadAvailableTags()
    pageData.value.parent_id = props.parentId
  }
})

// 组件挂载
onMounted(() => {
  reset()
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
