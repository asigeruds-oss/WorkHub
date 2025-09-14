<template>
  <v-footer
    class="bg-grey-lighten-3"
  >
    <v-row justify="center" no-gutters>
      <v-col class="text-center py-4" cols="12">
        <div>
          <v-btn
            v-for="item in items"
            :key="item.title"
            variant="text"
            :href="item.href"
            target="_blank"
            rel="noopener noreferrer"
            class="mx-2"
          >
            <v-icon :icon="item.icon" class="mr-1"></v-icon>
            {{ item.title }}
          </v-btn>
        </div>

        <div class="mt-4 text-caption text-grey">
          &copy; {{ (new Date()).getFullYear() }} — <strong>内容管理系统</strong>
        </div>
        
        <div class="mt-2 text-caption text-grey">
          <a 
            href="https://beian.miit.gov.cn/" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-decoration-none text-grey"
          >
            鲁IPC备2023039013号-1
          </a>
        </div>
      </v-col>
    </v-row>
  </v-footer>
</template>

<script setup>
  const items = [
    {
      title: '主页',
      icon: 'mdi-home',
      href: '/',
    },
    {
      title: '待办事项',
      icon: 'mdi-checkbox-marked-outline',
      href: '/todos',
    }
  ]
</script>

<style scoped lang="sass">
  .social-link :deep(.v-icon)
    color: rgba(var(--v-theme-on-background), var(--v-disabled-opacity))
    text-decoration: none
    transition: .2s ease-in-out

    &:hover
      color: rgba(25, 118, 210, 1)
      
  a
    transition: color 0.2s ease-in-out
    
    &:hover
      color: rgba(25, 118, 210, 1) !important
</style>
