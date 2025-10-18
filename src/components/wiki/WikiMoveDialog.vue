<template>
  <v-dialog
    v-model="localValue"
    max-width="600"
  >
    <v-card v-if="page">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-folder-move</v-icon>
        移动页面
      </v-card-title>
      
      <v-divider />
      
      <v-card-text class="pa-6">
        <div class="mb-4">
          <h4 class="text-subtitle-1 font-weight-bold mb-2">当前页面</h4>
          <v-chip color="primary" prepend-icon="mdi-file-document">
            {{ page.title }}
          </v-chip>
          <p class="text-caption text-medium-emphasis mt-2">
            当前路径：{{ page.path }}
          </p>
        </div>
        
        <v-form ref="form">
          <v-autocomplete
            v-model="selectedParentId"
            :items="parentOptions"
            item-title="title"
            item-value="id"
            label="移动到"
            variant="outlined"
            clearable
            placeholder="选择新的父页面，留空表示移动到根目录"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item
                v-bind="props"
                :style="{ paddingLeft: `${(item.raw.depth || 0) * 16 + 16}px` }"
                :disabled="item.raw.disabled"
              >
                <template v-slot:prepend>
                  <v-icon>
                    {{ item.raw.has_children ? 'mdi-folder' : 'mdi-file-document-outline' }}
                  </v-icon>
                </template>
                <template v-slot:append v-if="item.raw.disabled">
                  <v-chip size="x-small" color="error">不可选择</v-chip>
                </template>
              </v-list-item>
            </template>
          </v-autocomplete>
        </v-form>
        
        <!-- 预览新路径 -->
        <div v-if="newPath" class="mt-4">
          <h4 class="text-subtitle-1 font-weight-bold mb-2">预览新路径</h4>
          <v-chip color="success" prepend-icon="mdi-file-document">
            {{ newPath }}
          </v-chip>
        </div>
        
        <!-- 警告信息 -->
        <v-alert
          v-if="hasWarning"
          type="warning"
          variant="tonal"
          class="mt-4"
        >
          <v-alert-title>注意</v-alert-title>
          移动页面后，其URL路径将发生变化，可能影响现有的链接。
        </v-alert>
      </v-card-text>
      
      <v-divider />
      
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn @click="cancel">取消</v-btn>
        <v-btn
          color="primary"
          @click="move"
          :loading="moving"
          :disabled="!canMove"
        >
          移动页面
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import WikiAPI from '@/api/wiki'

const props = defineProps({
  modelValue: Boolean,
  page: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'moved'])

// 状态
const form = ref(null)
const moving = ref(false)
const selectedParentId = ref(null)
const parentOptions = ref([])

// 计算属性
const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const newPath = computed(() => {
  if (!props.page) return ''
  
  if (selectedParentId.value === null) {
    // 移动到根目录
    return `/${props.page.title.toLowerCase().replace(/\s+/g, '-')}`
  }
  
  // 找到选中的父页面
  const parent = parentOptions.value.find(p => p.id === selectedParentId.value)
  if (parent) {
    return `${parent.path}/${props.page.title.toLowerCase().replace(/\s+/g, '-')}`
  }
  
  return ''
})

const hasWarning = computed(() => {
  if (!props.page || !newPath.value) return false
  return props.page.path !== newPath.value
})

const canMove = computed(() => {
  if (!props.page) return false
  
  // 不能移动到自己或子页面下
  if (selectedParentId.value === props.page.id) return false
  
  // 检查是否是子页面（这需要更复杂的逻辑，这里简化处理）
  const selected = parentOptions.value.find(p => p.id === selectedParentId.value)
  if (selected && selected.path && props.page.path) {
    return !selected.path.startsWith(props.page.path)
  }
  
  return true
})

// 方法
const loadParentOptions = async () => {
  try {
    const response = await WikiAPI.getPageTree()
    const flatTree = flattenTree(response.data.tree || [])
    
    // 过滤掉当前页面和其子页面
    parentOptions.value = flatTree.filter(item => {
      if (item.id === props.page?.id) {
        item.disabled = true
        item.title += ' (当前页面)'
        return true
      }
      
      // 简化的子页面检查
      if (props.page?.path && item.path && item.path.startsWith(props.page.path + '/')) {
        item.disabled = true
        item.title += ' (子页面)'
        return true
      }
      
      return true
    })
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
      path: item.path,
      depth,
      has_children: item.has_children,
      disabled: false
    })
    if (item.children && item.children.length > 0) {
      result.push(...flattenTree(item.children, depth + 1))
    }
  }
  return result
}

const move = async () => {
  if (!props.page || !canMove.value) return
  
  moving.value = true
  try {
    const data = {
      parent_id: selectedParentId.value
    }
    
    await WikiAPI.movePage(props.page.id, data)
    emit('moved')
    localValue.value = false
  } catch (error) {
    console.error('移动页面失败:', error)
    
    // 检查是否是循环引用错误
    if (error.response?.data?.error?.includes('循环') || 
        error.response?.data?.error?.includes('自身')) {
      alert('不能将页面移动到其自身或子页面下')
    } else {
      alert('移动页面失败，请稍后再试')
    }
  } finally {
    moving.value = false
  }
}

const cancel = () => {
  selectedParentId.value = null
  localValue.value = false
}

// 监听
watch(localValue, (newValue) => {
  if (newValue && props.page) {
    loadParentOptions()
    selectedParentId.value = props.page.parent_id
  }
})

watch(() => props.page, (newPage) => {
  if (newPage && localValue.value) {
    loadParentOptions()
    selectedParentId.value = newPage.parent_id
  }
})
</script>
