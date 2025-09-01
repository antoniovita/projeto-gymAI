import { SQLiteDatabase } from 'expo-sqlite';

export const runMigrations = async (db: SQLiteDatabase): Promise<void> => {
  try {
    console.log('Executando migrações...');

    // table category
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS category (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        type TEXT NOT NULL
      );
    `);
    console.log('Tabela user criada/verificada');
    
    // table user
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS user (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        level INTEGER DEFAULT 1,
        xp INTEGER DEFAULT 0,
        achievements TEXT DEFAULT "[]",
        badges TEXT DEFAULT "[]"
      );
    `);
    console.log('Tabela user criada/verificada');

    // table tasks
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT,
        datetime TEXT,
        type TEXT,
        completed INTEGER DEFAULT 0,
        xp_awarded INTEGER DEFAULT 0,
        user_id TEXT,
        FOREIGN KEY (user_id) REFERENCES user(id)
      );
    `);
    console.log('Tabela tasks criada/verificada');

    // table routine_tasks
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS routine_tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT,
        type TEXT,
        week_days TEXT NOT NULL, -- JSON string: ["monday","tuesday","friday"]
        days_completed TEXT DEFAULT "[]", -- JSON string: [{"date":"2024-01-15","xp_granted":50,"completed_at":"2024-01-15T10:30:00Z"}]
        cancelled_days TEXT DEFAULT "[]", -- JSON string: [datetime, datetime...]
        created_at TEXT NOT NULL,
        is_active INTEGER DEFAULT 1, -- 0 = inativo, 1 = ativo
        user_id TEXT,
        FOREIGN KEY (user_id) REFERENCES user(id)
      );
    `);
    console.log('Tabela routine_tasks criada/verificada');

    // table expenses
    // amount in cents (INTEGER)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        date TEXT,
        time TEXT,
        amount INTEGER NOT NULL,
        expense_type TEXT,
        type TEXT,
        user_id TEXT,
        FOREIGN KEY (user_id) REFERENCES user(id)
      );
    `);
    console.log('Tabela expenses criada/verificada');

    // table workouts
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS workouts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        exercises TEXT NOT NULL,
        date TEXT,
        type TEXT,
        user_id TEXT,
        FOREIGN KEY (user_id) REFERENCES user(id)
      );
    `);
    console.log('Tabela workouts criada/verificada');

    // table notes
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        content TEXT,
        date TEXT,
        type TEXT,
        user_id TEXT,
        FOREIGN KEY (user_id) REFERENCES user(id)
      );
    `);
    console.log('Tabela notes criada/verificada');

    // table goals
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL,
        deadline TEXT,
        progress INTEGER DEFAULT 0,
        user_id TEXT,
        completed INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES user(id)
      );
    `);
    console.log('Tabela goals criada/verificada');
    
    console.log('Todas as migrações executadas com sucesso');
  } catch (error) {
    console.error('Erro ao executar migrações:', error);
    throw error;
  }
};