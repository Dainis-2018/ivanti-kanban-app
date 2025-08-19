// services/odataService.js - Fixed OData Service for Ivanti REST API
import { ApiService } from './apiService'

// In development, use /api prefix to trigger Vite proxy
// In production, use the endpoint directly
const ODATA_BASE_PATH = import.meta.env.DEV 
  ? '/api/odata/businessObject'
  : (import.meta.env.VITE_ODATA_ENDPOINT || '/HEAT/api/odata/businessObject')

// OData entity endpoints
export const ENDPOINTS = {
  PROJECTS: 'frs_projects',
  MILESTONES: 'frs_prj_phases', 
  TASKS: 'task__assignments',
  TEAMS: 'standarduserteams',
  USERS: 'employees'
}

// OData entity endpoints
export const CATEGORIES = {
  PROJECT: 'frs_project',
  MILESTONE: 'frs_prj_phase'
}

// Ivanti relationship field mappings
export const RELATIONSHIP_FIELDS = {
  // Projects to Milestones
  PROJECT_TO_MILESTONES: {
    linkField: 'ProjectLink_RecID',
    categoryField: 'ProjectLink_Category'
  },
  // Milestones to Tasks  
  MILESTONE_TO_TASKS: {
    linkField: 'ParentLink_RecID',
    categoryField: 'ParentLink_Category'
  },
  // Projects to Tasks (direct)
  PROJECT_TO_TASKS: {
    linkField: 'ProjectLink_RecID', 
    categoryField: 'ProjectLink_Category'
  }
}

// OData query builder (without $expand support)
export class ODataQueryBuilder {
  constructor() {
    this.params = {}
  }

  select(fields) {
    this.params.$select = Array.isArray(fields) ? fields.join(',') : fields
    return this
  }

  filter(condition) {
    this.params.$filter = condition
    return this
  }

  orderBy(field, direction = 'asc') {
    this.params.$orderby = `${field} ${direction}`
    return this
  }

  top(count) {
    this.params.$top = count
    return this
  }

  skip(count) {
    this.params.$skip = count
    return this
  }

  count(include = true) {
    this.params.$count = include
    return this
  }

  build() {
    return this.params
  }

  toString() {
    const params = new URLSearchParams()
    Object.entries(this.params).forEach(([key, value]) => {
      params.append(key, value)
    })
    return params.toString()
  }
}

// Enhanced OData service class for Ivanti
export class ODataService {
  static createQuery() {
    return new ODataQueryBuilder()
  }

  static buildUrl(entitySet, id = null) {
    // Ensure no double slashes in the URL
    const cleanBasePath = ODATA_BASE_PATH.replace(/\/+$/, '') // Remove trailing slashes
    const cleanEntitySet = entitySet.replace(/^\/+/, '') // Remove leading slashes
    
    let url = `${cleanBasePath}/${cleanEntitySet}`
    if (id) {
      url += `('${id}')`
    }
    
    console.log(`OData URL built: ${url}`)
    return url
  }

  // Generic CRUD operations
  static async getAll(entitySet, query = null) {
    const url = this.buildUrl(entitySet)
    const params = query instanceof ODataQueryBuilder ? query.build() : query || {}
    return await ApiService.get(url, params)
  }

  static async getById(entitySet, id, query = null) {
    const url = this.buildUrl(entitySet, id)
    const params = query instanceof ODataQueryBuilder ? query.build() : query || {}
    return await ApiService.get(url, params)
  }

  static async create(entitySet, data) {
    const url = this.buildUrl(entitySet)
    return await ApiService.post(url, data)
  }

  static async update(entitySet, id, data) {
    const url = this.buildUrl(entitySet, id)
    return await ApiService.patch(url, data)
  }

  static async delete(entitySet, id) {
    const url = this.buildUrl(entitySet, id)
    return await ApiService.delete(url)
  }

  // Helper method to get related records using Ivanti linking fields
  static async getRelatedRecords(parentEntitySet, parentId, childEntitySet, relationship) {
    try {
      // First get the parent record to get its RecId
      const parent = await this.getById(parentEntitySet, parentId)
      const parentRecId = parent.RecId
      
      if (!parentRecId) {
        throw new Error(`Parent record ${parentId} does not have a RecId field`)
      }

      // Then query child records using relationship fields
      const query = this.createQuery()
        .filter(`${relationship.linkField} eq '${parentRecId}' and ${relationship.categoryField} eq '${parentEntitySet}'`)
        .orderBy('RecId')

      return await this.getAll(childEntitySet, query)
    } catch (error) {
      console.error(`Failed to get related records from ${parentEntitySet} to ${childEntitySet}:`, error)
      throw error
    }
  }

  // Get projects with their related data using separate calls
  static async getProjects(filters = {}) {
    const query = this.createQuery()
      .select('RecId,ProjectNumber,ProjectName,Status,Priority,Owner,CompletionPercent,ProjectStartDate,ProjectEndDate,Summary')
      .orderBy('ProjectName')

    // Apply filters
    const filterConditions = []
    if (filters.status) {
      filterConditions.push(`Status eq '${filters.status}'`)
    }
    if (filters.owner) {
      filterConditions.push(`Owner eq '${filters.owner}'`)
    }
    if (filters.search) {
      filterConditions.push(`contains(tolower(ProjectName), tolower('${filters.search}'))`)
    }

    if (filterConditions.length > 0) {
      query.filter(filterConditions.join(' and '))
    }

    const projects = await this.getAll(ENDPOINTS.PROJECTS, query)
    
    // Optionally load milestones for each project if requested
    if (filters.includeMilestones) {
      const projectsWithMilestones = await Promise.allSettled(
        projects.value.map(async (project) => {
          try {
            const milestones = await this.getMilestonesByProjectRecId(project.RecId)
            return { ...project, milestones: milestones.value || [] }
          } catch (error) {
            console.warn(`Failed to load milestones for project ${project.RecId}:`, error)
            return { ...project, milestones: [] }
          }
        })
      )
      
      projects.value = projectsWithMilestones
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value)
    }

    return projects
  }

  static async getProjectById(projectId) {
    const project = await this.getById(ENDPOINTS.PROJECTS, projectId)
    
    // Load related milestones using RecId
    try {
      const milestones = await this.getMilestonesByProjectRecId(project.RecId)
      project.milestones = milestones.value || []
      
      // Load tasks for each milestone
      const milestonesWithTasks = await Promise.allSettled(
        project.milestones.map(async (milestone) => {
          try {
            const tasks = await this.getTasksByMilestoneRecId(milestone.RecId)
            return { ...milestone, tasks: tasks.value || [] }
          } catch (error) {
            console.warn(`Failed to load tasks for milestone ${milestone.RecId}:`, error)
            return { ...milestone, tasks: [] }
          }
        })
      )
      
      project.milestones = milestonesWithTasks
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value)
        
    } catch (error) {
      console.warn(`Failed to load milestones for project ${projectId}:`, error)
      project.milestones = []
    }
    
    return project
  }

  // Get milestones by project using RecId relationship
  static async getMilestonesByProjectRecId(projectRecId) {
    const query = this.createQuery()
      .select('RecId,PhaseNumber,PhaseTitle,Status,PlannedStartDate,PlannedEndDate,ProjectLink_RecID')
      .filter(`ProjectLink_RecID eq '${projectRecId}' and ProjectLink_Category eq '${CATEGORIES.PROJECT}'`)
      .orderBy('StartDate')
    
    return await this.getAll(ENDPOINTS.MILESTONES, query)
  }

  // Get milestones by project ID (alternative method)
  static async getMilestonesByProject(projectId) {
    // First get the project to obtain its RecId
    const project = await this.getById(ENDPOINTS.PROJECTS, projectId)
    return await this.getMilestonesByProjectRecId(project.RecId)
  }

  // Get tasks by milestone using RecId relationship
  static async getTasksByMilestoneRecId(milestoneRecId) {
    const query = this.createQuery()
      .select('RecId,AssignmentID,Subject,Status,Priority,Owner,OwnerTeam,Details,PlannedStartDate,PlannedEndDate,ParentLink_RecID')
      .filter(`ParentLink_RecID eq '${milestoneRecId}' and ParentLink_Category eq '${CATEGORIES.MILESTONE}'`)
      .orderBy('Priority desc, StartDate')
    
    return await this.getAll(ENDPOINTS.TASKS, query)
  }

  // Get tasks by milestone ID (alternative method)
  static async getTasksByMilestone(milestoneId) {
    // First get the milestone to obtain its RecId
    const milestone = await this.getById(ENDPOINTS.MILESTONES, milestoneId)
    return await this.getTasksByMilestoneRecId(milestone.RecId)
  }

  // Get tasks by project using RecId relationship
  static async getTasksByProjectRecId(projectRecId) {
    const query = this.createQuery()
      .select('RecId,AssignmentID,Subject,Status,Priority,Owner,OwnerTeam,Details,ProjectLink_RecID')
      .filter(`ProjectLink_RecID eq '${projectRecId}' and ProjectLink_Category eq '${CATEGORIES.PROJECT}'`)
      .orderBy('Priority desc, StartDate')
    
    return await this.getAll(ENDPOINTS.TASKS, query)
  }

  // Get tasks by project ID (alternative method)
  static async getTasksByProject(projectId) {
    // First get the project to obtain its RecId
    const project = await this.getById(ENDPOINTS.PROJECTS, projectId)
    return await this.getTasksByProjectRecId(project.RecId)
  }

  // Get teams
  static async getTeams() {
    const query = this.createQuery()
      .select('RecId,TeamId,TeamName,Description,Members')
      .orderBy('TeamName')
    
    return await this.getAll(ENDPOINTS.TEAMS, query)
  }

  // Get users/employees
  static async getUsers() {
    const query = this.createQuery()
      .select('RecId,UserId,UserName,FullName,Email,Role')
      .filter(`Status eq 'Active'`)
      .orderBy('FullName')
    
    return await this.getAll(ENDPOINTS.USERS, query)
  }

  // Enhanced method to get project with full hierarchy
  static async getProjectWithHierarchy(projectId) {
    const project = await this.getById(ENDPOINTS.PROJECTS, projectId)
    
    // Get milestones using relationship
    const milestones = await this.getMilestonesByProjectRecId(project.RecId)
    
    // Get tasks for each milestone
    const milestonesWithTasks = await Promise.allSettled(
      milestones.value.map(async (milestone) => {
        const tasks = await this.getTasksByMilestoneRecId(milestone.RecId)
        return { ...milestone, tasks: tasks.value || [] }
      })
    )
    
    project.milestones = milestonesWithTasks
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value)
    
    return project
  }

  // Batch operations using Promise.allSettled for better error handling
  static async batchUpdate(entitySet, updates) {
    const promises = updates.map(({ id, data }) => 
      this.update(entitySet, id, data)
    )
    const results = await Promise.allSettled(promises)
    
    return {
      successful: results.filter(r => r.status === 'fulfilled').map(r => r.value),
      failed: results.filter(r => r.status === 'rejected').map(r => r.reason),
      totalProcessed: results.length
    }
  }

  // Search across multiple entities using separate queries
  static async globalSearch(searchTerm) {
    const searchPromises = [
      // Search projects
      this.getAll(ENDPOINTS.PROJECTS, 
        this.createQuery()
          .select('RecId,ProjectId,ProjectName,Status')
          .filter(`contains(tolower(ProjectName), tolower('${searchTerm}'))`)
          .top(10)
      ),
      // Search tasks
      this.getAll(ENDPOINTS.TASKS,
        this.createQuery()
          .select('RecId,TaskId,TaskName,Status,ProjectLink_RecID')
          .filter(`contains(tolower(TaskName), tolower('${searchTerm}'))`)
          .top(20)
      )
    ]

    const results = await Promise.allSettled(searchPromises)
    
    return {
      projects: results[0].status === 'fulfilled' ? results[0].value : { value: [] },
      tasks: results[1].status === 'fulfilled' ? results[1].value : { value: [] }
    }
  }

  // Utility method to build complex filters
  static buildComplexFilter(conditions) {
    if (!conditions || conditions.length === 0) return ''
    
    return conditions
      .filter(condition => condition && condition.trim())
      .join(' and ')
  }

  // Method to get entity by RecId (useful for relationship queries)
  static async getByRecId(entitySet, recId) {
    const query = this.createQuery()
      .filter(`RecId eq '${recId}'`)
      .top(1)
    
    const result = await this.getAll(entitySet, query)
    return result.value && result.value.length > 0 ? result.value[0] : null
  }
}

export default ODataService