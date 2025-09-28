<template>
  <div class="wiki-layout">
    <!-- 侧边导航 -->
    <v-navigation-drawer
      v-model="drawer"
      permanent
      :rail="railMode"
      width="300"
      class="wiki-sidebar"
      @click="railMode = false"
    >
      <v-list>
        <v-list-item
          prepend-icon="mdi-book-open-variant"
          title="知识中心"
          subtitle="Wiki系统"
        >
          <template v-slot:append>
            <v-btn
              variant="text"
              icon="mdi-chevron-left"
              @click.stop="railMode = !railMode"
            ></v-btn>
          </template>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>
      
      <!-- 侧边搜索 -->
      <div class="pa-2">
        <v-text-field
          v-model="searchQuery"
          placeholder="搜索..."
          density="compact"
          variant="outlined"
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details
          @keyup.enter="performSearch"
        />
      </div>
      
      <v-divider></v-divider>

      <!-- Wiki导航树 -->
      <v-list nav density="compact" class="wiki-nav">
        <v-list-subheader>页面导航</v-list-subheader>
        
        <v-list-group value="tech">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-code-tags"
              title="技术文档"
            ></v-list-item>
          </template>
          
          <template v-if="navPages.tech && navPages.tech.length > 0">
            <!-- 遍历技术文档分类下的页面 -->
            <template v-for="page in navPages.tech" :key="page.id">
              <!-- 如果是文件夹，显示可嵌套的list-group -->
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
                  @navigate="navigateToPage"
                />
              </v-list-group>
              
              <!-- 如果是普通页面，显示普通列表项 -->
              <v-list-item
                v-else
                @click="navigateToPage(page.id)"
                :title="page.title"
                :active="currentPage === page.id"
                prepend-icon="mdi-file-document-outline"
              ></v-list-item>
            </template>
          </template>
          <v-list-item v-else title="暂无文档" disabled></v-list-item>
        </v-list-group>
        
        <v-list-group value="user-guides">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-book-open"
              title="用户指南"
            ></v-list-item>
          </template>
          
          <template v-if="navPages.userGuides && navPages.userGuides.length > 0">
            <!-- 遍历用户指南分类下的页面 -->
            <template v-for="page in navPages.userGuides" :key="page.id">
              <!-- 如果是文件夹，显示可嵌套的list-group -->
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
                  @navigate="navigateToPage"
                />
              </v-list-group>
              
              <!-- 如果是普通页面，显示普通列表项 -->
              <v-list-item
                v-else
                @click="navigateToPage(page.id)"
                :title="page.title"
                :active="currentPage === page.id"
                prepend-icon="mdi-file-document-outline"
              ></v-list-item>
            </template>
          </template>
          <v-list-item v-else title="暂无文档" disabled></v-list-item>
        </v-list-group>
        
        <v-list-group value="faq">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-help-circle"
              title="常见问题"
            ></v-list-item>
          </template>
          
          <template v-if="navPages.faq && navPages.faq.length > 0">
            <!-- 遍历常见问题分类下的页面 -->
            <template v-for="page in navPages.faq" :key="page.id">
              <!-- 如果是文件夹，显示可嵌套的list-group -->
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
                  @navigate="navigateToPage"
                />
              </v-list-group>
              
              <!-- 如果是普通页面，显示普通列表项 -->
              <v-list-item
                v-else
                @click="navigateToPage(page.id)"
                :title="page.title"
                :active="currentPage === page.id"
                prepend-icon="mdi-file-document-outline"
              ></v-list-item>
            </template>
          </template>
          <v-list-item v-else title="暂无文档" disabled></v-list-item>
        </v-list-group>
        
        <v-list-group value="best-practices">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-star"
              title="最佳实践"
            ></v-list-item>
          </template>
          
          <template v-if="navPages.bestPractices && navPages.bestPractices.length > 0">
            <!-- 遍历最佳实践分类下的页面 -->
            <template v-for="page in navPages.bestPractices" :key="page.id">
              <!-- 如果是文件夹，显示可嵌套的list-group -->
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
                  @navigate="navigateToPage"
                />
              </v-list-group>
              
              <!-- 如果是普通页面，显示普通列表项 -->
              <v-list-item
                v-else
                @click="navigateToPage(page.id)"
                :title="page.title"
                :active="currentPage === page.id"
                prepend-icon="mdi-file-document-outline"
              ></v-list-item>
            </template>
          </template>
          <v-list-item v-else title="暂无文档" disabled></v-list-item>
        </v-list-group>
      </v-list>

      <template v-slot:append>
        <v-list>
          <v-list-item
            prepend-icon="mdi-plus"
            title="创建新页面"
            @click="createPage"
          ></v-list-item>
          
          <v-list-item
            prepend-icon="mdi-cog"
            title="Wiki设置"
            @click="openSettings"
          ></v-list-item>
        </v-list>
      </template>
    </v-navigation-drawer>

    <!-- 主内容区域 -->
    <div class="wiki-content">
      <!-- 面包屑和工具栏 -->
      <div class="wiki-toolbar pa-4 d-flex align-center justify-space-between">
        <div>
          <v-breadcrumbs :items="breadcrumbs">
            <template v-slot:divider>
              <v-icon icon="mdi-chevron-right"></v-icon>
            </template>
          </v-breadcrumbs>
        </div>
        
        <div class="d-flex">
          <v-btn
            variant="outlined"
            prepend-icon="mdi-history"
            class="mr-2"
            @click="showHistory"
          >
            历史版本
          </v-btn>
          
          <v-btn
            color="primary"
            prepend-icon="mdi-pencil"
            @click="editPage"
          >
            编辑页面
          </v-btn>
        </div>
      </div>
      
      <!-- 主要内容区域 -->
      <v-container class="wiki-container pa-6">
        <div v-if="loading" class="d-flex justify-center align-center" style="height: 300px">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        </div>
        
        <div v-else-if="currentPage === 'home'" class="wiki-home">
          <h1 class="text-h3 font-weight-bold mb-4">知识中心</h1>
          <p class="text-subtitle-1 mb-6">欢迎来到团队的知识中心，这里是我们共享和管理知识的地方。</p>
          
          <!-- 快捷搜索 -->
          <v-card class="search-card mb-6" elevation="3">
            <v-card-text class="pa-4">
              <v-text-field
                v-model="searchQuery"
                placeholder="搜索页面、文档和知识..."
                variant="outlined"
                prepend-inner-icon="mdi-magnify"
                clearable
                @keyup.enter="performSearch"
              />
              <v-btn 
                color="primary" 
                block
                @click="performSearch" 
                class="mt-2"
                :disabled="!searchQuery"
              >
                搜索
              </v-btn>
            </v-card-text>
          </v-card>
          
          <!-- Wiki状态卡片 -->
          <v-row class="mb-6">
            <v-col cols="12" md="3">
              <v-card class="text-center pa-4" height="100%">
                <v-card-title class="text-h3 font-weight-bold">
                  {{ totalArticles }}
                </v-card-title>
                <v-card-text>
                  <div class="text-body-1">文章总数</div>
                </v-card-text>
              </v-card>
            </v-col>
            
            <v-col cols="12" md="3">
              <v-card class="text-center pa-4" height="100%">
                <v-card-title class="text-h3 font-weight-bold">
                  {{ totalCategories }}
                </v-card-title>
                <v-card-text>
                  <div class="text-body-1">分类数量</div>
                </v-card-text>
              </v-card>
            </v-col>
            
            <v-col cols="12" md="3">
              <v-card class="text-center pa-4" height="100%">
                <v-card-title class="text-h3 font-weight-bold">
                  {{ totalTags }}
                </v-card-title>
                <v-card-text>
                  <div class="text-body-1">标签数量</div>
                </v-card-text>
              </v-card>
            </v-col>
            
            <v-col cols="12" md="3">
              <v-card class="text-center pa-4" height="100%">
                <v-card-title class="text-h3 font-weight-bold">
                  {{ lastUpdateTime }}
                </v-card-title>
                <v-card-text>
                  <div class="text-body-1">最后更新</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          
          <!-- 最近更新 -->
          <v-card class="mb-6" elevation="2">
            <v-card-title>
              <v-icon class="mr-2">mdi-clock-outline</v-icon>
              最近更新
            </v-card-title>
            <v-card-text>
              <div v-if="recentPages.length > 0">
                <v-list>
                  <v-list-item
                    v-for="page in recentPages"
                    :key="page.id"
                    :title="page.title"
                    :subtitle="`更新于 ${page.updatedAt} · ${page.updatedBy}`"
                    lines="two"
                    @click="navigateToPage(page.id)"
                  >
                    <template v-slot:prepend>
                      <v-avatar :color="page.color" size="36">
                        <v-icon color="white">{{ page.icon }}</v-icon>
                      </v-avatar>
                    </template>
                  </v-list-item>
                </v-list>
              </div>
              <div v-else class="text-center pa-4">
                <p>暂无文章。点击"创建新页面"来添加第一篇文章。</p>
              </div>
            </v-card-text>
          </v-card>
          
          <!-- 快速访问 -->
          <v-row>
            <v-col cols="12" sm="6" md="3">
              <v-card 
                class="action-card pa-4 text-center" 
                elevation="1" 
                color="primary" 
                variant="tonal"
                @click="createPage"
              >
                <v-icon size="48" class="mb-2">mdi-file-plus</v-icon>
                <div class="text-h6 font-weight-bold">创建页面</div>
                <div class="text-caption">添加新知识</div>
              </v-card>
            </v-col>
            
            <v-col cols="12" sm="6" md="3">
              <v-card 
                class="action-card pa-4 text-center" 
                elevation="1" 
                color="success" 
                variant="tonal"
                @click="navigateToPage('getting-started')"
              >
                <v-icon size="48" class="mb-2">mdi-compass</v-icon>
                <div class="text-h6 font-weight-bold">入门指南</div>
                <div class="text-caption">新用户必读</div>
              </v-card>
            </v-col>
            
            <v-col cols="12" sm="6" md="3">
              <v-card 
                class="action-card pa-4 text-center" 
                elevation="1" 
                color="info" 
                variant="tonal"
                @click="navigateToPage('contribute')"
              >
                <v-icon size="48" class="mb-2">mdi-account-group</v-icon>
                <div class="text-h6 font-weight-bold">如何贡献</div>
                <div class="text-caption">参与知识建设</div>
              </v-card>
            </v-col>
            
            <v-col cols="12" sm="6" md="3">
              <v-card 
                class="action-card pa-4 text-center" 
                elevation="1" 
                color="warning" 
                variant="tonal"
                @click="showStats"
              >
                <v-icon size="48" class="mb-2">mdi-chart-bar</v-icon>
                <div class="text-h6 font-weight-bold">数据统计</div>
                <div class="text-caption">页面访问分析</div>
              </v-card>
            </v-col>
          </v-row>
        </div>
        
        <div v-else class="wiki-page">
          <v-alert v-if="pageNotFound" type="info" class="mb-4">
            页面不存在。<a @click.prevent="createPage" href="#">创建此页面?</a>
          </v-alert>
          
          <div v-else>
            <div class="d-flex align-center justify-space-between mb-4">
              <h1 class="text-h3">{{ currentPageData.title }}</h1>
              <v-chip
                color="primary"
                variant="outlined"
                prepend-icon="mdi-clock-outline"
              >
                版本 {{ currentPageData.version }}
              </v-chip>
            </div>
            
            <div class="mb-4 d-flex">
              <v-chip
                v-for="tag in currentPageData.tags"
                :key="tag"
                class="mr-2"
                size="small"
                color="primary"
                variant="flat"
                @click="searchByTag(tag)"
              >
                {{ tag }}
              </v-chip>
            </div>
            
            <!-- 渲染Markdown内容 -->
            <v-card flat class="pa-4 mb-4 markdown-content">
              <div v-html="renderedContent"></div>
            </v-card>
            
            <!-- 页面信息 -->
            <v-divider class="mb-4"></v-divider>
            
            <div class="d-flex justify-space-between text-caption">
              <div>
                <div>创建者: {{ currentPageData.createdBy }} · {{ currentPageData.createdAt }}</div>
                <div>最后修改: {{ currentPageData.updatedBy }} · {{ currentPageData.updatedAt }}</div>
              </div>
              
              <div class="d-flex">
                <v-btn
                  variant="text"
                  size="small"
                  prepend-icon="mdi-thumb-up"
                  @click="likePage"
                >
                  {{ currentPageData.likes }} 赞
                </v-btn>
                <v-btn
                  variant="text"
                  size="small"
                  prepend-icon="mdi-share"
                  @click="sharePage"
                >
                  分享
                </v-btn>
              </div>
            </div>
            
            <!-- 评论区 -->
            <h3 class="text-h5 mt-8 mb-4">评论 ({{ currentPageData.comments.length }})</h3>
            
            <v-text-field
              v-model="newComment"
              placeholder="添加评论..."
              variant="outlined"
              append-inner-icon="mdi-send"
              @click:append-inner="addComment"
            ></v-text-field>
            
            <v-list v-if="currentPageData.comments.length > 0">
              <v-list-item
                v-for="comment in currentPageData.comments"
                :key="comment.id"
                :title="comment.author"
                :subtitle="comment.date"
              >
                <template v-slot:prepend>
                  <v-avatar color="grey" size="36">
                    <v-icon color="white">mdi-account</v-icon>
                  </v-avatar>
                </template>
                <div class="mt-2">{{ comment.content }}</div>
              </v-list-item>
            </v-list>
            
            <v-alert v-else type="info">
              暂无评论，成为第一个评论者吧！
            </v-alert>
          </div>
        </div>
      </v-container>
    </div>
    
    <!-- 历史版本对话框 -->
    <v-dialog v-model="showHistoryDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <v-icon class="mr-2">mdi-history</v-icon>
          历史版本
        </v-card-title>
        
        <v-divider></v-divider>
        
        <v-card-text v-if="historyVersions.length === 0" class="pa-4 text-center">
          <v-progress-circular v-if="loading" indeterminate color="primary"></v-progress-circular>
          <p v-else>暂无历史版本</p>
        </v-card-text>
        
        <v-list v-else>
          <v-list-item
            v-for="version in historyVersions"
            :key="version.version"
            @click="viewVersion(version.version)"
          >
            <template v-slot:prepend>
              <v-avatar color="primary" size="36">
                <span class="text-caption">v{{ version.version }}</span>
              </v-avatar>
            </template>
            
            <v-list-item-title>
              {{ version.comment || `版本 ${version.version}` }}
            </v-list-item-title>
            
            <v-list-item-subtitle>
              {{ version.updated_by.username }} · {{ new Date(version.updated_at).toLocaleString() }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="showHistoryDialog = false">
            关闭
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- 搜索结果对话框 -->
    <v-dialog v-model="showSearchResults" max-width="700px">
      <v-card>
        <v-card-title>
          <v-icon class="mr-2">mdi-magnify</v-icon>
          搜索结果: {{ searchQuery }}
        </v-card-title>
        
        <v-divider></v-divider>
        
        <v-card-text v-if="isSearching" class="pa-4 text-center">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <p>正在搜索...</p>
        </v-card-text>
        
        <v-card-text v-else-if="searchResults.length === 0" class="pa-4 text-center">
          <p>未找到匹配的结果</p>
        </v-card-text>
        
        <v-list v-else>
          <v-list-item
            v-for="result in searchResults"
            :key="result.id"
            @click="navigateToPage(result.id); showSearchResults = false"
          >
            <v-list-item-title v-html="result.title"></v-list-item-title>
            <v-list-item-subtitle v-html="result.snippet"></v-list-item-subtitle>
            <template v-slot:append>
              <v-chip size="small" variant="outlined" class="text-caption">
                {{ result.relevance.toFixed(2) }}
              </v-chip>
            </template>
          </v-list-item>
        </v-list>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="showSearchResults = false">
            关闭
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import { WikiAPI } from '@/api'
import { useRouter } from 'vue-router'
import WikiFolderItem from '@/components/WikiFolderItem.vue'

console.log('Wiki 知识中心页面开始加载...')
const router = useRouter()

// 侧边导航状态
const drawer = ref(true)
const railMode = ref(false)

// 基本状态
const loading = ref(true)
const currentPage = ref('home')
const pageNotFound = ref(false)
const searchQuery = ref('')
const newComment = ref('')

// Wiki面包屑
const breadcrumbs = computed(() => {
  if (currentPage.value === 'home') {
    return [
      {
        title: '首页',
        disabled: true
      }
    ]
  } else if (currentPageData.value) {
    const path = [
      {
        title: '首页',
        href: '#',
        onClick: () => navigateToPage('home')
      }
    ]
    
    // 根据页面路径构建面包屑
    if (currentPageData.value.path) {
      const pathSegments = currentPageData.value.path.split('/').filter(Boolean)
      
      pathSegments.forEach((segment, index) => {
        // 不添加最后一个路径（当前页面）
        if (index < pathSegments.length - 1) {
          path.push({
            title: formatPathSegment(segment),
            href: '#',
            onClick: () => navigateToPage(segment)
          })
        }
      })
    }
    
    // 添加当前页面
    path.push({
      title: currentPageData.value.title,
      disabled: true
    })
    
    return path
  }
  
  return []
})

// 帮助函数：格式化路径段为可读文本
const formatPathSegment = (segment) => {
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}

// 最近更新的页面
const recentPages = ref([])

// 页面数据缓存
const pageCache = ref({})

// 热门标签
const popularTags = ref([])

// 实际页面数据存储
const pages = ref({})

// 导航页面按分类
const navPages = ref({
  tech: [],
  userGuides: [],
  faq: [],
  bestPractices: []
})

// Wiki统计数据
const totalArticles = ref(0)
const totalCategories = ref(4) // 默认四个分类
const totalTags = ref(0)
const lastUpdateTime = ref('--')

// 当前页面数据
const currentPageData = computed(() => {
  if (currentPage.value === 'home') {
    return null
  }
  
  const page = pages.value[currentPage.value]
  if (!page) {
    pageNotFound.value = true
    return {
      title: currentPage.value,
      content: '页面不存在',
      tags: [],
      comments: []
    }
  }
  
  pageNotFound.value = false
  return page
})

// 渲染的Markdown内容
const renderedContent = computed(() => {
  if (!currentPageData.value || !currentPageData.value.content) {
    return ''
  }
  
  // 这里应该使用一个真正的Markdown渲染器
  // 为了简单演示，我们只进行基本的转换
  let content = currentPageData.value.content
  
  // 标题
  content = content.replace(/^# (.+)$/gm, '<h1 class="text-h3">$1</h1>')
  content = content.replace(/^## (.+)$/gm, '<h2 class="text-h4 mt-4">$1</h2>')
  content = content.replace(/^### (.+)$/gm, '<h3 class="text-h5 mt-3">$1</h3>')
  
  // 代码块
  content = content.replace(/```([\s\S]*?)```/g, '<pre class="pa-3 bg-grey-lighten-4"><code>$1</code></pre>')
  
  // 行内元素
  content = content.replace(/`([^`]+)`/g, '<code class="px-1 bg-grey-lighten-4">$1</code>')
  content = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  content = content.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
  
  // 列表
  content = content.replace(/^- (.+)$/gm, '<li>$1</li>')
  if (content.includes('<li>')) {
    content = content.replace(/(<li>[\s\S]*<\/li>)/g, '<ul>$1</ul>')
  }
  
  // 段落
  content = content.replace(/\n\n/g, '<br><br>')
  
  return content
})

// 页面导航函数
const navigateToPage = async (pageId) => {
  console.log('导航到页面:', pageId)
  
  // 如果是首页，不需要加载特定页面
  if (pageId === 'home') {
    currentPage.value = 'home'
    pageNotFound.value = false
    loading.value = false
    return
  }
  
  currentPage.value = pageId
  loading.value = true
  
  try {
    // 使用API获取页面内容
    const response = await WikiAPI.getPage(pageId)
    
    // 更新本地页面数据
    if (!pages.value[pageId]) {
      pages.value[pageId] = {}
    }
    
    // 检查是否为文件夹
    const isFolder = response.data.is_folder || false
    
    // 合并API返回的数据
    Object.assign(pages.value[pageId], {
      id: response.data.id,
      title: response.data.title,
      content: response.data.content,
      path: response.data.path,
      parentId: response.data.parent_id,
      specificParentId: response.data.specific_parent_id,
      createdBy: response.data.created_by.username,
      createdAt: new Date(response.data.created_at).toLocaleDateString(),
      updatedBy: response.data.created_by.username,
      updatedAt: new Date(response.data.updated_at).toLocaleString(),
      version: response.data.version,
      tags: response.data.tags,
      isFolder: isFolder,
      likes: 0,  // API 可能需要单独的接口获取点赞数
      comments: []  // 将在单独的调用中获取评论
    })
    
    // 如果是文件夹，尝试获取该文件夹下的子页面
    if (isFolder) {
      try {
        const childrenResponse = await WikiAPI.getPages({
          specific_parent_id: pageId,
          page_size: 50
        })
        
        // 存储子页面信息
        if (childrenResponse.data.results) {
          pages.value[pageId].children = childrenResponse.data.results.map(child => ({
            id: child.id,
            title: child.title,
            isFolder: child.is_folder || false
          }))
        }
      } catch (childError) {
        console.error('获取子页面失败:', childError)
        pages.value[pageId].children = []
      }
    }
    
    // 获取页面评论
    if (!isFolder) {
      loadComments(pageId)
    }
    
    pageNotFound.value = false
  } catch (error) {
    console.error('获取页面失败:', error)
    
    // 如果是404错误，显示页面不存在
    if (error.response && error.response.status === 404) {
      pageNotFound.value = true
    }
  } finally {
    loading.value = false
  }
}

// 加载页面评论
const loadComments = async (pageId) => {
  try {
    const response = await WikiAPI.getComments(pageId)
    
    if (pages.value[pageId]) {
      // 转换评论数据格式
      pages.value[pageId].comments = response.data.results.map(comment => ({
        id: comment.id,
        author: comment.created_by.username,
        content: comment.content,
        date: new Date(comment.created_at).toLocaleDateString()
      }))
    }
  } catch (error) {
    console.error('获取评论失败:', error)
    // 评论加载失败时，保持空数组
    if (pages.value[pageId]) {
      pages.value[pageId].comments = []
    }
  }
}

// Wiki功能函数
const createPage = () => {
  console.log('创建新页面')
  
  // 如果当前在查看文件夹，传递该文件夹ID作为父级
  if (currentPage.value !== 'home' && pages.value[currentPage.value] && pages.value[currentPage.value].isFolder) {
    router.push({
      path: '/knowledge/create',
      query: { 
        parent_folder: currentPage.value,
        parent_category: pages.value[currentPage.value].parentId
      }
    })
  } else {
    // 否则，导航到常规的创建页面
    router.push('/knowledge/create')
  }
}

const editPage = () => {
  if (!currentPage.value || currentPage.value === 'home') return
  
  console.log('编辑当前页面:', currentPage.value)
  
  // 导航到页面编辑组件
  router.push(`/knowledge/edit/${currentPage.value}`)
}

// 历史版本数据
const historyVersions = ref([])
const showHistoryDialog = ref(false)

const showHistory = async () => {
  if (!currentPage.value || currentPage.value === 'home') return
  
  console.log('查看页面历史版本:', currentPage.value)
  
  try {
    // 获取页面历史版本
    const response = await WikiAPI.getPageHistory(currentPage.value)
    
    historyVersions.value = response.data.results
    showHistoryDialog.value = true
  } catch (error) {
    console.error('获取历史版本失败:', error)
    alert('获取历史版本失败，请稍后再试')
  }
}

// 查看特定版本
const viewVersion = async (version) => {
  if (!currentPage.value) return
  
  try {
    // 获取特定版本的页面
    const response = await WikiAPI.getPageVersion(currentPage.value, version)
    
    // 临时存储当前版本
    const currentVersion = { ...pages.value[currentPage.value] }
    
    // 更新页面显示为历史版本
    pages.value[currentPage.value] = {
      ...currentVersion,
      content: response.data.content,
      title: response.data.title,
      version: response.data.version,
      updatedAt: new Date(response.data.updated_at).toLocaleString(),
      updatedBy: response.data.updated_by.username
    }
    
    // 关闭历史对话框
    showHistoryDialog.value = false
    
    // 显示版本提示
    alert(`正在查看版本 ${version}`)
  } catch (error) {
    console.error('获取特定版本失败:', error)
    alert('获取版本内容失败，请稍后再试')
  }
}

const openSettings = () => {
  console.log('打开Wiki设置')
  alert('打开Wiki系统设置')
  
  // 这里后续会实现设置页面
}

const showStats = () => {
  console.log('查看统计数据')
  alert('查看知识库使用统计，包括浏览量、贡献者等')
  
  // 这里后续会实现统计功能
}

const searchByTag = (tag) => {
  console.log('按标签搜索:', tag)
  searchQuery.value = tag
  performSearch()
  
  // 这里后续会实现按标签搜索
}

// 搜索结果
const searchResults = ref([])
const isSearching = ref(false)
const showSearchResults = ref(false)

// 搜索函数
const performSearch = async () => {
  if (!searchQuery.value) return
  
  console.log('执行搜索:', searchQuery.value)
  isSearching.value = true
  showSearchResults.value = true
  
  try {
    const response = await WikiAPI.search({
      query: searchQuery.value
    })
    
    searchResults.value = response.data.results
    console.log('搜索结果:', searchResults.value)
  } catch (error) {
    console.error('搜索失败:', error)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

// 互动功能
const likePage = async () => {
  if (!currentPageData.value) return
  
  console.log('点赞页面:', currentPageData.value.title)
  
  try {
    // 假设后端有一个点赞API
    // 真实实现需要调整为实际的API
    // await WikiAPI.likePage(currentPage.value)
    
    // 临时方案：增加本地点赞计数
    currentPageData.value.likes++
  } catch (error) {
    console.error('点赞失败:', error)
  }
}

const sharePage = () => {
  if (!currentPageData.value) return
  
  console.log('分享页面:', currentPage.value)
  
  // 创建共享链接
  const shareUrl = `${window.location.origin}/knowledge/${currentPage.value}`
  
  // 这里可以实现分享到社交媒体或复制到剪贴板
  try {
    navigator.clipboard.writeText(shareUrl)
    alert(`已复制分享链接到剪贴板: ${shareUrl}`)
  } catch (error) {
    alert(`分享链接: ${shareUrl}`)
  }
}

const addComment = async () => {
  if (!newComment.value || !currentPageData.value) return
  
  console.log('添加评论:', newComment.value)
  
  try {
    // 调用API添加评论
    const response = await WikiAPI.addComment(currentPage.value, {
      content: newComment.value
    })
    
    // 将新评论添加到当前页面的评论列表
    currentPageData.value.comments.push({
      id: response.data.id,
      author: response.data.created_by.username,
      content: response.data.content,
      date: new Date(response.data.created_at).toLocaleDateString()
    })
    
    // 清空输入
    newComment.value = ''
  } catch (error) {
    console.error('添加评论失败:', error)
    alert('添加评论失败，请稍后再试')
  }
}

// 加载侧边导航结构
const loadNavigationStructure = async () => {
  try {
    // 获取所有页面数据
    const allPagesResponse = await WikiAPI.getPages({
      page_size: 100  // 获取足够的页面数量
    })
    
    // 清空当前导航结构
    navPages.value = {
      tech: [],
      userGuides: [],
      faq: [],
      bestPractices: []
    }
    
    // 处理API返回的页面数据
    const allPages = allPagesResponse.data.results || []
    console.log('获取到所有页面:', allPages.length)
    
    // 转换页面数据，添加文件夹标记和子页面数组
    const processedPages = allPages.map(page => {
      return {
        id: page.id,
        title: page.title,
        parentId: parseInt(page.parent_id, 10),
        isFolder: page.is_folder || false,
        children: [],
        // 如果是文件夹，用于存储子页面
        specificParentId: page.specific_parent_id ? parseInt(page.specific_parent_id, 10) : null
        // 这是文件夹层级结构中的父级ID
      }
    });
    
    // 创建ID到页面的映射，用于快速查找
    const pagesMap = {};
    processedPages.forEach(page => {
      pagesMap[page.id] = page;
      
      // 同时缓存页面数据
      if (!pages.value[page.id]) {
        pages.value[page.id] = {
          id: page.id,
          title: page.title,
          isFolder: page.isFolder,
          // 其他字段会在导航到页面时加载
        }
      }
    });
    
    // 构建层级结构 - 将子页面添加到各自的父文件夹
    processedPages.forEach(page => {
      if (page.specificParentId && pagesMap[page.specificParentId]) {
        // 如果有特定的父文件夹，添加到该文件夹的子页面中
        pagesMap[page.specificParentId].children.push(page);
      }
    });
    
    // 将顶级页面（主分类下的直接子页面）添加到导航结构
    processedPages.forEach(page => {
      // 只处理没有特定父文件夹的页面（顶级页面）
      if (!page.specificParentId) {
        // 根据主分类进行分类
        if (page.parentId === 1) {
          navPages.value.tech.push(page);
        } else if (page.parentId === 2) {
          navPages.value.userGuides.push(page);
        } else if (page.parentId === 3) {
          navPages.value.faq.push(page);
        } else if (page.parentId === 4) {
          navPages.value.bestPractices.push(page);
        }
      }
    })
    
    console.log('导航结构加载完成:', navPages.value)
  } catch (error) {
    console.error('加载导航结构失败:', error)
  }
}

// 加载最近更新的页面
const loadRecentPages = async () => {
  try {
    const response = await WikiAPI.getPages({
      page_size: 5,
      ordering: '-updated_at'  // 按更新时间降序排列
    })
    
    // 清空现有数据
    recentPages.value = []
    
    // 转换数据格式
    if (response.data.results && response.data.results.length > 0) {
      recentPages.value = response.data.results.map(page => {
        // 根据parent_id确定页面类型
        let icon = 'mdi-file-document';
        let color = 'grey';
        
        // 确保parent_id是数字类型进行比较
        const parentId = parseInt(page.parent_id, 10);
        
        if (parentId === 1) {
          icon = 'mdi-code-tags';
          color = 'blue';
        } else if (parentId === 2) {
          icon = 'mdi-book-open';
          color = 'orange';
        } else if (parentId === 3) {
          icon = 'mdi-help-circle';
          color = 'purple';
        } else if (parentId === 4) {
          icon = 'mdi-star';
          color = 'green';
        }
        
        return {
          id: page.id,
          title: page.title,
          updatedAt: new Date(page.updated_at).toLocaleString(),
          updatedBy: page.updated_by ? page.updated_by.username : '未知用户',
          icon: icon,
          color: color
        };
      });
    }
    
    console.log('加载了最近更新页面:', recentPages.value.length);
  } catch (error) {
    console.error('加载最近更新页面失败:', error);
    recentPages.value = []; // 出错时清空数据
  }
}

// 根据页面路径获取图标
const getPageIcon = (path) => {
  if (!path) return 'mdi-file-document'
  
  if (path.includes('technical') || path.includes('tech')) return 'mdi-code-tags'
  if (path.includes('user') || path.includes('guide')) return 'mdi-book-open'
  if (path.includes('faq') || path.includes('question')) return 'mdi-help-circle'
  
  return 'mdi-file-document'
}

// 根据页面路径获取颜色
const getPageColor = (path) => {
  if (!path) return 'grey'
  
  if (path.includes('technical') || path.includes('tech')) return 'blue'
  if (path.includes('user') || path.includes('guide')) return 'orange'
  if (path.includes('faq') || path.includes('question')) return 'purple'
  
  return 'grey'
}

// 加载热门标签
const loadPopularTags = async () => {
  try {
    const response = await WikiAPI.getTags()
    
    // 转换标签数据
    const tags = response.data.results.slice(0, 8)
    
    // 设置标签数据
    popularTags.value = tags.map((tag, index) => ({
      id: index + 1,
      name: tag.name,
      count: tag.count,
      icon: getTagIcon(tag.name),
      color: getTagColor(index)
    }))
  } catch (error) {
    console.error('加载标签失败:', error)
    // 保持初始数据
  }
}

// 为标签选择图标
const getTagIcon = (tagName) => {
  const tagLower = tagName.toLowerCase()
  
  if (tagLower.includes('vue')) return 'mdi-vuejs'
  if (tagLower.includes('js') || tagLower.includes('javascript')) return 'mdi-language-javascript'
  if (tagLower.includes('guide') || tagLower.includes('新手')) return 'mdi-baby-face'
  if (tagLower.includes('api')) return 'mdi-api'
  if (tagLower.includes('best') || tagLower.includes('最佳')) return 'mdi-star'
  if (tagLower.includes('trouble') || tagLower.includes('故障')) return 'mdi-wrench'
  if (tagLower.includes('performance') || tagLower.includes('性能')) return 'mdi-speedometer'
  if (tagLower.includes('security') || tagLower.includes('安全')) return 'mdi-shield-check'
  
  return 'mdi-tag'
}

// 为标签选择颜色
const getTagColor = (index) => {
  const colors = ['green', 'yellow', 'blue', 'purple', 'orange', 'red', 'teal', 'indigo']
  return colors[index % colors.length]
}

// 更新统计数据
const updateStatistics = async () => {
  try {
    // 获取所有页面来统计数量
    const response = await WikiAPI.getPages({
      page_size: 1  // 只需要总数
    })
    
    // 更新文章总数
    if (response && response.data && response.data.count !== undefined) {
      totalArticles.value = response.data.count
    } else {
      totalArticles.value = 0
      console.warn('未能获取文章总数')
    }
    
    try {
      // 获取标签统计
      const tagsResponse = await WikiAPI.getTags()
      if (tagsResponse && tagsResponse.data && tagsResponse.data.count !== undefined) {
        totalTags.value = tagsResponse.data.count
      } else {
        totalTags.value = 0
        console.warn('未能获取标签总数')
      }
    } catch (tagError) {
      console.error('获取标签统计失败:', tagError)
      totalTags.value = 0
    }
    
    // 最后更新时间
    if (recentPages.value && recentPages.value.length > 0) {
      const latestPage = recentPages.value[0]
      if (latestPage && latestPage.updatedAt) {
        lastUpdateTime.value = latestPage.updatedAt.split(' ')[0] // 只取日期部分
      } else {
        lastUpdateTime.value = '暂无更新'
      }
    } else {
      lastUpdateTime.value = '暂无更新'
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    // 设置默认值
    totalArticles.value = 0
    totalTags.value = 0
    lastUpdateTime.value = '暂无更新'
  }
}

// 初始化
onMounted(async () => {
  console.log('Wiki知识中心页面挂载完成')
  
  loading.value = true
  
  try {
    // 并行加载数据
    await Promise.all([
      loadNavigationStructure().catch(err => {
        console.error('导航结构加载失败:', err)
        return null
      }),
      loadRecentPages().catch(err => {
        console.error('最近更新页面加载失败:', err)
        return null
      }),
      loadPopularTags().catch(err => {
        console.error('热门标签加载失败:', err)
        return null
      })
    ])
    
    // 更新统计数据
    await updateStatistics().catch(err => {
      console.error('统计数据更新失败:', err)
      return null
    })
    
    console.log('页面加载完成')
  } catch (error) {
    console.error('页面加载出错:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* Wiki布局 */
.wiki-layout {
  display: flex;
  min-height: calc(100vh - 64px);
}

.wiki-sidebar {
  border-right: 1px solid rgba(0, 0, 0, 0.12);
}

.wiki-content {
  flex: 1;
  overflow: auto;
}

.wiki-toolbar {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background-color: rgba(var(--v-theme-surface), 1);
}

.wiki-container {
  max-width: 1100px;
  margin: 0 auto;
}

.wiki-nav {
  margin-top: 8px;
}

/* 搜索 */
.search-card {
  transition: all 0.3s;
}

.search-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1) !important;
}

/* 导航项 */
.v-list-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.v-card-title {
  font-weight: 600;
}

/* 快速访问卡片 */
.action-card {
  transition: all 0.3s ease;
  cursor: pointer;
  border-radius: 12px;
  height: 100%;
}

.action-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

/* Markdown内容 */
.markdown-content {
  line-height: 1.6;
  font-size: 16px;
}

.markdown-content h1 {
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.markdown-content h2 {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-weight: 500;
}

.markdown-content h3 {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  font-weight: 500;
}

.markdown-content pre {
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  font-family: monospace;
}

.markdown-content code {
  font-family: monospace;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.9em;
}

.markdown-content ul, .markdown-content ol {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.markdown-content li {
  margin-bottom: 0.5rem;
}

.markdown-content a {
  color: var(--v-theme-primary);
  text-decoration: none;
}

.markdown-content a:hover {
  text-decoration: underline;
}

.markdown-content p {
  margin-bottom: 1rem;
}

/* 标签 */
.tag-chip {
  transition: all 0.2s ease;
  cursor: pointer;
}

.tag-chip:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style>

<route>
{
  name: 'knowledge',
  meta: {
    requiresAuth: false,
    layout: 'default',
    title: '知识中心'
  }
}
</route>
