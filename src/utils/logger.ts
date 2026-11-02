// Logs de depuración: solo se emiten en desarrollo.
const noop = (..._args: unknown[]): void => {};

export const logger = {
  log: __DEV__ ? (...args: unknown[]) => console.log(...args) : noop,
  info: __DEV__ ? (...args: unknown[]) => console.info(...args) : noop,
};

export default logger;
