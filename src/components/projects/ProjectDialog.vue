<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="700"
    scrollable
  >
    <v-card class="rounded-lg">
      <v-card-title class="d-flex align-center py-3 px-4 border-b">
        <span class="text-h6 font-weight-bold">
          {{ isEditing ? "编辑项目" : "创建新项目" }}
        </span>
        <v-spacer></v-spacer>
        <v-btn
          icon="mdi-close"
          variant="text"
          density="comfortable"
          @click="$emit('update:modelValue', false)"
        ></v-btn>
      </v-card-title>

      <v-card-text class="pa-4">
        <v-form ref="form" @submit.prevent="handleSubmit">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="localProject.name"
                label="项目名称"
                :rules="[(v) => !!v || '项目名称不能为空']"
                required
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="localProject.description"
                label="项目描述"
                variant="outlined"
                rows="3"
                density="comfortable"
              ></v-textarea>
            </v-col>

            <v-col cols="12" sm="6">
              <v-select
                v-model="localProject.priority"
                :items="priorityOptions"
                label="优先级"
                variant="outlined"
                density="comfortable"
              >
                <template v-slot:selection="{ item }">
                  <v-chip
                    size="small"
                    :color="getPriorityColor(item.value)"
                    label
                  >
                    {{ item.title }}
                  </v-chip>
                </template>
              </v-select>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="localProject.icon"
                label="图标 (Emoji)"
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="localProject.start_date"
                label="开始日期"
                type="date"
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="localProject.end_date"
                label="结束日期"
                type="date"
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <div class="text-subtitle-2 mb-2">项目颜色</div>
              <v-color-picker
                v-model="localProject.color"
                mode="hex"
                hide-inputs
                show-swatches
                swatches-max-height="100"
                class="elevation-0 border"
                width="100%"
              ></v-color-picker>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4 border-t">
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="$emit('update:modelValue', false)">
          取消
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          @click="handleSubmit"
          :loading="loading"
        >
          {{ isEditing ? "保存" : "创建" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  modelValue: Boolean,
  project: {
    type: Object,
    default: null,
  },
  loading: Boolean,
});

const emit = defineEmits(["update:modelValue", "save"]);

const isEditing = computed(() => !!props.project);

const defaultProject = {
  name: "",
  description: "",
  priority: 2,
  icon: "📁",
  color: "#3B82F6",
  start_date: null,
  end_date: null,
};

const localProject = ref({ ...defaultProject });

const priorityOptions = [
  { title: "低", value: 1 },
  { title: "中", value: 2 },
  { title: "高", value: 3 },
];

const getPriorityColor = (priority) => {
  switch (priority) {
    case 3:
      return "error";
    case 2:
      return "warning";
    case 1:
      return "success";
    default:
      return "grey";
  }
};

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.project) {
        localProject.value = { ...props.project };
      } else {
        localProject.value = { ...defaultProject };
      }
    }
  }
);

const form = ref(null);

const handleSubmit = async () => {
  const { valid } = await form.value.validate();
  if (valid) {
    emit("save", localProject.value);
  }
};
</script>
