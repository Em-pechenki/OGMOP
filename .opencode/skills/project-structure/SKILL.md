---
name: Project Structure
description: Структура проекта OGMOP, зоны ответственности агентов, правила параллельной работы.
---

## Структура каталогов
- `src/frontend/` — React + Vite + TS (commander-frontend)
- `src/backend/` — Node.js API (commander-backend)
- `src/shared/` — общие типы (оба командира)
- `public/` — статика (frontend)
- `tests/` — тесты (commander-qa)
- `docs/` — документация (commander-docs)
- `scripts/` — скрипты (commander-devops)
- `.github/workflows/` — CI/CD (commander-devops)

## Правила
- Один файл — один агент в один момент времени.
- Shared-типы меняются только по согласованию backend+frontend.
- Перед редактированием: git status, убедиться что файл не изменён другим.
- После изменения: отчёт командиру.
