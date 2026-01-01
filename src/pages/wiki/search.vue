<template>
  <v-container>
    <div class="d-flex align-center mb-6">
      <v-btn icon="mdi-arrow-left" variant="text" @click="$router.back()" />
      <h1 class="text-h4 font-weight-bold ml-4">搜索结果</h1>
    </div>

    <!-- 搜索表单 -->
    <v-card class="mb-6">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchForm.query"
              label="搜索关键词"
              variant="outlined"
              prepend-inner-icon="mdi-magnify"
              clearable
              @keyup.enter="performSearch"
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchForm.tags"
              label="标签（用逗号分隔）"
              variant="outlined"
              prepend-inner-icon="mdi-tag"
              clearable
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-btn
              color="primary"
              size="large"
              block
              @click="performSearch"
              :loading="loading"
            >
              搜索
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 搜索结果 -->
    <div v-if="searchPerformed">
      <!-- 结果统计 -->
      <div class="mb-4">
        <p class="text-body-1 text-medium-emphasis">
          找到 {{ searchResults.count || 0 }} 个结果
          <span v-if="searchForm.query">
            包含 "<strong>{{ searchForm.query }}</strong
            >"
          </span>
        </p>
      </div>

      <!-- 结果列表 -->
      <div v-if="searchResults.results && searchResults.results.length > 0">
        <v-card
          v-for="result in searchResults.results"
          :key="result.id"
          class="mb-4"
          @click="navigateToPage(result.id)"
          style="cursor: pointer"
        >
          <v-card-text>
            <div class="d-flex align-start">
              <div class="flex-grow-1">
                <h3 class="text-h6 font-weight-bold mb-2">
                  {{ result.title }}
                </h3>

                <!-- 路径面包屑 -->
                <div class="mb-2">
                  <v-chip
                    size="small"
                    variant="outlined"
                    prepend-icon="mdi-folder"
                  >
                    {{ result.path }}
                  </v-chip>
                </div>

                <!-- 内容摘要 -->
                <div
                  v-if="result.snippet"
                  class="text-body-2 mb-3"
                  v-html="result.snippet"
                />

                <!-- 相关性评分 -->
                <div class="d-flex align-center">
                  <v-icon size="small" class="mr-1">mdi-star</v-icon>
                  <span class="text-caption">
                    相关性: {{ Math.round(result.relevance * 100) }}%
                  </span>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="ml-4">
                <v-btn
                  icon="mdi-open-in-new"
                  variant="text"
                  size="small"
                  @click.stop="openInNewTab(result.id)"
                />
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- 分页 -->
        <div v-if="searchResults.count > pageSize" class="text-center mt-6">
          <v-pagination
            v-model="currentPage"
            :length="Math.ceil(searchResults.count / pageSize)"
            @update:model-value="onPageChange"
          />
        </div>
      </div>

      <!-- 无结果 -->
      <div v-else class="text-center py-8">
        <v-icon size="80" color="grey">mdi-file-search-outline</v-icon>
        <h3 class="text-h5 mt-4 mb-2">未找到相关结果</h3>
        <p class="text-body-1 text-medium-emphasis mb-4">
          请尝试使用不同的关键词或标签进行搜索
        </p>
        <v-btn color="primary" @click="clearSearch"> 清空搜索条件 </v-btn>
      </div>
    </div>

    <!-- 未执行搜索时的提示 -->
    <div v-else class="text-center py-8">
      <v-icon size="80" color="primary">mdi-magnify</v-icon>
      <h3 class="text-h5 mt-4 mb-2">开始搜索</h3>
      <p class="text-body-1 text-medium-emphasis">
        输入关键词或标签来搜索Wiki页面
      </p>
    </div>

    <!-- 加载状态 -->
    <v-overlay v-model="loading" class="d-flex align-center justify-center">
      <v-progress-circular indeterminate color="primary" />
    </v-overlay>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import WikiAPI from "@/api/wiki";

const router = useRouter();
const route = useRoute();

// 状态
const loading = ref(false);
const searchPerformed = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);

// 搜索表单
const searchForm = ref({
  query: "",
  tags: "",
  path: "",
});

// 搜索结果
const searchResults = ref({
  count: 0,
  results: [],
});

// 方法
const performSearch = async () => {
  if (!searchForm.value.query.trim() && !searchForm.value.tags.trim()) {
    return;
  }

  loading.value = true;
  searchPerformed.value = true;

  try {
    const params = {
      limit: pageSize.value,
      page: currentPage.value,
    };

    if (searchForm.value.query.trim()) {
      params.query = searchForm.value.query.trim();
    }

    if (searchForm.value.tags.trim()) {
      params.tags = searchForm.value.tags.trim();
    }

    if (searchForm.value.path.trim()) {
      params.path = searchForm.value.path.trim();
    }

    const response = await WikiAPI.searchPages(params);
    searchResults.value = response.data;

    // 更新URL
    updateURL();
  } catch (error) {
    console.error("搜索失败:", error);
    searchResults.value = { count: 0, results: [] };
  } finally {
    loading.value = false;
  }
};

const clearSearch = () => {
  searchForm.value = { query: "", tags: "", path: "" };
  searchResults.value = { count: 0, results: [] };
  searchPerformed.value = false;
  currentPage.value = 1;
  updateURL();
};

const navigateToPage = (pageId) => {
  router.push(`/wiki/${pageId}`);
};

const openInNewTab = (pageId) => {
  const url = router.resolve(`/wiki/${pageId}`).href;
  window.open(url, "_blank");
};

const onPageChange = (page) => {
  currentPage.value = page;
  performSearch();
};

const updateURL = () => {
  const query = {};

  if (searchForm.value.query) {
    query.q = searchForm.value.query;
  }

  if (searchForm.value.tags) {
    query.tags = searchForm.value.tags;
  }

  if (searchForm.value.path) {
    query.path = searchForm.value.path;
  }

  if (currentPage.value > 1) {
    query.page = currentPage.value;
  }

  router.replace({ query });
};

const loadFromURL = () => {
  const query = route.query;

  searchForm.value.query = query.q || "";
  searchForm.value.tags = query.tags || "";
  searchForm.value.path = query.path || "";
  currentPage.value = parseInt(query.page) || 1;

  if (
    searchForm.value.query ||
    searchForm.value.tags ||
    searchForm.value.path
  ) {
    performSearch();
  }
};

// 监听路由变化
watch(() => route.query, loadFromURL);

// 组件挂载
onMounted(() => {
  loadFromURL();
});
</script>

<route>
{
  name: 'wiki-search',
  path: '/wiki/search',
  meta: {
    requiresAuth: false,
    layout: 'wiki',
    title: 'Wiki 搜索'
  }
}
</route>
