// composables/useLocalization.js - Safe Localization Composable
import { ref, computed } from 'vue'

// Current locale
const currentLocale = ref('en')

// Loaded translations
const translations = ref({})

// Default translations to prevent undefined values
const defaultTranslations = {
  app: {
    title: 'Ivanti Kanban',
    search: 'Search...',
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Operation completed successfully',
    noData: 'No data available'
  },
  projects: {
    title: 'Projects',
    name: 'Project Name',
    namePlaceholder: 'Enter project name',
    projectNumber: 'Project Number',
    projectNumberPlaceholder: 'Enter project number',
    description: 'Description',
    descriptionPlaceholder: 'Enter description',
    owner: 'Owner',
    ownerPlaceholder: 'Enter owner name',
    create: 'Create Project',
    edit: 'Edit Project'
  },
  filters: {
    allStatuses: 'All Statuses',
    allOwners: 'All Owners',
    selectPriority: 'Select Priority',
    selectStatus: 'Select Status'
  },
  actions: {
    back: 'Back',
    save: 'Save',
    saving: 'Saving...',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    refresh: 'Refresh',
    reset: 'Reset'
  }
}

// Load translation file
async function loadTranslations(locale) {
  if (translations.value[locale]) {
    return translations.value[locale]
  }

  try {
    const response = await fetch(`/locales/${locale}.json`)
    if (response.ok) {
      const data = await response.json()
      translations.value[locale] = { ...defaultTranslations, ...data }
      return translations.value[locale]
    } else {
      console.warn(`Failed to load translations for ${locale}, using defaults`)
      translations.value[locale] = defaultTranslations
      return defaultTranslations
    }
  } catch (error) {
    console.error(`Failed to load translations for ${locale}:`, error)
    // Use defaults and fallback to English if available
    if (locale !== 'en' && translations.value.en) {
      return translations.value.en
    }
    translations.value[locale] = defaultTranslations
    return defaultTranslations
  }
}

// Get nested property from object using dot notation
function getNestedProperty(obj, path, defaultValue = '') {
  if (!obj || !path) return defaultValue
  
  const result = path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null
  }, obj)
  
  // Ensure we always return a string for Syncfusion components
  if (result === null || result === undefined) {
    return defaultValue || path
  }
  
  return String(result)
}

// Replace placeholders in text
function replacePlaceholders(text, params = {}) {
  if (typeof text !== 'string') {
    return String(text || '')
  }
  
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    const value = params[key]
    return value !== undefined ? String(value) : match
  })
}

export function useLocalization() {
  // Get current translations
  const currentTranslations = computed(() => {
    return translations.value[currentLocale.value] || defaultTranslations
  })

  // Translation function with safe string handling
  const t = (key, params = {}) => {
    if (!key) return ''
    
    const text = getNestedProperty(currentTranslations.value, key, key)
    const result = replacePlaceholders(text, params)
    
    // Ensure we always return a non-empty string
    return result || key || ''
  }

  // Set locale and load translations
  const setLocale = async (locale) => {
    try {
      await loadTranslations(locale)
      currentLocale.value = locale
    } catch (error) {
      console.error('Failed to set locale:', error)
      // Fallback to default locale
      currentLocale.value = 'en'
      translations.value.en = defaultTranslations
    }
  }

  // Get available locales
  const getAvailableLocales = () => {
    const envLocales = import.meta.env.VITE_AVAILABLE_LOCALES || 'en,de,fr'
    return envLocales.split(',').map(locale => locale.trim())
  }

  // Get current locale
  const getLocale = () => currentLocale.value

  // Check if translations are loaded
  const isLoaded = computed(() => {
    return currentTranslations.value && Object.keys(currentTranslations.value).length > 0
  })

  // Initialize with default locale
  const initialize = async () => {
    const defaultLocale = import.meta.env.VITE_DEFAULT_LOCALE || 'en'
    
    // Set default translations immediately to prevent undefined values
    translations.value.en = defaultTranslations
    
    try {
      await setLocale(defaultLocale)
    } catch (error) {
      console.error('Failed to initialize localization:', error)
      // Use defaults as fallback
      currentLocale.value = 'en'
    }
  }

  // Pluralization helper
  const plural = (key, count, params = {}) => {
    const baseKey = count === 1 ? `${key}.singular` : `${key}.plural`
    return t(baseKey, { count, ...params })
  }

  // Date formatting with fallback
  const formatDate = (date, options = {}) => {
    if (!date) return ''
    
    try {
      const locale = currentLocale.value || 'en'
      const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }
      
      return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(new Date(date))
    } catch (error) {
      console.error('Date formatting error:', error)
      return String(date)
    }
  }

  // Number formatting with fallback
  const formatNumber = (number, options = {}) => {
    if (number === null || number === undefined) return ''
    
    try {
      const locale = currentLocale.value || 'en'
      return new Intl.NumberFormat(locale, options).format(number)
    } catch (error) {
      console.error('Number formatting error:', error)
      return String(number)
    }
  }

  // Currency formatting with fallback
  const formatCurrency = (amount, currency = 'USD', options = {}) => {
    if (amount === null || amount === undefined) return ''
    
    try {
      const locale = currentLocale.value || 'en'
      const defaultOptions = {
        style: 'currency',
        currency
      }
      
      return new Intl.NumberFormat(locale, { ...defaultOptions, ...options }).format(amount)
    } catch (error) {
      console.error('Currency formatting error:', error)
      return `${currency} ${amount}`
    }
  }

  // Safe getter for any translation key
  const getSafe = (key, fallback = '') => {
    return t(key) || fallback || key || ''
  }

  return {
    // State
    currentLocale,
    currentTranslations,
    isLoaded,
    
    // Core functions
    t,
    getSafe,
    setLocale,
    getLocale,
    getAvailableLocales,
    initialize,
    
    // Utility functions
    plural,
    formatDate,
    formatNumber,
    formatCurrency,
    
    // For advanced usage
    loadTranslations,
    replacePlaceholders
  }
}

// Global initialization with error handling
let globalLocalization = null

export function initializeLocalization() {
  if (!globalLocalization) {
    globalLocalization = useLocalization()
    
    // Initialize immediately with defaults to prevent undefined values
    globalLocalization.initialize().catch(error => {
      console.error('Failed to initialize global localization:', error)
    })
  }
  return globalLocalization
}