const database = require('../config/database');
const crypto = require('crypto');

/**
 * Modelo TokenRecuperacion
 * RS4: Sistema de recuperación de usuario/contraseña
 */
class TokenRecuperacion {
  /**
   * Genera un token de recuperación
   * @returns {string} Token generado
   */
  static generarToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Crea un token de recuperación para un usuario
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<Object>} Token creado
   */
  static async crear(idUsuario) {
    const token = this.generarToken();
    const expiracion = parseInt(process.env.TOKEN_RECOVERY_EXPIRATION) || 24;

    const fechaExpiracion = new Date();
    fechaExpiracion.setHours(fechaExpiracion.getHours() + expiracion);

    const sql = `
      INSERT INTO TokenRecuperacion (idUsuario, token, fechaExpiracion, usado)
      VALUES (?, ?, ?, 0)
    `;

    try {
      const result = await database.run(sql, [
        idUsuario,
        token,
        fechaExpiracion.toISOString()
      ]);

      return {
        id: result.lastID,
        token: token,
        fechaExpiracion: fechaExpiracion
      };
    } catch (error) {
      throw new Error(`Error al crear token: ${error.message}`);
    }
  }

  /**
   * Valida un token de recuperación
   * @param {string} token - Token a validar
   * @returns {Promise<Object|null>} Datos del token si es válido
   */
  static async validarToken(token) {
    const sql = `
      SELECT * FROM TokenRecuperacion
      WHERE token = ? AND usado = 0
    `;

    try {
      const tokenData = await database.get(sql, [token]);

      if (!tokenData) {
        return null;
      }

      // Verificar expiración
      const ahora = new Date();
      const fechaExpiracion = new Date(tokenData.fechaExpiracion);

      if (ahora > fechaExpiracion) {
        return null;
      }

      return tokenData;
    } catch (error) {
      throw new Error(`Error al validar token: ${error.message}`);
    }
  }

  /**
   * Actualiza el estado de un token a usado
   * @param {string} token - Token a actualizar
   * @returns {Promise<boolean>}
   */
  static async actualizarEstado(token) {
    const sql = `UPDATE TokenRecuperacion SET usado = 1 WHERE token = ?`;

    try {
      await database.run(sql, [token]);
      return true;
    } catch (error) {
      throw new Error(`Error al actualizar token: ${error.message}`);
    }
  }

  /**
   * Invalida todos los tokens de un usuario
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<boolean>}
   */
  static async invalidarTokensUsuario(idUsuario) {
    const sql = `UPDATE TokenRecuperacion SET usado = 1 WHERE idUsuario = ?`;

    try {
      await database.run(sql, [idUsuario]);
      return true;
    } catch (error) {
      throw new Error(`Error al invalidar tokens: ${error.message}`);
    }
  }
}

module.exports = TokenRecuperacion;
