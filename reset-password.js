const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/seguridad.db');

async function resetPassword(usuario, nuevaContrasena) {
  try {
    // Hashear la nueva contraseña
    const hash = await bcrypt.hash(nuevaContrasena, 10);

    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE Usuario SET Contrasena = ?, estado = 1 WHERE Usuario = ?',
        [hash, usuario],
        function(err) {
          if (err) {
            console.error('❌ Error:', err);
            reject(err);
          } else if (this.changes === 0) {
            console.log('❌ Usuario no encontrado:', usuario);
            resolve(false);
          } else {
            console.log('✅ Contraseña actualizada exitosamente');
            console.log('Usuario:', usuario);
            console.log('Nueva contraseña:', nuevaContrasena);
            console.log('Estado: Activo');
            console.log('\n✅ Ahora puedes hacer login con estas credenciales');
            resolve(true);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error al hashear contraseña:', error);
    throw error;
  }
}

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Uso: node reset-password.js <usuario> <nueva_contraseña>');
  console.log('Ejemplo: node reset-password.js kadmin787 "MiPassword123!"');
  console.log('\n⚠️  Este script actualiza la contraseña directamente en la BD');
  process.exit(1);
} else {
  const usuario = args[0];
  const nuevaContrasena = args[1];

  resetPassword(usuario, nuevaContrasena)
    .then(() => {
      db.close();
    })
    .catch(err => {
      console.error('Error:', err);
      db.close();
      process.exit(1);
    });
}
