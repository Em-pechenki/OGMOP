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
- Lighthouse CI: `continue-on-error: true`, пороги warn (см. `.lighthouserc.json`).

## Integration Tests

- Workflow: `.github/workflows/integration.yml`.
- Шаги: checkout → setup Node 20 → `npm ci` → typecheck → запуск backend → integration/e2e/smoke тесты → остановка backend.
- Триггеры: push/PR в `main` и `develop`, а также ручной запуск.

## Preview для PR

- Workflow: `.github/workflows/preview.yml`.
- Сборка с base `/OGMOP/pr-<number>/`, артефакт `dist` хранится 7 дней.
- После сборки в PR добавляется комментарий с инструкцией по скачиванию артефакта.

## Lighthouse CI

- Конфиг: `.lighthouserc.json`.
- Пороги (warn): performance ≥0.7, accessibility ≥0.9, best-practices ≥0.9, SEO ≥0.9.
- Запускается в `ci.yml` с `continue-on-error: true`.

## Мониторинг доступности Pages

- Workflow: `.github/workflows/monitor.yml`.
- Расписание: каждые 6 часов + ручной запуск.
- Проверка HTTP 200 для https://Em-pechenki.github.io/OGMOP/ с 3 попытками.

## Changelog

- Скрипт: `scripts/changelog.ps1` (генерация `CHANGELOG.md` из conventional commits).
- Workflow: `.github/workflows/changelog.yml` (триггер по тегам `v*` или ручной запуск).
- Автоматически коммитит обновлённый `CHANGELOG.md`.

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

## Reusable CI

- `.github/workflows/reusable-ci.yml` — переиспользуемый workflow (`workflow_call`).
- Пример для пользователей: `docs/examples/ci.yml`.

## Финальный деплой (Фаза 4-5)

- Ветка: `main`, источник Pages — GitHub Actions (`build_type=workflow`).
- URL production: https://Em-pechenki.github.io/OGMOP/
- Проверка доступности: workflow `monitor.yml` (каждые 6 часов + ручной запуск) ожидает HTTP 200.
- CI (`ci.yml`) включает lint, typecheck, test, build, Lighthouse CI.
- Integration tests: `integration.yml`.
- Актуальные пороги Lighthouse: performance ≥0.7 (warn), accessibility ≥0.9 (warn), best-practices ≥0.9 (warn), SEO ≥0.9 (warn).
- Секреты только в GitHub Secrets; `.env` игнорируется.
- Preview-сборки для PR: `preview.yml` (артефакт, 7 дней).
- Changelog генерируется автоматически: `changelog.yml`.
