/* eslint-disable @typescript-eslint/no-explicit-any */
import "@testing-library/jest-dom";

// jsdom lacks ResizeObserver; React Flow needs it.
if (typeof (globalThis as any).ResizeObserver === "undefined") {
  (globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
