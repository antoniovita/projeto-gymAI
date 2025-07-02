import { SQLiteDatabase } from 'expo-sqlite';

export const runMigrations = async (db: SQLiteDatabase) => {

  // 1) table user
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );
  `);

  // 2) table routine
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS routine (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      day_of_week INTEGER NOT NULL,       -- 0=domingo … 6=sábado
      FOREIGN KEY (user_id) REFERENCES user(id)
    );
  `);

  // 3) table tasks (sem rotina vinculada diretamente)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT,
      datetime TEXT NOT NULL,
      type TEXT,
      user_id TEXT,
      FOREIGN KEY (user_id) REFERENCES user(id)
    );
  `);

  // 4) join table task_routine (muitos-para-muitos)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS task_routine (
      task_id    TEXT NOT NULL,
      routine_id TEXT NOT NULL,
      PRIMARY KEY (task_id, routine_id),
      FOREIGN KEY (task_id)   REFERENCES tasks(id)   ON DELETE CASCADE,
      FOREIGN KEY (routine_id) REFERENCES routine(id) ON DELETE CASCADE
    );
  `);

  // 5) table to track completion per task per date
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS task_completion (
      task_id TEXT NOT NULL,
      date    TEXT NOT NULL,                -- 'YYYY-MM-DD'
      PRIMARY KEY (task_id, date),
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );
  `);

  // 6) table expenses
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      date TEXT,
      time TEXT,
      amount INTEGER NOT NULL,
      type TEXT,
      user_id TEXT,
      FOREIGN KEY (user_id) REFERENCES user(id)
    );
  `);

  // 7) table workouts
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS workouts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      content TEXT,
      date TEXT,
      type TEXT,
      user_id TEXT,
      FOREIGN KEY (user_id) REFERENCES user(id)
    );
  `);
};
