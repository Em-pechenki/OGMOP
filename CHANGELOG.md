# Changelog

Все заметные изменения проекта документируются в этом файле.
Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/).

## [Unreleased]

### Added
- `docs/user-guide/quickstart.md`: руководство пользователя (сборка сценария, запуск, чтение результата).

## [0.3.0] - 2026-11-20

### Added
- `docs/user-guide/installation.md`: требования, конфигурация env, запуск, сборка, деплой.
- `docs/user-guide/troubleshooting.md`: типичные проблемы (установка, CORS, сканеры, AI, notify, API, Windows).
- `docs/demo.md`: демо-сценарий для презентации (5–8 мин), ожидаемые результаты, запасной план, Q&A.
- `docs/user-guide/README.md`: индекс руководства пользователя.
- Финальный `README.md`: актуальная структура, возможности, ссылки на документацию.

### Changed
- `README.md`: статус обновлён до Фазы 3, добавлены ссылки на user-guide/demo.
- `CHANGELOG.md`: добавлена секция v0.3.0.

## [0.2.0] - 2026-11-20

### Added
- OpenAPI-спецификация `docs/api/openapi.yaml` v0.2.0: эндпоинты health, workflows (CRUD + run), runs, templates; схемы Finding, Run, NodeResult, AiReport, ScanConfig, NotifyConfig, NodeType.
- Полное описание нод в `docs/nodes.md` с параметрами и примерами JSON (trigger, logic, scanner, notify, ai).
- Руководство пользователя `docs/user-guide/quickstart.md`.
- Актуализация `docs/architecture/overview.md`: движок (topologicalSort, executeWorkflow), сканеры (secrets/SCA/SAST), AI-адаптер, уведомления.
- Движок выполнения workflow (топологическая сортировка, статусы нод, поток данных).
- Сканеры безопасности: секреты (regex), SCA (Gradle + CVE JSON), SAST (Kotlin/Spring Boot).
- Классификация критичности находок (critical/high/medium/low/info).
- AI-анализ (LLM-агрегация, объяснение, рекомендации) и уведомления (Telegram/SMTP/webhook).

### Changed
- `docs/nodes.md`: расширено описание параметров, выходов и примеров JSON.
- `docs/api/README.md`: синхронизация с OpenAPI v0.2.0.

## [0.1.0] - 2026-11-20

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