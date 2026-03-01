import type { SessionStore } from './store/types.js';
import { FileStore } from './store/file-store.js';
import { FirestoreStore } from './store/firestore-store.js';

// Re-export all types so existing imports in the project keep working
export * from './store/types.js';
export { FileStore, FirestoreStore };

// Factory: use FileStore in dev, FirestoreStore in production
export function createStore(): SessionStore {
  if (process.env.NODE_ENV === 'production') {
    return new FirestoreStore();
  }
  const store = new FileStore();
  console.log('💾 Using file-based session store (development mode)');
  return store;
}
