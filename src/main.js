import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast from 'vue-toastification'
import router from './router'
import App from './App.vue'

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
import { GanttPlugin } from '@syncfusion/ej2-vue-gantt'
import { KanbanPlugin } from '@syncfusion/ej2-vue-kanban'
import { RichTextEditorPlugin } from '@syncfusion/ej2-vue-richtexteditor'
import { SchedulePlugin } from '@syncfusion/ej2-vue-schedule'
import { DashboardLayoutPlugin, SplitterPlugin } from '@syncfusion/ej2-vue-layouts'
import { ToastPlugin } from '@syncfusion/ej2-vue-notifications'

// Vue Toastification styles
import 'vue-toastification/dist/index.css'

// Application styles
import './assets/styles/main.css'

// Create Vue app
const app = createApp(App)

// Create Pinia store
const pinia = createPinia()

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

// Register Syncfusion plugins
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
app.use(GanttPlugin)
app.use(KanbanPlugin)
app.use(RichTextEditorPlugin)
app.use(SchedulePlugin)
app.use(DashboardLayoutPlugin)
app.use(SplitterPlugin)
app.use(ToastPlugin)

// Register core plugins
app.use(pinia)
app.use(router)
app.use(Toast, toastOptions)

// Syncfusion license registration
// This will be set via environment variable in production
if (import.meta.env.VITE_SYNCFUSION_LICENSE_KEY) {
  const { registerLicense } = await import('@syncfusion/ej2-base')
  registerLicense(import.meta.env.VITE_SYNCFUSION_LICENSE_KEY)
}

// Global error handler
app.config.errorHandler = (error, instance, info) => {
  console.error('Global error:', error)
  console.error('Component:', instance)
  console.error('Info:', info)
  
  // You can send error to logging service here
  if (import.meta.env.PROD) {
    // Send to error tracking service in production
    console.error('Production error occurred:', { error, info })
  }
}

// Global warning handler (only in development)
if (import.meta.env.DEV) {
  app.config.warnHandler = (msg, instance, trace) => {
    console.warn('Vue warning:', msg)
    console.warn('Component:', instance)
    console.warn('Trace:', trace)
  }
}

// Mount the app
app.mount('#app')