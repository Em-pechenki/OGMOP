---
description: Синхронизировать локальный репозиторий с GitHub (pull + push).
agent: director
---

Синхронизируй с GitHub:
1. git fetch origin
2. git pull --rebase origin main (если есть удалённые изменения)
3. git push origin main
4. Проверь статус.
