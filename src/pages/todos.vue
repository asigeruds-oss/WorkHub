<template>
  <div class="todos-page">
    <v-container fluid class="pa-4">
      <v-row>
        <!-- 左侧栏：日常任务 -->
        <v-col cols="12" md="3">
          <DailyTaskList :showNotification="showNotification" />

          <!-- 待办事项统计 -->
          <TodoStatistics :statistics="statistics" />
        </v-col>

        <!-- 右侧栏：待办事项列表 -->
        <v-col cols="12" md="9">
          <!-- 工具栏 -->
          <div class="d-flex align-center mb-4">
            <!-- 视图切换 -->
            <v-btn-toggle
              v-model="currentView"
              mandatory
              density="compact"
              color="primary"
              rounded="lg"
              class="elevation-0 border"
              @update:modelValue="handleViewChange"
            >
              <v-btn value="todos" size="small" class="px-4">
                <v-icon size="small" start
                  >mdi-checkbox-marked-circle-outline</v-icon
                >
                待办
              </v-btn>
              <v-btn value="memos" size="small" class="px-4">
                <v-icon size="small" start>mdi-note-text-outline</v-icon>
                备忘
              </v-btn>
            </v-btn-toggle>

            <!-- 状态筛选下拉菜单 -->
            <v-menu location="bottom start">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  variant="text"
                  size="small"
                  class="ml-2 text-grey-darken-1"
                  prepend-icon="mdi-filter-variant"
                >
                  {{ getFilterLabel(filter) }}
                  <v-icon end size="small">mdi-chevron-down</v-icon>
                </v-btn>
              </template>
              <v-list density="compact" nav class="py-0">
                <v-list-item
                  v-for="option in filterOptions"
                  :key="option.value"
                  :value="option.value"
                  @click="setFilter(option.value)"
                  :active="filter === option.value"
                  color="primary"
                  min-height="36"
                >
                  <template v-slot:prepend>
                    <v-icon
                      :icon="getFilterIcon(option.value)"
                      size="small"
                      class="mr-2"
                    ></v-icon>
                  </template>
                  <v-list-item-title>{{ option.text }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>

            <v-spacer></v-spacer>

            <!-- 动态显示添加按钮 -->
            <v-btn
              v-if="currentView === 'todos'"
              @click="openAddDialog"
              color="primary"
              size="small"
              variant="flat"
              rounded="lg"
              elevation="0"
              class="text-none"
            >
              <v-icon size="small" start>mdi-plus</v-icon>
              添加任务
            </v-btn>
            <v-btn
              v-else
              @click="openAddMemoDialog"
              color="primary"
              size="small"
              variant="flat"
              rounded="lg"
              elevation="0"
              class="text-none"
            >
              <v-icon size="small" start>mdi-plus</v-icon>
              添加备忘
            </v-btn>
          </div>

          <!-- 快速添加任务栏 -->
          <v-card class="mb-4" elevation="0" border rounded="lg">
            <div class="d-flex align-center pa-2">
              <v-icon color="grey" class="ml-2 mr-2">mdi-plus</v-icon>
              <v-text-field
                v-model="quickAddTitle"
                :placeholder="
                  currentView === 'todos'
                    ? '添加新任务，按回车快速创建...'
                    : '添加新备忘，按回车快速创建...'
                "
                variant="plain"
                hide-details
                density="compact"
                @keyup.enter="handleQuickAdd"
              ></v-text-field>
              <v-btn
                v-if="quickAddTitle"
                color="primary"
                variant="text"
                size="small"
                @click="handleQuickAdd"
                :loading="isQuickAdding"
              >
                添加
              </v-btn>
            </div>
          </v-card>

          <!-- 吉祥物欢迎语 -->
          <v-alert
            v-if="!todoStore.isLoading && filteredTodos.length > 0"
            color="primary"
            variant="tonal"
            class="mb-4"
            density="compact"
            icon="mdi-emoticon-happy-outline"
            closable
          >
            {{ getMascotMessage() }}
          </v-alert>

          <!-- 加载状态 -->
          <div
            v-if="todoStore.isLoading && !loadingMore"
            class="d-flex justify-center my-4"
          >
            <v-progress-circular
              indeterminate
              color="primary"
            ></v-progress-circular>
          </div>

          <!-- 错误提示 -->
          <v-alert v-if="todoStore.getError" type="error" class="mb-4" closable>
            {{ todoStore.getError }}
          </v-alert>

          <!-- 操作通知提示 -->
          <v-snackbar
            v-model="snackbar.show"
            :color="snackbar.color"
            :timeout="snackbar.timeout"
          >
            {{ snackbar.text }}
            <template v-slot:actions>
              <v-btn variant="text" @click="snackbar.show = false">
                关闭
              </v-btn>
            </template>
          </v-snackbar>

          <!-- 没有待办事项或备忘录 -->
          <div
            v-if="filteredTodos.length === 0 && !todoStore.isLoading"
            class="text-center py-8 text-grey"
          >
            <div class="text-body-2 mb-2">
              {{ currentView === "todos" ? "暂无待办事项" : "暂无备忘录" }}
            </div>
            <v-btn
              color="primary"
              size="small"
              variant="outlined"
              @click="
                currentView === 'todos' ? openAddDialog() : openAddMemoDialog()
              "
            >
              添加第一个{{ currentView === "todos" ? "任务" : "备忘录" }}
            </v-btn>
          </div>

          <!-- 待办事项列表 -->
          <div v-else>
            <transition-group name="todo-list" tag="div" class="todo-container">
              <v-card
                v-for="todo in filteredTodos"
                :key="todo.id"
                class="mb-3 todo-card cursor-pointer"
                :class="{
                  'completed-todo': todo.status === 'done',
                  'archived-todo': todo.status === 'archived',
                  'processing-todo': todo.status === 'processing',
                  'suspended-todo': todo.status === 'suspended',
                  'memo-card': todo.is_memo,
                  'faded-todo':
                    hasProcessingTodo && todo.status !== 'processing',
                  [`priority-${todo.priority}`]: true,
                  [`status-${todo.status}`]: true,
                }"
                elevation="0"
                rounded="lg"
                @click="openEditDialog(todo)"
              >
                <v-card-text class="pa-3">
                  <div class="d-flex align-start">
                    <!-- Checkbox / Icon -->
                    <div class="mr-3 mt-1">
                      <template v-if="!todo.is_memo">
                        <v-checkbox
                          :model-value="todo.status === 'done'"
                          @change="toggleTodoStatus(todo)"
                          @click.stop
                          :disabled="
                            todo.status === 'archived' || todo.isUpdating
                          "
                          density="compact"
                          hide-details
                          :color="getPriorityColor(todo.priority)"
                          class="ma-0 pa-0"
                        ></v-checkbox>
                      </template>
                      <template v-else>
                        <v-icon
                          color="primary"
                          icon="mdi-note-text-outline"
                          size="24"
                        ></v-icon>
                      </template>
                    </div>

                    <!-- Content -->
                    <div class="flex-grow-1" style="min-width: 0">
                      <!-- Title Row -->
                      <div class="d-flex align-center flex-wrap mb-1">
                        <span
                          class="todo-title font-weight-medium mr-2"
                          :class="{
                            'text-decoration-line-through text-grey':
                              todo.status === 'done',
                            'text-grey': todo.status === 'archived',
                          }"
                        >
                          {{ todo.title }}
                        </span>

                        <!-- Chips -->
                        <div class="d-flex align-center gap-1">
                          <v-chip
                            v-if="todo.priority && todo.priority !== 'low'"
                            size="x-small"
                            :color="getPriorityColor(todo.priority)"
                            variant="tonal"
                            class="font-weight-bold"
                            @click.stop
                          >
                            {{ getPriorityLabel(todo.priority) }}
                          </v-chip>

                          <v-chip
                            v-if="todo.status === 'processing'"
                            size="x-small"
                            color="warning"
                            variant="tonal"
                            class="font-weight-bold"
                            @click.stop
                          >
                            处理中
                          </v-chip>

                          <v-chip
                            v-if="todo.status === 'suspended'"
                            size="x-small"
                            color="grey"
                            variant="tonal"
                            class="font-weight-bold"
                            @click.stop
                          >
                            已挂起
                          </v-chip>

                          <v-chip
                            v-if="todo.workload"
                            size="x-small"
                            color="blue-grey"
                            variant="tonal"
                            prepend-icon="mdi-clock-outline"
                            @click.stop
                          >
                            {{ todo.workload }}h
                          </v-chip>

                          <v-chip
                            v-if="todo.sub_todos && todo.sub_todos.length > 0"
                            size="x-small"
                            variant="tonal"
                            color="grey-darken-1"
                            @click.stop="toggleSubTodosVisibility(todo)"
                            class="cursor-pointer"
                          >
                            <v-icon start size="x-small">{{
                              todo.showSubTodos
                                ? "mdi-chevron-down"
                                : "mdi-chevron-right"
                            }}</v-icon>
                            {{
                              todo.sub_todos.filter((t) => t.status === "done")
                                .length
                            }}/{{ todo.sub_todos.length }}
                          </v-chip>
                        </div>
                      </div>

                      <!-- Description -->
                      <div
                        v-if="todo.description || todo.editingNote"
                        class="mb-2"
                      >
                        <div
                          v-if="!todo.editingNote"
                          class="todo-description"
                          @click.stop="openEditNote(todo)"
                          style="cursor: pointer"
                        >
                          {{ todo.description }}
                        </div>
                        <div v-else class="note-edit-area mt-2" @click.stop>
                          <v-textarea
                            v-model="todo.tempDescription"
                            variant="outlined"
                            density="compact"
                            hide-details
                            rows="2"
                            auto-grow
                            class="mb-2"
                            autofocus
                            placeholder="添加备注..."
                            @keydown.esc="cancelEditingNote(todo)"
                            @keydown.ctrl.enter="saveNote(todo)"
                          ></v-textarea>
                          <div class="d-flex justify-end gap-2">
                            <v-btn
                              size="small"
                              variant="text"
                              @click="cancelEditingNote(todo)"
                            >
                              取消
                            </v-btn>
                            <v-btn
                              size="small"
                              color="primary"
                              @click="saveNote(todo)"
                              :loading="savingNotes.get(todo.id) || false"
                              elevation="0"
                            >
                              保存
                            </v-btn>
                          </div>
                        </div>
                      </div>

                      <!-- Sub-todos -->
                      <v-expand-transition>
                        <div
                          v-if="
                            todo.showSubTodos &&
                            todo.sub_todos &&
                            todo.sub_todos.length > 0
                          "
                          class="mt-1"
                        >
                          <v-list
                            density="compact"
                            bg-color="transparent"
                            class="pa-0"
                          >
                            <v-list-item
                              v-for="subTodo in todo.sub_todos"
                              :key="subTodo.id"
                              class="px-0 mb-1 sub-todo-item"
                              min-height="32"
                              @click.stop="
                                openEditSubTodoDialog(todo.id, subTodo)
                              "
                            >
                              <template v-slot:prepend>
                                <div
                                  class="d-flex align-center"
                                  style="width: 24px; justify-content: center"
                                >
                                  <!-- Indentation guide or just space -->
                                </div>
                                <v-checkbox
                                  :model-value="subTodo.status === 'done'"
                                  @change="
                                    toggleSubTodoStatus(todo.id, subTodo)
                                  "
                                  @click.stop
                                  density="compact"
                                  hide-details
                                  :color="getPriorityColor(subTodo.priority)"
                                  class="mr-2"
                                ></v-checkbox>
                              </template>

                              <v-list-item-title
                                class="text-body-2"
                                :class="{
                                  'text-decoration-line-through text-grey':
                                    subTodo.status === 'done',
                                }"
                              >
                                {{ subTodo.title }}
                              </v-list-item-title>

                              <template v-slot:append>
                                <div class="d-flex opacity-0 hover-visible">
                                  <v-btn
                                    icon="mdi-pencil"
                                    variant="text"
                                    size="x-small"
                                    color="grey"
                                    @click.stop="
                                      openEditSubTodoDialog(todo.id, subTodo)
                                    "
                                  ></v-btn>
                                  <v-btn
                                    icon="mdi-delete"
                                    variant="text"
                                    size="x-small"
                                    color="grey"
                                    @click.stop="
                                      openDeleteSubTodoDialog(todo.id, subTodo)
                                    "
                                  ></v-btn>
                                </div>
                              </template>
                            </v-list-item>

                            <!-- Add Sub-todo Input -->
                            <v-list-item class="px-0 mt-1" @click.stop>
                              <div class="d-flex align-center w-100 pl-10">
                                <v-text-field
                                  v-model="todo.newSubTodoTitle"
                                  placeholder="添加新子任务..."
                                  variant="plain"
                                  density="compact"
                                  hide-details
                                  class="sub-todo-input"
                                  @keyup.enter="addSubTodo(todo)"
                                  :loading="todo.isAddingSubTodo"
                                >
                                  <template v-slot:prepend>
                                    <v-icon
                                      icon="mdi-plus"
                                      size="small"
                                      color="grey"
                                    ></v-icon>
                                  </template>
                                </v-text-field>
                              </div>
                            </v-list-item>
                          </v-list>
                        </div>
                      </v-expand-transition>

                      <!-- Date Info -->
                      <div
                        v-if="todo.due_date"
                        class="text-caption text-grey mt-1 d-flex align-center"
                      >
                        <v-icon
                          icon="mdi-clock-outline"
                          size="x-small"
                          class="mr-1"
                        ></v-icon>
                        <span
                          :class="{
                            'text-error font-weight-bold':
                              new Date(todo.due_date) < new Date() &&
                              todo.status === 'pending',
                            'text-warning font-weight-bold':
                              isApproachingDeadline(todo.due_date) &&
                              todo.status === 'pending',
                          }"
                        >
                          {{ formatDate(todo.due_date) }}
                        </span>
                      </div>
                    </div>

                    <!-- Actions (Right Side) -->
                    <div class="d-flex flex-column align-end ml-2">
                      <div class="d-flex align-center">
                        <!-- 快速添加子任务按钮 -->
                        <v-btn
                          v-if="!todo.is_memo && todo.status !== 'archived'"
                          icon="mdi-format-list-checks"
                          variant="text"
                          size="small"
                          color="grey-darken-1"
                          class="mr-1"
                          @click.stop="openAddSubTodoDialog(todo)"
                          title="添加子任务"
                        ></v-btn>

                        <v-menu location="bottom end">
                          <template v-slot:activator="{ props }">
                            <v-btn
                              icon="mdi-dots-horizontal"
                              variant="text"
                              size="small"
                              color="grey-darken-1"
                              v-bind="props"
                              @click.stop
                            ></v-btn>
                          </template>
                          <v-list
                            density="compact"
                            min-width="160"
                            class="rounded-lg elevation-2"
                          >
                            <v-list-item
                              @click="openEditDialog(todo)"
                              value="edit"
                            >
                              <template v-slot:prepend>
                                <v-icon
                                  icon="mdi-pencil"
                                  size="small"
                                  class="mr-2"
                                ></v-icon>
                              </template>
                              <v-list-item-title>编辑</v-list-item-title>
                            </v-list-item>

                            <v-list-item
                              @click="openEditNote(todo)"
                              value="note"
                            >
                              <template v-slot:prepend>
                                <v-icon
                                  icon="mdi-note-text"
                                  size="small"
                                  class="mr-2"
                                ></v-icon>
                              </template>
                              <v-list-item-title>{{
                                todo.description ? "编辑备注" : "添加备注"
                              }}</v-list-item-title>
                            </v-list-item>

                            <v-list-item
                              @click="openAddSubTodoDialog(todo)"
                              value="subtask"
                            >
                              <template v-slot:prepend>
                                <v-icon
                                  icon="mdi-format-list-checks"
                                  size="small"
                                  class="mr-2"
                                ></v-icon>
                              </template>
                              <v-list-item-title>添加子任务</v-list-item-title>
                            </v-list-item>

                            <v-divider class="my-1"></v-divider>

                            <!-- 转换功能 -->
                            <v-list-item
                              v-if="!todo.is_memo"
                              @click="convertToMemo(todo.id)"
                              value="convert-memo"
                            >
                              <template v-slot:prepend>
                                <v-icon
                                  icon="mdi-note-text"
                                  color="info"
                                  size="small"
                                  class="mr-2"
                                ></v-icon>
                              </template>
                              <v-list-item-title>转为备忘录</v-list-item-title>
                            </v-list-item>

                            <v-list-item
                              v-if="todo.is_memo"
                              @click="convertToTodo(todo.id)"
                              value="convert-todo"
                            >
                              <template v-slot:prepend>
                                <v-icon
                                  icon="mdi-checkbox-marked-circle"
                                  color="info"
                                  size="small"
                                  class="mr-2"
                                ></v-icon>
                              </template>
                              <v-list-item-title
                                >转为待办事项</v-list-item-title
                              >
                            </v-list-item>

                            <v-divider class="my-1"></v-divider>

                            <v-list-item
                              v-if="
                                todo.status !== 'suspended' &&
                                todo.status !== 'done' &&
                                todo.status !== 'archived'
                              "
                              @click="suspendTodo(todo)"
                              value="suspend"
                            >
                              <template v-slot:prepend>
                                <v-icon
                                  icon="mdi-pause"
                                  color="grey"
                                  size="small"
                                  class="mr-2"
                                ></v-icon>
                              </template>
                              <v-list-item-title>挂起任务</v-list-item-title>
                            </v-list-item>

                            <v-list-item
                              v-if="todo.status === 'suspended'"
                              @click="unsuspendTodo(todo)"
                              value="unsuspend"
                            >
                              <template v-slot:prepend>
                                <v-icon
                                  icon="mdi-play-circle-outline"
                                  color="success"
                                  size="small"
                                  class="mr-2"
                                ></v-icon>
                              </template>
                              <v-list-item-title>恢复任务</v-list-item-title>
                            </v-list-item>

                            <v-list-item
                              v-if="
                                todo.status !== 'processing' &&
                                todo.status !== 'archived' &&
                                todo.status !== 'suspended'
                              "
                              @click="setProcessingTodo(todo)"
                              value="process"
                            >
                              <template v-slot:prepend>
                                <v-icon
                                  icon="mdi-play"
                                  color="warning"
                                  size="small"
                                  class="mr-2"
                                ></v-icon>
                              </template>
                              <v-list-item-title>开始处理</v-list-item-title>
                            </v-list-item>

                            <v-list-item
                              v-if="todo.status === 'processing'"
                              @click="reopenTodo(todo)"
                              value="stop"
                            >
                              <template v-slot:prepend>
                                <v-icon
                                  icon="mdi-stop"
                                  color="grey"
                                  size="small"
                                  class="mr-2"
                                ></v-icon>
                              </template>
                              <v-list-item-title>停止处理</v-list-item-title>
                            </v-list-item>

                            <v-list-item
                              @click="openDeleteDialog(todo)"
                              value="delete"
                              color="error"
                            >
                              <template v-slot:prepend>
                                <v-icon
                                  icon="mdi-delete"
                                  color="error"
                                  size="small"
                                  class="mr-2"
                                ></v-icon>
                              </template>
                              <v-list-item-title class="text-error"
                                >删除</v-list-item-title
                              >
                            </v-list-item>
                          </v-list>
                        </v-menu>
                      </div>

                      <div
                        class="text-caption text-grey-lighten-1 mt-1"
                        style="font-size: 0.7rem !important"
                      >
                        {{ formatDate(todo.created_at) }}
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </transition-group>

            <!-- 无数据提示 -->
            <div
              v-if="!todoStore.isLoading && todoStore.getAllTodos.length === 0"
              class="d-flex flex-column align-center my-10"
            >
              <v-icon
                icon="mdi-clipboard-text-outline"
                size="70"
                color="grey-lighten-2"
                class="mb-4"
              ></v-icon>
              <p class="text-h6 text-grey-darken-1">暂无待办事项</p>
              <p class="text-body-2 text-grey">
                点击"添加新任务"按钮创建您的第一个待办事项
              </p>
              <v-btn
                color="primary"
                @click="openAddDialog"
                prepend-icon="mdi-plus"
                class="mt-4"
                variant="outlined"
                rounded
              >
                添加新任务
              </v-btn>
            </div>

            <!-- 加载更多提示 -->
            <div
              v-if="hasMore && (!todoStore.isLoading || loadingMore)"
              class="d-flex justify-center mt-6"
            >
              <v-btn
                @click="loadMore"
                color="primary"
                variant="outlined"
                :loading="loadingMore"
              >
                加载更多
              </v-btn>
            </div>

            <!-- 已加载全部提示 -->
            <div
              v-if="!hasMore && todoStore.getAllTodos.length > 0"
              class="text-center text-grey mt-6"
            >
              已加载全部内容
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- 添加/编辑对话框 -->
      <TodoDialog
        v-model="dialog"
        :todo="currentTodo"
        :is-editing="isEditing"
        :is-adding-memo="isAddingMemo"
        :loading="todoStore.isLoading"
        @submit="handleDialogSubmit"
      />

      <!-- 删除确认对话框 -->
      <v-dialog v-model="deleteDialog" max-width="400">
        <v-card>
          <v-card-title class="text-h6 py-3"> 确认删除 </v-card-title>

          <v-card-text class="pt-4 pb-4">
            <p class="text-body-2 mb-2">确定要删除这个任务吗？</p>
            <div class="pa-2 rounded bg-grey-lighten-4">
              <p class="text-subtitle-2 mb-0">{{ currentTodo.title }}</p>
            </div>
            <p class="text-caption text-error mt-2 mb-0">此操作不可撤销</p>
          </v-card-text>

          <v-card-actions class="pa-3">
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="deleteDialog = false" size="small">
              取消
            </v-btn>
            <v-btn
              color="error"
              variant="flat"
              @click="deleteTodo()"
              :loading="todoStore.isLoading"
              size="small"
            >
              删除
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- 添加/编辑子任务对话框 -->
      <v-dialog v-model="subTodoDialog" max-width="480">
        <v-card>
          <v-card-title class="text-h6 py-3">
            {{ isEditingSubTodo ? "编辑子任务" : "添加子任务" }}
            <div
              v-if="currentParentTodo"
              class="text-caption mt-1 text-medium-emphasis"
            >
              父任务: {{ currentParentTodo.title }}
            </div>
          </v-card-title>

          <v-card-text class="pt-4 px-4">
            <v-form
              ref="subTodoForm"
              @submit.prevent="
                isEditingSubTodo ? updateSubTodo() : addSubTodoFromDialog()
              "
            >
              <!-- 子任务标题 -->
              <div class="mb-3">
                <v-text-field
                  v-model="currentSubTodo.title"
                  :rules="[(v) => (!!v && v.trim() !== '') || '标题不能为空']"
                  required
                  label="子任务标题"
                  variant="outlined"
                  density="compact"
                  @input="
                    () => {
                      if (subTodoForm.value)
                        subTodoForm.value.resetValidation();
                    }
                  "
                  hide-details="auto"
                ></v-text-field>
              </div>

              <!-- 子任务描述 -->
              <div class="mb-3">
                <v-textarea
                  v-model="currentSubTodo.description"
                  label="子任务描述"
                  rows="2"
                  variant="outlined"
                  density="compact"
                  hide-details
                ></v-textarea>
              </div>

              <!-- 优先级 -->
              <div class="mb-3">
                <v-select
                  v-model="currentSubTodo.priority"
                  :items="priorityOptions"
                  item-title="text"
                  item-value="value"
                  label="优先级"
                  variant="outlined"
                  density="compact"
                  hide-details
                ></v-select>
              </div>

              <!-- 状态（仅编辑时） -->
              <div v-if="isEditingSubTodo">
                <v-select
                  v-model="currentSubTodo.status"
                  :items="statusOptions"
                  item-title="text"
                  item-value="value"
                  label="状态"
                  variant="outlined"
                  density="compact"
                  hide-details
                >
                  <template v-slot:selection="{ item }">
                    <v-chip
                      size="x-small"
                      :color="getStatusColor(item.value)"
                      label
                      class="mr-2"
                      variant="tonal"
                    >
                      <v-icon
                        start
                        size="x-small"
                        :icon="getStatusIcon(item.value)"
                      ></v-icon>
                      {{ item.title }}
                    </v-chip>
                  </template>
                  <template v-slot:item="{ item, props }">
                    <v-list-item v-bind="props" density="compact">
                      <template v-slot:prepend>
                        <v-icon
                          :color="getStatusColor(item.value)"
                          :icon="getStatusIcon(item.value)"
                          size="small"
                          class="mr-2"
                        ></v-icon>
                      </template>
                    </v-list-item>
                  </template>
                </v-select>
              </div>
            </v-form>
          </v-card-text>

          <v-card-actions class="pa-3">
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="subTodoDialog = false" size="small">
              取消
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              @click="handleSubTodoFormSubmit"
              :loading="todoStore.isLoading"
              size="small"
            >
              {{ isEditingSubTodo ? "更新" : "添加" }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- 删除子任务确认对话框 -->
      <v-dialog v-model="deleteSubTodoDialog" max-width="380">
        <v-card>
          <v-card-title class="text-h6 py-3"> 确认删除子任务 </v-card-title>

          <v-card-text class="pt-4 pb-4">
            <p class="text-body-2 mb-2">确定要删除这个子任务吗？</p>
            <div class="pa-2 rounded bg-grey-lighten-4">
              <p class="text-subtitle-2 mb-0">{{ currentSubTodo.title }}</p>
            </div>
            <p class="text-caption text-error mt-2 mb-0">此操作不可撤销</p>
          </v-card-text>

          <v-card-actions class="pa-3">
            <v-spacer></v-spacer>
            <v-btn
              variant="text"
              @click="deleteSubTodoDialog = false"
              size="small"
            >
              取消
            </v-btn>
            <v-btn
              color="error"
              variant="flat"
              @click="deleteSubTodo()"
              :loading="todoStore.isLoading"
              size="small"
            >
              删除
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useTodoStore } from "@/stores/todo";
import { useSettingsStore } from "@/stores/settings";
import { useRouter } from "vue-router";
import DailyTaskList from "@/components/DailyTaskList.vue";
import TodoStatistics from "@/components/todos/TodoStatistics.vue";
import TodoDialog from "@/components/todos/TodoDialog.vue";
import {
  priorityOptions,
  statusOptions,
  getPriorityColor,
  getPriorityLabel,
  getStatusColor,
  getStatusIcon,
} from "@/utils/todoUtils";

// 初始化store
const todoStore = useTodoStore();
const settingsStore = useSettingsStore();
const router = useRouter();

// 组件状态
const dialog = ref(false);
const deleteDialog = ref(false);
const isEditing = ref(false);
const isAddingMemo = ref(false);
const currentView = ref("todos"); // 'todos' 或 'memos'
const currentTodo = ref({
  title: "",
  description: "",
  is_memo: false,
  status: "pending",
  priority: 3, // 中等优先级，使用数字
  due_date: null,
  due_time: "23:59", // 默认为当天结束时间
  workload: null, // 预计工作量（小时）
});

// 快速添加状态
const quickAddTitle = ref("");
const isQuickAdding = ref(false);

// 子待办状态
const subTodoDialog = ref(false);
const deleteSubTodoDialog = ref(false);
const isEditingSubTodo = ref(false);
const currentParentTodo = ref(null);
const currentSubTodo = ref({
  title: "",
  description: "",
  status: "pending",
  priority: 3,
  parent_id: null,
});
const subTodoForm = ref(null);

const filter = ref("all");
const search = ref("");

// 滚动加载相关
const loadingMore = ref(false);
const hasMore = ref(true);
const currentPage = ref(1);
const pageSize = 20; // 固定每次加载20条

// 笔记保存状态管理 (使用 Map 来跟踪每个 todo 的保存状态)
const savingNotes = ref(new Map());

// 提示框状态
const snackbar = ref({
  show: false,
  text: "",
  color: "info",
  timeout: 3000,
});

// 显示提示信息
function showNotification(text, color = "info", timeout = 3000) {
  snackbar.value = {
    show: true,
    text,
    color,
    timeout,
  };
}

// 获取吉祥物消息
function getMascotMessage() {
  const hour = new Date().getHours();
  const incompleteTodos = filteredTodos.value.filter(
    (t) => t.status !== "done"
  ).length;

  if (currentView.value === "memos") {
    return "记录你的想法吧！";
  }

  if (incompleteTodos === 0) {
    return "太棒了！所有任务都完成了！🎉";
  }

  if (hour < 12) {
    return "早安！新的一天，加油！";
  } else if (hour < 18) {
    return `还有 ${incompleteTodos} 个任务，继续加油！`;
  } else {
    return "晚上好！今天辛苦了！";
  }
}

// 默认筛选状态
const filterOptions = [
  { text: "全部", value: "all" },
  { text: "待办", value: "pending" },
  { text: "正在处理", value: "processing" },
  { text: "已挂起", value: "suspended" },
  { text: "已完成", value: "done" },
  { text: "已归档", value: "archived" },
];

// 计算属性：是否有正在处理的待办
const hasProcessingTodo = computed(() => {
  return todoStore.getAllTodos.some((todo) => todo.status === "processing");
});

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return "未设置";

  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateOnly = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  // 如果是今天，只显示时间
  if (dateOnly.getTime() === today.getTime()) {
    return `今天 ${hours}:${minutes}`;
  }

  // 如果是明天
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dateOnly.getTime() === tomorrow.getTime()) {
    return `明天 ${hours}:${minutes}`;
  }

  // 如果是昨天
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateOnly.getTime() === yesterday.getTime()) {
    return `昨天 ${hours}:${minutes}`;
  }

  // 其他日期显示 MM-DD HH:mm
  return `${month}-${day} ${hours}:${minutes}`;
}

// 判断是否接近截止日期（24小时内）
function isApproachingDeadline(dateString) {
  if (!dateString) return false;

  const dueDate = new Date(dateString);
  const now = new Date();
  const diffMs = dueDate - now;
  const diffHours = diffMs / (1000 * 60 * 60);

  // 如果截止时间在24小时内但还未过期
  return diffHours > 0 && diffHours <= 24;
}

// 获取距离截止日期的剩余时间描述
function getTimeRemaining(dateString) {
  if (!dateString) return "无截止日期";

  const dueDate = new Date(dateString);
  const now = new Date();
  const diffMs = dueDate - now;

  // 已经过期
  if (diffMs < 0) {
    const overdueDays = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
    const overdueHours = Math.floor(
      (Math.abs(diffMs) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );

    if (overdueDays > 0) {
      return `已逾期 ${overdueDays} 天 ${overdueHours} 小时`;
    } else {
      const overdueMinutes = Math.floor(
        (Math.abs(diffMs) % (1000 * 60 * 60)) / (1000 * 60)
      );
      return `已逾期 ${overdueHours} 小时 ${overdueMinutes} 分钟`;
    }
  }

  // 还未过期
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `剩余 ${days} 天 ${hours} 小时`;
  } else if (hours > 0) {
    return `剩余 ${hours} 小时 ${minutes} 分钟`;
  } else {
    return `剩余 ${minutes} 分钟`;
  }
}

// 处理表单提交
async function handleFormSubmit() {
  // 如果表单引用不存在
  if (!form.value) {
    return;
  }

  try {
    // 手动触发表单验证
    const { valid } = await form.value.validate();

    if (!valid) {
      return;
    }

    // 检查标题是否为空
    if (!currentTodo.value.title || currentTodo.value.title.trim() === "") {
      return;
    }

    // 根据编辑状态调用相应函数
    if (isEditing.value) {
      await updateTodo();
    } else {
      await addTodo();
    }
  } catch (error) {
    console.error("表单提交失败:", error.message);
  }
}

// 计算属性：筛选和搜索后的待办事项
const filteredTodos = computed(() => {
  // 根据当前视图决定显示待办事项还是备忘录
  if (currentView.value === "memos") {
    // 显示备忘录
    return todoStore.getAllTodos.filter((todo) => todo.is_memo === true);
  } else {
    // 显示普通待办事项
    return todoStore.getAllTodos.filter((todo) => !todo.is_memo);
  }
});

// 统计数据
const statistics = computed(() => todoStore.getStatistics);

// 应用过滤器
function applyFilters() {
  // 转换filter.value为API需要的status参数
  let status = "";
  if (
    filter.value === "pending" ||
    filter.value === "processing" ||
    filter.value === "done" ||
    filter.value === "archived" ||
    filter.value === "suspended"
  ) {
    status = filter.value;
  }

  currentPage.value = 1;
  hasMore.value = true;
  fetchTodos({
    status,
    search: search.value,
    page: 1,
    reset: true, // 标记为重置加载
  });
}

function setFilter(value) {
  filter.value = value;
  applyFilters();
}

function getFilterLabel(value) {
  const option = filterOptions.find((opt) => opt.value === value);
  return option ? option.text : "筛选";
}

function getFilterIcon(value) {
  switch (value) {
    case "all":
      return "mdi-view-list";
    case "pending":
      return "mdi-checkbox-blank-circle-outline";
    case "processing":
      return "mdi-progress-clock";
    case "suspended":
      return "mdi-pause-circle-outline";
    case "done":
      return "mdi-check-circle-outline";
    case "archived":
      return "mdi-archive-outline";
    default:
      return "mdi-filter";
  }
}

// 加载更多
async function loadMore() {
  if (loadingMore.value || !hasMore.value) return;

  loadingMore.value = true;
  currentPage.value++;

  try {
    await fetchTodos({
      page: currentPage.value,
      append: true, // 标记为追加模式
    });
  } finally {
    loadingMore.value = false;
  }
}

// 封装获取待办事项的函数
async function fetchTodos(options = {}) {
  try {
    const fetchOptions = {
      ...options,
      pageSize: pageSize,
    };

    // 添加type参数，根据当前视图过滤
    if (currentView.value === "memos") {
      fetchOptions.type = "memo";
    } else if (currentView.value === "todos") {
      fetchOptions.type = "todo";
    }

    const result = await todoStore.fetchTodos(fetchOptions);

    // 更新hasMore状态
    const loadedCount = options.append
      ? todoStore.getAllTodos.length
      : result.length;
    hasMore.value = todoStore.getPagination.next !== null;

    return result;
  } catch (error) {
    console.error("加载待办事项失败:", error);
  }
}

// 不再需要监听设置变化

// 生命周期钩子
onMounted(async () => {
  try {
    // 设置加载中状态
    todoStore.loading = true;

    console.log("初始化加载待办事项");
    // 并行加载待办事项和统计数据
    await Promise.all([
      fetchTodos({
        page: 1,
        reset: true,
      }),
      todoStore.fetchStatistics(),
    ]);

    // 为所有任务初始化子待办相关的属性
    todoStore.getAllTodos.forEach((todo) => {
      // 如果todo.sub_todos不存在，初始化为空数组
      if (!todo.sub_todos) {
        todo.sub_todos = [];
      }

      // 为每个待办添加一个控制子待办显示/隐藏的属性
      todo.showSubTodos = false;

      // 为每个待办添加一个新子待办的标题输入字段
      todo.newSubTodoTitle = "";

      // 添加子待办加载状态
      todo.isAddingSubTodo = false;
    });

    console.log("待办事项加载完成:", todoStore.getAllTodos.length, "个项目");
  } catch (error) {
    console.error("加载待办事项失败:", error);
    showNotification("加载待办事项失败，请重试", "error");
  }
});

// 处理视图切换
function handleViewChange() {
  console.log("切换视图到:", currentView.value);
  fetchTodos({ page: 1 }); // 切换视图时重新获取第一页数据
}

// 方法
function openAddDialog() {
  isEditing.value = false;
  isAddingMemo.value = false;

  // 获取当前日期并格式化为YYYY-MM-DD
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const todayStr = `${year}-${month}-${day}`;

  currentTodo.value = {
    title: "",
    description: "",
    status: "pending",
    priority: 2, // 中等优先级，使用数字
    due_date: todayStr, // 默认设置为今天
    due_time: "23:30", // 默认设置为23:30
    is_memo: false,
  };
  dialog.value = true;
}

// 打开添加备忘录对话框
function openAddMemoDialog() {
  isEditing.value = false;
  isAddingMemo.value = true;
  currentTodo.value = {
    title: "",
    description: "",
    status: "memo",
    priority: 2, // 中等优先级，使用数字
    due_date: null,
    due_time: null,
    is_memo: true,
  };
  dialog.value = true;
}

// 快速添加任务
async function handleQuickAdd() {
  if (!quickAddTitle.value || quickAddTitle.value.trim() === "") return;

  isQuickAdding.value = true;
  try {
    // 默认设置：今天 23:30，中等优先级
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const todayStr = `${year}-${month}-${day}`;
    const dueTimeStr = "23:30";
    const dueDateTime = new Date(`${todayStr}T${dueTimeStr}`);
    const dueDateTimeISO = dueDateTime.toISOString();

    const isMemo = currentView.value === "memos";

    await todoStore.addTodo(
      quickAddTitle.value,
      "", // 无描述
      {
        priority: 2,
        due_date: isMemo ? null : dueDateTimeISO,
        is_memo: isMemo,
      }
    );

    quickAddTitle.value = "";
    showNotification(isMemo ? "备忘录添加成功" : "任务添加成功", "success");

    // 刷新列表
    applyFilters();
  } catch (error) {
    console.error("快速添加失败:", error);
    showNotification("添加失败: " + error.message, "error");
  } finally {
    isQuickAdding.value = false;
  }
}

function openEditDialog(todo) {
  isEditing.value = true;
  // 深拷贝待办事项
  currentTodo.value = { ...todo };

  // 如果有截止日期，拆分为日期和时间
  if (todo.due_date) {
    const dueDateTime = new Date(todo.due_date);
    // 格式化日期部分为YYYY-MM-DD格式（HTML日期输入所需）
    currentTodo.value.due_date = dueDateTime.toISOString().split("T")[0];

    // 格式化时间部分为HH:MM格式（HTML时间输入所需）
    const hours = dueDateTime.getHours().toString().padStart(2, "0");
    const minutes = dueDateTime.getMinutes().toString().padStart(2, "0");
    currentTodo.value.due_time = `${hours}:${minutes}`;
  } else {
    // 获取当前日期并格式化为YYYY-MM-DD
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const todayStr = `${year}-${month}-${day}`;

    currentTodo.value.due_date = todayStr;
    currentTodo.value.due_time = "23:30"; // 默认时间
  }

  dialog.value = true;
}

function openDeleteDialog(todo) {
  currentTodo.value = { ...todo };
  deleteDialog.value = true;
}

async function handleDialogSubmit(todoData) {
  try {
    // 处理截止日期和时间
    let dueDateTimeISO = null;
    if (todoData.due_date) {
      // 拼接日期和时间
      const dueDateStr = todoData.due_date;
      const dueTimeStr = todoData.due_time || "23:59";

      // 创建日期对象并转为ISO格式
      const dueDateTime = new Date(`${dueDateStr}T${dueTimeStr}`);
      dueDateTimeISO = dueDateTime.toISOString();
    }

    if (isEditing.value) {
      // 检查ID是否存在
      if (!todoData.id) {
        return;
      }

      const updates = {
        title: todoData.title,
        description: todoData.description,
        status: todoData.status,
        priority: todoData.priority,
        due_date: dueDateTimeISO,
        workload: todoData.workload || null,
      };

      await todoStore.updateTodo(todoData.id, updates);
      showNotification("任务更新成功", "success");
    } else {
      await todoStore.addTodo(todoData.title, todoData.description, {
        priority: todoData.priority,
        due_date: dueDateTimeISO,
        is_memo: todoData.is_memo,
        workload: todoData.workload || null,
      });
      showNotification("新任务添加成功", "success");
    }

    dialog.value = false;

    // 刷新列表
    if (!isEditing.value && todoStore.getAllTodos.length <= 1) {
      console.log("第一个待办事项已添加，无需刷新列表");
    } else {
      applyFilters();
    }
  } catch (error) {
    console.error("操作失败:", error.message);
    showNotification("操作失败: " + error.message, "error");
  }
}

async function deleteTodo() {
  try {
    await todoStore.deleteTodo(currentTodo.value.id);
    deleteDialog.value = false;
    showNotification("待办事项已删除", "success");
  } catch (error) {
    console.error("删除待办事项失败:", error);
    showNotification("删除失败: " + error.message, "error");
  }
}

// 将待办事项转换为备忘录
async function convertToMemo(todoId) {
  try {
    await todoStore.convertToMemo(todoId);
    showNotification("已成功转换为备忘录", "success");
    // 刷新列表以获取最新数据
    applyFilters();
  } catch (error) {
    console.error("转换为备忘录失败:", error);
    showNotification("转换失败: " + error.message, "error");
  }
}

// 将备忘录转换为待办事项
async function convertToTodo(memoId) {
  try {
    await todoStore.convertToTodo(memoId);
    showNotification("已成功转换为待办事项", "success");
    // 刷新列表以获取最新数据
    applyFilters();
  } catch (error) {
    console.error("转换为待办事项失败:", error);
    showNotification("转换失败: " + error.message, "error");
  }
}

// ============ 笔记编辑相关方法 ============

// 开始编辑笔记
function startEditingNote(todo) {
  // 初始化临时描述字段
  todo.editingNote = true;
  todo.tempDescription = todo.description || "";
}

// 取消编辑笔记
function cancelEditingNote(todo) {
  todo.editingNote = false;
  todo.tempDescription = "";
  // 取消时也清除保存状态
  savingNotes.value.set(todo.id, false);
}

// 保存笔记
async function saveNote(todo) {
  // 防止重复点击
  if (savingNotes.value.get(todo.id)) {
    console.log("正在保存中，忽略重复点击");
    return;
  }

  console.log("开始保存笔记，todo.id:", todo.id);

  // 设置保存状态
  savingNotes.value.set(todo.id, true);

  try {
    // 准备更新数据
    const updates = {
      description: todo.tempDescription || "",
    };

    console.log("调用 API 更新描述:", updates);

    // 调用 API 更新
    const updatedTodo = await todoStore.updateTodo(todo.id, updates);

    console.log("API 更新成功，返回数据:", updatedTodo);

    // 更新成功后，更新本地数据
    todo.description = todo.tempDescription;
    todo.editingNote = false;

    // 显示成功提示
    showNotification("笔记已保存", "success");

    console.log("笔记保存完成");
  } catch (error) {
    console.error("保存笔记失败:", error);
    showNotification("保存失败: " + (error.message || "未知错误"), "error");
  } finally {
    // 重置保存状态
    savingNotes.value.set(todo.id, false);
    console.log(
      "isSavingNote 已重置为 false，当前 savingNotes:",
      savingNotes.value.get(todo.id)
    );
  }
}

async function toggleTodoStatus(todo) {
  try {
    // 如果正在更新，不允许再次点击
    if (todo.isUpdating) return;

    // 存储原始状态，用于在失败时恢复
    const originalStatus = todo.status;

    // 计算目标状态
    const targetStatus = originalStatus === "done" ? "pending" : "done";

    // 设置加载状态
    todo.isUpdating = true;

    try {
      // 先调用API
      await todoStore.toggleTodoStatus(todo.id);

      // API调用成功后，更新本地状态
      todo.status = targetStatus;

      // 稍微延迟刷新列表，让动画效果完成
      setTimeout(() => {
        applyFilters();
      }, 300);
    } catch (error) {
      console.error("更新待办事项状态失败:", error);
      // 显示错误信息给用户，使用snackbar通知
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        showNotification(error.response.data.message, "warning");
      } else {
        showNotification("更新状态失败，请稍后重试", "error");
      }
    } finally {
      // 无论成功还是失败，都清除加载状态
      todo.isUpdating = false;
    }
  } catch (error) {
    console.error("状态切换过程发生错误:", error);
    // 确保清除加载状态
    if (todo) todo.isUpdating = false;
  }
}

// 将待办事项标记为已完成
async function completeTodo(todo) {
  try {
    // 如果正在更新，不允许再次点击
    if (todo.isUpdating) return;

    // 设置加载状态
    todo.isUpdating = true;

    try {
      // 先调用API
      await todoStore.completeTodo(todo.id);

      // API调用成功后，更新本地状态
      todo.status = "done";

      // 稍微延迟刷新列表，让动画效果完成
      setTimeout(() => {
        applyFilters();
      }, 300);
    } catch (error) {
      console.error("标记待办事项为已完成失败:", error);
      // 显示错误信息给用户，使用snackbar通知
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        showNotification(error.response.data.message, "warning");
      } else {
        showNotification("标记为已完成失败，请稍后重试", "error");
      }
    } finally {
      // 无论成功还是失败，都清除加载状态
      todo.isUpdating = false;
    }
  } catch (error) {
    console.error("标记待办事项为已完成失败:", error);
    // 确保清除加载状态
    if (todo) todo.isUpdating = false;
  }
}

// 将待办事项标记为正在处理
async function setProcessingTodo(todo) {
  try {
    // 如果正在更新，不允许再次点击
    if (todo.isUpdating) return;

    // 设置加载状态
    todo.isUpdating = true;

    try {
      // 检查是否已有正在处理的待办
      const existingProcessingTodo = todoStore.getAllTodos.find(
        (t) => t.status === "processing" && t.id !== todo.id
      );

      if (existingProcessingTodo) {
        // 先将已有的正在处理待办重置为pending状态
        existingProcessingTodo.isUpdating = true;
        await todoStore.updateTodo(existingProcessingTodo.id, {
          status: "pending",
        });
        existingProcessingTodo.status = "pending";
        existingProcessingTodo.isUpdating = false;
      }

      // 再将当前待办设置为processing状态
      await todoStore.updateTodo(todo.id, { status: "processing" });

      // API调用成功后，更新本地状态
      todo.status = "processing";

      // 显示通知
      showNotification("已将任务标记为正在处理", "warning");

      // 稍微延迟刷新列表，让动画效果完成
      setTimeout(() => {
        applyFilters();
      }, 300);
    } catch (error) {
      console.error("标记待办事项为正在处理失败:", error);
      showNotification("标记为正在处理失败，请稍后重试", "error");
    } finally {
      // 无论成功还是失败，都清除加载状态
      todo.isUpdating = false;
    }
  } catch (error) {
    console.error("标记待办事项为正在处理失败:", error);
    // 确保清除加载状态
    if (todo) todo.isUpdating = false;
  }
}

// 重新打开已完成的待办事项
async function reopenTodo(todo) {
  try {
    // 如果正在更新，不允许再次点击
    if (todo.isUpdating) return;

    // 设置加载状态
    todo.isUpdating = true;

    try {
      if (todo.status === "processing") {
        // 处理"正在处理"到"待办"的转换
        await todoStore.updateTodo(todo.id, { status: "pending" });
        showNotification("已取消正在处理状态", "info");
      } else {
        // 处理"已完成"到"待办"的转换
        await todoStore.reopenTodo(todo.id);
      }

      // API调用成功后，更新本地状态
      todo.status = "pending";

      // 稍微延迟刷新列表，让动画效果完成
      setTimeout(() => {
        applyFilters();
      }, 300);
    } catch (error) {
      console.error("重新打开待办事项失败:", error);
      // 显示错误信息给用户，使用snackbar通知
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        showNotification(error.response.data.message, "warning");
      } else {
        showNotification("重新打开任务失败，请稍后重试", "error");
      }
    } finally {
      // 无论成功还是失败，都清除加载状态
      todo.isUpdating = false;
    }
  } catch (error) {
    console.error("重新打开待办事项失败:", error);
    // 确保清除加载状态
    if (todo) todo.isUpdating = false;
  }
}

// 挂起待办事项
async function suspendTodo(todo) {
  try {
    if (todo.isUpdating) return;
    todo.isUpdating = true;

    try {
      await todoStore.updateTodo(todo.id, { status: "suspended" });
      todo.status = "suspended";
      showNotification("任务已挂起", "info");
      setTimeout(() => {
        applyFilters();
      }, 300);
    } catch (error) {
      console.error("挂起待办事项失败:", error);
      showNotification("挂起任务失败，请稍后重试", "error");
    } finally {
      todo.isUpdating = false;
    }
  } catch (error) {
    console.error("挂起待办事项失败:", error);
    if (todo) todo.isUpdating = false;
  }
}

// 恢复挂起的待办事项
async function unsuspendTodo(todo) {
  try {
    if (todo.isUpdating) return;
    todo.isUpdating = true;

    try {
      await todoStore.updateTodo(todo.id, { status: "pending" });
      todo.status = "pending";
      showNotification("任务已恢复", "success");
      setTimeout(() => {
        applyFilters();
      }, 300);
    } catch (error) {
      console.error("恢复待办事项失败:", error);
      showNotification("恢复任务失败，请稍后重试", "error");
    } finally {
      todo.isUpdating = false;
    }
  } catch (error) {
    console.error("恢复待办事项失败:", error);
    if (todo) todo.isUpdating = false;
  }
}

// 归档待办事项
async function archiveTodo(todo) {
  try {
    // 如果正在更新，不允许再次点击
    if (todo.isUpdating) return;

    // 设置加载状态
    todo.isUpdating = true;

    try {
      // 先调用API
      await todoStore.archiveTodo(todo.id);

      // API调用成功后，更新本地状态
      todo.status = "archived";

      // 稍微延迟刷新列表，让动画效果完成
      setTimeout(() => {
        applyFilters();
      }, 300);
    } catch (error) {
      console.error("归档待办事项失败:", error);
      // 显示错误信息给用户，使用snackbar通知
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        showNotification(error.response.data.message, "warning");
      } else {
        showNotification("归档任务失败，请稍后重试", "error");
      }
    } finally {
      // 无论成功还是失败，都清除加载状态
      todo.isUpdating = false;
    }
  } catch (error) {
    console.error("归档待办事项失败:", error);
    // 确保清除加载状态
    if (todo) todo.isUpdating = false;
  }
}

// 子待办相关方法

// 切换子待办的显示/隐藏状态
function toggleSubTodosVisibility(todo) {
  // 切换显示状态
  todo.showSubTodos = !todo.showSubTodos;

  // 如果是首次显示且没有子待办数据，尝试从服务器获取
  if (todo.showSubTodos && (!todo.sub_todos || todo.sub_todos.length === 0)) {
    fetchSubTodos(todo.id);
  }
}

// 获取指定待办的子待办列表
async function fetchSubTodos(parentId) {
  try {
    // 找到父待办
    const parentTodo = todoStore.getAllTodos.find(
      (todo) => todo.id === parentId
    );
    if (!parentTodo) return;

    // 设置加载状态
    parentTodo.isLoadingSubTodos = true;

    // 调用API获取子待办
    const subTodos = await todoStore.fetchSubTodos(parentId);

    // 更新父待办的子待办列表
    parentTodo.sub_todos = subTodos || [];

    // 清除加载状态
    parentTodo.isLoadingSubTodos = false;
  } catch (error) {
    console.error("获取子待办失败:", error);
    showNotification("获取子任务失败，请重试", "error");
  }
}

// 打开添加子待办对话框
function openAddSubTodoDialog(todo) {
  currentParentTodo.value = todo;
  isEditingSubTodo.value = false;
  currentSubTodo.value = {
    title: "",
    description: "",
    status: "pending",
    priority: 2,
    parent_id: todo.id,
  };
  subTodoDialog.value = true;
}

// 打开编辑子待办对话框
function openEditSubTodoDialog(parentId, subTodo) {
  const parentTodo = todoStore.getAllTodos.find((todo) => todo.id === parentId);
  if (!parentTodo) return;

  currentParentTodo.value = parentTodo;
  isEditingSubTodo.value = true;
  currentSubTodo.value = { ...subTodo, parent_id: parentId };
  subTodoDialog.value = true;
}

// 打开删除子待办确认对话框
function openDeleteSubTodoDialog(parentId, subTodo) {
  const parentTodo = todoStore.getAllTodos.find((todo) => todo.id === parentId);
  if (!parentTodo) return;

  currentParentTodo.value = parentTodo;
  currentSubTodo.value = { ...subTodo, parent_id: parentId };
  deleteSubTodoDialog.value = true;
}

// 添加子待办（从对话框）
async function addSubTodoFromDialog() {
  if (!currentParentTodo.value || !currentSubTodo.value.title) return;

  try {
    // 设置父待办的子待办加载状态
    currentParentTodo.value.isAddingSubTodo = true;

    // 调用API添加子待办
    const newSubTodo = await todoStore.addSubTodo(
      currentParentTodo.value.id,
      currentSubTodo.value.title,
      currentSubTodo.value.description,
      {
        priority: currentSubTodo.value.priority,
      }
    );

    // 更新父待办的子待办列表
    if (newSubTodo) {
      if (!currentParentTodo.value.sub_todos) {
        currentParentTodo.value.sub_todos = [];
      }
      currentParentTodo.value.sub_todos.push(newSubTodo);

      // 确保子待办列表是可见的
      currentParentTodo.value.showSubTodos = true;
    }

    // 关闭对话框
    subTodoDialog.value = false;

    // 显示成功提示
    showNotification("子任务添加成功", "success");
  } catch (error) {
    console.error("添加子待办失败:", error);
    showNotification("添加子任务失败，请重试", "error");
  } finally {
    // 清除加载状态
    if (currentParentTodo.value) {
      currentParentTodo.value.isAddingSubTodo = false;
    }
  }
}

// 从输入框快速添加子待办
async function addSubTodo(parentTodo) {
  if (
    !parentTodo ||
    !parentTodo.newSubTodoTitle ||
    parentTodo.newSubTodoTitle.trim() === ""
  )
    return;

  try {
    // 设置加载状态
    parentTodo.isAddingSubTodo = true;

    // 调用API添加子待办
    const newSubTodo = await todoStore.addSubTodo(
      parentTodo.id,
      parentTodo.newSubTodoTitle,
      "", // 无描述
      {
        priority: 2, // 默认中等优先级
      }
    );

    // 更新父待办的子待办列表
    if (newSubTodo) {
      if (!parentTodo.sub_todos) {
        parentTodo.sub_todos = [];
      }
      parentTodo.sub_todos.push(newSubTodo);
    }

    // 清空输入框
    parentTodo.newSubTodoTitle = "";

    // 显示成功提示
    showNotification("子任务添加成功", "success");
  } catch (error) {
    console.error("添加子待办失败:", error);
    showNotification("添加子任务失败，请重试", "error");
  } finally {
    // 清除加载状态
    parentTodo.isAddingSubTodo = false;
  }
}

// 处理子待办表单提交
async function handleSubTodoFormSubmit() {
  if (!subTodoForm.value) return;

  try {
    // 手动触发表单验证
    const { valid } = await subTodoForm.value.validate();

    if (!valid) return;

    // 根据编辑状态调用相应函数
    if (isEditingSubTodo.value) {
      await updateSubTodo();
    } else {
      await addSubTodoFromDialog();
    }
  } catch (error) {
    console.error("子待办表单提交失败:", error);
  }
}

// 更新子待办
async function updateSubTodo() {
  if (!currentParentTodo.value || !currentSubTodo.value.id) return;

  try {
    // 调用API更新子待办
    const updatedSubTodo = await todoStore.updateSubTodo(
      currentParentTodo.value.id,
      currentSubTodo.value.id,
      {
        title: currentSubTodo.value.title,
        description: currentSubTodo.value.description,
        status: currentSubTodo.value.status,
        priority: currentSubTodo.value.priority,
      }
    );

    // 更新父待办的子待办列表
    if (updatedSubTodo && currentParentTodo.value.sub_todos) {
      const index = currentParentTodo.value.sub_todos.findIndex(
        (st) => st.id === currentSubTodo.value.id
      );
      if (index !== -1) {
        currentParentTodo.value.sub_todos[index] = updatedSubTodo;
      }
    }

    // 关闭对话框
    subTodoDialog.value = false;

    // 显示成功提示
    showNotification("子任务更新成功", "success");
  } catch (error) {
    console.error("更新子待办失败:", error);
    showNotification("更新子任务失败，请重试", "error");
  }
}

// 删除子待办
async function deleteSubTodo() {
  if (!currentParentTodo.value || !currentSubTodo.value.id) return;

  try {
    // 调用API删除子待办
    await todoStore.deleteSubTodo(
      currentParentTodo.value.id,
      currentSubTodo.value.id
    );

    // 从父待办的子待办列表中移除
    if (currentParentTodo.value.sub_todos) {
      currentParentTodo.value.sub_todos =
        currentParentTodo.value.sub_todos.filter(
          (st) => st.id !== currentSubTodo.value.id
        );
    }

    // 关闭对话框
    deleteSubTodoDialog.value = false;

    // 显示成功提示
    showNotification("子任务已删除", "success");
  } catch (error) {
    console.error("删除子待办失败:", error);
    showNotification("删除子任务失败，请重试", "error");
  }
}

// 切换子待办状态
async function toggleSubTodoStatus(parentId, subTodo) {
  const parentTodo = todoStore.getAllTodos.find((todo) => todo.id === parentId);
  if (!parentTodo || !subTodo) return;

  // 如果正在更新，不允许再次点击
  if (subTodo.isUpdating) return;

  // 设置加载状态
  subTodo.isUpdating = true;

  try {
    // 计算目标状态
    const targetStatus = subTodo.status === "done" ? "pending" : "done";

    // 调用相应的API
    let updatedSubTodo;
    if (targetStatus === "done") {
      updatedSubTodo = await todoStore.completeSubTodo(parentId, subTodo.id);
    } else {
      updatedSubTodo = await todoStore.reopenSubTodo(parentId, subTodo.id);
    }

    // 更新本地状态
    if (updatedSubTodo) {
      const index = parentTodo.sub_todos.findIndex(
        (st) => st.id === subTodo.id
      );
      if (index !== -1) {
        parentTodo.sub_todos[index] = { ...updatedSubTodo, isUpdating: false };
      }
    }
  } catch (error) {
    console.error("更新子待办状态失败:", error);
    showNotification("更新子任务状态失败，请重试", "error");
  } finally {
    // 清除加载状态
    subTodo.isUpdating = false;
  }
}

// 将子待办标记为已完成
async function completeSubTodo(parentId, subTodo) {
  const parentTodo = todoStore.getAllTodos.find((todo) => todo.id === parentId);
  if (!parentTodo || !subTodo) return;

  // 如果正在更新，不允许再次点击
  if (subTodo.isUpdating) return;

  // 设置加载状态
  subTodo.isUpdating = true;

  try {
    // 调用API
    const updatedSubTodo = await todoStore.completeSubTodo(
      parentId,
      subTodo.id
    );

    // 更新本地状态
    if (updatedSubTodo) {
      const index = parentTodo.sub_todos.findIndex(
        (st) => st.id === subTodo.id
      );
      if (index !== -1) {
        parentTodo.sub_todos[index] = { ...updatedSubTodo, isUpdating: false };
      }
    }
  } catch (error) {
    console.error("标记子待办为已完成失败:", error);
    showNotification("标记子任务为已完成失败，请重试", "error");
  } finally {
    // 清除加载状态
    subTodo.isUpdating = false;
  }
}

// 重新打开子待办
async function reopenSubTodo(parentId, subTodo) {
  const parentTodo = todoStore.getAllTodos.find((todo) => todo.id === parentId);
  if (!parentTodo || !subTodo) return;

  // 如果正在更新，不允许再次点击
  if (subTodo.isUpdating) return;

  // 设置加载状态
  subTodo.isUpdating = true;

  try {
    // 调用API
    const updatedSubTodo = await todoStore.reopenSubTodo(parentId, subTodo.id);

    // 更新本地状态
    if (updatedSubTodo) {
      const index = parentTodo.sub_todos.findIndex(
        (st) => st.id === subTodo.id
      );
      if (index !== -1) {
        parentTodo.sub_todos[index] = { ...updatedSubTodo, isUpdating: false };
      }
    }
  } catch (error) {
    console.error("重新打开子待办失败:", error);
    showNotification("重新打开子任务失败，请重试", "error");
  } finally {
    // 清除加载状态
    subTodo.isUpdating = false;
  }
}
</script>

<style scoped>
.todos-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-top: 12px;
  padding-bottom: 24px;
}

.todo-card {
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.06) !important;
  background-color: white;
  position: relative;
  overflow: hidden;
}

.todo-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
  border-color: rgba(0, 0, 0, 0.1) !important;
  z-index: 1;
}

/* Priority Indicators (Left Border) */
.todo-card::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: #e0e0e0; /* Default/Low priority */
  transition: background-color 0.2s ease;
}

.todo-card.priority-5::before {
  background-color: #ff5252; /* Error/Critical */
}

.todo-card.priority-4::before {
  background-color: #ff5722; /* Deep Orange/High */
}

.todo-card.priority-3::before {
  background-color: #fb8c00; /* Warning/Medium */
}

.todo-card.priority-2::before {
  background-color: #4caf50; /* Success/Low */
}

.todo-card.priority-1::before {
  background-color: #2196f3; /* Info/Minimal */
}

.todo-card.status-processing::before {
  background-color: #2196f3;
}

.todo-card.status-done::before {
  background-color: #bdbdbd;
}

.todo-card.status-suspended::before {
  background-color: #9e9e9e;
  border-right: 1px dashed #e0e0e0;
}

/* Dialog Styles */
.title-input :deep(.v-field__input) {
  font-size: 1.5rem;
  line-height: 1.4;
  padding-left: 0;
  letter-spacing: -0.01em;
}

/* Status Styles */
.completed-todo {
  opacity: 0.85;
  background-color: #fafafa;
}

.completed-todo .v-list-item-title,
.completed-todo .todo-title {
  text-decoration: line-through;
  color: #9e9e9e;
}

.processing-todo {
  background-color: #f0f7ff;
}

.suspended-todo {
  opacity: 0.8;
  background-color: #fff8e1; /* Amber lighten-5 */
  border-style: dashed !important;
}

.archived-todo {
  opacity: 0.6;
  background-color: #f5f5f5;
}

/* Typography */
.todo-title {
  font-size: 0.95rem;
  line-height: 1.4;
  color: #333;
}

.todo-description {
  color: #666;
  font-size: 0.85rem;
  line-height: 1.5;
  margin-top: 4px;
}

/* Sub-todos */
.sub-todo-item {
  transition: background-color 0.2s ease;
}

.sub-todo-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.sub-todo-item .hover-visible {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.sub-todo-item:hover .hover-visible {
  opacity: 1;
}

.sub-todo-input :deep(.v-field__input) {
  padding-top: 0;
  padding-bottom: 0;
  min-height: 32px;
  font-size: 0.875rem;
}

/* Transitions */
.todo-list-enter-active,
.todo-list-leave-active {
  transition: all 0.3s ease;
}

.todo-list-enter-from,
.todo-list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Note Edit Area */
.note-edit-area {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 8px;
}
</style>

<route>
{
  meta: {
    requiresAuth: true,
    layout: 'default'
  }
}
</route>
