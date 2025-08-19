<!-- src/components/common/TopBar.vue - Fixed TopBar with Working Navigation -->
<template>
  <header class="top-bar">
    <div class="top-bar-content">
      <!-- Logo and Title -->
      <div class="logo-section">
        <h1 class="app-title">Ivanti Kanban</h1>
      </div>

      <!-- Search Section -->
      <div class="search-section">
        <input
          type="text"
          class="search-input"
          placeholder="Search projects, tasks, or milestones..."
          v-model="searchQuery"
          @input="handleSearch"
        />
      </div>

      <!-- View Switcher (only show on projects page) -->
      <div v-if="showViewSwitcher" class="view-section">
        <div class="view-buttons">
          <button
            :class="['view-button', { active: currentView === 'list' }]"
            @click="switchView('list')"
            title="List View"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3,5H21V7H3V5M3,13H21V15H3V13M3,21H21V23H3V21Z"/>
            </svg>
            <span class="button-text">List</span>
          </button>
          <button
            :class="['view-button', { active: currentView === 'card' }]"
            @click="switchView('card')"
            title="Card View"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M5,7H19V5H5V7M5,19V9H11V19H5M19,19H13V9H19V19Z"/>
            </svg>
            <span class="button-text">Cards</span>
          </button>
          <button
            :class="['view-button', { active: currentView === 'roadmap' }]"
            @click="switchView('roadmap')"
            title="Roadmap View"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15,4V6H18V18H16V20H19A1,1 0 0,0 20,19V5A1,1 0 0,0 19,4H15M12,2A1,1 0 0,0 11,3V7A1,1 0 0,0 12,8H13V16H11V18H14A1,1 0 0,0 15,17V7H12V3M4,6A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H7V20H5A3,3 0 0,1 2,17V7A3,3 0 0,1 5,4H7V6H4M9,8V16H7V8H9M13,4V6H15V4H13Z"/>
            </svg>
            <span class="button-text">Roadmap</span>
          </button>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="filter-section">
        <button
          class="filter-button"
          @click="toggleFilters"
          title="Toggle Filters"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14,12V19.88C14.04,20.18 13.94,20.5 13.71,20.71C13.32,21.1 12.69,21.1 12.3,20.71L10.29,18.7C10.06,18.47 9.96,18.16 10,17.87V12H9.97L4.21,4.62C3.87,4.19 3.95,3.56 4.38,3.22C4.57,3.08 4.78,3 5,3V3H19V3C19.22,3 19.43,3.08 19.62,3.22C20.05,3.56 20.13,4.19 19.79,4.62L14.03,12H14Z"/>
          </svg>
          <span class="button-text">Filters</span>
        </button>
        <span v-if="activeFiltersCount > 0" class="filter-badge">{{ activeFiltersCount }}</span>
      </div>

      <!-- Actions Section -->
      <div class="actions-section">
        <button
          class="refresh-button"
          @click="handleRefresh"
          :disabled="isLoading"
          title="Refresh Data"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Filters Panel -->
    <div v-if="showFilters" class="filters-panel">
      <div class="filter-content">
        <!-- Status Filter -->
        <div class="filter-group">
          <label class="filter-label">Status</label>
          <select v-model="statusFilter" class="filter-select" @change="handleFilterChange">
            <option value="">All Statuses</option>
            <option value="Planning">Planning</option>
            <option value="Active">Active</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <!-- Owner Filter -->
        <div class="filter-group">
          <label class="filter-label">Owner</label>
          <select v-model="ownerFilter" class="filter-select" @change="handleFilterChange">
            <option value="">All Owners</option>
            <option value="John Doe">John Doe</option>
            <option value="Jane Smith">Jane Smith</option>
            <option value="Mike Johnson">Mike Johnson</option>
            <option value="Sarah Wilson">Sarah Wilson</option>
          </select>
        </div>

        <!-- Priority Filter -->
        <div class="filter-group">
          <label class="filter-label">Priority</label>
          <select v-model="priorityFilter" class="filter-select" @change="handleFilterChange">
            <option value="">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <!-- Clear Filters Button -->
        <div class="filter-actions">
          <button 
            v-if="hasActiveFilters" 
            class="clear-filters-btn"
            @click="clearFilters"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'TopBar',
  props: {
    currentView: {
      type: String,
      default: 'list'
    }
  },
  emits: ['search-changed', 'filter-changed', 'refresh-requested'],
  setup(props, { emit }) {
    const route = useRoute()
    const router = useRouter()
    
    // Reactive state
    const isLoading = ref(false)
    const showFilters = ref(false)
    const searchQuery = ref('')
    const statusFilter = ref('')
    const ownerFilter = ref('')
    const priorityFilter = ref('')

    // Get current view from route
    const currentView = computed(() => {
      if (route.path.includes('/projects/list')) return 'list'
      if (route.path.includes('/projects/cards')) return 'card'
      if (route.path.includes('/projects/roadmap')) return 'roadmap'
      return 'list'
    })

    // Show view switcher only on projects pages
    const showViewSwitcher = computed(() => {
      return route.path.includes('/projects') && !route.params.id
    })

    // Active filters count
    const hasActiveFilters = computed(() => {
      return statusFilter.value || ownerFilter.value || priorityFilter.value
    })

    const activeFiltersCount = computed(() => {
      let count = 0
      if (statusFilter.value) count++
      if (ownerFilter.value) count++
      if (priorityFilter.value) count++
      return count
    })

    // Methods
    const handleSearch = () => {
      emit('search-changed', searchQuery.value)
    }

    const switchView = (view) => {
      // Navigate directly to the view route
      const viewRoutes = {
        'list': '/projects/list',
        'card': '/projects/cards',
        'roadmap': '/projects/roadmap'
      }
      
      if (viewRoutes[view]) {
        router.push(viewRoutes[view])
      }
    }

    const toggleFilters = () => {
      showFilters.value = !showFilters.value
    }

    const handleFilterChange = () => {
      const filters = {
        status: statusFilter.value,
        owner: ownerFilter.value,
        priority: priorityFilter.value
      }
      emit('filter-changed', filters)
    }

    const clearFilters = () => {
      statusFilter.value = ''
      ownerFilter.value = ''
      priorityFilter.value = ''
      handleFilterChange()
    }

    const handleRefresh = () => {
      isLoading.value = true
      emit('refresh-requested')
      // Reset loading state after a delay
      setTimeout(() => {
        isLoading.value = false
      }, 1000)
    }

    return {
      // State
      isLoading,
      showFilters,
      searchQuery,
      statusFilter,
      ownerFilter,
      priorityFilter,
      
      // Computed
      currentView,
      showViewSwitcher,
      hasActiveFilters,
      activeFiltersCount,
      
      // Methods
      handleSearch,
      switchView,
      toggleFilters,
      handleFilterChange,
      clearFilters,
      handleRefresh
    }
  }
}
</script>

<style scoped>
/* Uses global CSS variables and styles from main.css */
.top-bar {
  background: var(--mdc-theme-surface);
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  box-shadow: var(--mdc-elevation-01);
  position: sticky;
  top: 0;
  z-index: 100;
}

.top-bar-content {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  gap: 16px;
  max-width: 1400px;
  margin: 0 auto;
}

.logo-section {
  flex-shrink: 0;
}

.app-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--mdc-theme-primary);
  cursor: pointer;
}

.search-section {
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 8px 16px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 24px;
  background: rgba(0, 0, 0, 0.04);
  font-size: 14px;
  outline: none;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.search-input:hover {
  background: rgba(0, 0, 0, 0.08);
  border-color: rgba(0, 0, 0, 0.24);
}

.search-input:focus {
  background: var(--mdc-theme-surface);
  border-color: var(--mdc-theme-primary);
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}

/* View Switcher */
.view-section {
  flex-shrink: 0;
}

.view-buttons {
  display: flex;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  padding: 4px;
  gap: 2px;
}

.view-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--mdc-theme-text-secondary-on-background);
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 80px;
  justify-content: center;
}

.view-button:hover:not(.active) {
  background: rgba(0, 0, 0, 0.04);
  color: var(--mdc-theme-text-primary-on-background);
}

.view-button.active {
  background: var(--mdc-theme-primary);
  color: var(--mdc-theme-on-primary);
  box-shadow: var(--mdc-elevation-01);
}

.view-button svg {
  flex-shrink: 0;
}

.button-text {
  font-weight: 500;
}

/* Filter Section */
.filter-section {
  position: relative;
  flex-shrink: 0;
}

.filter-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: var(--mdc-theme-surface);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--mdc-theme-text-primary-on-background);
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.filter-button:hover {
  background: rgba(0, 0, 0, 0.04);
  border-color: rgba(0, 0, 0, 0.24);
}

.filter-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--mdc-theme-primary);
  color: var(--mdc-theme-on-primary);
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

/* Actions Section */
.actions-section {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.refresh-button {
  width: 40px;
  height: 40px;
  border: none;
  background: var(--mdc-theme-surface);
  border-radius: 50%;
  cursor: pointer;
  color: var(--mdc-theme-text-secondary-on-background);
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.refresh-button:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.04);
  color: var(--mdc-theme-primary);
}

.refresh-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Filters Panel */
.filters-panel {
  background: var(--mdc-theme-surface);
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  padding: 16px 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.filter-content {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 120px;
}

.filter-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--mdc-theme-text-secondary-on-background);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  background: var(--mdc-theme-surface);
  font-size: 14px;
  color: var(--mdc-theme-text-primary-on-background);
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: var(--mdc-theme-primary);
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}

.filter-actions {
  margin-left: auto;
}

.clear-filters-btn {
  padding: 6px 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: var(--mdc-theme-surface);
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: var(--mdc-theme-text-secondary-on-background);
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.clear-filters-btn:hover {
  background: rgba(0, 0, 0, 0.04);
  color: var(--mdc-theme-text-primary-on-background);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .top-bar-content {
    flex-wrap: wrap;
    gap: 12px;
  }

  .search-section {
    order: -1;
    flex-basis: 100%;
    max-width: none;
  }

  .view-section {
    flex: 1;
  }

  .view-buttons {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .top-bar-content {
    padding: 8px 16px;
  }

  .view-button .button-text {
    display: none;
  }

  .view-button {
    min-width: 40px;
    padding: 8px;
  }

  .filter-button .button-text {
    display: none;
  }

  .filter-button {
    min-width: 40px;
    padding: 8px;
  }

  .actions-section {
    gap: 8px;
  }

  .filter-content {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .filter-group {
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .logo-section .app-title {
    font-size: 1.25rem;
  }

  .view-buttons {
    padding: 2px;
    gap: 1px;
  }

  .view-button {
    padding: 6px;
    min-width: 36px;
  }
}
</style>