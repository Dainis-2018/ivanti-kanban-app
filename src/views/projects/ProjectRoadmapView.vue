<template>
  <div class="project-roadmap-view">
    <!-- PROJECT ROADMAP VIEW -->
    <div class="view-toolbar">
      <div class="toolbar-left">
        <h2 class="view-title">{{ t('projects.roadmap') }}</h2>
        <span class="project-count">
          {{ filteredProjects.length }} {{ t('projects.title').toLowerCase() }}
        </span>
      </div>
      <div class="toolbar-center">
        <!-- Roadmap View Mode Toggle -->
        <div class="view-mode-toggle">
          <button 
            class="btn btn--toggle" 
            :class="{ active: viewMode === 'projects' }"
            @click="setViewMode('projects')"
          >
            {{ t('roadmap.projectsOnly') }}
          </button>
          <button 
            class="btn btn--toggle" 
            :class="{ active: viewMode === 'hierarchy' }"
            @click="setViewMode('hierarchy')"
          >
            {{ t('roadmap.fullHierarchy') }}
          </button>
        </div>
      </div>
      <div class="toolbar-actions">
        <button 
          class="btn btn--outlined refresh-btn" 
          @click="refreshData" 
          :disabled="isLoading"
          :title="t('actions.refresh')"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
          </svg>
        </button>
        <button 
          class="btn btn--outlined export-btn" 
          @click="exportGantt"
          :title="t('actions.export')"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
          <span>{{ t('actions.export') }}</span>
        </button>
        <button 
          class="btn btn--raised create-btn" 
          @click="createProject" 
          :title="t('actions.createProject')"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
          </svg>
          <span>{{ t('projects.create') }}</span>
        </button>
      </div>
    </div>

    <div class="view-content">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p class="loading-text">{{ t('app.loading') }}</p>
      </div>

      <!-- Gantt Chart -->
      <div v-else-if="ganttData.length > 0" class="gantt-container">
        <ejs-gantt
          ref="ganttChart"
          :dataSource="ganttData"
          :taskFields="taskFields"
          :treeColumnIndex="1"
          :columns="ganttColumns"
          :splitterSettings="splitterSettings"
          :projectStartDate="projectStartDate"
          :projectEndDate="projectEndDate"
          :timelineSettings="timelineSettings"
          :gridLines="'Both'"
          :height="'100%'"
          :allowSelection="true"
          :allowSorting="true"
          :allowReordering="true"
          :allowResizing="true"
          :showColumnMenu="true"
          :allowFiltering="true"
          :allowExcelExport="true"
          :allowPdfExport="true"
          :editSettings="editSettings"
          :toolbar="toolbarOptions"
          :labelSettings="labelSettings"
          :rowHeight="40"
          @actionBegin="onActionBegin"
          @actionComplete="onActionComplete"
          @taskbarEditing="onTaskbarEditing"
          @toolbarClick="onToolbarClick"
        >
        </ejs-gantt>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <svg class="empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3,3H21V5H3V3M3,7H15V9H3V7M3,11H21V13H3V11M3,15H15V17H3V15M3,19H21V21H3V19Z"/>
        </svg>
        <h3 class="empty-title">{{ t('roadmap.noData') }}</h3>
        <p class="empty-description">{{ t('roadmap.createFirstProject') }}</p>
        <button class="btn btn--raised" @click="createProject">
          {{ t('projects.create') }}
        </button>
      </div>
    </div>

    <!-- Gantt Context Menu -->
    <div v-if="showContextMenu" class="gantt-context-menu" :style="contextMenuStyle">
      <button class="context-menu-item" @click="editTask">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/>
        </svg>
        {{ t('actions.edit') }}
      </button>
      <button class="context-menu-item" @click="deleteTask">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
        </svg>
        {{ t('actions.delete') }}
      </button>
      <button class="context-menu-item" @click="addSubTask">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
        </svg>
        {{ t('actions.addSubTask') }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/projectStore'
import { useMilestoneStore } from '@/stores/milestoneStore'
import { useTaskStore } from '@/stores/taskStore'
import { useLocalization } from '@/composables/useLocalization'
import { useToast } from '@/composables/useToast'

export default {
  name: 'ProjectRoadmapView',
  setup() {
    const router = useRouter()
    const projectStore = useProjectStore()
    const milestoneStore = useMilestoneStore()
    const taskStore = useTaskStore()
    const { t } = useLocalization()
    const { showToast } = useToast()

    const isLoading = ref(false)
    const viewMode = ref('projects') // 'projects' or 'hierarchy'
    const ganttChart = ref(null)
    const showContextMenu = ref(false)
    const contextMenuStyle = ref({})
    const selectedTask = ref(null)
    const searchQuery = ref('')
    const statusFilter = ref('')
    const ownerFilter = ref('')
    const priorityFilter = ref('')

    // Computed filtered projects
    const filteredProjects = computed(() => {
      let projects = [...projectStore.projects]
      
      // Apply search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        projects = projects.filter(project => 
          project.ProjectName?.toLowerCase().includes(query) ||
          project.Description?.toLowerCase().includes(query) ||
          project.Owner?.toLowerCase().includes(query)
        )
      }

      // Apply status filter
      if (statusFilter.value) {
        projects = projects.filter(project => project.Status === statusFilter.value)
      }

      // Apply owner filter
      if (ownerFilter.value) {
        projects = projects.filter(project => project.Owner === ownerFilter.value)
      }

      // Apply priority filter
      if (priorityFilter.value) {
        projects = projects.filter(project => project.Priority === priorityFilter.value)
      }

      return projects
    })

    // Gantt configuration
    const taskFields = computed(() => ({
      id: 'TaskID',
      name: 'TaskName',
      startDate: 'StartDate',
      endDate: 'EndDate',
      duration: 'Duration',
      progress: 'Progress',
      dependency: 'Predecessor',
      parentID: 'ParentID',
      notes: 'Notes'
    }))

    const ganttColumns = computed(() => [
      { field: 'TaskID', headerText: 'ID', width: '70' },
      { field: 'TaskName', headerText: t('common.name'), width: '250' },
      { field: 'StartDate', headerText: t('common.startDate'), width: '120' },
      { field: 'EndDate', headerText: t('common.endDate'), width: '120' },
      { field: 'Duration', headerText: t('common.duration'), width: '100' },
      { field: 'Progress', headerText: t('common.progress'), width: '100' }
    ])

    const splitterSettings = ref({
      position: '40%'
    })

    const timelineSettings = computed(() => ({
      timelineViewMode: 'Month',
      topTier: {
        unit: 'Month',
        format: 'MMM yyyy'
      },
      bottomTier: {
        unit: 'Week',
        format: 'dd'
      }
    }))

    const editSettings = ref({
      allowAdding: true,
      allowEditing: true,
      allowDeleting: true,
      allowTaskbarEditing: true,
      showDeleteConfirmDialog: true
    })

    const toolbarOptions = ref([
      'Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll',
      'Search', 'ZoomIn', 'ZoomOut', 'ZoomToFit', 'PrevTimeSpan', 'NextTimeSpan',
      'ExcelExport', 'PdfExport'
    ])

    const labelSettings = ref({
      leftLabel: 'TaskName',
      rightLabel: 'Progress'
    })

    // Computed properties
    const projectStartDate = computed(() => {
      if (filteredProjects.value.length === 0) return new Date()
      const dates = filteredProjects.value
        .map(p => p.StartDate)
        .filter(d => d)
        .map(d => new Date(d))
      return dates.length > 0 ? new Date(Math.min(...dates)) : new Date()
    })

    const projectEndDate = computed(() => {
      if (filteredProjects.value.length === 0) return new Date()
      const dates = filteredProjects.value
        .map(p => p.EndDate)
        .filter(d => d)
        .map(d => new Date(d))
      return dates.length > 0 ? new Date(Math.max(...dates)) : new Date()
    })

    // Transform data for Gantt chart
    const ganttData = computed(() => {
      if (viewMode.value === 'projects') {
        return transformProjectsData()
      } else {
        return transformHierarchyData()
      }
    })

    const transformProjectsData = () => {
      return filteredProjects.value.map((project, index) => ({
        TaskID: project.RecId,
        TaskName: project.ProjectName,
        StartDate: project.StartDate ? new Date(project.StartDate) : new Date(),
        EndDate: project.EndDate ? new Date(project.EndDate) : new Date(),
        Duration: calculateDuration(project.StartDate, project.EndDate),
        Progress: project.CompletionPercent || 0,
        Notes: project.Summary || '',
        ParentID: null,
        Priority: project.Priority,
        Status: project.Status,
        Owner: project.Owner
      }))
    }

    const transformHierarchyData = () => {
      const data = []
      let taskId = 1

      filteredProjects.value.forEach(project => {
        const projectId = taskId++
        
        // Add project
        data.push({
          TaskID: projectId,
          TaskName: project.ProjectName,
          StartDate: project.StartDate ? new Date(project.StartDate) : new Date(),
          EndDate: project.EndDate ? new Date(project.EndDate) : new Date(),
          Duration: calculateDuration(project.StartDate, project.EndDate),
          Progress: project.CompletionPercent || 0,
          Notes: project.Summary || '',
          ParentID: null,
          Priority: project.Priority,
          Status: project.Status,
          Owner: project.Owner,
          Type: 'Project'
        })

        // Add milestones
        if (project.milestones && project.milestones.length > 0) {
          project.milestones.forEach(milestone => {
            const milestoneId = taskId++
            
            data.push({
              TaskID: milestoneId,
              TaskName: milestone.PhaseName,
              StartDate: milestone.StartDate ? new Date(milestone.StartDate) : new Date(),
              EndDate: milestone.EndDate ? new Date(milestone.EndDate) : new Date(),
              Duration: calculateDuration(milestone.StartDate, milestone.EndDate),
              Progress: milestone.CompletionPercent || 0,
              Notes: milestone.Description || '',
              ParentID: projectId,
              Priority: milestone.Priority,
              Status: milestone.Status,
              Owner: milestone.Owner,
              Type: 'Milestone'
            })

            // Add tasks
            if (milestone.tasks && milestone.tasks.length > 0) {
              milestone.tasks.forEach(task => {
                data.push({
                  TaskID: taskId++,
                  TaskName: task.Subject,
                  StartDate: task.StartDate ? new Date(task.StartDate) : new Date(),
                  EndDate: task.EndDate ? new Date(task.EndDate) : new Date(),
                  Duration: calculateDuration(task.StartDate, task.EndDate),
                  Progress: task.CompletionPercent || 0,
                  Notes: task.Description || '',
                  ParentID: milestoneId,
                  Priority: task.Priority,
                  Status: task.Status,
                  Owner: task.AssignedTo,
                  Type: 'Task'
                })
              })
            }
          })
        }
      })

      return data
    }

    const calculateDuration = (startDate, endDate) => {
      if (!startDate || !endDate) return 1
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = Math.abs(end - start)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays || 1
    }

    // Methods
    const setViewMode = (mode) => {
      viewMode.value = mode
      // nextTick removed since import was removed
      setTimeout(() => {
        if (ganttChart.value) {
          ganttChart.value.refresh()
        }
      }, 0)
    }

    const refreshData = async () => {
      isLoading.value = true
      try {
        await Promise.all([
          projectStore.fetchProjects(),
          milestoneStore.fetchMilestones(),
          taskStore.fetchTasks()
        ])
        showToast(t('actions.refreshSuccess'), 'success')
      } catch (error) {
        console.error('Failed to refresh data:', error)
        showToast(t('actions.refreshError'), 'error')
      } finally {
        isLoading.value = false
      }
    }

    const createProject = () => {
      router.push('/projects/new')
    }

    const exportGantt = () => {
      if (ganttChart.value) {
        ganttChart.value.excelExport({
          fileName: 'project-roadmap.xlsx'
        })
      }
    }

    // Gantt event handlers
    const onActionBegin = (args) => {
      if (args.requestType === 'beforeDelete') {
        if (!confirm(t('common.confirmDelete'))) {
          args.cancel = true
        }
      }
    }

    const onActionComplete = (args) => {
      if (args.requestType === 'save') {
        showToast(t('actions.saveSuccess'), 'success')
      } else if (args.requestType === 'delete') {
        showToast(t('actions.deleteSuccess'), 'success')
      }
    }

    const onTaskbarEditing = (args) => {
      // Handle taskbar drag and drop
      console.log('Taskbar editing:', args)
    }

    const onToolbarClick = (args) => {
      if (args.item.id === 'gantt_excelexport') {
        exportGantt()
      } else if (args.item.id === 'gantt_pdfexport') {
        ganttChart.value.pdfExport({
          fileName: 'project-roadmap.pdf'
        })
      }
    }

    // Context menu handlers
    const editTask = () => {
      if (selectedTask.value) {
        // Navigate to edit page based on task type
        const task = selectedTask.value
        if (task.Type === 'Project') {
          router.push(`/projects/${task.TaskID}/edit`)
        } else if (task.Type === 'Milestone') {
          router.push(`/milestones/${task.TaskID}/edit`)
        } else {
          router.push(`/tasks/${task.TaskID}/edit`)
        }
      }
      hideContextMenu()
    }

    const deleteTask = async () => {
      if (selectedTask.value && confirm(t('common.confirmDelete'))) {
        try {
          const task = selectedTask.value
          if (task.Type === 'Project') {
            await projectStore.deleteProject(task.TaskID)
          } else if (task.Type === 'Milestone') {
            await milestoneStore.deleteMilestone(task.TaskID)
          } else {
            await taskStore.deleteTask(task.TaskID)
          }
          showToast(t('actions.deleteSuccess'), 'success')
        } catch (error) {
          showToast(t('actions.deleteError'), 'error')
        }
      }
      hideContextMenu()
    }

    const addSubTask = () => {
      if (selectedTask.value) {
        const task = selectedTask.value
        if (task.Type === 'Project') {
          router.push(`/projects/${task.TaskID}/milestones/new`)
        } else if (task.Type === 'Milestone') {
          router.push(`/milestones/${task.TaskID}/tasks/new`)
        }
      }
      hideContextMenu()
    }

    const showContextMenuAt = (event, task) => {
      selectedTask.value = task
      contextMenuStyle.value = {
        left: `${event.clientX}px`,
        top: `${event.clientY}px`
      }
      showContextMenu.value = true
    }

    const hideContextMenu = () => {
      showContextMenu.value = false
      selectedTask.value = null
    }

    // Lifecycle
    onMounted(async () => {
      if (projectStore.projects.length === 0) {
        await refreshData()
      }

      // Hide context menu on click outside
      document.addEventListener('click', hideContextMenu)
    })

    return {
      isLoading,
      viewMode,
      ganttChart,
      showContextMenu,
      contextMenuStyle,
      selectedTask,
      filteredProjects,
      ganttData,
      taskFields,
      ganttColumns,
      splitterSettings,
      projectStartDate,
      projectEndDate,
      timelineSettings,
      editSettings,
      toolbarOptions,
      labelSettings,
      setViewMode,
      refreshData,
      createProject,
      exportGantt,
      onActionBegin,
      onActionComplete,
      onTaskbarEditing,
      onToolbarClick,
      editTask,
      deleteTask,
      addSubTask,
      showContextMenuAt,
      hideContextMenu,
      t
    }
  }
}
</script>

<style scoped>
/* Uses global CSS variables and styles from main.css */
.project-roadmap-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--mdc-theme-background);
}

.view-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: var(--mdc-theme-surface);
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  box-shadow: var(--mdc-elevation-01);
  gap: 24px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.view-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--mdc-theme-text-primary-on-background);
}

.project-count {
  background: var(--mdc-theme-primary);
  color: var(--mdc-theme-on-primary);
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
}

.toolbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.view-mode-toggle {
  display: flex;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  padding: 4px;
  gap: 2px;
}

.btn--toggle {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  background: transparent;
  color: var(--mdc-theme-text-secondary-on-background);
  border: none;
  cursor: pointer;
}

.btn--toggle.active {
  background: var(--mdc-theme-primary);
  color: var(--mdc-theme-on-primary);
  box-shadow: var(--mdc-elevation-01);
}

.btn--toggle:hover:not(.active) {
  background: rgba(0, 0, 0, 0.04);
  color: var(--mdc-theme-text-primary-on-background);
}

.toolbar-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.view-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--mdc-theme-text-secondary-on-background);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: var(--mdc-theme-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  margin: 0;
  color: var(--mdc-theme-text-secondary-on-background);
}

/* Gantt Container */
.gantt-container {
  flex: 1;
  background: var(--mdc-theme-surface);
  border-radius: 8px;
  margin: 16px 24px;
  box-shadow: var(--mdc-elevation-01);
  overflow: hidden;
}

/* Syncfusion Gantt Customizations */
.gantt-container :deep(.e-gantt) {
  font-family: 'Roboto', sans-serif;
}

.gantt-container :deep(.e-gantt .e-header-cell-label) {
  font-weight: 600;
  color: var(--mdc-theme-text-primary-on-background);
}

.gantt-container :deep(.e-gantt .e-row) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.gantt-container :deep(.e-gantt .e-row:hover) {
  background: rgba(0, 0, 0, 0.04);
}

.gantt-container :deep(.e-gantt .e-taskbar-main) {
  border-radius: 4px;
}

.gantt-container :deep(.e-gantt .e-taskbar-main.e-project) {
  background: var(--mdc-theme-primary);
}

.gantt-container :deep(.e-gantt .e-taskbar-main.e-parent) {
  background: var(--mdc-theme-secondary);
}

.gantt-container :deep(.e-gantt .e-taskbar-main.e-child) {
  background: #4caf50;
}

.gantt-container :deep(.e-gantt .e-milestone-top),
.gantt-container :deep(.e-gantt .e-milestone-bottom) {
  border-color: var(--mdc-theme-primary);
}

.gantt-container :deep(.e-gantt .e-progress-bar) {
  background: rgba(255, 255, 255, 0.3);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  color: var(--mdc-theme-text-secondary-on-background);
  flex: 1;
}

.empty-icon {
  opacity: 0.5;
  margin-bottom: 24px;
}

.empty-title {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 500;
  color: var(--mdc-theme-text-primary-on-background);
}

.empty-description {
  margin: 0 0 24px 0;
  color: var(--mdc-theme-text-secondary-on-background);
}

/* Context Menu */
.gantt-context-menu {
  position: fixed;
  background: var(--mdc-theme-surface);
  border-radius: 8px;
  box-shadow: var(--mdc-elevation-04);
  padding: 8px 0;
  z-index: 1000;
  min-width: 150px;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  color: var(--mdc-theme-text-primary-on-background);
  transition: background-color 0.2s ease;
}

.context-menu-item:hover {
  background: rgba(0, 0, 0, 0.04);
}

.context-menu-item svg {
  opacity: 0.7;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .view-toolbar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .toolbar-left,
  .toolbar-center,
  .toolbar-actions {
    justify-content: center;
  }

  .view-mode-toggle {
    align-self: center;
  }
}

@media (max-width: 768px) {
  .gantt-container {
    margin: 8px 16px;
  }

  .view-toolbar {
    padding: 12px 16px;
  }

  .toolbar-actions {
    flex-wrap: wrap;
  }

  .btn span {
    display: none;
  }

  .btn svg {
    margin: 0;
  }
}

@media (max-width: 480px) {
  .gantt-container {
    margin: 8px;
    border-radius: 4px;
  }

  .view-title {
    font-size: 20px;
  }

  .project-count {
    font-size: 12px;
    padding: 2px 8px;
  }

  .btn--toggle {
    padding: 6px 12px;
    font-size: 12px;
  }
}

/* Print Styles */
@media print {
  .view-toolbar {
    display: none;
  }

  .gantt-container {
    margin: 0;
    box-shadow: none;
    border: 1px solid #ccc;
  }
}
</style>