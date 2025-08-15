// stores/appStore.js - Main Application Store
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // State
  const isLoading = ref(false)
  const currentView = ref('list') // 'list', 'card', 'roadmap'
  const searchQuery = ref('')
  const activeFilters = ref({})
  const selectedProject = ref(null)
  const selectedMilestone = ref(null)
  const locale = ref('en')
  const theme = ref('light')
  const sidebarCollapsed = ref(false)

  // Getters
  const hasActiveFilters = computed(() => {
    return Object.keys(activeFilters.value).length > 0
  })

  const isProjectSelected = computed(() => {
    return selectedProject.value !== null
  })

  const isMilestoneSelected = computed(() => {
    return selectedMilestone.value !== null
  })

  // Actions
  const setLoading = (loading) => {
    isLoading.value = loading
  }

  const setCurrentView = (view) => {
    currentView.value = view
  }

  const setSearchQuery = (query) => {
    searchQuery.value = query
  }

  const setActiveFilters = (filters) => {
    activeFilters.value = { ...filters }
  }

  const clearFilters = () => {
    activeFilters.value = {}
    searchQuery.value = ''
  }

  const setSelectedProject = (project) => {
    selectedProject.value = project
  }

  const setSelectedMilestone = (milestone) => {
    selectedMilestone.value = milestone
  }

  const setLocale = (newLocale) => {
    locale.value = newLocale
  }

  const setTheme = (newTheme) => {
    theme.value = newTheme
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const initialize = async () => {
    setLoading(true)
    try {
      // Load user preferences from localStorage if available
      const savedLocale = localStorage.getItem('ivanti-kanban-locale')
      const savedTheme = localStorage.getItem('ivanti-kanban-theme')
      const savedView = localStorage.getItem('ivanti-kanban-view')

      if (savedLocale) setLocale(savedLocale)
      if (savedTheme) setTheme(savedTheme)
      if (savedView) setCurrentView(savedView)

      console.log('App store initialized')
    } catch (error) {
      console.error('Failed to initialize app store:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    // State
    isLoading,
    currentView,
    searchQuery,
    activeFilters,
    selectedProject,
    selectedMilestone,
    locale,
    theme,
    sidebarCollapsed,
    // Getters
    hasActiveFilters,
    isProjectSelected,
    isMilestoneSelected,
    // Actions
    setLoading,
    setCurrentView,
    setSearchQuery,
    setActiveFilters,
    clearFilters,
    setSelectedProject,
    setSelectedMilestone,
    setLocale,
    setTheme,
    toggleSidebar,
    initialize
  }
})