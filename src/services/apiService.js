// services/apiService.js - Main API Service
import axios from 'axios'
import { useToast } from '@/composables/useToast'

// Create axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Add API key if available
if (import.meta.env.VITE_API_KEY) {
  apiClient.defaults.headers.common['X-API-Key'] = import.meta.env.VITE_API_KEY
}

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching
    config.params = {
      ...config.params,
      _t: Date.now()
    }
    
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    const { showToast } = useToast()
    
    console.error('API Error:', error)
    
    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          showToast('Bad request - please check your input', 'error')
          break
        case 401:
          showToast('Unauthorized - please check your credentials', 'error')
          break
        case 403:
          showToast('Access forbidden', 'error')
          break
        case 404:
          showToast('Resource not found', 'error')
          break
        case 500:
          showToast('Server error - please try again later', 'error')
          break
        default:
          showToast(`API Error: ${data?.message || 'Unknown error'}`, 'error')
      }
    } else if (error.request) {
      showToast('Network error - please check your connection', 'error')
    } else {
      showToast('Request configuration error', 'error')
    }
    
    return Promise.reject(error)
  }
)

// Generic API methods
export class ApiService {
  static async get(url, params = {}) {
    const response = await apiClient.get(url, { params })
    return response.data
  }

  static async post(url, data = {}) {
    const response = await apiClient.post(url, data)
    return response.data
  }

  static async put(url, data = {}) {
    const response = await apiClient.put(url, data)
    return response.data
  }

  static async patch(url, data = {}) {
    const response = await apiClient.patch(url, data)
    return response.data
  }

  static async delete(url) {
    const response = await apiClient.delete(url)
    return response.data
  }
}

export default apiClient