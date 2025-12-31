<template>
  <div class="home-page">
    <v-container fluid class="pa-4">
      <v-row>
        <!-- 左侧栏 -->
        <v-col cols="12" md="3">
          <!-- 欢迎卡片 -->
          <v-card class="mb-4" elevation="0" border rounded="lg">
            <v-card-text class="pa-4">
              <div class="d-flex align-center mb-3">
                <MascotCow size="small" class="mr-3" />
                <div>
                  <div class="text-subtitle-1 font-weight-bold">
                    {{ greeting }}，{{ username }}！
                  </div>
                  <div class="text-caption text-grey">{{ currentDate }}</div>
                </div>
              </div>
              <v-divider class="mb-3"></v-divider>
              <div class="text-body-2 text-grey-darken-1">
                {{ dailyQuote }}
              </div>
            </v-card-text>
          </v-card>

          <!-- 快速统计 -->
          <v-card class="mb-4" elevation="0" border rounded="lg">
            <v-card-title class="d-flex align-center py-3 px-4">
              <v-icon
                icon="mdi-chart-box-outline"
                class="mr-2"
                color="primary"
                size="small"
              ></v-icon>
              <span class="text-body-1 font-weight-medium">数据概览</span>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="pa-4">
              <v-row dense>
                <v-col cols="6">
                  <div
                    class="stat-box text-center pa-3 rounded-lg cursor-pointer"
                    @click="navigateTo('/todos')"
                  >
                    <div class="text-h5 font-weight-bold text-primary">
                      {{ stats.pendingTodos }}
                    </div>
                    <div class="text-caption text-grey">待办任务</div>
                  </div>
                </v-col>
                <v-col cols="6">
                  <div
                    class="stat-box text-center pa-3 rounded-lg cursor-pointer"
                    @click="navigateTo('/todos')"
                  >
                    <div class="text-h5 font-weight-bold text-success">
                      {{ stats.completedTodos }}
                    </div>
                    <div class="text-caption text-grey">已完成</div>
                  </div>
                </v-col>
                <v-col cols="6">
                  <div
                    class="stat-box text-center pa-3 rounded-lg cursor-pointer"
                    @click="navigateTo('/wiki')"
                  >
                    <div class="text-h5 font-weight-bold text-info">
                      {{ stats.wikis }}
                    </div>
                    <div class="text-caption text-grey">Wiki文章</div>
                  </div>
                </v-col>
                <v-col cols="6">
                  <div
                    class="stat-box text-center pa-3 rounded-lg cursor-pointer"
                    @click="navigateTo('/projects')"
                  >
                    <div class="text-h5 font-weight-bold text-purple">
                      {{ stats.projects }}
                    </div>
                    <div class="text-caption text-grey">项目</div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- 快捷入口 -->
          <v-card elevation="0" border rounded="lg">
            <v-card-title class="d-flex align-center py-3 px-4">
              <v-icon
                icon="mdi-lightning-bolt"
                class="mr-2"
                color="warning"
                size="small"
              ></v-icon>
              <span class="text-body-1 font-weight-medium">快捷入口</span>
            </v-card-title>
            <v-divider></v-divider>
            <v-list density="compact" nav class="pa-2">
              <v-list-item
                v-for="shortcut in shortcuts"
                :key="shortcut.to"
                :to="shortcut.to"
                :prepend-icon="shortcut.icon"
                rounded="lg"
                class="mb-1"
              >
                <v-list-item-title class="text-body-2">{{
                  shortcut.title
                }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <!-- 右侧主区域 -->
        <v-col cols="12" md="9">
          <!-- 今日任务概览 -->
          <v-card class="mb-4" elevation="0" border rounded="lg">
            <v-card-title class="d-flex align-center py-3 px-4">
              <v-icon
                icon="mdi-calendar-today"
                class="mr-2"
                color="primary"
                size="small"
              ></v-icon>
              <span class="text-body-1 font-weight-medium">今日任务</span>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                size="small"
                variant="text"
                to="/todos"
                class="text-none"
              >
                查看全部
                <v-icon end size="small">mdi-arrow-right</v-icon>
              </v-btn>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="pa-0">
              <div v-if="loading" class="d-flex justify-center py-8">
                <v-progress-circular
                  indeterminate
                  color="primary"
                ></v-progress-circular>
              </div>
              <div
                v-else-if="todayTodos.length === 0"
                class="text-center py-8 text-grey"
              >
                <v-icon
                  icon="mdi-check-circle-outline"
                  size="48"
                  color="grey-lighten-1"
                  class="mb-2"
                ></v-icon>
                <div class="text-body-2">今日暂无任务，享受轻松时光！</div>
                <v-btn
                  color="primary"
                  size="small"
                  variant="outlined"
                  class="mt-3"
                  to="/todos"
                >
                  添加新任务
                </v-btn>
              </div>
              <v-list v-else class="py-0">
                <template v-for="(todo, index) in todayTodos" :key="todo.id">
                  <v-list-item
                    class="todo-item px-4"
                    :class="{
                      'completed-item': todo.status === 'done',
                    }"
                  >
                    <template v-slot:prepend>
                      <v-checkbox
                        :model-value="todo.status === 'done'"
                        @change="toggleTodoStatus(todo)"
                        hide-details
                        density="compact"
                        :color="getPriorityColor(todo.priority)"
                        class="mr-2"
                      ></v-checkbox>
                    </template>
                    <v-list-item-title
                      class="text-body-2"
                      :class="{
                        'text-decoration-line-through text-grey':
                          todo.status === 'done',
                      }"
                    >
                      {{ todo.title }}
                    </v-list-item-title>
                    <template v-slot:append>
                      <v-chip
                        v-if="todo.priority && todo.priority !== 'low'"
                        size="x-small"
                        :color="getPriorityColor(todo.priority)"
                        variant="tonal"
                        class="font-weight-medium"
                      >
                        {{ getPriorityLabel(todo.priority) }}
                      </v-chip>
                    </template>
                  </v-list-item>
                  <v-divider
                    v-if="index < todayTodos.length - 1"
                    class="mx-4"
                  ></v-divider>
                </template>
              </v-list>
            </v-card-text>
          </v-card>

          <!-- 功能模块网格 -->
          <div class="text-subtitle-1 font-weight-medium mb-3 px-1">
            <v-icon icon="mdi-apps" size="small" class="mr-1"></v-icon>
            功能模块
          </div>
          <v-row>
            <v-col
              v-for="module in modules"
              :key="module.to"
              cols="12"
              sm="6"
              lg="4"
            >
              <v-card
                class="module-card h-100"
                elevation="0"
                border
                rounded="lg"
                @click="navigateTo(module.to)"
              >
                <v-card-text class="pa-4">
                  <div class="d-flex align-center mb-3">
                    <v-avatar :color="module.color" size="40" class="mr-3">
                      <v-icon
                        :icon="module.icon"
                        color="white"
                        size="20"
                      ></v-icon>
                    </v-avatar>
                    <div>
                      <div class="text-subtitle-2 font-weight-bold">
                        {{ module.title }}
                      </div>
                      <div class="text-caption text-grey">
                        {{ module.subtitle }}
                      </div>
                    </div>
                  </div>
                  <div class="text-body-2 text-grey-darken-1 mb-3">
                    {{ module.description }}
                  </div>
                  <div class="d-flex flex-wrap" style="gap: 4px">
                    <v-chip
                      v-for="tag in module.tags"
                      :key="tag"
                      size="x-small"
                      :color="module.color"
                      variant="tonal"
                    >
                      {{ tag }}
                    </v-chip>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- 最近活动 -->
          <v-card class="mt-4" elevation="0" border rounded="lg">
            <v-card-title class="d-flex align-center py-3 px-4">
              <v-icon
                icon="mdi-history"
                class="mr-2"
                color="grey"
                size="small"
              ></v-icon>
              <span class="text-body-1 font-weight-medium">最近活动</span>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="pa-4">
              <div
                v-if="recentActivities.length === 0"
                class="text-center py-4 text-grey"
              >
                <div class="text-body-2">暂无最近活动</div>
              </div>
              <v-timeline v-else density="compact" side="end">
                <v-timeline-item
                  v-for="activity in recentActivities"
                  :key="activity.id"
                  :dot-color="activity.color"
                  size="x-small"
                >
                  <div class="d-flex align-center">
                    <v-icon
                      :icon="activity.icon"
                      size="small"
                      :color="activity.color"
                      class="mr-2"
                    ></v-icon>
                    <span class="text-body-2">{{ activity.text }}</span>
                    <v-spacer></v-spacer>
                    <span class="text-caption text-grey">{{
                      activity.time
                    }}</span>
                  </div>
                </v-timeline-item>
              </v-timeline>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- 操作提示 -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="2000">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useTodoStore } from "@/stores/todo";
import MascotCow from "@/components/MascotCow.vue";

const authStore = useAuthStore();
const todoStore = useTodoStore();
const router = useRouter();

// 状态
const loading = ref(false);
const snackbar = ref({
  show: false,
  text: "",
  color: "success",
});

// 统计数据
const stats = ref({
  pendingTodos: 0,
  completedTodos: 0,
  wikis: 0,
  projects: 0,
});

// 今日待办
const todayTodos = ref([]);

// 最近活动
const recentActivities = ref([]);

// 每日名言
const dailyQuotes = [
  "每一个不曾起舞的日子，都是对生命的辜负。",
  "把每一件简单的事做好就是不简单。",
  "不积跬步，无以至千里。",
  "今天的努力，是明天的收获。",
  "保持专注，成就非凡。",
  "坚持就是胜利，加油！",
  "知识改变命运，学习成就未来。",
  "每天进步一点点，终将成就大不同。",
];

// 计算属性
const isLoggedIn = computed(() => authStore.isAuthenticated);

const username = computed(() => authStore.user?.username || "访客");

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 6) return "夜深了";
  if (hour < 9) return "早上好";
  if (hour < 12) return "上午好";
  if (hour < 14) return "中午好";
  if (hour < 18) return "下午好";
  if (hour < 22) return "晚上好";
  return "夜深了";
});

const currentDate = computed(() => {
  const now = new Date();
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return `${now.getMonth() + 1}月${now.getDate()}日 ${weekdays[now.getDay()]}`;
});

const dailyQuote = computed(() => {
  const index = new Date().getDate() % dailyQuotes.length;
  return dailyQuotes[index];
});

// 快捷入口
const shortcuts = [
  {
    title: "待办事项",
    icon: "mdi-checkbox-marked-circle-outline",
    to: "/todos",
  },
  { title: "Wiki知识库", icon: "mdi-book-open-page-variant", to: "/wiki" },
  { title: "项目管理", icon: "mdi-folder-multiple", to: "/projects" },
  { title: "系统设置", icon: "mdi-cog-outline", to: "/settings" },
];

// 功能模块
const modules = [
  {
    title: "Wiki 知识库",
    subtitle: "构建你的知识体系",
    description: "树形结构管理文章，支持 Markdown 编辑、标签分类、评论互动",
    icon: "mdi-book-open-page-variant",
    color: "primary",
    to: "/wiki",
    tags: ["Markdown", "树形结构", "版本历史"],
  },
  {
    title: "待办事项",
    subtitle: "高效管理任务清单",
    description: "创建、分类、追踪你的待办任务，设置优先级和截止日期",
    icon: "mdi-checkbox-marked-circle-outline",
    color: "success",
    to: "/todos",
    tags: ["任务管理", "优先级", "提醒"],
  },
  {
    title: "项目管理",
    subtitle: "团队协作中心",
    description: "管理项目进度、任务分配、成员协作，让团队更高效",
    icon: "mdi-folder-multiple",
    color: "purple",
    to: "/projects",
    tags: ["项目", "协作", "进度"],
  },
  {
    title: "AutoOps",
    subtitle: "自动化运维工具",
    description: "自动化脚本执行、系统监控、日志分析等运维工具",
    icon: "mdi-robot",
    color: "info",
    to: "/autops",
    tags: ["自动化", "运维", "监控"],
  },
  {
    title: "Notion",
    subtitle: "笔记与文档管理",
    description: "与 Notion 无缝集成，同步笔记和文档，实现多平台内容管理",
    icon: "mdi-note-text",
    color: "orange",
    to: "/notion",
    tags: ["笔记同步", "文档", "集成"],
  },
  {
    title: "设置中心",
    subtitle: "个性化配置",
    description: "管理个人信息、通知设置、主题偏好等",
    icon: "mdi-cog",
    color: "grey",
    to: "/settings",
    tags: ["个人资料", "主题", "通知"],
  },
];

// 方法
const navigateTo = (path) => {
  if (isLoggedIn.value) {
    router.push(path);
  } else {
    router.push("/login");
  }
};

const showNotification = (text, color = "success") => {
  snackbar.value = { show: true, text, color };
};

// 优先级相关
const getPriorityColor = (priority) => {
  const colors = {
    5: "error",
    4: "deep-orange",
    3: "warning",
    2: "success",
    1: "info",
    critical: "error",
    high: "deep-orange",
    medium: "warning",
    low: "success",
    minimal: "info",
  };
  return colors[priority] || "grey";
};

const getPriorityLabel = (priority) => {
  const labels = {
    5: "极高",
    4: "高",
    3: "中",
    2: "低",
    1: "极低",
    critical: "极高",
    high: "高",
    medium: "中",
    low: "低",
    minimal: "极低",
  };
  return labels[priority] || "";
};

// 切换待办状态
const toggleTodoStatus = async (todo) => {
  try {
    if (todo.status === "done") {
      await todoStore.reopenTodo(todo.id);
    } else {
      await todoStore.completeTodo(todo.id);
    }
    await loadTodayTodos();
    showNotification(todo.status === "done" ? "已重新打开任务" : "已完成任务");
  } catch (error) {
    console.error("更新任务状态失败:", error);
    showNotification("操作失败，请重试", "error");
  }
};

// 加载今日待办
const loadTodayTodos = async () => {
  if (!isLoggedIn.value) return;

  try {
    await todoStore.loadTodos();
    const allTodos = todoStore.getAllTodos || [];

    // 获取今日的待办任务（优先级高的或截止日期是今天的）
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    todayTodos.value = allTodos
      .filter((todo) => {
        // 排除已归档的
        if (todo.status === "archived") return false;
        // 包含处理中的、高优先级的、或今天截止的
        if (todo.status === "processing") return true;
        if (todo.priority >= 4) return true;
        if (todo.deadline) {
          const deadline = new Date(todo.deadline);
          return deadline >= today && deadline < tomorrow;
        }
        return false;
      })
      .slice(0, 5);

    // 统计数据
    stats.value.pendingTodos = allTodos.filter(
      (t) => t.status !== "done" && t.status !== "archived"
    ).length;
    stats.value.completedTodos = allTodos.filter(
      (t) => t.status === "done"
    ).length;
  } catch (error) {
    console.error("加载待办失败:", error);
  }
};

// 加载最近活动
const loadRecentActivities = () => {
  // 这里可以从API获取最近活动，暂时使用示例数据
  const todos = todoStore.getAllTodos || [];
  const activities = [];

  // 获取最近完成的任务
  const recentCompleted = todos.filter((t) => t.status === "done").slice(0, 3);

  recentCompleted.forEach((todo) => {
    activities.push({
      id: `todo-${todo.id}`,
      icon: "mdi-check-circle",
      color: "success",
      text: `完成任务: ${todo.title}`,
      time: "最近",
    });
  });

  recentActivities.value = activities.slice(0, 5);
};

// 加载数据
const loadData = async () => {
  if (!isLoggedIn.value) return;

  loading.value = true;
  try {
    await loadTodayTodos();
    loadRecentActivities();
  } catch (error) {
    console.error("加载数据失败:", error);
  } finally {
    loading.value = false;
  }
};

// 生命周期
onMounted(async () => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken && !authStore.user) {
    await authStore.checkAuthStatus();
  }

  if (isLoggedIn.value) {
    await loadData();
  }
});
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-top: 12px;
  padding-bottom: 24px;
}

/* 统计盒子 */
.stat-box {
  background-color: #f5f5f5;
  transition: all 0.2s ease;
}

.stat-box:hover {
  background-color: #eeeeee;
  transform: translateY(-2px);
}

/* 模块卡片 */
.module-card {
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.06) !important;
  background-color: white;
}

.module-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;
  border-color: rgba(0, 0, 0, 0.1) !important;
}

/* 待办项 */
.todo-item {
  transition: background-color 0.2s ease;
}

.todo-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.completed-item {
  background-color: #fafafa;
}

/* 光标指针 */
.cursor-pointer {
  cursor: pointer;
}

/* 时间线 */
:deep(.v-timeline-item__body) {
  padding-top: 0 !important;
  padding-bottom: 8px !important;
}

/* 卡片标题统一样式 */
:deep(.v-card-title) {
  font-size: 0.95rem !important;
}

/* 列表项统一样式 */
:deep(.v-list-item) {
  min-height: 44px !important;
}

/* 响应式调整 */
@media (max-width: 960px) {
  .home-page {
    padding-top: 8px;
  }
}
</style>

<route>
{
  meta: {
    requiresAuth: false,
    layout: 'default'
  }
}
</route>
