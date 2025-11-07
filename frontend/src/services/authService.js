import api from './api'

export default {
  // Registro de usuario
  async registro(datos) {
    const response = await api.post('/users/registro', datos)
    return response.data
  },

  // Validar cuenta con código
  async validarCuenta(datos) {
    const response = await api.post('/users/validar-cuenta', datos)
    return response.data
  },

  // Login - Primer factor
  async login(usuario, contrasena) {
    const response = await api.post('/auth/login', { usuario, contrasena })
    return response.data
  },

  // Solicitar código MFA por email
  async solicitarCodigoEmail(idUsuario) {
    const response = await api.post('/auth/mfa/email', { idUsuario })
    return response.data
  },

  // Solicitar código MFA por SMS
  async solicitarCodigoSMS(idUsuario) {
    const response = await api.post('/auth/mfa/sms', { idUsuario })
    return response.data
  },

  // Validar código MFA
  async validarMFA(idMFA, codigo, idUsuario) {
    const response = await api.post('/auth/mfa/validar', { idMFA, codigo, idUsuario })
    return response.data
  },

  // Obtener preguntas de seguridad de un usuario
  async obtenerPreguntasSeguridad(idUsuario) {
    const response = await api.post('/auth/preguntas-seguridad', { idUsuario })
    return response.data
  },

  // Validar preguntas de seguridad
  async validarPreguntas(idUsuario, respuestas) {
    const response = await api.post('/auth/mfa/preguntas/validar', { idUsuario, respuestas })
    return response.data
  },

  // Validar dispositivo USB
  async validarUSB(idUsuario, identificador) {
    const response = await api.post('/auth/mfa/usb/validar', { idUsuario, identificador })
    return response.data
  },

  // Logout
  async logout() {
    const response = await api.post('/auth/logout')
    return response.data
  },

  // Solicitar recuperación de contraseña
  async solicitarRecuperacion(email) {
    const response = await api.post('/auth/recuperar', { email })
    return response.data
  },

  // Restablecer contraseña
  async restablecerContrasena(token, nuevaContrasena) {
    const response = await api.post(`/auth/reset-password/${token}`, { nuevaContrasena })
    return response.data
  },

  // Verificar sesión
  async verificarSesion() {
    const response = await api.get('/auth/verificar')
    return response.data
  }
}
