<template>
  <div class="project-detail-view">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>{{ t('app.loading') }}</p>
    </div>

    <!-- Project Details -->
    <div v-else-if="project" class="project-details">
      <!-- Header -->
      <div class="detail-header">
        <div class="header-content">
          <div class="header-left">
            <button class="back-button" @click="goBack">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
              </svg>
              {{ t('actions.back') }}
            </button>
            <div class="project-info">
              <h1 class="project-title">{{ project.ProjectName }}</h1>
              <div class="project-meta">
                <span class="project-number">#{{ project.ProjectNumber }}</span>
                <span class="status-chip" :class="`status-chip--${getStatusClass(project.Status)}`">
                  {{ project.Status }}
                </span>
              </div>
            </div>
          </div>
          <div class="header-actions">
            <button class="mdc-button mdc-button--outlined" @click="editProject">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/>
              </svg>
              {{ t('actions.edit') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="detail-content">
        <!-- Overview Card -->
        <div class="detail-card">
          <h2 class="card-title">{{ t('projects.overview') }}</h2>
          <div class="overview-grid">
            <div class="overview-item">
              <label>{{ t('projects.owner') }}</label>
              <span>{{ project.Owner || 'Unassigned' }}</span>
            </div>
            <div class="overview-item">
              <label>{{ t('projects.priority') }}</label>
              <span class="priority" :class="`priority--${(project.Priority || 'medium').toLowerCase()}`">
                {{ project.Priority || 'Medium' }}
              </span>
            </div>
            <div class="overview-item">
              <label>{{ t('projects.startDate') }}</label>
              <span>{{ formatDate(project.ProjectStartDate) }}</span>
            </div>
            <div class="overview-item">
              <label>{{ t('projects.endDate') }}</label>
              <span>{{ formatDate(project.ProjectEndDate) }}</span>
            </div>
            <div class="overview-item progress-item">
              <label>{{ t('projects.progress') }}</label>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: `${project.CompletionPercent || 0}%` }"></div>
                </div>
                <span class="progress-text">{{ project.CompletionPercent || 0 }}%</span>
              </div>
            </div>
          </div>
          
          <div v-if="project.Summary" class="project-description">
            <label>{{ t('projects.description') }}</label>
            <p>{{ project.Summary }}</p>
          </div>
        </div>

        <!-- Milestones Card -->
        <div class="detail-card">
          <div class="card-header">
            <h2 class="card-title">{{ t('milestones.title') }}</h2>
            <button class="mdc-button mdc-button--outlined" @click="createMilestone">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
              </svg>
              {{ t('milestones.create') }}
            </button>
          </div>
          
          <div v-if="project.milestones && project.milestones.length" class="milestones-list">
            <div
              v-for="milestone in project.milestones"
              :key="milestone.RecId"
              class="milestone-item"
              @click="viewMilestone(milestone)"
            >
              <div class="milestone-header">
                <h3>{{ milestone.PhaseName }}</h3>
                <span class="milestone-status" :class="`status--${(milestone.Status || 'planning').toLowerCase()}`">
                  {{ milestone.Status || 'Planning' }}
                </span>
              </div>
              <div class="milestone-meta">
                <span class="milestone-date">{{ formatDate(milestone.DueDate) }}</span>
                <span class="milestone-progress">{{ milestone.CompletionPercent || 0 }}%</span>
              </div>
            </div>
          </div>
          
          <div v-else class="empty-state">
            <p>{{ t('milestones.noMilestones') }}</p>
            <button class="mdc-button mdc-button--raised" @click="createMilestone">
              {{ t('milestones.create') }}
            </button>
          </div>
        </div>

        <!-- Tasks Card -->
        <div class="detail-card">
          <div class="card-header">
            <h2 class="card-title">{{ t('tasks.title') }}</h2>
            <button class="mdc-button mdc-button--outlined" @click="createTask">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
              </svg>
              {{ t('tasks.create') }}
            </button>
          </div>
          
          <div v-if="allTasks.length" class="tasks-preview">
            <div
              v-for="task in allTasks.slice(0, 5)"
              :key="task.RecId"
              class="task-item"
            >
              <div class="task-content">
                <h4>{{ task.Subject || task.TaskName }}</h4>
                <div class="task-meta">
                  <span class="task-status">{{ task.Status }}</span>
                  <span class="task-assignee">{{ task.AssignedTo || 'Unassigned' }}</span>
                </div>
              </div>
            </div>
            
            <div v-if="allTasks.length > 5" class="show-more">
              <button class="mdc-button" @click="viewAllTasks">
                {{ t('tasks.viewAll') }} ({{ allTasks.length }})
              </button>
            </div>
          </div>
          
          <div v-else class="empty-state">
            <p>{{ t('tasks.noTasks') }}</p>
            <button class="mdc-button mdc-button--raised" @click="createTask">
              {{ t('tasks.create') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="error-state">
      <h2>{{ t('projects.notFound') }}</h2>
      <p>{{ t('projects.notFoundDescription') }}</p>
      <button class="mdc-button mdc-button--raised" @click="goBack">
        {{ t('actions.back') }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProjectStore } from '@/stores/projectStore'
import { useLocalization } from '@/composables/useLocalization'
import { useToast } from '@/composables/useToast'

export default {
  name: 'ProjectDetailView',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const projectStore = useProjectStore()
    const { t } = useLocalization()
    const { showToast } = useToast()

    const isLoading = ref(false)
    const project = ref(null)

    const allTasks = computed(() => {
      if (!project.value?.milestones) return []
      
      return project.value.milestones.reduce((tasks, milestone) => {
        if (milestone.tasks) {
          tasks.push(...milestone.tasks)
        }
        return tasks
      }, [])
    })

    const fetchProject = async () => {
      const projectId = route.params.id
      if (!projectId) return

      isLoading.value = true
      
      try {
        const projectData = await projectStore.fetchProjectById(projectId)
        project.value = projectData
      } catch (error) {
        console.error('Failed to fetch project:', error)
        showToast(t('projects.loadError'), 'error')
      } finally {
        isLoading.value = false
      }
    }

    const goBack = () => {
      router.push('/projects')
    }

    const editProject = () => {
      router.push(`/projects/${project.value.RecId}/edit`)
    }

    const createMilestone = () => {
      // Navigate to milestone creation with project context
      router.push(`/projects/${project.value.RecId}/milestones/new`)
    }

    const viewMilestone = (milestone) => {
      router.push(`/milestones/${milestone.RecId}`)
    }

    const createTask = () => {
      // Navigate to task creation with project context
      router.push(`/projects/${project.value.RecId}/tasks/new`)
    }

    const viewAllTasks = () => {
      router.push(`/projects/${project.value.RecId}/tasks`)
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
      fetchProject()
    })

    return {
      isLoading,
      project,
      allTasks,
      goBack,
      editProject,
      createMilestone,
      viewMilestone,
      createTask,
      viewAllTasks,
      formatDate,
      getStatusClass,
      t
    }
  }
}
</script>

<style scoped>
.project-detail-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top: 3px solid var(--mdc-theme-primary, #1976d2);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.detail-header {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: var(--mdc-elevation-01);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.header-left {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: none;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.6);
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.back-button:hover {
  background: rgba(0, 0, 0, 0.04);
  color: rgba(0, 0, 0, 0.87);
}

.project-info {
  flex: 1;
}

.project-title {
  margin: 0 0 8px 0;
  font-size: 2rem;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.87);
}

.project-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.project-number {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  background: rgba(0, 0, 0, 0.04);
  padding: 4px 8px;
  border-radius: 12px;
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

.status-chip--active { background: #e8f5e8; color: #2e7d32; }
.status-chip--planning { background: #fff3e0; color: #f57c00; }
.status-chip--on-hold { background: #fce4ec; color: #c2185b; }
.status-chip--completed { background: #e3f2fd; color: #1976d2; }
.status-chip--cancelled { background: #fafafa; color: #616161; }

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: var(--mdc-elevation-01);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.overview-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.overview-item label {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.overview-item span {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.87);
}

.priority {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.priority--critical { background: #ffebee; color: #c62828; }
.priority--high { background: #fff3e0; color: #f57c00; }
.priority--medium { background: #e8f5e8; color: #2e7d32; }
.priority--low { background: #e3f2fd; color: #1976d2; }

.progress-container {
  display: flex;
  align-items: center;
  gap: 8px;
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

.project-description {
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.project-description label {
  display: block;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
  margin-bottom: 8px;
}

.project-description p {
  margin: 0;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.87);
}

.milestones-list,
.tasks-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.milestone-item,
.task-item {
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 6px;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.milestone-item:hover,
.task-item:hover {
  background: rgba(0, 0, 0, 0.02);
  border-color: rgba(0, 0, 0, 0.12);
}

.milestone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.milestone-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
}

.milestone-status {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status--planning { background: #fff3e0; color: #f57c00; }
.status--active { background: #e8f5e8; color: #2e7d32; }
.status--completed { background: #e3f2fd; color: #1976d2; }
.status--on-hold { background: #fce4ec; color: #c2185b; }

.milestone-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
}

.task-content h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
}

.task-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
}

.empty-state {
  text-align: center;
  padding: 32px;
  color: rgba(0, 0, 0, 0.6);
}

.empty-state p {
  margin: 0 0 16px 0;
}

.show-more {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.mdc-button {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.mdc-button--outlined {
  background: white;
  color: var(--mdc-theme-primary, #1976d2);
  border: 1px solid rgba(25, 118, 210, 0.12);
}

.mdc-button--outlined:hover {
  background: rgba(25, 118, 210, 0.04);
}

.mdc-button--raised {
  background: var(--mdc-theme-primary, #1976d2);
  color: white;
  box-shadow: var(--mdc-elevation-02);
}

.mdc-button--raised:hover {
  background: #1565c0;
  box-shadow: var(--mdc-elevation-04);
}

/* Responsive Design */
@media (max-width: 768px) {
  .project-detail-view {
    padding: 16px;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .header-left {
    flex-direction: column;
    gap: 12px;
  }

  .project-title {
    font-size: 1.5rem;
  }

  .overview-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .card-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .milestone-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .milestone-meta,
  .task-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>