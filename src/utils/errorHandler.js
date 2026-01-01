/**
 * 统一错误处理服务
 */

import { logger } from './logger'

/**
 * 错误类型枚举
 */
export const ErrorType = {
  NETWORK: 'NETWORK_ERROR',
  AUTH: 'AUTH_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
}

/**
 * 自定义应用错误类
 */
export class AppError extends Error {
  constructor(message, type = ErrorType.UNKNOWN, originalError = null) {
    super(message)
    this.name = 'AppError'
    this.type = type
    this.originalError = originalError
    this.timestamp = new Date().toISOString()
  }
}

/**
 * 错误处理器类
 */
class ErrorHandler {
  constructor() {
    this.errorListeners = []
  }

  /**
   * 注册错误监听器（用于显示通知等）
   */
  onError(callback) {
    this.errorListeners.push(callback)
    return () => {
      this.errorListeners = this.errorListeners.filter(cb => cb !== callback)
    }
  }

  /**
   * 触发错误监听器
   */
  notifyListeners(error) {
    this.errorListeners.forEach(callback => {
      try {
        callback(error)
      } catch (err) {
        logger.error('错误监听器执行失败', err)
      }
    })
  }

  /**
   * 处理错误
   */
  handle(error, context = '') {
    const appError = this.normalizeError(error)
    
    // 记录错误日志
    logger.error(`[${context}] ${appError.type}: ${appError.message}`, appError.originalError)

    // 通知监听器
    this.notifyListeners(appError)

    return appError
  }

  /**
   * 标准化错误对象
   */
  normalizeError(error) {
    // 已经是AppError
    if (error instanceof AppError) {
      return error
    }

    // Axios错误
    if (error.response) {
      const status = error.response.status
      const data = error.response.data

      if (status === 401 || status === 403) {
        return new AppError(
          data?.detail || data?.message || '认证失败',
          ErrorType.AUTH,
          error
        )
      }

      if (status >= 400 && status < 500) {
        return new AppError(
          data?.detail || data?.message || '请求参数错误',
          ErrorType.VALIDATION,
          error
        )
      }

      if (status >= 500) {
        return new AppError(
          '服务器错误，请稍后重试',
          ErrorType.SERVER,
          error
        )
      }
    }

    // 网络错误
    if (error.request) {
      return new AppError(
        '网络连接失败，请检查网络设置',
        ErrorType.NETWORK,
        error
      )
    }

    // 其他错误
    return new AppError(
      error.message || '未知错误',
      ErrorType.UNKNOWN,
      error
    )
  }

  /**
   * 获取用户友好的错误消息
   */
  getUserMessage(error) {
    const appError = this.normalizeError(error)
    return appError.message
  }
}

// 导出单例
export const errorHandler = new ErrorHandler()

// 导出便捷方法
export function handleError(error, context = '') {
  return errorHandler.handle(error, context)
}

export function getUserErrorMessage(error) {
  return errorHandler.getUserMessage(error)
}
