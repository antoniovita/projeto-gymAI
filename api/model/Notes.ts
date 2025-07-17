import uuid from 'react-native-uuid';
import * as SQLite from 'expo-sqlite';

export interface Note {
  id: string;
  name: string;
  content: string;
  date: string;
  type?: string;
  user_id: string;
}

export const NoteModel = {
  init: async (db: SQLite.SQLiteDatabase) => {
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
  },

  createNote: async (
    db: SQLite.SQLiteDatabase,
    name: string,
    content: string,
    date: string,
    type: string | null,
    userId: string
  ): Promise<string> => {
    const noteId = uuid.v4() as string;
    await db.runAsync(
      `INSERT INTO notes (id, name, content, date, type, user_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      noteId,
      name,
      content,
      date,
      type ?? null,
      userId
    );
    return noteId;
  },

  getNotesByUserId: async (db: SQLite.SQLiteDatabase, userId: string): Promise<Note[]> => {
    return await db.getAllAsync(
      'SELECT * FROM notes WHERE user_id = ?',
      userId
    ) as Note[];
  },

  getNotesByType: async (db: SQLite.SQLiteDatabase, userId: string, type: string): Promise<Note[]> => {
    return await db.getAllAsync(
      'SELECT * FROM notes WHERE user_id = ? AND type = ?',
      userId,
      type
    ) as Note[];
  },

  getNoteById: async (
    db: SQLite.SQLiteDatabase,
    noteId: string
  ): Promise<Note | null> => {
    const notes = await db.getAllAsync(
      'SELECT * FROM notes WHERE id = ?',
      noteId
    ) as Note[];
    return notes.length > 0 ? notes[0] : null;
  },

  updateNote: async (
    db: SQLite.SQLiteDatabase,
    noteId: string,
    updates: Partial<Note>
  ): Promise<number> => {
    const fields = Object.keys(updates);
    if (fields.length === 0) return 0;

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => (updates as any)[field]);

    const result = await db.runAsync(
      `UPDATE notes SET ${setClause} WHERE id = ?`,
      ...values,
      noteId
    );

    return result.changes;
  },

  deleteNote: async (db: SQLite.SQLiteDatabase, noteId: string): Promise<number> => {
    const result = await db.runAsync(
      'DELETE FROM notes WHERE id = ?',
      noteId
    );
    return result.changes;
  },

  clearNotesByUser: async (db: SQLite.SQLiteDatabase, userId: string): Promise<number> => {
    const result = await db.runAsync(
      'DELETE FROM notes WHERE user_id = ?',
      userId
    );
    return result.changes;
  },

  getAllNotesDebug: async (db: SQLite.SQLiteDatabase): Promise<Note[]> => {
    try {
      const notes = await db.getAllAsync('SELECT * FROM notes') as Note[];
      console.log('[DEBUG] Todas as notas no banco:', notes);
      return notes;
    } catch (err) {
      console.error('[DEBUG] Erro ao listar notas:', err);
      return [];
    }
  },
};
