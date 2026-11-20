# Схема данных OGMOP

## Обзор

Проект использует in-memory хранилище на этапе MVP. Общие типы находятся в `src/shared/types/` и импортируются фронтендом и бэкендом через алиас `@shared/*`.

## Сущности

### Workflow
Корневая сущность сценария. Содержит массивы `nodes: FlowNode[]` и `edges: FlowEdge[]`.

### FlowNode
Узел графа. Поля: `id`, `type: NodeType`, `position`, `data: NodeData` (дискриминированный union по полю `kind`).

### FlowEdge
Ребро между нодами: `source`, `target`, опциональные `sourceHandle`/`targetHandle`, `condition`.

### Finding
Находка анализатора: `severity`, `title`, `file`, `line`, `ruleId`, `scanner`, `cve`, `package`, `version`, `recommendation`.

### RunResult / NodeResult
Результат выполнения workflow и отдельных нод, включая статусы, логи, находки, AI-отчёт.

### Template
Шаблон workflow для переиспользования (star-задача).

### NotifyConfig / ScanConfig
Конфигурации нод уведомлений и сканеров.

### LlmPrompt / LlmResponse / AiReport
Контракты взаимодействия с LLM. `LlmPrompt` (alias `LlmRequest`) поддерживает prompt/messages, context, findings, jsonSchema. `AiReport` — структурированный JSON: summary, riskLevel, findings, recommendations.

### ScanFinding / ScanResult
`ScanFinding = Finding`. `ScanResult` описывает результат работы сканера: scanner, status, findings, duration, summary, error, metadata.

### ScannerConfig variants
Дискриминированный union по `scannerType`: `SecretsScannerConfig`, `ScaScannerConfig`, `SastScannerConfig` (алиасы `*ScanConfig`). Общие поля: targetPath, repoUrl, include/excludePatterns, options.

### NotificationPayload
Полезная нагрузка уведомления: channel, title, message, summary, severity, findings, aiReport, metadata, timestamp.

### NodeExecutionResult / WorkflowRunEvent
`NodeExecutionResult` — результат выполнения ноды (status, output, findings, logs, timings). `WorkflowRunEvent` — событие выполнения workflow (run/node status changes, findings, aiReport, logs).

## NodeType
`trigger.manual`, `trigger.schedule`, `logic.if`, `logic.compare`, `logic.regex`, `notify.telegram`, `notify.smtp`, `notify.webhook`, `scanner.secrets`, `scanner.sca`, `scanner.sast`, `ai.analyze`.

## Severity
`critical | high | medium | low | info`.

## ER-описание (текстовое)

```
Workflow 1..* FlowNode
Workflow 1..* FlowEdge
Workflow 1..* RunResult
RunResult 1..* NodeResult
RunResult 1..* Finding
NodeResult 0..* Finding
Template *..1 Workflow
```

## Zod-схемы
Валидация: `src/shared/schemas/`:
- `node.schema.ts` — `flowNodeSchema`, `flowEdgeSchema` (re-exported), `nodeTypeSchema`, `nodeDataSchema`, `positionSchema`.
- `edge.schema.ts` — `flowEdgeSchema`.
- `workflow.schema.ts` — `workflowSchema`.
- `finding.schema.ts` — `findingSchema`, `severitySchema`, `scanFindingSchema`.
- `run.schema.ts` — `runResultSchema`, `nodeResultSchema`, `runStatusSchema`, `nodeRunStatusSchema`, `nodeExecutionResultSchema` (events).
- `template.schema.ts` — `templateSchema`.
- `notification.schema.ts` — `notifyChannelSchema`, `notifyConfigSchema`, `notificationPayloadSchema`.
- `scanner.schema.ts` — `scannerTypeSchema`, `scanConfigSchema`/`scannerConfigSchema` (discriminated union: secrets/sca/sast), `scanResultSchema`, `secretsScannerConfigSchema`, `scaScannerConfigSchema`, `sastScannerConfigSchema`.
- `llm.schema.ts` — `llmPromptSchema`/`llmRequestSchema`, `llmResponseSchema`, `aiReportSchema`, `llmJsonSchema`/`LLM_JSON_SCHEMA` (structured JSON: findings, summary, recommendations).
- `events.schema.ts` — `nodeExecutionResultSchema`, `workflowRunEventSchema`.
Все схемы реэкспортируются из `src/shared/schemas/index.ts`.

## Модели (in-memory)
`src/backend/models/`: `workflow.model.ts`, `finding.model.ts`, `run.model.ts`, `template.model.ts`, `index.ts`.

## Миграции
`src/backend/migrations/` — README (MVP без БД; миграции появятся при переходе на БД).

## Seed-данные
- `src/backend/seed/demo-workflow.json` — пример сценария.
- `src/backend/seed/cve-database.json` — справочник CVE (30 записей).
- `src/backend/seed/demo-repo/` — учебный Kotlin/Spring Boot проект.
```

## Алиасы типов
Для совместимости со спецификацией отдела доступны алиасы:
`Node = FlowNode`, `Edge = FlowEdge`, `TriggerNode`, `LogicNode`, `NotifyNode`, `ScannerNode`, `AiNode`.
`ScanResult` описывает результат работы сканера (находки, статус, длительность).

## Пример FlowNode

```json
{
  "id": "n1",
  "type": "scanner.secrets",
  "position": { "x": 10, "y": 20 },
  "data": {
    "kind": "scanner",
    "scannerType": "secrets",
    "label": "Secrets scan",
    "config": { "scannerType": "secrets", "targetPath": "./demo-repo" }
  }
}
```