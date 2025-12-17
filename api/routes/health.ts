import { Hono } from 'hono';
import type { HealthResponse } from '../lib/types.js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read version from package.json at startup
const packageJsonPath = resolve(__dirname, '../../package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
  version: string;
};
const version = packageJson.version;

const health = new Hono();

health.get('/', c => {
  const response: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version,
  };
  return c.json(response);
});

export { health };
