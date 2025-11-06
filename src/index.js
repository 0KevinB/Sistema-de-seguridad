const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const database = require('./config/database');
const routes = require('./routes');
const { manejarErrores, rutaNoEncontrada } = require('./middleware/errorMiddleware');
const { limiterGeneral } = require('./middleware/rateLimitMiddleware');

/**
 * Sistema de Seguridad con Autenticación Multi-Factor
 * Autores: Kevin Barrazueta, Carolina Alvarado, Mario Calva
 * Fecha: Noviembre 2025
 */

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de seguridad con Helmet
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Parseo de JSON y URL encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend
app.use(express.static('public'));

// Rate limiting general
app.use(limiterGeneral);

// Logging de peticiones (desarrollo)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Rutas principales
app.use('/api', routes);

// Ruta de documentación
app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    mensaje: 'Documentación del Sistema de Seguridad',
    version: '1.0.0',
    requerimientos: {
      RS1: 'Registro de usuarios con validación de email/celular',
      RS2: 'Control de ingreso con segundo factor (email, SMS, preguntas, USB)',
      RS3: 'Monitoreo de creación de usuarios y registro de accesos',
      RS4: 'Recuperación de usuario/contraseña por email',
      RS5: 'Control de bajas temporales y sesiones únicas',
      RS6: 'Control de intentos de acceso (máximo 4 intentos)',
      RS7: 'Gestión de sesión de trabajo'
    },
    endpoints: {
      autenticacion: {
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        recuperar: 'POST /api/auth/recuperar',
        resetPassword: 'POST /api/auth/reset-password/:token',
        verificar: 'GET /api/auth/verificar',
        mfa: {
          email: 'POST /api/auth/mfa/email',
          sms: 'POST /api/auth/mfa/sms',
          validar: 'POST /api/auth/mfa/validar',
          preguntas: 'POST /api/auth/mfa/preguntas/validar',
          usb: 'POST /api/auth/mfa/usb/validar'
        }
      },
      usuarios: {
        registro: 'POST /api/users/registro',
        validarCuenta: 'POST /api/users/validar-cuenta',
        perfil: 'GET /api/users/perfil',
        actualizarPerfil: 'PUT /api/users/perfil',
        cambiarContrasena: 'POST /api/users/cambiar-contrasena',
        configurarMFA: 'POST /api/users/mfa/configurar',
        metodosMFA: 'GET /api/users/mfa/metodos'
      },
      administracion: {
        auditoria: 'GET /api/admin/auditoria',
        auditoriaPorUsuario: 'GET /api/admin/auditoria/usuario/:idUsuario',
        auditoriaPorRango: 'GET /api/admin/auditoria/rango',
        accesos: 'GET /api/admin/accesos/:idUsuario',
        desbloquear: 'POST /api/admin/desbloquear/:idUsuario',
        bloquear: 'POST /api/admin/bloquear/:idUsuario',
        sesiones: 'GET /api/admin/sesiones',
        cerrarSesion: 'POST /api/admin/sesiones/cerrar/:idSession',
        estadisticas: 'GET /api/admin/estadisticas'
      }
    },
    modeloUML: 'Ver diagrama en Clase UML.png',
    autores: [
      'Kevin Barrazueta',
      'Carolina Alvarado',
      'Mario Calva'
    ]
  });
});

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    mensaje: 'Sistema funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Manejo de rutas no encontradas
app.use(rutaNoEncontrada);

// Manejo centralizado de errores
app.use(manejarErrores);

/**
 * Inicia el servidor
 */
async function iniciarServidor() {
  try {
    // Conectar a la base de datos
    await database.connect();
    console.log('✓ Base de datos conectada');

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log('  Sistema de Seguridad con Autenticación Multi-Factor');
      console.log('═══════════════════════════════════════════════════════');
      console.log('');
      console.log(`✓ Servidor iniciado en http://localhost:${PORT}`);
      console.log(`✓ Documentación: http://localhost:${PORT}/api/docs`);
      console.log(`✓ Health check: http://localhost:${PORT}/health`);
      console.log('');
      console.log('Endpoints principales:');
      console.log(`  - POST /api/users/registro - Registro de usuarios`);
      console.log(`  - POST /api/auth/login - Inicio de sesión`);
      console.log(`  - POST /api/auth/mfa/validar - Validar MFA`);
      console.log(`  - GET /api/admin/auditoria - Ver auditoría`);
      console.log('');
      console.log('Autores: Kevin Barrazueta, Carolina Alvarado, Mario Calva');
      console.log('═══════════════════════════════════════════════════════');
      console.log('');
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\nCerrando servidor...');
  await database.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nCerrando servidor...');
  await database.close();
  process.exit(0);
});

// Iniciar servidor
iniciarServidor();

module.exports = app;
