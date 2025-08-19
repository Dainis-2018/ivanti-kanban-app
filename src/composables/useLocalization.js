// composables/useLocalization.js - Localization Composable
import { ref, computed } from 'vue'

// Current locale
const currentLocale = ref('en')

// Loaded translations
const translations = ref({})

// Load translation file
async function loadTranslations(locale) {
  if (translations.value[locale]) {
    return translations.value[locale]
  }

  try {
    const response = await fetch(`/locales/${locale}.json`)
    const data = await response.json()
    translations.value[locale] = data
    return data
  } catch (error) {
    console.error(`Failed to load translations for ${locale}:`, error)
    // Fallback to English if available
    if (locale !== 'en' && translations.value.en) {
      return translations.value.en
    }
    return {}
  }
}

// Get nested property from object using dot notation
function getNestedProperty(obj, path, defaultValue = path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : defaultValue
  }, obj)
}

// Replace placeholders in text
function replacePlaceholders(text, params = {}) {
  if (typeof text !== 'string') return text
  
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? params[key] : match
  })
}

export function useLocalization() {
  // Get current translations
  const currentTranslations = computed(() => {
    return translations.value[currentLocale.value] || {}
  })

  // Translation function
  const t = (key, params = {}) => {
    const text = getNestedProperty(currentTranslations.value, key, key)
    return replacePlaceholders(text, params)
  }

  // Set locale and load translations
  const setLocale = async (locale) => {
    await loadTranslations(locale)
    currentLocale.value = locale
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
    await setLocale(defaultLocale)
  }

  // Pluralization helper
  const plural = (key, count, params = {}) => {
    const baseKey = count === 1 ? `${key}.singular` : `${key}.plural`
    return t(baseKey, { count, ...params })
  }

  // Date formatting
  const formatDate = (date, options = {}) => {
    if (!date) return ''
    
    const locale = currentLocale.value
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }
    
    return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(new Date(date))
  }

  // Number formatting
  const formatNumber = (number, options = {}) => {
    if (number === null || number === undefined) return ''
    
    const locale = currentLocale.value
    return new Intl.NumberFormat(locale, options).format(number)
  }

  // Currency formatting
  const formatCurrency = (amount, currency = 'USD', options = {}) => {
    if (amount === null || amount === undefined) return ''
    
    const locale = currentLocale.value
    const defaultOptions = {
      style: 'currency',
      currency
    }
    
    return new Intl.NumberFormat(locale, { ...defaultOptions, ...options }).format(amount)
  }

  return {
    // State
    currentLocale,
    currentTranslations,
    isLoaded,
    
    // Core functions
    t,
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

// Global initialization
let globalLocalization = null

export function initializeLocalization() {
  if (!globalLocalization) {
    globalLocalization = useLocalization()
    globalLocalization.initialize()
  }
  return globalLocalization
}