<!-- views/ProjectsView.vue - Clean Projects Management View -->
<template>
  <div class="projects-view">
    <!-- Debug Panel -->
    <div v-if="showDebug" class="debug-panel">
      <h4>🐛 Debug Info</h4>
      <div class="debug-info">
        <p><strong>Current View:</strong> {{ currentView }} (type: {{ typeof currentView }})</p>
        <p><strong>App Store View:</strong> {{ appStore.currentView }} (type: {{ typeof appStore.currentView }})</p>
        <p><strong>Projects in Store:</strong> {{ projectStore.projects.length }}</p>
        <p><strong>Filtered Projects:</strong> {{ filteredProjects.length }}</p>
        <p><strong>Is Loading:</strong> {{ isLoading }}</p>
        <p><strong>Selected Project:</strong> {{ selectedProject?.ProjectName || 'None' }}</p>
        <p><strong>Selected Milestone:</strong> {{ selectedMilestone?.PhaseName || 'None' }}</p>
        <p><strong>Show List:</strong> {{ showList }} (conditions: !project={{ !selectedProject }}, !milestone={{ !selectedMilestone }}, view=list={{ currentView === 'list' }})</p>
        <p><strong>Show Card:</strong> {{ showCard }}</p>
        <p><strong>Show Roadmap:</strong> {{ showRoadmap }}</p>
      </div>
      <div class="debug-actions">
        <button @click="showDebug = false">Hide Debug</button>
        <button @click="setCurrentView('list')">Force List</button>
        <button @click="refreshData">Refresh</button>
        <button @click="checkAppStore">Check AppStore</button>
      </div>
    </div>

    <!-- Header -->
    <div class="view-header">
      <div class="title-section">
        <h1>{{ getViewTitle() }}</h1>
        <span class="count">({{ getItemCount() }})</span>
        <button @click="showDebug = !showDebug" class="debug-btn">🐛</button>
      </div>
      
      <div class="view-controls">
        <div class="view-buttons">
          <button 
            :class="['view-btn', { active: currentView === 'list' }]"
            @click="setCurrentView('list')"
          >
            List
          </button>
          <button 
            :class="['view-btn', { active: currentView === 'card' }]"
            @click="setCurrentView('card')"
          >
            Card
          </button>
          <button 
            :class="['view-btn', { active: currentView === 'roadmap' }]"
            @click="setCurrentView('roadmap')"
          >
            Roadmap
          </button>
        </div>
        
        <div class="action-buttons">
          <button @click="createProject" class="create-btn">+ Create Project</button>
          <button @click="refreshData" class="refresh-btn" :disabled="isLoading">🔄</button>
        </div>
      </div>
    </div>

    <!-- Breadcrumbs -->
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
          :allowFiltering="true"
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
          cssClass="project-grid"
          height="500"
        >
          <!-- Grid Columns -->
          <e-columns>
            <!-- Project Name Column -->
            <e-column
              field="ProjectName"
              headerText="Project Name"
              width="250"
              :allowFiltering="true"
              :allowSorting="true"
            >
              <template #template="{ data }">
                <div class="project-name-cell">
                  <div class="project-title" @click="selectProject(data)">
                    {{ data.ProjectName }}
                  </div>
                  <div class="project-id">ID: {{ data.ProjectId || data.RecId }}</div>
                </div>
              </template>
            </e-column>
            
            <!-- Status Column -->
            <e-column
              field="Status"
              headerText="Status"
              width="120"
              :allowFiltering="true"
              :allowSorting="true"
            >
              <template #template="{ data }">
                <span :class="['status-badge', `status-${data.Status?.toLowerCase()}`]">
                  {{ data.Status }}
                </span>
              </template>
            </e-column>
            
            <!-- Owner Column -->
            <e-column
              field="Owner"
              headerText="Owner"
              width="150"
              :allowFiltering="true"
              :allowSorting="true"
            />
            
            <!-- Start Date Column -->
            <e-column
              field="ProjectStartDate"
              headerText="Start Date"
              width="130"
              type="date"
              format="MMM dd, yyyy"
              :allowFiltering="true"
              :allowSorting="true"
            />
            
            <!-- End Date Column -->
            <e-column
              field="ProjectEndDate"
              headerText="End Date"
              width="130"
              type="date"
              format="MMM dd, yyyy"
              :allowFiltering="true"
              :allowSorting="true"
            />
            
            <!-- Summary Column -->
            <e-column
              field="Summary"
              headerText="Description"
              width="200"
              :allowFiltering="true"
              :allowSorting="false"
            >
              <template #template="{ data }">
                <div class="summary-cell" :title="data.Summary">
                  {{ data.Summary || 'No description' }}
                </div>
              </template>
            </e-column>
            
            <!-- Actions Column -->
            <e-column
              headerText="Actions"
              width="120"
              :allowFiltering="false"
              :allowSorting="false"
            >
              <template #template="{ data }">
                <div class="action-buttons">
                  <button 
                    @click="selectProject(data)"
                    class="action-btn view-btn"
                    title="View Project"
                  >
                    👁️
                  </button>
                  <button 
                    @click="editProject(data)"
                    class="action-btn edit-btn"
                    title="Edit Project"
                  >
                    ✏️
                  </button>
                  <button 
                    @click="deleteProject(data)"
                    class="action-btn delete-btn"
                    title="Delete Project"
                  >
                    🗑️
                  </button>
                </div>
              </template>
            </e-column>
          </e-columns>
        </ejs-grid>
      </div>

      <!-- PROJECT CARD VIEW -->
      <div v-else-if="showCard" class="card-view">
        <h2>Projects Card View</h2>
        
        <div v-if="filteredProjects.length === 0" class="empty-state">
          <h3>No Projects Found</h3>
        </div>
        
        <div v-else class="projects-cards">
          <div 
            v-for="project in filteredProjects" 
            :key="project.RecId || project.ProjectId"
            class="project-card"
            @click="selectProject(project)"
          >
            <h3>{{ project.ProjectName }}</h3>
            <p class="status">{{ project.Status }}</p>
            <p>{{ project.Summary }}</p>
            <p><strong>Owner:</strong> {{ project.Owner }}</p>
          </div>
        </div>
      </div>

      <!-- PROJECT ROADMAP VIEW -->
      <div v-else-if="showRoadmap" class="roadmap-view">
        <h2>Projects Roadmap View</h2>
        
        <div v-if="filteredProjects.length === 0" class="empty-state">
          <h3>No Projects Found</h3>
        </div>
        
        <div v-else class="roadmap-timeline">
          <div 
            v-for="project in filteredProjects" 
            :key="project.RecId || project.ProjectId"
            class="timeline-item"
            @click="selectProject(project)"
          >
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <h4>{{ project.ProjectName }}</h4>
              <p>{{ project.Summary }}</p>
              <span>{{ formatDate(project.ProjectStartDate) }} - {{ formatDate(project.ProjectEndDate) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- MILESTONE VIEW -->
      <div v-else-if="selectedProject && !selectedMilestone" class="milestone-view">
        <h2>Milestones for {{ selectedProject.ProjectName }}</h2>
        
        <div v-if="milestones.length === 0" class="empty-state">
          <h3>No Milestones Found</h3>
          <button @click="createMilestone">Create Milestone</button>
        </div>
        
        <div v-else class="milestones-list">
          <div 
            v-for="milestone in milestones" 
            :key="milestone.RecId || milestone.PhaseId"
            class="milestone-item"
            @click="selectMilestone(milestone)"
          >
            <h4>{{ milestone.PhaseName }}</h4>
            <p>{{ milestone.Status }}</p>
            <p>{{ formatDate(milestone.StartDate) }} - {{ formatDate(milestone.EndDate) }}</p>
          </div>
        </div>
      </div>

      <!-- TASK VIEW -->
      <div v-else-if="selectedMilestone" class="task-view">
        <h2>Tasks for {{ selectedMilestone.PhaseName }}</h2>
        <p>Kanban board would go here</p>
      </div>

      <!-- FALLBACK -->
      <div v-else class="fallback">
        <h3>No Content Available</h3>
        <p>Debug Info:</p>
        <ul>
          <li>Current View: {{ currentView }}</li>
          <li>Show List: {{ showList }}</li>
          <li>Show Card: {{ showCard }}</li>
          <li>Show Roadmap: {{ showRoadmap }}</li>
          <li>Selected Project: {{ !!selectedProject }}</li>
          <li>Projects Count: {{ projectStore.projects.length }}</li>
          <li>Filtered Count: {{ filteredProjects.length }}</li>
        </ul>
        <button @click="forceReset">Reset to List View</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import { useProjectStore } from '@/stores/projectStore'
import { useMilestoneStore } from '@/stores/milestoneStore'
import { useLocalization } from '@/composables/useLocalization'
import { useFilters } from '@/composables/useFilters'
import { useToast } from '@/composables/useToast'

export default {
  name: 'ProjectsView',
  props: {
    projectId: String,
    milestoneId: String
  },
  setup(props) {
    const router = useRouter()
    const appStore = useAppStore()
    const projectStore = useProjectStore()
    const milestoneStore = useMilestoneStore()
    const { t } = useLocalization()
    const { showSuccess, showError } = useToast()

    // Local state
    const selectedProject = ref(null)
    const selectedMilestone = ref(null)
    const milestones = ref([])
    const showDebug = ref(false)
    const error = ref(null)
    const projectGrid = ref(null)

    // Setup filtering
    const filters = useFilters(
      computed(() => projectStore.projects || []),
      {}
    )

    // Grid configuration
    const pageSettings = {
      pageSize: 20,
      pageSizes: [10, 20, 50, 100],
      showTotalPages: true
    }

    const filterSettings = {
      type: 'FilterBar',
      showFilterBarStatus: true
    }

    const sortSettings = {
      columns: [
        { field: 'ProjectName', direction: 'Ascending' }
      ]
    }

    const selectionSettings = {
      mode: 'Row',
      type: 'Single'
    }

    const searchSettings = {
      fields: ['ProjectName', 'Owner', 'Summary'],
      operator: 'contains',
      key: '',
      ignoreCase: true
    }

    // Computed properties
    const isLoading = computed(() => projectStore.isLoading || milestoneStore.isLoading)
    const currentView = computed(() => appStore.currentView || 'list')
    const filteredProjects = computed(() => filters.filteredItems.value || [])

    // View conditions
    const showList = computed(() => {
      return !selectedProject.value && !selectedMilestone.value && currentView.value === 'list'
    })

    const showCard = computed(() => {
      return !selectedProject.value && !selectedMilestone.value && currentView.value === 'card'
    })

    const showRoadmap = computed(() => {
      return !selectedProject.value && !selectedMilestone.value && currentView.value === 'roadmap'
    })

    const breadcrumbs = computed(() => {
      const crumbs = [{ id: 'projects', name: 'Projects' }]
      
      if (selectedProject.value) {
        crumbs.push({
          id: selectedProject.value.ProjectId || selectedProject.value.RecId,
          name: selectedProject.value.ProjectName,
          type: 'project'
        })
      }
      
      if (selectedMilestone.value) {
        crumbs.push({
          id: selectedMilestone.value.PhaseId || selectedMilestone.value.RecId,
          name: selectedMilestone.value.PhaseName,
          type: 'milestone'
        })
      }
      
      return crumbs
    })

    // Methods
    const getViewTitle = () => {
      if (selectedMilestone.value) {
        return `Tasks - ${selectedMilestone.value.PhaseName}`
      } else if (selectedProject.value) {
        return `Milestones - ${selectedProject.value.ProjectName}`
      } else {
        return 'Projects'
      }
    }

    const getItemCount = () => {
      if (selectedMilestone.value) {
        return milestones.value.length
      } else if (selectedProject.value) {
        return milestones.value.length
      } else {
        return filteredProjects.value.length
      }
    }

    const setCurrentView = (view) => {
      console.log(`Setting view to: ${view}`)
      appStore.setCurrentView(view)
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      try {
        return new Date(dateString).toLocaleDateString()
      } catch {
        return dateString
      }
    }

    const selectProject = async (project) => {
      console.log('Selecting project:', project.ProjectName)
      selectedProject.value = project
      
      try {
        const projectMilestones = await milestoneStore.fetchMilestonesByProject(
          project.ProjectId || project.RecId
        )
        milestones.value = projectMilestones
      } catch (err) {
        console.error('Failed to load milestones:', err)
        showError('Failed to load milestones')
      }
      
      router.push({ 
        name: 'project-details', 
        params: { projectId: project.ProjectId || project.RecId }
      })
    }

    const selectMilestone = (milestone) => {
      console.log('Selecting milestone:', milestone.PhaseName)
      selectedMilestone.value = milestone
      
      router.push({ 
        name: 'milestone-tasks', 
        params: { 
          projectId: selectedProject.value.ProjectId || selectedProject.value.RecId,
          milestoneId: milestone.PhaseId || milestone.RecId
        }
      })
    }

    const navigateTo = (crumb) => {
      if (crumb.id === 'projects') {
        selectedProject.value = null
        selectedMilestone.value = null
        router.push({ name: 'projects' })
      } else if (crumb.type === 'project') {
        selectedMilestone.value = null
        router.push({ 
          name: 'project-details', 
          params: { projectId: crumb.id }
        })
      }
    }

    const loadData = async () => {
      console.log('Loading data...')
      error.value = null
      
      try {
        // Ensure default view is set to 'list'
        if (!appStore.currentView || appStore.currentView === '') {
          console.log('Setting default view to list')
          appStore.setCurrentView('list')
        }
        
        // Force list view if no specific view is set
        await nextTick()
        
        // Load projects
        await projectStore.fetchProjects()
        console.log(`Loaded ${projectStore.projects.length} projects`)
        console.log('Current view after load:', appStore.currentView)
        console.log('Show list condition:', showList.value)
        
        // Handle route parameters
        if (props.projectId) {
          const project = projectStore.projects.find(p => 
            (p.ProjectId === props.projectId) || (p.RecId === props.projectId)
          )
          if (project) {
            await selectProject(project)
            
            if (props.milestoneId) {
              const milestone = milestones.value.find(m => 
                (m.PhaseId === props.milestoneId) || (m.RecId === props.milestoneId)
              )
              if (milestone) {
                selectMilestone(milestone)
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to load data:', err)
        error.value = err.message || 'Failed to load data'
        showError(error.value)
      }
    }

    const refreshData = async () => {
      await loadData()
      showSuccess('Data refreshed')
    }

    const forceReset = () => {
      selectedProject.value = null
      selectedMilestone.value = null
      milestones.value = []
      appStore.setCurrentView('list')
      showSuccess('Reset to list view')
    }

    const checkAppStore = () => {
      console.log('AppStore debug:')
      console.log('  currentView:', appStore.currentView)
      console.log('  all appStore state:', appStore.$state)
      showDebug.value = true
    }

    // Grid event handlers
    const onRowSelected = (args) => {
      console.log('Row selected:', args.data)
      // Optional: Auto-select project on row click
      // selectProject(args.data)
    }

    const onRowDeselected = (args) => {
      console.log('Row deselected:', args.data)
    }

    const onActionComplete = (args) => {
      if (args.requestType === 'refresh') {
        console.log('Grid refreshed')
      }
      if (args.requestType === 'filtering') {
        console.log('Grid filtered')
      }
      if (args.requestType === 'sorting') {
        console.log('Grid sorted')
      }
    }

    const refreshGrid = () => {
      if (projectGrid.value) {
        projectGrid.value.refresh()
      }
      refreshData()
    }

    // Placeholder methods
    const createProject = () => {
      showSuccess('Create project dialog would open')
    }

    const createMilestone = () => {
      showSuccess('Create milestone dialog would open')
    }

    const editProject = (project) => {
      showSuccess(`Edit project: ${project.ProjectName}`)
    }

    const deleteProject = (project) => {
      if (confirm(`Delete ${project.ProjectName}?`)) {
        showSuccess(`Delete project: ${project.ProjectName}`)
      }
    }

    // Watchers
    watch([() => props.projectId, () => props.milestoneId], loadData)

    // Debug watcher
    watch([currentView, filteredProjects, showList, showCard, showRoadmap], () => {
      console.log('View state changed:', {
        currentView: currentView.value,
        filteredProjects: filteredProjects.value.length,
        showList: showList.value,
        showCard: showCard.value,
        showRoadmap: showRoadmap.value
      })
    }, { immediate: true })

    // Lifecycle
    onMounted(async () => {
      console.log('ProjectsView mounted')
      
      // Force set the view to list initially
      console.log('Initial appStore.currentView:', appStore.currentView)
      appStore.setCurrentView('list')
      await nextTick()
      console.log('After setting to list:', appStore.currentView)
      
      await loadData()
      
      // Add debug functions to window
      if (import.meta.env.DEV) {
        window.debugProjects = () => {
          console.log('=== PROJECT DEBUG ===')
          console.log('Projects in store:', projectStore.projects.length)
          console.log('Filtered projects:', filteredProjects.value.length)
          console.log('Current view:', currentView.value)
          console.log('App store view:', appStore.currentView)
          console.log('Show list:', showList.value)
          console.log('Show card:', showCard.value)
          console.log('Show roadmap:', showRoadmap.value)
          console.log('Selected project:', selectedProject.value?.ProjectName)
          console.log('Selected milestone:', selectedMilestone.value?.PhaseName)
          console.log('Is loading:', isLoading.value)
        }
        
        window.forceListView = () => {
          selectedProject.value = null
          selectedMilestone.value = null
          appStore.setCurrentView('list')
          console.log('Forced to list view')
        }
        
        console.log('Debug functions available: debugProjects(), forceListView()')
      }
    })

    return {
      // State
      selectedProject,
      selectedMilestone,
      milestones,
      showDebug,
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
      getViewTitle,
      getItemCount,
      setCurrentView,
      formatDate,
      selectProject,
      selectMilestone,
      navigateTo,
      loadData,
      refreshData,
      forceReset,
      createProject,
      createMilestone,
      editProject,
      deleteProject,
      checkAppStore,
      
      // Grid Methods
      onRowSelected,
      onRowDeselected,
      onActionComplete,
      refreshGrid
    }
  }
}
</script>

<style scoped>
.projects-view {
  min-height: 100vh;
  background: #f5f5f5;
}

/* Debug Panel */
.debug-panel {
  background: #fff3cd;
  border: 2px solid #ffc107;
  padding: 1rem;
  margin: 1rem;
  border-radius: 8px;
}

.debug-info p {
  margin: 0.25rem 0;
  font-size: 0.875rem;
}

.debug-actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
}

.debug-actions button {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
}

/* Header */
.view-header {
  background: white;
  padding: 1rem;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-section h1 {
  margin: 0;
  font-size: 1.5rem;
}

.count {
  background: #e9ecef;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.875rem;
  color: #666;
}

.debug-btn {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.25rem;
}

.view-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.view-buttons {
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-btn:hover {
  background: #f8f9fa;
}

.view-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.action-buttons {
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

.refresh-btn {
  background: #17a2b8;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

/* Grid Styling */
.list-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.list-toolbar h2 {
  margin: 0;
  color: #333;
}

.toolbar-actions {
  display: flex;
  gap: 0.5rem;
}

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

.status-on-hold,
.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.summary-cell {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #666;
  font-size: 0.875rem;
  line-height: 1.4;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
}

.action-btn {
  padding: 0.25rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: transparent;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: #f8f9fa;
  transform: scale(1.1);
}

.view-btn:hover {
  background: #e3f2fd;
}

.edit-btn:hover {
  background: #fff3cd;
}

.delete-btn:hover {
  background: #f8d7da;
}

/* Syncfusion Grid Customizations */
.project-grid .e-grid .e-content {
  overflow: auto;
}

.project-grid .e-grid .e-gridheader {
  background: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}

.project-grid .e-grid .e-columnheader {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
  border-right: 1px solid #dee2e6;
}

.project-grid .e-grid .e-row {
  border-bottom: 1px solid #f1f3f4;
}

.project-grid .e-grid .e-row:hover {
  background: #f8f9fa;
}

.project-grid .e-grid .e-selectionbackground {
  background: #e3f2fd !important;
}

.project-grid .e-grid .e-altrow {
  background: #fafafa;
}

/* Filter bar styling */
.project-grid .e-filterbarcell {
  border-right: 1px solid #dee2e6;
}

.project-grid .e-filterbarcell input {
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 0.375rem 0.5rem;
  font-size: 0.875rem;
}

.project-grid .e-filterbarcell input:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  outline: none;
}

/* Pagination styling */
.project-grid .e-pager {
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
  padding: 0.75rem;
}

.project-grid .e-pager .e-pagercontainer {
  color: #495057;
}

/* Empty State */
.list-view .e-emptyrecord {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.list-view .e-emptyrecord::before {
  content: "📁";
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

/* Cards View */
.projects-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.project-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.2);
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
  .view-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .view-controls {
    flex-direction: column;
    gap: 1rem;
  }

  /* Mobile list view - stack vertically */
  .list-header {
    display: none; /* Hide header on mobile */
  }

  .project-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 1rem;
    border-bottom: 2px solid #eee;
  }

  .project-row .project-name h4 {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }

  .project-row .project-status,
  .project-row .project-owner,
  .project-row .project-dates {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .project-row .project-status::before {
    content: "Status:";
    font-weight: 600;
    color: #666;
    font-size: 0.875rem;
  }

  .project-row .project-owner::before {
    content: "Owner:";
    font-weight: 600;
    color: #666;
    font-size: 0.875rem;
  }

  .project-row .project-dates::before {
    content: "Timeline:";
    font-weight: 600;
    color: #666;
    font-size: 0.875rem;
  }

  .project-actions {
    justify-content: flex-start;
    margin-top: 0.5rem;
  }

  .projects-cards,
  .milestones-list {
    grid-template-columns: 1fr;
  }

  .date-range {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }
}
</style>