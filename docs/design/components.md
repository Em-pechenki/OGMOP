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

### Состояния (execution) — точная спецификация

| Состояние | Рамка | Фон | Индикатор в header | Анимация | Opacity |
|-----------|-------|-----|--------------------|----------|---------|
| `idle` | `--color-border` #E9F0F7 (2px solid) | `--color-bg` #FFFFFF | точка 8px `--color-text-subtle` #6B7280 | — | 1 |
| `selected` | тип-цвет (2px solid) | `--color-bg` #FFFFFF | точка типа | — | 1 |
| `running` | тип-цвет (2px solid) | тип-фон | спиннер 16px `--color-primary-dark` #3D8F3A (`animate-spin`) | `animate-pulse-running` (кольцо `--color-primary` #50B848) | 1 |
| `success` | `--color-success` #50B848 (2px solid) | `--color-success-bg` #E9F7F3 | галочка `public/icons/status-success.svg` цвет `--color-primary-darker` #2E6F2C | fade-in иконки (`--duration-fast`) | 1 |
| `error` | `--color-error` #D32F2F (2px solid) | `--color-error-bg` #FDECEA | крест `public/icons/status-error.svg` цвет `--color-error` #D32F2F | fade-in иконки (`--duration-fast`) | 1 |
| `skipped` | `--color-border-strong` #D1D5DB (2px dashed) | `--color-surface` #F6F8FA | иконка пропуска (dash) `--color-text-subtle` #6B7280 | — | 0.7 |
| `disabled` | `--color-border` #E9F0F7 (2px solid) | `--color-surface` #F6F8FA | точка `--color-text-subtle` | — | 0.5 |

#### Текст и контраст в состояниях
- Заголовок ноды всегда `--color-text` #01000C на светлом фоне состояния (контраст ≥17:1) — без исключений.
- Подзаголовок/метрики: `--color-text-muted` #494B52 (контраст ≥8:1 на всех фонах состояний).
- Текст статуса (опциональная подпись под иконкой): 
  - success: `--color-primary-darker` #2E6F2C, font-weight ≥600 (контраст 5.56:1 на #E9F7F3 ✅);
  - error: `--color-error` #D32F2F, font-weight ≥600 (контраст 4.35:1 на #FDECEA — допустимо для bold ≥14px; иначе использовать `--color-text`);
  - skipped: `--color-text-subtle` #6B7280, font-weight 400 (контраст 4.54:1 на #F6F8FA ✅);
  - running: `--color-primary-dark` #3D8F3A, font-weight ≥600.
- Нетекстовые элементы (иконки/индикаторы) должны иметь контраст ≥3:1 с фоном: success-иконка #2E6F2C на #E9F7F3 = 5.56 ✅; error-иконка #D32F2F на #FDECEA = 4.35 ✅; running-спиннер #3D8F3A на тип-фоне ≥3.6 ✅; skipped-иконка #6B7280 на #F6F8FA = 4.54 ✅.
- `animate-pulse-running` (1.5s infinite) применяется только к `running`; при `prefers-reduced-motion: reduce` — статичное кольцо без анимации, цвет `--color-primary`.

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

## 14. Properties Panel (панель свойств ноды)

**Назначение**: редактирование параметров выбранной ноды в редакторе workflow.

### Контейнер
- Desktop (≥1024): правая колонка шириной 320px, `bg-surface-elevated`, граница слева `--color-border`, скролл внутри.
- Tablet (768–1023): drawer справа (overlay) шириной 320px, backdrop `rgba(0,0,0,0.5)`.
- Mobile (<768): full-screen drawer с кнопкой закрытия.
- Заголовок: иконка типа (24px) + название типа (font-weight 600) + статус Badge (sm) + кнопка закрытия (ghost icon).

### Вкладки (Tabs)
`Params` | `Output` | `Logs` — высота 40px, активная вкладка: нижняя полоска 2px `--color-primary`, текст `--color-primary`.

### Params (форма)
- Поля по схеме ноды: `Input`/`Textarea`/`Select`/переключатели/списки.
- Группировка по секциям с заголовками (`--text-sm`, font-weight 600, `--color-text-muted`).
- Валидация: inline `error` под полем, кнопка Apply disabled при ошибках.
- Кнопки в footer: `Apply` (primary, md) + `Reset` (ghost, md), sticky снизу.

### Output
- Последний результат выполнения ноды: JSON/текст в `<pre><code>` (mono, 12px), фон `--color-surface`, радиус `--radius-md`, max-height 320px со скроллом.
- Кнопка «Копировать» (ghost icon) + «Скачать» (ghost).
- Если результата нет — empty state «Нода ещё не выполнялась».

### Logs
- Список строк логов (mono, 12px), автоскролл, цвет по уровню: info `--color-text`, warn `--color-warning-text`, error `--color-error`.
- Фильтр по уровню (chips).

### Empty state (ничего не выбрано)
- Иконка `logic.svg` 48px в `--color-text-subtle`, заголовок «Выберите ноду», описание «Кликните по ноде на холсте, чтобы редактировать её параметры.», CTA нет.

### A11y
- Контейнер `aside` с `aria-label="Панель свойств"`.
- Вкладки: `role="tablist"`, `aria-selected`.
- Поля формы с `label` и `aria-describedby`.
- Focus trap в drawer на mobile.

---

## 15. Results Panel (панель результатов запуска)

**Назначение**: отображение находок (findings) одного запуска workflow, фильтрация и навигация.

### Контейнер
- Card `elevated` с padding `--space-4`, скролл внутри, max-height 70vh на desktop.

### Header
- Заголовок «Находки» + счётчик `Badge neutral` (общее число).
- Ряд фильтров: Severity (multi-select chips), Тип (secrets/sca/sast), поиск по файлу (Input sm с иконкой).
- Сортировка: Select sm (severity desc / file asc).

### FindingCard
- Card `outlined`, padding `--space-3`, margin-bottom `--space-3`.
- Шапка: `Badge` severity (sm) + тип (text `--text-xs`, muted) + локация `file:line` (mono, `--text-xs`, `--color-text-subtle`).
- Заголовок: `--text-base`, font-weight 600, `--color-text`.
- Сниппет кода: `<pre><code>` mono 12px, фон `--color-surface`, граница `--color-border`, радиус `--radius-md`, max-height 160px, горизонтальный скролл, подсветка строки-находки фоном `--color-risk-medium-bg` (или severity-bg).
- Описание: `--text-sm`, `--color-text-muted`, 2–4 строки, раскрываемое («Показать полностью»).
- AI-рекомендация: раскрываемый блок с иконкой AI, фон `--color-node-ai-bg`, текст `--color-text`, markdown (списки/код).
- Действия: «Скопировать» (ghost sm, иконка copy), «Открыть файл» (ghost sm, опц.).

### Empty state (нет находок)
- Иконка check 48px `--color-success`, заголовок «Уязвимостей не найдено», описание «Запуск завершён без находок.», фон `--color-success-bg` у карточки empty.

### Loading
- Skeleton: 3 карточки-заглушки (shimmer).

### A11y
- Список `ul`/`ol` с `role="list"`; карточка `article` с `aria-labelledby` (заголовок).
- Сниппет в `<pre><code>` с `aria-label="Фрагмент кода"`.
- Live region для обновления счётчика при фильтрации (`aria-live="polite"`).

---

## 16. Data Flow Indicator (индикатор потока данных между нодами)

**Назначение**: визуализация передачи данных по ребру (edge) между нодами во время выполнения.

### Edge (соединение)
- Базовый: `--color-border-strong` #D1D5DB, 2px, smoothstep.
- Idle: сплошная линия, без анимации.
- Active/running: `--color-primary` #50B848, 2px, `stroke-dasharray: 6 4`, анимация `animate-flow` (stroke-dashoffset 24→0, 0.8s linear infinite).
- Success path: `--color-success` #50B848 сплошная, толщина 2px.
- Error path: `--color-error` #D32F2F, 2px, dashed `4 4`, без анимации.
- Skipped path: `--color-border` #E9F0F7, 1.5px, dashed `2 4`, opacity 0.5.

### Пакет данных (data packet)
- Круг 6px `--color-primary` #50B848, движется вдоль ребра от source к target за 600ms (`--ease-standard`).
- Только на active-рёбрах; при `prefers-reduced-motion` — статичная точка у target.
- Тень `--shadow-sm`.

### Подпись на ребре (опц.)
- При hover: tooltip с типом передаваемых данных / счётчиком находок, фон `--color-surface-elevated`, тень `--shadow-card`, `--text-xs`.

### A11y
- Рёбра React Flow имеют `aria-label="Соединение от {source} к {target}"`.
- Анимация отключается при `prefers-reduced-motion: reduce`.

---

## 17. FilterChip / SearchBar (фильтры и поиск)

**Назначение**: фильтрация списков (templates, runs, findings).

### FilterChip
- Pill-кнопка высотой 28px, radius `--radius-full`, font `--text-xs`, font-weight 500.
- Состояния: inactive (фон `--color-surface`, текст `--color-text-muted`, граница `--color-border`), active (фон `--color-primary`, текст #FFFFFF, граница primary), disabled (opacity 0.5).
- Опция `dot` (цветная точка 8px слева) для severity/tags.
- Multi-select: `aria-pressed`.
- Hover: `--duration-fast`.

### SearchBar (Input search обёртка)
- Input type=search, size md, leftAdornment иконка search, rightAdornment кнопка очистки (ghost icon) при наличии значения.
- Debounce 300ms на уровне компонента (опц.).
- `aria-label` обязателен.

### A11y
- FilterChip: `role="button"` (или button), `aria-pressed`.
- SearchBar: `role="search"` wrapper, input `aria-label`.

---

## 18. StatusBadge (статусы выполнения / CI)

**Назначение**: компактный статус ноды, запуска, CI-run.

### Варианты
| Вариант | Фон | Текст | Иконка |
|---------|-----|-------|--------|
| `idle` / `pending` / `queued` | `--color-surface` | `--color-text-muted` | dot серая |
| `running` | `--color-primary-light` | `--color-primary-dark` | spinner |
| `success` / `completed` | `--color-success-bg` | `--color-primary-darker` | check |
| `error` / `failed` | `--color-error-bg` | `--color-error` | x |
| `skipped` / `cancelled` | `--color-surface` | `--color-text-subtle` | dash |
| `ci-success` | `--color-success-bg` | `--color-primary-darker` | github-check |
| `ci-failure` | `--color-error-bg` | `--color-error` | github-x |

### Размеры
- sm: height 18px, font xs, padding-x 6px.
- md: height 22px, font sm, padding-x 8px.

### Props
```ts
interface StatusBadgeProps {
  status: "idle" | "pending" | "queued" | "running" | "success" | "completed" | "error" | "failed" | "skipped" | "cancelled";
  size?: "sm" | "md";
  showIcon?: boolean;
  label?: string; // override
}
```

### A11y
- `role="status"`, `aria-live="polite"` (опц. для running).

---

## 19. PreviewPane (мини-граф read-only)

**Назначение**: превью workflow в TemplateCard, PublishModal, AiGenerationModal, Run detail.

### Поведение
- React Flow read-only: drag отключён, handles скрыты, pan опц. (off на mobile).
- Zoom 0.5–1.2, fit view при монтировании и при resize.
- Высота: prop `height` (default 200px).
- Фон: dotted grid `--color-border` на `--color-surface`.
- Empty state: «Нет нод» xs muted.
- Loading: shimmer.

### Props
```ts
interface PreviewPaneProps {
  nodes: Node[];
  edges: Edge[];
  height?: number;
  interactive?: boolean; // default false
  showMinimap?: boolean; // default false
}
```

---

## 13. Общие состояния страниц

Для всех страниц определены состояния:
- `loading`: skeleton-блоки (shimmer) вместо контента.
- `empty`: иконка + заголовок + описание + CTA.
- `error`: сообщение + кнопка «Повторить».
- `success`: контент.

Skeleton использует `--color-surface` с shimmer-анимацией.

---



---

## 20. ThemeToggle (переключатель темы)

**Назначение**: переключение темы интерфейса (light/dark/system) в Header/Sidebar. Сохранение в `localStorage('ogmop:theme')`.

### Варианты (variant)
| Вариант | Описание | Где |
|---------|----------|-----|
| `icon` | Кнопка-иконка (sun/moon/monitor) | Header |
| `segmented` | 3 сегмента (Светлая / Тёмная / Системная) | Settings |

### Поведение
- Размеры: sm (32px), md (40px) — как Button icon.
- Иконки: `sun` (light), `moon` (dark), `monitor` (system). SVG из `public/icons/`.
- Активная тема подсвечивается фоном `--color-primary-light` и иконкой `--color-primary`; неактивные — `--color-text-muted`.
- Анимация: иконка rotate 180° + fade (`--duration-normal`), фон плавно (`--duration-slow`).
- Применение: добавляет/снимает класс `dark` на `<html>`, сохраняет в `localStorage('ogmop:theme')`. При `system` — подписка на `matchMedia('(prefers-color-scheme: dark)')`.

### Props
```ts
interface ThemeToggleProps {
  variant?: "icon" | "segmented";
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}
```

### A11y
- `role="switch"` (icon) или `role="radiogroup"` (segmented); `aria-checked` / `aria-pressed`.
- `aria-label`: «Переключить тему»; для segmented — «Выбрать тему».
- Клавиатура: Enter/Space переключает; в segmented — стрелки ←/→.
- Focus ring `--shadow-focus`. Touch-target >= 44px на mobile.

---

## 21. LanguageSwitcher (переключатель языка)

**Назначение**: смена языка интерфейса (ru/en). Расположение: Header (компактный) и Settings (полный).

### Поддерживаемые локали
| Код | Название | По умолчанию |
|-----|----------|--------------|
| `ru` | Русский | да |
| `en` | English | нет |

Расширение — через i18n-словарь (`src/frontend/i18n/`).

### Поведение
- Компактный (Header): кнопка с кодом локали (`RU`/`EN`) + chevron; dropdown со списком языков.
- Полный (Settings): segmented/radio-список с названием языка на нём самом («Русский», «English»).
- При смене: обновляет `i18n.changeLanguage()`, сохраняет `localStorage('ogmop:locale')`, перерисовывает UI без перезагрузки.
- Dropdown: `--color-surface-elevated`, `--shadow-modal`, `--radius-lg`, z-index `--z-dropdown`.

### Props
```ts
interface LanguageSwitcherProps {
  variant?: "compact" | "full";
  size?: "sm" | "md";
  className?: string;
}
```

### A11y
- Trigger: `aria-haspopup="listbox"`, `aria-expanded`.
- Список: `role="listbox"`, элементы `role="option"`, `aria-selected`.
- Клавиатура: Enter/Space открывает; Esc закрывает; стрелки навигация; Enter выбирает.
- Focus ring `--shadow-focus`. Touch-target >= 44px.

### Синхронизация с темой
- Переключатели независимы; значения сохраняются раздельно (`ogmop:theme`, `ogmop:locale`).
- Первый визит: тема = `system` (prefers-color-scheme), язык = язык браузера (`navigator.language` -> `ru`/`en`, fallback `ru`).
