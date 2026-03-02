import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db: any = null;

export function getDb() {
  if (db) return db;

  try {
    // Na Vercel, o sistema de arquivos é somente leitura, exceto pela pasta /tmp
    const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
    const dbPath = isVercel 
      ? path.join('/tmp', 'mflar.db') 
      : path.join(process.cwd(), 'mflar.db');

    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new Database(dbPath, { 
      verbose: console.log,
      timeout: 5000 
    });
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export function setupDatabase() {
  try {
    const database = getDb();
    const createClientsTable =
      'CREATE TABLE IF NOT EXISTS clients (id INTEGER PRIMARY KEY AUTOINCREMENT, user_type TEXT, name TEXT, document TEXT, phone TEXT, email TEXT, status TEXT DEFAULT \'qualifying\', qualification_step TEXT DEFAULT \'ask_user_type\', estimated_value REAL, income REAL, notes TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)';
    database.exec(createClientsTable);
    console.log('Database setup complete.');
  } catch (error) {
    console.error('Error during database setup:', error);
  }
}

export default null; // Removendo export default direto para forçar uso do getDb()
