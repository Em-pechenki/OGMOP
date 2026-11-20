import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught:", error?.message, error?.stack);
    // eslint-disable-next-line no-console
    console.error("Component stack:", info?.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 py-16 text-center">
          <div className="text-5xl" aria-hidden="true">
            ⚠️
          </div>
          <h2 className="text-xl font-semibold text-text">Что-то пошло не так</h2>
          <p className="max-w-md text-sm text-text-muted">
            Произошла непредвиденная ошибка. Попробуйте обновить страницу или вернуться назад.
          </p>
          {this.state.error?.message && (
            <pre className="max-w-full overflow-auto rounded bg-surface p-2 text-xs text-text-subtle">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={this.handleReset}
              className="rounded-lg bg-primary-darker px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              Повторить
            </button>
            <button
              type="button"
              onClick={() => (window.location.href = import.meta.env.BASE_URL || "/OGMOP/")}
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-text hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              На главную
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;