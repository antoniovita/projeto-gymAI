import { useEffect, useState, useCallback } from 'react';
import { Note } from '../api/model/Notes';
import { NoteService } from '../api/service/noteService';

export function useNotes(userId: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await NoteService.getNotes(userId);
      setNotes(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar notas.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createNote = useCallback(async (note: {
    name: string;
    content: string;
    date: string;
    type: string | null;
  }) => {
    try {
      const noteId = await NoteService.createNote(
        note.name,
        note.content,
        note.date,
        note.type,
        userId
      );
      await fetchNotes();
      return noteId;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [userId, fetchNotes]);

  const deleteNote = useCallback(async (noteId: string) => {
    try {
      await NoteService.deleteNote(noteId);
      await fetchNotes();
    } catch (err: any) {
      setError(err.message);
    }
  }, [fetchNotes]);

  const updateNote = useCallback(async (noteId: string, updates: Partial<Note>) => {
    try {
      await NoteService.updateNote(noteId, updates);
      await fetchNotes();
    } catch (err: any) {
      setError(err.message);
    }
  }, [fetchNotes]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return {
    notes,
    loading,
    error,
    fetchNotes,
    createNote,
    deleteNote,
    updateNote,
  };
}
