// =========================================================
// /api/projects
// Read API for project content (CMS-ready data layer).
// =========================================================
import { Router } from 'express';
import { Project, PROJECT_CATEGORIES } from '../models/Project.js';

const router = Router();

// GET /api/projects?category=web&featured=true
router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.category && PROJECT_CATEGORIES.includes(req.query.category)) {
    filter.category = req.query.category;
  }
  if (req.query.featured != null) {
    filter.featured = req.query.featured === 'true';
  }
  const projects = await Project.all(filter);
  res.json({ ok: true, count: projects.length, projects });
});

// GET /api/projects/:slug
router.get('/:slug', async (req, res) => {
  const project = await Project.findBySlug(req.params.slug);
  if (!project) {
    return res.status(404).json({ ok: false, error: 'Project not found.' });
  }
  res.json({ ok: true, project });
});

export default router;
