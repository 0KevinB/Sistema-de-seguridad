/**
 * Middleware para manejo centralizado de errores
 */
function manejarErrores(err, req, res, next) {
  console.error('Error:', err);

  // Error de base de datos
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(400).json({
      success: false,
      mensaje: 'Error de validación en la base de datos',
      error: err.message
    });
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      mensaje: 'Token inválido'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      mensaje: 'Token expirado'
    });
  }

  // Error genérico
  res.status(err.status || 500).json({
    success: false,
    mensaje: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

/**
 * Middleware para rutas no encontradas
 */
function rutaNoEncontrada(req, res) {
  res.status(404).json({
    success: false,
    mensaje: 'Ruta no encontrada'
  });
}

module.exports = {
  manejarErrores,
  rutaNoEncontrada
};
