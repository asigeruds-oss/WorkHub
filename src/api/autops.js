// 自动请假条生成API
import http from './http'

// 生成请假条
export const generateAutoPsychReport = (data) => {
  return http.post('/api/leave-form/generate/', data, {
    responseType: 'blob'
  })
}

export default {
  generateAutoPsychReport
}
