import { SQLiteDatabase } from 'expo-sqlite';

export const runMigrations = async (db: SQLiteDatabase) => {

  // table user
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );
  `);

  // table tasks
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT,
      datetime TEXT, 
      type TEXT,
      completed INTEGER DEFAULT 0,
      user_id TEXT,
      FOREIGN KEY (user_id) REFERENCES user(id)
    );
  `);

    // table expenses
    // amount in cents (INTEGER)
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

  // table workouts
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
