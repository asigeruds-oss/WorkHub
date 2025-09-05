import { AuthAPI } from './auth'
import { TodoAPI } from './todo'
import http from './http'

/**
 * 统一导出所有API服务
 */
export {
  AuthAPI,
  TodoAPI,
  http
}

/**
 * 默认导出所有API服务的对象
 */
export default {
  auth: AuthAPI,
  todo: TodoAPI,
  http
}
