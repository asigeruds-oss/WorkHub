<template>
  <v-dialog v-model="localValue" max-width="600" persistent>
    <v-card>
      <v-card-title class="d-flex align-center pa-4">
        <v-icon class="mr-2" color="primary">mdi-shield-lock</v-icon>
        <span>权限管理</span>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" size="small" @click="cancel" />
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4">
        <!-- 页面信息 -->
        <div class="page-info mb-4" v-if="page">
          <div class="info-label">页面</div>
          <div class="info-value">{{ page.title }}</div>
        </div>

        <!-- 权限说明 -->
        <v-alert type="info" density="compact" variant="tonal" class="mb-4">
          <div class="text-caption">
            <strong>权限说明：</strong>
            <ul class="mb-0 pl-4">
              <li><code>all</code> - 所有登录用户可访问</li>
              <li><code>team-xxx</code> - 指定用户组（从下方选择）</li>
              <li><code>用户名</code> - 指定用户</li>
            </ul>
          </div>
        </v-alert>

        <!-- 用户组快速选择 -->
        <div class="mb-4" v-if="availableGroups.length > 0">
          <div class="section-header mb-2">
            <v-icon size="18" color="primary" class="mr-2"
              >mdi-account-group</v-icon
            >
            <span class="section-title">快速添加用户组</span>
            <v-spacer />
            <v-btn-toggle
              v-model="selectedPermissionType"
              mandatory
              density="compact"
              variant="outlined"
              divided
              class="permission-type-toggle"
            >
              <v-btn value="read" size="x-small">
                <v-icon size="14" start>mdi-eye</v-icon>
                读取
              </v-btn>
              <v-btn value="edit" size="x-small">
                <v-icon size="14" start>mdi-pencil</v-icon>
                编辑
              </v-btn>
            </v-btn-toggle>
          </div>
          <div class="d-flex flex-wrap ga-1 mt-2">
            <v-chip
              v-for="group in availableGroups"
              :key="group.id"
              size="small"
              :variant="
                isGroupInSelectedPermission(group) ? 'flat' : 'outlined'
              "
              :color="
                isGroupInSelectedPermission(group) ? 'success' : 'primary'
              "
              @click="addGroupToPermission(group)"
              class="cursor-pointer"
            >
              <v-icon start size="14">{{
                isGroupInSelectedPermission(group) ? "mdi-check" : "mdi-plus"
              }}</v-icon>
              {{ group.name }}
            </v-chip>
          </div>
          <div class="text-caption text-medium-emphasis mt-1">
            点击用户组快速添加到
            <strong>{{
              selectedPermissionType === "read" ? "读取" : "编辑"
            }}</strong>
            权限列表
          </div>
        </div>

        <!-- 读取权限 -->
        <div class="permission-section mb-4">
          <div class="section-header">
            <v-icon size="18" color="success" class="mr-2">mdi-eye</v-icon>
            <span class="section-title">读取权限</span>
            <v-chip size="x-small" variant="tonal" color="success" class="ml-2">
              {{ readPermissions.length }} 项
            </v-chip>
          </div>
          <v-combobox
            v-model="readPermissions"
            :items="permissionSuggestions"
            label="可查看的用户/用户组"
            variant="outlined"
            density="compact"
            multiple
            chips
            closable-chips
            hide-details
            class="mt-2"
          >
            <template v-slot:chip="{ props, item }">
              <v-chip
                v-bind="props"
                :color="getPermissionChipColor(item.raw)"
                size="small"
                closable
              >
                <v-icon start size="14">{{
                  getPermissionIcon(item.raw)
                }}</v-icon>
                {{ formatPermissionLabel(item.raw) }}
              </v-chip>
            </template>
          </v-combobox>
          <div class="quick-add mt-2">
            <v-btn
              size="x-small"
              variant="tonal"
              @click="addReadPermission('all')"
              :disabled="readPermissions.includes('all')"
            >
              + 所有人
            </v-btn>
          </div>
        </div>

        <!-- 编辑权限 -->
        <div class="permission-section">
          <div class="section-header">
            <v-icon size="18" color="warning" class="mr-2">mdi-pencil</v-icon>
            <span class="section-title">编辑权限</span>
            <v-chip size="x-small" variant="tonal" color="warning" class="ml-2">
              {{ editPermissions.length }} 项
            </v-chip>
          </div>
          <v-combobox
            v-model="editPermissions"
            :items="permissionSuggestions"
            label="可编辑的用户/用户组"
            variant="outlined"
            density="compact"
            multiple
            chips
            closable-chips
            hide-details
            class="mt-2"
          >
            <template v-slot:chip="{ props, item }">
              <v-chip
                v-bind="props"
                :color="getPermissionChipColor(item.raw)"
                size="small"
                closable
              >
                <v-icon start size="14">{{
                  getPermissionIcon(item.raw)
                }}</v-icon>
                {{ formatPermissionLabel(item.raw) }}
              </v-chip>
            </template>
          </v-combobox>
          <div class="quick-add mt-2">
            <v-btn
              size="x-small"
              variant="tonal"
              @click="addEditPermission('all')"
              :disabled="editPermissions.includes('all')"
            >
              + 所有人
            </v-btn>
          </div>
        </div>

        <!-- 预设模板 -->
        <div class="preset-section mt-4">
          <div class="section-header mb-2">
            <v-icon size="18" color="primary" class="mr-2"
              >mdi-lightning-bolt</v-icon
            >
            <span class="section-title">快速设置</span>
          </div>
          <div class="preset-buttons">
            <v-btn
              size="small"
              variant="outlined"
              @click="applyPreset('public')"
              class="mr-2"
            >
              <v-icon start size="16">mdi-earth</v-icon>
              公开可读
            </v-btn>
            <v-btn
              size="small"
              variant="outlined"
              @click="applyPreset('private')"
              class="mr-2"
            >
              <v-icon start size="16">mdi-lock</v-icon>
              仅自己
            </v-btn>
            <v-btn size="small" variant="outlined" @click="applyPreset('team')">
              <v-icon start size="16">mdi-account-group</v-icon>
              团队协作
            </v-btn>
          </div>
        </div>

        <!-- 当前权限预览 -->
        <div class="preview-section mt-4">
          <div class="section-header mb-2">
            <v-icon size="18" color="grey" class="mr-2">mdi-eye-outline</v-icon>
            <span class="section-title">权限预览</span>
          </div>
          <v-card variant="outlined" class="pa-3">
            <pre class="preview-json">{{ permissionPreview }}</pre>
          </v-card>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" @click="cancel">取消</v-btn>
        <v-btn color="primary" @click="save" :loading="saving">
          保存权限
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import WikiAPI from "@/api/wiki";
import { AuthAPI } from "@/api/auth";
import { useAuthStore } from "@/stores/auth";

const props = defineProps({
  modelValue: Boolean,
  page: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue", "updated"]);

const authStore = useAuthStore();
const saving = ref(false);
const loading = ref(false);
const readPermissions = ref(["all"]);
const editPermissions = ref([]);
const availableGroups = ref([]);
const selectedPermissionType = ref("read"); // 'read' or 'edit'

// 权限建议列表 - 动态生成
const permissionSuggestions = computed(() => {
  const suggestions = ["all"];
  // 添加用户组
  availableGroups.value.forEach((group) => {
    suggestions.push(`team-${group.name}`);
  });
  return suggestions;
});

// 格式化权限标签显示
const formatPermissionLabel = (permission) => {
  if (permission === "all") return "全部";
  if (permission.startsWith("team-")) return permission.replace("team-", "");
  return permission;
};

// 加载用户组列表
const loadGroups = async () => {
  loading.value = true;
  try {
    const data = await AuthAPI.getGroups();
    availableGroups.value = data.groups || [];
  } catch (error) {
    console.error("加载用户组失败:", error);
  } finally {
    loading.value = false;
  }
};

// 添加用户组到权限
const addGroupToPermission = (group) => {
  const groupPerm = `team-${group.name}`;
  if (selectedPermissionType.value === "read") {
    if (!readPermissions.value.includes(groupPerm)) {
      readPermissions.value.push(groupPerm);
    }
  } else {
    if (!editPermissions.value.includes(groupPerm)) {
      editPermissions.value.push(groupPerm);
    }
  }
};

// 检查用户组是否在选中的权限列表中
const isGroupInSelectedPermission = (group) => {
  const groupPerm = `team-${group.name}`;
  if (selectedPermissionType.value === "read") {
    return readPermissions.value.includes(groupPerm);
  } else {
    return editPermissions.value.includes(groupPerm);
  }
};

const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const permissionPreview = computed(() => {
  return JSON.stringify(
    {
      read: readPermissions.value,
      edit: editPermissions.value,
    },
    null,
    2
  );
});

// 监听对话框打开
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      loadGroups();
    }
  }
);

// 监听页面变化，初始化权限
watch(
  () => props.page,
  (newPage) => {
    if (newPage) {
      if (newPage.permissions) {
        readPermissions.value = newPage.permissions.read || ["all"];
        editPermissions.value = newPage.permissions.edit || [];
      } else {
        readPermissions.value = ["all"];
        editPermissions.value = [
          newPage.created_by || authStore.user?.username,
        ];
      }
    }
  },
  { immediate: true }
);

// 获取权限图标
const getPermissionIcon = (permission) => {
  if (permission === "all") return "mdi-earth";
  if (permission.startsWith("group-") || permission.startsWith("team-"))
    return "mdi-account-group";
  return "mdi-account";
};

// 获取权限芯片颜色
const getPermissionChipColor = (permission) => {
  if (permission === "all") return "success";
  if (permission.startsWith("group-") || permission.startsWith("team-"))
    return "primary";
  return "grey";
};

// 添加读取权限
const addReadPermission = (permission) => {
  if (!readPermissions.value.includes(permission)) {
    readPermissions.value.push(permission);
  }
};

// 添加编辑权限
const addEditPermission = (permission) => {
  if (!editPermissions.value.includes(permission)) {
    editPermissions.value.push(permission);
  }
};

// 应用预设
const applyPreset = (preset) => {
  const currentUser = props.page?.created_by || authStore.user?.username || "";

  switch (preset) {
    case "public":
      readPermissions.value = ["all"];
      editPermissions.value = [currentUser];
      break;
    case "private":
      readPermissions.value = [currentUser];
      editPermissions.value = [currentUser];
      break;
    case "team":
      // 使用第一个可用的用户组，如果没有则使用默认值
      if (availableGroups.value.length > 0) {
        const firstGroup = `team-${availableGroups.value[0].name}`;
        readPermissions.value = [firstGroup];
        editPermissions.value = [firstGroup];
      } else {
        readPermissions.value = ["group-dev", "group-product"];
        editPermissions.value = ["group-dev"];
      }
      break;
  }
};

// 保存权限
const save = async () => {
  if (!props.page) return;

  saving.value = true;
  try {
    await WikiAPI.patchPage(props.page.id, {
      permissions: {
        read: readPermissions.value,
        edit: editPermissions.value,
      },
    });
    emit("updated");
    localValue.value = false;
  } catch (error) {
    console.error("保存权限失败:", error);
    alert("保存权限失败: " + (error.response?.data?.detail || error.message));
  } finally {
    saving.value = false;
  }
};

// 取消
const cancel = () => {
  localValue.value = false;
};
</script>

<style scoped>
.page-info {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
}

.info-label {
  font-size: 12px;
  color: #979ba5;
  margin-bottom: 4px;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: #313238;
}

.permission-section {
  background: #fafbfd;
  padding: 16px;
  border-radius: 4px;
  border: 1px solid #dcdee5;
}

.section-header {
  display: flex;
  align-items: center;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #313238;
}

.quick-add {
  display: flex;
  gap: 8px;
}

.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preview-json {
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 12px;
  color: #313238;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.permission-type-toggle {
  height: 28px !important;
}

.permission-type-toggle .v-btn {
  height: 28px !important;
  font-size: 12px;
}

.cursor-pointer {
  cursor: pointer;
  transition: all 0.2s ease;
}

.cursor-pointer:hover {
  transform: scale(1.05);
}

:deep(.v-combobox .v-chip) {
  margin: 2px;
}
</style>
