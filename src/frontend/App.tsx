import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "@frontend/layouts/MainLayout";
import { ToastProvider } from "@frontend/components/ui/Toast";
import Spinner from "@frontend/components/ui/Spinner";
import ErrorBoundary from "@frontend/components/ErrorBoundary";

const HomePage = lazy(() => import("@frontend/pages/HomePage"));
const EditorPage = lazy(() => import("@frontend/pages/EditorPage"));
const RunsPage = lazy(() => import("@frontend/pages/RunsPage"));
const TemplatesPage = lazy(() => import("@frontend/pages/TemplatesPage"));
const RunDetailPage = lazy(() => import("@frontend/pages/RunDetailPage"));
const NotFoundPage = lazy(() => import("@frontend/pages/NotFoundPage"));
const ServerErrorPage = lazy(() => import("@frontend/pages/ServerErrorPage"));

const Fallback: React.FC = () => (
  <div className="flex items-center justify-center py-20" role="status" aria-live="polite">
    <Spinner size="lg" />
  </div>
);

export default function App() {
  return (
    <ToastProvider>
      <ErrorBoundary>
        <Suspense fallback={<Fallback />}>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/editor" element={<EditorPage />} />
              <Route path="/runs" element={<RunsPage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/run/:id" element={<RunDetailPage />} />
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="/500" element={<ServerErrorPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </ToastProvider>
  );
}