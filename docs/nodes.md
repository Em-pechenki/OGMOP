# Типы нод — OGMOP

Источник истины: `src/shared/types/node.ts` (`NodeType`, `NodeData` и производные), `src/shared/schemas/node.schema.ts`. Ниже — полное описание нод: параметры, выходы, примеры JSON.

Общий контракт ноды (`FlowNode`):

```ts
interface FlowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
}
```

Связь (`FlowEdge`):

```ts
interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  label?: string;
  condition?: "true" | "false" | string;
  animated?: boolean;
  style?: Record<string, unknown>;
}
```

Ветвление: логические ноды могут направлять поток по `condition` на ребре (`"true"`/`"false"`). Движок выполняет только достижимые ветки.

---

## 1. Trigger (триггеры запуска)

### `trigger.manual` — Запуск вручную (по кнопке)

- **Данные (`TriggerNodeData`):** `kind: "trigger"`, `triggerType: "manual"`, `label?`, `params?`.
- **Параметры:**
  - `label` (string, опционально) — подпись ноды на холсте.
  - `params` (object, опционально) — произвольные входные параметры, доступные downstream.
- **Выход движка:** `{ nodeId, type, data }` (эхо входных данных).
- **Пример JSON:**
  ```json
  {
    "id": "t1",
    "type": "trigger.manual",
    "position": { "x": 0, "y": 0 },
    "data": { "kind": "trigger", "triggerType": "manual", "label": "Start" }
  }
  ```

### `trigger.schedule` — Запуск по расписанию

- **Данные:** `kind: "trigger"`, `triggerType: "schedule"`, `label?`, `schedule?`, `params?`.
- **Параметры:**
  - `schedule` (string) — строка расписания (cron-подобная) или ISO-интервал.
  - `params` (object, опционально).
- **Пример JSON:**
  ```json
  {
    "id": "t2",
    "type": "trigger.schedule",
    "position": { "x": 0, "y": 0 },
    "data": { "kind": "trigger", "triggerType": "schedule", "label": "Daily 14:00", "schedule": "0 14 * * *" }
  }
  ```

---

## 2. Logic (логика и ветвление)

### `logic.if` — Условное ветвление

- **Данные (`LogicNodeData`):** `kind: "logic"`, `logicType: "if"`, `label?`, `condition?`.
- **Параметры:**
  - `condition` (string) — выражение/шаблон условия, оцениваемое движком.
- **Выход:** `{ result: boolean }` + направление ветки.
- **Пример JSON:**
  ```json
  {
    "id": "l1",
    "type": "logic.if",
    "position": { "x": 200, "y": 0 },
    "data": { "kind": "logic", "logicType": "if", "label": "Has findings?", "condition": "findings.length > 0" }
  }
  ```

### `logic.compare` — Сравнение

- **Данные:** `kind: "logic"`, `logicType: "compare"`, `label?`, `operator?`, `left?`, `right?`.
- **Параметры:**
  - `operator`: `eq | ne | gt | lt | gte | lte | contains | regex`.
  - `left` (string) — левый операнд (значение или шаблон ссылки на выход предыдущей ноды).
  - `right` (string) — правый операнд.
- **Выход:** `{ result: boolean }`.
- **Пример JSON:**
  ```json
  {
    "id": "l2",
    "type": "logic.compare",
    "position": { "x": 200, "y": 0 },
    "data": { "kind": "logic", "logicType": "compare", "operator": "gte", "left": "{{severityCount.critical}}", "right": "1" }
  }
  ```

### `logic.regex` — Проверка по регулярному выражению

- **Данные:** `kind: "logic"`, `logicType: "regex"`, `label?`, `pattern?`.
- **Параметры:**
  - `pattern` (string) — регулярное выражение.
- **Выход:** `{ matched: boolean, matches: string[] }`.
- **Пример JSON:**
  ```json
  {
    "id": "l3",
    "type": "logic.regex",
    "position": { "x": 200, "y": 0 },
    "data": { "kind": "logic", "logicType": "regex", "pattern": "password\\s*=" }
  }
  ```

---

## 3. Scanner (анализаторы безопасности)

Собственные анализаторы (без готовых сканеров). Конфигурация — `ScanConfig` (`src/shared/types/scanner.ts`):

```ts
interface ScanConfig {
  scannerType: "secrets" | "sca" | "sast";
  targetPath?: string;
  repoUrl?: string;
  includePatterns?: string[];
  excludePatterns?: string[];
  options?: Record<string, unknown>;
}
```

### `scanner.secrets` — Поиск секретов

- **Данные (`ScannerNodeData`):** `kind: "scanner"`, `scannerType: "secrets"`, `label?`, `config: ScanConfig`.
- **Алгоритм:** regex по файлам репозитория (пароли, API-ключи, токены, приватные ключи). Возвращает `Finding[]`.
- **Параметры config:**
  - `targetPath` — путь к репозиторию/директории.
  - `includePatterns` / `excludePatterns` — glob-фильтры.
- **Выход:** `{ findings: Finding[], summary }`.
- **Пример JSON:**
  ```json
  {
    "id": "s1",
    "type": "scanner.secrets",
    "position": { "x": 400, "y": 0 },
    "data": {
      "kind": "scanner",
      "scannerType": "secrets",
      "label": "Secrets scan",
      "config": { "scannerType": "secrets", "targetPath": "./demo-repo", "includePatterns": ["**/*.kt", "**/*.properties"] }
    }
  }
  ```

### `scanner.sca` — Проверка зависимостей (SCA)

- **Данные:** `kind: "scanner"`, `scannerType: "sca"`, `label?`, `config: ScanConfig`.
- **Алгоритм:** парсинг `build.gradle.kts` (Kotlin DSL), извлечение зависимостей и версий, сравнение с CVE JSON-справочником (`src/backend/seed/cve-database.json`).
- **Выход:** `{ findings: Finding[], summary }` (с CVE, packageName, version, fixedVersion).
- **Пример JSON:**
  ```json
  {
    "id": "s2",
    "type": "scanner.sca",
    "position": { "x": 400, "y": 120 },
    "data": {
      "kind": "scanner",
      "scannerType": "sca",
      "label": "Dependency scan",
      "config": { "scannerType": "sca", "targetPath": "./demo-repo" }
    }
  }
  ```

### `scanner.sast` — Статический анализ Kotlin/Spring Boot

- **Данные:** `kind: "scanner"`, `scannerType: "sast"`, `label?`, `config: ScanConfig`.
- **Алгоритм:** собственные эвристические правила для Kotlin/Spring Boot: SQL injection, hardcoded creds, insecure config (например, CSRF отключён, permitAll).
- **Выход:** `{ findings: Finding[], summary }`.
- **Пример JSON:**
  ```json
  {
    "id": "s3",
    "type": "scanner.sast",
    "position": { "x": 400, "y": 240 },
    "data": {
      "kind": "scanner",
      "scannerType": "sast",
      "label": "SAST scan",
      "config": { "scannerType": "sast", "targetPath": "./demo-repo" }
    }
  }
  ```

### Находка (`Finding`)

```ts
interface Finding {
  id: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  description?: string;
  file?: string;
  line?: number;
  column?: number;
  ruleId?: string;
  scanner?: "secrets" | "sca" | "sast";
  cve?: string;
  packageName?: string;
  package?: string;
  version?: string;
  fixedVersion?: string;
  recommendation?: string;
  snippet?: string;
}
```

### Уровни критичности

| Уровень | Описание |
|---------|----------|
| critical | Критическая уязвимость |
| high | Серьёзная проблема |
| medium | Умеренный риск |
| low | Низкий риск |
| info | Информационное замечание |

---

## 4. Notify (уведомления)

Каналы: `telegram | smtp | webhook` (`NotifyChannel`). Конфигурация — `NotifyConfig` (`src/shared/types/notification.ts`).

### `notify.telegram`

- **Данные (`NotifyNodeData`):** `kind: "notify"`, `channel: "telegram"`, `label?`, `config: NotifyConfig`.
- **Параметры config:** `botToken`, `chatId`.
- **Пример JSON:**
  ```json
  {
    "id": "n1",
    "type": "notify.telegram",
    "position": { "x": 600, "y": 0 },
    "data": {
      "kind": "notify",
      "channel": "telegram",
      "label": "Telegram report",
      "config": { "channel": "telegram", "botToken": "<token>", "chatId": "<chat>" }
    }
  }
  ```

### `notify.smtp`

- **Данные:** `kind: "notify"`, `channel: "smtp"`, `label?`, `config: NotifyConfig`.
- **Параметры config:** `host`, `port`, `secure`, `user`, `password`, `from`, `to[]`, `subject`.
- **Пример JSON:**
  ```json
  {
    "id": "n2",
    "type": "notify.smtp",
    "position": { "x": 600, "y": 0 },
    "data": {
      "kind": "notify",
      "channel": "smtp",
      "label": "Email report",
      "config": { "channel": "smtp", "host": "smtp.example.com", "port": 587, "from": "ogmop@example.com", "to": ["dev@example.com"], "subject": "OGMOP report" }
    }
  }
  ```

### `notify.webhook`

- **Данные:** `kind: "notify"`, `channel: "webhook"`, `label?`, `config: NotifyConfig`.
- **Параметры config:** `url`, `method`, `headers`, `bodyTemplate`.
- **Пример JSON:**
  ```json
  {
    "id": "n3",
    "type": "notify.webhook",
    "position": { "x": 600, "y": 0 },
    "data": {
      "kind": "notify",
      "channel": "webhook",
      "label": "Webhook report",
      "config": { "channel": "webhook", "url": "https://example.com/hook", "method": "POST" }
    }
  }
  ```

---

## 5. AI (LLM-анализ)

### `ai.analyze` — AI-агрегация и рекомендации

- **Данные (`AiNodeData`):** `kind: "ai"`, `label?`, `provider?`, `model?`, `prompt?`, `temperature?`, `maxTokens?`.
- **Параметры:**
  - `provider` — провайдер LLM (openai/claude/ollama/...).
  - `model` — имя модели.
  - `prompt` — пользовательский промпт/инструкция.
  - `temperature` — креативность (0..1).
  - `maxTokens` — лимит токенов ответа.
- **Отчёт (`AiReport`):**
  ```ts
  interface AiReport {
    summary: string;
    riskLevel?: Severity;
    findings: Finding[];
    recommendations: string[];
    generatedAt?: string;
  }
  ```
- **Правило:** LLM только объясняет и рекомендует; источник находок — сканеры. Проверяется структура ответа, соответствие файлам/строкам, отсутствие выдуманных CVE.
- **Пример JSON:**
  ```json
  {
    "id": "a1",
    "type": "ai.analyze",
    "position": { "x": 600, "y": 120 },
    "data": {
      "kind": "ai",
      "label": "AI analysis",
      "provider": "openai",
      "model": "gpt-4o-mini",
      "prompt": "Summarize security findings and give recommendations.",
      "temperature": 0.2,
      "maxTokens": 1024
    }
  }
  ```

---

## Статусы выполнения

- Run: `queued | running | success | failed | cancelled` (backend `Run.status`).
- Shared RunStatus: `pending | running | success | error | cancelled`.
- Нода: `idle | running | success | error | skipped` (`NodeRunStatus`).

Результат запуска (`Run`): `id`, `workflowId`, `status`, `nodeStatuses`, `nodeResults`, `startedAt?`, `finishedAt?`, `error?`.

## Поток данных между нодами

Движок выполняет ноды в топологическом порядке (`topologicalSort` в `src/backend/engine/workflow-engine.js`), передавая выходы. Условные ноды маршрутизируют данные по веткам (`condition: "true"/"false"` на edge). Сканеры возвращают `Finding[]`, которые агрегируются в AI-ноду и/или уведомления.

## Расширение

Новые типы нод — через расширение `NodeType` и `NodeData` в `src/shared/types/node.ts` плюс регистрация handler/UI. Движок использует `nodeHandler` (phase 2: реальные handlers для scanner/notify/ai/logic).

---

## 6. Шаблоны workflow (Templates)

Шаблон - сохранённый workflow, который можно переиспользовать и запускать как обычный workflow. Хранится в in-memory store (`templates` Map) и доступен через `/api/templates`.

### Схема `Template`

```ts
interface Template {
  id: string;
  name: string;
  description?: string;
  workflow: Workflow;        // полный снимок workflow (nodes, edges)
  author?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  isPublic?: boolean;
}
```

### API шаблонов

- `GET /api/templates` - список шаблонов.
- `POST /api/templates` - создать шаблон (`{ name?, description?, workflow? }`), ответ `201`.
- `GET /api/templates/:id` - получить шаблон.
- `DELETE /api/templates/:id` - удалить шаблон (`{ deleted: true }`).

### Работа с шаблоном

1. Создать workflow в редакторе и сохранить через `POST /api/workflows`.
2. Сохранить его как шаблон: `POST /api/templates` с `workflow` из шага 1.
3. Запустить шаблон: получить `workflow` из шаблона и создать новый workflow (`POST /api/workflows`), затем `POST /api/workflows/:id/run`.
4. Удалить устаревший шаблон через `DELETE /api/templates/:id`.

### Пример

```json
{
  "name": "Security scan template",
  "description": "Manual trigger -> secrets/sca/sast -> AI -> webhook",
  "workflow": {
    "name": "Security scan demo",
    "nodes": [],
    "edges": []
  }
}
```

---

## 7. AI-генерация отчётов

AI-узел (`ai.analyze`) запускает LLM-адаптер (`src/backend/services/ai.service.js`) и формирует `AiReport`:

- `summary` - краткое резюме.
- `riskLevel` - общий уровень риска (Severity).
- `findings` - объяснения и рекомендации по находкам.
- `recommendations` - топ-рекомендации.
- `generatedAt`, `model`, `provider`.

### Провайдеры и переменные окружения

- `LLM_PROVIDER` - `openai` | `anthropic` | `mock` (по умолчанию `mock`, если нет ключа).
- `LLM_API_KEY` / `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` - ключ API.
- `LLM_MODEL` - модель (по умолчанию `gpt-4o-mini` или `claude-3-5-sonnet-20241022`).
- `LLM_BASE_URL` - базовый URL API.

При отсутствии ключа или ошибке вызова используется mock-отчёт, поэтому демо работает без внешних сервисов.

### Гарантии отчёта

- В отчёт попадают только существующие finding id.
- Каждая находка получает запись (explanation/recommendation).
- LLM не должен выдумывать CVE; итоговый отчёт валидируется на бэкенде.

---

## 8. CI/CD (кратко)

Pipeline описан в `.github/workflows`:

- `ci.yml` - lint, typecheck, tests, build, Lighthouse CI.
- `deploy.yml` - сборка и деплой на GitHub Pages при push в `main`.
- `preview.yml` - сборка PR-preview.
- `monitor.yml` - проверка доступности Pages каждые 6 часов.

Подробности: [docs/deploy.md](deploy.md).

---

## 9. AI-генерация workflow (Generate)

Генератор создаёт валидный граф workflow по текстовому описанию.

### Endpoint

- `POST /api/generate` (алиасы: `/api/generate/generate`, `/api/generate/scenario`).
- Вход (`GenerateRequest`): `prompt` (3-2000), `name?`, `stack?`, `scanners?` (secrets/sca/sast), `notify?`/`notification?`, `aiReport?`, `targetPath?`, `webhookUrl?`.
- Выход (`GenerateResponse`): `name`, `stack?`, `nodes[]`, `edges[]`, `warnings[]`.

### Пример

```bash
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{ "prompt": "Security scan for Kotlin Spring Boot", "scanners": ["secrets","sca","sast"], "aiReport": true, "notify": "webhook", "webhookUrl": "https://example.com/hook" }'
```

Frontend использует модальное окно `AiGenerationModal` (предпросмотр и применение графа).

---

## 10. CI/CD-триггер (CI)

Запуск workflow из CI/CD pipeline.

### Endpoint

- `POST /api/ci` (алиасы: `/api/ci/run`, `/api/ci/runs`, `/api/ci/ci`, ...).
- Вход: `workflowId` | `workflow_id` | `id`, `branch?`, `repo?`, `input?`.
- Выход: `{ runId, source: "ci" }` (HTTP 202).

### Пример

```bash
curl -X POST http://localhost:3001/api/ci/run \
  -H "Content-Type: application/json" \
  -d '{ "workflowId": "wf_123", "branch": "main", "repo": "org/repo" }'
```

Shared-типы: `CiCdConfig`, `CiRun` (`src/shared/types/cicd.ts`) для конфигурации интеграции и истории запусков.