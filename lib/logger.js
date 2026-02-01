/**
 * Logger estructurado con niveles
 * Uso: import { logger } from './logger.js';
 */

const LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4
};

let currentLevel = LEVELS.info;

export const logger = {
  /**
   * Establecer nivel de logging
   * @param {'debug' | 'info' | 'warn' | 'error' | 'silent'} level
   */
  setLevel(level) {
    currentLevel = LEVELS[level] ?? LEVELS.info;
  },

  /**
   * Obtener nivel actual
   * @returns {string}
   */
  getLevel() {
    return Object.keys(LEVELS).find(key => LEVELS[key] === currentLevel) || 'info';
  },

  /**
   * Log de debug (solo con --verbose)
   */
  debug(...args) {
    if (currentLevel <= LEVELS.debug) {
      console.log('🔍', ...args);
    }
  },

  /**
   * Log informativo
   */
  info(...args) {
    if (currentLevel <= LEVELS.info) {
      console.log('ℹ️ ', ...args);
    }
  },

  /**
   * Mensaje de éxito
   */
  success(...args) {
    if (currentLevel <= LEVELS.info) {
      console.log('✅', ...args);
    }
  },

  /**
   * Advertencia
   */
  warn(...args) {
    if (currentLevel <= LEVELS.warn) {
      console.warn('⚠️ ', ...args);
    }
  },

  /**
   * Error
   */
  error(...args) {
    if (currentLevel <= LEVELS.error) {
      console.error('❌', ...args);
    }
  },

  /**
   * Log sin prefijo (para outputs limpios)
   */
  plain(...args) {
    if (currentLevel <= LEVELS.info) {
      console.log(...args);
    }
  },

  /**
   * Log con prefijo personalizado
   */
  log(prefix, ...args) {
    if (currentLevel <= LEVELS.info) {
      console.log(prefix, ...args);
    }
  }
};

export default logger;
