<!-- App.vue - Main Application Component -->
<template>
  <div id="app" class="ivanti-kanban-app">
    <!-- Top Bar -->
    <TopBar 
      :current-view="currentView"
      :active-filters-count="activeFiltersCount"
      :is-loading="isLoading"
      @search="handleSearch"
      @view-change="handleViewChange"
      @filter-change="handleFilterChange"
      @toggle-filters="handleToggleFilters"
      @refresh="handleRefresh"
      @language-change="handleLanguageChange"
    />
    
    <!-- Main Content Area -->
    <main class="main-content">
      <router-view 
        ref="routerViewRef"
        :key="$route.fullPath"
        :search-query="searchQuery"
        :active-filters="activeFilters"
        :current-view="currentView"
        @view-changed="onViewChanged"
        @filters-updated="onFiltersUpdated"
      />
    </main>

    <!-- Toast Container -->
    <ToastContainer />
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import { useProjectStore } from '@/stores/projectStore'
import { useLocalization } from '@/composables/useLocalization'
import { useToast } from '@/composables/useToast'
import TopBar from '@/components/common/TopBar.vue'
import ToastContainer from '@/components/common/ToastContainer.vue'

export default {
  name: 'App',
  components: {
    TopBar,
    ToastContainer
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const appStore = useAppStore()
    const projectStore = useProjectStore()
    const { initialize: initializeLocalization } = useLocalization()
    const { showToast } = useToast()
    
    const routerViewRef = ref(null)
    const isLoading = ref(false)
    const searchQuery = ref('')
    const activeFilters = ref({})
    const currentView = ref('list')

    // Computed active filters count
    const activeFiltersCount = computed(() => {
      let count = 0
      if (searchQuery.value.trim()) count++
      if (activeFilters.value.status) count++
      if (activeFilters.value.owner) count++
      if (activeFilters.value.priority) count++
      return count
    })

    // Event handlers
    const handleSearch = async (query) => {
      searchQuery.value = query
      appStore.setSearchQuery(query)
      
      // If we're on projects page, pass to the projects view
      if (route.path.startsWith('/projects') && routerViewRef.value?.handleSearch) {
        await nextTick()
        routerViewRef.value.handleSearch(query)
      }
    }

    const handleViewChange = async (view) => {
      currentView.value = view
      appStore.setCurrentView(view)
      
      // Navigate to the correct route with view parameter
      if (route.path.startsWith('/projects')) {
        await router.push({ 
          path: '/projects', 
          query: { ...route.query, view } 
        })
        
        // Also call the projects view method if available
        if (routerViewRef.value?.handleViewChange) {
          await nextTick()
          routerViewRef.value.handleViewChange(view)
        }
      }
    }

    const handleFilterChange = async (filters) => {
      activeFilters.value = { ...filters }
      appStore.setActiveFilters(filters)
      
      // If we're on projects page, pass to the projects view
      if (route.path.startsWith('/projects') && routerViewRef.value?.handleFilterChange) {
        await nextTick()
        routerViewRef.value.handleFilterChange(filters)
      }
    }

    const handleToggleFilters = (show) => {
      // This is just for UI state, no action needed
      console.log('Filters panel toggled:', show)
    }

    const handleRefresh = async () => {
      isLoading.value = true
      
      try {
        // Refresh data based on current route
        if (route.path.startsWith('/projects')) {
          await projectStore.fetchProjects()
          showToast('Projects refreshed successfully', 'success')
        } else {
          // Refresh general app data
          await appStore.refresh()
          showToast('Data refreshed successfully', 'success')
        }
      } catch (error) {
        console.error('Failed to refresh data:', error)
        showToast('Failed to refresh data', 'error')
      } finally {
        isLoading.value = false
      }
    }

    const handleLanguageChange = (language) => {
      appStore.setLanguage(language)
      showToast(`Language changed to ${language}`, 'success')
    }

    // Child component event handlers
    const onViewChanged = (view) => {
      currentView.value = view
    }

    const onFiltersUpdated = (filters) => {
      activeFilters.value = { ...filters }
    }

    // Initialize the application
    const initializeApp = async () => {
      try {
        isLoading.value = true
        
        // Initialize localization first
        await initializeLocalization()
        
        // Initialize app store
        await appStore.initialize()
        
        // Set initial view from route
        if (route.query.view) {
          currentView.value = route.query.view
        }
        
        showToast('Application initialized successfully', 'success')
      } catch (error) {
        console.error('Failed to initialize application:', error)
        showToast('Failed to initialize application', 'error')
      } finally {
        isLoading.value = false
      }
    }

    onMounted(() => {
      initializeApp()
    })

    return {
      routerViewRef,
      isLoading,
      searchQuery,
      activeFilters,
      currentView,
      activeFiltersCount,
      handleSearch,
      handleViewChange,
      handleFilterChange,
      handleToggleFilters,
      handleRefresh,
      handleLanguageChange,
      onViewChanged,
      onFiltersUpdated
    }
  }
}
</script>

<style scoped>
.ivanti-kanban-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Global scrollbar styling */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

*::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

*::-webkit-scrollbar-track {
  background: transparent;
}

*::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  border: 2px solid transparent;
  background-clip: content-box;
}

*::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.3);
}

/* Loading state for the whole app */
.ivanti-kanban-app.loading {
  cursor: wait;
}

.ivanti-kanban-app.loading * {
  pointer-events: none;
}

/* Ensure proper z-index stacking */
.main-content {
  position: relative;
  z-index: 1;
}

/* Animation for smooth transitions */
.main-content {
  transition: opacity 0.3s ease-in-out;
}

.ivanti-kanban-app.loading .main-content {
  opacity: 0.7;
}
</style>