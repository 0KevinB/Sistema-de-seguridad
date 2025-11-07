const database = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Modelo PreguntasSeguridad
 * Gestiona preguntas de seguridad para MFA
 */
class PreguntasSeguridad {
  /**
   * Preguntas predefinidas disponibles
   */
  static PREGUNTAS_DISPONIBLES = [
    '¿Cuál es el nombre de tu primera mascota?',
    '¿En qué ciudad naciste?',
    '¿Cuál es el nombre de tu mejor amigo de la infancia?',
    '¿Cuál es tu comida favorita?',
    '¿Cuál es el apellido de soltera de tu madre?',
    '¿En qué escuela estudiaste la primaria?',
    '¿Cuál fue tu primer trabajo?',
    '¿Cuál es tu película favorita?'
  ];

  /**
   * Crea una pregunta de seguridad para un usuario
   * @param {number} idMFA - ID del MFA
   * @param {string} pregunta - Texto de la pregunta
   * @returns {Promise<Object>}
   */
  static async crear(idMFA, pregunta) {
    const sql = `
      INSERT INTO PreguntasSeguridad (idMFA, pregunta, estado, fechaCreacion)
      VALUES (?, ?, 1, CURRENT_TIMESTAMP)
    `;

    try {
      const result = await database.run(sql, [idMFA, pregunta]);

      return {
        idPregunta: result.lastID,
        pregunta: pregunta,
        estado: true
      };
    } catch (error) {
      throw new Error(`Error al crear pregunta: ${error.message}`);
    }
  }

  /**
   * Obtiene las preguntas de seguridad de un MFA
   * @param {number} idMFA - ID del MFA
   * @returns {Promise<Array>}
   */
  static async obtenerPreguntas(idMFA) {
    const sql = `
      SELECT * FROM PreguntasSeguridad
      WHERE idMFA = ? AND estado = 1
      ORDER BY fechaCreacion DESC
    `;

    try {
      return await database.all(sql, [idMFA]);
    } catch (error) {
      throw new Error(`Error al obtener preguntas: ${error.message}`);
    }
  }

  /**
   * Obtiene una pregunta específica
   * @param {number} idPregunta - ID de la pregunta
   * @returns {Promise<Object>}
   */
  static async obtenerPorId(idPregunta) {
    const sql = `SELECT * FROM PreguntasSeguridad WHERE idPregunta = ?`;

    try {
      return await database.get(sql, [idPregunta]);
    } catch (error) {
      throw new Error(`Error al obtener pregunta: ${error.message}`);
    }
  }

  /**
   * Desactiva una pregunta de seguridad
   * @param {number} idPregunta - ID de la pregunta
   * @returns {Promise<boolean>}
   */
  static async desactivar(idPregunta) {
    const sql = `UPDATE PreguntasSeguridad SET estado = 0 WHERE idPregunta = ?`;

    try {
      await database.run(sql, [idPregunta]);
      return true;
    } catch (error) {
      throw new Error(`Error al desactivar pregunta: ${error.message}`);
    }
  }

  /**
   * Obtiene las preguntas disponibles del sistema
   * @returns {Array<string>}
   */
  static obtenerPreguntasDisponibles() {
    return this.PREGUNTAS_DISPONIBLES;
  }

  /**
   * Obtiene las preguntas de seguridad configuradas por un usuario
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<Array>}
   */
  static async obtenerPreguntasPorUsuario(idUsuario) {
    const sql = `
      SELECT p.idPregunta, p.pregunta, p.idMFA
      FROM PreguntasSeguridad p
      INNER JOIN MFA m ON p.idMFA = m.idMFA
      WHERE m.idUsuario = ? AND p.estado = 1 AND m.tipo = 'pregunta'
      ORDER BY p.fechaCreacion DESC
    `;

    try {
      return await database.all(sql, [idUsuario]);
    } catch (error) {
      throw new Error(`Error al obtener preguntas del usuario: ${error.message}`);
    }
  }
}

module.exports = PreguntasSeguridad;
