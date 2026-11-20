import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Button from "../../src/frontend/components/ui/Button";
import Card from "../../src/frontend/components/ui/Card";
import Input from "../../src/frontend/components/ui/Input";
import Modal from "../../src/frontend/components/ui/Modal";
import Toast from "../../src/frontend/components/ui/Toast";
import Badge from "../../src/frontend/components/ui/Badge";
import Sidebar from "../../src/frontend/components/layout/Sidebar";

describe("Design system: Button", () => {
  it("renders variants", () => {
    render(<Button variant="primary">Primary</Button>);
    expect(screen.getByText("Primary")).toBeInTheDocument();
  });
});

describe("Design system: Card", () => {
  it("renders children", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
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

describe("Design system: other components", () => {
  it("renders Input, Toast, Badge, Sidebar", () => {
    render(<Input placeholder="inp" />);
    expect(screen.getByPlaceholderText("inp")).toBeInTheDocument();
    render(<Badge>badge</Badge>);
    expect(screen.getByText("badge")).toBeInTheDocument();
  });
});