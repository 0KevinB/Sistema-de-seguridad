<template>
  <div class="admin-view">
    <h1 class="view-title">Gestión de Usuarios</h1>
    <p class="view-subtitle">Administrar cuentas de usuario del sistema</p>

    <div class="filters">
      <div class="search-box">
        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar por ID de usuario..."
          class="search-input"
        />
      </div>
    </div>

    <div v-if="success" class="success-message">{{ success }}</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <div class="actions-container">
      <div class="action-card">
        <h3>Bloquear Usuario</h3>
        <p>Deshabilitar el acceso a una cuenta específica</p>
        <div class="action-form">
          <input
            v-model="bloquearForm.idUsuario"
            type="number"
            placeholder="ID del usuario"
            class="form-input"
          />
          <input
            v-model="bloquearForm.motivo"
            type="text"
            placeholder="Motivo del bloqueo"
            class="form-input"
          />
          <button
            @click="bloquearUsuario"
            class="btn-danger"
            :disabled="procesando"
          >
            {{ procesando ? 'Bloqueando...' : '🚫 Bloquear' }}
          </button>
        </div>
      </div>

      <div class="action-card">
        <h3>Desbloquear Usuario</h3>
        <p>Habilitar el acceso a una cuenta bloqueada</p>
        <div class="action-form">
          <input
            v-model="desbloquearForm.idUsuario"
            type="number"
            placeholder="ID del usuario"
            class="form-input"
          />
          <button
            @click="desbloquearUsuario"
            class="btn-success"
            :disabled="procesando"
          >
            {{ procesando ? 'Desbloqueando...' : '✅ Desbloquear' }}
          </button>
        </div>
      </div>

      <div class="action-card">
        <h3>Ver Historial de Accesos</h3>
        <p>Consultar intentos de login de un usuario</p>
        <div class="action-form">
          <input
            v-model="historialForm.idUsuario"
            type="number"
            placeholder="ID del usuario"
            class="form-input"
          />
          <button
            @click="verHistorial"
            class="btn-info"
            :disabled="procesando"
          >
            📋 Ver Historial
          </button>
        </div>
      </div>
    </div>

    <div v-if="historial.length > 0" class="historial-container">
      <h2>Historial de Accesos</h2>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario ID</th>
              <th>Intentos Fallidos</th>
              <th>Fecha Intento</th>
              <th>Bloqueado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="acceso in historial" :key="acceso.idAcceso">
              <td>{{ acceso.idAcceso }}</td>
              <td>{{ acceso.idUsuario }}</td>
              <td>{{ acceso.intentosFallidos }}</td>
              <td>{{ formatFecha(acceso.fechaIntento) }}</td>
              <td>
                <span :class="acceso.bloqueado ? 'badge-danger' : 'badge-success'">
                  {{ acceso.bloqueado ? 'Sí' : 'No' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import adminService from '../../services/adminService'

const busqueda = ref('')
const error = ref('')
const success = ref('')
const procesando = ref(false)
const historial = ref([])

const bloquearForm = ref({
  idUsuario: '',
  motivo: ''
})

const desbloquearForm = ref({
  idUsuario: ''
})

const historialForm = ref({
  idUsuario: ''
})

const bloquearUsuario = async () => {
  if (!bloquearForm.value.idUsuario) {
    error.value = 'Por favor ingresa el ID del usuario'
    return
  }

  procesando.value = true
  error.value = ''
  success.value = ''

  try {
    const response = await adminService.bloquearCuenta(
      parseInt(bloquearForm.value.idUsuario),
      bloquearForm.value.motivo || 'Bloqueado por administrador'
    )
    success.value = response.mensaje || 'Usuario bloqueado correctamente'
    bloquearForm.value = { idUsuario: '', motivo: '' }
  } catch (err) {
    error.value = err.response?.data?.mensaje || 'Error al bloquear usuario'
  } finally {
    procesando.value = false
  }
}

const desbloquearUsuario = async () => {
  if (!desbloquearForm.value.idUsuario) {
    error.value = 'Por favor ingresa el ID del usuario'
    return
  }

  procesando.value = true
  error.value = ''
  success.value = ''

  try {
    const response = await adminService.desbloquearCuenta(
      parseInt(desbloquearForm.value.idUsuario)
    )
    success.value = response.mensaje || 'Usuario desbloqueado correctamente'
    desbloquearForm.value.idUsuario = ''
  } catch (err) {
    error.value = err.response?.data?.mensaje || 'Error al desbloquear usuario'
  } finally {
    procesando.value = false
  }
}

const verHistorial = async () => {
  if (!historialForm.value.idUsuario) {
    error.value = 'Por favor ingresa el ID del usuario'
    return
  }

  procesando.value = true
  error.value = ''
  success.value = ''

  try {
    const response = await adminService.obtenerHistorialAccesos(
      parseInt(historialForm.value.idUsuario)
    )
    historial.value = response.historial || []

    if (historial.value.length === 0) {
      error.value = 'No se encontró historial para este usuario'
    }
  } catch (err) {
    error.value = err.response?.data?.mensaje || 'Error al obtener historial'
  } finally {
    procesando.value = false
  }
}

const formatFecha = (fecha) => {
  return new Date(fecha).toLocaleString('es-MX', {
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
  margin-bottom: 24px;
}

.search-box {
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
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

.actions-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.action-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
}

.action-card h3 {
  font-size: 18px;
  color: #2d3748;
  margin-bottom: 8px;
}

.action-card p {
  font-size: 14px;
  color: #718096;
  margin-bottom: 20px;
}

.action-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-input {
  padding: 10px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.btn-danger {
  background: #f56565;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-danger:hover:not(:disabled) {
  background: #e53e3e;
}

.btn-success {
  background: #48bb78;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-success:hover:not(:disabled) {
  background: #38a169;
}

.btn-info {
  background: #4299e1;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-info:hover:not(:disabled) {
  background: #3182ce;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.historial-container {
  margin-top: 32px;
}

.historial-container h2 {
  font-size: 20px;
  color: #2d3748;
  margin-bottom: 16px;
}

.table-container {
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
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

.badge-success {
  background: #c6f6d5;
  color: #22543d;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.badge-danger {
  background: #fed7d7;
  color: #c53030;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}
</style>
