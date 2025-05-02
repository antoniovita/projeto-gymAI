import { SQLiteDatabase } from 'expo-sqlite';

export const runMigrations = async (db: SQLiteDatabase) => {
  // table user
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );
  `);

  // table routine
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS routine (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      day_of_week TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES user(id)
    );
  `);

  // table tasks
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT,
      type TEXT,
      completed INTEGER DEFAULT 0,
      user_id INTEGER,
      routine_id INTEGER,
      FOREIGN KEY (routine_id) REFERENCES routine(id),
      FOREIGN KEY (user_id) REFERENCES user(id)
    );
  `);

  // table goals
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      goal_type TEXT,
      deadline TEXT, -- prazo em formato 'YYYY-MM-DD HH:MM:SS'
      completed INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES user(id)
    );
  `);

};
