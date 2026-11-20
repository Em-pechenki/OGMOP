# Дизайн лендинга (входная страница) — OGMOP

> Маршрут: `/`. Цель: объяснить ценность продукта, показать ключевые возможности и привести пользователя к действию (редактор / шаблоны).
> Использует токены из `docs/design/tokens.md`, компоненты из `docs/design/components.md`, общий Layout из `docs/design/pages.md`.
> Фирменный стиль Банка «Центр-инвест»: зелёный `#50B848`, тёмно-серый `#494B52`, Inter.
> Mobile-first. Breakpoints: 320 / 768 / 1024 / 1280 / 1536.

---

## 1. Общая структура страницы

```
┌──────────────────────────────────────────────────────────────┐
│ Header (sticky, 56px)                                        │
├──────────────────────────────────────────────────────────────┤
│ Hero (full-width, min-height 80vh desktop / auto mobile)     │
│  - заголовок + подзаголовок + CTA + иллюстрация/мокап        │
├──────────────────────────────────────────────────────────────┤
│ Social proof / метрики (полоса с бейджами)                   │
├──────────────────────────────────────────────────────────────┤
│ Features (сетка карточек, 3–6)                               │
├──────────────────────────────────────────────────────────────┤
│ How it works (3 шага)                                        │
├──────────────────────────────────────────────────────────────┤
│ Demo preview (скриншот/мокап редактора)                      │
├──────────────────────────────────────────────────────────────┤
│ Templates highlight (3 карточки + CTA)                       │
├──────────────────────────────────────────────────────────────┤
│ Final CTA banner                                             │
├──────────────────────────────────────────────────────────────┤
│ Footer                                                       │
└──────────────────────────────────────────────────────────────┘
```

- Container: max-width 1280px (лендинг), padding 16px (sm) / 24px (md) / 32px (lg).
- Фон страницы: `--color-bg` #FFFFFF; секции чередуют `--color-bg` и `--color-surface` (#F6F8FA) для ритма.
- Вертикальные отступы между секциями: `--space-16` (64px) desktop, `--space-10` (40px) mobile.

---

## 2. Header (лендинг-вариант)

Общий Header из `pages.md`, но на лендинге:
- Логотип Центр-инвест (слева, высота 32px).
- Навигация: «Возможности», «Шаблоны», «Документация» (anchor/links) — скрывается на mobile (бургер).
- Справа: кнопка «Войти» (ghost) + «Начать» (primary sm). Для MVP «Начать» → `/editor`.
- Sticky, фон `--color-bg` с тенью `--shadow-sm` при скролле.
- Высота 56px, z-index `--z-sticky`.

---

## 3. Hero

### Layout
- Desktop (≥1024): две колонки 50/50 — текст слева, иллюстрация справа.
- Tablet (768–1023): текст сверху, иллюстрация снизу (max-height 320px).
- Mobile (<768): одна колонка, иллюстрация после CTA (max-height 240px).

### Контент
- **Eyebrow** (над заголовком): «Cyber Garden 2026 · Банк «Центр-инвест»» — `--text-xs`, font-weight 600, `--color-primary`, uppercase, letter-spacing 0.08em.
- **Заголовок (H1)**: «Безопасность кода — визуально и просто» (или «AI Security Workflow: проверки безопасности без кода»). `--text-4xl` (36px) desktop / `--text-3xl` (30px) mobile, font-weight 700, `--color-text`, line-height 1.1.
- **Подзаголовок**: «Собирайте сценарии проверки из блоков, запускайте собственные сканеры (секреты, SCA, SAST), получайте AI-объяснения и уведомления. Деплой на GitHub Pages.» `--text-lg` (18px), `--color-text-muted`, max-width 560px.
- **CTA-группа** (gap `--space-3`):
  - Primary lg: «Открыть редактор» → `/editor` (leftIcon: play/edit).
  - Secondary lg: «Шаблоны» → `/templates`.
  - Ghost sm: «Документация» → `/docs` (опц., скрывать на mobile).
- **Доверие-строка** под CTA: «Бесплатно · Open source · Работает офлайн (mock AI)» — `--text-xs`, `--color-text-subtle`, иконки check (16px, `--color-primary`).

### Иллюстрация / мокап
- Карточка-мокап редактора: фон `--color-surface`, граница `--color-border`, radius `--radius-lg`, тень `--shadow-card`, padding `--space-4`.
- Внутри: упрощённый граф из 4–5 нод (Trigger → Scanner → AI → Notify) в стиле NodeCard (миниатюра), dotted grid фон.
- Под мокапом: бейдж «Live preview» (Badge info sm) и подпись «Drag-and-drop конструктор».
- Альтернатива (если нет иллюстрации): SVG-абстракция из соединённых блоков (зелёные/серые).

### Фон Hero
- Лёгкий градиент: `--color-primary-light` (#E9F7F3) → `--color-bg` (#FFFFFF), вертикальный, высота 100%.
- Декоративные «блобы» (абстрактные круги) `--color-primary` opacity 0.06, blur 60px — только desktop, чтобы не перегружать mobile.

### Анимация
- Заголовок и подзаголовок: fade-in + slide-up (`--duration-slow`, `--ease-decelerate`), задержка 0/100ms.
- CTA: fade-in с задержкой 200ms.
- Мокап: fade-in + scale 0.98→1 с задержкой 300ms.
- При `prefers-reduced-motion`: без анимаций, мгновенное появление.

---

## 4. Social proof / метрики (полоса)

- Фон `--color-surface`, padding `--space-6` (24px) вертикально.
- Desktop: 4 метрики в ряд; Mobile: 2×2 grid.
- Метрика: число (крупное, `--text-3xl`, font-weight 700, `--color-primary`) + подпись (`--text-sm`, `--color-text-muted`).
- Метрики:
  - «3» сканера (Secrets, SCA, SAST)
  - «32» находки в демо-репозитории
  - «AI» отчёты с рекомендациями
  - «CI/CD» интеграция (GitHub Actions)
- Под метриками: ряд бейджей доверия: «Cyber Garden 2026», «Банк Центр-инвест», «Open source», «GitHub Pages» — Badge neutral sm, gap `--space-2`.
- A11y: метрики в `<dl>`/`<div role="group">`, не читать как таблицу.

---

## 5. Features (возможности)

### Layout
- Заголовок секции: «Возможности» (H2, `--text-2xl`, font-weight 600, `--color-text`, text-center).
- Подзаголовок: «Всё для безопасной разработки в одном месте» (`--text-base`, `--color-text-muted`, text-center, max-width 640px).
- Сетка: desktop 3 колонки, tablet 2, mobile 1. Gap `--space-4`/`--space-6`.

### Карточка Feature (Card `default`, hoverable, padding lg)
- Иконка (40×40px) в круге `--color-primary-light`, цвет `--color-primary` (или тип-цвет ноды).
- Заголовок: `--text-lg`, font-weight 600, `--color-text`.
- Описание: `--text-sm`, `--color-text-muted`, 2–3 строки.
- Hover: подъём `--shadow-hover`, translateY -2px, `--duration-fast`.

### Список фич (6)
1. **Визуальный конструктор** — Drag-and-drop редактор на React Flow. Иконка: logic.svg.
2. **Сканеры безопасности** — Secrets, SCA, SAST для Kotlin/Spring Boot. Иконка: scanner.svg.
3. **AI-анализ** — Сводка рисков и рекомендации от LLM. Иконка: ai.svg.
4. **Шаблоны** — Библиотека готовых workflow, публикация и копирование. Иконка: trigger.svg (или book).
5. **CI/CD** — Запуск workflow из GitHub Actions, статус обратно в пайплайн. Иконка: notify.svg (или github).
6. **Безопасность** — Helmet, CORS, rate-limit, валидация, маскирование секретов. Иконка: status-success.svg.

---

## 6. How it works (как это работает)

- Фон `--color-bg`.
- Заголовок H2: «Как это работает».
- 3 шага горизонтально (desktop) / вертикально (mobile), соединённые пунктирной линией `--color-border-strong`.
- Шаг: номер (круг 40px, фон `--color-primary`, текст #FFFFFF, font-weight 700) + заголовок (`--text-lg`, font-weight 600) + описание (`--text-sm`, muted).
- Шаги:
  1. **Соберите** — добавьте ноды (триггер, сканеры, AI, уведомления) и соедините их.
  2. **Запустите** — нажмите Run или вызовите через API/CI.
  3. **Получите отчёт** — находки, AI-рекомендации, уведомления в канал.

---

## 7. Demo preview (скриншот редактора)

- Фон `--color-surface`.
- Заголовок H2: «Редактор в действии».
- Контейнер-мокап: max-width 960px, центрирован, radius `--radius-lg`, тень `--shadow-hover`, граница `--color-border`.
- Внутри: изображение/мокап скриншота `03-editor-graph` (из `docs/design/screenshots.md`) или SVG-мокап.
- Под мокапом: 3 буллета-подписи (иконка + текст) — «Палитра нод», «Свойства», «Live-статусы».
- CTA: «Попробовать самому» (primary md) → `/editor`.

---

## 8. Templates highlight (шаблоны)

- Фон `--color-bg`.
- Заголовок H2: «Готовые шаблоны» + ссылка «Все шаблоны →» (ghost sm) справа.
- Сетка 3 карточки TemplateCard (default variant) из `docs/design/templates.md` (моковые данные).
- CTA под сеткой: «Создать свой шаблон» (secondary md) → `/templates`.

---

## 9. Final CTA banner

- Фон `--color-primary-light` (#E9F7F3), radius `--radius-xl`, padding `--space-12` (48px) вертикально, max-width 960px, центрирован.
- Заголовок H2: «Готовы проверить свой код?» (`--color-text`).
- Подзаголовок: «Создайте первый workflow за 2 минуты.» (`--color-text-muted`).
- CTA: Primary lg «Открыть редактор» + Secondary lg «Посмотреть шаблоны».
- Декор: иконка scanner.svg 64px, `--color-primary`, opacity 0.15, абсолютное позиционирование (desktop).

---

## 10. Footer (лендинг)

Общий Footer из `pages.md`:
- 3 колонки (desktop) / stack (mobile): Продукт (Редактор, Шаблоны, Запуски), Ресурсы (Документация, GitHub, API), Контакты (Банк Центр-инвест).
- Нижняя строка: копирайт «© 2026 Cyber Garden · OGMOP» + ссылки (Privacy, Terms).
- Фон `--color-surface`, граница сверху `--color-border`, padding `--space-8`.

---

## 11. Responsive сводка

| Секция | <768 (sm) | 768–1023 (md) | ≥1024 (lg) |
|--------|-----------|---------------|------------|
| Hero | 1 колонка, иллюстрация снизу | текст сверху, иллюстрация снизу | 2 колонки 50/50 |
| Features | 1 колонка | 2 колонки | 3 колонки |
| How it works | вертикально | горизонтально (3) | горизонтально (3) |
| Metrics | 2×2 | 4 в ряд | 4 в ряд |
| Templates | 1 колонка | 2 колонки | 3 колонки |
| Footer | stack | 3 колонки | 3 колонки |

Touch-targets ≥44×44px на mobile. Текст не меньше 14px.

---

## 12. Токены и стили

- Цвета: только из `tokens.md` (primary, surface, text, border и т.д.). Hex в коде запрещены.
- Типографика: H1 `--text-4xl`/`--text-3xl`, H2 `--text-2xl`, body `--text-base`/`--text-lg`.
- Отступы: `--space-*`. Радиусы: `--radius-lg`/`--radius-xl`. Тени: `--shadow-card`/`--shadow-hover`.
- Анимации: `--duration-fast`/`--duration-normal`/`--duration-slow`, `--ease-decelerate`. Уважать `prefers-reduced-motion`.
- Фокус: `--shadow-focus` на всех интерактивных элементах.

---

## 13. A11y

- Один H1 на странице (hero). Далее H2 для секций, H3 для карточек.
- Все изображения/мокапы имеют `alt` (или `aria-hidden` если декоративные).
- CTA-кнопки — нативные `<button>`/`<a>` с видимым фокусом.
- Контраст: текст на `--color-primary` (#50B848) — белый только для крупного текста (≥18px bold); обычный текст использовать `--color-primary-dark` на светлом фоне.
- Skip-link «Перейти к основному содержимому» в начале страницы.
- Landmarks: `<header>`, `<main>`, `<section aria-labelledby>`, `<footer>`.

---

## 14. Состояния

- Initial load: splash с логотипом (общий).
- Empty data (нет шаблонов): секция Templates скрывается или показывает CTA «Создать».
- Offline: баннер «Нет соединения» сверху (общий).
- Error boundary: «Что-то пошло не так» + перезагрузка (общий).

---

## 15. Мокап (описание для демо)

Для скриншота `01-home.png` (1280×800):
- Hero с заголовком «Безопасность кода — визуально и просто», подзаголовком, двумя CTA и мокапом редактора справа.
- Полоса метрик (3 сканера, 32 находки, AI, CI/CD).
- 3 карточки фич видны частично.
- Тема светлая, шрифт Inter, без dev-панелей.

См. `docs/design/screenshots.md` §1 (пункт 1) и §7 (мокапы).
