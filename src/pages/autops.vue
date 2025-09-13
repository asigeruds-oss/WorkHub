<template>
  <v-container>
    <v-card class="mx-auto my-8 pa-4" max-width="900">
      <v-card-title class="text-h5 font-weight-bold text-center primary--text">
        假条自动生成
      </v-card-title>
      <v-card-subtitle class="text-center mb-3">
        填写下列信息，自动生成假条
      </v-card-subtitle>

      <v-card-text>
        <v-form ref="form" v-model="valid" @submit.prevent="generateReport">
          <v-row>
            <v-col cols="12" md="6">
              <v-combobox
                v-model="formData.school"
                :items="schoolOptions"
                label="院系"
                outlined
                dense
                :readonly="loading"
                :rules="[rules.required]"
                hint="支持快捷选择和手动输入"
                persistent-hint
              ></v-combobox>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.year"
                :items="yearOptions"
                label="年级"
                outlined
                dense
                :disabled="loading"
                :rules="[rules.required]"
              ></v-select>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.major"
                label="专业"
                outlined
                dense
                :readonly="loading"
                :rules="[rules.required]"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.class"
                label="班级"
                outlined
                dense
                :readonly="loading"
                :rules="[rules.required]"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.name"
                label="姓名"
                outlined
                dense
                :readonly="loading"
                :rules="[rules.required]"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-radio-group
                v-model="formData.gender"
                row
                :disabled="loading"
              >
                <template v-slot:label>
                  <div>性别</div>
                </template>
                <v-radio value="male" label="男"></v-radio>
                <v-radio value="female" label="女"></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.nationality"
                label="民族"
                outlined
                dense
                :readonly="loading"
                :rules="[rules.required]"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.studentId"
                label="学号"
                outlined
                dense
                :readonly="loading"
                :rules="[rules.required, rules.studentId]"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.applyDate"
                label="申请日期"
                type="date"
                hint="选择申请日期"
                persistent-hint
                variant="outlined"
                prepend-inner-icon="mdi-calendar"
                :rules="[rules.required]"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-radio-group
                v-model="formData.leaveType"
                row
                :disabled="loading"
              >
                <template v-slot:label>
                  <div>请假类型</div>
                </template>
                <v-radio
                  v-for="option in leaveTypeOptions"
                  :key="option.value"
                  :value="option.value"
                  :label="option.text"
                ></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.startDate"
                label="开始日期"
                type="date"
                hint="选择开始日期"
                persistent-hint
                variant="outlined"
                prepend-inner-icon="mdi-calendar"
                :rules="[rules.required]"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.endDate"
                label="结束日期"
                type="date"
                hint="选择结束日期"
                persistent-hint
                variant="outlined"
                prepend-inner-icon="mdi-calendar"
                :rules="[rules.required]"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.phone"
                label="联系方式"
                outlined
                dense
                :readonly="loading"
                :rules="[rules.required, rules.phone]"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.parentName"
                label="家长姓名"
                outlined
                dense
                :readonly="loading"
                :rules="[rules.required]"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.parentPhone"
                label="家长联系方式"
                outlined
                dense
                :readonly="loading"
                :rules="[rules.required, rules.phone]"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.counselorName"
                label="辅导员姓名"
                outlined
                dense
                :readonly="loading"
                :rules="[rules.required]"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-row>
                <v-col cols="12" sm="7">
                  <v-text-field
                    v-model="counselorDate"
                    label="辅导员同意日期"
                    type="date"
                    hint="选择辅导员同意日期"
                    persistent-hint
                    variant="outlined"
                    prepend-inner-icon="mdi-calendar"
                    :rules="[rules.required]"
                    @update:model-value="updateCounselorDateTime"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="5">
                  <v-text-field
                    v-model="counselorTime"
                    label="辅导员同意时间"
                    type="time"
                    hint="选择具体时间"
                    persistent-hint
                    variant="outlined"
                    prepend-inner-icon="mdi-clock-outline"
                    :rules="[rules.required]"
                    @update:model-value="updateCounselorDateTime"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.destination"
                label="请假去向"
                outlined
                dense
                :readonly="loading"
                :rules="[rules.required]"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-radio-group
                v-model="formData.destinationType"
                row
                :disabled="loading"
              >
                <template v-slot:label>
                  <div>请假去向类型</div>
                </template>
                <v-radio
                  v-for="option in destinationTypeOptions"
                  :key="option.value"
                  :value="option.value"
                  :label="option.text"
                ></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="formData.leaveReason"
                label="请假事由"
                outlined
                rows="3"
                :readonly="loading"
                :rules="[rules.required]"
              ></v-textarea>
            </v-col>
          </v-row>

          <v-row>
            <v-col class="d-flex justify-center">
              <v-btn
                color="primary"
                large
                type="submit"
                :loading="loading"
                :disabled="!valid"
              >
                生成假条
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- 预览弹窗 -->
    <v-dialog v-model="showPreview" max-width="900" persistent>
      <v-card>
        <v-card-title class="headline">
          假条预览
          <v-spacer></v-spacer>
          <v-btn icon @click="showPreview = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="text-center">
          <div v-if="loading" class="d-flex justify-center align-center my-5">
            <v-progress-circular
              indeterminate
              color="primary"
              size="64"
            ></v-progress-circular>
          </div>
          <div v-else-if="reportImageUrl">
            <v-img
              :src="reportImageUrl"
              max-height="600"
              contain
              class="my-3"
            ></v-img>
            <v-btn
              color="success"
              class="mt-3"
              @click="downloadReport"
              :disabled="loading"
            >
              <v-icon left>mdi-download</v-icon>
              下载假条图片
            </v-btn>
          </div>
          <div v-else class="pa-5 text-body-1 text-grey">
            假条生成失败，请重试
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 错误提示 -->
    <v-snackbar v-model="showError" color="error" timeout="3000">
      {{ errorMessage }}
      <template v-slot:actions>
        <v-btn
          color="white"
          text
          @click="showError = false"
        >
          关闭
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { AutoPsAPI } from '../api'

// 设置页面标题 - 使用onMounted代替useHead
onMounted(() => {
  document.title = '自动生成请假条'
  
  // 初始化辅导员同意时间
  const [date, time] = formData.counselorApprovalTime.split(' ')
  counselorDate.value = date
  counselorTime.value = time || '12:00'
})

// 表单数据
const valid = ref(false)
const form = ref(null)
const loading = ref(false)
const showPreview = ref(false)
const reportImageUrl = ref(null)

// 日期状态已简化，不再需要选择器状态

// 辅导员同意时间选择器状态
const counselorDate = ref(new Date().toISOString().split('T')[0])
const counselorTime = ref('12:00')

// 错误提示
const showError = ref(false)
const errorMessage = ref('')

// 固定的年级选项
const yearOptions = ['2022', '2023', '2024', '2025']

// 院系选项
const schoolOptions = [
  '计算机科学与技术学院',
  '电子信息工程学院',
  '机械工程学院',
  '土木工程学院',
  '管理学院',
  '经济学院',
  '外国语学院',
  '数学与统计学院',
  '物理与材料科学学院',
  '化学化工学院'
]

// 请假类型选项
const leaveTypeOptions = [
  { value: 'personal', text: '事假' },
  { value: 'sick', text: '病假' }
]

// 请假去向类型选项
const destinationTypeOptions = [
  { value: 'inSchool', text: '校内' },
  { value: 'cityLeave', text: '离校（在郑）' },
  { value: 'provinceLeave', text: '离校（省内）' },
  { value: 'outProvince', text: '省外及其他区域' }
]

// 获取当天日期
const today = new Date().toISOString().split('T')[0]

// 表单数据 - 根据新提供的字段列表构建
const formData = reactive({
  school: '计算机科学与技术学院', // 院系
  year: '2022', // 年级
  major: '人工智能', // 专业
  class: '人工智能2201', // 班级
  name: '张东方', // 姓名
  gender: 'male', // 性别
  nationality: '汉族', // 民族
  studentId: '542207250127', // 学号
  applyDate: today, // 申请日期，默认为当天
  startDate: today, // 开始日期，默认为当天
  endDate: today, // 结束日期，默认为当天
  phone: '13232995320', // 联系方式
  parentName: '李秀英', // 家长姓名
  parentPhone: '13811498690', // 家长联系方式
  counselorName: '王导员', // 辅导员姓名
  counselorApprovalTime: `${today} 12:00`, // 辅导员同意时间 (格式: YYYY-MM-DD HH:mm)
  leaveType: 'personal', // 事假/病假选择
  destination: '武汉', // 请假去向
  destinationType: 'inSchool', // 请假去向类型（校内/离校等）
  leaveReason: '校外实习' // 请假事由
})

// 验证规则
const rules = {
  required: v => !!v || '此字段为必填项',
  phone: v => !v || /^1[3-9]\d{9}$/.test(v) || '请输入正确的手机号',
  studentId: v => !v || /^\d{10,12}$/.test(v) || '请输入10-12位学号',
  dateTime: v => !v || /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(v) || '请选择正确的日期和时间'
}

// 生成假条
async function generateReport() {
  try {
    if (!form.value.validate()) {
      return
    }
    
    loading.value = true
    showPreview.value = true
    
    // 准备要发送的数据
    const payload = {
      ...formData,
      gender: formData.gender === 'male' ? '男' : '女',
      leaveType: mapLeaveType(formData.leaveType),
      destinationType: mapDestinationType(formData.destinationType)
    }
    
    // 发送请求到后端
    const response = await AutoPsAPI.generateAutoPsychReport(payload)
    
    // 创建图片URL
    const blob = new Blob([response.data], { type: 'image/png' })
    reportImageUrl.value = URL.createObjectURL(blob)
    
    // 自动下载
    downloadReport()
  } catch (error) {
    console.error('生成假条失败:', error)
    errorMessage.value = '生成假条失败，请稍后重试'
    showError.value = true
    showPreview.value = false
  } finally {
    loading.value = false
  }
}

// 映射请假去向类型
function mapDestinationType(type) {
  const typeMap = {
    'inSchool': '校内',
    'cityLeave': '离校（在郑）',
    'provinceLeave': '离校（省内）',
    'outProvince': '省外及其他区域'
  }
  return typeMap[type] || type
}

// 映射请假类型
function mapLeaveType(type) {
  return type === 'personal' ? '事假' : '病假'
}

// 更新辅导员同意时间
function updateCounselorDateTime() {
  if (counselorDate.value && counselorTime.value) {
    // 格式化为 "YYYY-MM-DD HH:mm" 格式
    formData.counselorApprovalTime = `${counselorDate.value} ${counselorTime.value}`
  }
}

// 下载假条
function downloadReport() {
  if (!reportImageUrl.value) return
  
  const link = document.createElement('a')
  link.href = reportImageUrl.value
  link.download = `请假条_${formData.name}_${formData.startDate}至${formData.endDate}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped>
.v-form {
  max-width: 100%;
}

.v-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  background-color: #f8f9fa;
}

.v-card-title {
  letter-spacing: 0.05em;
  font-weight: 600;
}

.v-btn.primary {
  text-transform: none;
  letter-spacing: 0.05em;
  font-weight: 500;
  height: 48px;
  min-width: 180px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s;
}

.v-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.v-text-field :deep(.v-field__field) {
  background-color: #fff;
}
</style>

<route>
{
  meta: {
    requiresAuth: false,
    layout: 'default'
  }
}
</route>
