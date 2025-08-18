<!-- views/ProjectsView.vue - Clean Projects Management View with Material Design -->
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
              class="mdc-button mdc-button--outlined" 
              @click="refreshGrid" 
              :disabled="isLoading"
            >
              🔄 Refresh
            </button>
            <button class="mdc-button mdc-button--raised" @click="createProject">
              ➕ Create Project
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
              field="ProjectName"
              :headerText="t('projects.name')"
              width="300"
              :template="'projectNameTemplate'"
            />
            <e-column
              field="Description"
              :headerText="t('projects.description')"
              width="400"
            />
            <e-column
              field="Status"
              :headerText="t('projects.status')"
              width="120"
              :template="'statusTemplate'"
            />
            <e-column
              field="Owner"
              :headerText="t('projects.owner')"
              width="150"
            />
            <e-column
              field="Progress"
              :headerText="t('projects.progress')"
              width="120"
              :template="'progressTemplate'"
            />
            <e-column
              field="StartDate"
              :headerText="t('projects.startDate')"
              width="120"
              type="date"
              format="yMd"
            />
            <e-column
              field="EndDate"
              :headerText="t('projects.endDate')"
              width="120"
              type="date"
              format="yMd"
            />
            <e-column
              :headerText="t('common.actions')"
              width="100"
              :template="'actionTemplate'"
              :allowSorting="false"
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
              <div class="project-id mdc-typography--caption">
                ID: {{ data.ProjectID }}
              </div>
            </div>
          </template>

          <template #statusTemplate="{ data }">
            <span class="status-chip" :class="`status-chip--${getStatusClass(data.Status)}`">
              {{ data.Status }}
            </span>
          </template>

          <template #progressTemplate="{ data }">
            <div class="progress-container">
              <div class="progress-linear">
                <div 
                  class="progress-linear__bar" 
                  :style="{ transform: `scaleX(${(data.Progress || 0) / 100})` }"
                ></div>
              </div>
              <span class="mdc-typography--caption">{{ data.Progress || 0 }}%</span>
            </div>
          </template>

          <template #actionTemplate="{ data }">
            <button
              class="mdc-button mdc-button--outlined action-btn"
              @click="selectProject(data)"
              :title="t('actions.view')"
            >
              👁️
            </button>
          </template>
        </ejs-grid>
      </div>

      <!-- PROJECT CARD VIEW -->
      <div v-else-if="showCard" class="card-view">
        <div class="view-toolbar mdc-card">
          <h2 class="mdc-typography--headline6">Projects ({{ filteredProjects.length }})</h2>
          <div class="toolbar-actions">
            <button 
              class="mdc-button mdc-button--outlined" 
              @click="refreshData" 
              :disabled="isLoading"
            >
              🔄 Refresh
            </button>
            <button class="mdc-button mdc-button--raised" @click="createProject">
              ➕ Create Project
            </button>
          </div>
        </div>
        
        <div class="projects-cards">
          <div
            v-for="project in filteredProjects"
            :key="project.ProjectID"
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
              <p class="mdc-typography--body2 project-description">{{ project.Description }}</p>
              <div class="project-meta">
                <div class="meta-item">
                  <span class="mdc-typography--caption text-secondary">Owner:</span>
                  <span class="mdc-typography--body2">{{ project.Owner }}</span>
                </div>
                <div class="meta-item">
                  <span class="mdc-typography--caption text-secondary">Progress:</span>
                  <span class="mdc-typography--body2">{{ project.Progress || 0 }}%</span>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <span class="mdc-typography--caption date-range">
                {{ formatDate(project.StartDate) }} - {{ formatDate(project.EndDate) }}
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
              class="mdc-button mdc-button--outlined" 
              @click="refreshData" 
              :disabled="isLoading"
            >
              🔄 Refresh
            </button>
            <button class="mdc-button mdc-button--raised" @click="createProject">
              ➕ Create Project
            </button>
          </div>
        </div>

        <div class="roadmap-timeline">
          <div
            v-for="project in filteredProjects"
            :key="project.ProjectID"
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
              <p class="mdc-typography--body2">{{ project.Description }}</p>
              <div class="timeline-meta">
                <span class="mdc-typography--caption">{{ project.Owner }}</span>
                <span class="mdc-typography--caption">
                  {{ formatDate(project.StartDate) }} - {{ formatDate(project.EndDate) }}
                </span>
              </div>

              <!-- Show milestones if available -->
              <div v-if="project.milestones && project.milestones.length" class="milestones-list">
                <div
                  v-for="milestone in project.milestones"
                  :key="milestone.PhaseID"
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAppStore } from '@/stores/appStore'
import { useProjectStore } from '@/stores/projectStore'
import { useMilestoneStore } from '@/stores/milestoneStore'
import { useLocalization } from '@/composables/useLocalization'

export default {
  name: 'ProjectsView',
  setup() {
    // Core setup
    const router = useRouter()
    const toast = useToast()
    const { t } = useLocalization()
    
    // Stores
    const appStore = useAppStore()
    const projectStore = useProjectStore()
    const milestoneStore = useMilestoneStore()
    
    // Reactive data
    const projectGrid = ref(null)
    const isLoading = ref(false)
    const error = ref(null)
    const selectedProject = ref(null)
    const selectedMilestone = ref(null)
    const milestones = ref([])
    
    // Computed properties
    const currentView = computed(() => appStore.currentView)
    const filteredProjects = computed(() => projectStore.filteredProjects)
    const showList = computed(() => currentView.value === 'list')
    const showCard = computed(() => currentView.value === 'card')
    const showRoadmap = computed(() => currentView.value === 'roadmap')

    const breadcrumbs = computed(() => {
      const crumbs = [{ id: 'projects', name: 'Projects' }]
      
      if (selectedProject.value) {
        crumbs.push({
          id: selectedProject.value.ProjectID,
          name: selectedProject.value.ProjectName,
          type: 'project'
        })
      }
      
      if (selectedMilestone.value) {
        crumbs.push({
          id: selectedMilestone.value.PhaseID,
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
      fields: ['ProjectName', 'Description', 'Owner'],
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

    const selectProject = async (project) => {
      try {
        selectedProject.value = project
        selectedMilestone.value = null
        
        // Load milestones for the selected project
        await milestoneStore.fetchMilestonesByProject(project.ProjectID)
        milestones.value = milestoneStore.milestones
        
        // Navigate to project detail route
        router.push(`/projects/${project.ProjectID}`)
      } catch (err) {
        error.value = 'Failed to load project details'
        toast.error('Failed to load project details')
      }
    }

    const selectMilestone = async (milestone) => {
      try {
        selectedMilestone.value = milestone
        router.push(`/projects/${selectedProject.value.ProjectID}/milestones/${milestone.PhaseID}`)
      } catch (err) {
        error.value = 'Failed to load milestone details'
        toast.error('Failed to load milestone details')
      }
    }

    const navigateTo = (crumb) => {
      if (crumb.id === 'projects') {
        selectedProject.value = null
        selectedMilestone.value = null
        router.push('/projects')
      } else if (crumb.type === 'project') {
        selectedMilestone.value = null
        router.push(`/projects/${crumb.id}`)
      } else if (crumb.type === 'milestone') {
        router.push(`/projects/${selectedProject.value.ProjectID}/milestones/${crumb.id}`)
      }
    }

    const loadData = async () => {
      try {
        isLoading.value = true
        error.value = null
        await projectStore.fetchProjects()
      } catch (err) {
        error.value = err.message || 'Failed to load projects'
        toast.error('Failed to load projects')
      } finally {
        isLoading.value = false
      }
    }

    const refreshData = async () => {
      await loadData()
    }

    const refreshGrid = async () => {
      await loadData()
      if (projectGrid.value) {
        projectGrid.value.refresh()
      }
    }

    const createProject = () => {
      // Navigate to project creation or open dialog
      router.push('/projects/new')
    }

    const createMilestone = () => {
      if (selectedProject.value) {
        router.push(`/projects/${selectedProject.value.ProjectID}/milestones/new`)
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
      await loadData()
    })

    onUnmounted(() => {
      // Cleanup if needed
    })

    // Watch for view changes
    watch(currentView, (newView) => {
      // Handle view-specific logic if needed
    })

    // Return reactive references and methods
    return {
      // Refs
      milestones,
      error,
      projectGrid,
      
      // Stores
      appStore,
      projectStore,
      milestoneStore,
      
      // Computed
      isLoading,
      currentView,
      filteredProjects,
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
/* Component-specific styles that don't conflict with global Material Design theme */

.projects-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--mdc-theme-background);
}

/* Breadcrumbs */
.breadcrumbs {
  padding: var(--mdc-spacing-md);
  background: var(--mdc-theme-surface);
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  box-shadow: var(--mdc-elevation-01);
}

.breadcrumb {
  cursor: pointer;
  color: var(--mdc-theme-primary);
  transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.breadcrumb:hover {
  color: var(--mdc-theme-primary-variant);
  text-decoration: underline;
}

/* Content */
.view-content {
  flex: 1;
  padding: var(--mdc-spacing-md);
  overflow: auto;
}

/* Loading and Error States */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--mdc-spacing-xl);
  text-align: center;
}

.loading-state .mdc-circular-progress {
  margin-bottom: var(--mdc-spacing-md);
}

/* Toolbar */
.view-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--mdc-spacing-md);
  margin-bottom: var(--mdc-spacing-md);
}

.view-toolbar h2 {
  margin: 0;
}

.toolbar-actions {
  display: flex;
  gap: var(--mdc-spacing-sm);
}

/* Grid customizations */
.project-grid {
  margin-bottom: var(--mdc-spacing-md);
}

.project-name-cell {
  padding: var(--mdc-spacing-xs) 0;
}

.project-title {
  cursor: pointer;
  margin-bottom: var(--mdc-spacing-xs);
  transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.project-title:hover {
  text-decoration: underline;
}

.project-id {
  opacity: 0.7;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: var(--mdc-spacing-sm);
}

.progress-linear {
  flex: 1;
  min-width: 60px;
}

.action-btn {
  min-width: 36px !important;
  width: 36px;
  height: 36px;
  padding: 0 !important;
}

/* Card View */
.projects-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--mdc-spacing-md);
}

.project-card {
  cursor: pointer;
  transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
  padding: var(--mdc-spacing-md);
}

.project-card:hover {
  box-shadow: var(--mdc-elevation-04);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--mdc-spacing-md);
  gap: var(--mdc-spacing-sm);
}

.card-header h3 {
  margin: 0;
  flex: 1;
}

.card-body {
  margin-bottom: var(--mdc-spacing-md);
}

.project-description {
  margin-bottom: var(--mdc-spacing-md);
  line-height: 1.4;
}

.project-meta {
  display: flex;
  flex-direction: column;
  gap: var(--mdc-spacing-xs);
}

.meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-footer {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  padding-top: var(--mdc-spacing-md);
  text-align: center;
}

/* Roadmap View */
.roadmap-timeline {
  position: relative;
  margin-top: var(--mdc-spacing-md);
}

.timeline-item {
  position: relative;
  margin-bottom: var(--mdc-spacing-lg);
  padding-left: calc(var(--mdc-spacing-xl) + var(--mdc-spacing-sm));
  cursor: pointer;
}

.timeline-marker {
  position: absolute;
  left: 0;
  top: var(--mdc-spacing-sm);
  width: 16px;
  height: 16px;
  background: var(--mdc-theme-primary);
  border-radius: 50%;
  box-shadow: var(--mdc-elevation-02);
}

.timeline-content {
  padding: var(--mdc-spacing-md);
  transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
}

.timeline-item:hover .timeline-content {
  transform: translateX(var(--mdc-spacing-sm));
  box-shadow: var(--mdc-elevation-04);
}

.timeline-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--mdc-spacing-sm);
  flex-wrap: wrap;
  gap: var(--mdc-spacing-sm);
}

/* Milestones */
.milestones-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--mdc-spacing-sm);
  margin-top: var(--mdc-spacing-md);
}

.milestone-item {
  padding: var(--mdc-spacing-sm);
  cursor: pointer;
  transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
  border-left: 4px solid var(--mdc-theme-primary);
}

.milestone-item:hover {
  transform: translateY(-1px);
  box-shadow: var(--mdc-elevation-02);
}

.milestone-item h5 {
  margin: 0 0 var(--mdc-spacing-xs) 0;
}

.milestone-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--mdc-spacing-xs);
}

/* Responsive Design */
@media (max-width: 599px) {
  .view-content {
    padding: var(--mdc-spacing-sm);
  }
  
  .view-toolbar {
    flex-direction: column;
    gap: var(--mdc-spacing-sm);
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
    gap: var(--mdc-spacing-sm);
  }

  .timeline-item {
    padding-left: var(--mdc-spacing-lg);
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

@media (min-width: 600px) and (max-width: 1023px) {
  .projects-cards {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
  
  .milestones-list {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@media (min-width: 1024px) {
  .view-content {
    padding: var(--mdc-spacing-lg);
  }
  
  .projects-cards {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
  
  .milestones-list {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}
</style>