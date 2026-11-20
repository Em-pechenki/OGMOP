import React from "react";
import { Link } from "react-router-dom";
import Container from "@frontend/components/layout/Container";
import Button from "@frontend/components/ui/Button";
import { useI18n } from "@frontend/hooks/useI18n";

export const ServerErrorPage: React.FC = () => {
  const { t } = useI18n();
  return (
    <Container>
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="text-6xl font-bold text-error">500</div>
        <h1 className="text-2xl font-semibold text-text">{t("servererror.title")}</h1>
        <p className="max-w-md text-sm text-text-muted">
          {t("servererror.desc")}
        </p>
        <Link to="/">
          <Button>{t("common.goHome")}</Button>
        </Link>
      </div>
    </Container>
  );
};

export default ServerErrorPage;