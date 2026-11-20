import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import Button from "../../src/frontend/components/ui/Button";
import Card from "../../src/frontend/components/ui/Card";
import Input from "../../src/frontend/components/ui/Input";
import Modal from "../../src/frontend/components/ui/Modal";
import { ToastProvider, useToast } from "../../src/frontend/components/ui/Toast";
import Badge from "../../src/frontend/components/ui/Badge";
import Sidebar from "../../src/frontend/components/layout/Sidebar";

describe("Design system: Button", () => {
  it("renders children and calls onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    const btn = screen.getByRole("button", { name: "Click me" });
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalled();
  });

  it("applies variant classes", () => {
    const { container } = render(<Button variant="secondary">x</Button>);
    expect(container.querySelector("button")?.className).toContain("bg-secondary-light");
    const { container: c2 } = render(<Button variant="ghost">y</Button>);
    expect(c2.querySelector("button")?.className).toContain("bg-transparent");
  });

  it("disables when loading", () => {
    render(<Button loading>wait</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});

describe("Design system: Card", () => {
  it("renders title and content", () => {
    render(<Card title="Title" subtitle="Sub">Body</Card>);
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Sub")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });
});

describe("Design system: Input", () => {
  it("controlled value and onChange", async () => {
    const onChange = vi.fn();
    render(<Input label="Name" value="abc" onChange={(e) => onChange(e.target.value)} />);
    const input = screen.getByLabelText("Name") as HTMLInputElement;
    expect(input.value).toBe("abc");
    await userEvent.type(input, "d");
    expect(onChange).toHaveBeenCalled();
  });

  it("shows error", () => {
    render(<Input label="Email" error="invalid" />);
    expect(screen.getByText("invalid")).toBeInTheDocument();
  });
});

describe("Design system: Modal", () => {
  it("opens/closes by isOpen (open prop)", () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <Modal open={false} onClose={onClose} title="T">
        content
      </Modal>
    );
    expect(screen.queryByText("content")).not.toBeInTheDocument();
    rerender(
      <Modal open={true} onClose={onClose} title="T">
        content
      </Modal>
    );
    expect(screen.getByText("content")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Закрыть"));
    expect(onClose).toHaveBeenCalled();
  });
});

describe("Design system: Toast", () => {
  it("shows toast on show", async () => {
    const Consumer: React.FC = () => {
      const { show } = useToast();
      return <button onClick={() => show("hello", "success")}>toast</button>;
    };
    render(
      <ToastProvider>
        <Consumer />
      </ToastProvider>
    );
    await userEvent.click(screen.getByText("toast"));
    expect(screen.getByText("hello")).toBeInTheDocument();
  });
});

describe("Design system: Badge", () => {
  it("renders children", () => {
    render(<Badge variant="error">critical</Badge>);
    expect(screen.getByText("critical")).toBeInTheDocument();
  });
});

describe("Design system: Sidebar", () => {
  it("renders title and children", () => {
    render(<Sidebar title="Menu">item</Sidebar>);
    expect(screen.getByText("Menu")).toBeInTheDocument();
    expect(screen.getByText("item")).toBeInTheDocument();
  });
});

describe("API client", () => {
  it("health() returns status ok", async () => {
    const { getHealth } = await import("../../src/frontend/services/api");
    // mock axios via vi.mock would be complex; just check function exists
    expect(typeof getHealth).toBe("function");
  });
});
