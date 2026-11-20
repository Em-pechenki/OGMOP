# Безопасность — OGMOP

Статус: Фаза 5 завершена — финальный аудит пройден, security gate открыт.

- Модель угроз: `docs/security/threat-model.md` (STRIDE).
- CORS/Helmet/rate-limit: реализованы (`src/backend/middleware/security.middleware.js`).
- Валидация входных данных: Zod на всех эндпоинтах.
- Хранение секретов: AES-256-GCM + маскирование (`src/backend/utils/secrets.js`).
- Аудит: `docs/security/audit.md`.
- Сканирование только тестового/учебного репозитория (ограничение ТЗ).
