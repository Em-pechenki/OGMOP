# Описание страниц — OGMOP

> Экраны приложения. Маршруты: `/editor`, `/runs`, `/templates`, `/run/:id`.
> Используются компоненты из `docs/design/components.md` и токены из `docs/design/tokens.md`.
> Responsive breakpoints: 320 (sm) / 768 (md) / 1024 (lg) / 1280 (xl) / 1536 (2xl).

---

## Общий Layout (все страницы)

- **Header** (высота 56px, sticky): логотип Центр-инвест (слева), навигация (Editor / Runs / Templates), справа — кнопка «New workflow», аватар/меню.
- **Footer** (только на /runs, /templates, /run/:id; на /editor скрыт для экономии места): копирайт, ссылки.
- **Container**: max-width 1536px, padding 16px (sm) / 24px (md) / 32px (lg).

---

## 1. `/editor` — Конструктор workflow

### Назначение
Drag-and-drop редактор сценариев проверки безопасности.

### Структура (desktop ≥1024)

```
┌──────────────────────────────────────────────────────────────┐
│ Header (logo, name input, Save, Run, Share)                  │
├──────────┬───────────────────────────────┬───────────────────┤
│ Sidebar  │ Canvas (React Flow)           │ Properties Panel  │
│ (240px)  │ (flex)                        │ (320px)           │
│ palette  │                               │ tabs: Params/     │
│ groups   │                               │ Output/Logs       │
├──────────┴───────────────────────────────┴───────────────────┤
│ Status bar (zoom, minimap toggle, validation messages)       │
└──────────────────────────────────────────────────────────────┘
```

### Блоки

1. **TopBar** (Toolbar-вариант): название workflow (inline edit), кнопки Save (secondary), Run (primary), Export (ghost), Share (ghost). Справа статус «Saved/Saving…».
2. **Left Sidebar** (палитра нод):
   - Поиск по нодам.
   - Группы: Triggers, Logic, Scanners, Notify, AI.
   - Каждая нода — draggable карточка (иконка + название + краткое описание).
   - Collapse групп.
3. **Canvas**: React Flow, grid, minimap, controls. Drop подсветка.
4. **Right Properties Panel** (320px, collapsible):
   - Заголовок с типом и иконкой.
   - Вкладки: Params (форма параметров ноды), Output (последний результат), Logs (логи выполнения).
   - Кнопки Apply/Reset.
   - Если ничего не выбрано — подсказка «Выберите ноду».
5. **Status bar**: zoom %, кнопка fit, toggle minimap, сообщения валидации (ошибки красным).

### Responsive

- **≥1024 (lg)**: трёхколоночный layout как выше.
- **768–1023 (md)**: Properties Panel становится drawer справа (overlay); Sidebar остаётся 200px.
- **<768 (sm)**: Sidebar → bottom sheet / FAB-меню; Properties → full-screen drawer; Canvas занимает весь экран. TopBar сворачивает кнопки в меню.

### Состояния

- Пустой холст: empty state «Перетащите ноду из палитры».
- Валидация: ноды с ошибками подсвечиваются красной рамкой; в status bar список.
- Выполнение: running-ноды пульсируют; edges анимируются.

### A11y

- Skip-link «Перейти к холсту» / «Перейти к свойствам».
- Канвас `role="application"`.
- Все панели — `aside` с `aria-label`.

---

## 2. `/runs` — История запусков

### Назначение
Список прошедших запусков workflow с фильтрами и метриками.

### Структура

```
┌────────────────────────────────────────────┐
│ Header                                     │
├────────────────────────────────────────────┤
│ Page title + filters (status, date, search)│
├────────────────────────────────────────────┤
│ Table / Cards list                         │
│  - run id, workflow, status badge, started,│
│    duration, findings (badges counts),     │
│    actions (View, Rerun, Delete)           │
├────────────────────────────────────────────┤
│ Pagination                                 │
└────────────────────────────────────────────┘
```

### Блоки

1. **Page header**: заголовок «История запусков», счётчик.
2. **Filters bar**: Select статуса (All/Running/Success/Failed), DatePicker диапазон, Search по имени workflow, кнопка «Сбросить».
3. **Runs list**:
   - Desktop: таблица (колонки: ID, Workflow, Статус, Начало, Длительность, Находки, Действия).
   - Mobile: карточки (stacked).
   - Статус — Badge (running/success/error).
   - Находки — ряд Badge по severity с числами.
4. **Empty state**: «Запусков пока нет» + CTA «Создать workflow».
5. **Loading**: skeleton таблицы.
6. **Error**: сообщение + «Повторить».

### Responsive

- **≥1024**: таблица.
- **768–1023**: таблица с горизонтальным скроллом.
- **<768**: карточки.

---

## 3. `/templates` — Библиотека шаблонов

### Назначение
Просмотр, копирование и публикация шаблонов workflow.

### Структура

```
┌────────────────────────────────────────────┐
│ Header                                     │
├────────────────────────────────────────────┤
│ Title + Search + Filters (tags) + Sort     │
├────────────────────────────────────────────┤
│ Grid of template cards                     │
│ [card][card][card]                         │
│ [card][card][card]                         │
├────────────────────────────────────────────┤
│ Pagination / Load more                     │
└────────────────────────────────────────────┘
```

### Блоки

1. **Page header**: «Библиотека шаблонов», кнопка «Опубликовать» (primary).
2. **Toolbar**: Search input, Filter chips (tags: secrets, sca, sast, notify), Sort select (популярные/новые/имя).
3. **Template card**: превью через `PreviewPane` (миниатюра графа или иконки нод), название, описание (2 строки), теги (`Badge`/`FilterChip`), автор, число использований, дата. Actions: «Использовать» (primary sm), «Копировать» (ghost), «Подробнее» (ghost → PreviewModal). Фильтры/поиск/сортировка — по `docs/design/templates.md`.
4. **Empty state**: «Шаблонов нет» + CTA.
5. **Loading**: skeleton grid.

### Responsive

- **≥1280**: 4 колонки.
- **1024–1279**: 3 колонки.
- **768–1023**: 2 колонки.
- **<768**: 1 колонка.

---

## 4. `/run/:id` — Результаты запуска

### Назначение
Детальный просмотр одного запуска: статусы нод, находки, AI-отчёт, логи.

### Структура

```
┌────────────────────────────────────────────┐
│ Header (back to runs)                      │
├────────────────────────────────────────────┤
│ Summary card: status, workflow, started,   │
│ duration, counts by severity (badges)      │
├───────────────────────────────┬────────────┤
│ Findings list (filters)       │ Execution  │
│  - finding cards with code    │ graph /    │
│    snippet + AI recommendation│ timeline   │
├───────────────────────────────┴────────────┤
│ Logs panel (collapsible)                   │
├────────────────────────────────────────────┤
│ Actions: Export report, Rerun, Share        │
└────────────────────────────────────────────┘
```

### Блоки

1. **Summary card**: статус Badge, имя workflow, время старта/окончания, длительность, счётчики по severity (Badge с числом), общее число находок.
2. **Execution view** (правая колонка на desktop / вкладка на mobile): мини-граф нод со статусами (idle/running/success/error) + timeline список шагов (нода, время, статус, краткий результат).
3. **Findings list** (левая колонка):
   - Фильтры: severity (multi), тип (secrets/sca/sast), файл (search).
   - Сортировка: severity desc / file.
   - Finding card: severity Badge, тип, файл:строка, заголовок, сниппет кода (mono, подсветка), описание, AI-рекомендация (раскрываемая), кнопка «Скопировать».
4. **AI Report** (card): агрегированное объяснение и рекомендации (markdown), сгенерированное LLM.
5. **Logs panel**: сворачиваемый блок с логами (mono, автоскролл), фильтр по уровню.
6. **Actions**: Export (PDF/JSON), Rerun, Share link.

### Responsive

- **≥1024**: две колонки (findings 60% / execution 40%).
- **768–1023**: вкладки «Находки» / «Выполнение» / «Логи».
- **<768**: одна колонка, вкладки.

### Состояния

- Running: прогресс-бар + live updates (polling/SSE), findings появляются по мере готовности.
- Success/Failed: финальный вид.
- Empty findings: «Уязвимостей не найдено» (success state).

### Детализация визуализации выполнения (/run/:id)

#### Мини-граф (Execution graph)
- Использует `NodeCard` в read-only режиме (без drag, handles скрыты).
- Статусы нод: idle/running/success/error/skipped (точная спека §11 components.md).
- Рёбра: active/running/success/error/skipped по спеке §16 (Data Flow Indicator).
- Масштаб: fit view, zoom 0.5–1.5, pan отключён на mobile (только pinch).
- Легенда под графом: цветные точки + подписи состояний (sm).

#### Timeline (список шагов)
- Вертикальный список, каждый шаг: иконка статуса (status-*.svg), название ноды, время старта/окончания, длительность, краткий результат (1 строка, truncate).
- Текущий шаг (running) подсвечен `--color-primary-light` и `animate-pulse-running` на иконке.
- Ошибка шага: строка `--color-error-bg`, иконка status-error.

#### Прогресс
- Прогресс-бар (height 6px) над findings: `--color-primary` на `--color-surface`, анимация width 200ms.
- Live region `aria-live="polite"`: «Выполнено X из Y нод».

#### AI Report (card)
- Card `elevated`, заголовок «AI-отчёт» с иконкой `ai.svg`.
- Контент: markdown (заголовки, списки, code) рендерится в `--text-base`, `--color-text`.
- Секции: «Краткое резюме», «Ключевые риски», «Рекомендации» (нумерованный список).
- Состояния: loading (skeleton 6 строк), error (сообщение + «Повторить»), empty («Отчёт недоступен»).
- Кнопки: «Скопировать» (ghost), «Экспорт» (secondary).

#### Logs panel
- Collapsible (по умолчанию свёрнут на mobile, развёрнут на desktop).
- Высота 240px, скролл, mono 12px, автоскролл при новых логах (пауза при ручном скролле вверх).
- Фильтр по уровню: chips All/Info/Warn/Error.

### A11y

- Findings как `article` с `aria-labelledby`.
- Code snippet в `<pre><code>` с `aria-label`.
- Live region для прогресса (`aria-live="polite"`).

---

## Навигация

- Breadcrumbs на `/run/:id`: Главная → Запуски → Run #id.
- Активный пункт меню подсвечен.
- 404: страница «Не найдено» с CTA на /editor.

---

## Глобальные состояния

- **Offline**: баннер сверху «Нет соединения».
- **Loading (initial)**: splash с логотипом.
- **Error boundary**: «Что-то пошло не так» + перезагрузка.