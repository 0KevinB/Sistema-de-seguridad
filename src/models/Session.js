const database = require('../config/database');

/**
 * Modelo Session
 * Gestiona las sesiones de usuario en el sistema
 * RS5: No se puede tener activas dos sesiones de un usuario al mismo tiempo
 * RS7: Control de gestión de sesión de trabajo
 */
class Session {
  /**
   * Inicia una nueva sesión para un usuario
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<Object>} Sesión creada
   */
  static async iniciarSession(idUsuario) {
    try {
      // Primero cerrar cualquier sesión activa del usuario
      await this.cerrarSessionesActivas(idUsuario);

      const sql = `
        INSERT INTO Session (idUsuario, activo, fecha)
        VALUES (?, 1, CURRENT_TIMESTAMP)
      `;

      const result = await database.run(sql, [idUsuario]);

      return {
        idSession: result.lastID,
        idUsuario: idUsuario,
        activo: true,
        fecha: new Date()
      };
    } catch (error) {
      throw new Error(`Error al iniciar sesión: ${error.message}`);
    }
  }

  /**
   * Cierra una sesión específica
   * @param {number} idSession - ID de la sesión
   * @returns {Promise<boolean>}
   */
  static async cerrarSession(idSession) {
    const sql = `UPDATE Session SET activo = 0 WHERE idSession = ?`;

    try {
      await database.run(sql, [idSession]);
      return true;
    } catch (error) {
      throw new Error(`Error al cerrar sesión: ${error.message}`);
    }
  }

  /**
   * Cierra todas las sesiones activas de un usuario
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<boolean>}
   */
  static async cerrarSessionesActivas(idUsuario) {
    const sql = `UPDATE Session SET activo = 0 WHERE idUsuario = ? AND activo = 1`;

    try {
      await database.run(sql, [idUsuario]);
      return true;
    } catch (error) {
      throw new Error(`Error al cerrar sesiones activas: ${error.message}`);
    }
  }

  /**
   * Valida si una sesión está activa
   * @param {number} idSession - ID de la sesión
   * @returns {Promise<boolean>}
   */
  static async validarSession(idSession) {
    const sql = `
      SELECT s.*, u.estado as estadoUsuario
      FROM Session s
      JOIN Usuario u ON s.idUsuario = u.idUsuario
      WHERE s.idSession = ? AND s.activo = 1
    `;

    try {
      const session = await database.get(sql, [idSession]);

      if (!session) {
        return false;
      }

      // Verificar si el usuario está activo
      if (session.estadoUsuario === 0) {
        return false;
      }

      // Verificar timeout de sesión
      const sessionTimeout = parseInt(process.env.SESSION_TIMEOUT) || 30;
      const fechaSession = new Date(session.fecha);
      const ahora = new Date();
      const diffMinutos = (ahora - fechaSession) / (1000 * 60);

      if (diffMinutos > sessionTimeout) {
        await this.cerrarSession(idSession);
        return false;
      }

      return true;
    } catch (error) {
      throw new Error(`Error al validar sesión: ${error.message}`);
    }
  }

  /**
   * Verifica el número de sesiones activas de un usuario
   * RS5: No se puede tener activas dos sesiones de un usuario al mismo tiempo
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<number>} Número de sesiones activas
   */
  static async verificarNumeroSesiones(idUsuario) {
    const sql = `
      SELECT COUNT(*) as total
      FROM Session
      WHERE idUsuario = ? AND activo = 1
    `;

    try {
      const result = await database.get(sql, [idUsuario]);
      return result.total;
    } catch (error) {
      throw new Error(`Error al verificar sesiones: ${error.message}`);
    }
  }

  /**
   * Obtiene la sesión activa de un usuario
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<Object>}
   */
  static async obtenerSessionActiva(idUsuario) {
    const sql = `
      SELECT * FROM Session
      WHERE idUsuario = ? AND activo = 1
      ORDER BY fecha DESC
      LIMIT 1
    `;

    try {
      return await database.get(sql, [idUsuario]);
    } catch (error) {
      throw new Error(`Error al obtener sesión activa: ${error.message}`);
    }
  }

  /**
   * Obtiene todas las sesiones de un usuario
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<Array>}
   */
  static async obtenerSessionesPorUsuario(idUsuario) {
    const sql = `
      SELECT * FROM Session
      WHERE idUsuario = ?
      ORDER BY fecha DESC
    `;

    try {
      return await database.all(sql, [idUsuario]);
    } catch (error) {
      throw new Error(`Error al obtener sesiones: ${error.message}`);
    }
  }
}

module.exports = Session;
