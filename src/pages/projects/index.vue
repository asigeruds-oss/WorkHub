<template>
  <v-container fluid class="fill-height pa-0">
    <v-row no-gutters class="fill-height">
      <!-- 左侧边栏：统计和过滤器 -->
      <v-col
        cols="12"
        md="3"
        lg="2"
        class="border-e bg-grey-lighten-5 d-flex flex-column"
      >
        <div class="pa-4">
          <v-btn
            block
            color="primary"
            prepend-icon="mdi-plus"
            class="mb-4"
            @click="openCreateDialog"
          >
            新建项目
          </v-btn>

          <v-list density="compact" nav class="bg-transparent">
            <v-list-subheader>状态</v-list-subheader>
            <v-list-item
              v-for="status in statusFilters"
              :key="status.value"
              :value="status.value"
              :active="currentFilter === status.value"
              @click="setFilter(status.value)"
              rounded="lg"
              color="primary"
            >
              <template v-slot:prepend>
                <v-icon :icon="status.icon" :color="status.color"></v-icon>
              </template>
              <v-list-item-title>{{ status.title }}</v-list-item-title>
              <template v-slot:append>
                <v-badge
                  v-if="statistics && statistics.by_status[status.value]"
                  :content="statistics.by_status[status.value]"
                  color="grey-lighten-1"
                  inline
                ></v-badge>
              </template>
            </v-list-item>
          </v-list>
        </div>
      </v-col>

      <!-- 右侧主要内容区 -->
      <v-col cols="12" md="9" lg="10" class="d-flex flex-column bg-white">
        <!-- 顶部工具栏 -->
        <div class="d-flex align-center pa-4 border-b">
          <h1 class="text-h5 font-weight-bold mr-4">项目列表</h1>
          <v-spacer></v-spacer>
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            label="搜索项目"
            variant="outlined"
            density="compact"
            hide-details
            style="max-width: 300px"
            @update:model-value="handleSearch"
          ></v-text-field>
        </div>

        <!-- 项目列表 -->
        <div class="flex-grow-1 pa-4 overflow-y-auto">
          <div
            v-if="loading"
            class="d-flex justify-center align-center fill-height"
          >
            <v-progress-circular
              indeterminate
              color="primary"
            ></v-progress-circular>
          </div>

          <div
            v-else-if="projects.length === 0"
            class="d-flex flex-column align-center justify-center fill-height text-grey"
          >
            <v-icon
              icon="mdi-folder-open-outline"
              size="64"
              class="mb-4"
            ></v-icon>
            <div class="text-h6">暂无项目</div>
            <div class="text-body-2 mb-4">创建一个新项目开始管理您的任务</div>
            <v-btn color="primary" variant="text" @click="openCreateDialog">
              立即创建
            </v-btn>
          </div>

          <v-row v-else>
            <v-col
              v-for="project in projects"
              :key="project.id"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-card
                class="h-100 d-flex flex-column hover-card"
                elevation="1"
                @click="viewProject(project)"
              >
                <div class="pa-4 pb-2 d-flex align-start">
                  <v-avatar
                    :color="project.color"
                    size="48"
                    class="mr-3 text-h5"
                    variant="tonal"
                  >
                    {{ project.icon || "📁" }}
                  </v-avatar>
                  <div class="flex-grow-1 overflow-hidden">
                    <div class="text-subtitle-1 font-weight-bold text-truncate">
                      {{ project.name }}
                    </div>
                    <div class="text-caption text-grey text-truncate">
                      {{ project.description || "无描述" }}
                    </div>
                  </div>
                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <v-btn
                        icon="mdi-dots-vertical"
                        variant="text"
                        density="compact"
                        v-bind="props"
                        @click.stop
                      ></v-btn>
                    </template>
                    <v-list density="compact">
                      <v-list-item
                        @click="editProject(project)"
                        prepend-icon="mdi-pencil"
                      >
                        编辑
                      </v-list-item>
                      <v-list-item
                        v-if="project.status === 'active'"
                        @click="archiveProject(project)"
                        prepend-icon="mdi-archive"
                      >
                        归档
                      </v-list-item>
                      <v-list-item
                        v-if="project.status === 'archived'"
                        @click="activateProject(project)"
                        prepend-icon="mdi-restore"
                      >
                        激活
                      </v-list-item>
                      <v-list-item
                        @click="deleteProject(project)"
                        prepend-icon="mdi-delete"
                        color="error"
                      >
                        删除
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>

                <v-spacer></v-spacer>

                <div class="px-4 py-2">
                  <div class="d-flex justify-space-between text-caption mb-1">
                    <span>进度</span>
                    <span>{{ Math.round(project.completion_rate || 0) }}%</span>
                  </div>
                  <v-progress-linear
                    :model-value="project.completion_rate"
                    color="primary"
                    height="6"
                    rounded
                  ></v-progress-linear>
                </div>

                <div
                  class="px-4 py-3 border-t d-flex justify-space-between align-center text-caption text-grey-darken-1"
                >
                  <div class="d-flex align-center">
                    <v-icon
                      icon="mdi-checkbox-marked-circle-outline"
                      size="small"
                      class="mr-1"
                    ></v-icon>
                    {{ project.completed_todos_count }}/{{
                      project.todos_count
                    }}
                  </div>
                  <div v-if="project.end_date" class="d-flex align-center">
                    <v-icon
                      icon="mdi-calendar"
                      size="small"
                      class="mr-1"
                    ></v-icon>
                    {{ formatDate(project.end_date) }}
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-col>
    </v-row>

    <project-dialog
      v-model="showDialog"
      :project="selectedProject"
      :loading="dialogLoading"
      @save="handleSave"
    ></project-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useProjectStore } from "@/stores/project";
import { storeToRefs } from "pinia";
import ProjectDialog from "@/components/projects/ProjectDialog.vue";
import { useRouter } from "vue-router";

const router = useRouter();
const projectStore = useProjectStore();
const { projects, loading, statistics, filters } = storeToRefs(projectStore);

const showDialog = ref(false);
const selectedProject = ref(null);
const dialogLoading = ref(false);
const searchQuery = ref("");

const currentFilter = computed(() => filters.value.status);

const statusFilters = [
  {
    title: "进行中",
    value: "active",
    icon: "mdi-play-circle-outline",
    color: "primary",
  },
  {
    title: "已归档",
    value: "archived",
    icon: "mdi-archive-outline",
    color: "grey",
  },
  {
    title: "已完成",
    value: "completed",
    icon: "mdi-check-circle-outline",
    color: "success",
  },
];

onMounted(() => {
  loadData();
});

const loadData = async () => {
  await Promise.all([
    projectStore.fetchProjects(),
    projectStore.fetchStatistics(),
  ]);
};

const setFilter = (status) => {
  projectStore.setFilters({ status });
  projectStore.fetchProjects();
};

const handleSearch = (val) => {
  projectStore.setFilters({ search: val });
  projectStore.fetchProjects();
};

const openCreateDialog = () => {
  selectedProject.value = null;
  showDialog.value = true;
};

const editProject = (project) => {
  selectedProject.value = project;
  showDialog.value = true;
};

const handleSave = async (projectData) => {
  dialogLoading.value = true;
  try {
    if (selectedProject.value) {
      await projectStore.updateProject(selectedProject.value.id, projectData);
    } else {
      await projectStore.createProject(projectData);
    }
    showDialog.value = false;
    projectStore.fetchStatistics(); // 刷新统计
  } catch (error) {
    console.error(error);
  } finally {
    dialogLoading.value = false;
  }
};

const deleteProject = async (project) => {
  if (confirm(`确定要删除项目 "${project.name}" 吗？`)) {
    try {
      await projectStore.deleteProject(project.id);
      projectStore.fetchStatistics();
    } catch (error) {
      console.error(error);
    }
  }
};

const archiveProject = async (project) => {
  try {
    await projectStore.archiveProject(project.id);
    projectStore.fetchStatistics();
  } catch (error) {
    console.error(error);
  }
};

const activateProject = async (project) => {
  try {
    await projectStore.activateProject(project.id);
    projectStore.fetchStatistics();
  } catch (error) {
    console.error(error);
  }
};

const viewProject = (project) => {
  router.push(`/projects/${project.id}`);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString();
};
</script>

<style scoped>
.hover-card {
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}
.hover-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}
</style>
