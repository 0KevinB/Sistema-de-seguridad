const Auditoria = require('../models/Auditoria');
const Acceso = require('../models/Acceso');
const Usuario = require('../models/Usuario');
const Session = require('../models/Session');

/**
 * Controlador de administración
 * RS3: Monitoreo de usuarios y accesos
 * RS6: Gestión de bloqueos
 */
class AdminController {
  /**
   * Obtener registros de auditoría
   * GET /api/admin/auditoria
   */
  async obtenerAuditoria(req, res) {
    try {
      const { limite = 100, offset = 0 } = req.query;

      const registros = await Auditoria.obtenerTodos(
        parseInt(limite),
        parseInt(offset)
      );

      res.json({
        success: true,
        registros: registros,
        limite: parseInt(limite),
        offset: parseInt(offset)
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        mensaje: error.message
      });
    }
  }

  /**
   * Obtener auditoría por usuario
   * GET /api/admin/auditoria/usuario/:idUsuario
   */
  async obtenerAuditoriaPorUsuario(req, res) {
    try {
      const { idUsuario } = req.params;
      const { limite = 50 } = req.query;

      const registros = await Auditoria.obtenerPorUsuario(
        parseInt(idUsuario),
        parseInt(limite)
      );

      res.json({
        success: true,
        registros: registros
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        mensaje: error.message
      });
    }
  }

  /**
   * Obtener auditoría por rango de fechas
   * GET /api/admin/auditoria/rango
   */
  async obtenerAuditoriaPorRango(req, res) {
    try {
      const { fechaInicio, fechaFin } = req.query;

      const registros = await Auditoria.obtenerPorRango(
        new Date(fechaInicio),
        new Date(fechaFin)
      );

      res.json({
        success: true,
        registros: registros,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        mensaje: error.message
      });
    }
  }

  /**
   * Obtener historial de accesos
   * GET /api/admin/accesos/:idUsuario
   */
  async obtenerHistorialAccesos(req, res) {
    try {
      const { idUsuario } = req.params;
      const { limite = 20 } = req.query;

      const historial = await Acceso.obtenerHistorial(
        parseInt(idUsuario),
        parseInt(limite)
      );

      res.json({
        success: true,
        historial: historial
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        mensaje: error.message
      });
    }
  }

  /**
   * Desbloquear cuenta de usuario
   * POST /api/admin/desbloquear/:idUsuario
   * RS6: Permitir desbloqueo
   */
  async desbloquearCuenta(req, res) {
    try {
      const { idUsuario } = req.params;

      await Acceso.desbloquearCuenta(parseInt(idUsuario));

      await Auditoria.generarRegistro(
        parseInt(idUsuario),
        `DESBLOQUEO_CUENTA - Desbloqueado por admin (${req.usuario.usuario})`
      );

      res.json({
        success: true,
        mensaje: 'Cuenta desbloqueada correctamente'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        mensaje: error.message
      });
    }
  }

  /**
   * Bloquear cuenta de usuario
   * POST /api/admin/bloquear/:idUsuario
   */
  async bloquearCuenta(req, res) {
    try {
      const { idUsuario } = req.params;
      const { motivo } = req.body;

      await Acceso.bloquearCuenta(parseInt(idUsuario));

      await Auditoria.generarRegistro(
        parseInt(idUsuario),
        `BLOQUEO_CUENTA - Bloqueado por admin (${req.usuario.usuario}): ${motivo || 'Sin motivo especificado'}`
      );

      res.json({
        success: true,
        mensaje: 'Cuenta bloqueada correctamente'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        mensaje: error.message
      });
    }
  }

  /**
   * Obtener todas las sesiones activas
   * GET /api/admin/sesiones
   */
  async obtenerSesionesActivas(req, res) {
    try {
      const sql = `
        SELECT s.*, u.Usuario, u.nombres, u.apellidos, u.email
        FROM Session s
        JOIN Usuario u ON s.idUsuario = u.idUsuario
        WHERE s.activo = 1
        ORDER BY s.fecha DESC
      `;

      const database = require('../config/database');
      const sesiones = await database.all(sql);

      res.json({
        success: true,
        sesiones: sesiones,
        total: sesiones.length
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        mensaje: error.message
      });
    }
  }

  /**
   * Cerrar sesión de un usuario (admin)
   * POST /api/admin/sesiones/cerrar/:idSession
   */
  async cerrarSesion(req, res) {
    try {
      const { idSession } = req.params;

      await Session.cerrarSession(parseInt(idSession));

      await Auditoria.generarRegistro(
        null,
        `CIERRE_SESION_ADMIN - Sesión ${idSession} cerrada por admin (${req.usuario.usuario})`
      );

      res.json({
        success: true,
        mensaje: 'Sesión cerrada correctamente'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        mensaje: error.message
      });
    }
  }

  /**
   * Obtener estadísticas del sistema
   * GET /api/admin/estadisticas
   */
  async obtenerEstadisticas(req, res) {
    try {
      const database = require('../config/database');

      // Usuarios totales
      const usuariosTotales = await database.get(
        'SELECT COUNT(*) as total FROM Usuario'
      );

      // Usuarios activos
      const usuariosActivos = await database.get(
        'SELECT COUNT(*) as total FROM Usuario WHERE estado = 1'
      );

      // Sesiones activas
      const sesionesActivas = await database.get(
        'SELECT COUNT(*) as total FROM Session WHERE activo = 1'
      );

      // Registros de auditoría (últimas 24 horas)
      const auditoriaReciente = await database.get(
        "SELECT COUNT(*) as total FROM Auditoria WHERE fecha > datetime('now', '-1 day')"
      );

      // Intentos fallidos (últimas 24 horas)
      const intentosFallidos = await database.get(
        "SELECT COUNT(*) as total FROM Acceso WHERE intentosFallidos > 0 AND fechaIntento > datetime('now', '-1 day')"
      );

      res.json({
        success: true,
        estadisticas: {
          usuariosTotales: usuariosTotales.total,
          usuariosActivos: usuariosActivos.total,
          usuariosBloqueados: usuariosTotales.total - usuariosActivos.total,
          sesionesActivas: sesionesActivas.total,
          auditoriaReciente: auditoriaReciente.total,
          intentosFallidosRecientes: intentosFallidos.total
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        mensaje: error.message
      });
    }
  }
}

module.exports = new AdminController();
