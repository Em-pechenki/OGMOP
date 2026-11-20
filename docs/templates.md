# Шаблоны workflow и лендинг — OGMOP

Документ описывает готовые шаблоны workflow, которые можно использовать как стартовую точку в редакторе или через API, а также главную страницу (лендинг) приложения.

> Связанные документы: [docs/nodes.md](nodes.md) (типы нод), [docs/api/README.md](api/README.md) и [docs/api/openapi.yaml](api/openapi.yaml) (API), [docs/design/templates.md](design/templates.md) (UI-спецификация), [docs/design/pages.md](design/pages.md) (страницы).

---

## 1. Что такое шаблон

**Шаблон workflow** — сохранённый снимок графа (`Workflow`: `nodes` + `edges`) с метаданными (название, описание, теги, автор, публичность). Шаблон можно:

- просмотреть в библиотеке (`/templates`);
- применить в редакторе (узлы и связи загружаются на холст);
- скопировать как JSON;
- опубликовать/снять с публикации;
- удалить;
- использовать как основу для нового workflow через API.

Шаблоны хранятся в in-memory store бэкенда (`templates` Map) и сбрасываются при рестарте процесса (MVP). На фронтенде есть страница `/templates` с поиском, фильтрацией по тегам и действиями над карточками.

---

## 2. Модель `Template`

`src/shared/types/template.ts` / `src/shared/schemas/template.schema.ts`:

```ts
interface Template {
  id: string;
  name: string;
  description?: string;
  workflow: Workflow;          // полный снимок (nodes, edges, name, ...)
  author?: string;
  tags?: string[];
  createdAt?: string;         // ISO 8601
  updatedAt?: string;         // ISO 8601
  isPublic?: boolean;
  usageCount?: number;
  previewSvg?: string;
  version?: string;
  category?: string;
}
```

Поля, принимаемые при создании/обновлении (`TemplateCreateSchema`, `src/backend/validators/workflow.validator.js`):

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| `name` | string | 1–200 символов, опционально | Название шаблона. По умолчанию `Untitled template`. |
| `description` | string | до 2000 символов | Описание сценария. |
| `workflow` | any | опционально | Полный снимок workflow (`{ name, nodes, edges }`). Если не передан — пустой граф. |
| `isPublic` | boolean | опционально | Публичный шаблон. |
| `tags` | string[] | опционально | Теги для поиска/фильтрации (`secrets`, `sca`, `sast`, `ai`, `notify`, ...). |
| `author` | string | до 100 символов | Автор. |

Идентификатор генерируется автоматически (`tpl_<timestamp>_<rand>`), если не передан.

---

## 3. Готовые шаблоны (каталог)

Ниже — рекомендуемые готовые шаблоны, которые можно создать через `POST /api/templates` или собрать в редакторе. Они покрывают типовые сценарии проверки безопасности.

### 3.1. Базовый security-scan

- **Название:** `Базовый security-scan`
- **Описание:** Полный прогон: ручной запуск → поиск секретов → SCA → SAST → AI-отчёт → webhook.
- **Теги:** `secrets`, `sca`, `sast`, `ai`, `notify`, `manual`
- **Когда использовать:** стартовый сценарий для нового репозитория, демонстрация полного цикла.
- **Граф:** `trigger.manual → scanner.secrets → scanner.sca → scanner.sast → ai.analyze → notify.webhook`

Полный JSON:

```json
{
  "name": "Базовый security-scan",
  "description": "Полный прогон: ручной запуск → секреты → SCA → SAST → AI-отчёт → webhook.",
  "tags": ["secrets", "sca", "sast", "ai", "notify", "manual"],
  "workflow": {
    "name": "Базовый security-scan",
    "nodes": [
      { "id": "n1", "type": "trigger.manual", "position": { "x": 50, "y": 100 }, "data": { "kind": "trigger", "triggerType": "manual", "label": "Start scan" } },
      { "id": "n2", "type": "scanner.secrets", "position": { "x": 260, "y": 100 }, "data": { "kind": "scanner", "scannerType": "secrets", "label": "Secrets scan", "config": { "scannerType": "secrets", "targetPath": "./src/backend/seed/demo-repo", "includePatterns": ["**/*.kt", "**/*.kts", "**/*.properties", "**/*.yml"] } } },
      { "id": "n3", "type": "scanner.sca", "position": { "x": 470, "y": 100 }, "data": { "kind": "scanner", "scannerType": "sca", "label": "Dependency check", "config": { "scannerType": "sca", "targetPath": "./src/backend/seed/demo-repo" } } },
      { "id": "n4", "type": "scanner.sast", "position": { "x": 680, "y": 100 }, "data": { "kind": "scanner", "scannerType": "sast", "label": "SAST analysis", "config": { "scannerType": "sast", "targetPath": "./src/backend/seed/demo-repo" } } },
      { "id": "n5", "type": "ai.analyze", "position": { "x": 890, "y": 100 }, "data": { "kind": "ai", "label": "AI report", "provider": "openai", "model": "gpt-4o-mini", "prompt": "Summarize security findings and give recommendations." } },
      { "id": "n6", "type": "notify.webhook", "position": { "x": 1100, "y": 100 }, "data": { "kind": "notify", "channel": "webhook", "label": "Send report", "config": { "channel": "webhook", "url": "https://example.com/webhook", "method": "POST" } } }
    ],
    "edges": [
      { "id": "e1", "source": "n1", "target": "n2" },
      { "id": "e2", "source": "n2", "target": "n3" },
      { "id": "e3", "source": "n3", "target": "n4" },
      { "id": "e4", "source": "n4", "target": "n5" },
      { "id": "e5", "source": "n5", "target": "n6" }
    ]
  }
}
```

### 3.2. Быстрый поиск секретов

- **Название:** `Быстрый поиск секретов`
- **Описание:** Только сканер секретов с AI-триажем и уведомлением в Telegram.
- **Теги:** `secrets`, `ai`, `notify`, `telegram`, `quick`
- **Когда использовать:** быстрый pre-commit/pre-review, когда нужен только поиск утечек.
- **Граф:** `trigger.manual → scanner.secrets → ai.analyze → notify.telegram`

```json
{
  "name": "Быстрый поиск секретов",
  "description": "Только секреты: сканер + AI-триаж + уведомление в Telegram.",
  "tags": ["secrets", "ai", "notify", "telegram", "quick"],
  "workflow": {
    "name": "Быстрый поиск секретов",
    "nodes": [
      { "id": "t1", "type": "trigger.manual", "position": { "x": 0, "y": 0 }, "data": { "kind": "trigger", "triggerType": "manual", "label": "Start" } },
      { "id": "s1", "type": "scanner.secrets", "position": { "x": 220, "y": 0 }, "data": { "kind": "scanner", "scannerType": "secrets", "label": "Secrets", "config": { "scannerType": "secrets", "targetPath": "./src/backend/seed/demo-repo", "includePatterns": ["**/*"] } } },
      { "id": "a1", "type": "ai.analyze", "position": { "x": 440, "y": 0 }, "data": { "kind": "ai", "label": "AI triage", "provider": "openai", "model": "gpt-4o-mini", "prompt": "Triage secret findings and prioritize by risk." } },
      { "id": "n1", "type": "notify.telegram", "position": { "x": 660, "y": 0 }, "data": { "kind": "notify", "channel": "telegram", "label": "Telegram report", "config": { "channel": "telegram", "botToken": "<token>", "chatId": "<chat>" } } }
    ],
    "edges": [
      { "id": "e1", "source": "t1", "target": "s1" },
      { "id": "e2", "source": "s1", "target": "a1" },
      { "id": "e3", "source": "a1", "target": "n1" }
    ]
  }
}
```

### 3.3. Ночной SCA/SAST

- **Название:** `Ночной SCA/SAST`
- **Описание:** Запуск по расписанию: зависимости и статический анализ, AI-отчёт, отправка по email.
- **Теги:** `sca`, `sast`, `ai`, `notify`, `smtp`, `schedule`, `nightly`
- **Когда использовать:** регулярный контроль зависимостей и кода (cron).
- **Граф:** `trigger.schedule → scanner.sca → scanner.sast → ai.analyze → notify.smtp`

```json
{
  "name": "Ночной SCA/SAST",
  "description": "Ночной прогон зависимостей и SAST с AI-отчётом на email.",
  "tags": ["sca", "sast", "ai", "notify", "smtp", "schedule", "nightly"],
  "workflow": {
    "name": "Ночной SCA/SAST",
    "nodes": [
      { "id": "t1", "type": "trigger.schedule", "position": { "x": 0, "y": 0 }, "data": { "kind": "trigger", "triggerType": "schedule", "label": "Daily 02:00", "schedule": "0 2 * * *" } },
      { "id": "s1", "type": "scanner.sca", "position": { "x": 220, "y": 0 }, "data": { "kind": "scanner", "scannerType": "sca", "label": "Dependencies", "config": { "scannerType": "sca", "targetPath": "./src/backend/seed/demo-repo" } } },
      { "id": "s2", "type": "scanner.sast", "position": { "x": 440, "y": 0 }, "data": { "kind": "scanner", "scannerType": "sast", "label": "SAST", "config": { "scannerType": "sast", "targetPath": "./src/backend/seed/demo-repo" } } },
      { "id": "a1", "type": "ai.analyze", "position": { "x": 660, "y": 0 }, "data": { "kind": "ai", "label": "AI report", "provider": "openai", "model": "gpt-4o-mini", "prompt": "Summarize SCA/SAST findings and recommendations." } },
      { "id": "n1", "type": "notify.smtp", "position": { "x": 880, "y": 0 }, "data": { "kind": "notify", "channel": "smtp", "label": "Email report", "config": { "channel": "smtp", "host": "smtp.example.com", "port": 587, "from": "ogmop@example.com", "to": ["dev@example.com"], "subject": "OGMOP nightly report" } } }
    ],
    "edges": [
      { "id": "e1", "source": "t1", "target": "s1" },
      { "id": "e2", "source": "s1", "target": "s2" },
      { "id": "e3", "source": "s2", "target": "a1" },
      { "id": "e4", "source": "a1", "target": "n1" }
    ]
  }
}
```

### 3.4. CI gate

- **Название:** `CI gate`
- **Описание:** Полный скан с условием: при наличии критических находок — уведомление в webhook (gate для PR/CI).
- **Теги:** `ci`, `secrets`, `sca`, `sast`, `logic`, `notify`, `webhook`
- **Когда использовать:** интеграция в CI/CD pipeline через `POST /api/ci`.
- **Граф:** `trigger.manual → scanner.secrets → scanner.sca → scanner.sast → logic.compare (critical >= 1) → notify.webhook`

```json
{
  "name": "CI gate",
  "description": "Полный скан с условием: при критических находках — уведомление в webhook.",
  "tags": ["ci", "secrets", "sca", "sast", "logic", "notify", "webhook"],
  "workflow": {
    "name": "CI gate",
    "nodes": [
      { "id": "t1", "type": "trigger.manual", "position": { "x": 0, "y": 0 }, "data": { "kind": "trigger", "triggerType": "manual", "label": "CI trigger" } },
      { "id": "s1", "type": "scanner.secrets", "position": { "x": 220, "y": 0 }, "data": { "kind": "scanner", "scannerType": "secrets", "label": "Secrets", "config": { "scannerType": "secrets", "targetPath": "./src/backend/seed/demo-repo" } } },
      { "id": "s2", "type": "scanner.sca", "position": { "x": 440, "y": 0 }, "data": { "kind": "scanner", "scannerType": "sca", "label": "SCA", "config": { "scannerType": "sca", "targetPath": "./src/backend/seed/demo-repo" } } },
      { "id": "s3", "type": "scanner.sast", "position": { "x": 660, "y": 0 }, "data": { "kind": "scanner", "scannerType": "sast", "label": "SAST", "config": { "scannerType": "sast", "targetPath": "./src/backend/seed/demo-repo" } } },
      { "id": "l1", "type": "logic.compare", "position": { "x": 880, "y": 0 }, "data": { "kind": "logic", "logicType": "compare", "label": "Critical >= 1?", "operator": "gte", "left": "{{criticalCount}}", "right": "1" } },
      { "id": "n1", "type": "notify.webhook", "position": { "x": 1100, "y": 0 }, "data": { "kind": "notify", "channel": "webhook", "label": "Webhook alert", "config": { "channel": "webhook", "url": "https://example.com/hook", "method": "POST" } } }
    ],
    "edges": [
      { "id": "e1", "source": "t1", "target": "s1" },
      { "id": "e2", "source": "s1", "target": "s2" },
      { "id": "e3", "source": "s2", "target": "s3" },
      { "id": "e4", "source": "s3", "target": "l1" },
      { "id": "e5", "source": "l1", "target": "n1", "condition": "true" }
    ]
  }
}
```

---

## 4. Применение шаблона в UI

1. Откройте `/templates`.
2. Найдите шаблон через поиск/фильтры по тегам.
3. Нажмите **«Использовать»** — узлы и связи загружаются в редактор (`/editor`), показывается toast «Шаблон загружен в редактор».
4. При необходимости измените параметры нод (targetPath, токены, URL) и запустите workflow.
5. **«Копировать JSON»** — копирует `workflow` шаблона в буфер.
6. **«Опубликовать/Снять с публикации»** — переключает `isPublic`.
7. **«Удалить»** — удаляет шаблон после подтверждения.

Создание своего шаблона: кнопка **«Создать шаблон»** на `/templates` — форма с названием, описанием, Workflow JSON и флагом «Публичный».

---

## 5. Работа через API

Базовый URL: `http://localhost:3001`. Ответы: `{ "data": <T>, "error": null }`.

### Список шаблонов

```bash
curl http://localhost:3001/api/templates
```

### Создание шаблона

```bash
curl -X POST http://localhost:3001/api/templates \
  -H "Content-Type: application/json" \
  -d @template.json
# -> 201 { "data": { "id": "tpl_...", ... }, "error": null }
```

### Получение шаблона

```bash
curl http://localhost:3001/api/templates/<id>
```

### Обновление (patch/put)

```bash
curl -X PATCH http://localhost:3001/api/templates/<id> \
  -H "Content-Type: application/json" \
  -d '{ "isPublic": true, "tags": ["secrets", "ai"] }'
```

### Удаление

```bash
curl -X DELETE http://localhost:3001/api/templates/<id>
# -> { "data": { "deleted": true }, "error": null }
```

### Применение шаблона как workflow

Шаблон не запускается напрямую. Получите `workflow` и создайте workflow:

```bash
# 1. получить шаблон
curl http://localhost:3001/api/templates/<id>  # -> data.workflow

# 2. создать workflow из шаблона
curl -X POST http://localhost:3001/api/workflows \
  -H "Content-Type: application/json" \
  -d '{ "name": "From template", "nodes": [...], "edges": [...] }'

# 3. запустить
curl -X POST http://localhost:3001/api/workflows/<workflowId>/run \
  -H "Content-Type: application/json" \
  -d '{ "input": {} }'
```

---

## 6. Создание собственного шаблона из workflow

1. Соберите и сохраните workflow (`POST /api/workflows`).
2. Скопируйте объект workflow из ответа.
3. Вызовите `POST /api/templates` с `{ name, description, workflow, tags, isPublic }`.
4. Проверьте появление в `GET /api/templates` и на странице `/templates`.

Рекомендации:
- задавайте понятные `name`/`description`;
- используйте теги для фильтрации;
- не храните секреты в шаблонах (токены, пароли, URL с credentials);
- для CI-шаблонов используйте плейсхолдеры (`<token>`, `https://example.com/hook`) и документируйте необходимые переменные.

---

## 7. Публикация, поиск и сортировка

- Поиск по названию, описанию и тегам (debounce 300 мс).
- Фильтр по тегам (multi-select chips): `secrets`, `sca`, `sast`, `notify`, `ai`, `trigger`, `logic`.
- Сортировка: популярные (по умолчанию), новые, по имени A→Z/Z→A.
- Публичные шаблоны помечаются badge «Публичный».
- In-memory store: данные сбрасываются при рестарте (MVP).

---

## 8. Лендинг (главная страница)

Главная страница (`/`, `src/frontend/pages/HomePage.tsx`) — лендинг GitHub Pages-сборки:

- **Заголовок:** «Cyber Garden 2026».
- **Подзаголовок:** «AI Security Workflow — визуальная платформа автоматизации проверок безопасности кода».
- **CTA:** «Открыть редактор» (`/editor`), «Шаблоны» (`/templates`).
- **Карточки возможностей:** Конструктор (drag-and-drop редактор), Сканеры (Secrets/SCA/SAST), AI-отчёты (LLM).
- **Навигация:** Header с пунктами Editor / Runs / Templates; Footer на страницах, кроме редактора.

Лендинг доступен по URL production: https://Em-pechenki.github.io/OGMOP/.

---

## 9. Ограничения MVP

- Шаблоны хранятся в памяти процесса (`in-memory store`) и сбрасываются при рестарте.
- Нет версионирования/миграций шаблонов; поле `version` опционально.
- Превью графа (`previewSvg`) не генерируется автоматически.
- Публикация не имеет полноценной авторизации/RBAC (MVP).
- При применении шаблона в редакторе граф полностью заменяется (предыдущий несохранённый workflow теряется — сохраните перед применением).