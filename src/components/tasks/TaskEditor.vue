<!-- components/tasks/TaskEditor.vue - Task Creation/Editing Component -->
<template>
  <ejs-dialog
    ref="taskDialog"
    :header="dialogTitle"
    :isModal="true"
    :visible="true"
    :showCloseIcon="true"
    width="600px"
    height="auto"
    :buttons="dialogButtons"
    @overlayClick="cancel"
    cssClass="task-editor-dialog"
  >
    <div class="task-editor">
      <form @submit.prevent="save" class="task-form">
        <!-- Task Name -->
        <div class="form-group">
          <label class="form-label required">{{ t('tasks.name') }}</label>
          <ejs-textbox
            v-model="formData.name"
            :placeholder="t('tasks.name')"
            cssClass="form-control"
            :floatLabelType="'Auto'"
            required
          />
        </div>

        <!-- Status and Priority Row -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">{{ t('tasks.status') }}</label>
            <ejs-dropdownlist
              v-model="formData.status"
              :dataSource="statusOptions"
              :fields="{ text: 'text', value: 'value' }"
              :placeholder="t('filters.selectStatus')"
              cssClass="form-control"
            />
          </div>

          <div class="form-group">
            <label class="form-label">{{ t('tasks.priority') }}</label>
            <ejs-dropdownlist
              v-model="formData.priority"
              :dataSource="priorityOptions"
              :fields="{ text: 'text', value: 'value' }"
              :placeholder="t('filters.selectPriority')"
              cssClass="form-control"
            />
          </div>
        </div>

        <!-- Assignment Row -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">{{ t('tasks.assignedTo') }}</label>
            <ejs-dropdownlist
              v-model="formData.assignedTo"
              :dataSource="userOptions"
              :fields="{ text: 'text', value: 'value' }"
              :placeholder="t('filters.selectAssignee')"
              cssClass="form-control"
              :allowFiltering="true"
            />
          </div>

          <div class="form-group">
            <label class="form-label">{{ t('tasks.team') }}</label>
            <ejs-dropdownlist
              v-model="formData.team"
              :dataSource="teamOptions"
              :fields="{ text: 'text', value: 'value' }"
              :placeholder="t('filters.selectTeam')"
              cssClass="form-control"
              :allowFiltering="true"
            />
          </div>
        </div>

        <!-- Due Date -->
        <div class="form-group">
          <label class="form-label">{{ t('tasks.dueDate') }}</label>
          <ejs-datepicker
            v-model="formData.dueDate"
            :placeholder="t('tasks.dueDate')"
            cssClass="form-control"
            :min="new Date()"
          />
        </div>

        <!-- Description -->
        <div class="form-group">
          <label class="form-label">{{ t('tasks.description') }}</label>
          <ejs-richtexteditor
            v-model="formData.description"
            :height="200"
            :toolbarSettings="rteToolbarSettings"
            cssClass="task-description-editor"
          />
        </div>

        <!-- Tags -->
        <div class="form-group">
          <label class="form-label">{{ t('kanban.card.tags') }}</label>
          <ejs-textbox
            v-model="formData.tags"
            :placeholder="'Enter tags separated by commas'"
            cssClass="form-control"
          />
        </div>
      </form>
    </div>
  </ejs-dialog>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useLocalization } from '@/composables/useLocalization'
import { ODataService } from '@/services/odataService'

export default {
  name: 'TaskEditor',
  props: {
    task: {
      type: Object,
      default: null
    },
    isNew: {
      type: Boolean,
      default: true
    }
  },
  emits: ['save', 'cancel'],
  setup(props, { emit }) {
    const { t } = useLocalization()
    const taskDialog = ref(null)

    const formData = ref({
      name: '',
      status: 'Open',
      priority: 'Medium',
      assignedTo: null,
      team: null,
      dueDate: null,
      description: '',
      tags: ''
    })

    const userOptions = ref([])
    const teamOptions = ref([])

    const statusOptions = [
      { text: t('tasks.status.open'), value: 'Open' },
      { text: t('tasks.status.inProgress'), value: 'InProgress' },
      { text: t('tasks.status.testing'), value: 'Testing' },
      { text: t('tasks.status.done'), value: 'Done' }
    ]

    const priorityOptions = [
      { text: t('tasks.priority.critical'), value: 'Critical' },
      { text: t('tasks.priority.high'), value: 'High' },
      { text: t('tasks.priority.medium'), value: 'Medium' },
      { text: t('tasks.priority.low'), value: 'Low' }
    ]

    const rteToolbarSettings = {
      items: [
        'Bold', 'Italic', 'Underline', '|',
        'FontName', 'FontSize', 'FontColor', 'BackgroundColor', '|',
        'Formats', 'Alignments', '|',
        'NumberFormatList', 'BulletFormatList', '|',
        'CreateLink', 'Image', '|',
        'ClearFormat', 'Print', 'SourceCode', '|',
        'Undo', 'Redo'
      ]
    }

    const dialogTitle = computed(() => {
      return props.isNew ? t('tasks.create') : t('tasks.edit')
    })

    const dialogButtons = [
      {
        click: save,
        buttonModel: {
          content: t('actions.save'),
          cssClass: 'e-primary',
          isPrimary: true
        }
      },
      {
        click: cancel,
        buttonModel: {
          content: t('actions.cancel')
        }
      }
    ]

    const loadUsers = async () => {
      try {
        const users = await ODataService.getUsers()
        userOptions.value = users.map(user => ({
          text: user.FullName || user.UserName,
          value: user.UserId
        }))
      } catch (error) {
        console.error('Failed to load users:', error)
      }
    }

    const loadTeams = async () => {
      try {
        const teams = await ODataService.getTeams()
        teamOptions.value = teams.map(team => ({
          text: team.TeamName,
          value: team.TeamId
        }))
      } catch (error) {
        console.error('Failed to load teams:', error)
      }
    }

    const initializeForm = () => {
      if (props.task && !props.isNew) {
        formData.value = {
          name: props.task.Title || '',
          status: props.task.Status || 'Open',
          priority: props.task.Priority || 'Medium',
          assignedTo: props.task.Assignee || null,
          team: props.task.Team || null,
          dueDate: props.task.DueDate ? new Date(props.task.DueDate) : null,
          description: props.task.Summary || '',
          tags: props.task.Tags ? props.task.Tags.join(', ') : ''
        }
      } else {
        // Reset form for new task
        formData.value = {
          name: '',
          status: 'Open',
          priority: 'Medium',
          assignedTo: null,
          team: null,
          dueDate: null,
          description: '',
          tags: ''
        }
      }
    }

    const save = () => {
      // Validate required fields
      if (!formData.value.name.trim()) {
        return
      }

      const taskData = {
        TaskName: formData.value.name,
        Status: formData.value.status,
        Priority: formData.value.priority,
        AssignedTo: formData.value.assignedTo,
        Team: formData.value.team,
        DueDate: formData.value.dueDate,
        Description: formData.value.description,
        Tags: formData.value.tags ? formData.value.tags.split(',').map(tag => tag.trim()) : []
      }

      emit('save', taskData)
    }

    const cancel = () => {
      emit('cancel')
    }

    watch(() => props.task, () => {
      initializeForm()
    }, { immediate: true })

    onMounted(async () => {
      await loadUsers()
      await loadTeams()
      initializeForm()
    })

    return {
      taskDialog,
      formData,
      userOptions,
      teamOptions,
      statusOptions,
      priorityOptions,
      rteToolbarSettings,
      dialogTitle,
      dialogButtons,
      t,
      save,
      cancel
    }
  }
}
</script>

<style scoped>
.task-editor {
  padding: 16px 0;
}

.task-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.form-label.required::after {
  content: ' *';
  color: #d32f2f;
}

.form-control {
  width: 100%;
}

.task-description-editor {
  border: 1px solid #ddd;
  border-radius: 4px;
}

@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>