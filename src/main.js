// main.js - Application Entry Point with Proper Syncfusion Registration
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Syncfusion license registration
import { registerLicense } from '@syncfusion/ej2-base'

// Syncfusion Grid with required modules - use GridPlugin for proper initialization
import { GridPlugin, Grid, Filter, Sort, Page, Reorder, Resize, ColumnChooser, ColumnMenu, Search, Selection } from '@syncfusion/ej2-vue-grids'

// Other Syncfusion components
import { RichTextEditorPlugin } from '@syncfusion/ej2-vue-richtexteditor'
import { ButtonPlugin } from '@syncfusion/ej2-vue-buttons'
import { DropDownListPlugin, MultiSelectPlugin } from '@syncfusion/ej2-vue-dropdowns'
import { DatePickerPlugin, DateRangePickerPlugin } from '@syncfusion/ej2-vue-calendars'
import { TextBoxPlugin } from '@syncfusion/ej2-vue-inputs'
import { ToastPlugin } from '@syncfusion/ej2-vue-notifications'
import { Schedule, Day, Week, WorkWeek, Month, Agenda, Resize as ScheduleResize, DragAndDrop } from '@syncfusion/ej2-vue-schedule'

// Import Kanban component only (not plugin to avoid conflicts)
import { Kanban } from '@syncfusion/ej2-vue-kanban'

// Toast notifications
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

// Styles
import './assets/styles/main.css'
import './assets/styles/syncfusion-theme.css'

// Register Syncfusion license
if (import.meta.env.VITE_SYNCFUSION_LICENSE_KEY) {
  registerLicense(import.meta.env.VITE_SYNCFUSION_LICENSE_KEY)
}

// IMPORTANT: Inject Grid feature modules BEFORE creating the app
Grid.Inject(Filter, Sort, Page, Reorder, Resize, ColumnChooser, ColumnMenu, Search, Selection)

// Inject Schedule feature modules
Schedule.Inject(Day, Week, WorkWeek, Month, Agenda, ScheduleResize, DragAndDrop)

const app = createApp(App)

// Toast configuration
const toastOptions = {
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
  rtl: false
}

// Register core plugins
app.use(createPinia())
app.use(router)
app.use(Toast, toastOptions)

// Register Syncfusion components in order
// 1. Grid first (provides column components)
app.use(GridPlugin)

// 2. Other components that don't conflict
app.use(RichTextEditorPlugin)
app.use(ButtonPlugin)
app.use(DropDownListPlugin)
app.use(MultiSelectPlugin)
app.use(DatePickerPlugin)
app.use(DateRangePickerPlugin)
app.use(TextBoxPlugin)
app.use(ToastPlugin)

// 3. Manual component registration for components with shared directives (like e-column)
app.component('ejs-kanban', Kanban)
app.component('ejs-schedule', Schedule)

// Mount the application
app.mount('#app')

// Enable development tools
if (import.meta.env.DEV) {
  console.log('🚀 Ivanti Kanban App started in development mode')
  console.log('📊 Syncfusion Grid modules injected:', [
    'Filter', 'Sort', 'Page', 'Reorder', 'Resize', 'ColumnChooser', 'ColumnMenu', 'Search', 'Selection'
  ])
  console.log('🔧 Syncfusion components registered:')
  console.log('  - GridPlugin (with e-column, e-columns)')
  console.log('  - RichTextEditor, Button, DropDownList, MultiSelect')
  console.log('  - DatePicker, DateRangePicker, TextBox, Toast, Schedule')
  console.log('  - Kanban, Schedule (manual registration)')
  console.log('✅ Application ready')
}