import { randomUUID } from "crypto";

type StoredKmz = {
  data: Buffer;
  fileName: string;
  expiresAt: number;
};

const TTL_MS = 24 * 60 * 60 * 1000;

const globalStore = globalThis as typeof globalThis & {
  __wickdKmzStore?: Map<string, StoredKmz>;
};

function getStore() {
  if (!globalStore.__wickdKmzStore) {
    globalStore.__wickdKmzStore = new Map();
  }
  return globalStore.__wickdKmzStore;
}

function pruneExpired(store: Map<string, StoredKmz>) {
  const now = Date.now();
  for (const [id, entry] of store) {
    if (entry.expiresAt <= now) store.delete(id);
  }
}

export function createSessionId(): string {
  return randomUUID();
}

export function saveKmz(sessionId: string, data: Buffer, fileName: string) {
  const store = getStore();
  pruneExpired(store);
  store.set(sessionId, {
    data,
    fileName,
    expiresAt: Date.now() + TTL_MS,
  });
}

export function getKmz(sessionId: string): StoredKmz | null {
  const store = getStore();
  pruneExpired(store);
  const entry = store.get(sessionId);
  if (!entry) return null;
  entry.expiresAt = Date.now() + TTL_MS;
  return entry;
}

export function clearKmz(sessionId: string) {
  getStore().delete(sessionId);
}
