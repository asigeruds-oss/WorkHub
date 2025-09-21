<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-4">
          <h1 class="text-h4 font-weight-medium">
                  <v-icon icon="mdi-format-list-checks" class="mr-2" color="primary"></v-icon>
            待办事项
          </h1>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="openAddDialog"
            prepend-icon="mdi-plus"
            class="mr-2"
            elevation="2"
            rounded
          >
            添加新任务
          </v-btn>
        </div>        <!-- 加载状态 -->
        <div v-if="todoStore.isLoading" class="d-flex justify-center my-4">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
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
            <v-btn
              variant="text"
              @click="snackbar.show = false"
            >
              关闭
            </v-btn>
          </template>
        </v-snackbar>
        
        <!-- 日常任务部分 -->
        <DailyTaskList :showNotification="showNotification" />

        <!-- 没有待办事项 -->
        <v-card v-if="filteredTodos.length === 0 && !todoStore.isLoading" class="pa-4">
          <v-card-text class="text-center">
            <v-icon icon="mdi-checkbox-blank-off-outline" size="large" class="mb-2"></v-icon>
            <div class="text-body-1">暂无待办事项</div>
            <v-btn color="primary" class="mt-4" @click="openAddDialog">
              添加第一个任务
            </v-btn>
          </v-card-text>
        </v-card>

        <!-- 待办事项列表 -->
        <div v-else>
          <transition-group name="todo-list" tag="div" class="todo-container">
            <v-card 
              v-for="todo in filteredTodos" 
              :key="todo.id" 
              class="mb-3 todo-card"
              :class="{
                'completed-todo': todo.status === 'done',
                'archived-todo': todo.status === 'archived',
                'processing-todo': todo.status === 'processing',
                'faded-todo': hasProcessingTodo && todo.status !== 'processing'
              }"
              elevation="2"
              rounded="lg"
            >
              <v-card-text class="pa-4">
              <div class="d-flex align-center">
                <v-checkbox
                  :model-value="todo.status === 'done'"
                  @change="toggleTodoStatus(todo)"
                  :disabled="todo.status === 'archived' || todo.isUpdating"
                  hide-details
                  density="compact"
                  :color="getPriorityColor(todo.priority)"
                >
                  <template v-slot:loader v-if="todo.isUpdating">
                    <v-progress-circular indeterminate color="primary" size="16"></v-progress-circular>
                  </template>
                </v-checkbox>                <div class="ml-3 flex-grow-1">
                  <div class="d-flex align-center" :class="{
                    'text-decoration-line-through': todo.status === 'done',
                    'font-weight-medium': todo.status === 'pending',
                    'text-grey': todo.status === 'archived'
                  }">
                    <span class="text-subtitle-1">{{ todo.title }}</span>
                    <v-chip
                      v-if="todo.priority"
                      size="small"
                      :color="getPriorityColor(todo.priority)"
                      class="ml-2"
                      variant="outlined"
                      label
                    >
                      {{ getPriorityLabel(todo.priority) }}
                    </v-chip>
                    <v-chip
                      v-if="todo.status === 'done'"
                      size="small"
                      color="success"
                      class="ml-2"
                      label
                    >
                      已完成
                    </v-chip>
                    <v-chip
                      v-if="todo.status === 'archived'"
                      size="small"
                      color="grey"
                      class="ml-2"
                      label
                    >
                      已归档
                    </v-chip>
                    <v-chip
                      v-if="todo.status === 'processing'"
                      size="small"
                      color="warning"
                      class="ml-2 processing-chip"
                      label
                      variant="elevated"
                      elevation="2"
                    >
                      <v-icon start size="x-small" class="animate-pulse">mdi-clock-fast</v-icon>
                      正在处理
                    </v-chip>
                    <!-- 子待办数量标记和快捷按钮 -->
                    <v-chip
                      v-if="todo.sub_todos && todo.sub_todos.length > 0"
                      size="small"
                      color="info"
                      class="ml-2"
                      label
                      :prepend-icon="todo.showSubTodos ? 'mdi-chevron-down' : 'mdi-chevron-right'"
                      @click="toggleSubTodosVisibility(todo)"
                      style="cursor: pointer;"
                    >
                      {{ todo.sub_todos.length }} 个子任务
                    </v-chip>
                    <!-- 添加子任务快捷按钮 -->
                    <v-btn
                      v-if="todo.status !== 'archived'"
                      icon="mdi-playlist-plus"
                      size="x-small"
                      color="info"
                      variant="text"
                      class="ml-2"
                      @click="openAddSubTodoDialog(todo)"
                      title="添加子任务"
                    ></v-btn>
                  </div>
                  <div v-if="todo.description" class="text-body-2 mt-2 todo-description">
                    {{ todo.description }}
                  </div>
                  
                  <!-- 快速添加子任务按钮（在没有子任务时显示） -->
                  <div v-if="(!todo.sub_todos || todo.sub_todos.length === 0) && todo.status !== 'archived'" class="mt-2">
                    <v-btn
                      size="small"
                      color="info"
                      variant="text"
                      prepend-icon="mdi-playlist-plus"
                      density="comfortable"
                      @click="openAddSubTodoDialog(todo)"
                      class="px-2"
                    >
                      添加子任务
                    </v-btn>
                  </div>
                  
                  <!-- 子待办列表 -->
                  <div v-if="todo.sub_todos && todo.sub_todos.length > 0" class="sub-todos-container mt-3">
                    <v-expand-transition>
                      <div v-if="todo.showSubTodos">
                        <v-card flat class="sub-todos-panel pa-3 rounded-lg" color="transparent" style="border-left: 3px solid var(--v-info-base, #2196F3); background-color: rgba(33, 150, 243, 0.04);">
                          <div class="d-flex align-center justify-space-between mb-3">
                            <div class="text-subtitle-2 font-weight-medium text-primary-darken-1">
                              <v-icon icon="mdi-format-list-checks" size="small" color="info" class="mr-2"></v-icon>
                              子任务列表 ({{ todo.sub_todos.length }})
                            </div>
                            <v-btn
                              variant="text"
                              size="x-small"
                              icon="mdi-chevron-up"
                              @click="toggleSubTodosVisibility(todo)"
                              color="info"
                              class="elevation-0"
                            ></v-btn>
                          </div>
                          
                          <v-list class="sub-todo-list pa-0 rounded-lg" density="compact" bg-color="transparent">
                            <v-list-item
                              v-for="(subTodo, index) in todo.sub_todos"
                              :key="subTodo.id"
                              :class="{
                                'sub-todo-completed': subTodo.status === 'done',
                                'sub-todo-archived': subTodo.status === 'archived',
                                'rounded-lg mb-1': true
                              }"
                              rounded="lg"
                            >
                              <template v-slot:prepend>
                                <v-checkbox
                                  :model-value="subTodo.status === 'done'"
                                  @change="toggleSubTodoStatus(todo.id, subTodo)"
                                  :disabled="subTodo.status === 'archived' || subTodo.isUpdating"
                                  hide-details
                                  density="compact"
                                  :color="getPriorityColor(subTodo.priority)"
                                >
                                  <template v-slot:loader v-if="subTodo.isUpdating">
                                    <v-progress-circular indeterminate color="primary" size="12"></v-progress-circular>
                                  </template>
                                </v-checkbox>
                              </template>
                              
                              <v-list-item-title :class="{
                                'text-decoration-line-through': subTodo.status === 'done',
                                'text-grey': subTodo.status === 'archived'
                              }">
                                {{ subTodo.title }}
                              </v-list-item-title>
                              
                              <template v-slot:append>
                                <v-menu>
                                  <template v-slot:activator="{ props }">
                                    <v-btn
                                      icon="mdi-dots-vertical"
                                      variant="text"
                                      size="x-small"
                                      v-bind="props"
                                      :disabled="subTodo.status === 'archived'"
                                      class="menu-button"
                                    ></v-btn>
                                  </template>
                                  <v-list>
                                    <v-list-item @click="openEditSubTodoDialog(todo.id, subTodo)" density="compact">
                                      <template v-slot:prepend>
                                        <v-icon icon="mdi-pencil" color="primary" size="small"></v-icon>
                                      </template>
                                      <v-list-item-title>编辑</v-list-item-title>
                                    </v-list-item>
                                    
                                    <v-list-item v-if="subTodo.status === 'pending'" @click="completeSubTodo(todo.id, subTodo)" density="compact">
                                      <template v-slot:prepend>
                                        <v-icon icon="mdi-check" color="success" size="small"></v-icon>
                                      </template>
                                      <v-list-item-title>标记为已完成</v-list-item-title>
                                    </v-list-item>
                                    
                                    <v-list-item v-if="subTodo.status === 'done'" @click="reopenSubTodo(todo.id, subTodo)" density="compact">
                                      <template v-slot:prepend>
                                        <v-icon icon="mdi-refresh" color="info" size="small"></v-icon>
                                      </template>
                                      <v-list-item-title>重新打开</v-list-item-title>
                                    </v-list-item>
                                    
                                    <v-list-item @click="openDeleteSubTodoDialog(todo.id, subTodo)" class="text-error">
                                      <template v-slot:prepend>
                                        <v-icon icon="mdi-delete" color="error" size="small"></v-icon>
                                      </template>
                                      <v-list-item-title>删除</v-list-item-title>
                                    </v-list-item>
                                  </v-list>
                                </v-menu>
                              </template>
                            </v-list-item>
                            
                            <!-- 添加新子待办的输入框 -->
                            <v-list-item class="add-sub-todo-item">
                              <v-text-field
                                v-model="todo.newSubTodoTitle"
                                placeholder="添加新子任务..."
                                variant="outlined"
                                density="compact"
                                color="info"
                                bg-color="white"
                                hide-details
                                rounded="lg"
                                class="sub-todo-input"
                                @keyup.enter="addSubTodo(todo)"
                                append-inner-icon="mdi-plus-circle"
                                @click:append-inner="addSubTodo(todo)"
                                :loading="todo.isAddingSubTodo"
                              ></v-text-field>
                            </v-list-item>
                          </v-list>
                        </v-card>
                      </div>
                    </v-expand-transition>
                  </div>
                  
                  <!-- 根据设置决定是否显示日期信息 -->
                  <div v-if="todoSettings.showDateInfo" class="d-flex align-center text-caption text-grey mt-3">
                    <v-icon icon="mdi-calendar" size="small" class="mr-1"></v-icon>
                    <span>创建于: {{ formatDate(todo.created_at) }}</span>
                    <v-divider vertical class="mx-2"></v-divider>
                    <span v-if="todo.due_date" class="d-flex align-center">
                      <v-icon icon="mdi-clock-outline" size="small" class="mr-1"></v-icon>
                      <span :class="{
                        'text-error': new Date(todo.due_date) < new Date() && todo.status === 'pending',
                        'text-warning': isApproachingDeadline(todo.due_date) && todo.status === 'pending'
                      }">
                        截止: {{ formatDate(todo.due_date) }}
                        <v-tooltip activator="parent" location="top">
                          {{ getTimeRemaining(todo.due_date) }}
                        </v-tooltip>
                      </span>
                    </span>
                    <span v-else class="text-grey-lighten-1 font-italic">未设置截止日期</span>
                  </div>
                </div>
                
                <div class="d-flex">
                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <v-btn
                        icon="mdi-dots-vertical"
                        variant="text"
                        size="small"
                        v-bind="props"
                        :disabled="todo.status === 'archived'"
                        class="menu-button"
                      ></v-btn>
                    </template>
                    <v-list>
                      <v-list-item @click="openEditDialog(todo)" density="compact">
                        <template v-slot:prepend>
                          <v-icon icon="mdi-pencil" color="primary"></v-icon>
                        </template>
                        <v-list-item-title>编辑</v-list-item-title>
                      </v-list-item>
                      
                      <v-list-item v-if="todo.status === 'pending'" @click="completeTodo(todo)" density="compact">
                        <template v-slot:prepend>
                          <v-icon icon="mdi-check" color="success"></v-icon>
                        </template>
                        <v-list-item-title>标记为已完成</v-list-item-title>
                      </v-list-item>
                      
                      <v-list-item v-if="todo.status === 'done'" @click="reopenTodo(todo)" density="compact">
                        <template v-slot:prepend>
                          <v-icon icon="mdi-refresh" color="info"></v-icon>
                        </template>
                        <v-list-item-title>重新打开</v-list-item-title>
                      </v-list-item>
                      
                      <v-list-item v-if="todo.status !== 'processing' && todo.status !== 'archived'" @click="setProcessingTodo(todo)" density="compact" class="focus-action">
                        <template v-slot:prepend>
                          <v-icon icon="mdi-clock-fast" color="warning"></v-icon>
                        </template>
                        <v-list-item-title class="font-weight-medium">标记为正在处理</v-list-item-title>
                      </v-list-item>
                      
                      <v-list-item v-if="todo.status === 'processing'" @click="reopenTodo(todo)" density="compact">
                        <template v-slot:prepend>
                          <v-icon icon="mdi-progress-close" color="info"></v-icon>
                        </template>
                        <v-list-item-title>取消正在处理</v-list-item-title>
                      </v-list-item>
                      
                      <v-divider></v-divider>
                      
                      <!-- 子待办相关操作 -->
                      <v-list-item @click="openAddSubTodoDialog(todo)" density="compact">
                        <template v-slot:prepend>
                          <v-icon icon="mdi-playlist-plus" color="primary"></v-icon>
                        </template>
                        <v-list-item-title>添加子任务</v-list-item-title>
                      </v-list-item>
                      
                      <v-divider></v-divider>
                      
                      <v-list-item v-if="todo.status !== 'archived'" @click="archiveTodo(todo)" density="compact">
                        <template v-slot:prepend>
                          <v-icon icon="mdi-archive" color="grey-darken-1"></v-icon>
                        </template>
                        <v-list-item-title>归档</v-list-item-title>
                      </v-list-item>
                      
                      <v-list-item @click="openDeleteDialog(todo)" class="text-error">
                        <template v-slot:prepend>
                          <v-icon icon="mdi-delete" color="error"></v-icon>
                        </template>
                        <v-list-item-title>删除</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
              </div>
            </v-card-text>
          </v-card>
          
          </transition-group>
          
          <!-- 无数据提示 -->
          <div v-if="!todoStore.isLoading && todoStore.getAllTodos.length === 0" class="d-flex flex-column align-center my-10">
            <v-icon icon="mdi-clipboard-text-outline" size="70" color="grey-lighten-2" class="mb-4"></v-icon>
            <p class="text-h6 text-grey-darken-1">暂无待办事项</p>
            <p class="text-body-2 text-grey">点击"添加新任务"按钮创建您的第一个待办事项</p>
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
          
          <!-- 分页控件 -->
          <div v-if="todoStore.getAllTodos.length > 0" class="d-flex justify-center mt-6">
            <v-pagination
              v-if="todoStore.getPagination.count > 0"
              v-model="currentPage"
              :length="Math.ceil(todoStore.getPagination.count / pageSize)"
              :total-visible="5"
              @update:model-value="handlePageChange"
              color="primary"
              rounded="circle"
              class="pagination"
            ></v-pagination>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- 添加/编辑对话框 -->
    <v-dialog v-model="dialog" max-width="500" transition="dialog-bottom-transition">
      <v-card rounded="lg">
        <v-toolbar :color="isEditing ? 'primary' : 'primary'" density="comfortable" flat>
          <v-toolbar-title class="text-white">
            {{ isEditing ? '编辑任务' : '添加新任务' }}
          </v-toolbar-title>
        </v-toolbar>
        
        <v-card-text class="pt-4">
          <v-form ref="form" @submit.prevent="isEditing ? updateTodo() : addTodo()">
            <v-text-field
              v-model="currentTodo.title"
              label="任务标题"
              :rules="[(v) => !!v && v.trim() !== '' || '标题不能为空']"
              required
              variant="outlined"
              prepend-inner-icon="mdi-format-title"
              @input="() => { if(form.value) form.value.resetValidation() }"
              class="mb-3"
            ></v-text-field>
            
            <v-textarea
              v-model="currentTodo.description"
              label="任务描述"
              rows="3"
              variant="outlined"
              prepend-inner-icon="mdi-text-box-outline"
              class="mb-3"
              placeholder="输入任务详细描述..."
            ></v-textarea>
            
            <v-select
              v-model="currentTodo.priority"
              label="优先级"
              :items="priorityOptions"
              item-title="text"
              item-value="value"
              variant="outlined"
              prepend-inner-icon="mdi-flag"
              class="mb-3"
            ></v-select>
            
            <v-select
              v-if="isEditing"
              v-model="currentTodo.status"
              label="状态"
              :items="statusOptions"
              item-title="text"
              item-value="value"
              variant="outlined"
              prepend-inner-icon="mdi-check-circle-outline"
              class="mb-3"
            ></v-select>
            
            <v-row>
              <v-col cols="12" sm="7">
                <v-text-field
                  v-model="currentTodo.due_date"
                  label="截止日期"
                  type="date"
                  hint="选择任务截止日期"
                  persistent-hint
                  variant="outlined"
                  prepend-inner-icon="mdi-calendar"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="5">
                <v-text-field
                  v-model="currentTodo.due_time"
                  label="截止时间"
                  type="time"
                  hint="选择截止时间"
                  persistent-hint
                  variant="outlined"
                  prepend-inner-icon="mdi-clock-outline"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-divider></v-divider>
        
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="outlined" @click="dialog = false" class="mr-2">取消</v-btn>
          <v-btn
            color="primary"
            @click="handleFormSubmit"
            :loading="todoStore.isLoading"
            type="submit"
            variant="elevated"
          >
            {{ isEditing ? '更新' : '添加' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 删除确认对话框 -->
    <v-dialog v-model="deleteDialog" max-width="400" transition="dialog-top-transition">
      <v-card rounded="lg">
        <v-toolbar color="error" density="comfortable" flat>
          <v-toolbar-title class="text-white">
            确认删除
          </v-toolbar-title>
        </v-toolbar>
        
        <v-card-text class="pt-4 pb-2 text-center">
          <v-icon icon="mdi-alert-circle" color="error" size="large" class="mb-3"></v-icon>
          <p class="text-body-1">确定要删除以下任务吗？</p>
          <p class="text-subtitle-1 font-weight-medium mt-2">"{{ currentTodo.title }}"</p>
          <p class="text-caption mt-2 text-grey">此操作不可撤销</p>
        </v-card-text>
        
        <v-divider></v-divider>
        
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="deleteDialog = false" class="mr-2">取消</v-btn>
          <v-btn
            color="error"
            @click="deleteTodo()"
            :loading="todoStore.isLoading"
            variant="elevated"
          >
            删除
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 添加/编辑子待办对话框 -->
    <v-dialog v-model="subTodoDialog" max-width="500" transition="dialog-bottom-transition">
      <v-card rounded="lg">
        <v-toolbar :color="isEditingSubTodo ? 'info' : 'info'" density="comfortable" flat>
          <v-toolbar-title class="text-white">
            {{ isEditingSubTodo ? '编辑子任务' : '添加子任务' }}
          </v-toolbar-title>
          <template v-if="currentParentTodo">
            <v-toolbar-subtitle class="text-white">
              父任务: {{ currentParentTodo.title }}
            </v-toolbar-subtitle>
          </template>
        </v-toolbar>
        
        <v-card-text class="pt-4">
          <v-form ref="subTodoForm" @submit.prevent="isEditingSubTodo ? updateSubTodo() : addSubTodoFromDialog()">
            <v-text-field
              v-model="currentSubTodo.title"
              label="子任务标题"
              :rules="[(v) => !!v && v.trim() !== '' || '标题不能为空']"
              required
              variant="outlined"
              prepend-inner-icon="mdi-format-title"
              @input="() => { if(subTodoForm.value) subTodoForm.value.resetValidation() }"
              class="mb-3"
            ></v-text-field>
            
            <v-textarea
              v-model="currentSubTodo.description"
              label="子任务描述"
              rows="2"
              variant="outlined"
              prepend-inner-icon="mdi-text-box-outline"
              class="mb-3"
              placeholder="输入子任务详细描述..."
            ></v-textarea>
            
            <v-select
              v-model="currentSubTodo.priority"
              label="优先级"
              :items="priorityOptions"
              item-title="text"
              item-value="value"
              variant="outlined"
              prepend-inner-icon="mdi-flag"
              class="mb-3"
            ></v-select>
            
            <v-select
              v-if="isEditingSubTodo"
              v-model="currentSubTodo.status"
              label="状态"
              :items="statusOptions"
              item-title="text"
              item-value="value"
              variant="outlined"
              prepend-inner-icon="mdi-check-circle-outline"
              class="mb-3"
            ></v-select>
          </v-form>
        </v-card-text>
        
        <v-divider></v-divider>
        
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="outlined" @click="subTodoDialog = false" class="mr-2">取消</v-btn>
          <v-btn
            color="info"
            @click="handleSubTodoFormSubmit"
            :loading="todoStore.isLoading"
            type="submit"
            variant="elevated"
          >
            {{ isEditingSubTodo ? '更新' : '添加' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 删除子待办确认对话框 -->
    <v-dialog v-model="deleteSubTodoDialog" max-width="400" transition="dialog-top-transition">
      <v-card rounded="lg">
        <v-toolbar color="error" density="comfortable" flat>
          <v-toolbar-title class="text-white">
            确认删除子任务
          </v-toolbar-title>
        </v-toolbar>
        
        <v-card-text class="pt-4 pb-2 text-center">
          <v-icon icon="mdi-alert-circle" color="error" size="large" class="mb-3"></v-icon>
          <p class="text-body-1">确定要删除以下子任务吗？</p>
          <p class="text-subtitle-1 font-weight-medium mt-2">"{{ currentSubTodo.title }}"</p>
          <p class="text-caption mt-2 text-grey">此操作不可撤销</p>
        </v-card-text>
        
        <v-divider></v-divider>
        
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="deleteSubTodoDialog = false" class="mr-2">取消</v-btn>
          <v-btn
            color="error"
            @click="deleteSubTodo()"
            :loading="todoStore.isLoading"
            variant="elevated"
          >
            删除
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useTodoStore } from '@/stores/todo'
import { useSettingsStore } from '@/stores/settings'
import { useRouter } from 'vue-router'
import DailyTaskList from '@/components/DailyTaskList.vue'

// 初始化store
const todoStore = useTodoStore()
const settingsStore = useSettingsStore()
const router = useRouter()

// 获取用户设置
const todoSettings = settingsStore.getTodoSettings

// 组件状态
const dialog = ref(false)
const deleteDialog = ref(false)
const isEditing = ref(false)
const currentTodo = ref({
  title: '',
  description: '',
  status: 'pending',
  priority: 2, // 中等优先级，使用数字
  due_date: null,
  due_time: '23:59' // 默认为当天结束时间
})

// 子待办状态
const subTodoDialog = ref(false)
const deleteSubTodoDialog = ref(false)
const isEditingSubTodo = ref(false)
const currentParentTodo = ref(null)
const currentSubTodo = ref({
  title: '',
  description: '',
  status: 'pending',
  priority: 2,
  parent_id: null
})
const subTodoForm = ref(null)

const filter = ref('all')
const search = ref('')
const form = ref(null)
const currentPage = ref(1)
const pageSize = todoSettings.pageSize // 使用设置中的页面大小

// 提示框状态
const snackbar = ref({
  show: false,
  text: '',
  color: 'info',
  timeout: 3000
})

// 显示提示信息
function showNotification(text, color = 'info', timeout = 3000) {
  snackbar.value = {
    show: true,
    text,
    color,
    timeout
  }
}

// 默认筛选状态
const filterOptions = [
  { text: '全部', value: 'all' },
  { text: '待办', value: 'pending' },
  { text: '正在处理', value: 'processing' },
  { text: '已完成', value: 'done' },
  { text: '已归档', value: 'archived' }
]



// 优先级选项
const priorityOptions = [
  { text: '高', value: 3 },
  { text: '中', value: 2 },
  { text: '低', value: 1 },
]

// 状态选项
const statusOptions = [
  { text: '待办', value: 'pending' },
  { text: '正在处理', value: 'processing' },
  { text: '已完成', value: 'done' },
  { text: '已归档', value: 'archived' },
]

// 计算属性：是否有正在处理的待办
const hasProcessingTodo = computed(() => {
  return todoStore.getAllTodos.some(todo => todo.status === 'processing')
})

// 获取优先级颜色
function getPriorityColor(priority) {
  switch (Number(priority)) {
    case 3: return 'error'
    case 2: return 'warning'
    case 1: return 'success'
    default: return 'grey'
  }
}

// 获取优先级标签
function getPriorityLabel(priority) {
  switch (Number(priority)) {
    case 3: return '高'
    case 2: return '中'
    case 1: return '低'
    default: return '未设置'
  }
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return '未设置'
  
  const date = new Date(dateString)
  
  // 格式化为 YYYY年MM月DD日 HH:mm 的格式
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  
  return `${year}年${month}月${day}日 ${hours}:${minutes}`
}

// 判断是否接近截止日期（24小时内）
function isApproachingDeadline(dateString) {
  if (!dateString) return false
  
  const dueDate = new Date(dateString)
  const now = new Date()
  const diffMs = dueDate - now
  const diffHours = diffMs / (1000 * 60 * 60)
  
  // 如果截止时间在24小时内但还未过期
  return diffHours > 0 && diffHours <= 24
}

// 获取距离截止日期的剩余时间描述
function getTimeRemaining(dateString) {
  if (!dateString) return '无截止日期'
  
  const dueDate = new Date(dateString)
  const now = new Date()
  const diffMs = dueDate - now
  
  // 已经过期
  if (diffMs < 0) {
    const overdueDays = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24))
    const overdueHours = Math.floor(Math.abs(diffMs) % (1000 * 60 * 60 * 24) / (1000 * 60 * 60))
    
    if (overdueDays > 0) {
      return `已逾期 ${overdueDays} 天 ${overdueHours} 小时`
    } else {
      const overdueMinutes = Math.floor(Math.abs(diffMs) % (1000 * 60 * 60) / (1000 * 60))
      return `已逾期 ${overdueHours} 小时 ${overdueMinutes} 分钟`
    }
  }
  
  // 还未过期
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) {
    return `剩余 ${days} 天 ${hours} 小时`
  } else if (hours > 0) {
    return `剩余 ${hours} 小时 ${minutes} 分钟`
  } else {
    return `剩余 ${minutes} 分钟`
  }
}

// 处理表单提交
async function handleFormSubmit() {
  // 如果表单引用不存在
  if (!form.value) {
    return
  }
  
  try {
    // 手动触发表单验证
    const { valid } = await form.value.validate()
    
    if (!valid) {
      return
    }
    
    // 检查标题是否为空
    if (!currentTodo.value.title || currentTodo.value.title.trim() === '') {
      return
    }
    
    // 根据编辑状态调用相应函数
    if (isEditing.value) {
      await updateTodo()
    } else {
      await addTodo()
    }
  } catch (error) {
    console.error('表单提交失败:', error.message)
  }
}

// 计算属性：筛选和搜索后的待办事项
const filteredTodos = computed(() => {
  // 直接返回API获取的结果，不在前端进行排序
  return todoStore.getAllTodos
})

// 应用过滤器
function applyFilters() {
  // 转换filter.value为API需要的status参数
  let status = ''
  if (filter.value === 'pending' || filter.value === 'done' || filter.value === 'archived') {
    status = filter.value
  }
  
  fetchTodos({
    status,
    search: search.value,
    page: 1 // 重置为第一页
  })
}

// 处理分页变化
function handlePageChange(page) {
  fetchTodos({ page })
}

// 封装获取待办事项的函数
async function fetchTodos(options = {}) {
  try {
    // 确保始终使用当前的页面大小
    const fetchOptions = {
      ...options,
      pageSize: pageSize
    }
    
    await todoStore.fetchTodos(fetchOptions)
  } catch (error) {
    console.error('加载待办事项失败:', error)
  }
}



// 监听设置变化
watch(
  () => settingsStore.getTodoSettings,
  (newSettings) => {
    // 更新每页显示数量
    if (newSettings.pageSize !== pageSize) {
      // 保存当前页码
      const currentItemIndex = (currentPage.value - 1) * pageSize
      
      // 更新页面大小
      pageSize = newSettings.pageSize
      
      // 计算新的页码
      currentPage.value = Math.floor(currentItemIndex / pageSize) + 1
      
      // 重新获取数据
      applyFilters()
    }
  },
  { deep: true }
)

// 生命周期钩子
onMounted(async () => {
  try {
    // 设置加载中状态
    todoStore.loading = true
    
    console.log('初始化加载待办事项')
    await todoStore.fetchTodos({
      page: currentPage.value,
      pageSize
    })
    
    // 为所有任务初始化子待办相关的属性
    todoStore.getAllTodos.forEach(todo => {
      // 如果todo.sub_todos不存在，初始化为空数组
      if (!todo.sub_todos) {
        todo.sub_todos = []
      }
      
      // 为每个待办添加一个控制子待办显示/隐藏的属性
      todo.showSubTodos = false
      
      // 为每个待办添加一个新子待办的标题输入字段
      todo.newSubTodoTitle = ''
      
      // 添加子待办加载状态
      todo.isAddingSubTodo = false
    })
    
    console.log('待办事项加载完成:', todoStore.getAllTodos.length, '个项目')
  } catch (error) {
    console.error('加载待办事项失败:', error)
    showNotification('加载待办事项失败，请重试', 'error')
  }
})

// 方法
function openAddDialog() {
  isEditing.value = false
  currentTodo.value = {
    title: '',
    description: '',
    status: 'pending',
    priority: 2, // 中等优先级，使用数字
    due_date: null,
    due_time: '23:59' // 默认设置为当天结束时间
  }
  dialog.value = true
}

function openEditDialog(todo) {
  isEditing.value = true
  // 深拷贝待办事项
  currentTodo.value = { ...todo }
  
  // 如果有截止日期，拆分为日期和时间
  if (todo.due_date) {
    const dueDateTime = new Date(todo.due_date)
    // 格式化日期部分为YYYY-MM-DD格式（HTML日期输入所需）
    currentTodo.value.due_date = dueDateTime.toISOString().split('T')[0]
    
    // 格式化时间部分为HH:MM格式（HTML时间输入所需）
    const hours = dueDateTime.getHours().toString().padStart(2, '0')
    const minutes = dueDateTime.getMinutes().toString().padStart(2, '0')
    currentTodo.value.due_time = `${hours}:${minutes}`
  } else {
    currentTodo.value.due_time = '23:59' // 默认时间
  }
  
  dialog.value = true
}

function openDeleteDialog(todo) {
  currentTodo.value = { ...todo }
  deleteDialog.value = true
}

async function addTodo() {
  // 确保表单实例存在
  if (!form.value) {
    return
  }
  
  try {
    // 执行表单验证
    const { valid } = await form.value.validate()
    
    if (!valid) {
      return
    }
    
    // 处理截止日期和时间
    let dueDateTimeISO = null
    if (currentTodo.value.due_date) {
      // 拼接日期和时间
      const dueDateStr = currentTodo.value.due_date
      const dueTimeStr = currentTodo.value.due_time || '23:59'
      
      // 创建日期对象并转为ISO格式
      const dueDateTime = new Date(`${dueDateStr}T${dueTimeStr}`)
      dueDateTimeISO = dueDateTime.toISOString()
    }
    
    await todoStore.addTodo(
      currentTodo.value.title, 
      currentTodo.value.description,
      {
        priority: currentTodo.value.priority,
        due_date: dueDateTimeISO
      }
    )
    
    dialog.value = false
    showNotification('新任务添加成功', 'success')
    
    // 如果之前没有待办事项，不需要刷新，store已经更新
    if (todoStore.getAllTodos.length <= 1) {
      console.log('第一个待办事项已添加，无需刷新列表')
    } else {
      // 有多个待办事项时刷新列表以确保排序正确
      applyFilters()
    }
  } catch (error) {
    console.error('添加待办事项失败:', error.message)
    showNotification('添加待办事项失败: ' + error.message, 'error')
  }
}

async function updateTodo() {
  // 确保表单实例存在
  if (!form.value) {
    return
  }
  
  try {
    // 执行表单验证
    const { valid } = await form.value.validate()
    
    if (!valid) {
      return
    }
    
    // 检查ID是否存在
    if (!currentTodo.value.id) {
      return
    }
    
    // 处理截止日期和时间
    let dueDateTimeISO = null
    if (currentTodo.value.due_date) {
      // 拼接日期和时间
      const dueDateStr = currentTodo.value.due_date
      const dueTimeStr = currentTodo.value.due_time || '23:59'
      
      // 创建日期对象并转为ISO格式
      const dueDateTime = new Date(`${dueDateStr}T${dueTimeStr}`)
      dueDateTimeISO = dueDateTime.toISOString()
    }
    
    const updates = {
      title: currentTodo.value.title,
      description: currentTodo.value.description,
      status: currentTodo.value.status,
      priority: currentTodo.value.priority,
      due_date: dueDateTimeISO
    }
    
    await todoStore.updateTodo(currentTodo.value.id, updates)
    dialog.value = false
    
    // 刷新列表以获取最新数据
    applyFilters()
  } catch (error) {
    console.error('更新待办事项失败:', error.message)
  }
}

async function deleteTodo() {
  try {
    // 如果设置为不需要确认，直接删除
    if (!todoSettings.confirmDelete) {
      deleteDialog.value = false
    }
    
    await todoStore.deleteTodo(currentTodo.value.id)
    
    // 如果设置为需要确认，此时关闭确认对话框
    if (todoSettings.confirmDelete) {
      deleteDialog.value = false
    }
    
    showNotification('待办事项已删除', 'success')
  } catch (error) {
    console.error('删除待办事项失败:', error)
    showNotification('删除失败: ' + error.message, 'error')
  }
}

async function toggleTodoStatus(todo) {
  try {
    // 如果正在更新，不允许再次点击
    if (todo.isUpdating) return
    
    // 存储原始状态，用于在失败时恢复
    const originalStatus = todo.status
    
    // 计算目标状态
    const targetStatus = originalStatus === 'done' ? 'pending' : 'done'
    
    // 设置加载状态
    todo.isUpdating = true
    
    try {
      // 先调用API
      await todoStore.toggleTodoStatus(todo.id)
      
      // API调用成功后，更新本地状态
      todo.status = targetStatus
      
      // 稍微延迟刷新列表，让动画效果完成
      setTimeout(() => {
        applyFilters()
      }, 300)
    } catch (error) {
      console.error('更新待办事项状态失败:', error)
      // 显示错误信息给用户，使用snackbar通知
      if (error.response && error.response.data && error.response.data.message) {
        showNotification(error.response.data.message, 'warning')
      } else {
        showNotification('更新状态失败，请稍后重试', 'error')
      }
    } finally {
      // 无论成功还是失败，都清除加载状态
      todo.isUpdating = false
    }
  } catch (error) {
    console.error('状态切换过程发生错误:', error)
    // 确保清除加载状态
    if (todo) todo.isUpdating = false
  }
}

// 将待办事项标记为已完成
async function completeTodo(todo) {
  try {
    // 如果正在更新，不允许再次点击
    if (todo.isUpdating) return
    
    // 设置加载状态
    todo.isUpdating = true
    
    try {
      // 先调用API
      await todoStore.completeTodo(todo.id)
      
      // API调用成功后，更新本地状态
      todo.status = 'done'
      
      // 稍微延迟刷新列表，让动画效果完成
      setTimeout(() => {
        applyFilters()
      }, 300)
    } catch (error) {
      console.error('标记待办事项为已完成失败:', error)
      // 显示错误信息给用户，使用snackbar通知
      if (error.response && error.response.data && error.response.data.message) {
        showNotification(error.response.data.message, 'warning')
      } else {
        showNotification('标记为已完成失败，请稍后重试', 'error')
      }
    } finally {
      // 无论成功还是失败，都清除加载状态
      todo.isUpdating = false
    }
  } catch (error) {
    console.error('标记待办事项为已完成失败:', error)
    // 确保清除加载状态
    if (todo) todo.isUpdating = false
  }
}

// 将待办事项标记为正在处理
async function setProcessingTodo(todo) {
  try {
    // 如果正在更新，不允许再次点击
    if (todo.isUpdating) return
    
    // 设置加载状态
    todo.isUpdating = true
    
    try {
      // 检查是否已有正在处理的待办
      const existingProcessingTodo = todoStore.getAllTodos.find(t => t.status === 'processing' && t.id !== todo.id)
      
      if (existingProcessingTodo) {
        // 先将已有的正在处理待办重置为pending状态
        existingProcessingTodo.isUpdating = true
        await todoStore.updateTodo(existingProcessingTodo.id, { status: 'pending' })
        existingProcessingTodo.status = 'pending'
        existingProcessingTodo.isUpdating = false
      }
      
      // 再将当前待办设置为processing状态
      await todoStore.updateTodo(todo.id, { status: 'processing' })
      
      // API调用成功后，更新本地状态
      todo.status = 'processing'
      
      // 显示通知
      showNotification('已将任务标记为正在处理', 'warning')
      
      // 稍微延迟刷新列表，让动画效果完成
      setTimeout(() => {
        applyFilters()
      }, 300)
    } catch (error) {
      console.error('标记待办事项为正在处理失败:', error)
      showNotification('标记为正在处理失败，请稍后重试', 'error')
    } finally {
      // 无论成功还是失败，都清除加载状态
      todo.isUpdating = false
    }
  } catch (error) {
    console.error('标记待办事项为正在处理失败:', error)
    // 确保清除加载状态
    if (todo) todo.isUpdating = false
  }
}

// 重新打开已完成的待办事项
async function reopenTodo(todo) {
  try {
    // 如果正在更新，不允许再次点击
    if (todo.isUpdating) return
    
    // 设置加载状态
    todo.isUpdating = true
    
    try {
      if (todo.status === 'processing') {
        // 处理"正在处理"到"待办"的转换
        await todoStore.updateTodo(todo.id, { status: 'pending' })
        showNotification('已取消正在处理状态', 'info')
      } else {
        // 处理"已完成"到"待办"的转换
        await todoStore.reopenTodo(todo.id)
      }
      
      // API调用成功后，更新本地状态
      todo.status = 'pending'
      
      // 稍微延迟刷新列表，让动画效果完成
      setTimeout(() => {
        applyFilters()
      }, 300)
    } catch (error) {
      console.error('重新打开待办事项失败:', error)
      // 显示错误信息给用户，使用snackbar通知
      if (error.response && error.response.data && error.response.data.message) {
        showNotification(error.response.data.message, 'warning')
      } else {
        showNotification('重新打开任务失败，请稍后重试', 'error')
      }
    } finally {
      // 无论成功还是失败，都清除加载状态
      todo.isUpdating = false
    }
  } catch (error) {
    console.error('重新打开待办事项失败:', error)
    // 确保清除加载状态
    if (todo) todo.isUpdating = false
  }
}

// 归档待办事项
async function archiveTodo(todo) {
  try {
    // 如果正在更新，不允许再次点击
    if (todo.isUpdating) return
    
    // 设置加载状态
    todo.isUpdating = true
    
    try {
      // 先调用API
      await todoStore.archiveTodo(todo.id)
      
      // API调用成功后，更新本地状态
      todo.status = 'archived'
      
      // 稍微延迟刷新列表，让动画效果完成
      setTimeout(() => {
        applyFilters()
      }, 300)
    } catch (error) {
      console.error('归档待办事项失败:', error)
      // 显示错误信息给用户，使用snackbar通知
      if (error.response && error.response.data && error.response.data.message) {
        showNotification(error.response.data.message, 'warning')
      } else {
        showNotification('归档任务失败，请稍后重试', 'error')
      }
    } finally {
      // 无论成功还是失败，都清除加载状态
      todo.isUpdating = false
    }
  } catch (error) {
    console.error('归档待办事项失败:', error)
    // 确保清除加载状态
    if (todo) todo.isUpdating = false
  }
}

// 子待办相关方法

// 切换子待办的显示/隐藏状态
function toggleSubTodosVisibility(todo) {
  // 切换显示状态
  todo.showSubTodos = !todo.showSubTodos
  
  // 如果是首次显示且没有子待办数据，尝试从服务器获取
  if (todo.showSubTodos && (!todo.sub_todos || todo.sub_todos.length === 0)) {
    fetchSubTodos(todo.id)
  }
}

// 获取指定待办的子待办列表
async function fetchSubTodos(parentId) {
  try {
    // 找到父待办
    const parentTodo = todoStore.getAllTodos.find(todo => todo.id === parentId)
    if (!parentTodo) return
    
    // 设置加载状态
    parentTodo.isLoadingSubTodos = true
    
    // 调用API获取子待办
    const subTodos = await todoStore.fetchSubTodos(parentId)
    
    // 更新父待办的子待办列表
    parentTodo.sub_todos = subTodos || []
    
    // 清除加载状态
    parentTodo.isLoadingSubTodos = false
  } catch (error) {
    console.error('获取子待办失败:', error)
    showNotification('获取子任务失败，请重试', 'error')
  }
}

// 打开添加子待办对话框
function openAddSubTodoDialog(todo) {
  currentParentTodo.value = todo
  isEditingSubTodo.value = false
  currentSubTodo.value = {
    title: '',
    description: '',
    status: 'pending',
    priority: 2,
    parent_id: todo.id
  }
  subTodoDialog.value = true
}

// 打开编辑子待办对话框
function openEditSubTodoDialog(parentId, subTodo) {
  const parentTodo = todoStore.getAllTodos.find(todo => todo.id === parentId)
  if (!parentTodo) return
  
  currentParentTodo.value = parentTodo
  isEditingSubTodo.value = true
  currentSubTodo.value = { ...subTodo, parent_id: parentId }
  subTodoDialog.value = true
}

// 打开删除子待办确认对话框
function openDeleteSubTodoDialog(parentId, subTodo) {
  const parentTodo = todoStore.getAllTodos.find(todo => todo.id === parentId)
  if (!parentTodo) return
  
  currentParentTodo.value = parentTodo
  currentSubTodo.value = { ...subTodo, parent_id: parentId }
  deleteSubTodoDialog.value = true
}

// 添加子待办（从对话框）
async function addSubTodoFromDialog() {
  if (!currentParentTodo.value || !currentSubTodo.value.title) return
  
  try {
    // 设置父待办的子待办加载状态
    currentParentTodo.value.isAddingSubTodo = true
    
    // 调用API添加子待办
    const newSubTodo = await todoStore.addSubTodo(
      currentParentTodo.value.id,
      currentSubTodo.value.title,
      currentSubTodo.value.description,
      {
        priority: currentSubTodo.value.priority
      }
    )
    
    // 更新父待办的子待办列表
    if (newSubTodo) {
      if (!currentParentTodo.value.sub_todos) {
        currentParentTodo.value.sub_todos = []
      }
      currentParentTodo.value.sub_todos.push(newSubTodo)
      
      // 确保子待办列表是可见的
      currentParentTodo.value.showSubTodos = true
    }
    
    // 关闭对话框
    subTodoDialog.value = false
    
    // 显示成功提示
    showNotification('子任务添加成功', 'success')
  } catch (error) {
    console.error('添加子待办失败:', error)
    showNotification('添加子任务失败，请重试', 'error')
  } finally {
    // 清除加载状态
    if (currentParentTodo.value) {
      currentParentTodo.value.isAddingSubTodo = false
    }
  }
}

// 从输入框快速添加子待办
async function addSubTodo(parentTodo) {
  if (!parentTodo || !parentTodo.newSubTodoTitle || parentTodo.newSubTodoTitle.trim() === '') return
  
  try {
    // 设置加载状态
    parentTodo.isAddingSubTodo = true
    
    // 调用API添加子待办
    const newSubTodo = await todoStore.addSubTodo(
      parentTodo.id,
      parentTodo.newSubTodoTitle,
      '', // 无描述
      {
        priority: 2 // 默认中等优先级
      }
    )
    
    // 更新父待办的子待办列表
    if (newSubTodo) {
      if (!parentTodo.sub_todos) {
        parentTodo.sub_todos = []
      }
      parentTodo.sub_todos.push(newSubTodo)
    }
    
    // 清空输入框
    parentTodo.newSubTodoTitle = ''
    
    // 显示成功提示
    showNotification('子任务添加成功', 'success')
  } catch (error) {
    console.error('添加子待办失败:', error)
    showNotification('添加子任务失败，请重试', 'error')
  } finally {
    // 清除加载状态
    parentTodo.isAddingSubTodo = false
  }
}

// 处理子待办表单提交
async function handleSubTodoFormSubmit() {
  if (!subTodoForm.value) return
  
  try {
    // 手动触发表单验证
    const { valid } = await subTodoForm.value.validate()
    
    if (!valid) return
    
    // 根据编辑状态调用相应函数
    if (isEditingSubTodo.value) {
      await updateSubTodo()
    } else {
      await addSubTodoFromDialog()
    }
  } catch (error) {
    console.error('子待办表单提交失败:', error)
  }
}

// 更新子待办
async function updateSubTodo() {
  if (!currentParentTodo.value || !currentSubTodo.value.id) return
  
  try {
    // 调用API更新子待办
    const updatedSubTodo = await todoStore.updateSubTodo(
      currentParentTodo.value.id,
      currentSubTodo.value.id,
      {
        title: currentSubTodo.value.title,
        description: currentSubTodo.value.description,
        status: currentSubTodo.value.status,
        priority: currentSubTodo.value.priority
      }
    )
    
    // 更新父待办的子待办列表
    if (updatedSubTodo && currentParentTodo.value.sub_todos) {
      const index = currentParentTodo.value.sub_todos.findIndex(st => st.id === currentSubTodo.value.id)
      if (index !== -1) {
        currentParentTodo.value.sub_todos[index] = updatedSubTodo
      }
    }
    
    // 关闭对话框
    subTodoDialog.value = false
    
    // 显示成功提示
    showNotification('子任务更新成功', 'success')
  } catch (error) {
    console.error('更新子待办失败:', error)
    showNotification('更新子任务失败，请重试', 'error')
  }
}

// 删除子待办
async function deleteSubTodo() {
  if (!currentParentTodo.value || !currentSubTodo.value.id) return
  
  try {
    // 调用API删除子待办
    await todoStore.deleteSubTodo(currentParentTodo.value.id, currentSubTodo.value.id)
    
    // 从父待办的子待办列表中移除
    if (currentParentTodo.value.sub_todos) {
      currentParentTodo.value.sub_todos = currentParentTodo.value.sub_todos.filter(
        st => st.id !== currentSubTodo.value.id
      )
    }
    
    // 关闭对话框
    deleteSubTodoDialog.value = false
    
    // 显示成功提示
    showNotification('子任务已删除', 'success')
  } catch (error) {
    console.error('删除子待办失败:', error)
    showNotification('删除子任务失败，请重试', 'error')
  }
}

// 切换子待办状态
async function toggleSubTodoStatus(parentId, subTodo) {
  const parentTodo = todoStore.getAllTodos.find(todo => todo.id === parentId)
  if (!parentTodo || !subTodo) return
  
  // 如果正在更新，不允许再次点击
  if (subTodo.isUpdating) return
  
  // 设置加载状态
  subTodo.isUpdating = true
  
  try {
    // 计算目标状态
    const targetStatus = subTodo.status === 'done' ? 'pending' : 'done'
    
    // 调用相应的API
    let updatedSubTodo
    if (targetStatus === 'done') {
      updatedSubTodo = await todoStore.completeSubTodo(parentId, subTodo.id)
    } else {
      updatedSubTodo = await todoStore.reopenSubTodo(parentId, subTodo.id)
    }
    
    // 更新本地状态
    if (updatedSubTodo) {
      const index = parentTodo.sub_todos.findIndex(st => st.id === subTodo.id)
      if (index !== -1) {
        parentTodo.sub_todos[index] = { ...updatedSubTodo, isUpdating: false }
      }
    }
  } catch (error) {
    console.error('更新子待办状态失败:', error)
    showNotification('更新子任务状态失败，请重试', 'error')
  } finally {
    // 清除加载状态
    subTodo.isUpdating = false
  }
}

// 将子待办标记为已完成
async function completeSubTodo(parentId, subTodo) {
  const parentTodo = todoStore.getAllTodos.find(todo => todo.id === parentId)
  if (!parentTodo || !subTodo) return
  
  // 如果正在更新，不允许再次点击
  if (subTodo.isUpdating) return
  
  // 设置加载状态
  subTodo.isUpdating = true
  
  try {
    // 调用API
    const updatedSubTodo = await todoStore.completeSubTodo(parentId, subTodo.id)
    
    // 更新本地状态
    if (updatedSubTodo) {
      const index = parentTodo.sub_todos.findIndex(st => st.id === subTodo.id)
      if (index !== -1) {
        parentTodo.sub_todos[index] = { ...updatedSubTodo, isUpdating: false }
      }
    }
  } catch (error) {
    console.error('标记子待办为已完成失败:', error)
    showNotification('标记子任务为已完成失败，请重试', 'error')
  } finally {
    // 清除加载状态
    subTodo.isUpdating = false
  }
}

// 重新打开子待办
async function reopenSubTodo(parentId, subTodo) {
  const parentTodo = todoStore.getAllTodos.find(todo => todo.id === parentId)
  if (!parentTodo || !subTodo) return
  
  // 如果正在更新，不允许再次点击
  if (subTodo.isUpdating) return
  
  // 设置加载状态
  subTodo.isUpdating = true
  
  try {
    // 调用API
    const updatedSubTodo = await todoStore.reopenSubTodo(parentId, subTodo.id)
    
    // 更新本地状态
    if (updatedSubTodo) {
      const index = parentTodo.sub_todos.findIndex(st => st.id === subTodo.id)
      if (index !== -1) {
        parentTodo.sub_todos[index] = { ...updatedSubTodo, isUpdating: false }
      }
    }
  } catch (error) {
    console.error('重新打开子待办失败:', error)
    showNotification('重新打开子任务失败，请重试', 'error')
  } finally {
    // 清除加载状态
    subTodo.isUpdating = false
  }
}


</script>

<style scoped>
.completed-todo {
  opacity: 0.8;
  transition: all 0.5s ease;
  border-left: 4px solid var(--v-success-base, #4caf50);
  background-color: rgba(76, 175, 80, 0.05);
}

.archived-todo {
  opacity: 0.6;
  background-color: #f5f5f5;
  border-left: 4px solid var(--v-grey-base, #9e9e9e);
  transition: all 0.5s ease;
}

.todo-card {
  transition: all 0.2s ease;
  border-left: 4px solid var(--v-primary-base, #1976d2);
}

.todo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1) !important;
}

/* 排序动画效果 */
.todo-container {
  position: relative;
  min-height: 50px; /* 确保容器有最小高度 */
}

.todo-list-move,
.todo-list-enter-active,
.todo-list-leave-active {
  transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); /* 使用更流畅的缓动函数 */
}

.todo-list-enter-from,
.todo-list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* 确保离开和进入的项目不影响其他项目的布局 */
.todo-list-leave-active {
  position: absolute;
  width: 100%;
}

/* 任务状态变化时的过渡效果 */
.todo-card {
  transition: 
    all 0.4s ease,
    opacity 0.3s ease,
    background-color 0.4s ease, 
    border-left-color 0.4s ease,
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.todo-description {
  max-height: 80px;
  overflow-y: auto;
  color: #616161;
  padding-left: 4px;
  border-left: 2px solid #e0e0e0;
}

.text-warning {
  color: #fb8c00 !important;
}

.filter-select :deep(.v-field__append-inner) {
  color: var(--v-primary-base, #1976d2);
}

.sort-select :deep(.v-field__append-inner) {
  color: var(--v-primary-base, #1976d2);
}

.search-field :deep(.v-field__append-inner) {
  color: var(--v-primary-base, #1976d2);
}

.pagination {
  margin-bottom: 24px;
}

.menu-button {
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.todo-card:hover .menu-button {
  opacity: 1;
}

/* 子待办样式 */
.sub-todos-container {
  margin-top: 16px;
  border-radius: 8px;
  overflow: hidden;
}

.sub-todos-panel {
  background-color: transparent !important;
  box-shadow: none !important;
}

.sub-todo-list {
  border-radius: 12px;
}

.sub-todo-list .v-list-item {
  transition: all 0.2s ease;
  margin-bottom: 4px;
  background-color: rgba(255, 255, 255, 0.6);
}

.sub-todo-list .v-list-item:hover {
  background-color: rgba(255, 255, 255, 0.9);
  transform: translateX(2px);
}

.sub-todo-completed {
  opacity: 0.8;
  text-decoration: line-through;
  background-color: rgba(76, 175, 80, 0.05) !important;
}

.sub-todo-archived {
  opacity: 0.6;
  color: #9e9e9e;
  background-color: rgba(158, 158, 158, 0.05) !important;
}

.add-sub-todo-item {
  padding-top: 12px;
  padding-bottom: 4px;
  margin-top: 8px;
  border-top: 1px dashed rgba(33, 150, 243, 0.2);
  background-color: transparent !important;
}

.sub-todo-input :deep(.v-field__field) {
  border-radius: 8px !important;
}

.sub-todo-input :deep(.v-field--variant-outlined .v-field__outline) {
  opacity: 0.5;
}

.sub-todo-input :deep(.v-field--variant-outlined:hover .v-field__outline) {
  opacity: 0.8;
}

/* 正在处理的待办项样式 */
.processing-todo {
  border-left: 6px solid var(--v-warning-base, #FB8C00) !important;
  box-shadow: 0 6px 16px rgba(251, 140, 0, 0.25) !important;
  background-color: rgba(251, 140, 0, 0.05) !important;
  transform: translateY(-3px) !important;
  position: relative;
  z-index: 2;
}

.processing-todo::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px solid rgba(251, 140, 0, 0.3);
  border-radius: inherit;
  pointer-events: none;
  animation: pulse-border 2s infinite;
}

@keyframes pulse-border {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  70% {
    opacity: 0.7;
    transform: scale(1.03);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 当有正在处理的待办时，其他待办的颜色消退 */
.faded-todo {
  opacity: 0.55;
  filter: grayscale(40%);
  transition: opacity 0.3s, filter 0.3s;
  transform: scale(0.98);
}

.faded-todo:hover {
  opacity: 0.9;
  filter: grayscale(0%);
  transform: scale(1);
}

/* 添加脉冲动画效果 */
.animate-pulse {
  animation: icon-pulse 1.5s infinite;
}

@keyframes icon-pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}

/* 为"正在处理"标签添加特殊样式 */
.processing-chip {
  font-weight: bold !important;
  letter-spacing: 0.5px;
  border: 1px solid rgba(251, 140, 0, 0.5) !important;
}

/* 突出显示菜单中的重点操作 */
.focus-action {
  background-color: rgba(251, 140, 0, 0.08) !important;
  margin: 4px 0;
  border-radius: 6px;
}

.focus-action:hover {
  background-color: rgba(251, 140, 0, 0.15) !important;
}

/* 添加适配深色模式的样式 */
:deep(.v-theme--dark) .archived-todo {
  background-color: rgba(66, 66, 66, 0.8);
}

:deep(.v-theme--dark) .todo-description {
  border-left: 2px solid #424242;
}

:deep(.v-theme--dark) .sub-todos-panel {
  background-color: rgba(33, 150, 243, 0.05) !important;
  border-left-color: var(--v-info-lighten-1, #64b5f6) !important;
}

:deep(.v-theme--dark) .sub-todo-list .v-list-item {
  background-color: rgba(30, 30, 30, 0.6);
}

:deep(.v-theme--dark) .sub-todo-list .v-list-item:hover {
  background-color: rgba(30, 30, 30, 0.9);
}

:deep(.v-theme--dark) .sub-todo-completed {
  background-color: rgba(76, 175, 80, 0.1) !important;
}

:deep(.v-theme--dark) .sub-todo-archived {
  background-color: rgba(158, 158, 158, 0.1) !important;
}

:deep(.v-theme--dark) .add-sub-todo-item {
  border-top: 1px dashed rgba(33, 150, 243, 0.2);
}

:deep(.v-theme--dark) .sub-todo-input {
  background-color: rgba(30, 30, 30, 0.6) !important;
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
