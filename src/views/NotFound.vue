<template>
  <div class="not-found">
    <div class="not-found-content">
      <div class="error-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z"/>
        </svg>
      </div>
      
      <h1 class="error-title">404</h1>
      <h2 class="error-subtitle">Page Not Found</h2>
      <p class="error-description">
        The page you're looking for doesn't exist or has been moved.
      </p>
      
      <div class="error-actions">
        <router-link to="/projects" class="btn btn-primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z"/>
          </svg>
          Go to Projects
        </router-link>
        
        <button class="btn btn-secondary" @click="goBack">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
          </svg>
          Go Back
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'NotFound',
  setup() {
    const router = useRouter()

    const goBack = () => {
      if (window.history.length > 1) {
        router.go(-1)
      } else {
        router.push('/projects')
      }
    }

    return {
      goBack
    }
  }
}
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 24px;
}

.not-found-content {
  text-align: center;
  max-width: 500px;
  padding: 48px 32px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.error-icon {
  color: rgba(0, 0, 0, 0.3);
  margin-bottom: 24px;
}

.error-title {
  font-size: 4rem;
  font-weight: 700;
  color: #1976d2;
  margin: 0 0 8px 0;
  text-shadow: 2px 2px 4px rgba(25, 118, 210, 0.1);
}

.error-subtitle {
  font-size: 1.5rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
  margin: 0 0 16px 0;
}

.error-description {
  color: rgba(0, 0, 0, 0.6);
  margin: 0 0 32px 0;
  line-height: 1.6;
  font-size: 16px;
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  text-decoration: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  cursor: pointer;
  min-width: 140px;
  justify-content: center;
}

.btn-primary {
  background: #1976d2;
  color: white;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
}

.btn-primary:hover {
  background: #1565c0;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.4);
}

.btn-secondary {
  background: white;
  color: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.btn-secondary:hover {
  background: rgba(0, 0, 0, 0.04);
  color: rgba(0, 0, 0, 0.87);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn:active {
  transform: translateY(0);
}

/* Responsive Design */
@media (max-width: 480px) {
  .not-found {
    padding: 16px;
  }

  .not-found-content {
    padding: 32px 24px;
  }

  .error-title {
    font-size: 3rem;
  }

  .error-subtitle {
    font-size: 1.25rem;
  }

  .error-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .btn {
    width: 100%;
  }
}

/* Animation */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.not-found-content {
  animation: fadeInUp 0.6s ease-out;
}
</style>