const database = require('../config/database');

/**
 * Modelo Auditoria
 * RS3: Monitoreo de creación de usuarios y registro de accesos
 * Registra todas las acciones importantes del sistema
 */
class Auditoria {
  /**
   * Genera un registro de auditoría
   * @param {number} idUsuario - ID del usuario (puede ser null para acciones del sistema)
   * @param {string} accion - Descripción de la acción
   * @returns {Promise<Object>}
   */
  static async generarRegistro(idUsuario, accion) {
    const sql = `
      INSERT INTO Auditoria (idUsuario, accion, fecha)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `;

    try {
      const result = await database.run(sql, [idUsuario, accion]);

      return {
        id: result.lastID,
        idUsuario: idUsuario,
        accion: accion,
        fecha: new Date()
      };
    } catch (error) {
      throw new Error(`Error al generar registro de auditoría: ${error.message}`);
    }
  }

  /**
   * Obtiene registros de auditoría por usuario
   * @param {number} idUsuario - ID del usuario
   * @param {number} limite - Límite de registros
   * @returns {Promise<Array>}
   */
  static async obtenerPorUsuario(idUsuario, limite = 50) {
    const sql = `
      SELECT * FROM Auditoria
      WHERE idUsuario = ?
      ORDER BY fecha DESC
      LIMIT ?
    `;

    try {
      return await database.all(sql, [idUsuario, limite]);
    } catch (error) {
      throw new Error(`Error al obtener auditoría: ${error.message}`);
    }
  }

  /**
   * Obtiene todos los registros de auditoría
   * @param {number} limite - Límite de registros
   * @param {number} offset - Offset para paginación
   * @returns {Promise<Array>}
   */
  static async obtenerTodos(limite = 100, offset = 0) {
    const sql = `
      SELECT a.*, u.Usuario, u.nombres, u.apellidos
      FROM Auditoria a
      LEFT JOIN Usuario u ON a.idUsuario = u.idUsuario
      ORDER BY a.fecha DESC
      LIMIT ? OFFSET ?
    `;

    try {
      return await database.all(sql, [limite, offset]);
    } catch (error) {
      throw new Error(`Error al obtener registros: ${error.message}`);
    }
  }

  /**
   * Obtiene registros de auditoría por rango de fechas
   * @param {Date} fechaInicio - Fecha de inicio
   * @param {Date} fechaFin - Fecha de fin
   * @returns {Promise<Array>}
   */
  static async obtenerPorRango(fechaInicio, fechaFin) {
    const sql = `
      SELECT a.*, u.Usuario, u.nombres, u.apellidos
      FROM Auditoria a
      LEFT JOIN Usuario u ON a.idUsuario = u.idUsuario
      WHERE a.fecha BETWEEN ? AND ?
      ORDER BY a.fecha DESC
    `;

    try {
      return await database.all(sql, [
        fechaInicio.toISOString(),
        fechaFin.toISOString()
      ]);
    } catch (error) {
      throw new Error(`Error al obtener registros por rango: ${error.message}`);
    }
  }

  /**
   * Obtiene registros de auditoría por tipo de acción
   * @param {string} accion - Tipo de acción
   * @param {number} limite - Límite de registros
   * @returns {Promise<Array>}
   */
  static async obtenerPorAccion(accion, limite = 50) {
    const sql = `
      SELECT a.*, u.Usuario, u.nombres, u.apellidos
      FROM Auditoria a
      LEFT JOIN Usuario u ON a.idUsuario = u.idUsuario
      WHERE a.accion LIKE ?
      ORDER BY a.fecha DESC
      LIMIT ?
    `;

    try {
      return await database.all(sql, [`%${accion}%`, limite]);
    } catch (error) {
      throw new Error(`Error al obtener registros por acción: ${error.message}`);
    }
  }

  /**
   * Elimina registros antiguos de auditoría
   * @param {number} dias - Días de antigüedad
   * @returns {Promise<number>} Número de registros eliminados
   */
  static async limpiarRegistrosAntiguos(dias = 90) {
    const sql = `
      DELETE FROM Auditoria
      WHERE fecha < datetime('now', '-' || ? || ' days')
    `;

    try {
      const result = await database.run(sql, [dias]);
      return result.changes;
    } catch (error) {
      throw new Error(`Error al limpiar registros: ${error.message}`);
    }
  }
}

module.exports = Auditoria;
