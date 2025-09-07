import { AuthAPI } from './auth'
import { TodoAPI } from './todo'
import { NotificationAPI } from './notification'
import http from './http'

/**
 * 统一导出所有API服务
 */
export {
  AuthAPI,
  TodoAPI,
  NotificationAPI,
  http
}

/**
 * 默认导出所有API服务的对象
 */
export default {
  auth: AuthAPI,
  todo: TodoAPI,
  notification: NotificationAPI,
  http
}
