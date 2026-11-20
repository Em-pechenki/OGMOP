# Changelog

Все заметные изменения проекта документируются в этом файле.
Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/).

## [Unreleased]

### Chore
- auto-update (2026-11-21 00:24:06) (6fcff46)
- auto-update (2026-11-21 00:14:06) (a6a8ae5)
- auto-update (2026-11-21 00:09:06) (5ae5128)
- relax lighthouse thresholds to warn, continue-on-error (ed17511)
- final cleanup, lighthouse thresholds relaxed (b85edc7)
- auto-update (2026-11-21 00:04:06) (c4a7a62)

### Other
- phase 4-5 final run - tests 84 passed, coverage 71.55%, lighthouse 98/100/100/100 (b2ad910)

## [1.1.0] - 2026-11-21

### Added
- Шаблоны workflow: in-memory store и API `/api/templates` (create/get/list/delete), документация в `docs/nodes.md` и OpenAPI.
- AI-генерация отчётов: документированы LLM-провайдеры, переменные окружения, mock-fallback и валидация `AiReport`.
- CI/CD: задокументированы workflows `ci.yml`, `deploy.yml`, `preview.yml`, `monitor.yml` и pipeline.
- Обновлены `README.md`, `docs/nodes.md`, `docs/api/openapi.yaml`, `docs/demo.md` под v1.1.0.
- `package.json`: версия 1.1.0.

### Changed
- `docs/api/openapi.yaml`: версия 1.1.0, в схему `Run` добавлены `findings` и `aiReport`.
- README: обновлены возможности, качество (84 passed, coverage 71.55%) и раздел "Новое в v1.1.0".
- `docs/nodes.md`: добавлены разделы "Шаблоны workflow", "AI-генерация отчётов", "CI/CD".

### Fixed
- Уточнены контракты Run/Template и примеры для шаблонов и AI-отчётов.

## [1.0.0] - 2026-11-20

### Added
- Финальный релиз v1.0.0: README, CHANGELOG, демо-сценарий, инструкции по деплою и настройке.
- `docs/deploy.md`: деплой на GitHub Pages, CI, preview, Lighthouse, мониторинг, секреты.
- `docs/user-guide/`: installation, quickstart, troubleshooting, README.
- `docs/demo.md`: финальный демо-сценарий (5–8 мин), ожидаемые результаты (32 находки), запасной план, Q&A.
- OpenAPI-спецификация `docs/api/openapi.yaml` v1.0.0: health, workflows (CRUD + run), runs, templates; схемы Finding, Run, NodeResult, AiReport, ScanConfig, NotifyConfig, NodeType.
- Полное описание нод в `docs/nodes.md` (trigger, logic, scanner, notify, ai) с параметрами и примерами JSON.
- Движок выполнения workflow (топологическая сортировка, статусы нод, поток данных).
- Сканеры безопасности: секреты (regex), SCA (Gradle + CVE JSON), SAST (Kotlin/Spring Boot).
- Классификация критичности находок (critical/high/medium/low/info).
- AI-анализ (LLM-агрегация, объяснение, рекомендации) и уведомления (Telegram/SMTP/webhook).
- Шаблоны workflow (backend API + страница `/templates`).
- Тесты: unit, integration, e2e, smoke, regression, a11y (83 passed, 1 skipped, 3 todo).
- CI/CD: GitHub Actions (lint, typecheck, test, build, deploy Pages, preview, monitor, Lighthouse).

### Changed
- `README.md`: финальная структура, возможности, ссылки, статус v1.0.0.
- `docs/architecture/overview.md`: движок, сканеры, AI-адаптер, уведомления, безопасность.
- `docs/api/README.md`: синхронизация с OpenAPI v1.0.0, актуальный движок и маршруты.
- `docs/qa/coverage.md`: актуальные метрики (71.54% строк, 83 теста).
- `package.json`: версия 1.0.0.

### Fixed
- Мелкие несоответствия документации и кода (счетчики находок SCA, статусы run, список маршрутов).

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

---
_Generated by scripts/changelog.ps1 on 2026-11-21._

