<template>
  <div class="project-roadmap-view">
    <!-- GANTT ROADMAP TOOLBAR -->
    <div class="view-toolbar mdc-card">
      <div class="toolbar-left">
        <h2 class="mdc-typography--headline6">{{ t('views.roadmap') }}</h2>
        <div class="view-mode-switcher">
          <button 
            class="mode-btn" 
            :class="{ active: viewMode === 'projects' }"
            @click="setViewMode('projects')"
          >
            {{ t('roadmap.projectsMilestones') }}
          </button>
          <button 
            class="mode-btn" 
            :class="{ active: viewMode === 'full' }"
            @click="setViewMode('full')"
          >
            {{ t('roadmap.fullHierarchy') }}
          </button>
        </div>
      </div>
      <div class="toolbar-actions">
        <div class="zoom-controls">
          <button 
            class="mdc-icon-button" 
            @click="zoomIn"
            :title="t('actions.zoomIn')"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5,14H20.5L14,7.5L9.5,12L6,8.5L0.5,14H15.5M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,5V19H5V5H19Z"/>
            </svg>
          </button>
          <button 
            class="mdc-icon-button" 
            @click="zoomOut"
            :title="t('actions.zoomOut')"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5,14H20.5L18,11.5L15.5,14M14,7.5L9.5,12L6,8.5L0.5,14H13L14,7.5Z"/>
            </svg>
          </button>
          <select v-model="timelineUnit" @change="updateTimeline" class="timeline-selector">
            <option value="Day">{{ t('roadmap.day') }}</option>
            <option value="Week">{{ t('roadmap.week') }}</option>
            <option value="Month">{{ t('roadmap.month') }}</option>
            <option value="Quarter">{{ t('roadmap.quarter') }}</option>
            <option value="Year">{{ t('roadmap.year') }}</option>
          </select>
        </div>
        <div class="action-buttons">
          <button 
            class="mdc-button mdc-button--outlined" 
            @click="exportRoadmap"
            :title="t('actions.export')"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
            {{ t('actions.export') }}
          </button>
          <button 
            class="mdc-button mdc-button--outlined refresh-btn" 
            @click="refreshData" 
            :disabled="isLoading"
            :title="t('actions.refresh')"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
            </svg>
          </button>
          <button 
            class="mdc-button mdc-button--raised create-btn" 
            @click="createProject" 
            :title="t('actions.createProject')"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
            </svg>
            {{ t('projects.create') }}
          </button>
        </div>
      </div>
    </div>

    <div class="view-content">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p class="mdc-typography--body1">{{ t('app.loading') }}</p>
      </div>

      <!-- Gantt Chart -->
      <div v-else-if="ganttDataSource.length > 0" class="gantt-container">
        <ejs-gantt
          ref="ganttChart"
          id="roadmapGantt"
          :dataSource="ganttDataSource"
          :taskFields="taskSettings"
          :timelineSettings="timelineSettings"
          :columns="ganttColumns"
          :splitterSettings="splitterSettings"
          :labelSettings="labelSettings"
          :projectStartDate="projectStartDate"
          :projectEndDate="projectEndDate"
          :includeWeekend="false"
          :allowSorting="true"
          :allowReordering="true"
          :allowResizing="true"
          :allowFiltering="true"
          :showColumnMenu="true"
          :allowExcelExport="true"
          :allowPdfExport="true"
          :height="ganttHeight"
          :rowHeight="rowHeight"
          :taskbarHeight="taskbarHeight"
          :gridLines="gridLines"
          @load="onGanttLoad"
          @actionBegin="onActionBegin"
          @actionComplete="onActionComplete"
          @taskbarEditing="onTaskbarEdit"
          @rowSelected="onRowSelected"
        >
          <e-columns>
            <e-column field="TaskName" headerText="Name" width="250" :clipMode="clipMode"></e-column>
            <e-column field="StartDate" headerText="Start Date" width="120"></e-column>
            <e-column field="EndDate" headerText="End Date" width="120"></e-column>
            <e-column field="Duration" headerText="Duration" width="80"></e-column>
            <e-column field="Progress" headerText="Progress" width="80"></e-column>
            <e-column field="Priority" headerText="Priority" width="100" v-if="viewMode === 'full'"></e-column>
            <e-column field="Owner" headerText="Owner" width="120"></e-column>
          </e-columns>
        </ejs-gantt>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3,3H21V5H19V19A2,2 0 0,1 17,21H7A2,2 0 0,1 5,19V5H3V3M7,5V19H17V5H7M9,7H15V9H9V7M9,11H15V13H9V11M9,15H15V17H9V15Z"/>
          </svg>
        </div>
        <h3 class="mdc-typography--headline6">{{ t('roadmap.noData') }}</h3>
        <p class="mdc-typography--body1">{{ t('roadmap.noDataDescription') }}</p>
        <button class="mdc-button mdc-button--raised" @click="createProject">
          {{ t('projects.create') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/projectStore'
import { useMilestoneStore } from '@/stores/milestoneStore'
import { useTaskStore } from '@/stores/taskStore'
import { useLocalization } from '@/composables/useLocalization'
import { useToast } from '@/composables/useToast'

// Syncfusion Gantt imports
import { 
  GanttComponent, 
  ColumnsDirective, 
  ColumnDirective,
  Edit, 
  Toolbar, 
  Selection, 
  Filter, 
  Sort,
  Reorder,
  Resize,
  ExcelExport,
  PdfExport
} from '@syncfusion/ej2-vue-gantt'

export default {
  name: 'ProjectRoadmapView',
  components: {
    'ejs-gantt': GanttComponent,
    'e-columns': ColumnsDirective,
    'e-column': ColumnDirective
  },
  provide: {
    gantt: [Edit, Toolbar, Selection, Filter, Sort, Reorder, Resize, ExcelExport, PdfExport]
  },
  setup() {
    const router = useRouter()
    const projectStore = useProjectStore()
    const { t } = useLocalization()
    const { showToast } = useToast()

    // Refs
    const ganttChart = ref(null)
    const isLoading = ref(false)
    const viewMode = ref('projects') // 'projects' or 'full'
    const timelineUnit = ref('Month')

    // Access filteredProjects from parent component context
    const filteredProjects = inject('filteredProjects', computed(() => projectStore.projects))

    // Gantt Configuration
    const taskSettings = ref({
      id: 'TaskID',
      name: 'TaskName',
      startDate: 'StartDate',
      endDate: 'EndDate',
      duration: 'Duration',
      progress: 'Progress',
      child: 'subtasks',
      dependency: 'Predecessor'
    })

    const timelineSettings = computed(() => ({
      topTier: {
        unit: timelineUnit.value === 'Day' ? 'Week' : 
              timelineUnit.value === 'Week' ? 'Month' :
              timelineUnit.value === 'Month' ? 'Quarter' :
              timelineUnit.value === 'Quarter' ? 'Year' : 'Year',
        format: timelineUnit.value === 'Day' ? 'MMM dd, yyyy' :
                timelineUnit.value === 'Week' ? 'MMM yyyy' :
                timelineUnit.value === 'Month' ? 'yyyy' :
                timelineUnit.value === 'Quarter' ? 'yyyy' : 'yyyy'
      },
      bottomTier: {
        unit: timelineUnit.value,
        format: timelineUnit.value === 'Day' ? 'dd' :
                timelineUnit.value === 'Week' ? 'dd' :
                timelineUnit.value === 'Month' ? 'MMM' :
                timelineUnit.value === 'Quarter' ? 'Q' : 'yyyy'
      },
      timelineUnitSize: timelineUnit.value === 'Day' ? 50 :
                        timelineUnit.value === 'Week' ? 80 :
                        timelineUnit.value === 'Month' ? 100 :
                        timelineUnit.value === 'Quarter' ? 150 : 200
    }))

    const ganttColumns = computed(() => [
      { field: 'TaskName', headerText: t('projects.name'), width: 250 },
      { field: 'StartDate', headerText: t('projects.startDate'), width: 120 },
      { field: 'EndDate', headerText: t('projects.endDate'), width: 120 },
      { field: 'Duration', headerText: t('projects.duration'), width: 80 },
      { field: 'Progress', headerText: t('projects.progress'), width: 80 },
      ...(viewMode.value === 'full' ? [
        { field: 'Priority', headerText: t('projects.priority'), width: 100 },
        { field: 'Owner', headerText: t('projects.owner'), width: 120 }
      ] : [
        { field: 'Owner', headerText: t('projects.owner'), width: 120 }
      ])
    ])

    const splitterSettings = ref({
      position: '40%',
      columnIndex: 3
    })

    const labelSettings = ref({
      leftLabel: 'TaskName',
      rightLabel: 'Progress'
    })

    const ganttHeight = ref('600px')
    const rowHeight = ref(40)
    const taskbarHeight = ref(20)
    const gridLines = ref('Both')
    const clipMode = ref('EllipsisWithTooltip')

    // Computed Properties
    const projectStartDate = computed(() => {
      if (filteredProjects.value.length === 0) return new Date()
      const dates = filteredProjects.value
        .map(p => new Date(p.ProjectStartDate))
        .filter(d => !isNaN(d))
      return dates.length > 0 ? new Date(Math.min(...dates)) : new Date()
    })

    const projectEndDate = computed(() => {
      if (filteredProjects.value.length === 0) return new Date()
      const dates = filteredProjects.value
        .map(p => new Date(p.ProjectEndDate))
        .filter(d => !isNaN(d))
      return dates.length > 0 ? new Date(Math.max(...dates)) : new Date()
    })

    const ganttDataSource = computed(() => {
      return transformToGanttData(filteredProjects.value, viewMode.value)
    })

    // Methods
    const transformToGanttData = (projects, mode = 'projects') => {
      return projects.map((project, index) => {
        const baseTask = {
          TaskID: project.RecId || `proj_${index}`,
          TaskName: project.ProjectName || 'Unnamed Project',
          TaskType: 'Project',
          StartDate: project.ProjectStartDate ? new Date(project.ProjectStartDate) : new Date(),
          EndDate: project.ProjectEndDate ? new Date(project.ProjectEndDate) : new Date(),
          Progress: project.CompletionPercent || 0,
          Priority: project.Priority || 'Medium',
          Owner: project.Owner || 'Unassigned',
          Status: project.Status || 'Planning'
        }

        // Calculate duration in days
        const start = baseTask.StartDate
        const end = baseTask.EndDate
        baseTask.Duration = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)))

        if (mode === 'projects') {
          // Projects + Milestones mode
          baseTask.subtasks = transformMilestones(project.milestones || [], project.RecId)
        } else if (mode === 'full') {
          // Full hierarchy mode: Projects → Milestones → Tasks
          baseTask.subtasks = transformMilestonesWithTasks(project.milestones || [], project.RecId)
        }

        return baseTask
      })
    }

    const transformMilestones = (milestones, projectId) => {
      return milestones.map((milestone, index) => ({
        TaskID: milestone.RecId || `mile_${projectId}_${index}`,
        TaskName: milestone.PhaseName || 'Unnamed Milestone',
        TaskType: 'Milestone',
        StartDate: milestone.StartDate ? new Date(milestone.StartDate) : new Date(),
        EndDate: milestone.DueDate ? new Date(milestone.DueDate) : new Date(),
        Duration: milestone.Duration || calculateDuration(milestone.StartDate, milestone.DueDate),
        Progress: milestone.CompletionPercent || 0,
        Priority: milestone.Priority || 'Medium',
        Owner: milestone.Owner || 'Unassigned',
        Status: milestone.Status || 'Planning'
      }))
    }

    const transformMilestonesWithTasks = (milestones, projectId) => {
      return milestones.map((milestone, milestoneIndex) => {
        const milestoneTask = {
          TaskID: milestone.RecId || `mile_${projectId}_${milestoneIndex}`,
          TaskName: milestone.PhaseName || 'Unnamed Milestone',
          TaskType: 'Milestone',
          StartDate: milestone.StartDate ? new Date(milestone.StartDate) : new Date(),
          EndDate: milestone.DueDate ? new Date(milestone.DueDate) : new Date(),
          Duration: milestone.Duration || calculateDuration(milestone.StartDate, milestone.DueDate),
          Progress: milestone.CompletionPercent || 0,
          Priority: milestone.Priority || 'Medium',
          Owner: milestone.Owner || 'Unassigned',
          Status: milestone.Status || 'Planning'
        }

        // Add tasks as subtasks of milestones
        if (milestone.tasks && milestone.tasks.length > 0) {
          milestoneTask.subtasks = milestone.tasks.map((task, taskIndex) => ({
            TaskID: task.RecId || `task_${milestone.RecId}_${taskIndex}`,
            TaskName: task.Subject || 'Unnamed Task',
            TaskType: 'Task',
            StartDate: task.StartDate ? new Date(task.StartDate) : new Date(),
            EndDate: task.DueDate ? new Date(task.DueDate) : new Date(),
            Duration: task.Duration || calculateDuration(task.StartDate, task.DueDate),
            Progress: task.CompletionPercent || 0,
            Priority: task.Priority || 'Medium',
            Owner: task.AssignedTo || 'Unassigned',
            Status: task.Status || 'Open'
          }))
        }

        return milestoneTask
      })
    }

    const calculateDuration = (startDate, endDate) => {
      if (!startDate || !endDate) return 1
      const start = new Date(startDate)
      const end = new Date(endDate)
      return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)))
    }

    const setViewMode = (mode) => {
      viewMode.value = mode
      showToast(t('roadmap.viewModeChanged', { mode: t(`roadmap.${mode}`) }), 'info')
    }

    const updateTimeline = () => {
      showToast(t('roadmap.timelineUpdated', { unit: t(`roadmap.${timelineUnit.value.toLowerCase()}`) }), 'info')
    }

    const zoomIn = () => {
      if (ganttChart.value && ganttChart.value.ej2Instances) {
        ganttChart.value.ej2Instances.zoomIn()
      }
    }

    const zoomOut = () => {
      if (ganttChart.value && ganttChart.value.ej2Instances) {
        ganttChart.value.ej2Instances.zoomOut()
      }
    }

    const exportRoadmap = () => {
      if (ganttChart.value && ganttChart.value.ej2Instances) {
        const options = {
          fileName: `project-roadmap-${new Date().toISOString().split('T')[0]}.pdf`,
          header: {
            fromTop: 0,
            height: 130,
            contents: [
              {
                type: 'Text',
                value: 'Project Roadmap',
                position: { x: 0, y: 50 },
                style: { textBrushColor: '#000000', fontSize: 20 }
              }
            ]
          }
        }
        ganttChart.value.ej2Instances.pdfExport(options)
        showToast(t('actions.exportSuccess'), 'success')
      }
    }

    const refreshData = async () => {
      isLoading.value = true
      try {
        await projectStore.fetchProjects()
        showToast(t('actions.refreshSuccess'), 'success')
      } catch (error) {
        console.error('Failed to refresh roadmap data:', error)
        showToast(t('actions.refreshError'), 'error')
      } finally {
        isLoading.value = false
      }
    }

    const createProject = () => {
      router.push('/projects/new')
    }

    // Gantt Event Handlers
    const onGanttLoad = () => {
      console.log('Gantt chart loaded')
    }

    const onActionBegin = (args) => {
      console.log('Action begin:', args.requestType)
    }

    const onActionComplete = (args) => {
      console.log('Action complete:', args.requestType)
      if (args.requestType === 'save') {
        showToast(t('roadmap.taskUpdated'), 'success')
      }
    }

    const onTaskbarEdit = (args) => {
      console.log('Taskbar editing:', args)
      // Here you would typically update the backend
    }

    const onRowSelected = (args) => {
      console.log('Row selected:', args.data)
      if (args.data && args.data.TaskType === 'Project') {
        // Navigate to project details or show project info
      }
    }

    // Watchers
    watch(() => viewMode.value, (newMode) => {
      console.log('View mode changed to:', newMode)
    })

    watch(() => timelineUnit.value, (newUnit) => {
      console.log('Timeline unit changed to:', newUnit)
    })

    // Lifecycle
    onMounted(async () => {
      if (filteredProjects.value.length === 0) {
        await refreshData()
      }
    })

    return {
      // Refs
      ganttChart,
      isLoading,
      viewMode,
      timelineUnit,
      
      // Computed
      filteredProjects,
      ganttDataSource,
      taskSettings,
      timelineSettings,
      ganttColumns,
      splitterSettings,
      labelSettings,
      projectStartDate,
      projectEndDate,
      ganttHeight,
      rowHeight,
      taskbarHeight,
      gridLines,
      clipMode,
      
      // Methods
      setViewMode,
      updateTimeline,
      zoomIn,
      zoomOut,
      exportRoadmap,
      refreshData,
      createProject,
      onGanttLoad,
      onActionBegin,
      onActionComplete,
      onTaskbarEdit,
      onRowSelected,
      
      // Composables
      t
    }
  }
}
</script>

<style scoped>
.project-roadmap-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.view-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  margin-bottom: 16px;
  gap: 16px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toolbar-left h2 {
  margin: 0;
}

.view-mode-switcher {
  display: flex;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  padding: 4px;
  gap: 2px;
}

.mode-btn {
  padding: 8px 16px;
  border: none;
  background: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  color: rgba(0, 0, 0, 0.6);
}

.mode-btn.active {
  background: white;
  color: var(--mdc-theme-primary, #1976d2);
  box-shadow: var(--mdc-elevation-01);
}

.mode-btn:hover:not(.active) {
  background: rgba(0, 0, 0, 0.04);
  color: rgba(0, 0, 0, 0.87);
}

.toolbar-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.timeline-selector {
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  background: white;
  font-size: 14px;
  cursor: pointer;
}

.timeline-selector:focus {
  outline: none;
  border-color: var(--mdc-theme-primary, #1976d2);
}

.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.mdc-icon-button {
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  color: rgba(0, 0, 0, 0.6);
  cursor: pointer;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.mdc-icon-button:hover {
  background: rgba(0, 0, 0, 0.04);
  color: rgba(0, 0, 0, 0.87);
}

.view-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  gap: 16px;
  flex: 1;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top: 3px solid var(--mdc-theme-primary, #1976d2);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.gantt-container {
  flex: 1;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--mdc-elevation-01);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  color: rgba(0, 0, 0, 0.6);
  flex: 1;
}

.empty-icon {
  margin-bottom: 24px;
  opacity: 0.4;
}

.empty-state h3 {
  margin: 0 0 8px 0;
}

.empty-state p {
  margin: 0 0 24px 0;
  max-width: 400px;
}

/* Gantt Chart Customization */
:deep(.e-gantt) {
  border-radius: 8px;
}

:deep(.e-gantt .e-header-cell-div) {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
}

:deep(.e-gantt .e-rowcell) {
  border-right: 1px solid rgba(0, 0, 0, 0.08);
}

:deep(.e-gantt .e-chart-row) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

:deep(.e-gantt .e-taskbar-main-container .e-gantt-parent-taskbar) {
  background: linear-gradient(90deg, var(--mdc-theme-primary, #1976d2), #42a5f5);
  border-radius: 4px;
}

:deep(.e-gantt .e-taskbar-main-container .e-gantt-child-taskbar) {
  background: linear-gradient(90deg, #4caf50, #66bb6a);
  border-radius: 4px;
}

:deep(.e-gantt .e-taskbar-main-container .e-gantt-milestone) {
  color: #ff9800;
}

:deep(.e-gantt .e-timeline-header-container) {
  background: #fafafa;
  border-bottom: 2px solid rgba(0, 0, 0, 0.12);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .view-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .toolbar-left {
    justify-content: center;
  }

  .toolbar-actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .gantt-container {
    overflow-x: auto;
  }
}

@media (max-width: 768px) {
  .view-mode-switcher {
    width: 100%;
  }

  .mode-btn {
    flex: 1;
    text-align: center;
  }

  .zoom-controls {
    flex-wrap: wrap;
    justify-content: center;
  }

  .action-buttons {
    flex-wrap: wrap;
    justify-content: center;
  }

  .gantt-height {
    height: 500px;
  }
}

@media (max-width: 480px) {
  .view-toolbar {
    padding: 12px 16px;
  }

  .toolbar-actions {
    flex-direction: column;
    gap: 8px;
  }

  .gantt-height {
    height: 400px;
  }
}
</style>