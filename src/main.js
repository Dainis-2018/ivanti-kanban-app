// src/main.js - Updated to include passive event listener optimization

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast from 'vue-toastification'
import router from './router'
import App from './App.vue'

// Initialize localization first to prevent undefined values
import { initializeLocalization } from '@/composables/useLocalization'

// Performance optimization for touch events
import { initializePerformanceOptimizations } from '@/utils/passiveEventFix'

// Syncfusion Styles
import '@syncfusion/ej2-base/styles/material.css'
import '@syncfusion/ej2-buttons/styles/material.css'
import '@syncfusion/ej2-calendars/styles/material.css'
import '@syncfusion/ej2-dropdowns/styles/material.css'
import '@syncfusion/ej2-inputs/styles/material.css'
import '@syncfusion/ej2-navigations/styles/material.css'
import '@syncfusion/ej2-popups/styles/material.css'
import '@syncfusion/ej2-splitbuttons/styles/material.css'
import '@syncfusion/ej2-grids/styles/material.css'
import '@syncfusion/ej2-treegrid/styles/material.css'
import '@syncfusion/ej2-gantt/styles/material.css'
import '@syncfusion/ej2-kanban/styles/material.css'
import '@syncfusion/ej2-richtexteditor/styles/material.css'
import '@syncfusion/ej2-schedule/styles/material.css'
import '@syncfusion/ej2-layouts/styles/material.css'
import '@syncfusion/ej2-notifications/styles/material.css'

// Syncfusion Plugins
import { ButtonPlugin } from '@syncfusion/ej2-vue-buttons'
import { CalendarPlugin, DatePickerPlugin, DateTimePickerPlugin } from '@syncfusion/ej2-vue-calendars'
import { DropDownListPlugin, MultiSelectPlugin, ComboBoxPlugin } from '@syncfusion/ej2-vue-dropdowns'
import { TextBoxPlugin, NumericTextBoxPlugin } from '@syncfusion/ej2-vue-inputs'
import { TabPlugin, ToolbarPlugin } from '@syncfusion/ej2-vue-navigations'
import { DialogPlugin, TooltipPlugin } from '@syncfusion/ej2-vue-popups'
import { GridPlugin } from '@syncfusion/ej2-vue-grids'
import { RichTextEditorPlugin } from '@syncfusion/ej2-vue-richtexteditor'
import { SchedulePlugin } from '@syncfusion/ej2-vue-schedule'
import { DashboardLayoutPlugin, SplitterPlugin } from '@syncfusion/ej2-vue-layouts'
import { ToastPlugin } from '@syncfusion/ej2-vue-notifications'
import { KanbanPlugin } from '@syncfusion/ej2-vue-kanban'

// Gantt Plugin with all required modules
import { GanttPlugin } from '@syncfusion/ej2-vue-gantt'

// Vue Toastification styles
import 'vue-toastification/dist/index.css'

// Application styles
import './assets/styles/main.css'

// IMPORTANT: Initialize performance optimizations EARLY
// This must be done before creating the Vue app to ensure proper event handling
initializePerformanceOptimizations()

// Create Vue app
const app = createApp(App)

// Create Pinia store
const pinia = createPinia()

// Initialize localization immediately to prevent undefined values
const localization = initializeLocalization()

// Toast configuration
const toastOptions = {
  position: 'top-right',
  timeout: 4000,
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
  transition: 'Vue-Toastification__bounce',
  maxToasts: 20,
  newestOnTop: true
}

// Global error handler (setup early to catch initialization errors)
app.config.errorHandler = (error, instance, info) => {
  console.error('Global error:', error)
  console.error('Component:', instance)
  console.error('Info:', info)
  
  // Prevent cascading errors with safe error reporting
  try {
    if (import.meta.env.PROD) {
      // Send to error tracking service in production
      console.error('Production error occurred:', { 
        error: error.message, 
        info,
        stack: error.stack?.substring(0, 500) // Limit stack trace size
      })
    }
  } catch (reportingError) {
    console.error('Failed to report error:', reportingError)
  }
}

// Global warning handler (only in development)
if (import.meta.env.DEV) {
  app.config.warnHandler = (msg, instance, trace) => {
    // Filter out common Syncfusion warnings that don't affect functionality
    if (msg.includes('Module') && msg.includes('not available')) {
      console.debug('Syncfusion module warning (handled):', msg)
      return
    }
    if (msg.includes('placeholder') || msg.includes('str.replace')) {
      console.debug('Syncfusion warning (handled):', msg)
      return
    }
    // Filter out passive event listener warnings as they're now handled globally
    if (msg.includes('passive') || msg.includes('touchmove')) {
      console.debug('Touch event warning (optimized):', msg)
      return
    }
    console.warn('Vue warning:', msg)
    console.warn('Component:', instance)
    console.warn('Trace:', trace)
  }
}

// Register Syncfusion plugins with error handling
try {
  app.use(ButtonPlugin)
  app.use(CalendarPlugin)
  app.use(DatePickerPlugin)
  app.use(DateTimePickerPlugin)
  app.use(DropDownListPlugin)
  app.use(MultiSelectPlugin)
  app.use(ComboBoxPlugin)
  app.use(TextBoxPlugin)
  app.use(NumericTextBoxPlugin)
  app.use(TabPlugin)
  app.use(ToolbarPlugin)
  app.use(DialogPlugin)
  app.use(TooltipPlugin)
  app.use(GridPlugin)
  app.use(RichTextEditorPlugin)
  app.use(SchedulePlugin)
  app.use(DashboardLayoutPlugin)
  app.use(SplitterPlugin)
  app.use(ToastPlugin)
  app.use(KanbanPlugin)
  
  // Register Gantt plugin with complete module configuration
  app.use(GanttPlugin)
  
} catch (syncfusionError) {
  console.error('Failed to register Syncfusion plugins:', syncfusionError)
}

// Register core plugins
app.use(pinia)
app.use(router)
app.use(Toast, toastOptions)

// Syncfusion license registration with error handling
if (import.meta.env.VITE_SYNCFUSION_LICENSE_KEY) {
  try {
    const { registerLicense } = await import('@syncfusion/ej2-base')
    registerLicense(import.meta.env.VITE_SYNCFUSION_LICENSE_KEY)
    console.log('Syncfusion license registered successfully')
  } catch (licenseError) {
    console.warn('Failed to register Syncfusion license:', licenseError)
  }
} else {
  console.warn('Syncfusion license key not found. Add VITE_SYNCFUSION_LICENSE_KEY to environment variables.')
}

// Provide global localization instance
app.provide('localization', localization)

// Safe component mounting with error handling
async function mountApp() {
  try {
    // Wait for localization to initialize
    await localization.initialize()
    
    // Mount the app
    app.mount('#app')
    
    console.log('✅ Ivanti Kanban App mounted successfully with performance optimizations')
  } catch (mountError) {
    console.error('Failed to mount application:', mountError)
    
    // Show user-friendly error message
    const appElement = document.getElementById('app')
    if (appElement) {
      appElement.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          padding: 20px;
          text-align: center;
          font-family: Arial, sans-serif;
        ">
          <h1 style="color: #f44336; margin-bottom: 16px;">Application Error</h1>
          <p style="color: #666; margin-bottom: 20px;">
            Failed to start the application. Please refresh the page or contact support.
          </p>
          <button 
            onclick="window.location.reload()"
            style="
              padding: 12px 24px;
              background: #1976d2;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
            "
          >
            Refresh Page
          </button>
          <details style="margin-top: 20px; max-width: 600px;">
            <summary style="cursor: pointer; color: #666;">Technical Details</summary>
            <pre style="
              text-align: left;
              background: #f5f5f5;
              padding: 16px;
              border-radius: 4px;
              overflow: auto;
              font-size: 12px;
              margin-top: 8px;
            ">${mountError.message}</pre>
          </details>
        </div>
      `
    }
  }
}

// Start the application
mountApp()