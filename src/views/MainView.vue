<!-- views/MainView.vue - Main Application View -->
<template>
  <div class="main-view">
    <router-view 
      :search-query="searchQuery"
      :active-filters="activeFilters"
      :current-view="currentView"
    />
  </div>
</template>

<script>
import { computed } from 'vue'
import { useAppStore } from '@/stores/appStore'

export default {
  name: 'MainView',
  props: {
    searchQuery: String,
    activeFilters: Object,
    currentView: String
  },
  setup(props) {
    const appStore = useAppStore()

    return {
      searchQuery: computed(() => props.searchQuery),
      activeFilters: computed(() => props.activeFilters),
      currentView: computed(() => props.currentView)
    }
  }
}
</script>

<style scoped>
.main-view {
  height: 100%;
  overflow: hidden;
}
</style>