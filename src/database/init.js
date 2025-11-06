const fs = require('fs');
const path = require('path');
const database = require('../config/database');

/**
 * Inicializa la base de datos ejecutando el schema SQL
 */
async function initDatabase() {
  try {
    // Conectar a la base de datos
    await database.connect();
    console.log('Inicializando base de datos...');

    // Leer el archivo schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Dividir en sentencias individuales y ejecutarlas
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (const statement of statements) {
      await database.run(statement);
    }

    console.log('Base de datos inicializada correctamente');
    console.log('Tablas creadas según el diagrama UML');

    // Verificar tablas creadas
    const tables = await database.all(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    );

    console.log('\nTablas creadas:');
    tables.forEach(table => {
      console.log(`  - ${table.name}`);
    });

  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    process.exit(1);
  } finally {
    await database.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;
