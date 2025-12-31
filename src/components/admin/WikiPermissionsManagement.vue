<template>
  <div class="wiki-permissions">
    <v-card elevation="0" border rounded="lg">
      <v-card-title class="pa-2 text-subtitle-2">
        <v-icon class="mr-1" size="small">mdi-book-lock</v-icon>Wiki权限管理
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-2">
        <v-alert type="info" variant="tonal" class="mb-2" density="compact">
          <div class="d-flex align-center">
            <v-icon class="mr-1" size="small">mdi-information</v-icon>
            <div>
              <p class="mb-1 text-caption"><strong>权限说明:</strong></p>
              <ul class="ml-4 text-caption" style="font-size: 0.7rem">
                <li>
                  Wiki页面权限分为<strong>读取</strong>和<strong>编辑</strong>两种
                </li>
                <li>可以为每个Wiki页面设置不同用户或用户组的访问权限</li>
                <li>超级管理员默认拥有所有Wiki页面的完整权限</li>
                <li>使用下方搜索找到Wiki页面后，可查看或修改其权限设置</li>
              </ul>
            </div>
          </div>
        </v-alert>

        <!-- 搜索Wiki页面 -->
        <v-row class="mb-2" dense>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchQuery"
              label="搜索Wiki页面"
              placeholder="输入Wiki标题"
              prepend-inner-icon="mdi-magnify"
              clearable
              hide-details
              density="compact"
              variant="outlined"
              @keyup.enter="searchWiki"
            />
          </v-col>
          <v-col cols="12" md="auto">
            <v-btn
              variant="tonal"
              prepend-icon="mdi-magnify"
              @click="searchWiki"
              :loading="searching"
              size="small"
              density="compact"
              >搜索</v-btn
            >
          </v-col>
        </v-row>

        <!-- 搜索结果 -->
        <div v-if="searchResults.length > 0">
          <p class="text-caption text-medium-emphasis mb-2">
            找到 {{ searchResults.length }} 个Wiki页面
          </p>
          <v-card
            v-for="wiki in searchResults"
            :key="wiki.id"
            elevation="0"
            border
            rounded="lg"
            class="mb-2"
          >
            <v-card-text class="pa-2">
              <div class="d-flex justify-space-between align-center">
                <div class="flex-grow-1">
                  <h4 class="text-subtitle-2 mb-0">{{ wiki.title }}</h4>
                  <p
                    class="text-caption text-medium-emphasis mb-0"
                    style="font-size: 0.7rem"
                  >
                    ID: {{ wiki.id }} | 创建者: {{ wiki.creator }}
                  </p>
                </div>
                <v-btn
                  variant="tonal"
                  prepend-icon="mdi-lock-open-outline"
                  @click="viewPermissions(wiki)"
                  size="x-small"
                  density="compact"
                  >查看权限</v-btn
                >
              </div>
            </v-card-text>
          </v-card>
        </div>

        <v-empty-state
          v-else-if="!searching && searchQuery"
          icon="mdi-database-search"
          text="未找到相关Wiki页面"
        />
      </v-card-text>
    </v-card>

    <!-- 权限详情对话框 -->
    <v-dialog v-model="permissionDialog" max-width="800">
      <v-card>
        <v-card-title class="pa-4">
          <v-icon class="mr-2" size="small">mdi-shield-lock</v-icon>Wiki权限详情
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <div class="mb-4">
            <h4 class="mb-2">{{ selectedWiki?.title }}</h4>
            <p class="text-caption text-medium-emphasis">
              Wiki ID: {{ selectedWiki?.id }}
            </p>
          </div>

          <v-tabs v-model="permissionTab" bg-color="transparent">
            <v-tab value="read">
              <v-icon class="mr-2" size="small">mdi-eye</v-icon>读取权限
            </v-tab>
            <v-tab value="write">
              <v-icon class="mr-2" size="small">mdi-pencil</v-icon>编辑权限
            </v-tab>
          </v-tabs>

          <v-window v-model="permissionTab" class="mt-4">
            <v-window-item value="read">
              <v-card elevation="0" border rounded="lg">
                <v-card-text class="pa-4">
                  <div class="mb-4">
                    <h5 class="mb-2">拥有读取权限的用户</h5>
                    <v-chip-group
                      v-if="currentPermissions.read_users?.length > 0"
                    >
                      <v-chip
                        v-for="user in currentPermissions.read_users"
                        :key="user"
                        closable
                        @click:close="removeUserPermission(user, 'read')"
                        size="small"
                      >
                        <v-icon start size="small">mdi-account</v-icon
                        >{{ user }}
                      </v-chip>
                    </v-chip-group>
                    <p v-else class="text-caption text-medium-emphasis">
                      未设置特定用户
                    </p>
                  </div>

                  <div>
                    <h5 class="mb-2">拥有读取权限的用户组</h5>
                    <v-chip-group
                      v-if="currentPermissions.read_groups?.length > 0"
                    >
                      <v-chip
                        v-for="group in currentPermissions.read_groups"
                        :key="group"
                        closable
                        @click:close="removeGroupPermission(group, 'read')"
                        size="small"
                      >
                        <v-icon start size="small">mdi-account-multiple</v-icon
                        >{{ group }}
                      </v-chip>
                    </v-chip-group>
                    <p v-else class="text-caption text-medium-emphasis">
                      未设置特定用户组
                    </p>
                  </div>

                  <v-divider class="my-4" />

                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="newReadUser"
                        label="添加用户"
                        density="compact"
                        hide-details
                        variant="outlined"
                        prepend-inner-icon="mdi-account"
                      />
                    </v-col>
                    <v-col cols="12" md="auto">
                      <v-btn
                        variant="tonal"
                        prepend-icon="mdi-plus"
                        @click="addUserPermission(newReadUser, 'read')"
                        :disabled="!newReadUser"
                        size="small"
                        >添加</v-btn
                      >
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-window-item>

            <v-window-item value="write">
              <v-card elevation="0" border rounded="lg">
                <v-card-text class="pa-4">
                  <div class="mb-4">
                    <h5 class="mb-2">拥有编辑权限的用户</h5>
                    <v-chip-group
                      v-if="currentPermissions.write_users?.length > 0"
                    >
                      <v-chip
                        v-for="user in currentPermissions.write_users"
                        :key="user"
                        closable
                        @click:close="removeUserPermission(user, 'write')"
                        size="small"
                      >
                        <v-icon start size="small">mdi-account</v-icon
                        >{{ user }}
                      </v-chip>
                    </v-chip-group>
                    <p v-else class="text-caption text-medium-emphasis">
                      未设置特定用户
                    </p>
                  </div>

                  <div>
                    <h5 class="mb-2">拥有编辑权限的用户组</h5>
                    <v-chip-group
                      v-if="currentPermissions.write_groups?.length > 0"
                    >
                      <v-chip
                        v-for="group in currentPermissions.write_groups"
                        :key="group"
                        closable
                        @click:close="removeGroupPermission(group, 'write')"
                        size="small"
                      >
                        <v-icon start size="small">mdi-account-multiple</v-icon
                        >{{ group }}
                      </v-chip>
                    </v-chip-group>
                    <p v-else class="text-caption text-medium-emphasis">
                      未设置特定用户组
                    </p>
                  </div>

                  <v-divider class="my-4" />

                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="newWriteUser"
                        label="添加用户"
                        density="compact"
                        hide-details
                        variant="outlined"
                        prepend-inner-icon="mdi-account"
                      />
                    </v-col>
                    <v-col cols="12" md="auto">
                      <v-btn
                        variant="tonal"
                        prepend-icon="mdi-plus"
                        @click="addUserPermission(newWriteUser, 'write')"
                        :disabled="!newWriteUser"
                        size="small"
                        >添加</v-btn
                      >
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-window-item>
          </v-window>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="permissionDialog = false">关闭</v-btn>
          <v-btn color="primary" variant="tonal" @click="savePermissions"
            >保存更改</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color">{{
      snackbar.message
    }}</v-snackbar>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { WikiAPI } from "@/api";

const searchQuery = ref("");
const searching = ref(false);
const searchResults = ref([]);

const permissionDialog = ref(false);
const permissionTab = ref("read");
const selectedWiki = ref(null);
const currentPermissions = ref({
  read_users: [],
  read_groups: [],
  write_users: [],
  write_groups: [],
});
const newReadUser = ref("");
const newWriteUser = ref("");

const snackbar = ref({ show: false, message: "", color: "success" });

const searchWiki = async () => {
  if (!searchQuery.value?.trim()) {
    snackbar.value = {
      show: true,
      message: "请输入搜索关键词",
      color: "warning",
    };
    return;
  }
  searching.value = true;
  try {
    const response = await WikiAPI.searchWiki({ query: searchQuery.value });
    searchResults.value = response.results || [];
    if (searchResults.value.length === 0) {
      snackbar.value = {
        show: true,
        message: "未找到相关Wiki页面",
        color: "info",
      };
    }
  } catch (error) {
    snackbar.value = {
      show: true,
      message: "搜索失败: " + (error.response?.data?.error || error.message),
      color: "error",
    };
  } finally {
    searching.value = false;
  }
};

const viewPermissions = async (wiki) => {
  selectedWiki.value = wiki;
  try {
    const response = await WikiAPI.getWikiPermissions(wiki.id);
    currentPermissions.value = response.permissions || {
      read_users: [],
      read_groups: [],
      write_users: [],
      write_groups: [],
    };
    permissionDialog.value = true;
  } catch (error) {
    snackbar.value = {
      show: true,
      message:
        "获取权限失败: " + (error.response?.data?.error || error.message),
      color: "error",
    };
  }
};

const addUserPermission = (username, type) => {
  if (!username?.trim()) return;
  const key = `${type}_users`;
  if (!currentPermissions.value[key].includes(username)) {
    currentPermissions.value[key].push(username);
    if (type === "read") newReadUser.value = "";
    else newWriteUser.value = "";
  }
};

const removeUserPermission = (username, type) => {
  const key = `${type}_users`;
  currentPermissions.value[key] = currentPermissions.value[key].filter(
    (u) => u !== username
  );
};

const removeGroupPermission = (groupName, type) => {
  const key = `${type}_groups`;
  currentPermissions.value[key] = currentPermissions.value[key].filter(
    (g) => g !== groupName
  );
};

const savePermissions = async () => {
  try {
    await WikiAPI.updateWikiPermissions(
      selectedWiki.value.id,
      currentPermissions.value
    );
    snackbar.value = { show: true, message: "权限更新成功", color: "success" };
    permissionDialog.value = false;
  } catch (error) {
    snackbar.value = {
      show: true,
      message: "更新失败: " + (error.response?.data?.error || error.message),
      color: "error",
    };
  }
};
</script>
