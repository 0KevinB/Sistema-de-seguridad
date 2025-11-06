# Documentación de API - Sistema de Seguridad

## Índice

1. [Autenticación](#autenticación)
2. [Usuarios](#usuarios)
3. [Administración](#administración)
4. [Códigos de Respuesta](#códigos-de-respuesta)
5. [Manejo de Errores](#manejo-de-errores)

---

## Autenticación

### Login - Primer Factor

Inicia el proceso de autenticación validando usuario y contraseña.

**Endpoint:** `POST /api/auth/login`

**Rate Limit:** 10 intentos cada 15 minutos

**Body:**
```json
{
  "usuario": "string",
  "contrasena": "string"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "requiereMFA": true,
  "idUsuario": 1,
  "mensaje": "Primer factor validado. Se requiere segundo factor."
}
```

**Errores Posibles:**
- 400: Usuario o contraseña incorrectos
- 400: Cuenta bloqueada por múltiples intentos fallidos
- 429: Demasiados intentos de login

---

### Solicitar Código MFA - Email

Solicita un código de verificación por email.

**Endpoint:** `POST /api/auth/mfa/email`

**Rate Limit:** 5 códigos cada 5 minutos

**Body:**
```json
{
  "idUsuario": 1
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "idMFA": 2,
  "mensaje": "Código enviado a tu email",
  "expiracion": "2025-11-06T10:35:00.000Z"
}
```

---

### Solicitar Código MFA - SMS

Solicita un código de verificación por SMS.

**Endpoint:** `POST /api/auth/mfa/sms`

**Rate Limit:** 5 códigos cada 5 minutos

**Body:**
```json
{
  "idUsuario": 1
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "idMFA": 3,
  "mensaje": "Código enviado a tu teléfono",
  "expiracion": "2025-11-06T10:35:00.000Z"
}
```

---

### Validar Código MFA

Valida el código MFA y completa el proceso de login.

**Endpoint:** `POST /api/auth/mfa/validar`

**Body:**
```json
{
  "idMFA": 2,
  "codigo": "123456",
  "idUsuario": 1
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "session": {
    "idSession": 1,
    "idUsuario": 1,
    "activo": true,
    "fecha": "2025-11-06T10:30:00.000Z"
  },
  "usuario": {
    "idUsuario": 1,
    "usuario": "jperez123",
    "nombres": "Juan",
    "apellidos": "Pérez",
    "email": "juan@example.com"
  }
}
```

**Errores Posibles:**
- 400: Código inválido o expirado

---

### Validar Preguntas de Seguridad

Valida respuestas a preguntas de seguridad como segundo factor.

**Endpoint:** `POST /api/auth/mfa/preguntas/validar`

**Body:**
```json
{
  "idUsuario": 1,
  "respuestas": [
    {
      "idPregunta": 1,
      "respuesta": "Firulais"
    },
    {
      "idPregunta": 2,
      "respuesta": "Madrid"
    }
  ]
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "session": { ... },
  "usuario": { ... }
}
```

---

### Validar Dispositivo USB

Valida un dispositivo USB como segundo factor.

**Endpoint:** `POST /api/auth/mfa/usb/validar`

**Body:**
```json
{
  "idUsuario": 1,
  "identificador": "a1b2c3d4e5f6g7h8"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "session": { ... },
  "usuario": { ... }
}
```

---

### Logout

Cierra la sesión actual del usuario.

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "mensaje": "Sesión cerrada correctamente"
}
```

---

### Solicitar Recuperación de Contraseña

Solicita un token para recuperar la contraseña.

**Endpoint:** `POST /api/auth/recuperar`

**Rate Limit:** 3 intentos por hora

**Body:**
```json
{
  "email": "juan@example.com"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "mensaje": "Si el email existe, recibirás instrucciones de recuperación"
}
```

---

### Restablecer Contraseña

Restablece la contraseña usando el token recibido por email.

**Endpoint:** `POST /api/auth/reset-password/:token`

**Body:**
```json
{
  "nuevaContrasena": "NuevaContraseña123!"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "mensaje": "Contraseña restablecida correctamente"
}
```

---

### Verificar Sesión

Verifica si la sesión actual es válida.

**Endpoint:** `GET /api/auth/verificar`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "usuario": {
    "idUsuario": 1,
    "usuario": "jperez123",
    "email": "juan@example.com"
  },
  "mensaje": "Sesión válida"
}
```

---

## Usuarios

### Registro de Usuario

Registra un nuevo usuario en el sistema.

**Endpoint:** `POST /api/users/registro`

**Rate Limit:** 5 registros por hora

**Body:**
```json
{
  "nombres": "Juan",
  "apellidos": "Pérez García",
  "email": "juan@example.com",
  "telefono": "0987654321"
}
```

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "mensaje": "Usuario registrado. Verifica tu email para activar la cuenta.",
  "datos": {
    "idUsuario": 1,
    "usuario": "jperez123",
    "email": "juan@example.com",
    "idMFA": 1,
    "requiereValidacion": true
  }
}
```

**Validaciones:**
- Nombres: mínimo 2 caracteres
- Apellidos: mínimo 2 caracteres
- Email: formato válido
- Teléfono: 10 dígitos (opcional)

---

### Validar Cuenta

Activa la cuenta usando el código recibido por email.

**Endpoint:** `POST /api/users/validar-cuenta`

**Body:**
```json
{
  "idUsuario": 1,
  "idMFA": 1,
  "codigo": "123456"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "mensaje": "Cuenta validada correctamente. Ya puedes iniciar sesión."
}
```

---

### Obtener Perfil

Obtiene los datos del usuario autenticado.

**Endpoint:** `GET /api/users/perfil`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "usuario": {
    "idUsuario": 1,
    "nombres": "Juan",
    "apellidos": "Pérez García",
    "email": "juan@example.com",
    "telefono": "0987654321",
    "estado": 1,
    "fechaCreacion": "2025-11-06T10:00:00.000Z",
    "Usuario": "jperez123"
  }
}
```

---

### Actualizar Perfil

Actualiza los datos del usuario.

**Endpoint:** `PUT /api/users/perfil`

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "nombres": "Juan Carlos",
  "apellidos": "Pérez García",
  "telefono": "0987654322"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "mensaje": "Perfil actualizado correctamente"
}
```

---

### Cambiar Contraseña

Cambia la contraseña del usuario autenticado.

**Endpoint:** `POST /api/users/cambiar-contrasena`

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "contrasenaActual": "ContraseñaActual123!",
  "nuevaContrasena": "NuevaContraseña123!"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "mensaje": "Contraseña cambiada correctamente"
}
```

**Validaciones:**
- Nueva contraseña: mínimo 8 caracteres

---

### Configurar MFA

Configura un método de segundo factor para el usuario.

**Endpoint:** `POST /api/users/mfa/configurar`

**Headers:**
```
Authorization: Bearer {token}
```

**Body (Preguntas de Seguridad):**
```json
{
  "tipo": "preguntas",
  "datos": {
    "preguntasRespuestas": [
      {
        "pregunta": "¿Cuál es el nombre de tu primera mascota?",
        "respuesta": "Firulais"
      },
      {
        "pregunta": "¿En qué ciudad naciste?",
        "respuesta": "Madrid"
      }
    ]
  }
}
```

**Body (Dispositivo USB):**
```json
{
  "tipo": "usb",
  "datos": {
    "identificador": "a1b2c3d4e5f6g7h8",
    "nombre": "USB Kingston 32GB"
  }
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "idMFA": 5,
  "preguntas": [ ... ]
}
```

---

### Obtener Métodos MFA

Lista los métodos MFA configurados para el usuario.

**Endpoint:** `GET /api/users/mfa/metodos`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "metodos": [
    { "tipo": "email" },
    { "tipo": "sms" },
    { "tipo": "pregunta" }
  ]
}
```

---

## Administración

Todos los endpoints de administración requieren autenticación.

### Obtener Auditoría

Lista los registros de auditoría del sistema.

**Endpoint:** `GET /api/admin/auditoria`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `limite`: Número de registros (default: 100, max: 1000)
- `offset`: Offset para paginación (default: 0)

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "registros": [
    {
      "id": 1,
      "idUsuario": 1,
      "Usuario": "jperez123",
      "nombres": "Juan",
      "apellidos": "Pérez",
      "accion": "LOGIN_EXITOSO",
      "fecha": "2025-11-06T10:30:00.000Z"
    }
  ],
  "limite": 100,
  "offset": 0
}
```

---

### Obtener Auditoría por Usuario

Lista los registros de auditoría de un usuario específico.

**Endpoint:** `GET /api/admin/auditoria/usuario/:idUsuario`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `limite`: Número de registros (default: 50)

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "registros": [ ... ]
}
```

---

### Obtener Auditoría por Rango

Lista los registros de auditoría en un rango de fechas.

**Endpoint:** `GET /api/admin/auditoria/rango`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `fechaInicio`: Fecha ISO 8601 (ej: 2025-11-01T00:00:00.000Z)
- `fechaFin`: Fecha ISO 8601

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "registros": [ ... ],
  "fechaInicio": "2025-11-01T00:00:00.000Z",
  "fechaFin": "2025-11-06T23:59:59.000Z"
}
```

---

### Obtener Historial de Accesos

Lista los intentos de acceso de un usuario.

**Endpoint:** `GET /api/admin/accesos/:idUsuario`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `limite`: Número de registros (default: 20)

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "historial": [
    {
      "id": 1,
      "idUsuario": 1,
      "intentosFallidos": 0,
      "fechaIntento": "2025-11-06T10:30:00.000Z",
      "ipOrigen": "192.168.1.100"
    }
  ]
}
```

---

### Desbloquear Cuenta

Desbloquea la cuenta de un usuario.

**Endpoint:** `POST /api/admin/desbloquear/:idUsuario`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "mensaje": "Cuenta desbloqueada correctamente"
}
```

---

### Bloquear Cuenta

Bloquea la cuenta de un usuario.

**Endpoint:** `POST /api/admin/bloquear/:idUsuario`

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "motivo": "Actividad sospechosa"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "mensaje": "Cuenta bloqueada correctamente"
}
```

---

### Obtener Sesiones Activas

Lista todas las sesiones activas en el sistema.

**Endpoint:** `GET /api/admin/sesiones`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "sesiones": [
    {
      "idSession": 1,
      "idUsuario": 1,
      "Usuario": "jperez123",
      "nombres": "Juan",
      "apellidos": "Pérez",
      "email": "juan@example.com",
      "activo": 1,
      "fecha": "2025-11-06T10:30:00.000Z"
    }
  ],
  "total": 1
}
```

---

### Cerrar Sesión (Admin)

Cierra la sesión de un usuario específico.

**Endpoint:** `POST /api/admin/sesiones/cerrar/:idSession`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "mensaje": "Sesión cerrada correctamente"
}
```

---

### Obtener Estadísticas

Obtiene estadísticas generales del sistema.

**Endpoint:** `GET /api/admin/estadisticas`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "estadisticas": {
    "usuariosTotales": 150,
    "usuariosActivos": 145,
    "usuariosBloqueados": 5,
    "sesionesActivas": 23,
    "auditoriaReciente": 342,
    "intentosFallidosRecientes": 12
  }
}
```

---

## Códigos de Respuesta

- **200 OK:** Petición exitosa
- **201 Created:** Recurso creado exitosamente
- **400 Bad Request:** Error en los datos enviados
- **401 Unauthorized:** No autenticado o token inválido
- **404 Not Found:** Recurso no encontrado
- **429 Too Many Requests:** Rate limit excedido
- **500 Internal Server Error:** Error del servidor

---

## Manejo de Errores

Todas las respuestas de error siguen el formato:

```json
{
  "success": false,
  "mensaje": "Descripción del error",
  "errores": [
    {
      "campo": "email",
      "mensaje": "Email inválido"
    }
  ]
}
```

### Errores Comunes

1. **Token Inválido o Expirado:**
```json
{
  "success": false,
  "mensaje": "Token inválido o expirado"
}
```

2. **Sesión Expirada:**
```json
{
  "success": false,
  "mensaje": "Sesión expirada"
}
```

3. **Cuenta Bloqueada:**
```json
{
  "success": false,
  "mensaje": "Cuenta bloqueada por múltiples intentos fallidos"
}
```

4. **Validación de Datos:**
```json
{
  "success": false,
  "mensaje": "Errores de validación",
  "errores": [
    {
      "campo": "email",
      "mensaje": "Email inválido"
    },
    {
      "campo": "nombres",
      "mensaje": "Nombres debe tener al menos 2 caracteres"
    }
  ]
}
```

---

## Notas Adicionales

1. **Tokens JWT:** Los tokens tienen una duración de 1 hora por defecto (configurable)

2. **Sesiones:** Las sesiones expiran después de 30 minutos de inactividad

3. **Códigos MFA:** Los códigos de verificación expiran en 5 minutos

4. **Tokens de Recuperación:** Los tokens de recuperación de contraseña expiran en 24 horas

5. **Rate Limiting:** Los límites de tasa varían según el endpoint

6. **Modo Desarrollo:** En modo desarrollo, los códigos MFA se muestran en consola si el email no está configurado
