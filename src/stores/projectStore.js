// stores/projectStore.js - Project Management Store
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ODataService } from '@/services/odataService'

export const useProjectStore = defineStore('projects', () => {
  // State
  const projects = ref([])
  const currentProject = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const lastUpdated = ref(null)

  // Getters
  const activeProjects = computed(() => {
    return projects.value.filter(p => p.Status === 'Active')
  })

  const completedProjects = computed(() => {
    return projects.value.filter(p => p.Status === 'Completed')
  })

  const projectById = computed(() => {
    return (id) => projects.value.find(p => p.ProjectId === id)
  })

  const projectsCount = computed(() => projects.value.length)

  // Actions
  const setLoading = (loading) => {
    isLoading.value = loading
  }

  const setError = (err) => {
    error.value = err
  }

  const setProjects = (projectList) => {
    projects.value = projectList
    lastUpdated.value = new Date()
  }

  const setCurrentProject = (project) => {
    currentProject.value = project
  }

  const addProject = (project) => {
    projects.value.push(project)
  }

  const updateProject = (updatedProject) => {
    const index = projects.value.findIndex(p => p.ProjectId === updatedProject.ProjectId)
    if (index !== -1) {
      projects.value[index] = { ...projects.value[index], ...updatedProject }
    }
  }

  const removeProject = (projectId) => {
    const index = projects.value.findIndex(p => p.ProjectId === projectId)
    if (index !== -1) {
      projects.value.splice(index, 1)
    }
  }

  const fetchProjects = async (filters = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await ODataService.getProjects(filters)
      setProjects(response.value || response)
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const fetchProjectById = async (projectId) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await ODataService.getProjectById(projectId)
      const project = response.value || response
      setCurrentProject(project)
      
      // Update in projects list if exists
      const existingIndex = projects.value.findIndex(p => p.ProjectId === projectId)
      if (existingIndex !== -1) {
        projects.value[existingIndex] = project
      } else {
        projects.value.push(project)
      }
      
      return project
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (projectData) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await ODataService.create('frs_projects', projectData)
      const newProject = response.value || response
      addProject(newProject)
      return newProject
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateProjectData = async (projectId, updateData) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await ODataService.update('frs_projects', projectId, updateData)
      const updatedProject = response.value || response
      updateProject(updatedProject)
      
      if (currentProject.value && currentProject.value.ProjectId === projectId) {
        setCurrentProject(updatedProject)
      }
      
      return updatedProject
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteProject = async (projectId) => {
    setLoading(true)
    setError(null)
    
    try {
      await ODataService.delete('frs_projects', projectId)
      removeProject(projectId)
      
      if (currentProject.value && currentProject.value.ProjectId === projectId) {
        setCurrentProject(null)
      }
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const refreshProjects = async () => {
    return await fetchProjects()
  }

  return {
    // State
    projects,
    currentProject,
    isLoading,
    error,
    lastUpdated,
    // Getters
    activeProjects,
    completedProjects,
    projectById,
    projectsCount,
    // Actions
    setLoading,
    setError,
    setProjects,
    setCurrentProject,
    addProject,
    updateProject,
    removeProject,
    fetchProjects,
    fetchProjectById,
    createProject,
    updateProjectData,
    deleteProject,
    refreshProjects
  }
})