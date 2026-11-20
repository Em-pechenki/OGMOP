# ТЗ — Отдел Фронтенда

## Миссия
Реализовать UI по дизайн-спецификации, обеспечить UX, производительность и доступность.

## Зона ответственности
- `src/frontend/` — React + Vite + TypeScript + Tailwind.
- `public/` — статические ассеты (совместно с дизайном).
- Роутинг, состояние, API-клиент, формы, валидация.

## Стек
- React 18, Vite 5, TypeScript 5, Tailwind CSS 3.
- React Router 6, React Hook Form + Zod (формы/валидация).
- Axios/Fetch для API.
- Vitest + React Testing Library (тесты).

## Артефакты
1. `src/frontend/components/` — переиспользуемые компоненты.
2. `src/frontend/pages/` — страницы.
3. `src/frontend/hooks/` — хуки.
4. `src/frontend/services/` — API-клиент.
5. `src/frontend/store/` — состояние (Context/Zustand).

## Задачи по фазам

### Фаза 0 (0–2 ч)
- [ ] Прочитать ТЗ и дизайн-токены.
- [ ] Настроить структуру каталогов.
- [ ] Настроить ESLint, Prettier, path aliases.

### Фаза 1 (2–8 ч)
- [ ] Layout: Header, Footer, Navigation, Container.
- [ ] Роутинг (react-router) с lazy loading.
- [ ] API-клиент (base URL, interceptors, error handling).
- [ ] Главная страница-заглушка.
- [ ] Дизайн-система в коде: Button, Input, Card, Modal, Toast.
- [ ] Глобальные стили, токены в Tailwind config.

### Фаза 2 (8–16 ч)
- [ ] Страницы по ТЗ (P0 → P1).
- [ ] Формы с валидацией (React Hook Form + Zod).
- [ ] Интеграция с API (загрузка, мутации).
- [ ] Состояния: loading, error, empty, success.
- [ ] Глобальное состояние (auth, theme, notifications).

### Фаза 3 (16–22 ч)
- [ ] Адаптивность (mobile-first, breakpoints).
- [ ] Анимации (Framer Motion или CSS transitions).
- [ ] Доступность (a11y): aria, keyboard nav, focus management.
- [ ] Обработка ошибок (Error Boundary, 404/500).
- [ ] Оптимизация: code-splitting, lazy routes, image optimization.

### Фаза 4 (22–26 ч)
- [ ] Производительность: Lighthouse ≥ 80, bundle ≤ 200kb gzip.
- [ ] SEO: meta tags, Open Graph.
- [ ] PWA (опционально, если в ТЗ).

### Фаза 5 (26–30 ч)
- [ ] Буфер: исправление визуальных/функциональных багов.
- [ ] Финальная проверка на Pages.

## Критерии приёмки
- Все страницы из ТЗ реализованы.
- Формы валидируются, ошибки показываются.
- API-интеграция работает (загрузка/создание/обновление/удаление).
- Lighthouse Performance ≥ 80, Accessibility ≥ 90.
- Нет console.error в продакшене.
- Сборка `npm run build` зелёная.

## Зависимости
- Зависит от: Дизайн (токены, макеты), Бэкенд (API-контракты), DATA (типы).
- Блокирует: QA (e2e тесты).

## Правила
- Один компонент — один файл.
- Типизированный TypeScript (strict mode).
- Не хардкодить цвета/размеры — только токены.
- Коммит после каждой компоненты/страницы.
- Перед редактированием — `git status`.
