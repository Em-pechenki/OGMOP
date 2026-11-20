# OGMOP - AI Security Workflow

[![CI](https://github.com/Em-pechenki/OGMOP/actions/workflows/ci.yml/badge.svg)](https://github.com/Em-pechenki/OGMOP/actions/workflows/ci.yml)
[![Deploy to GitHub Pages](https://github.com/Em-pechenki/OGMOP/actions/workflows/deploy.yml/badge.svg)](https://github.com/Em-pechenki/OGMOP/actions/workflows/deploy.yml)
[![GitHub Pages](https://img.shields.io/badge/Pages-live-brightgreen)](https://Em-pechenki.github.io/OGMOP/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](#)

OGMOP - визуальный конструктор security-workflow для репозиториев: drag-and-drop редактор графа (React Flow), сканеры (secrets / SCA / SAST для Kotlin + Spring Boot + Gradle), AI-анализ находок, шаблоны workflow, уведомления и CI/CD. Деплой на GitHub Pages.

Актуальная версия: **v1.1.0** (Cyber Garden 2026, трек <AI Security Workflow>).

- **Демо (GitHub Pages):** https://Em-pechenki.github.io/OGMOP/
- **Демо-сценарий:** [docs/demo.md](docs/demo.md)
- **Руководство пользователя:** [docs/user-guide/README.md](docs/user-guide/README.md)
- **Техническое задание:** `ТЗ/tz.md`, `ТЗ/отделы/*.md`

## Быстрый старт

Требования: Node.js 20+, npm.

```bash
git clone https://github.com/Em-pechenki/OGMOP.git
cd OGMOP
npm install
```

### Фронтенд (Vite + React)

```bash
npm run dev       # dev-сервер http://localhost:5173
npm run build     # production-сборка в dist/
npm run preview   # локальный просмотр сборки
npm run lint      # ESLint для src и tests
npm test          # Vitest (unit/e2e/smoke/regression)
```

### Бэкенд (Express, сканеры/AI/уведомления)

```bash
npm run server    # http://localhost:3001, порт можно переопределить через PORT
```

Проверка: `curl http://localhost:3001/api/health` -> `{ "status": "ok", "project": "OGMOP" }`.

Подробнее: [docs/user-guide/installation.md](docs/user-guide/installation.md), [docs/user-guide/quickstart.md](docs/user-guide/quickstart.md), [docs/deploy.md](docs/deploy.md).

## Структура проекта

```text
OGMOP/
├── src/
│   ├── frontend/        # React + Vite + TypeScript (UI, редактор workflow)
│   ├── backend/         # Node.js + Express (API, сканеры, AI, уведомления)
│   └── shared/          # Общие типы и схемы (FE + BE)
├── public/              # Статические ассеты
├── tests/               # Vitest (unit, integration, e2e, smoke, regression, a11y)
├── docs/                # Документация
│   ├── architecture/    # Архитектура и ADR
│   ├── api/             # API-контракт (OpenAPI)
│   ├── design/          # Дизайн-система и токены
│   ├── qa/              # Покрытие и качество
│   ├── security/        # Аудит и модель угроз
│   ├── user-guide/      # Руководство пользователя
│   ├── demo.md          # Демо-сценарий
│   └── nodes.md         # Справочник узлов
├── scripts/             # Скрипты автоматизации
├── .github/workflows/   # CI/CD (lint, test, build, deploy Pages, preview, monitor)
├── ТЗ/                  # Техническое задание
└── AGENTS.md            # Правила работы агентов
```

## Документация

- [Архитектура](docs/architecture/overview.md)
- [ADR](docs/architecture/decisions.md)
- [API-контракт](docs/api/README.md) и [OpenAPI](docs/api/openapi.yaml)
- [Узлы workflow](docs/nodes.md)
- [Дизайн-токены](docs/design/tokens.md)
- [План на 30 часов](docs/plan-30h.md)
- [Бэклог](docs/backlog.md)
- [Демо-сценарий](docs/demo.md)
- [Руководство пользователя](docs/user-guide/README.md)
- [Установка](docs/user-guide/installation.md)
- [Быстрый старт](docs/user-guide/quickstart.md)
- [Troubleshooting](docs/user-guide/troubleshooting.md)
- [Деплой](docs/deploy.md)
- [Покрытие](docs/qa/coverage.md)
- [CHANGELOG](CHANGELOG.md)

## Стек

- **Фронтенд:** React 18, Vite 5, TypeScript, Tailwind CSS, React Flow, React Router.
- **Бэкенд:** Node.js, Express, CORS, Helmet, rate-limit, Zod.
- **Общее:** TypeScript-типы и Zod-схемы в `src/shared`.
- **CI/CD:** GitHub Actions -> GitHub Pages (+ CI, preview, monitor, Lighthouse).
- **Тесты:** Vitest, React Testing Library, supertest.

## Возможности

- Drag-and-drop редактор workflow (React Flow).
- Узлы: триггеры (manual/schedule), логика (if/compare/regex), сканеры (secrets/SCA/SAST), AI-анализ, уведомления (telegram/smtp/webhook).
- Сканеры находят секреты, уязвимые зависимости (Gradle + CVE) и небезопасный код (Kotlin/Spring Boot).
- AI-генерация отчёта: summary, объяснение находок, рекомендации, riskLevel (LLM или mock-fallback).
- Шаблоны workflow: сохранение/список/получение/удаление через `/api/templates`.
- Таблица находок с severity (critical/high/medium/low/info).
- In-memory store для MVP (данные сбрасываются при рестарте).
- Деплой фронтенда на GitHub Pages.

## Качество

```bash
npm run lint       # ESLint
npx tsc --noEmit   # проверка типов
npm test           # Vitest
npm run build      # production-сборка
```

Актуальный прогон: 18 test files passed (1 skipped, 3 todo), 84 тестов passed; покрытие ~71.55%. См. [docs/qa/coverage.md](docs/qa/coverage.md).

## Деплой

- Автоматический при push в `main` (workflow `.github/workflows/deploy.yml`).
- URL: https://Em-pechenki.github.io/OGMOP/
- Подробнее: [docs/deploy.md](docs/deploy.md).

## Новое в v1.1.0

- Документированы шаблоны workflow, AI-генерация отчётов и CI/CD pipeline.
- Обновлены README, `docs/nodes.md`, OpenAPI (`docs/api/openapi.yaml`) и демо-сценарий.
- CHANGELOG обновлён до v1.1.0, версия пакета поднята до 1.1.0.

## Лицензия

MIT.