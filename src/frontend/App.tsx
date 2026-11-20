import React from "react";

export default function App() {
  return (
    <div className="min-h-screen bg-surface text-brand-dark flex flex-col items-center justify-center p-8">
      <div className="flex items-center gap-3 mb-4">
        <svg width="40" height="40" viewBox="0 0 140 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M81.812 19.3431H77.1612V17.1763H81.812V19.3431Z" fill="#50B848"/>
          <path d="M12.4726 0V6.60627L17.8633 0H12.4726Z" fill="#50B848"/>
        </svg>
        <h1 className="text-4xl font-bold text-primary">Cyber Garden 2026</h1>
      </div>
      <p className="text-xl text-secondary mb-2">AI Security Workflow</p>
      <p className="text-sm text-secondary mb-8">
        Визуальная платформа автоматизации проверок безопасности
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full">
        {["Конструктор", "Сканеры", "AI-анализ"].map((x) => (
          <div
            key={x}
            className="bg-white rounded-lg p-6 text-center border border-primary-light shadow-card"
          >
            <h2 className="text-xl font-semibold mb-2 text-primary">{x}</h2>
            <p className="text-secondary text-sm">Готово</p>
          </div>
        ))}
      </div>
      <p className="mt-8 text-xs text-secondary">Банк «Центр-инвест» · Cyber Garden 2026</p>
    </div>
  );
}
