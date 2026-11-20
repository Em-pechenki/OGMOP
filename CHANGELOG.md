# Changelog

Все заметные изменения проекта документируются в этом файле.
Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/).

## [Unreleased]

### Added
- switch to SEC security middleware (helmet/cors/rate-limit) in ESM

### Fixed
- correct vite build invocation for skeleton

### Changed
- apply Center-invest brand colors (green #50B848) and design tokens

### Docs
- sync backlog checkboxes and QA coverage report (QA track)
- reference openapi.yaml in API docs
- sync nodes and API docs with shared types and backend routes
- expand architecture overview, ADR, API draft, node types, changelog v0.0.0
- create docs structure (qa, security, user-guide placeholders)
- add customer TZ (Cyber Garden), backlog, adapt department TZs
- add detailed TZ per department + design commander + track
- add 30h plan, TZ folder, full permissions, director TZ workflow

### Chore
- auto-update (2026-11-20 23:14:06)
- remove temp and scratch files
- auto-update (2026-11-20 23:09:06)
- add helmet, express-rate-limit, zod
- auto-update (2026-11-20 23:04:06)
- auto-update (2026-11-20 22:59:06)
- auto-update (2026-11-20 22:29:06)
- auto-update (2026-11-20 22:24:06)
- auto-update (2026-11-20 21:59:06)
- auto-update (2026-11-20 21:54:06)
- initial project structure for OGMOP hackathon

### Other
- finalize schema docs and tsconfig types
- verify middleware, validation, secrets utils and audit artifacts
- CI/CD workflows, deploy docs, scripts, README badges
- import tokens.css in index.css
- update tailwind config (risk levels, node types, animations)
- add tokens.css with CSS variables
- add SVG assets (favicon, logo, node icons)
- add page specifications (editor, runs, templates, run detail)
- add component specifications (Button, Input, Card, Modal, Toast, Badge, Sidebar, Toolbar, NodeCard, Canvas)
- expand design tokens (colors, typography, radii, shadows, risk levels)
## [0.0.0] - 2026-11-20

### Added
- Начальная структура проекта (Vite + React + TypeScript, Express-скелет).
- CI/CD: GitHub Actions deploy to GitHub Pages.
- Техническое задание (`ТЗ/`) и план на 30 часов (`docs/plan-30h.md`).
- Бэклог задач (`docs/backlog.md`).
- Правила работы агентов (`AGENTS.md`).
- Health-эндпоинт `GET /api/health`.
- Дизайн-токены Center-invest.

