
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(currentDir, '..', '..');

const envFile = path.join(rootDir, '.env');

if (fs.existsSync(envFile) && typeof process.loadEnvFile === 'function') {
  process.loadEnvFile(envFile);
}

const dbPathSetting = process.env.DB_PATH || 'server/db/weather.db';

const config = {
  rootDir,
  port: Number(process.env.PORT) || 3000,

  dbPath: dbPathSetting === ':memory:'
    ? ':memory:'
    : path.resolve(rootDir, dbPathSetting),

  history: {
    visibleLimit: 8,
    maxStored: 50,
  },

  upstream: {
    timeoutMs: 8000,
    geocodingUrl: 'https://geocoding-api.open-meteo.com/v1/search',
    forecastUrl: 'https://api.open-meteo.com/v1/forecast',
    airQualityUrl: 'https://air-quality-api.open-meteo.com/v1/air-quality',
  },
};

export default config;
