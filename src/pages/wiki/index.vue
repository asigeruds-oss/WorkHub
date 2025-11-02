<template>
  <div class="wiki-layout">
    <!-- 侧边导航 -->
    <v-navigation-drawer
      v-model="drawer"
      permanent
      :rail="railMode"
      width="280"
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
      <v-list nav density="compact" class="wiki-nav compact-nav">
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
        <div class="toolbar-content">
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
        </div>
      </v-app-bar>

      <!-- 页面内容 -->
      <v-main>
        <v-container fluid class="wiki-container pa-6">
          <!-- 首页内容 -->
          <div v-if="!currentPage" class="text-center welcome-section">
            <div class="mb-8 hero-welcome">
              <div class="icon-wrapper mb-4">
                <v-icon size="100" color="primary">mdi-book-open-variant</v-icon>
              </div>
              <h1 class="text-h3 font-weight-bold mt-4 mb-3 gradient-title">Wiki 知识库</h1>
              <p class="text-h6 mb-2">
                构建和管理您的知识体系
              </p>
              <p class="text-body-1 text-medium-emphasis">
                📝 支持 Markdown · 🌳 树形结构 · 🏷️ 标签管理 · 💬 评论互动
              </p>
            </div>
            
            <!-- 快速开始 -->
            <v-row class="mb-8 justify-center">
              <v-col cols="12" sm="6" md="4" lg="3">
                <v-card class="action-card elevation-4" rounded="xl" @click="showCreateDialog = true">
                  <v-card-text class="pa-6 text-center">
                    <div class="action-icon-wrapper action-icon-primary mb-4">
                      <v-icon size="42" color="white">mdi-file-plus-outline</v-icon>
                    </div>
                    <h3 class="text-h6 font-weight-bold mb-2">创建页面</h3>
                    <p class="text-body-2 text-medium-emphasis mb-0">
                      开始构建您的知识库
                    </p>
                  </v-card-text>
                </v-card>
              </v-col>
              
              <v-col cols="12" sm="6" md="4" lg="3">
                <v-card class="action-card elevation-4" rounded="xl" @click="performSearch">
                  <v-card-text class="pa-6 text-center">
                    <div class="action-icon-wrapper action-icon-warning mb-4">
                      <v-icon size="42" color="white">mdi-magnify</v-icon>
                    </div>
                    <h3 class="text-h6 font-weight-bold mb-2">搜索内容</h3>
                    <p class="text-body-2 text-medium-emphasis mb-0">
                      快速找到所需信息
                    </p>
                  </v-card-text>
                </v-card>
              </v-col>
              
              <v-col cols="12" sm="6" md="4" lg="3">
                <v-card class="action-card elevation-4" rounded="xl" @click="showTagsDialog = true">
                  <v-card-text class="pa-6 text-center">
                    <div class="action-icon-wrapper action-icon-success mb-4">
                      <v-icon size="42" color="white">mdi-tag-multiple-outline</v-icon>
                    </div>
                    <h3 class="text-h6 font-weight-bold mb-2">标签管理</h3>
                    <p class="text-body-2 text-medium-emphasis mb-0">
                      组织和分类内容
                    </p>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>
          
          <!-- 页面详情内容 -->
          <div v-else-if="currentPage && !loading" class="page-content">
            <!-- 页面头部 -->
            <div class="page-header mb-6">
              <div class="d-flex align-center mb-3">
                <h1 class="text-h4 font-weight-bold page-title">{{ currentPage.title }}</h1>
              </div>
              
              <!-- 标签 -->
              <div v-if="currentPage.tags && currentPage.tags.length > 0" class="mb-4">
                <v-chip
                  v-for="tag in currentPage.tags"
                  :key="tag"
                  size="small"
                  color="primary"
                  variant="tonal"
                  class="mr-2"
                  @click="searchByTag(tag)"
                >
                  <v-icon start size="14">mdi-tag</v-icon>
                  {{ tag }}
                </v-chip>
              </div>
              
              <!-- 页面元信息 -->
              <v-card class="meta-card pa-4 mb-6" elevation="0" rounded="lg">
                <div class="d-flex flex-wrap align-center text-body-2">
                  <div class="meta-item mr-6 mb-2">
                    <v-icon size="18" class="mr-2">mdi-account</v-icon>
                    <span class="text-medium-emphasis">创建者：</span>
                    <span class="font-weight-medium">{{ currentPage.created_by }}</span>
                  </div>
                  <div class="meta-item mr-6 mb-2">
                    <v-icon size="18" class="mr-2">mdi-calendar-plus</v-icon>
                    <span class="text-medium-emphasis">创建时间：</span>
                    <span class="font-weight-medium">{{ formatDate(currentPage.created_at) }}</span>
                  </div>
                  <div class="meta-item mr-6 mb-2">
                    <v-icon size="18" class="mr-2">mdi-update</v-icon>
                    <span class="text-medium-emphasis">最后更新：</span>
                    <span class="font-weight-medium">{{ formatDate(currentPage.updated_at) }}</span>
                  </div>
                  <div class="meta-item mb-2">
                    <v-icon size="18" class="mr-2">mdi-history</v-icon>
                    <span class="text-medium-emphasis">版本：</span>
                    <span class="font-weight-medium">{{ currentPage.version }}</span>
                  </div>
                </div>
              </v-card>
            </div>
            
            <!-- Markdown 内容 -->
            <v-card class="content-card pa-8" elevation="2" rounded="xl">
              <div class="markdown-content" v-html="renderedContent"></div>
            </v-card>
            
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
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
}

.wiki-sidebar {
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  background: white !important;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.04);
}

.wiki-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
  margin-left: 0 !important;
}

.wiki-toolbar {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: white !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.toolbar-content {
  width: 100%;
  max-width: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
}

.wiki-container {
  max-width: 100% !important;
  width: 100%;
  margin: 0 auto !important;
  padding: 24px !important;
}

:deep(.v-main) {
  padding: 0 !important;
  margin: 0 !important;
}

:deep(.v-main__wrap) {
  width: 100%;
  margin: 0 auto;
}

:deep(.v-container) {
  max-width: 100% !important;
}

/* 欢迎页面样式 */
.welcome-section {
  padding: 60px 20px;
  animation: fadeIn 0.8s ease-out;
  max-width: 1200px;
  margin: 0 auto !important;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-welcome {
  position: relative;
}

.icon-wrapper {
  display: inline-block;
  animation: iconFloat 3s ease-in-out infinite;
}

@keyframes iconFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.gradient-title {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 页面内容区域 */
.page-content {
  max-width: 1100px;
  margin: 0 auto !important;
  width: 100%;
  animation: slideIn 0.6s ease-out;
  padding: 0 20px !important;
  display: block;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.page-header {
  animation: fadeInDown 0.6s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-title {
  color: #2c3e50;
  position: relative;
  padding-bottom: 8px;
}

.page-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

.meta-card {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.meta-item {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

.content-card {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06) !important;
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 导航样式 */
.wiki-nav {
  margin-top: 8px;
}

/* 快速操作卡片样式 */
.action-card {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  background: white;
  border: 2px solid rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
}

.action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.action-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.25) !important;
  border-color: rgba(102, 126, 234, 0.3);
}

.action-card:hover::before {
  opacity: 1;
}

.action-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s ease;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  margin: 0 auto;
}

.action-card:hover .action-icon-wrapper {
  transform: scale(1.1) rotate(-5deg);
}

.action-icon-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.action-icon-warning {
  background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%);
}

.action-icon-success {
  background: linear-gradient(135deg, #4caf50 0%, #81c784 100%);
}

/* Markdown 内容样式 */
.markdown-content {
  line-height: 1.8;
  font-size: 16px;
  color: #2c3e50;
  width: 100%;
}

.markdown-content :deep(h1) {
  font-size: 2rem;
  font-weight: 700;
  margin: 2.5rem 0 1.25rem 0;
  padding-bottom: 0.75rem;
  color: #1a1a1a;
  border-bottom: 3px solid transparent;
  background: linear-gradient(white, white) padding-box,
              linear-gradient(90deg, #667eea 0%, #764ba2 100%) border-box;
  border-image: linear-gradient(90deg, #667eea 0%, #764ba2 100%) 1;
  border-bottom: 3px solid;
}

.markdown-content :deep(h2) {
  font-size: 1.625rem;
  font-weight: 700;
  margin: 2rem 0 1rem 0;
  color: #2c3e50;
  position: relative;
  padding-left: 16px;
}

.markdown-content :deep(h2)::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

.markdown-content :deep(h3) {
  font-size: 1.375rem;
  font-weight: 600;
  margin: 1.75rem 0 0.75rem 0;
  color: #34495e;
}

.markdown-content :deep(p) {
  margin-bottom: 1.25rem;
  line-height: 1.9;
  color: #4a5568;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 1.25rem 0;
  padding-left: 2rem;
}

.markdown-content :deep(li) {
  margin-bottom: 0.75rem;
  line-height: 1.8;
  color: #4a5568;
}

.markdown-content :deep(ul) {
  list-style-type: none;
}

.markdown-content :deep(ul li) {
  position: relative;
  padding-left: 8px;
}

.markdown-content :deep(ul li)::before {
  content: '';
  position: absolute;
  left: -16px;
  top: 10px;
  width: 6px;
  height: 6px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
}

.markdown-content :deep(strong) {
  font-weight: 700;
  color: #2d3748;
}

.markdown-content :deep(em) {
  font-style: italic;
  color: #4a5568;
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
  border-left: 5px solid;
  border-image: linear-gradient(180deg, #667eea 0%, #764ba2 100%) 1;
  padding: 1.25rem 1.5rem;
  margin: 2rem 0;
  background: linear-gradient(90deg, 
    rgba(102, 126, 234, 0.08) 0%, 
    rgba(118, 75, 162, 0.05) 30%,
    transparent 100%);
  border-radius: 0 12px 12px 0;
  color: #4a5568;
  font-style: italic;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.markdown-content :deep(blockquote)::before {
  content: '"';
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 3rem;
  color: rgba(102, 126, 234, 0.2);
  font-family: Georgia, serif;
  line-height: 1;
}

.markdown-content :deep(blockquote p) {
  margin-bottom: 0.5rem;
  padding-left: 30px;
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
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
  position: relative;
  background: linear-gradient(to right, #667eea, #764ba2);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.markdown-content :deep(a)::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.markdown-content :deep(a:hover)::after {
  width: 100%;
}

/* 水平分割线 */
.markdown-content :deep(hr) {
  border: none;
  height: 3px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    #667eea 25%,
    #764ba2 50%,
    #667eea 75%,
    transparent 100%);
  margin: 3rem 0;
  border-radius: 2px;
  opacity: 0.5;
}

/* 图片样式 */
.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  margin: 2rem 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.markdown-content :deep(img:hover) {
  transform: scale(1.02);
}

/* 紧凑化Wiki导航 */
.compact-nav :deep(.v-list-item) {
  min-height: 36px !important;
  padding-inline: 8px !important;
}

.compact-nav :deep(.v-list-group) {
  margin-left: 0 !important;
  padding-left: 0 !important;
}

.compact-nav :deep(.v-list-group__items) {
  padding-left: 12px !important;
}

.compact-nav :deep(.v-list-item__prepend) {
  margin-right: 0 !important;
}

.compact-nav :deep(.v-list-item__content) {
  padding-left: 0 !important;
}

.compact-nav :deep(.v-icon) {
  margin-right: 4px !important;
}

/* 响应式设计 */
@media (max-width: 1280px) {
  .wiki-container {
    max-width: 100%;
    padding: 1rem !important;
  }
  
  .page-content {
    max-width: 100%;
  }
}

@media (max-width: 960px) {
  .welcome-section {
    padding: 40px 15px;
  }
  
  .content-card {
    padding: 1.5rem !important;
  }
  
  .markdown-content {
    font-size: 15px;
  }
  
  .markdown-content :deep(h1) {
    font-size: 1.75rem;
  }
  
  .markdown-content :deep(h2) {
    font-size: 1.5rem;
  }
  
  .markdown-content :deep(h3) {
    font-size: 1.25rem;
  }
  
  .meta-item {
    margin-right: 1rem !important;
    font-size: 0.85rem;
  }
}

@media (max-width: 600px) {
  .wiki-container {
    padding: 0.75rem !important;
  }
  
  .page-header {
    margin-bottom: 1.5rem !important;
  }
  
  .content-card {
    padding: 1rem !important;
    border-radius: 12px !important;
  }
  
  .meta-card {
    padding: 0.75rem !important;
  }
  
  .meta-item {
    width: 100%;
    margin-bottom: 0.5rem !important;
  }
  
  .action-icon-wrapper {
    width: 64px;
    height: 64px;
  }
  
  .markdown-content :deep(h1) {
    font-size: 1.5rem;
  }
  
  .markdown-content :deep(pre) {
    padding: 1rem;
    font-size: 0.85rem;
  }
  
  .markdown-content :deep(table) {
    font-size: 0.875rem;
  }
}

/* 滚动条美化 */
.wiki-content::-webkit-scrollbar {
  width: 10px;
}

.wiki-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.wiki-content::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 5px;
}

.wiki-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

/* 过渡动画 */
* {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* 打印样式 */
@media print {
  .wiki-sidebar,
  .wiki-toolbar,
  .meta-card {
    display: none !important;
  }
  
  .wiki-content {
    margin: 0;
  }
  
  .content-card {
    box-shadow: none !important;
    border: none !important;
  }
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
