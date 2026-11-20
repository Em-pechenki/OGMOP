# Деплой OGMOP

## Локальный запуск

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production-сборка в dist/
npm run preview   # предпросмотр production-сборки
npm run server    # backend на http://localhost:3001
```

Проверки качества:

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
```

## Деплой на GitHub Pages

- Триггер: `push` в ветку `main` (или ручной `workflow_dispatch`).
- Workflow: `.github/workflows/deploy.yml`.
- Шаги: checkout → setup Node 20 → `npm ci` → `npm run build` → upload artifact `dist` → `deploy-pages`.
- URL: https://Em-pechenki.github.io/OGMOP/

GitHub Pages настроен на источник **GitHub Actions** (`build_type=workflow`), см. `scripts/setup-github.ps1`.

## CI

- Workflow: `.github/workflows/ci.yml`.
- Шаги: checkout → setup Node 20 (с кэшем npm) → `npm ci` → lint (eslint) → typecheck (`tsc --noEmit`) → test (vitest) → build → Lighthouse CI.
- Триггеры: push/PR в `main` и `develop`, а также ручной запуск.

## Preview для PR

- Workflow: `.github/workflows/preview.yml`.
- Сборка с base `/OGMOP/pr-<number>/`, артефакт `dist` хранится 7 дней.

## Lighthouse CI

- Конфиг: `.lighthouserc.json`.
- Пороги: performance ≥0.7 (warn), accessibility ≥0.9 (error), best-practices ≥0.9 (warn), SEO ≥0.9 (error).

## Мониторинг доступности Pages

- Workflow: `.github/workflows/monitor.yml`.
- Расписание: каждые 6 часов + ручной запуск.
- Проверка HTTP 200 для https://Em-pechenki.github.io/OGMOP/ с 3 попытками.

## Оптимизация бандла

- Vite `manualChunks`: vendor-react, vendor-flow, vendor-form.
- Тяжёлые страницы lazy-loaded через `React.lazy` + `Suspense`.
- Цель: чанк < 200kb gzip.

## Секреты

- Секреты хранятся только в GitHub Secrets, никогда в коде.
- Локальные `.env` игнорируются (`.gitignore`).

## Скрипты автоматизации

- `scripts/auto-commit.ps1` — автокоммит и пуш.
- `scripts/setup-github.ps1` — настройка репозитория и Pages (через `gh` CLI).
- `scripts/changelog.ps1` — генерация `CHANGELOG.md` из conventional commits.
