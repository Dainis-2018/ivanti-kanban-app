import { defineStore } from 'pinia'
import { ODataService, ENDPOINTS } from '@/services/odataService'
import { useToast } from '@/composables/useToast'

export const useProjectStore = defineStore('projects', {
  state: () => ({
    projects: [],
    currentProject: null,
    isLoading: false,
    error: null,
    lastFetch: null,
    pagination: {
      page: 1,
      limit: 50,
      total: 0,
      hasMore: true
    },
    filters: {
      status: '',
      owner: '',
      priority: '',
      dateRange: null
    },
    sortBy: 'ProjectName',
    sortOrder: 'asc'
  }),

  getters: {
    // Basic getters
    getProjectById: (state) => (id) => {
      return state.projects.find(project => project.RecId === id)
    },

    getProjectsByStatus: (state) => (status) => {
      return state.projects.filter(project => project.Status === status)
    },

    getProjectsByOwner: (state) => (owner) => {
      return state.projects.filter(project => project.Owner === owner)
    },

    // Statistics getters
    projectCount: (state) => state.projects.length,

    projectsByStatus: (state) => {
      const statusCount = {}
      state.projects.forEach(project => {
        const status = project.Status || 'Unknown'
        statusCount[status] = (statusCount[status] || 0) + 1
      })
      return statusCount
    },

    averageProgress: (state) => {
      if (state.projects.length === 0) return 0
      const totalProgress = state.projects.reduce((sum, project) => {
        return sum + (project.CompletionPercent || 0)
      }, 0)
      return Math.round(totalProgress / state.projects.length)
    },

    upcomingDeadlines: (state) => {
      const today = new Date()
      const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      
      return state.projects.filter(project => {
        if (!project.ProjectEndDate) return false
        const endDate = new Date(project.ProjectEndDate)
        return endDate >= today && endDate <= oneWeekFromNow
      }).sort((a, b) => new Date(a.ProjectEndDate) - new Date(b.ProjectEndDate))
    },

    // Gantt-specific getters
    projectsWithMilestones: (state) => {
      return state.projects.filter(project => 
        project.milestones && project.milestones.length > 0
      )
    },

    ganttDataProjects: (state) => {
      return state.projects.map(project => {
        const startDate = project.ProjectStartDate ? new Date(project.ProjectStartDate) : new Date()
        const endDate = project.ProjectEndDate ? new Date(project.ProjectEndDate) : new Date()
        
        return {
          TaskID: project.RecId,
          TaskName: project.ProjectName || 'Unnamed Project',
          TaskType: 'Project',
          StartDate: startDate,
          EndDate: endDate,
          Duration: Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))),
          Progress: project.CompletionPercent || 0,
          Priority: project.Priority || 'Medium',
          Owner: project.Owner || 'Unassigned',
          Status: project.Status || 'Planning',
          subtasks: transformMilestonesToGantt(project.milestones || [])
        }
      })
    },

    ganttDataFull: (state) => {
      return state.projects.map(project => {
        const startDate = project.ProjectStartDate ? new Date(project.ProjectStartDate) : new Date()
        const endDate = project.ProjectEndDate ? new Date(project.ProjectEndDate) : new Date()
        
        return {
          TaskID: project.RecId,
          TaskName: project.ProjectName || 'Unnamed Project',
          TaskType: 'Project',
          StartDate: startDate,
          EndDate: endDate,
          Duration: Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))),
          Progress: project.CompletionPercent || 0,
          Priority: project.Priority || 'Medium',
          Owner: project.Owner || 'Unassigned',
          Status: project.Status || 'Planning',
          subtasks: transformMilestonesWithTasksToGantt(project.milestones || [])
        }
      })
    },

    // Date range getters for Gantt timeline
    projectDateRange: (state) => {
      if (state.projects.length === 0) {
        const today = new Date()
        return {
          start: today,
          end: new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
        }
      }

      const dates = state.projects
        .flatMap(p => [p.ProjectStartDate, p.ProjectEndDate])
        .filter(date => date)
        .map(date => new Date(date))

      return {
        start: new Date(Math.min(...dates)),
        end: new Date(Math.max(...dates))
      }
    }
  },

  actions: {
    // Data fetching actions
    async fetchProjects(options = {}) {
      this.isLoading = true
      this.error = null

      try {
        const queryParams = this.buildQueryParams(options)
        const response = await ODataService.getProjects(queryParams)
        
        if (response && response.value) {
          this.projects = response.value
          this.updatePagination(response)
          this.lastFetch = new Date()
          
          // Fetch related milestones for each project
          await this.fetchProjectMilestones()
        }

        return response
      } catch (error) {
        this.error = error.message || 'Failed to fetch projects'
        console.error('Failed to fetch projects:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchProjectById(id) {
      this.isLoading = true
      this.error = null

      try {
        const response = await ODataService.getProjectWithHierarchy(id)

        if (response) {
          this.currentProject = response
          
          // Update the project in the projects array
          const index = this.projects.findIndex(p => p.RecId === id)
          if (index !== -1) {
            this.projects[index] = response
          }
        }

        return response
      } catch (error) {
        this.error = error.message || 'Failed to fetch project'
        console.error('Failed to fetch project:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchProjectMilestones() {
      try {
        const projectIds = this.projects.map(p => p.RecId)
        
        if (projectIds.length === 0) return

        // Fetch milestones for all projects
        const milestonePromises = this.projects.map(async (project) => {
          try {
            const milestonesResponse = await ODataService.getMilestonesByProjectRecId(project.RecId)
            return {
              projectRecId: project.RecId,
              milestones: milestonesResponse.value || []
            }
          } catch (error) {
            console.warn(`Failed to fetch milestones for project ${project.RecId}:`, error)
            return {
              projectRecId: project.RecId,
              milestones: []
            }
          }
        })

        const milestoneResults = await Promise.allSettled(milestonePromises)
        
        // Update projects with their milestones
        milestoneResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            const { projectRecId, milestones } = result.value
            const project = this.projects.find(p => p.RecId === projectRecId)
            if (project) {
              project.milestones = milestones
            }
          }
        })
      } catch (error) {
        console.error('Failed to fetch project milestones:', error)
      }
    },

    // CRUD actions
    async createProject(projectData) {
      this.isLoading = true
      this.error = null

      try {
        const response = await ODataService.create(ENDPOINTS.PROJECTS, projectData)

        if (response) {
          this.projects.unshift(response)
          const { showToast } = useToast()
          showToast('Project created successfully', 'success')
        }

        return response
      } catch (error) {
        this.error = error.message || 'Failed to create project'
        console.error('Failed to create project:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updateProject(id, projectData) {
      this.isLoading = true
      this.error = null

      try {
        const response = await ODataService.update(ENDPOINTS.PROJECTS, id, projectData)

        if (response) {
          const index = this.projects.findIndex(p => p.RecId === id)
          if (index !== -1) {
            this.projects[index] = { ...this.projects[index], ...response }
          }
          
          if (this.currentProject && this.currentProject.RecId === id) {
            this.currentProject = { ...this.currentProject, ...response }
          }

          const { showToast } = useToast()
          showToast('Project updated successfully', 'success')
        }

        return response
      } catch (error) {
        this.error = error.message || 'Failed to update project'
        console.error('Failed to update project:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async deleteProject(id) {
      this.isLoading = true
      this.error = null

      try {
        await ODataService.delete(ENDPOINTS.PROJECTS, id)

        this.projects = this.projects.filter(p => p.RecId !== id)
        
        if (this.currentProject && this.currentProject.RecId === id) {
          this.currentProject = null
        }

        const { showToast } = useToast()
        showToast('Project deleted successfully', 'success')
      } catch (error) {
        this.error = error.message || 'Failed to delete project'
        console.error('Failed to delete project:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Gantt-specific actions
    async updateProjectTimeline(projectId, startDate, endDate) {
      try {
        const updateData = {
          ProjectStartDate: startDate.toISOString(),
          ProjectEndDate: endDate.toISOString()
        }
        
        await this.updateProject(projectId, updateData)
        
        const { showToast } = useToast()
        showToast('Project timeline updated', 'success')
      } catch (error) {
        console.error('Failed to update project timeline:', error)
        throw error
      }
    },

    async updateProjectProgress(projectId, progress) {
      try {
        await this.updateProject(projectId, { CompletionPercent: progress })
        
        const { showToast } = useToast()
        showToast('Project progress updated', 'success')
      } catch (error) {
        console.error('Failed to update project progress:', error)
        throw error
      }
    },

    // Utility actions
    setCurrentProject(project) {
      this.currentProject = project
    },

    clearCurrentProject() {
      this.currentProject = null
    },

    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
    },

    clearFilters() {
      this.filters = {
        status: '',
        owner: '',
        priority: '',
        dateRange: null
      }
    },

    setSorting(sortBy, sortOrder = 'asc') {
      this.sortBy = sortBy
      this.sortOrder = sortOrder
    },

    // Helper methods
    buildQueryParams(options = {}) {
      const params = {
        limit: options.limit || this.pagination.limit,
        page: options.page || this.pagination.page
      }

      // Add filters
      if (this.filters.status) {
        params.status = this.filters.status
      }
      
      if (this.filters.owner) {
        params.owner = this.filters.owner
      }
      
      if (this.filters.priority) {
        params.priority = this.filters.priority
      }
      
      if (this.filters.dateRange) {
        params.dateRange = this.filters.dateRange
      }

      // Add search
      if (options.search) {
        params.search = options.search
      }

      return params
    },

    updatePagination(responseData) {
      if (responseData['@odata.count'] !== undefined) {
        this.pagination.total = responseData['@odata.count']
      }
      
      this.pagination.hasMore = responseData.value && 
        responseData.value.length === this.pagination.limit
    },

    // Cache management
    shouldRefresh() {
      if (!this.lastFetch) return true
      
      const cacheTimeout = 5 * 60 * 1000 // 5 minutes
      return Date.now() - this.lastFetch.getTime() > cacheTimeout
    },

    invalidateCache() {
      this.lastFetch = null
    }
  }
})

// Helper functions for Gantt data transformation
function transformMilestonesToGantt(milestones) {
  return milestones.map((milestone, index) => {
    const startDate = milestone.StartDate ? new Date(milestone.StartDate) : new Date()
    const endDate = milestone.DueDate ? new Date(milestone.DueDate) : new Date()
    
    return {
      TaskID: milestone.RecId || `milestone_${index}`,
      TaskName: milestone.PhaseName || 'Unnamed Milestone',
      TaskType: 'Milestone',
      StartDate: startDate,
      EndDate: endDate,
      Duration: Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))),
      Progress: milestone.CompletionPercent || 0,
      Priority: milestone.Priority || 'Medium',
      Owner: milestone.Owner || 'Unassigned',
      Status: milestone.Status || 'Planning'
    }
  })
}

function transformMilestonesWithTasksToGantt(milestones) {
  return milestones.map((milestone, milestoneIndex) => {
    const startDate = milestone.StartDate ? new Date(milestone.StartDate) : new Date()
    const endDate = milestone.DueDate ? new Date(milestone.DueDate) : new Date()
    
    const milestoneTask = {
      TaskID: milestone.RecId || `milestone_${milestoneIndex}`,
      TaskName: milestone.PhaseName || 'Unnamed Milestone',
      TaskType: 'Milestone',
      StartDate: startDate,
      EndDate: endDate,
      Duration: Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))),
      Progress: milestone.CompletionPercent || 0,
      Priority: milestone.Priority || 'Medium',
      Owner: milestone.Owner || 'Unassigned',
      Status: milestone.Status || 'Planning'
    }

    // Add tasks as subtasks
    if (milestone.tasks && milestone.tasks.length > 0) {
      milestoneTask.subtasks = milestone.tasks.map((task, taskIndex) => {
        const taskStartDate = task.StartDate ? new Date(task.StartDate) : new Date()
        const taskEndDate = task.DueDate ? new Date(task.DueDate) : new Date()
        
        return {
          TaskID: task.RecId || `task_${milestone.RecId}_${taskIndex}`,
          TaskName: task.Subject || 'Unnamed Task',
          TaskType: 'Task',
          StartDate: taskStartDate,
          EndDate: taskEndDate,
          Duration: Math.max(1, Math.ceil((taskEndDate - taskStartDate) / (1000 * 60 * 60 * 24))),
          Progress: task.CompletionPercent || 0,
          Priority: task.Priority || 'Medium',
          Owner: task.AssignedTo || 'Unassigned',
          Status: task.Status || 'Open'
        }
      })
    }

    return milestoneTask
  })
}