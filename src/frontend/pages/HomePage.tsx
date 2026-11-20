import React from "react";
import { Link } from "react-router-dom";
import Button from "@frontend/components/ui/Button";
import Card from "@frontend/components/ui/Card";
import Badge from "@frontend/components/ui/Badge";
import Container from "@frontend/components/layout/Container";

const features = [
  { title: "Визуальный конструктор", desc: "Drag-and-drop редактор на React Flow. Собирайте сценарии из блоков без кода.", icon: "/OGMOP/icons/logic.svg" },
  { title: "Сканеры безопасности", desc: "Secrets, SCA, SAST для Kotlin/Spring Boot и других стеков.", icon: "/OGMOP/icons/scanner.svg" },
  { title: "AI-анализ", desc: "Сводка рисков и рекомендации по находкам с помощью LLM.", icon: "/OGMOP/icons/ai.svg" },
  { title: "Шаблоны", desc: "Библиотека готовых workflow, публикация и копирование.", icon: "/OGMOP/icons/trigger.svg" },
  { title: "CI/CD", desc: "Запуск workflow из GitHub Actions, статус обратно в пайплайн.", icon: "/OGMOP/icons/notify.svg" },
  { title: "Безопасность", desc: "Helmet, CORS, rate-limit, валидация, маскирование секретов.", icon: "/OGMOP/icons/status-success.svg" },
];

const highlightTemplates = [
  { name: "Secrets scan", desc: "Поиск секретов в репозитории", tags: ["secrets"] },
  { name: "SCA audit", desc: "Проверка зависимостей", tags: ["sca"] },
  { name: "Full security", desc: "Секреты + SCA + SAST + AI", tags: ["secrets", "sca", "sast", "ai"] },
];

export const HomePage: React.FC = () => {
  return (
    <div className="bg-bg">
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(180deg, #E9F7F3 0%, #FFFFFF 100%)" }}>
        <div className="hidden lg:block absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
        <div className="hidden lg:block absolute bottom-0 -left-20 w-72 h-72 rounded-full bg-primary/5 blur-3xl" aria-hidden="true" />
        <Container>
          <div className="py-10 sm:py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="animate-slide-up">
              <div className="flex items-center gap-2 mb-4">
                <img src="/OGMOP/logo.svg" alt="OGMOP" className="h-8 w-auto" />
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">Cyber Garden 2026</span>
              </div>
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Cyber Garden 2026 · Банк «Центр-инвест»</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-text leading-tight mb-4">Безопасность кода — визуально и просто</h1>
              <p className="text-base sm:text-lg text-text-muted max-w-xl mb-2">AI Security Workflow — визуальная платформа автоматизации проверок безопасности кода</p>
              <p className="text-base sm:text-lg text-text-muted max-w-xl mb-6">Собирайте сценарии проверки из блоков, запускайте собственные сканеры (секреты, SCA, SAST), получайте AI-объяснения и уведомления. Деплой на GitHub Pages.</p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4 animate-fade-in">
                <Link to="/editor" className="w-full sm:w-auto"><Button size="lg" className="w-full sm:w-auto">Открыть редактор</Button></Link>
                <Link to="/templates" className="w-full sm:w-auto"><Button variant="secondary" size="lg" className="w-full sm:w-auto">Шаблоны</Button></Link>
                <Link to="/docs" className="hidden sm:inline-flex w-full sm:w-auto"><Button variant="ghost" size="sm" className="w-full sm:w-auto">Документация</Button></Link>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-text-subtle">
                <span className="inline-flex items-center gap-1"><span className="text-primary">✓</span> Бесплатно</span>
                <span className="inline-flex items-center gap-1"><span className="text-primary">✓</span> Open source</span>
                <span className="inline-flex items-center gap-1"><span className="text-primary">✓</span> Работает офлайн (mock AI)</span>
              </div>
            </div>
            <div className="animate-fade-in">
              <div className="bg-surface border border-border rounded-lg shadow-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-text-muted">Live preview</span>
                  <Badge variant="info">Drag-and-drop конструктор</Badge>
                </div>
                <div className="rounded-lg border border-border bg-white p-4 min-h-[200px] flex items-center justify-center" style={{ backgroundImage: "radial-gradient(#E9F0F7 1px, transparent 1px)", backgroundSize: "16px 16px" }}>
                  <div className="flex flex-wrap items-center gap-3 justify-center">
                    {["Trigger", "Scanner", "AI", "Notify"].map((n, i) => (
                      <div key={n} className="flex items-center gap-2">
                        <div className="px-3 py-2 rounded-lg border border-border bg-white shadow-sm text-sm font-medium text-text">{n}</div>
                        {i < 3 && <span className="text-text-subtle">→</span>}
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-text-subtle mt-3">Мокап редактора workflow</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-surface py-6 sm:py-8">
        <Container>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div><dt className="text-3xl font-bold text-primary">3</dt><dd className="text-sm text-text-muted">сканера (Secrets, SCA, SAST)</dd></div>
            <div><dt className="text-3xl font-bold text-primary">32</dt><dd className="text-sm text-text-muted">находки в демо-репозитории</dd></div>
            <div><dt className="text-3xl font-bold text-primary">AI</dt><dd className="text-sm text-text-muted">отчёты с рекомендациями</dd></div>
            <div><dt className="text-3xl font-bold text-primary">CI/CD</dt><dd className="text-sm text-text-muted">интеграция (GitHub Actions)</dd></div>
          </dl>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <Badge variant="default">Cyber Garden 2026</Badge>
            <Badge variant="default">Банк Центр-инвест</Badge>
            <Badge variant="default">Open source</Badge>
            <Badge variant="default">GitHub Pages</Badge>
          </div>
        </Container>
      </section>

      <section className="py-10 sm:py-16">
        <Container>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-text mb-2">Возможности</h2>
            <p className="text-base text-text-muted max-w-2xl mx-auto">Всё для безопасной разработки в одном месте</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((f) => (
              <Card key={f.title} hoverable padding="lg">
                <div className="flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                    <img src={f.icon} alt="" className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-text">{f.title}</h3>
                  <p className="text-sm text-text-muted">{f.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-surface py-10 sm:py-16">
        <Container>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-text mb-2">Как это работает</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {[
              { n: 1, title: "Соберите", desc: "Добавьте ноды (триггер, сканеры, AI, уведомления) и соедините их." },
              { n: 2, title: "Запустите", desc: "Нажмите Run или вызовите через API/CI." },
              { n: 3, title: "Получите отчёт", desc: "Находки, AI-рекомендации, уведомления в канал." },
            ].map((s) => (
              <div key={s.n} className="flex flex-col items-center text-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">{s.n}</div>
                <h3 className="text-lg font-semibold text-text">{s.title}</h3>
                <p className="text-sm text-text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-10 sm:py-16">
        <Container>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-text mb-2">Редактор в действии</h2>
          </div>
          <div className="max-w-4xl mx-auto rounded-lg border border-border shadow-hover overflow-hidden">
            <div className="bg-surface p-6 min-h-[240px] flex items-center justify-center" style={{ backgroundImage: "radial-gradient(#D1D5DB 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
              <div className="text-text-muted text-sm">Мокап редактора workflow</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-sm text-text-muted">
            <span className="inline-flex items-center gap-2"><img src="/OGMOP/icons/logic.svg" alt="" className="w-4 h-4" /> Палитра нод</span>
            <span className="inline-flex items-center gap-2"><img src="/OGMOP/icons/scanner.svg" alt="" className="w-4 h-4" /> Свойства</span>
            <span className="inline-flex items-center gap-2"><img src="/OGMOP/icons/status-success.svg" alt="" className="w-4 h-4" /> Live-статусы</span>
          </div>
          <div className="text-center mt-6">
            <Link to="/editor"><Button>Попробовать самому</Button></Link>
          </div>
        </Container>
      </section>

      <section className="bg-surface py-10 sm:py-16">
        <Container>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-text">Готовые шаблоны</h2>
            <Link to="/templates" className="text-sm text-primary hover:underline">Все шаблоны →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {highlightTemplates.map((t) => (
              <Card key={t.name} hoverable>
                <div className="flex flex-col gap-2">
                  <h3 className="text-base font-semibold text-text">{t.name}</h3>
                  <p className="text-sm text-text-muted">{t.desc}</p>
                  <div className="flex flex-wrap gap-1">
                    {t.tags.map((tag) => (<Badge key={tag} variant="default">{tag}</Badge>))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link to="/templates"><Button variant="secondary">Создать свой шаблон</Button></Link>
          </div>
        </Container>
      </section>

      <section className="py-10 sm:py-16">
        <Container>
          <div className="max-w-3xl mx-auto bg-primary-light rounded-xl p-8 sm:p-12 text-center relative overflow-hidden">
            <img src="/OGMOP/icons/scanner.svg" alt="" className="absolute top-4 right-4 w-16 h-16 opacity-15" aria-hidden="true" />
            <h2 className="text-2xl font-semibold text-text mb-2">Готовы проверить свой код?</h2>
            <p className="text-base text-text-muted mb-6">Создайте первый workflow за 2 минуты.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/editor"><Button size="lg">Открыть редактор</Button></Link>
              <Link to="/templates"><Button variant="secondary" size="lg">Посмотреть шаблоны</Button></Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default HomePage;