# Дизайн — Визуализация выполнения (Execution Visualization) — OGMOP

> Улучшение E6: анимация потока данных, точные статусы нод/рёбер, timeline, прогресс.
> Расширяет `components.md` §11 (NodeCard), §16 (Data Flow Indicator), `pages.md` §4 (`/run/:id`).

## 1. Цель
Сделать выполнение workflow «живым»: пользователь видит, какая нода работает, по какому ребру идут данные, где ошибка, что пропущено. Единый визуальный язык для editor (run mode) и run detail.

## 2. Статусы нод (точная спека)

Уже в `components.md` §11. Дополнения:

### 2.1 Status badge (текстовая подпись)
- Под иконкой статуса (опц., включается в Run mode): `--text-xs`, font-weight 600.
- idle: «Ожидание» `--color-text-subtle`.
- queued: «В очереди» `--color-text-subtle`.
- running: «Выполняется» `--color-primary-dark`.
- success: «Готово» `--color-primary-darker`.
- error: «Ошибка» `--color-error`.
- skipped: «Пропущено» `--color-text-subtle`.
- cancelled: «Отменено» `--color-text-subtle`.

### 2.2 Метрики в footer ноды (только после выполнения)
- duration: `123ms` (mono xs).
- findings count для scanner: Badge sm severity.
- AI: «отчёт готов» xs muted.

### 2.3 Reduced motion
- `prefers-reduced-motion: reduce`: отключить pulse-running и flow; оставить статичные цвета/иконки.

## 3. Статусы рёбер (edges)

Из `components.md` §16. Дополнения:
- **queued**: `--color-border` 1.5px dashed `2 4`, opacity 0.4.
- **running**: `--color-primary` 2px, `stroke-dasharray: 6 4`, `animate-flow` (0.8s linear infinite) + data packet.
- **success**: `--color-success` 2px сплошная.
- **error**: `--color-error` 2px dashed `4 4`, без анимации, иконка ⚠ на середине (опц.).
- **skipped**: `--color-border` 1.5px dashed `2 4`, opacity 0.5.

### 3.1 Data packet (пакет данных)
- Круг 8px (было 6) `--color-primary`, тень `--shadow-sm`.
- Движение source→target за 600ms `--ease-standard`.
- Только на running-рёбрах; на reduced-motion — статичная точка у target с pulse.
- Если ребро длинное (>400px) — показывать 2 пакета с задержкой 200ms.

### 3.2 Подпись на ребре
- Hover tooltip: тип данных («findings[]», «boolean», «report») + счётчик.
- Позиция: середина ребра, фон elevated, тень card, xs.

## 4. Canvas execution mode
- Фон сетки остаётся; running-ноды подсвечиваются ring.
- Мини-карта: цвет ноды по статусу (running→primary, success→success, error→error).
- Controls: кнопка «Пауза» (опц.) в run mode.
- Empty state в run mode: «Запуск не начат».

## 5. Timeline (список шагов)
- Вертикальный, каждый шаг карточка высотой 56px.
- Слева: иконка статуса (status-*.svg 20px) + вертикальная линия соединения (2px, цвет по статусу предыдущего).
- Центр: название ноды (sm, semibold) + тип (xs muted) + краткий результат (xs, truncate).
- Справа: время старта (mono xs) + длительность (mono xs bold).
- Running шаг: фон `--color-primary-light`, иконка `animate-pulse-running`, линия `--color-primary`.
- Error шаг: фон `--color-error-bg`, иконка error, строка разворачивается с текстом ошибки.
- Skipped: opacity 0.7, иконка dash.

### 5.1 Группировка
- Шаги группируются по «волнам» (параллельные ноды) с разделителем «Волна N» (xs muted, uppercase).

## 6. Прогресс
- Прогресс-бар над findings: высота 6px, фон `--color-surface`, заливка `--color-primary`, анимация width 200ms.
- Текст: «Выполнено X из Y нод» (`--text-sm`, muted) + процент.
- Live region `aria-live="polite"`.

## 7. Execution graph (мини-граф в /run/:id)
- Read-only React Flow, fit view, zoom 0.5–1.5.
- Pan отключён на mobile (только pinch).
- Легенда под графом: цветные точки + подписи состояний (idle/running/success/error/skipped), горизонтальный ряд, wrap на mobile.
- Hover на ноде: tooltip с duration/findings.

## 8. Live updates
- Polling 800ms (или SSE) — уже в runStore.
- Находки появляются по мере готовности (append + slide-in animation `--duration-normal`).
- При завершении: toast «Запуск завершён» + финальный статус.

## 9. Empty / Loading / Error
- Loading: skeleton графа (shimmer) + skeleton timeline.
- Empty findings: success state (как в components §15).
- Error boundary: «Что-то пошло не так» + «Повторить».

## 10. A11y
- Graph container `role="application"`, `aria-label="Граф выполнения workflow"`.
- Timeline `ol` с `aria-label="Шаги выполнения"`.
- Live region для прогресса и статуса.
- Reduced motion: отключить анимации.

## 11. Токены (дополнения)
- `--duration-flow`: 800ms (уже в tailwind animation flow).
- Data packet size 8px (через class w-2 h-2).
- Все цвета через токены.
- Добавить в `tokens.md` §7 keyframe `flow` (уже в tailwind; документировать).

## 12. Синхронизация
- Обновить `tokens.md` §7 (keyframes: добавить `flow`, `shimmer`).
- Обновить `components.md` §11/§16 (уже частично).
- `pages.md` §4 (уже частично).
