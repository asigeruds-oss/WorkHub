<template>
  <v-footer class="bg-grey-lighten-4">
    <v-row justify="center" no-gutters>
      <v-col class="text-center py-6" cols="12">
        <!-- 快捷链接 -->
        <div class="footer-links mb-4">
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

        <!-- 版权信息 -->
        <div class="footer-copyright">
          <div class="text-body-2 font-weight-bold mb-2 text-medium-emphasis">
            © {{ new Date().getFullYear() }} <strong>青牛线</strong> —
            让效率更高
          </div>

          <div class="text-caption text-medium-emphasis">
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              class="text-decoration-none text-medium-emphasis"
            >
              鲁ICP备2023039013号-1
            </a>
          </div>
        </div>

        <!-- 装饰图案 -->
        <div class="footer-pattern mt-4">
          <div class="pattern-dot"></div>
          <div class="pattern-dot"></div>
          <div class="pattern-dot"></div>
        </div>
      </v-col>
    </v-row>
  </v-footer>
</template>

<script setup>
const items = [
  {
    title: "主页",
    icon: "mdi-home",
    href: "/",
  },
  {
    title: "待办事项",
    icon: "mdi-checkbox-marked-outline",
    href: "/todos",
  },
];
</script>

<style scoped lang="sass">
/* ========== 吉祥物主题页脚样式 ========== */
.mascot-footer
  background: linear-gradient(180deg, #FFF8DC 0%, #FFE4B5 100%) !important
  border-top: 3px solid #8B4513
  box-shadow: 0 -4px 12px rgba(139, 69, 19, 0.15)
  position: relative
  overflow: hidden

  &::before
    content: ''
    position: absolute
    top: 0
    left: 0
    right: 0
    height: 2px
    background: linear-gradient(90deg, transparent 0%, #FFD700 50%, transparent 100%)

/* 装饰性分割线 */
.footer-decoration
  display: flex
  align-items: center
  justify-content: center
  gap: 20px

.decoration-line
  flex: 1
  max-width: 200px
  height: 2px
  background: linear-gradient(90deg, transparent 0%, #8B4513 50%, transparent 100%)

.decoration-icons
  display: flex
  gap: 12px

.decoration-icon
  font-size: 1.2rem
  animation: floatIcon 2s ease-in-out infinite
  display: inline-block

  &:nth-child(1)
    animation-delay: 0s

  &:nth-child(2)
    animation-delay: 0.3s

  &:nth-child(3)
    animation-delay: 0.6s

@keyframes floatIcon
  0%, 100%
    transform: translateY(0)
  50%
    transform: translateY(-5px)

/* 快捷链接 */
.footer-links
  display: flex
  flex-wrap: wrap
  justify-content: center
  gap: 8px

.mascot-footer-btn
  color: #5D2E0F !important
  font-weight: 600
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
  border: 2px solid transparent

  &:hover
    background: rgba(139, 69, 19, 0.1) !important
    border-color: #8B4513
    transform: translateY(-2px)
    color: #8B4513 !important

  :deep(.v-icon)
    color: #8B4513
    transition: transform 0.3s ease

  &:hover :deep(.v-icon)
    transform: scale(1.2) rotate(10deg)

/* 版权信息 */
.footer-copyright
  padding: 12px 0

.icp-link
  color: #8B4513 !important
  font-weight: 500
  transition: all 0.2s ease
  padding: 4px 8px
  border-radius: 8px
  display: inline-block

  &:hover
    color: #5D2E0F !important
    background: rgba(139, 69, 19, 0.1)
    transform: translateY(-1px)

/* 装饰图案 */
.footer-pattern
  display: flex
  justify-content: center
  gap: 8px

.pattern-dot
  width: 8px
  height: 8px
  background: #8B4513
  border-radius: 50%
  opacity: 0.3
  animation: pulseDot 2s ease-in-out infinite

  &:nth-child(1)
    animation-delay: 0s

  &:nth-child(2)
    animation-delay: 0.4s

  &:nth-child(3)
    animation-delay: 0.8s

@keyframes pulseDot
  0%, 100%
    opacity: 0.3
    transform: scale(1)
  50%
    opacity: 0.8
    transform: scale(1.3)

/* 响应式 */
@media (max-width: 600px)
  .footer-decoration
    gap: 10px

  .decoration-line
    max-width: 80px

  .footer-links
    flex-direction: column
    align-items: center

  .mascot-footer-btn
    width: 200px
</style>
