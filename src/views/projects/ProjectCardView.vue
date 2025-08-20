<template>
  <div class="project-card-view">
    <!-- VIEW TOOLBAR - Matches ProjectListView -->
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

      <!-- Projects Cards -->
      <div v-else-if="filteredProjects.length > 0" class="projects-cards">
        <div
          v-for="project in filteredProjects"
          :key="project.RecId"
          class="project-card"
          @click="selectProject(project)"
        >
          <div class="card-header">
            <div class="card-title-section">
              <h3 class="card-title">{{ project.ProjectName }}</h3>
              <span class="project-number">#{{ project.ProjectNumber }}</span>
            </div>
            <span class="status-chip" :class="`status-chip--${getStatusClass(project.Status)}`">
              {{ project.Status }}
            </span>
          </div>
          
          <div class="card-body">
            <p v-if="project.Summary" class="project-description">{{ project.Summary }}</p>
            
            <div class="project-details">
              <div class="detail-item">
                <span class="detail-label">{{ getLabel('projects.startDate') }}:</span>
                <span class="detail-value">{{ formatDate(project.ProjectStartDate) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">{{ getLabel('projects.endDate') }}:</span>
                <span class="detail-value">{{ formatDate(project.ProjectEndDate) }}</span>
              </div>
              <div v-if="project.ProjectManager" class="detail-item">
                <span class="detail-label">{{ getLabel('projects.manager') }}:</span>
                <span class="detail-value">{{ project.ProjectManager }}</span>
              </div>
              <div v-if="project.Owner" class="detail-item">
                <span class="detail-label">{{ getLabel('projects.owner') }}:</span>
                <span class="detail-value">{{ project.Owner }}</span>
              </div>
              <div v-if="project.Priority" class="detail-item">
                <span class="detail-label">{{ getLabel('projects.priority') }}:</span>
                <span class="detail-value">
                  <span class="priority-chip" :class="`priority-chip--${getPriorityClass(project.Priority)}`">
                    {{ project.Priority }}
                  </span>
                </span>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="progress-container">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: `${getProgressValue(project)}%` }"
                ></div>
              </div>
              <span class="progress-text">{{ getProgressValue(project) }}%</span>
            </div>
          </div>

          <div class="card-actions" @click.stop>
            <div class="action-buttons">
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
  name: 'ProjectCardView',
  setup() {
    const router = useRouter()
    const projectStore = useProjectStore()
    const { t, isLoaded, currentTranslations } = useLocalization()
    const { showToast } = useToast()

    // Reactive state
    const isLoading = ref(false)

    // Debug translations
    onMounted(() => {
      console.log('ProjectCardView - Translations loaded:', isLoaded.value)
      console.log('ProjectCardView - Current translations:', currentTranslations.value)
      console.log('ProjectCardView - Test translation:', t('projects.startDate'))
    })

    // Computed properties
    const filteredProjects = computed(() => {
      return projectStore.projects || []
    })

    // Methods
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
          'projects.startDate': 'Start Date',
          'projects.endDate': 'End Date', 
          'projects.priority': 'Priority',
          'projects.owner': 'Owner',
          'projects.manager': 'Manager',
          'actions.viewDetails': 'View Details',
          'actions.edit': 'Edit',
          'actions.delete': 'Delete',
          'actions.refresh': 'Refresh',
          'actions.createProject': 'Create Project',
          'projects.create': 'Create Project',
          'projects.title': 'Projects',
          'projects.noProjects': 'No projects found',
          'projects.createFirstProject': 'Get started by creating your first project.',
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
      filteredProjects,
      refreshData,
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
/* Uses global CSS variables and styles from main.css and syncfusion-theme.css */

/* Main Container */
.project-card-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--mdc-theme-background);
}

/* View Toolbar - Matches ProjectListView exactly */
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

/* Button Styles - Consistent with ProjectListView and main.css */
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

/* View Content */
.view-content {
  flex: 1;
  padding: 24px;
  overflow: auto;
}

/* Loading State - Matches ProjectListView */
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

/* Projects Cards Grid */
.projects-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  padding: 0;
}

/* Project Card */
.project-card {
  display: flex;
  flex-direction: column;
  background: var(--mdc-theme-surface);
  border-radius: 8px;
  box-shadow: var(--mdc-elevation-01);
  transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.project-card:hover {
  box-shadow: var(--mdc-elevation-04);
  transform: translateY(-2px);
}

/* Card Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 16px 8px 16px;
  background: var(--mdc-theme-surface);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.card-title-section {
  flex: 1;
  min-width: 0;
}

.card-title {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 500;
  color: var(--mdc-theme-text-primary-on-background);
  line-height: 1.3;
  word-wrap: break-word;
}

.project-number {
  font-size: 12px;
  color: var(--mdc-theme-text-secondary-on-background);
  font-weight: 500;
}

/* Status Chip - Consistent with ProjectListView */
.status-chip {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

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

/* Card Body */
.card-body {
  flex: 1;
  padding: 8px 16px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.project-description {
  margin: 0;
  font-size: 14px;
  color: var(--mdc-theme-text-secondary-on-background);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Project Details */
.project-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.detail-label {
  color: var(--mdc-theme-text-secondary-on-background);
  font-weight: 500;
}

.detail-value {
  color: var(--mdc-theme-text-primary-on-background);
  text-align: right;
}

/* Priority Chip - Consistent with ProjectListView */
.priority-chip {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
  display: inline-block;
}

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

/* Progress Container - Always shown and matches ProjectListView */
.progress-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
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

/* Card Actions */
.card-actions {
  padding: 8px 16px 16px 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(0, 0, 0, 0.02);
}

.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
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

/* Empty State - Matches ProjectListView */
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

  .projects-cards {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .view-content {
    padding: 16px;
  }

  .card-header {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .status-chip {
    align-self: flex-start;
  }

  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .detail-value {
    text-align: left;
    font-weight: 500;
  }
}

@media (max-width: 480px) {
  .view-content {
    padding: 12px;
  }

  .projects-cards {
    gap: 12px;
  }

  .card-header,
  .card-body,
  .card-actions {
    padding: 12px;
  }

  .btn {
    font-size: 0.75rem;
    padding: 0 12px;
    height: 32px;
  }

  .btn--icon {
    width: 28px;
    height: 28px;
    min-width: 28px;
  }
}
</style>