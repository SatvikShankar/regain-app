// AsyncStorage wrapper — the ONLY file that touches the device store. Everything
// above it (the program store, screens) calls these typed helpers and never sees
// keys or JSON. Swapping to a backend later means reimplementing this file's
// functions against an API; nothing above it changes.
//
// Model (CLAUDE.md): one program object per key `program:{region}:{id}`, plus one
// `profile` key. Records are upgraded to the current schema on read (and written
// back, so the upgrade happens once). Failures return safe defaults — a storage
// error never crashes the app.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CURRENT_PROFILE_SCHEMA, CURRENT_PROGRAM_SCHEMA, Profile, StoredProgram } from '../types/program';
import { migrateProgram } from './storageMigrations';

const PROGRAM_PREFIX = 'program:';
const PROFILE_KEY = 'profile';

function keyFor(program: StoredProgram): string {
  return `${PROGRAM_PREFIX}${program.region}:${program.id}`;
}

export async function saveProgram(program: StoredProgram): Promise<void> {
  try {
    await AsyncStorage.setItem(keyFor(program), JSON.stringify(program));
  } catch (e) {
    if (__DEV__) console.warn('[Regain] saveProgram failed', e);
  }
}

// Every stored program, upgraded to the current schema, newest first. Corrupt or
// unreadable records are skipped, not fatal.
export async function loadPrograms(): Promise<StoredProgram[]> {
  try {
    const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(PROGRAM_PREFIX));
    if (keys.length === 0) return [];
    const pairs = await AsyncStorage.multiGet(keys);
    const programs: StoredProgram[] = [];
    for (const [, value] of pairs) {
      if (!value) continue;
      try {
        const parsed = JSON.parse(value);
        const program = migrateProgram(parsed);
        if (!program) continue;
        if (parsed.schemaVersion !== CURRENT_PROGRAM_SCHEMA) await saveProgram(program);
        programs.push(program);
      } catch {
        // Skip a single corrupt record rather than failing the whole read.
      }
    }
    return programs.sort((a, b) => Number(b.id) - Number(a.id));
  } catch (e) {
    if (__DEV__) console.warn('[Regain] loadPrograms failed', e);
    return [];
  }
}

export async function deleteProgram(program: StoredProgram): Promise<void> {
  try {
    await AsyncStorage.removeItem(keyFor(program));
  } catch (e) {
    if (__DEV__) console.warn('[Regain] deleteProgram failed', e);
  }
}

export async function loadProfile(): Promise<Profile> {
  try {
    const value = await AsyncStorage.getItem(PROFILE_KEY);
    if (value) return JSON.parse(value) as Profile;
  } catch (e) {
    if (__DEV__) console.warn('[Regain] loadProfile failed', e);
  }
  return { schemaVersion: CURRENT_PROFILE_SCHEMA };
}

export async function saveProfile(profile: Profile): Promise<void> {
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    if (__DEV__) console.warn('[Regain] saveProfile failed', e);
  }
}

// Wipes programs and profile (Settings → Delete all data).
export async function deleteAllData(): Promise<void> {
  try {
    const keys = (await AsyncStorage.getAllKeys()).filter(
      (k) => k.startsWith(PROGRAM_PREFIX) || k === PROFILE_KEY
    );
    await AsyncStorage.multiRemove(keys);
  } catch (e) {
    if (__DEV__) console.warn('[Regain] deleteAllData failed', e);
  }
}
