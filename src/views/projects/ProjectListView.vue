<template>
  <div class="project-list-view">
    <!-- PROJECT LIST VIEW -->
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

      <!-- Projects Grid -->
      <div v-else-if="filteredProjects.length > 0" class="projects-grid">
        <div class="mdc-data-table">
          <div class="mdc-data-table__table-container">
            <table class="mdc-data-table__table">
              <thead>
                <tr class="mdc-data-table__header-row">
                  <th class="mdc-data-table__header-cell" role="columnheader" scope="col">
                    {{ t('projects.name') }}
                  </th>
                  <th class="mdc-data-table__header-cell" role="columnheader" scope="col">
                    {{ t('projects.status') }}
                  </th>
                  <th class="mdc-data-table__header-cell" role="columnheader" scope="col">
                    {{ t('projects.owner') }}
                  </th>
                  <th class="mdc-data-table__header-cell" role="columnheader" scope="col">
                    {{ t('projects.startDate') }}
                  </th>
                  <th class="mdc-data-table__header-cell" role="columnheader" scope="col">
                    {{ t('projects.endDate') }}
                  </th>
                  <th class="mdc-data-table__header-cell" role="columnheader" scope="col">
                    {{ t('projects.progress') }}
                  </th>
                  <th class="mdc-data-table__header-cell" role="columnheader" scope="col">
                    {{ t('actions.title') }}
                  </th>
                </tr>
              </thead>
              <tbody class="mdc-data-table__content">
                <tr 
                  v-for="project in filteredProjects" 
                  :key="project.RecId"
                  class="mdc-data-table__row"
                  @click="selectProject(project)"
                >
                  <td class="mdc-data-table__cell">
                    <div class="project-cell">
                      <div class="project-name">{{ project.ProjectName }}</div>
                      <div class="project-number mdc-typography--caption">
                        #{{ project.ProjectNumber }}
                      </div>
                    </div>
                  </td>
                  <td class="mdc-data-table__cell">
                    <span class="status-chip" :class="`status-chip--${getStatusClass(project.Status)}`">
                      {{ project.Status }}
                    </span>
                  </td>
                  <td class="mdc-data-table__cell">{{ project.Owner }}</td>
                  <td class="mdc-data-table__cell">{{ formatDate(project.ProjectStartDate) }}</td>
                  <td class="mdc-data-table__cell">{{ formatDate(project.ProjectEndDate) }}</td>
                  <td class="mdc-data-table__cell">
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
                  <td class="mdc-data-table__cell">
                    <div class="action-buttons">
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
                        @click.stop="deleteProject(project)"
                        :title="t('actions.delete')"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
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
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
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
  name: 'ProjectListView',
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
      deleteProject,
      formatDate,
      getStatusClass,
      t
    }
  }
}
</script>

<style scoped>
.project-list-view {
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

.projects-grid {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--mdc-elevation-01);
}

.mdc-data-table__row {
  cursor: pointer;
  transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.mdc-data-table__row:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.project-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-name {
  font-weight: 500;
}

.project-number {
  color: rgba(0, 0, 0, 0.6);
}

.status-chip {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

.progress-container {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--mdc-theme-primary, #1976d2);
  transition: width 300ms ease;
}

.progress-text {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  min-width: 32px;
}

.action-buttons {
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
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 8px 0;
}

.empty-state p {
  margin: 0 0 24px 0;
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

  .mdc-data-table__table {
    font-size: 14px;
  }

  .progress-container {
    width: 80px;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>