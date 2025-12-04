// jest.config.js
const nextJest = require('next/jest')

// Configuración de Next.js para Jest
const createJestConfig = nextJest({
  // Ruta al directorio de Next.js
  dir: './',
})

// Configuración personalizada de Jest
const customJestConfig = {
  // Directorio donde buscar tests
  testMatch: [
    '**/__tests__/**/*.(test|spec).[jt]s?(x)',
    '**/?(*.)+(test|spec).[jt]s?(x)'
  ],

  // Setup files (ejecutados antes de cada test)
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Entorno de ejecución (jsdom para componentes React)
  testEnvironment: 'jest-environment-jsdom',

  // Alias de módulos (igual que en tsconfig.json)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Archivos a ignorar
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
  ],

  // Coverage (opcional)
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],
}

// Exportar configuración combinada con Next.js
module.exports = createJestConfig(customJestConfig)
