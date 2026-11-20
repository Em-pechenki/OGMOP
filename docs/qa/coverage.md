# Отчёт о покрытии тестами — OGMOP

> Автоматически обновляется по результатам `npm run test:coverage`.
> Цель: ≥ 60% по строкам/функциям для frontend/shared.

## Дата обновления: 2026-11-20

- **Команда:** `npm run test:coverage`
- **Результат:** 18 test files passed, 1 skipped (a11y optional), 83 passed, 3 todo
- **All files:** Statements 71.54%, Branches 53.23%, Functions 47.36%, Lines 71.54%

## Покрытие по модулям

| Модуль | Stmts | Branch | Funcs | Lines | Примечание |
|--------|-------|--------|-------|-------|------------|
| src/frontend | ~46% | ~59% | ~19% | ~46% | UI-компоненты, страницы, store покрыты частично |
| src/shared | ~75% | ~0% | ~0% | ~75% | Схемы покрыты, типы не исполняются |
| src/backend | excluded | — | — | — | Backend тестируется интеграционно (supertest) |

## Добавлено в Фазе 3

- `tests/e2e/critical-path.test.ts` — e2e критического пути: сборка сценария → запуск → результат → уведомление (webhook).
- `tests/regression/scanner-stability.test.ts` — регрессия: повторные вызовы сканеров (secrets/SCA/SAST) стабильны, обязательные поля находок.
- `tests/a11y/axe-optional.test.tsx` — опциональные a11y-тесты (axe-core, пропускаются если не установлен).
- `tests/unit/seed-data.test.ts` — валидация seed-данных (workflow schema, CVE база).

## Непокрытое

- [ ] Производственные сканеры (частично покрыты regression-тестами).
- [ ] Компоненты PropertyPanel/ResultsPanel.
- [ ] E2E через Playwright (не установлен; используется Vitest + supertest).

## История

| Дата | Commit | Lines % | Tests |
|------|--------|---------|-------|
| 2026-11-20 | phase 5 (v1.0.0) | 71.54 | 83 passed + 1 skipped + 3 todo |

## Замечания QA

- Линтинг: `npm run lint` содержит ошибки `no-explicit-any` в существующих тестах/src; новые тесты линт-чистые.
- Typecheck: `npx tsc --noEmit` зелёный.
- Сборка: `npm run build` успешна.
- CI: lint/typecheck/test/build настроены в `.github/workflows/ci.yml`.
