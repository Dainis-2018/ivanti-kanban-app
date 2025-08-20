<template>
  <div class="project-roadmap-view">
    <!-- VIEW TOOLBAR - Matches ProjectListView & ProjectCardView -->
    <div class="view-toolbar">
      <div class="toolbar-left">
        <h2 class="view-title">{{ getLabel('roadmap.title') }}</h2>
        <span class="project-count">
          {{ filteredProjects.length }} {{ getLabel('projects.title').toLowerCase() }}
        </span>
      </div>
      <div class="toolbar-actions">
        <!-- View Mode Toggle -->
        <div class="view-mode-toggle">
          <button 
            class="btn btn--toggle" 
            :class="{ 'btn--toggle-active': viewMode === 'projects' }"
            @click="switchViewMode('projects')"
            :title="getLabel('roadmap.projectsMilestones')"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,3H5C3.9,3 3,3.9 3,5V19C3.9,19 5,19.9 5,19H19C20.1,19 21,18.1 21,17V5C21,3.9 20.1,3 19,3M19,17H5V5H19V17Z"/>
            </svg>
            <span>{{ getLabel('roadmap.projects') }}</span>
          </button>
          <button 
            class="btn btn--toggle" 
            :class="{ 'btn--toggle-active': viewMode === 'full' }"
            @click="switchViewMode('full')"
            :title="getLabel('roadmap.fullHierarchy')"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3,3H9V7H3V3M15,10H21V14H15V10M15,17H21V21H15V17M13,13H7V18H13V13Z"/>
            </svg>
            <span>{{ getLabel('roadmap.full') }}</span>
          </button>
        </div>

        <!-- Timeline Controls -->
        <div class="timeline-controls">
          <button 
            class="btn btn--icon timeline-btn" 
            @click="zoomOut"
            :disabled="timelineZoom <= 0.5"
            :title="getLabel('actions.zoomOut')"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5,14L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5M9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14M7,9H12V10H7V9Z"/>
            </svg>
          </button>
          <button 
            class="btn btn--icon timeline-btn" 
            @click="zoomIn"
            :disabled="timelineZoom >= 3"
            :title="getLabel('actions.zoomIn')"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5,14L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5M9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14M7,9H12V10H7V9M9,7H10V12H9V7Z"/>
            </svg>
          </button>
          <span class="zoom-level">{{ Math.round(timelineZoom * 100) }}%</span>
        </div>

        <!-- Standard Action Buttons -->
        <button 
          class="btn btn--outlined refresh-btn" 
          @click="refreshData" 
          :disabled="isLoading"
          :title="getLabel('actions.refresh')"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
          </svg>
          <span>{{ getLabel('actions.refresh') }}</span>
        </button>
        <button 
          class="btn btn--raised create-btn" 
          @click="createProject" 
          :title="getLabel('actions.createProject')"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
          </svg>
          <span>{{ getLabel('projects.create') }}</span>
        </button>
      </div>
    </div>

    <div class="view-content">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p class="loading-text">{{ getLabel('app.loading') }}</p>
      </div>

      <!-- Roadmap Content -->
      <div v-else-if="filteredProjects.length > 0" class="roadmap-content">
        <!-- Roadmap Filters -->
        <div class="roadmap-filters">
          <div class="filter-group">
            <label class="filter-label">{{ getLabel('filters.status') }}:</label>
            <select v-model="statusFilter" class="filter-select" @change="applyFilters">
              <option value="">{{ getLabel('filters.allStatuses') }}</option>
              <option value="Planning">Planning</option>
              <option value="Active">Active</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">{{ getLabel('filters.priority') }}:</label>
            <select v-model="priorityFilter" class="filter-select" @change="applyFilters">
              <option value="">{{ getLabel('filters.allPriorities') }}</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">{{ getLabel('roadmap.timelineView') }}:</label>
            <select v-model="timelineUnit" class="filter-select" @change="updateTimelineUnit">
              <option value="Week">{{ getLabel('roadmap.week') }}</option>
              <option value="Month">{{ getLabel('roadmap.month') }}</option>
              <option value="Year">{{ getLabel('roadmap.year') }}</option>
            </select>
          </div>

          <button 
            class="btn btn--outlined" 
            @click="clearFilters"
            :title="getLabel('filters.clear')"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M14.59,8L12,10.59L9.41,8L8,9.41L10.59,12L8,14.59L9.41,16L12,13.41L14.59,16L16,14.59L13.41,12L16,9.41L14.59,8Z"/>
            </svg>
            <span>{{ getLabel('filters.clear') }}</span>
          </button>
        </div>

        <!-- Syncfusion Gantt Chart Container -->
        <div class="gantt-container">
          <ejs-gantt
            ref="gantt"
            :dataSource="ganttDataSource"
            :taskFields="taskFields"
            :timelineSettings="timelineSettings"
            :splitterSettings="splitterSettings"
            :projectStartDate="projectStartDate"
            :projectEndDate="projectEndDate"
            :height="ganttHeight"
            :gridLines="'Both'"
            :allowSelection="true"
            :allowSorting="true"
            :allowReordering="false"
            :allowResizing="true"
            :showColumnMenu="false"
            :allowFiltering="false"
            :readOnly="false"
            :taskbarHeight="28"
            :rowHeight="48"
            @actionComplete="onGanttActionComplete"
            @taskbarClick="onTaskbarClick"
            @rowSelecting="onRowSelecting"
          >
            <e-columns>
              <e-column 
                field="TaskName" 
                :headerText="getLabel('projects.name')" 
                width="350"
                :template="'taskInfoTemplate'"
              ></e-column>
              <e-column 
                field="Duration" 
                :headerText="getLabel('projects.duration')" 
                width="100"
              ></e-column>
            </e-columns>

            <!-- Custom Templates -->
            <template #taskInfoTemplate="{ data }">
              <div class="task-info-cell">
                <div class="task-header">
                  <div class="task-icon-name">
                    <svg v-if="data.TaskType === 'Project'" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="task-type-icon task-type-icon--project">
                      <path d="M19,3H5C3.9,3 3,3.9 3,5V19C3.9,19 5,19.9 5,19H19C20.1,19 21,18.1 21,17V5C21,3.9 20.1,3 19,3Z"/>
                    </svg>
                    <svg v-else-if="data.TaskType === 'Milestone'" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="task-type-icon task-type-icon--milestone">
                      <path d="M5.5,12L2,8.5L6.5,4L11,8.5L7.5,12L11,15.5L6.5,20L2,15.5L5.5,12M18.5,12L22,8.5L17.5,4L13,8.5L16.5,12L13,15.5L17.5,20L22,15.5L18.5,12Z"/>
                    </svg>
                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="task-type-icon task-type-icon--task">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                    <span class="task-name-text">{{ data.TaskName }}</span>
                  </div>
                </div>
                
                <div class="task-details">
                  <div class="task-dates">
                    <span class="date-item">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" class="date-icon">
                        <path d="M9,10V12H7V10H9M13,10V12H11V10H13M17,10V12H15V10H17M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H6V1H8V3H16V1H18V3H19M19,19V8H5V19H19M9,14V16H7V14H9M13,14V16H11V14H13M17,14V16H15V14H17Z"/>
                      </svg>
                      {{ formatDate(data.StartDate) }}
                    </span>
                    <span class="date-separator">→</span>
                    <span class="date-item">
                      {{ formatDate(data.EndDate) }}
                    </span>
                  </div>
                  
                  <div class="task-meta">
                    <span v-if="data.Status" class="status-chip" :class="`status-chip--${getStatusClass(data.Status)}`">
                      {{ data.Status }}
                    </span>
                    <span v-if="data.Priority" class="priority-chip" :class="`priority-chip--${getPriorityClass(data.Priority)}`">
                      {{ data.Priority }}
                    </span>
                    <div class="progress-info">
                      <div class="progress-container">
                        <div class="progress-bar">
                          <div 
                            class="progress-fill" 
                            :style="{ width: `${data.Progress || 0}%` }"
                          ></div>
                        </div>
                        <span class="progress-text">{{ data.Progress || 0 }}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </ejs-gantt>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <svg class="empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z"/>
        </svg>
        <h3 class="empty-title">{{ getLabel('roadmap.noData') }}</h3>
        <p class="empty-description">{{ getLabel('roadmap.noDataDescription') }}</p>
        <button class="btn btn--raised" @click="createProject">
          {{ getLabel('projects.create') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/projectStore'
import { useLocalization } from '@/composables/useLocalization'
import { useToast } from '@/composables/useToast'
import { GanttComponent as EjsGantt, ColumnsDirective as EColumns, ColumnDirective as EColumn } from '@syncfusion/ej2-vue-gantt'

export default {
  name: 'ProjectRoadmapView',
  components: {
    'ejs-gantt': EjsGantt,
    'e-columns': EColumns,
    'e-column': EColumn
  },
  setup() {
    const router = useRouter()
    const projectStore = useProjectStore()
    const { t, isLoaded, currentTranslations } = useLocalization()
    const { showToast } = useToast()

    // Reactive state
    const isLoading = ref(false)
    const viewMode = ref('projects') // 'projects' or 'full'
    const timelineUnit = ref('Month')
    const timelineZoom = ref(1) // Zoom level for timeline
    const statusFilter = ref('')
    const priorityFilter = ref('')
    const gantt = ref(null)

    // Debug translations
    onMounted(() => {
      console.log('ProjectRoadmapView - Translations loaded:', isLoaded.value)
      console.log('ProjectRoadmapView - Current translations:', currentTranslations.value)
    })

    // Computed properties
    const filteredProjects = computed(() => {
      let projects = [...(projectStore.projects || [])]
      
      if (statusFilter.value) {
        projects = projects.filter(project => project.Status === statusFilter.value)
      }
      
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
      parentID: 'ParentID',
      dependency: 'Predecessor'
    }))

    const timelineSettings = computed(() => ({
      timelineUnitSize: Math.round((timelineUnit.value === 'Week' ? 100 : timelineUnit.value === 'Month' ? 120 : 300) * timelineZoom.value),
      topTier: {
        unit: timelineUnit.value,
        format: timelineUnit.value === 'Week' ? 'MMM dd, yyyy' : 
                timelineUnit.value === 'Month' ? 'MMM yyyy' : 'yyyy'
      },
      bottomTier: {
        unit: timelineUnit.value === 'Week' ? 'Day' : 
              timelineUnit.value === 'Month' ? 'Week' : 'Month',
        format: timelineUnit.value === 'Week' ? 'dd' : 
                timelineUnit.value === 'Month' ? 'dd' : 'MMM'
      }
    }))

    const splitterSettings = computed(() => ({
      position: '400px'
    }))

    const projectStartDate = computed(() => {
      const dates = filteredProjects.value
        .map(p => p.ProjectStartDate)
        .filter(d => d)
        .map(d => new Date(d))
      
      if (dates.length === 0) return new Date()
      return new Date(Math.min(...dates))
    })

    const projectEndDate = computed(() => {
      const dates = filteredProjects.value
        .map(p => p.ProjectEndDate)
        .filter(d => d)
        .map(d => new Date(d))
      
      if (dates.length === 0) {
        const end = new Date()
        end.setFullYear(end.getFullYear() + 1)
        return end
      }
      return new Date(Math.max(...dates))
    })

    const ganttHeight = computed(() => '600px')

    const ganttDataSource = computed(() => {
      const data = []
      let taskId = 1

      filteredProjects.value.forEach(project => {
        const projectId = taskId++
        const startDate = project.ProjectStartDate ? new Date(project.ProjectStartDate) : new Date()
        const endDate = project.ProjectEndDate ? new Date(project.ProjectEndDate) : new Date()

        // Add project
        data.push({
          TaskID: projectId,
          TaskName: project.ProjectName || 'Unnamed Project',
          TaskType: 'Project',
          StartDate: startDate,
          EndDate: endDate,
          Duration: Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))),
          Progress: getProgressValue(project),
          Status: project.Status,
          Priority: project.Priority,
          Owner: project.Owner,
          ParentID: null
        })

        // Add milestones if in full view mode
        if (viewMode.value === 'full' && project.milestones) {
          project.milestones.forEach(milestone => {
            const milestoneId = taskId++
            const milestoneStart = milestone.StartDate ? new Date(milestone.StartDate) : startDate
            const milestoneEnd = milestone.EndDate ? new Date(milestone.EndDate) : endDate

            data.push({
              TaskID: milestoneId,
              TaskName: milestone.PhaseName || 'Milestone',
              TaskType: 'Milestone',
              StartDate: milestoneStart,
              EndDate: milestoneEnd,
              Duration: Math.max(1, Math.ceil((milestoneEnd - milestoneStart) / (1000 * 60 * 60 * 24))),
              Progress: getProgressValue(milestone),
              Status: milestone.Status,
              Priority: milestone.Priority,
              Owner: milestone.Owner,
              ParentID: projectId
            })

            // Add tasks if available
            if (milestone.tasks) {
              milestone.tasks.forEach(task => {
                const taskStart = task.StartDate ? new Date(task.StartDate) : milestoneStart
                const taskEnd = task.EndDate ? new Date(task.EndDate) : milestoneEnd

                data.push({
                  TaskID: taskId++,
                  TaskName: task.Subject || 'Task',
                  TaskType: 'Task',
                  StartDate: taskStart,
                  EndDate: taskEnd,
                  Duration: Math.max(1, Math.ceil((taskEnd - taskStart) / (1000 * 60 * 60 * 24))),
                  Progress: getProgressValue(task),
                  Status: task.Status,
                  Priority: task.Priority,
                  Owner: task.AssignedTo || task.Owner,
                  ParentID: milestoneId
                })
              })
            }
          })
        }
      })

      return data
    })

    // Methods
    const refreshData = async () => {
      isLoading.value = true
      try {
        await projectStore.fetchProjects()
        showToast(getLabel('actions.refreshSuccess'), 'success')
      } catch (error) {
        console.error('Failed to refresh projects:', error)
        showToast(getLabel('actions.refreshError'), 'error')
      } finally {
        isLoading.value = false
      }
    }

    const switchViewMode = (mode) => {
      viewMode.value = mode
      showToast(getLabel('roadmap.viewModeChanged').replace('{mode}', mode), 'info')
    }

    const zoomIn = () => {
      if (timelineZoom.value < 3) {
        timelineZoom.value = Math.min(3, timelineZoom.value + 0.25)
        updateGanttTimeline()
      }
    }

    const zoomOut = () => {
      if (timelineZoom.value > 0.5) {
        timelineZoom.value = Math.max(0.5, timelineZoom.value - 0.25)
        updateGanttTimeline()
      }
    }

    const updateGanttTimeline = () => {
      nextTick(() => {
        if (gantt.value && gantt.value.ej2Instances) {
          gantt.value.ej2Instances.timelineSettings = timelineSettings.value
          gantt.value.ej2Instances.refresh()
        }
      })
    }

    const applyFilters = () => {
      // Filters are applied through computed properties
      showToast(getLabel('filters.applied'), 'success')
    }

    const updateTimelineUnit = () => {
      updateGanttTimeline()
      showToast(getLabel('roadmap.timelineUpdated').replace('{unit}', timelineUnit.value), 'info')
    }

    const clearFilters = () => {
      statusFilter.value = ''
      priorityFilter.value = ''
      showToast(getLabel('filters.cleared'), 'success')
    }

    const createProject = () => {
      router.push('/projects/create')
    }

    const onGanttActionComplete = (args) => {
      console.log('Gantt action completed:', args)
    }

    const onTaskbarClick = (args) => {
      if (args.data && args.data.TaskType === 'Project') {
        const projectId = args.data.TaskID
        // Navigate to project details if needed
        console.log('Project clicked:', args.data)
      }
    }

    const onRowSelecting = (args) => {
      console.log('Row selecting:', args)
    }

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      
      try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return '-'
        
        return date.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      } catch (error) {
        return '-'
      }
    }

    const getStatusClass = (status) => {
      if (!status) return 'unknown'
      return status.toLowerCase().replace(/\s+/g, '-')
    }

    const getPriorityClass = (priority) => {
      if (!priority) return 'unknown'
      return priority.toLowerCase().replace(/\s+/g, '-')
    }

    const getProgressValue = (item) => {
      return item.Progress || 
             item.CompletionPercent || 
             item.ProgressPercent || 
             item.progress || 
             0
    }

    // Temporary fallback for translations
    const getLabel = (key) => {
      const label = t(key)
      if (label === key) {
        const fallbacks = {
          'roadmap.title': 'Project Roadmap',
          'roadmap.projects': 'Projects',
          'roadmap.full': 'Full',
          'roadmap.projectsMilestones': 'Projects + Milestones',
          'roadmap.fullHierarchy': 'Full Hierarchy',
          'roadmap.timeline': 'Timeline',
          'roadmap.timelineView': 'Timeline View',
          'roadmap.week': 'Week',
          'roadmap.month': 'Month',
          'roadmap.year': 'Year',
          'roadmap.noData': 'No roadmap data available',
          'roadmap.noDataDescription': 'Create projects and milestones to see them in the roadmap view.',
          'roadmap.viewModeChanged': 'Switched to {mode} view',
          'roadmap.timelineUpdated': 'Timeline updated to {unit} view',
          'projects.title': 'Projects',
          'projects.name': 'Project Name',
          'projects.startDate': 'Start Date',
          'projects.endDate': 'End Date',
          'projects.duration': 'Duration',
          'projects.progress': 'Progress',
          'projects.status': 'Status',
          'projects.priority': 'Priority',
          'projects.create': 'Create Project',
          'filters.status': 'Status',
          'filters.priority': 'Priority',
          'filters.allStatuses': 'All Statuses',
          'filters.allPriorities': 'All Priorities',
          'filters.clear': 'Clear Filters',
          'filters.cleared': 'Filters cleared',
          'filters.applied': 'Filters applied',
          'actions.refresh': 'Refresh',
          'actions.createProject': 'Create Project',
          'actions.zoomIn': 'Zoom In',
          'actions.zoomOut': 'Zoom Out',
          'actions.refreshSuccess': 'Data refreshed successfully',
          'actions.refreshError': 'Failed to refresh data',
          'app.loading': 'Loading...'
        }
        return fallbacks[key] || key
      }
      return label
    }

    onMounted(async () => {
      if (projectStore.projects.length === 0) {
        await refreshData()
      }
    })

    return {
      isLoading,
      viewMode,
      timelineUnit,
      timelineZoom,
      statusFilter,
      priorityFilter,
      gantt,
      filteredProjects,
      taskFields,
      timelineSettings,
      splitterSettings,
      projectStartDate,
      projectEndDate,
      ganttHeight,
      ganttDataSource,
      refreshData,
      switchViewMode,
      zoomIn,
      zoomOut,
      updateGanttTimeline,
      applyFilters,
      updateTimelineUnit,
      clearFilters,
      createProject,
      onGanttActionComplete,
      onTaskbarClick,
      onRowSelecting,
      formatDate,
      getStatusClass,
      getPriorityClass,
      getProgressValue,
      getLabel,
      t
    }
  }
}
</script>

<style scoped>
/* Uses global CSS variables and styles from main.css and syncfusion-theme.css */

/* Main Container */
.project-roadmap-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--mdc-theme-background);
}

/* View Toolbar - Exactly matches ProjectListView & ProjectCardView */
.view-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: var(--mdc-theme-surface);
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  box-shadow: var(--mdc-elevation-01);
  flex-wrap: wrap;
  gap: 16px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
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

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

/* Button Styles - Exactly matches ProjectListView & ProjectCardView */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-width: 64px;
  height: 36px;
  padding: 0 16px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--mdc-theme-primary);
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 2.25rem;
  letter-spacing: 0.0892857143em;
  text-decoration: none;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  overflow: hidden;
  gap: 8px;
}

.btn:hover {
  box-shadow: var(--mdc-elevation-02);
}

.btn:focus {
  box-shadow: var(--mdc-elevation-04);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.btn--raised {
  background: var(--mdc-theme-primary);
  color: var(--mdc-theme-on-primary);
  box-shadow: var(--mdc-elevation-02);
}

.btn--raised:hover {
  box-shadow: var(--mdc-elevation-04);
}

.btn--outlined {
  border: 1px solid currentColor;
  background: transparent;
}

.btn--icon {
  width: 36px;
  height: 36px;
  min-width: 36px;
  padding: 0;
  border-radius: 50%;
  color: var(--mdc-theme-text-secondary-on-background);
}

.btn--icon:hover {
  background: rgba(0, 0, 0, 0.04);
  color: var(--mdc-theme-primary);
}

.btn--toggle {
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: transparent;
  color: var(--mdc-theme-text-secondary-on-background);
}

.btn--toggle:hover {
  border-color: var(--mdc-theme-primary);
  color: var(--mdc-theme-primary);
}

.btn--toggle-active {
  background: var(--mdc-theme-primary) !important;
  color: var(--mdc-theme-on-primary) !important;
  border-color: var(--mdc-theme-primary) !important;
}

/* View Mode Toggle */
.view-mode-toggle {
  display: flex;
  background: var(--mdc-theme-surface);
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  overflow: hidden;
}

.view-mode-toggle .btn {
  border-radius: 0;
  border: none;
  margin: 0;
}

.view-mode-toggle .btn:first-child {
  border-right: 1px solid rgba(0, 0, 0, 0.12);
}

/* Timeline Controls */
.timeline-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--mdc-theme-surface);
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  padding: 4px;
}

.timeline-btn {
  color: var(--mdc-theme-text-secondary-on-background);
}

.timeline-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.04);
  color: var(--mdc-theme-primary);
}

.zoom-level {
  font-size: 12px;
  font-weight: 500;
  color: var(--mdc-theme-text-secondary-on-background);
  padding: 4px 8px;
  min-width: 40px;
  text-align: center;
}

/* View Content */
.view-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Loading State - Matches ProjectListView & ProjectCardView */
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

/* Roadmap Content */
.roadmap-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Roadmap Filters */
.roadmap-filters {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px 24px;
  background: var(--mdc-theme-surface);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--mdc-theme-text-secondary-on-background);
  white-space: nowrap;
}

.filter-select {
  padding: 6px 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  background: var(--mdc-theme-surface);
  color: var(--mdc-theme-text-primary-on-background);
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.2s ease;
  min-width: 120px;
}

.filter-select:hover {
  border-color: var(--mdc-theme-primary);
}

.filter-select:focus {
  outline: none;
  border-color: var(--mdc-theme-primary);
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}

/* Gantt Container */
.gantt-container {
  flex: 1;
  padding: 24px;
  background: var(--mdc-theme-background);
  overflow: hidden;
}

/* Task Info Template Styling */
.task-info-cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0;
  min-height: 60px;
  justify-content: center;
}

.task-header {
  display: flex;
  align-items: center;
}

.task-icon-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-type-icon {
  flex-shrink: 0;
}

.task-type-icon--project {
  color: #1976d2;
}

.task-type-icon--milestone {
  color: #f57c00;
}

.task-type-icon--task {
  color: #4caf50;
}

.task-name-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--mdc-theme-text-primary-on-background);
  line-height: 1.2;
}

.task-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-left: 24px;
}

.task-dates {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--mdc-theme-text-secondary-on-background);
}

.date-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.date-icon {
  opacity: 0.7;
}

.date-separator {
  color: var(--mdc-theme-primary);
  font-weight: 500;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.progress-info {
  margin-left: auto;
  min-width: 80px;
}

/* Progress Container - Matches other views */
.progress-container {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--mdc-theme-primary);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  font-weight: 500;
  color: var(--mdc-theme-text-secondary-on-background);
  min-width: 35px;
}

/* Status and Priority Chips - Matches other views */
.status-chip,
.priority-chip {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
  display: inline-block;
}

/* Status Colors */
.status-chip--active,
.status-chip--in-progress {
  background: rgba(76, 175, 80, 0.12);
  color: #2e7d32;
}

.status-chip--completed {
  background: rgba(25, 118, 210, 0.12);
  color: #1976d2;
}

.status-chip--planning {
  background: rgba(245, 124, 0, 0.12);
  color: #f57c00;
}

.status-chip--on-hold,
.status-chip--onhold {
  background: rgba(194, 24, 91, 0.12);
  color: #c2185b;
}

.status-chip--cancelled {
  background: rgba(211, 47, 47, 0.12);
  color: #d32f2f;
}

.status-chip--unknown {
  background: rgba(0, 0, 0, 0.12);
  color: var(--mdc-theme-text-secondary-on-background);
}

/* Priority Colors */
.priority-chip--high,
.priority-chip--critical {
  background: rgba(211, 47, 47, 0.12);
  color: #d32f2f;
}

.priority-chip--medium,
.priority-chip--normal {
  background: rgba(245, 124, 0, 0.12);
  color: #f57c00;
}

.priority-chip--low {
  background: rgba(76, 175, 80, 0.12);
  color: #2e7d32;
}

.priority-chip--unknown {
  background: rgba(0, 0, 0, 0.12);
  color: var(--mdc-theme-text-secondary-on-background);
}

/* Empty State - Matches other views */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  color: var(--mdc-theme-text-secondary-on-background);
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

/* Syncfusion Gantt Customizations */
:deep(.e-gantt) {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Roboto', 'Segoe UI', system-ui, -apple-system, sans-serif;
}

:deep(.e-gantt .e-gridheader) {
  background: #f5f5f5;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

:deep(.e-gantt .e-columnheader) {
  font-weight: 500;
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.87);
  text-transform: uppercase;
  letter-spacing: 0.0892857143em;
  padding: 16px 12px;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
}

:deep(.e-gantt .e-row) {
  transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 64px;
}

:deep(.e-gantt .e-row:hover) {
  background-color: rgba(0, 0, 0, 0.04);
}

:deep(.e-gantt .e-rowcell) {
  padding: 8px 12px;
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.87);
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  vertical-align: top;
}

:deep(.e-gantt .e-rowcell:last-child) {
  border-right: none;
}

:deep(.e-gantt .e-altrow) {
  background-color: rgba(0, 0, 0, 0.02);
}

/* Gantt Chart Area Customizations */
:deep(.e-gantt .e-gantt-chart) {
  background: var(--mdc-theme-surface);
}

:deep(.e-gantt .e-chart-row) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  min-height: 64px;
}

:deep(.e-gantt .e-chart-row:hover) {
  background-color: rgba(0, 0, 0, 0.02);
}

/* Timeline Header Customizations */
:deep(.e-gantt .e-timeline-header-container) {
  background: #f5f5f5;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

:deep(.e-gantt .e-timeline-top-header-cell),
:deep(.e-gantt .e-timeline-header-cell) {
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  color: rgba(0, 0, 0, 0.87);
  font-weight: 500;
  font-size: 0.75rem;
}

/* Taskbar Customizations - Enhanced with progress text */
:deep(.e-gantt .e-taskbar-main-container .e-gantt-parent-taskbar) {
  background: linear-gradient(135deg, #1976d2, #1565c0);
  border: 1px solid #1565c0;
  border-radius: 4px;
  position: relative;
}

:deep(.e-gantt .e-taskbar-main-container .e-gantt-milestone) {
  background: linear-gradient(135deg, #f57c00, #ef6c00);
  border: 1px solid #ef6c00;
  border-radius: 2px;
  transform: rotate(45deg);
}

:deep(.e-gantt .e-taskbar-main-container .e-gantt-child-taskbar) {
  background: linear-gradient(135deg, #4caf50, #388e3c);
  border: 1px solid #388e3c;
  border-radius: 4px;
  position: relative;
}

:deep(.e-gantt .e-taskbar-main-container .e-gantt-child-progressbar),
:deep(.e-gantt .e-taskbar-main-container .e-gantt-parent-progressbar) {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

/* Splitter Customizations */
:deep(.e-gantt .e-split-bar) {
  background: rgba(0, 0, 0, 0.12);
  width: 2px;
}

:deep(.e-gantt .e-split-bar:hover) {
  background: var(--mdc-theme-primary);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .view-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-left {
    justify-content: center;
  }

  .toolbar-actions {
    justify-content: center;
  }

  .roadmap-filters {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .filter-group {
    justify-content: space-between;
  }

  .timeline-controls {
    order: -1;
  }
}

@media (max-width: 768px) {
  .gantt-container {
    padding: 16px;
  }

  .view-mode-toggle {
    flex-direction: column;
  }

  .view-mode-toggle .btn:first-child {
    border-right: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  }

  .timeline-controls {
    flex-direction: column;
    gap: 4px;
  }

  .zoom-level {
    order: -1;
  }

  :deep(.e-gantt .e-columnheader) {
    padding: 12px 8px;
    font-size: 0.75rem;
  }

  :deep(.e-gantt .e-rowcell) {
    padding: 8px;
    font-size: 0.75rem;
  }

  .task-details {
    margin-left: 20px;
  }

  .task-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .progress-info {
    margin-left: 0;
    align-self: stretch;
  }
}

@media (max-width: 480px) {
  .view-content {
    padding: 0;
  }

  .roadmap-filters {
    padding: 12px 16px;
  }

  .gantt-container {
    padding: 12px;
    margin: 0;
  }

  .btn {
    font-size: 0.75rem;
    padding: 0 12px;
    height: 32px;
  }

  .btn--icon {
    width: 32px;
    height: 32px;
    min-width: 32px;
  }

  .task-name-text {
    font-size: 12px;
  }

  .task-dates {
    font-size: 11px;
  }

  .status-chip,
  .priority-chip {
    font-size: 9px;
    padding: 2px 6px;
  }

  .progress-container {
    min-width: 60px;
  }

  .progress-text {
    font-size: 10px;
  }

  .zoom-level {
    font-size: 11px;
    padding: 2px 6px;
  }
}
</style>