import { AuthAPI } from './auth'
import { TodoAPI } from './todo'
import { NotificationAPI } from './notification'
import http from './http'
import AutoPsAPI from './autops'
import FeedbackAPI from './feedback'
import MessageAPI from './message'
import WikiAPI from './wiki'
import CultivationAPI from './cultivation'

/**
 * 统一导出所有API服务
 */
export {
  AuthAPI,
  TodoAPI,
  NotificationAPI,
  AutoPsAPI,
  FeedbackAPI,
  MessageAPI,
  WikiAPI,
  CultivationAPI,
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
  feedback: FeedbackAPI,
  message: MessageAPI,
  wiki: WikiAPI,
  cultivation: CultivationAPI,
  http
}
