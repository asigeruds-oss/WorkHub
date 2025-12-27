<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-4">
          <h1 class="text-h4 font-weight-medium">
            <v-icon icon="mdi-cog" class="mr-2"></v-icon>
            设置
          </h1>
        </div>

        <v-card class="mb-6" elevation="2" rounded="lg">
          <v-card-title class="text-h6 py-3 bg-primary">
            <v-icon icon="mdi-bell" class="mr-2"></v-icon>
            通知设置
          </v-card-title>

          <v-card-text class="pa-4">
            <v-row>
              <v-col cols="12">
                <v-switch
                  v-model="notificationSettings.enabled"
                  label="启用通知"
                  color="primary"
                  hide-details
                  class="mb-4"
                  @update:model-value="updateNotificationSettings"
                ></v-switch>

                <v-divider
                  class="my-4"
                  v-if="notificationSettings.enabled"
                ></v-divider>

                <div v-if="notificationSettings.enabled">
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-select
                        v-model="notificationSettings.push_channel"
                        label="通知渠道"
                        :items="pushChannelOptions"
                        item-title="text"
                        item-value="value"
                        variant="outlined"
                        density="comfortable"
                        prepend-inner-icon="mdi-message-settings-variant"
                        @update:model-value="updateNotificationSettings"
                        class="mb-4"
                      ></v-select>
                    </v-col>

                    <v-col cols="12" sm="6">
                      <v-select
                        v-model="notificationSettings.position"
                        label="通知位置"
                        :items="notificationPositionOptions"
                        item-title="text"
                        item-value="value"
                        variant="outlined"
                        density="comfortable"
                        prepend-inner-icon="mdi-arrow-decision"
                        @update:model-value="updateNotificationSettings"
                        class="mb-4"
                      ></v-select>
                    </v-col>
                  </v-row>

                  <v-card class="mb-4 pa-3" variant="outlined">
                    <v-card-title class="text-subtitle-1"
                      >提醒规则</v-card-title
                    >
                    <v-card-text>
                      <v-row>
                        <v-col cols="12">
                          <v-switch
                            v-model="notificationSettings.enable_daily_reminder"
                            label="日常提醒"
                            color="primary"
                            hide-details
                            class="mb-3"
                            @update:model-value="updateNotificationSettings"
                          ></v-switch>

                          <div
                            v-if="notificationSettings.enable_daily_reminder"
                            class="ml-8 mb-4"
                          >
                            <v-row>
                              <v-col cols="12" sm="6">
                                <v-slider
                                  v-model="
                                    notificationSettings.daily_reminder_hours
                                  "
                                  :min="1"
                                  :max="72"
                                  :step="1"
                                  label="提前小时数"
                                  thumb-label="always"
                                  @update:model-value="
                                    updateNotificationSettings
                                  "
                                >
                                  <template v-slot:append>
                                    <v-text-field
                                      v-model="
                                        notificationSettings.daily_reminder_hours
                                      "
                                      type="number"
                                      style="width: 70px"
                                      density="compact"
                                      hide-details
                                      variant="outlined"
                                      @update:model-value="
                                        updateNotificationSettings
                                      "
                                    ></v-text-field>
                                  </template>
                                </v-slider>
                              </v-col>
                              <v-col cols="12" sm="6">
                                <v-text-field
                                  v-model="
                                    notificationSettings.daily_reminder_time
                                  "
                                  label="每日提醒时间"
                                  type="time"
                                  variant="outlined"
                                  density="compact"
                                  hint="设置每日固定提醒时间"
                                  persistent-hint
                                  @update:model-value="
                                    updateNotificationSettings
                                  "
                                ></v-text-field>
                              </v-col>
                            </v-row>
                          </div>

                          <v-switch
                            v-model="notificationSettings.enable_soon_reminder"
                            label="较紧急提醒"
                            color="warning"
                            hide-details
                            class="mb-3"
                            @update:model-value="updateNotificationSettings"
                          ></v-switch>

                          <div
                            v-if="notificationSettings.enable_soon_reminder"
                            class="ml-8 mb-4"
                          >
                            <v-slider
                              v-model="notificationSettings.soon_reminder_hours"
                              :min="1"
                              :max="24"
                              :step="1"
                              label="提前小时数"
                              thumb-label="always"
                              color="warning"
                              @update:model-value="updateNotificationSettings"
                            >
                              <template v-slot:append>
                                <v-text-field
                                  v-model="
                                    notificationSettings.soon_reminder_hours
                                  "
                                  type="number"
                                  style="width: 70px"
                                  density="compact"
                                  hide-details
                                  variant="outlined"
                                  @update:model-value="
                                    updateNotificationSettings
                                  "
                                ></v-text-field>
                              </template>
                            </v-slider>
                          </div>

                          <v-switch
                            v-model="
                              notificationSettings.enable_urgent_reminder
                            "
                            label="紧急提醒"
                            color="error"
                            hide-details
                            class="mb-3"
                            @update:model-value="updateNotificationSettings"
                          ></v-switch>

                          <div
                            v-if="notificationSettings.enable_urgent_reminder"
                            class="ml-8 mb-4"
                          >
                            <v-slider
                              v-model="
                                notificationSettings.urgent_reminder_hours
                              "
                              :min="1"
                              :max="8"
                              :step="1"
                              label="提前小时数"
                              thumb-label="always"
                              color="error"
                              @update:model-value="updateNotificationSettings"
                            >
                              <template v-slot:append>
                                <v-text-field
                                  v-model="
                                    notificationSettings.urgent_reminder_hours
                                  "
                                  type="number"
                                  style="width: 70px"
                                  density="compact"
                                  hide-details
                                  variant="outlined"
                                  @update:model-value="
                                    updateNotificationSettings
                                  "
                                ></v-text-field>
                              </template>
                            </v-slider>
                          </div>

                          <v-switch
                            v-model="
                              notificationSettings.enable_overdue_reminder
                            "
                            label="过期提醒"
                            color="grey"
                            hide-details
                            class="mb-3"
                            @update:model-value="updateNotificationSettings"
                          ></v-switch>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>

                  <div class="d-flex align-center mt-4">
                    <v-btn
                      color="info"
                      prepend-icon="mdi-bell-ring"
                      @click="testNotification"
                      class="mr-4"
                    >
                      测试通知
                    </v-btn>

                    <v-btn
                      color="warning"
                      prepend-icon="mdi-refresh"
                      @click="resetNotificationSettings"
                      variant="outlined"
                    >
                      重置通知设置
                    </v-btn>

                    <v-spacer></v-spacer>

                    <v-btn
                      color="primary"
                      prepend-icon="mdi-content-save"
                      @click="syncNotificationSettings"
                    >
                      保存到服务器
                    </v-btn>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- 提示信息 -->
        <v-alert type="info" border="start" icon="mdi-information" class="mb-4">
          通知设置会自动保存到本地，点击"保存到服务器"按钮同步到服务器。
        </v-alert>
      </v-col>
    </v-row>

    <!-- 提示消息 -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    >
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false"> 关闭 </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useSettingsStore } from "@/stores/settings";

// 初始化 store
const settingsStore = useSettingsStore();

// 组件状态
const snackbar = reactive({
  show: false,
  text: "",
  color: "success",
  timeout: 3000,
});

// 通知设置
const notificationSettings = reactive({
  ...settingsStore.getNotificationSettings,
});

// 通知渠道选项
const pushChannelOptions = [
  { text: "微信", value: "wechat" },
  { text: "钉钉", value: "dingtalk" },
  { text: "全部渠道", value: "both" },
  { text: "不使用外部推送", value: "none" },
];

// 引入通知API
import { NotificationAPI } from "@/api/notification";

// 更新通知设置
function updateNotificationSettings() {
  settingsStore.updateNotificationSettings({
    enabled: notificationSettings.enabled,
    push_channel: notificationSettings.push_channel,
    enable_daily_reminder: notificationSettings.enable_daily_reminder,
    enable_soon_reminder: notificationSettings.enable_soon_reminder,
    enable_urgent_reminder: notificationSettings.enable_urgent_reminder,
    enable_overdue_reminder: notificationSettings.enable_overdue_reminder,
    daily_reminder_hours: Number(notificationSettings.daily_reminder_hours),
    soon_reminder_hours: Number(notificationSettings.soon_reminder_hours),
    urgent_reminder_hours: Number(notificationSettings.urgent_reminder_hours),
    daily_reminder_time: notificationSettings.daily_reminder_time,
  });

  showNotification("通知设置已本地更新");
}

// 同步通知设置到服务器
async function syncNotificationSettings() {
  try {
    const settings = {
      push_channel: notificationSettings.push_channel,
      enable_daily_reminder: notificationSettings.enable_daily_reminder,
      enable_soon_reminder: notificationSettings.enable_soon_reminder,
      enable_urgent_reminder: notificationSettings.enable_urgent_reminder,
      enable_overdue_reminder: notificationSettings.enable_overdue_reminder,
      daily_reminder_hours: Number(notificationSettings.daily_reminder_hours),
      soon_reminder_hours: Number(notificationSettings.soon_reminder_hours),
      urgent_reminder_hours: Number(notificationSettings.urgent_reminder_hours),
      daily_reminder_time: notificationSettings.daily_reminder_time,
    };

    const response = await NotificationAPI.updateSettings(settings);
    Object.assign(notificationSettings, response);
    settingsStore.updateNotificationSettings(notificationSettings);

    showNotification("通知设置已保存到服务器", "success");
  } catch (error) {
    console.error("同步通知设置失败", error);
    showNotification(
      "保存设置到服务器失败: " + (error.message || "未知错误"),
      "error"
    );
  }
}

// 重置通知设置
async function resetNotificationSettings() {
  try {
    const response = await NotificationAPI.resetSettings();
    Object.assign(notificationSettings, response);
    settingsStore.updateNotificationSettings(notificationSettings);

    showNotification("通知设置已重置为默认值", "info");
  } catch (error) {
    console.error("重置通知设置失败", error);
    showNotification(
      "重置通知设置失败: " + (error.message || "未知错误"),
      "error"
    );
  }
}

// 测试通知
function testNotification() {
  showNotification("这是一条测试通知", "success");
}

// 显示通知
function showNotification(text, color = "success", timeout = 3000) {
  snackbar.show = true;
  snackbar.text = text;
  snackbar.color = color;
  snackbar.timeout = timeout;
}

// 从API加载通知设置
async function loadNotificationSettings() {
  try {
    const settings = await NotificationAPI.getSettings();
    Object.assign(notificationSettings, settings);
    settingsStore.updateNotificationSettings(notificationSettings);
    return settings;
  } catch (error) {
    console.error("加载通知设置失败", error);
    showNotification(
      "加载通知设置失败: " + (error.message || "未知错误"),
      "error"
    );
    return null;
  }
}

// 生命周期钩子
onMounted(async () => {
  await loadNotificationSettings();
});
</script>

<style scoped>
.v-card-text {
  padding-top: 24px !important;
}
</style>

<route>
{
  meta: {
    requiresAuth: true,
    layout: 'default',
    title: '设置'
  }
}
</route>
