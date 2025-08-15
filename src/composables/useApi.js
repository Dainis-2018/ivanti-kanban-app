// composables/useApi.js - API Operations Composable
import { ref } from 'vue'
import { ODataService } from '@/services/odataService'
import { useToast } from './useToast'

export function useApi() {
  const isLoading = ref(false)
  const error = ref(null)
  const { showError, showSuccess } = useToast()

  const executeOperation = async (operation, successMessage = null) => {
    isLoading.value = true
    error.value = null

    try {
      const result = await operation()
      
      if (successMessage) {
        showSuccess(successMessage)
      }
      
      return result
    } catch (err) {
      error.value = err.message
      showError(`Operation failed: ${err.message}`)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchData = async (fetchFunction, errorMessage = 'Failed to fetch data') => {
    return executeOperation(fetchFunction, null)
  }

  const saveData = async (saveFunction, successMessage = 'Data saved successfully') => {
    return executeOperation(saveFunction, successMessage)
  }

  const deleteData = async (deleteFunction, successMessage = 'Data deleted successfully') => {
    return executeOperation(deleteFunction, successMessage)
  }

  return {
    isLoading,
    error,
    executeOperation,
    fetchData,
    saveData,
    deleteData
  }
}