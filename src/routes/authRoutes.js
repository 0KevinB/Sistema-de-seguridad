const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');
const { manejarErroresValidacion } = require('../middleware/validationMiddleware');
const { limiterLogin, limiterRecuperacion, limiterMFA } = require('../middleware/rateLimitMiddleware');
const { verificarAutenticacion } = require('../middleware/authMiddleware');

/**
 * Rutas de autenticación
 */

// Login - Primer factor
router.post('/login',
  limiterLogin,
  [
    body('usuario').notEmpty().withMessage('Usuario requerido'),
    body('contrasena').notEmpty().withMessage('Contraseña requerida')
  ],
  manejarErroresValidacion,
  authController.login
);

// Solicitar código MFA por email
router.post('/mfa/email',
  limiterMFA,
  [
    body('idUsuario').isInt().withMessage('ID de usuario inválido')
  ],
  manejarErroresValidacion,
  authController.solicitarCodigoEmail
);

// Solicitar código MFA por SMS
router.post('/mfa/sms',
  limiterMFA,
  [
    body('idUsuario').isInt().withMessage('ID de usuario inválido')
  ],
  manejarErroresValidacion,
  authController.solicitarCodigoSMS
);

// Validar código MFA
router.post('/mfa/validar',
  [
    body('idMFA').isInt().withMessage('ID de MFA inválido'),
    body('codigo').notEmpty().withMessage('Código requerido'),
    body('idUsuario').isInt().withMessage('ID de usuario inválido')
  ],
  manejarErroresValidacion,
  authController.validarMFA
);

// Validar preguntas de seguridad
router.post('/mfa/preguntas/validar',
  [
    body('idUsuario').isInt().withMessage('ID de usuario inválido'),
    body('respuestas').isArray().withMessage('Respuestas deben ser un array')
  ],
  manejarErroresValidacion,
  authController.validarPreguntas
);

// Validar dispositivo USB
router.post('/mfa/usb/validar',
  [
    body('idUsuario').isInt().withMessage('ID de usuario inválido'),
    body('identificador').notEmpty().withMessage('Identificador requerido')
  ],
  manejarErroresValidacion,
  authController.validarUSB
);

// Logout
router.post('/logout',
  verificarAutenticacion,
  authController.logout
);

// Solicitar recuperación de contraseña
router.post('/recuperar',
  limiterRecuperacion,
  [
    body('email').isEmail().withMessage('Email inválido')
  ],
  manejarErroresValidacion,
  authController.solicitarRecuperacion
);

// Restablecer contraseña con token
router.post('/reset-password/:token',
  [
    body('nuevaContrasena')
      .isLength({ min: 8 })
      .withMessage('La contraseña debe tener al menos 8 caracteres')
  ],
  manejarErroresValidacion,
  authController.restablecerContrasena
);

// Verificar sesión actual
router.get('/verificar',
  verificarAutenticacion,
  authController.verificarSesion
);

module.exports = router;
