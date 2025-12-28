/**
 * 导航菜单配置
 * 生产级别的导航配置，支持权限控制、图标、徽章等
 */

export const navigationConfig = {
  // 主导航菜单
  mainMenu: [
    {
      id: 'home',
      title: '工作台',
      path: '/',
      icon: 'mdi-view-dashboard',
      requireAuth: false,
      description: '项目概览和快速操作',
    },
    {
      id: 'wiki',
      title: '知识库',
      path: '/wiki',
      icon: 'mdi-book-open-page-variant',
      requireAuth: false,
      description: '团队知识管理中心',
      badge: null,
    },
    {
      id: 'todos',
      title: '任务中心',
      path: '/todos',
      icon: 'mdi-clipboard-check-multiple',
      requireAuth: true,
      description: '个人任务管理',
      badge: null, // 可以动态设置未完成任务数
    },
    {
      id: 'projects',
      title: '项目管理',
      path: '/projects',
      icon: 'mdi-folder-multiple-outline',
      requireAuth: true,
      description: '项目进度与任务追踪',
    },
    {
      id: 'notion',
      title: 'Notion',
      path: '/notion',
      icon: 'mdi-script-text',
      requireAuth: false,
      description: 'Notion集成工具',
    },
    {
      id: 'settings',
      title: '设置',
      path: '/settings',
      icon: 'mdi-cog',
      requireAuth: true,
      description: '个人偏好设置',
    },
  ],

  // 用户菜单（头像下拉菜单）
  userMenu: [
    {
      id: 'profile',
      title: '个人信息',
      icon: 'mdi-account-circle',
      action: 'profile',
    },
    {
      id: 'settings',
      title: '系统设置',
      icon: 'mdi-cog',
      path: '/settings',
    },
    {
      divider: true,
    },
    {
      id: 'theme',
      title: '主题切换',
      icon: 'mdi-theme-light-dark',
      action: 'toggleTheme',
    },
    {
      divider: true,
    },
    {
      id: 'logout',
      title: '退出登录',
      icon: 'mdi-logout',
      action: 'logout',
      color: 'error',
    },
  ],

  // 快捷操作菜单
  quickActions: [
    {
      id: 'new-todo',
      title: '新建任务',
      icon: 'mdi-plus-circle',
      action: 'newTodo',
      requireAuth: true,
    },
    {
      id: 'new-wiki',
      title: '新建文档',
      icon: 'mdi-file-document-plus',
      action: 'newWiki',
      requireAuth: true,
    },
  ],
};

/**
 * 获取可访问的菜单项
 * @param {Array} menuItems - 菜单配置数组
 * @param {Boolean} isAuthenticated - 是否已登录
 * @returns {Array} 过滤后的菜单项
 */
export function getAccessibleMenuItems(menuItems, isAuthenticated) {
  return menuItems.filter((item) => {
    if (item.divider) return true;
    if (item.requireAuth === undefined) return true;
    return item.requireAuth ? isAuthenticated : true;
  });
}

/**
 * 检查路径是否激活
 * @param {String} currentPath - 当前路径
 * @param {String} itemPath - 菜单项路径
 * @returns {Boolean}
 */
export function isPathActive(currentPath, itemPath) {
  if (itemPath === '/') {
    return currentPath === '/';
  }
  return currentPath.startsWith(itemPath);
}
