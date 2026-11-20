# Дизайн — Библиотека шаблонов (Templates) — OGMOP

> Звёздочка E8. Расширяет `pages.md` §3 (`/templates`) и `components.md`.
> Использует токены из `tokens.md`, компоненты Button/Input/Card/Modal/Badge/Select.

## 1. Назначение
Просмотр, поиск, фильтрация, копирование, публикация и удаление шаблонов workflow.
Маршрут: `/templates`. Доступно без авторизации (MVP); публикация — по токену (опц.).

## 2. Layout страницы `/templates`

### Desktop (≥1024)
```
┌──────────────────────────────────────────────────────┐
│ Header                                               │
├──────────────────────────────────────────────────────┤
│ Title "Библиотека шаблонов"  [Счётчик]  [Опубликовать] │
│ Search input  [Filter chips]  [Sort select]           │
├──────────────────────────────────────────────────────┤
│ Grid (3-4 cols) of TemplateCard                      │
│ ...                                                  │
├──────────────────────────────────────────────────────┤
│ Pagination / Load more                               │
└──────────────────────────────────────────────────────┘
```

### Mobile (<768)
- Title + кнопка «Опубликовать» (icon-only) в строку.
- Search input full-width.
- Filter chips горизонтальный скролл.
- Sort → dropdown.
- Grid 1 колонка.

## 3. TemplateCard

### Структура (Card `default`, hoverable, padding md)
- **Preview** (верх, высота 120px, фон `--color-surface`, радиус top `--radius-lg`):
  - Миниатюра графа (SVG/React Flow read-only, fit view) ИЛИ набор иконок нод (fallback).
  - Overlay при hover: кнопка «Предпросмотр» (ghost sm, иконка eye).
- **Body**:
  - Заголовок: `--text-base`, font-weight 600, `--color-text`, truncate 1 строка.
  - Описание: `--text-sm`, `--color-text-muted`, 2 строки (line-clamp-2).
  - Теги: ряд `Badge` sm (neutral) — `secrets`, `sca`, `sast`, `notify`, `ai`.
  - Мета-строка: автор (muted, xs) · дата (xs, subtle) · «использований: N» (xs, subtle).
- **Footer** (разделитель сверху):
  - «Использовать» (primary sm, fullWidth на mobile? нет — inline).
  - «Копировать» (ghost sm, иконка copy).
  - «Подробнее» (ghost sm, иконка info) — открывает PreviewModal.
  - Опасное: «Удалить» (ghost sm, danger icon) — только для автора/админа, подтверждение Modal alertdialog.

### Состояния
- default / hover (подъём `--shadow-hover`, translateY -2px) / focus / loading (skeleton) / selected (рамка primary).
- Публичный шаблон: Badge `info` «Публичный» в шапке.

### Размеры превью
- Desktop card width ~ 1/3-1/4 контейнера; preview aspect 16:9 (min 160×90).
- Mobile: preview высота 100px.

## 3.1 TemplateCard — варианты (variants)

Базовый `TemplateCard` (§3) имеет варианты, управляемые prop `variant`.

| Вариант | Превью | Плотность | Использование |
|---------|--------|-----------|---------------|
| `default` | 120px (16:9) | стандартная | сетка `/templates` |
| `featured` | 180px, бейдж «Рекомендуемый» | расширенная (больше описания) | топ шаблоны на лендинге |
| `compact` | 80px (только иконки нод) | компактная | sidebar, списки, mobile drawer |
| `horizontal` | слева (120×90) | горизонтальная | mobile (<768) как альтернатива вертикальной |

### `featured`
- Card `elevated`, padding lg, граница `--color-primary` (2px) + тень `--shadow-hover`.
- Бейдж «Рекомендуемый» (Badge success sm, dot) в правом верхнем углу превью.
- Описание до 4 строк (line-clamp-4), теги до 5.
- CTA: «Использовать» (primary md) + «Подробнее» (ghost sm).

### `compact`
- Без превью-графа: ряд иконок нод (до 5, 16px, `--color-text-muted`) + «+N».
- Заголовок `--text-sm`, font-weight 600; описание скрыто (tooltip на hover).
- Мета-строка сокращена: «N использований».
- Actions: только иконки («Использовать» icon primary, «Копировать» ghost icon).

### `horizontal`
- Flex row: превью слева (120×90), контент справа.
- На mobile (<768) используется по умолчанию для экономии вертикали.

### Общие правила вариантов
- Все варианты используют токены (никаких hex).
- Hover: `--shadow-hover`, translateY -2px, `--duration-fast` (кроме compact — только цвет фона).
- Focus: `--shadow-focus`.
- Loading: skeleton по форме варианта (shimmer).
- Selected: рамка `--color-primary`.

---

## 3.2 TemplateCard — состояния (расширенные)

| Состояние | Визуал |
|-----------|--------|
| `default` | Card default, hoverable |
| `hover` | подъём, тень hover |
| `focus` | кольцо focus |
| `loading` | skeleton (shimmer) по форме варианта |
| `selected` | рамка primary |
| `error` | рамка `--color-error`, сообщение под карточкой |
| `empty-preview` | фон `--color-surface`, иконка logic.svg 32px muted, текст «Нет превью» |

---

## 4. Фильтры, поиск, сортировка

### Search
- Input type=search, size md, leftAdornment иконка search, placeholder «Поиск по названию/описанию/тегам».
- Debounce 300ms. Очистка (rightAdornment ×) при вводе.

### Filter chips (tags)
- Multi-select chips: Все / secrets / sca / sast / notify / ai / trigger / logic.
- Стиль: Badge-like pill, высота 28px, radius full.
- Активный: фон `--color-primary`, текст #FFFFFF.
- Неактивный: фон `--color-surface`, текст `--color-text-muted`, граница `--color-border`.
- Горизонтальный скролл на mobile с fade-краями.

### Sort
- Select sm: «Популярные» (default), «Новые», «По имени A→Z», «По имени Z→A».

### Reset
- Кнопка ghost sm «Сбросить» появляется при активных фильтрах.

### Live region
- `aria-live="polite"`: «Найдено N шаблонов».

## 5. PreviewModal (подробнее)
- Modal size lg.
- Header: название + теги + автор.
- Body:
  - Preview графа (высота 320px, React Flow read-only, fit view, minimap off).
  - Описание (full text).
  - Список нод: тип Badge + count (например «Scanner ×3»).
  - Метаданные: создан, обновлён, версия (опц.).
- Footer: «Использовать» (primary) + «Копировать JSON» (secondary) + «Закрыть» (ghost).

## 6. PublishModal (публикация)
- Modal size md, role dialog.
- Поля: Название (Input, required), Описание (Textarea, maxLength 2000, showCount), Теги (multi-select chips или Input comma-separated), Публичный (Switch).
- Кнопка «Опубликовать» primary, disabled при ошибках.
- Превью workflow (read-only миниатюра) вверху.
- Состояния: idle / loading (spinner) / success (toast + закрытие) / error (inline).

## 7. Empty / Loading / Error (расширенные)

### Empty (нет шаблонов)
- Контейнер: Card `subtle`, padding `--space-12`, центрирован, max-width 480px, по центру страницы.
- Иконка: `logic.svg` 64px, `--color-text-subtle`, opacity 0.6.
- Заголовок: «Шаблонов пока нет» (`--text-xl`, font-weight 600, `--color-text`).
- Описание: «Создайте первый шаблон из workflow или используйте готовые.» (`--text-sm`, `--color-text-muted`, max-width 320px).
- CTA-группа: «Опубликовать» (primary md) + «Создать вручную» (secondary md → /editor).
- Фон: `--color-surface`, радиус `--radius-lg`.

### Empty (нет результатов поиска/фильтрам)
- Иконка: search 48px, `--color-text-subtle`.
- Заголовок: «Ничего не найдено».
- Описание: «Попробуйте изменить запрос или сбросить фильтры.»
- CTA: «Сбросить фильтры» (ghost md).
- Live region: «Найдено 0 шаблонов» (`aria-live="polite"`).

### Loading (skeleton grid)
- 6 карточек-заглушек (desktop) / 4 (tablet) / 3 (mobile) по форме `default` варианта.
- Skeleton: фон `--color-surface`, shimmer-анимация 1.5s infinite.
- Блоки-заглушки: превью (120px, radius top), заголовок (60% ширины), описание (2 строки 80%/60%), теги (3 pill), мета (40%).
- Не показывать спиннер поверх — только skeleton.

### Error
- Контейнер: Card `outlined`, padding `--space-8`, центрирован.
- Иконка: alert-circle 48px, `--color-error`.
- Заголовок: «Не удалось загрузить шаблоны» (`--text-lg`, font-weight 600, `--color-error`).
- Описание: сообщение ошибки (`--text-sm`, `--color-text-muted`), max 2 строки.
- CTA: «Повторить» (primary md) + «На главную» (ghost md).
- При повторной ошибке: показать детали (collapsible, mono xs).

### A11y
- Empty/error контейнеры — `role="status"` (empty) / `role="alert"` (error).
- Loading — `aria-busy="true"` на grid, `aria-live="polite"` «Загрузка шаблонов».

## 8. Пагинация
- Desktop: numbered pagination (1 2 3 … N) + «Показать ещё» (ghost) альтернатива.
- Mobile: «Загрузить ещё» button (primary outline), infinite scroll опц.
- Page size 12 (desktop) / 8 (mobile).

## 9. Токены и анимации
- Hover card: `--shadow-hover`, translateY -2px, `--duration-fast`.
- Chips: radius `--radius-full`.
- Preview container: фон `--color-surface`, граница `--color-border`, radius `--radius-lg`.
- Все цвета через токены (никаких hex).

## 10. A11y
- Grid `role="list"`? Карточки `article` с `aria-labelledby` (title id).
- Фильтры: `role="group"` + `aria-pressed` для chips.
- Search: `aria-label="Поиск шаблонов"`.
- Modal: focus trap, Esc закрытие, возврат фокуса.
- Pagination: `nav` с `aria-label="Пагинация"`.

## 11. Данные (shared/types/template.ts)
Поля: id, name, description, workflow, author, tags, createdAt, updatedAt, isPublic, usageCount (добавить опц.).
Рекомендуется расширить Template: `usageCount?: number`, `previewSvg?: string`, `version?: string`.

## 12. Responsive breakpoints
- ≥1280: 4 колонки.
- 1024–1279: 3.
- 768–1023: 2.
- <768: 1.
