# MessageBoard 组件 API 规范

## 概述

MessageBoard 组件用于用户交流，允许用户发送和查看留言。目前前端已经实现了基本功能，但需要后端提供相应的 API 支持。

## API 端点

### 1. 获取留言列表

**请求**:
- 方法: `GET`
- URL: `/api/messages`
- 查询参数:
  - `page`: 页码 (默认: 1)
  - `pageSize`: 每页数量 (默认: 20)
  - `sortBy`: 排序字段 (可选，默认: 'timestamp')
  - `sortOrder`: 排序顺序 (可选，默认: 'desc')

**响应**:
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
        "userId": "user123" // 可选，如果需要用户身份
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

### 2. 发送留言

**请求**:
- 方法: `POST`
- URL: `/api/messages`
- 请求体:
```json
{
  "content": "留言内容",
  "color": "#1976D2"
}
```

**响应**:
```json
{
  "status": "success",
  "data": {
    "id": "12345",
    "content": "留言内容",
    "color": "#1976D2",
    "timestamp": "2025-09-24T12:34:56Z"
  }
}
```

### 3. 删除留言 (可选功能)

**请求**:
- 方法: `DELETE`
- URL: `/api/messages/:id`

**响应**:
```json
{
  "status": "success",
  "data": {
    "message": "留言已删除"
  }
}
```

## 错误处理

所有 API 在发生错误时应返回适当的 HTTP 状态码和以下格式的响应:

```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述"
  }
}
```

## 安全措施

1. 内容过滤：后端应该过滤留言内容中的敏感词汇和XSS攻击代码
2. 速率限制：为防止垃圾留言，建议实施速率限制 (如：同一IP每分钟不超过5条留言)
3. 内容长度限制：留言内容长度建议限制在100个字符以内

## 数据库模型建议

```
Message {
  id: String (唯一标识)
  content: String (留言内容)
  color: String (颜色代码)
  timestamp: DateTime (创建时间)
  userId: String (可选，用户标识)
  ip: String (发送者IP，仅后端存储用于防滥用)
}
```

## 前端集成

前端将通过 axios 调用这些 API，并在 `/src/api` 目录下创建相应的接口函数。可在现有的 `feedback.js` 基础上扩展，或创建新的 `message.js` 文件。
