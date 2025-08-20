.table-header-cell,
  .table-cell {
    padding: 12px 8px;
    white-space: nowrap;
  }
}

/* Pagination Styles */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: var(--mdc-theme-surface);
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  flex-wrap: wrap;
  gap: 16px;
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.records-per-page {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-size-label {
  font-size: 14px;
  color: var(--mdc-theme-text-secondary-on-background);
  font-weight: 500;
}

.page-size-select {
  padding: 4px 8px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  background: var(--mdc-theme-surface);
  color: var(--mdc-theme-text-primary-on-background);
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.page-size-select:hover {
  border-color: var(--mdc-theme-primary);
}

.page-size-select:focus {
  outline: none;
  border-color: var(--mdc-theme-primary);
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}

.records-info {
  font-size: 14px;
  color: var(--mdc-theme-text-secondary-on-background);
}

.records-text {
  white-space: nowrap;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-btn {
  color: var(--mdc-theme-text-secondary-on-background);
}

.pagination-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.04);
  color: var(--mdc-theme-primary);
}

.pagination-<template>
  <div class="project-list-view">
    <!-- PROJECT LIST VIEW -->
    <div class="view-toolbar">
      <div class="toolbar-left">
        <h2 class="view-title">{{ getLabel('projects.title') }}</h2>
        <span class="project-count">
          {{ filteredProjects.length }} {{ getLabel('projects.title').toLowerCase() }}
        </span>
      </div>
      <div class="toolbar-actions">
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

      <!-- Projects Grid -->
      <div v-else-if="filteredProjects.length > 0" class="projects-grid">
        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr class="table-header-row">
                <th class="table-header-cell sortable" @click="sortBy('ProjectName')">
                  {{ getLabel('projects.name') }}
                  <svg v-if="sortField === 'ProjectName'" class="sort-icon" width="16" height="16" viewBox="0 0 24 24">
                    <path :d="sortDirection === 'asc' ? 'M7,14L12,9L17,14H7Z' : 'M7,10L12,15L17,10H7Z'" />
                  </svg>
                </th>
                <th class="table-header-cell sortable" @click="sortBy('Status')">
                  {{ getLabel('projects.status') }}
                  <svg v-if="sortField === 'Status'" class="sort-icon" width="16" height="16" viewBox="0 0 24 24">
                    <path :d="sortDirection === 'asc' ? 'M7,14L12,9L17,14H7Z' : 'M7,10L12,15L17,10H7Z'" />
                  </svg>
                </th>
                <th class="table-header-cell sortable" @click="sortBy('Owner')">
                  {{ getLabel('projects.owner') }}
                  <svg v-if="sortField === 'Owner'" class="sort-icon" width="16" height="16" viewBox="0 0 24 24">
                    <path :d="sortDirection === 'asc' ? 'M7,14L12,9L17,14H7Z' : 'M7,10L12,15L17,10H7Z'" />
                  </svg>
                </th>
                <th class="table-header-cell sortable" @click="sortBy('Priority')">
                  {{ getLabel('projects.priority') }}
                  <svg v-if="sortField === 'Priority'" class="sort-icon" width="16" height="16" viewBox="0 0 24 24">
                    <path :d="sortDirection === 'asc' ? 'M7,14L12,9L17,14H7Z' : 'M7,10L12,15L17,10H7Z'" />
                  </svg>
                </th>
                <th class="table-header-cell">{{ getLabel('projects.progress') }}</th>
                <th class="table-header-cell sortable" @click="sortBy('ProjectStartDate')">
                  {{ getLabel('projects.startDate') }}
                  <svg v-if="sortField === 'ProjectStartDate'" class="sort-icon" width="16" height="16" viewBox="0 0 24 24">
                    <path :d="sortDirection === 'asc' ? 'M7,14L12,9L17,14H7Z' : 'M7,10L12,15L17,10H7Z'" />
                  </svg>
                </th>
                <th class="table-header-cell sortable" @click="sortBy('ProjectEndDate')">
                  {{ getLabel('projects.endDate') }}
                  <svg v-if="sortField === 'ProjectEndDate'" class="sort-icon" width="16" height="16" viewBox="0 0 24 24">
                    <path :d="sortDirection === 'asc' ? 'M7,14L12,9L17,14H7Z' : 'M7,10L12,15L17,10H7Z'" />
                  </svg>
                </th>
                <th class="table-header-cell">{{ getLabel('actions.title') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="project in paginatedProjects"
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
                        :style="{ width: `${getProgressValue(project)}%` }"
                      ></div>
                    </div>
                    <span class="progress-text">{{ getProgressValue(project) }}%</span>
                  </div>
                </td>
                <td class="table-cell">{{ formatDate(project.ProjectStartDate) }}</td>
                <td class="table-cell">{{ formatDate(project.ProjectEndDate) }}</td>
                <td class="table-cell">
                  <div class="action-buttons" @click.stop>
                    <!-- Button order: View, Edit, Delete - matches ProjectCardView -->
                    <button 
                      class="btn btn--icon action-btn" 
                      @click="viewDetails(project)"
                      :title="getLabel('actions.viewDetails')"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
                      </svg>
                    </button>
                    <button 
                      class="btn btn--icon action-btn" 
                      @click="editProject(project)"
                      :title="getLabel('actions.edit')"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/>
                      </svg>
                    </button>
                    <button 
                      class="btn btn--icon action-btn delete-btn" 
                      @click="deleteProject(project)"
                      :title="getLabel('actions.delete')"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6Z"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div class="pagination-container">
          <div class="pagination-info">
            <div class="records-per-page">
              <label for="pageSize" class="page-size-label">{{ getLabel('pagination.recordsPerPage') }}:</label>
              <select 
                id="pageSize"
                v-model="pageSize" 
                @change="changePage(1)"
                class="page-size-select"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
            
            <div class="records-info">
              <span class="records-text">
                {{ getLabel('pagination.showing') }} 
                {{ startRecord }} - {{ endRecord }} 
                {{ getLabel('pagination.of') }} 
                {{ totalRecords }} 
                {{ getLabel('pagination.records') }}
              </span>
            </div>
          </div>

          <div class="pagination-controls">
            <button 
              class="btn btn--icon pagination-btn" 
              @click="changePage(1)"
              :disabled="currentPage === 1"
              :title="getLabel('pagination.firstPage')"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.41,16.59L13.82,12L18.41,7.41L17,6L11,12L17,18L18.41,16.59M6,6H8V18H6V6Z"/>
              </svg>
            </button>
            
            <button 
              class="btn btn--icon pagination-btn" 
              @click="changePage(currentPage - 1)"
              :disabled="currentPage === 1"
              :title="getLabel('pagination.previousPage')"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41,16.58L10.83,12L15.41,7.42L14,6L8,12L14,18L15.41,16.58Z"/>
              </svg>
            </button>

            <div class="page-numbers">
              <button
                v-for="page in visiblePages"
                :key="page"
                class="btn pagination-page-btn"
                :class="{ 'pagination-page-btn--active': page === currentPage }"
                @click="changePage(page)"
                :disabled="page === '...'"
              >
                {{ page }}
              </button>
            </div>

            <button 
              class="btn btn--icon pagination-btn" 
              @click="changePage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              :title="getLabel('pagination.nextPage')"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59,16.58L13.17,12L8.59,7.42L10,6L16,12L10,18L8.59,16.58Z"/>
              </svg>
            </button>
            
            <button 
              class="btn btn--icon pagination-btn" 
              @click="changePage(totalPages)"
              :disabled="currentPage === totalPages"
              :title="getLabel('pagination.lastPage')"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5.59,7.41L10.18,12L5.59,16.59L7,18L13,12L7,6L5.59,7.41M16,6H18V18H16V6Z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <svg class="empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
        </svg>
        <h3 class="empty-title">{{ getLabel('projects.noProjects') }}</h3>
        <p class="empty-description">{{ getLabel('projects.createFirstProject') }}</p>
        <button class="btn btn--raised" @click="createProject">
          {{ getLabel('projects.create') }}
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
    const { t, isLoaded, currentTranslations } = useLocalization()
    const { showToast } = useToast()

    const isLoading = ref(false)
    const searchQuery = ref('')
    const statusFilter = ref('')
    const ownerFilter = ref('')
    const priorityFilter = ref('')
    const sortField = ref('ProjectName')
    const sortDirection = ref('asc')
    
    // Pagination state
    const currentPage = ref(1)
    const pageSize = ref(20)

    // Debug translations
    onMounted(() => {
      console.log('ProjectListView - Translations loaded:', isLoaded.value)
      console.log('ProjectListView - Current translations:', currentTranslations.value)
      console.log('ProjectListView - Test translation:', t('projects.startDate'))
    })

    // Computed sorted projects
    const sortedProjects = computed(() => {
      let projects = [...(projectStore.projects || [])]
      
      // Apply search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        projects = projects.filter(project => 
          project.ProjectName?.toLowerCase().includes(query) ||
          project.Summary?.toLowerCase().includes(query) ||
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

    // Pagination computeds
    const totalRecords = computed(() => filteredProjects.value.length)
    const totalPages = computed(() => Math.ceil(totalRecords.value / pageSize.value))
    
    const startRecord = computed(() => {
      return totalRecords.value === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1
    })
    
    const endRecord = computed(() => {
      const end = currentPage.value * pageSize.value
      return end > totalRecords.value ? totalRecords.value : end
    })

    const paginatedProjects = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredProjects.value.slice(start, end)
    })

    const visiblePages = computed(() => {
      const pages = []
      const total = totalPages.value
      const current = currentPage.value
      const maxVisible = 7

      if (total <= maxVisible) {
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        if (current <= 4) {
          for (let i = 1; i <= 5; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(total)
        } else if (current >= total - 3) {
          pages.push(1)
          pages.push('...')
          for (let i = total - 4; i <= total; i++) {
            pages.push(i)
          }
        } else {
          pages.push(1)
          pages.push('...')
          for (let i = current - 1; i <= current + 1; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(total)
        }
      }
      return pages
    })

    const refreshData = async () => {
      isLoading.value = true
      try {
        await projectStore.fetchProjects()
        showToast(getLabel('actions.refreshSuccess') || 'Data refreshed successfully', 'success')
      } catch (error) {
        console.error('Failed to refresh projects:', error)
        showToast(getLabel('actions.refreshError') || 'Failed to refresh data', 'error')
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
      // Reset to first page when sorting
      currentPage.value = 1
    }

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
      }
    }

    const selectProject = (project) => {
      router.push(`/projects/${project.RecId}/details`)
    }

    const createProject = () => {
      router.push('/projects/create')
    }

    const editProject = (project) => {
      router.push(`/projects/${project.RecId}/edit`)
    }

    const viewDetails = (project) => {
      router.push(`/projects/${project.RecId}/details`)
    }

    const deleteProject = async (project) => {
      if (confirm(getLabel('projects.confirmDelete') || `Are you sure you want to delete '${project.ProjectName}'?`)) {
        try {
          await projectStore.deleteProject(project.RecId)
          showToast(getLabel('projects.deleteSuccess') || 'Project deleted successfully', 'success')
        } catch (error) {
          console.error('Failed to delete project:', error)
          showToast(getLabel('projects.deleteError') || 'Failed to delete project', 'error')
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

    const getPriorityClass = (priority) => {
      if (!priority) return 'unknown'
      return priority.toLowerCase().replace(/\s+/g, '-')
    }

    const getProgressValue = (project) => {
      // Try different possible property names for progress
      return project.Progress || 
             project.CompletionPercent || 
             project.ProgressPercent || 
             project.progress || 
             0
    }

    // Temporary fallback for translations until localization is fixed
    const getLabel = (key) => {
      const label = t(key)
      if (label === key) {
        // If translation failed, return hardcoded fallbacks
        const fallbacks = {
          'projects.title': 'Projects',
          'projects.name': 'Project Name',
          'projects.projectNumber': 'Project Number',
          'projects.status': 'Status',
          'projects.owner': 'Owner',
          'projects.priority': 'Priority',
          'projects.progress': 'Progress',
          'projects.startDate': 'Start Date',
          'projects.endDate': 'End Date',
          'projects.create': 'Create Project',
          'projects.noProjects': 'No projects found',
          'projects.createFirstProject': 'Get started by creating your first project.',
          'projects.confirmDelete': 'Are you sure you want to delete this project?',
          'projects.deleteSuccess': 'Project deleted successfully',
          'projects.deleteError': 'Failed to delete project',
          'actions.title': 'Actions',
          'actions.viewDetails': 'View Details',
          'actions.edit': 'Edit',
          'actions.delete': 'Delete',
          'actions.refresh': 'Refresh',
          'actions.createProject': 'Create Project',
          'actions.refreshSuccess': 'Data refreshed successfully',
          'actions.refreshError': 'Failed to refresh data',
          'app.loading': 'Loading...',
          'pagination.recordsPerPage': 'Records per page',
          'pagination.showing': 'Showing',
          'pagination.of': 'of',
          'pagination.records': 'records',
          'pagination.firstPage': 'First page',
          'pagination.previousPage': 'Previous page',
          'pagination.nextPage': 'Next page',
          'pagination.lastPage': 'Last page'
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
      filteredProjects,
      sortedProjects,
      sortField,
      sortDirection,
      currentPage,
      pageSize,
      totalRecords,
      totalPages,
      startRecord,
      endRecord,
      paginatedProjects,
      visiblePages,
      refreshData,
      sortBy,
      changePage,
      selectProject,
      createProject,
      editProject,
      viewDetails,
      deleteProject,
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
/* Uses global CSS variables and styles from main.css */
.project-list-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--mdc-theme-background);
}

/* View Toolbar - Matches ProjectCardView */
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

/* Button Styles - Matches ProjectCardView */
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
  width: 32px;
  height: 32px;
  min-width: 32px;
  padding: 0;
  border-radius: 50%;
  color: var(--mdc-theme-text-secondary-on-background);
}

.btn--icon:hover {
  background: rgba(0, 0, 0, 0.04);
  color: var(--mdc-theme-primary);
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

/* Data Table - From your example */
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
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.04);
  color: var(--mdc-theme-primary);
}

.delete-btn:hover {
  color: var(--mdc-theme-error) !important;
  background: rgba(176, 0, 32, 0.04) !important;
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

/* Pagination Styles */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: var(--mdc-theme-surface);
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  flex-wrap: wrap;
  gap: 16px;
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.records-per-page {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-size-label {
  font-size: 14px;
  color: var(--mdc-theme-text-secondary-on-background);
  font-weight: 500;
}

.page-size-select {
  padding: 4px 8px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  background: var(--mdc-theme-surface);
  color: var(--mdc-theme-text-primary-on-background);
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.page-size-select:hover {
  border-color: var(--mdc-theme-primary);
}

.page-size-select:focus {
  outline: none;
  border-color: var(--mdc-theme-primary);
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}

.records-info {
  font-size: 14px;
  color: var(--mdc-theme-text-secondary-on-background);
}

.records-text {
  white-space: nowrap;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-btn {
  color: var(--mdc-theme-text-secondary-on-background);
}

.pagination-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.04);
  color: var(--mdc-theme-primary);
}

.pagination-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 2px;
  margin: 0 8px;
}

.pagination-page-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 8px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 4px;
  color: var(--mdc-theme-text-primary-on-background);
  background: transparent;
  transition: all 0.2s ease;
}

.pagination-page-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.04);
  color: var(--mdc-theme-primary);
}

.pagination-page-btn--active {
  background: var(--mdc-theme-primary) !important;
  color: var(--mdc-theme-on-primary) !important;
}

.pagination-page-btn:disabled {
  cursor: default;
  color: var(--mdc-theme-text-hint-on-background);
}

/* Responsive Pagination */
@media (max-width: 768px) {
  .pagination-container {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .pagination-info {
    justify-content: center;
    gap: 16px;
  }

  .pagination-controls {
    justify-content: center;
  }

  .page-numbers {
    margin: 0 4px;
  }

  .pagination-page-btn {
    min-width: 32px;
    height: 32px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .pagination-container {
    padding: 12px 16px;
  }

  .records-per-page {
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .records-info {
    text-align: center;
  }

  .records-text {
    font-size: 12px;
  }

  .page-size-select {
    padding: 6px 8px;
  }
}
</style>