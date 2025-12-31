<template>
  <div class="tree-item">
    <!-- 节点本身 -->
    <div
      class="tree-node"
      :class="{ 'is-active': currentPageId === page.id }"
      @click="handleClick"
    >
      <!-- 展开/折叠图标 -->
      <v-icon
        v-if="hasChildren"
        size="16"
        class="expand-icon"
        :class="{ 'is-expanded': isExpanded }"
        @click.stop="toggleExpand"
      >
        mdi-chevron-right
      </v-icon>
      <span v-else class="expand-placeholder"></span>

      <!-- 标题 -->
      <span class="node-title" :title="page.title">{{ page.title }}</span>

      <!-- 子节点数量 -->
      <span v-if="childrenCount > 0" class="node-count">{{
        childrenCount
      }}</span>

      <!-- 操作菜单 -->
      <div class="node-actions">
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              icon="mdi-dots-horizontal"
              size="x-small"
              variant="text"
              density="compact"
              v-bind="props"
              @click.stop
            />
          </template>
          <v-list density="compact" min-width="120">
            <v-list-item
              density="compact"
              @click.stop="$emit('create-child', page.id)"
            >
              <template v-slot:prepend>
                <v-icon size="16">mdi-plus</v-icon>
              </template>
              <v-list-item-title class="text-body-2"
                >添加子页面</v-list-item-title
              >
            </v-list-item>
            <v-list-item density="compact" @click.stop="$emit('edit', page)">
              <template v-slot:prepend>
                <v-icon size="16">mdi-pencil</v-icon>
              </template>
              <v-list-item-title class="text-body-2">编辑</v-list-item-title>
            </v-list-item>
            <v-divider class="my-1" />
            <v-list-item
              density="compact"
              @click.stop="$emit('delete', page)"
              class="text-error"
            >
              <template v-slot:prepend>
                <v-icon size="16">mdi-delete</v-icon>
              </template>
              <v-list-item-title class="text-body-2">删除</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </div>

    <!-- 子节点 -->
    <div v-if="hasChildren && isExpanded" class="tree-children">
      <wiki-tree-item
        v-for="child in page.children"
        :key="child.id"
        :page="child"
        :current-page-id="currentPageId"
        :depth="depth + 1"
        @navigate="$emit('navigate', $event)"
        @create-child="$emit('create-child', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  page: {
    type: Object,
    required: true,
  },
  currentPageId: {
    type: [String, Number],
    default: null,
  },
  depth: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["navigate", "create-child", "edit", "delete"]);

const isExpanded = ref(false);

// 判断是否有子节点 - 兼容 has_children 字段和 children 数组
const hasChildren = computed(() => {
  return (
    props.page.has_children ||
    (props.page.children && props.page.children.length > 0)
  );
});

// 子节点数量
const childrenCount = computed(() => {
  return props.page.children?.length || 0;
});

// 当前页面或子页面被选中时自动展开
watch(
  () => props.currentPageId,
  (newId) => {
    if (newId && hasChildren.value) {
      const containsPage = (node) => {
        if (node.id === newId) return true;
        if (node.children) {
          return node.children.some(containsPage);
        }
        return false;
      };
      if (containsPage(props.page)) {
        isExpanded.value = true;
      }
    }
  },
  { immediate: true }
);

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const handleClick = () => {
  emit("navigate", props.page.id);
};
</script>

<style scoped>
.tree-item {
  user-select: none;
}

.tree-node {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
  margin: 1px 0;
  gap: 4px;
}

.tree-node:hover {
  background: rgba(0, 0, 0, 0.04);
}

.tree-node.is-active {
  background: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
}

.tree-node.is-active .node-title {
  font-weight: 500;
}

.expand-icon {
  flex-shrink: 0;
  transition: transform 0.2s ease;
  color: #999;
}

.expand-icon.is-expanded {
  transform: rotate(90deg);
}

.tree-node.is-active .expand-icon {
  color: rgb(var(--v-theme-primary));
}

.expand-placeholder {
  width: 16px;
  flex-shrink: 0;
}

.node-title {
  flex: 1;
  font-size: 13px;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.node-count {
  flex-shrink: 0;
  font-size: 11px;
  color: #999;
  background: rgba(0, 0, 0, 0.06);
  padding: 0 6px;
  border-radius: 10px;
  line-height: 18px;
}

.node-actions {
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.15s;
}

.tree-node:hover .node-actions {
  opacity: 1;
}

.tree-children {
  padding-left: 12px;
  margin-left: 7px;
  border-left: 1px solid rgba(0, 0, 0, 0.08);
}
</style>
