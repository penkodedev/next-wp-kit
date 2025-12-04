// jest.setup.js
// Configuración global para todos los tests

// Importar matchers de testing-library para DOM
import '@testing-library/jest-dom';

// Polyfills para APIs del navegador que no existen en Node.js
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock de fetch (Next.js lo incluye pero Jest no)
if (!global.fetch) {
  global.fetch = jest.fn();
}

// Variables de entorno para tests
process.env.NEXT_PUBLIC_WORDPRESS_API_URL = 'http://localhost/wp-json';
process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
