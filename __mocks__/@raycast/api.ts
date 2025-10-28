// Minimal mock for @raycast/api used in unit tests
export const LocalStorage = {
  _store: new Map<string, string>(),
  async getItem<T extends string | undefined>(key: string): Promise<T | null> {
    return (this._store.has(key) ? (this._store.get(key) as T) : null) as any;
  },
  async setItem(key: string, value: string): Promise<void> {
    this._store.set(key, value);
  },
  async removeItem(key: string): Promise<void> {
    this._store.delete(key);
  },
  async clear(): Promise<void> {
    this._store.clear();
  },
};

export const Toast = { Style: { Success: "success", Failure: "failure" } } as const;
export const environment = { platform: "macos", extensionOwner: "test", extensionName: "test" } as const;
export async function showToast() { /* noop */ }
export async function showHUD() { /* noop */ }
export async function open() { /* noop */ }
export async function closeMainWindow() { /* noop */ }
export const Clipboard = { async readText() { return null as string | null; } };
