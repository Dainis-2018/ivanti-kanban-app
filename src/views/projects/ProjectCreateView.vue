<template>
  <div class="project-create-view">
    <div class="create-header">
      <h1 class="mdc-typography--headline4">{{ t('projects.create') }}</h1>
      <p class="mdc-typography--body1">{{ t('projects.createDescription') }}</p>
    </div>

    <div class="create-form-container">
      <form @submit.prevent="handleSubmit" class="project-form">
        <div class="form-section">
          <h2 class="mdc-typography--headline6">{{ t('projects.basicInfo') }}</h2>
          
          <div class="form-field">
            <label class="form-label">{{ t('projects.name') }} *</label>
            <input
              v-model="form.projectName"
              type="text"
              class="form-input"
              :placeholder="t('projects.namePlaceholder')"
              required
            >
          </div>

          <div class="form-field">
            <label class="form-label">{{ t('projects.projectNumber') }}</label>
            <input
              v-model="form.projectNumber"
              type="text"
              class="form-input"
              :placeholder="t('projects.projectNumberPlaceholder')"
            >
          </div>

          <div class="form-field">
            <label class="form-label">{{ t('projects.description') }}</label>
            <textarea
              v-model="form.summary"
              class="form-textarea"
              rows="4"
              :placeholder="t('projects.descriptionPlaceholder')"
            ></textarea>
          </div>
        </div>

        <div class="form-section">
          <h2 class="mdc-typography--headline6">{{ t('projects.timeline') }}</h2>
          
          <div class="form-row">
            <div class="form-field">
              <label class="form-label">{{ t('projects.startDate') }} *</label>
              <input
                v-model="form.startDate"
                type="date"
                class="form-input"
                required
              >
            </div>

            <div class="form-field">
              <label class="form-label">{{ t('projects.endDate') }} *</label>
              <input
                v-model="form.endDate"
                type="date"
                class="form-input"
                required
                :min="form.startDate"
              >
            </div>
          </div>
        </div>

        <div class="form-section">
          <h2 class="mdc-typography--headline6">{{ t('projects.management') }}</h2>
          
          <div class="form-row">
            <div class="form-field">
              <label class="form-label">{{ t('projects.owner') }}</label>
              <input
                v-model="form.owner"
                type="text"
                class="form-input"
                :placeholder="t('projects.ownerPlaceholder')"
              >
            </div>

            <div class="form-field">
              <label class="form-label">{{ t('projects.priority') }}</label>
              <select v-model="form.priority" class="form-select">
                <option value="">{{ t('filters.selectPriority') }}</option>
                <option value="Critical">{{ t('projects.priorityValues.critical') }}</option>
                <option value="High">{{ t('projects.priorityValues.high') }}</option>
                <option value="Medium">{{ t('projects.priorityValues.medium') }}</option>
                <option value="Low">{{ t('projects.priorityValues.low') }}</option>
              </select>
            </div>
          </div>

          <div class="form-field">
            <label class="form-label">{{ t('projects.status') }}</label>
            <select v-model="form.status" class="form-select">
              <option value="">{{ t('filters.selectStatus') }}</option>
              <option value="Planning">{{ t('projects.statusValues.planning') }}</option>
              <option value="Active">{{ t('projects.statusValues.active') }}</option>
              <option value="On Hold">{{ t('projects.statusValues.onhold') }}</option>
            </select>
          </div>
        </div>

        <div class="form-actions">
          <button
            type="button"
            class="mdc-button mdc-button--outlined"
            @click="handleCancel"
            :disabled="isLoading"
          >
            {{ t('actions.cancel') }}
          </button>
          <button
            type="submit"
            class="mdc-button mdc-button--raised"
            :disabled="isLoading || !isFormValid"
          >
            <span v-if="isLoading">{{ t('app.loading') }}</span>
            <span v-else>{{ t('projects.create') }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/projectStore'
import { useLocalization } from '@/composables/useLocalization'
import { useToast } from '@/composables/useToast'

export default {
  name: 'ProjectCreateView',
  setup() {
    const router = useRouter()
    const projectStore = useProjectStore()
    const { t } = useLocalization()
    const { showToast } = useToast()

    const isLoading = ref(false)
    
    const form = ref({
      projectName: '',
      projectNumber: '',
      summary: '',
      startDate: '',
      endDate: '',
      owner: '',
      priority: 'Medium',
      status: 'Planning'
    })

    const isFormValid = computed(() => {
      return form.value.projectName.trim() && 
             form.value.startDate && 
             form.value.endDate
    })

    const handleSubmit = async () => {
      if (!isFormValid.value) return

      isLoading.value = true
      
      try {
        const projectData = {
          ProjectName: form.value.projectName,
          ProjectNumber: form.value.projectNumber,
          Summary: form.value.summary,
          ProjectStartDate: form.value.startDate,
          ProjectEndDate: form.value.endDate,
          Owner: form.value.owner,
          Priority: form.value.priority,
          Status: form.value.status,
          CompletionPercent: 0
        }

        const newProject = await projectStore.createProject(projectData)
        
        showToast(t('projects.createSuccess'), 'success')
        router.push(`/projects/${newProject.RecId}`)
      } catch (error) {
        console.error('Failed to create project:', error)
        showToast(t('projects.createError'), 'error')
      } finally {
        isLoading.value = false
      }
    }

    const handleCancel = () => {
      router.push('/projects')
    }

    return {
      form,
      isLoading,
      isFormValid,
      handleSubmit,
      handleCancel,
      t
    }
  }
}
</script>

<style scoped>
.project-create-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.create-header {
  margin-bottom: 32px;
  text-align: center;
}

.create-header h1 {
  margin: 0 0 8px 0;
  color: rgba(0, 0, 0, 0.87);
}

.create-header p {
  margin: 0;
  color: rgba(0, 0, 0, 0.6);
}

.create-form-container {
  background: white;
  border-radius: 8px;
  padding: 32px;
  box-shadow: var(--mdc-elevation-01);
}

.project-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-section h2 {
  margin: 0 0 8px 0;
  color: rgba(0, 0, 0, 0.87);
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  padding-bottom: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
}

.form-input,
.form-select,
.form-textarea {
  padding: 12px 16px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  font-size: 16px;
  font-family: inherit;
  transition: border-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--mdc-theme-primary, #1976d2);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.mdc-button {
  padding: 8px 24px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  min-width: 120px;
}

.mdc-button--outlined {
  background: white;
  color: var(--mdc-theme-primary, #1976d2);
  border: 1px solid rgba(25, 118, 210, 0.12);
}

.mdc-button--outlined:hover {
  background: rgba(25, 118, 210, 0.04);
}

.mdc-button--raised {
  background: var(--mdc-theme-primary, #1976d2);
  color: white;
  box-shadow: var(--mdc-elevation-02);
}

.mdc-button--raised:hover {
  background: #1565c0;
  box-shadow: var(--mdc-elevation-04);
}

.mdc-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 768px) {
  .project-create-view {
    padding: 16px;
  }

  .create-form-container {
    padding: 24px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>