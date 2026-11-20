# Security Audit Report — OGMOP

Дата: 2026-11-20. Аудитор: commander-security.
Скоуп: весь репозиторий (src/, docs/, scripts/, .github/), зависимости (npm).

## 1. Итог

- Критических/высоких уязвимостей в **production-зависимостях**: 0 (только 2 moderate в react-router-dom).
- В dev-зависимостях: 1 critical (tinypool через vitest), 1 high, 13 moderate — только dev/test tooling, не влияет на runtime.
- Секретов в production-коде: не найдено.
- Синтетические секреты в `src/backend/seed/demo-repo/` — намеренные тестовые данные для сканера (не реальные).

## 2. Аудит секретов в коде

Метод: grep по паттернам (api_key, password, secret, token, private key, AWS/GitHub/OpenAI форматы).

### Находки (реальный код)

| Файл | Строка | Контекст | Оценка |
|------|--------|----------|--------|
| src/frontend/services/api.ts | 14-17 | Хранение JWT в localStorage (`ogmop_token`) | Medium — XSS-риск. Рекомендация: httpOnly cookie или in-memory + refresh. |
| src/shared/types/notification.ts | 13 | `password?: string` в NotifyConfig (тип) | Low — тип, не значение. Ок, но хранить зашифрованным. |

### Намеренные тестовые секреты (НЕ уязвимость)

`src/backend/seed/demo-repo/` содержит синтетические секреты для тестирования сканера:
- Config.kt: `dbPassword = "SuperSecret123!"`
- UserService.kt: `awsAccessKey = "AKIAIOSFODNN7EXAMPLE"`, `ghp_...`
- Properties.kt и др.

Это учебные данные, не реальные ключи. Должны оставаться для демо сканера. Не коммитить реальные.

### .env / конфигурация

- `.env` отсутствует в репозитории (проверено .gitignore). Ок.
- Секреты читаются только из `process.env` (AUTH_SECRET, AUTH_TOKEN, CORS_ORIGINS, SECRET_ENCRYPTION_KEY, LLM_API_KEY и т.д.).

## 3. Аудит зависимостей (npm audit)

### Production (omit=dev)
- react-router-dom 6.x — 2 moderate (open redirect, constructor injection в SSR hydration). Mitigation: не использовать SSR, валидировать redirect-цели. Обновление до v7 — breaking, отложено до фазы 4.
- Остальные prod-зависимости (express, cors, helmet, zod, express-rate-limit) — без уязвимостей.

### Dev/Test
- vitest/vite/esbuild/tinypool — moderate/critical, только dev-server. Не попадают в прод-бандл. Обновление до vitest 5 / vite 8 — breaking, отложено.

### Рекомендации
1. Обновить react-router-dom до v7 в фазе 4 (после стабилизации роутинга).
2. Обновить vitest до v5 при переходе на Vite 8 (отдельная задача DevOps).
3. Включить Dependabot (`.github/dependabot.yml`) — задача DevOps.

## 4. Реализованные меры (Фаза 0-1)

- `src/backend/middleware/security.js` — `applySecurity(app)`:
  - Helmet + CSP (default-src 'self', script-src 'self', frame-ancestors 'none', upgrade-insecure-requests в проде).
  - CORS с allowlist origin из env (CORS_ORIGINS/FRONTEND_ORIGIN), credentials.
  - Rate-limit: 300 req/15min на /api/, 20 req/15min на auth-эндпоинты.
  - Body size limit 1mb (настраивается BODY_LIMIT).
  - Request-id, удаление X-Powered-By.
  - HSTS в проде.
- `src/backend/middleware/validate.js` — Zod-валидация (body/query/params), 400 с issues.
- `src/backend/auth/index.js` — optional authenticate, requireAuth, requireRole (JWT-ready, env secrets).
- `src/backend/utils/secrets.js` — maskSecret/maskObject/encrypt/decrypt/redactForLog.
- `docs/security/threat-model.md` — STRIDE threat model.

## 5. Остаточные риски / TODO

1. Токен в localStorage (frontend) — мигрировать на httpOnly cookie при появлении auth.
2. SSRF-защита для URL репозиториев/webhook — реализовать в сервисах (Фаза 2).
3. Path traversal защита при чтении файлов — реализовать в сканерах (Фаза 2).
4. ReDoS защита в regex-сканерах — таймауты (Фаза 2/4).
5. LLM prompt injection — строгий парсинг JSON, не выполнять инструкции из данных (Фаза 2).
6. Шифрование настроек нод (Vault) — MVP: utils/secrets.js XOR+base64, заменить на AES-GCM.

## 6. Вывод

Security gate Фазы 0-1 пройден: middleware настроены, секретов в коде нет, audit задокументирован. Критических уязвимостей нет.

## 7. �����������

- ���������: src/backend/middleware/security.js, alidate.js, utils/secrets.js ������������; lint ��� ������; backend-api ����� ��������.
- ���� �����������: 2026-11-20. �������: commander-security.
