// main.js - Application Entry Point
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Syncfusion imports
import { registerLicense } from '@syncfusion/ej2-base'
import { KanbanPlugin } from '@syncfusion/ej2-vue-kanban'
import { RichTextEditorPlugin } from '@syncfusion/ej2-vue-richtexteditor'
import { ButtonPlugin } from '@syncfusion/ej2-vue-buttons'
import { DropDownListPlugin } from '@syncfusion/ej2-vue-dropdowns'
import { DatePickerPlugin } from '@syncfusion/ej2-vue-calendars'
import { TextBoxPlugin } from '@syncfusion/ej2-vue-inputs'
import { ToastPlugin } from '@syncfusion/ej2-vue-notifications'
import { GridPlugin } from '@syncfusion/ej2-vue-grids'
import { SchedulePlugin } from '@syncfusion/ej2-vue-schedule'

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

// Register plugins
app.use(createPinia())
app.use(router)
app.use(Toast, toastOptions)

// Register Syncfusion components
app.use(KanbanPlugin)
app.use(RichTextEditorPlugin)
app.use(ButtonPlugin)
app.use(DropDownListPlugin)
app.use(DatePickerPlugin)
app.use(TextBoxPlugin)
app.use(ToastPlugin)
app.use(GridPlugin)
app.use(SchedulePlugin)

app.mount('#app')