# Типы нод — OGMOP

Ноды — строительные блоки workflow. Каждая нода имеет тип, параметры (настраиваются в боковой панели редактора), входы/выходы данных и статус выполнения.

Общий контракт ноды:

```ts
interface Node {
  id: string;
  type: string;            // например "trigger.button"
  position: { x: number; y: number };
  data: Record<string, unknown>; // параметры
}
```

Статусы ноды: `idle | running | success | error | skipped`.

---

## 1. Trigger (триггеры запуска)

Запускают выполнение workflow.

### `trigger.button` — Запуск по кнопке
- **Параметры:** `label?: string` (текст кнопки).
- **Выход:** `{ triggered: true, at: ISO8601 }`.
- **Примечание:** Основной триггер для демо.

### `trigger.schedule` — Запуск по расписанию
- **Параметры:** `cron: string` (выражение cron), `timezone?: string`.
- **Выход:** `{ triggered: true, at: ISO8601 }`.
- **Примечание:** В MVP может быть эмулирован (ручной запуск по расписанию).

---

## 2. Logic (логика и ветвление)

### `logic.if` — Условное ветвление (if/else)
- **Параметры:** `expression: string` (условие, например сравнение полей входных данных).
- **Вход:** любые данные предыдущей ноды.
- **Выход:** данные передаются по ветке `true`/`false` (два выходных порта).
- **Примечание:** Выражение вычисляется безопасно (без eval произвольного кода — цель).

### `logic.compare` — Сравнение
- **Параметры:** `left: string`, `operator: "==" | "!=" | ">" | "<" | ">=" | "<="`, `right: string`.
- **Выход:** `{ result: boolean }`.

### `logic.regex` — Проверка по регулярному выражению
- **Параметры:** `pattern: string`, `flags?: string`, `inputField?: string`.
- **Выход:** `{ matched: boolean, matches: string[] }`.

---

## 3. Scanner (анализаторы безопасности)

Собственные анализаторы (без готовых сканеров). Вход — путь к тестовому репозиторию (или файлы). Выход — массив `Finding[]`.

### `scanner.secrets` — Поиск секретов
- **Параметры:** `paths?: string[]` (глобы), `rules?: string[]` (подмножество правил).
- **Правила (эвристики/regex):** пароли, API-ключи, токены (AWS, GitHub, generic), приватные ключи, JDBC URL с паролями и т.п.
- **Выход:** `Finding[]` с `rule: "hardcoded-secret" | ...`.

### `scanner.sca` — Проверка зависимостей (SCA)
- **Параметры:** `buildFile?: string` (по умолчанию `build.gradle.kts`), `cveDbPath?: string` (JSON справочник).
- **Логика:** парсинг Gradle Kotlin DSL, извлечение зависимостей и версий, сравнение с CVE JSON (нормализованные диапазоны версий).
- **Выход:** `Finding[]` с `rule: "vulnerable-dependency"`, `cve?: string`.

### `scanner.sast` — Статический анализ Kotlin/Spring Boot
- **Параметры:** `paths?: string[]`, `rules?: string[]`.
- **Правила (собственные эвристики):** SQL-инъекция (конкатенация в запросах), захардкоженные креды, небезопасная конфигурация Spring (отключённая CSRF, открытые эндпоинты, debug), небезопасная десериализация и т.п.
- **Выход:** `Finding[]` с `rule: "sast-*"`.

### Общий тип находки

```ts
interface Finding {
  id: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  file: string;
  line?: number;
  column?: number;
  rule: string;
  message: string;
  cve?: string;       // для SCA
  snippet?: string;   // фрагмент кода
}
```

### Уровни критичности

| Уровень | Цвет | Описание |
|---------|------|----------|
| critical | красный | Критическая уязвимость, требует немедленного исправления |
| high | оранжевый | Серьёзная проблема |
| medium | жёлтый | Умеренный риск |
| low | зелёный | Низкий риск / best practice |
| info | серый | Информационное замечание |

---

## 4. Notify (уведомления)

Один канал на выбор (требование ТЗ).

### `notify.telegram`
- **Параметры:** `botToken: string` (секрет, маскируется), `chatId: string`, `messageTemplate?: string`.
- **Вход:** результаты/отчёт.
- **Выход:** `{ sent: boolean, messageId?: string }`.

### `notify.smtp`
- **Параметры:** `host`, `port`, `user`, `password` (секрет), `to`, `subject`, `template?`.
- **Выход:** `{ sent: boolean }`.

### `notify.webhook`
- **Параметры:** `url: string`, `method?: "POST" | "PUT"`, `headers?: Record<string,string>`, `bodyTemplate?: string`.
- **Выход:** `{ status: number, ok: boolean }`.

---

## 5. AI (LLM-анализ)

### `ai.analyze` — AI-агрегация и рекомендации
- **Параметры:** `provider?: "openai" | "anthropic" | "ollama" | "vllm"`, `model?: string`, `promptTemplate?: string`, `language?: "ru" | "en"`.
- **Вход:** массив `Finding[]` (и опционально контекст кода).
- **Выход:**
  ```json
  {
    "summary": "Краткое резюме",
    "findings": [
      { "findingId": "f1", "explanation": "...", "recommendation": "...", "severity": "high" }
    ],
    "recommendations": ["..."]
  }
  ```
- **Правило:** LLM только объясняет и рекомендует; источник находок — сканеры. Ответ валидируется по схеме; несуществующие CVE/файлы отбрасываются.

---

## Поток данных между нодами

Нода получает на вход выход предыдущей ноды (или массив при нескольких входах). Движок выполняет ноды в топологическом порядке, передавая результаты. Условные ноды (`logic.if`) маршрутизируют данные по веткам.

## Расширение

Новые типы нод регистрируются в реестре (см. ADR-0005): тип → `{ schema, defaultParams, executor, uiComponent }`. Движок и редактор подхватывают автоматически.
