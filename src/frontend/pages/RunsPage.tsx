import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "@frontend/components/layout/Container";
import Card from "@frontend/components/ui/Card";
import Button from "@frontend/components/ui/Button";
import { api } from "@frontend/services/api";

export const RunsPage: React.FC = () => {
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/runs");
        const data = (res.data as { data?: any })?.data ?? res.data;
        setRuns(Array.isArray(data) ? data : []);
      } catch {
        setRuns([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Container>
      <div className="py-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text">Запуски</h1>
        <Link to="/editor">
          <Button>Новый workflow</Button>
        </Link>
      </div>
      {loading && <Card>Загрузка...</Card>}
      {!loading && runs.length === 0 && (
        <Card>
          <p className="text-sm text-text-muted">Пока нет запусков.</p>
        </Card>
      )}
      <div className="flex flex-col gap-3">
        {runs.map((r) => (
          <Card key={r.id} hoverable>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text">{r.id}</p>
                <p className="text-xs text-text-muted">
                  {r.workflowId} — {r.status} — {r.startedAt}
                </p>
              </div>
              <Link to={`/run/${r.id}`}>
                <Button variant="secondary" size="sm">
                  Открыть
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </Container>
  );
};

export default RunsPage;