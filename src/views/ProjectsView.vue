<template>
  <div class="projects-view">
    <!-- TopBar Component -->
    <TopBar 
      :current-view="currentView"
      @view-changed="handleViewChange"
      @search-changed="handleSearch"
      @filter-changed="handleFilterChange"
      @refresh-requested="handleRefresh"
    />
    
    <!-- Main Content Area -->
    <div class="main-content">
      <KeepAlive>
        <component 
          :is="currentViewComponent" 
          :key="currentView"
        />
      </KeepAlive>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, provide, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProjectStore } from '@/stores/projectStore'
import { useLocalization } from '@/composables/useLocalization'
import { useToast } from '@/composables/useToast'

// Import components
import TopBar from '@/components/common/TopBar.vue'
import ProjectListView from './projects/ProjectListView.vue'
import ProjectCardView from './projects/ProjectCardView.vue'
import ProjectRoadmapView from './projects/ProjectRoadmapView.vue'

export default {
  name: 'ProjectsView',
  components: {
    TopBar,
    ProjectListView,
    ProjectCardView,
    ProjectRoadmapView
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const projectStore = useProjectStore()
    const { t } = useLocalization()
    const { showToast } = useToast()

    // Reactive state
    const currentView = ref('list')
    const searchQuery = ref('')
    const statusFilter = ref('')
    const ownerFilter = ref('')
    const priorityFilter = ref('')

    // Available views configuration
    const availableViews = computed(() => [
      {
        name: 'list',
        component: 'ProjectListView'
      },
      {
        name: 'card',
        component: 'ProjectCardView'
      },
      {
        name: 'roadmap',
        component: 'ProjectRoadmapView'
      }
    ])

    // Current view component
    const currentViewComponent = computed(() => {
      const view = availableViews.value.find(v => v.name === currentView.value)
      return view ? view.component : 'ProjectListView'
    })

    // Available filter options
    const availableStatuses = computed(() => {
      const statuses = new Set()
      projectStore.projects.forEach(project => {
        if (project.Status) statuses.add(project.Status)
      })
      return Array.from(statuses).sort()
    })

    const availableOwners = computed(() => {
      const owners = new Set()
      projectStore.projects.forEach(project => {
        if (project.Owner) owners.add(project.Owner)
      })
      return Array.from(owners).sort()
    })

    // Filtered projects based on search and filters
    const filteredProjects = computed(() => {
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

      return projects
    })

    // Check if there are active filters
    const hasActiveFilters = computed(() => {
      return statusFilter.value || ownerFilter.value || priorityFilter.value
    })

    // Event handlers for TopBar
    const handleViewChange = (view) => {
      currentView.value = view
      console.log('View changed to:', view)
    }

    const handleSearch = (query) => {
      searchQuery.value = query
      console.log('Search query:', query)
    }

    const handleFilterChange = (filters) => {
      statusFilter.value = filters.status || ''
      ownerFilter.value = filters.owner || ''
      priorityFilter.value = filters.priority || ''
      console.log('Filters updated:', filters)
    }

    const handleRefresh = async () => {
      try {
        await projectStore.fetchProjects()
        showToast('Data refreshed successfully', 'success')
      } catch (error) {
        console.error('Failed to refresh data:', error)
        showToast('Failed to refresh data', 'error')
      }
    }

    const clearFilters = () => {
      statusFilter.value = ''
      ownerFilter.value = ''
      priorityFilter.value = ''
    }

    // Provide data to child components
    provide('filteredProjects', filteredProjects)
    provide('currentView', currentView)
    provide('searchQuery', searchQuery)
    provide('statusFilter', statusFilter)
    provide('ownerFilter', ownerFilter)
    provide('priorityFilter', priorityFilter)
    provide('availableStatuses', availableStatuses)
    provide('availableOwners', availableOwners)
    provide('hasActiveFilters', hasActiveFilters)

    // Exposed methods for child components
    const exposedMethods = {
      switchView: handleViewChange,
      handleSearch,
      handleFilterChange,
      clearFilters,
      refreshData: handleRefresh
    }

    provide('projectViewMethods', exposedMethods)

    // Load initial data
    onMounted(async () => {
      if (projectStore.projects.length === 0) {
        await handleRefresh()
      }
    })

    // Watch route changes to set initial view
    watch(() => route.query.view, (newView) => {
      if (newView && availableViews.value.some(v => v.name === newView)) {
        currentView.value = newView
      }
    }, { immediate: true })

    return {
      // State
      currentView,
      searchQuery,
      statusFilter,
      ownerFilter,
      priorityFilter,
      
      // Computed
      availableViews,
      currentViewComponent,
      availableStatuses,
      availableOwners,
      filteredProjects,
      hasActiveFilters,
      
      // Methods
      handleViewChange,
      handleSearch,
      handleFilterChange,
      handleRefresh,
      clearFilters,
      
      // Exposed methods for child components
      ...exposedMethods,
      
      // Composables
      t
    }
  }
}
</script>

<style scoped>
.projects-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--mdc-theme-background);
}

.main-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* View transition animations */
.view-transition-enter-active,
.view-transition-leave-active {
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.view-transition-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.view-transition-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Loading states */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

/* Custom scrollbar for main content */
.main-content::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>