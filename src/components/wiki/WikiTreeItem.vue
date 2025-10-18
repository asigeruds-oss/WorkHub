<template>
  <div>
    <!-- 当前页面项 -->
    <v-list-group
      v-if="page.has_children"
      :value="page.id"
      :class="{ 'current-page': currentPageId === page.id }"
    >
      <template v-slot:activator="{ props }">
        <v-list-item
          v-bind="props"
          :title="page.title"
          :prepend-icon="page.has_children ? 'mdi-folder' : 'mdi-file-document-outline'"
          :active="currentPageId === page.id"
          @click="$emit('navigate', page.id)"
        >
          <template v-slot:append>
            <v-menu>
              <template v-slot:activator="{ props: menuProps }">
                <v-btn
                  icon="mdi-dots-vertical"
                  size="x-small"
                  variant="text"
                  v-bind="menuProps"
                  @click.stop
                />
              </template>
              <v-list density="compact">
                <v-list-item @click="$emit('create-child', page.id)">
                  <template v-slot:prepend>
                    <v-icon size="small">mdi-plus</v-icon>
                  </template>
                  <v-list-item-title>添加子页面</v-list-item-title>
                </v-list-item>
                <v-list-item @click="$emit('edit', page)">
                  <template v-slot:prepend>
                    <v-icon size="small">mdi-pencil</v-icon>
                  </template>
                  <v-list-item-title>编辑</v-list-item-title>
                </v-list-item>
                <v-list-item @click="$emit('delete', page)" class="text-error">
                  <template v-slot:prepend>
                    <v-icon size="small">mdi-delete</v-icon>
                  </template>
                  <v-list-item-title>删除</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </v-list-item>
      </template>
      
      <!-- 子页面 -->
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
    </v-list-group>
    
    <!-- 叶子节点 -->
    <v-list-item
      v-else
      :title="page.title"
      :prepend-icon="'mdi-file-document-outline'"
      :active="currentPageId === page.id"
      :class="{ 'current-page': currentPageId === page.id }"
      @click="$emit('navigate', page.id)"
    >
      <template v-slot:append>
        <v-menu>
          <template v-slot:activator="{ props: menuProps }">
            <v-btn
              icon="mdi-dots-vertical"
              size="x-small"
              variant="text"
              v-bind="menuProps"
              @click.stop
            />
          </template>
          <v-list density="compact">
            <v-list-item @click="$emit('create-child', page.id)">
              <template v-slot:prepend>
                <v-icon size="small">mdi-plus</v-icon>
              </template>
              <v-list-item-title>添加子页面</v-list-item-title>
            </v-list-item>
            <v-list-item @click="$emit('edit', page)">
              <template v-slot:prepend>
                <v-icon size="small">mdi-pencil</v-icon>
              </template>
              <v-list-item-title>编辑</v-list-item-title>
            </v-list-item>
            <v-list-item @click="$emit('delete', page)" class="text-error">
              <template v-slot:prepend>
                <v-icon size="small">mdi-delete</v-icon>
              </template>
              <v-list-item-title>删除</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </v-list-item>
  </div>
</template>

<script setup>
defineProps({
  page: {
    type: Object,
    required: true
  },
  currentPageId: {
    type: [String, Number],
    default: null
  },
  depth: {
    type: Number,
    default: 0
  }
})

defineEmits(['navigate', 'create-child', 'edit', 'delete'])
</script>

<style scoped>
.current-page {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.v-list-item {
  padding-left: calc(16px + var(--depth, 0) * 16px);
}
</style>
