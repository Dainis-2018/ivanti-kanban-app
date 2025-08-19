<template>
  <div class="project-list-view">
    <!-- PROJECT LIST VIEW -->
    <div class="view-toolbar">
      <div class="toolbar-left">
        <h2 class="view-title">Projects</h2>
        <span class="project-count">
          {{ filteredProjects.length }} projects
        </span>
      </div>
      <div class="toolbar-actions">
        <button 
          class="mdc-button mdc-button--outlined refresh-btn" 
          @click="refreshData" 
          :disabled="isLoading"
          title="Refresh"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
          </svg>
        </button>
        <button 
          class="mdc-button mdc-button--raised create-btn" 
          @click="createProject" 
          title="Create Project"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="view-content">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p class="loading-text">Loading...</p>
      </div>

      <!-- Projects Grid -->
      <div v-else-if="filteredProjects.length > 0" class="projects-grid">
        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr class="table-header-row">
                <th class="table-header-cell sortable" @click="sortBy('ProjectName')">
                  Project Name
                  <svg v-if="sortField === 'ProjectName'" class="sort-icon" width="16" height="16" viewBox="0 0 24 24">
                    <path :d="sortDirection === 'asc' ? 'M7,14L12,9L17,14H7Z' : 'M7,10L12,15L17,10H7Z'" />
                  </svg>
                </th>
                <th class="table-header-cell sortable" @click="sortBy('Status')">
                  Status
                  <svg v-if="sortField === 'Status'" class="sort-icon" width="16" height="16" viewBox="0 0 24 24">
                    <path :d="sortDirection === 'asc' ? 'M7,14L12,9L17,14H7Z' : 'M7,10L12,15L17,10H7Z'" />
                  </svg>
                </th>
                <th class="table-header-cell sortable" @click="sortBy('Owner')">
                  Owner
                  <svg v-if="sortField === 'Owner'" class="sort-icon" width="16" height="16" viewBox="0 0 24 24">
                    <path :d="sortDirection === 'asc' ? 'M7,14L12,9L17,14H7Z' : 'M7,10L12,15L17,10H7Z'" />
                  </svg>
                </th>
                <th class="table-header-cell sortable" @click="sortBy('Priority')">
                  Priority
                  <svg v-if="sortField === 'Priority'" class="sort-icon" width="16" height="16" viewBox="0 0 24 24">
                    <path :d="sortDirection === 'asc' ? 'M7,14L12,9L17,14H7Z' : 'M7,10L12,15L17,10H7Z'" />
                  </svg>
                </th>
                <th class="table-header-cell">Progress</th>
                <th class="table-header-cell sortable" @click="sortBy('ProjectStartDate')">
                  Start Date
                  <svg v-if="sortField === 'ProjectStartDate'" class="sort-icon" width="16" height="16" viewBox="0 0 24 24">
                    <path :d="sortDirection === 'asc' ? 'M7,14L12,9L17,14H7Z' : 'M7,10L12,15L17,10H7Z'" />
                  </svg>
                </th>
                <th class="table-header-cell sortable" @click="sortBy('ProjectEndDate')">
                  End Date
                  <svg v-if="sortField === 'ProjectEndDate'" class="sort-icon" width="16" height="16" viewBox="0 0 24 24">
                    <path :d="sortDirection === 'asc' ? 'M7,14L12,9L17,14H7Z' : 'M7,10L12,15L17,10H7Z'" />
                  </svg>
                </th>
                <th class="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="project in sortedProjects"
                :key="project.RecId"
                class="table-row"
                @click="selectProject(project)"
              >
                <td class="table-cell">
                  <div class="project-name-cell">
                    <span class="project-name">{{ project.ProjectName }}</span>
                    <span class="project-number">#{{ project.ProjectNumber }}</span>
                  </div>
                </td>
                <td class="table-cell">
                  <span class="status-chip" :class="`status-chip--${getStatusClass(project.Status)}`">
                    {{ project.Status }}
                  </span>
                </td>
                <td class="table-cell">{{ project.Owner || '-' }}</td>
                <td class="table-cell">
                  <span class="priority-badge" :class="`priority--${(project.Priority || 'medium').toLowerCase()}`">
                    {{ project.Priority || 'Medium' }}
                  </span>
                </td>
                <td class="table-cell">
                  <div class="progress-container">
                    <div class="progress-bar">
                      <div 
                        class="progress-fill" 
                        :style="{ width: `${project.CompletionPercent || 0}%` }"
                      ></div>
                    </div>
                    <span class="progress-text">{{ project.CompletionPercent || 0 }}%</span>
                  </div>
                </td>
                <td class="table-cell">{{ formatDate(project.ProjectStartDate) }}</td>
                <td class="table-cell">{{ formatDate(project.ProjectEndDate) }}</td>
                <td class="table-cell">
                  <div class="action-buttons" @click.stop>
                    <button 
                      class="mdc-button action-btn" 
                      @click="editProject(project)"
                      title="Edit"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/>
                      </svg>
                    </button>
                    <button 
                      class="mdc-button action-btn" 
                      @click="viewDetails(project)"
                      title="View Details"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
                      </svg>
                    </button>
                    <button 
                      class="mdc-button action-btn" 
                      @click="deleteProject(project)"
                      title="Delete"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <svg class="empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
        </svg>
        <h3 class="empty-title">No Projects Found</h3>
        <p class="empty-description">Get started by creating your first project.</p>
        <button class="mdc-button mdc-button--raised" @click="createProject">
          Create Project
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/projectStore'
import { useLocalization } from '@/composables/useLocalization'
import { useToast } from '@/composables/useToast'

export default {
  name: 'ProjectListView',
  setup() {
    const router = useRouter()
    const projectStore = useProjectStore()
    const { t } = useLocalization()
    const { showToast } = useToast()

    const isLoading = ref(false)
    const searchQuery = ref('')
    const statusFilter = ref('')
    const ownerFilter = ref('')
    const priorityFilter = ref('')
    const sortField = ref('ProjectName')
    const sortDirection = ref('asc')

    // Computed sorted projects
    const sortedProjects = computed(() => {
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
      
      return projects.sort((a, b) => {
        const aVal = a[sortField.value] || ''
        const bVal = b[sortField.value] || ''
        
        if (sortDirection.value === 'asc') {
          return aVal.toString().localeCompare(bVal.toString())
        } else {
          return bVal.toString().localeCompare(aVal.toString())
        }
      })
    })

    // Use sortedProjects as filteredProjects for compatibility
    const filteredProjects = computed(() => sortedProjects.value)

    const refreshData = async () => {
      isLoading.value = true
      try {
        await projectStore.fetchProjects()
        showToast(t('actions.refreshSuccess'), 'success')
      } catch (error) {
        console.error('Failed to refresh projects:', error)
        showToast(t('actions.refreshError'), 'error')
      } finally {
        isLoading.value = false
      }
    }

    const sortBy = (field) => {
      if (sortField.value === field) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortField.value = field
        sortDirection.value = 'asc'
      }
    }

    const selectProject = (project) => {
      router.push(`/projects/${project.RecId}`)
    }

    const createProject = () => {
      router.push('/projects/new')
    }

    const editProject = (project) => {
      router.push(`/projects/${project.RecId}/edit`)
    }

    const viewDetails = (project) => {
      router.push(`/projects/${project.RecId}/details`)
    }

    const deleteProject = async (project) => {
      if (confirm(t('projects.confirmDelete', { name: project.ProjectName }))) {
        try {
          await projectStore.deleteProject(project.RecId)
          showToast(t('projects.deleteSuccess'), 'success')
        } catch (error) {
          console.error('Failed to delete project:', error)
          showToast(t('projects.deleteError'), 'error')
        }
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      
      try {
        const date = new Date(dateString)
        // Check if date is valid
        if (isNaN(date.getTime())) {
          console.warn('Invalid date:', dateString)
          return '-'
        }
        
        return date.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      } catch (error) {
        console.error('Date formatting error:', error, dateString)
        return '-'
      }
    }

    const getStatusClass = (status) => {
      if (!status) return 'unknown'
      return status.toLowerCase().replace(/\s+/g, '-')
    }

    onMounted(async () => {
      if (projectStore.projects.length === 0) {
        await refreshData()
      }
    })

    return {
      isLoading,
      filteredProjects,
      sortedProjects,
      sortField,
      sortDirection,
      refreshData,
      sortBy,
      selectProject,
      createProject,
      editProject,
      viewDetails,
      deleteProject,
      formatDate,
      getStatusClass,
      t
    }
  }
}
</script>

<style scoped>
/* Uses global CSS variables and styles from main.css */
.project-list-view {
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
  gap: 12px;
}

.view-content {
  flex: 1;
  padding: 24px;
  overflow: auto;
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

/* Data Table */
.data-table-container {
  background: var(--mdc-theme-surface);
  border-radius: 8px;
  box-shadow: var(--mdc-elevation-01);
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.table-header-row {
  background: #f5f5f5;
}

.table-header-cell {
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: var(--mdc-theme-text-primary-on-background);
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  position: relative;
}

.table-header-cell.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
}

.table-header-cell.sortable:hover {
  background: rgba(0, 0, 0, 0.04);
}

.sort-icon {
  margin-left: 8px;
  vertical-align: middle;
  opacity: 0.7;
}

.table-row {
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.table-row:hover {
  background: rgba(0, 0, 0, 0.04);
}

.table-cell {
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  color: var(--mdc-theme-text-primary-on-background);
}

.project-name-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-name {
  font-weight: 500;
  color: var(--mdc-theme-text-primary-on-background);
}

.project-number {
  font-size: 12px;
  color: var(--mdc-theme-text-secondary-on-background);
}

.status-chip {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-chip--active { background: #e8f5e8; color: #2e7d2e; }
.status-chip--completed { background: #e3f2fd; color: #1976d2; }
.status-chip--on-hold { background: #fff3e0; color: #f57c00; }
.status-chip--cancelled { background: #ffebee; color: #d32f2f; }
.status-chip--unknown { background: #f5f5f5; color: #666; }

.priority-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.priority--critical { background: #ffebee; color: #d32f2f; }
.priority--high { background: #fff3e0; color: #f57c00; }
.priority--medium { background: #e8f5e8; color: #2e7d2e; }
.priority--low { background: #f3e5f5; color: #7b1fa2; }

.progress-container {
  display: flex;
  align-items: center;
  gap: 8px;
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

.action-buttons {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  min-width: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--mdc-theme-text-secondary-on-background);
  transition: all 0.2s ease;
  border-radius: 50%;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.04);
  color: var(--mdc-theme-primary);
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

/* Responsive Design */
@media (max-width: 768px) {
  .view-toolbar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .toolbar-left {
    justify-content: center;
  }

  .toolbar-actions {
    justify-content: center;
  }

  .data-table-container {
    overflow-x: auto;
  }

  .table-header-cell,
  .table-cell {
    padding: 12px 8px;
    white-space: nowrap;
  }
}
</style>