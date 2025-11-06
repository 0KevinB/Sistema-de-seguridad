<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1 class="auth-title">Verificación de Segundo Factor</h1>
      <p class="auth-subtitle">Selecciona un método de verificación</p>

      <div v-if="!metodoSeleccionado" class="metodos-container">
        <button @click="seleccionarMetodo('email')" class="metodo-btn">
          <span class="metodo-icon">📧</span>
          <span class="metodo-text">Código por Email</span>
        </button>

        <button @click="seleccionarMetodo('sms')" class="metodo-btn">
          <span class="metodo-icon">📱</span>
          <span class="metodo-text">Código por SMS</span>
        </button>

        <button @click="seleccionarMetodo('preguntas')" class="metodo-btn">
          <span class="metodo-icon">❓</span>
          <span class="metodo-text">Preguntas de Seguridad</span>
        </button>

        <button @click="seleccionarMetodo('usb')" class="metodo-btn">
          <span class="metodo-icon">🔑</span>
          <span class="metodo-text">Dispositivo USB</span>
        </button>
      </div>

      <div v-else class="verificacion-container">
        <button @click="volverAMetodos" class="btn-back">← Volver a métodos</button>

        <!-- Código por Email/SMS -->
        <form v-if="metodoSeleccionado === 'email' || metodoSeleccionado === 'sms'"
              @submit.prevent="validarCodigo"
              class="auth-form">
          <div class="info-box">
            Se ha enviado un código de verificación a tu {{ metodoSeleccionado === 'email' ? 'correo' : 'teléfono' }}
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

          <div v-if="error" class="error-message">{{ error }}</div>

          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? 'Verificando...' : 'Verificar Código' }}
          </button>
        </form>

        <!-- Preguntas de Seguridad -->
        <form v-if="metodoSeleccionado === 'preguntas'"
              @submit.prevent="validarPreguntasHandler"
              class="auth-form">
          <div class="form-group" v-for="(pregunta, index) in preguntas" :key="index">
            <label>{{ pregunta.pregunta }}</label>
            <input
              type="text"
              v-model="respuestas[index]"
              required
              :disabled="loading"
              placeholder="Tu respuesta"
            />
          </div>

          <div v-if="error" class="error-message">{{ error }}</div>

          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? 'Verificando...' : 'Verificar Respuestas' }}
          </button>
        </form>

        <!-- Dispositivo USB -->
        <form v-if="metodoSeleccionado === 'usb'"
              @submit.prevent="validarUSBHandler"
              class="auth-form">
          <div class="form-group">
            <label for="identificador">Identificador del Dispositivo USB</label>
            <input
              type="text"
              id="identificador"
              v-model="form.identificadorUSB"
              required
              :disabled="loading"
              placeholder="Identificador del USB"
            />
          </div>

          <div v-if="error" class="error-message">{{ error }}</div>

          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? 'Verificando...' : 'Verificar Dispositivo' }}
          </button>
        </form>
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

const metodoSeleccionado = ref(null)
const loading = ref(false)
const error = ref('')

const form = ref({
  codigo: '',
  identificadorUSB: ''
})

const preguntas = ref([
  { pregunta: '¿Cuál es tu color favorito?' },
  { pregunta: '¿En qué ciudad naciste?' }
])

const respuestas = ref(['', ''])

onMounted(() => {
  if (!authStore.mfaData) {
    router.push('/login')
  }
})

const seleccionarMetodo = async (metodo) => {
  metodoSeleccionado.value = metodo
  error.value = ''

  if (metodo === 'email' || metodo === 'sms') {
    try {
      loading.value = true
      await authStore.solicitarCodigoMFA(metodo, authStore.mfaData.idUsuario)
    } catch (err) {
      error.value = 'Error al enviar código'
    } finally {
      loading.value = false
    }
  }
}

const volverAMetodos = () => {
  metodoSeleccionado.value = null
  form.value.codigo = ''
  form.value.identificadorUSB = ''
  respuestas.value = ['', '']
  error.value = ''
}

const validarCodigo = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await authStore.validarMFA(
      1, // ID del MFA (en producción esto vendría del backend)
      form.value.codigo,
      authStore.mfaData.idUsuario
    )

    if (response.success) {
      router.push('/dashboard')
    } else {
      error.value = response.message || 'Código inválido'
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al validar código'
  } finally {
    loading.value = false
  }
}

const validarPreguntasHandler = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await authStore.validarPreguntas(
      authStore.mfaData.idUsuario,
      respuestas.value
    )

    if (response.success) {
      router.push('/dashboard')
    } else {
      error.value = response.message || 'Respuestas incorrectas'
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al validar respuestas'
  } finally {
    loading.value = false
  }
}

const validarUSBHandler = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await authStore.validarUSB(
      authStore.mfaData.idUsuario,
      form.value.identificadorUSB
    )

    if (response.success) {
      router.push('/dashboard')
    } else {
      error.value = response.message || 'Dispositivo no reconocido'
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al validar dispositivo'
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

.metodos-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.metodo-btn {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.metodo-btn:hover {
  border-color: #667eea;
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.2);
}

.metodo-icon {
  font-size: 48px;
}

.metodo-text {
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
  text-align: center;
}

.verificacion-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.btn-back {
  background: none;
  border: none;
  color: #667eea;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px;
  text-align: left;
  transition: color 0.2s;
}

.btn-back:hover {
  color: #764ba2;
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

.info-box {
  background-color: #bee3f8;
  border-left: 4px solid #3182ce;
  padding: 16px;
  border-radius: 8px;
  color: #2c5282;
  font-size: 14px;
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
</style>
