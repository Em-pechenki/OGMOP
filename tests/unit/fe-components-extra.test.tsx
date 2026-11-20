import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "../../src/frontend/components/ErrorBoundary";
import { PropertyPanel } from "../../src/frontend/components/PropertyPanel";
import { ResultsPanel } from "../../src/frontend/components/ResultsPanel";

const Boom: React.FC = () => {
  throw new Error("boom");
};

describe("fe components extra", () => {
  it("ErrorBoundary catches error", () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );
    expect(screen.getByText(/что-то пошло не так/i)).toBeInTheDocument();
  });
  it("PropertyPanel empty state", () => {
    render(<PropertyPanel />);
    expect(screen.getByText(/Выберите ноду/i)).toBeInTheDocument();
  });
  it("ResultsPanel renders", () => {
    render(<ResultsPanel />);
    expect(document.body).toBeTruthy();
  });
});