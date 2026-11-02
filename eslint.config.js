// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

const jestGlobals = Object.fromEntries(
  ['jest', 'describe', 'test', 'it', 'expect', 'beforeEach', 'afterEach', 'beforeAll', 'afterAll'].map(
    (name) => [name, 'readonly'],
  ),
);

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    files: ['src/__tests__/**'],
    languageOptions: { globals: jestGlobals },
  },
  {
    // Reglas del React Compiler (eslint-config-expo 58): el código existente
    // las incumple en varios sitios. Se dejan como aviso hasta refactorizarlo.
    rules: {
      // Falso positivo con enums de TypeScript (p. ej. Notifications.AndroidImportance)
      'import/namespace': 'off',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/refs': 'warn',
    },
  },
]);
