// =========================================================
// Minimal async JSON flat-file store.
// Stands in for a real database so the boilerplate runs with
// zero infra. Swap this module for a Mongo/Postgres/Prisma
// adapter later — the model layer is the only caller.
// =========================================================
import { promises as fs } from 'node:fs';
import path from 'node:path';

export class JsonStore {
  /** @param {string} filePath absolute path to the backing .json file */
  constructor(filePath) {
    this.filePath = filePath;
    this._queue = Promise.resolve(); // serialize writes to avoid races
  }

  async _ensure() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    try {
      await fs.access(this.filePath);
    } catch {
      await fs.writeFile(this.filePath, '[]', 'utf8');
    }
  }

  async readAll() {
    await this._ensure();
    const raw = await fs.readFile(this.filePath, 'utf8');
    try {
      return JSON.parse(raw || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Atomically mutate the collection. `mutator` receives the current
   * array and returns the value to persist (and optionally a result).
   */
  async write(mutator) {
    this._queue = this._queue.then(async () => {
      const current = await this.readAll();
      const { next, result } = mutator(current);
      const tmp = `${this.filePath}.tmp`;
      await fs.writeFile(tmp, JSON.stringify(next, null, 2), 'utf8');
      await fs.rename(tmp, this.filePath); // atomic on same volume
      return result;
    });
    return this._queue;
  }
}
