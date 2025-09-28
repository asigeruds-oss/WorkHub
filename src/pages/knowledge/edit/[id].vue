<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-6">编辑文章</h1>
      </v-col>
    </v-row>

    <v-card class="pa-6">
      <v-form ref="form" v-model="valid" @submit.prevent="saveArticle">
        <!-- 标题 -->
        <v-text-field
          v-model="article.title"
          label="文章标题"
          variant="outlined"
          :rules="[rules.required]"
          class="mb-4"
        ></v-text-field>
        
        <!-- 分类和标签 -->
        <v-row>
          <v-col cols="12" md="6">
            <v-select
              v-model="article.category"
              label="分类"
              :items="categoryOptions"
              variant="outlined"
              :rules="[rules.required]"
            ></v-select>
          </v-col>
          
          <v-col cols="12" md="6">
            <v-autocomplete
              v-model="article.tags"
              label="标签"
              :items="tagOptions"
              variant="outlined"
              multiple
              chips
              closable-chips
            ></v-autocomplete>
          </v-col>
        </v-row>
        
        <!-- 摘要 -->
        <v-textarea
          v-model="article.summary"
          label="文章摘要"
          variant="outlined"
          rows="2"
          counter="200"
          :rules="[rules.required, v => v.length <= 200 || '摘要不能超过200个字符']"
          class="mb-4"
        ></v-textarea>
        
        <!-- 内容编辑器 -->
        <div class="mb-4">
          <label class="text-subtitle-1 font-weight-medium mb-2 d-block">文章内容</label>
          
          <!-- 编辑器工具栏 -->
          <v-card class="mb-2 pa-2 d-flex flex-wrap align-center editor-toolbar" flat>
            <v-btn-group variant="outlined" class="mr-2 mb-2">
              <v-btn icon="mdi-format-bold" @click="formatText('bold')" small></v-btn>
              <v-btn icon="mdi-format-italic" @click="formatText('italic')" small></v-btn>
              <v-btn icon="mdi-format-underline" @click="formatText('underline')" small></v-btn>
            </v-btn-group>
            
            <v-btn-group variant="outlined" class="mr-2 mb-2">
              <v-btn icon="mdi-format-header-1" @click="formatText('h1')" small></v-btn>
              <v-btn icon="mdi-format-header-2" @click="formatText('h2')" small></v-btn>
              <v-btn icon="mdi-format-header-3" @click="formatText('h3')" small></v-btn>
            </v-btn-group>
            
            <v-btn-group variant="outlined" class="mr-2 mb-2">
              <v-btn icon="mdi-format-list-bulleted" @click="formatText('ul')" small></v-btn>
              <v-btn icon="mdi-format-list-numbered" @click="formatText('ol')" small></v-btn>
            </v-btn-group>
            
            <v-btn-group variant="outlined" class="mr-2 mb-2">
              <v-btn icon="mdi-link" @click="formatText('link')" small></v-btn>
              <v-btn icon="mdi-image" @click="formatText('image')" small></v-btn>
              <v-btn icon="mdi-code-tags" @click="formatText('code')" small></v-btn>
            </v-btn-group>
          </v-card>
          
          <!-- 内容编辑区域 -->
          <v-textarea
            v-model="article.content"
            variant="outlined"
            rows="15"
            :rules="[rules.required]"
            hide-details
            class="content-editor"
            placeholder="在此输入文章内容..."
          ></v-textarea>
          
          <!-- 预览切换 -->
          <div class="d-flex justify-end mt-2">
            <v-btn-toggle v-model="previewMode" rounded="lg" mandatory>
              <v-btn value="edit" size="small">编辑</v-btn>
              <v-btn value="preview" size="small">预览</v-btn>
            </v-btn-toggle>
          </div>
          
          <!-- 内容预览区域 -->
          <v-card v-if="previewMode === 'preview'" class="mt-4 pa-6 preview-card">
            <div class="article-preview">
              <div v-html="renderedContent"></div>
            </div>
          </v-card>
        </div>
        
        <!-- 版本历史 -->
        <v-expansion-panels class="mb-6">
          <v-expansion-panel title="版本历史">
            <template v-slot:text>
              <v-list lines="two">
                <v-list-item
                  v-for="(version, index) in versions"
                  :key="index"
                  :title="`版本 ${version.version}`"
                  :subtitle="`${formatDate(version.date)} · ${version.author}`"
                >
                  <template v-slot:append>
                    <v-btn
                      variant="text"
                      color="primary"
                      size="small"
                      @click="restoreVersion(version)"
                    >
                      还原
                    </v-btn>
                  </template>
                </v-list-item>
              </v-list>
            </template>
          </v-expansion-panel>
        </v-expansion-panels>
        
        <!-- 操作按钮 -->
        <v-card-actions class="pt-4">
          <v-btn
            variant="text"
            :to="{ name: 'knowledge-article', params: { id: articleId } }"
          >
            取消
          </v-btn>
          
          <v-spacer></v-spacer>
          
          <v-btn
            color="primary"
            variant="outlined"
            class="mr-2"
            @click="saveDraft"
          >
            保存草稿
          </v-btn>
          
          <v-btn
            color="primary"
            type="submit"
            :loading="saving"
            :disabled="!valid || saving"
          >
            更新文章
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// 路由
const route = useRoute();
const router = useRouter();
const articleId = computed(() => parseInt(route.params.id));

// 表单状态
const form = ref(null);
const valid = ref(false);
const saving = ref(false);
const previewMode = ref('edit');

// 文章数据
const article = reactive({
  id: null,
  title: '',
  summary: '',
  content: '',
  category: '',
  tags: [],
  status: 'published'
});

// 版本历史
const versions = ref([
  {
    version: 'v1.2',
    date: '2025-09-25T15:30:00',
    author: '系统管理员',
    content: '更新了主要功能说明和使用建议'
  },
  {
    version: 'v1.1',
    date: '2025-09-22T11:15:00',
    author: '系统管理员',
    content: '添加了常见问题章节'
  },
  {
    version: 'v1.0',
    date: '2025-09-20T14:30:00',
    author: '系统管理员',
    content: '创建初始版本'
  }
]);

// 分类选项
const categoryOptions = [
  '技术文档',
  '使用指南',
  '常见问题',
  '最佳实践'
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

// 验证规则
const rules = {
  required: v => !!v || '此字段是必填的'
};

// 渲染内容预览
const renderedContent = computed(() => {
  // 简单的 HTML 预览
  return article.content;
});

// 格式化文本
const formatText = (format) => {
  const formats = {
    bold: '**粗体文本**',
    italic: '*斜体文本*',
    underline: '<u>下划线文本</u>',
    h1: '\n# 一级标题\n',
    h2: '\n## 二级标题\n',
    h3: '\n### 三级标题\n',
    ul: '\n- 列表项 1\n- 列表项 2\n- 列表项 3\n',
    ol: '\n1. 列表项 1\n2. 列表项 2\n3. 列表项 3\n',
    link: '[链接文本](https://example.com)',
    image: '![图片描述](https://example.com/image.jpg)',
    code: '```\n// 代码示例\nconst example = "Hello World";\n```'
  };
  
  article.content += formats[format];
};

// 根据分类获取父页面ID
const getCategoryParentId = (category) => {
  // 这里需要根据实际的分类结构映射到对应的父页面ID
  // 后端期望主键值而不是字符串，使用数字ID
  const categoryMapping = {
    '技术文档': 1,
    '使用指南': 2,
    '常见问题': 3,
    '最佳实践': 4
  };
  
  return categoryMapping[category] || null;
};

// 保存为草稿
const saveDraft = async () => {
  article.status = 'draft';
  await saveArticle();
};

// 保存文章
const saveArticle = async () => {
  if (!form.value.validate()) {
    return;
  }
  
  saving.value = true;
  
  try {
    // 准备API请求数据
    const pageData = {
      title: article.title,
      content: `# ${article.title}\n\n${article.summary}\n\n${article.content}`,
      tags: article.tags,
      // 将分类转换为父页面ID (使用数字ID)
      parent_id: getCategoryParentId(article.category)
    };
    
    // 调用API更新页面
    const response = await WikiAPI.updatePage(article.id, pageData);
    console.log('更新文章成功:', response.data);
    
    // 提示成功
    alert('文章更新成功');
    
    // 跳转到文章详情页
    router.push({ name: 'knowledge-article', params: { id: article.id } });
  } catch (error) {
    console.error('保存文章失败:', error);
    
    // 显示详细错误信息
    if (error.response && error.response.data && error.response.data.error) {
      alert(`保存失败: ${error.response.data.error.message}`);
    } else {
      alert('保存失败，请重试');
    }
    alert('保存失败，请重试');
  } finally {
    saving.value = false;
  }
};

// 还原版本
const restoreVersion = (version) => {
  if (confirm(`确定要还原到 ${version.version} 版本吗？当前未保存的更改将丢失。`)) {
    console.log('还原到版本:', version);
    // 这里应该从服务器获取历史版本内容
    alert(`已还原到版本 ${version.version}`);
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

// 获取文章数据
const fetchArticle = async (id) => {
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 模拟文章数据
    const fetchedArticle = {
      id: parseInt(id),
      title: '如何使用本系统的知识中心功能',
      summary: '本文详细介绍了知识中心的各项功能及使用方法，帮助您快速上手。',
      content: `
## 知识中心介绍
知识中心是一个集中管理和共享团队知识的平台。您可以在这里创建、编辑和查询各类文档和资源。

## 主要功能
知识中心提供以下主要功能：
- 文章创建与编辑
- 分类和标签管理
- 全文搜索
- 版本历史

### 文章创建
点击"创建文章"按钮开始创建新文章。您可以使用富文本编辑器添加格式化文本、图片和链接。

### 分类和标签
为您的文章添加适当的分类和标签，以便其他用户更容易找到相关内容。

## 使用建议
以下是一些使用知识中心的最佳实践：
1. 使用清晰、描述性的标题
2. 添加详细而准确的内容
3. 适当使用标题层级
4. 定期更新过时的内容

## 常见问题
如果您在使用过程中遇到问题，请查看常见问题解答或联系系统管理员获取帮助。`,
      category: '使用指南',
      tags: ['使用指南', '入门', '文档'],
      status: 'published'
    };
    
    // 更新表单数据
    Object.assign(article, fetchedArticle);
  } catch (error) {
    console.error('获取文章失败:', error);
    alert('获取文章数据失败');
    router.push({ name: 'knowledge' });
  }
};

// 初始化
onMounted(() => {
  if (articleId.value) {
    fetchArticle(articleId.value);
  }
});
</script>

<style scoped>
.editor-toolbar {
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
}

.content-editor {
  font-family: monospace;
}

.preview-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.article-preview {
  line-height: 1.8;
  font-size: 16px;
}

.article-preview :deep(h2) {
  font-size: 1.75rem;
  font-weight: 600;
  margin: 1.5rem 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.article-preview :deep(h3) {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 1.5rem 0 1rem;
}

.article-preview :deep(p) {
  margin-bottom: 1rem;
}

.article-preview :deep(ul), .article-preview :deep(ol) {
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

.article-preview :deep(li) {
  margin-bottom: 0.5rem;
}
</style>

<route>
{
  name: 'knowledge-edit',
  path: '/knowledge/edit/:id',
  meta: {
    requiresAuth: true,
    layout: 'default',
    title: '编辑文章'
  }
}
</route>
