// composables/useFilters.js - Filtering and Search Composable
import { ref, computed } from 'vue'

export function useFilters(items, defaultFilters = {}) {
  const filters = ref({ ...defaultFilters })
  const searchQuery = ref('')

  const filteredItems = computed(() => {
    let result = items.value || []

    // Apply search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(item => {
        return Object.values(item).some(value => {
          if (typeof value === 'string') {
            return value.toLowerCase().includes(query)
          }
          return false
        })
      })
    }

    // Apply filters
    Object.entries(filters.value).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          result = result.filter(item => value.includes(item[key]))
        } else {
          result = result.filter(item => item[key] === value)
        }
      }
    })

    return result
  })

  const setFilter = (key, value) => {
    filters.value[key] = value
  }

  const removeFilter = (key) => {
    delete filters.value[key]
  }

  const clearFilters = () => {
    filters.value = { ...defaultFilters }
    searchQuery.value = ''
  }

  const setSearchQuery = (query) => {
    searchQuery.value = query
  }

  const hasActiveFilters = computed(() => {
    const activeFilters = Object.entries(filters.value).filter(([key, value]) => {
      return value !== null && value !== undefined && value !== '' && value !== defaultFilters[key]
    })
    return activeFilters.length > 0 || searchQuery.value !== ''
  })

  const activeFiltersCount = computed(() => {
    const activeFilters = Object.entries(filters.value).filter(([key, value]) => {
      return value !== null && value !== undefined && value !== '' && value !== defaultFilters[key]
    })
    return activeFilters.length + (searchQuery.value ? 1 : 0)
  })

  return {
    filters,
    searchQuery,
    filteredItems,
    setFilter,
    removeFilter,
    clearFilters,
    setSearchQuery,
    hasActiveFilters,
    activeFiltersCount
  }
}