<template>
  <v-card class="mb-4" elevation="3" rounded="lg" v-if="statistics">
    <v-card-title class="d-flex align-center py-3">
      <v-icon
        icon="mdi-chart-box-outline"
        class="mr-2"
        color="primary"
      ></v-icon>
      <span>任务概览</span>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text class="pa-4">
      <!-- 总体进度 -->
      <div class="mb-4">
        <div class="d-flex justify-space-between align-center mb-1">
          <span class="text-caption text-grey-darken-1">总体完成率</span>
          <span class="text-caption font-weight-bold text-primary">
            {{ statistics.completion_rate }}%
          </span>
        </div>
        <v-progress-linear
          :model-value="statistics.completion_rate"
          color="primary"
          height="8"
          rounded
          striped
        ></v-progress-linear>
      </div>

      <!-- 核心指标 -->
      <v-row dense class="mb-4">
        <v-col cols="6">
          <div class="text-center pa-2 bg-grey-lighten-4 rounded">
            <div class="text-h5 font-weight-bold text-primary">
              {{ statistics.incomplete_count }}
            </div>
            <div class="text-caption text-grey-darken-1">待处理</div>
          </div>
        </v-col>
        <v-col cols="6">
          <div class="text-center pa-2 bg-grey-lighten-4 rounded">
            <div class="text-h5 font-weight-bold text-success">
              {{ statistics.by_status.done }}
            </div>
            <div class="text-caption text-grey-darken-1">已完成</div>
          </div>
        </v-col>
      </v-row>

      <!-- 截止日期分析 -->
      <div class="mb-4" v-if="statistics.by_deadline">
        <div class="text-subtitle-2 mb-2 font-weight-bold">截止日期</div>
        <div class="d-flex justify-space-between align-center mb-1">
          <span class="text-caption text-error">
            <v-icon
              icon="mdi-alert-circle"
              size="x-small"
              color="error"
              class="mr-1"
            ></v-icon>
            已逾期
          </span>
          <span class="text-caption font-weight-bold text-error">
            {{ statistics.by_deadline.overdue }}
          </span>
        </div>
        <div class="d-flex justify-space-between align-center mb-1">
          <span class="text-caption text-warning">
            <v-icon
              icon="mdi-calendar-today"
              size="x-small"
              color="warning"
              class="mr-1"
            ></v-icon>
            今日截止
          </span>
          <span class="text-caption font-weight-bold text-warning">
            {{ statistics.by_deadline.due_today }}
          </span>
        </div>
        <div class="d-flex justify-space-between align-center">
          <span class="text-caption text-info">
            <v-icon
              icon="mdi-calendar-week"
              size="x-small"
              color="info"
              class="mr-1"
            ></v-icon>
            本周截止
          </span>
          <span class="text-caption font-weight-bold text-info">
            {{ statistics.by_deadline.due_this_week }}
          </span>
        </div>
      </div>

      <!-- 优先级分布 -->
      <div v-if="statistics.by_priority">
        <div class="text-subtitle-2 mb-2 font-weight-bold">
          优先级分布 (待办)
        </div>
        <div class="d-flex flex-wrap gap-2" style="gap: 8px">
          <v-chip size="x-small" color="error" variant="flat" class="px-2">
            极高: {{ statistics.by_priority.critical || 0 }}
          </v-chip>
          <v-chip
            size="x-small"
            color="deep-orange"
            variant="flat"
            class="px-2"
          >
            高: {{ statistics.by_priority.high || 0 }}
          </v-chip>
          <v-chip size="x-small" color="warning" variant="flat" class="px-2">
            中: {{ statistics.by_priority.medium || 0 }}
          </v-chip>
          <v-chip size="x-small" color="success" variant="flat" class="px-2">
            低: {{ statistics.by_priority.low || 0 }}
          </v-chip>
          <v-chip size="x-small" color="info" variant="flat" class="px-2">
            极低: {{ statistics.by_priority.minimal || 0 }}
          </v-chip>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  statistics: {
    type: Object,
    required: true,
  },
});
</script>
