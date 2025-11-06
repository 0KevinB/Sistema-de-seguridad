<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1 class="auth-title">Validar Cuenta</h1>
      <p class="auth-subtitle">Ingresa el código enviado a tu correo</p>

      <form @submit.prevent="handleValidacion" class="auth-form">
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
          <label for="codigo">Código de Verificación</label>
          <input
            type="text"
            id="codigo"
            v-model="form.codigo"
            required
            :disabled="loading"
            placeholder="123456"
            maxlength="6"
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="success" class="success-message">
          {{ success }}
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Validando...' : 'Validar Cuenta' }}
        </button>
      </form>

      <div class="auth-links">
        <router-link to="/login">Volver al inicio de sesión</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  codigo: ''
})

const validationData = ref(null)
const loading = ref(false)
const error = ref('')
const success = ref('')

onMounted(() => {
  // Cargar datos de validación pendiente
  const pending = localStorage.getItem('pendingValidation')
  if (pending) {
    validationData.value = JSON.parse(pending)
    form.value.email = validationData.value.email
  }
})

const handleValidacion = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    if (!validationData.value) {
      error.value = 'No hay validación pendiente. Por favor regístrate primero.'
      loading.value = false
      return
    }

    // Enviar idUsuario, idMFA y codigo al backend
    const datosValidacion = {
      idUsuario: validationData.value.idUsuario,
      idMFA: validationData.value.idMFA,
      codigo: form.value.codigo
    }

    const response = await authStore.validarCuenta(datosValidacion)

    if (response.success) {
      success.value = 'Cuenta validada correctamente. Redirigiendo al login...'

      // Limpiar datos de validación
      localStorage.removeItem('pendingValidation')

      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      error.value = response.mensaje || response.message || 'Error al validar cuenta'
    }
  } catch (err) {
    error.value = err.response?.data?.mensaje || err.response?.data?.message || 'Error al conectar con el servidor'
  } finally {
    loading.value = false
  }
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
  max-width: 420px;
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

.success-message {
  background-color: #c6f6d5;
  color: #22543d;
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
</style>
