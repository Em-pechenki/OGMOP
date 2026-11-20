import React from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Главная" },
  { to: "/editor", label: "Редактор" },
  { to: "/runs", label: "Запуски" },
  { to: "/templates", label: "Шаблоны" },
];

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2">
          <span className="inline-block w-8 h-8 rounded-lg bg-primary-darker text-white font-bold flex items-center justify-center">
            O
          </span>
          <span className="font-semibold text-text">OGMOP</span>
        </NavLink>
        <nav className="flex items-center gap-1 overflow-x-auto" aria-label="Основная навигация">          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-primary-light text-primary-darker" : "text-secondary hover:bg-surface"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;