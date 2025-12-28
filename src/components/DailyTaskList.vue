<template>
  <v-card class="mb-4" elevation="3" rounded="lg">
    <v-card-title class="d-flex align-center">
      <v-icon icon="mdi-calendar-check" class="mr-2" color="primary"></v-icon>
      <span>日常任务</span>
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        @click="openAddDialog"
        prepend-icon="mdi-plus"
        size="small"
        variant="text"
      >
        添加日常任务
      </v-btn>
    </v-card-title>

    <v-divider></v-divider>

    <!-- 任务统计 -->
    <div v-if="dailyTasks.length > 0" class="px-4 py-3 bg-grey-lighten-5">
      <div class="d-flex justify-space-between align-center mb-1">
        <span class="text-caption font-weight-medium text-grey-darken-1">
          今日完成度
        </span>
        <span class="text-caption font-weight-bold text-primary">
          {{ completedTasks }}/{{ totalTasks }}
        </span>
      </div>
      <v-progress-linear
        :model-value="completionRate"
        color="primary"
        height="6"
        rounded
        striped
      ></v-progress-linear>
    </div>

    <v-divider v-if="dailyTasks.length > 0"></v-divider>

    <!-- 加载状态 -->
    <div v-if="loading" class="d-flex justify-center my-4">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <!-- 没有日常任务时显示 -->
    <v-card-text v-else-if="dailyTasks.length === 0" class="text-center pa-6">
      <v-icon
        icon="mdi-calendar-blank"
        size="large"
        class="mb-2 text-grey-lighten-1"
      ></v-icon>
      <div class="text-body-1">暂无日常任务</div>
      <v-btn color="primary" class="mt-4" @click="openAddDialog" size="small">
        添加第一个日常任务
      </v-btn>
    </v-card-text>

    <!-- 日常任务列表 -->
    <v-list v-else>
      <v-list-item
        v-for="task in dailyTasks"
        :key="task.id"
        :class="{
          'daily-task-completed': task.is_completed_today,
        }"
      >
        <template v-slot:prepend>
          <v-checkbox
            :model-value="task.is_completed_today"
            @change="toggleTaskStatus(task)"
            :disabled="task.isUpdating"
            hide-details
            density="compact"
            :color="getPriorityColor(task.priority)"
          >
            <template v-slot:loader v-if="task.isUpdating">
              <v-progress-circular
                indeterminate
                color="primary"
                size="16"
              ></v-progress-circular>
            </template>
          </v-checkbox>
        </template>

        <v-list-item-title
          :class="{
            'text-decoration-line-through': task.is_completed_today,
          }"
        >
          {{ task.title }}
        </v-list-item-title>

        <v-list-item-subtitle v-if="task.description">
          {{ task.description }}
        </v-list-item-subtitle>

        <template v-slot:append>
          <div class="d-flex align-center">
            <v-chip
              v-if="task.is_completed_today"
              size="small"
              color="success"
              class="mr-2"
              label
            >
              今日已完成
            </v-chip>

            <v-chip v-else size="small" color="warning" class="mr-2" label>
              今日待完成
            </v-chip>

            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn
                  icon="mdi-dots-vertical"
                  variant="text"
                  size="small"
                  v-bind="props"
                  class="menu-button"
                ></v-btn>
              </template>
              <v-list>
                <v-list-item @click="openEditDialog(task)" density="compact">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-pencil" color="primary"></v-icon>
                  </template>
                  <v-list-item-title>编辑</v-list-item-title>
                </v-list-item>

                <v-list-item
                  v-if="!task.is_completed_today"
                  @click="completeTask(task)"
                  density="compact"
                >
                  <template v-slot:prepend>
                    <v-icon icon="mdi-check" color="success"></v-icon>
                  </template>
                  <v-list-item-title>标记今日已完成</v-list-item-title>
                </v-list-item>

                <v-list-item
                  v-if="task.is_completed_today"
                  @click="cancelCompleteTask(task)"
                  density="compact"
                >
                  <template v-slot:prepend>
                    <v-icon icon="mdi-undo" color="warning"></v-icon>
                  </template>
                  <v-list-item-title>取消今日完成</v-list-item-title>
                </v-list-item>

                <v-divider></v-divider>

                <v-list-item @click="openDeleteDialog(task)" class="text-error">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-delete" color="error"></v-icon>
                  </template>
                  <v-list-item-title>删除</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>
      </v-list-item>
    </v-list>

    <!-- 添加/编辑对话框 -->
    <v-dialog
      v-model="dialog"
      max-width="500"
      transition="dialog-bottom-transition"
    >
      <v-card rounded="lg">
        <v-toolbar
          :color="isEditing ? 'primary' : 'primary'"
          density="comfortable"
          flat
        >
          <v-toolbar-title class="text-white">
            {{ isEditing ? "编辑日常任务" : "添加日常任务" }}
          </v-toolbar-title>
        </v-toolbar>

        <v-card-text class="pt-4">
          <v-form
            ref="form"
            @submit.prevent="isEditing ? updateTask() : addTask()"
          >
            <v-text-field
              v-model="currentTask.title"
              label="任务标题"
              :rules="[(v) => (!!v && v.trim() !== '') || '标题不能为空']"
              required
              variant="outlined"
              prepend-inner-icon="mdi-format-title"
              @input="
                () => {
                  if (form.value) form.value.resetValidation();
                }
              "
              class="mb-3"
            ></v-text-field>

            <v-textarea
              v-model="currentTask.description"
              label="任务描述"
              rows="3"
              variant="outlined"
              prepend-inner-icon="mdi-text-box-outline"
              class="mb-3"
              placeholder="输入任务详细描述..."
            ></v-textarea>

            <v-select
              v-model="currentTask.priority"
              label="优先级"
              :items="priorityOptions"
              item-title="text"
              item-value="value"
              variant="outlined"
              prepend-inner-icon="mdi-flag"
              class="mb-3"
            ></v-select>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="outlined" @click="dialog = false" class="mr-2"
            >取消</v-btn
          >
          <v-btn
            color="primary"
            @click="handleFormSubmit"
            :loading="loading"
            type="submit"
            variant="elevated"
          >
            {{ isEditing ? "更新" : "添加" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 删除确认对话框 -->
    <v-dialog
      v-model="deleteDialog"
      max-width="400"
      transition="dialog-top-transition"
    >
      <v-card rounded="lg">
        <v-toolbar color="error" density="comfortable" flat>
          <v-toolbar-title class="text-white"> 确认删除 </v-toolbar-title>
        </v-toolbar>

        <v-card-text class="pt-4 pb-2 text-center">
          <v-icon
            icon="mdi-alert-circle"
            color="error"
            size="large"
            class="mb-3"
          ></v-icon>
          <p class="text-body-1">确定要删除以下日常任务吗？</p>
          <p class="text-subtitle-1 font-weight-medium mt-2">
            "{{ currentTask.title }}"
          </p>
          <p class="text-caption mt-2 text-grey">此操作不可撤销</p>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="deleteDialog = false" class="mr-2"
            >取消</v-btn
          >
          <v-btn
            color="error"
            @click="deleteTask()"
            :loading="loading"
            variant="elevated"
          >
            删除
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useTodoStore } from "@/stores/todo";

// 定义属性
const props = defineProps({
  showNotification: Function,
});

// 事件
const emit = defineEmits(["update:tasks"]);

// 初始化store
const todoStore = useTodoStore();

// 本地数据状态
const dailyTasks = computed(() => todoStore.getAllDailyTasks);
const loading = computed(() => todoStore.isDailyTasksLoading);

// 统计数据
const totalTasks = computed(() => dailyTasks.value.length);
const completedTasks = computed(
  () => dailyTasks.value.filter((t) => t.is_completed_today).length
);
const completionRate = computed(() => {
  if (totalTasks.value === 0) return 0;
  return (completedTasks.value / totalTasks.value) * 100;
});

// 对话框状态
const dialog = ref(false);
const deleteDialog = ref(false);
const isEditing = ref(false);
const form = ref(null);

// 当前编辑的任务
const currentTask = ref({
  title: "",
  description: "",
  priority: 3, // 默认中等优先级
});

// 优先级选项
const priorityOptions = [
  { text: "极高", value: 5 },
  { text: "高", value: 4 },
  { text: "中", value: 3 },
  { text: "低", value: 2 },
  { text: "极低", value: 1 },
];

// 获取优先级颜色
function getPriorityColor(priority) {
  switch (Number(priority)) {
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

// 生命周期钩子 - 组件挂载时加载数据
onMounted(async () => {
  try {
    await fetchDailyTasks();
  } catch (error) {
    console.error("加载日常任务失败:", error);
    if (props.showNotification) {
      props.showNotification("加载日常任务失败，请重试", "error");
    }
  }
});

// 方法
async function fetchDailyTasks(options = {}) {
  try {
    await todoStore.fetchDailyTasks(options);
    emit("update:tasks", dailyTasks.value);
  } catch (error) {
    console.error("获取日常任务失败:", error);
  }
}

function openAddDialog() {
  isEditing.value = false;
  currentTask.value = {
    title: "",
    description: "",
    priority: 2, // 默认中等优先级
  };
  dialog.value = true;
}

function openEditDialog(task) {
  isEditing.value = true;
  currentTask.value = { ...task };
  dialog.value = true;
}

function openDeleteDialog(task) {
  currentTask.value = { ...task };
  deleteDialog.value = true;
}

async function handleFormSubmit() {
  if (!form.value) return;

  try {
    const { valid } = await form.value.validate();

    if (!valid) return;

    if (isEditing.value) {
      await updateTask();
    } else {
      await addTask();
    }
  } catch (error) {
    console.error("表单提交失败:", error);
  }
}

async function addTask() {
  try {
    await todoStore.addDailyTask(
      currentTask.value.title,
      currentTask.value.description,
      {
        priority: currentTask.value.priority,
      }
    );

    dialog.value = false;
    if (props.showNotification) {
      props.showNotification("日常任务添加成功", "success");
    }
    await fetchDailyTasks();
  } catch (error) {
    console.error("添加日常任务失败:", error);
    if (props.showNotification) {
      props.showNotification("添加日常任务失败: " + error.message, "error");
    }
  }
}

async function updateTask() {
  try {
    const updates = {
      title: currentTask.value.title,
      description: currentTask.value.description,
      priority: currentTask.value.priority,
    };

    await todoStore.updateDailyTask(currentTask.value.id, updates);
    dialog.value = false;

    if (props.showNotification) {
      props.showNotification("日常任务更新成功", "success");
    }
    await fetchDailyTasks();
  } catch (error) {
    console.error("更新日常任务失败:", error);
    if (props.showNotification) {
      props.showNotification("更新日常任务失败: " + error.message, "error");
    }
  }
}

async function deleteTask() {
  try {
    await todoStore.deleteDailyTask(currentTask.value.id);
    deleteDialog.value = false;

    if (props.showNotification) {
      props.showNotification("日常任务已删除", "success");
    }
    await fetchDailyTasks();
  } catch (error) {
    console.error("删除日常任务失败:", error);
    if (props.showNotification) {
      props.showNotification("删除日常任务失败: " + error.message, "error");
    }
  }
}

async function toggleTaskStatus(task) {
  try {
    // 如果正在更新，防止重复点击
    if (task.isUpdating) return;

    console.log(
      `[DailyTaskList] 切换日常任务状态，ID: ${task.id}, 当前完成状态: ${task.is_completed_today}`
    );

    if (!task.is_completed_today) {
      // 如果未完成，调用完成任务函数
      await completeTask(task);
    } else {
      // 如果已完成，调用取消完成函数
      await cancelCompleteTask(task);
    }
  } catch (error) {
    console.error("[DailyTaskList] 切换日常任务状态失败:", error);
    if (props.showNotification) {
      props.showNotification("切换日常任务状态失败", "error");
    }
    task.isUpdating = false;
  }
}

async function completeTask(task) {
  try {
    // 移除了可能导致早期返回的条件
    // 设置加载状态，避免重复点击
    task.isUpdating = true;

    console.log(`[DailyTaskList] 发送完成日常任务请求，ID: ${task.id}`);
    await todoStore.completeDailyTask(task.id);

    console.log(`[DailyTaskList] 日常任务完成请求成功`);
    if (props.showNotification) {
      props.showNotification("今日任务已完成", "success");
    }

    // 刷新任务列表以更新状态
    await fetchDailyTasks();
  } catch (error) {
    console.error("[DailyTaskList] 完成日常任务失败:", error);
    if (props.showNotification) {
      props.showNotification(
        "完成日常任务失败: " + (error.message || "请求失败"),
        "error"
      );
    }
  } finally {
    if (task) task.isUpdating = false;
  }
}

async function cancelCompleteTask(task) {
  try {
    // 设置加载状态，避免重复点击
    task.isUpdating = true;

    console.log(`[DailyTaskList] 发送取消完成日常任务请求，ID: ${task.id}`);
    await todoStore.cancelCompleteDailyTask(task.id);

    console.log(`[DailyTaskList] 取消完成日常任务请求成功`);
    if (props.showNotification) {
      props.showNotification("已取消今日任务完成状态", "success");
    }

    // 刷新任务列表以更新状态
    await fetchDailyTasks();
  } catch (error) {
    console.error("[DailyTaskList] 取消完成日常任务失败:", error);
    if (props.showNotification) {
      props.showNotification(
        "取消完成日常任务失败: " + (error.message || "请求失败"),
        "error"
      );
    }
  } finally {
    if (task) task.isUpdating = false;
  }
}
</script>

<style scoped>
.daily-task-completed {
  opacity: 0.8;
  background-color: rgba(76, 175, 80, 0.05);
}

.v-list-item {
  transition: all 0.2s ease;
}

.v-list-item:hover {
  background-color: rgba(25, 118, 210, 0.04);
}

.menu-button {
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.v-list-item:hover .menu-button {
  opacity: 1;
}
</style>
