import { afterEach, beforeAll, vi } from "vitest";

beforeAll(() => {
  class ResizeObserverStub {
    observe(): void {}

    unobserve(): void {}

    disconnect(): void {}
  }

  vi.stubGlobal("ResizeObserver", ResizeObserverStub);
});

afterEach(() => {
  vi.clearAllMocks();
});
