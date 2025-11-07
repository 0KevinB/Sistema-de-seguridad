<template>
  <div class="dashboard">
    <nav class="navbar">
      <div class="nav-content">
        <router-link to="/configurar-mfa" class="back-link">← Volver</router-link>
      </div>
    </nav>

    <div class="dashboard-content">
      <div class="config-card">
        <h1 class="config-title">Configurar Preguntas de Seguridad</h1>
        <p class="config-subtitle">Selecciona y responde al menos 2 preguntas</p>

        <form @submit.prevent="guardarPreguntas" class="preguntas-form">
          <div v-for="(pregunta, index) in preguntasSeleccionadas" :key="index" class="pregunta-group">
            <div class="pregunta-header">
              <h3>Pregunta {{ index + 1 }}</h3>
              <button
                v-if="preguntasSeleccionadas.length > 2"
                @click="eliminarPregunta(index)"
                type="button"
                class="btn-remove"
              >
                ✕
              </button>
            </div>

            <div class="form-group">
              <label>Selecciona una pregunta</label>
              <select v-model="pregunta.pregunta" required :disabled="loading">
                <option value="">-- Selecciona --</option>
                <option v-for="p in preguntasDisponibles" :key="p" :value="p">
                  {{ p }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Tu respuesta</label>
              <input
                type="text"
                v-model="pregunta.respuesta"
                required
                :disabled="loading"
                placeholder="Escribe tu respuesta (minúsculas)"
              />
              <small class="hint">La respuesta debe estar en minúsculas</small>
            </div>
          </div>

          <button
            v-if="preguntasSeleccionadas.length < 5"
            @click="agregarPregunta"
            type="button"
            class="btn-add"
            :disabled="loading"
          >
            + Agregar otra pregunta
          </button>

          <div v-if="mensaje" class="alert" :class="mensaje.includes('✅') ? 'alert-success' : 'alert-error'">
            {{ mensaje }}
          </div>

          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? 'Guardando...' : 'Guardar Preguntas' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import userService from '../services/userService'

const router = useRouter()

const loading = ref(false)
const mensaje = ref('')

const preguntasDisponibles = [
  '¿Cuál es tu color favorito?',
  '¿En qué ciudad naciste?',
  '¿Cuál es el nombre de tu primera mascota?',
  '¿Cuál es tu comida favorita?',
  '¿En qué escuela estudiaste la primaria?',
  '¿Cuál es tu película favorita?',
  '¿Cuál es el nombre de tu mejor amigo de la infancia?',
  '¿En qué mes y año te graduaste?',
  '¿Cuál es tu libro favorito?',
  '¿Cuál es el nombre de tu primer profesor?'
]

const preguntasSeleccionadas = ref([
  { pregunta: '', respuesta: '' },
  { pregunta: '', respuesta: '' }
])

const agregarPregunta = () => {
  if (preguntasSeleccionadas.value.length < 5) {
    preguntasSeleccionadas.value.push({ pregunta: '', respuesta: '' })
  }
}

const eliminarPregunta = (index) => {
  preguntasSeleccionadas.value.splice(index, 1)
}

const guardarPreguntas = async () => {
  // Validar que no haya preguntas duplicadas
  const preguntas = preguntasSeleccionadas.value.map(p => p.pregunta)
  const duplicadas = preguntas.filter((p, i) => preguntas.indexOf(p) !== i)

  if (duplicadas.length > 0) {
    mensaje.value = '❌ No puedes seleccionar la misma pregunta dos veces'
    return
  }

  // Validar que todas las respuestas estén en minúsculas
  const respuestasInvalidas = preguntasSeleccionadas.value.filter(p =>
    p.respuesta && p.respuesta !== p.respuesta.toLowerCase()
  )

  if (respuestasInvalidas.length > 0) {
    mensaje.value = '❌ Todas las respuestas deben estar en minúsculas'
    return
  }

  loading.value = true
  mensaje.value = ''

  try {
    const preguntasRespuestas = preguntasSeleccionadas.value.map(p => ({
      pregunta: p.pregunta,
      respuesta: p.respuesta.toLowerCase().trim()
    }))

    const response = await userService.configurarMFA('preguntas', { preguntasRespuestas })

    if (response.success) {
      mensaje.value = '✅ Preguntas de seguridad configuradas correctamente'

      setTimeout(() => {
        router.push('/configurar-mfa')
      }, 2000)
    } else {
      mensaje.value = '❌ ' + response.mensaje
    }
  } catch (error) {
    mensaje.value = '❌ Error: ' + (error.response?.data?.mensaje || error.message)
  } finally {
    loading.value = false
  }
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
  transition: color 0.2s;
}

.back-link:hover {
  color: #764ba2;
}

.dashboard-content {
  max-width: 800px;
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

.preguntas-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.pregunta-group {
  padding: 20px;
  background: #f7fafc;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
}

.pregunta-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.pregunta-header h3 {
  font-size: 18px;
  color: #2d3748;
  font-weight: 600;
}

.btn-remove {
  background: #f56565;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: background 0.2s;
}

.btn-remove:hover {
  background: #e53e3e;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
}

.form-group select,
.form-group input {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
  background: white;
}

.form-group select:focus,
.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.form-group select:disabled,
.form-group input:disabled {
  background-color: #f7fafc;
  cursor: not-allowed;
}

.hint {
  font-size: 12px;
  color: #718096;
  font-style: italic;
}

.btn-add {
  background: white;
  color: #667eea;
  border: 2px dashed #667eea;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add:hover:not(:disabled) {
  background: #667eea;
  color: white;
  border-style: solid;
}

.btn-add:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.alert {
  padding: 16px;
  border-radius: 8px;
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

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 14px 24px;
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
