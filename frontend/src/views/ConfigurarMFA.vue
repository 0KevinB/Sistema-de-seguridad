<template>
  <div class="dashboard">
    <nav class="navbar">
      <div class="nav-content">
        <router-link to="/dashboard" class="back-link">← Volver al Dashboard</router-link>
      </div>
    </nav>

    <div class="dashboard-content">
      <div class="config-card">
        <h1 class="config-title">Configurar Autenticación Multi-Factor</h1>
        <p class="config-subtitle">Selecciona y configura tus métodos de verificación</p>

        <div v-if="mensaje" class="alert" :class="mensaje.includes('✅') ? 'alert-success' : 'alert-error'">
          {{ mensaje }}
        </div>

        <div class="metodos-grid">
          <div class="metodo-card">
            <div class="metodo-header">
              <span class="metodo-icon">📧</span>
              <h3>Email</h3>
            </div>
            <p>Recibe códigos de verificación por correo electrónico</p>
            <button @click="configurarEmail" class="btn-config" :disabled="loading">Configurar</button>
          </div>

          <div class="metodo-card">
            <div class="metodo-header">
              <span class="metodo-icon">📱</span>
              <h3>SMS</h3>
            </div>
            <p>Recibe códigos de verificación por mensaje de texto</p>
            <button @click="configurarSMS" class="btn-config" :disabled="loading">Configurar</button>
          </div>

          <div class="metodo-card">
            <div class="metodo-header">
              <span class="metodo-icon">❓</span>
              <h3>Preguntas de Seguridad</h3>
            </div>
            <p>Responde preguntas de seguridad personalizadas</p>
            <button @click="configurarPreguntas" class="btn-config" :disabled="loading">
              {{ loading ? 'Configurando...' : 'Configurar' }}
            </button>
          </div>

          <div class="metodo-card">
            <div class="metodo-header">
              <span class="metodo-icon">🔑</span>
              <h3>Dispositivo USB</h3>
            </div>
            <p>Usa un dispositivo USB como llave de seguridad</p>
            <button @click="configurarUSB" class="btn-config" :disabled="loading">
              {{ loading ? 'Registrando...' : 'Configurar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import userService from '../services/userService'

const router = useRouter()
const authStore = useAuthStore()
const mensaje = ref('')
const loading = ref(false)

const configurarPreguntas = () => {
  router.push('/configurar-preguntas-mfa')
}

const configurarUSB = async () => {
  loading.value = true
  mensaje.value = ''

  try {
    const identificador = 'USB_' + Math.random().toString(36).substring(7)
    const response = await userService.configurarMFA('usb', {
      identificador,
      nombre: 'Mi USB de Seguridad'
    })

    if (response.success) {
      mensaje.value = `✅ Dispositivo USB registrado. Identificador: ${identificador}`
    } else {
      mensaje.value = '❌ Error al configurar: ' + response.mensaje
    }
  } catch (error) {
    mensaje.value = '❌ Error: ' + (error.response?.data?.mensaje || error.message)
  } finally {
    loading.value = false
  }
}

const configurarEmail = () => {
  mensaje.value = '✅ El email ya está configurado automáticamente'
}

const configurarSMS = () => {
  mensaje.value = '✅ El SMS ya está configurado automáticamente (requiere teléfono)'
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
}

.back-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.back-link:hover {
  color: #764ba2;
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

.config-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.config-title {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 8px;
}

.config-subtitle {
  font-size: 16px;
  color: #718096;
  margin-bottom: 32px;
}

.metodos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.metodo-card {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s;
}

.metodo-card:hover {
  border-color: #667eea;
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.1);
}

.metodo-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.metodo-icon {
  font-size: 32px;
}

.metodo-card h3 {
  font-size: 18px;
  color: #2d3748;
}

.metodo-card p {
  font-size: 14px;
  color: #718096;
  margin-bottom: 20px;
  line-height: 1.5;
}

.btn-config {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: transform 0.2s;
}

.btn-config:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-config:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.alert {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  font-weight: 500;
}

.alert-success {
  background: #c6f6d5;
  color: #22543d;
  border-left: 4px solid #48bb78;
}

.alert-error {
  background: #fed7d7;
  color: #c53030;
  border-left: 4px solid #f56565;
}
</style>
