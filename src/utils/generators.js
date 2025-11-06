const crypto = require('crypto');

/**
 * Utilidades para generación de usuarios, contraseñas y tokens
 */

/**
 * Genera un nombre de usuario basado en nombres y apellidos
 * @param {string} nombres - Nombres del usuario
 * @param {string} apellidos - Apellidos del usuario
 * @returns {string} Usuario generado
 */
function generarUsuario(nombres, apellidos) {
  const primeraLetraNombre = nombres.charAt(0).toLowerCase();
  const apellidoLimpio = apellidos.split(' ')[0].toLowerCase();
  const numeroAleatorio = Math.floor(Math.random() * 1000);

  return `${primeraLetraNombre}${apellidoLimpio}${numeroAleatorio}`;
}

/**
 * Genera una contraseña segura aleatoria
 * @param {number} longitud - Longitud de la contraseña
 * @returns {string} Contraseña generada
 */
function generarContrasena(longitud = 12) {
  const mayusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const minusculas = 'abcdefghijklmnopqrstuvwxyz';
  const numeros = '0123456789';
  const especiales = '!@#$%^&*';

  const todos = mayusculas + minusculas + numeros + especiales;

  let contrasena = '';

  // Asegurar al menos un carácter de cada tipo
  contrasena += mayusculas.charAt(Math.floor(Math.random() * mayusculas.length));
  contrasena += minusculas.charAt(Math.floor(Math.random() * minusculas.length));
  contrasena += numeros.charAt(Math.floor(Math.random() * numeros.length));
  contrasena += especiales.charAt(Math.floor(Math.random() * especiales.length));

  // Completar el resto
  for (let i = contrasena.length; i < longitud; i++) {
    contrasena += todos.charAt(Math.floor(Math.random() * todos.length));
  }

  // Mezclar
  return contrasena.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Genera un token aleatorio seguro
 * @param {number} bytes - Número de bytes
 * @returns {string} Token generado
 */
function generarToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Genera un código numérico
 * @param {number} digitos - Número de dígitos
 * @returns {string} Código generado
 */
function generarCodigo(digitos = 6) {
  const min = Math.pow(10, digitos - 1);
  const max = Math.pow(10, digitos) - 1;
  return crypto.randomInt(min, max).toString();
}

module.exports = {
  generarUsuario,
  generarContrasena,
  generarToken,
  generarCodigo
};
