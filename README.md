# Hearth — Family Hub V1

Hearth is a mobile-first, installable Family Hub experience: a calm shared dashboard for calendar, tasks, meals, groceries, goals, memories, maintenance, and private spaces. This repository contains the dependency-free front-end foundation and an interactive local data adapter.

> **Security boundary:** this static build is a UX/reference implementation, not a production authentication server. Browser storage is intentionally treated as untrusted. Do not deploy it with real private, financial, journal, or document data. Production authorization must be enforced by the server described in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md); hiding a screen is never authorization.

## Run locally

```bash
python3 -m http.server 4173
# open http://localhost:4173
```

No package installation or build step is required. Serving over HTTP enables the service worker and installable PWA behavior. Directly opening `index.html` works, but service workers are unavailable on `file:` URLs.

## Included V1 experience

- Responsive family dashboard with a prominent combined calendar
- Persisted task completion, grocery history, quick-add, family posts, and navigation
- Full module surfaces for lists, meals/recipes, goals/rewards, maintenance, gallery, journal, and portfolio invitations
- Explicit secure shells for Finance and Document Vault—without fake financial behavior
- Offline application shell, web manifest, accessible labels, keyboard focus, and reduced-motion support
- Escaped user-generated text and no dynamic script evaluation

Reset demo data with `localStorage.removeItem('hearth-family-hub-v1')` in browser developer tools.

## Checks

```bash
node --check script.js
node tests/smoke.mjs
python3 -m json.tool manifest.webmanifest
```

## Production path

The next deployment phase replaces the local adapter with a versioned API while preserving module contracts. Recommended portable stack: TypeScript, a mature Node LTS server, PostgreSQL, an S3-compatible object store, Argon2id passwords, WebAuthn/TOTP MFA, and a server-side session store. See:

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — domain boundaries and source-of-truth rules
- [`docs/SECURITY.md`](docs/SECURITY.md) — threat model and deny-by-default controls
- [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) — normalized production entities and lifecycle

## Deployment notes

Host the static client from any standards-compliant web server with HTTPS. In production, set a strict Content Security Policy, use same-site secure cookies, keep API and session secrets in environment variables, and run PostgreSQL migrations before the application rollout. Uploaded originals must remain exportable from an S3-compatible bucket; never store bank credentials.
