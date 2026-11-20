import React from "react";
import { Link } from "react-router-dom";
import Button from "@frontend/components/ui/Button";
import Card from "@frontend/components/ui/Card";
import Container from "@frontend/components/layout/Container";

const features = [
  { title: "Конструктор", desc: "Drag-and-drop редактор workflow для проверок безопасности" },
  { title: "Сканеры", desc: "Секреты, SCA, SAST для Kotlin/Spring Boot" },
  { title: "AI-анализ", desc: "Объяснение рисков и рекомендации по исправлению" },
];

export const HomePage: React.FC = () => {
  return (
    <Container>
      <section className="py-16 text-center">
        <h1 className="text-4xl font-bold text-text mb-3">Cyber Garden 2026</h1>
        <p className="text-lg text-text-muted mb-8">
          AI Security Workflow — визуальная платформа автоматизации проверок безопасности кода
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/editor">
            <Button size="lg">Открыть редактор</Button>
          </Link>
          <Link to="/templates">
            <Button variant="secondary" size="lg">Шаблоны</Button>
          </Link>
        </div>
      </section>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-16">
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