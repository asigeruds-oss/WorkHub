// Utilities
import { createPinia } from 'pinia'

// Stores
import { useAppStore } from './app'
import { useAuthStore } from './auth'
import { useSettingsStore } from './settings'
import { useTodoStore } from './todo'

export {
  useAppStore,
  useAuthStore,
  useSettingsStore,
  useTodoStore
}

export default createPinia()
