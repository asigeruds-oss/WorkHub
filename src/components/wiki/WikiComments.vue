<template>
  <div class="wiki-comments">
    <h3 class="text-subtitle-1 font-weight-bold mb-3">
      评论 ({{ comments.length }})
    </h3>

    <!-- 添加评论 -->
    <v-card class="mb-4" variant="outlined" elevation="0">
      <v-card-text class="pa-3">
        <v-textarea
          v-model="newComment"
          label="添加评论..."
          variant="outlined"
          rows="2"
          auto-grow
          hide-details
          density="compact"
        />
        <div class="d-flex justify-end mt-2">
          <v-btn
            color="primary"
            size="small"
            @click="submitComment"
            :disabled="!newComment.trim()"
            :loading="submitting"
          >
            发布
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- 评论列表 -->
    <div v-if="comments.length > 0" class="comments-list">
      <wiki-comment-item
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :page-id="pageId"
        @reply="onReply"
        @update="onCommentUpdate"
        @delete="onCommentDelete"
      />
    </div>

    <!-- 无评论 -->
    <div v-else class="text-center py-6">
      <v-icon size="40" color="grey">mdi-comment-outline</v-icon>
      <p class="text-caption text-medium-emphasis mt-2">
        暂无评论，成为第一个评论者吧！
      </p>
    </div>

    <!-- 加载状态 -->
    <v-overlay
      v-model="loading"
      class="d-flex align-center justify-center"
      contained
    >
      <v-progress-circular indeterminate color="primary" />
    </v-overlay>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import WikiAPI from "@/api/wiki";
import WikiCommentItem from "./WikiCommentItem.vue";

const props = defineProps({
  pageId: {
    type: [String, Number],
    required: true,
  },
});

// 状态
const loading = ref(false);
const submitting = ref(false);
const comments = ref([]);
const newComment = ref("");

// 方法
const loadComments = async () => {
  loading.value = true;
  try {
    const response = await WikiAPI.getPageComments(props.pageId);
    comments.value = response.data || [];
  } catch (error) {
    console.error("加载评论失败:", error);
    comments.value = [];
  } finally {
    loading.value = false;
  }
};

const submitComment = async () => {
  if (!newComment.value.trim()) return;

  submitting.value = true;
  try {
    const response = await WikiAPI.createComment(props.pageId, {
      content: newComment.value.trim(),
    });

    comments.value.push(response.data);
    newComment.value = "";
  } catch (error) {
    console.error("发布评论失败:", error);
    alert("发布评论失败，请稍后再试");
  } finally {
    submitting.value = false;
  }
};

const onReply = (comment) => {
  // 处理回复逻辑
  console.log("回复评论:", comment);
};

const onCommentUpdate = (updatedComment) => {
  const index = comments.value.findIndex((c) => c.id === updatedComment.id);
  if (index !== -1) {
    comments.value[index] = updatedComment;
  }
};

const onCommentDelete = (commentId) => {
  const index = comments.value.findIndex((c) => c.id === commentId);
  if (index !== -1) {
    comments.value.splice(index, 1);
  }
};

// 组件挂载
onMounted(() => {
  loadComments();
});
</script>

<style scoped>
.wiki-comments {
  position: relative;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

:deep(.wiki-comment-item) {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.wiki-comment-item:last-child) {
  border-bottom: none;
}
</style>
