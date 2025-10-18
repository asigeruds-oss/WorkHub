<template>
  <div class="comment-item mb-4">
    <v-card variant="outlined">
      <v-card-text>
        <div class="d-flex align-start">
          <v-avatar size="40" color="primary" class="mr-3">
            <span class="text-white">{{ comment.user_name.charAt(0).toUpperCase() }}</span>
          </v-avatar>
          
          <div class="flex-grow-1">
            <!-- 评论头部 -->
            <div class="d-flex align-center mb-2">
              <span class="font-weight-bold">{{ comment.user_name }}</span>
              <span class="text-caption text-medium-emphasis ml-2">
                {{ formatDate(comment.created_at) }}
              </span>
              <v-spacer />
              
              <!-- 操作菜单 -->
              <v-menu>
                <template v-slot:activator="{ props: menuProps }">
                  <v-btn
                    icon="mdi-dots-vertical"
                    size="small"
                    variant="text"
                    v-bind="menuProps"
                  />
                </template>
                <v-list density="compact">
                  <v-list-item @click="startReply">
                    <template v-slot:prepend>
                      <v-icon size="small">mdi-reply</v-icon>
                    </template>
                    <v-list-item-title>回复</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="startEdit" v-if="canEdit">
                    <template v-slot:prepend>
                      <v-icon size="small">mdi-pencil</v-icon>
                    </template>
                    <v-list-item-title>编辑</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="deleteComment" v-if="canDelete" class="text-error">
                    <template v-slot:prepend>
                      <v-icon size="small">mdi-delete</v-icon>
                    </template>
                    <v-list-item-title>删除</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
            
            <!-- 评论内容 -->
            <div v-if="!editing" class="comment-content">
              {{ comment.content }}
            </div>
            
            <!-- 编辑表单 -->
            <div v-else class="edit-form">
              <v-textarea
                v-model="editContent"
                variant="outlined"
                density="compact"
                rows="3"
                auto-grow
                hide-details
              />
              <div class="d-flex justify-end mt-2 ga-2">
                <v-btn size="small" @click="cancelEdit">取消</v-btn>
                <v-btn
                  size="small"
                  color="primary"
                  @click="saveEdit"
                  :loading="saving"
                >
                  保存
                </v-btn>
              </div>
            </div>
            
            <!-- 回复表单 -->
            <div v-if="replying" class="reply-form mt-3">
              <v-textarea
                v-model="replyContent"
                label="回复..."
                variant="outlined"
                density="compact"
                rows="2"
                auto-grow
                hide-details
              />
              <div class="d-flex justify-end mt-2 ga-2">
                <v-btn size="small" @click="cancelReply">取消</v-btn>
                <v-btn
                  size="small"
                  color="primary"
                  @click="submitReply"
                  :loading="submittingReply"
                >
                  回复
                </v-btn>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
    
    <!-- 回复列表 -->
    <div v-if="replies.length > 0" class="ml-8 mt-2">
      <wiki-comment-item
        v-for="reply in replies"
        :key="reply.id"
        :comment="reply"
        :page-id="pageId"
        :is-reply="true"
        @update="$emit('update', $event)"
        @delete="onReplyDelete"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import WikiAPI from '@/api/wiki'

const props = defineProps({
  comment: {
    type: Object,
    required: true
  },
  pageId: {
    type: [String, Number],
    required: true
  },
  isReply: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['reply', 'update', 'delete'])

// 状态
const editing = ref(false)
const replying = ref(false)
const saving = ref(false)
const submittingReply = ref(false)
const editContent = ref('')
const replyContent = ref('')
const replies = ref([])

// 计算属性
const canEdit = computed(() => {
  // 这里应该根据实际的权限逻辑来判断
  return true
})

const canDelete = computed(() => {
  // 这里应该根据实际的权限逻辑来判断
  return true
})

// 方法
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

const startEdit = () => {
  editing.value = true
  editContent.value = props.comment.content
}

const cancelEdit = () => {
  editing.value = false
  editContent.value = ''
}

const saveEdit = async () => {
  if (!editContent.value.trim()) return
  
  saving.value = true
  try {
    const response = await WikiAPI.updateComment(
      props.pageId,
      props.comment.id,
      { content: editContent.value.trim() }
    )
    
    emit('update', response.data)
    editing.value = false
    editContent.value = ''
  } catch (error) {
    console.error('更新评论失败:', error)
    alert('更新评论失败，请稍后再试')
  } finally {
    saving.value = false
  }
}

const startReply = () => {
  replying.value = true
  replyContent.value = ''
}

const cancelReply = () => {
  replying.value = false
  replyContent.value = ''
}

const submitReply = async () => {
  if (!replyContent.value.trim()) return
  
  submittingReply.value = true
  try {
    const response = await WikiAPI.createComment(props.pageId, {
      content: replyContent.value.trim(),
      parent: props.comment.id
    })
    
    replies.value.push(response.data)
    replying.value = false
    replyContent.value = ''
  } catch (error) {
    console.error('回复评论失败:', error)
    alert('回复评论失败，请稍后再试')
  } finally {
    submittingReply.value = false
  }
}

const deleteComment = async () => {
  if (!confirm('确定要删除这条评论吗？')) return
  
  try {
    await WikiAPI.deleteComment(props.pageId, props.comment.id)
    emit('delete', props.comment.id)
  } catch (error) {
    console.error('删除评论失败:', error)
    alert('删除评论失败，请稍后再试')
  }
}

const onReplyDelete = (replyId) => {
  const index = replies.value.findIndex(r => r.id === replyId)
  if (index !== -1) {
    replies.value.splice(index, 1)
  }
}

const loadReplies = async () => {
  if (!props.isReply && props.comment.id) {
    try {
      const response = await WikiAPI.getCommentReplies(props.pageId, props.comment.id)
      replies.value = response.data || []
    } catch (error) {
      console.error('加载回复失败:', error)
      replies.value = []
    }
  }
}

// 组件挂载
onMounted(() => {
  loadReplies()
})
</script>

<style scoped>
.comment-item {
  position: relative;
}

.comment-content {
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.edit-form,
.reply-form {
  margin-top: 8px;
}
</style>
