<template>
  <div class="project-edit-view">
    <!-- Loading State -->
    <div v-if="isLoading && !project" class="loading-state">
      <div class="loading-spinner"></div>
      <p>{{ t('app.loading') }}</p>
    </div>

    <!-- Edit Form -->
    <div v-else-if="project" class="edit-container">
      <div class="edit-header">
        <div class="header-left">
          <button class="back-button" @click="goBack">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
            </svg>
            {{ t('actions.back') }}
          </button>
          <div class="header-info">
            <h1>{{ t('projects.edit') }}</h1>
            <p class="project-name">{{ project.ProjectName }}</p>
          </div>
        </div>
        <div class="header-actions">
          <button
            type="button"
            class="mdc-button mdc-button--outlined"
            @click="resetForm"
            :disabled="isSubmitting"
          >
            {{ t('actions.reset') }}
          </button>
          <button
            type="button"
            class="mdc-button mdc-button--raised"
            @click="handleSubmit"
            :disabled="isSubmitting || !hasChanges"
          >
            <span v-if="isSubmitting">{{ t('actions.saving') }}</span>
            <span v-else>{{ t('actions.save') }}</span>
          </button>
        </div>
      </div>

      <div class="edit-form-container">
        <form @submit.prevent="handleSubmit" class="project-form">
          <div class="form-section">
            <h2 class="section-title">{{ t('projects.basicInfo') }}</h2>
            
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
            <h2 class="section-title">{{ t('projects.timeline') }}</h2>
            
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
            <h2 class="section-title">{{ t('projects.management') }}</h2>
            
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

            <div class="form-row">
              <div class="form-field">
                <label class="form-label">{{ t('projects.status') }}</label>
                <select v-model="form.status" class="form-select">
                  <option value="">{{ t('filters.selectStatus') }}</option>
                  <option value="Planning">{{ t('projects.statusValues.planning') }}</option>
                  <option value="Active">{{ t('projects.statusValues.active') }}</option>
                  <option value="On Hold">{{ t('projects.statusValues.onhold') }}</option>
                  <option value="Completed">{{ t('projects.statusValues.completed') }}</option>
                  <option value="Cancelled">{{ t('projects.statusValues.cancelled') }}</option>
                </select>
              </div>

              <div class="form-field">
                <label class="form-label">{{ t('projects.progress') }} (%)</label>
                <div class="progress-input-container">
                  <input
                    v-model.number="form.completionPercent"
                    type="range"
                    class="progress-slider"
                    min="0"
                    max="100"
                    step="5"
                  >
                  <input
                    v-model.number="form.completionPercent"
                    type="number"
                    class="progress-number"
                    min="0"
                    max="100"
                  >
                </div>
                <div class="progress-preview">
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      :style="{ width: `${form.completionPercent || 0}%` }"
                    ></div>
                  </div>
                  <span class="progress-text">{{ form.completionPercent || 0 }}%</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="error-state">
      <h2>{{ t('projects.notFound') }}</h2>
      <p>{{ t('projects.notFoundDescription') }}</p>
      <button class="mdc-button mdc-button--raised" @click="goBack">
        {{ t('actions.back') }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProjectStore } from '@/stores/projectStore'
import { useLocalization } from '@/composables/useLocalization'
import { useToast } from '@/composables/useToast'

export default {
  name: 'ProjectEditView',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const projectStore = useProjectStore()
    const { t } = useLocalization()
    const { showToast } = useToast()

    const isLoading = ref(false)
    const isSubmitting = ref(false)
    const project = ref(null)
    const originalData = ref({})
    
    const form = ref({
      projectName: '',
      projectNumber: '',
      summary: '',
      startDate: '',
      endDate: '',
      owner: '',
      priority: '',
      status: '',
      completionPercent: 0
    })

    const hasChanges = computed(() => {
      return Object.keys(form.value).some(key => {
        return form.value[key] !== originalData.value[key]
      })
    })

    const formatDateForInput = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toISOString().split('T')[0]
    }

    const populateForm = (projectData) => {
      originalData.value = {
        projectName: projectData.ProjectName || '',
        projectNumber: projectData.ProjectNumber || '',
        summary: projectData.Summary || '',
        startDate: formatDateForInput(projectData.ProjectStartDate),
        endDate: formatDateForInput(projectData.ProjectEndDate),
        owner: projectData.Owner || '',
        priority: projectData.Priority || '',
        status: projectData.Status || '',
        completionPercent: projectData.CompletionPercent || 0
      }
      
      form.value = { ...originalData.value }
    }

    const fetchProject = async () => {
      const projectId = route.params.id
      if (!projectId) return

      isLoading.value = true
      
      try {
        const projectData = await projectStore.fetchProjectById(projectId)
        project.value = projectData
        populateForm(projectData)
      } catch (error) {
        console.error('Failed to fetch project:', error)
        showToast(t('projects.loadError'), 'error')
      } finally {
        isLoading.value = false
      }
    }

    const resetForm = () => {
      form.value = { ...originalData.value }
    }

    const handleSubmit = async () => {
      if (!hasChanges.value) return

      isSubmitting.value = true
      
      try {
        const updateData = {
          ProjectName: form.value.projectName,
          ProjectNumber: form.value.projectNumber,
          Summary: form.value.summary,
          ProjectStartDate: form.value.startDate,
          ProjectEndDate: form.value.endDate,
          Owner: form.value.owner,
          Priority: form.value.priority,
          Status: form.value.status,
          CompletionPercent: form.value.completionPercent
        }

        await projectStore.updateProject(project.value.RecId, updateData)
        
        showToast(t('projects.updateSuccess'), 'success')
        router.push(`/projects/${project.value.RecId}`)
      } catch (error) {
        console.error('Failed to update project:', error)
        showToast(t('projects.updateError'), 'error')
      } finally {
        isSubmitting.value = false
      }
    }

    const goBack = () => {
      if (hasChanges.value) {
        if (confirm(t('messages.unsavedChanges'))) {
          router.push(`/projects/${project.value?.RecId || ''}`)
        }
      } else {
        router.push(`/projects/${project.value?.RecId || ''}`)
      }
    }

    // Warn about unsaved changes when leaving
    const beforeUnload = (e) => {
      if (hasChanges.value) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    onMounted(() => {
      fetchProject()
      window.addEventListener('beforeunload', beforeUnload)
    })

    return {
      isLoading,
      isSubmitting,
      project,
      form,
      hasChanges,
      fetchProject,
      resetForm,
      handleSubmit,
      goBack,
      t
    }
  }
}
</script>

<style scoped>
.project-edit-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top: 3px solid var(--mdc-theme-primary, #1976d2);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 24px;
}

.header-left {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: none;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.6);
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.back-button:hover {
  background: rgba(0, 0, 0, 0.04);
  color: rgba(0, 0, 0, 0.87);
}

.header-info h1 {
  margin: 0 0 4px 0;
  font-size: 2rem;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.87);
}

.project-name {
  margin: 0;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
}

.header-actions {
  display: flex;
  gap: 12px;
}

.edit-form-container {
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

.section-title {
  margin: 0 0 8px 0;
  color: rgba(0, 0, 0, 0.87);
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  padding-bottom: 8px;
  font-size: 1.25rem;
  font-weight: 500;
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

.progress-input-container {
  display: flex;
  gap: 12px;
  align-items: center;
}

.progress-slider {
  flex: 1;
}

.progress-number {
  width: 80px;
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  text-align: center;
}

.progress-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--mdc-theme-primary, #1976d2);
  transition: width 300ms ease;
}

.progress-text {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  min-width: 32px;
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
  min-width: 100px;
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
  .project-edit-view {
    padding: 16px;
  }

  .edit-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .header-left {
    flex-direction: column;
    gap: 12px;
  }

  .header-actions {
    justify-content: stretch;
  }

  .edit-form-container {
    padding: 24px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .progress-input-container {
    flex-direction: column;
    align-items: stretch;
  }

  .progress-number {
    width: 100%;
  }
}
</style>