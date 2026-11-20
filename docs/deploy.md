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
- Этапы: checkout → setup Node 20 (кэш npm) → `npm ci` → lint (eslint) → typecheck (`tsc --noEmit`) → test (vitest) → build → Lighthouse CI.
- Запускается на push/PR в `main` и `develop`.

## Preview для PR

- Workflow: `.github/workflows/preview.yml`.
- Собирает PR с base `/OGMOP/pr-<number>/` и сохраняет артефакт `dist` (7 дней).

## Lighthouse CI

- Конфиг: `.lighthouserc.json`.
- Пороги: performance ≥0.7 (warn), accessibility ≥0.9 (error), best-practices ≥0.9 (warn), SEO ≥0.9 (error).

## Автоматический changelog

- Скрипт: `scripts/changelog.ps1`.
- Генерирует секции CHANGELOG.md из conventional commits с момента последнего тега.
- Запуск: `powershell -ExecutionPolicy Bypass -File scripts/changelog.ps1 [-Version 0.2.0]`.

## Оптимизация бандла

- Vite `manualChunks`: vendor-react, vendor-flow, vendor-form.
- Страницы lazy-loaded через `React.lazy` + `Suspense`.
- Цель: основной бандл ≤ 200kb gzip.

## Секреты

- Секреты только через GitHub Secrets, никогда в коде.
- Локальные `.env` файлы игнорируются (`.gitignore`).

## Скрипты автоматизации

- `scripts/auto-commit.ps1` — автоматический коммит и пуш.
- `scripts/setup-github.ps1` — настройка репозитория и Pages (требует `gh` CLI).
- `scripts/changelog.ps1` — генерация CHANGELOG.md.