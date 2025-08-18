<!-- views/ProjectsView.vue - Fixed to work with existing implementation -->
<template>
  <div class="projects-view">
    <!-- Breadcrumbs Navigation (only show when deeper than projects list) -->
    <div v-if="breadcrumbs.length > 1" class="breadcrumbs">
      <span 
        v-for="(crumb, index) in breadcrumbs" 
        :key="crumb.id"
        @click="navigateTo(crumb)"
        class="breadcrumb"
      >
        {{ crumb.name }}
        <span v-if="index < breadcrumbs.length - 1"> › </span>
      </span>
    </div>

    <!-- Main Content -->
    <div class="view-content">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="mdc-circular-progress"></div>
        <p class="mdc-typography--body1">Loading projects...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <h3 class="mdc-typography--headline6 text-error">Error</h3>
        <p class="mdc-typography--body1">{{ error }}</p>
        <button class="mdc-button mdc-button--raised" @click="refreshData">Retry</button>
      </div>

      <!-- PROJECT LIST VIEW with Syncfusion Grid -->
      <div v-else-if="showList" class="list-view">
        <div class="view-toolbar mdc-card">
          <h2 class="mdc-typography--headline6">Projects ({{ filteredProjects.length }})</h2>
          <div class="toolbar-actions">
            <button 
              class="mdc-button mdc-button--outlined refresh-btn" 
              @click="refreshGrid" 
              :disabled="isLoading"
              :title="t('actions.refresh')"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
              </svg>
            </button>
            <button class="mdc-button mdc-button--raised create-btn" @click="createProject" :title="t('actions.createProject')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Syncfusion Grid Component -->
        <ejs-grid
          ref="projectGrid"
          :dataSource="filteredProjects"
          :allowPaging="true"
          :allowSorting="true"
          :allowFiltering="false"
          :allowSelection="true"
          :allowResizing="true"
          :allowReordering="true"
          :pageSettings="pageSettings"
          :filterSettings="filterSettings"
          :sortSettings="sortSettings"
          :selectionSettings="selectionSettings"
          :searchSettings="searchSettings"
          @rowSelected="onRowSelected"
          @rowDeselected="onRowDeselected"
          @actionComplete="onActionComplete"
          height="auto"
          class="project-grid"
        >
          <e-columns>
            <e-column 
              type="checkbox" 
              width="50"
            />
            <e-column
              field="ProjectNumber"
              headerText="ID"
              width="100"
              textAlign="Center"
            />
            <e-column
              field="ProjectName"
              :headerText="t('projects.name')"
              width="300"
              :template="'projectNameTemplate'"
            />
            <e-column
              field="Status"
              :headerText="t('projects.status')"
              width="120"
              :template="'statusTemplate'"
            />
            <e-column
              field="Priority"
              headerText="Priority"
              width="100"
              :template="'priorityTemplate'"
            />
            <e-column
              field="CompletionPercent"
              :headerText="t('projects.progress')"
              width="120"
              :template="'progressTemplate'"
            />
            <e-column
              field="Owner"
              :headerText="t('projects.owner')"
              width="150"
            />
            <e-column
              field="ProjectStartDate"
              :headerText="t('projects.startDate')"
              width="120"
              type="date"
              format="yMd"
            />
            <e-column
              field="ProjectEndDate"
              :headerText="t('projects.endDate')"
              width="120"
              type="date"
              format="yMd"
            />
          </e-columns>

          <!-- Grid Templates -->
          <template #projectNameTemplate="{ data }">
            <div class="project-name-cell">
              <div 
                class="project-title mdc-typography--subtitle2 text-primary" 
                @click="selectProject(data)"
              >
                {{ data.ProjectName }}
              </div>
            </div>
          </template>

          <template #statusTemplate="{ data }">
            <span class="status-chip" :class="`status-chip--${getStatusClass(data.Status)}`">
              {{ data.Status }}
            </span>
          </template>

          <template #priorityTemplate="{ data }">
            <span class="priority-chip" :class="`priority-chip--${getPriorityClass(data.Priority)}`">
              {{ data.Priority || 'Normal' }}
            </span>
          </template>

          <template #progressTemplate="{ data }">
            <div class="progress-container">
              <div class="progress-linear">
                <div 
                  class="progress-linear__bar" 
                  :style="{ transform: `scaleX(${(data.CompletionPercent || 0) / 100})` }"
                ></div>
              </div>
              <span class="mdc-typography--caption progress-text">{{ data.CompletionPercent || 0 }}%</span>
            </div>
          </template>
        </ejs-grid>
      </div>

      <!-- PROJECT CARD VIEW -->
      <div v-else-if="showCard" class="card-view">
        <div class="view-toolbar mdc-card">
          <h2 class="mdc-typography--headline6">Projects ({{ filteredProjects.length }})</h2>
          <div class="toolbar-actions">
            <button 
              class="mdc-button mdc-button--outlined refresh-btn" 
              @click="refreshData" 
              :disabled="isLoading"
              :title="t('actions.refresh')"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
              </svg>
            </button>
            <button class="mdc-button mdc-button--raised create-btn" @click="createProject" :title="t('actions.createProject')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="projects-cards">
          <div
            v-for="project in filteredProjects"
            :key="project.RecId"
            class="mdc-card project-card"
            @click="selectProject(project)"
          >
            <div class="card-header">
              <h3 class="mdc-typography--headline6">{{ project.ProjectName }}</h3>
              <span class="status-chip" :class="`status-chip--${getStatusClass(project.Status)}`">
                {{ project.Status }}
              </span>
            </div>
            <div class="card-body">
              <p class="mdc-typography--body2 project-description">{{ project.Summary }}</p>
              <div class="project-meta">
                <div class="meta-item">
                  <span class="mdc-typography--caption text-secondary">Owner:</span>
                  <span class="mdc-typography--body2">{{ project.Owner }}</span>
                </div>
                <div class="meta-item">
                  <span class="mdc-typography--caption text-secondary">Project #:</span>
                  <span class="mdc-typography--body2">{{ project.ProjectNumber }}</span>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <span class="mdc-typography--caption date-range">
                {{ formatDate(project.ProjectStartDate) }} - {{ formatDate(project.ProjectEndDate) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- PROJECT ROADMAP VIEW -->
      <div v-else-if="showRoadmap" class="roadmap-view">
        <div class="view-toolbar mdc-card">
          <h2 class="mdc-typography--headline6">Project Roadmap</h2>
          <div class="toolbar-actions">
            <button 
              class="mdc-button mdc-button--outlined refresh-btn" 
              @click="refreshData" 
              :disabled="isLoading"
              :title="t('actions.refresh')"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
              </svg>
            </button>
            <button class="mdc-button mdc-button--raised create-btn" @click="createProject" :title="t('actions.createProject')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="roadmap-timeline">
          <div
            v-for="project in filteredProjects"
            :key="project.RecId"
            class="timeline-item"
            @click="selectProject(project)"
          >
            <div class="timeline-marker"></div>
            <div class="mdc-card timeline-content">
              <div class="card-header">
                <h4 class="mdc-typography--subtitle1">{{ project.ProjectName }}</h4>
                <span class="status-chip" :class="`status-chip--${getStatusClass(project.Status)}`">
                  {{ project.Status }}
                </span>
              </div>
              <p class="mdc-typography--body2">{{ project.Summary }}</p>
              <div class="timeline-meta">
                <span class="mdc-typography--caption">{{ project.Owner }}</span>
                <span class="mdc-typography--caption">
                  {{ formatDate(project.ProjectStartDate) }} - {{ formatDate(project.ProjectEndDate) }}
                </span>
              </div>

              <!-- Show milestones if available -->
              <div v-if="project.milestones && project.milestones.length" class="milestones-list">
                <div
                  v-for="milestone in project.milestones"
                  :key="milestone.RecId"
                  class="mdc-card milestone-item"
                  @click.stop="selectMilestone(milestone)"
                >
                  <h5 class="mdc-typography--subtitle2">{{ milestone.PhaseName }}</h5>
                  <div class="milestone-meta">
                    <span class="mdc-typography--caption">{{ milestone.Status }}</span>
                    <span class="mdc-typography--caption">{{ formatDate(milestone.DueDate) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <h3 class="mdc-typography--headline6">No projects found</h3>
        <p class="mdc-typography--body1">Get started by creating your first project.</p>
        <button class="mdc-button mdc-button--raised" @click="createProject">
          ➕ Create Project
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import { useProjectStore } from '@/stores/projectStore'
import { useMilestoneStore } from '@/stores/milestoneStore'
import { useLocalization } from '@/composables/useLocalization'
import { useToast } from '@/composables/useToast'

export default {
  name: 'ProjectsView',
  props: {
    searchQuery: String,
    activeFilters: Object,
    currentView: String
  },
  setup(props) {
    const router = useRouter()
    const appStore = useAppStore()
    const projectStore = useProjectStore()
    const milestoneStore = useMilestoneStore()
    const { t } = useLocalization()
    const { showToast, showError } = useToast()

    // State
    const projectGrid = ref(null)
    const selectedProject = ref(null)
    const selectedMilestone = ref(null)
    const milestones = ref([])

    // Computed properties - Fix the main issue by creating filteredProjects locally
    const isLoading = computed(() => projectStore.isLoading || milestoneStore.isLoading)
    const error = computed(() => projectStore.error || milestoneStore.error)
    const currentView = computed(() => appStore.currentView || 'list')
    
    // Create filteredProjects computed property that works with your existing store structure
    const filteredProjects = computed(() => {
      // Use the projects array from your existing store
      let projects = projectStore.projects || []
      
      // Apply search filter from props or appStore
      const searchQuery = props.searchQuery || appStore.searchQuery
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        projects = projects.filter(project =>
          project.ProjectName?.toLowerCase().includes(query) ||
          project.Summary?.toLowerCase().includes(query) ||
          project.Owner?.toLowerCase().includes(query) ||
          project.ProjectNumber?.toString().includes(query) ||
          project.RecId?.toString().includes(query)
        )
      }
      
      // Apply filters from props or appStore
      const filters = props.activeFilters || appStore.activeFilters || {}
      
      if (filters.status && filters.status.length > 0) {
        projects = projects.filter(project => filters.status.includes(project.Status))
      }
      
      if (filters.owner && filters.owner.length > 0) {
        projects = projects.filter(project => filters.owner.includes(project.Owner))
      }
      
      if (filters.priority && filters.priority.length > 0) {
        projects = projects.filter(project => filters.priority.includes(project.Priority))
      }
      
      return projects
    })

    const showList = computed(() => currentView.value === 'list')
    const showCard = computed(() => currentView.value === 'card')
    const showRoadmap = computed(() => currentView.value === 'roadmap')

    const breadcrumbs = computed(() => {
      const crumbs = [{ id: 'projects', name: 'Projects' }]
      
      if (selectedProject.value) {
        crumbs.push({
          id: selectedProject.value.RecId,
          name: selectedProject.value.ProjectName,
          type: 'project'
        })
      }
      
      if (selectedMilestone.value) {
        crumbs.push({
          id: selectedMilestone.value.RecId,
          name: selectedMilestone.value.PhaseName,
          type: 'milestone'
        })
      }
      
      return crumbs
    })

    // Grid Configuration
    const pageSettings = {
      pageSize: 20,
      pageSizes: [10, 20, 50, 100]
    }

    const filterSettings = {
      type: 'FilterBar'
    }

    const sortSettings = {
      columns: [{ field: 'ProjectName', direction: 'Ascending' }]
    }

    const selectionSettings = {
      mode: 'Row',
      type: 'Single'
    }

    const searchSettings = {
      fields: ['ProjectName', 'Summary', 'Owner'],
      operator: 'contains',
      key: '',
      ignoreCase: true
    }

    // Methods
    const formatDate = (date) => {
      if (!date) return 'N/A'
      return new Date(date).toLocaleDateString()
    }

    const getStatusClass = (status) => {
      switch (status?.toLowerCase()) {
        case 'active':
        case 'in progress':
          return 'active'
        case 'planning':
        case 'pending':
          return 'planning'
        case 'completed':
        case 'done':
          return 'completed'
        case 'cancelled':
        case 'on hold':
          return 'cancelled'
        default:
          return 'default'
      }
    }

    const getPriorityClass = (priority) => {
      switch (priority?.toLowerCase()) {
        case 'critical':
        case 'urgent':
          return 'critical'
        case 'high':
          return 'high'
        case 'medium':
        case 'normal':
          return 'medium'
        case 'low':
          return 'low'
        default:
          return 'medium'
      }
    }

    const selectProject = async (project) => {
      try {
        selectedProject.value = project
        selectedMilestone.value = null
        appStore.setSelectedProject(project)
        
        // Load milestones using your existing store method
        await milestoneStore.fetchMilestonesByProject(project.RecId)
        milestones.value = milestoneStore.milestones
        
        // Navigate to project detail route using RecId
        router.push(`/projects/${project.RecId}`)
      } catch (err) {
        showError('Failed to load project details')
      }
    }

    const selectMilestone = async (milestone) => {
      try {
        selectedMilestone.value = milestone
        appStore.setSelectedMilestone(milestone)
        router.push(`/projects/${selectedProject.value.RecId}/milestones/${milestone.RecId}`)
      } catch (err) {
        showError('Failed to load milestone details')
      }
    }

    const navigateTo = (crumb) => {
      if (crumb.id === 'projects') {
        selectedProject.value = null
        selectedMilestone.value = null
        appStore.setSelectedProject(null)
        appStore.setSelectedMilestone(null)
        router.push('/projects')
      } else if (crumb.type === 'project') {
        selectedMilestone.value = null
        appStore.setSelectedMilestone(null)
        router.push(`/projects/${crumb.id}`)
      } else if (crumb.type === 'milestone') {
        router.push(`/projects/${selectedProject.value.RecId}/milestones/${crumb.id}`)
      }
    }

    const loadData = async () => {
      try {
        // Use your existing store method
        await projectStore.fetchProjects()
      } catch (err) {
        showError('Failed to load projects')
      }
    }

    const refreshData = async () => {
      await loadData()
    }

    const refreshGrid = async () => {
      // Use your existing store method
      await projectStore.refreshProjects()
      if (projectGrid.value) {
        projectGrid.value.refresh()
      }
    }

    const createProject = () => {
      router.push('/projects/new')
    }

    const createMilestone = () => {
      if (selectedProject.value) {
        router.push(`/projects/${selectedProject.value.RecId}/milestones/new`)
      }
    }

    // Grid event handlers
    const onRowSelected = (args) => {
      // Handle row selection if needed
    }

    const onRowDeselected = (args) => {
      // Handle row deselection if needed
    }

    const onActionComplete = (args) => {
      // Handle grid actions completion
      if (args.requestType === 'refresh') {
        // Grid refreshed
      }
    }

    // Lifecycle hooks
    onMounted(async () => {
      if (!projectStore.projects || projectStore.projects.length === 0) {
        await loadData()
      }
    })

    // Watch for view changes
    watch(currentView, (newView) => {
      // Handle view-specific logic if needed
    })

    // Return reactive references and methods
    return {
      // Refs
      projectGrid,
      selectedProject,
      selectedMilestone,
      milestones,
      
      // Computed
      isLoading,
      error,
      currentView,
      filteredProjects, // This is the key fix - create it locally instead of relying on store
      showList,
      showCard,
      showRoadmap,
      breadcrumbs,
      
      // Grid Configuration
      pageSettings,
      filterSettings,
      sortSettings,
      selectionSettings,
      searchSettings,
      
      // Methods
      formatDate,
      getStatusClass,
      getPriorityClass,
      selectProject,
      selectMilestone,
      navigateTo,
      loadData,
      refreshData,
      refreshGrid,
      createProject,
      createMilestone,
      
      // Grid Methods
      onRowSelected,
      onRowDeselected,
      onActionComplete,
      
      // Localization
      t
    }
  }
}
</script>

<style scoped>
/* Use the Material Design styles from your global theme */
.projects-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--mdc-theme-background, #fafafa);
}

.breadcrumbs {
  padding: 16px;
  background: var(--mdc-theme-surface, #ffffff);
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  box-shadow: var(--mdc-elevation-01);
}

.breadcrumb {
  cursor: pointer;
  color: var(--mdc-theme-primary, #1976d2);
  transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.breadcrumb:hover {
  color: var(--mdc-theme-primary-variant, #1565c0);
  text-decoration: underline;
}

.view-content {
  flex: 1;
  padding: 16px;
  overflow: auto;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  text-align: center;
}

.loading-state .mdc-circular-progress {
  margin-bottom: 16px;
}

.view-toolbar.mdc-card {
  display: flex !important;
  flex-direction: row !important;
  justify-content: space-between !important;
  align-items: center !important;
  padding: 16px !important;
  margin-bottom: 16px;
  width: 100%;
  box-sizing: border-box;
  min-height: auto !important;
}

.view-toolbar.mdc-card h2 {
  margin: 0 !important;
  padding: 0 !important;
  flex: 0 0 auto !important;
  text-align: left !important;
  align-self: center !important;
  white-space: nowrap;
  order: 1;
}

.view-toolbar.mdc-card .toolbar-actions {
  display: flex !important;
  gap: 8px;
  margin-left: auto !important;
  flex-shrink: 0 !important;
  align-items: center !important;
  order: 2;
}

.project-grid {
  margin-bottom: 16px;
}

.project-name-cell {
  padding: 4px 0;
}

.project-title {
  cursor: pointer;
  margin-bottom: 4px;
  transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.project-title:hover {
  text-decoration: underline;
}

.project-id {
  opacity: 0.7;
}

/* Priority chips */
.priority-chip {
  display: inline-flex;
  align-items: center;
  padding: 0 8px;
  height: 24px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.priority-chip--critical {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #e57373;
}

.priority-chip--high {
  background-color: #fff3e0;
  color: #ef6c00;
  border: 1px solid #ffb74d;
}

.priority-chip--medium {
  background-color: #e8f5e8;
  color: #2e7d32;
  border: 1px solid #81c784;
}

.priority-chip--low {
  background-color: #e3f2fd;
  color: #1565c0;
  border: 1px solid #64b5f6;
}

/* Progress container improvements */
.progress-container {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.progress-linear {
  flex: 1;
  min-width: 60px;
}

.progress-text {
  min-width: 35px;
  text-align: right;
  font-weight: 500;
}

.create-btn {
  min-width: 40px !important;
  width: 40px;
  height: 40px;
  padding: 0 !important;
  border-radius: 50% !important;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--mdc-theme-primary, #1976d2) !important;
  color: white !important;
  box-shadow: var(--mdc-elevation-02) !important;
}

.create-btn:hover {
  box-shadow: var(--mdc-elevation-04) !important;
  transform: translateY(-1px);
}

.create-btn svg {
  transition: transform 0.2s ease;
}

.create-btn:hover svg {
  transform: scale(1.1);
}

.refresh-btn {
  min-width: 40px !important;
  width: 40px;
  height: 40px;
  padding: 0 !important;
  border-radius: 50% !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

.refresh-btn svg {
  transition: transform 0.3s ease;
}

.refresh-btn:hover svg {
  transform: rotate(90deg);
}

.refresh-btn:disabled svg {
  opacity: 0.5;
}

.action-btn {
  min-width: 36px !important;
  width: 36px;
  height: 36px;
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn svg {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.action-btn:hover svg {
  opacity: 1;
}

.projects-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;
}

.project-card {
  cursor: pointer;
  transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
  padding: 16px;
}

.project-card:hover {
  box-shadow: var(--mdc-elevation-04);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 8px;
}

.card-header h3 {
  margin: 0;
  flex: 1;
}

.card-body {
  margin-bottom: 16px;
}

.project-description {
  margin-bottom: 16px;
  line-height: 1.4;
}

.project-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-footer {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  padding-top: 16px;
  text-align: center;
}

.roadmap-timeline {
  position: relative;
  margin-top: 16px;
}

.timeline-item {
  position: relative;
  margin-bottom: 24px;
  padding-left: 40px;
  cursor: pointer;
}

.timeline-marker {
  position: absolute;
  left: 0;
  top: 8px;
  width: 16px;
  height: 16px;
  background: var(--mdc-theme-primary, #1976d2);
  border-radius: 50%;
  box-shadow: var(--mdc-elevation-02);
}

.timeline-content {
  padding: 16px;
  transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
}

.timeline-item:hover .timeline-content {
  transform: translateX(8px);
  box-shadow: var(--mdc-elevation-04);
}

.timeline-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.milestones-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 8px;
  margin-top: 16px;
}

.milestone-item {
  padding: 8px;
  cursor: pointer;
  transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
  border-left: 4px solid var(--mdc-theme-primary, #1976d2);
}

.milestone-item:hover {
  transform: translateY(-1px);
  box-shadow: var(--mdc-elevation-02);
}

.milestone-item h5 {
  margin: 0 0 4px 0;
}

.milestone-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

/* Responsive Design */
@media (max-width: 599px) {
  .view-content {
    padding: 8px;
  }
  
  .view-toolbar {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }
  
  .toolbar-actions {
    justify-content: center;
  }
  
  .projects-cards,
  .milestones-list {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .timeline-item {
    padding-left: 24px;
  }

  .timeline-marker {
    width: 12px;
    height: 12px;
  }

  .timeline-meta,
  .milestone-meta {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>