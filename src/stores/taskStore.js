// stores/taskStore.js - Task Management Store
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ODataService } from '@/services/odataService'

export const useTaskStore = defineStore('tasks', () => {
  // State
  const tasks = ref([])
  const currentTask = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const kanbanColumns = ref([
    { keyField: 'Open', headerText: 'To Do' },
    { keyField: 'InProgress', headerText: 'In Progress' },
    { keyField: 'Testing', headerText: 'Testing' },
    { keyField: 'Done', headerText: 'Done' }
  ])

  // Getters
  const tasksByStatus = computed(() => {
    return (status) => tasks.value.filter(t => t.Status === status)
  })

  const tasksByProject = computed(() => {
    return (projectId) => tasks.value.filter(t => t.ProjectId === projectId)
  })

  const tasksByMilestone = computed(() => {
    return (milestoneId) => tasks.value.filter(t => t.PhaseId === milestoneId)
  })

  const tasksByAssignee = computed(() => {
    return (assigneeId) => tasks.value.filter(t => t.AssignedTo === assigneeId)
  })

  const highPriorityTasks = computed(() => {
    return tasks.value.filter(t => t.Priority === 'High' || t.Priority === 'Critical')
  })

  const overdueTasks = computed(() => {
    const today = new Date()
    return tasks.value.filter(t => {
      const dueDate = new Date(t.DueDate)
      return dueDate < today && t.Status !== 'Done'
    })
  })

  // Actions
  const setLoading = (loading) => {
    isLoading.value = loading
  }

  const setError = (err) => {
    error.value = err
  }

  const setTasks = (taskList) => {
    tasks.value = taskList
  }

  const setCurrentTask = (task) => {
    currentTask.value = task
  }

  const addTask = (task) => {
    tasks.value.push(task)
  }

  const updateTask = (updatedTask) => {
    const index = tasks.value.findIndex(t => t.TaskId === updatedTask.TaskId)
    if (index !== -1) {
      tasks.value[index] = { ...tasks.value[index], ...updatedTask }
    }
  }

  const removeTask = (taskId) => {
    const index = tasks.value.findIndex(t => t.TaskId === taskId)
    if (index !== -1) {
      tasks.value.splice(index, 1)
    }
  }

  const fetchTasksByProject = async (projectId) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await ODataService.getTasksByProject(projectId)
      const projectTasks = response.value || response
      
      // Update tasks array with project tasks
      const existingTaskIds = tasks.value.map(t => t.TaskId)
      const newTasks = projectTasks.filter(t => !existingTaskIds.includes(t.TaskId))
      tasks.value.push(...newTasks)
      
      return projectTasks
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const fetchTasksByMilestone = async (milestoneId) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await ODataService.getTasksByMilestone(milestoneId)
      const milestoneTasks = response.value || response
      
      // Update tasks array with milestone tasks
      const existingTaskIds = tasks.value.map(t => t.TaskId)
      const newTasks = milestoneTasks.filter(t => !existingTaskIds.includes(t.TaskId))
      tasks.value.push(...newTasks)
      
      return milestoneTasks
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (taskData) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await ODataService.create('task__assignments', taskData)
      const newTask = response.value || response
      addTask(newTask)
      return newTask
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateTaskData = async (taskId, updateData) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await ODataService.update('task__assignments', taskId, updateData)
      const updatedTask = response.value || response
      updateTask(updatedTask)
      
      if (currentTask.value && currentTask.value.TaskId === taskId) {
        setCurrentTask(updatedTask)
      }
      
      return updatedTask
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteTask = async (taskId) => {
    setLoading(true)
    setError(null)
    
    try {
      await ODataService.delete('task__assignments', taskId)
      removeTask(taskId)
      
      if (currentTask.value && currentTask.value.TaskId === taskId) {
        setCurrentTask(null)
      }
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const moveTask = async (taskId, newStatus) => {
    return await updateTaskData(taskId, { Status: newStatus })
  }

  const assignTask = async (taskId, assigneeId, teamId = null) => {
    const updateData = { AssignedTo: assigneeId }
    if (teamId) {
      updateData.Team = teamId
    }
    return await updateTaskData(taskId, updateData)
  }

  return {
    // State
    tasks,
    currentTask,
    isLoading,
    error,
    kanbanColumns,
    // Getters
    tasksByStatus,
    tasksByProject,
    tasksByMilestone,
    tasksByAssignee,
    highPriorityTasks,
    overdueTasks,
    // Actions
    setLoading,
    setError,
    setTasks,
    setCurrentTask,
    addTask,
    updateTask,
    removeTask,
    fetchTasksByProject,
    fetchTasksByMilestone,
    createTask,
    updateTaskData,
    deleteTask,
    moveTask,
    assignTask
  }
})