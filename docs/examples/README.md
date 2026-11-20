# Примеры CI/CD

- `ci.yml` — пример workflow для пользователей OGMOP (lint + typecheck + test + build).
- Reusable workflow: `.github/workflows/reusable-ci.yml` (вызов через `uses: Em-pechenki/OGMOP/.github/workflows/reusable-ci.yml@main`).

## Интеграция в свой проект

1. Скопируйте `ci.yml` в `.github/workflows/` вашего репозитория.
2. Убедитесь, что в `package.json` есть скрипты `lint`, `test`, `build`.
3. Для Lighthouse CI добавьте `.lighthouserc.json` и включите `run-lighthouse: true`.

## Секреты

Храните секреты только в GitHub Secrets, никогда в коде.
