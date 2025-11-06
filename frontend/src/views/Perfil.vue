<template>
  <div class="dashboard">
    <nav class="navbar">
      <div class="nav-content">
        <router-link to="/dashboard" class="back-link">← Volver al Dashboard</router-link>
        <button @click="handleLogout" class="btn-logout">Cerrar Sesión</button>
      </div>
    </nav>

    <div class="dashboard-content">
      <div class="profile-card">
        <h1 class="profile-title">Mi Perfil</h1>

        <div class="profile-info">
          <div class="info-row">
            <span class="info-label">Usuario:</span>
            <span class="info-value">{{ authStore.currentUser?.usuario }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Nombre:</span>
            <span class="info-value">{{ authStore.currentUser?.nombre }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email:</span>
            <span class="info-value">{{ authStore.currentUser?.email }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Teléfono:</span>
            <span class="info-value">{{ authStore.currentUser?.telefono || 'No registrado' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Rol:</span>
            <span class="info-value">{{ authStore.currentUser?.rol }}</span>
          </div>
        </div>

        <div class="actions">
          <router-link to="/configurar-mfa" class="btn-action">Configurar MFA</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #f7fafc;
}

.navbar {
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 16px 0;
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.back-link:hover {
  color: #764ba2;
}

.btn-logout {
  background: #f56565;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-logout:hover {
  background: #e53e3e;
}

.dashboard-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 24px;
}

.profile-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.profile-title {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 32px;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 32px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
}

.info-label {
  font-weight: 600;
  color: #4a5568;
}

.info-value {
  color: #2d3748;
  word-break: break-all;
}

.actions {
  display: flex;
  gap: 16px;
}

.btn-action {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.2s;
}

.btn-action:hover {
  transform: translateY(-2px);
}
</style>
