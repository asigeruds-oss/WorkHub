<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="900"
    scrollable
  >
    <v-card class="rounded-lg">
      <!-- 头部 -->
      <v-card-title class="d-flex align-center py-3 px-4 border-b">
        <v-chip
          size="small"
          :color="isAddingMemo ? 'info' : 'primary'"
          label
          class="mr-3 font-weight-bold"
        >
          {{ isAddingMemo ? "MEMO" : "TASK" }}
        </v-chip>
        <span class="text-subtitle-1 font-weight-medium text-grey-darken-1">
          {{ isEditing ? "编辑" : "创建"
          }}{{ isAddingMemo ? "备忘录" : "任务" }}
        </span>
        <v-spacer></v-spacer>
        <v-btn
          icon="mdi-close"
          variant="text"
          density="comfortable"
          @click="$emit('update:modelValue', false)"
        ></v-btn>
      </v-card-title>

      <v-card-text class="pa-0" style="height: 600px">
        <v-form ref="form" @submit.prevent="handleSubmit" class="fill-height">
          <v-row no-gutters class="fill-height">
            <!-- 左侧主要内容区 -->
            <v-col cols="12" md="8" class="pa-6 d-flex flex-column">
              <!-- 标题输入 -->
              <v-text-field
                v-model="localTodo.title"
                :rules="[(v) => (!!v && v.trim() !== '') || '标题不能为空']"
                required
                placeholder="任务标题"
                variant="plain"
                class="text-h5 font-weight-bold mb-4 title-input"
                hide-details="auto"
                autofocus
              ></v-text-field>

              <!-- 描述输入 -->
              <div class="flex-grow-1 d-flex flex-column">
                <v-textarea
                  v-model="localTodo.description"
                  label="描述"
                  placeholder="添加详细描述..."
                  variant="outlined"
                  class="flex-grow-1"
                  hide-details
                  no-resize
                ></v-textarea>
              </div>
            </v-col>

            <!-- 右侧属性区 -->
            <v-col cols="12" md="4" class="pa-6 border-s">
              <div
                class="text-subtitle-2 font-weight-bold mb-6 text-grey-darken-2"
              >
                属性
              </div>

              <!-- 所属项目 -->
              <div class="mb-6">
                <v-select
                  v-model="localTodo.project"
                  :items="projects"
                  item-title="name"
                  item-value="id"
                  label="所属项目"
                  variant="underlined"
                  color="primary"
                  hide-details
                  clearable
                  prepend-inner-icon="mdi-folder-outline"
                >
                  <template v-slot:selection="{ item }">
                    <span class="text-truncate">{{ item.title }}</span>
                  </template>
                </v-select>
              </div>

              <!-- 状态 -->
              <div class="mb-6" v-if="localTodo.type === 'todo'">
                <v-select
                  v-model="localTodo.status"
                  :items="statusOptions"
                  item-title="text"
                  item-value="value"
                  label="状态"
                  variant="underlined"
                  color="primary"
                  hide-details
                >
                  <template v-slot:selection="{ item }">
                    <v-chip
                      size="small"
                      :color="getStatusColor(item.value)"
                      label
                      class="mr-2"
                      variant="tonal"
                    >
                      <v-icon
                        start
                        size="small"
                        :icon="getStatusIcon(item.value)"
                      ></v-icon>
                      {{ item.title }}
                    </v-chip>
                  </template>
                  <template v-slot:item="{ item, props }">
                    <v-list-item v-bind="props">
                      <template v-slot:prepend>
                        <v-icon
                          :color="getStatusColor(item.value)"
                          :icon="getStatusIcon(item.value)"
                          size="small"
                          class="mr-2"
                        ></v-icon>
                      </template>
                    </v-list-item>
                  </template>
                </v-select>
              </div>

              <!-- 优先级 -->
              <div class="mb-6">
                <v-select
                  v-model="localTodo.priority"
                  :items="priorityOptions"
                  item-title="text"
                  item-value="value"
                  label="优先级"
                  variant="underlined"
                  color="primary"
                  hide-details
                >
                  <template v-slot:selection="{ item }">
                    <v-chip
                      size="small"
                      :color="getPriorityColor(item.value)"
                      label
                      class="mr-2"
                      variant="flat"
                    >
                      {{ item.title }}
                    </v-chip>
                  </template>
                  <template v-slot:item="{ item, props }">
                    <v-list-item v-bind="props">
                      <template v-slot:prepend>
                        <v-icon
                          :color="getPriorityColor(item.value)"
                          icon="mdi-flag"
                          size="small"
                          class="mr-2"
                        ></v-icon>
                      </template>
                    </v-list-item>
                  </template>
                </v-select>
              </div>

              <!-- 截止日期 -->
              <div class="mb-6">
                <v-text-field
                  v-model="localTodo.due_date"
                  type="date"
                  label="截止日期"
                  variant="underlined"
                  color="primary"
                  hide-details
                  prepend-inner-icon="mdi-calendar"
                ></v-text-field>
              </div>

              <!-- 截止时间 -->
              <div class="mb-6" v-if="localTodo.due_date">
                <v-text-field
                  v-model="localTodo.due_time"
                  type="time"
                  label="截止时间"
                  variant="underlined"
                  color="primary"
                  hide-details
                  prepend-inner-icon="mdi-clock-outline"
                ></v-text-field>
              </div>

              <!-- 预计工作量 -->
              <div class="mb-6" v-if="localTodo.type === 'todo'">
                <v-text-field
                  v-model.number="localTodo.workload"
                  type="number"
                  label="预计工时"
                  variant="underlined"
                  color="primary"
                  hide-details
                  min="0"
                  step="0.5"
                  suffix="小时"
                  prepend-inner-icon="mdi-timer-sand"
                ></v-text-field>
              </div>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4 bg-grey-lighten-5">
        <v-spacer></v-spacer>
        <v-btn
          variant="outlined"
          color="grey-darken-1"
          @click="$emit('update:modelValue', false)"
          class="mr-2"
        >
          取消
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          @click="handleSubmit"
          :loading="loading"
          class="px-6"
        >
          {{ isEditing ? "保存更改" : "立即创建" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useProjectStore } from "@/stores/project";
import { storeToRefs } from "pinia";
import {
  priorityOptions,
  statusOptions,
  getPriorityColor,
  getStatusColor,
  getStatusIcon,
} from "@/utils/todoUtils";

const props = defineProps({
  modelValue: Boolean,
  todo: Object,
  isEditing: Boolean,
  isAddingMemo: Boolean,
  loading: Boolean,
});

const emit = defineEmits(["update:modelValue", "submit"]);

const localTodo = ref({});
const form = ref(null);

const projectStore = useProjectStore();
const { projects } = storeToRefs(projectStore);

onMounted(() => {
  projectStore.fetchProjects();
});

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      localTodo.value = { ...props.todo };
      if (!projects.value.length) {
        projectStore.fetchProjects();
      }
    }
  }
);

async function handleSubmit() {
  const { valid } = await form.value.validate();
  if (valid) {
    emit("submit", localTodo.value);
  }
}
</script>

<style scoped>
.title-input :deep(.v-field__input) {
  font-size: 1.5rem;
  line-height: 1.4;
  padding-left: 0;
  letter-spacing: -0.01em;
}
</style>
