// services/apiService.js - Main API Service
import axios from 'axios'
import { useToast } from '@/composables/useToast'

// SID cache for production
let cachedSid = null

// Function to get the correct authorization header
const getAuthorizationHeader = async () => {
  // For development, use the API key from environment variables
  if (import.meta.env.DEV) {
    return `rest_api_key=${import.meta.env.VITE_API_KEY}`
  }

  // For production, fetch the SID from a dedicated endpoint and cache it.
  if (cachedSid) {
    return cachedSid
  }

  // Since the session cookie is HttpOnly, it cannot be read by client-side JavaScript.
  // We fetch the SID from our dedicated endpoint and cache it in memory.
  try {
    // Use a new, clean axios instance to avoid interceptor recursion
    const { data } = await axios.create().get(`${window.location.origin}/HEAT/ivanti-kanban/sid.aspx`)
    cachedSid = data
    return cachedSid
  } catch (error) {
    const { showToast } = useToast()
    console.error('Failed to fetch SID:', error)
    showToast('Authentication session could not be established.', 'error')
    return Promise.reject(new Error('Failed to fetch SID'))
  }
}
// Create axios instance
const apiClient = axios.create({
  // In development, we use a relative path ('') because the full path, including '/api',
  // is provided in each request. The '/api' prefix is caught by the Vite proxy.
  // In production, the base URL is constructed dynamically to point to the /HEAT/ path
  // relative to the application's origin. The request interceptor handles stripping the /api prefix.
  baseURL: import.meta.env.DEV ? '' : `${window.location.origin}/HEAT/`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    // Set the dynamic authorization header for each request
    config.headers.Authorization = await getAuthorizationHeader()

    // In production, remove the /api prefix from the start of the URL.
    // This prefix is only used to trigger the Vite dev proxy.
    if (!import.meta.env.DEV && config.url.startsWith('/api/')) {
      config.url = config.url.substring(4)
    }

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