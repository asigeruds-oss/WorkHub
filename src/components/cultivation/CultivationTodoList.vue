<template>
  <div class="cultivation-todo-list">
    <v-alert
      v-if="todos.length === 0"
      type="info"
      variant="tonal"
      border="start"
      class="mb-4"
    >
      暂无修炼任务，可以从普通待办页面创建任务
    </v-alert>

    <!-- 任务类别切换 -->
    <div class="d-flex align-center mb-4">
      <v-btn-toggle
        v-model="activeFilter"
        mandatory
        color="primary"
        rounded="lg"
        density="comfortable"
      >
        <v-btn value="pending">
          <v-icon start>mdi-clock-outline</v-icon>
          待完成
        </v-btn>
        <v-btn value="done">
          <v-icon start>mdi-check-circle-outline</v-icon>
          已完成
        </v-btn>
      </v-btn-toggle>

      <v-spacer></v-spacer>

      <v-btn
        prepend-icon="mdi-plus"
        variant="elevated"
        @click="$emit('add-todo')"
        color="primary"
        class="mr-2"
      >
        添加任务
      </v-btn>

      <v-btn
        prepend-icon="mdi-refresh"
        variant="text"
        @click="$emit('refresh')"
        color="primary"
      >
        刷新
      </v-btn>
    </div>

    <!-- 待办事项列表 -->
    <v-slide-y-transition group>
      <v-card
        v-for="todo in filteredTodos"
        :key="todo.id"
        class="mb-4 todo-card"
        :class="{
          'todo-done': todo.status === 'done',
          'todo-rewarded': todo.reward_info?.is_rewarded,
        }"
      >
        <v-card-text class="pa-4">
          <div class="d-flex align-center">
            <v-checkbox
              :model-value="todo.status === 'done'"
              @change="handleTodoStatusChange(todo)"
              :disabled="completingTodo[todo.id]"
              hide-details
              density="compact"
              :color="getPriorityColor(todo.priority)"
            >
              <template v-slot:loader v-if="completingTodo[todo.id]">
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="16"
                ></v-progress-circular>
              </template>
            </v-checkbox>

            <div class="ml-3 flex-grow-1">
              <div
                class="d-flex flex-wrap align-center"
                :class="{
                  'text-decoration-line-through': todo.status === 'done',
                }"
              >
                <span class="text-subtitle-1">{{ todo.title }}</span>
                <v-chip
                  v-if="todo.priority"
                  size="small"
                  :color="getPriorityColor(todo.priority)"
                  class="ml-2"
                  variant="outlined"
                  label
                >
                  {{ getPriorityLabel(todo.priority) }}
                </v-chip>
              </div>

              <div
                class="text-body-2 text-medium-emphasis mt-1"
                v-if="todo.description"
              >
                {{ todo.description }}
              </div>

              <div class="d-flex align-center mt-2">
                <v-icon
                  icon="mdi-calendar"
                  size="small"
                  class="mr-1 text-medium-emphasis"
                ></v-icon>
                <span class="text-caption text-medium-emphasis">
                  {{ formatDate(todo.due_date) }}
                </span>
              </div>
            </div>

            <div class="reward-info">
              <v-chip
                color="amber-darken-2"
                variant="elevated"
                size="small"
                class="mb-1"
              >
                <v-icon start size="small">mdi-flash</v-icon>
                {{ todo.reward_info?.exp_reward || 0 }} 修为
              </v-chip>

              <v-chip color="blue" variant="elevated" size="small">
                <v-icon start size="small">mdi-diamond-stone</v-icon>
                {{ todo.reward_info?.spirit_stones_reward || 0 }} 灵石
              </v-chip>

              <div class="text-caption text-center mt-1">
                <v-icon
                  icon="mdi-lightning-bolt"
                  size="x-small"
                  class="mr-1 text-deep-orange"
                ></v-icon>
                消耗 {{ todo.reward_info?.energy_cost || 0 }} 灵力
              </div>
            </div>
          </div>

          <v-expand-transition>
            <div
              v-if="todo.status === 'done' && todo.reward_info?.is_rewarded"
              class="reward-received mt-3"
            >
              <v-divider class="mb-2"></v-divider>
              <div class="d-flex align-center text-success">
                <v-icon
                  icon="mdi-check-decagram"
                  color="success"
                  class="mr-1"
                ></v-icon>
                <span class="text-caption">已获得奖励</span>
                <span class="text-caption ml-auto">
                  {{ formatTime(todo.completed_at) }}
                </span>
              </div>
            </div>
          </v-expand-transition>
        </v-card-text>
      </v-card>
    </v-slide-y-transition>

    <!-- 无结果提示 -->
    <div
      v-if="filteredTodos.length === 0 && todos.length > 0"
      class="text-center py-8 text-medium-emphasis"
    >
      <v-icon icon="mdi-magnify" size="large" class="mb-2"></v-icon>
      <div>
        没有{{ activeFilter === "pending" ? "待完成" : "已完成" }}的任务
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from "vue";

// 属性
const props = defineProps({
  todos: {
    type: Array,
    default: () => [],
  },
});

// 事件
const emit = defineEmits([
  "complete-todo",
  "reopen-todo",
  "refresh",
  "add-todo",
]);

// 状态
const activeFilter = ref("pending");
const completingTodo = reactive({});

// 计算属性
const filteredTodos = computed(() => {
  return props.todos.filter((todo) => {
    if (activeFilter.value === "pending") {
      return todo.status === "pending";
    }
    return todo.status === "done";
  });
});

// 方法
function handleTodoStatusChange(todo) {
  if (completingTodo[todo.id]) return;

  completingTodo[todo.id] = true;

  if (todo.status === "done") {
    // 取消完成
    emit("reopen-todo", todo.id);
  } else {
    // 完成待办
    emit("complete-todo", todo.id);
  }

  // 2秒后解除loading状态
  setTimeout(() => {
    completingTodo[todo.id] = false;
  }, 2000);
}

function getPriorityColor(priority) {
  switch (priority) {
    case 5:
      return "error";
    case 4:
      return "deep-orange";
    case 3:
      return "warning";
    case 2:
      return "success";
    case 1:
      return "info";
    default:
      return "grey";
  }
}

function getPriorityLabel(priority) {
  switch (priority) {
    case 5:
      return "极高";
    case 4:
      return "高";
    case 3:
      return "中";
    case 2:
      return "低";
    case 1:
      return "极低";
    default:
      return "未设置";
  }
}

function formatDate(dateString) {
  if (!dateString) return "无截止时间";

  const date = new Date(dateString);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  // 格式化日期
  const options = {
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };

  if (date.toDateString() === now.toDateString()) {
    return `今天 ${date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  if (date.toDateString() === tomorrow.toDateString()) {
    return `明天 ${date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  return date.toLocaleDateString("zh-CN", options);
}

function formatTime(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  return date.toLocaleString("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
}
</script>

<style scoped>
.todo-card {
  position: relative;
  transition: all 0.3s ease;
}

.todo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1) !important;
}

.todo-done {
  border-left: 4px solid var(--v-success-base, #4caf50);
  opacity: 0.85;
}

.todo-rewarded {
  background-color: rgba(76, 175, 80, 0.05);
}

.reward-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 110px;
}

/* 动画 */
.v-enter-active,
.v-leave-active {
  transition: all 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>
