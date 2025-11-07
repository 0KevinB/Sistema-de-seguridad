<template>
  <div class="admin-view">
    <h1 class="view-title">Sesiones Activas</h1>
    <p class="view-subtitle">Usuarios conectados actualmente</p>

    <div class="filters">
      <button @click="cargarSesiones" class="btn-refresh" :disabled="loading">
        🔄 {{ loading ? 'Cargando...' : 'Actualizar' }}
      </button>
      <div class="pagination-info">
        {{ sesiones.length }} sesiones activas
      </div>
    </div>

    <div v-if="success" class="success-message">{{ success }}</div>
    <div v-if="loading && !sesiones.length" class="loading">Cargando...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>

    <div v-else class="sesiones-grid">
      <div v-for="sesion in sesiones" :key="sesion.idSession" class="sesion-card">
        <div class="sesion-header">
          <span class="sesion-icon">👤</span>
          <div>
            <h3>{{ sesion.Usuario }}</h3>
            <p class="sesion-name">{{ sesion.nombres }} {{ sesion.apellidos }}</p>
          </div>
        </div>
        <div class="sesion-info">
          <div class="info-item">
            <span class="label">Email:</span>
            <span class="value">{{ sesion.email }}</span>
          </div>
          <div class="info-item">
            <span class="label">ID Usuario:</span>
            <span class="value">{{ sesion.idUsuario }}</span>
          </div>
          <div class="info-item">
            <span class="label">Inicio:</span>
            <span class="value">{{ formatFecha(sesion.fecha) }}</span>
          </div>
          <div class="info-item">
            <span class="label">Última Actividad:</span>
            <span class="value">{{ formatFecha(sesion.ultimaActividad) }}</span>
          </div>
        </div>
        <button
          @click="cerrarSesion(sesion.idSession)"
          class="btn-cerrar"
          :disabled="cerrando === sesion.idSession"
        >
          {{ cerrando === sesion.idSession ? 'Cerrando...' : '❌ Cerrar Sesión' }}
        </button>
      </div>

      <div v-if="!sesiones.length" class="empty-state">
        No hay sesiones activas
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import adminService from '../../services/adminService'

const sesiones = ref([])
const loading = ref(true)
const error = ref('')
const success = ref('')
const cerrando = ref(null)

const cargarSesiones = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const response = await adminService.obtenerSesionesActivas()
    sesiones.value = response.sesiones || []
  } catch (err) {
    error.value = err.response?.data?.mensaje || 'Error al cargar sesiones activas'
  } finally {
    loading.value = false
  }
}

const cerrarSesion = async (idSession) => {
  if (!confirm('¿Estás seguro de cerrar esta sesión?')) return

  cerrando.value = idSession
  error.value = ''
  success.value = ''

  try {
    const response = await adminService.cerrarSesion(idSession)
    success.value = response.mensaje || 'Sesión cerrada correctamente'

    // Recargar la lista
    setTimeout(() => {
      cargarSesiones()
      success.value = ''
    }, 1500)
  } catch (err) {
    error.value = err.response?.data?.mensaje || 'Error al cerrar sesión'
  } finally {
    cerrando.value = null
  }
}

onMounted(() => {
  cargarSesiones()
})

const formatFecha = (fecha) => {
  if (!fecha) {
    return 'N/A'
  }

  const date = new Date(fecha)

  // Verificar si la fecha es válida
  if (isNaN(date.getTime())) {
    return 'Fecha inválida'
  }

  return date.toLocaleString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
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

.success-message {
  background-color: #c6f6d5;
  color: #22543d;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 20px;
}

.error-message {
  background-color: #fed7d7;
  color: #c53030;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 20px;
}

.sesiones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.sesion-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s;
}

.sesion-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.sesion-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.sesion-icon {
  font-size: 40px;
  flex-shrink: 0;
}

.sesion-header h3 {
  font-size: 18px;
  color: #2d3748;
  font-weight: 700;
  margin-bottom: 4px;
}

.sesion-name {
  font-size: 13px;
  color: #718096;
  margin: 0;
}

.sesion-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  align-items: flex-start;
}

.label {
  font-weight: 600;
  color: #4a5568;
  min-width: 120px;
}

.value {
  color: #2d3748;
  text-align: right;
  word-break: break-word;
}

.btn-cerrar {
  width: 100%;
  background: #f56565;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cerrar:hover:not(:disabled) {
  background: #e53e3e;
}

.btn-cerrar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: #718096;
  font-size: 16px;
}
</style>
