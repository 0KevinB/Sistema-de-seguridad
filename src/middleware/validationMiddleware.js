const { validationResult } = require('express-validator');

/**
 * Middleware para manejar errores de validación
 */
function manejarErroresValidacion(req, res, next) {
  const errores = validationResult(req);

  if (!errores.isEmpty()) {
    return res.status(400).json({
      success: false,
      mensaje: 'Errores de validación',
      errores: errores.array().map(err => ({
        campo: err.param,
        mensaje: err.msg
      }))
    });
  }

  next();
}

module.exports = {
  manejarErroresValidacion
};
