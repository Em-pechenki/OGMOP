import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const { postMock } = vi.hoisted(() => ({ postMock: vi.fn() }));
vi.mock("@frontend/services/api", () => ({
  api: { post: postMock, get: vi.fn(), interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } } },
  default: { post: postMock, get: vi.fn(), interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } } },
}));

import { AiGenerationModal } from "../../src/frontend/components/AiGenerationModal";

describe("fe AiGenerationModal", () => {
  beforeEach(() => {
    postMock.mockReset();
  });

  it("renders when open", () => {
    render(<AiGenerationModal open={true} onClose={() => {}} onApply={() => {}} />);
    expect(screen.getByText(/AI-генерация workflow/i)).toBeInTheDocument();
  });

  it("shows validation error on short prompt", async () => {
    render(<AiGenerationModal open={true} onClose={() => {}} onApply={() => {}} />);
    fireEvent.click(screen.getByText(/Сгенерировать/i));
    expect(await screen.findByText(/Опишите задачу подробнее/i)).toBeInTheDocument();
  });

  it("generates and shows preview", async () => {
    postMock.mockResolvedValue({ data: { data: { workflow: { name: "w", nodes: [{ id: "n1", type: "trigger.manual", position: { x: 0, y: 0 }, data: { kind: "trigger", triggerType: "manual" } }], edges: [] } } } });
    render(<AiGenerationModal open={true} onClose={() => {}} onApply={() => {}} />);
    const ta = screen.getByPlaceholderText(/Опишите/i);
    fireEvent.change(ta, { target: { value: "проверить репозиторий на секреты и уязвимости" } });
    fireEvent.click(screen.getByText(/Сгенерировать/i));
    await waitFor(() => expect(screen.getByText(/Узлов:/i)).toBeInTheDocument());
  });

  it("apply calls onApply", async () => {
    const onApply = vi.fn();
    postMock.mockResolvedValue({ data: { data: { workflow: { name: "w", nodes: [{ id: "n1", type: "trigger.manual", position: { x: 0, y: 0 }, data: { kind: "trigger", triggerType: "manual" } }], edges: [] } } } });
    render(<AiGenerationModal open={true} onClose={() => {}} onApply={onApply} />);
    const ta = screen.getByPlaceholderText(/Опишите/i);
    fireEvent.change(ta, { target: { value: "проверить репозиторий на секреты и уязвимости" } });
    fireEvent.click(screen.getByText(/Сгенерировать/i));
    await waitFor(() => expect(screen.getByText(/Применить к холсту/i)).not.toBeDisabled());
    fireEvent.click(screen.getByText(/Применить к холсту/i));
    expect(onApply).toHaveBeenCalled();
  });
});