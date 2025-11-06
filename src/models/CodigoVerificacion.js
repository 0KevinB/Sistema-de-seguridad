const database = require('../config/database');
const crypto = require('crypto');

/**
 * Modelo CodigoVerificacion
 * Gestiona códigos de verificación enviados por email o SMS
 */
class CodigoVerificacion {
  /**
   * Genera un código de verificación
   * @returns {string} Código de 6 dígitos
   */
  static generarCodigo() {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Crea un nuevo código de verificación
   * @param {number} idMFA - ID del MFA asociado
   * @param {string} canal - Canal de envío (email o sms)
   * @returns {Promise<Object>}
   */
  static async crear(idMFA, canal) {
    const canalesValidos = ['email', 'sms'];

    if (!canalesValidos.includes(canal)) {
      throw new Error('Canal no válido');
    }

    const codigo = this.generarCodigo();
    const expiracion = parseInt(process.env.MFA_CODE_EXPIRATION) || 5;

    const fechaExpiracion = new Date();
    fechaExpiracion.setMinutes(fechaExpiracion.getMinutes() + expiracion);

    const sql = `
      INSERT INTO CodigoVerificacion (idMFA, codigo, canal, fechaExpiracion, usado)
      VALUES (?, ?, ?, ?, 0)
    `;

    try {
      const result = await database.run(sql, [
        idMFA,
        codigo,
        canal,
        fechaExpiracion.toISOString()
      ]);

      return {
        idCodigo: result.lastID,
        codigo: codigo,
        canal: canal,
        fechaExpiracion: fechaExpiracion
      };
    } catch (error) {
      throw new Error(`Error al crear código: ${error.message}`);
    }
  }

  /**
   * Determina el tipo de canal según el destino
   * @param {string} destino - Email o teléfono
   * @returns {string} Tipo de canal
   */
  static tipoCanal(destino) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(destino) ? 'email' : 'sms';
  }

  /**
   * Envía el código por el canal especificado
   * @param {number} idCodigo - ID del código
   * @param {string} destino - Email o teléfono de destino
   * @returns {Promise<boolean>}
   */
  static async enviarMSG(idCodigo, destino) {
    // Esta función se integrará con servicios de email/SMS reales
    console.log(`Enviando código ${idCodigo} a ${destino}`);
    return true;
  }

  /**
   * Valida un código de verificación
   * @param {number} idMFA - ID del MFA
   * @param {string} codigo - Código a validar
   * @returns {Promise<boolean>}
   */
  static async validar(idMFA, codigo) {
    const sql = `
      SELECT * FROM CodigoVerificacion
      WHERE idMFA = ? AND codigo = ? AND usado = 0
    `;

    try {
      const codigoData = await database.get(sql, [idMFA, codigo]);

      if (!codigoData) {
        return false;
      }

      // Verificar expiración
      const ahora = new Date();
      const fechaExpiracion = new Date(codigoData.fechaExpiracion);

      if (ahora > fechaExpiracion) {
        return false;
      }

      // Marcar como usado
      await database.run(
        'UPDATE CodigoVerificacion SET usado = 1 WHERE idCodigo = ?',
        [codigoData.idCodigo]
      );

      return true;
    } catch (error) {
      throw new Error(`Error al validar código: ${error.message}`);
    }
  }

  /**
   * Invalida todos los códigos de un MFA
   * @param {number} idMFA - ID del MFA
   * @returns {Promise<boolean>}
   */
  static async invalidarCodigos(idMFA) {
    const sql = `UPDATE CodigoVerificacion SET usado = 1 WHERE idMFA = ?`;

    try {
      await database.run(sql, [idMFA]);
      return true;
    } catch (error) {
      throw new Error(`Error al invalidar códigos: ${error.message}`);
    }
  }
}

module.exports = CodigoVerificacion;
