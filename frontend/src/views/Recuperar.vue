<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1 class="auth-title">Recuperar Contraseña</h1>
      <p class="auth-subtitle">Ingresa tu email para recibir instrucciones</p>

      <form v-if="!enviado" @submit.prevent="handleRecuperar" class="auth-form">
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

        <div v-if="error" class="error-message">{{ error }}</div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Enviando...' : 'Enviar Instrucciones' }}
        </button>
      </form>

      <div v-else class="success-message">
        Se ha enviado un enlace de recuperación a tu correo electrónico.
      </div>

      <div class="auth-links">
        <router-link to="/login">Volver al inicio de sesión</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../services/api'

const form = ref({ email: '' })
const loading = ref(false)
const error = ref('')
const enviado = ref(false)

const handleRecuperar = async () => {
  loading.value = true
  error.value = ''

  try {
    await api.post('/auth/recuperar', form.value)
    enviado.value = true
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al enviar instrucciones'
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
  padding: 16px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  margin-bottom: 20px;
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
  transition: transform 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
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
}

.auth-links a:hover {
  text-decoration: underline;
}
</style>
