<template>
  <div>
    <!-- 当前页面项 -->
    <v-list-group
      v-if="page.has_children"
      :value="page.id"
      :class="{ 'current-page': currentPageId === page.id }"
      :style="{ '--depth': depth }"
    >
      <template v-slot:activator="{ props }">
        <v-list-item
          v-bind="props"
          :title="page.title"
          :active="currentPageId === page.id"
          @click="$emit('navigate', page.id)"
        >
          <template v-slot:prepend>
            <v-icon :color="currentPageId === page.id ? undefined : getIconColor" :icon="getFileIcon" />
          </template>
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
      :active="currentPageId === page.id"
      :class="{ 'current-page': currentPageId === page.id }"
      :style="{ '--depth': depth }"
      @click="$emit('navigate', page.id)"
    >
      <template v-slot:prepend>
        <v-icon :color="currentPageId === page.id ? undefined : getIconColor" :icon="getFileIcon" />
      </template>
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
import { computed } from 'vue';

const props = defineProps({
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

// 根据页面标题或路径确定图标和颜色
const getFileIcon = computed(() => {
  const title = props.page.title?.toLowerCase() || '';
  const path = props.page.path?.toLowerCase() || '';
  
  // 文件夹图标
  if (props.page.has_children) {
    if (title.includes('api') || path.includes('api')) return 'mdi-folder-cog-outline';
    if (title.includes('doc') || path.includes('doc')) return 'mdi-folder-text-outline';
    if (title.includes('image') || title.includes('图片') || path.includes('image')) return 'mdi-folder-image';
    if (title.includes('component') || title.includes('组件') || path.includes('component')) return 'mdi-folder-pound-outline';
    if (title.includes('guide') || title.includes('指南') || path.includes('guide')) return 'mdi-folder-information-outline';
    if (title.includes('setting') || title.includes('配置') || path.includes('config')) return 'mdi-folder-wrench-outline';
    if (title.includes('home') || title.includes('首页') || path.includes('home')) return 'mdi-folder-home-outline';
    
    // 默认文件夹图标
    return 'mdi-folder-outline';
  }
  
  // 文件图标
  if (title.includes('api') || path.includes('api')) return 'mdi-api';
  if (title.includes('config') || title.includes('配置') || path.includes('config')) return 'mdi-cog-outline';
  if (title.includes('readme') || title.includes('说明') || path.includes('readme')) return 'mdi-information-outline';
  if (title.includes('guide') || title.includes('指南') || path.includes('guide')) return 'mdi-book-open-page-variant-outline';
  if (title.includes('component') || title.includes('组件') || path.includes('component')) return 'mdi-view-dashboard-outline';
  if (title.includes('image') || title.includes('图片') || path.includes('image')) return 'mdi-image-outline';
  if (title.includes('chart') || title.includes('图表') || path.includes('chart')) return 'mdi-chart-line';
  if (title.includes('user') || title.includes('用户') || path.includes('user')) return 'mdi-account-outline';
  if (title.includes('home') || title.includes('首页') || path.includes('home')) return 'mdi-home-outline';
  if (title.includes('test') || title.includes('测试') || path.includes('test')) return 'mdi-test-tube-outline';
  
  // 默认文件图标
  return 'mdi-file-document-outline';
})

// 根据页面类型确定图标颜色
const getIconColor = computed(() => {
  const title = props.page.title?.toLowerCase() || '';
  const path = props.page.path?.toLowerCase() || '';
  
  // 文件夹和文件的颜色
  if (title.includes('api') || path.includes('api')) return '#7E57C2'; // 紫色
  if (title.includes('doc') || path.includes('doc') || title.includes('readme') || title.includes('说明')) return '#26A69A'; // 蓝绿色
  if (title.includes('image') || title.includes('图片') || path.includes('image')) return '#5C6BC0'; // 靛蓝色
  if (title.includes('component') || title.includes('组件')) return '#26C6DA'; // 青色
  if (title.includes('guide') || title.includes('指南')) return '#66BB6A'; // 绿色
  if (title.includes('config') || title.includes('配置') || title.includes('setting')) return '#FFA726'; // 橙色
  if (title.includes('chart') || title.includes('图表')) return '#EF5350'; // 红色
  if (title.includes('user') || title.includes('用户')) return '#EC407A'; // 粉红色
  if (title.includes('test') || title.includes('测试')) return '#8D6E63'; // 棕色
  if (title.includes('home') || title.includes('首页')) return '#42A5F5'; // 蓝色

  // 默认颜色基础
  const folderBaseColor = '#4FC3F7'; // 文件夹基础色：亮蓝色
  const fileBaseColor = '#81C784';   // 文件基础色：绿色
  
  // 如果没有匹配到特定类别，根据页面标题的首字母生成一个颜色
  if (props.page.title && props.page.title.length > 0) {
    const firstChar = props.page.title.charAt(0).toLowerCase();
    const charCode = firstChar.charCodeAt(0);
    
    // 根据首字母的字符码生成色相偏移
    const hueOffset = ((charCode % 26) / 26) * 60; // 0-60度的色相偏移
    
    if (props.page.has_children) {
      // 文件夹颜色 - 基于蓝色系，但根据首字母有变化
      const colorOptions = [
        '#29B6F6', '#03A9F4', '#039BE5', '#0288D1', 
        '#4FC3F7', '#00BCD4', '#26C6DA', '#80DEEA'
      ];
      return colorOptions[charCode % colorOptions.length];
    } else {
      // 文件颜色 - 根据文件名创建多样化的颜色
      const colorSet = [
        '#66BB6A', '#9CCC65', '#D4E157', // 绿色系
        '#FFA726', '#FFB74D', '#FFCC80', // 橙色系
        '#EF5350', '#E57373', '#EF9A9A', // 红色系
        '#5C6BC0', '#7986CB', '#9FA8DA', // 蓝色系
        '#26A69A', '#4DB6AC', '#80CBC4'  // 蓝绿色系
      ];
      
      // 使用标题长度和首字母共同决定颜色
      const colorIndex = (charCode + props.page.title.length) % colorSet.length;
      return colorSet[colorIndex];
    }
  }
  
  // 完全默认的颜色
  return props.page.has_children ? folderBaseColor : fileBaseColor;
})
</script>

<style>
/* 将scoped去掉，让样式可以作用于嵌套组件 */
.current-page {
  background-color: rgba(var(--v-theme-primary), 0.1) !important;
}

/* 强制覆盖Vuetify样式 */
.v-list-item {
  padding-left: calc(8px + var(--depth, 0) * 12px) !important;
  min-height: 36px !important;
}

.v-list-item .v-list-item__prepend {
  margin-right: 0 !important;
}

.v-list-group__header > .v-list-item__prepend {
  margin-right: 0 !important;
}

/* 紧凑化图标布局 */
.v-list-item .v-icon {
  margin-inline-end: 4px !important;
}

/* 隐藏 spacer 元素 */
.v-list-item__spacer {
  width: 2px !important;
}

/* 美化图标样式 */
.v-list-item .v-icon {
  opacity: 0.85;
  transition: all 0.2s ease;
  filter: drop-shadow(0 0 0 rgba(0, 0, 0, 0));
}

.v-list-item:hover .v-icon {
  opacity: 1;
  transform: scale(1.1);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
}

.current-page .v-icon {
  color: rgb(var(--v-theme-primary)) !important;
  opacity: 1;
  filter: drop-shadow(0 1px 3px rgba(var(--v-theme-primary-rgb), 0.4));
}
</style>
