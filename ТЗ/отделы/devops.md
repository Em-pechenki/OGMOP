# ТЗ — Отдел DevOps

## Миссия
Обеспечить CI/CD, деплой, мониторинг и инфраструктуру для непрерывной поставки.

## Зона ответственности
- `.github/workflows/` — CI/CD.
- `scripts/` — скрипты автоматизации.
- GitHub Pages, Docker (опционально).
- Переменные окружения, секреты.

## Стек
- GitHub Actions.
- Vite (build).
- PowerShell/Bash скрипты.

## Артефакты
1. `.github/workflows/ci.yml` — линт + тесты + build.
2. `.github/workflows/deploy.yml` — деплой на Pages.
3. `scripts/auto-commit.ps1` — автокоммит.
4. `scripts/setup-github.ps1` — настройка репо.

## Задачи по фазам

### Фаза 0 (0–2 ч)
- [ ] Проверить текущий CI/CD (deploy.yml).
- [ ] Добавить ci.yml (lint + test + build).
- [ ] Настроить branch protection (опционально).

### Фаза 1 (2–8 ч)
- [ ] CI: lint (eslint), typecheck (tsc), test (vitest), build (vite).
- [ ] Deploy: Pages (уже есть).
- [ ] Кэширование node_modules в Actions.
- [ ] Статус-бейджи в README.

### Фаза 2 (8–16 ч)
- [ ] Preview-деплои для PR (опционально).
- [ ] Lighthouse CI (проверка производительности).
- [ ] Автоматический changelog.

### Фаза 3 (16–22 ч)
- [ ] Мониторинг: проверка доступности Pages.
- [ ] Алерты при падении деплоя.

### Фаза 4–5 (22–30 ч)
- [ ] Финальная проверка всех workflow.
- [ ] Документация деплоя.

## Критерии приёмки
- CI зелёный на каждый push.
- Deploy завершается за ≤ 5 мин.
- Сайт доступен по URL.
- Автокоммит работает (каждые 5 мин).

## Зависимости
- Зависит от: FE/BE (build).
- Блокирует: всех (деплой).

## Правила
- Секреты только через GitHub Secrets.
- Не коммитить .env.
- Workflows идемпотентны.
