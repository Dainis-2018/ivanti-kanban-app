<!-- views/ProjectsView.vue - Projects Management View -->
<template>
  <div class="projects-view">
    <!-- View Header -->
    <div class="view-header">
      <div class="header-content">
        <div class="view-title">
          <h1>{{ getViewTitle() }}</h1>
          <span class="item-count">{{ getItemCount() }}</span>
        </div>
        
        <div class="view-controls">
          <!-- View Switcher -->
          <div class="view-switcher">
            <ejs-button
              iconCss="e-icons e-list-unordered"
              :cssClass="currentView === 'list' ? 'view-btn active' : 'view-btn'"
              @click="setView('list')"
              :title="t('views.list')"
            />
            <ejs-button
              iconCss="e-icons e-card"
              :cssClass="currentView === 'card' ? 'view-btn active' : 'view-btn'"
              @click="setView('card')"
              :title="t('views.card')"
            />
            <ejs-button
              iconCss="e-icons e-timeline"
              :cssClass="currentView === 'roadmap' ? 'view-btn active' : 'view-btn'"
              @click="setView('roadmap')"
              :title="t('views.roadmap')"
            />
          </div>
          
          <!-- Action Buttons -->
          <div class="action-buttons">
            <ejs-button
              v-if="!selectedProject"
              :content="t('projects.create')"
              iconCss="e-icons e-plus"
              cssClass="create-btn primary"
              @click="createProject"
            />
            <ejs-button
              v-if="selectedProject && !selectedMilestone"
              :content="t('milestones.create')"
              iconCss="e-icons e-plus"
              cssClass="create-btn secondary"
              @click="createMilestone"
            />
            <ejs-button
              v-if="selectedMilestone"
              :content="t('tasks.create')"
              iconCss="e-icons e-plus"
              cssClass="create-btn secondary"
              @click="createTask"
            />
          </div>
        </div>
      </div>
      
      <!-- Breadcrumb Navigation -->
      <div v-if="breadcrumbs.length > 1" class="breadcrumb">
        <span
          v-for="(crumb, index) in breadcrumbs"
          :key="crumb.id"
          class="breadcrumb-item"
          :class="{ active: index === breadcrumbs.length - 1 }"
          @click="navigateTo(crumb)"
        >
          {{ crumb.name }}
          <i v-if="index < breadcrumbs.length - 1" class="e-icons e-chevron-right"></i>
        </span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="view-content">
      <!-- Project List View -->
      <ProjectList
        v-if="!selectedProject && currentView === 'list'"
        :projects="filteredProjects"
        :search-query="searchQuery"
        :loading="isLoading"
        @project-select="selectProject"
        @project-edit="editProject"
        @project-delete="deleteProject"
      />

      <!-- Project Card View -->
      <ProjectCard
        v-if="!selectedProject && currentView === 'card'"
        :projects="filteredProjects"
        :search-query="searchQuery"
        :loading="isLoading"
        @project-select="selectProject"
        @project-edit="editProject"
        @project-delete="deleteProject"
      />

      <!-- Project Roadmap View -->
      <ProjectRoadmap
        v-if="!selectedProject && currentView === 'roadmap'"
        :projects="filteredProjects"
        :search-query="searchQuery"
        :loading="isLoading"
        @project-select="selectProject"
      />

      <!-- Milestone View -->
      <MilestoneCard
        v-if="selectedProject && !selectedMilestone"
        :project="selectedProject"
        :milestones="projectMilestones"
        :loading="isLoading"
        @milestone-select="selectMilestone"
        @milestone-edit="editMilestone"
        @milestone-delete="deleteMilestone"
      />

      <!-- Task Kanban View -->
      <TaskKanban
        v-if="selectedMilestone"
        :project-id="selectedProject.ProjectId"
        :milestone-id="selectedMilestone.PhaseId"
      />
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
import { useFilters } from '@/composables/useFilters'
import { useToast } from '@/composables/useToast'

import ProjectList from '@/components/projects/ProjectList.vue'
import ProjectCard from '@/components/projects/ProjectCard.vue'
import ProjectRoadmap from '@/components/projects/ProjectRoadmap.vue'
import MilestoneCard from '@/components/milestones/MilestoneCard.vue'
import TaskKanban from '@/components/tasks/TaskKanban.vue'

export default {
  name: 'ProjectsView',
  components: {
    ProjectList,
    ProjectCard,
    ProjectRoadmap,
    MilestoneCard,
    TaskKanban
  },
  props: {
    searchQuery: String,
    activeFilters: Object,
    currentView: String,
    projectId: String,
    milestoneId: String
  },
  setup(props) {
    const route = useRoute()
    const router = useRouter()
    const appStore = useAppStore()
    const projectStore = useProjectStore()
    const milestoneStore = useMilestoneStore()
    const { t } = useLocalization()
    const { showSuccess, showError } = useToast()

    const selectedProject = ref(null)
    const selectedMilestone = ref(null)
    const projectMilestones = ref([])

    const isLoading = computed(() => 
      projectStore.isLoading || milestoneStore.isLoading
    )

    const { 
      filteredItems: filteredProjects,
      setSearchQuery,
      filters
    } = useFilters(
      computed(() => projectStore.projects),
      {}
    )

    const breadcrumbs = computed(() => {
      const crumbs = [{ id: 'projects', name: t('projects.title') }]
      
      if (selectedProject.value) {
        crumbs.push({
          id: selectedProject.value.ProjectId,
          name: selectedProject.value.ProjectName,
          type: 'project'
        })
      }
      
      if (selectedMilestone.value) {
        crumbs.push({
          id: selectedMilestone.value.PhaseId,
          name: selectedMilestone.value.PhaseName,
          type: 'milestone'
        })
      }
      
      return crumbs
    })

    const getViewTitle = () => {
      if (selectedMilestone.value) {
        return `${t('tasks.title')} - ${selectedMilestone.value.PhaseName}`
      } else if (selectedProject.value) {
        return `${t('milestones.title')} - ${selectedProject.value.ProjectName}`
      } else {
        return t('projects.title')
      }
    }

    const getItemCount = () => {
      if (selectedMilestone.value) {
        return `${projectMilestones.value.length} ${t('tasks.title').toLowerCase()}`
      } else if (selectedProject.value) {
        return `${projectMilestones.value.length} ${t('milestones.title').toLowerCase()}`
      } else {
        return `${filteredProjects.value.length} ${t('projects.title').toLowerCase()}`
      }
    }

    const setView = (view) => {
      appStore.setCurrentView(view)
    }

    const selectProject = async (project) => {
      selectedProject.value = project
      appStore.setSelectedProject(project)
      
      // Load project milestones
      try {
        const milestones = await milestoneStore.fetchMilestonesByProject(project.ProjectId)
        projectMilestones.value = milestones
      } catch (error) {
        showError(`Failed to load milestones: ${error.message}`)
      }
      
      // Update URL
      router.push({ 
        name: 'project-details', 
        params: { projectId: project.ProjectId }
      })
    }

    const selectMilestone = (milestone) => {
      selectedMilestone.value = milestone
      appStore.setSelectedMilestone(milestone)
      
      // Update URL
      router.push({ 
        name: 'milestone-tasks', 
        params: { 
          projectId: selectedProject.value.ProjectId,
          milestoneId: milestone.PhaseId 
        }
      })
    }

    const navigateTo = (crumb) => {
      if (crumb.id === 'projects') {
        selectedProject.value = null
        selectedMilestone.value = null
        appStore.setSelectedProject(null)
        appStore.setSelectedMilestone(null)
        router.push({ name: 'projects' })
      } else if (crumb.type === 'project') {
        selectedMilestone.value = null
        appStore.setSelectedMilestone(null)
        router.push({ 
          name: 'project-details', 
          params: { projectId: crumb.id }
        })
      }
    }

    const createProject = () => {
      // Open project creation dialog
      console.log('Create project')
    }

    const createMilestone = () => {
      // Open milestone creation dialog
      console.log('Create milestone')
    }

    const createTask = () => {
      // Open task creation dialog  
      console.log('Create task')
    }

    const editProject = (project) => {
      console.log('Edit project:', project)
    }

    const deleteProject = async (project) => {
      try {
        await projectStore.deleteProject(project.ProjectId)
        showSuccess(`Project "${project.ProjectName}" deleted`)
      } catch (error) {
        showError(`Failed to delete project: ${error.message}`)
      }
    }

    const editMilestone = (milestone) => {
      console.log('Edit milestone:', milestone)
    }

    const deleteMilestone = async (milestone) => {
      try {
        await milestoneStore.deleteMilestone(milestone.PhaseId)
        showSuccess(`Milestone "${milestone.PhaseName}" deleted`)
        // Refresh milestones
        if (selectedProject.value) {
          const milestones = await milestoneStore.fetchMilestonesByProject(selectedProject.value.ProjectId)
          projectMilestones.value = milestones
        }
      } catch (error) {
        showError(`Failed to delete milestone: ${error.message}`)
      }
    }

    const loadData = async () => {
      try {
        // Load projects
        await projectStore.fetchProjects()
        
        // Load specific project if projectId in route
        if (props.projectId) {
          const project = await projectStore.fetchProjectById(props.projectId)
          selectedProject.value = project
          
          const milestones = await milestoneStore.fetchMilestonesByProject(props.projectId)
          projectMilestones.value = milestones
          
          // Load specific milestone if milestoneId in route
          if (props.milestoneId) {
            const milestone = milestones.find(m => m.PhaseId === props.milestoneId)
            if (milestone) {
              selectedMilestone.value = milestone
            }
          }
        }
      } catch (error) {
        showError(`Failed to load data: ${error.message}`)
      }
    }

    // Watch for route changes
    watch([() => props.projectId, () => props.milestoneId], () => {
      loadData()
    })

    // Apply search and filters
    watch([() => props.searchQuery, () => props.activeFilters], () => {
      setSearchQuery(props.searchQuery || '')
      filters.value = { ...props.activeFilters }
    }, { immediate: true })

    onMounted(() => {
      loadData()
    })

    return {
      selectedProject,
      selectedMilestone,
      projectMilestones,
      isLoading,
      filteredProjects,
      breadcrumbs,
      currentView: computed(() => props.currentView || appStore.currentView),
      searchQuery: computed(() => props.searchQuery),
      t,
      getViewTitle,
      getItemCount,
      setView,
      selectProject,
      selectMilestone,
      navigateTo,
      createProject,
      createMilestone,
      createTask,
      editProject,
      deleteProject,
      editMilestone,
      deleteMilestone
    }
  }
}
</script>

<style scoped>
.projects-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.view-header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 16px 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.view-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.view-title h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #333;
}

.item-count {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
}

.view-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.view-switcher {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: #f5f5f5;
  border-radius: 8px;
}

.view-btn {
  padding: 8px 12px;
  border-radius: 6px;
  background: transparent;
  border: none;
  color: #666;
  transition: all 0.2s ease;
}

.view-btn.active {
  background: #0078d4;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 120, 212, 0.3);
}

.view-btn:hover:not(.active) {
  background: #e5e5e5;
  color: #333;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.create-btn.primary {
  background-color: #0078d4;
  color: white;
}

.create-btn.secondary {
  background-color: #f3f2f1;
  color: #333;
  border: 1px solid #ddd;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.breadcrumb-item:hover:not(.active) {
  background-color: #f0f0f0;
}

.breadcrumb-item.active {
  color: #0078d4;
  font-weight: 500;
  cursor: default;
}

.view-content {
  flex: 1;
  overflow: hidden;
  padding: 16px 24px;
}

@media (max-width: 768px) {
  .view-header {
    padding: 12px 16px;
  }

  .header-content {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .view-title {
    justify-content: center;
  }

  .view-controls {
    justify-content: space-between;
  }

  .view-content {
    padding: 12px 16px;
  }

  .breadcrumb {
    flex-wrap: wrap;
  }
}
</style>