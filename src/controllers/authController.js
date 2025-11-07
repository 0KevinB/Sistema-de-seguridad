const authService = require('../services/authService');
const mfaService = require('../services/mfaService');
const Usuario = require('../models/Usuario');
const TokenRecuperacion = require('../models/TokenRecuperacion');
const Auditoria = require('../models/Auditoria');
const emailService = require('../services/emailService');

/**
 * Controlador de autenticación
 * Maneja login, logout, MFA y recuperación de contraseña
 */
class AuthController {
  /**
   * Login - Primer factor
   * POST /api/auth/login
   */
  async login(req, res) {
    try {
      const { usuario, contrasena } = req.body;
      const ipOrigen = req.ip || req.connection.remoteAddress;

      const resultado = await authService.login(usuario, contrasena, ipOrigen);

      res.json(resultado);
    } catch (error) {
      res.status(400).json({
        success: false,
        mensaje: error.message
      });
    }
  }

  /**
   * Solicitar código MFA por email
   * POST /api/auth/mfa/email
   */
  async solicitarCodigoEmail(req, res) {
    try {
      const { idUsuario } = req.body;

      const resultado = await mfaService.solicitarCodigoEmail(idUsuario);

      res.json(resultado);
    } catch (error) {
      res.status(400).json({
        success: false,
        mensaje: error.message
      });
    }
  }

  /**
   * Solicitar código MFA por SMS
   * POST /api/auth/mfa/sms
   */
  async solicitarCodigoSMS(req, res) {
    try {
      const { idUsuario } = req.body;

      const resultado = await mfaService.solicitarCodigoSMS(idUsuario);

      res.json(resultado);
    } catch (error) {
      res.status(400).json({
        success: false,
        mensaje: error.message
      });
    }
  }

  /**
   * Validar código MFA y completar login
   * POST /api/auth/mfa/validar
   */
  async validarMFA(req, res) {
    try {
      const { idMFA, codigo, idUsuario } = req.body;

      // Validar código
      const codigoValido = await mfaService.validarCodigo(idMFA, codigo);

      if (!codigoValido) {
        return res.status(400).json({
          success: false,
          mensaje: 'Código inválido o expirado'
        });
      }

      // Completar login
      const resultado = await authService.completarLogin(idUsuario);

      res.json(resultado);
    } catch (error) {
      res.status(400).json({
        success: false,
        mensaje: error.message
      });
    }
  }

  /**
   * Validar preguntas de seguridad y completar login
   * POST /api/auth/mfa/preguntas/validar
   */
  async validarPreguntas(req, res) {
    try {
      const { idUsuario, respuestas } = req.body;

      const validas = await mfaService.validarPreguntas(idUsuario, respuestas);

      if (!validas) {
        return res.status(400).json({
          success: false,
          mensaje: 'Respuestas incorrectas'
        });
      }

      const resultado = await authService.completarLogin(idUsuario);

      res.json(resultado);
    } catch (error) {
      res.status(400).json({
        success: false,
        mensaje: error.message
      });
    }
  }

  /**
   * Validar dispositivo USB y completar login
   * POST /api/auth/mfa/usb/validar
   */
  async validarUSB(req, res) {
    try {
      const { idUsuario, identificador } = req.body;

      const valido = await mfaService.validarDispositivoUSB(idUsuario, identificador);

      if (!valido) {
        return res.status(400).json({
          success: false,
          mensaje: 'Dispositivo no válido o no registrado'
        });
      }

      const resultado = await authService.completarLogin(idUsuario);

      res.json(resultado);
    } catch (error) {
      res.status(400).json({
        success: false,
        mensaje: error.message
      });
    }
  }

  /**
   * Logout
   * POST /api/auth/logout
   */
  async logout(req, res) {
    try {
      const { idUsuario, idSession } = req.usuario ? req : req.body;

      await authService.logout(idUsuario, idSession);

      res.json({
        success: true,
        mensaje: 'Sesión cerrada correctamente'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        mensaje: error.message
      });
    }
  }

  /**
   * Solicitar recuperación de contraseña
   * POST /api/auth/recuperar
   */
  async solicitarRecuperacion(req, res) {
    try {
      const { email } = req.body;

      // Buscar usuario
      const usuario = await Usuario.recuperarContrasena(email);

      if (!usuario) {
        // Por seguridad, siempre responder que se envió el email
        return res.json({
          success: true,
          mensaje: 'Si el email existe, recibirás instrucciones de recuperación'
        });
      }

      // Generar token
      const token = await TokenRecuperacion.crear(usuario.idUsuario);

      // Enviar email
      await emailService.enviarRecuperacion(email, token.token, usuario.Usuario);

      await Auditoria.generarRegistro(
        usuario.idUsuario,
        'RECUPERACION_CONTRASENA - Token enviado'
      );

      res.json({
        success: true,
        mensaje: 'Si el email existe, recibirás instrucciones de recuperación'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        mensaje: error.message
      });
    }
  }

  /**
   * Restablecer contraseña con token
   * POST /api/auth/reset-password/:token
   */
  async restablecerContrasena(req, res) {
    try {
      const { token } = req.params;
      const { nuevaContrasena } = req.body;

      // Validar token
      const tokenData = await TokenRecuperacion.validarToken(token);

      if (!tokenData) {
        return res.status(400).json({
          success: false,
          mensaje: 'Token inválido o expirado'
        });
      }

      // Cambiar contraseña
      await Usuario.cambiarContrasena(tokenData.idUsuario, nuevaContrasena);

      // Marcar token como usado
      await TokenRecuperacion.actualizarEstado(token);

      await Auditoria.generarRegistro(
        tokenData.idUsuario,
        'CAMBIO_CONTRASENA - Recuperación exitosa'
      );

      res.json({
        success: true,
        mensaje: 'Contraseña restablecida correctamente'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        mensaje: error.message
      });
    }
  }

  /**
   * Verificar sesión actual
   * GET /api/auth/verificar
   */
  async verificarSesion(req, res) {
    try {
      res.json({
        success: true,
        usuario: req.usuario,
        mensaje: 'Sesión válida'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        mensaje: error.message
      });
    }
  }

  /**
   * Obtener preguntas de seguridad de un usuario
   * POST /api/auth/preguntas-seguridad
   */
  async obtenerPreguntasSeguridad(req, res) {
    try {
      const { idUsuario } = req.body;

      const preguntas = await mfaService.obtenerPreguntasUsuario(idUsuario);

      if (!preguntas || preguntas.length === 0) {
        return res.status(404).json({
          success: false,
          mensaje: 'No hay preguntas de seguridad configuradas'
        });
      }

      // Seleccionar 2 preguntas aleatorias si hay más de 2
      let preguntasSeleccionadas = preguntas;
      if (preguntas.length > 2) {
        preguntasSeleccionadas = [];
        const indices = [];
        while (preguntasSeleccionadas.length < 2) {
          const randomIndex = Math.floor(Math.random() * preguntas.length);
          if (!indices.includes(randomIndex)) {
            indices.push(randomIndex);
            preguntasSeleccionadas.push(preguntas[randomIndex]);
          }
        }
      }

      res.json({
        success: true,
        preguntas: preguntasSeleccionadas.map(p => ({
          idPregunta: p.idPregunta,
          pregunta: p.pregunta
        }))
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        mensaje: error.message
      });
    }
  }
}

module.exports = new AuthController();
