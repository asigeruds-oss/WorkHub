// Utilities
import { createPinia } from 'pinia'

// Stores
import { useAppStore } from './app'
import { useAuthStore } from './auth'
import { useSettingsStore } from './settings'
import { useTodoStore } from './todo'
import { useCultivationStore } from './cultivation'

export {
  useAppStore,
  useAuthStore,
  useSettingsStore,
  useTodoStore,
  useCultivationStore
}

export default createPinia()
