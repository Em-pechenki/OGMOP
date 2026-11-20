import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@frontend/hooks/useI18n";
import Button from "@frontend/components/ui/Button";
import Card from "@frontend/components/ui/Card";
import Badge from "@frontend/components/ui/Badge";
import Container from "@frontend/components/layout/Container";

export const HomePage: React.FC = () => {
  const { t } = useI18n();

  const features = [
    { titleKey: "home.feature.visual.title", descKey: "home.feature.visual.desc", icon: "/OGMOP/icons/logic.svg" },
    { titleKey: "home.feature.scanners.title", descKey: "home.feature.scanners.desc", icon: "/OGMOP/icons/scanner.svg" },
    { titleKey: "home.feature.ai.title", descKey: "home.feature.ai.desc", icon: "/OGMOP/icons/ai.svg" },
    { titleKey: "home.feature.templates.title", descKey: "home.feature.templates.desc", icon: "/OGMOP/icons/trigger.svg" },
    { titleKey: "home.feature.cicd.title", descKey: "home.feature.cicd.desc", icon: "/OGMOP/icons/notify.svg" },
    { titleKey: "home.feature.security.title", descKey: "home.feature.security.desc", icon: "/OGMOP/icons/status-success.svg" },
  ];

  const highlightTemplates = [
    { name: "Secrets scan", descKey: "home.tpl.secretsScan.desc", tags: ["secrets"] },
    { name: "SCA audit", descKey: "home.tpl.scaAudit.desc", tags: ["sca"] },
    { name: "Full security", descKey: "home.tpl.fullSecurity.desc", tags: ["secrets", "sca", "sast", "ai"] },
  ];

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
              </div>
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">{t("home.hero.badge")}</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-text leading-tight mb-4">{t("home.hero.title")}</h1>
              <p className="text-base sm:text-lg text-text-muted max-w-xl mb-2">{t("home.hero.subtitle")}</p>
              <p className="text-base sm:text-lg text-text-muted max-w-xl mb-6">{t("home.hero.desc")}</p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4 animate-fade-in">
                <Link to="/editor" className="w-full sm:w-auto"><Button size="lg" className="w-full sm:w-auto">{t("home.cta.openEditor")}</Button></Link>
                <Link to="/templates" className="w-full sm:w-auto"><Button variant="secondary" size="lg" className="w-full sm:w-auto">{t("home.cta.allTemplates")}</Button></Link>
                <Link to="/docs" className="hidden sm:inline-flex w-full sm:w-auto"><Button variant="ghost" size="sm" className="w-full sm:w-auto">{t("common.docs")}</Button></Link>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-text-subtle">
                <span className="inline-flex items-center gap-1"><span className="text-primary">✓</span> {t("home.perk.free")}</span>
                <span className="inline-flex items-center gap-1"><span className="text-primary">✓</span> {t("home.perk.opensource")}</span>
                <span className="inline-flex items-center gap-1"><span className="text-primary">✓</span> {t("home.perk.offline")}</span>
              </div>
            </div>
            <div className="animate-fade-in">
              <div className="bg-surface border border-border rounded-lg shadow-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-text-muted">{t("home.preview.live")}</span>
                  <Badge variant="info">{t("home.preview.badge")}</Badge>
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
                <p className="text-xs text-text-subtle mt-3">{t("home.preview.mockup")}</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-surface py-6 sm:py-8">
        <Container>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div><dt className="text-3xl font-bold text-primary">3</dt><dd className="text-sm text-text-muted">{t("home.stat.scanners")}</dd></div>
            <div><dt className="text-3xl font-bold text-primary">32</dt><dd className="text-sm text-text-muted">{t("home.stat.findings")}</dd></div>
            <div><dt className="text-3xl font-bold text-primary">AI</dt><dd className="text-sm text-text-muted">{t("home.stat.reports")}</dd></div>
            <div><dt className="text-3xl font-bold text-primary">CI/CD</dt><dd className="text-sm text-text-muted">{t("home.stat.cicd")}</dd></div>
          </dl>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <Badge variant="default">Cyber Garden 2026</Badge>
            <Badge variant="default">{t("home.badge.bank")}</Badge>
            <Badge variant="default">Open source</Badge>
            <Badge variant="default">GitHub Pages</Badge>
          </div>
        </Container>
      </section>

      <section className="py-10 sm:py-16">
        <Container>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-text mb-2">{t("home.features.title")}</h2>
            <p className="text-base text-text-muted max-w-2xl mx-auto">{t("home.features.subtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((f) => (
              <Card key={f.titleKey} hoverable padding="lg">
                <div className="flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                    <img src={f.icon} alt="" className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-text">{t(f.titleKey)}</h3>
                  <p className="text-sm text-text-muted">{t(f.descKey)}</p>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-surface py-10 sm:py-16">
        <Container>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-text mb-2">{t("home.how.title")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {[
              { n: 1, titleKey: "home.how.step1.title", descKey: "home.how.step1.desc" },
              { n: 2, titleKey: "home.how.step2.title", descKey: "home.how.step2.desc" },
              { n: 3, titleKey: "home.how.step3.title", descKey: "home.how.step3.desc" },
            ].map((s) => (
              <div key={s.n} className="flex flex-col items-center text-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">{s.n}</div>
                <h3 className="text-lg font-semibold text-text">{t(s.titleKey)}</h3>
                <p className="text-sm text-text-muted">{t(s.descKey)}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-10 sm:py-16">
        <Container>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-text mb-2">{t("home.editorPreview.title")}</h2>
          </div>
          <div className="max-w-4xl mx-auto rounded-lg border border-border shadow-hover overflow-hidden">
            <div className="bg-surface p-6 min-h-[240px] flex items-center justify-center" style={{ backgroundImage: "radial-gradient(#D1D5DB 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
              <div className="text-text-muted text-sm">{t("home.editorPreview.mockup")}</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-sm text-text-muted">
            <span className="inline-flex items-center gap-2"><img src="/OGMOP/icons/logic.svg" alt="" className="w-4 h-4" /> {t("home.editorPreview.palette")}</span>
            <span className="inline-flex items-center gap-2"><img src="/OGMOP/icons/scanner.svg" alt="" className="w-4 h-4" /> {t("home.editorPreview.properties")}</span>
            <span className="inline-flex items-center gap-2"><img src="/OGMOP/icons/status-success.svg" alt="" className="w-4 h-4" /> {t("home.editorPreview.statuses")}</span>
          </div>
          <div className="text-center mt-6">
            <Link to="/editor"><Button>{t("home.editorPreview.try")}</Button></Link>
          </div>
        </Container>
      </section>

      <section className="bg-surface py-10 sm:py-16">
        <Container>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-text">{t("home.templates.title")}</h2>
            <Link to="/templates" className="text-sm text-primary hover:underline">{t("home.templates.link")}</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {highlightTemplates.map((tpl) => (
              <Card key={tpl.name} hoverable>
                <div className="flex flex-col gap-2">
                  <h3 className="text-base font-semibold text-text">{tpl.name}</h3>
                  <p className="text-sm text-text-muted">{t(tpl.descKey)}</p>
                  <div className="flex flex-wrap gap-1">
                    {tpl.tags.map((tag) => (<Badge key={tag} variant="default">{tag}</Badge>))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link to="/templates"><Button variant="secondary">{t("home.templates.create")}</Button></Link>
          </div>
        </Container>
      </section>

      <section className="py-10 sm:py-16">
        <Container>
          <div className="max-w-3xl mx-auto bg-primary-light rounded-xl p-8 sm:p-12 text-center relative overflow-hidden">
            <img src="/OGMOP/icons/scanner.svg" alt="" className="absolute top-4 right-4 w-16 h-16 opacity-15" aria-hidden="true" />
            <h2 className="text-2xl font-semibold text-text mb-2">{t("home.cta.title")}</h2>
            <p className="text-base text-text-muted mb-6">{t("home.cta.desc")}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/editor"><Button size="lg">{t("home.cta.start")}</Button></Link>
              <Link to="/templates"><Button variant="secondary" size="lg">{t("home.cta.viewTemplates")}</Button></Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default HomePage;