# Migrations

OGMOP MVP uses an in-memory store (see `src/backend/store/memory.store.js`).
No persistent database migrations are required at this stage.

When a persistent database is introduced, place versioned migration files here
(e.g. `0001_initial.sql`, `0002_add_runs.sql`).