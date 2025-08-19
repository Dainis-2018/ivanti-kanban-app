<template>
  <div class="project-card-view">
    <!-- PROJECT CARD VIEW -->
    <div class="view-toolbar mdc-card">
      <div class="toolbar-left">
        <h2 class="mdc-typography--headline6">{{ t('projects.title') }}</h2>
        <span class="project-count mdc-typography--caption">
          {{ filteredProjects.length }} {{ t('projects.title').toLowerCase() }}
        </span>
      </div>
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

    <div class="view-content">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p class="mdc-typography--body1">{{ t('app.loading') }}</p>
      </div>

      <!-- Projects Cards -->
      <div v-else-if="filteredProjects.length > 0" class="projects-cards">
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
              <div class="meta-row">
                <span class="meta-label">{{ t('projects.owner') }}:</span>
                <span class="meta-value">{{ project.Owner }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">{{ t('projects.projectNumber') }}:</span>
                <span class="meta-value">#{{ project.ProjectNumber }}</span>
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
              <span class="mdc-typography--caption">
                {{ formatDate(project.ProjectStartDate) }} - {{ formatDate(project.ProjectEndDate) }}
              </span>
            </div>
            <div class="card-actions">
              <button 
                class="mdc-icon-button" 
                @click.stop="editProject(project)"
                :title="t('actions.edit')"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/>
                </svg>
              </button>
              <button 
                class="mdc-icon-button" 
                @click.stop="viewDetails(project)"
                :title="t('actions.viewDetails')"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
                </svg>
              </button>
              <button 
                class="mdc-icon-button delete-btn" 
                @click.stop="deleteProject(project)"
                :title="t('actions.delete')"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
        </div>
        <h3 class="mdc-typography--headline6">{{ t('projects.noProjects') }}</h3>
        <p class="mdc-typography--body1">{{ t('projects.createFirstProject') }}</p>
        <button class="mdc-button mdc-button--raised" @click="createProject">
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

    const isLoading = ref(false)

    // Access filteredProjects from parent component context
    const filteredProjects = inject('filteredProjects', computed(() => projectStore.projects))

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
      return new Date(dateString).toLocaleDateString()
    }

    const getStatusClass = (status) => {
      const statusMap = {
        'Active': 'active',
        'Planning': 'planning',
        'On Hold': 'on-hold',
        'Completed': 'completed',
        'Cancelled': 'cancelled'
      }
      return statusMap[status] || 'default'
    }

    onMounted(() => {
      if (projectStore.projects.length === 0) {
        refreshData()
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
.project-card-view {
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
  gap: 12px;
}

.toolbar-left h2 {
  margin: 0;
}

.project-count {
  background: rgba(0, 0, 0, 0.04);
  padding: 4px 8px;
  border-radius: 12px;
  color: rgba(0, 0, 0, 0.6);
}

.toolbar-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.view-content {
  flex: 1;
  overflow: auto;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  gap: 16px;
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

.projects-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  padding: 4px;
}

.project-card {
  cursor: pointer;
  transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
  padding: 24px;
  display: flex;
  flex-direction: column;
  height: fit-content;
  position: relative;
  overflow: hidden;
}

.project-card:hover {
  box-shadow: var(--mdc-elevation-08);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 12px;
}

.card-header h3 {
  margin: 0;
  flex: 1;
  line-height: 1.3;
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.project-description {
  margin: 0;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.6);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
}

.meta-label {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.meta-value {
  font-size: 14px;
  font-weight: 500;
}

.priority {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.priority--critical {
  background: #ffebee;
  color: #c62828;
}

.priority--high {
  background: #fff3e0;
  color: #f57c00;
}

.priority--medium {
  background: #e8f5e8;
  color: #2e7d32;
}

.priority--low {
  background: #e3f2fd;
  color: #1976d2;
}

.progress-section {
  margin-top: auto;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.progress-percentage {
  font-size: 14px;
  font-weight: 600;
  color: var(--mdc-theme-primary, #1976d2);
}

.progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--mdc-theme-primary, #1976d2), #42a5f5);
  transition: width 600ms cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 4px;
}

.milestone-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(0, 0, 0, 0.6);
  font-size: 14px;
}

.status-chip {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.status-chip--active {
  background: #e8f5e8;
  color: #2e7d32;
}

.status-chip--planning {
  background: #fff3e0;
  color: #f57c00;
}

.status-chip--on-hold {
  background: #fce4ec;
  color: #c2185b;
}

.status-chip--completed {
  background: #e3f2fd;
  color: #1976d2;
}

.status-chip--cancelled {
  background: #fafafa;
  color: #616161;
}

.status-chip--default {
  background: #f5f5f5;
  color: #757575;
}

.card-footer {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  padding-top: 16px;
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date-range {
  color: rgba(0, 0, 0, 0.6);
}

.card-actions {
  display: flex;
  gap: 4px;
}

.mdc-icon-button {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: rgba(0, 0, 0, 0.6);
  cursor: pointer;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.mdc-icon-button:hover {
  background: rgba(0, 0, 0, 0.04);
  color: rgba(0, 0, 0, 0.87);
}

.delete-btn:hover {
  background: #ffebee;
  color: #c62828;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  color: rgba(0, 0, 0, 0.6);
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

/* Responsive Design */
@media (max-width: 768px) {
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
  }

  .projects-cards {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .card-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .card-actions {
    align-self: stretch;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .project-card {
    padding: 16px;
  }

  .meta-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>