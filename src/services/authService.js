const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const Session = require('../models/Session');
const Acceso = require('../models/Acceso');
const Auditoria = require('../models/Auditoria');
const MFA = require('../models/MFA');
require('dotenv').config();

/**
 * Servicio de autenticación
 * Gestiona login, logout y validaciones de seguridad
 */
class AuthService {
  /**
   * Genera un JWT para un usuario
   * @param {Object} usuario - Datos del usuario
   * @returns {string} Token JWT
   */
  generarToken(usuario) {
    const payload = {
      idUsuario: usuario.idUsuario,
      usuario: usuario.Usuario,
      email: usuario.email
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    });
  }

  /**
   * Verifica un JWT
   * @param {string} token - Token a verificar
   * @returns {Object} Datos del token decodificado
   */
  verificarToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }

  /**
   * Inicia sesión con usuario y contraseña
   * RS6: Control de intentos de acceso
   * @param {string} usuario - Nombre de usuario
   * @param {string} contrasena - Contraseña
   * @param {string} ipOrigen - IP del cliente
   * @returns {Promise<Object>} Resultado del login
   */
  async login(usuario, contrasena, ipOrigen) {
    try {
      // Buscar usuario
      const usuarioData = await Usuario.buscarPorUsuario(usuario);

      if (!usuarioData) {
        throw new Error('Usuario o contraseña incorrectos');
      }

      // Verificar si la cuenta está bloqueada
      const bloqueada = await Acceso.estaBloqueada(usuarioData.idUsuario);

      if (bloqueada) {
        await Auditoria.generarRegistro(
          usuarioData.idUsuario,
          'LOGIN_FALLIDO - Cuenta bloqueada'
        );
        throw new Error('Cuenta bloqueada por múltiples intentos fallidos');
      }

      // Verificar contraseña
      const contrasenaValida = await Usuario.verificarContrasena(
        contrasena,
        usuarioData.Contrasena
      );

      if (!contrasenaValida) {
        // Registrar intento fallido
        const resultadoAcceso = await Acceso.registrarIntento(
          usuarioData.idUsuario,
          ipOrigen,
          false
        );

        await Auditoria.generarRegistro(
          usuarioData.idUsuario,
          `LOGIN_FALLIDO - Intentos: ${resultadoAcceso.intentosFallidos}`
        );

        if (resultadoAcceso.bloqueado) {
          await Auditoria.generarRegistro(
            usuarioData.idUsuario,
            'BLOQUEO_CUENTA - Máximo de intentos alcanzado'
          );
          throw new Error('Cuenta bloqueada por múltiples intentos fallidos');
        }

        throw new Error(
          `Usuario o contraseña incorrectos. Intentos restantes: ${resultadoAcceso.intentosRestantes}`
        );
      }

      // Verificar si el usuario está activo
      if (usuarioData.estado === 0) {
        throw new Error('Usuario inactivo. Debe validar su cuenta.');
      }

      // Login exitoso
      await Acceso.registrarIntento(usuarioData.idUsuario, ipOrigen, true);

      await Auditoria.generarRegistro(
        usuarioData.idUsuario,
        'LOGIN_EXITOSO - Primer factor'
      );

      return {
        success: true,
        requiereMFA: true,
        idUsuario: usuarioData.idUsuario,
        mensaje: 'Primer factor validado. Se requiere segundo factor.'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Completa el login después de validar MFA
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<Object>} Token y sesión
   */
  async completarLogin(idUsuario) {
    try {
      // Verificar número de sesiones activas
      const sesionesActivas = await Session.verificarNumeroSesiones(idUsuario);

      if (sesionesActivas > 0) {
        // Cerrar sesiones anteriores
        await Session.cerrarSessionesActivas(idUsuario);
      }

      // Crear nueva sesión
      const session = await Session.iniciarSession(idUsuario);

      // Obtener datos del usuario
      const usuario = await Usuario.buscarPorId(idUsuario);

      // Generar token JWT
      const token = this.generarToken(usuario);

      await Auditoria.generarRegistro(
        idUsuario,
        'LOGIN_EXITOSO - Segundo factor validado'
      );

      return {
        success: true,
        token: token,
        session: session,
        usuario: {
          idUsuario: usuario.idUsuario,
          usuario: usuario.Usuario,
          nombres: usuario.nombres,
          apellidos: usuario.apellidos,
          email: usuario.email
        }
      };
    } catch (error) {
      throw new Error(`Error al completar login: ${error.message}`);
    }
  }

  /**
   * Cierra sesión de un usuario
   * @param {number} idUsuario - ID del usuario
   * @param {number} idSession - ID de la sesión
   * @returns {Promise<boolean>}
   */
  async logout(idUsuario, idSession) {
    try {
      await Session.cerrarSession(idSession);
      await Auditoria.generarRegistro(idUsuario, 'LOGOUT');

      return true;
    } catch (error) {
      throw new Error(`Error al cerrar sesión: ${error.message}`);
    }
  }

  /**
   * Valida si una sesión está activa
   * @param {number} idSession - ID de la sesión
   * @returns {Promise<boolean>}
   */
  async validarSesion(idSession) {
    try {
      return await Session.validarSession(idSession);
    } catch (error) {
      throw new Error(`Error al validar sesión: ${error.message}`);
    }
  }
}

module.exports = new AuthService();
