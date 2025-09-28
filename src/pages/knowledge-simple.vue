<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1>知识中心测试 - 简化版本</h1>
        <p>这是一个简化的测试版本，用于调试页面空白问题。</p>
        <p>当前时间：{{ currentTime }}</p>
        <v-btn color="primary" @click="testClick">点击测试</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'

console.log('知识中心简化版开始加载...')

const currentTime = ref(new Date().toLocaleString())

const testClick = () => {
  alert('测试按钮点击成功！')
  console.log('按钮被点击')
}

console.log('知识中心简化版加载完成')
</script>

<route>
{
  name: 'knowledge-simple',
  path: '/knowledge-simple',
  meta: {
    requiresAuth: false,
    layout: 'default',
    title: '知识中心测试'
  }
}
</route>
