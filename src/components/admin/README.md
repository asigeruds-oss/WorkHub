# Admin 组件模块

本目录包含后台管理相关的所有组件。

## 文件说明

### GroupsManagement.vue
用户组管理组件

**功能**：
- 获取用户组列表
- 创建新用户组
- 编辑用户组信息
- 删除用户组

**Props**: 无

**Events**: 无

**API调用**:
- `AuthAPI.getGroups()` - 获取用户组列表
- `AuthAPI.createGroup(data)` - 创建用户组

### UserSearch.vue
用户搜索组件

**功能**：
- 搜索用户
- 设置搜索参数
- 查看搜索结果
- 查看用户详情

**Props**: 无

**Events**: 无

**API调用**:
- `AuthAPI.searchUsers(params)` - 搜索用户

### MyPermissions.vue
我的权限显示组件

**功能**：
- 显示当前用户信息
- 显示用户的权限等级
- 显示所属用户组
- 显示权限系统说明

**Props**: 无

**Events**: 无

**API调用**:
- `AuthAPI.getPermissions()` - 获取权限信息

### WikiPermissionsManagement.vue
Wiki页面权限管理组件

**功能**：
- 浏览Wiki页面列表
- 查看页面权限设置
- 编辑页面权限
- 设置用户组和用户权限

**Props**: 无

**Events**: 无

**API调用**:
- `getPages(params)` - 获取页面列表
- `updatePage(id, data)` - 更新页面权限
- `AuthAPI.getGroups()` - 获取用户组列表

## 使用示例

在父组件中导入和使用：

```vue
<template>
  <GroupsManagement />
</template>

<script setup>
import GroupsManagement from '@/components/admin/GroupsManagement.vue'
</script>
```

## 状态管理

这些组件使用本地状态管理（ref）来处理数据。如果需要全局状态，可以通过Pinia store进行扩展。

## 样式规范

- 使用Vuetify 3的样式系统
- 响应式设计支持移动设备
- 动画效果增强用户体验
- 深色模式兼容性

## 可访问性

- 所有交互元素都支持键盘导航
- 使用语义化的HTML结构
- 提供适当的ARIA标签

## 性能考虑

- 使用虚拟化列表处理大数据量
- 分页加载减少一次性数据量
- 结果缓存减少重复请求
