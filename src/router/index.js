import { createRouter, createWebHistory } from 'vue-router'
import MainView from '@/views/MainView.vue'
import ProjectsView from '@/views/ProjectsView.vue'
import NotFound from '@/views/NotFound.vue'

const routes = [
  {
    path: '/',
    redirect: '/projects'
  },
  {
    path: '/projects',
    component: MainView,
    children: [
      {
        path: '',
        component: ProjectsView,
        name: 'Projects',
        meta: {
          title: 'Projects',
          breadcrumb: [
            { name: 'Home', path: '/' },
            { name: 'Projects', path: '/projects' }
          ]
        }
      },
      {
        path: ':id',
        component: () => import('@/views/projects/ProjectDetailView.vue'),
        name: 'ProjectDetail',
        meta: {
          title: 'Project Details',
          breadcrumb: [
            { name: 'Home', path: '/' },
            { name: 'Projects', path: '/projects' },
            { name: 'Details', path: '' }
          ]
        }
      },
      {
        path: ':id/edit',
        component: () => import('@/views/projects/ProjectEditView.vue'),
        name: 'ProjectEdit',
        meta: {
          title: 'Edit Project',
          requiresAuth: true,
          breadcrumb: [
            { name: 'Home', path: '/' },
            { name: 'Projects', path: '/projects' },
            { name: 'Edit', path: '' }
          ]
        }
      },
      {
        path: 'new',
        component: () => import('@/views/projects/ProjectCreateView.vue'),
        name: 'ProjectCreate',
        meta: {
          title: 'Create Project',
          requiresAuth: true,
          breadcrumb: [
            { name: 'Home', path: '/' },
            { name: 'Projects', path: '/projects' },
            { name: 'Create', path: '' }
          ]
        }
      }
    ]
  },
  {
    path: '/milestones',
    component: MainView,
    children: [
      {
        path: '',
        component: () => import('@/views/MilestonesView.vue'),
        name: 'Milestones',
        meta: {
          title: 'Milestones',
          breadcrumb: [
            { name: 'Home', path: '/' },
            { name: 'Milestones', path: '/milestones' }
          ]
        }
      },
      {
        path: ':id',
        component: () => import('@/views/milestones/MilestoneDetailView.vue'),
        name: 'MilestoneDetail',
        meta: {
          title: 'Milestone Details',
          breadcrumb: [
            { name: 'Home', path: '/' },
            { name: 'Milestones', path: '/milestones' },
            { name: 'Details', path: '' }
          ]
        }
      }
    ]
  },
  {
    path: '/tasks',
    component: MainView,
    children: [
      {
        path: '',
        component: () => import('@/views/TasksView.vue'),
        name: 'Tasks',
        meta: {
          title: 'Tasks',
          breadcrumb: [
            { name: 'Home', path: '/' },
            { name: 'Tasks', path: '/tasks' }
          ]
        }
      },
      {
        path: 'kanban',
        component: () => import('@/views/tasks/KanbanView.vue'),
        name: 'TaskKanban',
        meta: {
          title: 'Task Kanban',
          breadcrumb: [
            { name: 'Home', path: '/' },
            { name: 'Tasks', path: '/tasks' },
            { name: 'Kanban', path: '/tasks/kanban' }
          ]
        }
      },
      {
        path: ':id',
        component: () => import('@/views/tasks/TaskDetailView.vue'),
        name: 'TaskDetail',
        meta: {
          title: 'Task Details',
          breadcrumb: [
            { name: 'Home', path: '/' },
            { name: 'Tasks', path: '/tasks' },
            { name: 'Details', path: '' }
          ]
        }
      }
    ]
  },
  {
    path: '/settings',
    component: MainView,
    children: [
      {
        path: '',
        component: () => import('@/views/SettingsView.vue'),
        name: 'Settings',
        meta: {
          title: 'Settings',
          requiresAuth: true,
          breadcrumb: [
            { name: 'Home', path: '/' },
            { name: 'Settings', path: '/settings' }
          ]
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: 'Page Not Found'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    } else {
      return { top: 0 }
    }
  }
})

// Global navigation guards
router.beforeEach((to, from, next) => {
  // Set document title
  if (to.meta.title) {
    document.title = `${to.meta.title} - Ivanti Kanban`
  } else {
    document.title = 'Ivanti Kanban'
  }

  // Check for authentication requirements
  if (to.meta.requiresAuth) {
    // Add your authentication logic here
    // For now, we'll just proceed
    next()
  } else {
    next()
  }
})

router.afterEach((to, from) => {
  // Log navigation for analytics or debugging
  if (import.meta.env.DEV) {
    console.log(`Navigated from ${from.path} to ${to.path}`)
  }
})

export default router