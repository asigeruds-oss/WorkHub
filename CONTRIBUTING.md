# 贡献指南

感谢你考虑为 Content Hub 做出贡献！我们欢迎任何形式的贡献，无论是报告 bug、提出新功能、改进文档还是提交代码。

## 📋 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发流程](#开发流程)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [Pull Request 流程](#pull-request-流程)

---

## 🤝 行为准则

参与本项目的所有人都应遵守以下准则：

- 使用友好和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

## 💡 如何贡献

### 报告 Bug

如果你发现了 bug，请：

1. 检查 [Issues](https://github.com/yourusername/content-hub/issues) 确认问题未被报告
2. 创建新的 Issue，包含：
   - 清晰的标题和描述
   - 重现步骤
   - 预期行为
   - 实际行为
   - 截图（如果适用）
   - 环境信息（浏览器、操作系统、Node.js 版本等）

### 提出新功能

如果你有新功能建议：

1. 检查 [Issues](https://github.com/yourusername/content-hub/issues) 确认功能未被提议
2. 创建新的 Feature Request Issue，说明：
   - 功能描述
   - 使用场景
   - 预期效果
   - 可能的实现方式（可选）

### 改进文档

文档改进同样重要！你可以：

- 修正拼写或语法错误
- 添加缺失的文档
- 改进现有文档的清晰度
- 翻译文档

---

## 🛠️ 开发流程

### 1. Fork 项目

点击 GitHub 页面右上角的 "Fork" 按钮

### 2. 克隆你的 Fork

```bash
git clone https://github.com/your-username/content-hub.git
cd content-hub
```

### 3. 添加上游仓库

```bash
git remote add upstream https://github.com/yourusername/content-hub.git
```

### 4. 创建分支

```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

分支命名约定：
- `feature/` - 新功能
- `fix/` - Bug 修复
- `docs/` - 文档更新
- `refactor/` - 代码重构
- `test/` - 测试相关
- `chore/` - 构建/工具相关

### 5. 安装依赖

```bash
npm install
```

### 6. 配置环境

```bash
cp .env.example .env
```

### 7. 开发

```bash
npm run dev
```

### 8. 提交更改

遵循 [提交规范](#提交规范) 提交你的更改

```bash
git add .
git commit -m "feat: add amazing feature"
```

### 9. 保持同步

定期同步上游更改：

```bash
git fetch upstream
git rebase upstream/main
```

### 10. 推送到你的 Fork

```bash
git push origin feature/your-feature-name
```

### 11. 创建 Pull Request

在 GitHub 上创建 Pull Request，详细说明你的更改

---

## 📝 代码规范

### JavaScript/Vue 规范

我们使用 ESLint 来保持代码一致性。

#### 基本规则

- 使用 **2 空格** 缩进
- 使用 **单引号** 而非双引号
- 语句末尾 **不加分号**
- 使用 **camelCase** 命名变量和函数
- 使用 **PascalCase** 命名组件
- 使用 **kebab-case** 命名文件

#### Vue 组件规范

```vue
<template>
  <!-- 使用语义化的 HTML -->
  <div class="component-name">
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props 定义
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  description: String,
})

// Emits 定义
const emit = defineEmits(['update', 'delete'])

// 响应式数据
const count = ref(0)

// 计算属性
const doubleCount = computed(() => count.value * 2)

// 方法
function handleClick() {
  emit('update', count.value)
}
</script>

<style scoped>
.component-name {
  /* 组件样式 */
}
</style>
```

### API 调用规范

```javascript
// 使用 try-catch 处理错误
try {
  const data = await API.fetchData()
  // 处理数据
} catch (error) {
  logger.error('获取数据失败', error)
  throw handleError(error, 'Context')
}
```

### 日志规范

```javascript
import Logger from '@/utils/logger'

const logger = new Logger('ComponentName')

// 开发环境日志
logger.debug('调试信息')
logger.info('一般信息')

// 所有环境日志
logger.warn('警告信息')
logger.error('错误信息', error)
```

### 注释规范

```javascript
/**
 * 函数说明
 * @param {string} param1 - 参数1说明
 * @param {number} param2 - 参数2说明
 * @returns {Promise<Object>} 返回值说明
 */
async function myFunction(param1, param2) {
  // 实现
}
```

---

## 📦 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

### 提交格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响代码运行）
- `refactor`: 重构（既不是新功能也不是 Bug 修复）
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动
- `revert`: 回滚提交

### 示例

```bash
# 新功能
git commit -m "feat(wiki): add markdown preview"

# Bug 修复
git commit -m "fix(auth): resolve token refresh issue"

# 文档更新
git commit -m "docs: update installation guide"

# 重构
git commit -m "refactor(api): simplify error handling"

# 性能优化
git commit -m "perf(list): implement virtual scrolling"
```

### 详细说明（可选）

```bash
git commit -m "feat(wiki): add markdown preview

- Add real-time markdown preview
- Support syntax highlighting
- Add preview toggle button

Closes #123"
```

---

## 🔍 Pull Request 流程

### 1. PR 标题

遵循提交规范：

```
feat(wiki): add markdown preview
fix(auth): resolve token refresh issue
```

### 2. PR 描述

包含以下内容：

```markdown
## 📝 变更描述
简要说明此 PR 的目的和内容

## 🔗 相关 Issue
Closes #123
Related to #456

## 📸 截图（如果适用）
[添加截图]

## ✅ 检查清单
- [ ] 代码遵循项目规范
- [ ] 已添加/更新测试
- [ ] 已更新文档
- [ ] 所有测试通过
- [ ] 无 ESLint 警告
```

### 3. 代码审查

- 耐心等待维护者审查
- 积极响应反馈
- 根据建议修改代码
- 保持友好和专业的态度

### 4. 合并

PR 被批准后：

- 维护者会将其合并到主分支
- 你的贡献将出现在下个版本中

---

## 🧪 测试

### 运行测试

```bash
npm run test
```

### 运行 Lint

```bash
npm run lint
```

### 修复 Lint 错误

```bash
npm run lint:fix
```

---

## 📚 其他资源

- [Vue 3 文档](https://vuejs.org/)
- [Vuetify 文档](https://vuetifyjs.com/)
- [JavaScript 标准](https://standardjs.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## ❓ 需要帮助？

如果你在贡献过程中遇到问题：

1. 查看 [文档](README.md)
2. 搜索 [Issues](https://github.com/yourusername/content-hub/issues)
3. 在 [Discussions](https://github.com/yourusername/content-hub/discussions) 提问
4. 联系维护者

---

## 🙏 感谢

感谢你为 Content Hub 做出贡献！每一个贡献，无论大小，都让这个项目变得更好。

<div align="center">

**Happy Coding! 🚀**

</div>
