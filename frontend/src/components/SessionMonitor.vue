<template>
  <div v-if="showAlert" class="session-alert-overlay">
    <div class="session-alert">
      <div class="alert-icon">⚠️</div>
      <h2>Nueva Sesión Detectada</h2>
      <p>Se ha iniciado sesión desde otro dispositivo o navegador.</p>
      <p class="alert-detail">{{ fechaNuevaSesion }}</p>

      <div class="alert-actions">
        <button @click="cerrarOtraSesion" class="btn-primary" :disabled="loading">
          {{ loading ? 'Cerrando...' : 'Cerrar otra sesión y continuar aquí' }}
        </button>
        <button @click="cerrarEstaSesion" class="btn-secondary" :disabled="loading">
          Cerrar esta sesión
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import userService from '../services/userService'

const router = useRouter()
const authStore = useAuthStore()

const showAlert = ref(false)
const loading = ref(false)
const fechaNuevaSesion = ref('')
const nuevaSesionId = ref(null)
let checkInterval = null

const verificarSesiones = async () => {
  try {
    const response = await userService.obtenerSesiones()

    if (response.success) {
      const sesionesActivas = response.sesiones.filter(s => s.activo === 1)
      const miSesion = authStore.currentUser?.idSession

      // Si hay más de una sesión activa
      if (sesionesActivas.length > 1) {
        // Buscar la sesión que NO es la mía
        const otraSesion = sesionesActivas.find(s => s.idSession !== miSesion)

        if (otraSesion && !showAlert.value) {
          showAlert.value = true
          nuevaSesionId.value = otraSesion.idSession
          fechaNuevaSesion.value = new Date(otraSesion.fecha).toLocaleString('es-ES')
        }
      }
    }
  } catch (error) {
    console.error('Error al verificar sesiones:', error)
  }
}

const cerrarOtraSesion = async () => {
  loading.value = true

  try {
    if (nuevaSesionId.value) {
      await userService.cerrarSesionRemota(nuevaSesionId.value)
      showAlert.value = false
      nuevaSesionId.value = null
    }
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
    alert('Error al cerrar la otra sesión')
  } finally {
    loading.value = false
  }
}

const cerrarEstaSesion = async () => {
  loading.value = true

  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Verificar cada 10 segundos
  checkInterval = setInterval(verificarSesiones, 10000)
  // Verificar inmediatamente
  verificarSesiones()
})

onUnmounted(() => {
  if (checkInterval) {
    clearInterval(checkInterval)
  }
})
</script>

<style scoped>
.session-alert-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.session-alert {
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 480px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  text-align: center;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.alert-icon {
  font-size: 64px;
  margin-bottom: 16px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.session-alert h2 {
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 12px;
}

.session-alert p {
  font-size: 16px;
  color: #4a5568;
  margin-bottom: 8px;
  line-height: 1.5;
}

.alert-detail {
  font-size: 14px;
  color: #718096;
  margin-bottom: 24px;
}

.alert-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-primary,
.btn-secondary {
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: white;
  color: #f56565;
  border: 2px solid #f56565;
}

.btn-secondary:hover:not(:disabled) {
  background: #f56565;
  color: white;
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
