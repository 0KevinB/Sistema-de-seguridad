/**
 * Script de migración para agregar el campo 'rol' a usuarios existentes
 * Este script actualiza la estructura de la base de datos y permite
 * asignar roles a usuarios existentes
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH || './database/seguridad.db';

console.log('=== Migración de Roles ===\n');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err.message);
    process.exit(1);
  }
  console.log('✓ Conectado a la base de datos\n');
});

// Función para ejecutar queries con promesas
function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function getAllQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function migrar() {
  try {
    console.log('1. Verificando si la columna "rol" ya existe...');

    // Verificar si la columna ya existe
    const tableInfo = await getAllQuery("PRAGMA table_info(Usuario)");
    const rolColumnExists = tableInfo.some(col => col.name === 'rol');

    if (rolColumnExists) {
      console.log('✓ La columna "rol" ya existe en la tabla Usuario\n');
    } else {
      console.log('→ Agregando columna "rol" a la tabla Usuario...');

      // Agregar la columna rol
      await runQuery(`
        ALTER TABLE Usuario
        ADD COLUMN rol TEXT DEFAULT 'user' CHECK(rol IN ('admin', 'user'))
      `);

      console.log('✓ Columna "rol" agregada exitosamente\n');
    }

    console.log('2. Actualizando usuarios existentes...');

    // Obtener todos los usuarios
    const usuarios = await getAllQuery('SELECT idUsuario, Usuario, email FROM Usuario');

    if (usuarios.length === 0) {
      console.log('→ No hay usuarios en la base de datos\n');
    } else {
      console.log(`→ Se encontraron ${usuarios.length} usuario(s)\n`);

      // Actualizar todos los usuarios sin rol a 'user'
      await runQuery("UPDATE Usuario SET rol = 'user' WHERE rol IS NULL");

      console.log('✓ Usuarios actualizados con rol "user" por defecto\n');

      // Mostrar usuarios
      console.log('Usuarios en el sistema:');
      usuarios.forEach((usuario, index) => {
        console.log(`  ${index + 1}. ${usuario.Usuario} (${usuario.email}) - ID: ${usuario.idUsuario}`);
      });
      console.log('');
    }

    console.log('3. ¿Deseas asignar un usuario como administrador?');
    console.log('   Para asignar manualmente un admin, ejecuta:');
    console.log('   node migrate-roles.js admin <idUsuario>');
    console.log('   Ejemplo: node migrate-roles.js admin 1\n');

    console.log('=== Migración completada exitosamente ===\n');

  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    process.exit(1);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('Error al cerrar la base de datos:', err.message);
      }
    });
  }
}

async function asignarAdmin(idUsuario) {
  try {
    console.log(`Asignando rol de administrador al usuario ID: ${idUsuario}...\n`);

    // Verificar que el usuario existe
    const usuario = await getAllQuery('SELECT * FROM Usuario WHERE idUsuario = ?', [idUsuario]);

    if (usuario.length === 0) {
      console.error(`❌ No se encontró ningún usuario con ID: ${idUsuario}`);
      process.exit(1);
    }

    // Actualizar el rol
    await runQuery("UPDATE Usuario SET rol = 'admin' WHERE idUsuario = ?", [idUsuario]);

    console.log(`✓ Usuario ${usuario[0].Usuario} (${usuario[0].email}) ahora es administrador\n`);
    console.log('=== Rol asignado exitosamente ===\n');

  } catch (error) {
    console.error('❌ Error al asignar rol de admin:', error.message);
    process.exit(1);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('Error al cerrar la base de datos:', err.message);
      }
    });
  }
}

// Procesar argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.length === 2 && args[0] === 'admin') {
  const idUsuario = parseInt(args[1]);
  if (isNaN(idUsuario)) {
    console.error('❌ El ID del usuario debe ser un número');
    process.exit(1);
  }
  asignarAdmin(idUsuario);
} else {
  migrar();
}
