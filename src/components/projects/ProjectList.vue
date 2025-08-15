<!-- components/projects/ProjectList.vue - Project List View Component -->
<template>
  <div class="project-list">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <i class="e-icons e-refresh spinning"></i>
        <span>{{ t('app.loading') }}</span>
      </div>
    </div>

    <div v-else-if="projects.length === 0" class="empty-state">
      <div class="empty-content">
        <i class="e-icons e-folder-open empty-icon"></i>
        <h3>{{ t('projects.noProjects') }}</h3>
        <p>Create your first project to get started</p>
      </div>
    </div>

    <div v-else class="list-container">
      <ejs-grid
        ref="projectGrid"
        :dataSource="projects"
        :allowPaging="true"
        :allowSorting="true"
        :allowFiltering="true"
        :allowSelection="true"
        :pageSettings="pageSettings"
        :filterSettings="filterSettings"
        :sortSettings="sortSettings"
        :selectionSettings="selectionSettings"
        @rowSelected="onRowSelected"
        @actionComplete="onActionComplete"
        cssClass="project-grid"
      >
        <e-columns>
          <e-column
            field="ProjectName"
            :headerText="t('projects.name')"
            width="250"
            :template="'projectNameTemplate'"
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
            <div class="project-description">
              {{ truncateText(data.Description, 60) }}
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
            <ejs-button
              iconCss="e-icons e-eye"
              cssClass="action-btn view-btn"
              @click="selectProject(data)"
              :title="t('actions.view')"
            />
            <ejs-button
              iconCss="e-icons e-edit"
              cssClass="action-btn edit-btn"
              @click="editProject(data)"
              :title="t('actions.edit')"
            />
            <ejs-button
              iconCss="e-icons e-delete"
              cssClass="action-btn delete-btn"
              @click="deleteProject(data)"
              :title="t('actions.delete')"
            />
          </div>
        </template>
      </ejs-grid>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useLocalization } from '@/composables/useLocalization'

export default {
  name: 'ProjectList',
  props: {
    projects: {
      type: Array,
      default: () => []
    },
    searchQuery: String,
    loading: Boolean
  },
  emits: ['project-select', 'project-edit', 'project-delete'],
  setup(props, { emit }) {
    const { t } = useLocalization()
    const projectGrid = ref(null)

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

    const selectProject = (project) => {
      emit('project-select', project)
    }

    const editProject = (project) => {
      emit('project-edit', project)
    }

    const deleteProject = (project) => {
      emit('project-delete', project)
    }

    const onRowSelected = (args) => {
      // Optional: Handle row selection
    }

    const onActionComplete = (args) => {
      // Handle grid actions
    }

    const getStatusClass = (status) => {
      switch (status?.toLowerCase()) {
        case 'active': return 'status-active'
        case 'completed': return 'status-completed'
        case 'on hold': return 'status-onhold'
        case 'cancelled': return 'status-cancelled'
        default: return 'status-planning'
      }
    }

    const truncateText = (text, maxLength) => {
      if (!text || text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    }

    return {
      projectGrid,
      pageSettings,
      filterSettings,
      sortSettings,
      selectionSettings,
      t,
      selectProject,
      editProject,
      deleteProject,
      onRowSelected,
      onActionComplete,
      getStatusClass,
      truncateText
    }
  }
}
</script>

<style scoped>
.project-list {
  height: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #666;
}

.spinning {
  animation: spin 1s linear infinite;
  font-size: 24px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

.empty-content {
  text-align: center;
  color: #666;
}

.empty-icon {
  font-size: 48px;
  color: #ccc;
  margin-bottom: 16px;
}

.list-container {
  height: 100%;
}

.project-grid {
  height: 100%;
}

.project-name-cell {
  padding: 8px 0;
}

.project-title {
  font-weight: 600;
  color: #0078d4;
  cursor: pointer;
  margin-bottom: 4px;
  transition: color 0.2s ease;
}

.project-title:hover {
  color: #106ebe;
  text-decoration: underline;
}

.project-description {
  font-size: 12px;
  color: #666;
  line-height: 1.3;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-active {
  background: #e8f5e8;
  color: #2e7d32;
}

.status-completed {
  background: #e3f2fd;
  color: #1976d2;
}

.status-planning {
  background: #fff3e0;
  color: #f57c00;
}

.status-onhold {
  background: #fce4ec;
  color: #c2185b;
}

.status-cancelled {
  background: #ffebee;
  color: #d32f2f;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  font-weight: 500;
  color: #666;
  min-width: 35px;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.action-btn {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: white;
  color: #666;
  transition: all 0.2s ease;
}

.action-btn:hover {
  border-color: #0078d4;
  color: #0078d4;
}

.delete-btn:hover {
  border-color: #d32f2f;
  color: #d32f2f;
}

/* Syncfusion Grid Customizations */
:deep(.e-grid .e-gridheader) {
  background: #f8f9fa;
  border-bottom: 2px solid #e0e0e0;
}

:deep(.e-grid .e-columnheader) {
  font-weight: 600;
  color: #333;
}

:deep(.e-grid .e-row:hover) {
  background: #f8f9fa;
}

:deep(.e-grid .e-rowcell) {
  border-right: 1px solid #f0f0f0;
  padding: 12px 8px;
}

:deep(.e-pager) {
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
    gap: 2px;
  }
  
  .action-btn {
    padding: 6px;
    font-size: 12px;
  }
}
</style>