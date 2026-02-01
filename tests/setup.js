import { beforeEach, afterEach } from 'vitest';
import { rmSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const FIXTURES_DIR = join(__dirname, 'fixtures');
export const TEMP_DIR = join(__dirname, '.temp');

beforeEach(() => {
  mkdirSync(TEMP_DIR, { recursive: true });
});

afterEach(() => {
  try {
    rmSync(TEMP_DIR, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
});
