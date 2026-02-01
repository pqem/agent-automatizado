import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.js'],
    exclude: ['node_modules', 'dist'],
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.js'],
      exclude: [
        'lib/**/*.test.js',
        'lib/generator.js',      // Wizard interactivo
        'lib/skill-creator.js',  // Prompts inquirer
        'lib/mcp-generator.js',  // Configuración MCP
        'lib/syncer.js'          // Sync filesystem (cubierto por ide-syncer)
      ],
      reporter: ['text', 'html'],
      thresholds: {
        lines: 90,
        functions: 70,
        branches: 80,
        statements: 90
      }
    },
    testTimeout: 10000
  }
});
