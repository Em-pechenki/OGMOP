import { describe, it } from "vitest";

// Заготовки тестов компонентов дизайн-системы.
// Активировать по мере появления компонентов в src/frontend/components (или аналогичной папке).

describe.skip("Design system components (заготовка)", () => {
  it.todo("Button: рендерит children и вызывает onClick");
  it.todo("Button: применяет variant primary/secondary/ghost");
  it.todo("Card: рендерит заголовок и содержимое");
  it.todo("Input: controlled value и onChange");
  it.todo("Modal: открывается/закрывается по isOpen");
  it.todo("Toast: автоскрытие по timeout");
  it.todo("Sidebar: навигация по пунктам меню");
  it.todo("Toolbar: кнопки действий доступны по aria-label");
});

describe.skip("API client (заготовка)", () => {
  it.todo("health() возвращает статус ok");
  it.todo("обрабатывает сетевые ошибки");
});