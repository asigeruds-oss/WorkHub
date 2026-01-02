# Content Hub

<div align="center">

![Content Hub Logo](https://img.shields.io/badge/Content-Hub-blue?style=for-the-badge)

**个人TODO与知识管理平台**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-brightgreen.svg)](https://vuejs.org/)
[![Vuetify 3](https://img.shields.io/badge/Vuetify-3.x-blue.svg)](https://vuetifyjs.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

</div>

---

## 📖 简介

DEMO：http://yoleo.top

本项目包括：个人待办管理、Wiki知识库等提效工具。通过项目关联Todo的形式，来进行任务的管理。

功能简洁，部署资源要求低。

![image-20260102130402668](https://yoloblogger.oss-cn-beijing.aliyuncs.com/blog/202601021304830.png)

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

### 🔧 配置（暂时可忽略）

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
