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