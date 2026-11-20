import React from "react";
import { useParams } from "react-router-dom";
import Container from "@frontend/components/layout/Container";
import Card from "@frontend/components/ui/Card";

export const RunDetailPage: React.FC = () => {
  const { id } = useParams();
  return (
    <Container>
      <div className="py-8">
        <h1 className="text-2xl font-semibold text-text mb-4">Запуск #{id}</h1>
        <Card>
          <p className="text-sm text-text-muted">Детали выполнения появятся после интеграции.</p>
        </Card>
      </div>
    </Container>
  );
};

export default RunDetailPage;