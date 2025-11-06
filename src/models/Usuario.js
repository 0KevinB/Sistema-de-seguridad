const database = require('../config/database');
const bcrypt = require('bcryptjs');
const { generarUsuario } = require('../utils/generators');

/**
 * Modelo Usuario
 * Gestiona todas las operaciones relacionadas con usuarios
 */
class Usuario {
  /**
   * Registra un nuevo usuario en el sistema
   * RS1: El sistema proporcionará el usuario y contraseña
   * @param {Object} datos - Datos del usuario
   * @returns {Promise<Object>} Usuario creado con credenciales
   */
  static async registro(datos) {
    const { nombres, apellidos, email, telefono } = datos;

    // Generar usuario automáticamente
    const usuario = generarUsuario(nombres, apellidos);

    // Generar contraseña temporal
    const contrasenaTemp = Math.random().toString(36).slice(-10) +
                           Math.random().toString(36).slice(-10).toUpperCase() +
                           '123!';

    // Hash de la contraseña
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const contrasenaHash = await bcrypt.hash(contrasenaTemp, saltRounds);

    const sql = `
      INSERT INTO Usuario (nombres, apellidos, email, telefono, Usuario, Contrasena, estado)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `;

    try {
      const result = await database.run(sql, [
        nombres,
        apellidos,
        email,
        telefono,
        usuario,
        contrasenaHash
      ]);

      return {
        idUsuario: result.lastID,
        usuario: usuario,
        contrasenaTemp: contrasenaTemp,
        email: email
      };
    } catch (error) {
      throw new Error(`Error al registrar usuario: ${error.message}`);
    }
  }

  /**
   * Valida los datos de entrada del usuario
   * @param {Object} datos - Datos a validar
   * @returns {Object} Resultado de validación
   */
  static validarDatos(datos) {
    const errores = [];

    if (!datos.nombres || datos.nombres.trim().length < 2) {
      errores.push('Nombres debe tener al menos 2 caracteres');
    }

    if (!datos.apellidos || datos.apellidos.trim().length < 2) {
      errores.push('Apellidos debe tener al menos 2 caracteres');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!datos.email || !emailRegex.test(datos.email)) {
      errores.push('Email inválido');
    }

    if (datos.telefono && !/^\d{10}$/.test(datos.telefono)) {
      errores.push('Teléfono debe tener 10 dígitos');
    }

    return {
      valido: errores.length === 0,
      errores: errores
    };
  }

  /**
   * Actualiza los datos de un usuario
   * @param {number} idUsuario - ID del usuario
   * @param {Object} datos - Nuevos datos
   * @returns {Promise<boolean>}
   */
  static async actualizarDatos(idUsuario, datos) {
    const campos = [];
    const valores = [];

    if (datos.nombres) {
      campos.push('nombres = ?');
      valores.push(datos.nombres);
    }

    if (datos.apellidos) {
      campos.push('apellidos = ?');
      valores.push(datos.apellidos);
    }

    if (datos.telefono) {
      campos.push('telefono = ?');
      valores.push(datos.telefono);
    }

    if (datos.estado !== undefined) {
      campos.push('estado = ?');
      valores.push(datos.estado);
    }

    if (campos.length === 0) {
      return false;
    }

    valores.push(idUsuario);

    const sql = `UPDATE Usuario SET ${campos.join(', ')} WHERE idUsuario = ?`;

    try {
      await database.run(sql, valores);
      return true;
    } catch (error) {
      throw new Error(`Error al actualizar usuario: ${error.message}`);
    }
  }

  /**
   * Inicia el proceso de recuperación de contraseña
   * RS4: Sistema debe permitir recuperar usuario/contraseña en base al correo
   * @param {string} email - Email del usuario
   * @returns {Promise<Object>} Información del usuario
   */
  static async recuperarContrasena(email) {
    const sql = `SELECT idUsuario, Usuario, nombres, apellidos FROM Usuario WHERE email = ?`;

    try {
      const usuario = await database.get(sql, [email]);
      return usuario;
    } catch (error) {
      throw new Error(`Error al recuperar contraseña: ${error.message}`);
    }
  }

  /**
   * Busca un usuario por email
   * @param {string} email - Email del usuario
   * @returns {Promise<Object>}
   */
  static async buscarPorEmail(email) {
    const sql = `SELECT * FROM Usuario WHERE email = ?`;
    return await database.get(sql, [email]);
  }

  /**
   * Busca un usuario por nombre de usuario
   * @param {string} usuario - Nombre de usuario
   * @returns {Promise<Object>}
   */
  static async buscarPorUsuario(usuario) {
    const sql = `SELECT * FROM Usuario WHERE Usuario = ?`;
    return await database.get(sql, [usuario]);
  }

  /**
   * Busca un usuario por ID
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<Object>}
   */
  static async buscarPorId(idUsuario) {
    const sql = `SELECT * FROM Usuario WHERE idUsuario = ?`;
    return await database.get(sql, [idUsuario]);
  }

  /**
   * Cambia la contraseña de un usuario
   * @param {number} idUsuario - ID del usuario
   * @param {string} nuevaContrasena - Nueva contraseña
   * @returns {Promise<boolean>}
   */
  static async cambiarContrasena(idUsuario, nuevaContrasena) {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const contrasenaHash = await bcrypt.hash(nuevaContrasena, saltRounds);

    const sql = `UPDATE Usuario SET Contrasena = ? WHERE idUsuario = ?`;

    try {
      await database.run(sql, [contrasenaHash, idUsuario]);
      return true;
    } catch (error) {
      throw new Error(`Error al cambiar contraseña: ${error.message}`);
    }
  }

  /**
   * Verifica la contraseña de un usuario
   * @param {string} contrasena - Contraseña a verificar
   * @param {string} hash - Hash almacenado
   * @returns {Promise<boolean>}
   */
  static async verificarContrasena(contrasena, hash) {
    return await bcrypt.compare(contrasena, hash);
  }
}

module.exports = Usuario;
