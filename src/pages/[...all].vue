<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" class="text-center">
        <h1 class="text-h1 font-weight-bold mb-4">404</h1>
        <h2 class="text-h4 mb-6">页面未找到</h2>
        <p class="text-body-1 mb-8">
          您访问的页面不存在或已被移除。
        </p>
        <v-btn color="primary" size="large" to="/">
          返回首页
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<route>
{
  meta: {
    requiresAuth: false
  }
}
</route>
