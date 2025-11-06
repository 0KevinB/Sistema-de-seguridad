import api from './api'

export default {
  // Obtener perfil
  async obtenerPerfil() {
    const response = await api.get('/users/perfil')
    return response.data
  },

  // Actualizar perfil
  async actualizarPerfil(datos) {
    const response = await api.put('/users/perfil', datos)
    return response.data
  },

  // Cambiar contraseña
  async cambiarContrasena(contrasenaActual, nuevaContrasena) {
    const response = await api.post('/users/cambiar-contrasena', {
      contrasenaActual,
      nuevaContrasena
    })
    return response.data
  },

  // Configurar MFA
  async configurarMFA(tipo, datos) {
    const response = await api.post('/users/mfa/configurar', { tipo, datos })
    return response.data
  },

  // Obtener métodos MFA
  async obtenerMetodosMFA() {
    const response = await api.get('/users/mfa/metodos')
    return response.data
  }
}
