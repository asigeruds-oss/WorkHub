<template>
  <v-container>
    <h1>知识中心测试页面</h1>
    <p>如果您能看到这个页面，说明路由配置是正确的。</p>
  </v-container>
</template>

<script setup>
// 简单测试
console.log('知识中心页面已加载');
</script>

<route>
{
  name: 'knowledge-test',
  path: '/knowledge-test',
  meta: {
    requiresAuth: false,
    layout: 'default',
    title: '知识中心测试'
  }
}
</route>
