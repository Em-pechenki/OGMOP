# Архитектура OGMOP

## Обзор

OGMOP — веб-приложение (React + Vite + TypeScript), публикуемое на GitHub Pages. Опциональный бэкенд (Node.js + Express) выполняет workflow-движок и сканеры безопасности. Общие типы находятся в `src/shared` и используются фронтендом и бэкендом.

Целевой пользователь — небольшие команды/стартапы, которым нужна доступная проверка безопасности кода без тяжёлых корпоративных сканеров.

## Стек

| Слой | Технологии |
|------|------------|
| Фронтенд | React 18, Vite 5, TypeScript, Tailwind CSS, React Flow, React Router |
| Бэкенд | Node.js, Express 4, CORS, Zod |
| Общее | TypeScript-типы (`src/shared`) |
| CI/CD | GitHub Actions (lint, test, build, deploy → GitHub Pages) |
| Тесты | Vitest (React Testing Library — планируется) |

## Структура каталогов

```
src/
├── frontend/          # UI, редактор workflow, визуализация выполнения
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.html
│   ├── styles/
│   └── (components, pages, hooks)
├── backend/           # Express API, движок выполнения, сканеры
│   ├── index.js       # точка входа (health, CORS, JSON)
│   ├── server.js      # createApp (маршруты)
│   ├── engine/        # workflow-engine.js (topological sort + handlers)
│   ├── routes/        # health, workflows, runs, templates
│   ├── controllers/   # контроллеры
│   ├── services/      # бизнес-логика
│   ├── store/         # in-memory store
│   ├── models/        # модели (TS)
│   ├── validators/    # Zod-схемы
│   ├── middleware/    # security, validation, error handler
│   └── seed/          # demo-repo, cve-database, demo-workflow
└── shared/            # Общие типы и утилиты
    ├── types/
    └── schemas/
```

Конфигурация: `vite.config.ts` (root `src/frontend`, base `/OGMOP/`, outDir `../../dist`), `tsconfig.json` (paths `@shared/*`, `@frontend/*`).

## Потоки данных

1. **Редактирование workflow (FE).** Пользователь собирает граф нод (React Flow) на холсте, настраивает параметры в боковой панели, сохраняет JSON (localStorage / BE).
2. **Запуск workflow (FE → BE).** FE создаёт/сохраняет workflow через `POST /api/workflows`, затем запускает `POST /api/workflows/:id/run` с `{ input }`. BE валидирует вход (Zod), делает снимок workflow, сохраняет запуск в in-memory store.
3. **Выполнение (BE, движок).** Движок (`src/backend/engine/workflow-engine.js`) топологически сортирует ноды (`topologicalSort`), выполняет каждую через `nodeHandler`, передавая выходные данные следующим, пишет статусы/логи в store. Условные ноды маршрутизируют данные по веткам (`condition: "true"/"false"` на edge). Обновления стримятся через `onUpdate` (polling `GET /api/runs/:id`).
4. **Сканеры (BE).** Ноды-сканеры (secrets/SCA/SAST) читают файлы тестового репозитория, применяют собственные правила (regex/парсеры), возвращают `Finding[]` с severity. Источник находок — только сканеры, не LLM.
   - **Secrets:** regex по файлам (пароли, API-ключи, токены, приватные ключи).
   - **SCA:** парсинг `build.gradle.kts` (Kotlin DSL), извлечение зависимостей/версий, сравнение с CVE JSON (`src/backend/seed/cve-database.json`).
   - **SAST:** эвристические правила для Kotlin/Spring Boot (SQL injection, hardcoded creds, insecure config).
5. **Классификация критичности.** Каждая находка получает `severity`: critical/high/medium/low/info.
6. **AI-анализ (BE).** Нода AI отправляет агрегированные находки в LLM (внешний API или локальная модель через Ollama/vLLM), получает объяснение и рекомендации (`AiReport`). LLM не заменяет сканеры; проверяется структура ответа, соответствие файлам/строкам, отсутствие выдуманных CVE.
7. **Уведомления (BE).** Нода notify отправляет отчёт через один канал: Telegram / SMTP / webhook.
8. **Визуализация (FE).** FE опрашивает `GET /api/runs/:id`, подсвечивает статусы нод (`nodeStatuses`), показывает выходы (`nodeResults`) и результаты по severity.

## Диаграмма компонентов (текстом)

```
┌──────────────────────────────────────────────┐
│                Browser (FE)                  │
│  ┌──────────┐  ┌────────────┐  ┌──────────┐  │
│  │ Palette  │  │ React Flow │  │ Props    │  │
│  │ (nodes)  │→ │  Canvas    │← │ Panel    │  │
│  └──────────┘  └─────┬──────┘  └──────────┘  │
│                       │ results/status       │
└───────────────────────┼──────────────────────┘
                        │ HTTP (JSON)
┌───────────────────────┼──────────────────────┐
│                Backend (Express)             │
│  ┌────────────┐  ┌────┴─────┐  ┌──────────┐  │
│  │ Routes     │→ │ Workflow  │→ │ Scanners │  │
│  │ /api/*     │  │ Engine   │  │ sec/sca  │  │
│  └────────────┘  └────┬─────┘  │ /sast    │  │
│                       │        └──────────┘  │
│  ┌────────────┐  ┌────┴─────┐  ┌──────────┐  │
│  │ In-memory  │  │ Notify   │  │ AI (LLM) │  │
│  │ Store      │  │ node     │  │ adapter  │  │
│  └────────────┘  └──────────┘  └──────────┘  │
└──────────────────────────────────────────────┘
```

## Движок выполнения

- Модуль: `src/backend/engine/workflow-engine.js`.
- `topologicalSort(nodes, edges)` — топологическая сортировка (Kahn), циклы добавляются в конец.
- `executeWorkflow(run, workflow, { onUpdate })` — выполняет ноды последовательно, обновляет `nodeStatuses`/`nodeResults`, поддерживает `onUpdate` для live-статусов.
- `nodeHandler(node)` — обработчик ноды (phase 2: реальные handlers для scanner/notify/ai/logic; phase 1 — заглушка success+эхо).
- Входные данные run доступны через `run.input`; выходы нод сохраняются в `context.nodeOutputs`.

## Модульность нод

Каждый тип ноды реализуется как независимый модуль: регистрация типа, схема параметров (Zod), executor-функция. Добавление нового типа не требует изменений в движке (см. `docs/nodes.md`, ADR-0004).

## Безопасность

- Сканирование только тестового/учебного репозитория (синтетические данные).
- Секреты (токены Telegram/SMTP/LLM) хранятся зашифрованно/маскируются, не попадают в логи (цель; реализация в процессе).
- Бэкенд: helmet, CORS, rate-limit, валидация входных данных.
- GitHub Pages отдаёт только статику фронтенда.

## Агенты и процесс разработки

Иерархия: Директор → Командиры (DESIGN, FE, BE, DATA, DEVOPS, QA, DOCS, SEC) → Рабочие. Параллелизм через изоляцию по файлам/модулям, частые коммиты/пуш, теги фаз `v0.x.0`. См. `AGENTS.md`, `docs/plan-30h.md`, `docs/backlog.md`.

## Деплой

- GitHub Actions: `npm install` → `npm run build` → upload artifact `dist` → deploy-pages.
- URL: https://Em-pechenki.github.io/OGMOP/
- Триггер: push в `main` или `workflow_dispatch`.