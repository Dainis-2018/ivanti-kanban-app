<template>
  <div class="projects-view">
    <!-- MAIN CONTENT AREA (TopBar removed - now handled globally) -->
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

// Import view components
import ProjectListView from './projects/ProjectListView.vue'
import ProjectCardView from './projects/ProjectCardView.vue'
import ProjectRoadmapView from './projects/ProjectRoadmapView.vue'

export default {
  name: 'ProjectsView',
  components: {
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

    // Filter options
    const availableStatuses = computed(() => {
      const statuses = new Set()
      projectStore.projects.forEach(project => {
        if (project.Status) {
          statuses.add(project.Status)
        }
      })
      return Array.from(statuses).sort()
    })

    const availableOwners = computed(() => {
      const owners = new Set()
      projectStore.projects.forEach(project => {
        if (project.Owner) {
          owners.add(project.Owner)
        }
      })
      return Array.from(owners).sort()
    })

    // Filtered projects
    const filteredProjects = computed(() => {
      let projects = projectStore.projects

      // Apply search filter
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim()
        projects = projects.filter(project =>
          (project.ProjectName && project.ProjectName.toLowerCase().includes(query)) ||
          (project.Summary && project.Summary.toLowerCase().includes(query)) ||
          (project.ProjectNumber && project.ProjectNumber.toLowerCase().includes(query)) ||
          (project.Owner && project.Owner.toLowerCase().includes(query))
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

    // Check if filters are active
    const hasActiveFilters = computed(() => {
      return searchQuery.value.trim() || statusFilter.value || ownerFilter.value || priorityFilter.value
    })

    // Methods
    const switchView = (viewName) => {
      if (currentView.value !== viewName) {
        currentView.value = viewName
        
        // Update URL without triggering navigation
        router.replace({ 
          path: route.path, 
          query: { ...route.query, view: viewName } 
        })
        
        showToast(t('views.switched', { view: t(`views.${viewName}`) }), 'info')
      }
    }

    const handleSearch = (query) => {
      searchQuery.value = query
    }

    const handleFilterChange = (filters) => {
      statusFilter.value = filters.status || ''
      ownerFilter.value = filters.owner || ''
      priorityFilter.value = filters.priority || ''
    }

    const clearFilters = () => {
      searchQuery.value = ''
      statusFilter.value = ''
      ownerFilter.value = ''
      priorityFilter.value = ''
      showToast(t('filters.cleared'), 'info')
    }

    const loadInitialData = async () => {
      try {
        await projectStore.fetchProjects()
      } catch (error) {
        console.error('Failed to load initial data:', error)
        showToast(t('app.loadError'), 'error')
      }
    }

    // Provide data to child components
    provide('filteredProjects', filteredProjects)
    provide('availableStatuses', availableStatuses)
    provide('availableOwners', availableOwners)
    provide('hasActiveFilters', hasActiveFilters)

    // Provide methods to child components
    provide('switchView', switchView)
    provide('handleSearch', handleSearch)
    provide('handleFilterChange', handleFilterChange)
    provide('clearFilters', clearFilters)

    // Watchers
    watch(() => route.query.view, (newView) => {
      if (newView && availableViews.value.some(v => v.name === newView)) {
        currentView.value = newView
      }
    }, { immediate: true })

    // Listen to TopBar events (these will come from App.vue)
    const handleTopBarSearch = (query) => {
      handleSearch(query)
    }

    const handleTopBarViewChange = (view) => {
      switchView(view)
    }

    const handleTopBarFilterChange = (filters) => {
      handleFilterChange(filters)
    }

    // Expose methods for parent component (App.vue) to call
    const exposedMethods = {
      handleSearch: handleTopBarSearch,
      handleViewChange: handleTopBarViewChange,
      handleFilterChange: handleTopBarFilterChange,
      getCurrentView: () => currentView.value,
      getActiveFiltersCount: () => {
        let count = 0
        if (searchQuery.value.trim()) count++
        if (statusFilter.value) count++
        if (ownerFilter.value) count++
        if (priorityFilter.value) count++
        return count
      }
    }

    // Lifecycle
    onMounted(async () => {
      // Set initial view from route query
      if (route.query.view && availableViews.value.some(v => v.name === route.query.view)) {
        currentView.value = route.query.view
      }

      // Load initial data
      await loadInitialData()
    })

    return {
      // Reactive state
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
      switchView,
      handleSearch,
      handleFilterChange,
      clearFilters,
      
      // Exposed methods for parent
      ...exposedMethods,
      
      // Composables
      t
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

.main-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 0; /* Remove padding since TopBar handles spacing */
}

/* Remove all duplicate TopBar styles since they're now in TopBar.vue */

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