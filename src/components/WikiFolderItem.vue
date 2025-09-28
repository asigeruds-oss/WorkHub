<!-- 
  WikiFolderItem.vue
  递归组件，用于显示文件夹结构中的项目
-->
<template>
  <template v-if="page">
    <!-- 如果是文件夹，递归显示文件夹和子项 -->
    <v-list-group v-if="page.isFolder" :value="page.id">
      <template v-slot:activator="{ props }">
        <v-list-item
          v-bind="props"
          :title="page.title"
          prepend-icon="mdi-folder"
        ></v-list-item>
      </template>
      
      <!-- 递归显示子页面 -->
      <wiki-folder-item 
        v-for="childPage in page.children" 
        :key="childPage.id"
        :page="childPage"
        :current-page="currentPage"
        @navigate="(id) => $emit('navigate', id)"
      />
    </v-list-group>
    
    <!-- 如果是普通页面，显示普通列表项 -->
    <v-list-item
      v-else
      @click="$emit('navigate', page.id)"
      :title="page.title"
      :active="currentPage === page.id"
      prepend-icon="mdi-file-document-outline"
    ></v-list-item>
  </template>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

// 定义属性
const props = defineProps({
  page: {
    type: Object,
    required: true
  },
  currentPage: {
    type: [String, Number],
    default: ''
  }
})

// 定义事件
defineEmits(['navigate'])
</script>
