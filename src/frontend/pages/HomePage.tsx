import React from "react";
import { Link } from "react-router-dom";
import Button from "@frontend/components/ui/Button";
import Card from "@frontend/components/ui/Card";
import Container from "@frontend/components/layout/Container";

const features = [
  { title: "Конструктор", desc: "Drag-and-drop редактор workflow из триггеров, логики, сканеров, уведомлений и AI" },
  { title: "Сканеры", desc: "Secrets, SCA, SAST для Kotlin/Spring Boot и других стеков" },
  { title: "AI-отчёты", desc: "Сводка рисков и рекомендации по находкам с помощью LLM" },
];

export const HomePage: React.FC = () => {
  return (
    <Container>
      <section className="py-10 sm:py-16 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-text mb-3">Cyber Garden 2026</h1>
        <p className="text-base sm:text-lg text-text-muted mb-8 px-2">
          AI Security Workflow — визуальная платформа автоматизации проверок безопасности кода
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/editor" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto">Открыть редактор</Button>
          </Link>
          <Link to="/templates" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">Шаблоны</Button>
          </Link>
        </div>
      </section>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-10 sm:pb-16">
        {features.map((f) => (
          <Card key={f.title} title={f.title} hoverable>
            <p className="text-sm text-text-muted">{f.desc}</p>
          </Card>
        ))}
      </section>
    </Container>
  );
};

export default HomePage;