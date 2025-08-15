<!-- views/ProjectsView.vue - Clean Projects Management View -->
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
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Loading projects...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error">
        <h3>Error</h3>
        <p>{{ error }}</p>
        <button @click="refreshData">Retry</button>
      </div>

      <!-- PROJECT LIST VIEW with Syncfusion Grid -->
      <div v-else-if="showList" class="list-view">
        <div class="list-toolbar">
          <h2>Projects ({{ filteredProjects.length }})</h2>
          <div class="toolbar-actions">
            <button @click="refreshGrid" class="refresh-btn" :disabled="isLoading">
              🔄 Refresh
            </button>
            <button @click="createProject" class="create-btn">
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
              width="200"
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
              field="StartDate"
              :headerText="t('projects.startDate')"
              width="120"
              type="date"
              format="MMM dd, yyyy"
            />
            <e-column
              field="EndDate"
              :headerText="t('projects.endDate')"
              width="120"
              type="date"
              format="MMM dd, yyyy"
            />
            <e-column
              field="Progress"
              :headerText="t('projects.progress')"
              width="100"
              :template="'progressTemplate'"
            />
            <e-column
              :headerText="t('actions.view')"
              width="120"
              :template="'actionsTemplate'"
              :allowSorting="false"
              :allowFiltering="false"
            />
          </e-columns>

          <!-- Project Name Template -->
          <template #projectNameTemplate="{ data }">
            <div class="project-name-cell">
              <div class="project-title" @click="selectProject(data)">
                {{ data.ProjectName }}
              </div>
              <div class="project-id">
                ID: {{ data.ProjectID }}
              </div>
            </div>
          </template>

          <!-- Status Template -->
          <template #statusTemplate="{ data }">
            <span class="status-badge" :class="getStatusClass(data.Status)">
              {{ data.Status }}
            </span>
          </template>

          <!-- Progress Template -->
          <template #progressTemplate="{ data }">
            <div class="progress-container">
              <div class="progress-bar">
                <div 
                  class="progress-fill"
                  :style="{ width: `${data.Progress || 0}%` }"
                ></div>
              </div>
              <span class="progress-text">{{ data.Progress || 0 }}%</span>
            </div>
          </template>

          <!-- Actions Template -->
          <template #actionsTemplate="{ data }">
            <div class="action-buttons">
              <button
                class="action-btn view-btn"
                @click="selectProject(data)"
                :title="t('actions.view')"
              >
                👁️
              </button>
            </div>
          </template>
        </ejs-grid>
      </div>

      <!-- PROJECT CARD VIEW -->
      <div v-else-if="showCard" class="card-view">
        <div class="card-toolbar">
          <h2>Projects ({{ filteredProjects.length }})</h2>
          <div class="toolbar-actions">
            <button @click="refreshData" class="refresh-btn" :disabled="isLoading">
              🔄 Refresh
            </button>
            <button @click="createProject" class="create-btn">
              ➕ Create Project
            </button>
          </div>
        </div>
        
        <div class="projects-cards">
          <div
            v-for="project in filteredProjects"
            :key="project.ProjectID"
            class="project-card"
            @click="selectProject(project)"
          >
            <div class="card-header">
              <h3>{{ project.ProjectName }}</h3>
              <span class="status-badge" :class="getStatusClass(project.Status)">
                {{ project.Status }}
              </span>
            </div>
            <div class="card-body">
              <p class="project-description">{{ project.Description }}</p>
              <div class="project-meta">
                <div class="meta-item">
                  <span class="meta-label">Owner:</span>
                  <span class="meta-value">{{ project.Owner }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Progress:</span>
                  <span class="meta-value">{{ project.Progress || 0 }}%</span>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <span class="date-range">
                {{ formatDate(project.StartDate) }} - {{ formatDate(project.EndDate) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- PROJECT ROADMAP VIEW -->
      <div v-else-if="showRoadmap" class="roadmap-view">
        <div class="roadmap-toolbar">
          <h2>Project Roadmap</h2>
          <div class="toolbar-actions">
            <button @click="refreshData" class="refresh-btn" :disabled="isLoading">
              🔄 Refresh
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
            <div class="timeline-content">
              <h4>{{ project.ProjectName }}</h4>
              <p>{{ project.Description }}</p>
              <div class="timeline-meta">
                <span>{{ formatDate(project.StartDate) }} - {{ formatDate(project.EndDate) }}</span>
                <span class="status-badge" :class="getStatusClass(project.Status)">
                  {{ project.Status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MILESTONE/PROJECT DETAIL VIEW -->
      <div v-else-if="selectedProject && !selectedMilestone" class="project-detail">
        <div class="detail-toolbar">
          <h2>{{ selectedProject.ProjectName }} - Milestones</h2>
          <div class="toolbar-actions">
            <button @click="createMilestone" class="create-btn">
              ➕ Create Milestone
            </button>
          </div>
        </div>

        <div class="milestones-list">
          <div
            v-for="milestone in milestones"
            :key="milestone.PhaseID"
            class="milestone-item"
            @click="selectMilestone(milestone)"
          >
            <h4>{{ milestone.PhaseName }}</h4>
            <p>{{ milestone.Description }}</p>
            <div class="milestone-meta">
              <span>Start: {{ formatDate(milestone.StartDate) }}</span>
              <span>End: {{ formatDate(milestone.EndDate) }}</span>
              <span class="status-badge" :class="getStatusClass(milestone.Status)">
                {{ milestone.Status }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- TASKS/KANBAN VIEW -->
      <div v-else-if="selectedMilestone" class="tasks-view">
        <div class="detail-toolbar">
          <h2>{{ selectedMilestone.PhaseName }} - Tasks</h2>
        </div>
        
        <div class="fallback">
          <h3>Task Management Coming Soon</h3>
          <p>Kanban board for task management will be implemented here.</p>
          <ul>
            <li>Drag & drop task cards</li>
            <li>Rich text editor for descriptions</li>
            <li>Team and owner assignment</li>
            <li>Status tracking</li>
          </ul>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <h3>No Projects Found</h3>
        <p>Start by creating your first project.</p>
        <button @click="createProject" class="create-btn">Create Project</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import { useProjectStore } from '@/stores/projectStore'
import { useMilestoneStore } from '@/stores/milestoneStore'
import { useLocalization } from '@/composables/useLocalization'
import { useToast } from '@/composables/useToast'

export default {
  name: 'ProjectsView',
  props: {
    projectId: String,
    milestoneId: String,
    searchQuery: String,
    activeFilters: Object,
    currentView: String
  },
  setup(props) {
    const route = useRoute()
    const router = useRouter()
    const appStore = useAppStore()
    const projectStore = useProjectStore()
    const milestoneStore = useMilestoneStore()
    const { t } = useLocalization()
    const { showToast } = useToast()

    // State
    const selectedProject = ref(null)
    const selectedMilestone = ref(null)
    const milestones = ref([])
    const error = ref(null)
    const projectGrid = ref(null)

    // Computed
    const isLoading = computed(() => projectStore.isLoading || milestoneStore.isLoading)
    const currentView = computed(() => appStore.currentView)
    const filteredProjects = computed(() => {
      let projects = projectStore.projects
      
      // Apply search filter
      if (appStore.searchQuery) {
        const query = appStore.searchQuery.toLowerCase()
        projects = projects.filter(project =>
          project.ProjectName?.toLowerCase().includes(query) ||
          project.Description?.toLowerCase().includes(query) ||
          project.Owner?.toLowerCase().includes(query)
        )
      }
      
      // Apply additional filters
      const filters = appStore.activeFilters
      if (filters.status && filters.status.length > 0) {
        projects = projects.filter(project => filters.status.includes(project.Status))
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
          return 'status-active'
        case 'planning':
        case 'pending':
          return 'status-planning'
        case 'completed':
        case 'done':
          return 'status-completed'
        case 'cancelled':
        case 'on hold':
          return 'status-cancelled'
        default:
          return 'status-default'
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
        showToast('Failed to load project details', 'error')
      }
    }

    const selectMilestone = (milestone) => {
      selectedMilestone.value = milestone
      router.push(`/projects/${selectedProject.value.ProjectID}/milestones/${milestone.PhaseID}`)
    }

    const navigateTo = (crumb) => {
      if (crumb.id === 'projects') {
        selectedProject.value = null
        selectedMilestone.value = null
        appStore.setCurrentView('list')
        router.push('/projects')
      } else if (crumb.type === 'project') {
        selectedMilestone.value = null
        router.push(`/projects/${crumb.id}`)
      }
    }

    const loadData = async () => {
      try {
        error.value = null
        
        // Load projects
        await projectStore.fetchProjects()
        
        // Handle route parameters
        if (props.projectId) {
          const project = projectStore.projects.find(p => p.ProjectID === props.projectId)
          if (project) {
            await selectProject(project)
            
            if (props.milestoneId) {
              const milestone = milestones.value.find(m => m.PhaseID === props.milestoneId)
              if (milestone) {
                selectMilestone(milestone)
              }
            }
          }
        }
      } catch (err) {
        error.value = 'Failed to load data'
        showToast('Failed to load data', 'error')
      }
    }

    const refreshData = async () => {
      await loadData()
      showToast('Data refreshed', 'success')
    }

    const refreshGrid = () => {
      if (projectGrid.value) {
        projectGrid.value.refresh()
      }
    }

    const createProject = () => {
      showToast('Create project functionality coming soon', 'info')
    }

    const createMilestone = () => {
      showToast('Create milestone functionality coming soon', 'info')
    }

    // Grid Events
    const onRowSelected = (args) => {
      // Handle row selection if needed
    }

    const onRowDeselected = (args) => {
      // Handle row deselection if needed
    }

    const onActionComplete = (args) => {
      // Handle grid actions
    }

    // Watchers
    watch(() => route.params, (newParams) => {
      if (newParams.projectId !== props.projectId || newParams.milestoneId !== props.milestoneId) {
        loadData()
      }
    }, { immediate: false })

    // Lifecycle
    onMounted(() => {
      loadData()
    })

    return {
      // State
      selectedProject,
      selectedMilestone,
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
.projects-view {
  min-height: 100vh;
  background: #f5f5f5;
}

/* Breadcrumbs */
.breadcrumbs {
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #ddd;
  font-size: 0.875rem;
}

.breadcrumb {
  cursor: pointer;
  color: #007bff;
}

.breadcrumb:hover {
  text-decoration: underline;
}

/* Content */
.view-content {
  padding: 1rem;
}

/* Loading */
.loading {
  text-align: center;
  padding: 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error */
.error {
  text-align: center;
  padding: 2rem;
  color: #dc3545;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

/* Toolbar Styling */
.list-toolbar,
.card-toolbar,
.roadmap-toolbar,
.detail-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.list-toolbar h2,
.card-toolbar h2,
.roadmap-toolbar h2,
.detail-toolbar h2 {
  margin: 0;
  color: #333;
}

.toolbar-actions {
  display: flex;
  gap: 0.5rem;
}

.create-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.create-btn:hover {
  background: #218838;
}

.refresh-btn {
  background: #17a2b8;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.refresh-btn:hover {
  background: #138496;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Grid Styling */
.project-grid {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid #ddd;
}

/* Custom cell templates */
.project-name-cell {
  padding: 0.5rem 0;
}

.project-title {
  font-weight: 600;
  color: #007bff;
  cursor: pointer;
  margin-bottom: 0.25rem;
  line-height: 1.2;
}

.project-title:hover {
  text-decoration: underline;
}

.project-id {
  font-size: 0.75rem;
  color: #666;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  display: inline-block;
}

.status-active {
  background: #d4edda;
  color: #155724;
}

.status-planning {
  background: #fff3cd;
  color: #856404;
}

.status-completed {
  background: #cce5ff;
  color: #004085;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.status-default {
  background: #e9ecef;
  color: #495057;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #007bff;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  color: #666;
  min-width: 35px;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
}

.action-btn {
  background: none;
  border: none;
  padding: 0.25rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.action-btn:hover {
  background: #f8f9fa;
}

/* Card View */
.projects-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.project-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.card-header h3 {
  margin: 0;
  color: #333;
  flex: 1;
}

.card-body {
  margin-bottom: 1rem;
}

.project-description {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.project-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.meta-item {
  display: flex;
  justify-content: space-between;
}

.meta-label {
  font-weight: 500;
  color: #666;
}

.meta-value {
  color: #333;
}

.card-footer {
  border-top: 1px solid #eee;
  padding-top: 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: #666;
}

/* Roadmap View */
.roadmap-timeline {
  position: relative;
  margin-top: 2rem;
}

.timeline-item {
  position: relative;
  margin-bottom: 2rem;
  padding-left: 3rem;
  cursor: pointer;
}

.timeline-marker {
  position: absolute;
  left: 0;
  top: 0.5rem;
  width: 16px;
  height: 16px;
  background: #007bff;
  border-radius: 50%;
}

.timeline-content {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  transition: all 0.3s ease;
}

.timeline-item:hover .timeline-content {
  transform: translateX(8px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.timeline-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #666;
}

/* Milestones */
.milestones-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.milestone-item {
  background: white;
  border: 1px solid #ddd;
  border-left: 4px solid #007bff;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.milestone-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.milestone-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #666;
}

/* Fallback */
.fallback {
  text-align: center;
  padding: 2rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin: 2rem;
}

.fallback ul {
  text-align: left;
  display: inline-block;
  margin: 1rem 0;
}

/* Responsive */
@media (max-width: 768px) {
  .projects-cards,
  .milestones-list {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .timeline-item {
    padding-left: 2rem;
  }

  .timeline-marker {
    width: 12px;
    height: 12px;
  }

  .timeline-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .milestone-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .toolbar-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>