// composables/useToast.js - Toast Notifications Composable
import { useToast as useVueToastification } from 'vue-toastification'

export function useToast() {
  const toast = useVueToastification()

  const showToast = (message, type = 'info', options = {}) => {
    const defaultOptions = {
      position: 'top-right',
      timeout: 5000,
      closeOnClick: true,
      pauseOnFocusLoss: true,
      pauseOnHover: true,
      draggable: true,
      draggablePercent: 0.6,
      showCloseButtonOnHover: false,
      hideProgressBar: false,
      closeButton: 'button',
      icon: true,
      rtl: false,
      ...options
    }

    switch (type) {
      case 'success':
        toast.success(message, defaultOptions)
        break
      case 'error':
        toast.error(message, defaultOptions)
        break
      case 'warning':
        toast.warning(message, defaultOptions)
        break
      case 'info':
      default:
        toast.info(message, defaultOptions)
        break
    }
  }

  const showSuccess = (message, options = {}) => {
    showToast(message, 'success', options)
  }

  const showError = (message, options = {}) => {
    showToast(message, 'error', options)
  }

  const showWarning = (message, options = {}) => {
    showToast(message, 'warning', options)
  }

  const showInfo = (message, options = {}) => {
    showToast(message, 'info', options)
  }

  const clearAll = () => {
    toast.clear()
  }

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAll
  }
}