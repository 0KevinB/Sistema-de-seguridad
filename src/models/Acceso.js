const database = require('../config/database');

/**
 * Modelo Acceso
 * RS6: Control de intentos de acceso (máximo 4 intentos)
 * Registra intentos fallidos y gestiona bloqueos
 */
class Acceso {
  /**
   * Registra un intento de acceso
   * @param {number} idUsuario - ID del usuario
   * @param {string} ipOrigen - IP desde donde se intenta acceder
   * @param {boolean} exitoso - Si el intento fue exitoso
   * @returns {Promise<Object>}
   */
  static async registrarIntento(idUsuario, ipOrigen, exitoso = false) {
    try {
      if (exitoso) {
        // Si el acceso es exitoso, resetear intentos fallidos
        const sql = `
          INSERT INTO Acceso (idUsuario, intentosFallidos, ipOrigen)
          VALUES (?, 0, ?)
        `;
        const result = await database.run(sql, [idUsuario, ipOrigen]);

        // Resetear intentos anteriores
        await this.resetearIntentos(idUsuario);

        return { id: result.lastID, bloqueado: false };
      } else {
        // Obtener intentos actuales
        const intentosActuales = await this.contarIntentos(idUsuario);
        const nuevoTotal = intentosActuales + 1;

        const sql = `
          INSERT INTO Acceso (idUsuario, intentosFallidos, ipOrigen)
          VALUES (?, ?, ?)
        `;
        const result = await database.run(sql, [idUsuario, nuevoTotal, ipOrigen]);

        // Verificar si se alcanzó el máximo de intentos
        const maxIntentos = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 4;
        const bloqueado = nuevoTotal >= maxIntentos;

        if (bloqueado) {
          await this.bloquearCuenta(idUsuario);
        }

        return {
          id: result.lastID,
          intentosFallidos: nuevoTotal,
          bloqueado: bloqueado,
          intentosRestantes: Math.max(0, maxIntentos - nuevoTotal)
        };
      }
    } catch (error) {
      throw new Error(`Error al registrar intento: ${error.message}`);
    }
  }

  /**
   * Cuenta los intentos fallidos recientes de un usuario
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<number>} Número de intentos fallidos
   */
  static async contarIntentos(idUsuario) {
    const sql = `
      SELECT intentosFallidos FROM Acceso
      WHERE idUsuario = ?
      ORDER BY fechaIntento DESC
      LIMIT 1
    `;

    try {
      const result = await database.get(sql, [idUsuario]);
      return result ? result.intentosFallidos : 0;
    } catch (error) {
      throw new Error(`Error al contar intentos: ${error.message}`);
    }
  }

  /**
   * Bloquea la cuenta de un usuario
   * RS6: Bloqueo después de múltiples intentos fallidos
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<boolean>}
   */
  static async bloquearCuenta(idUsuario) {
    const sql = `UPDATE Usuario SET estado = 0 WHERE idUsuario = ?`;

    try {
      await database.run(sql, [idUsuario]);
      return true;
    } catch (error) {
      throw new Error(`Error al bloquear cuenta: ${error.message}`);
    }
  }

  /**
   * Desbloquea la cuenta de un usuario
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<boolean>}
   */
  static async desbloquearCuenta(idUsuario) {
    const sql = `UPDATE Usuario SET estado = 1 WHERE idUsuario = ?`;

    try {
      await database.run(sql, [idUsuario]);
      await this.resetearIntentos(idUsuario);
      return true;
    } catch (error) {
      throw new Error(`Error al desbloquear cuenta: ${error.message}`);
    }
  }

  /**
   * Resetea los intentos fallidos de un usuario
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<boolean>}
   */
  static async resetearIntentos(idUsuario) {
    const sql = `
      DELETE FROM Acceso
      WHERE idUsuario = ? AND intentosFallidos > 0
    `;

    try {
      await database.run(sql, [idUsuario]);
      return true;
    } catch (error) {
      throw new Error(`Error al resetear intentos: ${error.message}`);
    }
  }

  /**
   * Obtiene el historial de accesos de un usuario
   * @param {number} idUsuario - ID del usuario
   * @param {number} limite - Límite de registros
   * @returns {Promise<Array>}
   */
  static async obtenerHistorial(idUsuario, limite = 10) {
    const sql = `
      SELECT * FROM Acceso
      WHERE idUsuario = ?
      ORDER BY fechaIntento DESC
      LIMIT ?
    `;

    try {
      return await database.all(sql, [idUsuario, limite]);
    } catch (error) {
      throw new Error(`Error al obtener historial: ${error.message}`);
    }
  }

  /**
   * Verifica si una cuenta está bloqueada
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<boolean>}
   */
  static async estaBloqueada(idUsuario) {
    const sql = `SELECT estado FROM Usuario WHERE idUsuario = ?`;

    try {
      const usuario = await database.get(sql, [idUsuario]);
      return usuario ? usuario.estado === 0 : false;
    } catch (error) {
      throw new Error(`Error al verificar bloqueo: ${error.message}`);
    }
  }
}

module.exports = Acceso;
