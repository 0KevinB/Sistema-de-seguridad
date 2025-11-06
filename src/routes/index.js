const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const adminRoutes = require('./adminRoutes');

/**
 * Rutas principales de la API
 */

// Ruta de bienvenida
router.get('/', (req, res) => {
  res.json({
    success: true,
    mensaje: 'Sistema de Seguridad API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      admin: '/api/admin'
    },
    documentacion: '/api/docs'
  });
});

// Montar rutas
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
