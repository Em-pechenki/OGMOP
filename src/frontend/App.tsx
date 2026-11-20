import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "@frontend/layouts/MainLayout";
import { ToastProvider } from "@frontend/components/ui/Toast";
import Spinner from "@frontend/components/ui/Spinner";

const HomePage = lazy(() => import("@frontend/pages/HomePage"));
const EditorPage = lazy(() => import("@frontend/pages/EditorPage"));
const RunsPage = lazy(() => import("@frontend/pages/RunsPage"));
const TemplatesPage = lazy(() => import("@frontend/pages/TemplatesPage"));
const RunDetailPage = lazy(() => import("@frontend/pages/RunDetailPage"));

const Fallback: React.FC = () => (
  <div className="flex items-center justify-center py-20">
    <Spinner size="lg" />
  </div>
);

export default function App() {
  return (
    <ToastProvider>
      <Suspense fallback={<Fallback />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/editor" element={<EditorPage />} />
            <Route path="/runs" element={<RunsPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/run/:id" element={<RunDetailPage />} />
          <Route path="*" element={<div className="py-20 text-center text-text-muted">404 - page not found</div>} />
          </Route>
        </Routes>
      </Suspense>
    </ToastProvider>
  );
}