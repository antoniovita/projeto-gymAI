import { Note } from '../model/Notes';
import { NoteController } from '../controller/noteController';

export const NoteService = {
  createNote: async (
    name: string,
    content: string,
    date: string,
    type: string | null,
    userId: string,
  ): Promise<string> => {
    const response = await NoteController.createNote(name, content, date, type, userId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao criar nota.');
    }
    return response.noteId!;
  },

  getNotes: async (userId: string): Promise<Note[]> => {
    const response = await NoteController.getNotes(userId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar notas.');
    }
    return response.data!;
  },

  getNotesByType: async (userId: string, type: string): Promise<Note[]> => {
    const response = await NoteController.getNotesByType(userId, type);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar notas por tipo.');
    }
    return response.data!;
  },

  getNoteById: async (noteId: string): Promise<Note> => {
    const response = await NoteController.getNoteById(noteId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar nota por ID.');
    }
    return response.data!;
  },

  updateNote: async (noteId: string, updates: Partial<Note>): Promise<number> => {
    const response = await NoteController.updateNote(noteId, updates);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao atualizar nota.');
    }
    return response.updatedCount!;
  },

  deleteNote: async (noteId: string): Promise<boolean> => {
    const response = await NoteController.deleteNote(noteId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao deletar nota.');
    }
    return true;
  },

  clearNotesByUser: async (userId: string): Promise<number> => {
    const response = await NoteController.clearNotesByUser(userId);
    if (!response.success) {
      throw new Error(response.error || 'Erro ao limpar notas.');
    }
    return response.deletedCount!;
  },

  debugAllNotes: async (): Promise<Note[]> => {
    const response = await NoteController.getNotesDebug();
    if (!response.success) {
      throw new Error(response.error || 'Erro ao buscar todas as notas para debug.');
    }
    return response.data!;
  },
};
