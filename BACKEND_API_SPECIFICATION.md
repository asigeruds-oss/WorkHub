# Content Hub 后端API接口规范

## 概述

本文档详细描述了 Content Hub 前端所需的所有后端API接口。后端需要实现这些接口以支持前端的完整功能。

**技术栈建议**:
- RESTful API 设计
- JWT 认证机制
- 支持 CORS 跨域
- 建议使用 Django REST Framework 或类似框架

**通用规范**:
- 所有时间戳使用 ISO 8601 格式（例如：`2025-09-14T10:30:00Z`）
- 分页使用 `page` 和 `page_size` 参数
- 除特别说明外，所有需认证的接口都需要在请求头中包含 JWT Token：`Authorization: Bearer <access_token>`
- 响应格式统一使用 JSON

---

## 目录

1. [认证系统 (Authentication)](#1-认证系统-authentication)
2. [Wiki知识库系统](#2-wiki知识库系统)
3. [项目管理系统](#3-项目管理系统)
4. [待办事项系统](#4-待办事项系统)
5. [留言板系统](#5-留言板系统)
6. [通知设置系统](#6-通知设置系统)
7. [反馈系统](#7-反馈系统)
8. [错误处理规范](#8-错误处理规范)

---

## 1. 认证系统 (Authentication)

### 1.1 用户登录

**端点**: `POST /api/token/`  
**认证**: 无  
**描述**: 用户使用用户名和密码登录，获取访问令牌和刷新令牌

**请求体**:
```json
{
  "username": "string",
  "password": "string"
}
```

**成功响应** (200 OK):
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

### 1.2 用户注册

**端点**: `POST /api/register/`  
**认证**: 无  
**描述**: 注册新用户账号

**请求体**:
```json
{
  "username": "string (必填)",
  "email": "string (必填)",
  "password": "string (必填)",
  "password2": "string (必填, 确认密码)",
  "first_name": "string (可选)",
  "last_name": "string (可选)",
  "gender": "M/F/O (可选)",
  "phone": "string (可选)"
}
```

**成功响应** (201 Created):
```json
{
  "id": 1,
  "username": "string",
  "email": "string",
  "first_name": "string",
  "last_name": "string",
  "gender": "M",
  "phone": "string"
}
```

---

### 1.3 获取当前用户信息

**端点**: `GET /api/me/`  
**认证**: 需要  
**描述**: 获取当前已登录用户的详细信息

**成功响应** (200 OK):
```json
{
  "id": 1,
  "username": "string",
  "email": "string",
  "first_name": "string",
  "last_name": "string",
  "gender": "M",
  "phone": "string",
  "groups": [
    {
      "id": 1,
      "name": "Editors"
    }
  ],
  "is_staff": false,
  "is_superuser": false
}
```

---

### 1.4 刷新访问令牌

**端点**: `POST /api/token/refresh/`  
**认证**: 无  
**描述**: 使用刷新令牌获取新的访问令牌

**请求体**:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**成功响应** (200 OK):
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

### 1.5 验证令牌

**端点**: `POST /api/token/verify/`  
**认证**: 无  
**描述**: 验证访问令牌是否有效

**请求体**:
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**成功响应** (200 OK):
```json
{}
```

**失败响应** (401 Unauthorized):
```json
{
  "detail": "Token is invalid or expired",
  "code": "token_not_valid"
}
```

---

### 1.6 用户组管理

#### 1.6.1 获取用户组列表

**端点**: `GET /api/auth/groups/`  
**认证**: 需要  
**描述**: 获取所有用户组

**成功响应** (200 OK):
```json
{
  "groups": [
    {
      "id": 1,
      "name": "Editors",
      "permissions": ["can_edit", "can_view"]
    }
  ]
}
```

#### 1.6.2 创建用户组

**端点**: `POST /api/auth/groups/`  
**认证**: 需要（管理员）  
**请求体**:
```json
{
  "name": "string"
}
```

**成功响应** (201 Created):
```json
{
  "id": 1,
  "name": "string",
  "permissions": []
}
```

#### 1.6.3 更新用户组

**端点**: `PATCH /api/auth/groups/{groupId}/`  
**认证**: 需要（管理员）  
**请求体**:
```json
{
  "name": "string (可选)",
  "permissions": ["string"] (可选)
}
```

#### 1.6.4 删除用户组

**端点**: `DELETE /api/auth/groups/{groupId}/`  
**认证**: 需要（管理员）

#### 1.6.5 批量删除用户组

**端点**: `POST /api/auth/groups/batch-delete/`  
**认证**: 需要（管理员）  
**请求体**:
```json
{
  "group_ids": [1, 2, 3]
}
```

---

### 1.7 用户组成员管理

#### 1.7.1 获取用户组成员列表

**端点**: `GET /api/auth/groups/{groupId}/users/`  
**认证**: 需要

**成功响应** (200 OK):
```json
{
  "users": [
    {
      "id": 1,
      "username": "string",
      "email": "string"
    }
  ]
}
```

#### 1.7.2 添加用户到用户组

**端点**: `POST /api/auth/groups/{groupId}/users/`  
**认证**: 需要（管理员）  
**请求体**:
```json
{
  "user_id": 1
}
```

#### 1.7.3 从用户组移除用户

**端点**: `DELETE /api/auth/groups/{groupId}/users/{userId}/`  
**认证**: 需要（管理员）

---

### 1.8 用户搜索

**端点**: `GET /api/auth/users/search/`  
**认证**: 需要  
**查询参数**:
- `query`: 搜索关键词（匹配用户名或邮箱）
- `limit`: 返回数量（默认20）
- `offset`: 偏移量（默认0）

**成功响应** (200 OK):
```json
{
  "users": [
    {
      "id": 1,
      "username": "string",
      "email": "string",
      "first_name": "string",
      "last_name": "string"
    }
  ],
  "total": 100
}
```

---

### 1.9 权限管理

#### 1.9.1 获取当前用户权限信息

**端点**: `GET /api/auth/me/permissions/`  
**认证**: 需要

**成功响应** (200 OK):
```json
{
  "user": {
    "id": 1,
    "username": "string",
    "is_staff": false,
    "is_superuser": false
  },
  "groups": [
    {
      "id": 1,
      "name": "Editors"
    }
  ],
  "permissions": ["can_edit", "can_view", "can_delete"]
}
```

#### 1.9.2 获取特定用户的权限信息

**端点**: `GET /api/auth/users/{userId}/permissions/`  
**认证**: 需要（管理员）

#### 1.9.3 修改用户权限

**端点**: `PATCH /api/auth/users/{userId}/permissions/`  
**认证**: 需要（管理员）  
**请求体**:
```json
{
  "is_staff": true,
  "is_superuser": false,
  "permissions": ["can_edit", "can_view"]
}
```

#### 1.9.4 批量设置用户的用户组

**端点**: `PUT /api/auth/users/{userId}/groups/`  
**认证**: 需要（管理员）  
**请求体**:
```json
{
  "group_ids": [1, 2, 3]
}
```

---

### 1.10 统计信息

**端点**: `GET /api/auth/stats/`  
**认证**: 需要（管理员）  
**描述**: 获取权限系统的统计信息

**成功响应** (200 OK):
```json
{
  "total_users": 100,
  "total_groups": 10,
  "active_users": 85
}
```

---

## 2. Wiki知识库系统

### 2.1 页面管理

#### 2.1.1 获取页面列表

**端点**: `GET /api/wiki/pages/`  
**认证**: 需要  
**查询参数**:
- `limit`: 每页数量（默认10，最大100）
- `page`: 页码（默认1）

**成功响应** (200 OK):
```json
{
  "count": 100,
  "next": "http://api.example.com/api/wiki/pages/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "string",
      "content": "string (Markdown)",
      "parent_id": null,
      "path": "/page1",
      "tags": ["tag1", "tag2"],
      "created_at": "2025-09-14T10:30:00Z",
      "updated_at": "2025-09-14T10:30:00Z",
      "created_by": {
        "id": 1,
        "username": "string"
      },
      "updated_by": {
        "id": 1,
        "username": "string"
      }
    }
  ]
}
```

#### 2.1.2 创建页面

**端点**: `POST /api/wiki/pages/`  
**认证**: 需要  
**请求体**:
```json
{
  "title": "string (必填)",
  "content": "string (必填, Markdown格式)",
  "parent_id": 1 (可选),
  "tags": ["tag1", "tag2"] (可选),
  "permissions": {
    "view": ["group_id1", "group_id2"],
    "edit": ["group_id1"]
  } (可选)
}
```

**成功响应** (201 Created):
```json
{
  "id": 1,
  "title": "string",
  "content": "string",
  "parent_id": 1,
  "path": "/parent/page",
  "tags": ["tag1"],
  "permissions": {},
  "created_at": "2025-09-14T10:30:00Z",
  "updated_at": "2025-09-14T10:30:00Z",
  "created_by": {
    "id": 1,
    "username": "string"
  }
}
```

#### 2.1.3 获取页面详情

**端点**: `GET /api/wiki/pages/{id}/`  
**认证**: 需要  
**描述**: 获取指定页面的详细信息

**成功响应** (200 OK):
```json
{
  "id": 1,
  "title": "string",
  "content": "string (Markdown)",
  "parent_id": null,
  "path": "/page1",
  "tags": ["tag1", "tag2"],
  "permissions": {
    "view": [1, 2],
    "edit": [1]
  },
  "created_at": "2025-09-14T10:30:00Z",
  "updated_at": "2025-09-14T10:30:00Z",
  "created_by": {
    "id": 1,
    "username": "string",
    "email": "string"
  },
  "updated_by": {
    "id": 1,
    "username": "string"
  },
  "children": [
    {
      "id": 2,
      "title": "Child Page",
      "path": "/page1/child"
    }
  ]
}
```

#### 2.1.4 更新页面（完整更新）

**端点**: `PUT /api/wiki/pages/{id}/`  
**认证**: 需要  
**请求体**: 同创建页面，所有字段必填

#### 2.1.5 更新页面（部分更新）

**端点**: `PATCH /api/wiki/pages/{id}/`  
**认证**: 需要  
**请求体**:
```json
{
  "title": "string (可选)",
  "content": "string (可选)",
  "tags": ["tag1"] (可选)
}
```

#### 2.1.6 删除页面

**端点**: `DELETE /api/wiki/pages/{id}/`  
**认证**: 需要  
**描述**: 删除指定页面（如果有子页面，需要处理级联删除或阻止删除）

**成功响应** (204 No Content)

---

### 2.2 树形结构与导航

#### 2.2.1 获取页面树形结构

**端点**: `GET /api/wiki/pages/tree/`  
**认证**: 需要  
**查询参数**:
- `path`: 路径前缀过滤（可选）

**成功响应** (200 OK):
```json
{
  "tree": [
    {
      "id": 1,
      "title": "Root Page",
      "path": "/root",
      "children": [
        {
          "id": 2,
          "title": "Child Page",
          "path": "/root/child",
          "children": []
        }
      ]
    }
  ]
}
```

#### 2.2.2 获取页面的直接子页面

**端点**: `GET /api/wiki/pages/{id}/children/`  
**认证**: 需要  
**查询参数**:
- `limit`: 每页数量（默认10）
- `page`: 页码（默认1）

**成功响应** (200 OK):
```json
{
  "count": 10,
  "results": [
    {
      "id": 2,
      "title": "Child Page",
      "path": "/parent/child",
      "created_at": "2025-09-14T10:30:00Z"
    }
  ]
}
```

#### 2.2.3 获取页面的面包屑导航

**端点**: `GET /api/wiki/pages/{id}/breadcrumb/`  
**认证**: 需要

**成功响应** (200 OK):
```json
{
  "breadcrumb": [
    {
      "id": 1,
      "title": "Root",
      "path": "/root"
    },
    {
      "id": 2,
      "title": "Parent",
      "path": "/root/parent"
    },
    {
      "id": 3,
      "title": "Current Page",
      "path": "/root/parent/current"
    }
  ]
}
```

#### 2.2.4 移动页面

**端点**: `POST /api/wiki/pages/{id}/move/`  
**认证**: 需要  
**请求体**:
```json
{
  "parent_id": 2 (或 null，表示移动到根目录)
}
```

**成功响应** (200 OK):
```json
{
  "id": 1,
  "title": "string",
  "parent_id": 2,
  "path": "/new-parent/page"
}
```

---

### 2.3 历史版本管理

#### 2.3.1 获取页面历史版本列表

**端点**: `GET /api/wiki/pages/{id}/history/`  
**认证**: 需要  
**查询参数**:
- `limit`: 每页数量（默认10）
- `offset`: 偏移量（默认0）

**成功响应** (200 OK):
```json
{
  "count": 50,
  "results": [
    {
      "version": 5,
      "title": "string",
      "content": "string (Markdown)",
      "updated_at": "2025-09-14T10:30:00Z",
      "updated_by": {
        "id": 1,
        "username": "string"
      }
    }
  ]
}
```

#### 2.3.2 获取特定历史版本详情

**端点**: `GET /api/wiki/pages/{id}/history/{version}/`  
**认证**: 需要

**成功响应** (200 OK):
```json
{
  "version": 3,
  "title": "string",
  "content": "string (Markdown)",
  "updated_at": "2025-09-14T10:30:00Z",
  "updated_by": {
    "id": 1,
    "username": "string"
  }
}
```

---

### 2.4 搜索功能

**端点**: `GET /api/wiki/search/`  
**认证**: 需要  
**查询参数**:
- `query`: 搜索关键词（可选）
- `tags`: 标签列表，用逗号分隔（可选）
- `path`: 路径前缀过滤（可选）
- `limit`: 每页数量（默认10）
- `page`: 页码（默认1）

**成功响应** (200 OK):
```json
{
  "count": 20,
  "results": [
    {
      "id": 1,
      "title": "string",
      "content": "string (摘要)",
      "path": "/path/to/page",
      "tags": ["tag1"],
      "updated_at": "2025-09-14T10:30:00Z"
    }
  ]
}
```

---

### 2.5 标签管理

#### 2.5.1 获取所有标签

**端点**: `GET /api/wiki/tags/`  
**认证**: 需要

**成功响应** (200 OK):
```json
{
  "tags": [
    {
      "id": 1,
      "name": "tag1",
      "count": 10
    }
  ]
}
```

#### 2.5.2 获取标签详情

**端点**: `GET /api/wiki/tags/{id}/`  
**认证**: 需要

**成功响应** (200 OK):
```json
{
  "id": 1,
  "name": "tag1",
  "count": 10,
  "description": "string"
}
```

#### 2.5.3 获取标签下的页面

**端点**: `GET /api/wiki/tags/{id}/pages/`  
**认证**: 需要  
**查询参数**:
- `limit`: 每页数量（默认10）
- `page`: 页码（默认1）

**成功响应** (200 OK):
```json
{
  "count": 10,
  "results": [
    {
      "id": 1,
      "title": "string",
      "path": "/path/to/page"
    }
  ]
}
```

---

### 2.6 评论管理

#### 2.6.1 获取页面评论列表

**端点**: `GET /api/wiki/pages/{pageId}/comments/`  
**认证**: 需要

**成功响应** (200 OK):
```json
{
  "comments": [
    {
      "id": 1,
      "content": "string",
      "parent": null,
      "created_at": "2025-09-14T10:30:00Z",
      "created_by": {
        "id": 1,
        "username": "string"
      },
      "replies": [
        {
          "id": 2,
          "content": "string",
          "parent": 1,
          "created_at": "2025-09-14T10:35:00Z",
          "created_by": {
            "id": 2,
            "username": "string"
          }
        }
      ]
    }
  ]
}
```

#### 2.6.2 创建评论

**端点**: `POST /api/wiki/pages/{pageId}/comments/`  
**认证**: 需要  
**请求体**:
```json
{
  "content": "string (必填)",
  "parent": 1 (可选, 用于回复)
}
```

**成功响应** (201 Created):
```json
{
  "id": 1,
  "content": "string",
  "parent": null,
  "created_at": "2025-09-14T10:30:00Z",
  "created_by": {
    "id": 1,
    "username": "string"
  }
}
```

#### 2.6.3 获取评论详情

**端点**: `GET /api/wiki/pages/{pageId}/comments/{commentId}/`  
**认证**: 需要

#### 2.6.4 更新评论

**端点**: `PATCH /api/wiki/pages/{pageId}/comments/{commentId}/`  
**认证**: 需要  
**请求体**:
```json
{
  "content": "string"
}
```

#### 2.6.5 删除评论

**端点**: `DELETE /api/wiki/pages/{pageId}/comments/{commentId}/`  
**认证**: 需要

#### 2.6.6 获取评论的回复

**端点**: `GET /api/wiki/pages/{pageId}/comments/{commentId}/replies/`  
**认证**: 需要

**成功响应** (200 OK):
```json
{
  "replies": [
    {
      "id": 2,
      "content": "string",
      "parent": 1,
      "created_at": "2025-09-14T10:35:00Z",
      "created_by": {
        "id": 2,
        "username": "string"
      }
    }
  ]
}
```

---

## 3. 项目管理系统

### 3.1 获取项目列表

**端点**: `GET /api/projects/`  
**认证**: 需要  
**查询参数**:
- `status`: 按状态筛选（`active`、`archived`、`completed`）
- `search`: 搜索关键词
- `ordering`: 排序字段（例如：`-created_at`, `name`）
- `page`: 页码
- `page_size`: 每页数量

**成功响应** (200 OK):
```json
{
  "count": 50,
  "next": "http://api.example.com/api/projects/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "string",
      "description": "string",
      "status": "active",
      "progress": 65,
      "start_date": "2025-01-01",
      "end_date": "2025-12-31",
      "created_at": "2025-09-14T10:30:00Z",
      "updated_at": "2025-09-14T10:30:00Z",
      "created_by": {
        "id": 1,
        "username": "string"
      },
      "members": [
        {
          "id": 1,
          "username": "string"
        }
      ]
    }
  ]
}
```

---

### 3.2 创建项目

**端点**: `POST /api/projects/`  
**认证**: 需要  
**请求体**:
```json
{
  "name": "string (必填)",
  "description": "string (可选)",
  "status": "active (可选, 默认active)",
  "progress": 0 (可选, 默认0),
  "start_date": "2025-01-01 (可选)",
  "end_date": "2025-12-31 (可选)",
  "members": [1, 2, 3] (可选, 用户ID数组)
}
```

**成功响应** (201 Created):
```json
{
  "id": 1,
  "name": "string",
  "description": "string",
  "status": "active",
  "progress": 0,
  "start_date": "2025-01-01",
  "end_date": "2025-12-31",
  "created_at": "2025-09-14T10:30:00Z",
  "created_by": {
    "id": 1,
    "username": "string"
  },
  "members": []
}
```

---

### 3.3 获取项目详情

**端点**: `GET /api/projects/{id}/`  
**认证**: 需要

**成功响应** (200 OK):
```json
{
  "id": 1,
  "name": "string",
  "description": "string",
  "status": "active",
  "progress": 65,
  "start_date": "2025-01-01",
  "end_date": "2025-12-31",
  "created_at": "2025-09-14T10:30:00Z",
  "updated_at": "2025-09-14T10:30:00Z",
  "created_by": {
    "id": 1,
    "username": "string",
    "email": "string"
  },
  "members": [
    {
      "id": 1,
      "username": "string",
      "email": "string"
    }
  ],
  "todos": [
    {
      "id": 1,
      "title": "string",
      "status": "pending"
    }
  ]
}
```

---

### 3.4 更新项目

**端点**: `PATCH /api/projects/{id}/`  
**认证**: 需要  
**请求体**:
```json
{
  "name": "string (可选)",
  "description": "string (可选)",
  "status": "string (可选)",
  "progress": 75 (可选),
  "start_date": "2025-01-01 (可选)",
  "end_date": "2025-12-31 (可选)",
  "members": [1, 2] (可选)
}
```

---

### 3.5 删除项目

**端点**: `DELETE /api/projects/{id}/`  
**认证**: 需要

**成功响应** (204 No Content)

---

### 3.6 项目操作

#### 3.6.1 归档项目

**端点**: `POST /api/projects/{id}/archive/`  
**认证**: 需要

**成功响应** (200 OK):
```json
{
  "id": 1,
  "status": "archived"
}
```

#### 3.6.2 激活项目

**端点**: `POST /api/projects/{id}/activate/`  
**认证**: 需要

**成功响应** (200 OK):
```json
{
  "id": 1,
  "status": "active"
}
```

#### 3.6.3 完成项目

**端点**: `POST /api/projects/{id}/complete/`  
**认证**: 需要

**成功响应** (200 OK):
```json
{
  "id": 1,
  "status": "completed",
  "progress": 100
}
```

---

### 3.7 获取项目统计

**端点**: `GET /api/projects/statistics/`  
**认证**: 需要

**成功响应** (200 OK):
```json
{
  "total": 50,
  "active": 30,
  "archived": 15,
  "completed": 5,
  "average_progress": 65
}
```

---

## 4. 待办事项系统

### 4.1 获取待办事项列表

**端点**: `GET /api/todos/`  
**认证**: 需要  
**查询参数**:
- `search`: 搜索关键词
- `page`: 页码
- `page_size`: 每页数量
- `status`: 状态过滤（`pending`、`in_progress`、`completed`、`cancelled`）
- `type`: 类型筛选
- `project`: 项目ID筛选

**成功响应** (200 OK):
```json
{
  "count": 100,
  "next": "http://api.example.com/api/todos/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "string",
      "description": "string",
      "status": "pending",
      "type": "task",
      "priority": "high",
      "due_date": "2025-12-31",
      "project": {
        "id": 1,
        "name": "Project Name"
      },
      "assignee": {
        "id": 1,
        "username": "string"
      },
      "created_at": "2025-09-14T10:30:00Z",
      "updated_at": "2025-09-14T10:30:00Z",
      "created_by": {
        "id": 1,
        "username": "string"
      }
    }
  ]
}
```

---

### 4.2 获取待办事项统计数据

**端点**: `GET /api/todos/statistics/`  
**认证**: 需要

**成功响应** (200 OK):
```json
{
  "total": 100,
  "pending": 40,
  "in_progress": 30,
  "completed": 25,
  "cancelled": 5,
  "overdue": 10,
  "today": 5,
  "this_week": 15
}
```

---

### 4.3 创建待办事项

**端点**: `POST /api/todos/`  
**认证**: 需要  
**请求体**:
```json
{
  "title": "string (必填)",
  "description": "string (可选)",
  "status": "pending (可选, 默认pending)",
  "type": "task (可选)",
  "priority": "medium (可选, low/medium/high)",
  "due_date": "2025-12-31 (可选)",
  "project": 1 (可选, 项目ID),
  "assignee": 1 (可选, 用户ID)
}
```

**成功响应** (201 Created):
```json
{
  "id": 1,
  "title": "string",
  "description": "string",
  "status": "pending",
  "type": "task",
  "priority": "medium",
  "due_date": "2025-12-31",
  "project": {
    "id": 1,
    "name": "Project Name"
  },
  "assignee": {
    "id": 1,
    "username": "string"
  },
  "created_at": "2025-09-14T10:30:00Z",
  "created_by": {
    "id": 1,
    "username": "string"
  }
}
```

---

### 4.4 更新待办事项

**端点**: `PATCH /api/todos/{id}/`  
**认证**: 需要  
**请求体**:
```json
{
  "title": "string (可选)",
  "description": "string (可选)",
  "status": "in_progress (可选)",
  "priority": "high (可选)",
  "due_date": "2025-12-31 (可选)",
  "assignee": 2 (可选)
}
```

**成功响应** (200 OK):
```json
{
  "id": 1,
  "title": "string",
  "status": "in_progress",
  "updated_at": "2025-09-14T11:00:00Z"
}
```

---

### 4.5 删除待办事项

**端点**: `DELETE /api/todos/{id}/`  
**认证**: 需要

**成功响应** (204 No Content)

---

## 5. 留言板系统

### 5.1 获取留言列表

**端点**: `GET /api/messages/`  
**认证**: 需要  
**查询参数**:
- `page`: 页码（默认1）
- `pageSize`: 每页数量（默认20）
- `sortBy`: 排序字段（默认`timestamp`）
- `sortOrder`: 排序顺序（`asc`/`desc`，默认`desc`）

**成功响应** (200 OK):
```json
{
  "status": "success",
  "data": {
    "messages": [
      {
        "id": "12345",
        "content": "留言内容",
        "color": "#1976D2",
        "timestamp": "2025-09-24T12:34:56Z",
        "user": {
          "id": 1,
          "username": "string"
        }
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### 5.2 发送留言

**端点**: `POST /api/messages/`  
**认证**: 需要  
**请求体**:
```json
{
  "content": "留言内容 (必填)",
  "color": "#1976D2 (可选)"
}
```

**成功响应** (201 Created):
```json
{
  "status": "success",
  "data": {
    "id": "12345",
    "content": "留言内容",
    "color": "#1976D2",
    "timestamp": "2025-09-24T12:34:56Z",
    "user": {
      "id": 1,
      "username": "string"
    }
  }
}
```

---

### 5.3 删除留言

**端点**: `DELETE /api/messages/{id}`  
**认证**: 需要（仅作者或管理员）

**成功响应** (200 OK):
```json
{
  "status": "success",
  "data": {
    "message": "留言已删除"
  }
}
```

---

## 6. 通知设置系统

### 6.1 获取通知设置

**端点**: `GET /api/notification-settings/`  
**认证**: 需要

**成功响应** (200 OK):
```json
{
  "email_notifications": true,
  "push_notifications": false,
  "todo_reminders": true,
  "wiki_updates": true,
  "project_updates": false
}
```

---

### 6.2 更新通知设置（完整更新）

**端点**: `PUT /api/notification-settings/`  
**认证**: 需要  
**请求体**:
```json
{
  "email_notifications": true,
  "push_notifications": false,
  "todo_reminders": true,
  "wiki_updates": true,
  "project_updates": false
}
```

**成功响应** (200 OK):
```json
{
  "email_notifications": true,
  "push_notifications": false,
  "todo_reminders": true,
  "wiki_updates": true,
  "project_updates": false
}
```

---

### 6.3 部分更新通知设置

**端点**: `PATCH /api/notification-settings/`  
**认证**: 需要  
**请求体**:
```json
{
  "email_notifications": false
}
```

**成功响应** (200 OK):
```json
{
  "email_notifications": false,
  "push_notifications": false,
  "todo_reminders": true,
  "wiki_updates": true,
  "project_updates": false
}
```

---

## 7. 反馈系统

### 7.1 提交反馈

**端点**: `POST /api/feedback/`  
**认证**: 不需要  
**描述**: 用户可以在未登录状态下提交反馈

**请求体**:
```json
{
  "name": "用户姓名 (可选)",
  "email": "user@example.com (可选)",
  "type": "suggestion (必填, suggestion/bug/question/other)",
  "content": "反馈内容 (必填)",
  "source": "general (可选, 反馈来源页面)"
}
```

**成功响应** (201 Created):
```json
{
  "id": 123,
  "status": "received",
  "created_at": "2025-09-14T10:30:00Z",
  "message": "感谢您的反馈"
}
```

---

### 7.2 获取反馈回复内容

**端点**: `GET /api/feedback/reply`  
**认证**: 不需要  
**描述**: 获取显示在前端的反馈回复信息

**成功响应** (200 OK):
```json
{
  "content": "感谢您的反馈，我们会及时处理",
  "position": "bottom-right"
}
```

---

### 7.3 获取反馈列表

**端点**: `GET /api/feedback/list`  
**认证**: 需要（管理员）  
**查询参数**:
- `page`: 页码
- `pageSize`: 每页数量
- `source`: 反馈来源（可选）
- `type`: 反馈类型（可选）
- `status`: 反馈状态（可选）

**成功响应** (200 OK):
```json
{
  "count": 100,
  "results": [
    {
      "id": 123,
      "name": "string",
      "email": "string",
      "type": "suggestion",
      "content": "string",
      "source": "general",
      "status": "received",
      "created_at": "2025-09-14T10:30:00Z",
      "replies_count": 2
    }
  ]
}
```

---

### 7.4 获取反馈的回复列表

**端点**: `GET /api/feedback/{feedbackId}/replies`  
**认证**: 需要（管理员）

**成功响应** (200 OK):
```json
{
  "replies": [
    {
      "id": 1,
      "author": "Admin Name",
      "content": "回复内容",
      "is_admin": true,
      "created_at": "2025-09-14T11:00:00Z"
    }
  ]
}
```

---

### 7.5 回复反馈

**端点**: `POST /api/feedback/{feedbackId}/reply`  
**认证**: 需要（管理员）  
**请求体**:
```json
{
  "author": "Admin Name (必填)",
  "content": "回复内容 (必填)",
  "is_admin": true (必填)
}
```

**成功响应** (201 Created):
```json
{
  "id": 1,
  "author": "Admin Name",
  "content": "回复内容",
  "is_admin": true,
  "created_at": "2025-09-14T11:00:00Z"
}
```

---

## 8. 错误处理规范

### 8.1 通用错误响应格式

所有API在发生错误时应返回适当的HTTP状态码和以下格式的响应：

```json
{
  "error": "ERROR_CODE",
  "message": "错误描述",
  "details": {
    "field_name": ["具体错误信息"]
  }
}
```

### 8.2 常见HTTP状态码

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 200 | OK | 请求成功 |
| 201 | Created | 资源创建成功 |
| 204 | No Content | 请求成功但无返回内容（通常用于DELETE） |
| 400 | Bad Request | 请求参数错误或验证失败 |
| 401 | Unauthorized | 未认证或令牌无效 |
| 403 | Forbidden | 无权限访问资源 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突（例如：用户名已存在） |
| 422 | Unprocessable Entity | 请求格式正确但语义错误 |
| 429 | Too Many Requests | 请求过于频繁，触发速率限制 |
| 500 | Internal Server Error | 服务器内部错误 |

### 8.3 验证错误示例

```json
{
  "error": "validation_error",
  "message": "请求数据验证失败",
  "details": {
    "email": ["请输入有效的电子邮箱地址"],
    "password": ["密码长度至少为8个字符"]
  }
}
```

### 8.4 认证错误示例

```json
{
  "error": "authentication_failed",
  "message": "认证失败，请重新登录",
  "details": {
    "code": "token_expired"
  }
}
```

---

## 9. 安全建议

### 9.1 认证安全

1. **JWT Token 配置**:
   - Access Token 过期时间：15-30分钟
   - Refresh Token 过期时间：7-30天
   - 使用强加密算法（例如：HS256或RS256）

2. **密码策略**:
   - 最小长度：8个字符
   - 使用 bcrypt 或 Argon2 进行密码哈希
   - 实施密码复杂度要求

3. **速率限制**:
   - 登录接口：5次/分钟
   - 注册接口：3次/分钟
   - API调用：100次/分钟（根据实际情况调整）

### 9.2 数据安全

1. **输入验证**:
   - 所有用户输入必须进行验证和清理
   - 防止SQL注入、XSS攻击
   - 使用参数化查询

2. **内容安全**:
   - Markdown内容需要进行安全过滤
   - 留言板内容需要过滤敏感词汇
   - 实施内容审核机制

3. **权限控制**:
   - 实施基于角色的访问控制（RBAC）
   - Wiki页面支持细粒度权限设置
   - 操作前验证用户权限

### 9.3 CORS配置

建议CORS配置：
```
Access-Control-Allow-Origin: http://localhost:5173 (开发环境)
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

---

## 10. 分页规范

### 10.1 标准分页格式

使用 `page` 和 `page_size` 参数进行分页：

**请求示例**:
```
GET /api/todos/?page=2&page_size=20
```

**响应示例**:
```json
{
  "count": 100,
  "next": "http://api.example.com/api/todos/?page=3",
  "previous": "http://api.example.com/api/todos/?page=1",
  "results": [...]
}
```

### 10.2 游标分页（可选）

对于需要高性能的场景（例如：Wiki搜索），可以使用游标分页：

**请求示例**:
```
GET /api/wiki/search/?cursor=eyJpZCI6MTAwfQ==&limit=20
```

**响应示例**:
```json
{
  "next_cursor": "eyJpZCI6MTIwfQ==",
  "previous_cursor": "eyJpZCI6ODB9",
  "results": [...]
}
```

---

## 11. 数据库建议

### 11.1 推荐技术栈

- **关系型数据库**: PostgreSQL 或 MySQL
- **缓存**: Redis（用于Token、会话管理）
- **全文搜索**: Elasticsearch（可选，用于Wiki搜索优化）

### 11.2 核心表结构建议

#### 用户表 (users)
- id (PK)
- username (unique)
- email (unique)
- password_hash
- first_name
- last_name
- gender
- phone
- is_staff
- is_superuser
- created_at
- updated_at

#### 用户组表 (groups)
- id (PK)
- name (unique)
- permissions (JSON或关联表)
- created_at
- updated_at

#### Wiki页面表 (wiki_pages)
- id (PK)
- title
- content (TEXT)
- parent_id (FK, 自关联)
- path
- created_by (FK -> users)
- updated_by (FK -> users)
- created_at
- updated_at
- deleted_at (软删除)

#### Wiki历史版本表 (wiki_page_versions)
- id (PK)
- page_id (FK -> wiki_pages)
- version
- title
- content
- updated_by (FK -> users)
- updated_at

#### 项目表 (projects)
- id (PK)
- name
- description
- status
- progress
- start_date
- end_date
- created_by (FK -> users)
- created_at
- updated_at

#### 待办事项表 (todos)
- id (PK)
- title
- description
- status
- type
- priority
- due_date
- project_id (FK -> projects)
- assignee_id (FK -> users)
- created_by (FK -> users)
- created_at
- updated_at

#### 留言表 (messages)
- id (PK)
- content
- color
- user_id (FK -> users)
- created_at

#### 反馈表 (feedback)
- id (PK)
- name
- email
- type
- content
- source
- status
- created_at

---

## 12. API版本控制

建议使用URL版本控制：
```
/api/v1/todos/
/api/v2/todos/
```

或使用请求头版本控制：
```
Accept: application/vnd.contenthub.v1+json
```

---

## 附录：快速参考

### A. 认证端点
```
POST   /api/token/              - 登录
POST   /api/register/           - 注册
GET    /api/me/                 - 获取当前用户
POST   /api/token/refresh/      - 刷新令牌
POST   /api/token/verify/       - 验证令牌
```

### B. Wiki端点
```
GET    /api/wiki/pages/         - 获取页面列表
POST   /api/wiki/pages/         - 创建页面
GET    /api/wiki/pages/{id}/    - 获取页面详情
PATCH  /api/wiki/pages/{id}/    - 更新页面
DELETE /api/wiki/pages/{id}/    - 删除页面
GET    /api/wiki/pages/tree/    - 获取页面树
GET    /api/wiki/search/        - 搜索页面
```

### C. 项目端点
```
GET    /api/projects/           - 获取项目列表
POST   /api/projects/           - 创建项目
GET    /api/projects/{id}/      - 获取项目详情
PATCH  /api/projects/{id}/      - 更新项目
DELETE /api/projects/{id}/      - 删除项目
POST   /api/projects/{id}/archive/   - 归档项目
GET    /api/projects/statistics/     - 项目统计
```

### D. 待办事项端点
```
GET    /api/todos/              - 获取待办列表
POST   /api/todos/              - 创建待办
PATCH  /api/todos/{id}/         - 更新待办
DELETE /api/todos/{id}/         - 删除待办
GET    /api/todos/statistics/   - 待办统计
```

### E. 留言板端点
```
GET    /api/messages/           - 获取留言列表
POST   /api/messages/           - 发送留言
DELETE /api/messages/{id}       - 删除留言
```

### F. 反馈端点
```
POST   /api/feedback/           - 提交反馈
GET    /api/feedback/list       - 获取反馈列表（管理员）
GET    /api/feedback/{id}/replies - 获取回复列表
POST   /api/feedback/{id}/reply   - 回复反馈
```

---

## 联系与支持

如果在实现过程中有任何疑问，请参考：
1. 前端代码中的API调用示例（`src/api/` 目录）
2. 现有的部分API文档（`docs/` 目录）
3. 本文档的详细接口说明

**文档版本**: v1.0.0  
**最后更新**: 2025-09-14  
**适用前端版本**: Content Hub v1.0.0
