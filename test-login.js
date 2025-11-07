const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();

// Conectar a la base de datos
const db = new sqlite3.Database('./database/seguridad.db');

async function testLogin(usuario, contrasena) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM Usuario WHERE Usuario = ?', [usuario], async (err, user) => {
      if (err) {
        console.error('Error en la base de datos:', err);
        reject(err);
        return;
      }

      if (!user) {
        console.log('❌ Usuario no encontrado:', usuario);
        resolve(false);
        return;
      }

      console.log('\n=== Información del Usuario ===');
      console.log('ID:', user.idUsuario);
      console.log('Usuario:', user.Usuario);
      console.log('Nombres:', user.nombres, user.apellidos);
      console.log('Email:', user.email);
      console.log('Estado:', user.estado === 1 ? '✅ Activo' : '❌ Inactivo (necesita validación)');
      console.log('\n=== Verificación de Contraseña ===');
      console.log('Contraseña ingresada:', contrasena);
      console.log('Hash en BD (primeros 20 chars):', user.Contrasena.substring(0, 20) + '...');

      // Verificar contraseña
      try {
        const match = await bcrypt.compare(contrasena, user.Contrasena);
        console.log('Resultado:', match ? '✅ CONTRASEÑA CORRECTA' : '❌ CONTRASEÑA INCORRECTA');

        if (match && user.estado === 0) {
          console.log('\n⚠️  PROBLEMA: Usuario correcto pero cuenta no activada');
          console.log('   Solución: Valida la cuenta o ejecuta:');
          console.log('   sqlite3 database/seguridad.db "UPDATE Usuario SET estado = 1 WHERE Usuario = \'' + usuario + '\';"');
        } else if (match && user.estado === 1) {
          console.log('\n✅ TODO CORRECTO - El login debería funcionar');
        }

        resolve(match);
      } catch (error) {
        console.error('Error al verificar contraseña:', error);
        reject(error);
      }
    });
  });
}

// Obtener argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Uso: node test-login.js <usuario> <contraseña>');
  console.log('Ejemplo: node test-login.js kadmin787 "tu_contraseña_aqui"');
  console.log('\n=== Usuarios disponibles en la BD ===');

  db.all('SELECT Usuario, nombres, apellidos, email, estado FROM Usuario', [], (err, rows) => {
    if (err) {
      console.error('Error:', err);
    } else {
      rows.forEach(row => {
        console.log(`- ${row.Usuario} (${row.nombres} ${row.apellidos}) [${row.estado === 1 ? 'Activo' : 'Inactivo'}]`);
      });
    }
    db.close();
  });
} else {
  const usuario = args[0];
  const contrasena = args[1];

  testLogin(usuario, contrasena)
    .then(() => {
      db.close();
    })
    .catch(err => {
      console.error('Error:', err);
      db.close();
      process.exit(1);
    });
}
