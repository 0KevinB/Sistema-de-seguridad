<template>
  <div class="dashboard">
    <!-- Monitor de sesiones en tiempo real -->
    <SessionMonitor />

    <nav class="navbar">
      <div class="nav-content">
        <h2 class="nav-title">Sistema de Seguridad</h2>
        <div class="nav-actions">
          <span class="user-name">{{ authStore.currentUser?.nombres }} {{ authStore.currentUser?.apellidos }}</span>
          <router-link to="/perfil" class="nav-link">Mi Perfil</router-link>
          <button @click="handleLogout" class="btn-logout">Cerrar Sesión</button>
        </div>
      </div>
    </nav>

    <div class="dashboard-content">
      <div class="welcome-card">
        <h1 class="welcome-title">Bienvenido, {{ authStore.currentUser?.nombres }} {{ authStore.currentUser?.apellidos }}</h1>
        <p class="welcome-text">Has iniciado sesión exitosamente en el sistema de seguridad multi-factor.</p>
      </div>

      <div class="info-grid">
        <div class="info-card">
          <div class="info-icon">👤</div>
          <div class="info-content">
            <h3>Usuario</h3>
            <p>{{ authStore.currentUser?.usuario }}</p>
          </div>
        </div>

        <div class="info-card">
          <div class="info-icon">📧</div>
          <div class="info-content">
            <h3>Email</h3>
            <p>{{ authStore.currentUser?.email }}</p>
          </div>
        </div>

        <div class="info-card">
          <div class="info-icon">📱</div>
          <div class="info-content">
            <h3>Teléfono</h3>
            <p>{{ authStore.currentUser?.telefono || 'No registrado' }}</p>
          </div>
        </div>

        <div class="info-card">
          <div class="info-icon">✅</div>
          <div class="info-content">
            <h3>Estado</h3>
            <p>Sesión Activa</p>
          </div>
        </div>
      </div>

      <div class="actions-card">
        <h2>Acciones Disponibles</h2>
        <div class="actions-grid">
          <router-link to="/perfil" class="action-btn">
            <span class="action-icon">👤</span>
            <span class="action-text">Ver Mi Perfil</span>
          </router-link>

          <router-link to="/configurar-mfa" class="action-btn">
            <span class="action-icon">🔐</span>
            <span class="action-text">Configurar MFA</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import SessionMonitor from '../components/SessionMonitor.vue'

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

.nav-title {
  font-size: 20px;
  font-weight: 700;
  color: #2d3748;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-name {
  font-weight: 500;
  color: #4a5568;
}

.nav-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.nav-link:hover {
  background-color: #edf2f7;
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 48px;
  border-radius: 12px;
  margin-bottom: 32px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.welcome-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 12px;
}

.welcome-text {
  font-size: 16px;
  opacity: 0.95;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.info-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 16px;
}

.info-icon {
  font-size: 36px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7fafc;
  border-radius: 12px;
}

.info-content h3 {
  font-size: 14px;
  color: #718096;
  margin-bottom: 4px;
  font-weight: 500;
}

.info-content p {
  font-size: 18px;
  color: #2d3748;
  font-weight: 600;
  word-break: break-all;
}

.actions-card {
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.actions-card h2 {
  font-size: 20px;
  color: #2d3748;
  margin-bottom: 24px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.action-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
  border-radius: 12px;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.action-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

.action-icon {
  font-size: 48px;
}

.action-text {
  font-size: 16px;
  font-weight: 600;
}
</style>
