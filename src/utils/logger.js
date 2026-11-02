// Logs de depuración: solo se emiten en desarrollo.
const noop = () => {};

export const logger = {
  log: __DEV__ ? (...args) => console.log(...args) : noop,
  info: __DEV__ ? (...args) => console.info(...args) : noop,
};

export default logger;
