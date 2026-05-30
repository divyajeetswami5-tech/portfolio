# Portfolio Backend

A lightweight, security-minded **Node.js + Express** API that elevates the
static portfolio into a full-stack app. Zero database required to run — it
uses an atomic JSON flat-file store that maps cleanly onto a real DB/CMS later.

## Features

| Capability            | Endpoint                     | Notes                                                        |
| --------------------- | ---------------------------- | ------------------------------------------------------------ |
| Contact form          | `POST /api/contact`          | Strict sanitization, honeypot, rate-limited, mock notify     |
| Projects (read)       | `GET /api/projects`          | Filter by `?category=` and `?featured=`; CMS-ready schema    |
| Project detail        | `GET /api/projects/:slug`    |                                                              |
| Page-hit counter      | `POST /api/metrics/hit`      | Privacy-friendly (counts only, no PII)                       |
| Engagement counter    | `POST /api/metrics/engage`   | e.g. project link clicks                                     |
| Metrics snapshot      | `GET /api/metrics`           | Aggregate counts                                             |
| Health check          | `GET /api/health`            | For uptime monitors / load balancers                         |

## Quick start

```bash
cd server
cp .env.example .env      # then edit values
npm install
npm run dev               # auto-restarts on change (Node >= 18.17)
# or: npm start
```

The API defaults to `http://localhost:4000`.

## Connecting the frontend

The frontend calls the API same-origin by default. If the API runs on a
different origin (e.g. during local dev), set the base URL before `main.js`
loads, in `index.html`:

```html
<script>window.API_BASE = 'http://localhost:4000';</script>
```

Add that origin to `ALLOWED_ORIGINS` in `.env`. The contact form already
falls back to a `mailto:` link if the API is unreachable, so the page keeps
working even with no backend deployed.

## Security notes

- `helmet` sets hardened HTTP headers.
- All contact input is **sanitized and HTML-escaped** before storage/use.
- A **honeypot** field plus `express-rate-limit` blunt spam and abuse.
- JSON body size is capped at 16 kb.
- `trust proxy` is enabled so rate limiting sees real client IPs behind a proxy.
- No personal data is stored by the metrics counter.

## Migrating to a real database / CMS

`src/models/Project.js` documents the schema and is the only module that
touches storage. Replace the `JsonStore` calls with a Prisma/Mongoose/SQL
adapter (or point the read API at a headless CMS) without changing the routes.
