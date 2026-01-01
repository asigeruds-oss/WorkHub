/**
 * 统一日志管理工具
 * 根据环境变量控制日志输出
 */

const isDevelopment = import.meta.env.DEV
const isProduction = import.meta.env.PROD

// 日志级别
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4,
}

// 当前日志级别（生产环境只输出ERROR，开发环境输出所有）
const currentLogLevel = isProduction ? LogLevel.ERROR : LogLevel.DEBUG

/**
 * 格式化日志消息
 */
function formatMessage(level, context, message, ...args) {
  const timestamp = new Date().toISOString()
  const prefix = context ? `[${context}]` : ''
  return [`[${timestamp}] [${level}] ${prefix}`, message, ...args]
}

/**
 * 日志记录器
 */
class Logger {
  constructor(context = '') {
    this.context = context
  }

  /**
   * 调试日志 - 仅开发环境
   */
  debug(message, ...args) {
    if (currentLogLevel <= LogLevel.DEBUG && isDevelopment) {
      console.log(...formatMessage('DEBUG', this.context, message, ...args))
    }
  }

  /**
   * 信息日志 - 仅开发环境
   */
  info(message, ...args) {
    if (currentLogLevel <= LogLevel.INFO && isDevelopment) {
      console.info(...formatMessage('INFO', this.context, message, ...args))
    }
  }

  /**
   * 警告日志 - 开发和生产环境
   */
  warn(message, ...args) {
    if (currentLogLevel <= LogLevel.WARN) {
      console.warn(...formatMessage('WARN', this.context, message, ...args))
    }
  }

  /**
   * 错误日志 - 所有环境
   */
  error(message, ...args) {
    if (currentLogLevel <= LogLevel.ERROR) {
      console.error(...formatMessage('ERROR', this.context, message, ...args))
    }
  }

  /**
   * 创建带上下文的子logger
   */
  child(subContext) {
    const newContext = this.context ? `${this.context}:${subContext}` : subContext
    return new Logger(newContext)
  }
}

// 导出默认logger实例
export const logger = new Logger()

// 导出Logger类供创建带上下文的实例
export default Logger
