const database = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Modelo RespuestasSeguridad
 * Gestiona las respuestas a preguntas de seguridad
 */
class RespuestasSeguridad {
  /**
   * Crea una respuesta a una pregunta de seguridad
   * @param {number} idPregunta - ID de la pregunta
   * @param {string} respuesta - Respuesta del usuario
   * @returns {Promise<Object>}
   */
  static async crear(idPregunta, respuesta) {
    // Normalizar respuesta (minúsculas, sin espacios extra)
    const respuestaNormalizada = respuesta.toLowerCase().trim();

    // Hash de la respuesta para mayor seguridad
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const respuestaHash = await bcrypt.hash(respuestaNormalizada, saltRounds);

    const sql = `
      INSERT INTO RespuestasSeguridad (idPregunta, respuesta)
      VALUES (?, ?)
    `;

    try {
      const result = await database.run(sql, [idPregunta, respuestaHash]);

      return {
        idRespuesta: result.lastID,
        idPregunta: idPregunta
      };
    } catch (error) {
      throw new Error(`Error al crear respuesta: ${error.message}`);
    }
  }

  /**
   * Valida una respuesta de seguridad
   * @param {number} idPregunta - ID de la pregunta
   * @param {string} respuesta - Respuesta a validar
   * @returns {Promise<boolean>}
   */
  static async validar(idPregunta, respuesta) {
    const sql = `
      SELECT * FROM RespuestasSeguridad
      WHERE idPregunta = ?
    `;

    try {
      const respuestaGuardada = await database.get(sql, [idPregunta]);

      if (!respuestaGuardada) {
        return false;
      }

      // Normalizar respuesta ingresada
      const respuestaNormalizada = respuesta.toLowerCase().trim();

      // Comparar con bcrypt
      return await bcrypt.compare(respuestaNormalizada, respuestaGuardada.respuesta);
    } catch (error) {
      throw new Error(`Error al validar respuesta: ${error.message}`);
    }
  }

  /**
   * Obtiene la respuesta asociada a una pregunta
   * @param {number} idPregunta - ID de la pregunta
   * @returns {Promise<Object>}
   */
  static async obtenerPorPregunta(idPregunta) {
    const sql = `SELECT * FROM RespuestasSeguridad WHERE idPregunta = ?`;

    try {
      return await database.get(sql, [idPregunta]);
    } catch (error) {
      throw new Error(`Error al obtener respuesta: ${error.message}`);
    }
  }

  /**
   * Actualiza una respuesta de seguridad
   * @param {number} idPregunta - ID de la pregunta
   * @param {string} nuevaRespuesta - Nueva respuesta
   * @returns {Promise<boolean>}
   */
  static async actualizar(idPregunta, nuevaRespuesta) {
    const respuestaNormalizada = nuevaRespuesta.toLowerCase().trim();
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const respuestaHash = await bcrypt.hash(respuestaNormalizada, saltRounds);

    const sql = `
      UPDATE RespuestasSeguridad
      SET respuesta = ?
      WHERE idPregunta = ?
    `;

    try {
      await database.run(sql, [respuestaHash, idPregunta]);
      return true;
    } catch (error) {
      throw new Error(`Error al actualizar respuesta: ${error.message}`);
    }
  }

  /**
   * Elimina una respuesta de seguridad
   * @param {number} idPregunta - ID de la pregunta
   * @returns {Promise<boolean>}
   */
  static async eliminar(idPregunta) {
    const sql = `DELETE FROM RespuestasSeguridad WHERE idPregunta = ?`;

    try {
      await database.run(sql, [idPregunta]);
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar respuesta: ${error.message}`);
    }
  }
}

module.exports = RespuestasSeguridad;
