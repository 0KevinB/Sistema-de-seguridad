<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1 class="auth-title">Crear Cuenta</h1>
      <p class="auth-subtitle">Registro de nuevo usuario</p>

      <form v-if="!registroExitoso" @submit.prevent="handleRegistro" class="auth-form">
        <div class="form-group">
          <label for="nombre">Nombre Completo</label>
          <input
            type="text"
            id="nombre"
            v-model="form.nombre"
            required
            :disabled="loading"
            placeholder="Tu nombre completo"
          />
        </div>

        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            v-model="form.email"
            required
            :disabled="loading"
            placeholder="tu@email.com"
          />
        </div>

        <div class="form-group">
          <label for="telefono">Teléfono (opcional)</label>
          <input
            type="tel"
            id="telefono"
            v-model="form.telefono"
            :disabled="loading"
            placeholder="+52 123 456 7890"
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Registrando...' : 'Registrar' }}
        </button>
      </form>

      <div v-else class="success-card">
        <div class="success-icon">✓</div>
        <h2 class="success-title">¡Registro Exitoso!</h2>

        <div class="credentials-box">
          <p class="credentials-label">Tus credenciales generadas:</p>
          <div class="credential-item">
            <span class="credential-label">Usuario:</span>
            <span class="credential-value">{{ credenciales.usuario }}</span>
          </div>
          <div class="credential-item">
            <span class="credential-label">Contraseña:</span>
            <span class="credential-value">{{ credenciales.contrasena }}</span>
          </div>
        </div>

        <div class="info-message">
          <p><strong>Importante:</strong> Guarda estas credenciales en un lugar seguro.</p>
          <p>Se ha enviado un código de verificación a tu correo electrónico.</p>
        </div>

        <button @click="irAValidacion" class="btn-primary">
          Validar Cuenta
        </button>
      </div>

      <div v-if="!registroExitoso" class="auth-links">
        <router-link to="/login">¿Ya tienes cuenta? Inicia sesión</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  nombre: '',
  email: '',
  telefono: ''
})

const loading = ref(false)
const error = ref('')
const registroExitoso = ref(false)
const credenciales = ref({
  usuario: '',
  contrasena: ''
})

const handleRegistro = async () => {
  loading.value = true
  error.value = ''

  try {
    // Separar nombre completo en nombres y apellidos
    const nombreCompleto = form.value.nombre.trim().split(' ')
    const nombres = nombreCompleto[0] || ''
    const apellidos = nombreCompleto.slice(1).join(' ') || ''

    // Preparar datos para el backend
    const datosRegistro = {
      nombres,
      apellidos,
      email: form.value.email,
      telefono: form.value.telefono
    }

    const response = await authStore.registro(datosRegistro)

    if (response.success || response.datos) {
      registroExitoso.value = true
      const data = response.datos || response
      credenciales.value = {
        usuario: data.usuario,
        contrasena: data.contrasena || 'Verifica tu email'
      }

      // Guardar IDs para la validación
      localStorage.setItem('pendingValidation', JSON.stringify({
        idUsuario: data.idUsuario,
        idMFA: data.idMFA,
        email: datosRegistro.email
      }))
    } else {
      error.value = response.mensaje || 'Error al registrar usuario'
    }
  } catch (err) {
    error.value = err.response?.data?.mensaje || err.response?.data?.message || 'Error al conectar con el servidor'
  } finally {
    loading.value = false
  }
}

const irAValidacion = () => {
  router.push('/validar-cuenta')
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.auth-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 480px;
}

.auth-title {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 8px;
  text-align: center;
}

.auth-subtitle {
  font-size: 14px;
  color: #718096;
  text-align: center;
  margin-bottom: 32px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.error-message {
  background-color: #fed7d7;
  color: #c53030;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-links {
  margin-top: 24px;
  text-align: center;
}

.auth-links a {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
}

.auth-links a:hover {
  color: #764ba2;
  text-decoration: underline;
}

.success-card {
  text-align: center;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #48bb78, #38a169);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: white;
  margin: 0 auto 24px;
}

.success-title {
  font-size: 24px;
  color: #2d3748;
  margin-bottom: 24px;
}

.credentials-box {
  background-color: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.credentials-label {
  font-size: 14px;
  color: #718096;
  margin-bottom: 12px;
  display: block;
}

.credential-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 6px;
  margin-bottom: 8px;
}

.credential-item:last-child {
  margin-bottom: 0;
}

.credential-label {
  font-weight: 600;
  color: #4a5568;
}

.credential-value {
  font-family: 'Courier New', monospace;
  color: #667eea;
  font-weight: 600;
  font-size: 16px;
}

.info-message {
  background-color: #bee3f8;
  border-left: 4px solid #3182ce;
  padding: 16px;
  border-radius: 8px;
  text-align: left;
  margin-bottom: 20px;
}

.info-message p {
  margin: 8px 0;
  color: #2c5282;
  font-size: 14px;
  line-height: 1.5;
}

.info-message strong {
  color: #1a365d;
}
</style>
