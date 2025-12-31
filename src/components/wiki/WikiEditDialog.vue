<template>
  <v-dialog v-model="localValue" fullscreen persistent scrollable>
    <v-card v-if="page" class="edit-dialog-card">
      <!-- 固定顶部工具栏 -->
      <v-toolbar flat density="compact" class="edit-dialog-header">
        <v-icon class="ml-4 mr-2">mdi-pencil</v-icon>
        <v-toolbar-title class="text-subtitle-1">编辑页面</v-toolbar-title>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" @click="cancel" />
      </v-toolbar>

      <v-divider />

      <v-card-text class="pa-0 edit-content">
        <v-row class="ma-0">
          <!-- 左侧编辑区 -->
          <v-col cols="12" md="8" class="pa-4 edit-panel">
            <v-form ref="form" v-model="valid" class="edit-form">
              <!-- 页面标题 -->
              <v-text-field
                v-model="pageData.title"
                label="页面标题"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                class="mb-3"
                prepend-inner-icon="mdi-file-document-outline"
              />

              <!-- 标签 -->
              <v-combobox
                v-model="pageData.tags"
                :items="availableTags"
                label="标签"
                variant="outlined"
                density="compact"
                multiple
                chips
                closable-chips
                class="mb-4"
                prepend-inner-icon="mdi-tag-multiple"
              />

              <!-- 编辑器工具栏 -->
              <v-card variant="outlined" class="editor-toolbar mb-2">
                <v-card-text class="pa-2">
                  <v-btn-group density="compact" variant="text">
                    <v-tooltip text="粗体">
                      <template v-slot:activator="{ props }">
                        <v-btn
                          v-bind="props"
                          @click="insertMarkdown('**', '**')"
                        >
                          <v-icon>mdi-format-bold</v-icon>
                        </v-btn>
                      </template>
                    </v-tooltip>
                    <v-tooltip text="斜体">
                      <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" @click="insertMarkdown('*', '*')">
                          <v-icon>mdi-format-italic</v-icon>
                        </v-btn>
                      </template>
                    </v-tooltip>
                    <v-tooltip text="代码">
                      <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" @click="insertMarkdown('`', '`')">
                          <v-icon>mdi-code-tags</v-icon>
                        </v-btn>
                      </template>
                    </v-tooltip>
                    <v-divider vertical class="mx-1" />
                    <v-tooltip text="一级标题">
                      <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" @click="insertMarkdown('# ', '')">
                          <v-icon>mdi-format-header-1</v-icon>
                        </v-btn>
                      </template>
                    </v-tooltip>
                    <v-tooltip text="二级标题">
                      <template v-slot:activator="{ props }">
                        <v-btn
                          v-bind="props"
                          @click="insertMarkdown('## ', '')"
                        >
                          <v-icon>mdi-format-header-2</v-icon>
                        </v-btn>
                      </template>
                    </v-tooltip>
                    <v-divider vertical class="mx-1" />
                    <v-tooltip text="无序列表">
                      <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" @click="insertMarkdown('- ', '')">
                          <v-icon>mdi-format-list-bulleted</v-icon>
                        </v-btn>
                      </template>
                    </v-tooltip>
                    <v-tooltip text="有序列表">
                      <template v-slot:activator="{ props }">
                        <v-btn
                          v-bind="props"
                          @click="insertMarkdown('1. ', '')"
                        >
                          <v-icon>mdi-format-list-numbered</v-icon>
                        </v-btn>
                      </template>
                    </v-tooltip>
                    <v-divider vertical class="mx-1" />
                    <v-tooltip text="链接">
                      <template v-slot:activator="{ props }">
                        <v-btn
                          v-bind="props"
                          @click="insertMarkdown('[', '](url)')"
                        >
                          <v-icon>mdi-link</v-icon>
                        </v-btn>
                      </template>
                    </v-tooltip>
                    <v-tooltip text="引用">
                      <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" @click="insertMarkdown('> ', '')">
                          <v-icon>mdi-format-quote-open</v-icon>
                        </v-btn>
                      </template>
                    </v-tooltip>
                  </v-btn-group>

                  <v-spacer />

                  <span class="text-caption text-medium-emphasis mr-2">
                    {{ contentLength }} 字
                  </span>

                  <v-btn-toggle
                    v-model="editorMode"
                    density="compact"
                    variant="outlined"
                  >
                    <v-btn value="edit">编辑</v-btn>
                    <v-btn value="preview">预览</v-btn>
                  </v-btn-toggle>
                </v-card-text>
              </v-card>

              <!-- 编辑区域 -->
              <v-textarea
                v-if="editorMode === 'edit'"
                ref="contentEditor"
                v-model="pageData.content"
                variant="outlined"
                rows="16"
                auto-grow
                :rules="[rules.required]"
                hide-details
                class="content-editor"
              />

              <!-- 预览区域 -->
              <v-card
                v-else
                variant="outlined"
                class="preview-area"
                min-height="480"
              >
                <v-card-text class="pa-4">
                  <div
                    v-if="pageData.content.trim()"
                    class="markdown-preview"
                    v-html="previewContent"
                  />
                  <div v-else class="text-center text-medium-emphasis py-12">
                    <v-icon size="48" class="mb-2">mdi-eye-outline</v-icon>
                    <p>预览内容将在这里显示</p>
                  </div>
                </v-card-text>
              </v-card>

              <!-- 修改说明 -->
              <v-text-field
                v-model="pageData.comment"
                label="修改说明（可选）"
                variant="outlined"
                density="compact"
                placeholder="描述本次修改的内容..."
                class="mt-4"
                prepend-inner-icon="mdi-note-outline"
              />
            </v-form>
          </v-col>

          <!-- 右侧信息面板 -->
          <v-col cols="12" md="4" class="pa-4 info-panel">
            <!-- 权限设置 -->
            <v-card class="mb-4" elevation="1">
              <v-card-title class="text-subtitle-2 py-2">
                <v-icon size="18" class="mr-1">mdi-shield-outline</v-icon>
                权限设置
              </v-card-title>
              <v-divider />
              <v-card-text class="pa-3">
                <div class="mb-3">
                  <label class="text-caption font-weight-bold mb-1 d-block">
                    读取权限
                  </label>
                  <v-chip-group
                    v-model="pageData.permissions.read"
                    multiple
                    column
                  >
                    <v-chip
                      v-for="opt in permissionOptions"
                      :key="opt.value"
                      :value="opt.value"
                      size="small"
                      :color="getPermissionColor(opt.value)"
                    >
                      <v-icon start size="12">{{
                        getPermissionIcon(opt.value)
                      }}</v-icon>
                      {{ opt.title }}
                    </v-chip>
                  </v-chip-group>
                </div>
                <div class="mb-3">
                  <label class="text-caption font-weight-bold mb-1 d-block">
                    编辑权限
                  </label>
                  <v-chip-group
                    v-model="pageData.permissions.edit"
                    multiple
                    column
                  >
                    <v-chip
                      v-for="opt in permissionOptions"
                      :key="opt.value"
                      :value="opt.value"
                      size="small"
                      :color="getPermissionColor(opt.value)"
                    >
                      <v-icon start size="12">{{
                        getPermissionIcon(opt.value)
                      }}</v-icon>
                      {{ opt.title }}
                    </v-chip>
                  </v-chip-group>
                </div>
                <!-- 快速设置 -->
                <div class="text-caption text-medium-emphasis mb-2">
                  快速设置
                </div>
                <div class="d-flex flex-wrap ga-2">
                  <v-btn
                    size="small"
                    variant="tonal"
                    @click="applyPermissionPreset('public')"
                  >
                    <v-icon size="16" class="mr-1">mdi-earth</v-icon>
                    公开可读
                  </v-btn>
                  <v-btn
                    size="small"
                    variant="tonal"
                    @click="applyPermissionPreset('team')"
                  >
                    <v-icon size="16" class="mr-1">mdi-account-group</v-icon>
                    团队协作
                  </v-btn>
                  <v-btn
                    size="small"
                    variant="tonal"
                    @click="applyPermissionPreset('private')"
                  >
                    <v-icon size="16" class="mr-1">mdi-lock</v-icon>
                    仅自己
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>

            <!-- 页面信息 -->
            <v-card elevation="1">
              <v-card-title class="text-subtitle-2 py-2">
                <v-icon size="18" class="mr-1">mdi-information-outline</v-icon>
                页面信息
              </v-card-title>
              <v-divider />
              <v-list density="compact" class="pa-0">
                <v-list-item class="text-caption">
                  <template v-slot:prepend>
                    <v-icon size="14">mdi-calendar</v-icon>
                  </template>
                  <div class="ml-2">
                    <div class="text-medium-emphasis">创建时间</div>
                    <div>{{ formatDate(page.created_at) }}</div>
                  </div>
                </v-list-item>
                <v-list-item class="text-caption">
                  <template v-slot:prepend>
                    <v-icon size="14">mdi-update</v-icon>
                  </template>
                  <div class="ml-2">
                    <div class="text-medium-emphasis">更新时间</div>
                    <div>{{ formatDate(page.updated_at) }}</div>
                  </div>
                </v-list-item>
                <v-list-item class="text-caption">
                  <template v-slot:prepend>
                    <v-icon size="14">mdi-version-check</v-icon>
                  </template>
                  <div class="ml-2">
                    <div class="text-medium-emphasis">版本</div>
                    <div>v{{ page.version }}</div>
                  </div>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn @click="cancel">取消</v-btn>
        <v-btn
          color="primary"
          @click="save"
          :disabled="!valid"
          :loading="saving"
        >
          保存修改
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { marked } from "marked";
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

// 状态
const form = ref(null);
const contentEditor = ref(null);
const valid = ref(false);
const saving = ref(false);
const editorMode = ref("edit");
const availableGroups = ref([]);

// 数据
const pageData = ref({
  title: "",
  content: "",
  tags: [],
  comment: "",
  permissions: {
    read: ["all"],
    edit: [],
  },
});

const availableTags = ref([]);

// 权限选项 - 动态生成
const permissionOptions = computed(() => {
  const options = [{ value: "all", title: "全部" }];
  // 从 API 获取的用户组
  availableGroups.value.forEach((group) => {
    options.push({ value: `team-${group.name}`, title: group.name });
  });
  return options;
});

// 加载用户组
const loadGroups = async () => {
  try {
    const data = await AuthAPI.getGroups();
    availableGroups.value = data.groups || [];
  } catch (error) {
    console.error("加载用户组失败:", error);
  }
};

// 获取权限图标
const getPermissionIcon = (permission) => {
  if (permission === "all") return "mdi-earth";
  if (permission.startsWith("group-") || permission.startsWith("team-"))
    return "mdi-account-group";
  return "mdi-account";
};

// 获取权限颜色
const getPermissionColor = (permission) => {
  if (permission === "all") return "success";
  if (permission.startsWith("group-") || permission.startsWith("team-"))
    return "primary";
  return "grey";
};

// 应用权限预设
const applyPermissionPreset = (preset) => {
  const currentUser = authStore.user?.username || "";
  switch (preset) {
    case "public":
      pageData.value.permissions.read = ["all"];
      pageData.value.permissions.edit = currentUser ? [currentUser] : [];
      break;
    case "private":
      pageData.value.permissions.read = currentUser ? [currentUser] : [];
      pageData.value.permissions.edit = currentUser ? [currentUser] : [];
      break;
    case "team":
      // 使用第一个可用的用户组
      if (availableGroups.value.length > 0) {
        const firstGroup = `team-${availableGroups.value[0].name}`;
        pageData.value.permissions.read = [firstGroup];
        pageData.value.permissions.edit = [firstGroup];
      } else {
        pageData.value.permissions.read = ["all"];
        pageData.value.permissions.edit = currentUser ? [currentUser] : [];
      }
      break;
  }
};

// 规则
const rules = {
  required: (value) => !!value || "此字段为必填项",
};

// 计算属性
const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const previewContent = computed(() => {
  if (!pageData.value.content.trim()) return "";
  return marked(pageData.value.content);
});

const contentLength = computed(() => {
  return pageData.value.content.length;
});

// 方法
const loadAvailableTags = async () => {
  try {
    const response = await WikiAPI.getTags();
    availableTags.value = response.data.map((tag) => tag.name) || [];
  } catch (error) {
    console.error("加载标签失败:", error);
    availableTags.value = [];
  }
};

const insertMarkdown = (before, after) => {
  if (!contentEditor.value) return;

  const textarea = contentEditor.value.$el.querySelector("textarea");
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = pageData.value.content.substring(start, end);

  const newText = before + selectedText + after;
  const newContent =
    pageData.value.content.substring(0, start) +
    newText +
    pageData.value.content.substring(end);

  pageData.value.content = newContent;

  // 设置新的光标位置
  setTimeout(() => {
    const newCursorPos = start + before.length + selectedText.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    textarea.focus();
  }, 0);
};

const save = async () => {
  if (!form.value.validate() || !props.page) return;

  saving.value = true;
  try {
    const data = {
      title: pageData.value.title.trim(),
      content: pageData.value.content.trim(),
      tags: pageData.value.tags,
      permissions: pageData.value.permissions,
    };

    if (pageData.value.comment.trim()) {
      data.comment = pageData.value.comment.trim();
    }

    const response = await WikiAPI.patchPage(props.page.id, data);
    emit("updated", response.data);
    localValue.value = false;
  } catch (error) {
    console.error("更新页面失败:", error);
    alert("更新页面失败，请稍后再试");
  } finally {
    saving.value = false;
  }
};

const cancel = () => {
  localValue.value = false;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("zh-CN");
};

const loadPageData = () => {
  if (props.page) {
    pageData.value = {
      title: props.page.title || "",
      content: props.page.content || "",
      tags: props.page.tags || [],
      comment: "",
      permissions: props.page.permissions || { read: ["all"], edit: [] },
    };
  }
};

// 监听
watch(() => props.page, loadPageData, { immediate: true });

watch(localValue, (newValue) => {
  if (newValue) {
    loadAvailableTags();
    loadGroups();
    loadPageData();
    editorMode.value = "edit";
  }
});
</script>

<style scoped>
.edit-dialog-card {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.edit-dialog-header {
  flex-shrink: 0;
  background: #fafafa !important;
}

.edit-content {
  flex: 1;
  overflow-y: auto;
  height: calc(100vh - 120px);
}

.edit-panel {
  border-right: 1px solid #e0e0e0;
  height: 100%;
  overflow-y: auto;
}

.info-panel {
  background: #fafafa;
  height: 100%;
  overflow-y: auto;
}

.edit-form {
  display: flex;
  flex-direction: column;
}

.editor-toolbar {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom: none;
}

.content-editor :deep(.v-field) {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  background: white;
}

.preview-area {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  background: white;
}

.markdown-preview {
  line-height: 1.7;
  font-size: 15px;
  color: #333;
}

.markdown-preview :deep(h1),
.markdown-preview :deep(h2),
.markdown-preview :deep(h3),
.markdown-preview :deep(h4),
.markdown-preview :deep(h5),
.markdown-preview :deep(h6) {
  margin: 1.5rem 0 0.75rem 0;
  font-weight: 600;
  color: #1a1a1a;
}

.markdown-preview :deep(p) {
  margin-bottom: 1rem;
  line-height: 1.8;
}

.markdown-preview :deep(ul),
.markdown-preview :deep(ol) {
  margin: 1rem 0;
  padding-left: 2rem;
}

.markdown-preview :deep(code) {
  background: #f5f5f5;
  color: #e53935;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  font-size: 0.9em;
}

.markdown-preview :deep(pre) {
  background: #2b2b2b;
  color: #f8f8f2;
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1.5em 0;
}

.markdown-preview :deep(pre code) {
  background: none;
  color: inherit;
  padding: 0;
}

.markdown-preview :deep(blockquote) {
  border-left: 4px solid #e0e0e0;
  padding-left: 1em;
  margin: 1em 0;
  color: #757575;
  font-style: italic;
}

/* 响应式 */
@media (max-width: 960px) {
  .edit-panel {
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }

  .info-panel {
    background: transparent;
    max-height: none;
  }
}
</style>
