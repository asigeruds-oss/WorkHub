<template>
  <div class="groups-management">
    <!-- 操作工具栏 -->
    <v-card elevation="0" border rounded="lg" class="mb-4">
      <v-card-text class="pa-4">
        <div class="d-flex gap-2 flex-wrap align-center">
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="openCreateDialog"
            size="small"
          >
            创建用户组
          </v-btn>
          <v-btn
            variant="tonal"
            prepend-icon="mdi-refresh"
            @click="loadGroups"
            :loading="loading"
            size="small"
          >
            刷新
          </v-btn>
          <v-btn
            v-if="selectedGroups.length > 0"
            color="error"
            variant="tonal"
            prepend-icon="mdi-delete"
            @click="batchDeleteConfirm"
            size="small"
          >
            批量删除 ({{ selectedGroups.length }})
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-progress-linear
      v-if="loading"
      indeterminate
      color="primary"
      class="mb-4"
    />

    <!-- 用户组列表 -->
    <v-row v-if="!loading && groups.length > 0">
      <v-col v-for="group in groups" :key="group.id" cols="12" sm="6" md="4">
        <v-card elevation="0" border rounded="lg" class="h-100">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between mb-3">
              <v-checkbox
                v-model="selectedGroups"
                :value="group.id"
                hide-details
                density="compact"
              />
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn
                    icon="mdi-dots-vertical"
                    variant="text"
                    size="small"
                    v-bind="props"
                  />
                </template>
                <v-list density="compact">
                  <v-list-item @click="viewMembers(group)">
                    <template v-slot:prepend
                      ><v-icon size="small">mdi-account-group</v-icon></template
                    >
                    <v-list-item-title>查看成员</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="editGroup(group)">
                    <template v-slot:prepend
                      ><v-icon size="small">mdi-pencil</v-icon></template
                    >
                    <v-list-item-title>编辑</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="deleteGroup(group)">
                    <template v-slot:prepend
                      ><v-icon size="small" color="error"
                        >mdi-delete</v-icon
                      ></template
                    >
                    <v-list-item-title class="text-error"
                      >删除</v-list-item-title
                    >
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
            <div class="mb-2">
              <h4 class="text-subtitle-1 font-weight-bold mb-1">
                {{ group.name }}
              </h4>
              <v-chip
                size="x-small"
                prepend-icon="mdi-account-multiple"
                variant="tonal"
                color="primary"
              >
                {{ group.member_count || 0 }} 成员
              </v-chip>
            </div>
            <p class="text-body-2 text-grey-darken-1 mb-0">
              {{ group.description || "暂无描述" }}
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-empty-state
      v-if="!loading && groups.length === 0"
      icon="mdi-account-group"
      text="暂无用户组"
    />

    <!-- 创建对话框 -->
    <v-dialog v-model="createDialog" max-width="500">
      <v-card>
        <v-card-title class="py-3 px-4">创建用户组</v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-text-field
            v-model="newGroup.name"
            label="用户组名称"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />
          <v-textarea
            v-model="newGroup.description"
            label="描述（可选）"
            variant="outlined"
            density="comfortable"
            rows="3"
          />
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="createDialog = false">取消</v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            @click="createGroup"
            :loading="saving"
            >创建</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 编辑对话框 -->
    <v-dialog v-model="editDialog" max-width="500">
      <v-card>
        <v-card-title class="py-3 px-4">编辑用户组</v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-text-field
            v-model="editingGroup.name"
            label="用户组名称"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />
          <v-textarea
            v-model="editingGroup.description"
            label="描述（可选）"
            variant="outlined"
            density="comfortable"
            rows="3"
          />
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="editDialog = false">取消</v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            @click="updateGroup"
            :loading="saving"
            >保存</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 成员管理对话框 -->
    <v-dialog v-model="membersDialog" max-width="600">
      <v-card>
        <v-card-title class="py-3 px-4"
          >{{ currentGroup?.name }} 的成员</v-card-title
        >
        <v-divider />
        <v-card-text class="pa-4">
          <v-row class="mb-4">
            <v-col cols="8">
              <v-text-field
                v-model="newMemberUsername"
                label="添加用户"
                placeholder="输入用户名"
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </v-col>
            <v-col cols="4">
              <v-btn
                variant="elevated"
                color="primary"
                prepend-icon="mdi-plus"
                @click="addMember"
                :loading="memberLoading"
                block
              >
                添加
              </v-btn>
            </v-col>
          </v-row>
          <v-divider class="mb-3" />
          <v-list v-if="members.length > 0" density="compact">
            <v-list-item v-for="member in members" :key="member" class="px-2">
              <template v-slot:prepend>
                <v-avatar size="32" color="primary" class="mr-2">
                  <span class="text-caption">{{
                    member.charAt(0).toUpperCase()
                  }}</span>
                </v-avatar>
              </template>
              <v-list-item-title>{{ member }}</v-list-item-title>
              <template v-slot:append>
                <v-btn
                  icon="mdi-close"
                  variant="text"
                  size="small"
                  @click="removeMember(member)"
                  :loading="memberLoading"
                />
              </template>
            </v-list-item>
          </v-list>
          <v-empty-state v-else icon="mdi-account" text="暂无成员" />
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="membersDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { AuthAPI } from "@/api";

const loading = ref(false);
const saving = ref(false);
const memberLoading = ref(false);
const groups = ref([]);
const selectedGroups = ref([]);
const createDialog = ref(false);
const editDialog = ref(false);
const membersDialog = ref(false);
const newGroup = ref({ name: "", description: "" });
const editingGroup = ref({});
const currentGroup = ref(null);
const members = ref([]);
const newMemberUsername = ref("");
const snackbar = ref({ show: false, message: "", color: "success" });

const loadGroups = async () => {
  loading.value = true;
  try {
    const response = await AuthAPI.getGroups();
    groups.value = response.groups || [];
  } catch (error) {
    snackbar.value = {
      show: true,
      message: "加载失败: " + (error.response?.data?.error || error.message),
      color: "error",
    };
  } finally {
    loading.value = false;
  }
};

const openCreateDialog = () => {
  newGroup.value = { name: "", description: "" };
  createDialog.value = true;
};

const createGroup = async () => {
  if (!newGroup.value.name) {
    snackbar.value = {
      show: true,
      message: "请输入用户组名称",
      color: "warning",
    };
    return;
  }
  saving.value = true;
  try {
    await AuthAPI.createGroup(newGroup.value);
    snackbar.value = { show: true, message: "创建成功", color: "success" };
    createDialog.value = false;
    loadGroups();
  } catch (error) {
    snackbar.value = {
      show: true,
      message: "创建失败: " + (error.response?.data?.error || error.message),
      color: "error",
    };
  } finally {
    saving.value = false;
  }
};

const editGroup = (group) => {
  editingGroup.value = { ...group };
  editDialog.value = true;
};

const updateGroup = async () => {
  saving.value = true;
  try {
    await AuthAPI.updateGroup(editingGroup.value.id, editingGroup.value);
    snackbar.value = { show: true, message: "更新成功", color: "success" };
    editDialog.value = false;
    loadGroups();
  } catch (error) {
    snackbar.value = {
      show: true,
      message: "更新失败: " + (error.response?.data?.error || error.message),
      color: "error",
    };
  } finally {
    saving.value = false;
  }
};

const deleteGroup = async (group) => {
  if (!confirm(`确定删除用户组"${group.name}"?`)) return;
  try {
    await AuthAPI.deleteGroup(group.id);
    snackbar.value = { show: true, message: "删除成功", color: "success" };
    loadGroups();
  } catch (error) {
    snackbar.value = {
      show: true,
      message: "删除失败: " + (error.response?.data?.error || error.message),
      color: "error",
    };
  }
};

const batchDeleteConfirm = async () => {
  if (!confirm(`确定删除 ${selectedGroups.value.length} 个用户组?`)) return;
  try {
    await AuthAPI.batchDeleteGroups(selectedGroups.value);
    snackbar.value = { show: true, message: "批量删除成功", color: "success" };
    selectedGroups.value = [];
    loadGroups();
  } catch (error) {
    snackbar.value = {
      show: true,
      message:
        "批量删除失败: " + (error.response?.data?.error || error.message),
      color: "error",
    };
  }
};

const viewMembers = async (group) => {
  currentGroup.value = group;
  memberLoading.value = true;
  try {
    const response = await AuthAPI.getGroupUsers(group.id);
    members.value = response.users || [];
    membersDialog.value = true;
  } catch (error) {
    snackbar.value = {
      show: true,
      message:
        "获取成员失败: " + (error.response?.data?.error || error.message),
      color: "error",
    };
  } finally {
    memberLoading.value = false;
  }
};

const addMember = async () => {
  if (!newMemberUsername.value) return;
  memberLoading.value = true;
  try {
    await AuthAPI.addUserToGroup(
      currentGroup.value.id,
      newMemberUsername.value
    );
    snackbar.value = { show: true, message: "添加成功", color: "success" };
    newMemberUsername.value = "";
    viewMembers(currentGroup.value);
  } catch (error) {
    snackbar.value = {
      show: true,
      message: "添加失败: " + (error.response?.data?.error || error.message),
      color: "error",
    };
  } finally {
    memberLoading.value = false;
  }
};

const removeMember = async (username) => {
  if (!confirm(`确定移除成员"${username}"?`)) return;
  memberLoading.value = true;
  try {
    await AuthAPI.removeUserFromGroup(currentGroup.value.id, username);
    snackbar.value = { show: true, message: "移除成功", color: "success" };
    viewMembers(currentGroup.value);
  } catch (error) {
    snackbar.value = {
      show: true,
      message: "移除失败: " + (error.response?.data?.error || error.message),
      color: "error",
    };
  } finally {
    memberLoading.value = false;
  }
};

onMounted(() => loadGroups());
</script>
