# Content Hub

<div align="center">

![Content Hub Logo](https://img.shields.io/badge/Content-Hub-blue?style=for-the-badge)

**现代化的团队协作与知识管理平台**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-brightgreen.svg)](https://vuejs.org/)
[![Vuetify 3](https://img.shields.io/badge/Vuetify-3.x-blue.svg)](https://vuetifyjs.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

</div>

---

## 📖 简介

Content Hub 是一个功能丰富的团队协作平台，集成了Wiki知识库、项目管理、待办事项、消息板等多个模块。采用现代化的技术栈构建，提供流畅的用户体验和强大的权限管理系统。

### ✨ 核心功能

#### 📚 Wiki 知识库
- 🌲 **树形结构**：支持无限层级的页面嵌套
- ✏️ **Markdown 编辑**：强大的 Markdown 编辑器，支持实时预览
- 🔍 **全文搜索**：快速查找所需内容
- 🏷️ **标签系统**：灵活的内容分类和组织
- 📝 **版本历史**：追踪所有修改记录
- 💬 **评论功能**：团队协作讨论
- 🔐 **精细权限**：基于用户/组的访问控制

#### 📊 项目管理
- 📁 **项目看板**：可视化的项目管理
- 📈 **进度追踪**：实时项目进度统计
- 🎯 **优先级管理**：合理安排任务优先级
- 👥 **团队协作**：项目成员管理
- 📊 **数据统计**：项目完成度分析

#### ✅ 待办事项
- 📝 **任务管理**：创建、编辑、删除任务
- 📅 **日期提醒**：设置截止日期
- 🔄 **状态流转**：待处理、进行中、已完成、已挂起
- 📊 **统计视图**：任务完成情况统计
- 🔗 **关联项目**：任务与项目关联
- 📎 **子任务**：支持任务分解

#### 💬 消息板
- 📢 **团队公告**：发布团队通知
- 💡 **讨论交流**：团队成员互动
- 📌 **置顶功能**：重要消息优先展示

#### 🔐 权限管理
- 👤 **用户管理**：用户账户管理
- 👥 **用户组**：灵活的组织架构
- 🛡️ **权限控制**：细粒度的权限设置
- 🔑 **JWT 认证**：安全的身份验证机制

---

## 🚀 快速开始

### 📋 前置要求

- **Node.js** >= 18.0.0
- **npm** / **yarn** / **pnpm** / **bun**
- **后端 API** 服务（需单独部署）

### ⚙️ 安装

```bash
# 克隆项目
git clone https://github.com/yourusername/content-hub.git
cd content-hub

# 安装依赖（选择一个包管理器）
npm install
# 或
yarn install
# 或
pnpm install
# 或
bun install
```

### 🔧 配置

复制 `.env.example` 为 `.env` 并根据实际情况修改配置：

```bash
cp .env.example .env
```

主要配置项：

```env
# API 基础地址（开发环境留空，使用Vite代理）
VITE_API_URL=

# 应用标题
VITE_APP_TITLE=Content Hub

# 功能开关
VITE_FEATURE_WIKI=true
VITE_FEATURE_PROJECTS=true
VITE_FEATURE_TODOS=true
```

### 🏃 运行

#### 开发环境

```bash
npm run dev
```

访问 http://localhost:3000

#### 生产构建

```bash
npm run build
```

#### 预览生产构建

```bash
npm run preview
```

---

## 🐳 Docker 部署

### 使用 Docker Compose

```bash
# 构建并启动
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

详细部署文档请参考 [docker-deployment-guide.md](docker-deployment-guide.md)

---

## 🛠️ 技术栈

### 前端框架
- **[Vue 3](https://vuejs.org/)** - 渐进式 JavaScript 框架
- **[Vuetify 3](https://vuetifyjs.com/)** - Material Design 组件库
- **[Vite](https://vitejs.dev/)** - 下一代前端构建工具

### 状态管理
- **[Pinia](https://pinia.vuejs.org/)** - Vue 官方推荐的状态管理库

### 路由
- **[Vue Router](https://router.vuejs.org/)** - 官方路由管理器

### HTTP 请求
- **[Axios](https://axios-http.com/)** - Promise based HTTP client

### Markdown 编辑
- **[Marked](https://marked.js.org/)** - Markdown 解析器

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！在参与贡献之前，请阅读 [贡献指南](CONTRIBUTING.md)。

### 贡献方式

1. 🐛 报告 Bug
2. 💡 提出新功能建议
3. 📝 改进文档
4. 🔧 提交代码修复
5. ⭐ Star 项目

---

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证。

---

## 🙏 致谢

感谢以下开源项目：

- [Vue.js](https://vuejs.org/)
- [Vuetify](https://vuetifyjs.com/)
- [Vite](https://vitejs.dev/)
- [Pinia](https://pinia.vuejs.org/)

---

<div align="center">

**Made with ❤️ by Content Hub Team**

</div>
