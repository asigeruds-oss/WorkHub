<template>
  <div class="admin-permissions">
    <v-container fluid class="pa-4">
      <!-- 页面头部 -->
      <v-card elevation="0" border rounded="lg" class="mb-4">
        <v-card-text class="pa-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <h1 class="text-h5 font-weight-bold mb-1">权限管理</h1>
              <p class="text-body-2 text-medium-emphasis">
                管理用户组、权限和Wiki页面访问控制
              </p>
            </div>
            <v-chip color="primary" variant="tonal">
              <v-icon start size="small">mdi-shield-check</v-icon>
              权限中心
            </v-chip>
          </div>
        </v-card-text>
      </v-card>

      <!-- 标签页导航 -->
      <v-tabs v-model="activeTab" color="primary" class="mb-4">
        <v-tab value="groups">
          <v-icon start size="small">mdi-account-multiple</v-icon>
          用户组
        </v-tab>
        <v-tab value="users">
          <v-icon start size="small">mdi-account-search</v-icon>
          用户
        </v-tab>
        <v-tab value="my-permissions">
          <v-icon start size="small">mdi-shield-account</v-icon>
          我的权限
        </v-tab>
        <v-tab value="wiki-permissions">
          <v-icon start size="small">mdi-book-lock</v-icon>
          Wiki权限
        </v-tab>
      </v-tabs>

      <!-- 标签页内容 -->
      <v-window v-model="activeTab">
        <!-- 用户组管理标签页 -->
        <v-window-item value="groups" class="pb-4">
          <GroupsManagement />
        </v-window-item>

        <!-- 用户搜索标签页 -->
        <v-window-item value="users" class="pb-4">
          <UserSearch />
        </v-window-item>

        <!-- 我的权限标签页 -->
        <v-window-item value="my-permissions" class="pb-4">
          <MyPermissions />
        </v-window-item>

        <!-- Wiki权限管理标签页 -->
        <v-window-item value="wiki-permissions" class="pb-4">
          <WikiPermissionsManagement />
        </v-window-item>
      </v-window>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import GroupsManagement from "@/components/admin/GroupsManagement.vue";
import UserSearch from "@/components/admin/UserSearch.vue";
import MyPermissions from "@/components/admin/MyPermissions.vue";
import WikiPermissionsManagement from "@/components/admin/WikiPermissionsManagement.vue";

const activeTab = ref("groups");
const router = useRouter();
const authStore = useAuthStore();

// 权限检查
onMounted(async () => {
  // 确保用户信息是最新的
  await authStore.fetchUserInfo();

  if (!authStore.isAdmin) {
    // 非管理员重定向到首页
    router.push("/");
  }
});
</script>

<style scoped>
.admin-permissions {
  min-height: 100vh;
  background-color: rgb(var(--v-theme-background));
}
</style>
