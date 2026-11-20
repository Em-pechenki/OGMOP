# OGMOP — AI Security Workflow

[![CI](https://github.com/Em-pechenki/OGMOP/actions/workflows/ci.yml/badge.svg)](https://github.com/Em-pechenki/OGMOP/actions/workflows/ci.yml)
[![Deploy to GitHub Pages](https://github.com/Em-pechenki/OGMOP/actions/workflows/deploy.yml/badge.svg)](https://github.com/Em-pechenki/OGMOP/actions/workflows/deploy.yml)
[![GitHub Pages](https://img.shields.io/badge/Pages-live-brightgreen)](https://Em-pechenki.github.io/OGMOP/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](#)

Визуальная платформа автоматизации проверок безопасности кода: drag-and-drop конструктор сценариев (workflow) из нод, собственные анализаторы (секреты / SCA / SAST для Kotlin + Spring Boot + Gradle), классификация критичности, AI-объяснения и рекомендации, уведомления.

Проект разработан в рамках хакатона **Cyber Garden 2026** (кейс «AI Security Workflow»). Финальный релиз: **v1.0.0**.

- **Демо (GitHub Pages):** https://Em-pechenki.github.io/OGMOP/
- **Демо-сценарий:** [docs/demo.md](docs/demo.md)
- **Руководство пользователя:** [docs/user-guide/README.md](docs/user-guide/README.md)
- **ТЗ заказчика:** `ТЗ/tz.md`, `ТЗ/отделы/*.md`

## Быстрый старт

Требования: Node.js 20+, npm.

```bash
git clone https://github.com/Em-pechenki/OGMOP.git
cd OGMOP
npm install
```

### Фронтенд (Vite + React)

```bash
npm run dev       # dev-сервер на http://localhost:5173
npm run build     # production-сборка в dist/
npm run preview   # предпросмотр сборки
npm run lint      # ESLint по src и tests
npm test          # Vitest (unit/e2e/smoke/regression)
```

### Бэкенд (Express, опционально для сканеров/AI/уведомлений)

```bash
npm run server    # http://localhost:3001, переменная PORT переопределяет порт
```

Проверка: `curl http://localhost:3001/api/health` → `{ "status": "ok", "project": "OGMOP" }`.

Подробнее: [docs/user-guide/installation.md](docs/user-guide/installation.md), [docs/user-guide/quickstart.md](docs/user-guide/quickstart.md), [docs/deploy.md](docs/deploy.md).

## Структура проекта

```
OGMOP/
├── src/
│   ├── frontend/        # React + Vite + TypeScript (UI, редактор workflow)
│   ├── backend/         # Node.js + Express (API, движок выполнения, сканеры)
│   └── shared/          # Общие типы и схемы (FE + BE)
├── public/              # Статические ассеты
├── tests/               # Vitest (unit, integration, e2e, smoke, regression, a11y)
├── docs/                # Документация
│   ├── architecture/    # Архитектура и ADR
│   ├── api/             # API-контракты (OpenAPI)
│   ├── design/          # Дизайн-токены и спецификации
│   ├── qa/              # Отчёты о тестах/покрытии
│   ├── security/        # Модель угроз, аудит
│   ├── user-guide/      # Руководство пользователя
│   └── demo.md          # Демо-сценарий
├── scripts/             # Скрипты автоматизации
├── .github/workflows/   # CI/CD (lint, test, build, deploy Pages, monitor)
├── ТЗ/                  # Техническое задание заказчика
├── AGENTS.md            # Правила работы агентов
└── README.md
```

## Документация

- [Архитектура](docs/architecture/overview.md)
- [Архитектурные решения (ADR)](docs/architecture/decisions.md)
- [API-контракты](docs/api/README.md) · [OpenAPI](docs/api/openapi.yaml)
- [Типы нод](docs/nodes.md)
- [Дизайн-токены](docs/design/tokens.md)
- [План на 30 часов](docs/plan-30h.md)
- [Бэклог](docs/backlog.md)
- [Демо-сценарий](docs/demo.md)
- [Руководство пользователя](docs/user-guide/README.md)
- [Установка](docs/user-guide/installation.md)
- [Быстрый старт](docs/user-guide/quickstart.md)
- [Troubleshooting](docs/user-guide/troubleshooting.md)
- [Деплой](docs/deploy.md)
- [Покрытие тестами](docs/qa/coverage.md)
- [CHANGELOG](CHANGELOG.md)

## Стек

- **Фронтенд:** React 18, Vite 5, TypeScript, Tailwind CSS, React Flow, React Router.
- **Бэкенд:** Node.js, Express, CORS, Helmet, rate-limit, Zod.
- **Общее:** TypeScript-типы и Zod-схемы в `src/shared`.
- **CI/CD:** GitHub Actions → GitHub Pages (+ CI, preview, monitor).
- **Тесты:** Vitest, React Testing Library, supertest.

## Возможности

- Drag-and-drop конструктор workflow (React Flow).
- Ноды: триггеры (manual/schedule), логика (if/compare/regex), сканеры (secrets/sca/sast), AI-анализ, уведомления (telegram/smtp/webhook).
- Собственные сканеры без внешних зависимостей.
- Классификация находок по severity (critical/high/medium/low/info).
- AI-агрегация и рекомендации с валидацией ответа.
- Визуализация статусов и результатов выполнения.
- История запусков (in-memory, сбрасывается при рестарте).
- Шаблоны workflow (backend API + страница `/templates`).
- Деплой фронтенда на GitHub Pages.

## Тесты и качество

```bash
npm run lint       # ESLint
npx tsc --noEmit   # проверка типов
npm test           # Vitest
npm run build      # production-сборка
```

Текущее состояние: 18 test files passed (1 skipped, 3 todo), 83 теста passed; покрытие строк ~71.5%. См. [docs/qa/coverage.md](docs/qa/coverage.md).

## Деплой

- Автоматически при push в `main` (workflow `.github/workflows/deploy.yml`).
- URL: https://Em-pechenki.github.io/OGMOP/
- Подробнее: [docs/deploy.md](docs/deploy.md).

## Статус

Фаза 5 завершена: финальный README, CHANGELOG v1.0.0, демо-сценарий, инструкции по деплою и настройке. Прототип готов к демонстрации. См. `docs/backlog.md`, `CHANGELOG.md`.

## Лицензия

MIT (черновик; уточняется).