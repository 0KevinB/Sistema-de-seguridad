const database = require('../config/database');
const crypto = require('crypto');

/**
 * Modelo MFA (Multi-Factor Authentication)
 * RS2: Control de ingreso con segundo factor de autenticación
 * Soporta: Preguntas frecuentes, código email, código SMS, llave USB
 */
class MFA {
  /**
   * Genera un código de verificación
   * @param {string} tipo - Tipo de MFA (pregunta, email, sms, usb)
   * @returns {string} Código generado
   */
  static generarCodigo() {
    // Generar código de 6 dígitos
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Crea un registro MFA para un usuario
   * @param {number} idUsuario - ID del usuario
   * @param {string} tipo - Tipo de MFA
   * @param {string} codigo - Código generado (opcional)
   * @returns {Promise<Object>}
   */
  static async crear(idUsuario, tipo, codigo = null) {
    const tiposValidos = ['pregunta', 'email', 'sms', 'usb'];

    if (!tiposValidos.includes(tipo)) {
      throw new Error('Tipo de MFA no válido');
    }

    const expiracion = parseInt(process.env.MFA_CODE_EXPIRATION) || 5;
    const fechaExpiracion = new Date();
    fechaExpiracion.setMinutes(fechaExpiracion.getMinutes() + expiracion);

    const sql = `
      INSERT INTO MFA (idUsuario, tipo, codigo, fechaExpiracion)
      VALUES (?, ?, ?, ?)
    `;

    try {
      const result = await database.run(sql, [
        idUsuario,
        tipo,
        codigo,
        fechaExpiracion.toISOString()
      ]);

      return {
        idMFA: result.lastID,
        tipo: tipo,
        codigo: codigo,
        fechaExpiracion: fechaExpiracion
      };
    } catch (error) {
      throw new Error(`Error al crear MFA: ${error.message}`);
    }
  }

  /**
   * Envía el código de verificación según el tipo
   * @param {number} idMFA - ID del MFA
   * @param {string} destino - Email o teléfono
   * @param {string} codigo - Código a enviar
   * @returns {Promise<boolean>}
   */
  static async enviarCodigo(idMFA, destino, codigo) {
    // Esta función se integrará con el servicio de email/SMS
    // Por ahora retorna true
    console.log(`Enviando código ${codigo} a ${destino}`);
    return true;
  }

  /**
   * Valida un código MFA
   * @param {number} idMFA - ID del MFA
   * @param {string} codigo - Código a validar
   * @returns {Promise<boolean>}
   */
  static async validarCodigo(idMFA, codigo) {
    const sql = `
      SELECT * FROM MFA
      WHERE idMFA = ? AND codigo = ? AND (usado = 0 OR usado IS NULL)
    `;

    try {
      const mfa = await database.get(sql, [idMFA, codigo]);

      if (!mfa) {
        return false;
      }

      // Verificar expiración
      const ahora = new Date();
      const fechaExpiracion = new Date(mfa.fechaExpiracion);

      if (ahora > fechaExpiracion) {
        return false;
      }

      // Marcar código como usado en lugar de eliminarlo
      await database.run('UPDATE MFA SET usado = 1 WHERE idMFA = ?', [idMFA]);

      return true;
    } catch (error) {
      throw new Error(`Error al validar código: ${error.message}`);
    }
  }

  /**
   * Obtiene los métodos MFA configurados para un usuario
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<Array>}
   */
  static async obtenerMetodosPorUsuario(idUsuario) {
    const sql = `
      SELECT DISTINCT tipo FROM MFA
      WHERE idUsuario = ?
    `;

    try {
      return await database.all(sql, [idUsuario]);
    } catch (error) {
      throw new Error(`Error al obtener métodos MFA: ${error.message}`);
    }
  }

  /**
   * Obtiene un MFA pendiente de validación
   * @param {number} idUsuario - ID del usuario
   * @param {string} tipo - Tipo de MFA
   * @returns {Promise<Object>}
   */
  static async obtenerPendiente(idUsuario, tipo) {
    const sql = `
      SELECT * FROM MFA
      WHERE idUsuario = ? AND tipo = ?
      AND fechaExpiracion > datetime('now')
      AND (usado = 0 OR usado IS NULL)
      ORDER BY fechaExpiracion DESC
      LIMIT 1
    `;

    try {
      return await database.get(sql, [idUsuario, tipo]);
    } catch (error) {
      throw new Error(`Error al obtener MFA pendiente: ${error.message}`);
    }
  }

  /**
   * Obtiene el MFA más reciente por usuario (cualquier tipo)
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<Object>}
   */
  static async obtenerMFAPorUsuario(idUsuario) {
    const sql = `
      SELECT * FROM MFA
      WHERE idUsuario = ?
      AND fechaExpiracion > datetime('now')
      AND (usado = 0 OR usado IS NULL)
      ORDER BY idMFA DESC
      LIMIT 1
    `;

    try {
      return await database.get(sql, [idUsuario]);
    } catch (error) {
      throw new Error(`Error al obtener MFA por usuario: ${error.message}`);
    }
  }
}

module.exports = MFA;
