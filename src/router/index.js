// router/index.js - Vue Router Configuration
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'main',
      component: () => import('@/views/MainView.vue'),
      redirect: '/projects',
      children: [
        {
          path: 'projects',
          name: 'projects',
          component: () => import('@/views/ProjectsView.vue'),
          meta: { 
            title: 'Projects',
            requiresAuth: false 
          }
        },
        {
          path: 'projects/:projectId',
          name: 'project-details',
          component: () => import('@/views/ProjectsView.vue'),
          props: true,
          meta: { 
            title: 'Project Details',
            requiresAuth: false 
          }
        },
        {
          path: 'projects/:projectId/milestones/:milestoneId',
          name: 'milestone-tasks',
          component: () => import('@/views/ProjectsView.vue'),
          props: true,
          meta: { 
            title: 'Milestone Tasks',
            requiresAuth: false 
          }
        }
      ]
    },
    {
      path: '/404',
      name: 'not-found',
      component: () => import('@/views/NotFound.vue'),
      meta: { 
        title: 'Page Not Found' 
      }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404'
    }
  ]
})

// Navigation guards
router.beforeEach((to, from, next) => {
  // Set document title
  if (to.meta.title) {
    document.title = `${to.meta.title} - Ivanti Kanban`
  } else {
    document.title = 'Ivanti Kanban'
  }

  // Handle authentication if needed
  if (to.meta.requiresAuth) {
    // Add authentication logic here when needed
    // For now, allow all routes
    next()
  } else {
    next()
  }
})

router.afterEach((to, from) => {
  // Analytics or logging can be added here
  console.log(`Navigated from ${from.path} to ${to.path}`)
})

export default router