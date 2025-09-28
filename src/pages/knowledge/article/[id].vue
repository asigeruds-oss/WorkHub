<template>
  <v-container>
    <!-- 文章导航和操作按钮 -->
    <v-row class="mb-3">
      <v-col cols="12">
        <v-btn
          variant="text"
          prepend-icon="mdi-arrow-left"
          :to="{ name: 'knowledge' }"
          class="mb-2"
        >
          返回知识中心
        </v-btn>
      
        <div class="d-flex justify-end" v-if="isAuthenticated && article">
          <v-btn
            color="primary"
            variant="outlined"
            class="mr-2"
            prepend-icon="mdi-pencil"
            :to="{ name: 'knowledge-edit', params: { id: article.id }}"
          >
            编辑
          </v-btn>
          <v-btn
            color="error"
            variant="outlined"
            prepend-icon="mdi-delete"
            @click="confirmDelete = true"
          >
            删除
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- 文章内容 -->
    <v-row>
      <v-col cols="12" md="9">
        <v-card v-if="loading" class="pa-4">
          <v-skeleton-loader type="article" class="px-3"></v-skeleton-loader>
        </v-card>

        <v-card v-else-if="article" class="pa-6 article-card">
          <h1 class="text-h3 font-weight-bold mb-4">{{ article.title }}</h1>
          
          <div class="d-flex align-center mb-6 article-meta">
            <v-avatar size="36" color="primary" class="mr-3">
              <span class="text-white">{{ article.author?.charAt(0) || 'U' }}</span>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ article.author }}</div>
              <div class="text-caption text-medium-emphasis">
                更新于 {{ formatDate(article.updatedAt) }} · 阅读 {{ article.views || 0 }}
              </div>
            </div>
          </div>

          <v-divider class="mb-6"></v-divider>
          
          <!-- 文章标签 -->
          <div class="mb-6">
            <v-chip
              v-for="tag in article.tags"
              :key="tag"
              :to="{ name: 'knowledge-tag', params: { id: tag }}"
              class="mr-2 mb-2"
              color="primary"
              variant="outlined"
              size="small"
            >
              {{ tag }}
            </v-chip>
          </div>
          
          <!-- 文章内容 -->
          <div class="article-content mb-8">
            <div v-html="article.content"></div>
          </div>
          
          <!-- 文章底部 -->
          <v-divider class="mb-4"></v-divider>
          
          <div class="d-flex align-center justify-space-between">
            <div>
              <v-btn
                variant="text"
                color="primary"
                prepend-icon="mdi-thumb-up"
              >
                有帮助 ({{ article.likes || 0 }})
              </v-btn>
            </div>
            
            <div class="text-caption text-medium-emphasis">
              创建于 {{ formatDate(article.createdAt) }}
            </div>
          </div>
        </v-card>
        
        <v-alert
          v-else
          type="info"
          text="文章不存在或已被删除"
          class="mt-4"
        ></v-alert>
      </v-col>
      
      <!-- 侧边栏：相关文章 -->
      <v-col cols="12" md="3">
        <v-card class="mb-4">
          <v-card-title class="text-subtitle-1 font-weight-bold">
            <v-icon start color="primary" class="mr-2">mdi-file-tree</v-icon>
            目录
          </v-card-title>
          <v-divider></v-divider>
          <v-list density="compact" nav>
            <v-list-item
              v-for="(section, index) in articleSections"
              :key="index"
              :title="section"
              link
              :class="{ 'pl-4': section.startsWith('  ') }"
            ></v-list-item>
          </v-list>
        </v-card>
        
        <v-card>
          <v-card-title class="text-subtitle-1 font-weight-bold">
            <v-icon start color="primary" class="mr-2">mdi-file-document-multiple</v-icon>
            相关文章
          </v-card-title>
          <v-divider></v-divider>
          <v-list>
            <v-list-item
              v-for="relatedArticle in relatedArticles"
              :key="relatedArticle.id"
              :to="{ name: 'knowledge-article', params: { id: relatedArticle.id }}"
              link
            >
              <v-list-item-title class="text-body-2">{{ relatedArticle.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- 删除确认对话框 -->
    <v-dialog v-model="confirmDelete" max-width="500">
      <v-card>
        <v-card-title class="text-h5">确认删除</v-card-title>
        <v-card-text>
          您确定要删除这篇文章吗？此操作无法撤销。
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="secondary" variant="text" @click="confirmDelete = false">取消</v-btn>
          <v-btn color="error" variant="flat" @click="deleteArticle">确认删除</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

// 路由和身份验证
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);

// 状态变量
const loading = ref(true);
const article = ref(null);
const confirmDelete = ref(false);
const articleSections = ref([]);
const relatedArticles = ref([]);

// 获取文章数据
const fetchArticle = async (id) => {
  loading.value = true;
  
  try {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 模拟文章数据
    article.value = {
      id,
      title: '如何使用本系统的知识中心功能',
      content: `
        <h2>知识中心介绍</h2>
        <p>知识中心是一个集中管理和共享团队知识的平台。您可以在这里创建、编辑和查询各类文档和资源。</p>
        
        <h2>主要功能</h2>
        <p>知识中心提供以下主要功能：</p>
        <ul>
          <li>文章创建与编辑</li>
          <li>分类和标签管理</li>
          <li>全文搜索</li>
          <li>版本历史</li>
        </ul>
        
        <h3>文章创建</h3>
        <p>点击"创建文章"按钮开始创建新文章。您可以使用富文本编辑器添加格式化文本、图片和链接。</p>
        
        <h3>分类和标签</h3>
        <p>为您的文章添加适当的分类和标签，以便其他用户更容易找到相关内容。</p>
        
        <h2>使用建议</h2>
        <p>以下是一些使用知识中心的最佳实践：</p>
        <ol>
          <li>使用清晰、描述性的标题</li>
          <li>添加详细而准确的内容</li>
          <li>适当使用标题层级</li>
          <li>定期更新过时的内容</li>
        </ol>
        
        <h2>常见问题</h2>
        <p>如果您在使用过程中遇到问题，请查看常见问题解答或联系系统管理员获取帮助。</p>
      `,
      author: '系统管理员',
      createdAt: '2025-09-20T14:30:00',
      updatedAt: '2025-09-25T15:30:00',
      views: 128,
      likes: 24,
      tags: ['使用指南', '入门', '文档']
    };
    
    // 提取文章中的章节标题作为目录
    const titleRegex = /<h([2-4])>(.*?)<\/h\1>/g;
    let match;
    const sections = [];
    
    while ((match = titleRegex.exec(article.value.content)) !== null) {
      const level = match[1];
      const title = match[2];
      const indent = '  '.repeat(level - 2);
      sections.push(`${indent}${title}`);
    }
    
    articleSections.value = sections;
    
    // 模拟相关文章
    relatedArticles.value = [
      { id: 2, title: 'API接口文档完整指南' },
      { id: 3, title: '常见问题解答集合' },
      { id: 4, title: '知识中心编辑器使用技巧' }
    ];
    
    loading.value = false;
  } catch (error) {
    console.error('获取文章详情失败:', error);
    loading.value = false;
  }
};

// 删除文章
const deleteArticle = async () => {
  try {
    // 模拟删除请求
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 提示成功
    alert('文章已成功删除');
    
    // 返回知识中心首页
    router.push({ name: 'knowledge' });
  } catch (error) {
    console.error('删除文章失败:', error);
    alert('删除文章失败，请重试');
  } finally {
    confirmDelete.value = false;
  }
};

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 初始化
onMounted(() => {
  const articleId = parseInt(route.params.id);
  fetchArticle(articleId);
});
</script>

<style scoped>
.article-card {
  border-radius: 12px;
}

.article-meta {
  margin-top: -8px;
}

.article-content {
  line-height: 1.8;
  font-size: 16px;
}

.article-content :deep(h2) {
  font-size: 1.75rem;
  font-weight: 600;
  margin: 1.5rem 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.article-content :deep(h3) {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 1.5rem 0 1rem;
}

.article-content :deep(p) {
  margin-bottom: 1rem;
}

.article-content :deep(ul), .article-content :deep(ol) {
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

.article-content :deep(li) {
  margin-bottom: 0.5rem;
}

.article-content :deep(img) {
  max-width: 100%;
  height: auto;
  margin: 1rem 0;
  border-radius: 8px;
}

.article-content :deep(a) {
  color: var(--v-primary-base);
  text-decoration: none;
}

.article-content :deep(a:hover) {
  text-decoration: underline;
}

.article-content :deep(blockquote) {
  border-left: 4px solid var(--v-primary-base);
  padding-left: 1rem;
  font-style: italic;
  color: rgba(0, 0, 0, 0.6);
  margin: 1rem 0;
}

.article-content :deep(code) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: monospace;
}

.article-content :deep(pre) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 1rem;
  border-radius: 8px;
  overflow: auto;
  margin: 1rem 0;
}

.article-content :deep(pre code) {
  background: none;
  padding: 0;
}
</style>

<route>
{
  name: 'knowledge-article',
  path: '/knowledge/article/:id',
  meta: {
    requiresAuth: false,
    layout: 'default',
    title: '文章详情'
  }
}
</route>
