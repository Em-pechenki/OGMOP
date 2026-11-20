# Дизайн — AI-генерация сценария (AI Generation) — OGMOP

> Звёздочка E8. Генерация workflow по текстовому описанию через LLM.
> Маршрут: модалка, вызываемая из `/editor` (Toolbar) и `/templates` («Создать по описанию»).

## 1. Назначение
Пользователь описывает задачу текстом (например «проверить репозиторий на секреты и уязвимые зависимости, уведомить в Telegram») → LLM возвращает граф нод/рёбер → пользователь просматривает превью → применяет к холсту или отклоняет.

## 2. Точка входа
- Editor Toolbar: кнопка ghost md с иконкой `ai.svg` + label «AI-генерация» (tooltip).
- TemplatesPage: кнопка secondary «Создать по описанию».
- Empty canvas: CTA «Сгенерировать сценарий» (primary) в empty state.

## 3. Modal AiGenerationModal

### Размер
- Desktop: `lg` (max 720px), full-height scroll при необходимости.
- Mobile: full-screen drawer.

### Структура
```
┌─ Header ─────────────────────────────────────┐
│ 🤖 AI-генерация сценария          [×]        │
├─ Body ───────────────────────────────────────┤
│ Prompt (Textarea, rows 4, maxLength 2000)    │
│ Опции (grid 2 cols):                         │
│   Стек: Select (Kotlin/Spring, Node, Python) │
│   Сканеры: multi-chips (secrets/sca/sast)    │
│   Уведомления: Select (none/telegram/webhook)│
│   Имя workflow: Input (optional)             │
│ [Сгенерировать] (primary, loading)           │
│ ── Preview ──                                │
│ Graph preview (read-only React Flow, 280px)  │
│ Список нод (тип + count)                     │
│ Warnings (amber)                             │
├─ Footer ─────────────────────────────────────┤
│ [Отмена] [Применить] (primary, disabled)    │
└──────────────────────────────────────────────┘
```

## 4. Состояния

| Состояние | UI |
|-----------|----|
| `idle` | Форма ввода, кнопка «Сгенерировать» disabled пока prompt пуст. Preview пустой (placeholder «Здесь появится превью»). |
| `loading` | Кнопка со спиннером, форма disabled, skeleton preview (shimmer). |
| `preview` | Граф + список нод + warnings. Кнопка «Применить» активна. |
| `error` | Баннер error (inline) с текстом причины + «Повторить». Форма остаётся. |
| `empty-result` | Сообщение «Не удалось сгенерировать граф. Уточните описание.» |

## 5. Prompt (Textarea)
- rows 4, autoSize до 8, maxLength 2000, showCount.
- Placeholder: «Опишите, что должен делать сценарий: какие проверки, уведомления, условия…»
- Helper: «Чем подробнее описание, тем точнее граф.»
- Примеры-подсказки (chips) под полем: «Секреты + SCA + уведомление», «Только SAST для PR», «Полный аудит с AI-отчётом» — клик вставляет текст.

## 6. Опции
- **Стек** (Select sm): Kotlin/Spring Boot (default), Node.js, Python, Go, Generic.
- **Сканеры** (multi-chips): secrets (default on), sca, sast. Минимум 1 (валидация).
- **Уведомления** (Select sm): Нет (default), Telegram, Webhook, Email.
- **AI-отчёт** (Switch): включать AI-ноду (default on).
- **Имя workflow** (Input sm, optional): если пусто — генерируется из prompt (первые 40 символов).

## 7. Preview графа
- Контейнер высота 280px (mobile 200px), фон `--color-surface`, граница `--color-border`, radius `--radius-lg`.
- React Flow read-only: без drag, handles скрыты, zoom 0.6–1.2, fit view.
- Ноды: NodeCard в состоянии idle (без execution).
- Рёбра: default style.
- Под графом: строка метрик: «Нод: N · Рёбер: M · Сканеров: K» (`--text-xs`, muted).
- Список нод (collapsible «Детали»): тип Badge + название + параметры (targetPath и т.п.) в mono xs.

## 8. Warnings
- Amber баннер (фон `--color-warning-bg`, текст `--color-warning-text`, иконка alert-triangle) для:
  - «LLM мог добавить ноды без параметров — проверьте перед применением.»
  - «Обнаружены неизвестные типы нод — они будут пропущены.»
- Список (ul) с иконкой.

## 9. Действия
- **Сгенерировать** (primary md): disabled если prompt пуст или < 10 символов или сканеры пусты. Loading spinner.
- **Применить** (primary md): disabled в non-preview. При клике: закрыть модалку, загрузить граф в store (setNodes/setEdges), toast «Сценарий применён», name input фокус.
- **Отмена** (ghost md): закрыть без изменений; если есть preview — confirm dialog «Отклонить сгенерированный сценарий?».
- **Перегенерировать** (secondary sm) в preview: повторный запрос с тем же prompt.
- **Копировать JSON** (ghost sm): копирует сгенерированный workflow JSON в буфер + toast.

## 10. Валидация ответа LLM
- Ответ должен быть JSON: `{ name, nodes[], edges[] }`.
- Неизвестные типы нод отфильтровываются с warning.
- Отсутствующие обязательные поля (id/type) → ошибка валидации.
- Лимит: ≤ 50 нод, ≤ 100 рёбер.

## 11. A11y
- Modal `role="dialog"`, `aria-labelledby` (title).
- Textarea label + `aria-describedby` (helper).
- Loading: `aria-busy="true"` на кнопке, live region «Генерация…».
- Preview graph container `aria-label="Превью сгенерированного сценария"`.
- Focus trap, Esc закрытие.

## 12. Токены
- Preview container: `--color-surface`, `--color-border`, `--radius-lg`.
- Warnings: `--color-warning-bg`, `--color-warning-text`.
- Кнопки через Button variants.
- Иконка AI: `public/icons/ai.svg` в `--color-node-ai`.

## 13. Безопасность
- Prompt санитизируется (trim, max 2000).
- Ответ LLM не выполняется как код — только парсится как JSON и валидируется по схеме.
- Никаких секретов в prompt (предупреждение в helper).
