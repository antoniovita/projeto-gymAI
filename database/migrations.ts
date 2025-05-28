import { SQLiteDatabase } from 'expo-sqlite';

export const runMigrations = async (db: SQLiteDatabase) => {

  // table user
  // pagamento pela app store 
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
    );
  `);

  // table routine
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS routine (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      day_of_week TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES user(id)
    );
  `);

  // table tasks
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT,
      date TEXT,
      type TEXT,
      completed INTEGER DEFAULT 0,
      user_id TEXT,
      routine_id TEXT,
      FOREIGN KEY (routine_id) REFERENCES routine(id),
      FOREIGN KEY (user_id) REFERENCES user(id)
    );
  `);

  // table workouts
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS workouts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      content TEXT,
      date TEXT,
      type TEXT,
      user_id TEXT,
      routine_id TEXT,
      FOREIGN KEY (routine_id) REFERENCES routine(id),
      FOREIGN KEY (user_id) REFERENCES user(id)
    );
  `);

};
