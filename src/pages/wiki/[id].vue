<template>
  <wiki-index />
</template>

<script setup>
import WikiIndex from './index.vue'
</script>

<route>
{
  name: 'wiki-page',
  path: '/wiki/:id',
  meta: {
    requiresAuth: false,
    layout: 'default',
    title: 'Wiki 页面'
  }
}
</route>
