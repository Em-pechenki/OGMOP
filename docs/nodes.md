# Типы нод — OGMOP

Источник истины: `src/shared/types/node.ts` (`NodeType`, `NodeData` и производные). Ниже — описание типов, параметров и данных.

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

---

## 1. Trigger (триггеры запуска)

### `trigger.manual` — Запуск вручную (по кнопке)
- **Данные (`TriggerNodeData`):** `kind: "trigger"`, `triggerType: "manual"`, `label?`, `params?`.
- **Выход движка (заглушка Фазы 1):** `{ nodeId, type, data }`.

### `trigger.schedule` — Запуск по расписанию
- **Данные:** `kind: "trigger"`, `triggerType: "schedule"`, `label?`, `schedule?` (строка расписания), `params?`.

---

## 2. Logic (логика и ветвление)

### `logic.if` — Условное ветвление
- **Данные (`LogicNodeData`):** `kind: "logic"`, `logicType: "if"`, `label?`, `condition?`.

### `logic.compare` — Сравнение
- **Данные:** `kind: "logic"`, `logicType: "compare"`, `label?`, `operator?: "eq" | "ne" | "gt" | "lt" | "gte" | "lte" | "contains" | "regex"`, `left?`, `right?`.

### `logic.regex` — Проверка по регулярному выражению
- **Данные:** `kind: "logic"`, `logicType: "regex"`, `label?`, `pattern?`.

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

### `scanner.sca` — Проверка зависимостей (SCA)
- **Данные:** `kind: "scanner"`, `scannerType: "sca"`, `label?`, `config: ScanConfig`.

### `scanner.sast` — Статический анализ Kotlin/Spring Boot
- **Данные:** `kind: "scanner"`, `scannerType: "sast"`, `label?`, `config: ScanConfig`.

### Находка (`Finding`, `src/shared/types/finding.ts`)

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
- **Данные (`NotifyNodeData`):** `kind: "notify"`, `channel: "telegram"`, `label?`, `config: NotifyConfig` (поля `botToken?`, `chatId?` и др.).

### `notify.smtp`
- **Данные:** `kind: "notify"`, `channel: "smtp"`, `label?`, `config: NotifyConfig`.

### `notify.webhook`
- **Данные:** `kind: "notify"`, `channel: "webhook"`, `label?`, `config: NotifyConfig`.

---

## 5. AI (LLM-анализ)

### `ai.analyze` — AI-агрегация и рекомендации
- **Данные (`AiNodeData`):** `kind: "ai"`, `label?`, `provider?`, `model?`, `prompt?`, `temperature?`, `maxTokens?`.
- **Отчёт (`AiReport`, `src/shared/types/llm.ts`):**
  ```ts
  interface AiReport {
    summary: string;
    riskLevel?: Severity;
    findings: Finding[];
    recommendations: string[];
    generatedAt?: string;
  }
  ```

Правило: LLM только объясняет и рекомендует; источник находок — сканеры.

---

## Статусы выполнения

- Run: `pending | running | success | error | cancelled` (`RunStatus`).
- Нода: `idle | running | success | error | skipped` (`NodeRunStatus`).

Результат запуска (`RunResult`): `id`, `workflowId`, `status`, `startedAt?`, `finishedAt?`, `nodeResults: NodeResult[]`, `findings: Finding[]`, `aiReport?`, `error?`.

## Поток данных между нодами

Движок выполняет ноды в топологическом порядке (`topologicalSort` в `src/backend/engine/workflow-engine.js`), передавая выходы. Условные ноды маршрутизируют данные по веткам (`condition: "true"/"false"` на edge).

## Расширение

Новые типы нод — через расширение `NodeType` и `NodeData` в `src/shared/types/node.ts` плюс регистрация handler/UI. Движок Фазы 1 использует заглушку-обработчик (все ноды success).
