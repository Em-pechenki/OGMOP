# Установка и запуск OGMOP

Это руководство описывает установку OGMOP с нуля: зависимости, конфигурацию, запуск фронтенда и бэкенда, сборку и деплой.

## 1. Требования

- **Node.js 20 LTS** (проверено на 20.x). Рекомендуется установка через [nvm](https://github.com/nvm-sh/nvm) / [nvm-windows](https://github.com/coreybutler/nvm-windows).
- **npm 10+** (идёт в комплекте с Node.js).
- **Git**.
- Браузер (Chrome/Edge/Firefox) для фронтенда.
- Опционально:
  - Ключ LLM (OpenAI или Anthropic) для реального AI-анализа. Без ключа используется встроенный mock-отчёт.
  - `nodemailer` (опциональная зависимость) для SMTP-уведомлений.
  - Токен Telegram-бота и chat id для уведомлений в Telegram.

Проверка версий:

```bash
node --version   # v20.x.x
npm --version    # 10.x.x
git --version
```

## 2. Клонирование репозитория

```bash
git clone https://github.com/Em-pechenki/OGMOP.git
cd OGMOP
```

## 3. Установка зависимостей

```bash
npm install
```

Команда устанавливает зависимости фронтенда и бэкенда (общий `package.json`). При проблемах с сетью повторите команду или используйте `npm ci`.

## 4. Конфигурация окружения

Бэкенд читает переменные окружения из процесса (автозагрузка `.env` не выполняется). Фронтенд (Vite) автоматически читает `.env`, `.env.local` и т.п. для переменных с префиксом `VITE_`.

### 4.1. Фронтенд

Создайте файл `src/frontend/.env.local` (или `.env` в корне проекта) при необходимости:

```env
VITE_API_URL=http://localhost:3001
```

По умолчанию фронтенд обращается к `http://localhost:3001`.

### 4.2. Бэкенд

Установите переменные в оболочке перед запуском. Пример для PowerShell:

```powershell
$env:PORT = "3001"
$env:NODE_ENV = "development"
$env:CORS_ORIGINS = "http://localhost:5173"
$env:LLM_PROVIDER = "openai"
$env:LLM_API_KEY = "sk-..."
$env:LLM_MODEL = "gpt-4o-mini"
npm run server
```

Пример для bash:

```bash
export PORT=3001
export LLM_PROVIDER=openai
export LLM_API_KEY=sk-...
npm run server
```

### 4.3. Справочник переменных

| Переменная | По умолчанию | Назначение |
|------------|--------------|------------|
| `PORT` | `3001` | Порт бэкенда |
| `NODE_ENV` | — | `production` включает строгий CORS (пустой список origin) и HSTS |
| `CORS_ORIGINS` / `FRONTEND_ORIGIN` / `ALLOWED_ORIGINS` | localhost:5173, 3000, 4173 (dev) | Разрешённые origin (через запятую) |
| `TRUST_PROXY` | `1` | Количество прокси перед приложением |
| `RATE_LIMIT_WINDOW_MS` | `900000` (15 мин) | Окно rate-limit |
| `RATE_LIMIT_MAX` | `300` | Лимит запросов на окно |
| `RATE_LIMIT_AUTH_MAX` | `20` | Лимит для auth-эндпоинтов |
| `BODY_LIMIT` | `1mb` | Лимит размера тела запроса |
| `LLM_PROVIDER` | `openai` (если есть ключ) иначе `mock` | `openai` / `anthropic` / `mock` |
| `LLM_API_KEY` / `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` | — | Ключ LLM |
| `LLM_MODEL` | `gpt-4o-mini` / `claude-3-5-sonnet-20241022` | Имя модели |
| `LLM_BASE_URL` | `https://api.openai.com` / `https://api.anthropic.com` | Базовый URL LLM (для Ollama/vLLM укажите локальный) |
| `TELEGRAM_BOT_TOKEN` | — | Токен бота (можно передать в config ноды) |
| `TELEGRAM_CHAT_ID` | — | Chat id (можно передать в config ноды) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `SMTP_TO` | — | SMTP-уведомления |

Секреты никогда не коммитьте в репозиторий.

## 5. Запуск в режиме разработки

Терминал 1 — бэкенд (движок + сканеры):

```bash
npm run server
# http://localhost:3001
# проверка: curl http://localhost:3001/api/health
```

Терминал 2 — фронтенд:

```bash
npm run dev
# http://localhost:5173
```

Откройте http://localhost:5173 в браузере.

## 6. Проверка работоспособности

```bash
curl http://localhost:3001/api/health
# -> { "data": { "status": "ok", "project": "OGMOP", ... }, "error": null }
```

Создание тестового workflow через API:

```bash
curl -X POST http://localhost:3001/api/workflows \
  -H "Content-Type: application/json" \
  -d '{"name":"demo","nodes":[],"edges":[]}'
```

## 7. Сборка production-версии

```bash
npm run build      # результат в dist/
npm run preview    # предпросмотр на http://localhost:4173
npm run lint       # ESLint
npx tsc --noEmit   # проверка типов
npm test           # Vitest
```

## 8. Деплой на GitHub Pages

Деплой автоматический при push в `main` (workflow `.github/workflows/deploy.yml`). Вручную:

1. Соберите проект: `npm run build`.
2. Убедитесь, что `vite.config.ts` содержит `base: "/OGMOP/"`.
3. Запушьте изменения в `main`.

URL: https://Em-pechenki.github.io/OGMOP/

## 9. Опциональные зависимости

- **SMTP**: установите `nodemailer` (`npm install nodemailer`) — без него нода `notify.smtp` вернёт `{ ok: false, error: "nodemailer not installed" }`, но запуск завершится успешно.
- **AI**: для реального анализа укажите `LLM_API_KEY`. Без ключа используется mock-отчёт.

## 10. Удаление / откат

```bash
git status
git stash        # временно спрятать изменения
git reset --hard HEAD   # откат (осторожно!)
```

Подробнее о проблемах — в [troubleshooting.md](troubleshooting.md). Демо-сценарий — в [docs/demo.md](../../demo.md).