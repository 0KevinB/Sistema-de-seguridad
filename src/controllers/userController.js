const Usuario = require('../models/Usuario');
const MFA = require('../models/MFA');
const Auditoria = require('../models/Auditoria');
const emailService = require('../services/emailService');
const mfaService = require('../services/mfaService');
const CodigoVerificacion = require('../models/CodigoVerificacion');

/**
 * Controlador de usuarios
 * Maneja registro, actualización y gestión de usuarios
 */
class UserController {
  /**
   * Registrar nuevo usuario
   * POST /api/users/registro
   * RS1: Registro con validación de email/celular
   */
  async registro(req, res) {
    try {
      const { nombres, apellidos, email, telefono, rol } = req.body;

      // Validar datos
      const validacion = Usuario.validarDatos({ nombres, apellidos, email, telefono });

      if (!validacion.valido) {
        return res.status(400).json({
          success: false,
          mensaje: 'Datos inválidos',
          errores: validacion.errores
        });
      }

      // Validar rol si se proporciona
      if (rol && !['admin', 'user'].includes(rol)) {
        return res.status(400).json({
          success: false,
          mensaje: 'Rol inválido. Debe ser "admin" o "user"'
        });
      }

      // Verificar si el email ya existe
      const usuarioExistente = await Usuario.buscarPorEmail(email);

      if (usuarioExistente) {
        return res.status(400).json({
          success: false,
          mensaje: 'El email ya está registrado'
        });
      }

      // Registrar usuario (por defecto será 'user' si no se especifica)
      const nuevoUsuario = await Usuario.registro({ nombres, apellidos, email, telefono, rol });

      // Enviar credenciales por email
      await emailService.enviarCredenciales(
        email,
        nuevoUsuario.usuario,
        nuevoUsuario.contrasenaTemp
      );

      // Crear código de validación
      const codigo = MFA.generarCodigo();
      const mfa = await MFA.crear(nuevoUsuario.idUsuario, 'email', codigo);
      await emailService.enviarValidacionCuenta(email, codigo);

      // Registrar en auditoría
      await Auditoria.generarRegistro(
        nuevoUsuario.idUsuario,
        'REGISTRO_USUARIO - Usuario creado'
      );

      res.status(201).json({
        success: true,
        mensaje: 'Usuario registrado. Verifica tu email para activar la cuenta.',
        datos: {
          idUsuario: nuevoUsuario.idUsuario,
          usuario: nuevoUsuario.usuario,
          contrasena: nuevoUsuario.contrasenaTemp,
          email: nuevoUsuario.email,
          rol: nuevoUsuario.rol,
          idMFA: mfa.idMFA,
          requiereValidacion: true
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        mensaje: error.message
      });
    }
  }

  /**
   * Validar cuenta con código
   * POST /api/users/validar-cuenta
   */
  async validarCuenta(req, res) {
    try {
      const { idUsuario, idMFA, codigo } = req.body;

      // Validar código
      const valido = await MFA.validarCodigo(idMFA, codigo);

      if (!valido) {
        return res.status(400).json({
          success: false,
          mensaje: 'Código inválido o expirado'
        });
      }

      // Activar usuario
      await Usuario.actualizarDatos(idUsuario, { estado: 1 });

      await Auditoria.generarRegistro(
        idUsuario,
        'VALIDACION_CUENTA - Cuenta activada'
      );

      res.json({
        success: true,
        mensaje: 'Cuenta validada correctamente. Ya puedes iniciar sesión.'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        mensaje: error.message
      });
    }
  }

  /**
   * Obtener perfil del usuario actual
   * GET /api/users/perfil
   */
  async obtenerPerfil(req, res) {
    try {
      const usuario = await Usuario.buscarPorId(req.usuario.idUsuario);

      if (!usuario) {
        return res.status(404).json({
          success: false,
          mensaje: 'Usuario no encontrado'
        });
      }

      // No enviar la contraseña
      delete usuario.Contrasena;

      res.json({
        success: true,
        usuario: usuario
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        mensaje: error.message
      });
    }
  }

  /**
   * Actualizar datos del usuario
   * PUT /api/users/perfil
   */
  async actualizarPerfil(req, res) {
    try {
      const { nombres, apellidos, telefono } = req.body;

      await Usuario.actualizarDatos(req.usuario.idUsuario, {
        nombres,
        apellidos,
        telefono
      });

      await Auditoria.generarRegistro(
        req.usuario.idUsuario,
        'ACTUALIZACION_DATOS - Perfil actualizado'
      );

      res.json({
        success: true,
        mensaje: 'Perfil actualizado correctamente'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        mensaje: error.message
      });
    }
  }

  /**
   * Cambiar contraseña
   * POST /api/users/cambiar-contrasena
   */
  async cambiarContrasena(req, res) {
    try {
      const { contrasenaActual, nuevaContrasena } = req.body;

      // Verificar contraseña actual
      const usuario = await Usuario.buscarPorId(req.usuario.idUsuario);
      const contrasenaValida = await Usuario.verificarContrasena(
        contrasenaActual,
        usuario.Contrasena
      );

      if (!contrasenaValida) {
        return res.status(400).json({
          success: false,
          mensaje: 'Contraseña actual incorrecta'
        });
      }

      // Cambiar contraseña
      await Usuario.cambiarContrasena(req.usuario.idUsuario, nuevaContrasena);

      await Auditoria.generarRegistro(
        req.usuario.idUsuario,
        'CAMBIO_CONTRASENA - Contraseña cambiada'
      );

      res.json({
        success: true,
        mensaje: 'Contraseña cambiada correctamente'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        mensaje: error.message
      });
    }
  }

  /**
   * Configurar método MFA
   * POST /api/users/mfa/configurar
   */
  async configurarMFA(req, res) {
    try {
      const { tipo, datos } = req.body;

      let resultado;

      switch (tipo) {
        case 'preguntas':
          resultado = await mfaService.configurarPreguntas(
            req.usuario.idUsuario,
            datos.preguntasRespuestas
          );
          break;

        case 'usb':
          resultado = await mfaService.registrarDispositivoUSB(
            req.usuario.idUsuario,
            datos.identificador,
            datos.nombre
          );
          break;

        default:
          return res.status(400).json({
            success: false,
            mensaje: 'Tipo de MFA no válido'
          });
      }

      res.json(resultado);
    } catch (error) {
      res.status(400).json({
        success: false,
        mensaje: error.message
      });
    }
  }

  /**
   * Obtener métodos MFA del usuario
   * GET /api/users/mfa/metodos
   */
  async obtenerMetodosMFA(req, res) {
    try {
      const metodos = await mfaService.obtenerMetodosDisponibles(req.usuario.idUsuario);

      res.json({
        success: true,
        metodos: metodos
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        mensaje: error.message
      });
    }
  }

  /**
   * Obtener sesiones del usuario
   * GET /api/users/sesiones
   */
  async obtenerSesiones(req, res) {
    try {
      const Session = require('../models/Session');
      const sesiones = await Session.obtenerSessionesPorUsuario(req.usuario.idUsuario);

      res.json({
        success: true,
        sesiones: sesiones,
        sessionActual: req.usuario.idSession
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        mensaje: error.message
      });
    }
  }

  /**
   * Cerrar una sesión específica
   * POST /api/users/sesiones/cerrar/:idSession
   */
  async cerrarSesionRemota(req, res) {
    try {
      const { idSession } = req.params;
      const Session = require('../models/Session');
      const Auditoria = require('../models/Auditoria');

      // Verificar que la sesión pertenezca al usuario
      const session = await Session.obtenerSessionActiva(req.usuario.idUsuario);

      await Session.cerrarSession(idSession);

      await Auditoria.generarRegistro(
        req.usuario.idUsuario,
        `SESION_CERRADA_REMOTA - idSession: ${idSession}`
      );

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
}

module.exports = new UserController();
