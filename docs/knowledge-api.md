# 知识中心 Wiki API 文档

## 概述
知识中心 Wiki 系统提供完整的 RESTful API，允许开发者以编程方式访问和管理 Wiki 内容。本文档详细介绍了可用的 API 端点、参数和响应格式。

## 基础 URL
所有 API 请求的基础 URL 为: `https://api.example.com/v1/wiki`

## 认证
所有 API 请求需要在 HTTP 头部包含有效的 JWT 令牌:
```
Authorization: Bearer <token>
```

## API 端点

### 页面管理

#### 获取页面
```
GET /pages/{pageId}
```

**参数:**
- `pageId` (路径): 页面的唯一标识符

**响应示例:**
```json
{
  "id": "page-123",
  "title": "Vue.js 最佳实践",
  "content": "# Vue.js 最佳实践\n\n这是页面内容，支持 Markdown 格式...",
  "path": "/technical/frontend/vue",
  "parentId": "page-100",
  "createdBy": "user-456",
  "createdAt": "2024-05-15T08:30:00Z",
  "updatedAt": "2024-09-20T14:22:30Z",
  "version": 8,
  "tags": ["vue", "javascript", "frontend"],
  "permissions": {
    "read": ["all"],
    "edit": ["team-frontend"]
  }
}
```

#### 创建页面
```
POST /pages
```

**请求体:**
```json
{
  "title": "新页面标题",
  "content": "页面内容 Markdown",
  "parentId": "page-100",
  "tags": ["tag1", "tag2"],
  "permissions": {
    "read": ["all"],
    "edit": ["team-dev"]
  }
}
```

**响应:** 与获取页面相同，返回新创建的页面数据

#### 更新页面
```
PUT /pages/{pageId}
```

**请求体:**
与创建页面相同，但只需要包含要更新的字段

#### 删除页面
```
DELETE /pages/{pageId}
```

### 版本历史

#### 获取页面历史版本
```
GET /pages/{pageId}/history
```

**参数:**
- `pageId` (路径): 页面的唯一标识符
- `limit` (查询): 返回的最大版本数，默认 10
- `offset` (查询): 分页偏移量，默认 0

**响应示例:**
```json
{
  "versions": [
    {
      "version": 8,
      "updatedAt": "2024-09-20T14:22:30Z",
      "updatedBy": "user-789",
      "comment": "更新了代码示例"
    },
    {
      "version": 7,
      "updatedAt": "2024-08-15T09:45:12Z",
      "updatedBy": "user-456",
      "comment": "修正了错别字"
    }
  ],
  "total": 8
}
```

#### 获取特定版本内容
```
GET /pages/{pageId}/history/{version}
```

### 搜索和查询

#### 搜索页面
```
GET /search
```

**参数:**
- `query` (查询): 搜索关键词
- `tags` (查询): 按标签过滤，逗号分隔
- `path` (查询): 按路径前缀过滤

**响应示例:**
```json
{
  "results": [
    {
      "id": "page-123",
      "title": "Vue.js 最佳实践",
      "snippet": "...包含<em>Vue</em>组件的最佳实践...",
      "path": "/technical/frontend/vue",
      "relevance": 0.92
    },
    {
      "id": "page-456",
      "title": "Vue Router 配置指南",
      "snippet": "...正确配置<em>Vue</em> Router...",
      "path": "/technical/frontend/vue-router",
      "relevance": 0.78
    }
  ],
  "total": 24
}
```

### 标签管理

#### 获取所有标签
```
GET /tags
```

#### 获取特定标签的页面
```
GET /tags/{tagName}/pages
```

### 评论和讨论

#### 获取页面评论
```
GET /pages/{pageId}/comments
```

#### 添加评论
```
POST /pages/{pageId}/comments
```

## 状态码

- 200 OK: 请求成功
- 201 Created: 资源创建成功
- 400 Bad Request: 请求参数错误
- 401 Unauthorized: 认证失败
- 403 Forbidden: 权限不足
- 404 Not Found: 资源不存在
- 409 Conflict: 资源冲突，如版本冲突
- 500 Server Error: 服务器内部错误

## 速率限制

API 有请求速率限制，默认为每分钟 60 个请求。超过限制后会返回 429 状态码。

## 批量操作

对于需要批量处理的情况，支持以下端点:

```
POST /pages/batch
POST /tags/batch
```

请参考各自的端点文档获取详细信息。
