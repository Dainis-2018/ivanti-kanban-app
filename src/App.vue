<!-- App.vue - Main Application Component -->
<template>
  <div id="app" class="ivanti-kanban-app">
    <!-- Top Bar -->
    <TopBar 
      @search="handleSearch"
      @filter="handleFilter"
      @view-change="handleViewChange"
    />
    
    <!-- Main Content Area -->
    <main class="main-content">
      <router-view 
        :key="$route.fullPath"
        :search-query="searchQuery"
        :active-filters="activeFilters"
        :current-view="currentView"
      />
    </main>

    <!-- Toast Container -->
    <ToastContainer />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useAppStore } from '@/stores/appStore'
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
    const appStore = useAppStore()
    const { initializeLocalization } = useLocalization()
    const { showToast } = useToast()
    
    const searchQuery = ref('')
    const activeFilters = ref({})
    const currentView = ref('projects')

    const handleSearch = (query) => {
      searchQuery.value = query
      appStore.setSearchQuery(query)
    }

    const handleFilter = (filters) => {
      activeFilters.value = filters
      appStore.setActiveFilters(filters)
    }

    const handleViewChange = (view) => {
      currentView.value = view
      appStore.setCurrentView(view)
    }

    const initializeApp = async () => {
      try {
        // Initialize localization
        await initializeLocalization()
        
        // Initialize app store
        await appStore.initialize()
        
        showToast('Application initialized successfully', 'success')
      } catch (error) {
        console.error('Failed to initialize application:', error)
        showToast('Failed to initialize application', 'error')
      }
    }

    onMounted(() => {
      initializeApp()
    })

    return {
      searchQuery,
      activeFilters,
      currentView,
      handleSearch,
      handleFilter,
      handleViewChange
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
}

.main-content {
  flex: 1;
  overflow: hidden;
  padding: 0;
}
</style>