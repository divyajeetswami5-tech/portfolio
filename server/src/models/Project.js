// =========================================================
// Project model + schema.
//
// This is the single source of truth for a "Project" record.
// It is intentionally storage-agnostic: today it persists to a
// JSON file via JsonStore, but the SCHEMA below maps 1:1 to a
// future SQL table or a headless-CMS content type, so migrating
// to Strapi / Sanity / Contentful / Prisma is a drop-in change.
// =========================================================
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { JsonStore } from '../utils/jsonStore.js';
import { config } from '../config.js';
import { cleanString } from '../utils/sanitize.js';

/**
 * PROJECT SCHEMA (reference for DB/CMS migration)
 * -------------------------------------------------------------------
 * id          string   PK / uuid
 * slug        string   unique, URL-safe identifier
 * title       string   required
 * category    enum     'data' | 'web' | 'app'
 * summary     string   short description (card copy)
 * description text      long-form details
 * stack       string[] technologies used
 * liveUrl     string   nullable
 * sourceUrl   string   nullable
 * featured    boolean  show on homepage
 * order       number   manual sort weight
 * createdAt   ISODate
 * updatedAt   ISODate
 * -------------------------------------------------------------------
 */
export const PROJECT_CATEGORIES = ['data', 'web', 'app'];

const store = new JsonStore(path.join(config.dataDir, 'projects.json'));

const slugify = (str) =>
  cleanString(str, 80)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Normalize arbitrary input into a valid, fully-formed Project record. */
export function normalizeProject(input = {}, existing = null) {
  const now = new Date().toISOString();
  const title = cleanString(input.title, 160);
  const category = PROJECT_CATEGORIES.includes(input.category)
    ? input.category
    : 'web';

  return {
    id: existing?.id || input.id || randomUUID(),
    slug: cleanString(input.slug, 80) ? slugify(input.slug) : slugify(title),
    title,
    category,
    summary: cleanString(input.summary, 280),
    description: cleanString(input.description, 5000),
    stack: Array.isArray(input.stack)
      ? input.stack.map((s) => cleanString(s, 40)).filter(Boolean).slice(0, 24)
      : [],
    liveUrl: cleanString(input.liveUrl, 500) || null,
    sourceUrl: cleanString(input.sourceUrl, 500) || null,
    featured: Boolean(input.featured),
    order: Number.isFinite(Number(input.order)) ? Number(input.order) : 0,
    createdAt: existing?.createdAt || now,
    updatedAt: now
  };
}

export const Project = {
  async all({ category, featured } = {}) {
    let items = await store.readAll();
    if (category) items = items.filter((p) => p.category === category);
    if (featured != null) items = items.filter((p) => p.featured === featured);
    return items.sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt));
  },

  async findBySlug(slug) {
    const items = await store.readAll();
    return items.find((p) => p.slug === slug) || null;
  },

  async create(input) {
    const record = normalizeProject(input);
    return store.write((items) => {
      // Enforce slug uniqueness.
      let slug = record.slug || record.id;
      const taken = new Set(items.map((p) => p.slug));
      let n = 2;
      while (taken.has(slug)) slug = `${record.slug}-${n++}`;
      record.slug = slug;
      return { next: [...items, record], result: record };
    });
  },

  /** Idempotent seed used on first boot so the API has demo content. */
  async seedIfEmpty(seed = []) {
    const items = await store.readAll();
    if (items.length) return items;
    const records = seed.map((s) => normalizeProject(s));
    await store.write(() => ({ next: records, result: records }));
    return records;
  }
};
