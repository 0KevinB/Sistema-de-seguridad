const authService = require('../services/authService');
const Session = require('../models/Session');

/**
 * Middleware de autenticación
 * Verifica el token JWT y la sesión activa
 */
async function verificarAutenticacion(req, res, next) {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        mensaje: 'Token de autenticación requerido'
      });
    }

    const token = authHeader.substring(7);

    // Verificar token
    const decoded = authService.verificarToken(token);

    // Verificar sesión activa
    const sessionActiva = await Session.obtenerSessionActiva(decoded.idUsuario);

    if (!sessionActiva) {
      return res.status(401).json({
        success: false,
        mensaje: 'Sesión no válida o expirada'
      });
    }

    // Validar sesión
    const sessionValida = await authService.validarSesion(sessionActiva.idSession);

    if (!sessionValida) {
      return res.status(401).json({
        success: false,
        mensaje: 'Sesión expirada'
      });
    }

    // Agregar datos del usuario a la petición
    req.usuario = decoded;
    req.idSession = sessionActiva.idSession;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      mensaje: 'Token inválido o expirado',
      error: error.message
    });
  }
}

/**
 * Middleware opcional de autenticación
 * No bloquea si no hay token, pero lo verifica si existe
 */
async function verificarAutenticacionOpcional(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = authService.verificarToken(token);
      req.usuario = decoded;
    }

    next();
  } catch (error) {
    next();
  }
}

/**
 * Middleware para verificar que el usuario sea administrador
 * Debe usarse después de verificarAutenticacion
 */
async function verificarAdmin(req, res, next) {
  try {
    // Verificar que el usuario esté autenticado
    if (!req.usuario) {
      return res.status(401).json({
        success: false,
        mensaje: 'Autenticación requerida'
      });
    }

    // Verificar que el usuario tenga rol de admin
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        mensaje: 'Acceso denegado. Se requieren privilegios de administrador'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      mensaje: 'Error al verificar permisos',
      error: error.message
    });
  }
}

module.exports = {
  verificarAutenticacion,
  verificarAutenticacionOpcional,
  verificarAdmin
};
