const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verificarAutenticacion, verificarAdmin } = require('../middleware/authMiddleware');
const { query, body } = require('express-validator');
const { manejarErroresValidacion } = require('../middleware/validationMiddleware');

/**
 * Rutas de administración
 * Todas requieren autenticación y rol de administrador
 */

// Aplicar autenticación y verificación de admin a todas las rutas
router.use(verificarAutenticacion);
router.use(verificarAdmin);

// Obtener registros de auditoría
router.get('/auditoria',
  [
    query('limite').optional().isInt({ min: 1, max: 1000 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  manejarErroresValidacion,
  adminController.obtenerAuditoria
);

// Obtener auditoría por usuario
router.get('/auditoria/usuario/:idUsuario',
  [
    query('limite').optional().isInt({ min: 1, max: 1000 })
  ],
  manejarErroresValidacion,
  adminController.obtenerAuditoriaPorUsuario
);

// Obtener auditoría por rango de fechas
router.get('/auditoria/rango',
  [
    query('fechaInicio').notEmpty().isISO8601(),
    query('fechaFin').notEmpty().isISO8601()
  ],
  manejarErroresValidacion,
  adminController.obtenerAuditoriaPorRango
);

// Obtener historial de accesos
router.get('/accesos/:idUsuario',
  [
    query('limite').optional().isInt({ min: 1, max: 100 })
  ],
  manejarErroresValidacion,
  adminController.obtenerHistorialAccesos
);

// Desbloquear cuenta
router.post('/desbloquear/:idUsuario',
  adminController.desbloquearCuenta
);

// Bloquear cuenta
router.post('/bloquear/:idUsuario',
  [
    body('motivo').optional().isString()
  ],
  manejarErroresValidacion,
  adminController.bloquearCuenta
);

// Obtener sesiones activas
router.get('/sesiones',
  adminController.obtenerSesionesActivas
);

// Cerrar sesión de usuario
router.post('/sesiones/cerrar/:idSession',
  adminController.cerrarSesion
);

// Obtener estadísticas del sistema
router.get('/estadisticas',
  adminController.obtenerEstadisticas
);

module.exports = router;
