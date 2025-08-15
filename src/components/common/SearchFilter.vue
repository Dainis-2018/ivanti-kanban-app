<!-- components/common/SearchFilter.vue - Advanced Filtering Component -->
<template>
  <div class="search-filter">
    <div class="filter-row">
      <!-- Status Filter -->
      <div class="filter-group">
        <label class="filter-label">{{ t('filters.status') }}</label>
        <ejs-multiselect
          :dataSource="statusOptions"
          :fields="{ text: 'text', value: 'value' }"
          :placeholder="t('filters.selectStatus')"
          :value="filters.status"
          @change="handleStatusChange"
          cssClass="filter-control"
        />
      </div>

      <!-- Priority Filter -->
      <div class="filter-group">
        <label class="filter-label">{{ t('filters.priority') }}</label>
        <ejs-multiselect
          :dataSource="priorityOptions"
          :fields="{ text: 'text', value: 'value' }"
          :placeholder="t('filters.selectPriority')"
          :value="filters.priority"
          @change="handlePriorityChange"
          cssClass="filter-control"
        />
      </div>

      <!-- Assignee Filter -->
      <div class="filter-group">
        <label class="filter-label">{{ t('filters.assignee') }}</label>
        <ejs-dropdownlist
          :dataSource="assigneeOptions"
          :fields="{ text: 'text', value: 'value' }"
          :placeholder="t('filters.selectAssignee')"
          :value="filters.assignee"
          @change="handleAssigneeChange"
          cssClass="filter-control"
          :allowFiltering="true"
        />
      </div>

      <!-- Date Range Filter -->
      <div class="filter-group">
        <label class="filter-label">{{ t('filters.dateRange') }}</label>
        <ejs-daterangepicker
          :placeholder="t('filters.selectDateRange')"
          :value="filters.dateRange"
          @change="handleDateRangeChange"
          cssClass="filter-control"
        />
      </div>
    </div>

    <div class="filter-actions">
      <ejs-button
        :content="t('filters.apply')"
        cssClass="apply-button"
        @click="applyFilters"
      />
      <ejs-button
        :content="t('filters.clear')"
        cssClass="clear-button"
        @click="clearFilters"
      />
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch } from 'vue'
import { useLocalization } from '@/composables/useLocalization'
import { useTaskStore } from '@/stores/taskStore'
import { ODataService } from '@/services/odataService'

export default {
  name: 'SearchFilter',
  emits: ['filter-change', 'clear-filters'],
  setup(props, { emit }) {
    const { t } = useLocalization()
    const taskStore = useTaskStore()

    const filters = reactive({
      status: [],
      priority: [],
      assignee: null,
      dateRange: null
    })

    const statusOptions = ref([
      { text: 'Open', value: 'Open' },
      { text: 'In Progress', value: 'InProgress' },
      { text: 'Testing', value: 'Testing' },
      { text: 'Done', value: 'Done' },
      { text: 'Cancelled', value: 'Cancelled' }
    ])

    const priorityOptions = ref([
      { text: 'Critical', value: 'Critical' },
      { text: 'High', value: 'High' },
      { text: 'Medium', value: 'Medium' },
      { text: 'Low', value: 'Low' }
    ])

    const assigneeOptions = ref([])

    const loadAssignees = async () => {
      try {
        const users = await ODataService.getUsers()
        assigneeOptions.value = users.map(user => ({
          text: user.FullName || user.UserName,
          value: user.UserId
        }))
      } catch (error) {
        console.error('Failed to load assignees:', error)
      }
    }

    const handleStatusChange = (args) => {
      filters.status = args.value || []
    }

    const handlePriorityChange = (args) => {
      filters.priority = args.value || []
    }

    const handleAssigneeChange = (args) => {
      filters.assignee = args.value
    }

    const handleDateRangeChange = (args) => {
      filters.dateRange = args.value
    }

    const applyFilters = () => {
      const activeFilters = {}
      
      if (filters.status.length > 0) {
        activeFilters.status = filters.status
      }
      if (filters.priority.length > 0) {
        activeFilters.priority = filters.priority
      }
      if (filters.assignee) {
        activeFilters.assignee = filters.assignee
      }
      if (filters.dateRange) {
        activeFilters.dateRange = filters.dateRange
      }

      emit('filter-change', activeFilters)
    }

    const clearFilters = () => {
      filters.status = []
      filters.priority = []
      filters.assignee = null
      filters.dateRange = null
      emit('clear-filters')
    }

    // Watch for filter changes and auto-apply
    watch(filters, () => {
      applyFilters()
    }, { deep: true })

    onMounted(() => {
      loadAssignees()
    })

    return {
      filters,
      statusOptions,
      priorityOptions,
      assigneeOptions,
      t,
      handleStatusChange,
      handlePriorityChange,
      handleAssigneeChange,
      handleDateRangeChange,
      applyFilters,
      clearFilters
    }
  }
}
</script>

<style scoped>
.search-filter {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.filter-control {
  width: 100%;
}

.filter-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.apply-button {
  background-color: #0078d4;
  color: white;
}

.clear-button {
  background-color: #f3f2f1;
  color: #333;
}

@media (max-width: 768px) {
  .filter-row {
    grid-template-columns: 1fr;
  }
  
  .filter-actions {
    justify-content: stretch;
  }
  
  .filter-actions .e-btn {
    flex: 1;
  }
}
</style>