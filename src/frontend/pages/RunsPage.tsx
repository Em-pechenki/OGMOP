import React from "react";
import Container from "@frontend/components/layout/Container";
import Card from "@frontend/components/ui/Card";
import Button from "@frontend/components/ui/Button";
import { Link } from "react-router-dom";

export const RunsPage: React.FC = () => {
  return (
    <Container>
      <div className="py-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text">Запуски</h1>
        <Link to="/editor">
          <Button>Новый workflow</Button>
        </Link>
      </div>
      <Card>
        <p className="text-sm text-text-muted">История запусков появится после интеграции с бэкендом.</p>
      </Card>
    </Container>
  );
};

export default RunsPage;