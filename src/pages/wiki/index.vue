<template>
  <div class="wiki-layout">
    <!-- 侧边导航 -->
    <v-navigation-drawer
      v-model="drawer"
      permanent
      :rail="railMode"
      width="320"
      class="wiki-sidebar"
      @click="railMode = false"
    >
      <!-- 侧栏头部 -->
      <v-list>
        <v-list-item
          prepend-icon="mdi-book-open-variant"
          title="Wiki 知识库"
          subtitle="多级目录管理"
        >
          <template v-slot:append>
            <v-btn
              variant="text"
              icon="mdi-chevron-left"
              @click.stop="railMode = !railMode"
            />
          </template>
        </v-list-item>
      </v-list>

      <v-divider />
      
      <!-- 搜索框 -->
      <div class="pa-3">
        <v-text-field
          v-model="searchQuery"
          placeholder="搜索页面..."
          density="compact"
          variant="outlined"
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details
          @keyup.enter="performSearch"
        />
      </div>
      
      <v-divider />

      <!-- 页面树形导航 -->
      <v-list nav density="compact" class="wiki-nav">
        <v-list-subheader class="d-flex align-center">
          <span>页面导航</span>
          <v-spacer />
          <v-btn
            icon="mdi-plus"
            size="x-small"
            variant="text"
            @click="showCreateDialog = true"
          />
        </v-list-subheader>
        
        <!-- 递归渲染树形结构 -->
        <template v-if="pageTree.length > 0">
          <wiki-tree-item
            v-for="page in pageTree"
            :key="page.id"
            :page="page"
            :current-page-id="currentPageId"
            @navigate="navigateToPage"
            @create-child="createChildPage"
            @edit="editPage"
            @delete="deletePage"
          />
        </template>
        <v-list-item v-else>
          <v-list-item-title class="text-caption text-medium-emphasis">
            暂无页面
          </v-list-item-title>
        </v-list-item>
      </v-list>

      <!-- 底部操作 -->
      <template v-slot:append>
        <v-list density="compact">
          <v-list-item
            prepend-icon="mdi-plus"
            title="创建根页面"
            @click="showCreateDialog = true"
          />
          
          <v-list-item
            prepend-icon="mdi-tag-outline"
            title="标签管理"
            @click="showTagsDialog = true"
          />
        </v-list>
      </template>
    </v-navigation-drawer>

    <!-- 主内容区域 -->
    <div class="wiki-content">
      <!-- 顶部工具栏 -->
      <v-app-bar flat class="wiki-toolbar">
        <v-container class="d-flex align-center">
          <!-- 面包屑导航 -->
          <v-breadcrumbs
            v-if="breadcrumbs.length > 0"
            :items="breadcrumbs"
            density="compact"
            class="pa-0"
          >
            <template v-slot:item="{ item }">
              <v-breadcrumbs-item
                :title="item.title"
                :disabled="item.disabled"
                @click="item.onClick"
              />
            </template>
          </v-breadcrumbs>
          
          <v-spacer />
          
          <!-- 页面操作按钮 -->
          <div v-if="currentPage" class="d-flex align-center ga-2">
            <v-btn
              icon="mdi-pencil"
              variant="text"
              @click="editCurrentPage"
            />
            <v-btn
              icon="mdi-history"
              variant="text"
              @click="showHistoryDialog = true"
            />
            <v-btn
              icon="mdi-share-variant"
              variant="text"
              @click="sharePage"
            />
            <v-btn
              icon="mdi-dots-vertical"
              variant="text"
            >
              <v-menu activator="parent">
                <v-list>
                  <v-list-item @click="movePage">
                    <template v-slot:prepend>
                      <v-icon>mdi-folder-move</v-icon>
                    </template>
                    <v-list-item-title>移动页面</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="deleteCurrentPage" class="text-error">
                    <template v-slot:prepend>
                      <v-icon>mdi-delete</v-icon>
                    </template>
                    <v-list-item-title>删除页面</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-btn>
          </div>
        </v-container>
      </v-app-bar>

      <!-- 页面内容 -->
      <v-main>
        <v-container class="wiki-container pa-6">
          <!-- 首页内容 -->
          <div v-if="!currentPage" class="text-center">
            <div class="mb-8">
              <v-icon size="80" color="primary">mdi-book-open-variant</v-icon>
              <h1 class="text-h3 font-weight-bold mt-4 mb-2">Wiki 知识库</h1>
              <p class="text-h6 text-medium-emphasis">
                构建和管理您的知识体系
              </p>
            </div>
            
            <!-- 快速开始 -->
            <v-row class="mb-8">
              <v-col cols="12" md="4">
                <v-card class="action-card pa-6 text-center" @click="showCreateDialog = true">
                  <v-icon size="48" color="primary" class="mb-4">mdi-plus</v-icon>
                  <h3 class="mb-2">创建第一个页面</h3>
                  <p class="text-body-2 text-medium-emphasis">
                    开始构建您的知识库
                  </p>
                </v-card>
              </v-col>
              
              <v-col cols="12" md="4">
                <v-card class="action-card pa-6 text-center" @click="performSearch">
                  <v-icon size="48" color="orange" class="mb-4">mdi-magnify</v-icon>
                  <h3 class="mb-2">搜索内容</h3>
                  <p class="text-body-2 text-medium-emphasis">
                    快速找到您需要的信息
                  </p>
                </v-card>
              </v-col>
              
              <v-col cols="12" md="4">
                <v-card class="action-card pa-6 text-center" @click="showTagsDialog = true">
                  <v-icon size="48" color="green" class="mb-4">mdi-tag-multiple</v-icon>
                  <h3 class="mb-2">管理标签</h3>
                  <p class="text-body-2 text-medium-emphasis">
                    组织和分类您的内容
                  </p>
                </v-card>
              </v-col>
            </v-row>
          </div>
          
          <!-- 页面详情内容 -->
          <div v-else-if="currentPage && !loading">
            <div class="d-flex align-center mb-4">
              <h1 class="text-h4 font-weight-bold">{{ currentPage.title }}</h1>
              <v-spacer />
              <div class="d-flex align-center ga-2">
                <v-chip
                  v-for="tag in currentPage.tags"
                  :key="tag"
                  size="small"
                  variant="outlined"
                  @click="searchByTag(tag)"
                >
                  {{ tag }}
                </v-chip>
              </div>
            </div>
            
            <!-- 页面元信息 -->
            <div class="mb-6 text-body-2 text-medium-emphasis">
              <span>创建者：{{ currentPage.created_by }}</span>
              <span class="mx-2">•</span>
              <span>创建时间：{{ formatDate(currentPage.created_at) }}</span>
              <span class="mx-2">•</span>
              <span>最后更新：{{ formatDate(currentPage.updated_at) }}</span>
              <span class="mx-2">•</span>
              <span>版本：{{ currentPage.version }}</span>
            </div>
            
            <!-- Markdown 内容 -->
            <div class="markdown-content" v-html="renderedContent"></div>
            
            <!-- 评论区域 -->
            <wiki-comments
              v-if="currentPage.id"
              :page-id="currentPage.id"
              class="mt-8"
            />
          </div>
          
          <!-- 加载状态 -->
          <div v-else-if="loading" class="text-center py-8">
            <v-progress-circular indeterminate color="primary" />
            <p class="mt-4">加载中...</p>
          </div>
          
          <!-- 页面不存在 -->
          <div v-else class="text-center py-8">
            <v-icon size="80" color="error">mdi-file-question</v-icon>
            <h2 class="text-h5 mt-4 mb-2">页面不存在</h2>
            <p class="text-body-1 text-medium-emphasis mb-4">
              您要查找的页面可能已被删除或移动
            </p>
            <v-btn color="primary" @click="navigateToHome">
              返回首页
            </v-btn>
          </div>
        </v-container>
      </v-main>
    </div>

    <!-- 创建页面对话框 -->
    <wiki-create-dialog
      v-model="showCreateDialog"
      :parent-id="createParentId"
      @created="onPageCreated"
    />

    <!-- 编辑页面对话框 -->
    <wiki-edit-dialog
      v-model="showEditDialog"
      :page="editingPage"
      @updated="onPageUpdated"
    />

    <!-- 标签管理对话框 -->
    <wiki-tags-dialog
      v-model="showTagsDialog"
    />

    <!-- 历史版本对话框 -->
    <wiki-history-dialog
      v-model="showHistoryDialog"
      :page-id="currentPageId"
    />

    <!-- 移动页面对话框 -->
    <wiki-move-dialog
      v-model="showMoveDialog"
      :page="currentPage"
      @moved="onPageMoved"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { marked } from 'marked'
import WikiAPI from '@/api/wiki'
import WikiTreeItem from '@/components/wiki/WikiTreeItem.vue'
import WikiComments from '@/components/wiki/WikiComments.vue'
import WikiCreateDialog from '@/components/wiki/WikiCreateDialog.vue'
import WikiEditDialog from '@/components/wiki/WikiEditDialog.vue'
import WikiTagsDialog from '@/components/wiki/WikiTagsDialog.vue'
import WikiHistoryDialog from '@/components/wiki/WikiHistoryDialog.vue'
import WikiMoveDialog from '@/components/wiki/WikiMoveDialog.vue'

const router = useRouter()
const route = useRoute()

// 基础状态
const drawer = ref(true)
const railMode = ref(false)
const loading = ref(false)
const searchQuery = ref('')

// 页面数据
const pageTree = ref([])
const currentPage = ref(null)
const currentPageId = ref(null)
const breadcrumbs = ref([])

// 对话框状态
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const showTagsDialog = ref(false)
const showHistoryDialog = ref(false)
const showMoveDialog = ref(false)

// 编辑相关
const editingPage = ref(null)
const createParentId = ref(null)

// 渲染的内容
const renderedContent = computed(() => {
  if (!currentPage.value?.content) return ''
  return marked(currentPage.value.content)
})

// 页面方法
const loadPageTree = async () => {
  try {
    const response = await WikiAPI.getPageTree()
    pageTree.value = response.data.tree || []
  } catch (error) {
    console.error('加载页面树失败:', error)
    pageTree.value = []
  }
}

const loadPage = async (id) => {
  if (!id) {
    currentPage.value = null
    currentPageId.value = null
    breadcrumbs.value = []
    return
  }

  loading.value = true
  try {
    const [pageResponse, breadcrumbResponse] = await Promise.all([
      WikiAPI.getPage(id),
      WikiAPI.getPageBreadcrumb(id)
    ])
    
    currentPage.value = pageResponse.data
    currentPageId.value = id
    
    // 构建面包屑
    breadcrumbs.value = [
      {
        title: '首页',
        disabled: false,
        onClick: () => navigateToHome()
      },
      ...breadcrumbResponse.data.breadcrumb.map((item, index, arr) => ({
        title: item.title,
        disabled: index === arr.length - 1,
        onClick: index < arr.length - 1 ? () => navigateToPage(item.id) : undefined
      }))
    ]
  } catch (error) {
    console.error('加载页面失败:', error)
    currentPage.value = null
    currentPageId.value = null
    breadcrumbs.value = []
  } finally {
    loading.value = false
  }
}

const navigateToPage = (id) => {
  router.push(`/wiki/${id}`)
}

const navigateToHome = () => {
  router.push('/wiki')
}

const createChildPage = (parentId) => {
  createParentId.value = parentId
  showCreateDialog.value = true
}

const editPage = (page) => {
  editingPage.value = page
  showEditDialog.value = true
}

const editCurrentPage = () => {
  if (currentPage.value) {
    editingPage.value = currentPage.value
    showEditDialog.value = true
  }
}

const deleteCurrentPage = () => {
  if (currentPage.value) {
    deletePage(currentPage.value)
  }
}

const deletePage = async (page) => {
  if (!confirm(`确定要删除页面"${page.title}"吗？`)) return
  
  try {
    await WikiAPI.deletePage(page.id)
    await loadPageTree()
    
    // 如果删除的是当前页面，返回首页
    if (currentPageId.value === page.id) {
      navigateToHome()
    }
  } catch (error) {
    console.error('删除页面失败:', error)
    alert('删除页面失败')
  }
}

const movePage = () => {
  showMoveDialog.value = true
}

const sharePage = () => {
  if (currentPage.value) {
    const url = `${window.location.origin}/wiki/${currentPage.value.id}`
    navigator.clipboard.writeText(url).then(() => {
      alert('页面链接已复制到剪贴板')
    }).catch(() => {
      alert(`页面链接：${url}`)
    })
  }
}

const performSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(`/wiki/search?q=${encodeURIComponent(searchQuery.value)}`)
  }
}

const searchByTag = (tag) => {
  router.push(`/wiki/search?tags=${encodeURIComponent(tag)}`)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 事件处理
const onPageCreated = (page) => {
  loadPageTree()
  navigateToPage(page.id)
}

const onPageUpdated = (page) => {
  loadPageTree()
  if (currentPageId.value === page.id) {
    currentPage.value = page
  }
}

const onPageMoved = () => {
  loadPageTree()
  if (currentPageId.value) {
    loadPage(currentPageId.value)
  }
}

// 路由监听
watch(() => route.params.id, (newId) => {
  loadPage(newId)
}, { immediate: true })

// 组件挂载
onMounted(() => {
  loadPageTree()
})
</script>

<style scoped>
/* 布局样式 */
.wiki-layout {
  display: flex;
  min-height: calc(100vh - 64px);
}

.wiki-sidebar {
  border-right: 1px solid rgb(var(--v-border-color));
}

.wiki-content {
  flex: 1;
  overflow: auto;
}

.wiki-toolbar {
  border-bottom: 1px solid rgb(var(--v-border-color));
  background-color: rgba(var(--v-theme-surface), 1) !important;
}

.wiki-container {
  max-width: 1000px;
}

/* 导航样式 */
.wiki-nav {
  margin-top: 8px;
}

/* 卡片样式 */
.action-card {
  transition: all 0.3s ease;
  cursor: pointer;
  border-radius: 12px;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

/* Markdown 内容样式 */
.markdown-content {
  line-height: 1.7;
  font-size: 16px;
}

.markdown-content :deep(h1) {
  font-size: 2rem;
  font-weight: 600;
  margin: 2rem 0 1rem 0;
  border-bottom: 2px solid rgb(var(--v-border-color));
  padding-bottom: 0.5rem;
}

.markdown-content :deep(h2) {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 1.5rem 0 0.75rem 0;
}

.markdown-content :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1.25rem 0 0.5rem 0;
}

.markdown-content :deep(p) {
  margin-bottom: 1rem;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 1rem 0;
  padding-left: 2rem;
}

.markdown-content :deep(li) {
  margin-bottom: 0.5rem;
}

/* 行内代码样式 */
.markdown-content :deep(code) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-family: 'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.9em;
  font-weight: 500;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);
}

/* 代码块容器样式 */
.markdown-content :deep(pre) {
  background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%);
  padding: 1.25rem;
  border-radius: 12px;
  overflow-x: auto;
  margin: 1.5rem 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 8px 16px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  position: relative;
}

/* 代码块内的代码样式 */
.markdown-content :deep(pre code) {
  background: none;
  color: #e6e6e6;
  padding: 0;
  border-radius: 0;
  box-shadow: none;
  font-family: 'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.95em;
  line-height: 1.6;
  display: block;
  font-weight: normal;
}

/* 代码块顶部装饰 */
.markdown-content :deep(pre)::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 30px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 0%, transparent 100%);
  border-radius: 12px 12px 0 0;
  pointer-events: none;
}

/* 滚动条样式优化 */
.markdown-content :deep(pre)::-webkit-scrollbar {
  height: 8px;
}

.markdown-content :deep(pre)::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.markdown-content :deep(pre)::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.markdown-content :deep(pre)::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 引用块样式 */
.markdown-content :deep(blockquote) {
  border-left: 4px solid rgb(var(--v-theme-primary));
  padding: 1rem 1.25rem;
  margin: 1.5rem 0;
  background: linear-gradient(90deg, 
    rgba(var(--v-theme-primary-rgb), 0.05) 0%, 
    rgba(var(--v-theme-primary-rgb), 0.02) 50%,
    transparent 100%);
  border-radius: 0 8px 8px 0;
  color: rgb(var(--v-theme-on-surface));
  font-style: italic;
}

/* 表格样式 */
.markdown-content :deep(table) {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin: 1.5rem 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid rgba(var(--v-border-color-rgb), 0.3);
  padding: 0.75rem 1rem;
  text-align: left;
}

.markdown-content :deep(th) {
  background: linear-gradient(180deg, 
    #667eea 0%, 
    #764ba2 100%);
  color: white !important;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.85em;
  letter-spacing: 0.5px;
}

.markdown-content :deep(tbody tr) {
  background-color: rgb(var(--v-theme-surface));
  transition: background-color 0.2s ease;
}

.markdown-content :deep(tbody tr:nth-child(even)) {
  background-color: rgba(var(--v-theme-surface-variant-rgb), 0.3);
}

.markdown-content :deep(tbody tr:hover) {
  background-color: rgba(var(--v-theme-primary-rgb), 0.08);
}

/* 链接样式 */
.markdown-content :deep(a) {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
  font-weight: 500;
  border-bottom: 1px solid transparent;
  transition: all 0.2s ease;
}

.markdown-content :deep(a:hover) {
  border-bottom-color: rgb(var(--v-theme-primary));
  text-decoration: none;
}

/* 水平分割线 */
.markdown-content :deep(hr) {
  border: none;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgb(var(--v-theme-primary)) 50%, 
    transparent 100%);
  margin: 2rem 0;
}
</style>

<route>
{
  name: 'wiki',
  meta: {
    requiresAuth: false,
    layout: 'default',
    title: 'Wiki 知识库'
  }
}
</route>
