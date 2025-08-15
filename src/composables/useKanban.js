// composables/useKanban.js - Kanban Board Composable
import { ref, computed } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { useToast } from './useToast'

export function useKanban() {
  const taskStore = useTaskStore()
  const { showSuccess, showError } = useToast()
  
  const draggedTask = ref(null)
  const isDragging = ref(false)

  const kanbanData = computed(() => {
    return taskStore.tasks.map(task => ({
      Id: task.TaskId,
      Title: task.TaskName,
      Status: task.Status,
      Summary: task.Description,
      Priority: task.Priority,
      Assignee: task.AssignedTo,
      Team: task.Team,
      DueDate: task.DueDate,
      Tags: task.Tags || [],
      Color: getPriorityColor(task.Priority)
    }))
  })

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return '#ff4444'
      case 'high':
        return '#ff8800'
      case 'medium':
        return '#ffaa00'
      case 'low':
        return '#00aa00'
      default:
        return '#666666'
    }
  }

  const onCardDrag = (args) => {
    draggedTask.value = args.data[0]
    isDragging.value = true
  }

  const onCardDrop = async (args) => {
    try {
      const task = args.data[0]
      const newStatus = args.dropData.Status || args.dropData.keyField
      
      if (task.Status !== newStatus) {
        await taskStore.moveTask(task.Id, newStatus)
        showSuccess(`Task "${task.Title}" moved to ${newStatus}`)
      }
    } catch (error) {
      showError(`Failed to move task: ${error.message}`)
    } finally {
      draggedTask.value = null
      isDragging.value = false
    }
  }

  const onCardClick = (args) => {
    const task = args.data
    taskStore.setCurrentTask(task)
    // Emit event or navigate to task details
  }

  const onCardDoubleClick = (args) => {
    const task = args.data
    // Open task editor
    console.log('Edit task:', task)
  }

  const getTasksByColumn = (status) => {
    return kanbanData.value.filter(task => task.Status === status)
  }

  const getColumnTaskCount = (status) => {
    return getTasksByColumn(status).length
  }

  const kanbanColumns = computed(() => {
    return taskStore.kanbanColumns.map(column => ({
      ...column,
      count: getColumnTaskCount(column.keyField)
    }))
  })

  return {
    kanbanData,
    kanbanColumns,
    draggedTask,
    isDragging,
    onCardDrag,
    onCardDrop,
    onCardClick,
    onCardDoubleClick,
    getTasksByColumn,
    getColumnTaskCount,
    getPriorityColor
  }
}