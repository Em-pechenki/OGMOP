# Демо-сценарий OGMOP (финальный, v1.1.0)

Этот сценарий рассчитан на 5-8 минут и показывает полный путь: запуск, создание workflow, сканирование, AI-анализ, уведомления, шаблоны и CI/CD.

## 0. Подготовка (до демо)

1. Запустить бэкенд:
   ```bash
   cd OGMOP
   npm run server   # http://localhost:3001
   ```
2. Запустить фронтенд:
   ```bash
   npm run dev      # http://localhost:5173
   ```
3. Открыть http://localhost:5173.
4. (Опционально) задать `LLM_API_KEY` для реального AI; без ключа работает mock-режим.
5. Проверить health: `curl http://localhost:3001/api/health`.

> Примечание: основная работа с workflow идёт через API (см. раздел 3), drag-and-drop редактор используется для визуального конструирования.

## 1. Вступление (30 сек)

- Проблема: ручной security-review медленный и неповторяемый.
- Решение OGMOP: визуальный конструктор security-workflow, автосканеры (secrets/SCA/SAST), AI-анализ и уведомления. Деплой на GitHub Pages.

## 2. Обзор интерфейса (30 сек)

- Показать главную, редактор, страницы Runs и Templates.
- Упомянуть стек: React 18 + Vite + TypeScript + Tailwind + React Flow; Node.js + Express + Zod.

## 3. Создание workflow через API (2 мин)

Вариант A - готовый seed:

```bash
curl -X POST http://localhost:3001/api/workflows \
  -H "Content-Type: application/json" \
  -d @src/backend/seed/demo-workflow.json
```

Сохранить `data.id`.

Вариант B - ручной JSON:

```bash
curl -X POST http://localhost:3001/api/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Security scan demo",
    "nodes": [
      { "id": "t1", "type": "trigger.manual", "position": { "x": 0, "y": 0 }, "data": { "kind": "trigger", "triggerType": "manual", "label": "Start" } },
      { "id": "s1", "type": "scanner.secrets", "position": { "x": 200, "y": 0 }, "data": { "kind": "scanner", "scannerType": "secrets", "label": "Secrets", "config": { "scannerType": "secrets", "targetPath": "./src/backend/seed/demo-repo" } } },
      { "id": "a1", "type": "ai.analyze", "position": { "x": 400, "y": 0 }, "data": { "kind": "ai", "label": "AI", "provider": "openai", "model": "gpt-4o-mini", "prompt": "Summarize findings" } },
      { "id": "n1", "type": "notify.webhook", "position": { "x": 600, "y": 0 }, "data": { "kind": "notify", "channel": "webhook", "label": "Webhook", "config": { "channel": "webhook", "url": "https://example.com/hook", "method": "POST" } } }
    ],
    "edges": [
      { "id": "e1", "source": "t1", "target": "s1" },
      { "id": "e2", "source": "s1", "target": "a1" },
      { "id": "e3", "source": "a1", "target": "n1" }
    ]
  }'
```

## 4. Запуск workflow (30 сек)

```bash
curl -X POST http://localhost:3001/api/workflows/<workflowId>/run \
  -H "Content-Type: application/json" \
  -d '{ "input": {} }'
# -> { "data": { "runId": "run_..." }, "error": null }
```

Показать toast/статус в UI, затем открыть `/runs` и `/run/:id`.

## 5. Результаты сканирования (2 мин)

- Успешный run (`status: success`).
- `nodeStatuses` и `nodeResults` с находками.
- 32 находки в demo-repo:
  - Secrets: 8 (2 critical, 5 high, 1 medium)
  - SCA: 15 (1 critical, 10 high, 3 medium, 1 low), включая Spring4Shell CVE-2022-22965
  - SAST: 9 (2 critical, 4 high, 2 medium, 1 low)
- Сортировка по severity (critical/high/medium/low/info).
- AI-отчёт: summary, объяснения находок, рекомендации, riskLevel.
- Уведомление (webhook) может вернуть `ok: false` на example.com - это ожидаемо, run остаётся `success`.

## 6. Шаблоны workflow (1 мин)

1. Создать шаблон из workflow:
   ```bash
   curl -X POST http://localhost:3001/api/templates \
     -H "Content-Type: application/json" \
     -d '{ "name": "Security scan template", "description": "Manual -> scanners -> AI -> webhook", "workflow": { "name": "Security scan demo", "nodes": [], "edges": [] } }'
   ```
2. Показать список: `GET /api/templates`.
3. Получить шаблон: `GET /api/templates/:id`.
4. Удалить: `DELETE /api/templates/:id`.

Шаблоны хранятся в in-memory store и сбрасываются при рестарте (MVP).

## 7. AI-генерация (1 мин)

- AI-узел вызывает LLM-адаптер (`src/backend/services/ai.service.js`).
- Переменные окружения: `LLM_PROVIDER`, `LLM_API_KEY`/`OPENAI_API_KEY`/`ANTHROPIC_API_KEY`, `LLM_MODEL`, `LLM_BASE_URL`.
- Без ключа используется mock-отчёт, поэтому демо работает офлайн.
- Отчёт содержит только существующие finding id, каждая находка получает explanation/recommendation, CVE не выдумываются.

## 8. CI/CD (1 мин)

- `ci.yml`: lint, typecheck, tests, build, Lighthouse CI.
- `deploy.yml`: сборка и деплой на GitHub Pages при push в `main`.
- `preview.yml`: сборка PR-preview.
- `monitor.yml`: проверка доступности Pages каждые 6 часов.
- URL production: https://Em-pechenki.github.io/OGMOP/

## 9. Технические детали (1 мин)

- Стек: React 18 + Vite + TypeScript + Tailwind + React Flow; Node.js + Express + Zod.
- Сканеры: regex (secrets), Gradle + CVE JSON (SCA), статический анализ Kotlin/Spring (SAST).
- AI: LLM генерирует summary/рекомендации; итог валидируется на бэкенде.
- Хранение: in-memory store (MVP), данные сбрасываются при рестарте.
- Безопасность: helmet, CORS, rate-limit, валидация входных данных.

## 10. Q&A (подготовленные ответы)

- **Почему не Semgrep/Trivy?** MVP использует собственные regex/парсеры; интеграция внешних сканеров - следующий шаг.
- **Масштабирование?** Очередь (Bull/Redis), auth/RBAC, интеграция с Git.
- **Безопасность OGMOP?** Helmet/CORS/rate-limit/валидация, маскирование секретов в notify.
- **Что дальше?** SARIF-экспорт, интеграция с CI, расширенные шаблоны.

## Ссылки

- Демо: https://Em-pechenki.github.io/OGMOP/
- Репозиторий: https://github.com/Em-pechenki/OGMOP
- Документация: `docs/` (architecture, api, nodes, design, security, user-guide)
- Установка: `docs/user-guide/installation.md`
- Troubleshooting: `docs/user-guide/troubleshooting.md`