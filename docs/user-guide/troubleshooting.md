# Troubleshooting — OGMOP

Сборник типичных проблем и способов их решения. Если проблема не описана — проверьте логи бэкенда/браузера и `requestId` из ответа.

## 1. Установка и запуск

### `node: command not found` / неверная версия Node
- Установите Node.js 20 LTS. Проверьте `node --version`.
- На Windows используйте nvm-windows, на macOS/Linux — nvm.

### `npm install` падает с ошибками сети
- Повторите `npm install`. Проверьте прокси/VPN.
- Очистите кэш: `npm cache clean --force`.
- Используйте `npm ci` (требует `package-lock.json`).

### `EADDRINUSE: address already in use :::3001`
- Порт занят. Измените порт: `PORT=3002 npm run server` и обновите `VITE_API_URL`.
- Или завершите процесс: Windows `taskkill /F /IM node.exe`, Linux/macOS `pkill node`.

### Бэкенд не отвечает / `curl` connection refused
- Убедитесь, что запущен `npm run server` и процесс не упал.
- Проверьте `PORT` и URL. Health: `curl http://localhost:3001/api/health`.
- Проверьте firewall/антивирус (локальный порт).

## 2. Фронтенд ↔ бэкенд

### Ошибки CORS в консоли браузера
- Убедитесь, что origin фронтенда разрешён: задайте `CORS_ORIGINS=http://localhost:5173`.
- В production (`NODE_ENV=production`) список origin по умолчанию пуст — обязательно задайте `CORS_ORIGINS`.
- Фронтенд должен обращаться к правильному `VITE_API_URL`.

### `Network Error` / запросы уходят не туда
- Проверьте `VITE_API_URL` (по умолчанию `http://localhost:3001`).
- Перезапустите `npm run dev` после изменения `.env`.

### 404 на GitHub Pages / белая страница
- Проверьте `base: "/OGMOP/"` в `vite.config.ts`.
- Убедитесь, что артефакт `dist` собран и задеплоен (Actions → deploy).
- Очистите кэш браузера.

## 3. Сканеры

### Пустые результаты (0 findings)
- Движок по умолчанию сканирует `src/backend/seed/demo-repo` (при запуске из корня проекта). Запускайте бэкенд из корня репозитория: `cd OGMOP && npm run server`.
- Проверьте `targetPath`/`includePatterns` в ноде (для secrets). Пути разрешаются относительно корня проекта на сервере.
- Убедитесь, что файлы имеют расширения `.kt`, `.kts`, `.properties`, `.gradle` и т.п.

### `ENOENT` / файл не найден
- Путь `targetPath` не существует на сервере. Используйте абсолютный путь или путь относительно корня проекта.
- На Windows используйте прямые слеши `/` в JSON.

### SCA не находит CVE
- Проверьте наличие `src/backend/seed/cve-database.json`.
- Убедитесь, что `build.gradle.kts` содержит зависимости в формате `implementation("group:artifact:version")`.
- Версии должны попадать в `affectedVersions` из CVE-базы.

### SAST даёт ложные срабатывания
- Правила эвристические. Используйте логические ноды (`logic.if`/`logic.regex`) для фильтрации, либо скорректируйте правила в `scanner-sast.service.js`.

## 4. AI-анализ

### Отчёт выглядит как шаблон (mock)
- Не задан `LLM_API_KEY`/`OPENAI_API_KEY`/`ANTHROPIC_API_KEY`, либо `LLM_PROVIDER=mock`. Задайте ключ и провайдера.
- Проверьте доступность API (сеть, прокси). При ошибке вызова LLM движок автоматически откатывается на mock и пишет предупреждение в лог.

### LLM возвращает невалидный JSON
- Движок валидирует структуру ответа (`validateReport`) и отбрасывает выдуманные CVE/несуществующие id находок. Попробуйте другую модель или понизьте `temperature`.

### Использование локальной модели (Ollama/vLLM)
- Установите `LLM_PROVIDER=openai`, `LLM_BASE_URL=http://localhost:11434` (или ваш), `LLM_MODEL=llama3`, `LLM_API_KEY=dummy` (если требуется). Убедитесь, что эндпоинт совместим с OpenAI API.

## 5. Уведомления

### Telegram: `token/chatId missing` или HTTP 401/403
- Проверьте `botToken` и `chatId` в config ноды или env `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID`.
- Бот должен быть добавлен в чат и иметь право отправлять сообщения.

### SMTP: `nodemailer not installed`
- Установите `npm install nodemailer`. Без него нода вернёт `{ ok: false }`, но запуск завершится успешно.

### SMTP: ошибка авторизации/подключения
- Проверьте host/port/secure/user/password. Для Gmail используйте пароль приложения.
- Проверьте firewall.

### Webhook: `fetch failed` / non-2xx
- URL должен быть доступен с сервера (не из браузера). Проверьте сеть и CORS не требуется для серверных запросов.
- Для демо используйте публичный echo-эндпоинт или локальный сервер.

## 6. API и валидация

### `400` с `details`
- Тело запроса не прошло Zod-валидацию. Проверьте поля `name`, `nodes`, `edges` и типы нод. См. `docs/api/README.md`.

### `404 Not found`
- Неверный id workflow/run. Проверьте ответ создания.

### `429 Too Many Requests`
- Превышен rate-limit. Подождите окно (по умолчанию 15 минут) или увеличьте `RATE_LIMIT_MAX`.

### `413 Payload Too Large`
- Тело запроса больше `BODY_LIMIT` (по умолчанию 1mb). Увеличьте `BODY_LIMIT` или уменьшите workflow.

## 7. Выполнение workflow

### Статус `failed`
- Откройте `GET /api/runs/:id` и проверьте `error` и `nodeStatuses`. Упавшая нода имеет статус `failed`.

### Уведомление не отправлено, но запуск успешен
- Нода notify возвращает `{ ok: false }` при ошибке канала, но не прерывает выполнение. Проверьте конфиг канала.

### История запусков пропала после перезапуска
- Хранилище in-memory (MVP). После рестарта бэкенда запуски и workflow теряются. Сохраняйте workflow локально (localStorage) или в файл.

### Цикл в графе
- Движок выполняет топологическую сортировку; ноды из цикла добавляются в конец. Избегайте циклов или используйте логические ветки.

## 8. Сборка и тесты

### `tsc --noEmit` ошибки путей
- Проверьте `tsconfig.json` paths (`@shared/*`, `@frontend/*`) и `baseUrl`.

### Тесты падают на CI
- Запустите локально: `npm test`. Проверьте версию Node (20).
- Lighthouse-пороги: performance ≥0.7 (warn), accessibility ≥0.9 (error), best-practices ≥0.9 (warn), SEO ≥0.9 (error).

## 9. Windows-специфика

- Используйте PowerShell или Git Bash. В cmd пути с пробелами оборачивайте в кавычки.
- Разделители путей: в JSON используйте `/`.
- Скрипты `.ps1` запускайте с `-ExecutionPolicy Bypass`.

## 10. Контакты и отчёт об ошибках

- Логи бэкенда: консоль процесса `npm run server`.
- Логи фронтенда: DevTools → Console/Network.
- При обращении укажите версию Node, ОС, шаги воспроизведения и `requestId`.