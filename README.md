# OGMOP — AI Security Workflow

[![CI](https://github.com/Em-pechenki/OGMOP/actions/workflows/ci.yml/badge.svg)](https://github.com/Em-pechenki/OGMOP/actions/workflows/ci.yml)
[![Deploy to GitHub Pages](https://github.com/Em-pechenki/OGMOP/actions/workflows/deploy.yml/badge.svg)](https://github.com/Em-pechenki/OGMOP/actions/workflows/deploy.yml)
[![GitHub Pages](https://img.shields.io/badge/Pages-live-brightgreen)](https://Em-pechenki.github.io/OGMOP/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](#)

Визуальная платформа автоматизации проверок безопасности кода: drag-and-drop конструктор сценариев (workflow) из нод, собственные анализаторы (секреты / SCA / SAST для Kotlin + Spring Boot + Gradle), классификация критичности, AI-объяснения и рекомендации, уведомления.

Проект разрабатывается в рамках хакатона **Cyber Garden 2026** (кейс «AI Security Workflow»).

- **Демо (GitHub Pages):** https://Em-pechenki.github.io/OGMOP/
- **Демо-сценарий:** [docs/demo.md](docs/demo.md)
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
npm run lint      # ESLint по src
npm test          # Vitest (unit-тесты)
```

### Бэкенд (Express, опционально)

```bash
npm run server    # http://localhost:3001, переменная PORT переопределяет порт
```

Проверка: `curl http://localhost:3001/api/health` → `{ "status": "ok", "project": "OGMOP" }`.

Подробнее: [docs/user-guide/installation.md](docs/user-guide/installation.md), [docs/user-guide/quickstart.md](docs/user-guide/quickstart.md).

## Структура проекта

```
OGMOP/
├── src/
│   ├── frontend/        # React + Vite + TypeScript (UI, редактор workflow)
│   ├── backend/         # Node.js + Express (API, движок выполнения, сканеры)
│   └── shared/          # Общие типы и утилиты (FE + BE)
├── public/              # Статические ассеты
├── tests/               # Тесты
├── docs/                # Документация
│   ├── architecture/    # Архитектура и ADR
│   ├── api/             # API-контракты
│   ├── design/          # Дизайн-токены и спецификации
│   ├── qa/              # Отчёты о тестах/покрытии
│   ├── security/        # Модель угроз, аудит
│   ├── user-guide/      # Руководство пользователя
│   └── demo.md          # Демо-сценарий
├── scripts/             # Скрипты автоматизации
├── .github/workflows/   # CI/CD (lint, test, build, deploy Pages)
├── ТЗ/                  # Техническое задание заказчика
├── AGENTS.md            # Правила работы агентов
└── README.md
```

## Документация

- [Архитектура](docs/architecture/overview.md)
- [Архитектурные решения (ADR)](docs/architecture/decisions.md)
- [API-контракты](docs/api/README.md)
- [Типы нод](docs/nodes.md)
- [Дизайн-токены](docs/design/tokens.md)
- [План на 30 часов](docs/plan-30h.md)
- [Бэклог](docs/backlog.md)
- [Демо-сценарий](docs/demo.md)
- [Руководство пользователя](docs/user-guide/README.md)
- [Установка](docs/user-guide/installation.md)
- [Быстрый старт](docs/user-guide/quickstart.md)
- [Troubleshooting](docs/user-guide/troubleshooting.md)
- [CHANGELOG](CHANGELOG.md)

## Стек

- **Фронтенд:** React 18, Vite 5, TypeScript, Tailwind CSS, React Flow (редактор), React Router.
- **Бэкенд:** Node.js, Express, CORS, Zod (валидация).
- **Общее:** TypeScript-типы в `src/shared`.
- **CI/CD:** GitHub Actions → GitHub Pages.
- **Тесты:** Vitest.

## Возможности

- Drag-and-drop конструктор workflow (React Flow).
- Ноды: триггеры (manual/schedule), логика (if/compare/regex), сканеры (secrets/sca/sast), AI-анализ, уведомления (telegram/smtp/webhook).
- Собственные сканеры без внешних зависимостей.
- AI-агрегация и рекомендации с валидацией ответа.
- Визуализация статусов и результатов по severity.
- Деплой фронтенда на GitHub Pages.

## Статус

Фаза 3: руководство пользователя, troubleshooting, демо-сценарий, финальная документация. См. `docs/backlog.md`, `CHANGELOG.md`.

## Лицензия

MIT (черновик; уточняется).