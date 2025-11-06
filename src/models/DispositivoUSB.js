const database = require('../config/database');
const crypto = require('crypto');

/**
 * Modelo DispositivoUSB
 * Gestiona dispositivos USB como segundo factor de autenticación
 */
class DispositivoUSB {
  /**
   * Registra un nuevo dispositivo USB
   * @param {number} idMFA - ID del MFA asociado
   * @param {string} identificador - Identificador único del dispositivo
   * @param {string} nombre - Nombre descriptivo del dispositivo
   * @returns {Promise<Object>}
   */
  static async registrar(idMFA, identificador, nombre) {
    const sql = `
      INSERT INTO DispositivoUSB (idMFA, identificador, nombre, estado, fechaRegistro)
      VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)
    `;

    try {
      const result = await database.run(sql, [idMFA, identificador, nombre]);

      return {
        id: result.lastID,
        identificador: identificador,
        nombre: nombre,
        estado: true
      };
    } catch (error) {
      throw new Error(`Error al registrar dispositivo: ${error.message}`);
    }
  }

  /**
   * Valida un dispositivo USB
   * @param {number} idMFA - ID del MFA
   * @param {string} identificador - Identificador del dispositivo
   * @returns {Promise<boolean>}
   */
  static async validar(idMFA, identificador) {
    const sql = `
      SELECT * FROM DispositivoUSB
      WHERE idMFA = ? AND identificador = ? AND estado = 1
    `;

    try {
      const dispositivo = await database.get(sql, [idMFA, identificador]);
      return dispositivo !== undefined;
    } catch (error) {
      throw new Error(`Error al validar dispositivo: ${error.message}`);
    }
  }

  /**
   * Obtiene todos los dispositivos de un MFA
   * @param {number} idMFA - ID del MFA
   * @returns {Promise<Array>}
   */
  static async obtenerPorMFA(idMFA) {
    const sql = `
      SELECT * FROM DispositivoUSB
      WHERE idMFA = ?
      ORDER BY fechaRegistro DESC
    `;

    try {
      return await database.all(sql, [idMFA]);
    } catch (error) {
      throw new Error(`Error al obtener dispositivos: ${error.message}`);
    }
  }

  /**
   * Desactiva un dispositivo USB
   * @param {number} id - ID del dispositivo
   * @returns {Promise<boolean>}
   */
  static async desactivar(id) {
    const sql = `UPDATE DispositivoUSB SET estado = 0 WHERE id = ?`;

    try {
      await database.run(sql, [id]);
      return true;
    } catch (error) {
      throw new Error(`Error al desactivar dispositivo: ${error.message}`);
    }
  }

  /**
   * Reactiva un dispositivo USB
   * @param {number} id - ID del dispositivo
   * @returns {Promise<boolean>}
   */
  static async activar(id) {
    const sql = `UPDATE DispositivoUSB SET estado = 1 WHERE id = ?`;

    try {
      await database.run(sql, [id]);
      return true;
    } catch (error) {
      throw new Error(`Error al activar dispositivo: ${error.message}`);
    }
  }

  /**
   * Genera un identificador único para un dispositivo
   * @returns {string}
   */
  static generarIdentificador() {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Obtiene un dispositivo por su identificador
   * @param {string} identificador - Identificador del dispositivo
   * @returns {Promise<Object>}
   */
  static async obtenerPorIdentificador(identificador) {
    const sql = `SELECT * FROM DispositivoUSB WHERE identificador = ?`;

    try {
      return await database.get(sql, [identificador]);
    } catch (error) {
      throw new Error(`Error al obtener dispositivo: ${error.message}`);
    }
  }

  /**
   * Elimina un dispositivo USB
   * @param {number} id - ID del dispositivo
   * @returns {Promise<boolean>}
   */
  static async eliminar(id) {
    const sql = `DELETE FROM DispositivoUSB WHERE id = ?`;

    try {
      await database.run(sql, [id]);
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar dispositivo: ${error.message}`);
    }
  }
}

module.exports = DispositivoUSB;
