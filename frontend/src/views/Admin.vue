<template>
  <div class="dashboard">
    <nav class="navbar">
      <div class="nav-content">
        <h2 class="nav-title">Panel de Administración</h2>
        <div class="nav-actions">
          <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
          <button @click="handleLogout" class="btn-logout">Cerrar Sesión</button>
        </div>
      </div>
    </nav>

    <div class="admin-container">
      <div class="admin-sidebar">
        <router-link to="/admin/auditoria" class="sidebar-link" active-class="active">
          📋 Auditoría
        </router-link>
        <router-link to="/admin/sesiones" class="sidebar-link" active-class="active">
          🔐 Sesiones Activas
        </router-link>
        <router-link to="/admin/usuarios" class="sidebar-link" active-class="active">
          👥 Gestión de Usuarios
        </router-link>
        <router-link to="/admin/estadisticas" class="sidebar-link" active-class="active">
          📊 Estadísticas
        </router-link>
      </div>

      <div class="admin-content">
        <router-view />
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
  max-width: 1400px;
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

.admin-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 24px;
}

.admin-sidebar {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  height: fit-content;
}

.sidebar-link {
  display: block;
  padding: 12px 16px;
  color: #4a5568;
  text-decoration: none;
  border-radius: 8px;
  margin-bottom: 8px;
  font-weight: 500;
  transition: all 0.2s;
}

.sidebar-link:hover {
  background: #edf2f7;
  color: #667eea;
}

.sidebar-link.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.admin-content {
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  min-height: 500px;
}
</style>
