import React from "react";
import Container from "@frontend/components/layout/Container";
import Card from "@frontend/components/ui/Card";

export const TemplatesPage: React.FC = () => {
  return (
    <Container>
      <div className="py-8">
        <h1 className="text-2xl font-semibold text-text mb-4">Шаблоны</h1>
        <Card>
          <p className="text-sm text-text-muted">Библиотека шаблонов (задача со звёздочкой, в разработке).</p>
        </Card>
      </div>
    </Container>
  );
};

export default TemplatesPage;