// composables/useLocalization.js - Localization Composable
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/appStore'

const translations = ref({})

export function useLocalization() {
  const appStore = useAppStore()

  const currentLocale = computed(() => appStore.locale)

  const loadTranslations = async (locale) => {
    try {
      const response = await fetch(`/locales/${locale}.json`)
      if (!response.ok) {
        throw new Error(`Failed to load locale: ${locale}`)
      }
      const data = await response.json()
      translations.value[locale] = data
      return data
    } catch (error) {
      console.error('Error loading translations:', error)
      // Fallback to English if current locale fails
      if (locale !== 'en') {
        return await loadTranslations('en')
      }
      throw error
    }
  }

  const t = (key, params = {}) => {
    const locale = currentLocale.value
    const localeTranslations = translations.value[locale] || {}
    
    // Navigate through nested keys (e.g., 'app.title')
    const keys = key.split('.')
    let value = localeTranslations
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        // Return key if translation not found
        return key
      }
    }

    // Replace parameters in translation
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return value.replace(/\{(\w+)\}/g, (match, param) => {
        return params[param] !== undefined ? params[param] : match
      })
    }

    return value || key
  }

  const setLocale = async (locale) => {
    try {
      await loadTranslations(locale)
      appStore.setLocale(locale)
      localStorage.setItem('ivanti-kanban-locale', locale)
    } catch (error) {
      console.error('Failed to set locale:', error)
      throw error
    }
  }

  const initializeLocalization = async () => {
    const savedLocale = localStorage.getItem('ivanti-kanban-locale') || 'en'
    await loadTranslations(savedLocale)
    appStore.setLocale(savedLocale)
  }

  const getAvailableLocales = () => {
    return ['en', 'de', 'fr'] // Add more locales as needed
  }

  return {
    translations,
    currentLocale,
    t,
    setLocale,
    initializeLocalization,
    getAvailableLocales
  }
}