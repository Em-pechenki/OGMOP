# Деплой OGMOP

## Локальный запуск

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production-сборка в dist/
npm run preview   # предпросмотр production-сборки
npm run server    # backend на http://localhost:3001
```

Проверка качества:

```bash
npm run lint
npx tsc --noEmit
npm test
```

## Деплой на GitHub Pages

- Триггер: каждый `push` в `main` (и ручной `workflow_dispatch`).
- Workflow: `.github/workflows/deploy.yml`.
- Этапы: checkout → setup Node 20 → `npm ci` → `npm run build` → upload artifact `dist` → `deploy-pages`.
- URL: https://Em-pechenki.github.io/OGMOP/

## CI

- Workflow: `.github/workflows/ci.yml`.
- Этапы: checkout → setup Node 20 (кэш npm) → `npm ci` → lint (eslint) → typecheck (`tsc --noEmit`) → test (vitest) → build.
- Запускается на push/PR в `main` и `develop`.

## Секреты

- Секреты только через GitHub Secrets, никогда в коде.
- Локальные `.env` файлы игнорируются (`.gitignore`).

## Скрипты автоматизации

- `scripts/auto-commit.ps1` — автоматический коммит и пуш.
- `scripts/setup-github.ps1` — настройка репозитория и Pages (требует `gh` CLI).