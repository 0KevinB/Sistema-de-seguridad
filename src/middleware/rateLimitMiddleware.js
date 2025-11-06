const rateLimit = require('express-rate-limit');

/**
 * Rate limiter general para la API
 */
const limiterGeneral = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 peticiones por ventana
  message: {
    success: false,
    mensaje: 'Demasiadas peticiones, intenta más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter estricto para login
 * RS6: Control de intentos de acceso
 */
const limiterLogin = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 30, // Máximo 30 intentos de login (aumentado para desarrollo)
  message: {
    success: false,
    mensaje: 'Demasiados intentos de inicio de sesión, intenta más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // No cuenta las peticiones exitosas
});

/**
 * Rate limiter para registro
 */
const limiterRegistro = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos (reducido para desarrollo)
  max: 20, // Máximo 20 registros (aumentado para desarrollo)
  message: {
    success: false,
    mensaje: 'Demasiados registros, intenta más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter para recuperación de contraseña
 */
const limiterRecuperacion = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos (reducido para desarrollo)
  max: 10, // Máximo 10 intentos (aumentado para desarrollo)
  message: {
    success: false,
    mensaje: 'Demasiadas solicitudes de recuperación, intenta más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter para códigos MFA
 */
const limiterMFA = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 20, // Máximo 20 códigos por ventana (aumentado para desarrollo)
  message: {
    success: false,
    mensaje: 'Demasiadas solicitudes de código, intenta más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  limiterGeneral,
  limiterLogin,
  limiterRegistro,
  limiterRecuperacion,
  limiterMFA
};
