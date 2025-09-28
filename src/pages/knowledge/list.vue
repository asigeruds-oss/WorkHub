<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-6">
          <h1 class="text-h4 font-weight-bold">文章列表</h1>
          <v-spacer></v-spacer>
          <v-btn
            v-if="isAuthenticated"
            color="primary"
            prepend-icon="mdi-plus"
            :to="{ name: 'knowledge-create' }"
          >
            创建文章
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- 筛选条件 -->
    <v-row class="mb-4">
      <v-col cols="12" sm="4">
        <v-select
          v-model="filters.category"
          :items="categoryOptions"
          label="分类"
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
        ></v-select>
      </v-col>
      
      <v-col cols="12" sm="4">
        <v-autocomplete
          v-model="filters.tags"
          :items="tagOptions"
          label="标签"
          variant="outlined"
          density="comfortable"
          hide-details
          multiple
          chips
          closable-chips
        ></v-autocomplete>
      </v-col>
      
      <v-col cols="12" sm="4">
        <v-select
          v-model="filters.sortBy"
          :items="sortOptions"
          label="排序方式"
          variant="outlined"
          density="comfortable"
          hide-details
        ></v-select>
      </v-col>
    </v-row>
    
    <!-- 文章列表 -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <template v-if="loading">
            <v-skeleton-loader
              v-for="i in 5"
              :key="i"
              type="list-item-two-line"
              class="pa-4"
            ></v-skeleton-loader>
          </template>
          
          <template v-else-if="articles.length > 0">
            <v-list>
              <template v-for="(article, index) in articles" :key="article.id">
                <v-list-item
                  :to="{ name: 'knowledge-article', params: { id: article.id }}"
                  class="article-item pa-4"
                >
                  <div class="d-flex flex-column flex-grow-1">
                    <div class="d-flex align-center mb-2">
                      <h3 class="text-h6 font-weight-bold">{{ article.title }}</h3>
                      <v-spacer></v-spacer>
                      <v-chip
                        size="small"
                        color="primary"
                        variant="flat"
                        class="ml-2"
                      >
                        {{ article.category }}
                      </v-chip>
                    </div>
                    
                    <p class="text-body-2 text-medium-emphasis mb-3 article-summary">
                      {{ article.summary }}
                    </p>
                    
                    <div class="d-flex align-center">
                      <div class="article-meta mr-auto">
                        <span class="text-caption text-medium-emphasis mr-4">
                          <v-icon size="small" class="mr-1">mdi-account</v-icon>
                          {{ article.author }}
                        </span>
                        <span class="text-caption text-medium-emphasis mr-4">
                          <v-icon size="small" class="mr-1">mdi-calendar</v-icon>
                          {{ formatDate(article.updatedAt) }}
                        </span>
                        <span class="text-caption text-medium-emphasis mr-4">
                          <v-icon size="small" class="mr-1">mdi-eye</v-icon>
                          {{ article.views }}
                        </span>
                      </div>
                      
                      <div>
                        <v-chip
                          v-for="tag in article.tags.slice(0, 3)"
                          :key="tag"
                          size="x-small"
                          class="ml-1"
                          variant="outlined"
                        >
                          {{ tag }}
                        </v-chip>
                        <v-chip
                          v-if="article.tags.length > 3"
                          size="x-small"
                          class="ml-1"
                          variant="outlined"
                        >
                          +{{ article.tags.length - 3 }}
                        </v-chip>
                      </div>
                    </div>
                  </div>
                </v-list-item>
                
                <v-divider v-if="index < articles.length - 1"></v-divider>
              </template>
            </v-list>
            
            <!-- 分页 -->
            <v-pagination
              v-model="page"
              :length="totalPages"
              rounded="circle"
              class="pt-4 pb-2"
              @update:modelValue="fetchArticles"
            ></v-pagination>
          </template>
          
          <v-list v-else>
            <v-list-item class="text-center py-8">
              <v-list-item-title class="text-medium-emphasis">
                没有找到符合条件的文章
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

// 认证状态
const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);

// 分页和加载状态
const loading = ref(false);
const page = ref(1);
const pageSize = 10;
const totalItems = ref(0);
const totalPages = computed(() => Math.ceil(totalItems.value / pageSize));

// 筛选条件
const filters = reactive({
  category: null,
  tags: [],
  sortBy: 'updated_desc'
});

// 分类选项
const categoryOptions = [
  { title: '全部分类', value: null },
  { title: '技术文档', value: 'technical' },
  { title: '使用指南', value: 'guide' },
  { title: '常见问题', value: 'faq' },
  { title: '最佳实践', value: 'best-practice' }
];

// 标签选项
const tagOptions = [
  '前端',
  'Vue',
  'API',
  'JavaScript',
  '教程',
  '入门',
  '进阶',
  '常见问题',
  '技巧',
  '配置'
];

// 排序选项
const sortOptions = [
  { title: '最近更新', value: 'updated_desc' },
  { title: '创建时间', value: 'created_desc' },
  { title: '阅读量', value: 'views_desc' },
  { title: '标题 A-Z', value: 'title_asc' }
];

// 文章列表
const articles = ref([]);

// 获取文章列表
const fetchArticles = async () => {
  loading.value = true;
  
  try {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 模拟文章列表数据
    const mockData = [
      {
        id: 1,
        title: '如何使用本系统的知识中心功能',
        summary: '本文详细介绍了知识中心的各项功能及使用方法，帮助您快速上手。',
        author: '系统管理员',
        category: '使用指南',
        tags: ['使用指南', '入门', '文档'],
        createdAt: '2025-09-20T14:30:00',
        updatedAt: '2025-09-25T15:30:00',
        views: 128
      },
      {
        id: 2,
        title: 'API接口文档完整指南',
        summary: '提供系统所有API的详细说明，包括请求方式、参数和返回值等信息。',
        author: '技术团队',
        category: '技术文档',
        tags: ['API', '开发', '文档'],
        createdAt: '2025-09-22T09:15:00',
        updatedAt: '2025-09-24T10:15:00',
        views: 86
      },
      {
        id: 3,
        title: '常见问题解答集合',
        summary: '整理了用户在使用过程中遇到的常见问题和解决方案，方便快速查阅。',
        author: '支持团队',
        category: '常见问题',
        tags: ['FAQ', '问题', '解答'],
        createdAt: '2025-09-21T11:20:00',
        updatedAt: '2025-09-23T16:45:00',
        views: 112
      },
      {
        id: 4,
        title: '知识中心编辑器使用技巧',
        summary: '介绍知识中心编辑器的高级功能和使用技巧，提高内容编辑效率。',
        author: '内容团队',
        category: '使用指南',
        tags: ['编辑器', '技巧', '进阶'],
        createdAt: '2025-09-18T13:40:00',
        updatedAt: '2025-09-22T14:10:00',
        views: 67
      },
      {
        id: 5,
        title: '系统性能优化最佳实践',
        summary: '分享系统性能优化的方法和经验，帮助提高系统运行效率。',
        author: '技术团队',
        category: '最佳实践',
        tags: ['性能', '优化', '最佳实践'],
        createdAt: '2025-09-15T10:30:00',
        updatedAt: '2025-09-20T11:25:00',
        views: 95
      }
    ];
    
    // 根据筛选条件过滤数据
    let filteredData = [...mockData];
    
    if (filters.category) {
      filteredData = filteredData.filter(item => item.category === filters.category);
    }
    
    if (filters.tags && filters.tags.length > 0) {
      filteredData = filteredData.filter(item => {
        return filters.tags.some(tag => item.tags.includes(tag));
      });
    }
    
    // 排序
    filteredData.sort((a, b) => {
      const [field, order] = filters.sortBy.split('_');
      
      let valA, valB;
      
      switch (field) {
        case 'updated':
          valA = new Date(a.updatedAt).getTime();
          valB = new Date(b.updatedAt).getTime();
          break;
        case 'created':
          valA = new Date(a.createdAt).getTime();
          valB = new Date(b.createdAt).getTime();
          break;
        case 'views':
          valA = a.views;
          valB = b.views;
          break;
        case 'title':
          valA = a.title;
          valB = b.title;
          break;
        default:
          valA = a.updatedAt;
          valB = b.updatedAt;
      }
      
      return order === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
    
    totalItems.value = filteredData.length;
    
    // 分页
    const start = (page.value - 1) * pageSize;
    const end = start + pageSize;
    articles.value = filteredData.slice(start, end);
    
    loading.value = false;
  } catch (error) {
    console.error('获取文章列表失败:', error);
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

// 监听筛选条件变化
watch(filters, () => {
  page.value = 1;
  fetchArticles();
}, { deep: true });

// 初始化
onMounted(() => {
  fetchArticles();
});
</script>

<style scoped>
.article-item {
  transition: background-color 0.2s;
}

.article-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.article-summary {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
}
</style>

<route>
{
  name: 'knowledge-list',
  path: '/knowledge/list',
  meta: {
    requiresAuth: false,
    layout: 'default',
    title: '文章列表'
  }
}
</route>
