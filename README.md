# Sistema de Seguridad con Autenticación Multi-Factor

Sistema completo de autenticación y seguridad implementado en Node.js con Express, siguiendo todos los requerimientos de seguridad de la información.

**Autores:**
- Kevin Barrazueta
- Carolina Alvarado
- Mario Calva

**Fecha:** Noviembre 2025

## Características Principales

### Requerimientos Implementados

- **RS1:** Registro de usuarios con validación de correo electrónico o celular. El sistema proporciona automáticamente el usuario y contraseña.

- **RS2:** Control de ingreso con segundo factor de autenticación:
  - Preguntas de seguridad
  - Código de verificación por email
  - Código de verificación por SMS
  - Llave USB

- **RS3:** Monitoreo y registro completo de:
  - Creación de usuarios
  - Registro de accesos al sistema
  - Todas las acciones importantes

- **RS4:** Sistema de recuperación de usuario/contraseña basado en correo electrónico

- **RS5:**
  - Gestión de bajas temporales de usuarios
  - Control de sesiones únicas (no se permiten dos sesiones simultáneas)

- **RS6:** Control de intentos de acceso:
  - Máximo 4 intentos fallidos
  - Bloqueo automático de cuenta
  - Sistema de desbloqueo
  - Registro de todos los intentos

- **RS7:** Gestión completa de sesión de trabajo con timeouts configurables

## Arquitectura

El proyecto sigue el diagrama UML proporcionado con las siguientes clases:

- **Usuario:** Gestión de usuarios y credenciales
- **Session:** Control de sesiones activas
- **MFA:** Multi-Factor Authentication
- **TokenRecuperacion:** Tokens para recuperación de contraseña
- **Acceso:** Control de intentos de acceso
- **Auditoria:** Registro de todas las acciones
- **CodigoVerificacion:** Códigos enviados por email/SMS
- **PreguntasSeguridad:** Preguntas para segundo factor
- **RespuestasSeguridad:** Respuestas a preguntas de seguridad
- **DispositivoUSB:** Dispositivos USB registrados

## Tecnologías Utilizadas

- **Node.js:** Entorno de ejecución
- **Express:** Framework web
- **SQLite:** Base de datos
- **JWT:** Autenticación con tokens
- **bcryptjs:** Encriptación de contraseñas
- **Nodemailer:** Envío de emails
- **Helmet:** Seguridad HTTP
- **express-rate-limit:** Control de tasa de peticiones

## Instalación

### Prerequisitos

- Node.js (v14 o superior)
- npm o yarn

### Pasos de Instalación

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd SistemaSeguridad
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar el archivo `.env` con tus configuraciones:
```env
PORT=3000
NODE_ENV=development
DB_PATH=./database/seguridad.db
JWT_SECRET=tu_clave_secreta_muy_segura
JWT_EXPIRES_IN=1h
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_de_aplicacion
MFA_CODE_EXPIRATION=5
TOKEN_RECOVERY_EXPIRATION=24
MAX_LOGIN_ATTEMPTS=4
SESSION_TIMEOUT=30
BCRYPT_ROUNDS=10
```

4. Inicializar la base de datos:
```bash
npm run init-db
```

5. Iniciar el servidor:
```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en `http://localhost:3000`

## Uso de la API

### Documentación Completa

Accede a `http://localhost:3000/api/docs` para ver la documentación completa de todos los endpoints.

### Ejemplos de Uso

#### 1. Registro de Usuario

```bash
POST /api/users/registro
Content-Type: application/json

{
  "nombres": "Juan",
  "apellidos": "Pérez",
  "email": "juan@example.com",
  "telefono": "0987654321"
}
```

Respuesta:
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

#### 2. Validar Cuenta

```bash
POST /api/users/validar-cuenta
Content-Type: application/json

{
  "idUsuario": 1,
  "idMFA": 1,
  "codigo": "123456"
}
```

#### 3. Login (Primer Factor)

```bash
POST /api/auth/login
Content-Type: application/json

{
  "usuario": "jperez123",
  "contrasena": "contraseña_temporal_recibida"
}
```

Respuesta:
```json
{
  "success": true,
  "requiereMFA": true,
  "idUsuario": 1,
  "mensaje": "Primer factor validado. Se requiere segundo factor."
}
```

#### 4. Solicitar Código MFA

```bash
POST /api/auth/mfa/email
Content-Type: application/json

{
  "idUsuario": 1
}
```

#### 5. Validar MFA y Completar Login

```bash
POST /api/auth/mfa/validar
Content-Type: application/json

{
  "idMFA": 2,
  "codigo": "654321",
  "idUsuario": 1
}
```

Respuesta:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "session": {
    "idSession": 1,
    "idUsuario": 1,
    "activo": true
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

#### 6. Usar el Token en Peticiones Autenticadas

```bash
GET /api/users/perfil
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 7. Recuperación de Contraseña

```bash
POST /api/auth/recuperar
Content-Type: application/json

{
  "email": "juan@example.com"
}
```

#### 8. Logout

```bash
POST /api/auth/logout
Authorization: Bearer tu_token_jwt
```

## Endpoints de Administración

### Ver Auditoría

```bash
GET /api/admin/auditoria?limite=50&offset=0
Authorization: Bearer tu_token_jwt
```

### Desbloquear Usuario

```bash
POST /api/admin/desbloquear/1
Authorization: Bearer tu_token_jwt
```

### Ver Sesiones Activas

```bash
GET /api/admin/sesiones
Authorization: Bearer tu_token_jwt
```

### Estadísticas del Sistema

```bash
GET /api/admin/estadisticas
Authorization: Bearer tu_token_jwt
```

## Estructura del Proyecto

```
SistemaSeguridad/
├── src/
│   ├── config/
│   │   └── database.js          # Configuración de SQLite
│   ├── controllers/
│   │   ├── authController.js    # Login, logout, MFA
│   │   ├── userController.js    # Gestión de usuarios
│   │   └── adminController.js   # Administración
│   ├── database/
│   │   ├── init.js              # Inicializador de BD
│   │   └── schema.sql           # Esquema SQL
│   ├── middleware/
│   │   ├── authMiddleware.js    # Verificación de JWT
│   │   ├── errorMiddleware.js   # Manejo de errores
│   │   ├── rateLimitMiddleware.js  # Rate limiting
│   │   └── validationMiddleware.js # Validaciones
│   ├── models/
│   │   ├── Usuario.js
│   │   ├── Session.js
│   │   ├── MFA.js
│   │   ├── TokenRecuperacion.js
│   │   ├── Acceso.js
│   │   ├── Auditoria.js
│   │   ├── CodigoVerificacion.js
│   │   ├── PreguntasSeguridad.js
│   │   ├── RespuestasSeguridad.js
│   │   └── DispositivoUSB.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── adminRoutes.js
│   │   └── index.js
│   ├── services/
│   │   ├── authService.js       # Lógica de autenticación
│   │   ├── emailService.js      # Envío de emails
│   │   └── mfaService.js        # Lógica MFA
│   ├── utils/
│   │   └── generators.js        # Generadores de tokens/códigos
│   └── index.js                 # Punto de entrada
├── database/
│   └── seguridad.db            # Base de datos SQLite
├── .env                        # Variables de entorno
├── .env.example                # Ejemplo de variables
├── .gitignore
├── package.json
├── Clase UML.png              # Diagrama UML
├── Requerimientos.md          # Requerimientos
└── README.md                  # Este archivo
```

## Seguridad

### Características de Seguridad Implementadas

1. **Encriptación de Contraseñas:** Todas las contraseñas se encriptan con bcrypt (10 rondas por defecto)

2. **JWT:** Tokens seguros con expiración configurable

3. **Rate Limiting:**
   - General: 100 peticiones cada 15 minutos
   - Login: 10 intentos cada 15 minutos
   - Registro: 5 registros por hora
   - MFA: 5 códigos cada 5 minutos

4. **Helmet:** Protección de headers HTTP

5. **Control de Intentos:** Bloqueo automático después de 4 intentos fallidos

6. **Sesiones Únicas:** No se permiten dos sesiones simultáneas

7. **Timeouts de Sesión:** Las sesiones expiran después de 30 minutos de inactividad (configurable)

8. **Auditoría Completa:** Registro de todas las acciones importantes

9. **Validación de Entrada:** Todas las entradas se validan con express-validator

10. **SQL Injection Protection:** Uso de consultas parametrizadas

## Testing

Para probar el sistema, puedes usar herramientas como:

- **Postman:** Importar la colección de endpoints
- **curl:** Usar los ejemplos de la documentación
- **Thunder Client (VSCode):** Plugin para testing de APIs

### Ejemplo de Flujo Completo

1. Registrar usuario → Recibe email con credenciales y código de validación
2. Validar cuenta con código
3. Login con usuario/contraseña → Primer factor OK
4. Solicitar código MFA por email
5. Validar código MFA → Recibe token JWT
6. Usar token para acceder a endpoints protegidos

## Troubleshooting

### Error: Base de datos no encontrada
```bash
npm run init-db
```

### Error: Email no se envía
- Verifica las credenciales en `.env`
- Si usas Gmail, necesitas una "Contraseña de Aplicación"
- En desarrollo, los códigos se muestran en consola

### Error: Token inválido
- Verifica que el token no haya expirado
- Asegúrate de incluir "Bearer " antes del token

### Error: Sesión expirada
- Las sesiones expiran después de 30 minutos de inactividad
- Vuelve a hacer login

## Licencia

Este proyecto es con fines educativos para la materia de Seguridad de la Información.

## Contacto

Para consultas o reportar problemas:
- Kevin Barrazueta
- Carolina Alvarado
- Mario Calva

---

**Nota:** Este sistema implementa todos los requerimientos de seguridad especificados y sigue fielmente el diagrama UML proporcionado.
