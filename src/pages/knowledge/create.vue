<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-4">{{ isNewArticle ? '创建文章' : '编辑文章' }}</h1>
        <v-chip
          v-if="parentFolderId"
          color="primary"
          variant="outlined"
          class="mb-4"
          prepend-icon="mdi-folder"
        >
          将在文件夹中创建
        </v-chip>
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
        
        <!-- 文件夹选项 -->
        <v-switch
          v-model="article.isFolder"
          color="primary"
          label="创建为文件夹"
          hint="文件夹可以包含其他文章或子文件夹"
          persistent-hint
          class="mb-4"
        ></v-switch>
        
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
          v-if="!article.isFolder"
          v-model="article.summary"
          label="文章摘要"
          variant="outlined"
          rows="2"
          counter="200"
          :rules="[rules.required, v => v.length <= 200 || '摘要不能超过200个字符']"
          class="mb-4"
        ></v-textarea>
        
        <!-- 内容编辑器 -->
        <div v-if="!article.isFolder" class="mb-4">
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
        
        <!-- 操作按钮 -->
        <v-card-actions class="pt-4">
          <v-btn
            variant="text"
            :to="{ name: 'knowledge' }"
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
            {{ isNewArticle ? '发布文章' : '更新文章' }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { WikiAPI } from '@/api';
// 导入 Markdown 渲染库
import { marked } from 'marked';

// 路由
const route = useRoute();
const router = useRouter();

// 表单状态
const form = ref(null);
const valid = ref(false);
const saving = ref(false);
const previewMode = ref('edit');

// 获取父级文件夹信息（如果有）
const parentFolderId = route.query.parent_folder;
const parentCategoryId = route.query.parent_category;

// 判断是新建还是编辑
const isNewArticle = computed(() => !route.params.id);

// 文章数据
const article = reactive({
  id: null,
  title: '',
  summary: '',
  content: '',
  category: '',
  tags: [],
  status: 'draft',
  isFolder: false // 是否为文件夹
});

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
  try {
    // 使用 Markdown 渲染库转换内容
    const renderedMarkdown = marked(article.content);
    return renderedMarkdown;
  } catch (error) {
    console.error('Markdown 渲染失败:', error);
    return article.content;
  }
});

// 格式化文本
const formatText = (format) => {
  // 在实际实现中，可以根据选择的格式在文本区域插入相应的格式标记
  // 这里只是示例，实际应用中可能需要更复杂的处理
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
  
  // 如果是文件夹，不需要验证摘要和内容
  if (article.isFolder) {
    // 验证通过，继续保存
  } else if (!article.summary || !article.content) {
    alert('请填写摘要和内容');
    return;
  }
  
  saving.value = true;
  
  try {
    // 准备API请求数据
    const pageData = {
      title: article.title,
      content: article.isFolder ? '' : `# ${article.title}\n\n${article.summary}\n\n${article.content}`,
      tags: article.tags,
      // 将分类转换为父页面ID或路径
      parent_id: getCategoryParentId(article.category),
      // 添加文件夹标记
      is_folder: article.isFolder
    };
    
    // 如果有父级文件夹，添加特定父级ID
    if (parentFolderId) {
      pageData.specific_parent_id = parentFolderId;
    }
    
    let response;
    
    if (isNewArticle.value) {
      // 调用API创建新页面
      response = await WikiAPI.createPage(pageData);
      console.log('创建文章成功:', response.data);
      
      // 保存返回的ID
      article.id = response.data.id;
      
      // 提示成功
      alert('文章创建成功');
    } else {
      // 调用API更新页面
      response = await WikiAPI.updatePage(article.id, pageData);
      console.log('更新文章成功:', response.data);
      
      // 提示成功
      alert('文章更新成功');
    }
    
    // 如果是发布状态，跳转到文章详情页
    if (article.status === 'published') {
      router.push({ name: 'knowledge-article', params: { id: article.id } });
    } else {
      // 如果是草稿状态，返回知识中心首页
      router.push({ name: 'knowledge' });
    }
  } catch (error) {
    console.error('保存文章失败:', error);
    
    // 显示详细错误信息
    if (error.response && error.response.data && error.response.data.error) {
      alert(`保存失败: ${error.response.data.error.message}`);
    } else {
      alert('保存失败，请重试');
    }
  } finally {
    saving.value = false;
  }
}

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

// 获取文章数据（编辑模式）
const fetchArticle = async (id) => {
  try {
    // 调用API获取页面详情
    const response = await WikiAPI.getPage(id);
    
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
      updated_at: pageData.updated_at,
      status: 'published' // 假设已获取的页面都是已发布状态
    });
  } catch (error) {
    console.error('获取文章失败:', error);
    
    // 显示详细错误信息
    if (error.response && error.response.data && error.response.data.error) {
      alert(`获取文章失败: ${error.response.data.error.message}`);
    } else {
      alert('获取文章数据失败');
    }
    
    router.push({ name: 'knowledge' });
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

// 初始化
onMounted(() => {
  if (!isNewArticle.value) {
    fetchArticle(route.params.id);
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

.article-preview :deep(img) {
  max-width: 100%;
  height: auto;
  margin: 1rem 0;
  border-radius: 8px;
}

.article-preview :deep(blockquote) {
  border-left: 4px solid var(--v-primary-base);
  padding-left: 1rem;
  font-style: italic;
  color: rgba(0, 0, 0, 0.6);
  margin: 1rem 0;
}

.article-preview :deep(code) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: monospace;
}

.article-preview :deep(pre) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 1rem;
  border-radius: 8px;
  overflow: auto;
  margin: 1rem 0;
}
</style>

<route>
{
  name: 'knowledge-create',
  path: '/knowledge/create',
  meta: {
    requiresAuth: true,
    layout: 'default',
    title: '创建文章'
  }
}
</route>
