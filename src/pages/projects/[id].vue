<template>
  <v-container fluid class="fill-height pa-0 bg-grey-lighten-5">
    <div
      v-if="loading"
      class="d-flex justify-center align-center fill-height w-100"
    >
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <v-row v-else-if="project" no-gutters class="fill-height">
      <!-- 左侧：项目详情 -->
      <v-col
        cols="12"
        md="4"
        lg="3"
        class="bg-white border-e d-flex flex-column h-100"
      >
        <div class="pa-6">
          <div class="d-flex align-center mb-4">
            <v-btn
              icon="mdi-arrow-left"
              variant="text"
              @click="$router.back()"
              class="mr-2"
            ></v-btn>
            <v-avatar
              :color="project.color"
              size="48"
              variant="tonal"
              class="mr-3"
            >
              <span class="text-h5">{{ project.icon || "📁" }}</span>
            </v-avatar>
            <div>
              <h1 class="text-h6 font-weight-bold">{{ project.name }}</h1>
              <v-chip
                size="x-small"
                :color="getStatusColor(project.status)"
                label
                class="mt-1"
              >
                {{ getStatusText(project.status) }}
              </v-chip>
            </div>
          </div>

          <div class="text-body-2 text-grey-darken-1 mb-6">
            {{ project.description || "暂无描述" }}
          </div>

          <v-divider class="mb-6"></v-divider>

          <div class="mb-6">
            <div class="text-subtitle-2 font-weight-bold mb-2">项目进度</div>
            <div class="d-flex justify-space-between text-caption mb-1">
              <span
                >{{ project.completed_todos_count }}/{{
                  project.todos_count
                }}
                任务</span
              >
              <span>{{ Math.round(project.completion_rate || 0) }}%</span>
            </div>
            <v-progress-linear
              :model-value="project.completion_rate"
              color="primary"
              height="8"
              rounded
            ></v-progress-linear>
          </div>

          <div class="mb-4">
            <div class="d-flex align-center mb-3">
              <v-icon
                icon="mdi-flag"
                size="small"
                class="mr-3 text-grey"
              ></v-icon>
              <span class="text-body-2">优先级：</span>
              <v-chip
                size="small"
                :color="getPriorityColor(project.priority)"
                label
                class="ml-auto"
              >
                {{ getPriorityText(project.priority) }}
              </v-chip>
            </div>
            <div class="d-flex align-center mb-3">
              <v-icon
                icon="mdi-calendar-start"
                size="small"
                class="mr-3 text-grey"
              ></v-icon>
              <span class="text-body-2">开始日期：</span>
              <span class="text-body-2 ml-auto">{{
                formatDate(project.start_date) || "-"
              }}</span>
            </div>
            <div class="d-flex align-center mb-3">
              <v-icon
                icon="mdi-calendar-end"
                size="small"
                class="mr-3 text-grey"
              ></v-icon>
              <span class="text-body-2">截止日期：</span>
              <span class="text-body-2 ml-auto">{{
                formatDate(project.end_date) || "-"
              }}</span>
            </div>
          </div>
        </div>

        <v-spacer></v-spacer>

        <div class="pa-4 border-t">
          <v-btn block variant="outlined" color="primary" @click="editProject">
            编辑项目
          </v-btn>
        </div>
      </v-col>

      <!-- 右侧：任务列表 -->
      <v-col
        cols="12"
        md="8"
        lg="9"
        class="d-flex flex-column h-100 overflow-hidden"
      >
        <div
          class="pa-4 border-b bg-white d-flex align-center justify-space-between"
        >
          <h2 class="text-h6">项目任务</h2>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="openAddTodoDialog"
          >
            添加任务
          </v-btn>
        </div>

        <div class="flex-grow-1 overflow-y-auto pa-4">
          <div v-if="loadingTodos" class="d-flex justify-center py-10">
            <v-progress-circular
              indeterminate
              color="primary"
            ></v-progress-circular>
          </div>
          <div
            v-else-if="!projectTodos || projectTodos.length === 0"
            class="text-center py-10 text-grey"
          >
            <v-icon
              icon="mdi-clipboard-text-outline"
              size="64"
              class="mb-4"
            ></v-icon>
            <div>暂无任务</div>
          </div>

          <v-list v-else bg-color="transparent" class="pa-0">
            <v-card
              v-for="todo in projectTodos"
              :key="todo.id"
              class="mb-4 todo-card"
              elevation="0"
              rounded="xl"
              :class="{
                'todo-done': todo.status === 'done',
                'todo-priority-high': todo.priority === 3,
                'todo-priority-medium': todo.priority === 2,
                'todo-priority-low': todo.priority === 1,
              }"
              @mouseenter="hoveredTodo = todo.id"
              @mouseleave="hoveredTodo = null"
              @click="editTodo(todo)"
              style="cursor: pointer"
            >
              <!-- 优先级指示条 -->
              <div
                class="priority-indicator"
                :class="`priority-${todo.priority}`"
              ></div>

              <v-list-item class="py-4 px-4">
                <template v-slot:prepend>
                  <div class="checkbox-wrapper" @click.stop>
                    <v-checkbox-btn
                      :model-value="todo.status === 'done'"
                      color="primary"
                      @update:model-value="toggleTodoStatus(todo)"
                      class="todo-checkbox"
                    ></v-checkbox-btn>
                  </div>
                </template>

                <div class="todo-content">
                  <v-list-item-title
                    class="text-subtitle-1 font-weight-medium mb-2"
                    :class="{
                      'todo-title-done': todo.status === 'done',
                    }"
                  >
                    {{ todo.title }}
                  </v-list-item-title>

                  <v-list-item-subtitle
                    v-if="todo.description"
                    class="text-body-2 mb-3"
                    :class="{
                      'text-grey': todo.status === 'done',
                    }"
                  >
                    {{ todo.description }}
                  </v-list-item-subtitle>

                  <!-- 标签和元信息 -->
                  <div class="d-flex flex-wrap align-center gap-2">
                    <v-chip
                      v-if="todo.due_date"
                      size="small"
                      :color="getDueDateColor(todo.due_date)"
                      variant="flat"
                      class="todo-chip"
                      prepend-icon="mdi-calendar-clock"
                    >
                      {{ formatDate(todo.due_date) }}
                    </v-chip>

                    <v-chip
                      size="small"
                      :color="getTodoPriorityColor(todo.priority)"
                      variant="flat"
                      class="todo-chip"
                      prepend-icon="mdi-flag"
                    >
                      {{ getTodoPriorityText(todo.priority) }}
                    </v-chip>

                    <v-chip
                      size="small"
                      :color="getTodoStatusColor(todo.status)"
                      variant="tonal"
                      class="todo-chip"
                    >
                      {{ getTodoStatusText(todo.status) }}
                    </v-chip>
                  </div>
                </div>

                <template v-slot:append>
                  <div class="todo-actions" @click.stop>
                    <v-btn
                      icon
                      size="small"
                      variant="text"
                      class="todo-action-btn"
                      @click="editTodo(todo)"
                    >
                      <v-icon size="20">mdi-pencil-outline</v-icon>
                      <v-tooltip activator="parent" location="top"
                        >编辑</v-tooltip
                      >
                    </v-btn>
                  </div>
                </template>
              </v-list-item>
            </v-card>
          </v-list>
        </div>
      </v-col>
    </v-row>

    <project-dialog
      v-model="showProjectDialog"
      :project="project"
      @save="handleProjectSave"
    ></project-dialog>

    <todo-dialog
      v-model="showTodoDialog"
      :todo="selectedTodo"
      :is-editing="!!selectedTodo.id"
      @submit="handleTodoSubmit"
    ></todo-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProjectStore } from "@/stores/project";
import { useTodoStore } from "@/stores/todo";
import { storeToRefs } from "pinia";
import ProjectDialog from "@/components/projects/ProjectDialog.vue";
import TodoDialog from "@/components/todos/TodoDialog.vue";

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const todoStore = useTodoStore();
const { todos } = storeToRefs(todoStore);

const project = ref(null);
const loading = ref(true);
const loadingTodos = ref(false);
const showProjectDialog = ref(false);
const showTodoDialog = ref(false);
const selectedTodo = ref({});
const hoveredTodo = ref(null);

const projectTodos = computed(() => todos.value);

onMounted(async () => {
  await loadProject();
  await loadTodos();
});

const loadProject = async () => {
  loading.value = true;
  try {
    project.value = await projectStore.fetchProject(route.params.id);
  } catch (error) {
    console.error(error);
    // router.push('/projects')
  } finally {
    loading.value = false;
  }
};

const loadTodos = async () => {
  loadingTodos.value = true;
  try {
    await todoStore.fetchTodos({ project: route.params.id, pageSize: 100 });
  } catch (error) {
    console.error(error);
  } finally {
    loadingTodos.value = false;
  }
};

const getStatusColor = (status) => {
  const map = { active: "primary", archived: "grey", completed: "success" };
  return map[status] || "grey";
};

const getStatusText = (status) => {
  const map = { active: "进行中", archived: "已归档", completed: "已完成" };
  return map[status] || status;
};

const getPriorityColor = (priority) => {
  const map = { 1: "success", 2: "warning", 3: "error" };
  return map[priority] || "grey";
};

const getPriorityText = (priority) => {
  const map = { 1: "低", 2: "中", 3: "高" };
  return map[priority] || "未知";
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString();
};

const editProject = () => {
  showProjectDialog.value = true;
};

const handleProjectSave = async (data) => {
  await projectStore.updateProject(project.value.id, data);
  showProjectDialog.value = false;
  loadProject();
};

const openAddTodoDialog = () => {
  selectedTodo.value = {
    project: project.value.id,
    type: "todo",
    priority: 2,
    status: "pending",
  };
  showTodoDialog.value = true;
};

const editTodo = (todo) => {
  selectedTodo.value = { ...todo };
  showTodoDialog.value = true;
};

const handleTodoSubmit = async (todoData) => {
  try {
    if (todoData.id) {
      await todoStore.updateTodo(todoData.id, todoData);
    } else {
      await todoStore.createTodo(todoData);
    }
    showTodoDialog.value = false;
    loadTodos(); // Reload todos
    loadProject(); // Reload project to update stats
  } catch (error) {
    console.error(error);
  }
};

const toggleTodoStatus = async (todo) => {
  const newStatus = todo.status === "done" ? "pending" : "done";
  try {
    await todoStore.updateTodo(todo.id, { status: newStatus });
    loadTodos();
    loadProject();
  } catch (error) {
    console.error(error);
  }
};

const getDueDateColor = (date) => {
  if (!date) return "grey";
  const today = new Date();
  const due = new Date(date);
  if (due < today) return "error";
  const diff = (due - today) / (1000 * 60 * 60 * 24);
  if (diff <= 2) return "warning";
  return "info";
};

const getTodoPriorityColor = (priority) => {
  const map = { 1: "success", 2: "warning", 3: "error" };
  return map[priority] || "grey";
};

const getTodoPriorityText = (priority) => {
  const map = { 1: "低", 2: "中", 3: "高" };
  return map[priority] || "未知";
};

const getTodoStatusColor = (status) => {
  const map = {
    pending: "grey",
    in_progress: "info",
    done: "success",
    cancelled: "error",
  };
  return map[status] || "grey";
};

const getTodoStatusText = (status) => {
  const map = {
    pending: "待处理",
    in_progress: "进行中",
    done: "已完成",
    cancelled: "已取消",
  };
  return map[status] || status;
};
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}

/* Todo卡片样式 */
.todo-card {
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
  border: 1px solid #e0e0e0;
  overflow: hidden;
}

.todo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: rgb(var(--v-theme-primary));
}

/* 优先级指示条 */
.priority-indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  transition: width 0.3s ease;
}

.todo-card:hover .priority-indicator {
  width: 6px;
}

.priority-indicator.priority-3 {
  background: linear-gradient(180deg, #ef5350 0%, #c62828 100%);
}

.priority-indicator.priority-2 {
  background: linear-gradient(180deg, #ff9800 0%, #f57c00 100%);
}

.priority-indicator.priority-1 {
  background: linear-gradient(180deg, #66bb6a 0%, #388e3c 100%);
}

/* 已完成todo样式 */
.todo-done {
  opacity: 0.75;
  background: #fafafa;
}

.todo-done:hover {
  opacity: 0.85;
}

/* Checkbox包装器 */
.checkbox-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
}

.todo-checkbox :deep(.v-selection-control) {
  min-height: auto;
}

/* Todo内容区 */
.todo-content {
  flex: 1;
}

.todo-title-done {
  text-decoration: line-through;
  color: #9e9e9e !important;
}

/* Todo芯片样式 */
.todo-chip {
  font-weight: 500;
  letter-spacing: 0.25px;
  font-size: 0.75rem;
  height: 24px;
  padding: 0 8px;
}

.todo-chip :deep(.v-icon) {
  font-size: 14px;
  margin-right: 4px;
}

/* Todo操作按钮 */
.todo-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.todo-card:hover .todo-actions {
  opacity: 1;
}

.todo-action-btn {
  color: #757575;
}

.todo-action-btn:hover {
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.1);
}

/* 优先级高亮边框 */
.todo-priority-high:not(.todo-done) {
  border-left: 3px solid #ef5350;
}

.todo-priority-medium:not(.todo-done) {
  border-left: 3px solid #ff9800;
}

.todo-priority-low:not(.todo-done) {
  border-left: 3px solid #66bb6a;
}

/* 空状态样式 */
.text-grey {
  color: #757575;
}

/* 响应式调整 */
@media (max-width: 960px) {
  .todo-actions {
    opacity: 1;
  }
}
</style>