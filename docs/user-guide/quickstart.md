# Быстрый старт пользователя — OGMOP

Это руководство показывает, как собрать сценарий (workflow) из нод, запустить его на тестовом репозитории и прочитать результат.

## 1. Запуск

Требования: Node.js 20+, npm.

```bash
git clone https://github.com/Em-pechenki/OGMOP.git
cd OGMOP
npm install
```

Запустите бэкенд (движок + сканеры):

```bash
npm run server
# http://localhost:3001, проверка: curl http://localhost:3001/api/health
```

Запустите фронтенд:

```bash
npm run dev
# http://localhost:5173
```

## 2. Создание workflow

1. Откройте редактор (`/editor`).
2. Перетащите ноды из палитры на холст (React Flow):
   - Триггер: `trigger.manual` (запуск по кнопке).
   - Сканеры: `scanner.secrets`, `scanner.sca`, `scanner.sast`.
   - AI: `ai.analyze`.
   - Уведомление: `notify.telegram` (или smtp/webhook).
3. Соедините ноды рёбрами (drag от выхода к входу).
4. В боковой панели свойств настройте параметры каждой ноды:
   - Для сканеров укажите `config.targetPath` (например, `./src/backend/seed/demo-repo`).
   - Для AI укажите `provider`, `model`, `prompt`.
   - Для уведомлений укажите токен/URL и получателей.
5. Сохраните workflow (кнопка Save или `POST /api/workflows`).

Пример workflow JSON:

```json
{
  "name": "Security scan demo",
  "nodes": [
    { "id": "t1", "type": "trigger.manual", "position": { "x": 0, "y": 0 }, "data": { "kind": "trigger", "triggerType": "manual", "label": "Start" } },
    { "id": "s1", "type": "scanner.secrets", "position": { "x": 200, "y": 0 }, "data": { "kind": "scanner", "scannerType": "secrets", "label": "Secrets", "config": { "scannerType": "secrets", "targetPath": "./src/backend/seed/demo-repo" } } },
    { "id": "a1", "type": "ai.analyze", "position": { "x": 400, "y": 0 }, "data": { "kind": "ai", "label": "AI", "provider": "openai", "model": "gpt-4o-mini", "prompt": "Summarize findings" } },
    { "id": "n1", "type": "notify.telegram", "position": { "x": 600, "y": 0 }, "data": { "kind": "notify", "channel": "telegram", "label": "Report", "config": { "channel": "telegram", "botToken": "<token>", "chatId": "<chat>" } } }
  ],
  "edges": [
    { "id": "e1", "source": "t1", "target": "s1" },
    { "id": "e2", "source": "s1", "target": "a1" },
    { "id": "e3", "source": "a1", "target": "n1" }
  ]
}
```

Создание через API:

```bash
curl -X POST http://localhost:3001/api/workflows \
  -H "Content-Type: application/json" \
  -d @workflow.json
```

## 3. Запуск workflow

Через UI: нажмите «Run» в редакторе. Через API:

```bash
curl -X POST http://localhost:3001/api/workflows/<workflowId>/run \
  -H "Content-Type: application/json" \
  -d '{ "input": {} }'
# -> { "data": { "runId": "run_..." }, "error": null }
```

Движок выполняет ноды в топологическом порядке, обновляя статусы в реальном времени.

## 4. Чтение результата

Опросите статус запуска:

```bash
curl http://localhost:3001/api/runs/<runId>
```

Ответ содержит:

- `status` — `queued | running | success | failed | cancelled`.
- `nodeStatuses` — карта статусов нод (`idle/running/success/error/skipped`).
- `nodeResults` — выходы нод (для сканеров — `findings[]`).
- `error` — текст ошибки при падении.
- `startedAt` / `finishedAt` — времена.

В UI: страница `/run/:id` подсвечивает статусы нод и показывает находки по severity (critical/high/medium/low/info). AI-нода возвращает `AiReport` (summary, riskLevel, recommendations). Уведомление отправляется через выбранный канал.

## 5. Фильтрация находок

Находки (`Finding`) содержат: `severity`, `title`, `file`, `line`, `ruleId`, `scanner`, `cve`, `recommendation`. Фильтруйте по severity в панели результатов.

## 6. Уведомления

Настройте одну из нод: `notify.telegram`, `notify.smtp` или `notify.webhook`. Секреты (токены/пароли) храните зашифрованно/маскируйте, не коммитьте в репозиторий.

## 7. Troubleshooting

- Бэкенд не отвечает: проверьте `PORT`, запустите `npm run server`, проверьте `/api/health`.
- CORS: убедитесь, что фронтенд обращается к правильному `VITE_API_URL`.
- Пустые результаты сканеров: проверьте `targetPath` и `includePatterns`.
- In-memory store сбрасывается при рестарте — история запусков не сохраняется (MVP).