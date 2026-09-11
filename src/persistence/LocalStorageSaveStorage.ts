import type { SaveStorage } from './SaveStorage';

export class LocalStorageSaveStorage implements SaveStorage {
    public get(key: string): string | null {
        try {
            return globalThis.localStorage.getItem(key);
        } catch {
            return null;
        }
    }

    public set(key: string, value: string): void {
        try {
            globalThis.localStorage.setItem(key, value);
        } catch {
            // Persistence is optional when storage is unavailable or blocked.
        }
    }

    public remove(key: string): void {
        try {
            globalThis.localStorage.removeItem(key);
        } catch {
            // Persistence is optional when storage is unavailable or blocked.
        }
    }
}
