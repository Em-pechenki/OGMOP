# API — OGMOP

Базовый URL (локальный бэкенд): `http://localhost:3001`. Фронтенд на GitHub Pages обращается к бэкенду по настраиваемому base URL (планируется).

Все ответы оборачиваются в `ApiResponse<T>`:

```ts
interface ApiResponse<T> {
  data: T;
  error?: string;
}
```

## Статусы эндпоинтов

| Статус | Значение |
|--------|----------|
| ✅ Реализовано | Доступно в `src/backend/index.js` |
| 🟡 Черновик | Контракт предложен, реализация в процессе |
| 🔵 Планируется | Запланировано (см. backlog) |

## Эндпоинты

### `GET /api/health` — ✅ Реализовано

Проверка живости сервера.

**Ответ 200:**
```json
{ "status": "ok", "project": "OGMOP" }
```

---

### `POST /api/workflow/run` — 🟡 Черновик

Запуск workflow. Тело — сериализованный граф.

**Запрос:**
```json
{
  "workflow": {
    "id": "wf_1",
    "name": "Secrets scan",
    "nodes": [
      { "id": "n1", "type": "trigger.button", "position": { "x": 0, "y": 0 }, "data": {} }
    ],
    "edges": [
      { "id": "e1", "source": "n1", "target": "n2" }
    ]
  },
  "inputs": {
    "repoPath": "/path/to/test-repo"
  }
}
```

**Ответ 202:**
```json
{
  "data": { "runId": "run_abc123", "status": "queued" }
}
```

**Ошибки:** `400` при невалидном теле (Zod), `429` при rate-limit.

---

### `GET /api/runs/:id` — 🟡 Черновик

Статус выполнения запуска, статусы нод, находки, логи.

**Ответ 200:**
```json
{
  "data": {
    "runId": "run_abc123",
    "status": "running",
    "nodes": {
      "n1": { "status": "success", "output": { "triggered": true } }
    },
    "findings": [
      { "id": "f1", "severity": "high", "file": "src/Foo.kt", "line": 12, "rule": "hardcoded-secret", "message": "..." }
    ],
    "logs": ["..."]
  }
}
```

**Статусы run:** `queued | running | success | error | canceled`.

**Статусы ноды:** `idle | running | success | error | skipped`.

---

### `GET /api/runs` — 🔵 Планируется

Список запусков (история). Пагинация — планируется.

---

### `POST /api/workflow` / `GET /api/workflow/:id` — 🔵 Планируется

Сохранение/загрузка workflow (сейчас — localStorage на фронте).

---

### `POST /api/notify/test` — 🔵 Планируется

Тестовый вызов канала уведомлений (Telegram/SMTP/webhook) с маскированием секретов.

## Типы (черновик, будут уточнены в `src/shared`)

Сущности (планируются DATA-треком): `Node`, `Edge`, `Workflow`, `TriggerNode`, `LogicNode`, `NotifyNode`, `ScannerNode`, `Finding`, `Severity`, `RunStatus`, `NodeStatus`, `ScanResult`. См. `docs/nodes.md` и `docs/backlog.md`.

## Примечания

- Контракты помечены как черновик и будут уточняться по мере реализации BE/DATA треков. Не использовать как финальную спецификацию до стабилизации.
- Секреты (токены) передаются в зашифрованном/маскированном виде; в логах не отображаются (цель).
- OpenAPI-спецификация — планируется (Фаза 2).
