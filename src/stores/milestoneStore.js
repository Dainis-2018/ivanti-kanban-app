// src/stores/milestoneStore.js - Missing Milestone Store
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMilestoneStore = defineStore('milestones', () => {
  // State
  const milestones = ref([])
  const currentMilestone = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const milestonesByProject = computed(() => {
    return (projectId) => milestones.value.filter(m => m.ProjectId === projectId)
  })

  const activeMilestones = computed(() => {
    return milestones.value.filter(m => m.Status === 'Active')
  })

  const completedMilestones = computed(() => {
    return milestones.value.filter(m => m.Status === 'Completed')
  })

  const milestoneById = computed(() => {
    return (id) => milestones.value.find(m => m.PhaseId === id)
  })

  // Actions
  const setLoading = (loading) => {
    isLoading.value = loading
  }

  const setError = (err) => {
    error.value = err
  }

  const setMilestones = (milestoneList) => {
    milestones.value = milestoneList
  }

  const setCurrentMilestone = (milestone) => {
    currentMilestone.value = milestone
  }

  const addMilestone = (milestone) => {
    milestones.value.push(milestone)
  }

  const updateMilestone = (updatedMilestone) => {
    const index = milestones.value.findIndex(m => m.PhaseId === updatedMilestone.PhaseId)
    if (index !== -1) {
      milestones.value[index] = { ...milestones.value[index], ...updatedMilestone }
    }
  }

  const removeMilestone = (milestoneId) => {
    const index = milestones.value.findIndex(m => m.PhaseId === milestoneId)
    if (index !== -1) {
      milestones.value.splice(index, 1)
    }
  }

  // API actions using fixed ODataService
  const fetchMilestonesByProject = async (projectId) => {
    setLoading(true)
    setError(null)
    
    try {
      // Use the fixed ODataService method that handles Ivanti relationships
      const response = await import('@/services/odataService').then(module => 
        module.ODataService.getMilestonesByProject(projectId)
      )
      
      const projectMilestones = response.value || response || []
      
      // Update milestones for this project in the store
      const otherMilestones = milestones.value.filter(m => 
        !projectMilestones.some(pm => pm.PhaseId === m.PhaseId)
      )
      setMilestones([...otherMilestones, ...projectMilestones])
      
      return projectMilestones
    } catch (err) {
      console.error('Failed to fetch milestones:', err)
      setError(err.message || 'Failed to fetch milestones')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const fetchMilestoneById = async (milestoneId) => {
    setLoading(true)
    setError(null)
    
    try {
      const { ODataService } = await import('@/services/odataService')
      const response = await ODataService.getById('frs_prj_phases', milestoneId)
      setCurrentMilestone(response)
      return response
    } catch (err) {
      console.error('Failed to fetch milestone:', err)
      setError(err.message || 'Failed to fetch milestone')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteMilestone = async (milestoneId) => {
    setLoading(true)
    setError(null)
    
    try {
      const { ODataService } = await import('@/services/odataService')
      await ODataService.delete('frs_prj_phases', milestoneId)
      removeMilestone(milestoneId)
      return true
    } catch (err) {
      console.error('Failed to delete milestone:', err)
      setError(err.message || 'Failed to delete milestone')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  return {
    // State
    milestones,
    currentMilestone,
    isLoading,
    error,
    // Getters
    milestonesByProject,
    activeMilestones,
    completedMilestones,
    milestoneById,
    // Actions
    setLoading,
    setError,
    setMilestones,
    setCurrentMilestone,
    addMilestone,
    updateMilestone,
    removeMilestone,
    fetchMilestonesByProject,
    fetchMilestoneById,
    deleteMilestone,
    clearError
  }
})