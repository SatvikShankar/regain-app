// The app's single in-memory copy of the user's programs (Zustand). Screens and
// sheets read from here, so a change made anywhere (a check-in sheet on Home, a
// rename on Program) shows everywhere instantly, with no reload or flicker.
// Every write updates memory first, then persists via utils/storage.ts.

import { create } from 'zustand';
import { StoredProgram } from '../types/program';
import { deleteAllData, deleteProgram, loadPrograms, saveProgram } from '../utils/storage';

interface ProgramState {
  programs: StoredProgram[];   // newest first
  loaded: boolean;             // false until storage has answered once
  load: () => Promise<void>;
  save: (program: StoredProgram) => Promise<void>;   // insert or replace by id
  remove: (program: StoredProgram) => Promise<void>;
  clearAll: () => Promise<void>;
}

function newestFirst(list: StoredProgram[]): StoredProgram[] {
  return [...list].sort((a, b) => Number(b.id) - Number(a.id));
}

export const useProgramStore = create<ProgramState>((set, get) => ({
  programs: [],
  loaded: false,

  load: async () => {
    const programs = await loadPrograms();
    set({ programs, loaded: true });
  },

  save: async (program) => {
    const others = get().programs.filter((p) => p.id !== program.id);
    set({ programs: newestFirst([...others, program]) });
    await saveProgram(program);
  },

  remove: async (program) => {
    set({ programs: get().programs.filter((p) => p.id !== program.id) });
    await deleteProgram(program);
  },

  clearAll: async () => {
    set({ programs: [] });
    await deleteAllData();
  },
}));

// Convenience selector: one program by id (re-renders only when it changes).
export function useProgram(id: string | undefined): StoredProgram | undefined {
  return useProgramStore((s) => (id ? s.programs.find((p) => p.id === id) : undefined));
}
