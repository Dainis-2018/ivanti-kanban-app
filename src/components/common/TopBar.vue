<!-- src/components/common/TopBar.vue - Unified Application Top Bar -->
<template>
  <header class="top-bar">
    <div class="top-bar-content">
      <!-- Logo and Title -->
      <div class="logo-section">
        <h1 class="app-title">{{ safeTitle }}</h1>
      </div>

      <!-- Search Section -->
      <div class="search-section">
        <ejs-textbox
          :placeholder="safePlaceholder"
          :value="searchQuery"
          @input="handleSearch"
          cssClass="search-input"
          :showClearButton="true"
          :floatLabelType="'Never'"
        />
      </div>

      <!-- View Switcher (only show on projects page) -->
      <div v-if="showViewSwitcher" class="view-section">
        <div class="view-buttons">
          <ejs-button
            :content="safeListText"
            iconCss="e-icons e-list-unordered"
            :cssClass="currentView === 'list' ? 'view-button active' : 'view-button'"
            @click="switchView('list')"
          />
          <ejs-button
            :content="safeCardText"
            iconCss="e-icons e-card"
            :cssClass="currentView === 'card' ? 'view-button active' : 'view-button'"
            @click="switchView('card')"
          />
          <ejs-button
            :content="safeRoadmapText"
            iconCss="e-icons e-timeline"
            :cssClass="currentView === 'roadmap' ? 'view-button active' : 'view-button'"
            @click="switchView('roadmap')"
          />
        </div>
      </div>

      <!-- Filter Section -->
      <div class="filter-section">
        <ejs-button
          :content="safeFiltersText"
          iconCss="e-icons e-filter"
          cssClass="filter-button"
          @click="toggleFilters"
        />
        <span v-if="activeFiltersCount > 0" class="filter-badge">{{ activeFiltersCount }}</span>
      </div>

      <!-- Actions Section -->
      <div class="actions-section">
        <!-- Language Selector -->
        <ejs-dropdownlist
          :dataSource="languageItems"
          :fields="{ text: 'text', value: 'id' }"
          :value="currentLanguage"
          cssClass="language-selector"
          iconCss="e-icons e-world"
          :placeholder="safeLangPlaceholder"
          @change="handleLanguageChange"
        />
        <ejs-button
          iconCss="e-icons e-refresh"
          cssClass="refresh-button"
          @click="handleRefresh"
          :disabled="isLoading"
        />
      </div>
    </div>

    <!-- Filters Panel -->
    <div v-if="showFilters" class="filters-panel">
      <div class="filter-content">
        <!-- Status Filter -->
        <div class="filter-group">
          <label class="filter-label">{{ t('filters.status') }}</label>
          <select v-model="statusFilter" class="filter-select" @change="handleFilterChange">
            <option value="">{{ t('filters.allStatuses') }}</option>
            <option v-for="status in availableStatuses" :key="status" :value="status">
              {{ getStatusLabel(status) }}
            </option>
          </select>
        </div>

        <!-- Owner Filter -->
        <div class="filter-group">
          <label class="filter-label">{{ t('filters.owner') }}</label>
          <select v-model="ownerFilter" class="filter-select" @change="handleFilterChange">
            <option value="">{{ t('filters.allOwners') }}</option>
            <option v-for="owner in availableOwners" :key="owner" :value="owner">
              {{ owner }}
            </option>
          </select>
        </div>

        <!-- Priority Filter -->
        <div class="filter-group">
          <label class="filter-label">{{ t('filters.priority') }}</label>
          <select v-model="priorityFilter" class="filter-select" @change="handleFilterChange">
            <option value="">{{ t('filters.allPriorities') }}</option>
            <option value="Critical">{{ t('projects.priorityValues.critical') }}</option>
            <option value="High">{{ t('projects.priorityValues.high') }}</option>
            <option value="Medium">{{ t('projects.priorityValues.medium') }}</option>
            <option value="Low">{{ t('projects.priorityValues.low') }}</option>
          </select>
        </div>

        <!-- Clear Filters -->
        <div class="filter-actions">
          <button 
            v-if="hasActiveFilters"
            class="clear-filters-btn"
            @click="clearFilters"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
            </svg>
            {{ t('filters.clear') }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, computed, watch, inject } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectStore } from '@/stores/projectStore'
import { useLocalization } from '@/composables/useLocalization'

export default {
  name: 'TopBar',
  props: {
    currentView: {
      type: String,
      default: 'list'
    },
    activeFiltersCount: {
      type: Number,
      default: 0
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['search', 'view-change', 'filter-change', 'toggle-filters', 'refresh', 'language-change'],
  setup(props, { emit }) {
    const route = useRoute()
    const projectStore = useProjectStore()
    const { t, getSafe, setLocale, getLocale } = useLocalization()
    
    const searchQuery = ref('')
    const showFilters = ref(false)
    const statusFilter = ref('')
    const ownerFilter = ref('')
    const priorityFilter = ref('')

    // Safe text getters to prevent undefined values
    const safeTitle = computed(() => getSafe('app.title', 'Ivanti Kanban'))
    const safePlaceholder = computed(() => getSafe('app.search', 'Search...'))
    const safeFiltersText = computed(() => getSafe('app.filters', 'Filters'))
    const safeListText = computed(() => getSafe('views.list', 'List'))
    const safeCardText = computed(() => getSafe('views.card', 'Cards'))
    const safeRoadmapText = computed(() => getSafe('views.roadmap', 'Roadmap'))
    const safeLangPlaceholder = computed(() => getSafe('language.select', 'Language'))

    // Show view switcher only on projects pages
    const showViewSwitcher = computed(() => {
      return route.path.startsWith('/projects') && 
             !route.path.includes('/new') && 
             !route.path.includes('/edit') &&
             !route.params.id // Hide on detail pages
    })

    // Language options
    const languageItems = ref([
      { id: 'en', text: 'English' },
      { id: 'de', text: 'Deutsch' },
      { id: 'fr', text: 'Français' }
    ])

    const currentLanguage = ref(getLocale())

    // Get filter options from project store
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

    const hasActiveFilters = computed(() => {
      return searchQuery.value.trim() || statusFilter.value || ownerFilter.value || priorityFilter.value
    })

    // Event handlers
    const handleSearch = (args) => {
      // Handle both event objects and direct values
      const value = args?.value !== undefined ? args.value : args
      searchQuery.value = String(value || '')
      
      // Debounced search
      clearTimeout(handleSearch.timeout)
      handleSearch.timeout = setTimeout(() => {
        emit('search', searchQuery.value)
      }, 300)
    }

    const switchView = (view) => {
      emit('view-change', view)
    }

    const toggleFilters = () => {
      showFilters.value = !showFilters.value
      emit('toggle-filters', showFilters.value)
    }

    const handleFilterChange = () => {
      const filters = {
        status: statusFilter.value,
        owner: ownerFilter.value,
        priority: priorityFilter.value
      }
      emit('filter-change', filters)
    }

    const clearFilters = () => {
      searchQuery.value = ''
      statusFilter.value = ''
      ownerFilter.value = ''
      priorityFilter.value = ''
      emit('search', '')
      emit('filter-change', {})
    }

    const handleRefresh = () => {
      emit('refresh')
    }

    const handleLanguageChange = async (args) => {
      const newLang = args.value
      currentLanguage.value = newLang
      await setLocale(newLang)
      emit('language-change', newLang)
    }

    const getStatusLabel = (status) => {
      const statusKey = status.toLowerCase().replace(' ', '')
      return getSafe(`projects.statusValues.${statusKey}`, status)
    }

    // Watch for external filter changes
    watch(() => props.activeFiltersCount, (newCount) => {
      if (newCount === 0) {
        statusFilter.value = ''
        ownerFilter.value = ''
        priorityFilter.value = ''
      }
    })

    return {
      searchQuery,
      showFilters,
      statusFilter,
      ownerFilter,
      priorityFilter,
      languageItems,
      currentLanguage,
      safeTitle,
      safePlaceholder,
      safeFiltersText,
      safeListText,
      safeCardText,
      safeRoadmapText,
      safeLangPlaceholder,
      showViewSwitcher,
      availableStatuses,
      availableOwners,
      hasActiveFilters,
      handleSearch,
      switchView,
      toggleFilters,
      handleFilterChange,
      clearFilters,
      handleRefresh,
      handleLanguageChange,
      getStatusLabel,
      t
    }
  }
}
</script>

<style scoped>
.top-bar {
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  color: var(--primary-color, #1976d2);
}

.search-section {
  flex: 1;
  max-width: 400px;
}

.search-section :deep(.e-textbox) {
  width: 100%;
}

.search-section :deep(.e-input-group) {
  border-radius: 24px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: rgba(0, 0, 0, 0.04);
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.search-section :deep(.e-input-group:hover) {
  background: rgba(0, 0, 0, 0.08);
  border-color: rgba(0, 0, 0, 0.24);
}

.search-section :deep(.e-input-group.e-input-focus) {
  background: white;
  border-color: var(--primary-color, #1976d2);
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}

.search-section :deep(.e-input) {
  padding: 8px 16px;
  font-size: 14px;
  border: none;
  background: transparent;
}

.view-section {
  flex-shrink: 0;
}

.view-buttons {
  display: flex;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 6px;
  padding: 2px;
  gap: 2px;
}

.view-buttons :deep(.e-btn) {
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  border: none;
  background: transparent;
  color: rgba(0, 0, 0, 0.6);
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 70px;
}

.view-buttons :deep(.e-btn:hover) {
  background: rgba(0, 0, 0, 0.08);
  color: rgba(0, 0, 0, 0.87);
}

.view-buttons :deep(.e-btn.active) {
  background: white;
  color: var(--primary-color, #1976d2);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.filter-section {
  position: relative;
  flex-shrink: 0;
}

.filter-section :deep(.e-btn) {
  border-radius: 20px;
  padding: 6px 16px;
}

.filter-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #f44336;
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}

.actions-section {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.language-selector {
  min-width: 100px;
}

.filters-panel {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background: #f8f9fa;
  padding: 16px 24px;
}

.filter-content {
  display: flex;
  align-items: end;
  gap: 16px;
  max-width: 1400px;
  margin: 0 auto;
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
  color: rgba(0, 0, 0, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  background: white;
  font-size: 14px;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary-color, #1976d2);
}

.filter-actions {
  display: flex;
  align-items: center;
}

.clear-filters-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(244, 67, 54, 0.08);
  color: #f44336;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.clear-filters-btn:hover {
  background: rgba(244, 67, 54, 0.16);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .top-bar-content {
    flex-wrap: wrap;
    gap: 12px;
  }

  .search-section {
    order: 3;
    flex: 1 1 100%;
    max-width: none;
  }
}

@media (max-width: 768px) {
  .top-bar-content {
    padding: 12px 16px;
  }

  .view-buttons :deep(.e-btn .e-btn-content) {
    display: none;
  }

  .view-buttons :deep(.e-btn) {
    width: 36px;
    min-width: 36px;
    padding: 6px;
  }

  .filter-content {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .filter-group {
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .app-title {
    font-size: 1.25rem;
  }

  .top-bar-content {
    gap: 8px;
    padding: 8px 12px;
  }

  .actions-section {
    flex-direction: column;
    gap: 4px;
  }
}

/* Animation for filters panel */
.filters-panel {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>