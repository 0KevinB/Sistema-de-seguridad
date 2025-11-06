<template>
  <div class="admin-view">
    <h1 class="view-title">Registro de Auditoría</h1>
    <p class="view-subtitle">Historial completo de acciones del sistema</p>

    <div class="filters">
      <button @click="cargarAuditoria" class="btn-refresh" :disabled="loading">
        🔄 {{ loading ? 'Cargando...' : 'Actualizar' }}
      </button>
      <div class="pagination-info">
        Mostrando {{ registros.length }} registros
      </div>
    </div>

    <div v-if="loading && !registros.length" class="loading">Cargando...</div>

    <div v-else-if="error" class="error-message">{{ error }}</div>

    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Usuario ID</th>
            <th>Acción</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in registros" :key="item.idAuditoria">
            <td>{{ item.idAuditoria }}</td>
            <td>{{ item.idUsuario || 'Sistema' }}</td>
            <td class="accion-cell">{{ item.accion }}</td>
            <td>{{ formatFecha(item.fecha) }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="!registros.length" class="empty-state">
        No hay registros de auditoría
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import adminService from '../../services/adminService'

const registros = ref([])
const loading = ref(true)
const error = ref('')

const cargarAuditoria = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await adminService.obtenerAuditoria(100, 0)
    registros.value = response.registros || []
  } catch (err) {
    error.value = err.response?.data?.mensaje || 'Error al cargar registros de auditoría'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  cargarAuditoria()
})

const formatFecha = (fecha) => {
  return new Date(fecha).toLocaleString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
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

.error-message {
  background-color: #fed7d7;
  color: #c53030;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 20px;
}

.table-container {
  overflow-x: auto;
  background: white;
  border-radius: 8px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: #f7fafc;
  padding: 14px;
  text-align: left;
  font-weight: 600;
  color: #4a5568;
  border-bottom: 2px solid #e2e8f0;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-table td {
  padding: 14px;
  border-bottom: 1px solid #e2e8f0;
  color: #2d3748;
  font-size: 14px;
}

.data-table tr:hover {
  background: #f7fafc;
}

.accion-cell {
  max-width: 400px;
  word-break: break-word;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #718096;
  font-size: 16px;
}
</style>
