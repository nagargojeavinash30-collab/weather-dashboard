import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import config from '../config/index.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

const dbDirectory = path.dirname(config.dbPath);

if (config.dbPath !== ':memory:') {
  fs.mkdirSync(dbDirectory, { recursive: true });
}

const db = new Database(config.dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const schemaPath = path.join(currentDir, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

db.exec(schema);

export default db;