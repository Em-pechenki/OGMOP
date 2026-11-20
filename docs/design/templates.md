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

## 7. Empty / Loading / Error
- Empty: иконка `logic.svg` 48px muted, заголовок «Шаблонов нет», описание, CTA «Опубликовать» (primary) + «Создать вручную» (secondary → /editor).
- Loading: skeleton grid 6 карточек (shimmer).
- Error: сообщение + «Повторить».

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
