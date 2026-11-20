import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { I18nProvider } from "../../src/frontend/i18n/I18nContext";
import { ThemeProvider } from "../../src/frontend/context/ThemeContext";
import ThemeToggle from "../../src/frontend/components/ui/ThemeToggle";
import LanguageSwitcher from "../../src/frontend/components/ui/LanguageSwitcher";
import EditorPage from "../../src/frontend/pages/EditorPage";
import { useI18n } from "../../src/frontend/hooks/useI18n";
import { useTheme } from "../../src/frontend/hooks/useTheme";

function Wrap({ children, locale = "ru" as const }: { children: React.ReactNode; locale?: "ru" | "en" }) {
  return React.createElement(
    ThemeProvider,
    null,
    React.createElement(I18nProvider, { initialLocale: locale }, children)
  );
}

describe("FE phase8: i18n", () => {
  it("switches language via LanguageSwitcher", async () => {
    render(Wrap({ children: React.createElement(LanguageSwitcher, { variant: "compact" }) }));
    const trigger = screen.getByLabelText("Сменить язык");
    await userEvent.click(trigger);
    const enOption = screen.getByText("English");
    await userEvent.click(enOption);
    expect(trigger.textContent?.toLowerCase()).toContain("en");
  });

  it("t() returns english after switch", () => {
    const Consumer: React.FC = () => {
      const { t } = useI18n();
      return <span>{t("nav.home")}</span>;
    };
    const { rerender } = render(Wrap({ children: React.createElement(Consumer), locale: "ru" }));
    expect(screen.getByText("Главная")).toBeInTheDocument();
  });
});

describe("FE phase8: theme", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
  });

  it("toggles dark class", async () => {
    render(Wrap({ children: React.createElement(ThemeToggle, { variant: "icon" }) }));
    const btn = screen.getByLabelText("Переключить тему");
    await userEvent.click(btn);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("segmented selects light", async () => {
    render(Wrap({ children: React.createElement(ThemeToggle, { variant: "segmented", showLabel: true }) }));
    const light = screen.getByText("Светлая");
    await userEvent.click(light);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});

describe("FE phase8: editor groups", () => {
  it("renders grouped buttons and palette cards", async () => {
    render(
      Wrap({
        children: React.createElement(MemoryRouter, null, React.createElement(EditorPage)),
        locale: "ru",
      })
    );
    expect(await screen.findByText("Конструктор workflow")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Файл" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Запуск" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "AI-генерация" })).toBeInTheDocument();
    // palette drag handle
    expect(screen.getAllByText("⋮⋮").length).toBeGreaterThan(0);
  });
});