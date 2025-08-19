<template>
  <div class="projects-view">
    <!-- TOP BAR WITH VIEW SWITCHER -->
    <div class="top-bar mdc-card">
      <div class="top-bar-left">
        <h1 class="mdc-typography--headline5">{{ t('projects.title') }}</h1>
        <div class="view-switcher">
          <button 
            v-for="view in availableViews" 
            :key="view.name"
            class="view-btn" 
            :class="{ active: currentView === view.name }"
            @click="switchView(view.name)"
            :title="view.title"
          >
            <component :is="view.icon" />
            <span>{{ view.label }}</span>
          </button>
        </div>
      </div>
      
      <div class="top-bar-right">
        <!-- SEARCH AND FILTERS -->
        <div class="search-filter-container">
          <div class="search-field">
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('app.search')"
              class="search-input"
            >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="search-icon">
              <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
            </svg>
          </div>
          
          <div class="filter-controls">
            <select v-model="statusFilter" class="filter-select">
              <option value="">{{ t('filters.allStatuses') }}</option>
              <option v-for="status in availableStatuses" :key="status" :value="status">
                {{ t(`projects.statusValues.${status.toLowerCase().replace(' ', '')}`) }}
              </option>
            </select>
            
            <select v-model="ownerFilter" class="filter-select">
              <option value="">{{ t('filters.allOwners') }}</option>
              <option v-for="owner in availableOwners" :key="owner" :value="owner">
                {{ owner }}
              </option>
            </select>
            
            <button 
              class="filter-clear-btn"
              @click="clearFilters"
              v-if="hasActiveFilters"
              :title="t('filters.clear')"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MAIN CONTENT AREA -->
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
import { useMilestoneStore } from '@/stores/milestoneStore'
import { useTaskStore } from '@/stores/taskStore'
import { useLocalization } from '@/composables/useLocalization'
import { useToast } from '@/composables/useToast'

// Import view components
import ProjectListView from './projects/ProjectListView.vue'
import ProjectCardView from './projects/ProjectCardView.vue'
import ProjectRoadmapView from './projects/ProjectRoadmapView.vue'

// Icon components for view switcher
const ListIcon = {
  template: `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3,5H21V7H3V5M3,13V11H21V13H3M3,19V17H21V19H3Z"/>
    </svg>
  `
}

const CardIcon = {
  template: `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4,4H10V10H4V4M20,4V10H14V4H20M14,15H16V13H14V11H16V13H18V11H20V13H18V15H20V18H18V20H16V18H13V20H11V16H14V15M16,15V18H18V15H16M4,20V14H10V20H4M6,16V18H8V16H6M4,12V11H10V12H4M14,7V9H18V7H14M6,6V8H8V6H6Z"/>
    </svg>
  `
}

const RoadmapIcon = {
  template: `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3,3H21V5H19V19A2,2 0 0,1 17,21H7A2,2 0 0,1 5,19V5H3V3M7,5V19H17V5H7M9,7H15V9H9V7M9,11H15V13H9V11M9,15H15V17H9V15Z"/>
    </svg>
  `
}

export default {
  name: 'ProjectsView',
  components: {
    ProjectListView,
    ProjectCardView,
    ProjectRoadmapView,
    ListIcon,
    CardIcon,
    RoadmapIcon
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const projectStore = useProjectStore()
    const milestoneStore = useMilestoneStore()
    const taskStore = useTaskStore()
    const { t } = useLocalization()
    const { showToast } = useToast()

    // Reactive state
    const currentView = ref('list')
    const searchQuery = ref('')
    const statusFilter = ref('')
    const ownerFilter = ref('')

    // Available views configuration
    const availableViews = computed(() => [
      {
        name: 'list',
        label: t('views.list'),
        title: t('views.listTooltip'),
        icon: 'ListIcon',
        component: 'ProjectListView'
      },
      {
        name: 'cards',
        label: t('views.card'),
        title: t('views.cardTooltip'),
        icon: 'CardIcon',
        component: 'ProjectCardView'
      },
      {
        name: 'roadmap',
        label: t('views.roadmap'),
        title: t('views.roadmapTooltip'),
        icon: 'RoadmapIcon',
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

      return projects
    })

    // Check if filters are active
    const hasActiveFilters = computed(() => {
      return searchQuery.value.trim() || statusFilter.value || ownerFilter.value
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

    const clearFilters = () => {
      searchQuery.value = ''
      statusFilter.value = ''
      ownerFilter.value = ''
      showToast(t('filters.cleared'), 'info')
    }

    const loadInitialData = async () => {
      try {
        await Promise.all([
          projectStore.fetchProjects(),
          milestoneStore.fetchMilestones()
        ])
      } catch (error) {
        console.error('Failed to load initial data:', error)
        showToast(t('app.loadError'), 'error')
      }
    }

    // Provide filteredProjects to child components
    provide('filteredProjects', filteredProjects)

    // Watchers
    watch(() => route.query.view, (newView) => {
      if (newView && availableViews.value.some(v => v.name === newView)) {
        currentView.value = newView
      }
    }, { immediate: true })

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
      
      // Computed
      availableViews,
      currentViewComponent,
      availableStatuses,
      availableOwners,
      filteredProjects,
      hasActiveFilters,
      
      // Methods
      switchView,
      clearFilters,
      
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
  background: #f5f5f5;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  box-shadow: var(--mdc-elevation-01);
  z-index: 2;
}

.top-bar-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.top-bar-left h1 {
  margin: 0;
  color: rgba(0, 0, 0, 0.87);
}

.view-switcher {
  display: flex;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  padding: 4px;
  gap: 2px;
}

.view-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  background: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  color: rgba(0, 0, 0, 0.6);
  min-width: 80px;
}

.view-btn.active {
  background: white;
  color: var(--mdc-theme-primary, #1976d2);
  box-shadow: var(--mdc-elevation-01);
}

.view-btn:hover:not(.active) {
  background: rgba(0, 0, 0, 0.04);
  color: rgba(0, 0, 0, 0.87);
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-filter-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-field {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 300px;
  padding: 8px 16px 8px 40px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  font-size: 14px;
  background: white;
  transition: border-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.search-input:focus {
  outline: none;
  border-color: var(--mdc-theme-primary, #1976d2);
}

.search-input::placeholder {
  color: rgba(0, 0, 0, 0.6);
}

.search-icon {
  position: absolute;
  left: 12px;
  color: rgba(0, 0, 0, 0.6);
  pointer-events: none;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  background: white;
  font-size: 14px;
  cursor: pointer;
  min-width: 120px;
}

.filter-select:focus {
  outline: none;
  border-color: var(--mdc-theme-primary, #1976d2);
}

.filter-clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(244, 67, 54, 0.08);
  color: #f44336;
  border-radius: 16px;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.filter-clear-btn:hover {
  background: rgba(244, 67, 54, 0.16);
}

.main-content {
  flex: 1;
  padding: 16px 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .search-input {
    width: 250px;
  }
}

@media (max-width: 1024px) {
  .top-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .top-bar-left {
    justify-content: center;
  }

  .top-bar-right {
    justify-content: center;
  }

  .search-filter-container {
    flex-wrap: wrap;
    justify-content: center;
  }

  .search-input {
    width: 200px;
  }

  .main-content {
    padding: 12px 16px;
  }
}

@media (max-width: 768px) {
  .top-bar-left {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .view-switcher {
    width: 100%;
  }

  .view-btn {
    flex: 1;
    justify-content: center;
  }

  .search-filter-container {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    width: 100%;
  }

  .search-field {
    width: 100%;
  }

  .search-input {
    width: 100%;
  }

  .filter-controls {
    justify-content: center;
  }

  .main-content {
    padding: 8px 12px;
  }
}

@media (max-width: 480px) {
  .top-bar {
    padding: 12px 16px;
  }

  .view-btn span {
    display: none;
  }

  .view-btn {
    min-width: auto;
    padding: 8px 12px;
  }

  .filter-select {
    min-width: 100px;
    font-size: 13px;
  }
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