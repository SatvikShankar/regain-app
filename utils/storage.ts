// AsyncStorage wrapper — the ONLY file that touches the device store directly.
// Screens call these typed helpers and never see keys or JSON.
//
// Model (CLAUDE.md): one program object per key `program:{region}:{id}`, stored
// as a JSON string. There are no queries — to list programs we read every
// `program:` key and parse. All functions swallow failures and return safe
// defaults so a storage error never crashes the app.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StoredProgram } from '../types/program';

const PREFIX = 'program:';

function keyFor(program: StoredProgram): string {
  return `${PREFIX}${program.region}:${program.id}`;
}

export async function saveProgram(program: StoredProgram): Promise<void> {
  try {
    await AsyncStorage.setItem(keyFor(program), JSON.stringify(program));
  } catch (e) {
    if (__DEV__) console.warn('[Regain] saveProgram failed', e);
  }
}

// Read + parse every stored program. Bad/corrupt entries are skipped, not fatal.
async function readAll(): Promise<StoredProgram[]> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const programKeys = keys.filter((k) => k.startsWith(PREFIX));
    if (programKeys.length === 0) return [];
    const pairs = await AsyncStorage.multiGet(programKeys);
    const programs: StoredProgram[] = [];
    for (const [, value] of pairs) {
      if (!value) continue;
      try {
        programs.push(JSON.parse(value) as StoredProgram);
      } catch {
        // Skip a single corrupt record rather than failing the whole read.
      }
    }
    return programs;
  } catch (e) {
    if (__DEV__) console.warn('[Regain] readAll failed', e);
    return [];
  }
}

// Newest first (id is the generation timestamp).
export async function getAllPrograms(): Promise<StoredProgram[]> {
  const programs = await readAll();
  return programs.sort((a, b) => Number(b.id) - Number(a.id));
}

export async function getProgram(id: string): Promise<StoredProgram | null> {
  const programs = await readAll();
  return programs.find((p) => p.id === id) ?? null;
}

export async function deleteProgram(id: string): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const target = keys.find((k) => k.startsWith(PREFIX) && k.endsWith(`:${id}`));
    if (target) await AsyncStorage.removeItem(target);
  } catch (e) {
    if (__DEV__) console.warn('[Regain] deleteProgram failed', e);
  }
}
