<template>
  <div class="admin-view">
    <h1 class="view-title">Estadísticas del Sistema</h1>
    <p class="view-subtitle">Métricas y resumen del sistema (últimas 24 horas)</p>

    <div class="filters">
      <button @click="cargarEstadisticas" class="btn-refresh" :disabled="loading">
        🔄 {{ loading ? 'Cargando...' : 'Actualizar' }}
      </button>
      <div class="pagination-info">
        Última actualización: {{ ultimaActualizacion }}
      </div>
    </div>

    <div v-if="loading && !estadisticas.usuariosTotales" class="loading">Cargando...</div>

    <div v-else-if="error" class="error-message">{{ error }}</div>

    <div v-else class="stats-grid">
      <div class="stat-card card-primary">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <h3>Total de Usuarios</h3>
          <p class="stat-value">{{ estadisticas.usuariosTotales || 0 }}</p>
          <p class="stat-subtitle">Registrados en el sistema</p>
        </div>
      </div>

      <div class="stat-card card-success">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <h3>Usuarios Activos</h3>
          <p class="stat-value">{{ estadisticas.usuariosActivos || 0 }}</p>
          <p class="stat-subtitle">Cuentas habilitadas</p>
        </div>
      </div>

      <div class="stat-card card-danger">
        <div class="stat-icon">🚫</div>
        <div class="stat-content">
          <h3>Usuarios Bloqueados</h3>
          <p class="stat-value">{{ estadisticas.usuariosBloqueados || 0 }}</p>
          <p class="stat-subtitle">Cuentas deshabilitadas</p>
        </div>
      </div>

      <div class="stat-card card-info">
        <div class="stat-icon">🔐</div>
        <div class="stat-content">
          <h3>Sesiones Activas</h3>
          <p class="stat-value">{{ estadisticas.sesionesActivas || 0 }}</p>
          <p class="stat-subtitle">Usuarios conectados</p>
        </div>
      </div>

      <div class="stat-card card-warning">
        <div class="stat-icon">📋</div>
        <div class="stat-content">
          <h3>Auditoría (24h)</h3>
          <p class="stat-value">{{ estadisticas.auditoriaReciente || 0 }}</p>
          <p class="stat-subtitle">Registros recientes</p>
        </div>
      </div>

      <div class="stat-card card-error">
        <div class="stat-icon">❌</div>
        <div class="stat-content">
          <h3>Intentos Fallidos (24h)</h3>
          <p class="stat-value">{{ estadisticas.intentosFallidosRecientes || 0 }}</p>
          <p class="stat-subtitle">Accesos rechazados</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import adminService from '../../services/adminService'

const estadisticas = ref({})
const loading = ref(true)
const error = ref('')
const ultimaActualizacion = ref('')

const cargarEstadisticas = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await adminService.obtenerEstadisticas()
    estadisticas.value = response.estadisticas || {}
    ultimaActualizacion.value = new Date().toLocaleTimeString('es-MX')
  } catch (err) {
    error.value = err.response?.data?.mensaje || 'Error al cargar estadísticas'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  cargarEstadisticas()
})
</script>

<style scoped>
.admin-view {
  width: 100%;
}

.view-title {
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 8px;
}

.view-subtitle {
  font-size: 14px;
  color: #718096;
  margin-bottom: 24px;
}

.filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
}

.btn-refresh {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-refresh:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 14px;
  color: #4a5568;
  font-weight: 500;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #718096;
}

.error-message {
  background-color: #fed7d7;
  color: #c53030;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.stat-card {
  color: white;
  padding: 28px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card-success {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
}

.card-danger {
  background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
}

.card-info {
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
}

.card-warning {
  background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
}

.card-error {
  background: linear-gradient(135deg, #fc8181 0%, #f56565 100%);
}

.stat-icon {
  font-size: 56px;
  opacity: 0.9;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-content h3 {
  font-size: 14px;
  font-weight: 600;
  opacity: 0.95;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 4px;
  line-height: 1;
}

.stat-subtitle {
  font-size: 12px;
  opacity: 0.9;
  margin: 0;
}
</style>
