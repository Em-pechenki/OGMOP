import React from "react";
import Container from "@frontend/components/layout/Container";
import Card from "@frontend/components/ui/Card";
import Button from "@frontend/components/ui/Button";

export const TemplatesPage: React.FC = () => {
  return (
    <Container>
      <div className="py-6 sm:py-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold text-text">Шаблоны</h1>
          <Button variant="secondary" size="sm" disabled>
            Создать шаблон
          </Button>
        </div>
        <Card>
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-text-muted">
              Библиотека шаблонов (в разработке).
            </p>
            <p className="text-xs text-text-subtle">
              Скоро здесь появятся готовые workflow для типовых сценариев.
            </p>
          </div>
        </Card>
      </div>
    </Container>
  );
};

export default TemplatesPage;