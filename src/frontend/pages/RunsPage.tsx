import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "@frontend/components/layout/Container";
import Card from "@frontend/components/ui/Card";
import Button from "@frontend/components/ui/Button";
import Spinner from "@frontend/components/ui/Spinner";
import { api } from "@frontend/services/api";
import { useI18n } from "@frontend/hooks/useI18n";

export const RunsPage: React.FC = () => {
  const { t } = useI18n();
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/runs");
      const data = (res.data as { data?: any })?.data ?? res.data;
      setRuns(Array.isArray(data) ? data : []);
    } catch (e) {
      setRuns([]);
      setError((e as Error).message || t("runs.loadError"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Container>
      <div className="py-6 sm:py-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-semibold text-text">{t("runs.title")}</h1>
        <Link to="/editor">
          <Button className="w-full sm:w-auto">{t("runs.newWorkflow")}</Button>
        </Link>
      </div>

      {loading && (
        <div className="flex flex-col items-center gap-3 py-12" role="status" aria-live="polite">
          <Spinner size="lg" />
          <span className="text-sm text-text-muted">{t("common.loading")}</span>
        </div>
      )}

      {!loading && error && (
        <Card>
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="text-sm text-error">{error}</p>
            <Button variant="secondary" onClick={load}>
              {t("common.retry")}
            </Button>
          </div>
        </Card>
      )}

      {!loading && !error && runs.length === 0 && (
        <Card>
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-sm text-text-muted">{t("runs.empty")}</p>
            <Link to="/editor">
              <Button variant="secondary" size="sm">
                {t("runs.createWorkflow")}
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {!loading && !error && runs.length > 0 && (
        <div className="flex flex-col gap-3">
          {runs.map((r) => (
            <Card key={r.id} hoverable>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text truncate">{r.id}</p>
                  <p className="text-xs text-text-muted break-words">
                    {r.workflowId} — {r.status} — {r.startedAt}
                  </p>
                </div>
                <Link to={`/run/${r.id}`} className="sm:shrink-0">
                  <Button variant="secondary" size="sm" className="w-full sm:w-auto">
                    {t("runs.open")}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
};

export default RunsPage;