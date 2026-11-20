import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import App from "../../src/frontend/App";

describe("Smoke: сборка и рендер App", () => {
  it("рендерит приложение без ошибок", async () => {
    render(React.createElement(MemoryRouter, null, React.createElement(App)));
    // ждём lazy-загрузку главной страницы
    expect(await screen.findByText("Cyber Garden 2026", {}, { timeout: 5000 })).toBeInTheDocument();
  });
});