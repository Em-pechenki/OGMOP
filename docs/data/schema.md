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

### LlmRequest / LlmResponse / AiReport
Контракты взаимодействия с LLM.

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
- `finding.schema.ts` — `findingSchema`, `severitySchema`.
- `run.schema.ts` — `runResultSchema`, `nodeResultSchema`, `runStatusSchema`, `nodeRunStatusSchema`.
- `template.schema.ts` — `templateSchema`.
- `notification.schema.ts` — `notifyChannelSchema`, `notifyConfigSchema`.
- `scanner.schema.ts` — `scannerTypeSchema`, `scanConfigSchema`.
- `llm.schema.ts` — `llmRequestSchema`, `llmResponseSchema`, `aiReportSchema`.
Все схемы реэкспортируются из `src/shared/schemas/index.ts`.

## Модели (in-memory)
`src/backend/models/`: `workflow.model.ts`, `finding.model.ts`, `run.model.ts`, `template.model.ts`, `index.ts`.

## Миграции
`src/backend/migrations/` — README (MVP без БД; миграции появятся при переходе на БД).

## Seed-данные
- `src/backend/seed/demo-workflow.json` — пример сценария.
- `src/backend/seed/cve-database.json` — справочник CVE (20 записей).
- `src/backend/seed/demo-repo/` — учебный Kotlin/Spring Boot проект.
```

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