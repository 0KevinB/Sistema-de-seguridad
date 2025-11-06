const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Servicio de envío de emails
 * RS1: Validación de correo electrónico
 * RS2: Envío de códigos de verificación
 * RS4: Recuperación de contraseña
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.configured = false;
  }

  /**
   * Configura el transportador de email
   */
  configure() {
    if (this.configured) return;

    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      this.configured = true;
      console.log('Servicio de email configurado');
    } catch (error) {
      console.error('Error al configurar email:', error.message);
      this.configured = false;
    }
  }

  /**
   * Envía un email de bienvenida con credenciales
   * @param {string} email - Email destino
   * @param {string} usuario - Nombre de usuario
   * @param {string} contrasena - Contraseña temporal
   * @returns {Promise<boolean>}
   */
  async enviarCredenciales(email, usuario, contrasena) {
    this.configure();

    if (!this.configured) {
      console.log('[MODO DESARROLLO] Email no configurado');
      console.log(`Credenciales: ${usuario} / ${contrasena}`);
      return true;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Bienvenido - Credenciales de Acceso',
      html: `
        <h2>Sistema de Seguridad</h2>
        <p>Tu cuenta ha sido creada exitosamente.</p>
        <p><strong>Usuario:</strong> ${usuario}</p>
        <p><strong>Contraseña temporal:</strong> ${contrasena}</p>
        <p>Por seguridad, te recomendamos cambiar tu contraseña después del primer inicio de sesión.</p>
        <br>
        <p>Si no solicitaste esta cuenta, ignora este mensaje.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error al enviar email:', error.message);
      return false;
    }
  }

  /**
   * Envía un código de verificación MFA
   * @param {string} email - Email destino
   * @param {string} codigo - Código de verificación
   * @returns {Promise<boolean>}
   */
  async enviarCodigoMFA(email, codigo) {
    this.configure();

    if (!this.configured) {
      console.log('[MODO DESARROLLO] Código MFA:', codigo);
      return true;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Código de Verificación',
      html: `
        <h2>Código de Verificación</h2>
        <p>Tu código de verificación es:</p>
        <h1 style="color: #4CAF50; font-size: 36px;">${codigo}</h1>
        <p>Este código expirará en ${process.env.MFA_CODE_EXPIRATION || 5} minutos.</p>
        <p>Si no solicitaste este código, ignora este mensaje.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error al enviar código MFA:', error.message);
      return false;
    }
  }

  /**
   * Envía un email de recuperación de contraseña
   * @param {string} email - Email destino
   * @param {string} token - Token de recuperación
   * @param {string} usuario - Nombre de usuario
   * @returns {Promise<boolean>}
   */
  async enviarRecuperacion(email, token, usuario) {
    this.configure();

    if (!this.configured) {
      console.log('[MODO DESARROLLO] Token de recuperación:', token);
      return true;
    }

    const enlaceRecuperacion = `http://localhost:${process.env.PORT || 3000}/api/auth/reset-password/${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Recuperación de Contraseña',
      html: `
        <h2>Recuperación de Contraseña</h2>
        <p>Hola ${usuario},</p>
        <p>Recibimos una solicitud para recuperar tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${enlaceRecuperacion}" style="
          background-color: #4CAF50;
          color: white;
          padding: 14px 20px;
          text-decoration: none;
          display: inline-block;
          border-radius: 4px;
        ">Restablecer Contraseña</a>
        <p>O copia y pega este enlace en tu navegador:</p>
        <p>${enlaceRecuperacion}</p>
        <p>Este enlace expirará en ${process.env.TOKEN_RECOVERY_EXPIRATION || 24} horas.</p>
        <p>Si no solicitaste este cambio, ignora este mensaje.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error al enviar email de recuperación:', error.message);
      return false;
    }
  }

  /**
   * Envía un email de validación de cuenta
   * @param {string} email - Email destino
   * @param {string} codigo - Código de validación
   * @returns {Promise<boolean>}
   */
  async enviarValidacionCuenta(email, codigo) {
    this.configure();

    if (!this.configured) {
      console.log('[MODO DESARROLLO] Código de validación:', codigo);
      return true;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Validación de Cuenta',
      html: `
        <h2>Validación de Cuenta</h2>
        <p>Gracias por registrarte en nuestro sistema.</p>
        <p>Tu código de validación es:</p>
        <h1 style="color: #4CAF50; font-size: 36px;">${codigo}</h1>
        <p>Este código expirará en ${process.env.MFA_CODE_EXPIRATION || 5} minutos.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error al enviar validación:', error.message);
      return false;
    }
  }
}

module.exports = new EmailService();
