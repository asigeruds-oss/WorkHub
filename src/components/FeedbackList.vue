<template>
  <v-card class="feedback-list">
    <v-card-title class="d-flex align-center justify-space-between">
      <span class="text-h6 font-weight-medium">用户反馈</span>
      <v-chip color="primary" variant="outlined" size="small">
        共 {{ totalCount }} 条反馈
      </v-chip>
    </v-card-title>

    <v-divider></v-divider>

    <!-- 加载状态 -->
    <v-card-text v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <div class="mt-2 text-body-2 text-grey-600">加载中...</div>
    </v-card-text>

    <!-- 空状态 -->
    <v-card-text v-else-if="!feedbackList.length" class="text-center py-8">
      <v-icon size="64" color="grey-400" class="mb-4"
        >mdi-comment-outline</v-icon
      >
      <div class="text-h6 text-grey-600 mb-2">暂无反馈</div>
      <div class="text-body-2 text-grey-500">成为第一个提供反馈的用户吧</div>
    </v-card-text>

    <!-- 反馈列表 -->
    <div v-else>
      <v-list class="pa-0">
        <template v-for="(feedback, index) in feedbackList" :key="feedback.id">
          <v-list-item class="feedback-item px-4 py-3">
            <template #prepend>
              <v-avatar size="40" :color="getAvatarColor(feedback.name)">
                <span class="text-white font-weight-medium">
                  {{ getInitials(feedback.name) }}
                </span>
              </v-avatar>
            </template>

            <div class="flex-grow-1">
              <!-- 反馈头部信息 -->
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="d-flex align-center gap-2">
                  <span class="font-weight-medium text-subtitle-2">
                    {{ feedback.name || "匿名用户" }}
                  </span>
                  <v-chip
                    :color="getTypeColor(feedback.type)"
                    size="x-small"
                    variant="flat"
                  >
                    {{ getTypeText(feedback.type) }}
                  </v-chip>
                  <v-chip
                    :color="getStatusColor(feedback.status)"
                    size="x-small"
                    variant="outlined"
                  >
                    {{ getStatusText(feedback.status) }}
                  </v-chip>
                </div>
                <span class="text-caption text-grey-600">
                  {{ formatDate(feedback.created_at) }}
                </span>
              </div>

              <!-- 反馈内容 -->
              <div class="feedback-content text-body-2 mb-3">
                {{ feedback.content }}
              </div>

              <!-- 回复按钮 -->
              <div class="d-flex align-center justify-space-between">
                <v-btn
                  variant="text"
                  size="small"
                  color="primary"
                  @click="toggleReply(feedback.id)"
                  :prepend-icon="
                    expandedReplies.has(feedback.id)
                      ? 'mdi-chevron-up'
                      : 'mdi-chevron-down'
                  "
                >
                  {{ feedback.replies?.length || 0 }} 条回复
                </v-btn>

                <v-btn
                  variant="outlined"
                  size="small"
                  color="primary"
                  @click="openReplyDialog(feedback)"
                  prepend-icon="mdi-reply"
                >
                  回复
                </v-btn>
              </div>

              <!-- 回复列表 -->
              <v-expand-transition>
                <div
                  v-if="expandedReplies.has(feedback.id)"
                  class="replies-section mt-4"
                >
                  <v-divider class="mb-3"></v-divider>

                  <div
                    v-if="!feedback.replies?.length"
                    class="text-center py-4"
                  >
                    <span class="text-caption text-grey-500">暂无回复</span>
                  </div>

                  <div v-else class="replies-list">
                    <div
                      v-for="reply in feedback.replies"
                      :key="reply.id"
                      class="reply-item pa-3 mb-2 rounded"
                      :class="reply.is_admin ? 'admin-reply' : 'user-reply'"
                    >
                      <div
                        class="d-flex align-center justify-space-between mb-2"
                      >
                        <div class="d-flex align-center gap-2">
                          <v-avatar
                            size="24"
                            :color="reply.is_admin ? 'orange' : 'blue'"
                          >
                            <span class="text-white text-caption">
                              {{ getInitials(reply.author || "管理员") }}
                            </span>
                          </v-avatar>
                          <span class="text-subtitle-2 font-weight-medium">
                            {{ reply.author || "管理员" }}
                          </span>
                          <v-chip
                            v-if="reply.is_admin"
                            color="orange"
                            size="x-small"
                            variant="flat"
                          >
                            管理员
                          </v-chip>
                        </div>
                        <span class="text-caption text-grey-600">
                          {{ formatDate(reply.created_at) }}
                        </span>
                      </div>

                      <div class="reply-content text-body-2">
                        {{ reply.content }}
                      </div>
                    </div>
                  </div>
                </div>
              </v-expand-transition>
            </div>
          </v-list-item>

          <v-divider v-if="index < feedbackList.length - 1"></v-divider>
        </template>
      </v-list>

      <!-- 分页器 -->
      <v-card-actions v-if="totalPages > 1" class="justify-center pa-4">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="7"
          color="primary"
          @update:model-value="loadFeedbackList"
        ></v-pagination>
      </v-card-actions>
    </div>

    <!-- 回复对话框 -->
    <v-dialog v-model="replyDialog" max-width="600px">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-reply</v-icon>
          回复反馈
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pt-4">
          <!-- 原始反馈内容 -->
          <div class="original-feedback pa-3 mb-4 rounded bg-grey-100">
            <div class="d-flex align-center mb-2">
              <v-avatar size="24" color="primary">
                <span class="text-white text-caption">
                  {{ getInitials(selectedFeedback?.name) }}
                </span>
              </v-avatar>
              <span class="ml-2 font-weight-medium">{{
                selectedFeedback?.name || "匿名用户"
              }}</span>
            </div>
            <div class="text-body-2">{{ selectedFeedback?.content }}</div>
          </div>

          <!-- 回复表单 -->
          <v-form
            ref="replyForm"
            v-model="replyValid"
            @submit.prevent="submitReply"
          >
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="replyData.author"
                  label="回复人姓名"
                  outlined
                  dense
                  :rules="[rules.required]"
                  hide-details="auto"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="replyData.is_admin"
                  label="管理员回复"
                  color="orange"
                  hide-details
                ></v-switch>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-textarea
                  v-model="replyData.content"
                  label="回复内容"
                  outlined
                  rows="4"
                  :rules="[rules.required]"
                  hide-details="auto"
                  placeholder="请输入回复内容..."
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-6 pb-4">
          <v-spacer></v-spacer>
          <v-btn
            variant="outlined"
            @click="closeReplyDialog"
            :disabled="replyLoading"
          >
            取消
          </v-btn>
          <v-btn
            color="primary"
            @click="submitReply"
            :loading="replyLoading"
            :disabled="!replyValid"
          >
            提交回复
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { FeedbackAPI } from "../api";

// Props
const props = defineProps({
  source: {
    type: String,
    default: "general",
  },
});

// 响应式数据
const loading = ref(false);
const feedbackList = ref([]);
const currentPage = ref(1);
const totalCount = ref(0);
const pageSize = 10;

// 展开的回复列表
const expandedReplies = ref(new Set());

// 回复对话框
const replyDialog = ref(false);
const replyLoading = ref(false);
const replyValid = ref(false);
const replyForm = ref(null);
const selectedFeedback = ref(null);

const replyData = reactive({
  author: "",
  content: "",
  is_admin: false,
});

// 验证规则
const rules = {
  required: (v) => !!v || "此字段为必填项",
};

// 计算属性
const totalPages = computed(() => {
  return Math.ceil(totalCount.value / pageSize);
});

// 生命周期
onMounted(() => {
  loadFeedbackList();
});

// 方法
async function loadFeedbackList() {
  try {
    loading.value = true;
    const response = await FeedbackAPI.getFeedbackList({
      page: currentPage.value,
      pageSize: pageSize,
      source: props.source,
    });

    if (response.data && response.data.success) {
      feedbackList.value = response.data.data.list || [];
      totalCount.value = response.data.data.total || 0;
    }
  } catch (error) {
    console.error("获取反馈列表失败:", error);
    // 如果API不存在，显示一些模拟数据用于演示
    feedbackList.value = [
      {
        id: 1,
        name: "张同学",
        email: "zhang@example.com",
        type: "suggestion",
        content: "希望能增加更多的模板选择，现在的模板比较单一。",
        status: "replied",
        created_at: "2024-10-16T10:30:00Z",
        replies: [
          {
            id: 1,
            author: "管理员",
            content:
              "感谢您的建议！我们正在开发更多模板，预计下个版本会新增5-8个模板供选择。",
            is_admin: true,
            created_at: "2024-10-16T14:20:00Z",
          },
        ],
      },
      {
        id: 2,
        name: "李同学",
        email: "li@example.com",
        type: "bug",
        content: "生成的假条图片有时候会模糊，特别是在手机上查看的时候。",
        status: "pending",
        created_at: "2024-10-16T09:15:00Z",
        replies: [],
      },
      {
        id: 3,
        name: "王同学",
        email: "wang@example.com",
        type: "question",
        content: "请问这个假条生成器的数据会保存吗？还是只是临时生成？",
        status: "replied",
        created_at: "2024-10-15T16:45:00Z",
        replies: [
          {
            id: 2,
            author: "管理员",
            content:
              "为了保护用户隐私，我们不会保存任何个人信息。所有数据都是临时处理，生成后即清除。",
            is_admin: true,
            created_at: "2024-10-15T17:30:00Z",
          },
          {
            id: 3,
            author: "王同学",
            content: "明白了，谢谢解答！",
            is_admin: false,
            created_at: "2024-10-15T18:00:00Z",
          },
        ],
      },
    ];
    totalCount.value = 3;
  } finally {
    loading.value = false;
  }
}

function toggleReply(feedbackId) {
  if (expandedReplies.value.has(feedbackId)) {
    expandedReplies.value.delete(feedbackId);
  } else {
    expandedReplies.value.add(feedbackId);
    // 加载该反馈的回复列表
    loadReplies(feedbackId);
  }
}

async function loadReplies(feedbackId) {
  try {
    const response = await FeedbackAPI.getFeedbackReplies(feedbackId);
    if (response.data && response.data.success) {
      // 更新对应反馈的回复列表
      const feedback = feedbackList.value.find((f) => f.id === feedbackId);
      if (feedback) {
        feedback.replies = response.data.data || [];
      }
    }
  } catch (error) {
    console.error("获取回复列表失败:", error);
    // 如果API调用失败，保持现有数据不变
  }
}

function openReplyDialog(feedback) {
  selectedFeedback.value = feedback;
  replyData.author = "";
  replyData.content = "";
  replyData.is_admin = false;
  replyDialog.value = true;
}

function closeReplyDialog() {
  replyDialog.value = false;
  selectedFeedback.value = null;
  if (replyForm.value) {
    replyForm.value.reset();
  }
}

async function submitReply() {
  if (!replyForm.value.validate()) {
    return;
  }

  try {
    replyLoading.value = true;

    const response = await FeedbackAPI.replyFeedback(
      selectedFeedback.value.id,
      {
        author: replyData.author,
        content: replyData.content,
        is_admin: replyData.is_admin,
      }
    );

    if (response.data && response.data.success) {
      // 刷新回复列表
      await loadReplies(selectedFeedback.value.id);
      closeReplyDialog();
    }
  } catch (error) {
    console.error("提交回复失败:", error);
    // 即使API调用失败，也要关闭对话框
    alert("提交回复失败，请稍后重试");
    closeReplyDialog();
  } finally {
    replyLoading.value = false;
  }
}

// 工具函数
function getInitials(name) {
  if (!name) return "匿";
  return name.charAt(0).toUpperCase();
}

function getAvatarColor(name) {
  const colors = [
    "primary",
    "secondary",
    "accent",
    "info",
    "success",
    "warning",
  ];
  const index = (name || "").length % colors.length;
  return colors[index];
}

function getTypeColor(type) {
  const colorMap = {
    suggestion: "blue",
    bug: "red",
    question: "green",
    other: "grey",
  };
  return colorMap[type] || "grey";
}

function getTypeText(type) {
  const textMap = {
    suggestion: "功能建议",
    bug: "问题反馈",
    question: "使用咨询",
    other: "其他",
  };
  return textMap[type] || "其他";
}

function getStatusColor(status) {
  const colorMap = {
    pending: "orange",
    replied: "green",
    closed: "grey",
  };
  return colorMap[status] || "grey";
}

function getStatusText(status) {
  const textMap = {
    pending: "待处理",
    replied: "已回复",
    closed: "已关闭",
  };
  return textMap[status] || "未知";
}

function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;

  // 小于1分钟
  if (diff < 60 * 1000) {
    return "刚刚";
  }

  // 小于1小时
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes}分钟前`;
  }

  // 小于1天
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours}小时前`;
  }

  // 大于1天，显示具体日期
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
</script>

<style scoped>
.feedback-list {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.feedback-item {
  transition: background-color 0.2s;
}

.feedback-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.feedback-content {
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.replies-section {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
}

.reply-item {
  background-color: white;
  border-left: 3px solid #e0e0e0;
}

.admin-reply {
  border-left-color: #ff9800;
  background-color: #fff3e0;
}

.user-reply {
  border-left-color: #2196f3;
  background-color: #e3f2fd;
}

.reply-content {
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.original-feedback {
  border-left: 4px solid #2196f3;
}

.gap-2 {
  gap: 8px;
}
</style>
