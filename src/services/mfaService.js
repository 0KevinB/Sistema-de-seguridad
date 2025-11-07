const MFA = require('../models/MFA');
const CodigoVerificacion = require('../models/CodigoVerificacion');
const PreguntasSeguridad = require('../models/PreguntasSeguridad');
const RespuestasSeguridad = require('../models/RespuestasSeguridad');
const DispositivoUSB = require('../models/DispositivoUSB');
const emailService = require('./emailService');
const Usuario = require('../models/Usuario');
const Auditoria = require('../models/Auditoria');

/**
 * Servicio MFA (Multi-Factor Authentication)
 * RS2: Control de ingreso con segundo factor
 */
class MFAService {
  /**
   * Solicita un código MFA por email
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<Object>}
   */
  async solicitarCodigoEmail(idUsuario) {
    try {
      // Obtener datos del usuario
      const usuario = await Usuario.buscarPorId(idUsuario);

      if (!usuario || !usuario.email) {
        throw new Error('Usuario no encontrado o sin email');
      }

      // Generar código
      const codigo = MFA.generarCodigo();

      // Crear registro MFA
      const mfa = await MFA.crear(idUsuario, 'email', codigo);

      // Crear código de verificación
      await CodigoVerificacion.crear(mfa.idMFA, 'email');

      // Enviar email
      await emailService.enviarCodigoMFA(usuario.email, codigo);

      await Auditoria.generarRegistro(
        idUsuario,
        'SOLICITUD_MFA - Código enviado por email'
      );

      return {
        success: true,
        idMFA: mfa.idMFA,
        mensaje: 'Código enviado a tu email',
        expiracion: mfa.fechaExpiracion
      };
    } catch (error) {
      throw new Error(`Error al solicitar código: ${error.message}`);
    }
  }

  /**
   * Solicita un código MFA por SMS
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<Object>}
   */
  async solicitarCodigoSMS(idUsuario) {
    try {
      const usuario = await Usuario.buscarPorId(idUsuario);

      if (!usuario || !usuario.telefono) {
        throw new Error('Usuario no encontrado o sin teléfono');
      }

      const codigo = MFA.generarCodigo();
      const mfa = await MFA.crear(idUsuario, 'sms', codigo);

      await CodigoVerificacion.crear(mfa.idMFA, 'sms');

      // TODO: Integrar con servicio de SMS (Twilio, etc.)
      console.log(`[SMS] Código ${codigo} enviado a ${usuario.telefono}`);

      await Auditoria.generarRegistro(
        idUsuario,
        'SOLICITUD_MFA - Código enviado por SMS'
      );

      return {
        success: true,
        idMFA: mfa.idMFA,
        mensaje: 'Código enviado a tu teléfono',
        expiracion: mfa.fechaExpiracion
      };
    } catch (error) {
      throw new Error(`Error al solicitar código SMS: ${error.message}`);
    }
  }

  /**
   * Valida un código MFA
   * @param {number} idMFA - ID del MFA
   * @param {string} codigo - Código a validar
   * @returns {Promise<boolean>}
   */
  async validarCodigo(idMFA, codigo) {
    try {
      const valido = await MFA.validarCodigo(idMFA, codigo);

      if (valido) {
        await Auditoria.generarRegistro(
          null,
          'VALIDACION_MFA - Código validado correctamente'
        );
      }

      return valido;
    } catch (error) {
      throw new Error(`Error al validar código: ${error.message}`);
    }
  }

  /**
   * Configura preguntas de seguridad para un usuario
   * @param {number} idUsuario - ID del usuario
   * @param {Array} preguntasRespuestas - Array de {pregunta, respuesta}
   * @returns {Promise<Object>}
   */
  async configurarPreguntas(idUsuario, preguntasRespuestas) {
    try {
      // Crear MFA tipo pregunta
      const mfa = await MFA.crear(idUsuario, 'pregunta', null);

      const preguntasCreadas = [];

      for (const item of preguntasRespuestas) {
        // Crear pregunta
        const pregunta = await PreguntasSeguridad.crear(
          mfa.idMFA,
          item.pregunta
        );

        // Crear respuesta
        await RespuestasSeguridad.crear(pregunta.idPregunta, item.respuesta);

        preguntasCreadas.push(pregunta);
      }

      await Auditoria.generarRegistro(
        idUsuario,
        'CONFIGURACION_MFA - Preguntas de seguridad configuradas'
      );

      return {
        success: true,
        idMFA: mfa.idMFA,
        preguntas: preguntasCreadas
      };
    } catch (error) {
      throw new Error(`Error al configurar preguntas: ${error.message}`);
    }
  }

  /**
   * Valida respuestas a preguntas de seguridad
   * @param {number} idUsuario - ID del usuario
   * @param {Array} respuestas - Array de {idPregunta, respuesta}
   * @returns {Promise<boolean>}
   */
  async validarPreguntas(idUsuario, respuestas) {
    try {
      let todasCorrectas = true;

      for (const item of respuestas) {
        const valida = await RespuestasSeguridad.validar(
          item.idPregunta,
          item.respuesta
        );

        if (!valida) {
          todasCorrectas = false;
          break;
        }
      }

      if (todasCorrectas) {
        await Auditoria.generarRegistro(
          idUsuario,
          'VALIDACION_MFA - Preguntas validadas correctamente'
        );
      }

      return todasCorrectas;
    } catch (error) {
      throw new Error(`Error al validar preguntas: ${error.message}`);
    }
  }

  /**
   * Registra un dispositivo USB
   * @param {number} idUsuario - ID del usuario
   * @param {string} identificador - Identificador del dispositivo
   * @param {string} nombre - Nombre del dispositivo
   * @returns {Promise<Object>}
   */
  async registrarDispositivoUSB(idUsuario, identificador, nombre) {
    try {
      // Crear MFA tipo USB
      const mfa = await MFA.crear(idUsuario, 'usb', null);

      // Registrar dispositivo
      const dispositivo = await DispositivoUSB.registrar(
        mfa.idMFA,
        identificador,
        nombre
      );

      await Auditoria.generarRegistro(
        idUsuario,
        `CONFIGURACION_MFA - Dispositivo USB registrado: ${nombre}`
      );

      return {
        success: true,
        idMFA: mfa.idMFA,
        dispositivo: dispositivo
      };
    } catch (error) {
      throw new Error(`Error al registrar dispositivo: ${error.message}`);
    }
  }

  /**
   * Valida un dispositivo USB
   * @param {number} idUsuario - ID del usuario
   * @param {string} identificador - Identificador del dispositivo
   * @returns {Promise<boolean>}
   */
  async validarDispositivoUSB(idUsuario, identificador) {
    try {
      // Obtener MFA del usuario
      const mfaPendiente = await MFA.obtenerPendiente(idUsuario, 'usb');

      if (!mfaPendiente) {
        return false;
      }

      const valido = await DispositivoUSB.validar(
        mfaPendiente.idMFA,
        identificador
      );

      if (valido) {
        await Auditoria.generarRegistro(
          idUsuario,
          'VALIDACION_MFA - Dispositivo USB validado'
        );
      }

      return valido;
    } catch (error) {
      throw new Error(`Error al validar dispositivo: ${error.message}`);
    }
  }

  /**
   * Obtiene los métodos MFA disponibles para un usuario
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<Array>}
   */
  async obtenerMetodosDisponibles(idUsuario) {
    try {
      return await MFA.obtenerMetodosPorUsuario(idUsuario);
    } catch (error) {
      throw new Error(`Error al obtener métodos: ${error.message}`);
    }
  }

  /**
   * Obtiene las preguntas de seguridad de un usuario
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<Array>}
   */
  async obtenerPreguntasUsuario(idUsuario) {
    try {
      return await PreguntasSeguridad.obtenerPreguntasPorUsuario(idUsuario);
    } catch (error) {
      throw new Error(`Error al obtener preguntas del usuario: ${error.message}`);
    }
  }
}

module.exports = new MFAService();
