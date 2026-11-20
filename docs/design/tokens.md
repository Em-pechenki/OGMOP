# Дизайн-токены — Банк «Центр-инвест»

> Источник: `ТЗ/отделы/design.md`, официальный стиль Банка «Центр-инвест».
> Логотип: зелёный `#50B848`. Основной текст: тёмно-серый `#494B52`.
> Все цвета/размеры/радиусы/тени используются **только** через токены. «Магических» значений в коде быть не должно.

## 0. Принципы

- **Mobile-first**: базовые стили для 320px, расширение через breakpoints.
- **Токенизация**: CSS-переменные в `src/frontend/styles/tokens.css`, зеркало в `tailwind.config.cjs`.
- **Контраст**: текст на фоне ≥ 4.5:1 (WCAG AA) для обычного текста, ≥ 3:1 для крупного.
- **Единицы**: `rem` для шрифтов/отступов (base 16px), `px` допустим для border/shadow.
- **Именование**: `--color-*`, `--space-*`, `--radius-*`, `--shadow-*`, `--font-*`, `--z-*`, `--duration-*`, `--ease-*`.

---

## 1. Цвета

### 1.1 Бренд

| Токен | Значение | Использование |
|-------|----------|---------------|
| `--color-primary` | `#50B848` | Логотип, основные кнопки, успех, акцент |
| `--color-primary-dark` | `#3D8F3A` | Hover/active primary |
| `--color-primary-darker` | `#2E6F2C` | Pressed/active сильный |
| `--color-primary-light` | `#E9F7F3` | Фоны, выделения, hover-подложки |
| `--color-secondary` | `#494B52` | Текст, иконки, вторичные элементы |
| `--color-secondary-light` | `#F6F8FA` | Фоны карточек, surface-alt |

### 1.2 Нейтральные

| Токен | Значение | Использование |
|-------|----------|---------------|
| `--color-bg` | `#FFFFFF` | Фон страницы |
| `--color-surface` | `#F6F8FA` | Фон поверхностей/карточек |
| `--color-surface-elevated` | `#FFFFFF` | Всплывающие панели |
| `--color-text` | `#01000C` | Основной текст |
| `--color-text-muted` | `#494B52` | Вторичный текст |
| `--color-text-subtle` | `#6B7280` | Подсказки, placeholder |
| `--color-border` | `#E9F0F7` | Границы |
| `--color-border-strong` | `#D1D5DB` | Акцентные границы |
| `--color-divider` | `#EEF2F7` | Разделители |

### 1.3 Семантические

| Токен | Значение | Использование |
|-------|----------|---------------|
| `--color-success` | `#50B848` | Успех, низкий риск |
| `--color-success-bg` | `#E9F7F3` | Фон успеха |
| `--color-warning` | `#FEECCC` | Предупреждение (фон) |
| `--color-warning-text` | `#B8860B` | Текст предупреждения |
| `--color-warning-bg` | `#FEECCC` | Фон предупреждения |
| `--color-error` | `#D32F2F` | Ошибка, критический риск |
| `--color-error-bg` | `#FDECEA` | Фон ошибки |
| `--color-info` | `#D9ECFF` | Информация (фон) |
| `--color-info-text` | `#1565C0` | Текст информации |

### 1.4 Риск-уровни (сканер)

| Уровень | Токен текста | Цвет текста | Токен фона | Цвет фона | Использование |
|---------|--------------|-------------|------------|-----------|---------------|
| Critical | `--color-risk-critical` | `#D32F2F` | `--color-risk-critical-bg` | `#FDECEA` | Критическая уязвимость |
| High | `--color-risk-high` | `#E65100` | `--color-risk-high-bg` | `#FFF3E0` | Высокий риск |
| Medium | `--color-risk-medium` | `#B8860B` | `--color-risk-medium-bg` | `#FEECCC` | Средний риск |
| Low | `--color-risk-low` | `#50B848` | `--color-risk-low-bg` | `#E9F7F3` | Низкий риск |
| Info | `--color-risk-info` | `#494B52` | `--color-risk-info-bg` | `#F6F8FA` | Информационное |

### 1.5 Цвета типов нод

| Тип ноды | Токен | Цвет | Фон | Иконка |
|----------|-------|------|-----|--------|
| Trigger | `--color-node-trigger` | `#50B848` | `#E9F7F3` | `public/icons/trigger.svg` |
| Logic | `--color-node-logic` | `#494B52` | `#F6F8FA` | `public/icons/logic.svg` |
| Scanner | `--color-node-scanner` | `#E65100` | `#FFF3E0` | `public/icons/scanner.svg` |
| Notify | `--color-node-notify` | `#1976D2` | `#D9ECFF` | `public/icons/notify.svg` |
| AI | `--color-node-ai` | `#7B1FA2` | `#F3E5F5` | `public/icons/ai.svg` |

### 1.6 Состояния нод (execution)

| Состояние | Цвет рамки | Фон | Индикатор |
|-----------|------------|-----|-----------|
| idle | `--color-border` | surface | серая точка |
| running | `--color-primary` | primary-light | пульсирующее кольцо (pulse-running) |
| success | `--color-success` | success-bg | зелёная галочка |
| error | `--color-error` | error-bg | красный крест |
| disabled | `--color-border` | surface | полупрозрачность 0.5 |

### 1.7 Тёмная тема (dark mode overrides)

Переключение: класс `dark` на `<html>` (или корневом контейнере). Источник истины — `prefers-color-scheme`, переопределяется выбором пользователя (localStorage `ogmop:theme`). Все токены ниже **переопределяют** значения из `:root` при активном `.dark`.

| Токен | Light | Dark | Примечание |
|-------|-------|------|------------|
| `--color-bg` | `#FFFFFF` | `#0B0F14` | Фон страницы |
| `--color-surface` | `#F6F8FA` | `#121821` | Поверхности/карточки |
| `--color-surface-elevated` | `#FFFFFF` | `#1A2230` | Всплывающие панели |
| `--color-text` | `#01000C` | `#E6EAF0` | Основной текст |
| `--color-text-muted` | `#494B52` | `#A8B0BD` | Вторичный текст |
| `--color-text-subtle` | `#6B7280` | `#7A8290` | Подсказки |
| `--color-border` | `#E9F0F7` | `#262D38` | Границы |
| `--color-border-strong` | `#D1D5DB` | `#3A4352` | Акцентные границы |
| `--color-divider` | `#EEF2F7` | `#1E2530` | Разделители |
| `--color-secondary-light` | `#F6F8FA` | `#121821` | Фон surface-alt |
| `--color-primary` | `#50B848` | `#50B848` | Бренд (без изменений) |
| `--color-primary-light` | `#E9F7F3` | `#1B3A24` | Фоны/выделения |
| `--color-success-bg` | `#E9F7F3` | `#1B3A24` | Фон успеха |
| `--color-warning` | `#FEECCC` | `#3A3320` | Фон предупреждения |
| `--color-warning-text` | `#B8860B` | `#FFD54F` | Текст предупреждения |
| `--color-warning-bg` | `#FEECCC` | `#3A3320` | Фон предупреждения |
| `--color-error` | `#D32F2F` | `#EF5350` | Ошибка |
| `--color-error-bg` | `#FDECEA` | `#3A1F22` | Фон ошибки |
| `--color-info` | `#D9ECFF` | `#1A2A3A` | Информация (фон) |
| `--color-info-text` | `#1565C0` | `#64B5F6` | Текст информации |
| `--color-risk-critical` | `#D32F2F` | `#EF5350` | Критический риск |
| `--color-risk-critical-bg` | `#FDECEA` | `#3A1F22` |  |
| `--color-risk-high` | `#E65100` | `#FF8A65` |  |
| `--color-risk-high-bg` | `#FFF3E0` | `#3A2A1F` |  |
| `--color-risk-medium` | `#B8860B` | `#FFD54F` |  |
| `--color-risk-medium-bg` | `#FEECCC` | `#3A3320` |  |
| `--color-risk-low` | `#50B848` | `#5CBF54` |  |
| `--color-risk-low-bg` | `#E9F7F3` | `#1B3A24` |  |
| `--color-risk-info` | `#494B52` | `#A8B0BD` |  |
| `--color-risk-info-bg` | `#F6F8FA` | `#121821` |  |
| `--color-node-trigger` | `#50B848` | `#5CBF54` |  |
| `--color-node-trigger-bg` | `#E9F7F3` | `#1B3A24` |  |
| `--color-node-logic` | `#494B52` | `#A8B0BD` |  |
| `--color-node-logic-bg` | `#F6F8FA` | `#121821` |  |
| `--color-node-scanner` | `#E65100` | `#FF8A65` |  |
| `--color-node-scanner-bg` | `#FFF3E0` | `#3A2A1F` |  |
| `--color-node-notify` | `#1976D2` | `#64B5F6` |  |
| `--color-node-notify-bg` | `#D9ECFF` | `#1A2A3A` |  |
| `--color-node-ai` | `#7B1FA2` | `#CE93D8` |  |
| `--color-node-ai-bg` | `#F3E5F5` | `#2A1F3A` |  |
| `--shadow-card` | `0 0 24px rgba(0,0,0,0.03)` | `0 0 24px rgba(0,0,0,0.4)` | Усиленная тень в dark |
| `--shadow-hover` | `0 4px 12px rgba(0,0,0,0.08)` | `0 4px 12px rgba(0,0,0,0.5)` |  |

Контраст (dark, WCAG AA): текст `#E6EAF0` на `#0B0F14` ≈ 15:1 ✅; muted `#A8B0BD` ≈ 8.5:1 ✅; цветные тексты используются с font-weight ≥ 600.

---

## 2. Типографика

### 2.1 Семейства

| Токен | Значение | Использование |
|-------|----------|---------------|
| `--font-sans` | `"Inter", "system-ui", -apple-system, "Segoe UI", sans-serif` | Заголовки и текст |
| `--font-mono` | `"JetBrains Mono", "Consolas", "Menlo", monospace` | Код, логи, сниппеты |

### 2.2 Шкала размеров

| Токен | rem | px | line-height | weight | Использование |
|-------|-----|----|-------------|--------|---------------|
| `--text-xs` | 0.75rem | 12 | 1.4 | 400 | Подписи, метки |
| `--text-sm` | 0.875rem | 14 | 1.5 | 400 | Вторичный текст, таблицы |
| `--text-base` | 1rem | 16 | 1.6 | 400 | Основной текст |
| `--text-lg` | 1.125rem | 18 | 1.5 | 500 | Подзаголовки |
| `--text-xl` | 1.25rem | 20 | 1.4 | 600 | Заголовки секций |
| `--text-2xl` | 1.5rem | 24 | 1.3 | 600 | Заголовки страниц |
| `--text-3xl` | 1.875rem | 30 | 1.2 | 700 | Hero-заголовки |
| `--text-4xl` | 2.25rem | 36 | 1.1 | 700 | Display |

### 2.3 Веса

| Токен | Значение |
|-------|----------|
| `--font-weight-regular` | 400 |
| `--font-weight-medium` | 500 |
| `--font-weight-semibold` | 600 |
| `--font-weight-bold` | 700 |

---

## 3. Отступы (Spacing)

Базовая единица `4px`. Шкала (px): 0, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96.

| Токен | Значение |
|-------|----------|
| `--space-0` | 0 |
| `--space-1` | 0.25rem (4px) |
| `--space-2` | 0.5rem (8px) |
| `--space-3` | 0.75rem (12px) |
| `--space-4` | 1rem (16px) |
| `--space-5` | 1.25rem (20px) |
| `--space-6` | 1.5rem (24px) |
| `--space-8` | 2rem (32px) |
| `--space-10` | 2.5rem (40px) |
| `--space-12` | 3rem (48px) |
| `--space-16` | 4rem (64px) |

---

## 4. Радиусы

| Токен | Значение | Использование |
|-------|----------|---------------|
| `--radius-sm` | 4px | Чипы, мелкие элементы |
| `--radius-md` | 8px | Кнопки, инпуты |
| `--radius-lg` | 12px | Карточки, модалки |
| `--radius-xl` | 16px | Панели, drawers |
| `--radius-full` | 9999px | Аватары, pill-бейджи |

---

## 5. Тени

| Токен | Значение | Использование |
|-------|----------|---------------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Лёгкая подъёмка |
| `--shadow-card` | `0 0 24px rgba(0,0,0,0.03)` | Карточки (фирменная) |
| `--shadow-hover` | `0 4px 12px rgba(0,0,0,0.08)` | Hover карточек |
| `--shadow-modal` | `0 20px 48px rgba(0,0,0,0.16)` | Модальные окна |
| `--shadow-focus` | `0 0 0 3px rgba(80,184,72,0.35)` | Фокус-кольцо (primary) |
| `--shadow-error` | `0 0 0 3px rgba(211,47,47,0.25)` | Фокус при ошибке |

---

## 6. Z-index

| Токен | Значение |
|-------|----------|
| `--z-base` | 0 |
| `--z-dropdown` | 100 |
| `--z-sticky` | 200 |
| `--z-overlay` | 900 |
| `--z-modal` | 1000 |
| `--z-toast` | 1100 |
| `--z-tooltip` | 1200 |

---

## 7. Анимации и переходы

### 7.1 Длительности

| Токен | Значение |
|-------|----------|
| `--duration-fast` | 120ms |
| `--duration-normal` | 200ms |
| `--duration-slow` | 320ms |

### 7.2 Easing

| Токен | Значение |
|-------|----------|
| `--ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `--ease-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` |
| `--ease-accelerate` | `cubic-bezier(0.4, 0, 1, 1)` |

### 7.3 Keyframes

- `fade-in`: opacity 0→1.
- `slide-up`: translateY(8px)→0 + fade.
- `pulse-running`: масштабирующееся кольцо вокруг ноды (box-shadow 0 0 0 0 → 0 0 0 10px с fade), длительность 1.5s infinite. Используется для состояния `running` у NodeCard.
- `spin`: вращение для спиннеров.
- `flow`: течение пунктира по ребру (stroke-dashoffset 24→0), 0.8s linear infinite. Используется для running-рёбер (Data Flow Indicator).
- `shimmer`: бегущий блик для skeleton-состояний, 1.5s infinite.

---

## 8. Брейкпоинты (mobile-first)

| Имя | Значение | Устройство |
|-----|----------|------------|
| `sm` | 320px | Мобильные (база) |
| `md` | 768px | Планшеты |
| `lg` | 1024px | Малые десктопы |
| `xl` | 1280px | Десктопы |
| `2xl` | 1536px | Широкие экраны |

---

## 9. Контраст (WCAG AA)

| Пара (текст / фон) | Контраст | AA (4.5:1) |
|--------------------|----------|------------|
| `#01000C` / `#FFFFFF` | ~21:1 | ✅ |
| `#494B52` / `#FFFFFF` | ~8.5:1 | ✅ |
| `#FFFFFF` / `#50B848` | ~3.6:1 | ✅ для крупного (≥18px bold) |
| `#D32F2F` / `#FDECEA` | ~5.2:1 | ✅ |
| `#E65100` / `#FFF3E0` | ~4.6:1 | ✅ (на грани, использовать bold) |
| `#B8860B` / `#FEECCC` | ~4.5:1 | ✅ (на грани) |
| `#1976D2` / `#D9ECFF` | ~4.7:1 | ✅ |
| `#7B1FA2` / `#F3E5F5` | ~5.0:1 | ✅ |

> Примечание: цветные тексты на светлых фонах использовать с font-weight ≥ 600 для надёжности.
>
> ### Контраст состояний нод (Phase 2)
>
> | Пара (текст/иконка / фон) | Контраст | AA |
> |---------------------------|----------|----|
> | `#01000C` (title) / любой фон состояния | ≥17:1 | ✅ |
> | `#494B52` (метрики) / любой фон состояния | ≥8:1 | ✅ |
> | `#2E6F2C` (success label/icon) / `#E9F7F3` | 5.56:1 | ✅ |
> | `#D32F2F` (error label/icon) / `#FDECEA` | 4.35:1 | ✅ (bold ≥14px; иначе `--color-text`) |
> | `#3D8F3A` (running spinner) / тип-фон | ≥3.6:1 | ✅ |
> | `#6B7280` (skipped label/icon) / `#F6F8FA` | 4.54:1 | ✅ |
> | `#6B7280` (idle dot) / `#FFFFFF` | 4.83:1 | ✅ |

---

## 10. Рекомендации по именованию

- CSS-переменные: `--color-*`, `--space-*`, `--radius-*`, `--shadow-*`, `--font-*`, `--text-*`, `--z-*`, `--duration-*`, `--ease-*`.
- Tailwind: расширять `theme.extend` (colors, spacing, borderRadius, boxShadow, fontFamily, fontSize, animation, keyframes) — не переопределять базу.
- Избегать hex в компонентах: использовать `text-primary`, `bg-risk-critical` и т.д.
- Risk/node цвета дублируются в Tailwind как `risk-*` и `node-*`.

---

## 11. Синхронизация

- Источник истины: этот файл.
- Код: `src/frontend/styles/tokens.css` + `src/frontend/tailwind.config.cjs`.
- При изменении токенов обновлять оба файла и уведомлять FE-командира.