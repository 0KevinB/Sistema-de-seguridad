import api from './api'

export default {
  // Obtener auditoría
  async obtenerAuditoria(limite = 100, offset = 0) {
    const response = await api.get('/admin/auditoria', {
      params: { limite, offset }
    })
    return response.data
  },

  // Obtener auditoría por usuario
  async obtenerAuditoriaPorUsuario(idUsuario, limite = 50) {
    const response = await api.get(`/admin/auditoria/usuario/${idUsuario}`, {
      params: { limite }
    })
    return response.data
  },

  // Obtener auditoría por rango de fechas
  async obtenerAuditoriaPorRango(fechaInicio, fechaFin) {
    const response = await api.get('/admin/auditoria/rango', {
      params: { fechaInicio, fechaFin }
    })
    return response.data
  },

  // Obtener historial de accesos
  async obtenerHistorialAccesos(idUsuario, limite = 20) {
    const response = await api.get(`/admin/accesos/${idUsuario}`, {
      params: { limite }
    })
    return response.data
  },

  // Desbloquear cuenta
  async desbloquearCuenta(idUsuario) {
    const response = await api.post(`/admin/desbloquear/${idUsuario}`)
    return response.data
  },

  // Bloquear cuenta
  async bloquearCuenta(idUsuario, motivo) {
    const response = await api.post(`/admin/bloquear/${idUsuario}`, { motivo })
    return response.data
  },

  // Obtener sesiones activas
  async obtenerSesionesActivas() {
    const response = await api.get('/admin/sesiones')
    return response.data
  },

  // Cerrar sesión de usuario
  async cerrarSesion(idSession) {
    const response = await api.post(`/admin/sesiones/cerrar/${idSession}`)
    return response.data
  },

  // Obtener estadísticas
  async obtenerEstadisticas() {
    const response = await api.get('/admin/estadisticas')
    return response.data
  },

  // Obtener lista de usuarios (usando endpoint de auditoría para extraer usuarios únicos)
  async obtenerUsuarios() {
    const response = await api.get('/admin/auditoria', {
      params: { limite: 1000 }
    })
    return response.data
  }
}
