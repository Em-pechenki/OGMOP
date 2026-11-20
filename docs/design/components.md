# Спецификация компонентов — Дизайн-система OGMOP

> Фирменный стиль Банка «Центр-инвест»: зелёный `#50B848`, тёмно-серый `#494B52`.
> Все значения — через токены из `docs/design/tokens.md`. Mobile-first.
> Компоненты описываются как спеки для FE; production-код пишет FE-команда.

## Общие правила

- Все интерактивные элементы имеют `:focus-visible` кольцо `--shadow-focus` (или `--shadow-error` при ошибке).
- Минимальная touch-target: 44×44px на mobile.
- Состояния: `default`, `hover`, `focus`, `active`, `disabled`, `loading`, `error` (где применимо).
- Анимации: `--duration-fast` (120ms) для hover, `--duration-normal` (200ms) для появления.

---

## 1. Button

**Назначение**: основное действие, навигация, отправка форм.

### Варианты (variant)

| Вариант | Фон | Текст | Граница | Использование |
|---------|-----|-------|---------|---------------|
| `primary` | `--color-primary` | `#FFFFFF` | нет | Главное действие |
| `secondary` | `--color-surface` | `--color-secondary` | `--color-border` | Вторичное |
| `ghost` | transparent | `--color-secondary` | нет | Третичное, иконки |
| `danger` | `--color-error` | `#FFFFFF` | нет | Удаление, опасное |

### Размеры (size)

| Size | Height | Padding-x | Font | Radius |
|------|--------|-----------|------|--------|
| `sm` | 32px | 12px | `--text-sm` | `--radius-md` |
| `md` | 40px | 16px | `--text-base` | `--radius-md` |
| `lg` | 48px | 20px | `--text-lg` | `--radius-md` |

### Состояния

- `hover`: primary → `--color-primary-dark`; secondary → фон `--color-primary-light`; ghost → фон `--color-surface`; danger → darken.
- `active`: scale 0.98, фон ещё темнее.
- `focus`: кольцо `--shadow-focus`.
- `disabled`: opacity 0.5, cursor not-allowed, без hover.
- `loading`: спиннер слева, текст сохраняется, disabled.

### Props (предложение)

```ts
interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
  children: ReactNode;
  onClick?: () => void;
}
```

### A11y

- `<button>` нативный; `aria-busy` при loading; `aria-disabled` при disabled.
- Клавиатура: Enter/Space активируют.
- Иконка-only: `aria-label` обязателен.

---

## 2. Input

**Назначение**: ввод текста/чисел/поиска.

### Варианты типа

`text`, `email`, `password`, `number`, `search`, `url`.

### Размеры

| Size | Height | Font | Padding |
|------|--------|------|---------|
| `sm` | 32px | `--text-sm` | 8px 12px |
| `md` | 40px | `--text-base` | 10px 14px |
| `lg` | 48px | `--text-lg` | 12px 16px |

### Состояния

- `default`: граница `--color-border`, фон `--color-bg`.
- `hover`: граница `--color-border-strong`.
- `focus`: граница `--color-primary`, кольцо `--shadow-focus`.
- `error`: граница `--color-error`, кольцо `--shadow-error`, helper красным.
- `disabled`: фон `--color-surface`, opacity 0.6.

### Составные части

- `label` (опционально, сверху), `helper` (снизу), `error` (снизу, красный), `leftAdornment`/`rightAdornment` (иконки/кнопки).

### Props

```ts
interface InputProps {
  type?: "text" | "email" | "password" | "number" | "search" | "url";
  size?: "sm" | "md" | "lg";
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  leftAdornment?: ReactNode;
  rightAdornment?: ReactNode;
  value?: string;
  onChange?: (v: string) => void;
}
```

### A11y

- `aria-invalid` при error; `aria-describedby` → helper/error id.
- `label` через `<label htmlFor>`.

---

## 3. Textarea

**Назначение**: многострочный ввод (описания, промпты).

- Размеры: высота по умолчанию 96px, min 72px, max 320px; autosize опция.
- Те же состояния, что Input.
- `maxLength` + счётчик символов справа снизу (`--text-xs`, `--color-text-subtle`).
- Resize: vertical (по умолчанию) или none.

Props: `rows`, `autoSize`, `maxLength`, `showCount`, плюс Input-подобные.

---

## 4. Select

**Назначение**: выбор из списка.

- Визуально как Input с chevron справа.
- Размеры как Input.
- Состояния default/hover/focus/open/disabled/error.
- Опции: `value`, `label`, `disabled`, `group`.
- Placeholder серым.
- Mobile: нативный `<select>` (лучше UX); desktop: кастомный dropdown с клавиатурой.

### A11y (кастомный)

- `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`.
- Клавиатура: ArrowUp/Down, Enter, Esc, Home/End, type-ahead.

---

## 5. Card

**Назначение**: контейнер контента.

### Варианты

| Вариант | Фон | Граница | Тень |
|---------|-----|---------|------|
| `default` | `--color-bg` | `--color-border` | `--shadow-card` |
| `elevated` | `--color-bg` | нет | `--shadow-hover` |
| `outlined` | `--color-bg` | `--color-border-strong` | нет |
| `subtle` | `--color-surface` | нет | нет |

### Padding

| Size | Padding |
|------|---------|
| `sm` | `--space-3` (12px) |
| `md` | `--space-4` (16px) |
| `lg` | `--space-6` (24px) |

### Структура

`CardHeader`, `CardBody`, `CardFooter` (опциональные). Header с заголовком + actions. Footer с разделителем сверху.

### Состояния

- `hoverable`: при hover поднимается (`--shadow-hover`, translateY -2px).
- `selected`: рамка `--color-primary`, тень focus.
- `loading`: skeleton-состояние.

---

## 6. Modal

**Назначение**: диалоговые окна.

### Размеры

| Size | Max-width |
|------|-----------|
| `sm` | 400px |
| `md` | 560px |
| `lg` | 720px |
| `full` | 100vw - 32px |

### Структура

Overlay (затемнение `rgba(0,0,0,0.5)` + blur 4px) → Panel (surface-elevated, radius `--radius-lg`, shadow-modal) → Header (title + close) → Body (scroll) → Footer (actions).

### Поведение

- Открытие: fade-in overlay + slide-up panel (`--duration-normal`).
- Закрытие: Esc, клик по overlay, кнопка close.
- Focus trap внутри; при закрытии возврат фокуса на триггер.
- Блокировка скролла body.

### A11y

- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` (title), `aria-describedby`.
- `role="alertdialog"` для подтверждения удаления.

---

## 7. Toast

**Назначение**: краткие уведомления.

### Варианты

| Вариант | Иконка | Цвет акцента |
|---------|--------|--------------|
| `success` | check | `--color-success` |
| `warning` | alert-triangle | `--color-warning-text` |
| `error` | x-circle | `--color-error` |
| `info` | info | `--color-info-text` |

### Поведение

- Позиция: top-right (desktop), top-center (mobile).
- Авто-закрытие: 4000ms (warning/error — 6000ms); пауза при hover.
- Стек до 5 шт, новые сверху.
- Кнопка закрытия (ghost icon) + опциональное действие (link/button).
- Анимация slide-in справа.

### A11y

- `role="status"` (info/success) / `role="alert"` (warning/error).
- `aria-live="polite"` / `"assertive"`.

---

## 8. Badge

**Назначение**: метки, severity, статусы.

### Варианты severity

| Вариант | Текст | Фон |
|---------|-------|-----|
| `critical` | `#FFFFFF` | `--color-risk-critical` |
| `high` | `#FFFFFF` | `--color-risk-high` |
| `medium` | `#FFFFFF` | `--color-risk-medium` |
| `low` | `#FFFFFF` | `--color-risk-low` |
| `info` | `#FFFFFF` | `--color-risk-info` |
| `neutral` | `--color-secondary` | `--color-surface` |

### Размеры

| Size | Height | Font | Padding-x |
|------|--------|------|-----------|
| `sm` | 18px | `--text-xs` | 6px |
| `md` | 22px | `--text-sm` | 8px |

- `dot` опция: цветная точка слева (8px).
- `pill`: radius `--radius-full`.

---

## 9. Sidebar

**Назначение**: навигация/палитра нод.

### Структура

- Header (логотип + collapse toggle).
- Sections с заголовками (collapsible).
- Items: иконка + label + badge (опц.).
- Footer (user/settings).

### Состояния item

- `default`: текст `--color-text-muted`.
- `hover`: фон `--color-surface`, текст `--color-text`.
- `active`: фон `--color-primary-light`, текст `--color-primary`, левая полоска 3px primary.
- `disabled`: opacity 0.5.

### Responsive

- Desktop (≥1024): фиксированная, ширина 240px, collapse до 64px (icon-only).
- Tablet (768–1023): overlay drawer 280px с backdrop.
- Mobile (<768): bottom sheet / drawer.

### A11y

- `nav` с `aria-label`; `aria-current="page"` для активного.
- Клавиатура: стрелки для навигации по items.

---

## 10. Toolbar

**Назначение**: панель действий редактора.

- Горизонтальная полоса высотой 48px, фон `--color-bg`, граница снизу `--color-border`.
- Группы кнопок через разделители (vertical divider 1px).
- Overflow: на узких экранах кнопки сворачиваются в `...` dropdown.
- Поддержка tooltip на иконках.

### A11y

- `role="toolbar"`, `aria-label`.
- Клавиатура: ArrowLeft/Right между кнопками, Home/End.

---

## 11. NodeCard

**Назначение**: визуальное представление ноды на канвасе (React Flow node).

### Типы

| Тип | Цвет | Иконка | Заголовок по умолчанию |
|-----|------|--------|------------------------|
| `trigger` | `--color-node-trigger` | trigger.svg | Trigger |
| `logic` | `--color-node-logic` | logic.svg | Logic |
| `scanner` | `--color-node-scanner` | scanner.svg | Scanner |
| `notify` | `--color-node-notify` | notify.svg | Notify |
| `ai` | `--color-node-ai` | ai.svg | AI |

### Структура

- Header: иконка (20px) + title (truncate) + status dot.
- Body: краткое описание/параметры (1-2 строки).
- Handles: input (left) и/или output (right) — круги 10px, цвет границы типа, белая заливка; при hover увеличиваются.
- Footer (опц.): метрики (findings count, duration).

### Размеры

- Минимальная ширина 180px, max 260px.
- Padding 12px; radius `--radius-lg`.

### Состояния

| Состояние | Рамка | Фон | Дополнительно |
|-----------|-------|-----|---------------|
| `idle` | `--color-border` (2px) | `--color-bg` | — |
| `selected` | тип-цвет (2px) | `--color-bg` | тень focus |
| `running` | тип-цвет (2px) | тип-фон | pulse-running кольцо |
| `success` | `--color-success` | success-bg | галочка в header |
| `error` | `--color-error` | error-bg | крест в header |
| `disabled` | `--color-border` | surface | opacity 0.5 |

### A11y

- `role="group"` или node container с `aria-label="{type}: {title}"`.
- Статус через `aria-live`? Лучше текстовый статус в title.
- Клавиатура управляется React Flow (стрелки, Enter).

---

## 12. Canvas

**Назначение**: область редактора workflow (React Flow wrapper).

### Элементы

- Фон: dotted grid (`--color-border`, 20px шаг) на `--color-surface`.
- Controls: zoom in/out, fit view, lock (bottom-left).
- Minimap (bottom-right), collapsible.
- Палитра drop-zone: подсветка при перетаскивании.
- Empty state: иллюстрация + текст «Перетащите ноду сюда» + CTA.

### Стили соединений (edges)

- Default: `--color-border-strong`, 2px, прямые/сглаженные (smoothstep).
- Active/running: `--color-primary`, 2px, анимированное пунктирное течение (stroke-dashoffset animation).
- Error: `--color-error`.

### Поведение

- Pan: drag по пустому месту (desktop), двумя пальцами (mobile).
- Zoom: wheel / pinch, диапазон 0.25–2.
- Snap to grid 20px.
- Multi-select: Shift+drag.

### A11y

- Канвас контейнер `role="application"` с `aria-label="Редактор workflow"`.
- Клавиатурное управление через React Flow defaults; добавить skip-link к панели свойств.

---

## 13. Общие состояния страниц

Для всех страниц определены состояния:
- `loading`: skeleton-блоки (shimmer) вместо контента.
- `empty`: иконка + заголовок + описание + CTA.
- `error`: сообщение + кнопка «Повторить».
- `success`: контент.

Skeleton использует `--color-surface` с shimmer-анимацией.