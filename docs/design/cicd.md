# Дизайн — CI/CD интеграция — OGMOP

> Звёздочка E8. Интеграция с GitHub Actions: запуск workflow по PR, статус-чеки, комментарии.
> Поверхности: Settings modal (из Header/Editor), Status widget на `/runs` и PR-странице (внешней, вне приложения).

## 1. Назначение
Пользователь подключает репозиторий GitHub → OGMOP запускает выбранный workflow при PR/push → результат (статус + находки) публикуется как check-run и комментарий.

## 2. Точка входа
- Header: иконка settings (ghost) → SettingsModal, вкладка «Интеграции».
- Editor Toolbar: кнопка ghost «CI/CD» открывает SettingsModal с активной вкладкой.
- Run detail: Badge «CI run» если запуск инициирован CI.

## 3. SettingsModal — вкладка «CI/CD»

### Структура
```
┌─ Header: Настройки ─ tabs: Общие | Интеграции | CI/CD ─┐
├─ Body ──────────────────────────────────────────────────┤
│ Статус подключения: Badge (connected/disconnected)     │
│ Репозиторий: Input (owner/repo) + кнопка «Проверить»  │
│ Токен: Input password (masked) + «Показать» + «Сохранить»│
│ Ветки: multi-chips (main, develop, *)                   │
│ Триггеры: checkboxes (push, pull_request, schedule)     │
│ Workflow: Select (какой workflow запускать)             │
│ Порог провала: Select (critical/high/medium/low)       │
│ Комментарий в PR: Switch (вкл/выкл)                    │
│ [Сохранить] [Отключить]                                │
│ ── Последние запуски CI (таблица 5 строк) ──          │
└─────────────────────────────────────────────────────────┘
```

### Поля
| Поле | Компонент | Валидация |
|------|-----------|-----------|
| Репозиторий | Input text | regex `^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$` |
| Токен | Input password | min 20 chars, маскируется; показывается только первые 4 + «••••» |
| Ветки | multi-chips input | минимум 1 |
| Триггеры | Checkbox group | минимум 1 |
| Workflow | Select | из сохранённых workflows |
| Порог провала | Select | critical/high/medium/low |
| Комментарий в PR | Switch | — |

### Состояния подключения
- `disconnected`: серая карточка «Не подключено», CTA «Подключить».
- `connecting`: spinner + «Проверка токена…».
- `connected`: зелёная карточка с аватаром/логотипом репо, имя, ветка по умолчанию, «Последняя синхронизация: X мин назад», кнопка «Отключить» (danger ghost).
- `error`: красная карточка с причиной + «Повторить».

## 4. CiStatusBadge (компонент)
- Маленький Badge для списков запусков/PR.
- Варианты: `pending` (серый), `running` (синий + spinner), `success` (зелёный), `failure` (красный), `neutral` (серый).
- Иконка слева (status-*.svg) + текст.
- Tooltip при hover: «CI: {status} · {duration}».

## 5. CiRunTable (в Settings)
- Таблица 5 последних CI-запусков: колонки PR/ветка, статус Badge, время, находки (counts), ссылка «Открыть».
- Mobile: карточки.
- Empty: «Запусков пока нет».

## 6. Status widget на `/runs`
- Фильтр «Источник»: All / Manual / CI.
- Колонка «Источник» с иконкой (github.svg) для CI-запусков.
- Badge «CI» рядом со статусом.

## 7. PR-комментарий (внешний, дизайн шаблона)
- Markdown-шаблон комментария, который OGMOP публикует в PR:
  - Заголовок «🛡️ OGMOP Security Scan».
  - Статус: ✅ Passed / ❌ Failed (по порогу).
  - Таблица counts по severity.
  - Топ-5 находок (severity, файл:строка, заголовок).
  - Ссылка «Полный отчёт» → `/run/:id`.
  - Свёрнутый блок «AI-рекомендации» (details).
- Дизайн-токены не применяются (GitHub markdown), но структура фиксируется здесь.

## 8. Security / masking
- Токен никогда не отображается полностью (маска).
- Кнопка «Показать» требует повторной аутентификации (опц., MVP — просто toggle с предупреждением).
- В логах токен маскируется (`***`).
- Хранение: localStorage (MVP) с предупреждением; production — сервер.

## 9. A11y
- Settings modal: tabs `role="tablist"`, `aria-selected`.
- Password input: `aria-label="GitHub токен"`, toggle `aria-pressed`.
- Таблица: `caption`, `th scope`.
- Live region для статуса подключения.

## 10. Токены
- Connected card: фон `--color-success-bg`, граница `--color-success`.
- Disconnected: `--color-surface`, `--color-border`.
- Error: `--color-error-bg`, `--color-error`.
- Иконки: GitHub logo (monochrome) в `--color-text`.

## 11. Responsive
- Modal: md на desktop, full-screen на mobile.
- Формы: 1 колонка на mobile, 2 на desktop.
- Таблица → карточки на mobile.
