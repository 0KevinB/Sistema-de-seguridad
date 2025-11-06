const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

/**
 * Configuración de la base de datos SQLite
 * Crea y gestiona la conexión a la base de datos
 */
class Database {
  constructor() {
    this.db = null;
  }

  /**
   * Conecta a la base de datos SQLite
   * @returns {Promise<sqlite3.Database>} Instancia de la base de datos
   */
  connect() {
    return new Promise((resolve, reject) => {
      const dbPath = process.env.DB_PATH || path.join(__dirname, '../../database/seguridad.db');

      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error al conectar a la base de datos:', err.message);
          reject(err);
        } else {
          console.log('Conectado a la base de datos SQLite');
          // Habilitar claves foráneas
          this.db.run('PRAGMA foreign_keys = ON');
          resolve(this.db);
        }
      });
    });
  }

  /**
   * Ejecuta una consulta SQL
   * @param {string} sql - Consulta SQL
   * @param {Array} params - Parámetros de la consulta
   * @returns {Promise<any>} Resultado de la consulta
   */
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  /**
   * Obtiene un registro
   * @param {string} sql - Consulta SQL
   * @param {Array} params - Parámetros de la consulta
   * @returns {Promise<any>} Registro encontrado
   */
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  /**
   * Obtiene múltiples registros
   * @param {string} sql - Consulta SQL
   * @param {Array} params - Parámetros de la consulta
   * @returns {Promise<Array>} Array de registros
   */
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Cierra la conexión a la base de datos
   * @returns {Promise<void>}
   */
  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err);
          } else {
            console.log('Conexión a la base de datos cerrada');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = new Database();
