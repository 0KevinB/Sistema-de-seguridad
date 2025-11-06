import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '../services/authService'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const mfaData = ref(null)

  const isAuthenticated = computed(() => !!token.value)
  const currentUser = computed(() => user.value)

  async function registro(datos) {
    const response = await authService.registro(datos)
    return response
  }

  async function validarCuenta(datos) {
    const response = await authService.validarCuenta(datos)
    return response
  }

  async function login(usuario, contrasena) {
    const response = await authService.login(usuario, contrasena)
    if (response.success) {
      mfaData.value = {
        idUsuario: response.idUsuario,
        requiereMFA: response.requiereMFA
      }
    }
    return response
  }

  async function solicitarCodigoMFA(tipo, idUsuario) {
    if (tipo === 'email') {
      return await authService.solicitarCodigoEmail(idUsuario)
    } else if (tipo === 'sms') {
      return await authService.solicitarCodigoSMS(idUsuario)
    }
  }

  async function validarMFA(idMFA, codigo, idUsuario) {
    const response = await authService.validarMFA(idMFA, codigo, idUsuario)
    if (response.success) {
      setAuth(response.token, response.usuario)
      mfaData.value = null
    }
    return response
  }

  async function validarPreguntas(idUsuario, respuestas) {
    const response = await authService.validarPreguntas(idUsuario, respuestas)
    if (response.success) {
      setAuth(response.token, response.usuario)
      mfaData.value = null
    }
    return response
  }

  async function validarUSB(idUsuario, identificador) {
    const response = await authService.validarUSB(idUsuario, identificador)
    if (response.success) {
      setAuth(response.token, response.usuario)
      mfaData.value = null
    }
    return response
  }

  function setAuth(newToken, newUser) {
    token.value = newToken
    user.value = newUser
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  async function logout() {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    } finally {
      clearAuth()
    }
  }

  function clearAuth() {
    token.value = null
    user.value = null
    mfaData.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  async function verificarSesion() {
    try {
      const response = await authService.verificarSesion()
      return response.success
    } catch (error) {
      clearAuth()
      return false
    }
  }

  return {
    token,
    user,
    mfaData,
    isAuthenticated,
    currentUser,
    registro,
    validarCuenta,
    login,
    solicitarCodigoMFA,
    validarMFA,
    validarPreguntas,
    validarUSB,
    logout,
    setAuth,
    clearAuth,
    verificarSesion
  }
})
