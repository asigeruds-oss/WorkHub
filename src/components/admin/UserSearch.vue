<template>
  <div class="user-search">
    <!-- 搜索表单 -->
    <v-card elevation="0" border rounded="lg" class="mb-4">
      <v-card-text class="pa-4">
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="searchQuery"
              label="搜索用户"
              placeholder="输入用户名或邮箱"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-magnify"
              @keyup.enter="performSearch"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="3" class="d-flex align-center gap-2">
            <v-btn
              color="primary"
              prepend-icon="mdi-magnify"
              @click="performSearch"
              :loading="loading"
            >
              搜索
            </v-btn>
            <v-btn
              variant="text"
              prepend-icon="mdi-refresh"
              @click="clearSearch"
              v-if="isSearching"
            >
              清除
            </v-btn>
          </v-col>
          <v-col cols="12" sm="3" class="d-flex align-center justify-end">
            <v-select
              v-model="pageSize"
              :items="[10, 20, 50, 100]"
              label="每页显示"
              variant="outlined"
              density="comfortable"
              hide-details
              @update:modelValue="onPageSizeChange"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-progress-linear
      v-if="loading"
      indeterminate
      color="primary"
      class="mb-4"
    />

    <v-alert
      v-if="!loading && !isSearching"
      type="info"
      density="compact"
      variant="tonal"
      class="mb-4"
    >
      共 <strong>{{ totalUsers }}</strong> 个用户，当前显示第
      {{ currentPage }} 页
    </v-alert>

    <v-alert
      v-if="!loading && isSearching"
      type="success"
      density="compact"
      variant="tonal"
      class="mb-4"
    >
      找到 <strong>{{ searchResults.length }}</strong> 个匹配用户
    </v-alert>

    <v-card v-if="displayUsers.length > 0" elevation="0" border rounded="lg">
      <v-table hover>
        <thead>
          <tr>
            <th>用户名</th>
            <th>邮箱</th>
            <th>用户组</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in displayUsers" :key="user.id">
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>
              <v-chip
                v-for="group in user.groups"
                :key="group.id"
                size="x-small"
                class="mr-1"
                variant="tonal"
                color="primary"
              >
                {{ group.name }}
              </v-chip>
              <span
                v-if="!user.groups || user.groups.length === 0"
                class="text-caption text-grey"
                >无</span
              >
            </td>
            <td>
              <v-chip
                v-if="user.is_superuser"
                size="x-small"
                color="error"
                prepend-icon="mdi-crown"
              >
                超级管理员
              </v-chip>
              <v-chip
                v-else-if="user.is_staff"
                size="x-small"
                color="warning"
                prepend-icon="mdi-shield"
              >
                员工
              </v-chip>
              <v-chip
                v-else-if="user.is_vip"
                size="x-small"
                color="primary"
                prepend-icon="mdi-star"
              >
                VIP
              </v-chip>
              <v-chip v-else size="x-small" color="grey">普通用户</v-chip>
            </td>
            <td>
              <v-btn
                variant="text"
                prepend-icon="mdi-eye"
                @click="viewUserDetails(user)"
                size="small"
              >
                详情
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- 分页控件 -->
      <v-divider />
      <div class="pa-4 d-flex align-center justify-center">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="7"
          @update:modelValue="loadUsers"
          v-if="!isSearching"
        />
      </div>
    </v-card>

    <v-empty-state
      v-else-if="!loading"
      icon="mdi-account-search"
      text="暂无用户数据"
    />

    <!-- 用户详情对话框 -->
    <v-dialog v-model="detailsDialog" max-width="700">
      <v-card>
        <v-card-title class="py-3 px-4">用户详情</v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-row v-if="currentUser">
            <v-col cols="12" md="6">
              <v-card elevation="0" border rounded="lg">
                <v-card-text class="pa-3">
                  <div class="text-caption text-grey mb-2">基本信息</div>
                  <div class="d-flex align-center mb-3">
                    <v-avatar size="48" color="primary" class="mr-3">
                      <span class="text-h6">{{
                        currentUser.username?.charAt(0).toUpperCase()
                      }}</span>
                    </v-avatar>
                    <div>
                      <div class="text-subtitle-1 font-weight-bold">
                        {{ currentUser.username }}
                      </div>
                      <div class="text-caption text-grey">
                        {{ currentUser.email }}
                      </div>
                    </div>
                  </div>
                  <v-divider class="mb-2" />
                  <div class="text-body-2">
                    <div class="mb-1">
                      <span class="text-grey">用户ID:</span>
                      {{ currentUser.id }}
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card elevation="0" border rounded="lg">
                <v-card-text class="pa-3">
                  <div class="text-caption text-grey mb-2">权限信息</div>
                  <div v-if="userPermissions" class="mb-3">
                    <v-chip
                      v-if="userPermissions.is_superuser"
                      size="small"
                      color="error"
                      prepend-icon="mdi-crown"
                      class="mr-1 mb-1"
                    >
                      超级管理员
                    </v-chip>
                    <v-chip
                      v-if="userPermissions.is_staff"
                      size="small"
                      color="warning"
                      prepend-icon="mdi-shield"
                      class="mr-1 mb-1"
                    >
                      员工权限
                    </v-chip>
                    <v-chip
                      v-if="userPermissions.is_vip"
                      size="small"
                      color="primary"
                      prepend-icon="mdi-star"
                      class="mr-1 mb-1"
                    >
                      VIP用户
                    </v-chip>
                  </div>
                  <v-divider class="mb-2" />
                  <div class="text-caption text-grey mb-2">用户组</div>
                  <v-chip-group v-if="userPermissions?.groups?.length > 0">
                    <v-chip
                      v-for="group in userPermissions.groups"
                      :key="group.id"
                      size="small"
                      variant="tonal"
                      color="primary"
                    >
                      {{ group.name }}
                    </v-chip>
                  </v-chip-group>
                  <div v-else class="text-caption text-grey">
                    未加入任何用户组
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12">
              <v-card elevation="0" border rounded="lg">
                <v-card-text class="pa-3">
                  <div class="text-caption text-grey mb-2">分配用户组</div>
                  <v-row>
                    <v-col cols="8">
                      <v-autocomplete
                        v-model="selectedGroups"
                        :items="allGroups"
                        item-title="name"
                        item-value="id"
                        label="选择用户组"
                        multiple
                        chips
                        closable-chips
                        variant="outlined"
                        density="comfortable"
                        hide-details
                      />
                    </v-col>
                    <v-col cols="4">
                      <v-btn
                        variant="elevated"
                        color="primary"
                        prepend-icon="mdi-check"
                        @click="assignGroups"
                        :loading="assigning"
                        block
                      >
                        保存
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="detailsDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { AuthAPI } from "@/api";

const loading = ref(false);
const assigning = ref(false);
const isSearching = ref(false);
const searchQuery = ref("");
const searchResults = ref([]);
const allUsers = ref([]);
const currentPage = ref(1);
const pageSize = ref(20);
const totalUsers = ref(0);
const detailsDialog = ref(false);
const currentUser = ref(null);
const userPermissions = ref(null);
const allGroups = ref([]);
const selectedGroups = ref([]);
const snackbar = ref({ show: false, message: "", color: "success" });

const totalPages = computed(() => Math.ceil(totalUsers.value / pageSize.value));

const displayUsers = computed(() => {
  return isSearching.value ? searchResults.value : allUsers.value;
});

const loadUsers = async () => {
  loading.value = true;
  try {
    const response = await AuthAPI.searchUsers({
      query: "",
      limit: pageSize.value,
      offset: (currentPage.value - 1) * pageSize.value,
    });
    allUsers.value = response.users || [];
    totalUsers.value = response.total || 0;
  } catch (error) {
    snackbar.value = {
      show: true,
      message:
        "加载用户失败: " + (error.response?.data?.error || error.message),
      color: "error",
    };
  } finally {
    loading.value = false;
  }
};

const performSearch = async () => {
  if (!searchQuery.value?.trim()) {
    snackbar.value = {
      show: true,
      message: "请输入搜索条件",
      color: "warning",
    };
    return;
  }
  loading.value = true;
  isSearching.value = true;
  try {
    const response = await AuthAPI.searchUsers({
      query: searchQuery.value,
      limit: 1000,
    });
    searchResults.value = response.users || [];
    if (searchResults.value.length === 0) {
      snackbar.value = { show: true, message: "未找到匹配用户", color: "info" };
    }
  } catch (error) {
    snackbar.value = {
      show: true,
      message: "搜索失败: " + (error.response?.data?.error || error.message),
      color: "error",
    };
  } finally {
    loading.value = false;
  }
};

const clearSearch = () => {
  searchQuery.value = "";
  isSearching.value = false;
  searchResults.value = [];
  currentPage.value = 1;
  loadUsers();
};

const onPageSizeChange = () => {
  currentPage.value = 1;
  loadUsers();
};

const viewUserDetails = async (user) => {
  currentUser.value = user;
  detailsDialog.value = true;
  try {
    // 使用用户ID而不是用户名
    const response = await AuthAPI.getUserPermissions(user.id);
    userPermissions.value = response;
    selectedGroups.value = response.groups?.map((g) => g.id) || [];
  } catch (error) {
    snackbar.value = {
      show: true,
      message:
        "获取用户详情失败: " + (error.response?.data?.error || error.message),
      color: "error",
    };
  }
};

const assignGroups = async () => {
  assigning.value = true;
  try {
    // 使用用户ID而不是用户名
    await AuthAPI.setUserGroups(currentUser.value.id, selectedGroups.value);
    snackbar.value = {
      show: true,
      message: "用户组分配成功",
      color: "success",
    };
    detailsDialog.value = false;
    performSearch();
  } catch (error) {
    snackbar.value = {
      show: true,
      message: "分配失败: " + (error.response?.data?.error || error.message),
      color: "error",
    };
  } finally {
    assigning.value = false;
  }
};

const loadGroups = async () => {
  try {
    const response = await AuthAPI.getGroups();
    allGroups.value = response.groups || [];
  } catch (error) {
    console.error("加载用户组失败:", error);
  }
};

onMounted(() => {
  loadGroups();
  loadUsers();
});
</script>
