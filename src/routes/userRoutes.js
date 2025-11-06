const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { body } = require('express-validator');
const { manejarErroresValidacion } = require('../middleware/validationMiddleware');
const { limiterRegistro } = require('../middleware/rateLimitMiddleware');
const { verificarAutenticacion } = require('../middleware/authMiddleware');

/**
 * Rutas de usuarios
 */

// Registro de nuevo usuario
router.post('/registro',
  limiterRegistro,
  [
    body('nombres')
      .notEmpty().withMessage('Nombres requeridos')
      .isLength({ min: 2 }).withMessage('Nombres debe tener al menos 2 caracteres'),
    body('apellidos')
      .notEmpty().withMessage('Apellidos requeridos')
      .isLength({ min: 2 }).withMessage('Apellidos debe tener al menos 2 caracteres'),
    body('email')
      .isEmail().withMessage('Email inválido'),
    body('telefono')
      .optional()
      .matches(/^\d{10}$/).withMessage('Teléfono debe tener 10 dígitos')
  ],
  manejarErroresValidacion,
  userController.registro
);

// Validar cuenta con código
router.post('/validar-cuenta',
  [
    body('idUsuario').isInt().withMessage('ID de usuario inválido'),
    body('idMFA').isInt().withMessage('ID de MFA inválido'),
    body('codigo').notEmpty().withMessage('Código requerido')
  ],
  manejarErroresValidacion,
  userController.validarCuenta
);

// Obtener perfil del usuario actual (requiere autenticación)
router.get('/perfil',
  verificarAutenticacion,
  userController.obtenerPerfil
);

// Actualizar perfil del usuario
router.put('/perfil',
  verificarAutenticacion,
  [
    body('nombres').optional().isLength({ min: 2 }),
    body('apellidos').optional().isLength({ min: 2 }),
    body('telefono').optional().matches(/^\d{10}$/)
  ],
  manejarErroresValidacion,
  userController.actualizarPerfil
);

// Cambiar contraseña
router.post('/cambiar-contrasena',
  verificarAutenticacion,
  [
    body('contrasenaActual').notEmpty().withMessage('Contraseña actual requerida'),
    body('nuevaContrasena')
      .isLength({ min: 8 })
      .withMessage('La nueva contraseña debe tener al menos 8 caracteres')
  ],
  manejarErroresValidacion,
  userController.cambiarContrasena
);

// Configurar método MFA
router.post('/mfa/configurar',
  verificarAutenticacion,
  [
    body('tipo').isIn(['preguntas', 'usb']).withMessage('Tipo de MFA no válido'),
    body('datos').notEmpty().withMessage('Datos de configuración requeridos')
  ],
  manejarErroresValidacion,
  userController.configurarMFA
);

// Obtener métodos MFA del usuario
router.get('/mfa/metodos',
  verificarAutenticacion,
  userController.obtenerMetodosMFA
);

module.exports = router;
