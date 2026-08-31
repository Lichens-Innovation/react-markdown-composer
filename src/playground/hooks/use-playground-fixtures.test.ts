import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { loadPlaygroundFixtures } from "../playground.utils";
import { usePlaygroundFixtures } from "./use-playground-fixtures";

vi.mock("../playground.utils", () => ({
  loadPlaygroundFixtures: vi.fn(),
}));

const mockedLoadPlaygroundFixtures = vi.mocked(loadPlaygroundFixtures);

describe("use-playground-fixtures", () => {
  describe("usePlaygroundFixtures", () => {
    it("should transition to ready with the loaded markdown and input data", async () => {
      // Arrange
      mockedLoadPlaygroundFixtures.mockResolvedValue({ markdown: "# Hello", inputData: { foo: "bar" } });

      // Act
      const { result } = renderHook(() => usePlaygroundFixtures());
      await act(async () => {});

      // Assert
      expect(result.current.isReady).toBe(true);
      expect(result.current.markdown).toBe("# Hello");
      expect(result.current.inputData).toEqual({ foo: "bar" });
      expect(result.current.loadErrorMessage).toBeUndefined();
    });

    it("should set loadErrorMessage when the load rejects", async () => {
      // Arrange
      mockedLoadPlaygroundFixtures.mockRejectedValue(new Error("boom"));

      // Act
      const { result } = renderHook(() => usePlaygroundFixtures());
      await act(async () => {});

      // Assert
      expect(result.current.loadErrorMessage).toBe("boom");
      expect(result.current.isReady).toBe(false);
    });

    it("should abort the in-flight load on unmount", () => {
      // Arrange
      let capturedSignal: AbortSignal | undefined;
      mockedLoadPlaygroundFixtures.mockImplementation(
        (signal) =>
          new Promise(() => {
            capturedSignal = signal;
          })
      );

      // Act
      const { unmount } = renderHook(() => usePlaygroundFixtures());
      unmount();

      // Assert
      expect(capturedSignal?.aborted).toBe(true);
    });

    it("should not throw when the load resolves after unmount", async () => {
      // Arrange
      let resolveLoad: (fixtures: { markdown: string; inputData: unknown }) => void = () => {};
      mockedLoadPlaygroundFixtures.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveLoad = resolve;
          })
      );
      const { result, unmount } = renderHook(() => usePlaygroundFixtures());

      // Act
      unmount();
      await act(async () => {
        resolveLoad({ markdown: "# Late", inputData: {} });
      });

      // Assert
      expect(result.current.isReady).toBe(false);
      expect(result.current.markdown).toBe("");
    });

    it("should update markdown via setMarkdown", () => {
      // Arrange
      mockedLoadPlaygroundFixtures.mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => usePlaygroundFixtures());

      // Act
      act(() => {
        result.current.setMarkdown("new markdown");
      });

      // Assert
      expect(result.current.markdown).toBe("new markdown");
    });
  });
});
