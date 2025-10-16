// 自动请假条生成API
import http from './http'

// 生成请假条
export const generateAutoPsychReport = (data) => {
  return http.post('/api/leave-form/generate/', data, {
    responseType: 'blob'
  })
}

// 获取请假条信息
export const getLeaveFormInfo = (uuid) => {
  return http.get(`/api/leave-form-info/${uuid}/`)
}

export default {
  generateAutoPsychReport,
  getLeaveFormInfo
}
