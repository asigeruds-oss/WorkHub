<template>
  <div class="my-permissions">
    <v-progress-linear
      v-if="loading"
      indeterminate
      color="primary"
      class="mb-2"
    />

    <div class="mb-2">
      <v-btn
        variant="tonal"
        prepend-icon="mdi-refresh"
        @click="loadPermissions"
        :loading="loading"
        size="x-small"
        density="compact"
        >刷新</v-btn
      >
    </div>

    <v-row v-if="!loading" dense>
      <!-- 用户信息 -->
      <v-col cols="12" md="6">
        <v-card elevation="0" border rounded="lg">
          <v-card-title class="pa-2 text-subtitle-2">
            <v-icon class="mr-1" size="small">mdi-account-circle</v-icon
            >用户信息
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-2">
            <div class="mb-2">
              <p
                class="text-caption text-medium-emphasis mb-1"
                style="font-size: 0.7rem"
              >
                用户名
              </p>
              <div class="d-flex align-center gap-1">
                <v-avatar size="24" color="primary" class="text-caption">{{
                  userInfo.username?.charAt(0).toUpperCase()
                }}</v-avatar>
                <strong class="text-body-2">{{ userInfo.username }}</strong>
              </div>
            </div>

            <div class="mb-2">
              <p
                class="text-caption text-medium-emphasis mb-1"
                style="font-size: 0.7rem"
              >
                邮箱
              </p>
              <div class="d-flex align-center gap-1">
                <v-icon size="small">mdi-email</v-icon>
                <span class="text-caption">{{ userInfo.email }}</span>
              </div>
            </div>

            <div>
              <p
                class="text-caption text-medium-emphasis mb-1"
                style="font-size: 0.7rem"
              >
                账户状态
              </p>
              <div class="d-flex gap-1 flex-wrap">
                <v-chip
                  v-if="userInfo.is_superuser"
                  color="error"
                  prepend-icon="mdi-crown"
                  size="x-small"
                  density="compact"
                  >超级管理员</v-chip
                >
                <v-chip
                  v-if="userInfo.is_staff"
                  color="warning"
                  prepend-icon="mdi-shield"
                  size="x-small"
                  density="compact"
                  >员工权限</v-chip
                >
                <v-chip
                  v-if="userInfo.is_vip"
                  color="primary"
                  prepend-icon="mdi-star"
                  size="x-small"
                  density="compact"
                  >VIP用户</v-chip
                >
                <v-chip
                  v-if="
                    !userInfo.is_superuser &&
                    !userInfo.is_staff &&
                    !userInfo.is_vip
                  "
                  color="grey"
                  size="x-small"
                  density="compact"
                  >普通用户</v-chip
                >
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 用户组 -->
      <v-col cols="12" md="6">
        <v-card elevation="0" border rounded="lg">
          <v-card-title class="pa-2 text-subtitle-2">
            <v-icon class="mr-1" size="small">mdi-account-multiple</v-icon
            >我的用户组
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-2">
            <div v-if="groups.length > 0" class="d-flex gap-1 flex-wrap">
              <v-chip
                v-for="group in groups"
                :key="group.id"
                color="primary"
                variant="tonal"
                prepend-icon="mdi-account-multiple"
                size="x-small"
                density="compact"
                >{{ group.name }}</v-chip
              >
            </div>
            <p v-else class="text-body-2 text-medium-emphasis">
              <v-icon size="small" class="mr-1">mdi-information-outline</v-icon
              >您还未加入任何用户组
            </p>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 权限说明 -->
      <v-col cols="12">
        <v-card elevation="0" border rounded="lg">
          <v-card-title class="pa-2 text-subtitle-2">
            <v-icon class="mr-1" size="small">mdi-shield-check</v-icon
            >权限等级说明
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-2">
            <v-timeline density="compact" side="end" line-thickness="1">
              <v-timeline-item dot-color="error" size="x-small">
                <strong class="text-body-2">超级管理员</strong>
                <p
                  class="text-caption text-medium-emphasis mb-0"
                  style="font-size: 0.7rem"
                >
                  拥有系统所有权限
                </p>
              </v-timeline-item>
              <v-timeline-item dot-color="warning" size="x-small">
                <strong class="text-body-2">员工权限</strong>
                <p
                  class="text-caption text-medium-emphasis mb-0"
                  style="font-size: 0.7rem"
                >
                  可创建用户组并管理Wiki页面
                </p>
              </v-timeline-item>
              <v-timeline-item dot-color="primary" size="x-small">
                <strong class="text-body-2">VIP用户</strong>
                <p
                  class="text-caption text-medium-emphasis mb-0"
                  style="font-size: 0.7rem"
                >
                  享受高级功能
                </p>
              </v-timeline-item>
              <v-timeline-item dot-color="grey" size="x-small">
                <strong class="text-body-2">普通用户</strong>
                <p
                  class="text-caption text-medium-emphasis mb-0"
                  style="font-size: 0.7rem"
                >
                  基础使用权限
                </p>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-alert v-if="error && !loading" type="error" closable>{{
      error
    }}</v-alert>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { AuthAPI } from "@/api";

const loading = ref(false);
const error = ref("");
const userInfo = ref({});
const groups = ref([]);
const permissions = ref({});

const loadPermissions = async () => {
  loading.value = true;
  error.value = "";
  try {
    const response = await AuthAPI.getPermissions();
    userInfo.value = response.user || {};
    groups.value = response.groups || [];
    permissions.value = response.permissions || {};
  } catch (err) {
    error.value = err.response?.data?.error || err.message || "加载失败";
  } finally {
    loading.value = false;
  }
};

onMounted(() => loadPermissions());
</script>
