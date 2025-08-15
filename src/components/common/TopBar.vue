<!-- components/common/TopBar.vue - Application Top Bar -->
<template>
  <header class="top-bar">
    <div class="top-bar-content">
      <!-- Logo and Title -->
      <div class="logo-section">
        <h1 class="app-title">{{ t('app.title') }}</h1>
      </div>

      <!-- Search Section -->
      <div class="search-section">
        <ejs-textbox
          :placeholder="t('app.search')"
          :value="searchQuery"
          @input="handleSearch"
          cssClass="search-input"
          :showClearButton="true"
        />
      </div>

      <!-- Filter Section -->
      <div class="filter-section">
        <ejs-button
          :content="t('app.filters')"
          iconCss="e-icons e-filter"
          cssClass="filter-button"
          @click="toggleFilters"
        />
        <span v-if="activeFiltersCount > 0" class="filter-badge">{{ activeFiltersCount }}</span>
      </div>

      <!-- View Switcher -->
      <div class="view-section">
        <div class="view-buttons">
          <ejs-button
            :content="t('views.list')"
            iconCss="e-icons e-list-unordered"
            :cssClass="currentView === 'list' ? 'view-button active' : 'view-button'"
            @click="switchView('list')"
          />
          <ejs-button
            :content="t('views.card')"
            iconCss="e-icons e-card"
            :cssClass="currentView === 'card' ? 'view-button active' : 'view-button'"
            @click="switchView('card')"
          />
          <ejs-button
            :content="t('views.roadmap')"
            iconCss="e-icons e-timeline"
            :cssClass="currentView === 'roadmap' ? 'view-button active' : 'view-button'"
            @click="switchView('roadmap')"
          />
        </div>
      </div>

      <!-- Actions Section -->
      <div class="actions-section">
        <!-- Language Selector using DropDownList instead of DropDownButton -->
        <ejs-dropdownlist
          :dataSource="languageItems"
          :fields="{ text: 'text', value: 'id' }"
          :value="currentLanguage"
          cssClass="language-selector"
          iconCss="e-icons e-world"
          :placeholder="t('language.select')"
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
      <SearchFilter
        @filter-change="handleFilterChange"
        @clear-filters="handleClearFilters"
      />
    </div>
  </header>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { useLocalization } from '@/composables/useLocalization'
import SearchFilter from './SearchFilter.vue'

export default {
  name: 'TopBar',
  components: {
    SearchFilter
  },
  emits: ['search', 'filter', 'view-change', 'refresh'],
  setup(props, { emit }) {
    const appStore = useAppStore()
    const { t, setLocale, currentLocale } = useLocalization()

    const searchQuery = ref('')
    const showFilters = ref(false)
    const isLoading = computed(() => appStore.isLoading)
    const currentView = computed(() => appStore.currentView)
    const activeFiltersCount = computed(() => {
      return Object.keys(appStore.activeFilters).length
    })

    const languageItems = ref([
      { text: 'English', id: 'en' },
      { text: 'Deutsch', id: 'de' },
      { text: 'Français', id: 'fr' }
    ])

    const currentLanguage = computed(() => currentLocale.value || 'en')

    const handleSearch = (args) => {
      searchQuery.value = args.value
      emit('search', args.value)
    }

    const toggleFilters = () => {
      showFilters.value = !showFilters.value
    }

    const switchView = (view) => {
      emit('view-change', view)
    }

    const handleLanguageChange = async (args) => {
      try {
        await setLocale(args.value)
      } catch (error) {
        console.error('Failed to change language:', error)
      }
    }

    const handleRefresh = () => {
      emit('refresh')
    }

    const handleFilterChange = (filters) => {
      emit('filter', filters)
    }

    const handleClearFilters = () => {
      searchQuery.value = ''
      showFilters.value = false
      emit('filter', {})
      emit('search', '')
    }

    return {
      searchQuery,
      showFilters,
      isLoading,
      currentView,
      activeFiltersCount,
      languageItems,
      currentLanguage,
      t,
      handleSearch,
      toggleFilters,
      switchView,
      handleLanguageChange,
      handleRefresh,
      handleFilterChange,
      handleClearFilters
    }
  }
}
</script>

<style scoped>
.top-bar {
  background: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.top-bar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  max-width: 100%;
}

.logo-section {
  flex-shrink: 0;
}

.app-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.search-section {
  flex: 1;
  max-width: 400px;
  margin: 0 24px;
}

.search-input {
  width: 100%;
}

.filter-section {
  position: relative;
  margin-right: 16px;
}

.filter-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff4444;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.view-section {
  margin-right: 16px;
}

.view-buttons {
  display: flex;
  gap: 4px;
}

.view-button {
  border-radius: 6px;
}

.view-button.active {
  background-color: #0078d4;
  color: white;
}

.actions-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.language-selector {
  min-width: 120px;
}

.filters-panel {
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
  padding: 16px 24px;
}

@media (max-width: 768px) {
  .top-bar-content {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .search-section {
    margin: 0;
    max-width: none;
  }

  .view-buttons {
    justify-content: center;
  }

  .actions-section {
    justify-content: center;
  }
}
</style>