import { getDb } from '../../database';
import { Note, NoteModel } from '../model/Notes';

export const NoteController = {
  createNote: async (
    name: string,
    content: string,
    date: string, // string ISO: "2025-06-12T07:12:00.000Z"
    type: string | null,
    userId: string,
  ) => {
    const db = getDb();
    try {
      const isoDate = new Date(date);
      if (isNaN(isoDate.getTime())) {
        throw new RangeError('Data inválida');
      }

      const noteId = await NoteModel.createNote(
        db,
        name,
        content,
        isoDate.toISOString(),
        type,
        userId,
      );

      return { success: true, noteId };
    } catch (error) {
      console.error('Erro ao criar nota no controller:', error);
      return { success: false, error: 'Erro ao criar nota.' };
    }
  },

  getNotes: async (userId: string) => {
    const db = getDb();
    try {
      const notes = await NoteModel.getNotesByUserId(db, userId);
      return { success: true, data: notes };
    } catch (error) {
      console.error('Erro ao buscar notas no controller:', error);
      return { success: false, error: 'Erro ao buscar notas.' };
    }
  },

  getNotesByType: async (userId: string, type: string) => {
    const db = getDb();
    try {
      const notes = await NoteModel.getNotesByType(db, userId, type);
      return { success: true, data: notes };
    } catch (error) {
      console.error('Erro ao buscar notas por tipo no controller:', error);
      return { success: false, error: 'Erro ao buscar notas por tipo.' };
    }
  },

  getNoteById: async (noteId: string) => {
    const db = getDb();
    try {
      const note = await NoteModel.getNoteById(db, noteId);
      if (note) {
        return { success: true, data: note };
      } else {
        return { success: false, error: 'Nota não encontrada.' };
      }
    } catch (error) {
      console.error('Erro ao buscar nota por ID no controller:', error);
      return { success: false, error: 'Erro ao buscar nota por ID.' };
    }
  },

  updateNote: async (noteId: string, updates: Partial<Note>) => {
    const db = getDb();
    try {
      const changes = await NoteModel.updateNote(db, noteId, updates);
      return { success: true, updatedCount: changes };
    } catch (error) {
      console.error('Erro ao atualizar nota no controller:', error);
      return { success: false, error: 'Erro ao atualizar nota.' };
    }
  },

  deleteNote: async (noteId: string) => {
    const db = getDb();
    try {
      const changes = await NoteModel.deleteNote(db, noteId);
      return { success: changes > 0 };
    } catch (error) {
      console.error('Erro ao deletar nota no controller:', error);
      return { success: false, error: 'Erro ao deletar nota.' };
    }
  },

  clearNotesByUser: async (userId: string) => {
    const db = getDb();
    try {
      const changes = await NoteModel.clearNotesByUser(db, userId);
      return { success: true, deletedCount: changes };
    } catch (error) {
      console.error('Erro ao limpar notas no controller:', error);
      return { success: false, error: 'Erro ao limpar notas.' };
    }
  },

  getNotesDebug: async () => {
    const db = getDb();
    try {
      const notes = await NoteModel.getAllNotesDebug(db);
      return { success: true, data: notes };
    } catch (error) {
      console.error('Erro ao buscar todas as notas para debug no controller:', error);
      return { success: false, error: 'Erro ao buscar todas as notas para debug.' };
    }
  },
};
