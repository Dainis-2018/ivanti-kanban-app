<!-- components/tasks/TaskKanban.vue - Main Kanban Board Component -->
<template>
  <div class="task-kanban">
    <div class="kanban-header">
      <div class="kanban-title">
        <h2>{{ t('kanban.title') }}</h2>
        <span class="task-count">{{ totalTasks }} {{ t('tasks.title').toLowerCase() }}</span>
      </div>
      
      <div class="kanban-actions">
        <ejs-button
          :content="t('tasks.create')"
          iconCss="e-icons e-plus"
          cssClass="add-task-btn primary"
          @click="openTaskEditor"
        />
        <ejs-button
          iconCss="e-icons e-refresh"
          cssClass="refresh-btn"
          @click="refreshTasks"
          :disabled="isLoading"
        />
      </div>
    </div>

    <div class="kanban-container">
      <ejs-kanban
        ref="kanbanObj"
        :dataSource="kanbanData"
        :columns="kanbanColumns"
        :keyField="'Status'"
        :cardSettings="cardSettings"
        :allowDragAndDrop="true"
        :allowKeyboard="true"
        @cardClick="onCardClick"
        @cardDoubleClick="onCardDoubleClick"
        @dragStart="onCardDrag"
        @dragStop="onCardDrop"
        cssClass="ivanti-kanban"
      >
        <!-- Custom Card Template -->
        <template #cardTemplate="{ data }">
          <div class="kanban-card" :class="getCardClass(data)">
            <div class="card-header">
              <div class="card-title" :title="data.Title">
                {{ data.Title }}
              </div>
              <div class="card-priority">
                <span 
                  class="priority-badge" 
                  :class="getPriorityClass(data.Priority)"
                  :title="data.Priority"
                >
                  {{ getPriorityIcon(data.Priority) }}
                </span>
              </div>
            </div>
            
            <div class="card-body">
              <div v-if="data.Summary" class="card-summary">
                {{ truncateText(data.Summary, 80) }}
              </div>
              
              <div class="card-meta">
                <div v-if="data.Assignee" class="card-assignee">
                  <span class="assignee-avatar">
                    {{ getInitials(data.AssigneeName) }}
                  </span>
                  <span class="assignee-name">{{ data.AssigneeName }}</span>
                </div>
                
                <div v-if="data.DueDate" class="card-due-date" :class="getDueDateClass(data.DueDate)">
                  <i class="e-icons e-schedule"></i>
                  {{ formatDate(data.DueDate) }}
                </div>
              </div>
              
              <div v-if="data.Tags && data.Tags.length" class="card-tags">
                <span 
                  v-for="tag in data.Tags.slice(0, 2)" 
                  :key="tag"
                  class="tag"
                >
                  {{ tag }}
                </span>
                <span v-if="data.Tags.length > 2" class="tag-more">
                  +{{ data.Tags.length - 2 }}
                </span>
              </div>
            </div>
            
            <div class="card-footer">
              <div class="card-id">#{{ data.Id }}</div>
              <div class="card-actions">
                <button 
                  class="card-action-btn"
                  @click.stop="editTask(data)"
                  :title="t('tasks.edit')"
                >
                  <i class="e-icons e-edit"></i>
                </button>
                <button 
                  class="card-action-btn"
                  @click.stop="deleteTask(data)"
                  :title="t('tasks.delete')"
                >
                  <i class="e-icons e-delete"></i>
                </button>
              </div>
            </div>
          </div>
        </template>

        <!-- Custom Column Header Template -->
        <template #columnTemplate="{ data }">
          <div class="column-header">
            <div class="column-title">
              {{ data.headerText }}
            </div>
            <div class="column-count">
              {{ getColumnTaskCount(data.keyField) }}
            </div>
          </div>
        </template>
      </ejs-kanban>
    </div>

    <!-- Task Editor Dialog -->
    <TaskEditor
      v-if="showTaskEditor"
      :task="selectedTask"
      :isNew="isNewTask"
      @save="saveTask"
      @cancel="closeTaskEditor"
    />

    <!-- Confirm Delete Dialog -->
    <ejs-dialog
      ref="deleteDialog"
      :header="t('tasks.delete')"
      :content="deleteDialogContent"
      :showCloseIcon="true"
      :isModal="true"
      :visible="showDeleteDialog"
      :buttons="deleteDialogButtons"
      width="400px"
      @overlayClick="closeDeleteDialog"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { useKanban } from '@/composables/useKanban'
import { useLocalization } from '@/composables/useLocalization'
import { useToast } from '@/composables/useToast'
import TaskEditor from './TaskEditor.vue'

export default {
  name: 'TaskKanban',
  components: {
    TaskEditor
  },
  props: {
    projectId: {
      type: String,
      default: null
    },
    milestoneId: {
      type: String,
      default: null
    }
  },
  setup(props) {
    const taskStore = useTaskStore()
    const { t } = useLocalization()
    const { showSuccess, showError, showWarning } = useToast()
    const {
      kanbanData,
      kanbanColumns,
      onCardDrag,
      onCardDrop,
      onCardClick,
      onCardDoubleClick,
      getColumnTaskCount
    } = useKanban()

    const kanbanObj = ref(null)
    const selectedTask = ref(null)
    const showTaskEditor = ref(false)
    const isNewTask = ref(false)
    const showDeleteDialog = ref(false)
    const taskToDelete = ref(null)

    const isLoading = computed(() => taskStore.isLoading)
    const totalTasks = computed(() => kanbanData.value.length)

    const cardSettings = {
      contentField: 'Summary',
      headerField: 'Title',
      template: '#cardTemplate'
    }

    const deleteDialogContent = computed(() => {
      return taskToDelete.value 
        ? `${t('messages.deleteConfirm')} "${taskToDelete.value.Title}"?`
        : ''
    })

    const deleteDialogButtons = [
      {
        click: confirmDelete,
        buttonModel: { content: t('actions.delete'), cssClass: 'e-danger', isPrimary: true }
      },
      {
        click: closeDeleteDialog,
        buttonModel: { content: t('actions.cancel') }
      }
    ]

    const loadTasks = async () => {
      try {
        if (props.milestoneId) {
          await taskStore.fetchTasksByMilestone(props.milestoneId)
        } else if (props.projectId) {
          await taskStore.fetchTasksByProject(props.projectId)
        }
      } catch (error) {
        showError(`Failed to load tasks: ${error.message}`)
      }
    }

    const refreshTasks = async () => {
      await loadTasks()
      showSuccess('Tasks refreshed')
    }

    const openTaskEditor = (task = null) => {
      selectedTask.value = task
      isNewTask.value = !task
      showTaskEditor.value = true
    }

    const closeTaskEditor = () => {
      selectedTask.value = null
      showTaskEditor.value = false
      isNewTask.value = false
    }

    const editTask = (task) => {
      openTaskEditor(task)
    }

    const deleteTask = (task) => {
      taskToDelete.value = task
      showDeleteDialog.value = true
    }

    const confirmDelete = async () => {
      if (taskToDelete.value) {
        try {
          await taskStore.deleteTask(taskToDelete.value.Id)
          showSuccess(`Task "${taskToDelete.value.Title}" deleted`)
        } catch (error) {
          showError(`Failed to delete task: ${error.message}`)
        }
      }
      closeDeleteDialog()
    }

    const closeDeleteDialog = () => {
      showDeleteDialog.value = false
      taskToDelete.value = null
    }

    const saveTask = async (taskData) => {
      try {
        if (isNewTask.value) {
          // Add project/milestone context
          const newTaskData = {
            ...taskData,
            ProjectId: props.projectId,
            PhaseId: props.milestoneId,
            Status: 'Open'
          }
          await taskStore.createTask(newTaskData)
          showSuccess('Task created successfully')
        } else {
          await taskStore.updateTaskData(selectedTask.value.Id, taskData)
          showSuccess('Task updated successfully')
        }
        closeTaskEditor()
      } catch (error) {
        showError(`Failed to save task: ${error.message}`)
      }
    }

    // Utility functions
    const getCardClass = (task) => {
      const classes = ['task-card']
      if (task.Priority === 'Critical') classes.push('critical')
      if (task.Priority === 'High') classes.push('high')
      if (isOverdue(task.DueDate)) classes.push('overdue')
      return classes.join(' ')
    }

    const getPriorityClass = (priority) => {
      switch (priority?.toLowerCase()) {
        case 'critical': return 'priority-critical'
        case 'high': return 'priority-high'
        case 'medium': return 'priority-medium'
        case 'low': return 'priority-low'
        default: return 'priority-none'
      }
    }

    const getPriorityIcon = (priority) => {
      switch (priority?.toLowerCase()) {
        case 'critical': return '🔴'
        case 'high': return '🟠'
        case 'medium': return '🟡'
        case 'low': return '🟢'
        default: return '⚪'
      }
    }

    const getDueDateClass = (dueDate) => {
      if (!dueDate) return ''
      const today = new Date()
      const due = new Date(dueDate)
      const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return 'overdue'
      if (diffDays <= 1) return 'due-soon'
      if (diffDays <= 3) return 'due-warning'
      return ''
    }

    const isOverdue = (dueDate) => {
      if (!dueDate) return false
      return new Date(dueDate) < new Date()
    }

    const getInitials = (name) => {
      if (!name) return '?'
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    const truncateText = (text, maxLength) => {
      if (!text || text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    }

    const formatDate = (date) => {
      if (!date) return ''
      const d = new Date(date)
      return d.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }

    // Watch for prop changes
    watch([() => props.projectId, () => props.milestoneId], () => {
      loadTasks()
    })

    onMounted(() => {
      loadTasks()
    })

    return {
      kanbanObj,
      kanbanData,
      kanbanColumns,
      cardSettings,
      isLoading,
      totalTasks,
      selectedTask,
      showTaskEditor,
      isNewTask,
      showDeleteDialog,
      deleteDialogContent,
      deleteDialogButtons,
      t,
      loadTasks,
      refreshTasks,
      openTaskEditor,
      closeTaskEditor,
      editTask,
      deleteTask,
      confirmDelete,
      closeDeleteDialog,
      saveTask,
      onCardDrag,
      onCardDrop,
      onCardClick,
      onCardDoubleClick,
      getColumnTaskCount,
      getCardClass,
      getPriorityClass,
      getPriorityIcon,
      getDueDateClass,
      getInitials,
      truncateText,
      formatDate
    }
  }
}
</script>

<style scoped>
.task-kanban {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.kanban-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.kanban-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.kanban-title h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.task-count {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.kanban-actions {
  display: flex;
  gap: 8px;
}

.add-task-btn {
  background-color: #0078d4;
  color: white;
}

.kanban-container {
  flex: 1;
  padding: 16px;
  overflow: hidden;
}

.ivanti-kanban {
  height: 100%;
  background: transparent;
}

/* Custom Card Styles */
.kanban-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 12px;
  margin: 8px 0;
  border-left: 4px solid #ddd;
  transition: all 0.2s ease;
  cursor: pointer;
}

.kanban-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.kanban-card.critical {
  border-left-color: #d32f2f;
}

.kanban-card.high {
  border-left-color: #f57c00;
}

.kanban-card.overdue {
  background: #ffebee;
  border-left-color: #d32f2f;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.card-title {
  font-weight: 600;
  color: #333;
  font-size: 14px;
  line-height: 1.3;
  flex: 1;
  margin-right: 8px;
}

.card-priority {
  flex-shrink: 0;
}

.priority-badge {
  font-size: 12px;
  line-height: 1;
}

.card-body {
  margin-bottom: 8px;
}

.card-summary {
  color: #666;
  font-size: 12px;
  line-height: 1.4;
  margin-bottom: 8px;
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-assignee {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.assignee-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #0078d4;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
}

.assignee-name {
  color: #666;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-due-date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #666;
}

.card-due-date.overdue {
  color: #d32f2f;
  font-weight: 600;
}

.card-due-date.due-soon {
  color: #f57c00;
  font-weight: 600;
}

.card-due-date.due-warning {
  color: #ff9800;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
}

.tag {
  background: #e3f2fd;
  color: #1976d2;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.tag-more {
  background: #f5f5f5;
  color: #666;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.card-id {
  font-size: 11px;
  color: #999;
  font-weight: 500;
}

.card-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.kanban-card:hover .card-actions {
  opacity: 1;
}

.card-action-btn {
  background: none;
  border: none;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
  font-size: 12px;
  transition: all 0.2s ease;
}

.card-action-btn:hover {
  background: #f0f0f0;
  color: #333;
}

/* Custom Column Header */
.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 8px;
}

.column-title {
  font-weight: 600;
  color: #333;
}

.column-count {
  background: #0078d4;
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}

/* Responsive Design */
@media (max-width: 768px) {
  .kanban-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .kanban-title {
    justify-content: center;
  }

  .kanban-actions {
    justify-content: center;
  }

  .kanban-container {
    padding: 8px;
  }

  .card-meta {
    flex-direction: column;
  }
}

/* Syncfusion Kanban Customizations */
:deep(.e-kanban .e-kanban-content) {
  background: transparent;
}

:deep(.e-kanban .e-card) {
  background: transparent;
  box-shadow: none;
  border: none;
  margin: 0;
  padding: 0;
}

:deep(.e-kanban .e-card-content) {
  padding: 0;
}

:deep(.e-kanban .e-swimlane-header) {
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

:deep(.e-kanban .e-column-header) {
  background: white;
  border-bottom: 2px solid #0078d4;
  padding: 12px;
}
</style>