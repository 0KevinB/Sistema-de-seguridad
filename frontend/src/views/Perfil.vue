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
            <span class="info-value">{{ authStore.currentUser?.nombres }} {{ authStore.currentUser?.apellidos }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email:</span>
            <span class="info-value">{{ authStore.currentUser?.email }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Teléfono:</span>
            <span class="info-value">{{ authStore.currentUser?.telefono || 'No registrado' }}</span>
          </div>
        </div>

        <div class="actions">
          <router-link to="/configurar-mfa" class="btn-action">Configurar MFA</router-link>
        </div>

        <!-- Sección de Editar Datos -->
        <div class="edit-section">
          <h2 class="section-title">Editar Datos Personales</h2>

          <form @submit.prevent="actualizarDatos" class="edit-form">
            <div class="form-group">
              <label for="nombres">Nombres</label>
              <input
                type="text"
                id="nombres"
                v-model="editForm.nombres"
                required
                :disabled="loadingEdit"
                placeholder="Tus nombres"
              />
            </div>

            <div class="form-group">
              <label for="apellidos">Apellidos</label>
              <input
                type="text"
                id="apellidos"
                v-model="editForm.apellidos"
                required
                :disabled="loadingEdit"
                placeholder="Tus apellidos"
              />
            </div>

            <div class="form-group">
              <label for="telefono">Teléfono</label>
              <input
                type="text"
                id="telefono"
                v-model="editForm.telefono"
                :disabled="loadingEdit"
                placeholder="Tu número de teléfono"
              />
            </div>

            <div v-if="mensajeEdit" class="alert" :class="mensajeEdit.includes('✅') ? 'alert-success' : 'alert-error'">
              {{ mensajeEdit }}
            </div>

            <button type="submit" class="btn-action" :disabled="loadingEdit">
              {{ loadingEdit ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </form>
        </div>

        <!-- Sección de Cambiar Contraseña -->
        <div class="password-section">
          <h2 class="section-title">Cambiar Contraseña</h2>

          <form @submit.prevent="cambiarContrasena" class="password-form">
            <div class="form-group">
              <label for="actual">Contraseña Actual</label>
              <input
                type="password"
                id="actual"
                v-model="passwordForm.actual"
                required
                :disabled="loading"
                placeholder="Tu contraseña actual"
              />
            </div>

            <div class="form-group">
              <label for="nueva">Nueva Contraseña</label>
              <input
                type="password"
                id="nueva"
                v-model="passwordForm.nueva"
                required
                :disabled="loading"
                placeholder="Mínimo 8 caracteres"
                minlength="8"
              />
            </div>

            <div class="form-group">
              <label for="confirmar">Confirmar Nueva Contraseña</label>
              <input
                type="password"
                id="confirmar"
                v-model="passwordForm.confirmar"
                required
                :disabled="loading"
                placeholder="Repite la nueva contraseña"
              />
            </div>

            <div v-if="mensaje" class="alert" :class="mensaje.includes('✅') ? 'alert-success' : 'alert-error'">
              {{ mensaje }}
            </div>

            <button type="submit" class="btn-action" :disabled="loading">
              {{ loading ? 'Cambiando...' : 'Cambiar Contraseña' }}
            </button>
          </form>
        </div>

        <!-- Sección de Historial de Sesiones -->
        <div class="sessions-section">
          <h2 class="section-title">Historial de Sesiones</h2>

          <div v-if="loadingSessions" class="loading">Cargando sesiones...</div>

          <div v-else-if="sesiones.length === 0" class="empty">
            No hay sesiones registradas
          </div>

          <div v-else class="sessions-list">
            <div
              v-for="sesion in sesiones"
              :key="sesion.idSession"
              class="session-item"
              :class="{ active: sesion.activo }"
            >
              <div class="session-info">
                <span class="session-status">
                  {{ sesion.activo ? '🟢 Activa' : '⚪ Cerrada' }}
                </span>
                <span class="session-date">{{ formatDate(sesion.fecha) }}</span>
              </div>
              <button
                v-if="sesion.activo && sesion.idSession !== currentSessionId"
                @click="cerrarSesion(sesion.idSession)"
                class="btn-close-session"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>

          <button @click="cargarSesiones" class="btn-refresh" :disabled="loadingSessions">
            🔄 Actualizar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import userService from '../services/userService'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const loadingSessions = ref(false)
const loadingEdit = ref(false)
const mensaje = ref('')
const mensajeEdit = ref('')
const sesiones = ref([])
const currentSessionId = ref(null)

const passwordForm = ref({
  actual: '',
  nueva: '',
  confirmar: ''
})

const editForm = ref({
  nombres: '',
  apellidos: '',
  telefono: ''
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

const cambiarContrasena = async () => {
  mensaje.value = ''

  if (passwordForm.value.nueva !== passwordForm.value.confirmar) {
    mensaje.value = '❌ Las contraseñas no coinciden'
    return
  }

  if (passwordForm.value.nueva.length < 8) {
    mensaje.value = '❌ La contraseña debe tener al menos 8 caracteres'
    return
  }

  loading.value = true

  try {
    const response = await userService.cambiarContrasena(
      passwordForm.value.actual,
      passwordForm.value.nueva
    )

    if (response.success) {
      mensaje.value = '✅ Contraseña cambiada correctamente'
      passwordForm.value = { actual: '', nueva: '', confirmar: '' }

      setTimeout(() => {
        mensaje.value = ''
      }, 5000)
    } else {
      mensaje.value = '❌ ' + response.mensaje
    }
  } catch (error) {
    mensaje.value = '❌ ' + (error.response?.data?.mensaje || 'Error al cambiar contraseña')
  } finally {
    loading.value = false
  }
}

const cargarSesiones = async () => {
  loadingSessions.value = true

  try {
    const response = await userService.obtenerSesiones()
    if (response.success) {
      sesiones.value = response.sesiones
      currentSessionId.value = response.sessionActual
    }
  } catch (error) {
    console.error('Error al cargar sesiones:', error)
    mensaje.value = '❌ Error al cargar sesiones'
  } finally {
    loadingSessions.value = false
  }
}

const cerrarSesion = async (idSession) => {
  if (!confirm('¿Cerrar esta sesión? El otro dispositivo será desconectado.')) return

  try {
    const response = await userService.cerrarSesionRemota(idSession)
    if (response.success) {
      mensaje.value = '✅ Sesión cerrada correctamente'
      await cargarSesiones()
    } else {
      mensaje.value = '❌ ' + response.mensaje
    }
  } catch (error) {
    mensaje.value = '❌ Error al cerrar sesión: ' + (error.response?.data?.mensaje || error.message)
  }
}

const actualizarDatos = async () => {
  mensajeEdit.value = ''
  loadingEdit.value = true

  try {
    const response = await userService.actualizarDatos({
      nombres: editForm.value.nombres,
      apellidos: editForm.value.apellidos,
      telefono: editForm.value.telefono
    })

    if (response.success) {
      mensajeEdit.value = '✅ Datos actualizados correctamente'

      // Actualizar el authStore con los nuevos datos
      authStore.currentUser.nombres = editForm.value.nombres
      authStore.currentUser.apellidos = editForm.value.apellidos
      authStore.currentUser.telefono = editForm.value.telefono

      setTimeout(() => {
        mensajeEdit.value = ''
      }, 5000)
    } else {
      mensajeEdit.value = '❌ ' + response.mensaje
    }
  } catch (error) {
    mensajeEdit.value = '❌ ' + (error.response?.data?.mensaje || 'Error al actualizar datos')
  } finally {
    loadingEdit.value = false
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  // Inicializar el formulario con los datos actuales del usuario
  editForm.value.nombres = authStore.currentUser?.nombres || ''
  editForm.value.apellidos = authStore.currentUser?.apellidos || ''
  editForm.value.telefono = authStore.currentUser?.telefono || ''

  cargarSesiones()
})
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

.btn-action:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.edit-section,
.password-section,
.sessions-section {
  margin-top: 32px;
  padding-top: 32px;
  border-top: 2px solid #e2e8f0;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 20px;
}

.edit-form,
.password-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 500px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
}

.form-group input {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input:disabled {
  background-color: #f7fafc;
  cursor: not-allowed;
}

.alert {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
}

.alert-success {
  background-color: #c6f6d5;
  color: #22543d;
  border-left: 4px solid #48bb78;
}

.alert-error {
  background-color: #fed7d7;
  color: #c53030;
  border-left: 4px solid #f56565;
}

.sessions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.session-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
}

.session-item.active {
  background: #e6fffa;
  border-color: #48bb78;
}

.session-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.session-status {
  font-weight: 600;
  font-size: 14px;
}

.session-date {
  font-size: 13px;
  color: #718096;
}

.btn-close-session {
  background: #f56565;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-close-session:hover {
  background: #e53e3e;
}

.btn-refresh {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh:hover:not(:disabled) {
  background: #667eea;
  color: white;
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading,
.empty {
  padding: 24px;
  text-align: center;
  color: #718096;
  background: #f7fafc;
  border-radius: 8px;
  margin-bottom: 16px;
}
</style>
