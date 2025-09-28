<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-6">
          <h1 class="text-h4 font-weight-bold">搜索结果</h1>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            prepend-icon="mdi-arrow-left"
            :to="{ name: 'knowledge' }"
          >
            返回知识中心
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- 搜索框 -->
    <v-row class="mb-6">
      <v-col cols="12" md="8" offset-md="2">
        <v-card elevation="3" rounded="lg" class="search-card pa-2">
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            label="搜索知识库"
            variant="solo"
            hide-details
            clearable
            @keyup.enter="searchArticles"
          ></v-text-field>
        </v-card>
      </v-col>
    </v-row>

    <!-- 搜索结果信息 -->
    <v-row>
      <v-col cols="12">
        <div class="mb-4 text-body-1">
          {{ loading ? '搜索中...' : `共找到 ${totalItems} 条相关结果，耗时 ${searchTime.toFixed(2)} 秒` }}
        </div>
      </v-col>
    </v-row>
    
    <!-- 搜索结果列表 -->
    <v-row>
      <v-col cols="12">
        <v-card v-if="loading" class="pa-4">
          <v-skeleton-loader
            v-for="i in 5"
            :key="i"
            type="list-item-two-line"
            class="mb-4"
          ></v-skeleton-loader>
        </v-card>
        
        <template v-else-if="searchResults.length > 0">
          <v-card
            v-for="result in searchResults"
            :key="result.id"
            class="mb-4 search-result-card"
            :to="{ name: 'knowledge-article', params: { id: result.id } }"
          >
            <v-card-title class="text-h6 font-weight-bold pb-1">
              {{ result.title }}
              <v-chip
                size="small"
                color="primary"
                variant="flat"
                class="ml-2"
              >
                {{ result.category }}
              </v-chip>
            </v-card-title>
            
            <v-card-subtitle class="pb-2">
              <span class="text-body-2 text-medium-emphasis">
                {{ formatDate(result.updatedAt) }} · {{ result.author }}
              </span>
            </v-card-subtitle>
            
            <v-card-text>
              <!-- 搜索结果高亮 -->
              <div class="search-highlight mb-2" v-html="result.highlight"></div>
              
              <!-- 标签 -->
              <div class="mt-3">
                <v-chip
                  v-for="tag in result.tags"
                  :key="tag"
                  size="x-small"
                  class="mr-1"
                  variant="outlined"
                >
                  {{ tag }}
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
          
          <!-- 分页 -->
          <v-pagination
            v-model="page"
            :length="Math.ceil(totalItems / pageSize)"
            rounded="circle"
            class="my-4"
            @update:modelValue="searchArticles"
          ></v-pagination>
        </template>
        
        <v-alert
          v-else
          type="info"
          text="未找到符合条件的内容，请尝试其他关键词"
          class="mt-4"
        ></v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// 路由
const route = useRoute();
const router = useRouter();

// 搜索参数
const searchQuery = ref('');
const page = ref(1);
const pageSize = 10;
const totalItems = ref(0);
const searchTime = ref(0);

// 加载状态
const loading = ref(false);

// 搜索结果
const searchResults = ref([]);

// 搜索文章
const searchArticles = async () => {
  if (!searchQuery.value.trim()) {
    return;
  }
  
  // 更新URL查询参数
  router.push({
    name: 'knowledge-search',
    query: { q: searchQuery.value, page: page.value }
  });
  
  loading.value = true;
  const startTime = performance.now();
  
  try {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 模拟搜索结果数据
    const mockResults = [
      {
        id: 1,
        title: '如何使用本系统的知识中心功能',
        highlight: '...本文详细介绍了<strong class="highlight">知识</strong><strong class="highlight">中心</strong>的各项功能及使用方法，帮助您快速上手。<strong class="highlight">知识</strong><strong class="highlight">中心</strong>是一个集中管理和共享团队<strong class="highlight">知识</strong>的平台...',
        author: '系统管理员',
        category: '使用指南',
        tags: ['使用指南', '入门', '文档'],
        updatedAt: '2025-09-25T15:30:00'
      },
      {
        id: 4,
        title: '知识中心编辑器使用技巧',
        highlight: '...<strong class="highlight">知识</strong><strong class="highlight">中心</strong>编辑器提供了丰富的格式化工具，可以帮助你创建结构化的<strong class="highlight">知识</strong>文档。使用Markdown语法可以更高效地编辑内容...',
        author: '内容团队',
        category: '使用指南',
        tags: ['编辑器', '技巧', '进阶'],
        updatedAt: '2025-09-22T14:10:00'
      },
      {
        id: 6,
        title: '知识分类与标签最佳实践',
        highlight: '...合理的<strong class="highlight">知识</strong>分类和标签体系是<strong class="highlight">知识</strong><strong class="highlight">中心</strong>成功运营的关键。本文介绍了如何构建有效的分类体系和标签策略...',
        author: '内容管理员',
        category: '最佳实践',
        tags: ['分类', '标签', '管理'],
        updatedAt: '2025-09-19T09:45:00'
      }
    ];
    
    searchResults.value = mockResults;
    totalItems.value = 8; // 模拟总结果数
    
    const endTime = performance.now();
    searchTime.value = (endTime - startTime) / 1000;
  } catch (error) {
    console.error('搜索失败:', error);
    searchResults.value = [];
    totalItems.value = 0;
    searchTime.value = 0;
  } finally {
    loading.value = false;
  }
};

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit'
  });
};

// 监听路由参数变化
watch(
  () => route.query,
  (newQuery) => {
    if (newQuery.q) {
      searchQuery.value = newQuery.q;
      page.value = parseInt(newQuery.page) || 1;
      searchArticles();
    }
  },
  { immediate: true }
);

// 初始化
onMounted(() => {
  if (route.query.q) {
    searchQuery.value = route.query.q;
    page.value = parseInt(route.query.page) || 1;
    searchArticles();
  }
});
</script>

<style scoped>
.search-card {
  transition: all 0.3s;
}

.search-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1) !important;
}

.search-result-card {
  transition: all 0.2s;
  border-left: 3px solid transparent;
  text-decoration: none;
}

.search-result-card:hover {
  border-left: 3px solid var(--v-theme-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  transform: translateY(-2px);
}

.search-highlight {
  line-height: 1.5;
  font-size: 0.95rem;
}

.search-highlight :deep(.highlight) {
  background-color: rgba(var(--v-theme-warning), 0.2);
  padding: 0 2px;
  border-radius: 2px;
  font-weight: 500;
}
</style>

<route>
{
  name: 'knowledge-search',
  path: '/knowledge/search',
  meta: {
    requiresAuth: false,
    layout: 'default',
    title: '知识搜索'
  }
}
</route>
