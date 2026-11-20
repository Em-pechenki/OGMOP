import React from "react";
import { Link } from "react-router-dom";
import Container from "@frontend/components/layout/Container";
import Button from "@frontend/components/ui/Button";

export const NotFoundPage: React.FC = () => {
  return (
    <Container>
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="text-6xl font-bold text-primary">404</div>
        <h1 className="text-2xl font-semibold text-text">Страница не найдена</h1>
        <p className="max-w-md text-sm text-text-muted">
          Запрашиваемая страница не существует или была перемещена.
        </p>
        <Link to="/">
          <Button>На главную</Button>
        </Link>
      </div>
    </Container>
  );
};

export default NotFoundPage;