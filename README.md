# OGMOP — AI Security Workflow

[![CI](https://github.com/Em-pechenki/OGMOP/actions/workflows/ci.yml/badge.svg)](https://github.com/Em-pechenki/OGMOP/actions/workflows/ci.yml)
[![Deploy to GitHub Pages](https://github.com/Em-pechenki/OGMOP/actions/workflows/deploy.yml/badge.svg)](https://github.com/Em-pechenki/OGMOP/actions/workflows/deploy.yml)
[![GitHub Pages](https://img.shields.io/badge/Pages-live-brightgreen)](https://Em-pechenki.github.io/OGMOP/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](#)
[![Status: In development](https://img.shields.io/badge/status-in%20development-orange.svg)](#)

Визуальная платформа автоматизации проверок безопасности кода: drag-and-drop конструктор сценариев (workflow) из нод, собственные анализаторы (секреты / SCA / SAST для Kotlin + Spring Boot + Gradle), классификация критичности, AI-объяснения и рекомендации, уведомления.

Проект разрабатывается в рамках хакатона **Cyber Garden 2026** (кейс «AI Security Workflow»).

- **Демо (GitHub Pages):** https://Em-pechenki.github.io/OGMOP/
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
│   └── user-guide/      # Руководство пользователя
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
- [CHANGELOG](CHANGELOG.md)

## Стек

- **Фронтенд:** React 18, Vite 5, TypeScript, Tailwind CSS, React Flow (редактор), React Router.
- **Бэкенд:** Node.js, Express, CORS, Zod (валидация).
- **Общее:** TypeScript-типы в `src/shared`.
- **CI/CD:** GitHub Actions → GitHub Pages.
- **Тесты:** Vitest (+ React Testing Library планируется).

## Статус

Фаза 0–1: каркас. Идёт параллельная разработка по трекам DESIGN/FE/BE/DATA/DEVOPS/QA/DOCS/SEC. См. `docs/backlog.md`.

## Лицензия

MIT (черновик; уточняется).
