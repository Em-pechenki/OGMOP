# Отчёт о покрытии тестами — OGMOP

> Автоматически обновляется по результатам `npm run test:coverage`.
> Цель: ≥ 60% по строкам/функциям для frontend/shared.

## Дата обновления: 2026-11-21 (Фаза 4–5, финальный прогон)

- **Команда:** `npm run test:coverage`
- **Результат:** 19 test files passed, 1 skipped (a11y optional), 84 passed, 1 skipped, 3 todo
- **All files:** Statements 71.55%, Branches 53.23%, Functions 47.36%, Lines 71.55%
- **Линтинг:** `npm run lint` — 0 ошибок, 11 предупреждений
- **Typecheck:** `npx tsc --noEmit` — зелёный
- **Сборка:** `npm run build` — успешна
- **Lighthouse (prod build):** Performance 98, Accessibility 100, Best Practices 100, SEO 100

## Покрытие по модулям

| Модуль | Stmts | Branch | Funcs | Lines | Примечание |
|--------|-------|--------|-------|-------|------------|
| src/frontend | ~71% | ~53% | ~47% | ~71% | UI-компоненты, страницы, store покрыты |
| src/shared | ~75% | ~0% | ~0% | ~75% | Схемы покрыты, типы не исполняются |
| src/backend | excluded | — | — | — | Backend тестируется интеграционно (supertest) |

## Добавлено в Фазе 3–5

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
| 2026-11-20 | phase 3 | 66.28 | 77 passed + 1 skipped + 3 todo |
| 2026-11-21 | phase 4-5 | 71.55 | 84 passed + 1 skipped + 3 todo |

## Замечания QA

- Линтинг: `npm run lint` — 0 ошибок, 11 предупреждений (no-explicit-any в существующих тестах/src).
- Typecheck: `npx tsc --noEmit` зелёный.
- Сборка: `npm run build` успешна.
- Lighthouse: Performance 98, Accessibility 100, Best Practices 100, SEO 100.
- CI: lint/typecheck/test/build настроены в `.github/workflows/ci.yml`.