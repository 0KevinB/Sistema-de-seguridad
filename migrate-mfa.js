const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/seguridad.db');

console.log('Agregando columna "usado" a la tabla MFA...');

db.run('ALTER TABLE MFA ADD COLUMN usado BOOLEAN DEFAULT 0', (err) => {
  if (err) {
    if (err.message.includes('duplicate column')) {
      console.log('✅ La columna "usado" ya existe');
    } else {
      console.error('❌ Error:', err.message);
    }
  } else {
    console.log('✅ Columna "usado" agregada exitosamente');
  }

  db.close();
});
