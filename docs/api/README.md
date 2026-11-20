# API — OGMOP

Базовый URL (локальный бэкенд): `http://localhost:3001`. Точка входа: `src/backend/index.js` (импортирует `createApp` из `src/backend/server.js`). Порт задаётся `PORT` (по умолчанию 3001).

Все ответы имеют форму:

```ts
// success
{ "data": <T>, "error": null }
// error
{ "data": null, "error": "<message>", "details"?: <any> }
```

Реализация: `src/backend/utils/response.js` (`sendSuccess`, `sendError`).

## Маршруты (актуально)

### Health

- `GET /api/health` — ✅
  - Ответ: `{ status, project, uptime, timestamp }`.

### Workflows (`/api/workflows`)

- `GET /api/workflows` — список workflow.
- `POST /api/workflows` — создать (body: `WorkflowCreateSchema`).
- `GET /api/workflows/:id` — получить по id.
- `PUT /api/workflows/:id` — обновить (body: `WorkflowUpdateSchema`).
- `PATCH /api/workflows/:id` — частичное обновление (тот же schema).
- `DELETE /api/workflows/:id` — удалить → `{ deleted: true }`.

Тело создания/обновления (`src/backend/validators/workflow.validator.js`):

```json
{
  "name": "My workflow",
  "description": "...",
  "nodes": [ { "id": "n1", "type": "trigger.manual", "position": { "x": 0, "y": 0 }, "data": { "kind": "trigger", "triggerType": "manual" } } ],
  "edges": [ { "id": "e1", "source": "n1", "target": "n2" } ]
}
```

Ответ — объект `Workflow` (`src/shared/types/workflow.ts`): `id, name, description?, nodes, edges, createdAt?, updatedAt?, version?, templateId?, metadata?`.

### Runs

- `POST /api/workflows/:id/run` — запустить workflow (body: `{ "input": { ... } }`, опционально). Ответ `202`: `{ runId }`.
- `GET /api/runs/:id` — статус запуска.

Ответ `GET /api/runs/:id` (`src/backend/services/run.service.js` `getRunStatus`):

```json
{
  "id": "run_...",
  "workflowId": "wf_...",
  "status": "queued | running | success | failed | cancelled",
  "nodeStatuses": { "n1": "success" },
  "nodeResults": { "n1": { "nodeId": "n1", "type": "trigger.manual", "data": { } } },
  "startedAt": "...",
  "finishedAt": "...",
  "error": null
}
```

Примечание: `RunResult` в shared-типах (`src/shared/types/run.ts`) описывает `nodeResults: NodeResult[]`, `findings`, `aiReport`; бэкенд Фазы 1 возвращает `nodeResults` как объект (map) и без findings/aiReport (заглушка движка).

### Templates (`/api/templates`)

- `GET /api/templates` — список шаблонов.
- `POST /api/templates` — создать (body: `{ name?, description?, workflow? }`).
- `GET /api/templates/:id` — получить.
- `DELETE /api/templates/:id` — удалить → `{ deleted: true }`.

Объект `Template` (`src/shared/types/template.ts`): `id, name, description?, workflow, author?, tags?, createdAt?, updatedAt?, isPublic?`.

## Валидация и ошибки

- Валидация: `src/backend/middleware/validate.middleware.js` + Zod-схемы (`src/backend/validators/workflow.validator.js`).
- Ошибки валидации → `400` с `details`.
- Не найдено → `404` `{ data: null, error: "..." }`.
- Глобальный обработчик ошибок: `src/backend/middleware/error-handler.middleware.js`.
- Безопасность: `src/backend/middleware/security.middleware.js` (helmet/CORS/rate-limit и т.д. — см. исходники).

## Безопасность и лимиты

- `express.json({ limit: "2mb" })`.
- Security middleware применяется через `securityMiddleware()` (см. `src/backend/middleware/security.middleware.js`).

## Связанные типы

- `src/shared/types/*.ts`: `FlowNode`, `FlowEdge`, `Workflow`, `Finding`, `RunResult`, `NodeResult`, `Template`, `NotifyConfig`, `ScanConfig`, `AiReport`, `LlmRequest/Response`.
- Статусы: `RunStatus = pending | running | success | error | cancelled`; `NodeRunStatus = idle | running | success | error | skipped`.

## Примечания

- Движок выполнения Фазы 1 — заглушка: `src/backend/engine/workflow-engine.js` (`nodeHandler` возвращает success и эхо data, задержка 50 мс на ноду). Реальные сканеры/уведомления/AI — Фаза 2.
- In-memory store сбрасывается при рестарте процесса.
- OpenAPI-спецификация — планируется.
