<template>
  <v-container>
    <v-row v-if="loading">
      <v-col class="d-flex justify-center">
        <v-progress-circular indeterminate color="primary" :size="70" :width="7"></v-progress-circular>
      </v-col>
    </v-row>

    <template v-else>
      <!-- 文章头部 -->
      <v-row>
        <v-col cols="12">
          <div class="d-flex flex-wrap align-center">
            <v-btn
              icon="mdi-arrow-left"
              variant="text"
              :to="{ name: 'knowledge' }"
              class="me-3"
            ></v-btn>
            <h1 class="text-h3 font-weight-bold mb-0">{{ article.title }}</h1>
          </div>
          
          <div class="d-flex flex-wrap align-center mt-2">
            <v-chip
              color="primary"
              variant="outlined"
              class="mr-2"
            >
              {{ article.category }}
            </v-chip>
            
            <v-chip
              v-for="tag in article.tags"
              :key="tag"
              size="small"
              class="mr-1 mb-1"
            >
              {{ tag }}
            </v-chip>
            
            <v-spacer></v-spacer>
            
            <div class="text-subtitle-2 text-medium-emphasis">
              <span>更新于 {{ formatDate(article.updated_at) }}</span>
            </div>
          </div>
        </v-col>
      </v-row>
      
      <v-divider class="my-4"></v-divider>
      
      <!-- 文章内容 -->
      <v-row>
        <v-col cols="12" md="9">
          <v-card flat>
            <!-- 文章摘要 -->
            <blockquote class="article-summary">
              {{ article.summary }}
            </blockquote>
            
            <!-- 文章内容 -->
            <div class="article-content mt-6">
              <div v-html="renderedContent"></div>
            </div>
          </v-card>
          
          <v-divider class="my-6"></v-divider>
          
          <!-- 评论区域 -->
          <div class="comments-section mt-8">
            <h3 class="text-h5 mb-4">评论 ({{ comments.length }})</h3>
            
            <!-- 添加评论表单 -->
            <v-card class="mb-6 pa-4" variant="outlined">
              <v-textarea
                v-model="newComment"
                label="添加评论"
                rows="3"
                variant="outlined"
                hide-details
              ></v-textarea>
              
              <div class="d-flex justify-end mt-4">
                <v-btn
                  color="primary"
                  :disabled="!newComment.trim()"
                  @click="addComment"
                >
                  发表评论
                </v-btn>
              </div>
            </v-card>
            
            <!-- 评论列表 -->
            <template v-if="comments.length > 0">
              <v-card
                v-for="comment in comments"
                :key="comment.id"
                class="mb-3 pa-4"
                variant="outlined"
              >
                <div class="d-flex">
                  <v-avatar color="primary" class="mr-3">
                    {{ comment.author.substring(0, 1).toUpperCase() }}
                  </v-avatar>
                  
                  <div class="flex-grow-1">
                    <div class="d-flex justify-space-between">
                      <div>
                        <span class="font-weight-medium">{{ comment.author }}</span>
                        <span class="text-medium-emphasis ml-2 text-caption">
                          {{ formatDate(comment.created_at) }}
                        </span>
                      </div>
                      
                      <v-btn
                        v-if="isCurrentUserComment(comment)"
                        icon="mdi-delete"
                        variant="text"
                        size="small"
                        @click="deleteComment(comment.id)"
                      ></v-btn>
                    </div>
                    
                    <div class="mt-2">{{ comment.content }}</div>
                  </div>
                </div>
              </v-card>
            </template>
            
            <v-card
              v-else
              class="pa-4 text-center"
              variant="outlined"
            >
              <div class="text-medium-emphasis">暂无评论，快来发表第一条评论吧！</div>
            </v-card>
          </div>
        </v-col>
        
        <v-col cols="12" md="3">
          <v-card flat>
            <!-- 作者信息 -->
            <v-card class="mb-4" variant="outlined">
              <v-card-title>作者</v-card-title>
              <v-card-text>
                <div class="d-flex align-center">
                  <v-avatar color="primary" class="mr-3">
                    {{ article.author ? article.author.substring(0, 1).toUpperCase() : 'U' }}
                  </v-avatar>
                  <div>
                    <div class="font-weight-medium">{{ article.author || '系统管理员' }}</div>
                    <div class="text-caption">创建于 {{ formatDate(article.created_at) }}</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
            
            <!-- 操作按钮 -->
            <v-card class="mb-4" variant="outlined">
              <v-card-title>操作</v-card-title>
              <v-card-text>
                <div class="d-flex flex-column">
                  <v-btn
                    prepend-icon="mdi-pencil"
                    variant="outlined"
                    block
                    class="mb-2"
                    :to="{ name: 'knowledge-edit', params: { id: article.id } }"
                  >
                    编辑文章
                  </v-btn>
                  
                  <v-btn
                    prepend-icon="mdi-delete"
                    variant="outlined"
                    color="error"
                    block
                    @click="confirmDelete"
                  >
                    删除文章
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
            
            <!-- 版本历史 -->
            <v-card class="mb-4" variant="outlined">
              <v-card-title>历史版本</v-card-title>
              <v-list>
                <template v-if="history.length > 0">
                  <v-list-item
                    v-for="(version, index) in history"
                    :key="index"
                    :title="formatDate(version.created_at)"
                    :subtitle="`版本 ${version.version}`"
                    @click="viewVersion(version.id)"
                  >
                    <template v-slot:prepend>
                      <v-avatar size="36" color="grey-lighten-1">
                        <span class="text-caption">v{{ version.version }}</span>
                      </v-avatar>
                    </template>
                  </v-list-item>
                </template>
                
                <v-list-item v-else>
                  <v-list-item-title>暂无历史版本</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card>
            
            <!-- 相关文章 -->
            <v-card variant="outlined">
              <v-card-title>相关文章</v-card-title>
              <v-list>
                <template v-if="relatedArticles.length > 0">
                  <v-list-item
                    v-for="related in relatedArticles"
                    :key="related.id"
                    :title="related.title"
                    :to="{ name: 'knowledge-article', params: { id: related.id } }"
                  ></v-list-item>
                </template>
                
                <v-list-item v-else>
                  <v-list-item-title>暂无相关文章</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card>
          </v-card>
        </v-col>
      </v-row>
      
      <!-- 删除确认对话框 -->
      <v-dialog v-model="deleteDialog" max-width="500">
        <v-card>
          <v-card-title>确认删除</v-card-title>
          <v-card-text>
            您确定要删除文章"{{ article.title }}"吗？此操作不可撤销。
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              variant="text"
              @click="deleteDialog = false"
            >
              取消
            </v-btn>
            <v-btn
              color="error"
              @click="deleteArticle"
            >
              删除
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { WikiAPI } from '@/api';
import { marked } from 'marked';

const route = useRoute();
const router = useRouter();
const articleId = computed(() => route.params.id);

// 加载状态
const loading = ref(true);
const deleteDialog = ref(false);

// 文章数据
const article = reactive({
  id: null,
  title: '',
  summary: '',
  content: '',
  category: '',
  tags: [],
  author: '',
  created_at: '',
  updated_at: ''
});

// 评论相关
const comments = ref([]);
const newComment = ref('');

// 版本历史
const history = ref([]);

// 相关文章
const relatedArticles = ref([]);

// 渲染内容
const renderedContent = computed(() => {
  try {
    return marked(article.content);
  } catch (error) {
    console.error('Markdown 渲染失败:', error);
    return article.content;
  }
});

// 获取文章数据
const fetchArticle = async () => {
  loading.value = true;
  
  try {
    // 调用API获取页面详情
    const response = await WikiAPI.getPage(articleId.value);
    
    // 处理API返回的页面数据
    const pageData = response.data;
    
    // 从内容中提取摘要和正文
    // 假设内容格式是: # 标题\n\n摘要\n\n正文内容
    const contentParts = pageData.content.split('\n\n');
    const summary = contentParts.length > 1 ? contentParts[1] : '';
    const content = contentParts.length > 2 ? contentParts.slice(2).join('\n\n') : '';
    
    // 更新文章数据
    Object.assign(article, {
      id: pageData.id,
      title: pageData.title,
      // 根据父页面ID或路径获取分类
      category: getCategoryFromParentId(pageData.parent_id),
      tags: pageData.tags || [],
      summary: summary,
      content: content,
      author: pageData.author || pageData.created_by || '',
      created_at: pageData.created_at,
      updated_at: pageData.updated_at
    });
    
    // 加载评论
    fetchComments();
    
    // 加载历史版本
    fetchHistory();
    
    // 加载相关文章
    fetchRelatedArticles();
  } catch (error) {
    console.error('获取文章失败:', error);
    alert('获取文章数据失败');
    router.push({ name: 'knowledge' });
  } finally {
    loading.value = false;
  }
};

// 根据父页面ID获取分类
const getCategoryFromParentId = (parentId) => {
  // 这里需要根据实际的分类结构映射
  // 使用数字ID作为键
  const categoryMapping = {
    1: '技术文档',
    2: '使用指南',
    3: '常见问题',
    4: '最佳实践'
  };
  
  // 确保parentId是数字
  const parentIdNum = parseInt(parentId, 10);
  return categoryMapping[parentIdNum] || '技术文档';
};

// 获取评论
const fetchComments = async () => {
  try {
    const response = await WikiAPI.getComments(articleId.value);
    comments.value = response.data;
  } catch (error) {
    console.error('获取评论失败:', error);
  }
};

// 获取历史版本
const fetchHistory = async () => {
  try {
    const response = await WikiAPI.getPageHistory(articleId.value);
    history.value = response.data;
  } catch (error) {
    console.error('获取历史版本失败:', error);
  }
};

// 获取相关文章
const fetchRelatedArticles = async () => {
  try {
    // 这里可以根据标签或分类查询相关文章
    if (article.tags && article.tags.length > 0) {
      const response = await WikiAPI.searchPages({
        tags: article.tags.slice(0, 2), // 使用前两个标签搜索
        limit: 5
      });
      
      // 过滤掉当前文章
      relatedArticles.value = response.data.filter(page => page.id !== article.id);
    }
  } catch (error) {
    console.error('获取相关文章失败:', error);
  }
};

// 添加评论
const addComment = async () => {
  if (!newComment.value.trim()) return;
  
  try {
    await WikiAPI.createComment(articleId.value, {
      content: newComment.value
    });
    
    // 重新获取评论
    await fetchComments();
    
    // 清空评论输入框
    newComment.value = '';
  } catch (error) {
    console.error('添加评论失败:', error);
    alert('添加评论失败');
  }
};

// 删除评论
const deleteComment = async (commentId) => {
  try {
    await WikiAPI.deleteComment(articleId.value, commentId);
    
    // 重新获取评论
    await fetchComments();
  } catch (error) {
    console.error('删除评论失败:', error);
    alert('删除评论失败');
  }
};

// 判断是否是当前用户的评论
const isCurrentUserComment = (comment) => {
  // 这里需要根据实际的用户系统实现
  // 假设有一个全局的 currentUser 对象
  const currentUser = { id: 1, username: 'admin' };
  return comment.author === currentUser.username;
};

// 查看历史版本
const viewVersion = async (versionId) => {
  try {
    const response = await WikiAPI.getPageVersion(articleId.value, versionId);
    
    // 临时显示历史版本
    Object.assign(article, {
      content: response.data.content,
      updated_at: response.data.created_at
    });
    
    // 这里可以添加一个提示，告知用户正在查看历史版本
    alert(`正在查看版本 ${response.data.version}`);
  } catch (error) {
    console.error('获取历史版本失败:', error);
    alert('获取历史版本失败');
  }
};

// 确认删除
const confirmDelete = () => {
  deleteDialog.value = true;
};

// 删除文章
const deleteArticle = async () => {
  try {
    await WikiAPI.deletePage(articleId.value);
    
    alert('文章已成功删除');
    router.push({ name: 'knowledge' });
  } catch (error) {
    console.error('删除文章失败:', error);
    alert('删除文章失败');
  } finally {
    deleteDialog.value = false;
  }
};

// 日期格式化函数
const formatDate = (dateString) => {
  if (!dateString) return '';
  
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
  fetchArticle();
});
</script>

<style scoped>
.article-summary {
  background-color: rgba(var(--v-theme-primary), 0.05);
  border-left: 4px solid rgb(var(--v-theme-primary));
  padding: 16px;
  font-style: italic;
  border-radius: 4px;
  margin: 20px 0;
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
</style>

<route>
{
  name: 'knowledge-article',
  path: '/knowledge/:id',
  meta: {
    title: '文章详情',
    layout: 'default'
  }
}
</route>
