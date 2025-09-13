import { AuthAPI } from './auth'
import { TodoAPI } from './todo'
import { NotificationAPI } from './notification'
import http from './http'
import AutoPsAPI from './autops'

/**
 * 统一导出所有API服务
 */
export {
  AuthAPI,
  TodoAPI,
  NotificationAPI,
  AutoPsAPI,
  http
}

/**
 * 默认导出所有API服务的对象
 */
export default {
  auth: AuthAPI,
  todo: TodoAPI,
  notification: NotificationAPI,
  autops: AutoPsAPI,
  http
}
