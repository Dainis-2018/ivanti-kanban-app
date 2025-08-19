<template>
  <div class="project-card-view">
    <!-- PROJECT CARD VIEW -->
    <div class="view-toolbar">
      <div class="toolbar-left">
        <h2 class="view-title">{{ t('projects.title') }}</h2>
        <span class="project-count">
          {{ filteredProjects.length }} {{ t('projects.title').toLowerCase() }}
        </span>
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
          <span>{{ t('actions.refresh') }}</span>
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
            
            <div class="project-meta">
              <div class="meta-row">
                <span class="meta-label">{{ t('projects.owner') }}:</span>
                <span class="meta-value">{{ project.Owner || '-' }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">{{ t('projects.priority') }}:</span>
                <span class="meta-value priority" :class="`priority--${(project.Priority || 'medium').toLowerCase()}`">
                  {{ project.Priority || 'Medium' }}
                </span>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="progress-section">
              <div class="progress-header">
                <span class="progress-label">{{ t('projects.progress') }}</span>
                <span class="progress-percentage">{{ project.CompletionPercent || 0 }}%</span>
              </div>
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: `${project.CompletionPercent || 0}%` }"
                ></div>
              </div>
            </div>

            <!-- Milestone Count -->
            <div v-if="project.milestones" class="milestone-info">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
              </svg>
              <span>{{ project.milestones.length }} {{ t('milestones.title').toLowerCase() }}</span>
            </div>
          </div>
          
          <div class="card-footer">
            <div class="date-range">
              <span class="date-label">{{ formatDate(project.ProjectStartDate) }}</span>
              <span class="date-separator">—</span>
              <span class="date-label">{{ formatDate(project.ProjectEndDate) }}</span>
            </div>
            
            <div class="card-actions" @click.stop>
              <button 
                class="btn btn--icon action-btn" 
                @click="viewDetails(project)"
                :title="t('actions.viewDetails')"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
                </svg>
              </button>
              <button 
                class="btn btn--icon action-btn" 
                @click="editProject(project)"
                :title="t('actions.edit')"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/>
                </svg>
              </button>
              <button 
                class="btn btn--icon action-btn" 
                @click="deleteProject(project)"
                :title="t('actions.delete')"
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
        <h3 class="empty-title">{{ t('projects.noProjects') }}</h3>
        <p class="empty-description">{{ t('projects.createFirstProject') }}</p>
        <button class="btn btn--raised" @click="createProject">
          {{ t('projects.create') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/projectStore'
import { useLocalization } from '@/composables/useLocalization'
import { useToast } from '@/composables/useToast'

export default {
  name: 'ProjectCardView',
  setup() {
    const router = useRouter()
    const projectStore = useProjectStore()
    const { t } = useLocalization()
    const { showToast } = useToast()

    // Reactive state
    const isLoading = ref(false)

    // Computed properties
    const filteredProjects = computed(() => {
      return projectStore.projects || []
    })

    // Methods
    const refreshData = async () => {
      isLoading.value = true
      try {
        await projectStore.fetchProjects()
      } catch (error) {
        console.error('Failed to refresh projects:', error)
        showToast(t('projects.loadError'), 'error')
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
      t
    }
  }
}
</script>

<style scoped>
/* Uses global CSS variables and styles from main.css */
.project-card-view {
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

/* Projects Cards Grid */
.projects-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.project-card {
  background: var(--mdc-theme-surface);
  border-radius: 12px;
  box-shadow: var(--mdc-elevation-01);
  padding: 0;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.project-card:hover {
  box-shadow: var(--mdc-elevation-04);
  transform: translateY(-2px);
}

.card-header {
  padding: 20px 20px 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.card-title-section {
  flex: 1;
  min-width: 0;
}

.card-title {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--mdc-theme-text-primary-on-background);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.project-number {
  font-size: 12px;
  color: var(--mdc-theme-text-secondary-on-background);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-chip {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.status-chip--active { background: #e8f5e8; color: #2e7d2e; }
.status-chip--planning { background: #fff3e0; color: #e65100; }
.status-chip--on-hold { background: #f3e5f5; color: #7b1fa2; }
.status-chip--completed { background: #e3f2fd; color: #1976d2; }
.status-chip--cancelled { background: #ffebee; color: #c62828; }
.status-chip--unknown { background: #f5f5f5; color: #757575; }

.card-body {
  padding: 16px 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.project-description {
  margin: 0;
  font-size: 14px;
  color: var(--mdc-theme-text-secondary-on-background);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.project-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.meta-label {
  color: var(--mdc-theme-text-secondary-on-background);
  font-weight: 500;
}

.meta-value {
  color: var(--mdc-theme-text-primary-on-background);
  font-weight: 500;
}

.priority {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.priority--high { background: #ffebee; color: #c62828; }
.priority--medium { background: #fff3e0; color: #e65100; }
.priority--low { background: #f3e5f5; color: #7b1fa2; }
.priority--critical { background: #ffcdd2; color: #d32f2f; }

.progress-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.progress-label {
  color: var(--mdc-theme-text-secondary-on-background);
  font-weight: 500;
}

.progress-percentage {
  color: var(--mdc-theme-text-primary-on-background);
  font-weight: 600;
}

.progress-bar {
  height: 6px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--mdc-theme-primary);
  transition: width 0.3s ease;
  border-radius: 4px;
}

.milestone-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--mdc-theme-text-secondary-on-background);
  margin-top: 8px;
}

.card-footer {
  padding: 16px 20px 20px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.02);
}

.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--mdc-theme-text-secondary-on-background);
}

.date-label {
  font-weight: 500;
}

.date-separator {
  opacity: 0.5;
}

.card-actions {
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
  border: none;
  background: transparent;
  cursor: pointer;
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

  .projects-cards {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .card-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .card-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .date-range {
    justify-content: center;
  }

  .card-actions {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .view-content {
    padding: 16px;
  }

  .project-card {
    border-radius: 8px;
  }

  .card-header {
    padding: 16px 16px 0 16px;
  }

  .card-body {
    padding: 12px 16px;
  }

  .card-footer {
    padding: 12px 16px 16px 16px;
  }
}
</style>