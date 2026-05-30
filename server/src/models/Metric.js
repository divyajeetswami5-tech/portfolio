// =========================================================
// Metric model — a lightweight engagement counter.
//
// Tracks aggregate page hits and per-key project engagement.
// Stores ONLY counts (no IPs, no PII) so it's privacy-friendly
// and cheap. Backed by JsonStore today; the same tiny API maps
// onto Redis INCR or a SQL "counters" table later.
// =========================================================
import path from 'node:path';
import { JsonStore } from '../utils/jsonStore.js';
import { config } from '../config.js';
import { cleanString } from '../utils/sanitize.js';

const store = new JsonStore(path.join(config.dataDir, 'metrics.json'));

// JsonStore is array-based; we keep a single object as element [0].
const readState = async () => {
  const arr = await store.readAll();
  return arr[0] || { pageHits: 0, byPath: {}, engagement: {}, updatedAt: null };
};

export const Metric = {
  async snapshot() {
    return readState();
  },

  /** Increment total page hits and the per-path bucket. */
  async hit(rawPath = '/') {
    const key = cleanString(rawPath, 200) || '/';
    return store.write((arr) => {
      const state = arr[0] || { pageHits: 0, byPath: {}, engagement: {} };
      state.pageHits = (state.pageHits || 0) + 1;
      state.byPath = state.byPath || {};
      state.byPath[key] = (state.byPath[key] || 0) + 1;
      state.updatedAt = new Date().toISOString();
      return { next: [state], result: state };
    });
  },

  /** Increment engagement for a named target, e.g. a project slug. */
  async engage(rawKey) {
    const key = cleanString(rawKey, 120);
    if (!key) return null;
    return store.write((arr) => {
      const state = arr[0] || { pageHits: 0, byPath: {}, engagement: {} };
      state.engagement = state.engagement || {};
      state.engagement[key] = (state.engagement[key] || 0) + 1;
      state.updatedAt = new Date().toISOString();
      return { next: [state], result: { key, count: state.engagement[key] } };
    });
  }
};
