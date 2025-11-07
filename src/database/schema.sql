-- Schema basado en el diagrama UML
-- Sistema de Seguridad con Autenticación Multi-Factor

-- Tabla Usuario
CREATE TABLE IF NOT EXISTS Usuario (
    idUsuario INTEGER PRIMARY KEY AUTOINCREMENT,
    nombres TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefono TEXT,
    estado BOOLEAN DEFAULT 1,
    fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    Usuario TEXT UNIQUE NOT NULL,
    Contrasena TEXT NOT NULL,
    rol TEXT DEFAULT 'user' CHECK(rol IN ('admin', 'user'))
);

-- Tabla Session
CREATE TABLE IF NOT EXISTS Session (
    idSession INTEGER PRIMARY KEY AUTOINCREMENT,
    activo BOOLEAN DEFAULT 1,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    idUsuario INTEGER NOT NULL,
    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario)
);

-- Tabla MFA (Multi-Factor Authentication)
CREATE TABLE IF NOT EXISTS MFA (
    idMFA INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL CHECK(tipo IN ('pregunta', 'email', 'sms', 'usb')),
    codigo TEXT,
    fechaExpiracion DATETIME,
    idUsuario INTEGER NOT NULL,
    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario)
);

-- Tabla TokenRecuperacion
CREATE TABLE IF NOT EXISTS TokenRecuperacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    idUsuario INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fechaExpiracion DATETIME NOT NULL,
    usado BOOLEAN DEFAULT 0,
    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario)
);

-- Tabla Acceso (para control de intentos fallidos)
CREATE TABLE IF NOT EXISTS Acceso (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    idUsuario INTEGER NOT NULL,
    intentosFallidos INTEGER DEFAULT 0,
    fechaIntento DATETIME DEFAULT CURRENT_TIMESTAMP,
    ipOrigen TEXT,
    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario)
);

-- Tabla Auditoria
CREATE TABLE IF NOT EXISTS Auditoria (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    idUsuario INTEGER,
    accion TEXT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario)
);

-- Tabla Accion (catálogo de acciones)
CREATE TABLE IF NOT EXISTS Accion (
    idAccion INTEGER PRIMARY KEY AUTOINCREMENT,
    nombreAccion TEXT UNIQUE NOT NULL,
    detalleAccion TEXT
);

-- Tabla CodigoVerificacion
CREATE TABLE IF NOT EXISTS CodigoVerificacion (
    idCodigo INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT NOT NULL,
    canal TEXT NOT NULL CHECK(canal IN ('email', 'sms')),
    fechaExpiracion DATETIME NOT NULL,
    idMFA INTEGER NOT NULL,
    usado BOOLEAN DEFAULT 0,
    FOREIGN KEY (idMFA) REFERENCES MFA(idMFA)
);

-- Tabla PreguntasSeguridad
CREATE TABLE IF NOT EXISTS PreguntasSeguridad (
    idPregunta INTEGER PRIMARY KEY AUTOINCREMENT,
    estado BOOLEAN DEFAULT 1,
    pregunta TEXT NOT NULL,
    fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    idMFA INTEGER NOT NULL,
    FOREIGN KEY (idMFA) REFERENCES MFA(idMFA)
);

-- Tabla RespuestasSeguridad
CREATE TABLE IF NOT EXISTS RespuestasSeguridad (
    idRespuesta INTEGER PRIMARY KEY AUTOINCREMENT,
    idPregunta INTEGER NOT NULL,
    respuesta TEXT NOT NULL,
    FOREIGN KEY (idPregunta) REFERENCES PreguntasSeguridad(idPregunta)
);

-- Tabla DispositivoUSB
CREATE TABLE IF NOT EXISTS DispositivoUSB (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    idMFA INTEGER NOT NULL,
    identificador TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    fechaRegistro DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado BOOLEAN DEFAULT 1,
    FOREIGN KEY (idMFA) REFERENCES MFA(idMFA)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_usuario_email ON Usuario(email);
CREATE INDEX IF NOT EXISTS idx_usuario_usuario ON Usuario(Usuario);
CREATE INDEX IF NOT EXISTS idx_session_usuario ON Session(idUsuario);
CREATE INDEX IF NOT EXISTS idx_session_activo ON Session(activo);
CREATE INDEX IF NOT EXISTS idx_mfa_usuario ON MFA(idUsuario);
CREATE INDEX IF NOT EXISTS idx_token_token ON TokenRecuperacion(token);
CREATE INDEX IF NOT EXISTS idx_acceso_usuario ON Acceso(idUsuario);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON Auditoria(idUsuario);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON Auditoria(fecha);

-- Insertar acciones predefinidas
INSERT OR IGNORE INTO Accion (nombreAccion, detalleAccion) VALUES
    ('REGISTRO_USUARIO', 'Nuevo usuario registrado en el sistema'),
    ('LOGIN_EXITOSO', 'Inicio de sesión exitoso'),
    ('LOGIN_FALLIDO', 'Intento de inicio de sesión fallido'),
    ('LOGOUT', 'Cierre de sesión'),
    ('RECUPERACION_CONTRASENA', 'Solicitud de recuperación de contraseña'),
    ('CAMBIO_CONTRASENA', 'Contraseña cambiada exitosamente'),
    ('BLOQUEO_CUENTA', 'Cuenta bloqueada por múltiples intentos fallidos'),
    ('DESBLOQUEO_CUENTA', 'Cuenta desbloqueada'),
    ('VALIDACION_MFA', 'Validación de segundo factor'),
    ('ACTUALIZACION_DATOS', 'Actualización de datos de usuario');
