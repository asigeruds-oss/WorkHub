<template>
  <div class="wiki-layout">
    <!-- 侧边导航 -->
    <v-navigation-drawer
      permanent
      :rail="railMode"
      :width="280"
      class="wiki-sidebar"
    >
      <!-- 侧栏头部 -->
      <div class="sidebar-header pa-2">
        <div class="d-flex align-center">
          <v-icon size="24" color="primary">mdi-book-open-variant</v-icon>
          <template v-if="!railMode">
            <span class="ml-2 text-subtitle-2 font-weight-bold">Wiki</span>
            <v-spacer />
            <v-btn
              icon="mdi-chevron-left"
              variant="text"
              size="x-small"
              @click.stop="railMode = true"
            />
          </template>
          <v-btn
            v-else
            icon="mdi-chevron-right"
            variant="text"
            size="x-small"
            @click.stop="railMode = false"
          />
        </div>
      </div>

      <template v-if="!railMode">
        <!-- 快速操作 -->
        <div class="pa-2">
          <v-btn
            v-if="canCreate"
            prepend-icon="mdi-plus"
            variant="tonal"
            color="primary"
            block
            size="small"
            density="comfortable"
            @click="showCreateDialog = true"
          >
            新建页面
          </v-btn>
        </div>

        <!-- 搜索框 -->
        <div class="px-2 pb-2">
          <v-text-field
            v-model="searchQuery"
            placeholder="搜索..."
            density="compact"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            clearable
            hide-details
            single-line
            @keyup.enter="performSearch"
          />
        </div>

        <!-- 标签页 -->
        <v-tabs v-model="sidebarTab" density="compact" grow>
          <v-tab value="tree" size="small">
            <v-icon size="16">mdi-file-tree</v-icon>
            <span class="ml-1 text-caption">目录</span>
          </v-tab>
          <v-tab value="recent" size="small">
            <v-icon size="16">mdi-clock-outline</v-icon>
            <span class="ml-1 text-caption">最近</span>
          </v-tab>
          <v-tab value="favorites" size="small">
            <v-icon size="16">mdi-star-outline</v-icon>
            <span class="ml-1 text-caption">收藏</span>
          </v-tab>
        </v-tabs>

        <v-divider />

        <!-- 标签页内容 -->
        <v-window v-model="sidebarTab" class="sidebar-content">
          <v-window-item value="tree">
            <div class="wiki-tree-container pa-2">
              <template v-if="pageTree.length > 0">
                <wiki-tree-item
                  v-for="page in pageTree"
                  :key="page.id"
                  :page="page"
                  :current-page-id="currentPageId"
                  @navigate="navigateToPage"
                  @create-child="createChildPage"
                  @edit="editPage"
                  @delete="deletePage"
                />
              </template>
              <div
                v-else
                class="text-center pa-4 text-caption text-medium-emphasis"
              >
                <v-icon size="32" color="grey">mdi-file-outline</v-icon>
                <div class="mt-1">暂无页面</div>
              </div>
            </div>
          </v-window-item>

          <v-window-item value="recent">
            <v-list nav density="compact" class="pa-1">
              <v-list-item
                v-for="page in recentPages"
                :key="page.id"
                :title="page.title"
                :subtitle="formatRelativeTime(page.visited_at)"
                density="compact"
                @click="navigateToPage(page.id)"
              >
                <template v-slot:prepend>
                  <v-icon size="16">mdi-clock-outline</v-icon>
                </template>
              </v-list-item>
              <div
                v-if="recentPages.length === 0"
                class="text-center pa-4 text-caption text-medium-emphasis"
              >
                暂无最近访问
              </div>
            </v-list>
          </v-window-item>

          <v-window-item value="favorites">
            <v-list nav density="compact" class="pa-1">
              <v-list-item
                v-for="page in favoritePages"
                :key="page.id"
                :title="page.title"
                density="compact"
                @click="navigateToPage(page.id)"
              >
                <template v-slot:prepend>
                  <v-icon size="16" color="amber">mdi-star</v-icon>
                </template>
              </v-list-item>
              <div
                v-if="favoritePages.length === 0"
                class="text-center pa-4 text-caption text-medium-emphasis"
              >
                暂无收藏
              </div>
            </v-list>
          </v-window-item>
        </v-window>
      </template>

      <!-- Rail 模式 -->
      <div v-else class="d-flex flex-column align-center pa-1">
        <v-tooltip text="新建页面" location="right">
          <template v-slot:activator="{ props }">
            <v-btn
              v-if="canCreate"
              icon="mdi-plus"
              variant="text"
              size="small"
              v-bind="props"
              @click="showCreateDialog = true"
              class="mb-1"
            />
          </template>
        </v-tooltip>
        <v-tooltip text="搜索" location="right">
          <template v-slot:activator="{ props }">
            <v-btn
              icon="mdi-magnify"
              variant="text"
              size="small"
              v-bind="props"
              @click="
                railMode = false;
                performSearch();
              "
            />
          </template>
        </v-tooltip>
      </div>
    </v-navigation-drawer>

    <!-- 主内容区 -->
    <div class="wiki-main">
      <!-- 顶部工具栏 -->
      <div class="wiki-toolbar">
        <v-breadcrumbs
          v-if="breadcrumbs.length > 0"
          :items="breadcrumbs"
          density="compact"
          class="text-body-2 pa-0"
        >
          <template v-slot:divider>
            <v-icon size="14">mdi-chevron-right</v-icon>
          </template>
        </v-breadcrumbs>

        <v-spacer />

        <!-- 用户权限状态指示 -->
        <v-chip
          v-if="isAuthenticated"
          size="x-small"
          :color="userRoleColor"
          variant="tonal"
          class="mr-2"
        >
          <v-icon size="12" start>{{ userRoleIcon }}</v-icon>
          {{ userRoleText }}
        </v-chip>

        <!-- 页面操作 -->
        <template v-if="currentPage">
          <v-btn
            :icon="isFavorite(currentPageId) ? 'mdi-star' : 'mdi-star-outline'"
            :color="isFavorite(currentPageId) ? 'amber' : undefined"
            variant="text"
            size="small"
            @click="toggleFavorite(currentPageId)"
          />
          <v-btn
            v-if="canEdit"
            icon="mdi-pencil"
            variant="text"
            size="small"
            @click="editCurrentPage"
          />
          <v-btn
            icon="mdi-history"
            variant="text"
            size="small"
            @click="showHistoryDialog = true"
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
            <v-list density="compact" min-width="140">
              <v-list-item prepend-icon="mdi-share-variant" @click="sharePage">
                <v-list-item-title class="text-body-2">分享</v-list-item-title>
              </v-list-item>
              <v-list-item
                v-if="canEdit"
                prepend-icon="mdi-folder-move"
                @click="movePage"
              >
                <v-list-item-title class="text-body-2">移动</v-list-item-title>
              </v-list-item>
              <v-list-item
                prepend-icon="mdi-tag-outline"
                @click="showTagsDialog = true"
              >
                <v-list-item-title class="text-body-2">标签</v-list-item-title>
              </v-list-item>
              <v-list-item
                v-if="canManagePermission"
                prepend-icon="mdi-shield-lock"
                @click="showPermissionDialog = true"
              >
                <v-list-item-title class="text-body-2">权限</v-list-item-title>
              </v-list-item>
              <v-divider v-if="canDelete" class="my-1" />
              <v-list-item
                v-if="canDelete"
                prepend-icon="mdi-delete"
                @click="deleteCurrentPage"
                class="text-error"
              >
                <v-list-item-title class="text-body-2">删除</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </div>

      <!-- 页面内容 -->
      <div class="wiki-content-area">
        <div class="wiki-container">
          <!-- 首页 -->
          <div v-if="!currentPage && !loading" class="welcome-section">
            <div class="text-center mb-4">
              <v-icon size="48" color="primary"
                >mdi-book-open-page-variant</v-icon
              >
              <h2 class="text-h5 font-weight-bold mt-2 mb-1">Wiki 知识库</h2>
              <p class="text-body-2 text-medium-emphasis">构建团队知识体系</p>
            </div>

            <!-- 快速操作 -->
            <v-row dense justify="center" class="mb-4">
              <v-col cols="6" sm="3" v-if="canCreate">
                <v-card
                  class="quick-card pa-3 text-center"
                  variant="tonal"
                  color="primary"
                  hover
                  @click="showCreateDialog = true"
                >
                  <v-icon size="28" class="mb-1">mdi-file-plus-outline</v-icon>
                  <div class="text-caption font-weight-medium">创建页面</div>
                </v-card>
              </v-col>
              <v-col cols="6" sm="3">
                <v-card
                  class="quick-card pa-3 text-center"
                  variant="tonal"
                  hover
                  @click="performSearch"
                >
                  <v-icon size="28" class="mb-1">mdi-magnify</v-icon>
                  <div class="text-caption font-weight-medium">搜索内容</div>
                </v-card>
              </v-col>
              <v-col cols="6" sm="3">
                <v-card
                  class="quick-card pa-3 text-center"
                  variant="tonal"
                  hover
                  @click="sidebarTab = 'recent'"
                >
                  <v-icon size="28" class="mb-1">mdi-history</v-icon>
                  <div class="text-caption font-weight-medium">最近访问</div>
                </v-card>
              </v-col>
            </v-row>

            <!-- 统计 -->
            <v-row dense justify="center">
              <v-col cols="auto">
                <div class="stat-item">
                  <span class="text-h6 font-weight-bold text-primary">{{
                    pageTree.length
                  }}</span>
                  <span class="text-caption text-medium-emphasis ml-1"
                    >根页面</span
                  >
                </div>
              </v-col>
              <v-divider vertical class="mx-3" />
              <v-col cols="auto">
                <div class="stat-item">
                  <span class="text-h6 font-weight-bold text-primary">{{
                    totalPages
                  }}</span>
                  <span class="text-caption text-medium-emphasis ml-1"
                    >总页面</span
                  >
                </div>
              </v-col>
              <v-divider vertical class="mx-3" />
              <v-col cols="auto">
                <div class="stat-item">
                  <span class="text-h6 font-weight-bold text-primary">{{
                    recentPages.length
                  }}</span>
                  <span class="text-caption text-medium-emphasis ml-1"
                    >最近访问</span
                  >
                </div>
              </v-col>
            </v-row>

            <!-- 未登录提示 -->
            <v-alert
              v-if="!isAuthenticated"
              type="info"
              variant="tonal"
              density="compact"
              class="mt-4 mx-auto"
              max-width="400"
            >
              <template v-slot:prepend>
                <v-icon size="20">mdi-information</v-icon>
              </template>
              <div class="text-body-2">
                <router-link to="/login" class="text-primary font-weight-medium"
                  >登录</router-link
                >
                后可创建和编辑页面
              </div>
            </v-alert>
          </div>

          <!-- 页面详情 -->
          <div v-else-if="currentPage && !loading" class="page-detail">
            <!-- 主内容 -->
            <div class="page-content-wrapper">
              <div class="page-header mb-4">
                <h1 class="page-title">{{ currentPage.title }}</h1>

                <!-- 元信息 -->
                <div class="meta-info mt-3">
                  <span class="meta-item">
                    <v-icon size="14">mdi-account</v-icon>
                    {{ currentPage.created_by }}
                  </span>
                  <span class="meta-item">
                    <v-icon size="14">mdi-calendar</v-icon>
                    {{ formatDate(currentPage.created_at) }}
                  </span>
                  <span class="meta-item">
                    <v-icon size="14">mdi-update</v-icon>
                    {{ formatDate(currentPage.updated_at) }}
                  </span>
                  <span class="meta-item">
                    <v-icon size="14">mdi-history</v-icon>
                    v{{ currentPage.version }}
                  </span>
                </div>

                <!-- 标签 -->
                <div v-if="currentPage.tags?.length" class="mt-3">
                  <v-chip
                    v-for="tag in currentPage.tags"
                    :key="tag"
                    size="small"
                    variant="tonal"
                    color="primary"
                    class="mr-2"
                    @click="searchByTag(tag)"
                  >
                    {{ tag }}
                  </v-chip>
                </div>
              </div>

              <!-- 权限不足提示 -->
              <v-alert
                v-if="!canRead"
                type="error"
                variant="tonal"
                density="compact"
                class="mb-4"
              >
                <v-icon size="16" start>mdi-lock</v-icon>
                <span class="text-body-2">您没有查看此页面的权限</span>
              </v-alert>
              <v-alert
                v-else-if="!canEdit && isAuthenticated"
                type="warning"
                variant="tonal"
                density="compact"
                class="mb-4"
              >
                <v-icon size="16" start>mdi-lock</v-icon>
                <span class="text-body-2">您没有编辑此页面的权限</span>
              </v-alert>

              <!-- 权限信息显示 -->
              <div
                v-if="currentPage.permissions && canManagePermission"
                class="permission-info mb-4"
              >
                <v-chip
                  size="x-small"
                  variant="tonal"
                  color="info"
                  class="mr-1"
                >
                  <v-icon size="12" start>mdi-eye</v-icon>
                  读取:
                  {{ formatPermissionDisplay(currentPage.permissions.read) }}
                </v-chip>
                <v-chip size="x-small" variant="tonal" color="warning">
                  <v-icon size="12" start>mdi-pencil</v-icon>
                  编辑:
                  {{ formatPermissionDisplay(currentPage.permissions.edit) }}
                </v-chip>
              </div>

              <!-- 内容 -->
              <div class="content-card">
                <div class="markdown-content" v-html="renderedContent"></div>
              </div>

              <!-- 评论 -->
              <wiki-comments
                v-if="currentPage.id && canComment"
                :page-id="currentPage.id"
                class="mt-6"
              />
            </div>
          </div>

          <!-- 加载中 -->
          <div v-else-if="loading" class="text-center py-8">
            <v-progress-circular indeterminate color="primary" size="32" />
            <p class="text-body-2 text-medium-emphasis mt-2">加载中...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 对话框 -->
    <wiki-create-dialog
      v-model="showCreateDialog"
      :parent-id="createParentId"
      @created="onPageCreated"
    />

    <wiki-edit-dialog
      v-model="showEditDialog"
      :page="editingPage"
      @updated="onPageUpdated"
    />

    <wiki-tags-dialog v-model="showTagsDialog" />

    <wiki-history-dialog v-model="showHistoryDialog" :page-id="currentPageId" />

    <wiki-move-dialog
      v-model="showMoveDialog"
      :page="currentPage"
      @moved="onPageMoved"
    />

    <!-- 权限管理对话框 -->
    <wiki-permission-dialog
      v-model="showPermissionDialog"
      :page="currentPage"
      @updated="onPermissionUpdated"
    />

    <!-- 权限不足提示 -->
    <v-snackbar v-model="showAuthSnackbar" :timeout="3000" color="warning">
      {{ authMessage }}
      <template v-slot:actions>
        <v-btn variant="text" @click="showAuthSnackbar = false">关闭</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { marked } from "marked";
import { useAuthStore } from "@/stores/auth";
import { AuthAPI } from "@/api/auth";
import WikiAPI from "@/api/wiki";
import WikiTreeItem from "@/components/wiki/WikiTreeItem.vue";
import WikiComments from "@/components/wiki/WikiComments.vue";
import WikiCreateDialog from "@/components/wiki/WikiCreateDialog.vue";
import WikiEditDialog from "@/components/wiki/WikiEditDialog.vue";
import WikiTagsDialog from "@/components/wiki/WikiTagsDialog.vue";
import WikiHistoryDialog from "@/components/wiki/WikiHistoryDialog.vue";
import WikiMoveDialog from "@/components/wiki/WikiMoveDialog.vue";
import WikiPermissionDialog from "@/components/wiki/WikiPermissionDialog.vue";

// 缓存 key
const TREE_CACHE_KEY = "wiki_tree_cache";
const GROUPS_CACHE_KEY = "wiki_groups_cache";
const PERMISSIONS_CACHE_KEY = "wiki_permissions_cache";
const CACHE_TIME_SUFFIX = "_time";
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存有效期

// 通用缓存获取函数
const getCachedData = (key) => {
  try {
    const cached = sessionStorage.getItem(key);
    const cacheTime = sessionStorage.getItem(key + CACHE_TIME_SUFFIX);
    if (cached && cacheTime) {
      if (Date.now() - parseInt(cacheTime) < CACHE_DURATION) {
        return JSON.parse(cached);
      }
    }
  } catch (e) {
    console.warn(`读取缓存失败 [${key}]:`, e);
  }
  return null;
};

// 通用缓存设置函数
const setCachedData = (key, data) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
    sessionStorage.setItem(key + CACHE_TIME_SUFFIX, Date.now().toString());
  } catch (e) {
    console.warn(`设置缓存失败 [${key}]:`, e);
  }
};

// 通用缓存清除函数
const clearCache = (key) => {
  sessionStorage.removeItem(key);
  sessionStorage.removeItem(key + CACHE_TIME_SUFFIX);
};

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// ========== 鉴权状态 ==========
const userPermissions = ref(null);
const userGroups = ref([]); // 用户所属的用户组
const allGroups = ref([]); // 所有用户组列表
const showAuthSnackbar = ref(false);
const authMessage = ref("");

// 基础认证状态
const isAuthenticated = computed(() => authStore.isAuthenticated);
const currentUser = computed(() => authStore.user);
const isAdmin = computed(() => authStore.isAdmin);
const isSuperuser = computed(() => authStore.isSuperuser);

// 检查用户是否在指定权限列表中
const checkUserInPermissionList = (permissionList) => {
  if (!permissionList || permissionList.length === 0) return true; // 空列表默认允许
  if (permissionList.includes("all")) return true;

  const username = currentUser.value?.username;
  if (!username) return false;

  // 检查用户名是否直接在列表中
  if (permissionList.includes(username)) return true;

  // 检查用户组
  for (const perm of permissionList) {
    // 支持 group-xxx 和 team-xxx 前缀
    if (perm.startsWith("group-") || perm.startsWith("team-")) {
      const groupName = perm.replace(/^(group-|team-)/, "");
      // 检查用户是否属于该用户组
      // 支持多种用户组数据结构
      const belongsToGroup = userGroups.value.some((g) => {
        if (typeof g === "string") {
          return g === groupName || g === perm;
        }
        return (
          g.name === groupName ||
          g.name === perm ||
          g.id?.toString() === groupName
        );
      });
      if (belongsToGroup) {
        return true;
      }
    }
  }

  return false;
};

// 读取权限 - 基于页面的permissions.read字段
const canRead = computed(() => {
  if (isSuperuser.value) return true;
  if (!currentPage.value) return true;

  const permissions = currentPage.value.permissions;
  if (!permissions || !permissions.read || permissions.read.length === 0) {
    return true; // 没有设置权限时默认可读
  }

  return checkUserInPermissionList(permissions.read);
});

// 权限计算
const canCreate = computed(() => {
  if (!isAuthenticated.value) return false;
  if (isAdmin.value) return true;
  return userPermissions.value?.can_create_wiki ?? true;
});

const canEdit = computed(() => {
  if (!isAuthenticated.value) return false;
  if (isSuperuser.value) return true;
  if (!currentPage.value) return false;

  // 创建者可以编辑
  if (currentPage.value.created_by === currentUser.value?.username) return true;

  // 管理员可以编辑
  if (isAdmin.value) return true;

  // 检查页面的编辑权限
  const permissions = currentPage.value.permissions;
  if (permissions && permissions.edit && permissions.edit.length > 0) {
    return checkUserInPermissionList(permissions.edit);
  }

  return userPermissions.value?.can_edit_wiki ?? false;
});

const canDelete = computed(() => {
  if (!isAuthenticated.value) return false;
  if (isSuperuser.value) return true;
  if (!currentPage.value) return false;
  // 创建者可以删除自己的页面
  if (currentPage.value.created_by === currentUser.value?.username) return true;
  return false;
});

const canComment = computed(() => {
  return isAuthenticated.value && canRead.value;
});

// 是否可以管理权限（创建者或管理员）
const canManagePermission = computed(() => {
  if (!isAuthenticated.value) return false;
  if (isSuperuser.value || isAdmin.value) return true;
  if (!currentPage.value) return false;
  return currentPage.value.created_by === currentUser.value?.username;
});

// 用户角色显示
const userRoleText = computed(() => {
  if (isSuperuser.value) return "超级管理员";
  if (isAdmin.value) return "管理员";
  return "用户";
});

const userRoleColor = computed(() => {
  if (isSuperuser.value) return "error";
  if (isAdmin.value) return "warning";
  return "primary";
});

const userRoleIcon = computed(() => {
  if (isSuperuser.value) return "mdi-shield-crown";
  if (isAdmin.value) return "mdi-shield-account";
  return "mdi-account";
});

// 加载用户权限
const loadUserPermissions = async (forceRefresh = false) => {
  if (!isAuthenticated.value) return;

  if (!forceRefresh) {
    const cached = getCachedData(PERMISSIONS_CACHE_KEY);
    if (cached) {
      userPermissions.value = cached.permissions;
      userGroups.value = cached.groups;
      return;
    }
  }

  try {
    const data = await AuthAPI.getPermissions();
    userPermissions.value = data;
    // 提取用户所属的用户组
    if (data.groups) {
      userGroups.value = Array.isArray(data.groups) ? data.groups : [];
    } else if (data.user?.groups) {
      userGroups.value = Array.isArray(data.user.groups)
        ? data.user.groups
        : [];
    } else {
      userGroups.value = currentUser.value?.groups || [];
    }
    // 缓存权限和用户组
    setCachedData(PERMISSIONS_CACHE_KEY, {
      permissions: data,
      groups: userGroups.value,
    });
  } catch (error) {
    console.error("加载用户权限失败:", error);
  }
};

// 加载所有用户组
const loadAllGroups = async (forceRefresh = false) => {
  if (!forceRefresh) {
    const cached = getCachedData(GROUPS_CACHE_KEY);
    if (cached) {
      allGroups.value = cached;
      return;
    }
  }
  try {
    const data = await AuthAPI.getGroups();
    allGroups.value = data.groups || [];
    setCachedData(GROUPS_CACHE_KEY, allGroups.value);
  } catch (error) {
    console.error("加载用户组列表失败:", error);
  }
};

// 格式化权限显示
const formatPermissionDisplay = (permissions) => {
  if (!permissions || permissions.length === 0) return "无限制";
  if (permissions.includes("all")) return "所有人";
  if (permissions.length > 2) {
    return `${permissions.slice(0, 2).join(", ")} 等${permissions.length}项`;
  }
  return permissions.join(", ");
};

// 权限检查辅助函数
const checkPermission = (action, showMessage = true) => {
  if (!isAuthenticated.value) {
    if (showMessage) {
      authMessage.value = "请先登录后再操作";
      showAuthSnackbar.value = true;
    }
    return false;
  }

  let hasPermission = false;
  switch (action) {
    case "create":
      hasPermission = canCreate.value;
      break;
    case "edit":
      hasPermission = canEdit.value;
      break;
    case "delete":
      hasPermission = canDelete.value;
      break;
    default:
      hasPermission = true;
  }

  if (!hasPermission && showMessage) {
    authMessage.value = "您没有执行此操作的权限";
    showAuthSnackbar.value = true;
  }

  return hasPermission;
};

// ========== 基础状态 ==========
const railMode = ref(false);
const loading = ref(false);
const searchQuery = ref("");
const sidebarTab = ref("tree");
const showToc = ref(true);

// 页面数据
const pageTree = ref([]);
const currentPage = ref(null);
const currentPageId = ref(null);
const breadcrumbs = ref([]);
const recentPages = ref([]);
const favoritePages = ref([]);

// 对话框
const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const showTagsDialog = ref(false);
const showHistoryDialog = ref(false);
const showMoveDialog = ref(false);
const showPermissionDialog = ref(false);

// 编辑
const editingPage = ref(null);
const createParentId = ref(null);

// ========== 计算属性 ==========
const renderedContent = computed(() => {
  if (!currentPage.value?.content) return "";
  return marked(currentPage.value.content);
});

const totalPages = computed(() => {
  const count = (pages) =>
    pages.reduce((acc, p) => acc + 1 + (p.children ? count(p.children) : 0), 0);
  return count(pageTree.value);
});

const wordCount = computed(() => currentPage.value?.content?.length || 0);

// ========== 收藏功能 ==========
const isFavorite = (pageId) => favoritePages.value.some((p) => p.id === pageId);

const toggleFavorite = (pageId) => {
  const index = favoritePages.value.findIndex((p) => p.id === pageId);
  if (index > -1) {
    favoritePages.value.splice(index, 1);
  } else if (currentPage.value?.id === pageId) {
    favoritePages.value.push({
      id: currentPage.value.id,
      title: currentPage.value.title,
    });
  }
  localStorage.setItem("wiki_favorites", JSON.stringify(favoritePages.value));
};

const loadFavorites = () => {
  try {
    favoritePages.value = JSON.parse(
      localStorage.getItem("wiki_favorites") || "[]"
    );
  } catch {
    favoritePages.value = [];
  }
};

// ========== 最近访问 ==========
const addToRecent = (page) => {
  const idx = recentPages.value.findIndex((p) => p.id === page.id);
  if (idx > -1) recentPages.value.splice(idx, 1);
  recentPages.value.unshift({
    id: page.id,
    title: page.title,
    visited_at: new Date().toISOString(),
  });
  if (recentPages.value.length > 15)
    recentPages.value = recentPages.value.slice(0, 15);
  localStorage.setItem("wiki_recent", JSON.stringify(recentPages.value));
};

const loadRecent = () => {
  try {
    recentPages.value = JSON.parse(localStorage.getItem("wiki_recent") || "[]");
  } catch {
    recentPages.value = [];
  }
};

// ========== 目录生成 ==========
const generateTOC = async () => {
  await nextTick();
  const content = document.querySelector(".markdown-content");
  const toc = document.getElementById("toc-content");
  if (!content || !toc) return;

  const headings = content.querySelectorAll("h1, h2, h3");
  if (!headings.length) {
    toc.innerHTML = '<p class="text-caption text-medium-emphasis">暂无目录</p>';
    return;
  }

  let html = '<ul class="toc-list">';
  headings.forEach((h, i) => {
    const level = parseInt(h.tagName[1]);
    const id = `h-${i}`;
    h.id = id;
    html += `<li style="padding-left:${
      (level - 1) * 10
    }px"><a href="#${id}" class="toc-link">${h.textContent}</a></li>`;
  });
  html += "</ul>";
  toc.innerHTML = html;

  toc.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      document
        .getElementById(a.getAttribute("href").slice(1))
        ?.scrollIntoView({ behavior: "smooth" });
    });
  });
};

// ========== 页面操作 ==========
const loadPageTree = async (forceRefresh = false) => {
  if (!forceRefresh) {
    const cached = getCachedData(TREE_CACHE_KEY);
    if (cached) {
      pageTree.value = cached;
      return;
    }
  }
  try {
    const res = await WikiAPI.getPageTree();
    pageTree.value = res.data.tree || [];
    setCachedData(TREE_CACHE_KEY, pageTree.value);
  } catch (e) {
    console.error("加载页面树失败:", e);
    pageTree.value = [];
  }
};

const refreshPageTree = async () => {
  clearCache(TREE_CACHE_KEY);
  await loadPageTree(true);
};

const loadPage = async (id) => {
  if (!id) {
    currentPage.value = null;
    currentPageId.value = null;
    breadcrumbs.value = [];
    return;
  }

  loading.value = true;
  try {
    const [pageRes, crumbRes] = await Promise.all([
      WikiAPI.getPage(id),
      WikiAPI.getPageBreadcrumb(id),
    ]);

    currentPage.value = pageRes.data;
    currentPageId.value = id;
    addToRecent(pageRes.data);

    breadcrumbs.value = [
      { title: "首页", disabled: false, onClick: () => navigateToHome() },
      ...crumbRes.data.breadcrumb.map((item, i, arr) => ({
        title: item.title,
        disabled: i === arr.length - 1,
        onClick: i < arr.length - 1 ? () => navigateToPage(item.id) : undefined,
      })),
    ];

    await nextTick();
    generateTOC();
  } catch (e) {
    console.error("加载页面失败:", e);
    currentPage.value = null;
  } finally {
    loading.value = false;
  }
};

const navigateToPage = (id) => router.push(`/wiki/${id}`);
const navigateToHome = () => router.push("/wiki");

const createChildPage = (parentId) => {
  if (!checkPermission("create")) return;
  createParentId.value = parentId;
  showCreateDialog.value = true;
};

const editPage = (page) => {
  if (!checkPermission("edit")) return;
  editingPage.value = page;
  showEditDialog.value = true;
};

const editCurrentPage = () => {
  if (!checkPermission("edit")) return;
  if (currentPage.value) {
    editingPage.value = currentPage.value;
    showEditDialog.value = true;
  }
};

const deleteCurrentPage = () => {
  if (!checkPermission("delete")) return;
  if (currentPage.value) deletePage(currentPage.value);
};

const deletePage = async (page) => {
  if (!checkPermission("delete")) return;
  if (!confirm(`确定要删除"${page.title}"吗？`)) return;

  try {
    await WikiAPI.deletePage(page.id);
    await refreshPageTree();
    if (currentPageId.value === page.id) navigateToHome();
  } catch (e) {
    console.error("删除失败:", e);
    alert("删除失败");
  }
};

const movePage = () => {
  if (!checkPermission("edit")) return;
  showMoveDialog.value = true;
};

const sharePage = () => {
  if (!currentPage.value) return;
  const url = `${window.location.origin}/wiki/${currentPage.value.id}`;
  navigator.clipboard
    .writeText(url)
    .then(() => alert("链接已复制"))
    .catch(() => alert(`链接：${url}`));
};

const performSearch = () => {
  router.push(
    searchQuery.value.trim()
      ? `/wiki/search?q=${encodeURIComponent(searchQuery.value)}`
      : "/wiki/search"
  );
};

const searchByTag = (tag) =>
  router.push(`/wiki/search?tags=${encodeURIComponent(tag)}`);

// ========== 格式化 ==========
const formatDate = (d) => new Date(d).toLocaleDateString("zh-CN");

const formatRelativeTime = (d) => {
  const diff = Date.now() - new Date(d);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins}分钟前`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 24) return `${hrs}小时前`;
  const days = Math.floor(diff / 86400000);
  if (days < 7) return `${days}天前`;
  return formatDate(d);
};

// ========== 事件处理 ==========
const onPageCreated = (page) => {
  refreshPageTree();
  navigateToPage(page.id);
};

const onPageUpdated = (page) => {
  refreshPageTree();
  if (currentPageId.value === page.id) {
    currentPage.value = page;
    nextTick(() => generateTOC());
  }
};

const onPageMoved = () => {
  refreshPageTree();
  if (currentPageId.value) loadPage(currentPageId.value);
};

const onPermissionUpdated = () => {
  // 权限更新后重新加载页面
  if (currentPageId.value) loadPage(currentPageId.value);
};

// ========== 监听与挂载 ==========
watch(
  () => route.params.id,
  (id, oldId) => {
    // 只有当 id 变化时才加载
    if (id !== oldId) {
      loadPage(id);
    }
  }
);
watch(renderedContent, () => nextTick(() => generateTOC()));
watch(isAuthenticated, (val) => {
  if (val) loadUserPermissions();
});

onMounted(async () => {
  // 所有函数内部都有缓存机制，避免重复请求
  await Promise.all([
    loadPageTree(),
    loadAllGroups(),
    isAuthenticated.value ? loadUserPermissions() : Promise.resolve(),
  ]);
  loadRecent();
  loadFavorites();
  // 加载当前页面
  if (route.params.id) {
    loadPage(route.params.id);
  }
});
</script>

<style scoped>
/* 布局 */
.wiki-layout {
  display: flex;
  height: calc(100vh - 64px);
  background: #fafafa;
}

.wiki-sidebar {
  border-right: 1px solid #e0e0e0;
  background: #fff !important;
}

.sidebar-header {
  border-bottom: 1px solid #e0e0e0;
  background: #fafafa;
}

.sidebar-content {
  height: calc(100vh - 260px);
  overflow-y: auto;
}

.sidebar-content::-webkit-scrollbar {
  width: 4px;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 2px;
}

/* 目录树容器 */
.wiki-tree-container {
  padding: 4px !important;
}

/* 主内容 */
.wiki-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.wiki-toolbar {
  display: flex;
  align-items: center;
  height: 48px;
  border-bottom: 1px solid #e0e0e0;
  background: #fff;
  padding: 0 12px;
  flex-shrink: 0;
}

.wiki-content-area {
  flex: 1;
  overflow-y: auto;
  padding: 0 !important;
}

.wiki-container {
  width: 100%;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  padding: 32px 40px;
  box-sizing: border-box;
}

.page-detail {
  width: 100%;
}

.page-content-wrapper {
  max-width: 100%;
}

/* 欢迎页 */
.welcome-section {
  max-width: 600px;
  margin: 40px auto;
  text-align: center;
}

.quick-card {
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.quick-card:hover {
  transform: translateY(-2px);
}

.stat-item {
  display: flex;
  align-items: baseline;
}

/* 页面详情 */
.page-detail {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-header {
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.3;
}

.content-card {
  background: #fff;
  padding: 32px;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #888;
}

.meta-item .v-icon {
  color: #aaa;
}

/* 目录 */
.toc-card {
  position: sticky;
  top: 16px;
}

.toc-body {
  max-height: 300px;
  overflow-y: auto;
}

.toc-body::-webkit-scrollbar {
  width: 3px;
}

.toc-body::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 2px;
}

:deep(.toc-list) {
  list-style: none;
  padding: 0;
  margin: 0;
}

:deep(.toc-link) {
  display: block;
  padding: 4px 8px;
  font-size: 0.75rem;
  color: #666;
  text-decoration: none;
  border-radius: 4px;
  transition: background 0.2s, color 0.2s;
}

:deep(.toc-link:hover) {
  background: rgba(var(--v-theme-primary), 0.08);
  color: rgb(var(--v-theme-primary));
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
}

/* Markdown */
.markdown-content {
  line-height: 1.8;
  font-size: 15px;
  color: #333;
}

.markdown-content :deep(h1) {
  font-size: 24px;
  font-weight: 600;
  margin: 32px 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.markdown-content :deep(h2) {
  font-size: 20px;
  font-weight: 600;
  margin: 28px 0 12px;
  padding-left: 12px;
  border-left: 3px solid rgb(var(--v-theme-primary));
}

.markdown-content :deep(h3) {
  font-size: 17px;
  font-weight: 600;
  margin: 24px 0 10px;
}

.markdown-content :deep(p) {
  margin-bottom: 16px;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 16px 0;
  padding-left: 24px;
}

.markdown-content :deep(li) {
  margin-bottom: 0.375rem;
}

.markdown-content :deep(code) {
  background: #f5f5f5;
  color: #e53935;
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  font-size: 0.875em;
}

.markdown-content :deep(pre) {
  background: #282c34;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1rem 0;
}

.markdown-content :deep(pre code) {
  background: none;
  color: #abb2bf;
  padding: 0;
}

.markdown-content :deep(blockquote) {
  border-left: 3px solid #e0e0e0;
  padding-left: 1rem;
  margin: 1rem 0;
  color: #666;
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid #e0e0e0;
  padding: 0.5rem;
}

.markdown-content :deep(th) {
  background: #f5f5f5;
}

.markdown-content :deep(img) {
  max-width: 100%;
  border-radius: 4px;
}

.markdown-content :deep(a) {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

/* 响应式 */
@media (max-width: 960px) {
  .wiki-container {
    padding: 12px;
  }

  .welcome-section {
    margin: 20px auto;
  }
}

@media (max-width: 600px) {
  .meta-info {
    gap: 8px;
  }

  .stat-item {
    flex-direction: column;
    align-items: center;
  }
}
</style>

<route>
{
  name: 'wiki',
  path: '/wiki/:id?',
  meta: {
    requiresAuth: false,
    layout: 'default',
    title: 'Wiki 知识库'
  }
}
</route>
