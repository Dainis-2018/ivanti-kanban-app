// services/odataService.js - OData Service Implementation
import { ApiService } from './apiService'

const ODATA_BASE_PATH = import.meta.env.VITE_ODATA_ENDPOINT || '/api/odata/businessObject'

// OData entity endpoints
export const ENDPOINTS = {
  PROJECTS: 'frs_projects',
  MILESTONES: 'frs_prj_phases',
  TASKS: 'task__assignments',
  TEAMS: 'standarduserteams',
  USERS: 'employees'
}

// OData query builder
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

  expand(navigation) {
    this.params.$expand = Array.isArray(navigation) ? navigation.join(',') : navigation
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

// OData service class
export class ODataService {
  static createQuery() {
    return new ODataQueryBuilder()
  }

  static buildUrl(entitySet, id = null) {
    let url = `${ODATA_BASE_PATH}/${entitySet}`
    if (id) {
      url += `('${id}')`
    }
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

  // Specific entity operations
  static async getProjects(filters = {}) {
    const query = this.createQuery()
      .select('ProjectNumber,ProjectName,Status,Owner,ProjectStartDate,ProjectEndDate,Summary')
      .expand('phases($select=PhaseNumber,PhaseTitle,Status,PlannedStartDate,PlannedEndDate)')
      .orderBy('ProjectName')

    if (filters.status) {
      query.filter(`Status eq '${filters.status}'`)
    }
    if (filters.owner) {
      query.filter(`Owner eq '${filters.owner}'`)
    }
    if (filters.search) {
      query.filter(`contains(tolower(ProjectName), tolower('${filters.search}'))`)
    }

    return await this.getAll(ENDPOINTS.PROJECTS, query)
  }

  static async getProjectById(projectId) {
    const query = this.createQuery()
      .expand('phases($expand=tasks)')
    
    return await this.getById(ENDPOINTS.PROJECTS, projectId, query)
  }

  static async getMilestonesByProject(projectId) {
    const query = this.createQuery()
      .select('PhaseId,PhaseName,Status,StartDate,EndDate,ProjectId')
      .filter(`ProjectId eq '${projectId}'`)
      .orderBy('StartDate')
    
    return await this.getAll(ENDPOINTS.MILESTONES, query)
  }

  static async getTasksByMilestone(milestoneId) {
    const query = this.createQuery()
      .select('TaskId,TaskName,Status,Priority,AssignedTo,Team,Description,StartDate,DueDate')
      .filter(`PhaseId eq '${milestoneId}'`)
      .orderBy('Priority desc')
    
    return await this.getAll(ENDPOINTS.TASKS, query)
  }

  static async getTasksByProject(projectId) {
    const query = this.createQuery()
      .select('TaskId,TaskName,Status,Priority,AssignedTo,Team,Description,PhaseId')
      .filter(`ProjectId eq '${projectId}'`)
      .expand('phase($select=PhaseName)')
      .orderBy('Priority desc')
    
    return await this.getAll(ENDPOINTS.TASKS, query)
  }

  static async getTeams() {
    const query = this.createQuery()
      .select('TeamId,TeamName,Description,Members')
      .orderBy('TeamName')
    
    return await this.getAll(ENDPOINTS.TEAMS, query)
  }

  static async getUsers() {
    const query = this.createQuery()
      .select('UserId,UserName,FullName,Email,Role')
      .filter(`Status eq 'Active'`)
      .orderBy('FullName')
    
    return await this.getAll(ENDPOINTS.USERS, query)
  }

  // Batch operations
  static async batchUpdate(entitySet, updates) {
    const promises = updates.map(({ id, data }) => 
      this.update(entitySet, id, data)
    )
    return await Promise.allSettled(promises)
  }

  // Search across multiple entities
  static async globalSearch(searchTerm) {
    const projectsQuery = this.createQuery()
      .select('ProjectId,ProjectName,Status')
      .filter(`contains(tolower(ProjectName), tolower('${searchTerm}'))`)
      .top(10)

    const tasksQuery = this.createQuery()
      .select('TaskId,TaskName,Status,ProjectId')
      .filter(`contains(tolower(TaskName), tolower('${searchTerm}'))`)
      .expand('project($select=ProjectName)')
      .top(20)

    const [projects, tasks] = await Promise.allSettled([
      this.getAll(ENDPOINTS.PROJECTS, projectsQuery),
      this.getAll(ENDPOINTS.TASKS, tasksQuery)
    ])

    return {
      projects: projects.status === 'fulfilled' ? projects.value : [],
      tasks: tasks.status === 'fulfilled' ? tasks.value : []
    }
  }
}

export default ODataService