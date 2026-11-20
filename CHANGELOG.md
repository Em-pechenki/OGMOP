# Changelog

Все заметные изменения проекта документируются в этом файле.
Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/).

## [Unreleased]

### Added
- Структура документации `docs/` (api, architecture, design, qa, security, user-guide).
- `README.md` с quick start и структурой проекта.
- `docs/architecture/overview.md`: стек, каталоги, потоки данных, диаграмма компонентов.
- `docs/architecture/decisions.md`: ADR (React Flow, Express, in-memory store, LLM, модульность нод).
- `docs/api/README.md`: черновик API-контрактов.
- `docs/nodes.md`: описание типов нод (trigger, logic, scanner, notify, ai).
- `docs/design/tokens.md`: дизайн-токены (Center-invest).

## [0.0.0] - 2026-11-20

### Added
- Начальная структура проекта (Vite + React + TypeScript, Express-скелет).
- CI/CD: GitHub Actions deploy to GitHub Pages.
- Техническое задание (`ТЗ/`) и план на 30 часов (`docs/plan-30h.md`).
- Бэклог задач (`docs/backlog.md`).
- Правила работы агентов (`AGENTS.md`).
- Health-эндпоинт `GET /api/health`.
- Дизайн-токены Center-invest.
